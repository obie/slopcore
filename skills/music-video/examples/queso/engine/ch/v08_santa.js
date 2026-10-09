// v08_santa.js: the final chorus as a vertical cut, 1080 x 1920, for TikTok and Reels. Beat 300 to beat 333
// (184.09 to 204.30 s), shots s081 to s088, lines 80 to 87, then an end card to beat 337 (206.75 s).
// The 16:9 chapter it re-lays is 08_santa.js; the pattern it follows is v01_coro1.js. Every scene here is a
// proof scene: this file draws only when it is picked, in a tall frame:
//
//   cd engine && VIDEO_PROJECT=queso ../.venv/bin/python render.py video 184.09:206.75 --size 1080x1920 --ch v08 \
//       --no-audio --out ../queso/media/scratch/vertical-v08/video.mp4
//
// How the tall frame is used:
//   1. Same clips, in-points and warps as the film: every picture goes through SHOT.at, which reads edl.json.
//      A 16:9 clip gives a tall frame a slice 31.6% of its width, so each full-frame shot names the point of the
//      picture that sits in the middle (CAM_OF) and moves it where the action moves.
//   2. The interface of TikTok and Reels covers the top 220 px, the bottom 480 px and the right 150 px. Type
//      and everything pinned stays inside SAFE. Footage and gold run under.
//   3. The two Guadalupe shots are the tall ones. s081 is the film's retablo stood on end: the frame is gold,
//      she sings in an arched niche that takes the upper half, and the label's two leaves sit under the niche
//      as the altarpiece's predella. s085 is a prayer card: the whole mandorla, edge to edge, between two gold
//      bands, with the label as a gold panel across the foot of her mantle.
//   4. The wide shots. The conga (s082) is one slice that starts on her and travels back along the line between
//      beats 305 and 307, so the line is in frame when its rows report in at 100%. The bites (s083) and the
//      kisses (s084) split on a seam, as v01 splits its close-ups: the whole 16:9 picture in the upper part,
//      a close crop of the same clip under it, and the surface on the lower part. The scooter (s088) is one
//      slice on her, the boxes and the body of the scooter; the front wheel is given up.
//   5. A lyric surface sits where the slice leaves room: in the lower band of SAFE on the column COL (the altar
//      panel, the lid, her counter), beside a head (his panel), or on the lower part of a split.
//   6. The clip of the second bite (F83b-t1) had one white frame, a flash, at 189.72 s. That frame is now the
//      average of its neighbours (tools/flashscan.py), in the film and in this cut.

if (W >= H) {
  if (ENGINE.picked.length) throw new Error('v08_santa.js is a vertical cut: render it with --size 1080x1920');
  return;
}

const MARK = '@saindra_ofc';   // the watermark, and the handle on the end card

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const P = PAL, F = FACE;
const Z_GFX = 10, FRAME = 1 / 24;
// a render of 184.09:206.75 starts a few milliseconds before beat 300: the first scenes open half a frame early
const T_IN = B(300) - FRAME / 2, T_CARD = B(333), T_OUT = B(337);
const Q1 = word(80, 4).t0, Q2 = word(84, 4).t0, TOTAL = B(331);
const SCENE_V = def => SCENE({ ...def, proof: true });   // never in a film render

// ---------------------------------------------------------------- the frame

const SAFE = { x0: 0, y0: 220, x1: W - 150, y1: H - 480 };
const COL = { x: 48, w: SAFE.x1 - 6 - 48 };     // the type column, x 48 to 924
const FLOOR = SAFE.y1 - 8;                      // the lowest edge of a surface
// a split frame: the two boxes above and below a seam
const split = seam => ({ seam, top: { x: 0, y: 0, w: W, h: seam }, bot: { x: 0, y: seam, w: W, h: H - seam } });
const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));
const rule = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
const capFirst = s => s.charAt(0).toLocaleUpperCase('es') + s.slice(1);
// a value that goes from a to b between two times
const ramp = (a, b, t, t0, t1, ease = EASE.inOutCubic) => lerp(a, b, ease(clamp((t - t0) / (t1 - t0))));

// the label's faces, as the kit and 08_santa.js set them
const SM = { font: F.sans, weight: 800, tracking: -0.02 };       // "No es", "es"
const HV = { font: F.sans, weight: 900, tracking: -0.025 };      // the struck name, the rows
const TT = { font: F.sans, weight: 900, tracking: -0.035 };      // Información Nutricional
const QS = { font: F.caps, tracking: 0.01, upper: true };        // QUESO

// ---------------------------------------------------------------- ornaments (from 08_santa.js)

// a flat five-point star, centre x, y, outer radius R
function star(ctx, x, y, R, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot - Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? R * 0.42 : R;
    ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
  }
  ctx.closePath(); ctx.fill();
}

// a rose of pepperoni: five slices round a centre, each outlined
function rose(ctx, x, y, r, line = P.patent) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.tomato; ctx.strokeStyle = line; ctx.lineWidth = Math.max(2, r * 0.075);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * TAU) / 5;
    ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.55, 0, TAU); ctx.fill(); ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * TAU) / 3;
    ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2, r * 0.36, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// pointed rays round (cx, cy): bases on the ellipse rx, ry, tips len(i) further out, from angle a0 to a1
function rays(ctx, cx, cy, rx, ry, a0, a1, n, len, half = 0.02) {
  for (let i = 0; i < n; i++) {
    const a = n > 1 ? lerp(a0, a1, i / (n - 1)) : (a0 + a1) / 2, l = len(i);
    if (l <= 0) continue;
    const c = Math.cos(a), s = Math.sin(a), bx = cx + c * rx, by = cy + s * ry, R = Math.hypot(c * rx, s * ry);
    const hw = half * R;
    ctx.beginPath();
    ctx.moveTo(bx + s * hw, by - c * hw);
    ctx.lineTo(bx + c * l, by + s * l);
    ctx.lineTo(bx - s * hw, by + c * hw);
    ctx.closePath(); ctx.fill();
  }
}

// font size at which KIT.slab sets `text` on a block w wide (its padding is 0.17 em a side)
const slabSize = (text, w) => w / (TXT.width(text, { ...QS, size: 100 }) / 100 + 0.34);
const slabH = size => TXT.capH({ ...QS, size }) + 0.3 * size;

// speckle tile for stamped ink: hard-edged dropouts
const SPECK = CANVAS.make(256, 256);
(() => {
  const g = SPECK.ctx, r = rnd(808);
  g.fillStyle = '#000'; g.strokeStyle = '#000';
  for (let i = 0; i < 150; i++) {
    const s = r.range(1.2, 5.5);
    g.beginPath(); g.ellipse(r.range(0, 256), r.range(0, 256), s, s * r.range(0.4, 1), r.range(0, TAU), 0, TAU); g.fill();
  }
  g.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    const x = r.range(0, 256), y = r.range(0, 256), a = r.range(0, TAU), l = r.range(10, 34);
    g.lineWidth = r.range(1, 2.4);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
})();

// ---------------------------------------------------------------- 1. cameras

// A clip laid to cover the tall frame is IW x IH px. view() gives SHOT.draw the options that put the picture
// point (fx, fy), 0..1, on the frame point (tx, ty) at `zoom`; a punch then zooms about that point.
const S0 = Math.max(W / 1920, H / 1080), IW = 1920 * S0, IH = 1080 * S0;
const view = ({ fx = 0.5, fy = 0.5, zoom = 1, tx = W / 2, ty = H / 2, cam = null }) => ({
  about: [fx, fy], cam,
  move: { zoom, x: tx - W / 2 - (fx - 0.5) * IW, y: ty - H / 2 - (fy - 0.5) * IH },
});

const T_PAN = [B(305), B(307)];                 // s082: from her, back along the line
const CAM_OF = {
  // the conga: her under the pizza, then the slice travels back along the line; a pump on every kick
  s082: t => view({ fx: ramp(0.405, 0.468, t, T_PAN[0], T_PAN[1], EASE.inOutSine), fy: 0.3, ty: 0.3 * H, cam: CAM.beat(t, 0.022) }),
  // out the door: her and the tower, then she walks into the middle of the doorway
  s086: t => view({ fx: ramp(0.452, 0.478, t, B(320.5), B(322)), fy: 0.3, ty: 0.3 * H, cam: CAM.punch(t, [word(85, 2).t0, word(85, 4).t0], 0.04) }),
  // him at the window, on the right of the slice: nothing moves
  s087: t => view({ fx: 0.406 }),
  // the scooter: her, the boxes and the red body; the frame takes the final total
  s088: t => view({ fx: 0.46, fy: 0.3, ty: 0.3 * H, cam: [CAM.punch(t, TOTAL, 0.05), CAM.shake(t, TOTAL, 14)] }),
  // under the end card: the chairs up, the last pizza, and her hand coming for the lens. Her face stays out of
  // the slice, so the card's type never lies on it.
  s089: t => view({ fx: 0.3, fy: 0.5, zoom: ramp(1.02, 1.06, t, T_CARD, T_OUT, EASE.linear) }),
};

// crop(ctx, sid, t, box, {fx, fy, zoom, tx, ty, cam, plate}): the shot's clip in a box of the frame, with the
// picture point (fx, fy) on the box's centre (or on tx, ty), as far as the picture's edges allow.
function crop(ctx, sid, t, box, o = {}) {
  const { fx = 0.5, fy = 0.5, tx = box.x + box.w / 2, ty = box.y + box.h / 2 } = o;
  const cam = CAM.mix(o.cam || []), pic = SHOT.at(sid, t, o.plate != null ? { plate: o.plate } : {}), zoom = (o.zoom || 1) * cam.zoom;
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
const seam = (ctx, y) => rule(ctx, 0, y - 4, W, 8, P.mozz);

// ---------------------------------------------------------------- 2. pictures

// s081: she sings in the niche. The clip is the retimed lip-sync take: SHOT.at plays it through its warp.
const NB = 1000;                                 // the foot of the niche, the head of the predella
const NICHE = { x0: 16, x1: W - 16, apex: 30, spring: 300, bot: NB };
SCENE_V({ id: 'v08.s081', t0: T_IN, t1: SHOT.t1('s081'), z: 0, draw(ctx, t) {
  crop(ctx, 's081', t, { x: 0, y: 0, w: W, h: NB }, { fx: 0.497, fy: 0.47, zoom: 1.1, cam: [CAM.punch(t, Q1, 0.05), CAM.shake(t, Q1, 10)] });
}});

for (const sid of ['s082', 's086', 's087', 's088']) {
  SCENE_V({ id: `v08.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}
SCENE_V({ id: 'v08.s089', t0: T_CARD, t1: T_OUT, z: 0, draw(ctx, t) { SHOT.draw(ctx, 's089', t, CAM_OF.s089(t)); } });

// s083, three bites, one clip per beat, split on one seam. Top: the film's whole picture. Bottom: a close crop
// of the same clip, the ground the plaques land on. The second clip is laid a little larger and from its top
// edge, which puts her eyes under the top of SAFE.
const S83 = split(940);
const BITE = [
  { top: { fx: 0.485, fy: 0.5, zoom: 1 }, bot: { fx: 0.84, fy: 0.8, zoom: 1.9 }, cam: t => CAM.punch(t, word(82, 0).t0, 0.05) },
  { top: { fx: 0.47, fy: 0.3, zoom: 1.12 }, bot: { fx: 0.70, fy: 0.62, zoom: 1.9 }, cam: t => CAM.punch(t, word(82, 2).t0, 0.05) },
  { top: { fx: 0.47, fy: 0.5, zoom: 1.06 }, bot: { fx: 0.29, fy: 0.80, zoom: 1.9 }, cam: t => [CAM.punch(t, word(82, 4).t0, 0.07), CAM.shake(t, word(82, 4).t0, 12)] },
];
BITE.forEach((b, i) => {
  SCENE_V({ id: `v08.s083.${i}`, t0: B(308 + i), t1: B(309 + i), z: 0, draw(ctx, t) {
    crop(ctx, 's083', t, S83.top, { ...b.top, plate: i, cam: b.cam(t) });
    crop(ctx, 's083', t, S83.bot, { ...b.bot, plate: i });
    seam(ctx, S83.seam);
  }});
});

// s084, split on the same seam. Top: her, the kiss and all three waiters. Bottom: the red leather of the booth
// beside her, where the napkins land.
const S84 = split(940);
SCENE_V({ id: 'v08.s084', t0: SHOT.t0('s084'), t1: SHOT.t1('s084'), z: 0, draw(ctx, t) {
  crop(ctx, 's084', t, S84.top, { fx: 0.42, fy: 0.5, cam: CAM.punch(t, word(83, 4).t0, 0.06) });
  crop(ctx, 's084', t, S84.bot, { fx: 0.89, fy: 0.83, zoom: 2.8 });
  seam(ctx, S84.seam);
}});

// s085, the prayer card. The clip is laid 1632 px tall between two gold bands, so the whole mandorla is in
// the frame and her face is under the top of SAFE.
const CARD85 = { x: 0, y: 144, w: W, h: 1632 };
SCENE_V({ id: 'v08.s085', t0: SHOT.t0('s085'), t1: SHOT.t1('s085'), z: 0, draw(ctx, t) {
  crop(ctx, 's085', t, CARD85, { fx: 0.489, fy: 0.5, cam: [CAM.punch(t, Q2, 0.05), CAM.shake(t, Q2, 12)] });
}});

// ---------------------------------------------------------------- 3. the title lockup and the watermark

// Her name in the film's book italic, the QUESO slab beside it, and the handle under them, faint, as in v01.
// It sits at the top of SAFE, on the side the picture leaves free. In the split shots the heads reach the top
// of the frame, so it sits under the seam. On the scooter it is on the right while her arm is up on the left,
// and crosses on beat 332, when the top box tips into the right corner.
const LOCK = { name: 46, slab: 50, gap: 16, mark: 46, markSize: 28, alpha: 0.55 };
const LOCK_AT = [
  [T_IN, B(303), { right: false, y: 284 }],
  [B(303), B(308), { right: true, y: 284 }],
  [B(308), B(316), { right: true, y: S83.seam + 72 }],
  [B(316), B(327), { right: false, y: 284 }],
  [B(327), B(332), { right: true, y: 284 }],
  [B(332), T_CARD, { right: false, y: 284 }],
];
SCENE_V({ id: 'v08.marca', t0: T_IN, t1: T_CARD, z: 100, draw(ctx, t) {
  const at = LOCK_AT.find(([a, b]) => t >= a && t < b);
  if (!at) return;
  const { right, y } = at[2];
  const st = { font: F.book, italic: true, weight: 500, size: LOCK.name, fill: P.mozz, stroke: P.patent, strokeWidth: 5 };
  const nw = TXT.width('Saindra', st);
  const sw = TXT.width('QUESO', { font: F.caps, size: LOCK.slab, tracking: 0.01 }) + 2 * 0.17 * LOCK.slab;
  const x = right ? COL.x + COL.w - (nw + LOCK.gap + sw) : COL.x;
  TXT.draw(ctx, 'Saindra', x, y, st);
  KIT.slab(ctx, t, 'QUESO', { x: x + nw + LOCK.gap + sw / 2, y: y - TXT.capH(st) / 2, size: LOCK.slab, rot: -0.035, from: 1 });
  ctx.save();
  ctx.globalAlpha *= LOCK.alpha;
  TXT.draw(ctx, MARK, right ? COL.x + COL.w - 2 : COL.x + 2, y + LOCK.mark, { font: F.sans, weight: 600, size: LOCK.markSize, tracking: 0.04, fill: P.mozz, stroke: P.patent, strokeWidth: 4, align: right ? 'right' : 'left' });
  ctx.restore();
}});

// ---------------------------------------------------------------- 4. s081, line 80: the retablo

// The film's retablo, stood on end. The frame is gold leaf; the niche is an arch as wide as the frame that
// springs at the top of SAFE; the label's two leaves are the predella under it: "No es Grasa," struck on the
// left, "es" and the QUESO slab on the right, a row of the label under each. Roses and stars fill the foot.
function nichePath(ctx) {
  const n = NICHE, cx = W / 2, rx = (n.x1 - n.x0) / 2;
  ctx.moveTo(n.x0, n.bot); ctx.lineTo(n.x0, n.spring);
  ctx.ellipse(cx, n.spring, rx, n.spring - n.apex, 0, Math.PI, TAU);
  ctx.lineTo(n.x1, n.bot); ctx.closePath();
}
const LEAF = { w: 412 };
SCENE_V({ id: 'v08.retablo', t0: T_IN, t1: B(303), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(80), w = i => L.words[i], on = i => t >= w(i).t0, ink = P.patent;
  const tS = w(3).t0, kick = BEAT.pulse(t, 0.3);

  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.rect(0, 0, W, H); nichePath(ctx); ctx.fill('evenodd');

  // rays round the arch, in the spandrels: longer on every kick, longest when QUESO lands
  const k = 1 + 0.5 * kick + 0.9 * KIT.hit(t, Q1, 0.35), n = NICHE;
  ctx.save();
  ctx.beginPath(); ctx.rect(20, 20, W - 40, H - 40); ctx.clip();
  ctx.fillStyle = ink;
  rays(ctx, W / 2, n.spring, (n.x1 - n.x0) / 2 + 24, n.spring - n.apex + 24, Math.PI * 1.1, Math.PI * 1.9, 23, i => (i % 2 ? 22 : 38) * k, 0.012);
  for (const d of [-1, 1]) { star(ctx, W / 2 + d * 474, 70, 20 * (1 + 0.3 * kick)); star(ctx, W / 2 + d * 414, 46, 10 * (1 + 0.3 * kick)); }
  ctx.restore();

  ctx.strokeStyle = ink; ctx.lineJoin = 'miter';
  ctx.lineWidth = 8; ctx.strokeRect(16, 16, W - 32, H - 32);
  ctx.beginPath(); nichePath(ctx); ctx.stroke();

  // the two leaves
  const X0 = COL.x, CW = LEAF.w, XR = COL.x + COL.w - CW;
  const TS = Math.min(TXT.fit('Información', { w: CW }, TT), TXT.fit('Nutricional', { w: CW }, TT));
  const yT = NB + 76;
  TXT.draw(ctx, 'Información', X0, yT, { ...TT, size: TS, fill: ink });
  TXT.draw(ctx, 'Nutricional', XR + CW, yT, { ...TT, size: TS, fill: ink, align: 'right' });
  rule(ctx, X0, yT + 14, CW, 12, ink); rule(ctx, XR, yT + 14, CW, 12, ink);

  // left leaf: No es Grasa,
  const sm = { ...SM, size: 64, fill: ink }, yNo = yT + 26 + 18 + TXT.capH(sm);
  if (on(0)) { TXT.draw(ctx, w(0).w, X0, yNo, sm); mark(ctx, 80, 0, sm.size); }
  if (on(1)) { TXT.draw(ctx, w(1).w, X0 + TXT.width(w(0).w + ' ', sm), yNo, sm); mark(ctx, 80, 1, sm.size); }
  const name = capFirst(w(2).w), gst = { ...HV, size: Math.min(150, TXT.fit(name, { w: CW }, HV)), fill: ink };
  const gcap = TXT.capH(gst), yG = yNo + 24 + gcap;
  if (on(2)) { TXT.draw(ctx, name, X0, yG, gst); mark(ctx, 80, 2, gst.size); }
  const su = clamp((t - tS) / 0.09);
  if (su > 0) rule(ctx, X0 - 8, yG - gcap * 0.5 - 9, (TXT.width(name, gst) + 16) * EASE.outCubic(su), 18, P.tomato);

  // right leaf: es QUESO
  if (on(3)) { TXT.draw(ctx, w(3).w, XR, yNo, sm); mark(ctx, 80, 3, sm.size); }
  const qsz = slabSize('QUESO', CW - 40), qh = slabH(qsz), qy = yNo + 16 + qh / 2;

  // a row of the label under each leaf, on the floor of SAFE
  const row = { ...HV, size: 46, fill: ink }, yRow = FLOOR - 16;
  for (const [x, a, b, t0] of [[X0, 'Grasa', '0 g', tS], [XR, 'Queso', '100%', Q1]]) {
    rule(ctx, x, yRow - 54, CW, 2.5, ink);
    if (t >= t0) { TXT.draw(ctx, a, x, yRow, row); TXT.draw(ctx, b, x + CW, yRow, { ...row, align: 'right' }); }
    rule(ctx, x, yRow + 12, CW, 2.5, ink);
  }

  // the foot of the altarpiece, under the interface: roses of pepperoni and stars; the stars throb on the kick
  for (const cx of [X0 + CW / 2, XR + CW / 2]) {
    rose(ctx, cx, 1590, 70);
    ctx.fillStyle = ink;
    for (const d of [-1, 1]) { star(ctx, cx + d * 132, 1590, 22 * (1 + 0.3 * kick)); star(ctx, cx + d * 184, 1590, 11 * (1 + 0.3 * kick)); }
    rule(ctx, cx - CW / 2, 1716, CW, 10, ink);
  }

  KIT.slab(ctx, t, 'QUESO', { x: XR + CW / 2, y: qy, size: qsz, rot: -0.035, bg: P.tomato, ink: P.mozz, li: 80, wi: 4, from: 1.3 });
}});

// ---------------------------------------------------------------- 5. the altar panel

// altar(ctx, t, {li, kind, bottom, tIn, bar, fieles}): the label as a gold altar panel that stands on `bottom`,
// as wide as the column, under a low arched crest with a rose, stars and rays behind it.
//   kind 'grasa': "No es Grasa," struck, over "es" and the QUESO slab.
//   kind 'culpa': "No es Culpa," with its 0%, "es Progreso" over its bar, then one row for each of `fieles`
//                 [[name, beat]], each at 100%. The panel grows upward as they report in.
const CREST = 84;
const crest = w => { const a = w / 2, R = (a * a + CREST * CREST) / (2 * CREST); return { R, cy: R - CREST }; };
function panelPath(ctx, w, h, inset = 0) {
  const a = w / 2, g = crest(w), r = g.R - inset, ph = Math.asin((a - inset) / r);
  ctx.beginPath();
  ctx.moveTo(inset, h - inset);
  ctx.arc(a, g.cy, r, -Math.PI / 2 - ph, -Math.PI / 2 + ph);
  ctx.lineTo(w - inset, h - inset);
  ctx.closePath();
}
function crestRays(ctx, w, k) {
  const g = crest(w), n = 17, fx = w / 2, fy = 420;
  for (let i = 0; i < n; i++) {
    const bx = lerp(46, w - 46, i / (n - 1)), by = g.cy - Math.sqrt(g.R * g.R - (bx - w / 2) ** 2);
    const dx = bx - fx, dy = by - fy, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, l = (i % 2 ? 38 : 64) * k, hw = 11;
    ctx.beginPath();
    ctx.moveTo(bx - uy * hw - ux * 10, by + ux * hw - uy * 10);
    ctx.lineTo(bx + ux * l, by + uy * l);
    ctx.lineTo(bx + uy * hw - ux * 10, by - ux * hw - uy * 10);
    ctx.closePath(); ctx.fill();
  }
}
function altar(ctx, t, o) {
  const { x = COL.x, w = COL.w, bottom = FLOOR, li, kind = 'grasa', fieles = [], bar = [0, 1, 0.25] } = o;
  const L = LYR.line(li), wd = i => L.words[i], on = i => t >= wd(i).t0, ink = P.patent;
  const tIn = o.tIn ?? KIT.beatBefore(L.t0);
  if (t < tIn) return null;
  const pad = 28, IW = w - 2 * pad, kick = BEAT.pulse(t, 0.3);
  const grow = (t0, d = 0.14) => EASE.outCubic(clamp((t - t0) / d));
  const sm = { ...SM, size: 72, fill: ink }, gap = TXT.width(' ', sm) * 0.9;
  const title = { ...TT, fill: ink, size: Math.min(58, TXT.fit('Información Nutricional', { w: IW }, TT)) }, capT = TXT.capH(title);
  const hHead = 22 + capT + 16 + 14;
  const xName = pad + TXT.width(wd(0).w, sm) + gap + TXT.width(wd(1).w, sm) + gap * 1.3;
  const lead = TXT.width(wd(3).w, sm) + gap * 1.3, name = capFirst(wd(2).w);
  const tSlam = kind === 'grasa' ? wd(4).t0 : Infinity;

  // heights
  let hBody, nst, capN, qsz, capQ, qw, qh;
  if (kind === 'grasa') {
    nst = { ...HV, fill: ink, size: Math.min(120, TXT.fit(name, { w: IW - (xName - pad) }, HV)) }; capN = TXT.capH(nst);
    qsz = Math.min(184, TXT.fit('QUESO', { w: IW - lead - 48 }, QS)); capQ = TXT.capH({ ...QS, size: qsz });
    qw = TXT.width('QUESO', { ...QS, size: qsz }) + 48; qh = capQ + 44;
    hBody = 20 + capN + 24 + qh + 22;
  } else {
    hBody = 34 + 96 + 72 + 20 + 44 + 22;
    for (const [, b] of fieles) hBody += 52 * grow(B(b));
  }
  const full = hHead + hBody + 56, top = bottom - full;
  const open = EASE.outExpo(clamp((t - tIn) / 0.22)), h = full * open;

  ctx.save();
  ctx.translate(x, top);
  const jolt = 1 + 0.03 * KIT.hit(t, tSlam, 0.22);
  ctx.translate(w / 2, full / 2); ctx.scale(jolt, jolt); ctx.translate(-w / 2, -full / 2);

  ctx.fillStyle = P.cheese;
  crestRays(ctx, w, open * (1 + 0.6 * kick + 0.9 * KIT.hit(t, tSlam, 0.35)));

  ctx.save();
  panelPath(ctx, w, h); ctx.clip();
  rule(ctx, 0, -CREST, w, h + CREST, P.gold);
  rose(ctx, w / 2, -CREST / 2 + 8, 30);
  ctx.fillStyle = ink;
  for (const d of [-1, 1]) { star(ctx, w / 2 + d * 86, -CREST / 2 + 14, 14 * (1 + 0.3 * kick)); star(ctx, w / 2 + d * 136, -CREST / 2 + 20, 8 * (1 + 0.3 * kick)); }
  const tw = TXT.draw(ctx, 'Información Nutricional', pad, 22 + capT, title);
  const por = { font: F.sans, weight: 500, size: 24, fill: ink }, tod = { ...por, weight: 800 };
  if (IW - tw >= TXT.width('Porción toda', tod) + 20) {
    TXT.draw(ctx, 'toda', w - pad, 22 + capT, { ...tod, align: 'right' });
    TXT.draw(ctx, 'Porción', w - pad - TXT.width(' toda', tod), 22 + capT, { ...por, align: 'right' });
  }
  rule(ctx, pad, 22 + capT + 16, IW, 14, ink);

  let yy = hHead, slab = null;
  if (kind === 'grasa') {                               // "No es Grasa," over "es QUESO"
    const base = yy + 20 + capN;
    if (on(0)) { TXT.draw(ctx, wd(0).w, pad, base, sm); mark(ctx, li, 0, sm.size); }
    if (on(1)) { TXT.draw(ctx, wd(1).w, pad + TXT.width(wd(0).w, sm) + gap, base, sm); mark(ctx, li, 1, sm.size); }
    if (on(2)) { TXT.draw(ctx, name, xName, base, nst); mark(ctx, li, 2, nst.size); }
    const u = clamp((t - wd(3).t0) / 0.09);
    if (u > 0) rule(ctx, xName - 10, base - capN * 0.5 - 8, (TXT.width(name, nst) + 20) * EASE.outCubic(u), 16, P.tomato);
    slab = { cx: pad + lead + qw / 2, cy: base + 24 + qh / 2 };
    if (on(3)) { TXT.draw(ctx, wd(3).w, pad, slab.cy + capQ / 2, sm); mark(ctx, li, 3, sm.size); }
  } else {                                              // "No es Culpa, 0%" over "es Progreso" and its bar
    const pct = { ...HV, size: 92, fill: ink };
    TXT.draw(ctx, '% Culpa diaria*', w - pad, yy + 25, { font: F.sans, weight: 800, size: 22, fill: ink, align: 'right' });
    rule(ctx, pad, yy + 33, IW, 2, ink);
    const b1 = yy + 34 + 72;
    const cst = { ...HV, fill: ink, size: Math.min(92, TXT.fit(name, { w: IW - (xName - pad) - TXT.width('0%', pct) - 18 }, HV)) };
    if (on(0)) { TXT.draw(ctx, wd(0).w, pad, b1, sm); mark(ctx, li, 0, sm.size); }
    if (on(1)) { TXT.draw(ctx, wd(1).w, pad + TXT.width(wd(0).w, sm) + gap, b1, sm); mark(ctx, li, 1, sm.size); }
    if (on(2)) {
      TXT.draw(ctx, name, xName, b1, cst); mark(ctx, li, 2, cst.size);
      const s = KIT.slam(t - wd(2).t0, 1.7, 0.08);
      ctx.save(); ctx.translate(w - pad - TXT.width('0%', pct) / 2, b1 - TXT.capH(pct) / 2); ctx.scale(s, s);
      TXT.draw(ctx, '0%', 0, 0, { ...pct, align: 'center', baseline: 'center' });
      ctx.restore();
    }
    rule(ctx, pad, yy + 34 + 94, IW, 2, ink);
    const b2 = yy + 34 + 96 + 72, by = b2 + 20, bh = 44, bw = IW - 150;
    if (on(3)) { TXT.draw(ctx, wd(3).w, pad, b2, sm); mark(ctx, li, 3, sm.size); }
    if (on(4)) {
      const pName = capFirst(wd(4).w), pst = { ...HV, fill: ink, size: Math.min(92, TXT.fit(pName, { w: IW - lead }, HV)) };
      TXT.draw(ctx, pName, pad + lead, b2, pst); mark(ctx, li, 4, pst.size);
      // the loading bar: one chunk per step; full, it goes tomato
      const [c0, c1, step] = bar, n = Math.round((c1 - c0) / step) + 1, cw = (bw - 16 - (n - 1) * 5) / n;
      ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.strokeRect(pad + 2, by + 2, bw - 4, bh - 4);
      let done = 0;
      for (let i = 0; i < n; i++) if (t >= B(c0 + i * step)) done++;
      for (let i = 0; i < done; i++) {
        const s = lerp(0.3, 1, EASE.outCubic(clamp((t - B(c0 + i * step)) / 0.07)));
        rule(ctx, pad + 8 + i * (cw + 5), by + 8 + ((bh - 16) * (1 - s)) / 2, cw, (bh - 16) * s, done === n ? P.tomato : ink);
      }
      const ps = done === n ? KIT.slam(t - B(c1), 1.5, 0.08) : 1, pc = { ...HV, size: 44, fill: ink };
      ctx.save(); ctx.translate(w - pad - TXT.width('100%', pc) / 2, by + bh / 2); ctx.scale(ps, ps);
      TXT.draw(ctx, `${Math.round((100 * done) / n)}%`, 0, 0, { ...pc, align: 'center', baseline: 'center' });
      ctx.restore();
    }
    rule(ctx, pad, by + bh + 20, IW, 2, ink);
    let yr = by + bh + 22;
    const row = { ...HV, size: 38, fill: ink };
    for (const [who, b] of fieles) {                    // the rest of the line, each at 100%
      if (t >= B(b)) {
        TXT.draw(ctx, who, pad, yr + 39, row); TXT.draw(ctx, '100%', w - pad, yr + 39, { ...row, align: 'right' });
        rule(ctx, pad, yr + 50, IW, 2, ink);
      }
      yr += 52 * grow(B(b));
    }
  }
  yy += hBody;
  rule(ctx, pad, yy + 4, IW, 10, ink);
  TXT.draw(ctx, '* Culpa diaria con base en una dieta de pizza.', pad, yy + 38, { font: F.sans, weight: 500, size: 21, fill: ink });
  ctx.restore();

  ctx.strokeStyle = ink; ctx.lineJoin = 'miter';
  ctx.lineWidth = 6; panelPath(ctx, w, h, 3); ctx.stroke();
  ctx.lineWidth = 2; panelPath(ctx, w, h, 13); ctx.stroke();

  if (slab && t >= tSlam) {                             // QUESO lands over the struck row
    const s = KIT.slam(t - tSlam, 1.7, 0.09);
    ctx.save();
    ctx.translate(slab.cx, slab.cy); ctx.rotate(-0.035); ctx.scale(s, s);
    rule(ctx, -qw / 2, -qh / 2, qw, qh, P.tomato);
    TXT.draw(ctx, 'QUESO', 0, 0, { ...QS, size: qsz, fill: P.mozz, align: 'center', baseline: 'center' });
    mark(ctx, li, 4, qsz);
    ctx.restore();
    const pct = { ...HV, size: 72, fill: ink }, ps = KIT.slam(t - tSlam - 0.06, 1.5, 0.08);
    if (ps > 0) {                                       // and the label reads it off
      ctx.save(); ctx.translate(w - pad - TXT.width('100%', pct) / 2, slab.cy); ctx.scale(ps, ps);
      TXT.draw(ctx, '100%', 0, 0, { ...pct, align: 'center', baseline: 'center' });
      ctx.restore();
    }
  }
  ctx.restore();
  return { x, y: top, w, h: full };
}

// s082, line 81, "No es culpa, es progreso". The bar fills as the slice starts to travel, and the rest of the
// line reports in once it has arrived.
const FIELES = [['Meseros', 307], ['Abuela', 307.25], ['Pizzaiolo', 307.5]];
SCENE_V({ id: 'v08.progreso', t0: B(303), t1: B(308), z: Z_GFX, draw(ctx, t) {
  altar(ctx, t, { li: 81, kind: 'culpa', tIn: B(303), bar: [305.5, 306.5, 0.25], fieles: FIELES });
}});

// ---------------------------------------------------------------- 6. s083, line 82, "Mira cómo me lo como"

// A gold plaque per word on the lower part, a clip per bite, and bites out of the plaques, as in the film. Each
// plaque belongs to the clip it lands on and leaves with it. COMO is the tomato one, and it is eaten three times.
const MIRA = [
  { wi: 0, text: 'MIRA', x: 400, y: 1262, w: 600, rot: 0.035, out: 309, bites: [{ fx: 1.06, fy: -1.1, r: 70, rot: 2.3, b: 308.75 }] },
  { wi: 1, text: 'CÓMO', x: 276, y: 1202, w: 436, rot: -0.04, out: 310, from: 1.2, padY: 0.25, bites: [{ fx: -1.06, fy: 1.1, r: 62, rot: 5.5, b: 309.5 }] },
  { wi: 2, text: 'ME', x: 622, y: 1322, w: 190, rot: 0.03, out: 310, bites: [] },
  { wi: 3, text: 'LO', x: 824, y: 1310, w: 190, rot: -0.05, out: 310, bites: [{ fx: 1.1, fy: 1.14, r: 50, rot: 3.9, b: 309.75 }] },
  { wi: 4, text: 'COMO', x: 470, y: 1266, w: 720, rot: -0.035, out: 311, from: 1.2, bg: P.tomato, ink: P.mozz,
    bites: [{ fx: 1.04, fy: -1.1, r: 78, rot: 2.3, b: 310.25 }, { fx: -1.04, fy: 1.1, r: 78, rot: 5.5, b: 310.5 }, { fx: 1.05, fy: 1.14, r: 70, rot: 3.9, b: 310.75 }] },
];
SCENE_V({ id: 'v08.mira', t0: B(308), t1: B(311), z: Z_GFX, draw(ctx, t) {
  const all = MIRA.map(s => ({ ...s, size: slabSize(s.text, s.w) }));
  const live = all.filter(s => t >= word(82, s.wi).t0 && t < B(s.out));
  if (!live.length) return;
  const bites = [];
  for (const s of live) for (const b of s.bites) bites.push({ x: s.x + (b.fx * s.w) / 2, y: s.y + (b.fy * (slabH(s.size) + ((s.padY || 0.15) - 0.15) * 2 * s.size)) / 2, r: b.r, rot: b.rot, t: B(b.b) });
  KIT.bitten(ctx, t, g => {
    for (const s of live) {
      const ink = s.ink || P.patent;
      const r = KIT.slab(g, t, s.text, { x: s.x, y: s.y, size: s.size, rot: s.rot, bg: s.bg || P.gold, ink, from: s.from || 1.3, padY: s.padY || 0.15, li: 82, wi: s.wi });
      g.save();                                        // the plaque's engraved edge
      g.translate(s.x, s.y); g.rotate(s.rot); g.scale(r.s, r.s);
      g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(-r.w / 2 + 10, -r.h / 2 + 10, r.w - 20, r.h - 20);
      g.restore();
    }
  }, bites, 'v08.bite');
}});

// ---------------------------------------------------------------- 7. s084, line 83, "Y te mando un beso"

// The napkin lies on the leather of the lower part, and the kisses multiply on small napkins of their own
// beside it and along the booth of the upper part: one a beat while she writes, then faster than the beat.
const NAPKIN = { x: 44, y: 1010, w: 500, rot: -0.04 };
// kissed napkins: centre x, y, side, tilt, beat. Clear of her face, her hands and the waiters' faces.
const BESITOS = [
  [668, 1196, 190, 0.08, 312], [836, 1322, 170, -0.1, 313], [650, 1352, 124, 0.14, 314.5],
  [104, 838, 150, 0.1, 315], [846, 1152, 120, -0.16, 315.25], [862, 866, 118, -0.12, 315.5],
];
// two more prints on the big napkin itself, in its own coordinates (620 x 500)
const REBESOS = [[104, 432, 150, 0.35, 315.75], [572, 50, 112, -0.5, 315.875]];
const EMBOSS = mixColor(P.mozz, P.patent, 0.1);
function besito(ctx, t, x, y, s, rot, tHit) {
  const lt = t - tHit;
  if (lt < 0) return;
  const z = KIT.slam(lt, 1.6, 0.08), n = Math.round((s - 24) / 15);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(z, z);
  ctx.fillStyle = P.mozz; ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.fillStyle = EMBOSS;                              // the embossed edge of a paper napkin
  for (let i = 0; i <= n; i++) {
    const d = -s / 2 + 12 + ((s - 24) * i) / n;
    for (const e of [-s / 2 + 12, s / 2 - 12]) {
      ctx.beginPath(); ctx.arc(d, e, 2.4, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(e, d, 2.4, 0, TAU); ctx.fill();
    }
  }
  KIT.kiss(ctx, t, { x: 0, y: 6, size: s * 0.8, rot: -0.2, tHit: tHit - 1 });   // the print arrives with its napkin
  ctx.restore();
}
SCENE_V({ id: 'v08.beso', t0: B(311), t1: B(316), z: Z_GFX, draw(ctx, t) {
  for (const [x, y, s, rot, b] of BESITOS) besito(ctx, t, x, y, s, rot, B(b));
  // the napkin comes in from the left edge, as in the film
  const u = EASE.outExpo(clamp((t - B(311)) / 0.2)), k = NAPKIN.w / 620;
  ctx.save();
  ctx.translate(-(1 - u) * (NAPKIN.x + NAPKIN.w + 60), 0);
  KIT.napkin(ctx, t, 83, { ...NAPKIN, tIn: 0 });
  ctx.translate(NAPKIN.x + NAPKIN.w / 2, NAPKIN.y + 250 * k); ctx.rotate(NAPKIN.rot); ctx.scale(k, k); ctx.translate(-310, -250);
  for (const [x, y, size, rot, b] of REBESOS) KIT.kiss(ctx, t, { x, y, size, rot, tHit: B(b) });
  ctx.restore();
}});

// ---------------------------------------------------------------- 8. s085, line 84: the prayer card

// Gold bands above and below the picture, a low arch over it, a rose in each corner, a thin gold line inside
// the window. A few stars come out beside her head on every kick. The label is the altar panel, across the foot
// of her mantle; the crescent of crust shows under it.
const ASTROS = [[72, 392, 18, 316], [1010, 300, 20, 316], [150, 446, 10, 317], [956, 380, 11, 317], [58, 520, 9, 318], [1022, 452, 9, 318]];
function cardPath(ctx, inset = 0) {
  const c = CARD85, x0 = 22 + inset, x1 = W - 22 - inset, sp = c.y + 86;
  ctx.moveTo(x0, c.y + c.h - inset); ctx.lineTo(x0, sp);
  ctx.ellipse(W / 2, sp, (x1 - x0) / 2, 86 - inset, 0, Math.PI, TAU);
  ctx.lineTo(x1, c.y + c.h - inset); ctx.closePath();
}
SCENE_V({ id: 'v08.estampa', t0: B(316), t1: B(319), z: Z_GFX, draw(ctx, t) {
  const kick = BEAT.pulse(t, 0.3), G = P.gold;
  ctx.fillStyle = G;
  ctx.beginPath(); ctx.rect(0, 0, W, H); cardPath(ctx); ctx.fill('evenodd');
  ctx.strokeStyle = P.patent; ctx.lineWidth = 6; ctx.beginPath(); cardPath(ctx); ctx.stroke();
  ctx.strokeStyle = G; ctx.lineWidth = 3; ctx.beginPath(); cardPath(ctx, 16); ctx.stroke();
  for (const [x, y] of [[84, 72], [W - 84, 72], [84, H - 72], [W - 84, H - 72]]) rose(ctx, x, y, 34);
  ctx.fillStyle = P.patent;
  for (const d of [-1, 1]) { star(ctx, W / 2 + d * 120, 72, 20 * (1 + 0.3 * kick)); star(ctx, W / 2 + d * 250, 72, 11 * (1 + 0.3 * kick)); star(ctx, W / 2 + d * 185, H - 72, 16 * (1 + 0.3 * kick)); }
  star(ctx, W / 2, 68, 30 * (1 + 0.3 * kick)); star(ctx, W / 2, H - 72, 26 * (1 + 0.3 * kick));
  ctx.fillStyle = G;
  for (const [x, y, r, b] of ASTROS) {
    const lt = t - B(b);
    if (lt >= 0) star(ctx, x, y, r * KIT.slam(lt, 2.2, 0.1) * (1 + 0.22 * kick), 0.2 * Math.sin(x));
  }
  altar(ctx, t, { li: 84, kind: 'grasa', tIn: B(316) });
}});

// ---------------------------------------------------------------- 9. s086, line 85, "No me vengas con complejos"

// Stamped on a pizza box lid, as in the film: the lid stands in the lower band, on the near side of the door,
// and each word is pressed into the block on its own time. "No" is sung a frame before the cut; in the film
// the lid starts there, over the apparition. Here that frame would put the lid on the altar panel, so the lid
// starts on the cut.
const LID = { x: 48, y: 824, s: 596, rot: -0.03 };
const SELLO = [[0, 1], [2, 3], [4]];                    // the block's rows, by word index
SCENE_V({ id: 'v08.caja', t0: B(319), t1: B(323), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(85), tIn = B(319), s = LID.s, R = P.tomato;
  const k = KIT.slam(t - tIn, 1.1, 0.1);
  ctx.save();
  ctx.translate(LID.x + s / 2, LID.y + s / 2); ctx.rotate(LID.rot); ctx.scale(k, k); ctx.translate(-s / 2, -s / 2);
  ctx.fillStyle = P.mozz; ctx.fillRect(0, 0, s, s);
  // the lid's print: a keyline, the vents, the fold of the front flap
  ctx.strokeStyle = R; ctx.lineWidth = 5; ctx.strokeRect(20, 20, s - 40, s - 40);
  ctx.fillStyle = R;
  for (const dx of [-30, 0, 30]) { ctx.beginPath(); ctx.arc(s / 2 + dx, 59, 7, 0, TAU); ctx.fill(); }
  TXT.draw(ctx, 'PARA LLEVAR', 44, 68, { font: F.sans, weight: 800, size: 22, tracking: 0.16, fill: R });
  TXT.draw(ctx, 'CALIENTE', s - 44, 68, { font: F.sans, weight: 800, size: 22, tracking: 0.16, fill: R, align: 'right' });

  // the stamp: three rows set to one width, on a layer of its own so the ink can fail in places
  const st = { font: F.caps, tracking: 0.03, upper: true }, bx = 54, by = 100, BW = s - 2 * bx, BH = s - by - 54, gap = 24;
  const rows = SELLO.map(ws => {
    const text = ws.map(i => L.words[i].w).join(' '), size = Math.min(230, TXT.fit(text, { w: BW - 52 }, st));
    return { ws, size, cap: TXT.capH({ ...st, size }) };
  });
  const f = Math.min(1, (BH - 52 - gap * (rows.length - 1)) / rows.reduce((a, r) => a + r.cap, 0));
  const g = CANVAS.scratch('v08.sello');
  g.setTransform(ctx.getTransform());
  g.strokeStyle = R; g.lineWidth = 11;
  g.beginPath(); g.roundRect(bx, by, BW, BH, 16); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.roundRect(bx + 14, by + 14, BW - 28, BH - 28, 8); g.stroke();
  const used = rows.reduce((a, r) => a + r.cap * f, 0) + gap * (rows.length - 1);
  let yy = by + (BH - used) / 2;
  for (const r of rows) {
    const rs = { ...st, size: r.size * f, fill: R }, sp = TXT.width(' ', rs) + 2 * rs.tracking * rs.size;
    const ww = r.ws.map(i => TXT.width(L.words[i].w, rs));
    let x = bx + (BW - (ww.reduce((a, v) => a + v, 0) + sp * (ww.length - 1))) / 2;
    yy += r.cap * f;
    r.ws.forEach((wi, j) => {
      const lt = t - Math.max(tIn, L.words[wi].t0);
      if (lt >= 0) {
        const z = KIT.slam(lt, 1.35, 0.08), cx = x + ww[j] / 2, cy = yy - (r.cap * f) / 2;
        g.save(); g.translate(cx, cy); g.scale(z, z);
        TXT.draw(g, L.words[wi].w, 0, 0, { ...rs, align: 'center', baseline: 'center' });
        g.restore();
        mark(ctx, 85, wi, rs.size);
      }
      x += ww[j] + sp;
    });
    yy += gap;
  }
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = g.createPattern(SPECK, 'repeat');
  g.fillRect(0, 0, s, s);
  ctx.save(); ctx.resetTransform(); ctx.drawImage(g.canvas, 0, 0); ctx.restore();
  ctx.restore();
}});

// ---------------------------------------------------------------- 10. s087, line 86, "Tú contando calorías"

// His counter with nothing left to count, as a column beside his head: the sung line one word a row, a dim
// zero that blinks, and under it his readings report in, all zero.
const NADA = [['CENA', '0 kcal', 325], ['NOVIA', '0', 325.5], ['TODO', '0', 326]];
const CERO = { x: COL.x, y: 392, w: 364 };
SCENE_V({ id: 'v08.cero', t0: B(323), t1: B(327), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(86), tIn = B(323), { x, y, w } = CERO, pad = 30, st = { ...STY.his };
  const size = Math.min(64, ...L.words.map(v => TXT.fit(v.w, { w: w - 2 * pad }, st)));
  const cap = TXT.capH({ ...st, size }), lh = size * 1.24, n = L.words.length;
  const unit = { font: F.mono, weight: 600, size: 30, fill: P.ice }, uw = TXT.width('kcal', unit);
  const seg = { ...STY.seg, size: Math.min(84, TXT.fit('8888', { w: w - 2 * pad - uw - 14 }, STY.seg)) };
  const yDig = pad + cap + (n - 1) * lh + 34 + seg.size, grow = b => EASE.outCubic(clamp((t - B(b)) / 0.12));
  let hR = 0;
  for (const r of NADA) hR += 56 * grow(r[2]);
  const h = yDig + pad + hR + (hR > 0 ? 8 : 0);
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath(); ctx.rect(0, 0, w * EASE.outExpo(clamp((t - tIn) / 0.14)), h); ctx.clip();
  rule(ctx, 0, 0, w, h, P.patent);
  ctx.strokeStyle = P.ice; ctx.lineWidth = 3; ctx.strokeRect(10, 10, w - 20, h - 20);
  L.words.forEach((v, i) => {
    if (t < v.t0) return;
    TXT.draw(ctx, v.w, pad, pad + cap + i * lh, { ...st, size });
    mark(ctx, 86, i, size);
  });
  // the total: every segment dark but one zero, and that one low and blinking
  const dx = w - pad - uw - 14;
  TXT.draw(ctx, 'kcal', w - pad, yDig, { ...unit, align: 'right', opacity: 0.6 });
  TXT.draw(ctx, '8888', dx, yDig, { ...seg, align: 'right', opacity: 0.13 });
  if (BEAT.pos(t) % 1 < 0.62) TXT.draw(ctx, '0', dx, yDig, { ...seg, align: 'right', opacity: 0.55 });
  let yy = yDig + pad - 4;
  const rs = { font: F.mono, weight: 700, size: 30, fill: P.ice };
  for (const [name, val, b] of NADA) {
    if (t >= B(b)) {
      rule(ctx, pad, yy, w - 2 * pad, 2, P.ice);
      const wl = TXT.draw(ctx, name, pad, yy + 40, rs), wr = TXT.width(val, rs);
      TXT.draw(ctx, val, w - pad, yy + 40, { ...rs, align: 'right' });
      ctx.fillStyle = P.ice;
      for (let px = pad + wl + 14; px < w - pad - wr - 14; px += 13) ctx.fillRect(px, yy + 34, 4, 4);
    }
    yy += 56 * grow(b);
  }
  ctx.restore();
}});

// ---------------------------------------------------------------- 11. s088, line 87, "Yo contando pepperonis"

// Her counter, in the lower band across the body of the scooter: the line on one row, the count under it. The
// headlight and the handlebar show above it, the wheels under it. It picks up at the 9 999 of the last chorus,
// passes a hundred thousand as she sings "pepperonis" and is closed on beat 331 by a gold plaque: one million.
// "Yo" is sung a frame before the cut, so it starts there.
const CUENTA = { x: COL.x, w: COL.w, bottom: FLOOR };
const DIGITS = '0123456789';
// a number set in fixed cells, right-aligned at x: Anton's figures are not tabular and a racing total must
// not shiver. Returns the width it took.
function tabular(ctx, n, x, y, st) {
  const cw = Math.max(...[...DIGITS].map(d => TXT.width(d, st))), gw = st.size * 0.2, s = KIT.num(n);
  let cx = x;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === ' ') { cx -= gw; continue; }
    cx -= cw;
    TXT.draw(ctx, s[i], cx + cw / 2, y, { ...st, align: 'center' });
  }
  return x - cx;
}
const tabularW = (text, st) => {
  const cw = Math.max(...[...DIGITS].map(d => TXT.width(d, st))), digits = text.replace(/ /g, '').length;
  return digits * cw + (text.length - digits) * st.size * 0.2;
};
function pepperonis(t) {
  const a = B(327), m = word(87, 2).t0;
  if (t >= TOTAL) return 1000000;
  if (t < a) return 9999;
  if (t < m) return Math.floor(lerp(9999, 100000, Math.pow((t - a) / (m - a), 2.2)));
  return Math.floor(lerp(100000, 999999, Math.pow((t - m) / (TOTAL - m), 1.8)));
}
SCENE_V({ id: 'v08.total', t0: word(87, 0).t0, t1: B(333), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(87), tIn = L.words[0].t0, w = CUENTA.w, pad = 30, IW = w - 2 * pad;
  const st = { ...STY.caps, size: Math.min(84, TXT.fit(L.words.map(v => v.w).join(' '), { w: IW }, STY.caps)) };
  const cap = TXT.capH(st), nst = { font: F.caps, size: 150, fill: P.mozz }, ncap = TXT.capH(nst);
  const y1 = pad + cap, yR = y1 + 20, yN = yR + 5 + 24 + ncap, Hh = yN + pad, top = CUENTA.bottom - Hh;
  const k = KIT.slam(t - tIn, 1.05, 0.1);
  ctx.save();
  ctx.translate(CUENTA.x + w / 2, top + Hh / 2); ctx.scale(k, k); ctx.translate(-w / 2, -Hh / 2);
  rule(ctx, 0, 0, w, Hh, P.tomato);
  let cx = pad;
  L.words.forEach((v, i) => {
    if (t >= v.t0) { TXT.draw(ctx, v.w, cx, y1, st); mark(ctx, 87, i, st.size); }
    cx += TXT.width(v.w + ' ', st);
  });
  rule(ctx, pad, yR, IW, 5, P.mozz);
  if (t < TOTAL) {                                     // the count, ticking on the eighth notes
    const z = 1 + 0.06 * BEAT.pulse(t, 0.12, 0.5);
    ctx.save(); ctx.translate(w - pad, yN - ncap / 2); ctx.scale(z, z);
    tabular(ctx, pepperonis(t), 0, ncap / 2, nst);
    ctx.restore();
  } else {                                             // the total: a gold plaque over the row
    const z = KIT.slam(t - TOTAL, 1.06, 0.09) * (1 + 0.012 * BEAT.pulse(t, 0.25));
    const pw = w - 44, ph = ncap + 62, nw = tabularW('1 000 000', nst);
    ctx.save(); ctx.translate(w / 2, yN - ncap / 2); ctx.rotate(-0.02); ctx.scale(z, z);
    rule(ctx, -pw / 2, -ph / 2, pw, ph, P.gold);
    ctx.strokeStyle = P.patent; ctx.lineWidth = 3; ctx.strokeRect(-pw / 2 + 9, -ph / 2 + 9, pw - 18, ph - 18);
    tabular(ctx, 1000000, nw / 2, ncap / 2, { ...nst, fill: P.patent });
    ctx.restore();
  }
  ctx.restore();
}});

// ---------------------------------------------------------------- 12. the end card

// Beats 333 to 337, as in v01. The next shot of the film plays under a dark veil: the empty trattoria, and her
// hand closing the lens. QUESO as the label's slab, her name under it, then the date and where to hear it in
// the film's small tracked capitals, and the handle.
const CREDIT = { font: F.sans, weight: 700, upper: true, tracking: 0.16, fill: P.mozz, align: 'center' };
const CARD = { x: W / 2, y: 650, size: 272, veil: 0.66 };
SCENE_V({ id: 'v08.fin', t0: T_CARD, t1: T_OUT, z: Z_GFX, draw(ctx, t) {
  ctx.save(); ctx.globalAlpha *= CARD.veil; rule(ctx, 0, 0, W, H, P.patent); ctx.restore();
  const r = KIT.slab(ctx, t, 'QUESO', { x: CARD.x, y: CARD.y, size: CARD.size, rot: -0.035, from: 1 });
  const yName = CARD.y + r.h / 2 + CARD.size * 0.4;
  if (t >= B(333.5)) TXT.draw(ctx, 'Saindra', CARD.x, yName, { font: F.book, italic: true, weight: 500, size: CARD.size * 0.34, fill: P.mozz, align: 'center' });
  if (t >= B(334)) TXT.draw(ctx, '14 de octubre', CARD.x, yName + 150, { ...CREDIT, size: 58 });
  if (t >= B(334.5)) {
    TXT.draw(ctx, 'En todas las plataformas', CARD.x, yName + 216, { ...CREDIT, size: 34 });
    TXT.draw(ctx, MARK, CARD.x, yName + 292, { font: F.sans, weight: 600, size: 34, tracking: 0.04, fill: P.mozz, opacity: 0.85, align: 'center' });
  }
}});
