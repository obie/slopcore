#!/usr/bin/env python3
"""pick.py <project> — copy each picked Midjourney image to media/plates/<plate>.jpg, where the engine and clips.py read it.

Picks are in <project>/picks.json ({plate: image number}); a plate's batch folder comes from shots.json. Prints the
plates that have no pick or whose picked image is missing. Fetches the full-quality PNG later if one is needed; the
JPEG Midjourney serves is 2944x1648.
"""
import sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import json, pathlib, shutil
P = pathlib.Path(sys.argv[1]).resolve()
pj = json.loads((P / 'picks.json').read_text()); picks, edited = pj['picks'], pj.get('edited', {}); out = P / 'media/plates'; out.mkdir(parents=True, exist_ok=True)
done, missing = 0, []
for s in json.loads((P / 'shots.json').read_text())['shots']:
    for p in s['plates']:
        n = picks.get(p['name']); src = P / 'mj' / (f"{p['have']}-{n}.jpeg" if 'have' in p else f"{p['batch']}/{p['name']}-{n}.jpeg")
        if p['name'] in edited: src = P / 'mj' / edited[p['name']]; n = 1
        if not n or not src.exists(): missing.append(f"{s['id']}:{p['name']}"); continue
        dst = out / f"{p['name']}.jpg"
        if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime or dst.stat().st_size != src.stat().st_size: shutil.copy2(src, dst)
        done += 1
print(f'{done} plates in place; missing: {missing or "none"}')
