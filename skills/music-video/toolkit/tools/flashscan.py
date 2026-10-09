#!/usr/bin/env python3
"""flashscan.py <project> [CLIP ...] [--jump 30] [--fix CLIP:FRAME ...] — find single blown-out frames in clip frames.

Seedance sometimes renders a camera flash as one frame far brighter than the frames on either side of it. In a cut
it reads as a white blink. This measures the mean brightness (0 to 255) of every frame in media/clipframes/<clip>/
(every clip, or the ones named) and prints each frame that stands --jump levels or more above both neighbours,
largest first. A clip's first and last frame have one neighbour and are compared with that one.

The last column says where the frame falls when its shot plays the clip straight from edl.json: "in the cut at
M:SS.ss", "not in the cut" (before the in-point, or after the shot ends) or "check the cut" (a warped clip, a clip
that shares its shot with others, or a clip the edit list does not name). A chapter can play a clip its own way,
so before a master render look at the film at that time with `render.py sheet`.

--fix CLIP:FRAME replaces that frame with the average of its two neighbours. The original is kept as
media/scratch/flash-fix/<clip>-fNNNNN-original.jpg. Exits 1 when a scan finds a spike that is in the cut.
"""
import sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import json, pathlib, shutil
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageStat

P = pathlib.Path(sys.argv[1]).resolve(); FR = P / 'media/clipframes'; FPS = 24
args, jump, fixes, names = sys.argv[2:], 30.0, [], []
while args:
    a = args.pop(0)
    if a == '--jump': jump = float(args.pop(0))
    elif a == '--fix':
        while args and not args[0].startswith('--'): fixes.append(args.pop(0))
    else: names.append(a)

frames = lambda clip: sorted((FR / clip).glob('f*.jpg'))

def fix(spec):
    clip, n = spec.rsplit(':', 1); fs = frames(clip); i = int(n) - 1
    if not 0 <= i < len(fs): sys.exit(f'{clip} has no frame {n} ({len(fs)} frames)')
    keep = P / 'media/scratch/flash-fix' / f'{clip}-{fs[i].stem}-original.jpg'
    if keep.exists(): sys.exit(f'{keep} exists: {clip} frame {n} was fixed before')
    nb = [Image.open(fs[j]).convert('RGB') for j in (i - 1, i + 1) if 0 <= j < len(fs)]
    keep.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(fs[i], keep)
    (Image.blend(nb[0], nb[1], 0.5) if len(nb) == 2 else nb[0]).save(fs[i], quality=95)
    print(f'{clip} {fs[i].name}: now the average of its neighbours; original kept at {keep.relative_to(P)}')

if fixes:
    for spec in fixes: fix(spec)
    sys.exit(0)

def mean(path):
    im = Image.open(path); im.draft('L', (240, 135))   # the JPEG decoder scales it down: a full scan takes seconds
    return ImageStat.Stat(im.convert('L')).mean[0]

# where each clip plays: clip -> (shot id, shot start, shot end, in-point), or None when only the eye can tell
plays = {}
if (P / 'edl.json').exists() and (P / 'shots.json').exists():
    span = {s['id']: (s['t0'], s['t1']) for s in json.loads((P / 'shots.json').read_text())['shots']}
    for sid, e in json.loads((P / 'edl.json').read_text()).items():
        if e.get('clip'): plays[e['clip']] = None if e.get('warp') or sid not in span else (sid, *span[sid], e.get('in', 0))
        for part in (e.get('plates') or {}).values():
            if part.get('clip'): plays[part['clip']] = None

def where(clip, i):
    if not plays.get(clip): return 'check the cut'
    sid, t0, t1, cin = plays[clip]; t = t0 + i / FPS - cin
    return f'in the cut at {int(t // 60)}:{t % 60:05.2f} ({sid})' if t0 <= t < t1 else 'not in the cut'

clips = names or sorted(d.name for d in FR.iterdir() if d.is_dir())
hits, total = [], 0
with ThreadPoolExecutor(8) as pool:
    for clip in clips:
        fs = frames(clip); m = list(pool.map(mean, fs)); total += len(fs)
        for i in range(len(m)):
            nb = [m[j] for j in (i - 1, i + 1) if 0 <= j < len(m)]
            if nb and m[i] - max(nb) >= jump: hits.append((m[i] - max(nb), clip, fs[i].name, m[i], nb, where(clip, i)))
hits.sort(reverse=True)
for d, clip, name, v, nb, w in hits:
    print(f'{clip:<12}{name:<13}+{d:<6.0f}mean {v:5.1f}   neighbours {" / ".join(f"{x:.0f}" for x in nb):<10}{w}')
bad = sum(h[5].startswith('in the cut') for h in hits)
print(f'{total} frames in {len(clips)} clip{"s" * (len(clips) != 1)}: {len(hits)} at {jump:g} levels or more over their neighbours, {bad} in the cut')
sys.exit(1 if bad else 0)
