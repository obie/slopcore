// v07_mandamientos.js: the breakdown as a vertical cut, 1080 x 1920, for TikTok and Reels. Beat 281 to beat 300
// (172.46 to 184.09 s), shots s075 to s080, lines 74 to 79, then an end card to beat 304 (186.54 s).
// The 16:9 chapter it re-lays is 07_soltera.js; the pattern it follows is v01_coro1.js. Every scene here is a
// proof scene: this file draws only when it is picked, in a tall frame:
//
//   cd engine && VIDEO_PROJECT=queso ../.venv/bin/python render.py video 172.46:186.54 --size 1080x1920 --ch v07 \
//       --no-audio --out ../queso/media/scratch/vertical-v07/video.mp4
//
// How the tall frame is used:
//   1. The picture fills the frame. A 16:9 clip gives a tall frame a slice 31.6% of its width, so each shot
//      names the point of the picture that sits in the middle (CAM_OF). s076 is too wide for one slice: her
//      face is on the left of the clip and the bin on the right. The frame splits on a seam, as in v01: her
//      face on top, the scale over the bin below, both at the scale of the other shots.
//   2. The interface of TikTok and Reels covers the top 220 px, the bottom 480 px and the right 150 px. Type
//      and everything pinned stays inside SAFE. Footage and the tomato field run under.
//   3. A commandment is the film's two beats: the picture with "No me" on small tomato slabs, then on the verb
//      the whole frame goes tomato with the line in white caps. In the tall frame the poster is a stack of rows,
//      each as wide as the column POST. "NO ME" is the first row of all five, so it stands in the same place at
//      the same size every time and only the verb under it changes.
//   4. "Pásame los cuatro quesos": the film sets its picture beside a tomato column of four rows. The four plates
//      lie in a diamond as wide as the clip, so here the column is on the left and the picture is cut into four
//      windows, one cheese beside each row. In the stop each row spins, names its own cheese last, and pays out
//      QUESO beside it.
//   5. The end card is v01's. Under its veil the slice of the next shot is the one beside her: her mantle and
//      the breadstick rays. Her face is as tall as the card, so a slice with her in it would put the type on it.

if (W >= H) {
  if (ENGINE.picked.length) throw new Error('v07_mandamientos.js is a vertical cut: render it with --size 1080x1920');
  return;
}

const MARK = '@saindra_ofc';   // the watermark, and the handle on the end card

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const P = PAL, F = FACE;
const Z_GFX = 10, FRAME = 1 / 24;
// a render of 172.46:186.54 starts a millisecond before beat 281: the first scenes open half a frame early
const T_IN = B(281) - FRAME / 2, T_CARD = B(300), T_OUT = B(304);
const STOP = B(297);                                  // the vocal stops, the reels start
const REEL_STOPS = [298, 298.5, 299, 299.5].map(B);
const SCENE_V = def => SCENE({ ...def, proof: true });   // never in a film render

// ---------------------------------------------------------------- the frame

const SAFE = { x0: 0, y0: 220, x1: W - 150, y1: H - 480 };
const COL = { x: 48, w: SAFE.x1 - 6 - 48 };     // the type column, x 48 to 924
const FLOOR = SAFE.y1 - 8;                      // the lowest edge of a surface
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
// the zoom that shows a clip in a box at k frame px per clip px (the whole frame at zoom 1 is S0)
const zoomFor = (box, k) => k / Math.max(box.w / 1920, box.h / 1080);

// One line per cut. `hit` is the word that brings the poster: the verb, which lands on the kick. The long line
// holds its picture until the last word. `rows` are the rows of the poster, by word index.
const CMD = [
  { sid: 's075', li: 74, hit: 2, rows: [[0, 1], [2]] },
  { sid: 's076', li: 75, hit: 2, rows: [[0, 1], [2]] },
  { sid: 's077', li: 76, hit: 4, rows: [[0, 1], [2, 3], [4]] },
  { sid: 's078', li: 77, hit: 2, rows: [[0, 1], [2]] },
  { sid: 's079', li: 78, hit: 2, rows: [[0, 1], [2]] },
].map(c => ({ ...c, t0: c.sid === 's075' ? T_IN : SHOT.t0(c.sid), t1: SHOT.t1(c.sid), tHit: word(c.li, c.hit).t0 }));
const CMD_OF = Object.fromEntries(CMD.map(c => [c.sid, c]));

const CAM_OF = {
  // the tape, served: the loop with the centimetres on it, the fork in it, the basil beside it
  s075: t => view({ fx: 0.59, fy: 0.5, cam: CAM.punch(t, T_IN, 0.05) }),
  // the briefcase: the slice goes left with her hand as it reaches in for a shaker
  s077: t => view({ fx: ramp(0.47, 0.40, t, B(285), B(287.25), EASE.inOutSine), cam: CAM.punch(t, [B(285), B(286), B(287)], 0.04) }),
  // the gavel: the mill stands the height of the frame, her fist in the middle of it. It lands on the cut.
  s078: t => view({ fx: 0.44, cam: [CAM.punch(t, B(289), 0.05), CAM.shake(t, B(289), 14)] }),
  // the spa: her face, a pepperoni on each eye
  s079: t => view({ fx: 0.535, cam: CAM.punch(t, B(291), 0.05) }),
  // under the end card: her mantle and the breadstick rays of the apparition, the slice beside her face
  s081: t => view({ fx: 0.745, zoom: ramp(1.02, 1.06, t, T_CARD, T_OUT, EASE.linear) }),
};

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s075', 's077', 's078', 's079']) {
  const c = CMD_OF[sid];
  SCENE_V({ id: `v07.${sid}`, t0: c.t0, t1: c.t1, z: 0, draw(ctx, t) { if (t < c.tHit) SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}

// s076, split. Top: her face, and what she thinks of the scale. Bottom: the scale at the end of her arm, over
// the bin. Both parts are the same clip at the scale of a whole-frame slice.
const S76 = { seam: 610 };
SCENE_V({ id: 'v07.s076', t0: SHOT.t0('s076'), t1: SHOT.t1('s076'), z: 0, draw(ctx, t) {
  if (t >= CMD_OF.s076.tHit) return;
  const top = { x: 0, y: 0, w: W, h: S76.seam }, bot = { x: 0, y: S76.seam, w: W, h: H - S76.seam };
  const cam = CAM.punch(t, B(283), 0.05);
  crop(ctx, 's076', t, top, { fx: 0.336, fy: 0.29, zoom: zoomFor(top, 1.38), tx: 384, ty: 392, cam });
  crop(ctx, 's076', t, bot, { fx: 0.75, fy: 0.66, zoom: zoomFor(bot, S0), cam });
  rule(ctx, 0, S76.seam - 4, W, 8, P.mozz);
}});

SCENE_V({ id: 'v07.s081', t0: T_CARD, t1: T_OUT, z: 0, draw(ctx, t) { SHOT.draw(ctx, 's081', t, CAM_OF.s081(t)); } });

// ---------------------------------------------------------------- 3. the title lockup and the watermark

// At the top of SAFE for the whole cut, as in v01: her name in the film's book italic, the QUESO slab beside it,
// the handle under them. It sits in the left corner, and in the right corner over the pictures of s076 and
// s078, where her hair and her fist take the left.
const LOCK = { y: 284, name: 46, slab: 50, gap: 16, markY: 330, markSize: 28, alpha: 0.55 };
const lockRight = t => ['s076', 's078'].some(sid => t >= CMD_OF[sid].t0 && t < CMD_OF[sid].tHit);
SCENE_V({ id: 'v07.marca', t0: T_IN, t1: T_CARD, z: 100, draw(ctx, t) {
  const right = lockRight(t);
  const st = { font: F.book, italic: true, weight: 500, size: LOCK.name, fill: P.mozz, stroke: P.patent, strokeWidth: 5 };
  const nw = TXT.width('Saindra', st);
  const sw = TXT.width('QUESO', { font: F.caps, size: LOCK.slab, tracking: 0.01 }) + 2 * 0.17 * LOCK.slab;
  const x = right ? COL.x + COL.w - (nw + LOCK.gap + sw) : COL.x;
  TXT.draw(ctx, 'Saindra', x, LOCK.y, st);
  KIT.slab(ctx, t, 'QUESO', { x: x + nw + LOCK.gap + sw / 2, y: LOCK.y - TXT.capH(st) / 2, size: LOCK.slab, rot: -0.035, from: 1 });
  ctx.save();
  ctx.globalAlpha *= LOCK.alpha;
  TXT.draw(ctx, MARK, right ? COL.x + COL.w - 2 : COL.x + 2, LOCK.markY, { font: F.sans, weight: 600, size: LOCK.markSize, tracking: 0.04, fill: P.mozz, stroke: P.patent, strokeWidth: 4, align: right ? 'right' : 'left' });
  ctx.restore();
}});

// ---------------------------------------------------------------- 4. the commandments

// pickups: the words before the hit, white caps on tomato slabs, as in the film. Each shot sets them where its
// slice leaves room: rows of slabs, a row given by its word indices, its left edge (or its right edge, with
// align: 'right') and its centre line.
const SLAB_PAD = 0.17, SLAB_GAP = 14;
const PICK = {
  s075: { size: 170, rows: [{ wi: [0, 1], x: COL.x, y: 1312 }] },
  s076: { size: 150, rows: [{ wi: [0], x: COL.x, y: 1010 }, { wi: [1], x: COL.x, y: 1194 }] },
  s077: { size: 144, rows: [{ wi: [0, 1], x: COL.x, y: 1150 }, { wi: [2, 3], x: COL.x, y: 1330 }] },
  s078: { size: 170, rows: [{ wi: [0], x: 896, y: 520, align: 'right' }, { wi: [1], x: 896, y: 730, align: 'right' }] },
  s079: { size: 170, rows: [{ wi: [0, 1], x: COL.x, y: 1312 }] },
};
function pickups(ctx, t, c) {
  const L = LYR.line(c.li), p = PICK[c.sid], st = { font: F.caps, tracking: 0.01, upper: true, size: p.size };
  for (const row of p.rows) {
    const ws = row.wi.map(i => TXT.width(L.words[i].w, st) + 2 * SLAB_PAD * p.size);
    const total = ws.reduce((a, b) => a + b, 0) + SLAB_GAP * (ws.length - 1);
    let x = row.align === 'right' ? row.x - total : row.x;
    row.wi.forEach((i, k) => {
      KIT.slab(ctx, t, L.words[i].w, { x: x + ws[k] / 2, y: row.y, size: p.size, rot: i % 2 ? 0.025 : -0.025, bg: P.tomato, ink: P.mozz, from: 1.25, li: c.li, wi: i });
      x += ws[k] + SLAB_GAP;
    });
  }
}

// poster: the whole frame in tomato with the line in caps, from tHit. Every row is set as wide as the column.
// The hit frame is the negative, red caps on white. The field stays put and the type takes the hit: the verb
// lands a little large and the block jumps and shakes, 10% in all on the hit frame. All of it grows about the
// line x = POST.ax, the one from which a row 10% over its size reaches the left edge of the frame and the right
// edge of SAFE together, so the type is never cut by the frame and never under the interface.
const POST = { x: 62, w: 842, top: 540, gap: 46, from: 1.055, punch: 0.035, shake: 8 };
POST.ax = (SAFE.x1 - 4 - 1.1 * (POST.x + POST.w)) / (1 - 1.1);
const CAPS = { font: F.caps, tracking: 0.005, upper: true };
function poster(ctx, t, c) {
  const L = LYR.line(c.li), flash = t - c.tHit < FRAME, ink = flash ? P.tomato : P.mozz;
  rule(ctx, 0, 0, W, H, flash ? P.mozz : P.tomato);
  // the rows, top down
  const rows = [];
  let y = POST.top;
  for (const wi of c.rows) {
    const text = wi.map(i => L.words[i].w).join(' '), size = TXT.fit(text, { w: POST.w }, CAPS), cap = TXT.capH({ ...CAPS, size });
    rows.push({ wi, size, cap, y });
    y += cap + POST.gap;
  }
  const cy = (POST.top + y - POST.gap) / 2;
  const cam = CAM.mix(CAM.shake(t, c.tHit, POST.shake), CAM.punch(t, c.tHit, POST.punch), CAM.beat(t, 0.01));
  ctx.save();
  ctx.translate(POST.ax + cam.x, cy + cam.y); ctx.rotate(cam.rot); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-POST.ax, -cy);
  for (const r of rows) {
    const st = { ...CAPS, size: r.size, fill: ink }, sp = TXT.width(' ', st) + 2 * CAPS.tracking * r.size;
    let x = POST.x;
    for (const i of r.wi) {
      const w = TXT.width(L.words[i].w, st), lt = t - L.words[i].t0;
      if (lt >= 0) {
        const s = KIT.slam(lt, POST.from, 0.07), ry = r.y + r.cap / 2;
        ctx.save();
        ctx.translate(POST.ax, ry); ctx.scale(s, s); ctx.translate(-POST.ax, -ry);
        TXT.draw(ctx, L.words[i].w, x, r.y + r.cap, st);
        mark(ctx, c.li, i, r.size);
        ctx.restore();
      }
      x += w + sp;
    }
  }
  ctx.restore();
}

for (const c of CMD) {
  SCENE_V({ id: `v07.no.${c.sid}`, t0: c.t0, t1: c.t1, z: Z_GFX, draw(ctx, t) {
    if (t < c.tHit) pickups(ctx, t, c);
    else poster(ctx, t, c);
  }});
}

// ---------------------------------------------------------------- 5. "Pásame los cuatro quesos"

// The tomato field is the whole frame. The line stands in a column on the left, four words, four rows. On the
// right of each row a window of the picture holds one of the four plates, the cheese in the middle of the part
// of the window that is clear of the interface. From the stop each row is a reel: it spins through the four
// cheeses and stops on QUESO, top to bottom, on beats 298 to 299.5, and its window takes the hit.
const Q = { split: 590, top: 356, k: 0.8, seam: 8 };   // k: frame px per clip px in a window
Q.row = (FLOOR - Q.top) / 4;
const QCOL = { x: COL.x, w: Q.split - 28 - COL.x };
// the plates at rest, top to bottom of the diamond: the middle of each cheese in clip px (1920 x 1080)
const PLATES = [[962, 262], [535, 518], [1382, 520], [957, 795]];
const CHEESES = ['PARMESANO', 'MOZZARELLA', 'PROVOLONE', 'GORGONZOLA'];   // the cheese of each row's window
// rows each reel travels before it stops. Four apart, so that at any step the four reels show four different
// names and each one's last name is its own cheese.
const TURNS = [6, 10, 14, 18];
const rowY = i => Q.top + Q.row * i;

SCENE_V({ id: 'v07.s080', t0: SHOT.t0('s080'), t1: SHOT.t1('s080'), z: 0, draw(ctx, t) {
  rule(ctx, 0, 0, W, H, P.tomato);
  PLATES.forEach(([px, py], i) => {
    const box = { x: Q.split, y: rowY(i) + Q.seam / 2, w: W - Q.split, h: Q.row - Q.seam };
    crop(ctx, 's080', t, box, { fx: px / 1920, fy: py / 1080, zoom: zoomFor(box, Q.k), tx: (Q.split + SAFE.x1) / 2, cam: CAM.punch(t, [B(293), REEL_STOPS[i]], 0.05) });
  });
}});

function quesos(ctx, t, li) {
  const L = LYR.line(li), st = { font: F.caps, tracking: 0.005, upper: true, fill: P.mozz };
  const fitTo = { w: QCOL.w - 14, h: Q.row - 70 }, cx = QCOL.x + QCOL.w / 2;
  const size = Math.min(...L.words.map(v => TXT.fit(v.w, fitTo, st)));
  // one symbol of a reel: text centred in its row, moved dy down the reel
  const symbol = (i, text, dy, s, sz, fill) => {
    ctx.save(); ctx.translate(cx, rowY(i) + Q.row / 2 + dy); ctx.scale(s, s);
    TXT.draw(ctx, text, 0, 0, { ...st, fill, size: sz, align: 'center', baseline: 'center' });
    ctx.restore();
  };
  L.words.forEach((v, i) => {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, rowY(i), Q.split, Q.row); ctx.clip();
    if (t < STOP) {
      const lt = t - v.t0;
      if (lt >= 0) {
        const flash = lt < FRAME;                       // the hit frame, in negative
        if (flash) rule(ctx, 0, rowY(i), Q.split, Q.row, P.mozz);
        symbol(i, v.w, 0, KIT.slam(lt, 1.14, 0.07), size, flash ? P.tomato : P.mozz);
        mark(ctx, li, i, size);
      }
    } else {
      const n = TURNS[i], u = clamp((t - STOP) / (REEL_STOPS[i] - STOP)), p = n * (1 - Math.pow(1 - u, 1.5));
      for (const r of [Math.floor(p), Math.floor(p) + 1]) {
        if (r > n) continue;
        // the last name a reel shows is the cheese in its own window: QUESO pushes it out
        const text = r === 0 ? v.w : r === n ? 'QUESO' : CHEESES[(i + n - 1 - r) % 4];
        const sz = r === 0 ? size : TXT.fit(text, fitTo, st);
        symbol(i, text, (p - r) * Q.row, r === n && u >= 1 ? KIT.slam(t - REEL_STOPS[i], 1.14, 0.08) : 1, sz, P.mozz);
        if (r === 0 && p < 0.25) mark(ctx, li, i, size);
      }
    }
    ctx.restore();
  });
  for (let i = 1; i < 4; i++) rule(ctx, QCOL.x, rowY(i) - 3, QCOL.w, 6, P.mozz);
}
SCENE_V({ id: 'v07.quesos', t0: B(293), t1: T_CARD, z: Z_GFX, draw(ctx, t) {
  quesos(ctx, t, 79);
}});

// ---------------------------------------------------------------- 6. the end card

// Beats 300 to 304, as in v01. The apparition of the next shot glows under a dark veil. QUESO as the label's
// slab, her name under it, then the date and where to hear it in the film's small tracked capitals, and the
// handle.
const CREDIT = { font: F.sans, weight: 700, upper: true, tracking: 0.16, fill: P.mozz, align: 'center' };
const CARD = { x: W / 2, y: 650, size: 272, veil: 0.66 };
SCENE_V({ id: 'v07.fin', t0: T_CARD, t1: T_OUT, z: Z_GFX, draw(ctx, t) {
  ctx.save(); ctx.globalAlpha *= CARD.veil; rule(ctx, 0, 0, W, H, P.patent); ctx.restore();
  const r = KIT.slab(ctx, t, 'QUESO', { x: CARD.x, y: CARD.y, size: CARD.size, rot: -0.035, from: 1 });
  const yName = CARD.y + r.h / 2 + CARD.size * 0.4;
  if (t >= B(300.5)) TXT.draw(ctx, 'Saindra', CARD.x, yName, { font: F.book, italic: true, weight: 500, size: CARD.size * 0.34, fill: P.mozz, align: 'center' });
  if (t >= B(301)) TXT.draw(ctx, '14 de octubre', CARD.x, yName + 150, { ...CREDIT, size: 58 });
  if (t >= B(301.5)) {
    TXT.draw(ctx, 'En todas las plataformas', CARD.x, yName + 216, { ...CREDIT, size: 34 });
    TXT.draw(ctx, MARK, CARD.x, yName + 292, { font: F.sans, weight: 600, size: 34, tracking: 0.04, fill: P.mozz, opacity: 0.85, align: 'center' });
  }
}});
