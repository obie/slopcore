// type.js: fonts and TXT: draw, measure, per-word layout, fit.
//
// A style is a plain object:
//   {font, size, weight, italic, tracking, align, baseline, fill, stroke, strokeWidth, opacity, upper,
//    lineHeight, wordGap, wrap, valign, fit}
// tracking is in em (0.05 adds 0.05 x size px between glyphs). Sizes and positions are canvas pixels.
'use strict';

const FONT = Object.freeze({
  hook: 'Anton',              // heavy condensed grotesque, one weight
  sans: 'Inter',              // clean sans, weights 100-900
  mono: 'JetBrains Mono',     // readouts, weights 100-800
  serif: 'Playfair Display',  // high-contrast italic serif, weights 400-900, italic only
});

const TXT = {
  families: new Set(),
  _loads: [],
  _m: CANVAS.make(8, 8).ctx,
  _wcache: new Map(),

  // Register a font file. Call from common.js, not from a chapter and never inside draw().
  // The weight range is declared wide so the browser never fakes a bold.
  addFont(family, url, desc = {}) {
    const f = new FontFace(family, `url("${url}")`, { weight: '100 900', ...desc });
    document.fonts.add(f);
    this.families.add(family);
    this._loads.push(f.load().catch(e => { throw new Error(`font "${family}" failed to load from ${url}: ${e.message || e}`); }));
  },

  _style(s = {}) {
    const st = { font: FONT.sans, size: 64, weight: 400, italic: false, tracking: 0, ...s };
    if (!this.families.has(st.font)) throw new Error(`TXT: unknown font "${st.font}" (have: ${[...this.families].join(', ')})`);
    if (!(st.size > 0)) throw new Error(`TXT: bad size ${st.size}`);
    return st;
  },
  _css(st) { return `${st.italic ? 'italic ' : ''}${st.weight} ${st.size}px "${st.font}"`; },
  _apply(ctx, st) {
    ctx.font = this._css(st);
    ctx.letterSpacing = `${st.tracking * st.size}px`;
    ctx.fontKerning = 'normal';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  },
  _text(text, st) { return st.upper ? String(text).toLocaleUpperCase('es') : String(text); },

  // advance width of text in px, without the trailing tracking
  width(text, s) {
    const st = this._style(s), str = this._text(text, st);
    if (!str) return 0;
    const key = `${this._css(st)}|${st.tracking}|${str}`;
    let w = this._wcache.get(key);
    if (w === undefined) {
      this._apply(this._m, st);
      w = this._m.measureText(str).width - st.tracking * st.size;
      if (this._wcache.size > 20000) this._wcache.clear();
      this._wcache.set(key, w);
    }
    return w;
  },
  // cap height of the style's font in px
  capH(s) {
    const st = this._style(s), key = `${this._css(st)}|cap`;
    let h = this._wcache.get(key);
    if (h === undefined) {
      this._apply(this._m, st);
      h = this._m.measureText('H').actualBoundingBoxAscent;
      this._wcache.set(key, h);
    }
    return h;
  },
  // TXT.measure('title', style) -> {w, asc, desc, cap}: advance width, ink above and below the baseline, cap height
  measure(text, s) {
    const st = this._style(s), str = this._text(text, st);
    this._apply(this._m, st);
    const m = this._m.measureText(str);
    return { w: this.width(text, st), asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, cap: this.capH(st) };
  },

  // TXT.draw(ctx, 'TITLE', x, y, style) -> width.
  // align: 'left' | 'center' | 'right' about x. baseline: 'alphabetic' (y is the baseline),
  // 'center' (cap height centred on y), 'top' (cap top at y). Stroke is drawn under the fill.
  draw(ctx, text, x, y, s) {
    const st = this._style(s), str = this._text(text, st);
    if (!str) return 0;
    const w = this.width(text, st);
    const ax = st.align === 'center' ? x - w / 2 : st.align === 'right' ? x - w : x;
    const base = st.baseline || 'alphabetic';
    const ay = base === 'center' ? y + this.capH(st) / 2 : base === 'top' ? y + this.capH(st) : y;
    ctx.save();
    this._apply(ctx, st);
    if (st.opacity != null) ctx.globalAlpha *= st.opacity;
    if (st.stroke && st.strokeWidth > 0) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = st.strokeWidth;
      ctx.strokeStyle = st.stroke;
      ctx.strokeText(str, ax, ay);
    }
    if (st.fill !== null) {
      ctx.fillStyle = st.fill ?? '#fff';
      ctx.fillText(str, ax, ay);
    }
    ctx.restore();
    return w;
  },

  // TXT.layout(words, box, style) -> one box per word: [{text, i, line, x, y, w, size, cx, cy}]
  //   words: strings (or {w}); a '\n' entry forces a line break and gets no box
  //   box:   {x, y, w, h}. Lines wrap at w (style.wrap: false keeps one row). With h, the block is placed by
  //          style.valign 'top' | 'middle' | 'bottom' (default 'middle'); without h the block starts at y.
  //   style.align 'left' | 'center' | 'right' within w; style.lineHeight in em (default 1.15);
  //   style.fit: true shrinks size until the block fits w (and h).
  // x is the word's left edge, y its baseline, cx/cy the centre of its cap-height box, i its index in words.
  // Draw one with TXT.word(ctx, b, style).
  layout(words, box, s = {}) {
    const st0 = this._style(s);
    const toks = words.map(w => (typeof w === 'string' ? w : w.w));
    const build = size => {
      const st = { ...st0, size };
      const gap = (this.width(' ', st) + 2 * st.tracking * size) * (st.wordGap ?? 1);
      const lines = [[]];
      let x = 0;
      toks.forEach((tk, i) => {
        if (tk === '\n') { lines.push([]); x = 0; return; }
        const text = this._text(tk, st), w = this.width(tk, st);
        let L = lines[lines.length - 1];
        if (L.length && st.wrap !== false && x + gap + w > box.w) { lines.push((L = [])); x = 0; }
        if (L.length) x += gap;
        L.push({ text, i, x, w });
        x += w;
      });
      const widths = lines.map(L => (L.length ? L[L.length - 1].x + L[L.length - 1].w : 0));
      const cap = this.capH(st), lh = size * (st.lineHeight ?? 1.15);
      return { st, lines, widths, cap, lh, w: Math.max(0, ...widths), h: (lines.length - 1) * lh + cap };
    };
    const fits = b => b.w <= box.w + 0.01 && (box.h == null || b.h <= box.h + 0.01);
    let b = build(st0.size);
    if (st0.fit && !fits(b)) {
      let lo = st0.size / 64, hi = st0.size;
      for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; if (fits(build(mid))) lo = mid; else hi = mid; }
      b = build(lo);
    }
    const valign = st0.valign || 'middle';
    const top = box.h == null || valign === 'top' ? box.y : valign === 'bottom' ? box.y + box.h - b.h : box.y + (box.h - b.h) / 2;
    const out = [];
    b.lines.forEach((L, li) => {
      const off = st0.align === 'center' ? (box.w - b.widths[li]) / 2 : st0.align === 'right' ? box.w - b.widths[li] : 0;
      const y = top + b.cap + li * b.lh;
      for (const wd of L) {
        const x = box.x + off + wd.x;
        out.push({ text: wd.text, i: wd.i, line: li, x, y, w: wd.w, size: b.st.size, cx: x + wd.w / 2, cy: y - b.cap / 2 });
      }
    });
    return out;
  },

  // TXT.word(ctx, b, style): draw one box from TXT.layout where the layout put it.
  word(ctx, b, s = {}) {
    return this.draw(ctx, b.text, b.x, b.y, { ...s, size: b.size, align: 'left', baseline: 'alphabetic', upper: false });
  },

  // TXT.fit('NO ES GRASA', {w: 1600, h: 300}, style) -> the largest size at which the line is no wider than
  // box.w and its ink no taller than box.h (h optional), capped at style.max.
  fit(text, box, s = {}) {
    const st = this._style({ ...s, size: 100 });
    const m = this.measure(text, st);
    let size = m.w > 0 ? (100 * box.w) / m.w : Infinity;
    if (box.h != null && m.asc + m.desc > 0) size = Math.min(size, (100 * box.h) / (m.asc + m.desc));
    if (s.max != null) size = Math.min(size, s.max);
    if (!Number.isFinite(size)) throw new Error('TXT.fit: nothing to fit');
    return size;
  },
};

TXT.addFont('Anton', '/engine/fonts/Anton-Regular.ttf');
TXT.addFont('Inter', '/engine/fonts/Inter-Variable.ttf');
TXT.addFont('JetBrains Mono', '/engine/fonts/JetBrainsMono-Variable.ttf');
TXT.addFont('Playfair Display', '/engine/fonts/PlayfairDisplay-Italic-Variable.ttf', { style: 'italic' });
