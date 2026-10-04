// 05_repetimos.js: chapter 5. Beats 169 to 196 (103.89 to 120.42 s), shots s045 to s054, lines 44 to 53.
//
// The fast half of verse 2. Chapter 4 was slow perfume serif over food; here the same straight face speeds up:
// tall condensed caps on her tomato bars, one line per cut, a punch on a kick in every shot. Then two reaction
// shots cut to a foreign film: letterbox bars, yellow subtitles, the censor's verdict in the top bar, an order
// ticket.
//
// Every shot is (or will be) a Seedance clip, so nothing here is pinned to plate pixels. Each line is a block
// of bars set in frame px, on top of the picture, in the corner the subject leaves free, with room around
// faces and hands. No type goes behind a matte: the picture under it moves.
//
// The vocal trails the first cuts and leads the later ones. A line's block comes on with its first word and
// stays until the next line's first word, so it rides over a cut in both directions: over the next picture
// while its last word is still being sung (lines 44 to 47), or a frame early on the last frame of the picture
// before (lines 49 to 51 and 53).
//
// Layout of the file: 1. cameras, 2. pictures, 3. the caps blocks, 4. REPETIMOS and its loop, 5. the film.

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;

// ---------------------------------------------------------------- 1. cameras

// No slow moves: a clip brings its own motion, and a plate still waiting for its clip gets the kit's default
// push. Each shot punches on the word that lands on its second kick.
const CAM_OF = {
  // the giant pizza: GRANDE on beat 170
  s045: t => ({ about: [0.45, 0.6], cam: CAM.punch(t, word(44, 1).t0, 0.05) }),
  // the stuffed crust: BORDES on beat 172
  s046: t => ({ about: [0.5, 0.5], cam: CAM.punch(t, word(45, 2).t0, 0.05) }),
  // one hand: CABE on beat 174
  s047: t => ({ about: [0.55, 0.45], cam: CAM.punch(t, word(46, 2).t0, 0.05) }),
  // two hands: DOS on beat 176, the grab on beat 177
  s048: t => ({ about: [0.5, 0.4], cam: CAM.punch(t, [word(47, 2).t0, B(177)], 0.05) }),
  // the drip: CHORREA on beat 178, and beat 179
  s049: t => ({ about: [0.5, 0.4], cam: CAM.punch(t, [word(48, 2).t0, B(179)], 0.045) }),
  // "la acerco MÁS": the one crash zoom of the chapter, into her mouth
  s050: t => ({ about: [0.43, 0.56], cam: CAM.crash(t, word(49, 2).t0, 1.2, 0.16) }),
  // the fridge: PARA on beat 183
  s051: t => ({ about: [0.45, 0.6], cam: CAM.punch(t, word(50, 3).t0, 0.05) }),
  // the wink: REPETIMOS, and again on each kick that follows
  s052: t => ({ about: [0.46, 0.4], cam: CAM.punch(t, [word(51, 3).t0, B(186), B(187)], 0.045) }),
  // the scandal: the frame takes the restamp on "gastronomico"
  s053: t => ({ about: [0.5, 0.45], cam: [CAM.punch(t, word(52, 4).t0, 0.05), CAM.shake(t, word(52, 4).t0, 12)] }),
  // two more: a punch on "due"
  s054: t => ({ about: [0.5, 0.45], cam: CAM.punch(t, word(53, 3).t0, 0.05) }),
};

// ---------------------------------------------------------------- 2. pictures

for (const sid of Object.keys(CAM_OF)) {
  SCENE({ id: `05.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}

// ---------------------------------------------------------------- 3. tall caps on tomato bars: lines 44 to 51

const CAPS = Object.freeze({ font: FACE.caps, weight: 400, upper: true, tracking: 0.005 });
const ACCENT = /[ÁÉÍÓÚÜÑ]/;

// setBlock(L, blk) -> one box per word: rows of words of line L as a block of bars.
//   blk: {x, y, w, rows: [[wi, ...], ...], align: 'left' | 'right', anchor: 'top' | 'bottom', max, sizes, gap}
//   A row is set as large as w takes, capped at max, or at sizes[r]. anchor 'top': y is the top of the block;
//   'bottom': y is its bottom. align 'right' pins the rows to x + w. A row with an accented capital gets a
//   taller bar. Each box: {wi, text, size, cx, cy} for the word and {bx, by, bw, bh} for its piece of the bar.
function setBlock(L, blk) {
  const rows = blk.rows.map((wis, r) => {
    const text = wis.map(i => L.words[i].w).join(' ');
    const size = (blk.sizes && blk.sizes[r]) || Math.min(blk.max ?? 999, TXT.fit(text, { w: blk.w }, CAPS));
    const st = { ...CAPS, size }, acc = ACCENT.test(text.toLocaleUpperCase('es'));
    return { wis, st, size, cap: TXT.capH(st), w: TXT.width(text, st), padT: (acc ? 0.3 : 0.16) * size, padB: 0.16 * size, padX: 0.15 * size };
  });
  const gap = blk.gap ?? 8;
  let h = 0;
  rows.forEach((r, i) => { r.top = h + (i ? gap : 0); h = r.top + r.padT + r.cap + r.padB; });
  const y0 = blk.anchor === 'bottom' ? blk.y - h : blk.y;
  const out = [];
  for (const r of rows) {
    const rw = r.w + 2 * r.padX, x0 = (blk.align === 'right' ? blk.x + blk.w - rw : blk.x) + r.padX;
    const base = y0 + r.top + r.padT + r.cap, sp = TXT.width(' ', r.st) + 2 * CAPS.tracking * r.size;
    r.wis.forEach((wi, k) => {
      const pre = r.wis.slice(0, k).map(i => L.words[i].w).join(' ');
      const x = x0 + (k ? TXT.width(pre + ' ', r.st) + CAPS.tracking * r.size : 0), w = TXT.width(L.words[wi].w, r.st);
      const l = x - (k ? sp / 2 : r.padX), rr = x + w + (k < r.wis.length - 1 ? sp / 2 : r.padX);
      out.push({ wi, text: L.words[wi].w, size: r.size, cx: x + w / 2, cy: base - r.cap / 2,
        bx: l - 0.5, by: y0 + r.top, bw: rr - l + 1, bh: r.padT + r.cap + r.padB });
    });
  }
  return out;
}

// bar(c, t, tHit, b): one word on its piece of bar, slammed on at tHit. Returns whether it drew.
// The word recoils after it lands; its bar does not, so the pieces of a row never show a seam.
function bar(c, t, tHit, b) {
  const lt = t - tHit;
  if (lt < 0) return false;
  const s = KIT.slam(lt, 1.3, 0.07), sb = Math.max(1, s);
  c.save();
  c.translate(b.cx, b.cy);
  c.fillStyle = PAL.tomato;
  c.fillRect((b.bx - b.cx) * sb, (b.by - b.cy) * sb, b.bw * sb, b.bh * sb);
  c.scale(s, s);
  TXT.draw(c, b.text, 0, 0, { ...CAPS, size: b.size, fill: PAL.mozz, align: 'center', baseline: 'center' });
  c.restore();
  return true;
}

// Each line's blocks, in the corners its picture leaves free.
const LINES = {
  // the waiters' faces run along the top and their hands hold the rim: bottom right, over the booth and the
  // tablecloth, stepped so the small first row stays clear of the hand on the rim
  44: { sid: 's045', blocks: [{ x: 1420, y: 1036, w: 440, rows: [[0], [1], [2, 3]], anchor: 'bottom', align: 'right', sizes: [96, 0, 0] }] },
  // hands on both sides and the cheese running out of the middle: top left, over the thumb
  45: { sid: 's046', blocks: [{ x: 60, y: 54, w: 720, rows: [[0, 1, 2], [3, 4]] }] },
  // the slice droops from the top right: bottom left, over the black corner
  46: { sid: 's047', blocks: [{ x: 60, y: 1030, w: 700, rows: [[0, 1, 2], [3, 4, 5]], anchor: 'bottom' }] },
  // fingers and nails are in the upper half: bottom left
  47: { sid: 's048', blocks: [{ x: 60, y: 1030, w: 660, rows: [[0, 1, 2], [3, 4]], anchor: 'bottom' }] },
  // the drip falls through the middle: a column in the black on the left
  48: { sid: 's049', blocks: [{ x: 60, y: 1030, w: 500, rows: [[0, 1], [2], [3, 4, 5]], anchor: 'bottom', sizes: [112, 0, 0] }] },
  // her face is left of centre and it is coming closer: a column on the right
  49: { sid: 's050', blocks: [{ x: 1360, y: 60, w: 500, rows: [[0, 1], [2], [3, 4, 5]], align: 'right', max: 250 }] },
  // the box sits low: top left, over the lid
  50: { sid: 's051', blocks: [{ x: 60, y: 50, w: 640, rows: [[0, 1, 2], [3, 4]] }] },
  // her face is left of centre: a column on the right. REPETIMOS sits lower, with room for its loop.
  51: { sid: 's052', blocks: [
    { x: 1240, y: 46, w: 540, rows: [[0, 1, 2]], sizes: [100] },
    { x: 1240, y: 234, w: 540, rows: [[3]] },
  ] },
};
const boxesOf = li => LINES[li].blocks.flatMap(blk => setBlock(LYR.line(li), blk));
// a line is on from its first word to the next line's first word; the last one leaves on its cut
const tOn = li => LYR.line(li).t0;
const tOff = li => (LINES[li + 1] ? LYR.line(li + 1).t0 : SHOT.t1(LINES[li].sid));

for (const li of [44, 45, 46, 47, 48, 49, 50]) {
  SCENE({ id: `05.caps${li}`, t0: tOn(li), t1: tOff(li), z: Z_GFX, draw(ctx, t) {
    for (const b of boxesOf(li)) if (bar(ctx, t, word(li, b.wi).t0, b)) LY.mark(li, b.wi, b.size);
  }});
}

// ---------------------------------------------------------------- 4. "La caliento y repetimos"

// loopAt(R, s) -> [x, y, angle]: the point at arc length s on the rounded rectangle R = {x, y, w, h, r}, and
// the direction of travel there. Clockwise from the left end of the top edge.
function loopLen(R) { return 2 * (R.w - 2 * R.r) + 2 * (R.h - 2 * R.r) + TAU * R.r; }
function loopAt(R, s) {
  const { x, y, w, h, r } = R, a = (Math.PI * r) / 2, ew = w - 2 * r, eh = h - 2 * r, P = loopLen(R);
  s = ((s % P) + P) % P;
  const arc = (cx, cy, a0, u) => [cx + r * Math.cos(a0 + u / r), cy + r * Math.sin(a0 + u / r), a0 + u / r + Math.PI / 2];
  if (s < ew) return [x + r + s, y, 0];
  s -= ew; if (s < a) return arc(x + w - r, y + r, -Math.PI / 2, s);
  s -= a; if (s < eh) return [x + w, y + r + s, Math.PI / 2];
  s -= eh; if (s < a) return arc(x + w - r, y + h - r, 0, s);
  s -= a; if (s < ew) return [x + w - r - s, y + h, Math.PI];
  s -= ew; if (s < a) return arc(x + r, y + h - r, Math.PI / 2, s);
  s -= a; if (s < eh) return [x, y + h - r - s, -Math.PI / 2];
  s -= eh; return arc(x + r, y + r, Math.PI, s);
}
// loopArrow(c, R, head, len, lw): a stroke `len` long that ends in an arrowhead at arc length `head`
function loopArrow(c, R, head, len, lw, color) {
  const hl = lw * 3.4, hw = lw * 2.1, n = Math.max(2, Math.ceil(len / 10));
  c.save();
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = lw; c.lineCap = 'butt'; c.lineJoin = 'round';
  c.beginPath();
  for (let i = 0; i <= n; i++) {
    const [px, py] = loopAt(R, head - hl * 0.55 - (len * (n - i)) / n);
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.stroke();
  const [hx, hy, ha] = loopAt(R, head - hl * 0.5);
  c.translate(hx, hy); c.rotate(ha);
  c.beginPath(); c.moveTo(hl * 0.5, 0); c.lineTo(-hl * 0.5, -hw); c.lineTo(-hl * 0.5, hw); c.closePath(); c.fill();
  c.restore();
}

// The word lands on "repetimos" and lands again under itself on each of the two kicks that follow. A loop
// arrow runs round the stack once per beat.
const REP = [word(51, 3).t0, B(186), B(187)];
SCENE({ id: '05.repetimos', t0: tOn(51), t1: tOff(51), z: Z_GFX, draw(ctx, t) {
  const boxes = boxesOf(51);
  for (const b of boxes.slice(0, 3)) if (bar(ctx, t, word(51, b.wi).t0, b)) LY.mark(51, b.wi, b.size);
  const r0 = boxes[3], pitch = r0.bh + 8;
  if (t < REP[0]) return;
  // the loop: round the rows that have landed, growing a row on each kick
  let rows = 0, k = 0;
  REP.forEach((th, i) => { if (t >= th) { rows += i ? EASE.outCubic(clamp((t - th) / 0.1)) : 1; k = i; } });
  const m = 34, lw = 15;
  const R = { x: r0.bx - m, y: r0.by - m, w: r0.bw + 2 * m, h: r0.bh + (rows - 1) * pitch + 2 * m, r: 54 };
  const P = loopLen(R), gapLen = 92, lap = EASE.outCubic(clamp((t - REP[k]) / 0.42));
  const rest = R.w / 2 - R.r;                          // the head rests at the middle of the top edge
  loopArrow(ctx, R, rest + P * lap, (P - gapLen) * (k ? 1 : lap), lw, PAL.cheese);
  REP.forEach((th, i) => {
    const b = { ...r0, by: r0.by + i * pitch, cy: r0.cy + i * pitch };
    if (bar(ctx, t, th, b)) LY.mark(51, 3, b.size);
  });
}});

// ---------------------------------------------------------------- 5. the asides: a foreign film

// The top bar carries the censor's verdict. OSCENO on "osceno?", struck on "No,", and the classification that
// opened the verse is slapped over it on "gastronomico".
const BAR_H = Math.round((H - W / 2.39) / 2);
function verdict(ctx, t) {
  const tA = word(52, 1).t0, tNo = word(52, 2).t0, tG = word(52, 4).t0, cy = BAR_H / 2;
  if (t < tA) return;
  const st = { font: FACE.caps, size: 92, tracking: 0.16, fill: PAL.mozz, upper: true };
  const s = KIT.slam(t - tA, 1.5, 0.08), w = TXT.width('OSCENO', st);
  ctx.save(); ctx.translate(W / 2, cy); ctx.scale(s, s);
  TXT.draw(ctx, 'OSCENO', 0, 0, { ...st, align: 'center', baseline: 'center' });
  ctx.restore();
  const u = clamp((t - tNo) / 0.09);
  if (u > 0) { ctx.fillStyle = PAL.tomato; ctx.fillRect(W / 2 - w / 2 - 22, cy - 7, (w + 44) * EASE.outCubic(u), 14); }
  KIT.slab(ctx, t, 'GASTRONOMICO', { x: W / 2, y: cy + 2, size: 96, rot: -0.03, bg: PAL.basil, ink: PAL.mozz, tHit: tG, from: 1.9, tracking: 0.04 });
}

// ticket(ctx, t, {x, y, w, tIn, tHit}): a kitchen order ticket that feeds out from under the top bar at tIn.
// The order itself, "2 ×", lands at tHit.
function ticket(ctx, t, o) {
  const { x, y, w = 400, tIn, tHit } = o;
  if (t < tIn) return;
  const D = 400, k = w / D, pad = 30;
  const feed = (t0, d) => EASE.outCubic(clamp((t - t0) / d));
  const hHead = 122, hBody = 322, h = hHead * feed(tIn, 0.12) + hBody * feed(tHit - 0.1, 0.1);
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = PAL.mozz;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(D, 0); ctx.lineTo(D, h);
  const teeth = 20;
  for (let i = teeth; i >= 0; i--) ctx.lineTo((D * i) / teeth, h + (i % 2 ? 12 : 0));
  ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, D, h); ctx.clip();
  const mono = { font: FACE.mono, weight: 700, size: 32, fill: PAL.patent };
  TXT.draw(ctx, 'COMANDA', pad, 64, mono);
  TXT.draw(ctx, 'MESA 4', D - pad, 64, { ...mono, weight: 500, align: 'right' });
  ctx.fillStyle = PAL.patent;
  for (let dx = pad; dx < D - pad; dx += 14) ctx.fillRect(dx, 96, 8, 3);
  if (t >= tHit) {
    const big = { font: FACE.caps, size: 230, fill: PAL.patent }, s = KIT.slam(t - tHit, 1.6, 0.08);
    ctx.save(); ctx.translate(D / 2, 232); ctx.scale(s, s);
    TXT.draw(ctx, '2 ×', 0, 0, { ...big, align: 'center', baseline: 'center' });
    ctx.restore();
    TXT.draw(ctx, 'PIZZA', D / 2, 408, { font: FACE.caps, size: 76, tracking: 0.12, fill: PAL.patent, align: 'center' });
  }
  ctx.restore();
  ctx.restore();
}

SCENE({ id: '05.film', t0: SHOT.t0('s053'), t1: SHOT.t1('s054'), z: Z_GFX, draw(ctx, t) {
  KIT.bars(ctx, t, {});
  if (t < SHOT.t1('s053')) verdict(ctx, t);
  else ticket(ctx, t, { x: 1470, y: BAR_H, w: 380, tIn: word(53, 2).t0, tHit: word(53, 3).t0 });
  // "Che" is sung a frame before the cut to s054: the subtitle changes there and rides over the cut
  KIT.subtitle(ctx, t, 52, { y: 900, tOut: word(53, 0).t0 });
  KIT.subtitle(ctx, t, 53, { y: 900, tOut: SHOT.t1('s054') });
}});
