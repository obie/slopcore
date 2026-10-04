#!/usr/bin/env python3
"""align.py <project> — a start and end time for every sung word of the lyric sheet, on the vocal stem.

1. Parse LYRICS.md into sections, stanzas (blank-line groups) and lines. (Parenthesised) lines are asides;
   {braced} lines are on the sheet but not in the recording and get no times.
2. Anchor each stanza in time by matching its words to Whisper's transcript (media/audio/whisper.json).
3. Force-align each stanza as one piece inside its anchored window with torchaudio's multilingual MMS_FA
   model, so word order holds across its lines.
Writes media/audio/words.json and prints one row per line; rows marked '?' need a listen.
"""
import sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import difflib, json, pathlib, re, sys, unicodedata
import numpy as np, torch, torchaudio

P = pathlib.Path(sys.argv[1]).resolve()
VOC = P / 'media/audio/stems_raw/htdemucs/song/vocals.wav'
PAD = 0.8          # seconds of slack around a stanza's Whisper anchor
QUIET_DB = -45.0   # a word placed where the vocal stem is quieter than this is suspect

def norm(w):
    w = unicodedata.normalize('NFD', w.lower().replace('’', "'"))
    w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r"[^a-z']", '', w).strip("'")

# 1. the sheet
lines, unsung, section, stanza, blank = [], [], None, 0, True
for raw in (P / 'LYRICS.md').read_text().splitlines():
    s = raw.strip()
    m = re.match(r'^\[(.+?)\]$', s)
    if m: section = re.split(r'\s+[—-]\s+', m.group(1))[0]; blank = True; continue
    if not s:
        blank = True; continue
    if s.startswith('#') or section is None: continue
    if s.startswith('{') and s.endswith('}'):
        unsung.append({'section': section, 'text': s[1:-1], 'after_li': len(lines) - 1}); continue
    if blank: stanza += 1; blank = False
    aside = s.startswith('(') and s.endswith(')')
    text = s[1:-1] if aside else s
    words = [w for w in text.split() if norm(w)]
    if words: lines.append({'li': len(lines), 'section': section, 'stanza': stanza, 'text': text, 'aside': aside, 'words': words})

# 2. anchors from Whisper
wh = [w for seg in json.loads((P / 'media/audio/whisper.json').read_text())['segments'] for w in seg['words']]
wh_tok = [norm(w['word']) for w in wh]
sheet_tok, owner = [], []
for L in lines:
    for i, w in enumerate(L['words']): sheet_tok.append(norm(w)); owner.append((L['li'], i))
hit = {}
for a, b, n in difflib.SequenceMatcher(None, sheet_tok, wh_tok, autojunk=False).get_matching_blocks():
    for k in range(n): hit[owner[a + k]] = wh[b + k]
for L in lines:
    hs = [hit[(L['li'], i)] for i in range(len(L['words'])) if (L['li'], i) in hit]
    L['matched'] = len(hs); L['anchor'] = [hs[0]['start'], hs[-1]['end']] if hs else None

info = torchaudio.info(str(VOC)); dur = info.num_frames / info.sample_rate
# align_overrides.json: {"<li>": [t0, t1]} gives a line its own window (read off the vocal stem's level),
# for places where Whisper's anchor is wrong: slow lines with long rests, chopped vocals, quiet asides.
ovf = P / 'align_overrides.json'
OV = {int(k): v for k, v in json.loads(ovf.read_text()).items() if k.isdigit()} if ovf.exists() else {}
stanzas = []
for sid in sorted({L['stanza'] for L in lines}):
    Ls = [L for L in lines if L['stanza'] == sid and L['li'] not in OV]
    if not Ls: continue
    an = [L['anchor'] for L in Ls if L['anchor']]
    stanzas.append({'lines': Ls, 'anchor': [min(a[0] for a in an), max(a[1] for a in an)] if an else None})
for i, S in enumerate(stanzas):
    prev = max([x['anchor'][1] for x in stanzas[:i] if x['anchor']], default=0.0)
    nxt = next((x['anchor'][0] for x in stanzas[i + 1:] if x['anchor']), dur)
    if S['anchor']: S['window'] = [max(prev - 0.2, S['anchor'][0] - PAD, 0.0), min(nxt + 0.2, S['anchor'][1] + PAD, dur)]
    else: S['window'] = [prev, nxt]
stanzas += [{'lines': [L], 'window': OV[L['li']]} for L in lines if L['li'] in OV]

# 3. forced alignment per stanza
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval()
tokenizer, aligner = bundle.get_tokenizer(), bundle.get_aligner()
wav, sr = torchaudio.load(str(VOC))
SR = bundle.sample_rate
wav = torchaudio.functional.resample(wav.mean(0, keepdim=True), sr, SR)
v = wav[0].numpy()
def rms_db(a, b):
    x = v[int(a * SR):int(b * SR)]
    return round(float(20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)), 1) if len(x) else -120.0

for S in stanzas:
    a, b = S['window']
    toks = [norm(w) for L in S['lines'] for w in L['words']]
    seg = wav[:, int(a * SR):int(b * SR)]
    with torch.inference_mode():
        em, _ = model(seg)
        spans = aligner(em[0], tokenizer(toks))
    ft = seg.size(1) / em.size(1) / SR
    k = 0
    for L in S['lines']:
        L['out'] = []
        for w in L['words']:
            sp = spans[k]; k += 1
            t0, t1 = round(a + sp[0].start * ft, 3), round(a + sp[-1].end * ft, 3)
            n = sum(s.end - s.start for s in sp)
            L['out'].append({'w': w, 't0': t0, 't1': t1, 'score': round(sum(s.score * (s.end - s.start) for s in sp) / max(1, n), 3), 'db': rms_db(t0, t1)})

res = []
for L in lines:
    o = L['out']
    quiet = [w['w'] for w in o if w['db'] < QUIET_DB]
    res.append({'li': L['li'], 'section': L['section'], 'stanza': L['stanza'], 'text': L['text'], 'aside': L['aside'],
                't0': o[0]['t0'], 't1': o[-1]['t1'], 'score': round(sum(w['score'] for w in o) / len(o), 3),
                'heard_by_whisper': L['matched'], 'n_words': len(o), 'in_silence': quiet,
                'check': bool(quiet or L['matched'] < max(1, len(o) // 2)), 'words': o})
(P / 'media/audio/words.json').write_text(json.dumps({'duration': round(dur, 3), 'lines': res, 'unsung': unsung}, ensure_ascii=False, indent=1))

sec = None
for r in res:
    if r['section'] != sec: sec = r['section']; print(f"\n[{sec}]")
    note = f"  in silence: {' '.join(r['in_silence'])}" if r['in_silence'] else ''
    print(f"{'?' if r['check'] else ' '} {r['t0']:7.2f}-{r['t1']:7.2f}  s={r['score']:.2f} heard {r['heard_by_whisper']}/{r['n_words']}  {'(' if r['aside'] else ''}{r['text']}{')' if r['aside'] else ''}{note}")
print(f"\n{sum(r['n_words'] for r in res)} sung words in {len(res)} lines; {sum(r['check'] for r in res)} lines to check; {len(unsung)} sheet lines not in the recording")
