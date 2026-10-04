// host.js: what render.py calls in the page to render a frame and hand its pixels to the local server.
// Not for chapters.
'use strict';

const HOST = {
  // raw RGBA of the stage, straight from the CPU canvas
  raw() { return _ctx.getImageData(0, 0, W, H).data; },

  blob(type, q) { return new Promise(res => _stage.toBlob(res, type, q)); },

  async post(url, body) {
    const r = await fetch(url, { method: 'POST', body });
    if (!r.ok) throw new Error(`POST ${url}: HTTP ${r.status} ${await r.text()}`);
  },

  // render time t and POST it to sink as 'raw' (RGBA), 'png' or 'jpeg'.
  // Raw bytes go up wrapped in a Blob: Chromium uploads a Blob body about 20x faster than a typed-array body
  // (measured 10 ms against 230 ms for one 8.3 MB frame). 'raw-view' is the slow form, kept for `bench`.
  async frame(t, sink, kind = 'raw') {
    const info = await ENGINE.render(t);
    const body = kind === 'raw' ? new Blob([this.raw()]) : kind === 'raw-view' ? this.raw()
      : await this.blob(kind === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    await this.post(sink, body);
    return info;
  },

  // the same for a run of times, in order, in one call (fewer round trips to Python)
  async frames(times, sink, kind = 'raw') {
    for (const t of times) await this.frame(t, sink, kind);
    return times.length;
  },

  // render time t and return the SHA-256 of its pixels
  async hash(t) {
    await ENGINE.render(t);
    const d = await crypto.subtle.digest('SHA-256', this.raw());
    return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // render time t and return its lyric marks
  async marks(t) {
    await ENGINE.render(t);
    return ENGINE.marks;
  },

  // contact sheet: begin, one tile per time, end. Each tile has its time in a caption strip above the picture.
  _sheet: null,
  sheetBegin(n, cols, w) {
    const h = Math.round((w * H) / W), rows = Math.ceil(n / cols), gap = 6;
    const size = Math.max(14, Math.round(w / 24)), cap = Math.round(size * 1.5);
    const c = CANVAS.make(cols * w + (cols + 1) * gap, rows * (h + cap) + (rows + 1) * gap);
    c.ctx.fillStyle = '#16161a';
    c.ctx.fillRect(0, 0, c.width, c.height);
    this._sheet = { c, cols, w, h, gap, size, cap };
  },
  async sheetTile(i, t, label) {
    const info = await ENGINE.render(t);
    const { c, cols, w, h, gap, size, cap } = this._sheet, g = c.ctx;
    const x = gap + (i % cols) * (w + gap), y = gap + Math.floor(i / cols) * (h + cap + gap);
    TXT.draw(g, label, x + 2, y + size * 1.1, { font: FONT.mono, size, weight: 700, fill: '#ffe45c' });
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(_stage, x, y + cap, w, h);
    return info;
  },
  async sheetEnd(sink, kind = 'jpeg') {
    const c = this._sheet.c;
    const b = await new Promise(res => c.toBlob(res, kind === 'png' ? 'image/png' : 'image/jpeg', 0.92));
    await this.post(sink, b);
    this._sheet = null;
    return [c.width, c.height];
  },
};
