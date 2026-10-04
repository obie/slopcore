#!/usr/bin/env python3
"""clips.py <project> <command> — Seedance clips from the hand-written prompt book (<project>/PROMPTS.md).

  apply                     parse PROMPTS.md into shots/<clip>.json (takes already made are kept)
  audio CLIP [...]          cut each clip's reference audio into media/audio/refs/<clip>.wav
  submit CLIP [...] --max-usd X [--dry-run] [--again]
                            upload the plate and audio and submit through hfapi.py; the request id goes in the clip file
  collect [CLIP ...]        wait for pending takes, download to media/clips/<clip>/take-N.mp4, extract 24 fps frames
                            to media/clipframes/<clip>-tN/, write a contact sheet, and run the sync check
  sync CLIP [...]           re-run the sync check on the latest take
  preview CLIP [...] [--warp]   cut the latest (or pinned) take against the real song, lag removed, to media/render/pilot/<clip>.mp4.
                            --warp (lips clips) retimes the take so each sung word ends where it ends in the song, and writes
                            <clip>-retimed.mp4 and the anchors into the clip file's pin
  edl                       write <project>/edl.json from each clip's pinned (or latest finished) take: for every shot the
                            clip covers, {clip, in, warp} in the form the kit's SHOT.draw reads (times relative to the shot)
  status                    one line per clip

A block in PROMPTS.md:

    ### W01 · s003 · 4 s · 1080p
    - kind: lips            (lips | motion | insert)
    - plate: sing-slice
    - t0: 8.30              (song time of the clip's first frame)
    - lines: 2              (lips only: lyric line numbers she sings on camera; other words are muted)
    - story: one sentence
    ```
    the prompt, exactly as it will be sent, after {MACRO} expansion from the ```macros block at the top of the book
    ```

kinds: lips   = reference-to-video, @Image1 the plate, @Audio1 a clean vocal holding only the quoted lines
       motion = reference-to-video, @Image1 the plate, @Audio1 the song from t0, so the action lands on our beats
       insert = image-to-video, the plate is the exact first frame, silent
Sync check (lips, and timing for motion): Seedance copies @Audio1 into its own soundtrack and the mouth follows that
soundtrack, so the take's audio is cross-correlated with what it was given: first the lag, then which spans match.
"""
import json, math, os, pathlib, re, subprocess, sys
import numpy as np, soundfile as sf, scipy.signal as sg

if len(sys.argv) < 3 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
ROOT = pathlib.Path(__file__).resolve().parent.parent
P = (ROOT / sys.argv[1]).resolve(); CMD = sys.argv[2]
VALUED = ('--max-usd',)   # flags that take a value
ARGS = [a for i, a in enumerate(sys.argv[3:], 3) if not a.startswith('--') and sys.argv[i - 1] not in VALUED]
flag = lambda n, d=None: (sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d)
SH = P / 'shots'; SH.mkdir(exist_ok=True)
PY = sys.executable; HF = str(ROOT / 'tools/hfapi.py')
MODE = {'lips': 'ref', 'motion': 'ref', 'insert': 'i2v'}

def load(c): return json.loads((SH / f'{c}.json').read_text())
def save(r): (SH / f"{r['clip']}.json").write_text(json.dumps(r, ensure_ascii=False, indent=1))
def clips(): return sorted(p.stem for p in SH.glob('*.json') if p.stem not in ('uploads',) and 'clip' in json.loads(p.read_text()))

def apply():
    text = (P / 'PROMPTS.md').read_text(); n = 0
    mb = re.search(r'```macros\n(.*?)```', text, re.S); macros = dict(l.split(' = ', 1) for l in mb.group(1).strip().splitlines()) if mb else {}
    def expand(s):
        for k, v in macros.items(): s = s.replace('{' + k + '}', v)
        assert not re.search(r'\{[A-Z]+\}', s), ('unknown macro', re.findall(r'\{[A-Z]+\}', s)); return s
    for m in re.finditer(r'^### (\S+) · ([^\n]*?) · (\d+) s · (\d+p)\s*\n(.*?)```\n(.*?)```', text.replace(mb.group(0), '') if mb else text, re.S | re.M):
        clip, shots, dur, res, meta, prompt = m.groups()
        f = dict(re.findall(r'^- (\w+): (.*)$', meta, re.M))
        assert f.get('kind') in MODE, (clip, 'kind'); assert (P / f"media/plates/{f['plate']}.jpg").exists(), (clip, 'plate missing', f['plate'])
        old = load(clip) if (SH / f'{clip}.json').exists() else {}
        r = {'clip': clip, 'shots': shots.split(), 'kind': f['kind'], 'plate': f['plate'], 't0': float(f['t0']), 'dur': int(dur), 'res': res,
             'lines': [int(x) for x in f.get('lines', '').replace(',', ' ').split()], 'story': f.get('story', ''), 'prompt': expand(prompt.strip()),
             'takes': old.get('takes', [])}
        r.update({k: old[k] for k in ('pin', 'qa') if old.get(k) is not None})   # a pinned take and its retiming survive a re-apply
        save(r); n += 1
    print(f'{n} clips applied')

def cut_audio(c):
    r = load(c); out = P / f'media/audio/refs/{c}.wav'; out.parent.mkdir(parents=True, exist_ok=True)
    if r['kind'] == 'insert': return None
    stem = 'stems_raw/htdemucs/song/vocals.wav' if r['kind'] == 'lips' else 'song.wav'
    y, sr = sf.read(P / 'media/audio' / stem); a, b = int(r['t0'] * sr), int((r['t0'] + r['dur']) * sr); y = y[a:b]
    if r['kind'] == 'lips':
        y = y.mean(1); env = np.zeros(len(y)); words = json.loads((P / 'media/audio/words.json').read_text())['lines']
        for L in words:
            if L['li'] in r['lines']:
                for w in L['words']:
                    i, j = int((w['t0'] - 0.08 - r['t0']) * sr), int((w['t1'] + 0.10 - r['t0']) * sr); env[max(i, 0):max(j, 0)] = 1
        k = int(0.03 * sr); env = np.convolve(env, np.ones(k) / k, mode='same'); y = y * env
        y = y / (np.abs(y).max() + 1e-9) * 0.7
    sf.write(out, y, sr, subtype='PCM_16'); return out

def submit(c):
    r = load(c); plate = P / f"media/plates/{r['plate']}.jpg"; pf = SH / f'{c}.prompt.txt'; pf.write_text(r['prompt'])
    cmd = [PY, HF, 'submit', '--project', str(P), '--clip', c, '--mode', MODE[r['kind']], '--prompt-file', str(pf), '--dur', str(r['dur']), '--res', r['res'], '--max-usd', flag('--max-usd')]
    if r['kind'] == 'insert': cmd += ['--first-frame', str(plate), '--no-audio']
    else: cmd += ['--ar', '16:9', '--image', str(plate), '--audio', str(cut_audio(c))]
    for f in ('--dry-run', '--again'):
        if f in sys.argv: cmd.append(f)
    out = subprocess.run(cmd, capture_output=True, text=True); print(out.stdout.strip()[-900:], out.stderr.strip()[-400:])
    if '--dry-run' in sys.argv or out.returncode: return
    rid = re.findall(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', out.stdout)[-1]
    if not any(t['id'] == rid for t in r['takes']): r['takes'].append({'id': rid, 'status': 'submitted', 'res': r['res'], 'dur': r['dur']}); save(r)
    print(f"{c}: take {len(r['takes'])} -> {rid}")

def envelope(y, sr, hop=0.01):
    n = int(sr * hop); m = len(y) // n; return np.sqrt((y[:m * n].reshape(m, n) ** 2).mean(1) + 1e-12)

def sync(c, r=None, n=None):
    """Lag and per-word timing of take n (default: the latest). Seedance re-voices @Audio1 in its own soundtrack and
    the mouth follows that soundtrack, so the take's audio says where the mouth is. lag = how late the take's audio
    runs against what it was given (envelope cross-correlation). For lips clips each sung word is then located in
    the take with Whisper and compared with its time in the song: `off` is what is left after removing the lag."""
    r = r or load(c); n = n or len(r['takes']); mp4 = P / f'media/clips/{c}/take-{n}.mp4'; ref = P / f'media/audio/refs/{c}.wav'
    if r['kind'] == 'insert' or not ref.exists(): return None
    wav = mp4.with_name(f'take-{n}.wav'); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(mp4), '-ac', '1', '-ar', '16000', str(wav)], check=False)
    if not wav.exists(): return {'error': 'take has no audio track'}
    a, sr = sf.read(wav); b, sr2 = sf.read(ref); b = b.mean(1) if b.ndim > 1 else b; b = sg.resample_poly(b, 16000, sr2)
    ea, eb = envelope(a, sr), envelope(b, 16000); ea, eb = ea - ea.mean(), eb - eb.mean()
    xc = sg.correlate(ea, eb, mode='full'); lags = sg.correlation_lags(len(ea), len(eb)); keep = np.abs(lags) <= 150   # +-1.5 s
    lag = float(lags[keep][np.argmax(xc[keep])] * 0.01); res = {'lag': round(lag, 3)}
    if r['kind'] == 'lips':
        import mlx_whisper, difflib, unicodedata
        norm = lambda w: ''.join(ch for ch in unicodedata.normalize('NFD', w.lower()) if ch.isalpha() and unicodedata.category(ch) != 'Mn')
        given = [(w['w'], w['t0'] - r['t0'], w['t1'] - r['t0']) for L in json.loads((P / 'media/audio/words.json').read_text())['lines'] if L['li'] in r['lines'] for w in L['words']]
        tr = mlx_whisper.transcribe(str(wav), path_or_hf_repo='mlx-community/whisper-large-v3-mlx', language=os.environ.get('WHISPER_LANGUAGE') or None, word_timestamps=True, temperature=0.0,
                                    initial_prompt=' '.join(g[0] for g in given))
        heard = [(w['word'].strip(), float(w['start']), float(w['end'])) for s_ in tr['segments'] for w in s_['words']]
        sm = difflib.SequenceMatcher(None, [norm(g[0]) for g in given], [norm(h[0]) for h in heard], autojunk=False); words = []
        hit = {i + k: j + k for i, j, m in sm.get_matching_blocks() for k in range(m)}
        # Whisper pads a word's start into the silence before it, so the END of the word is the trustworthy edge.
        # For a sung line the lag is taken from the words themselves (median of take end minus song end): the
        # envelope estimate above can lock onto the wrong syllable.
        d = sorted(heard[hit[i]][2] - g[2] for i, g in enumerate(given) if i in hit)
        if d: res['lag_envelope'] = res['lag']; lag = d[len(d) // 2]; res['lag'] = round(lag, 3)
        for i, g in enumerate(given):
            h = heard[hit[i]] if i in hit else None
            words.append({'w': g[0], 'song': round(g[2], 2), 'take': round(h[2], 2) if h else None, 'off': round(h[2] - lag - g[2], 2) if h else None})
        offs = [abs(w['off']) for w in words if w['off'] is not None]
        res.update({'heard': ' '.join(h[0] for h in heard), 'words': words, 'sung': f"{len(offs)}/{len(given)}", 'worst_off': max(offs) if offs else None,
                    'mean_off': round(sum(offs) / len(offs), 3) if offs else None})
    r['takes'][n - 1]['sync'] = res; save(r); return res

def collect(c):
    r = load(c)
    for n, t in enumerate(r['takes'], 1):
        if t['status'] in ('completed', 'failed', 'nsfw', 'canceled'): continue
        w = subprocess.run([PY, HF, 'wait', t['id'], '--project', str(P), '--timeout', '1500'], capture_output=True, text=True)
        st = next((s for s in ('completed', 'failed', 'nsfw', 'canceled') if s in w.stdout.split('http')[0] + w.stderr), 'pending'); t['status'] = st
        if st != 'completed': t['note'] = (w.stdout + w.stderr).strip()[-300:]; save(r); print(f'{c} take {n}: {st} {t["note"][-160:]}'); continue
        mp4 = P / f'media/clips/{c}/take-{n}.mp4'; mp4.parent.mkdir(parents=True, exist_ok=True)
        d = subprocess.run([PY, HF, 'download', t['id'], str(mp4), '--project', str(P)], capture_output=True, text=True)
        if not mp4.exists(): t['status'] = 'pending'; t['note'] = d.stderr[-200:]; save(r); print(f'{c} take {n}: download failed {d.stderr[-200:]}'); continue
        fr = P / f'media/clipframes/{c}-t{n}'; fr.mkdir(parents=True, exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(mp4), '-vf', 'fps=24', '-q:v', '2', str(fr / 'f%05d.jpg')], check=True)
        frames = sorted(fr.glob('f*.jpg')); t['frames'] = len(frames); t['file'] = str(mp4.relative_to(P)); save(r)
        pick = [frames[int(i * (len(frames) - 1) / 5)] for i in range(6)]
        subprocess.run(['magick', 'montage', *map(str, pick), '-resize', '640x', '-geometry', '+3+3', '-tile', '3x2', '-background', '#111', str(mp4.parent / f'take-{n}-sheet.jpg')], check=True)
        print(f'{c} take {n}: {len(frames)} frames; sync {json.dumps(sync(c, r, n), ensure_ascii=False)}')

def warp_anchors(c, r, n):
    """[(song clip-time, take time)] at the end of each sung word that lasts 0.15 s or more: the retiming map's knots."""
    sy = (r['takes'][n - 1].get('sync') or {}).get('words') or []
    dur = {}
    for L in json.loads((P / 'media/audio/words.json').read_text())['lines']:
        if L['li'] in r['lines']:
            for w in L['words']: dur[round(w['t1'] - r['t0'], 2)] = w['t1'] - w['t0']
    an = [[w['song'], w['take'], dur.get(w['song'], 0)] for w in sy if w.get('take') is not None and dur.get(w['song'], 0) >= 0.15]
    # A knot that would play the take slower than 0.6x or faster than 1.7x is a mis-heard word end, and the
    # stutter shows. Drop the shorter word of the worst pair until every stretch is in range.
    while len(an) > 1:
        sp = [(k1 - k0) / (s1 - s0) for (s0, k0, _), (s1, k1, _) in zip(an, an[1:])]
        i = max(range(len(sp)), key=lambda j: abs(math.log(max(sp[j], 1e-3))))
        if 0.6 <= sp[i] <= 1.7: break
        an.pop(i if an[i][2] < an[i + 1][2] else i + 1)
    return [[s, k] for s, k, _ in an]

def take_time(anchors, lag, s):
    """Song clip-time s -> take time: slope 1 before the first and after the last knot, linear between knots."""
    if not anchors: return s + lag
    if s <= anchors[0][0]: return s + (anchors[0][1] - anchors[0][0])
    if s >= anchors[-1][0]: return s + (anchors[-1][1] - anchors[-1][0])
    for (s0, k0), (s1, k1) in zip(anchors, anchors[1:]):
        if s0 <= s <= s1: return k0 + (k1 - k0) * (s - s0) / (s1 - s0)

def preview(c):
    r = load(c); n = (r.get('pin') or {}).get('take') or max((i for i, tk in enumerate(r['takes'], 1) if tk['status'] == 'completed'), default=0)
    if not n: return print(f'{c}: no finished take')
    tk = r['takes'][n - 1]; lag = (r.get('pin') or {}).get('lag', (tk.get('sync') or {}).get('lag') or 0.0); lag = lag if 0 <= lag < 1.5 else 0.0
    out = P / f'media/render/pilot/{c}.mp4'; out.parent.mkdir(parents=True, exist_ok=True); dur = r['dur'] - lag - 0.05
    enc = ['-map', '0:v', '-map', '1:a', '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest']
    song = ['-ss', f"{r['t0']:.3f}", '-t', f'{dur:.3f}', '-i', str(P / 'media/audio/song.wav')]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{lag:.3f}', '-i', str(P / f'media/clips/{c}/take-{n}.mp4'), *song, *enc, str(out)], check=True)
    print(f'{out.name}: take {n}, lag {lag:.2f} s removed')
    if '--warp' in sys.argv and r['kind'] == 'lips':
        an = warp_anchors(c, r, n); frames = sorted((P / f'media/clipframes/{c}-t{n}').glob('f*.jpg')); tmp = P / f'media/scratch/warp/{c}'; tmp.mkdir(parents=True, exist_ok=True)
        for f in tmp.glob('*.jpg'): f.unlink()
        k = 0
        while True:
            tt = take_time(an, lag, k / 24)
            if tt * 24 >= len(frames) or k / 24 >= dur: break
            (tmp / f's{k + 1:05d}.jpg').symlink_to(frames[max(0, int(tt * 24))]); k += 1
        out2 = P / f'media/render/pilot/{c}-retimed.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', str(tmp / 's%05d.jpg'), *song, *enc, str(out2)], check=True)
        speeds = [round((k1 - k0) / (s1 - s0), 2) for (s0, k0), (s1, k1) in zip(an, an[1:])]
        r['pin'] = {**(r.get('pin') or {}), 'take': n, 'lag': lag, 'warp': an}; save(r)
        print(f'{out2.name}: anchors {an}, speed between anchors {speeds}')

def edl():
    bm = json.loads((P / 'media/audio/beatmap.json').read_text()); BEAT0, PERIOD = bm['t0'], bm['period']
    shots = {s['id']: s for s in json.loads((P / 'shots.json').read_text())['shots']}; out = {}
    for c in clips():
        r = load(c); pin = r.get('pin') or {}
        n = pin.get('take') or max((i for i, tk in enumerate(r['takes'], 1) if tk['status'] == 'completed' and not tk.get('note', '').startswith('made from the old plate')), default=0)
        if not n or not (P / f'media/clipframes/{c}-t{n}').is_dir(): continue
        lag = pin.get('lag', (r['takes'][n - 1].get('sync') or {}).get('lag') or 0.0); lag = lag if 0 <= lag < 1.5 else 0.0
        for sid in r['shots']:
            if sid not in shots: continue
            names = [p['name'] for p in shots[sid]['plates']]
            if re.search(r'[a-z]$', c) and r['plate'] in names:   # F59a, F59b: one clip per plate, each starting before its plate's own cut
                k = names.index(r['plate']); s = shots[sid]; cut = s['t0'] if k == 0 else BEAT0 + PERIOD * round(s['b0'] + (s['b1'] - s['b0']) * k / len(names))
                out.setdefault(sid, {}).setdefault('plates', {})[r['plate']] = {'clip': f'{c}-t{n}', 'in': round(cut - r['t0'] + lag, 3)}
                continue
            if 'clip' in out.get(sid, {}): continue
            off = shots[sid]['t0'] - r['t0']                      # the clip starts this long before the shot
            e = {'clip': f'{c}-t{n}', 'in': round(off + lag, 3)}
            if pin.get('warp'): e['warp'] = [[round(s - off, 3), k] for s, k in pin['warp']]
            out.setdefault(sid, {}).update(e)
    (P / 'edl.json').write_text(json.dumps(out, indent=1)); print(f'{len(out)} shots have a clip:', ' '.join(f"{k}={v['clip'] if 'clip' in v else '+'.join(p['clip'] for p in v['plates'].values())}" for k, v in sorted(out.items())))

if CMD == 'apply': apply()
elif CMD == 'audio': [print(cut_audio(c)) for c in ARGS]
elif CMD == 'submit': assert flag('--max-usd'), '--max-usd is required'; [submit(c) for c in ARGS]
elif CMD == 'collect': [collect(c) for c in (ARGS or clips())]
elif CMD == 'sync': [[print(c, 'take', n, json.dumps(sync(c, None, n), ensure_ascii=False)) for n in range(1, len(load(c)['takes']) + 1) if (P / f'media/clips/{c}/take-{n}.mp4').exists()] for c in ARGS]
elif CMD == 'edl': edl()
elif CMD == 'preview': [preview(c) for c in (ARGS or clips())]
elif CMD == 'status':
    for c in clips(): r = load(c); print(c, r['kind'], r['res'], f"{r['dur']}s", [(t['status'], t.get('sync', {}).get('lag')) for t in r['takes']])
else: sys.exit(__doc__)
