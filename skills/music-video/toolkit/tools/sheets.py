#!/usr/bin/env python3
"""sheets.py <batch.json> <image dir> <out prefix> [--rows 6] [--w 480] — contact sheets for picking plates.

One row per Midjourney job, its four images left to right, each tile labelled "<job> #n". Images keep their
aspect. Writes <out prefix>-01.jpg, -02.jpg, ... with --rows jobs per sheet, and prints which job is on which sheet.
"""
import sys
if len(sys.argv) < 4 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import json, pathlib, subprocess

batch, imgdir, out = sys.argv[1], pathlib.Path(sys.argv[2]), sys.argv[3]
arg = lambda n, d: int(sys.argv[sys.argv.index(n) + 1]) if n in sys.argv else d
rows, w = arg('--rows', 6), arg('--w', 480)
jobs = [j for j in json.loads(pathlib.Path(batch).read_text())['jobs'] if all((imgdir / f"{j['name']}-{k}.jpeg").exists() for k in (1, 2, 3, 4))]
for n in range(0, len(jobs), rows):
    chunk = jobs[n:n + rows]; cmd = ['magick', 'montage']
    for j in chunk:
        for k in (1, 2, 3, 4): cmd += ['-label', f"{j['name']} #{k}", str(imgdir / f"{j['name']}-{k}.jpeg")]
    dst = f"{out}-{n // rows + 1:02d}.jpg"
    cmd += ['-resize', f'{w}x', '-geometry', '+4+4', '-tile', '4x', '-background', '#111', '-fill', '#eee', '-pointsize', '15', dst]
    subprocess.run(cmd, check=True)
    print(dst, ' '.join(j['name'] for j in chunk))
print(f"{len(jobs)} jobs on {-(-len(jobs) // rows)} sheets")
