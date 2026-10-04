#!/usr/bin/env python3
"""imgedit.py — plate fixes and text-bearing images through an image model on OpenRouter (default GPT Image 2.5).

  imgedit.py edit IN OUT "instruction" [--ref IMG ...] [--model ID] [--size 2944x1648]
        edit IN. The instruction names what changes; a fixed clause says everything else must stay. Reference
        images (her face, for example) follow IN in the request.
  imgedit.py make OUT "description" [--ref IMG ...] [--model ID] [--size 2944x1648]
        generate a new image (used where the picture needs real, correct lettering, which Midjourney cannot set).

  imgedit.py region IN OUT x,y,w,h "instruction" [--ref IMG ...] [--feather 48]
        the fix for small things (hands, a face, a mouth): crop that region of IN, give the model only the crop
        enlarged to about 2048 px so it has pixels to work with, then paste the result back with a feathered edge.
        Everything outside the region stays pixel-identical. Also writes OUT.zoom.jpg (before | after at full size).
  imgedit.py inpaint IN OUT x,y,w,h "what the masked area should show" [--feather 48]
        Recraft V3 inpainting (RECRAFT_API_KEY): the whole picture is sent with a white mask over the region, and
        only that region is pasted back. Also writes OUT.zoom.jpg.
  imgedit.py merge ORIG EDIT OUT [--thresh 28] [--grow 40] [--box x,y,w,h ...]
        an edit redraws the whole frame. merge resizes EDIT to ORIG's size, matches its colour to ORIG, finds where the
        two differ, and pastes only that region (feathered) into ORIG, so the rest of the plate stays pixel-identical.
        --box forces a region of ORIG (in its pixels) into the pasted area, for thin changes the difference misses.
        Writes OUT and OUT.mask.jpg and prints how much of the frame changed.

--model google/gemini-3-pro-image is the fallback when OpenAI's safety filter refuses a close crop of skin.
Prints the output size and the cost OpenRouter reports. Key: OPENROUTER_API_KEY in the environment.
Fixes are made here or in the Midjourney prompt, never painted by hand.
"""
import base64, json, os, pathlib, subprocess, sys, urllib.error, urllib.request

MODEL = 'openai/gpt-image-2.5-sunburst'
SIZE = '2944x1648'    # the model honours `size`; `resolution` is ignored and gives 1536x864
KEEP = ("Keep everything else exactly as it is: the same framing and crop, the same light, colours, film grain and sharpness, "
        "the same people, clothes and objects except what this instruction changes. Photorealistic, the same photograph, same aspect ratio.")

def data_url(path, maxw=2048):
    raw = subprocess.run(['magick', str(path), '-resize', f'{maxw}x{maxw}>', '-quality', '92', 'jpeg:-'], capture_output=True, check=True).stdout
    return 'data:image/jpeg;base64,' + base64.b64encode(raw).decode()

ARS = {'1:1': 1, '5:4': 1.25, '4:3': 4 / 3, '3:2': 1.5, '16:9': 16 / 9, '2:1': 2, '21:9': 21 / 9, '4:5': 0.8, '3:4': 0.75, '2:3': 2 / 3, '9:16': 9 / 16}
def nearest_ar(r): return min(ARS.items(), key=lambda kv: abs(kv[1] - r))

def call(model, text, images, size=SIZE):
    """OpenRouter's unified image API: POST /api/v1/images; reference images go in input_references."""
    body = {'model': model, 'prompt': text, 'n': 1}
    if model.startswith('openai/'): body.update({'size': size, 'quality': 'high', 'output_format': 'jpeg'})
    else: w_, h_ = (int(v) for v in size.split('x')); body.update({'aspect_ratio': nearest_ar(w_ / h_)[0], 'resolution': '2K'})
    if images: body['input_references'] = [{'type': 'image_url', 'image_url': {'url': data_url(p)}} for p in images]
    req = urllib.request.Request('https://openrouter.ai/api/v1/images', data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + os.environ['OPENROUTER_API_KEY'], 'Content-Type': 'application/json'})
    try: r = json.loads(urllib.request.urlopen(req, timeout=900).read())
    except urllib.error.HTTPError as e: sys.exit(f'imgedit: HTTP {e.code}: {e.read().decode()[:700]}')
    item = (r.get('data') or [{}])[0]
    if item.get('b64_json'): data = base64.b64decode(item['b64_json'])
    elif item.get('url', '').startswith('data:'): data = base64.b64decode(item['url'].split(',', 1)[1])
    elif item.get('url'): data = urllib.request.urlopen(item['url'], timeout=300).read()
    else: sys.exit('imgedit: no image in the response: ' + json.dumps({k: (v if not isinstance(v, (str, list)) or len(str(v)) < 300 else str(v)[:300] + '...') for k, v in r.items()})[:900])
    usage = r.get('usage') or {}; usage.setdefault('cost', r.get('cost'))
    return data, usage

args = sys.argv[1:]; refs, model = [], MODEL
def take(flag):
    out = []
    while flag in args: i = args.index(flag); out.append(args[i + 1]); del args[i:i + 2]
    return out
refs = take('--ref'); model = (take('--model') or [MODEL])[0]; size = (take('--size') or [SIZE])[0]
cmd = args[0] if args else '-h'
if cmd == 'inpaint':
    import io, numpy as np, requests
    from PIL import Image, ImageFilter
    feather = int((take('--feather') or [48])[0]); src, out, (x, y, w, h), prompt = args[1], args[2], [int(v) for v in args[3].split(',')], args[4]
    im = Image.open(src).convert('RGB'); mask = Image.new('L', im.size, 0); mask.paste(255, (x, y, x + w, y + h))
    bi, bm = io.BytesIO(), io.BytesIO(); im.save(bi, 'PNG'); mask.save(bm, 'PNG')
    r = requests.post('https://external.api.recraft.ai/v1/images/inpaint', headers={'Authorization': 'Bearer ' + os.environ['RECRAFT_API_KEY']},
                      files={'image': ('image.png', bi.getvalue(), 'image/png'), 'mask': ('mask.png', bm.getvalue(), 'image/png')},
                      data={'prompt': prompt, 'model': 'recraftv3', 'style': 'realistic_image', 'response_format': 'b64_json', 'image_format': 'png'}, timeout=600)
    if r.status_code != 200: sys.exit(f'imgedit: Recraft HTTP {r.status_code}: {r.text[:500]}')
    new = Image.open(io.BytesIO(base64.b64decode(r.json()['data'][0]['b64_json']))).convert('RGB').resize(im.size, Image.LANCZOS)
    m = mask.filter(ImageFilter.GaussianBlur(feather / 2.5)); res = Image.composite(new, im, m); pathlib.Path(out).parent.mkdir(parents=True, exist_ok=True); res.save(out, quality=95)
    z = Image.new('RGB', (2 * w + 12, h), (17, 17, 17)); z.paste(im.crop((x, y, x + w, y + h)), (0, 0)); z.paste(res.crop((x, y, x + w, y + h)), (w + 12, 0)); z.save(out + '.zoom.jpg', quality=90)
    print(f"{out}  inpainted {w}x{h} at {x},{y}  (recraftv3)"); sys.exit(0)
if cmd == 'region':
    import io, numpy as np
    from PIL import Image, ImageFilter
    feather = int((take('--feather') or [48])[0])
    src, out, (x, y, w, h), instruction = args[1], args[2], [int(v) for v in args[3].split(',')], args[4]
    im = Image.open(src).convert('RGB')
    r = nearest_ar(w / h)[1]; cx, cy = x + w / 2, y + h / 2
    if w / h < r: w = int(round(h * r))
    else: h = int(round(w / r))
    w, h = min(w, im.width), min(h, im.height); x = int(min(max(cx - w / 2, 0), im.width - w)); y = int(min(max(cy - h / 2, 0), im.height - h))
    crop = im.crop((x, y, x + w, y + h))
    k = min(2048 / max(w, h), 3.0); W, H = (int(round(w * k / 16)) * 16, int(round(h * k / 16)) * 16)
    tmp = pathlib.Path(out).with_suffix('.crop.png'); tmp.parent.mkdir(parents=True, exist_ok=True); crop.resize((W, H), Image.LANCZOS).save(tmp)
    text = (f"Edit the first image, which is a close crop of a larger photograph. {instruction} Keep everything else exactly as it is: the same framing, "
            "the same light, colours, film grain and sharpness, and the same content right up to all four edges of the image, because it will be pasted back into the larger photograph."
            + (f" The other {len(refs)} image(s) are references for the edit only." if refs else ''))
    data, usage = call(model, text, [tmp] + refs, f'{W}x{H}')
    new = Image.open(io.BytesIO(data)).convert('RGB').resize((w, h), Image.LANCZOS)
    A, B = np.asarray(crop).astype(np.float32), np.asarray(new).astype(np.float32); ring = np.ones((h, w), bool); ring[feather:-feather, feather:-feather] = False
    for c in range(3): B[..., c] += A[..., c][ring].mean() - B[..., c][ring].mean()          # match colour on the border ring
    new = Image.fromarray(np.clip(B, 0, 255).astype(np.uint8))
    # feather only the sides that lie inside the picture; a side on the frame edge is replaced right up to the edge
    L_, T_, R_, B_ = (feather if x > 0 else -3 * feather), (feather if y > 0 else -3 * feather), (feather if x + w < im.width else -3 * feather), (feather if y + h < im.height else -3 * feather)
    big = Image.new('L', (w + 6 * feather, h + 6 * feather), 0); big.paste(255, (3 * feather + L_, 3 * feather + T_, 3 * feather + w - R_, 3 * feather + h - B_))
    m = big.filter(ImageFilter.GaussianBlur(feather / 2.5)).crop((3 * feather, 3 * feather, 3 * feather + w, 3 * feather + h))
    res = im.copy(); res.paste(Image.composite(new, crop, m), (x, y)); res.save(out, quality=95); tmp.unlink()
    z = Image.new('RGB', (2 * w + 12, h), (17, 17, 17)); z.paste(crop, (0, 0)); z.paste(res.crop((x, y, x + w, y + h)), (w + 12, 0)); z.save(out + '.zoom.jpg', quality=90)
    print(f"{out}  region {x},{y},{w},{h} edited at {W}x{H}  cost ${usage.get('cost', '?')}  ({model})"); sys.exit(0)
if cmd == 'merge':
    import numpy as np
    from PIL import Image, ImageFilter
    thresh = float((take('--thresh') or [28])[0]); grow = int((take('--grow') or [40])[0]); boxes = [tuple(int(v) for v in b.split(',')) for b in take('--box')]
    o = Image.open(args[1]).convert('RGB'); e = Image.open(args[2]).convert('RGB').resize(o.size, Image.LANCZOS)
    A, B = np.asarray(o).astype(np.float32), np.asarray(e).astype(np.float32)
    lo = lambda im: np.asarray(im.resize((o.width // 8, o.height // 8), Image.BILINEAR).filter(ImageFilter.GaussianBlur(3))).astype(np.float32)
    d = np.abs(lo(o) - lo(e)).max(axis=2); same = d < np.percentile(d, 60)          # the calm 60% of the frame: used to match colour
    a8, b8 = lo(o), lo(e)
    for c in range(3):
        g = a8[..., c][same].std() / (b8[..., c][same].std() + 1e-6); B[..., c] = (B[..., c] - b8[..., c][same].mean()) * g + a8[..., c][same].mean()
    e2 = Image.fromarray(np.clip(B, 0, 255).astype(np.uint8))
    d = np.abs(lo(o) - lo(e2)).max(axis=2); hit = d > thresh
    for x, y, w, h in boxes: hit[y // 8:(y + h) // 8, x // 8:(x + w) // 8] = True
    m = Image.fromarray((hit * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MaxFilter(2 * (grow // 8) + 1)).resize(o.size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(grow / 2))
    Image.composite(e2, o, m).save(args[3], quality=95); m.save(args[3] + '.mask.jpg')
    print(f"{args[3]}  {o.width}x{o.height}  changed region: {100 * (np.asarray(m) > 128).mean():.1f}% of the frame"); sys.exit(0)
if cmd == 'edit':
    src, out, instruction = args[1], args[2], args[3]
    text = f"Edit the first image. {instruction} {KEEP}" + (f" The other {len(refs)} image(s) are references for the edit only." if refs else '')
    data, usage = call(model, text, [src] + refs, size)
elif cmd == 'make':
    out, desc = args[1], args[2]
    data, usage = call(model, desc + (" The attached image(s) are references." if refs else ''), refs, size)
else: sys.exit(__doc__)
pathlib.Path(out).parent.mkdir(parents=True, exist_ok=True); pathlib.Path(out).write_bytes(data)
size = subprocess.run(['magick', 'identify', '-format', '%wx%h', out], capture_output=True, text=True).stdout
print(f"{out}  {size}  cost ${usage.get('cost', '?')}  ({model})")
