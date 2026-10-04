#!/usr/bin/env python3
"""matte.py <command> <project> — subject mattes (white = people in front, black = background) so type can sit behind them.

  plates <project> [NAME ...] [--force]      media/plates/NAME.matte.png for every plate lacking one, 1472 px wide
  clip <project> CLIP [...] [--force]        media/clipframes/CLIP/matte/fNNNNN.png for every frame, 960 px wide, temporally smoothed
  catchup <project>                          everything missing: plates, then every clip folder
  sheet <project> <out.jpg> [NAME ...]       contact sheet of plates, outside the matte dimmed to 25% and tinted red (all plates if no names)

Options: --model REPO   Hugging Face repo, default ZhengPeng7/BiRefNet (also ZhengPeng7/BiRefNet_HR, run at 2048 px)
         --size N       network input size, default 1024 (2048 for an _HR model)
         --cols N       sheet columns, default 5
Model: BiRefNet (MIT) through transformers with trust_remote_code. Device: MPS, CPU if an op fails.
A clip is skipped when it has as many mattes as frames. Clip frames are matted one by one, then each matte is blended with its
neighbours (1-2-1 weights) to calm flicker; the smoothing is centred, so it adds no lag.
"""
import pathlib, sys, time
import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
argv = sys.argv[1:]
VALUED = ('--model', '--size', '--cols')
flag = lambda n, d=None: (argv[argv.index(n) + 1] if n in argv else d)
if len(argv) < 2 or argv[0] not in ('plates', 'clip', 'catchup', 'sheet'): sys.exit(__doc__)
CMD = argv[0]; P = (ROOT / argv[1]).resolve(); FORCE = '--force' in argv
ARGS = [a for i, a in enumerate(argv[2:], 2) if not a.startswith('--') and argv[i - 1] not in VALUED]
MODEL = flag('--model', 'ZhengPeng7/BiRefNet'); SIZE = int(flag('--size', 2048 if 'HR' in MODEL else 1024))
PL = P / 'media/plates'; CF = P / 'media/clipframes'
_m = {}

def net():
    if 'm' not in _m:
        import torch
        from transformers import AutoModelForImageSegmentation
        m = AutoModelForImageSegmentation.from_pretrained(MODEL, trust_remote_code=True, torch_dtype=torch.float32).float().eval()
        _m.update(m=m, dev='mps' if torch.backends.mps.is_available() else 'cpu', torch=torch)
        m.to(_m['dev'])
    return _m

def predict(img, w):
    """PIL RGB -> float32 array in 0..1, width w, height by aspect."""
    m = net(); torch = m['torch']; h = round(w * img.height / img.width)
    x = np.asarray(img.convert('RGB').resize((SIZE, SIZE), Image.BICUBIC), np.float32) / 255
    x = torch.from_numpy((x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]).permute(2, 0, 1)[None].float()
    with torch.no_grad():
        try: y = m['m'](x.to(m['dev']))[-1]
        except Exception as e:
            print('  device fallback to cpu:', str(e)[:100], file=sys.stderr); m['m'].to('cpu'); m['dev'] = 'cpu'; y = m['m'](x)[-1]
    y = y.sigmoid().float().cpu()[0, 0].numpy()
    return np.asarray(Image.fromarray(y).resize((w, h), Image.BICUBIC), np.float32).clip(0, 1)

def save(a, p): p.parent.mkdir(parents=True, exist_ok=True); Image.fromarray((a * 255 + .5).astype(np.uint8), 'L').save(p, optimize=True)

def plates(names, force):
    todo = [n for n in (names or sorted(p.stem for p in PL.glob('*.jpg'))) if force or not (PL / f'{n}.matte.png').exists()]
    print(f'{len(todo)} plates to matte ({MODEL}, {SIZE}px)'); t0 = time.time()
    for i, n in enumerate(todo, 1):
        t = time.time(); save(predict(Image.open(PL / f'{n}.jpg'), 1472), PL / f'{n}.matte.png')
        print(f'  [{i}/{len(todo)}] {n} {time.time() - t:.2f}s on {_m["dev"]}', flush=True)
    if todo: print(f'{len(todo)} plates in {time.time() - t0:.0f}s, {(time.time() - t0) / len(todo):.2f}s each, device {_m["dev"]}')

def clip(c, force):
    fr = sorted((CF / c).glob('f*.jpg')); out = CF / c / 'matte'
    if not fr: return print(f'{c}: no frames')
    if not force and len(list(out.glob('f*.png'))) == len(fr): return print(f'{c}: {len(fr)} mattes exist')
    t0 = time.time(); raw = np.stack([predict(Image.open(f), 960) for f in fr])
    pad = np.concatenate([raw[:1], raw, raw[-1:]]); sm = (pad[:-2] + 2 * pad[1:-1] + pad[2:]) / 4
    flick = lambda a: float(np.abs(np.diff(a, axis=0)).mean())
    for f, a in zip(fr, sm): save(a, out / f'{f.stem}.png')
    dt = time.time() - t0
    print(f'{c}: {len(fr)} frames in {dt:.0f}s ({dt / len(fr):.2f}s/frame, {_m["dev"]}); mean frame-to-frame change {flick(raw):.4f} raw, {flick(sm):.4f} smoothed')

def sheet(out, names, cols):
    names = names or sorted(p.name[:-10] for p in PL.glob('*.matte.png')); tw = 480; tiles = []
    for n in names:
        im = Image.open(PL / f'{n}.jpg').convert('RGB'); im = im.resize((tw, round(tw * im.height / im.width)))
        mp = PL / f'{n}.matte.png'
        if mp.exists():
            m = np.asarray(Image.open(mp).convert('L').resize(im.size, Image.BILINEAR), np.float32)[..., None] / 255
            a = np.asarray(im, np.float32); dim = a * .25 * np.array([1.0, .45, .45]) + np.array([40, 0, 0])
            im = Image.fromarray((a * m + dim * (1 - m)).astype(np.uint8))
        ImageDraw.Draw(im).text((6, 4), n, fill=(255, 255, 0)); tiles.append(im)
    th = max(t.height for t in tiles); rows = -(-len(tiles) // cols); S = Image.new('RGB', (cols * tw + (cols + 1) * 4, rows * th + (rows + 1) * 4), (17, 17, 17))
    for i, t in enumerate(tiles): S.paste(t, (4 + (i % cols) * (tw + 4), 4 + (i // cols) * (th + 4)))
    pathlib.Path(out).parent.mkdir(parents=True, exist_ok=True); S.save(out, quality=88); print(f'{len(tiles)} tiles -> {out}')

clips = lambda: sorted(p.name for p in CF.iterdir() if p.is_dir() and any(p.glob('f*.jpg'))) if CF.exists() else []
if CMD == 'plates': plates(ARGS, FORCE)
elif CMD == 'clip': [clip(c, FORCE) for c in ARGS]
elif CMD == 'catchup': plates([], False); [clip(c, False) for c in clips()]
elif CMD == 'sheet': sheet(ARGS[0], ARGS[1:], int(flag('--cols', 5)))
