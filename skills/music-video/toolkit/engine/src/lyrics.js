// lyrics.js: LY, the lyric gate's marks and a basic line helper.
//
// The gate (`render.py lyrics`) renders each sung word at the midpoint of its time span and requires a mark
// for it at 36 px or taller. A mark is a claim that the word is readable on screen in this frame.
'use strict';

const LY = {
  MIN_PX: 36,

  // LY.mark(li, wi, px): word wi of line li is on screen in this frame, set px pixels tall (font size as drawn,
  // after any scale). Call it from draw() for every lyric word you draw yourself.
  mark(li, wi, px) {
    LYR.word(li, wi);
    if (!Number.isFinite(px)) throw new Error(`LY.mark(${li}, ${wi}): px must be a number, got ${px}`);
    ENGINE.marks.push({ li, wi, px });
  },

  // uniform scale of the context's current transform, for turning a font size into on-screen px
  scale(ctx) {
    const m = ctx.getTransform();
    return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
  },

  // LY.line(ctx, t, li, {x, y, w, size, align, fill, dim, active, ...style}) -> word boxes
  // One row, baseline at y, anchored at x by align ('center' default), shrunk to fit w (default 1680).
  // Each word appears at its own t0. Before t0 it is drawn in `dim` if given, else not drawn.
  // From t0 to t1 it is drawn in `active` if given, else `fill`; after t1 in `fill`.
  // A word is marked once t >= its t0 while its centre is inside the frame and it is at least half opaque.
  // Returns [{wi, text, x, y, w, size, cx, cy, on, sounding}].
  line(ctx, t, li, o = {}) {
    const L = LYR.line(li);
    const { x = W / 2, y = H / 2, w = 1680, dim = null, active = null, align = 'center', ...rest } = o;
    const st = { font: FONT.sans, weight: 800, size: 96, fill: '#fff', ...rest };
    const boxes = TXT.layout(L.words, { x: 0, y: 0, w }, { ...st, wrap: false, fit: true, align: 'left', valign: 'top' });
    const total = boxes.length ? boxes[boxes.length - 1].x + boxes[boxes.length - 1].w : 0;
    const dx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    const sc = this.scale(ctx), m = ctx.getTransform(), alpha = ctx.globalAlpha * (st.opacity ?? 1);
    return boxes.map(b => {
      const wd = L.words[b.i], on = t >= wd.t0, sounding = on && t < wd.t1;
      const bx = { wi: b.i, text: b.text, x: b.x + dx, y, w: b.w, size: b.size, cx: b.cx + dx, cy: y + (b.cy - b.y), on, sounding };
      const fill = !on ? dim : sounding && active ? active : st.fill;
      if (fill) TXT.draw(ctx, bx.text, bx.x, y, { ...st, size: b.size, fill, align: 'left', baseline: 'alphabetic', upper: false });
      if (on && fill && alpha >= 0.5) {
        const px = m.a * bx.cx + m.c * bx.cy + m.e, py = m.b * bx.cx + m.d * bx.cy + m.f;
        if (px >= 0 && px <= W && py >= 0 && py <= H) this.mark(li, b.i, b.size * sc);
      }
      return bx;
    });
  },
};
