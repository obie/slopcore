// media.js: MEDIA (stills and frame-sequence clips) and OCC (type behind a matted subject).
//
//   <project>/media/plates/<name>.jpg                 still
//   <project>/media/plates/<name>.matte.png           its matte, white = subject (optional)
//   <project>/media/clipframes/<clip>/f00001.jpg      clip frames, 1-based, 24 fps
//   <project>/media/clipframes/<clip>/matte/f00001.png  per-frame mattes (optional)
//
// Draw calls are synchronous. An image that is not decoded yet draws nothing and queues its load;
// ENGINE.render repeats the pass until nothing is queued, so the finished frame never depends on the cache.
'use strict';

const MEDIA = {
  root: '',              // '/<project>/media', set by boot.js
  budget: 768e6,         // decoded bytes kept per page before the least recently used images are dropped
  prefetch: 0,           // clip frames to decode ahead (render.py sets this for sequential renders)
  _cache: new Map(),     // url -> {bmp, promise, used, bytes}
  _pending: [],
  _tick: 0,
  _conv: null,

  plateUrl(name) { return `${this.root}/plates/${name}.jpg`; },
  plateMatteUrl(name) { return `${this.root}/plates/${name}.matte.png`; },
  clipUrl(clip, i) { return `${this.root}/clipframes/${clip}/f${String(i + 1).padStart(5, '0')}.jpg`; },
  clipMatteUrl(clip, i) { return `${this.root}/clipframes/${clip}/matte/f${String(i + 1).padStart(5, '0')}.png`; },

  _plate(name) {
    const p = ASSETS.plates[name];
    if (!p) throw new Error(`MEDIA: unknown plate "${name}" (no ${this.plateUrl(name)}; run \`render.py assets\` after adding files)`);
    return p;
  },
  _clip(clip) {
    const c = ASSETS.clips[clip];
    if (!c) throw new Error(`MEDIA: unknown clip "${clip}" (no ${this.root}/clipframes/${clip}/; run \`render.py assets\` after adding files)`);
    return c;
  },

  // 0-based frame index of a clip at local time lt. Clamps to the first and last frame, or loops.
  frame(clip, lt, o = {}) {
    const c = this._clip(clip);
    const i = Math.floor(lt * (o.fps || c.fps) + 1e-4);
    return o.loop ? ((i % c.n) + c.n) % c.n : clamp(i, 0, c.n - 1);
  },

  // matte: luminance x alpha -> alpha, done once at load on a CPU canvas
  _lumaToAlpha(bmp) {
    const c = this._conv || (this._conv = CANVAS.make(bmp.width, bmp.height));
    if (c.width !== bmp.width || c.height !== bmp.height) { c.width = bmp.width; c.height = bmp.height; }
    const g = c.ctx;
    g.reset();
    g.drawImage(bmp, 0, 0);
    bmp.close();
    const id = g.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const l = (d[i] * 54 + d[i + 1] * 183 + d[i + 2] * 19) >> 8;
      d[i + 3] = Math.round((l * d[i + 3]) / 255);
      d[i] = d[i + 1] = d[i + 2] = 255;
    }
    return createImageBitmap(id);
  },

  // -> decoded ImageBitmap, or null with the load queued. quiet = prefetch, never blocks a frame.
  _load(url, matte = false, quiet = false) {
    let e = this._cache.get(url);
    if (!e) {
      e = { bmp: null, used: 0, bytes: 0 };
      e.promise = fetch(url)
        .then(r => { if (!r.ok) throw new Error(`MEDIA: HTTP ${r.status} for ${url}`); return r.blob(); })
        .then(b => createImageBitmap(b))
        .then(bmp => (matte ? this._lumaToAlpha(bmp) : bmp))
        .then(bmp => { e.bmp = bmp; e.bytes = bmp.width * bmp.height * 4; });
      e.promise.catch(() => {});
      this._cache.set(url, e);
    }
    e.used = ++this._tick;
    if (e.bmp) return e.bmp;
    if (!quiet) this._pending.push(e.promise);
    return null;
  },

  // drop least recently used images over budget; runs between frames only
  _evict() {
    let total = 0;
    for (const e of this._cache.values()) total += e.bytes;
    if (total <= this.budget) return;
    const old = [...this._cache].filter(([, e]) => e.bmp).sort((a, b) => a[1].used - b[1].used);
    for (const [url, e] of old) {
      if (total <= this.budget) break;
      total -= e.bytes; e.bmp.close(); this._cache.delete(url);
    }
  },

  // Place img in o.box (default the whole frame) by `fit`, then zoom about the box centre, offset by x, y
  // pixels, rotate by rot radians. `dims` gives the size to lay out by when img is a matte of another size.
  // smooth: 'high' (default: bicubic up, mipmapped down; up to 30 ms for a scaled full-frame draw on the CPU
  // canvas), 'medium' or 'low' (bilinear, about 6 ms). An unscaled 1080p draw is under 1 ms at any setting.
  _place(ctx, img, o = {}, dims = img) {
    const box = o.box || { x: 0, y: 0, w: W, h: H };
    const fit = o.fit || 'cover';
    if (fit !== 'cover' && fit !== 'contain') throw new Error(`MEDIA: fit must be 'cover' or 'contain', got "${fit}"`);
    const s = (fit === 'contain' ? Math.min : Math.max)(box.w / dims.width, box.h / dims.height) * (o.zoom ?? 1);
    ctx.save();
    ctx.translate(box.x + box.w / 2 + (o.x || 0), box.y + box.h / 2 + (o.y || 0));
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(s, s);
    ctx.globalAlpha *= o.opacity ?? 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = o.smooth || 'high';
    ctx.drawImage(img, -dims.width / 2, -dims.height / 2, dims.width, dims.height);
    ctx.restore();
  },

  // MEDIA.drawPlate(ctx, 'kitchen', {fit: 'cover', x: 0, y: 0, zoom: 1, rot: 0, opacity: 1, box, smooth})
  drawPlate(ctx, name, o = {}) {
    this._plate(name);
    const img = this._load(this.plateUrl(name));
    if (img) this._place(ctx, img, o);
  },

  // MEDIA.drawClip(ctx, 'dance', lt, {loop: false, fps: 24, ...same placement options}) -> frame index drawn
  drawClip(ctx, clip, lt, o = {}) {
    const c = this._clip(clip), i = this.frame(clip, lt, o);
    const img = this._load(this.clipUrl(clip, i));
    for (let k = 1; k <= this.prefetch; k++) {
      const j = o.loop ? (i + k) % c.n : i + k;
      if (j < c.n && j !== i) this._load(this.clipUrl(clip, j), false, true);
    }
    if (img) this._place(ctx, img, o);
    return i;
  },
};

const OCC = {
  // OCC.behind(ctx, source, drawTypeFn): draw the type, then the source's subject on top through its matte.
  //   source = {plate: 'name', ...placement}  or  {clip: 'name', lt, loop, fps, ...placement}
  // Give it the same placement options the plate or clip was drawn with underneath.
  behind(ctx, src, drawType) {
    if (typeof drawType !== 'function') throw new Error('OCC.behind: third argument must be a function that draws the type');
    drawType(ctx);
    let img, matte;
    if (src.plate != null) {
      if (!MEDIA._plate(src.plate).matte) throw new Error(`OCC.behind: plate "${src.plate}" has no ${src.plate}.matte.png`);
      img = MEDIA._load(MEDIA.plateUrl(src.plate));
      matte = MEDIA._load(MEDIA.plateMatteUrl(src.plate), true);
    } else if (src.clip != null) {
      const c = MEDIA._clip(src.clip);
      if (!c.matte) throw new Error(`OCC.behind: clip "${src.clip}" has no matte/ frames`);
      if (!Number.isFinite(src.lt)) throw new Error('OCC.behind: a clip source needs lt');
      const i = MEDIA.frame(src.clip, src.lt, src);
      img = MEDIA._load(MEDIA.clipUrl(src.clip, i));
      matte = MEDIA._load(MEDIA.clipMatteUrl(src.clip, i), true);
      for (let k = 1; k <= MEDIA.prefetch; k++) {
        const j = src.loop ? (i + k) % c.n : i + k;
        if (j < c.n && j !== i) MEDIA._load(MEDIA.clipMatteUrl(src.clip, j), true, true);
      }
    } else {
      throw new Error('OCC.behind: source needs {plate} or {clip, lt}');
    }
    if (!img || !matte) return;
    const s = CANVAS.scratch('occ');
    const place = { ...src, opacity: 1 };
    MEDIA._place(s, img, place);
    s.globalCompositeOperation = 'destination-in';
    MEDIA._place(s, matte, place, img);
    ctx.save();
    ctx.globalAlpha *= src.opacity ?? 1;
    ctx.drawImage(s.canvas, 0, 0);
    ctx.restore();
  },
};
