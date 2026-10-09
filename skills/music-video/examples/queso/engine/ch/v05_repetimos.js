// v05_repetimos.js: the fast half of verse 2 as a vertical cut, 1080 x 1920, for TikTok and Reels. Beat 169 to
// beat 196 (103.89 to 120.42 s), shots s045 to s054, lines 44 to 53, then an end card to beat 200 (122.87 s).
// The 16:9 chapter it re-lays is 05_repetimos.js. Every scene here is a proof scene: this file draws only when
// it is picked, in a tall frame:
//
//   cd engine && VIDEO_PROJECT=queso ../.venv/bin/python render.py video 103.89:122.87 --size 1080x1920 --ch v05 \
//       --no-audio --out ../queso/media/scratch/vertical-v05/video.mp4
//
// How the tall frame is used (the pattern is v01_coro1.js):
//   1. The picture fills the frame. A 16:9 clip gives a tall frame a slice 31.6% of its width, so each shot
//      names the point of the picture that sits in the middle (CAM_OF), and moves it where the action moves:
//      s048 whips from one hand to the other on "dos", s051 drifts along the leftovers toward the hand that
//      comes for them, s053 whips from the grandmother to the waiter on "No,", s054 leans from the napkin to
//      the two fingers.
//   2. The interface of TikTok and Reels covers the top 220 px, the bottom 480 px and the right 150 px. Type
//      and everything pinned stays inside SAFE. Footage runs under.
//   3. The lyric surface is the film's: tall condensed caps on tomato bars, one line per cut, each word slammed
//      on at its own time, in the part of the frame the food leaves free. Three shots split on a seam, as
//      s003 and s006 do in v01. s045: the two waiters and the whole pizza are a wide picture, so they take the
//      lower part and a close view of the same pizza carries the line above them. s050 and s052 are her face:
//      it takes the upper part and the line sits below it, on the tablecloth and on the oven of the same clip.
//   4. The two asides are a foreign film, as in the film: yellow subtitles, set in two rows so they read on a
//      phone, over a picture that keeps the whole frame. Section 6 says why this cut has no letterbox bars.
//   5. The lockup stays in the right corner for the whole cut: every line that sits at the top sits on the
//      left, and every face is framed left of it.

if (W >= H) {
  if (ENGINE.picked.length) throw new Error('v05_repetimos.js is a vertical cut: render it with --size 1080x1920');
  return;
}

const MARK = '@saindra_ofc';   // the watermark, and the handle on the end card

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;
const T_IN = B(169), T_CARD = B(196), T_OUT = B(200);
const SCENE_V = def => SCENE({ ...def, proof: true });   // never in a film render

// ---------------------------------------------------------------- the frame

const SAFE = { x0: 0, y0: 220, x1: W - 150, y1: H - 480 };
const COL = { x: 48, w: SAFE.x1 - 6 - 48 };     // the type column, x 48 to 924
const FLOOR = SAFE.y1 - 8;                      // the lowest edge of a surface
// a split frame: the two boxes above and below a seam
const split = seam => ({ seam, top: { x: 0, y: 0, w: W, h: seam }, bot: { x: 0, y: seam, w: W, h: H - seam } });
const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));
const rule = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
// a value that goes from a to b between two times
const ramp = (a, b, t, t0, t1, ease = EASE.inOutCubic) => lerp(a, b, ease(clamp((t - t0) / (t1 - t0))));

// ---------------------------------------------------------------- 1. cameras

// A clip laid to cover the tall frame is IW x IH px. view() gives SHOT.draw the options that put the picture
// point (fx, fy), 0..1, on the frame point (tx, ty) at `zoom`; a punch then zooms about that point.
const S0 = Math.max(W / 1920, H / 1080), IW = 1920 * S0, IH = 1080 * S0;
const view = ({ fx = 0.5, fy = 0.5, zoom = 1, tx = W / 2, ty = H / 2, cam = null }) => ({
  about: [fx, fy], cam,
  move: { zoom, x: tx - W / 2 - (fx - 0.5) * IW, y: ty - H / 2 - (fy - 0.5) * IH },
});

const WHIP_48 = [B(175.75), B(176)];            // s048: from her left hand to her right, landing on "dos"
const WHIP_53 = [B(189.75), B(190)];            // s053: from the grandmother to the waiter, leaving on "No,"
const CAM_OF = {
  // the stuffed crust: the torn end and the cheese that runs out of it. BORDES on beat 172.
  s046: t => view({ fx: 0.58, cam: CAM.punch(t, word(45, 2).t0, 0.05) }),
  // one hand: her fingers on top, the slice hanging off the palm. CABE on beat 174.
  s047: t => view({ fx: ramp(0.73, 0.77, t, B(173), B(175), EASE.inOutSine), cam: CAM.punch(t, word(46, 2).t0, 0.05) }),
  // two hands: one, then the other
  s048: t => view({ fx: ramp(0.16, 0.76, t, WHIP_48[0], WHIP_48[1]), cam: CAM.punch(t, [B(176), B(177)], 0.05) }),
  // the drip: the sauce on her fingers and everything that falls from it
  s049: t => view({ fx: 0.488, fy: 0.45, cam: CAM.punch(t, [word(48, 2).t0, B(179)], 0.045) }),
  // the fridge: the leftovers, and a slow drift toward the hand that comes for them
  s051: t => view({ fx: ramp(0.30, 0.42, t, B(182.5), B(184), EASE.inOutSine), fy: 0.55, cam: CAM.punch(t, word(50, 3).t0, 0.05) }),
  // the scandal: she gasps on "osceno?", he peeks through his fingers on "gastronomico"
  s053: t => view({ fx: ramp(0.33, 0.745, t, WHIP_53[0], WHIP_53[1]), fy: 0.3, cam: CAM.punch(t, word(52, 4).t0, 0.04) }),
  // two more: her face, with the napkin on its left and then the two fingers on its right
  s054: t => view({ fx: ramp(0.47, 0.495, t, B(193.25), B(194)), fy: 0.35, cam: CAM.punch(t, word(53, 3).t0, 0.04) }),
  // under the end card: her despair, the next shot of the film. Her eyes stand above the slab.
  s055: t => view({ fx: 0.445, fy: 0.327, zoom: ramp(1.26, 1.3, t, T_CARD, T_OUT, EASE.linear), ty: 300 }),
};

// crop(ctx, sid, t, box, {fx, fy, zoom, tx, ty, cam}): the shot's clip in a box of the frame, with the picture
// point (fx, fy) on the box's centre (or on tx, ty), as far as the picture's edges allow.
function crop(ctx, sid, t, box, o = {}) {
  const { fx = 0.5, fy = 0.5, tx = box.x + box.w / 2, ty = box.y + box.h / 2 } = o;
  const cam = CAM.mix(o.cam || []), pic = SHOT.at(sid, t), zoom = (o.zoom || 1) * cam.zoom;
  const s = Math.max(box.w / 1920, box.h / 1080) * zoom, iw = 1920 * s, ih = 1080 * s;
  const mx = (iw - box.w) / 2, my = (ih - box.h) / 2;
  const x = clamp(tx - (box.x + box.w / 2) - (fx - 0.5) * iw + cam.x, -mx, mx);
  const y = clamp(ty - (box.y + box.h / 2) - (fy - 0.5) * ih + cam.y, -my, my);
  ctx.save();
  ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  if (pic.kind === 'clip') MEDIA.drawClip(ctx, pic.name, pic.lt, { box, zoom, x, y });
  else MEDIA.drawPlate(ctx, pic.name, { box, zoom, x, y });
  ctx.restore();
}
// the line between the two halves of a split frame
const seam = (ctx, y) => rule(ctx, 0, y - 4, W, 8, PAL.mozz);

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s046', 's047', 's048', 's049', 's051', 's053', 's054']) {
  SCENE_V({ id: `v05.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}
SCENE_V({ id: 'v05.s055', t0: T_CARD, t1: T_OUT, z: 0, draw(ctx, t) { SHOT.draw(ctx, 's055', t, CAM_OF.s055(t)); } });

// s045, split high. Bottom: both waiters and the whole pizza, the wide picture the joke needs. Top: the same
// pizza close, under the line. GRANDE on beat 170.
const S45 = split(860);
SCENE_V({ id: 'v05.s045', t0: T_IN, t1: SHOT.t1('s045'), z: 0, draw(ctx, t) {
  const cam = CAM.punch(t, word(44, 1).t0, 0.05);
  crop(ctx, 's045', t, S45.top, { fx: 0.47, fy: 0.74, zoom: 1.5, cam });
  crop(ctx, 's045', t, S45.bot, { fx: 0.527, fy: 0.5, cam });
  seam(ctx, S45.seam);
}});

// s050, the slice's point of view. Top: her face comes at the lens, and the film's one crash zoom goes into
// her mouth on "más". Bottom: the tablecloth and the candle beside her, under the line.
const S50 = split(880);
SCENE_V({ id: 'v05.s050', t0: SHOT.t0('s050'), t1: SHOT.t1('s050'), z: 0, draw(ctx, t) {
  crop(ctx, 's050', t, S50.top, { fx: 0.43, fy: 0.6, tx: 365, ty: 528, cam: CAM.crash(t, word(49, 2).t0, 1.2, 0.16) });
  crop(ctx, 's050', t, S50.bot, { fx: 0.06, fy: 0.72, zoom: 2.0 });
  seam(ctx, S50.seam);
}});

// s052, the wink. Top: her, and the reheated slice on its plate, which she brings from the right edge to the
// middle: the crop is wide enough to hold both from the first frame to the last. Bottom: the oven of the same
// clip, where REPETIMOS piles up.
const S52 = split(880);
SCENE_V({ id: 'v05.s052', t0: SHOT.t0('s052'), t1: SHOT.t1('s052'), z: 0, draw(ctx, t) {
  crop(ctx, 's052', t, S52.top, { fx: ramp(0.598, 0.6135, t, B(184), B(186), EASE.inOutSine), fy: 0.4945, zoom: 1.1, cam: CAM.punch(t, [word(51, 3).t0, B(186), B(187)], 0.03) });
  crop(ctx, 's052', t, S52.bot, { fx: 0.16, fy: 0.6, zoom: 1.9 });
  seam(ctx, S52.seam);
}});

// ---------------------------------------------------------------- 3. the title lockup and the watermark

// At the top of SAFE for the whole cut, in the right corner: her name in the film's book italic, the QUESO
// slab beside it, and the handle under them, faint, with the thin dark edge the film's watermark has. Every
// line that sits at the top of this cut sits on the left, and every face is framed left of it.
const LOCK = { y: 284, name: 46, slab: 50, gap: 16, markY: 330, markSize: 28, alpha: 0.55 };
SCENE_V({ id: 'v05.marca', t0: T_IN, t1: T_CARD, z: 100, draw(ctx, t) {
  const st = { font: FACE.book, italic: true, weight: 500, size: LOCK.name, fill: PAL.mozz, stroke: PAL.patent, strokeWidth: 5 };
  const nw = TXT.width('Saindra', st);
  const sw = TXT.width('QUESO', { font: FACE.caps, size: LOCK.slab, tracking: 0.01 }) + 2 * 0.17 * LOCK.slab;
  const x = COL.x + COL.w - (nw + LOCK.gap + sw);
  TXT.draw(ctx, 'Saindra', x, LOCK.y, st);
  KIT.slab(ctx, t, 'QUESO', { x: x + nw + LOCK.gap + sw / 2, y: LOCK.y - TXT.capH(st) / 2, size: LOCK.slab, rot: -0.035, from: 1 });
  ctx.save();
  ctx.globalAlpha *= LOCK.alpha;
  TXT.draw(ctx, MARK, COL.x + COL.w - 2, LOCK.markY, { font: FACE.sans, weight: 600, size: LOCK.markSize, tracking: 0.04, fill: PAL.mozz, stroke: PAL.patent, strokeWidth: 4, align: 'right' });
  ctx.restore();
}});

// ---------------------------------------------------------------- 4. tall caps on tomato bars: lines 44 to 51

const CAPS = Object.freeze({ font: FACE.caps, weight: 400, upper: true, tracking: 0.005 });
const ACCENT = /[ÁÉÍÓÚÜÑ]/;

// setBlock(L, blk) -> one box per word: rows of words of line L as a block of bars. From 05_repetimos.js.
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

// Each line's blocks, in the part of its picture the subject leaves free. A line whose first word is sung
// before its cut has `pre`: where that word stands on the picture before, for the frame it is there.
const LINES = {
  // the close pizza of the upper part: GRANDE as large as the part takes, clear of the lockup on the right
  44: { sid: 's045', blocks: [{ x: COL.x, y: 240, w: 700, rows: [[0], [1], [2, 3]], sizes: [104, 0, 120] }] },
  // the crust and the cheese fill the upper two thirds: at the foot, over the strings
  45: { sid: 's046', blocks: [{ x: COL.x, y: FLOOR, w: 800, rows: [[0, 1, 2], [3, 4]], anchor: 'bottom' }] },
  // her fingers are at the top and the slice hangs through the middle: at the foot, over the palm
  46: { sid: 's047', blocks: [{ x: COL.x, y: FLOOR, w: 720, rows: [[0, 1, 2], [3, 4, 5]], anchor: 'bottom' }] },
  // the hands and their nails are in the upper half on both sides of the whip: at the foot
  47: { sid: 's048', blocks: [{ x: COL.x, y: FLOOR, w: 760, rows: [[0, 1, 2], [3, 4]], anchor: 'bottom' }] },
  // the drips fall on both sides of a black gap: a column in the gap
  48: { sid: 's049', blocks: [{ x: 516, y: FLOOR, w: 384, rows: [[0, 1], [2], [3, 4], [5]], anchor: 'bottom', align: 'right', sizes: [100, 0, 100, 100] }] },
  // the tablecloth of the lower part
  49: { sid: 's050', blocks: [{ x: COL.x, y: 902, w: 560, rows: [[0, 1], [2], [3, 4, 5]], sizes: [108, 196, 108] }] },
  // the pizza lies low in the fridge: above it, on the back wall
  50: { sid: 's051', blocks: [{ x: COL.x, y: 364, w: 640, rows: [[0, 1, 2], [3, 4]] }],
    pre: [{ x: COL.x, y: 902, w: 640, rows: [[0, 1, 2], [3, 4]] }] },
  // the oven of the lower part. REPETIMOS sits lower, with room for its loop.
  51: { sid: 's052', blocks: [
    { x: COL.x, y: 890, w: 520, rows: [[0, 1, 2]], sizes: [72] },
    { x: COL.x + 26, y: 1028, w: 520, rows: [[3]], sizes: [98] },
  ] },
};
const boxesOf = (li, t = Infinity) => (t < SHOT.t0(LINES[li].sid) && LINES[li].pre || LINES[li].blocks).flatMap(blk => setBlock(LYR.line(li), blk));
// a line is on from its first word to the next line's first word; the last one leaves on its cut
const tOn = li => LYR.line(li).t0;
const tOff = li => (LINES[li + 1] ? LYR.line(li + 1).t0 : SHOT.t1(LINES[li].sid));

for (const li of [44, 45, 46, 47, 48, 49, 50]) {
  SCENE_V({ id: `v05.caps${li}`, t0: tOn(li), t1: tOff(li), z: Z_GFX, draw(ctx, t) {
    for (const b of boxesOf(li, t)) if (bar(ctx, t, word(li, b.wi).t0, b)) LY.mark(li, b.wi, b.size);
  }});
}

// ---------------------------------------------------------------- 5. "La caliento y repetimos"

// loopAt(R, s) -> [x, y, angle]: the point at arc length s on the rounded rectangle R = {x, y, w, h, r}, and
// the direction of travel there. Clockwise from the left end of the top edge. From 05_repetimos.js.
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
  const hl = lw * 3.2, hw = lw * 1.8, n = Math.max(2, Math.ceil(len / 10));
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
SCENE_V({ id: 'v05.repetimos', t0: tOn(51), t1: tOff(51), z: Z_GFX, draw(ctx, t) {
  const boxes = boxesOf(51);
  for (const b of boxes.slice(0, 3)) if (bar(ctx, t, word(51, b.wi).t0, b)) LY.mark(51, b.wi, b.size);
  const r0 = boxes[3], pitch = r0.bh + 8;
  if (t < REP[0]) return;
  // the loop: round the rows that have landed, growing a row on each kick
  let rows = 0, k = 0;
  REP.forEach((th, i) => { if (t >= th) { rows += i ? EASE.outCubic(clamp((t - th) / 0.1)) : 1; k = i; } });
  const m = 26, lw = 13;
  const R = { x: r0.bx - m, y: r0.by - m, w: r0.bw + 2 * m, h: r0.bh + (rows - 1) * pitch + 2 * m, r: 46 };
  const P = loopLen(R), gapLen = 80, lap = EASE.outCubic(clamp((t - REP[k]) / 0.42));
  const rest = R.w / 2 - R.r;                          // the head rests at the middle of the top edge
  loopArrow(ctx, R, rest + P * lap, (P - gapLen) * (k ? 1 : lap), lw, PAL.cheese);
  REP.forEach((th, i) => {
    const b = { ...r0, by: r0.by + i * pitch, cy: r0.cy + i * pitch };
    if (bar(ctx, t, th, b)) LY.mark(51, 3, b.size);
  });
}});

// ---------------------------------------------------------------- 6. the asides: a foreign film

// The film puts these two shots under letterbox bars. In a tall frame two bars leave a strip of picture, and
// one bar under the picture leaves the lower third of the phone black, so this cut has none: the faces keep
// the whole frame. What says "foreign film" here is the subtitle, in the film's yellow italic with its black
// edge, in two rows at the foot of SAFE. The film's top bar carried the censor's verdict and the order ticket
// hung from it. Here both stand on the line just above the subtitle: the verdict as the censor's own black
// bar, on the left, and the ticket printing upward on the right, under her two fingers.
const FILM = { x: W / 2, size: 82, w: 760, lead: 1.22 };
FILM.y = FLOOR - 0.55 * FILM.size;                              // baseline of the last row
FILM.top = FILM.y - FILM.lead * FILM.size - 0.98 * FILM.size;   // the line the verdict and the ticket stand on

// subs(ctx, t, li, rows, {tOut}): a film subtitle in rows of words, each word on at its own time
function subs(ctx, t, li, rows, o = {}) {
  const L = LYR.line(li), tOut = o.tOut ?? L.t1 + 0.5;
  if (t < L.t0 || t >= tOut) return;
  const text = r => r.map(i => L.words[i].w).join(' ');
  const size = Math.min(FILM.size, ...rows.map(r => TXT.fit(text(r), { w: FILM.w }, STY.sub)));
  const st = { ...STY.sub, size, strokeWidth: size * 0.115 };
  rows.forEach((r, k) => {
    const x0 = FILM.x - TXT.width(text(r), st) / 2, y = FILM.y - (rows.length - 1 - k) * size * FILM.lead;
    r.forEach((wi, j) => {
      if (t < L.words[wi].t0) return;
      TXT.draw(ctx, L.words[wi].w, x0 + (j ? TXT.width(text(r.slice(0, j)) + ' ', st) : 0), y, st);
      mark(ctx, li, wi, size);
    });
  });
}

// verdict(ctx, t, {x, y, size}): the censor's bar, a black block that stands on y at x. OSCENO on "osceno?",
// struck on "No,", and GASTRONOMICO is slapped over it on "gastronomico".
function verdict(ctx, t, o) {
  const { x, y, size = 66 } = o;
  const tA = word(52, 1).t0, tNo = word(52, 2).t0, tG = word(52, 4).t0;
  if (t < tA) return;
  const st = { font: FACE.caps, size, tracking: 0.16, fill: PAL.mozz, upper: true };
  const w = TXT.width('OSCENO', st), padX = 0.4 * size, h = TXT.capH(st) + 0.5 * size, cx = x + padX + w / 2, cy = y - h / 2;
  if (t < tG) {                                        // the slab takes the bar's place when it lands
    const s = KIT.slam(t - tA, 1.5, 0.08), bw = w + 2 * padX;
    ctx.save(); ctx.translate(x, cy); ctx.scale(s, s);   // both land from the left edge, so neither leaves the frame
    rule(ctx, 0, -h / 2, bw, h, '#000');
    TXT.draw(ctx, 'OSCENO', bw / 2 + 0.08 * size, 0, { ...st, align: 'center', baseline: 'center' });
    ctx.restore();
    const u = clamp((t - tNo) / 0.09);
    if (u > 0) rule(ctx, cx - w / 2 - 12, cy - 5, (w + 24) * EASE.outCubic(u), 10, PAL.tomato);
    return;
  }
  const gs = size * 1.1, gw = TXT.width('GASTRONOMICO', { font: FACE.caps, size: gs, tracking: 0.04 }) + 2 * 0.17 * gs;
  KIT.slab(ctx, t, 'GASTRONOMICO', { x: x + (gw / 2) * KIT.slam(t - tG, 1.9), y: cy, size: gs, rot: -0.03, bg: PAL.basil, ink: PAL.mozz, tHit: tG, from: 1.9, tracking: 0.04, padY: 0.2 });
}

// ticket(ctx, t, {x, y, w, tIn, tHit}): a kitchen order ticket that prints upward from the line y. The head
// comes at tIn, the order itself, "2 ×", lands at tHit. After the film's ticket, which hung from the top bar.
function ticket(ctx, t, o) {
  const { x, y, w = 400, tIn, tHit } = o;
  if (t < tIn) return;
  const D = 400, k = w / D, pad = 30;
  const feed = (t0, d) => EASE.outCubic(clamp((t - t0) / d));
  const hHead = 122, hBody = 322, h = hHead * feed(tIn, 0.12) + hBody * feed(tHit - 0.1, 0.1);
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k); ctx.translate(0, -h);
  ctx.fillStyle = PAL.mozz;
  ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(D, h); ctx.lineTo(D, 0);
  const teeth = 20;
  for (let i = teeth; i >= 0; i--) ctx.lineTo((D * i) / teeth, i % 2 ? -12 : 0);
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

SCENE_V({ id: 'v05.film', t0: SHOT.t0('s053'), t1: SHOT.t1('s054'), z: Z_GFX, draw(ctx, t) {
  if (t < SHOT.t1('s053')) verdict(ctx, t, { x: COL.x, y: FILM.top });
  else ticket(ctx, t, { x: 602, y: FILM.top, w: 320, tIn: word(53, 2).t0, tHit: word(53, 3).t0 });
  // "Che" is sung a frame before the cut to s054: the subtitle changes there and rides over the cut
  subs(ctx, t, 52, [[0, 1], [2, 3, 4]], { tOut: word(53, 0).t0 });
  subs(ctx, t, 53, [[0, 1], [2, 3]], { tOut: SHOT.t1('s054') });
}});

// ---------------------------------------------------------------- 7. the end card

// Beats 196 to 200, as in v01. Her telenovela despair, the next shot of the film, plays under a dark veil.
// QUESO as the label's slab, her name under it, then the date and where to hear it in the film's small
// tracked capitals, and the handle.
const CREDIT = { font: FACE.sans, weight: 700, upper: true, tracking: 0.16, fill: PAL.mozz, align: 'center' };
const CARD = { x: W / 2, y: 650, size: 272, veil: 0.66 };
SCENE_V({ id: 'v05.fin', t0: T_CARD, t1: T_OUT, z: Z_GFX, draw(ctx, t) {
  ctx.save(); ctx.globalAlpha *= CARD.veil; rule(ctx, 0, 0, W, H, PAL.patent); ctx.restore();
  const r = KIT.slab(ctx, t, 'QUESO', { x: CARD.x, y: CARD.y, size: CARD.size, rot: -0.035, from: 1 });
  const yName = CARD.y + r.h / 2 + CARD.size * 0.4;
  if (t >= B(196.5)) TXT.draw(ctx, 'Saindra', CARD.x, yName, { font: FACE.book, italic: true, weight: 500, size: CARD.size * 0.34, fill: PAL.mozz, align: 'center' });
  if (t >= B(197)) TXT.draw(ctx, '14 de octubre', CARD.x, yName + 150, { ...CREDIT, size: 58 });
  if (t >= B(197.5)) {
    TXT.draw(ctx, 'En todas las plataformas', CARD.x, yName + 216, { ...CREDIT, size: 34 });
    TXT.draw(ctx, MARK, CARD.x, yName + 292, { font: FACE.sans, weight: 600, size: 34, tracking: 0.04, fill: PAL.mozz, opacity: 0.85, align: 'center' });
  }
}});
