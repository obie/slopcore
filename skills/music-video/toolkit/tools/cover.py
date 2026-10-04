#!/usr/bin/env python3
"""cover.py <project> <plate> --x0 N --title TEXT --artist TEXT --title-pos CX,CY,SIZE --artist-pos X,Y,SIZE [options]

Square cover art, 2000x2000, from a picked plate.

A square is cut from the plate (full height) starting at x0, enlarged to 2000 px, and set with the title in Anton on a
flat coloured slab, tilted as in the video, and the artist name in an italic serif. Nothing else is on it: stores
reject covers that carry handles, web addresses or extra credits.

  project        project folder, relative to the workspace root (the parent of tools/); the plate is <project>/media/plates/<plate>.jpg
  plate          plate name without extension
  --x0 N         left edge of the square on the plate, in plate pixels
  --title TEXT   the word on the slab
  --artist TEXT  the artist name
  --title-pos CX,CY,SIZE    centre of the slab and its font size, on the 2000 px cover
  --artist-pos X,Y,SIZE     centre x, baseline y and font size of the artist name, on the 2000 px cover
Options:
  --artist-color HEX   default #FBF6EA
  --slab-color HEX     default #FFD23F
  --ink-color HEX      title colour on the slab, default #0C0B0E
  --tilt DEG           slab rotation, default 2.0
  --title-font FILE    default engine/fonts/Anton-Regular.ttf
  --artist-font FILE   default engine/fonts/PlayfairDisplay-Italic-Variable.ttf
  --name NAME          output name, default cover-<plate>

Writes <project>/cover/<name>.jpg (quality 95, sRGB) and <project>/cover/<name>.png.
"""
import argparse, pathlib, sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
from PIL import Image, ImageDraw, ImageFont

TOOLKIT = pathlib.Path(__file__).resolve().parent.parent          # the workspace root
FONTS = TOOLKIT / 'engine/fonts'
N = 2000

ap = argparse.ArgumentParser(usage=__doc__)
ap.add_argument('project'); ap.add_argument('plate'); ap.add_argument('--x0', type=int, required=True)
ap.add_argument('--title', required=True); ap.add_argument('--artist', required=True)
ap.add_argument('--title-pos', required=True); ap.add_argument('--artist-pos', required=True)
ap.add_argument('--artist-color', default='#FBF6EA'); ap.add_argument('--slab-color', default='#FFD23F'); ap.add_argument('--ink-color', default='#0C0B0E')
ap.add_argument('--tilt', type=float, default=2.0)
ap.add_argument('--title-font', default=str(FONTS / 'Anton-Regular.ttf')); ap.add_argument('--artist-font', default=str(FONTS / 'PlayfairDisplay-Italic-Variable.ttf'))
ap.add_argument('--name')
A = ap.parse_args()
ROOT = TOOLKIT / A.project
PLATES = ROOT / 'media/plates'; OUT = ROOT / 'cover'
ANTON, BASK = A.title_font, A.artist_font
SLAB, INK = A.slab_color, A.ink_color


def slab(text, size, rot_deg=2.0):
    """The word on its flat block, as KIT.slab draws it: padding 0.17 em at the sides, 0.15 em above and below."""
    f = ImageFont.truetype(ANTON, size)
    l, t, r, b = f.getbbox(text)
    w, h = (r - l) + int(2 * 0.17 * size), (b - t) + int(2 * 0.15 * size)
    im = Image.new('RGBA', (w, h), SLAB)
    ImageDraw.Draw(im).text(((w - (r - l)) / 2 - l, (h - (b - t)) / 2 - t), text, font=f, fill=INK)
    return im.rotate(rot_deg, resample=Image.BICUBIC, expand=True)


def make(name):
    plate = Image.open(PLATES / f'{A.plate}.jpg').convert('RGB')
    side = plate.height
    im = plate.crop((A.x0, 0, A.x0 + side, side)).resize((N, N), Image.LANCZOS).convert('RGBA')
    cx, cy, size = (int(v) for v in A.title_pos.split(','))
    s = slab(A.title, size, A.tilt)
    im.alpha_composite(s, (int(cx - s.width / 2), int(cy - s.height / 2)))
    nx, ny, nsize = (int(v) for v in A.artist_pos.split(','))
    f = ImageFont.truetype(BASK, nsize)
    try: f.set_variation_by_axes([500])
    except Exception: pass
    ImageDraw.Draw(im).text((nx, ny), A.artist, font=f, fill=A.artist_color, anchor='ms')
    OUT.mkdir(exist_ok=True)
    rgb = im.convert('RGB')
    rgb.save(OUT / f'{name}.jpg', quality=95, subsampling=0, dpi=(300, 300))
    rgb.save(OUT / f'{name}.png', dpi=(300, 300))
    print(OUT / f'{name}.jpg', rgb.size)


make(A.name or f'cover-{A.plate}')
