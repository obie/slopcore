#!/usr/bin/env python3
"""mkreview.py <project>: rebuild <project>/review.json: chapter drafts first, then every clip's pinned or latest take in story order."""
import sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import json, pathlib, glob, re
P = pathlib.Path(__file__).resolve().parent.parent / sys.argv[1]; d = json.loads((P / 'review.json').read_text()) if (P / 'review.json').exists() else {}
d.setdefault('captions', {})
have = {f.stem for f in (P / 'media/render/pilot').glob('*.mp4')}
drafts = sorted(s for s in have if re.match(r'ch\d\d-draft|rough', s))
clips = []
for f in glob.glob(str(P / 'shots/[A-Z]*.json')):
    r = json.loads(open(f).read()); c = r['clip']
    stem = f'{c}-retimed' if f'{c}-retimed' in have and (r.get('pin') or {}).get('warp') else c
    if stem in have and any(t['status'] == 'completed' for t in r['takes']):
        clips.append((r['t0'], stem)); d['captions'].setdefault(stem, f"{' '.join(r['shots'])} · {r['story']}")
d['order'] = [x for x in ('master', 'rough') if x in have] + [x for x in drafts if x != 'rough'] + [s for _, s in sorted(clips)]
(P / 'review.json').write_text(json.dumps(d, ensure_ascii=False, indent=1)); print(len(d['order']), 'items')
