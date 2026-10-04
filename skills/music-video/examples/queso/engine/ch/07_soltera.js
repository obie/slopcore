// 07_soltera.js: chapter 7, chorus 3 and the breakdown. Beats 248 to 300 (152.26 to 184.09 s), shots s067 to
// s080, lines 66 to 79.
//
// He is gone. Chorus 3 is the victory lap: the nutrition label comes back in gold, and now the frame itself is
// the label. A gold frame with a band over her spread arms (s067), the same frame with the band under the
// procession, the PROGRESO bar at 100% and basil confetti (s068), then gold all over with her in the product
// window (s071). His counter has nobody to run it and
// reads Error. Hers runs to 9999. The breakdown is five commandments: a beat of picture with "No me" ticking
// in at the top right, then the whole frame goes tomato red on the kick with the line in caps. The sixth line,
// "Pásame los cuatro quesos", shares the frame with the four cheeses, and in the stop its four rows spin like a
// slot machine and pay out QUESO four times.
//
// Every shot here is, or will be, a Seedance clip. So nothing is pinned to a pixel of the picture: every
// surface sits in a part of the frame the clips keep clear, and no surface needs a matte.
//
// Private helpers (the kit has no call for these): goldFrame, crown, foot, brand (the gold label), basil,
// hisPanel (a text readout), herPanel (four digits), pickups, poster, quesos.

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;
const P = PAL, F = FACE, INK = PAL.patent;
const rule = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
const capFirst = s => s.charAt(0).toLocaleUpperCase('es') + s.slice(1);
const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));
const FRAME = 1 / 24;

// the hits of the chapter
const QUESO_1 = word(66, 4).t0;      // s067, on beat 250
const FULL = B(255);                 // the PROGRESO bar reaches 100%
const QUESO_2 = word(70, 4).t0;      // s071
const SNAP = B(269);                 // the tape snaps in the clip, RECHAZADO lands
const ERROR = word(72, 2).t0;        // "calorías": his counter gives up
const MAX = B(280);                  // her counter reaches 9999
const STOP = B(297);                 // the vocal stops, the reels start
const REEL_STOPS = [298, 298.5, 299, 299.5].map(B);

// ---------------------------------------------------------------- 1. cameras
// No slow moves: the clips move by themselves. What is left is the hits.

const CAM_OF = {
  s067: t => ({ about: [0.47, 0.17], cam: [CAM.punch(t, QUESO_1, 0.06), CAM.shake(t, QUESO_1, 14)] }),
  s068: t => ({ about: [0.55, 0.2], cam: CAM.punch(t, FULL, 0.05) }),
  // three bites, three plates: a punch on each cut, a shake when COMO lands
  s069: t => ({ about: [0.4, 0.45], cam: [CAM.punch(t, [B(256), B(257), B(258)], 0.05), CAM.shake(t, word(68, 4).t0, 10)] }),
  s070: t => ({ about: [0.48, 0.5], cam: CAM.punch(t, [word(69, 4).t0, B(263)], 0.04) }),
  s071: t => ({ about: [0.45, 0.4], cam: CAM.punch(t, QUESO_2, 0.05) }),
  s072: t => ({ about: [0.45, 0.35], cam: [CAM.punch(t, SNAP, 0.06), CAM.shake(t, SNAP, 16)] }),
  s073: t => ({ about: [0.42, 0.7], cam: CAM.punch(t, ERROR, 0.03) }),
  s074: t => ({ about: [0.42, 0.3], cam: [CAM.beat(t, 0.018), CAM.shake(t, MAX, 12)] }),
  s075: t => ({ about: [0.5, 0.5], cam: CAM.punch(t, B(281), 0.05) }),
  s076: t => ({ about: [0.5, 0.4], cam: CAM.punch(t, B(283), 0.05) }),
  s077: t => ({ about: [0.4, 0.45], cam: CAM.punch(t, [B(285), B(286), B(287)], 0.04) }),
  s078: t => ({ about: [0.4, 0.6], cam: CAM.punch(t, B(289), 0.05) }),
  s079: t => ({ about: [0.55, 0.3], cam: CAM.punch(t, B(291), 0.05) }),
  s080: t => ({ about: [0.5, 0.5], cam: CAM.punch(t, [B(293), STOP], 0.04) }),
};

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s067', 's068', 's070', 's072', 's073', 's074']) {
  SCENE({ id: `07.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}

// s069: three plates, one per beat. The plate is named by its index so the kit can play that plate's clip.
const biteAt = t => clamp(Math.floor(BEAT.pos(t) + 1e-6) - 256, 0, 2);
SCENE({ id: '07.s069', t0: SHOT.t0('s069'), t1: SHOT.t1('s069'), z: 0, draw(ctx, t) {
  SHOT.draw(ctx, 's069', t, { ...CAM_OF.s069(t), plate: biteAt(t) });
}});

// s071: the picture shows through a window in the label, moved so her face and the slice sit inside it.
const WIN = { x: 96, y: 264, w: 914, h: 636 };
SCENE({ id: '07.s071', t0: SHOT.t0('s071'), t1: SHOT.t1('s071'), z: 0, draw(ctx, t) {
  ctx.save();
  ctx.beginPath(); ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h); ctx.clip();
  ctx.translate(-190, 114);
  SHOT.draw(ctx, 's071', t, CAM_OF.s071(t));
  ctx.restore();
}});

// ---------------------------------------------------------------- 3. the gold label, three layouts

const SM = { font: F.sans, weight: 800, fill: INK, tracking: -0.02 };   // "No es", "es"
const HV = { ...STY.label, fill: INK };                                  // the row names
const QS = { font: F.caps, tracking: 0.01, upper: true };                // QUESO

// goldFrame: the frame is the label. Gold fills everything outside the polygon `win`, the window the picture
// shows through, and the label's border runs along the window's edge: a 6 px rule and a hairline 8 px outside it.
function goldFrame(ctx, win) {
  const path = () => { ctx.beginPath(); win.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
  ctx.save();
  path(); ctx.rect(0, 0, W, H);
  ctx.fillStyle = P.gold; ctx.fill('evenodd');
  ctx.clip('evenodd');
  ctx.lineJoin = 'miter';
  for (const [color, lw] of [[INK, 32], [P.gold, 28], [INK, 12]]) { path(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke(); }
  ctx.restore();
}
const EDGE = 34;                     // the gold border on the sides of the frame

// the black QUESO slab with yellow type, centre x, y
function quesoSlab(ctx, t, tHit, x, y, size, from, li) {
  if (t < tHit) return;
  const st = { ...QS, size }, w = TXT.width('QUESO', st) + size * 0.24, h = TXT.capH(st) + size * 0.24, s = KIT.slam(t - tHit, from, 0.09);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-0.035); ctx.scale(s, s);
  ctx.fillStyle = INK; ctx.fillRect(-w / 2, -h / 2, w, h);
  TXT.draw(ctx, 'QUESO', 0, 0, { ...st, fill: P.cheese, align: 'center', baseline: 'center' });
  mark(ctx, li, 4, size);
  ctx.restore();
}

// crown: "No es grasa, es queso". The gold frame with a band across the top, open in the middle for her head.
// The band stops at y 208: in the clip her fingers tap the top of the booth and come up to y 222.
// Left of her: the label's title and "No es Grasa,". Right of her the band comes down on the second "es", as
// the row is struck, and QUESO lands on it.
function crown(ctx, t, li) {
  const L = LYR.line(li), wd = i => L.words[i], on = i => t >= wd(i).t0;
  const yB = 208, xa = 786, xb = 1066, tC = wd(3).t0;
  const hR = t < tC ? 0 : (yB - EDGE) * EASE.outExpo(clamp((t - tC) / 0.14));
  goldFrame(ctx, [[EDGE, yB], [xa, yB], [xa, EDGE], [xb, EDGE], [xb, EDGE + hR], [W - EDGE, EDGE + hR], [W - EDGE, H - EDGE], [EDGE, H - EDGE]]);
  const x0 = 46, x1 = xa - 36, sm = { ...SM, size: 60 }, gap = TXT.width(' ', sm) * 0.9, base = yB - 40;
  TXT.draw(ctx, 'Información Nutricional', x0, 54, { ...HV, size: 42, tracking: -0.035 });
  rule(ctx, x0, 64, x1 - x0, 8, INK);
  let cx = x0;
  if (on(0)) { TXT.draw(ctx, wd(0).w, cx, base, sm); mark(ctx, li, 0, sm.size); }
  cx += TXT.width(wd(0).w, sm) + gap;
  if (on(1)) { TXT.draw(ctx, wd(1).w, cx, base, sm); mark(ctx, li, 1, sm.size); }
  cx += TXT.width(wd(1).w, sm) + gap * 1.3;
  const name = capFirst(wd(2).w), ns = Math.min(122, TXT.fit(name, { w: x1 - cx }, HV)), nst = { ...HV, size: ns };
  if (on(2)) { TXT.draw(ctx, name, cx, base, nst); mark(ctx, li, 2, ns); }
  const u = clamp((t - tC) / 0.09);
  if (u > 0) rule(ctx, cx - 8, base - TXT.capH(nst) / 2 - 7, (TXT.width(name, nst) + 16) * EASE.outCubic(u), 14, P.tomato);
  if (t < tC) return;
  const es = { ...SM, size: 100 }, wEs = TXT.width(wd(3).w, es), yc = (yB - 12) / 2 + 12;
  const size = 178, sw = TXT.width('QUESO', { ...QS, size }) + size * 0.24, xe = (xb + W - EDGE) / 2 - (wEs + 32 + sw) / 2;
  ctx.save();
  ctx.beginPath(); ctx.rect(xb, 0, W - xb, EDGE + hR); ctx.clip();
  TXT.draw(ctx, wd(3).w, xe, yc + TXT.capH(es) / 2, es); mark(ctx, li, 3, es.size);
  ctx.restore();
  quesoSlab(ctx, t, wd(4).t0, xe + wEs + 32 + sw / 2, yc, size, 1.45, li);
}

// foot: "No es culpa, es progreso". The gold frame with a band across the bottom, under the procession. Left
// cell: Culpa, 0%. Right cell: Progreso and a loading bar that takes one chunk per quarter beat.
function foot(ctx, t, li, tIn, o = {}) {
  const { y = 742, b0 = 253.5, step = 0.25, n = 7 } = o;
  const L = LYR.line(li), wd = i => L.words[i], on = i => t >= wd(i).t0;
  const yT = lerp(H - EDGE, y, EASE.outExpo(clamp((t - tIn) / 0.2)));
  goldFrame(ctx, [[EDGE, EDGE], [W - EDGE, EDGE], [W - EDGE, yT], [EDGE, yT]]);
  const tFull = B(b0 + (n - 1) * step), xl = 46, R = W - 46, xDiv = 900, yFoot = y + 250;
  const sm = { ...SM, size: 56 }, gap = TXT.width(' ', sm) * 0.9;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, yT, W, H - yT); ctx.clip();
  rule(ctx, xDiv - 3, y + 34, 6, yFoot - y - 34, INK);
  rule(ctx, xl, yFoot, R - xl, 10, INK);
  TXT.draw(ctx, '* Culpa diaria con base en una dieta de pizza.', xl, y + 296, { font: F.sans, weight: 500, size: 22, fill: INK });
  TXT.draw(ctx, 'Porción: toda', R, y + 296, { font: F.sans, weight: 800, size: 22, fill: INK, align: 'right' });

  // left cell: No es Culpa, 0%
  const xr = xDiv - 30, pct = { ...HV, size: 122 };
  TXT.draw(ctx, '% Culpa diaria*', xr, y + 58, { font: F.sans, weight: 800, size: 24, fill: INK, align: 'right' });
  rule(ctx, xl, y + 68, xr - xl, 2, INK);
  const base = y + 68 + (yFoot - y - 68 + TXT.capH(pct)) / 2;
  let cx = xl;
  if (on(0)) { TXT.draw(ctx, wd(0).w, cx, base, sm); mark(ctx, li, 0, sm.size); }
  cx += TXT.width(wd(0).w, sm) + gap;
  if (on(1)) { TXT.draw(ctx, wd(1).w, cx, base, sm); mark(ctx, li, 1, sm.size); }
  cx += TXT.width(wd(1).w, sm) + gap * 1.3;
  const wPct = TXT.width('0%', pct);
  const name = capFirst(wd(2).w), ns = Math.min(122, TXT.fit(name, { w: xr - wPct - 26 - cx }, HV));
  if (on(2)) {
    TXT.draw(ctx, name, cx, base, { ...HV, size: ns }); mark(ctx, li, 2, ns);
    const s = KIT.slam(t - wd(2).t0, 1.7, 0.08);
    ctx.save(); ctx.translate(xr - wPct / 2, base - TXT.capH(pct) / 2); ctx.scale(s, s);
    TXT.draw(ctx, '0%', 0, 0, { ...pct, align: 'center', baseline: 'center' });
    ctx.restore();
  }

  // right cell: es Progreso, the bar, the percentage
  const x2 = xDiv + 30, b1 = y + 124;
  if (on(3)) { TXT.draw(ctx, wd(3).w, x2, b1, sm); mark(ctx, li, 3, sm.size); }
  if (on(4)) {
    const xp = x2 + TXT.width(wd(3).w, sm) + gap * 1.3, pn = capFirst(wd(4).w), ps = Math.min(114, TXT.fit(pn, { w: R - xp }, HV));
    TXT.draw(ctx, pn, xp, b1, { ...HV, size: ps }); mark(ctx, li, 4, ps);
    const pc = { ...HV, size: 76 }, by = y + 162, bh = 74, bw = R - x2 - TXT.width('100%', pc) - 24;
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(x2 + 2.5, by + 2.5, bw - 5, bh - 5);
    const cw = (bw - 22 - (n - 1) * 6) / n;
    let done = 0;
    for (let i = 0; i < n; i++) {
      const lt = t - B(b0 + i * step);
      if (lt < 0) continue;
      done++;
      const s = lerp(0.3, 1, EASE.outCubic(clamp(lt / 0.07)));
      ctx.fillStyle = INK;
      ctx.fillRect(x2 + 11 + i * (cw + 6), by + 11 + ((bh - 22) * (1 - s)) / 2, cw, (bh - 22) * s);
    }
    const s = t >= tFull ? KIT.slam(t - tFull, 1.5, 0.08) : 1, label = `${Math.round((100 * done) / n)}%`;
    ctx.save(); ctx.translate(R - TXT.width(label, pc) / 2, by + bh / 2); ctx.scale(s, s);
    TXT.draw(ctx, label, 0, 0, { ...pc, align: 'center', baseline: 'center' });
    ctx.restore();
  }
  ctx.restore();
}

// basil: a burst of basil leaves from behind the top edge of the band. Each leaf flies a parabola from t0.
function basil(ctx, t, t0, seed, o = {}) {
  const lt = t - t0;
  if (lt < 0) return;
  const { n = 30, y0 = 760, x0 = 110, x1 = 1810, g = 2500 } = o, r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x = r.range(x0, x1), vx = r.range(-240, 240), peak = r.range(80, 250), len = r.range(40, 78), rot = r.range(0, TAU), spin = r.range(-7, 7);
    const vy = Math.sqrt(2 * g * peak), yy = y0 - vy * lt + (g * lt * lt) / 2;
    if (yy > y0 + 60) continue;
    ctx.save();
    ctx.translate(x + vx * lt, yy); ctx.rotate(rot + spin * lt);
    const hw = len * 0.3;
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.bezierCurveTo(-len * 0.22, -hw * 1.5, len * 0.24, -hw * 1.15, len / 2, 0);
    ctx.bezierCurveTo(len * 0.24, hw * 1.15, -len * 0.22, hw * 1.5, -len / 2, 0);
    ctx.fillStyle = P.basil; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-len * 0.42, 0); ctx.lineTo(len * 0.4, 0); ctx.stroke();
    ctx.restore();
  }
}

// brand: the label as the whole frame, in gold, with a window for the product photograph (WIN). The title
// runs across the top as on the chorus 2 label; the line sets in the column to the right of the window.
function brand(ctx, t, li) {
  const L = LYR.line(li), wd = i => L.words[i], on = i => t >= wd(i).t0;
  const pad = 96, R = W - pad, tSlam = wd(4).t0;
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h); ctx.fill('evenodd');
  ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.lineWidth = 3; ctx.strokeRect(52, 52, W - 104, H - 104);
  ctx.lineWidth = 10; ctx.strokeRect(WIN.x, WIN.y, WIN.w, WIN.h);
  const title = { ...HV, size: 96, tracking: -0.035 };
  TXT.draw(ctx, 'Información', pad, 172, title);
  TXT.draw(ctx, 'Nutricional', R, 172, { ...title, align: 'right' });
  rule(ctx, pad, 206, W - 2 * pad, 28, INK);
  rule(ctx, pad, 930, W - 2 * pad, 14, INK);
  TXT.draw(ctx, 'Porción: toda', pad, 990, { font: F.sans, weight: 700, size: 34, fill: INK });
  TXT.draw(ctx, '* Culpa diaria con base en una dieta de pizza.', R, 990, { font: F.sans, weight: 500, size: 30, fill: INK, align: 'right' });

  const cx = WIN.x + WIN.w + 58, cw = R - cx, sm = { ...SM, size: 104 }, sp = TXT.width(' ', sm), y1 = 362;
  ctx.save();
  CAM.apply(ctx, [CAM.shake(t, tSlam, 10), { zoom: 1 + 0.02 * KIT.hit(t, tSlam, 0.22) }]);
  if (on(0)) { TXT.draw(ctx, wd(0).w, cx, y1, sm); mark(ctx, li, 0, sm.size); }
  if (on(1)) { TXT.draw(ctx, wd(1).w, cx + TXT.width(wd(0).w, sm) + sp, y1, sm); mark(ctx, li, 1, sm.size); }
  const name = capFirst(wd(2).w), ns = Math.min(250, TXT.fit(name, { w: cw }, HV)), nst = { ...HV, size: ns };
  const base = y1 + 46 + TXT.capH(nst);
  if (on(2)) { TXT.draw(ctx, name, cx, base, nst); mark(ctx, li, 2, ns); }
  const u = clamp((t - wd(3).t0) / 0.09);
  if (u > 0) rule(ctx, cx - 12, base - TXT.capH(nst) / 2 - ns * 0.06, (TXT.width(name, nst) + 24) * EASE.outCubic(u), ns * 0.12, P.tomato);
  const wEs = TXT.width(wd(3).w, sm) + sp, size = Math.min(250, TXT.fit('QUESO', { w: cw - wEs - 60 }, QS));
  const qst = { ...QS, size }, qw = TXT.width('QUESO', qst) + size * 0.24, qh = TXT.capH(qst) + size * 0.24, qy = base + 52 + qh / 2;
  if (on(3)) { TXT.draw(ctx, wd(3).w, cx, qy + TXT.capH(sm) / 2, sm); mark(ctx, li, 3, sm.size); }
  quesoSlab(ctx, t, tSlam, cx + wEs + qw / 2, qy, size, 1.9, li);
  ctx.restore();
}

// ---------------------------------------------------------------- 4. chorus 3

// Lines 66 and 67. The gold frame holds over the cut: the band is over her arms, then under the waiters. The
// leaves come out from behind the band when the bar is full, and again half a beat later.
SCENE({ id: '07.crown', t0: B(248), t1: B(251), z: Z_GFX, draw(ctx, t) {
  crown(ctx, t, 66);
}});
SCENE({ id: '07.progreso', t0: B(251), t1: B(256), z: Z_GFX, draw(ctx, t) {
  basil(ctx, t, FULL, 7);
  basil(ctx, t, B(255.5), 19, { n: 22 });
  foot(ctx, t, 67, B(251));
}});

// Line 68, "Mira cómo me lo como": the words of each bite, on the side of the frame her face leaves free in
// that plate. The cut to the next bite takes them with it. "cómo" starts a frame before the second bite and is
// sung across the cut, so it is set in both. COMO is the yellow one and gets bitten twice.
const MIRA = [
  [{ wi: 0, text: 'MIRA', x: 1590, y: 190, size: 220, rot: -0.04, bg: P.mozz, from: 1.6 },
    { wi: 1, text: 'CÓMO', x: 1580, y: 480, size: 220, rot: 0.03, bg: P.mozz, from: 1.3 }],
  [{ wi: 1, text: 'CÓMO', x: 300, y: 200, size: 210, rot: -0.03, bg: P.mozz, from: 1 },
    { wi: 2, text: 'ME', x: 1445, y: 190, size: 220, rot: 0.03, bg: P.mozz, from: 1.6 },
    { wi: 3, text: 'LO', x: 1735, y: 200, size: 220, rot: -0.04, bg: P.mozz, from: 1.6 }],
  [{ wi: 4, text: 'COMO', x: 1500, y: 230, size: 300, rot: -0.04, bg: P.cheese, from: 1.4 }],
];
const NIBBLES = [
  [{ x: 1830, y: 110, r: 88, rot: 2.6, t: B(256.75) }],
  [{ x: 520, y: 290, r: 84, rot: 3.6, t: B(257.5) }, { x: 1880, y: 110, r: 84, rot: 2.5, t: B(257.875) }],
  [{ x: 1850, y: 110, r: 110, rot: 2.5, t: B(258.5) }, { x: 1170, y: 340, r: 100, rot: -0.5, t: B(258.75) }],
];
SCENE({ id: '07.mira', t0: B(256), t1: B(259), z: Z_GFX, draw(ctx, t) {
  const i = biteAt(t);
  KIT.bitten(ctx, t, g => { for (const s of MIRA[i]) KIT.slab(g, t, s.text, { ...s, li: 68 }); }, NIBBLES[i]);
}});

// Line 69, "Y te mando un beso": the napkin again, with a second print beside the first. In the clip her face
// comes right up to the lens and fills the frame, so the napkin lies in the bottom right corner, on the booth,
// the one part of the frame her face never reaches.
const NAPKIN = { x: 1376, y: 636, w: 510, rot: 0.05 };
SCENE({ id: '07.napkin', t0: B(259), t1: B(264), z: Z_GFX, draw(ctx, t) {
  KIT.napkin(ctx, t, 69, NAPKIN);
  const k = NAPKIN.w / 620;
  ctx.save();                                           // the napkin's own frame, 620 x 500
  ctx.translate(NAPKIN.x + NAPKIN.w / 2, NAPKIN.y + 250 * k); ctx.rotate(NAPKIN.rot); ctx.scale(k, k); ctx.translate(-310, -250);
  KIT.kiss(ctx, t, { x: 262, y: 420, size: 200, rot: 0.2, tHit: B(263) });
  ctx.restore();
}});

// Line 70: the label is the whole frame, and she is the brand.
SCENE({ id: '07.marca', t0: B(264), t1: B(267), z: Z_GFX, draw(ctx, t) {
  brand(ctx, t, 70);
}});

// Line 71, "No me vengas con complejos". His app still sends its reminder. She answers, and it is stamped on
// the beat the tape snaps. "No" is sung two frames before the cut, so her block starts there, over the label.
SCENE({ id: '07.complejos', t0: word(71, 0).t0, t1: B(271), z: Z_GFX, draw(ctx, t) {
  KIT.notice(ctx, t, { x: 44, y: 44, w: 560, body: ['Recordatorio semanal:', 'medir la cintura.'], tIn: B(267), from: 'left' });
  KIT.quote(ctx, t, 71, { who: 'hers', x: 1318, y: 44, w: 558, size: 80, tail: null, hug: false });
  KIT.stamp(ctx, t, { x: 330, y: 132, size: 96, rot: -0.1, tHit: SNAP, from: 1.5 });
}});

// Line 72, "Tú contando calorías": his panel, with nobody to run it. The total hunts for a reading, gives up on
// "calorías" and blinks Error. His tag finds the seat and reads it as nobody.
function hisPanel(ctx, t, o) {
  const { x, y, w, li, tIn, readout = '0', status = null, tStatus = Infinity } = o;
  if (t < tIn) return;
  const L = LYR.line(li), D = 620, Hh = status ? 412 : 356, k = w / D, pad = 34;
  const words = L.words.map(v => v.w), head = words.slice(0, -1), last = words[words.length - 1], iLast = words.length - 1;
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, D * EASE.outExpo(clamp((t - tIn) / 0.14)), Hh); ctx.clip();
  ctx.fillStyle = P.patent; ctx.fillRect(0, 0, D, Hh);
  ctx.strokeStyle = P.ice; ctx.lineWidth = 2.5; ctx.strokeRect(10, 10, D - 20, Hh - 20);
  const st = { ...STY.his, size: 62 };
  const size = Math.min(62, TXT.fit(head.join(' '), { w: D - 2 * pad }, st), TXT.fit(last, { w: D - 2 * pad }, st));
  let cx = pad;
  head.forEach((wd, i) => {
    if (t >= L.words[i].t0) { TXT.draw(ctx, wd, cx, 94, { ...st, size }); mark(ctx, li, i, size); }
    cx += TXT.width(wd + ' ', { ...st, size });
  });
  if (t >= L.words[iLast].t0) { TXT.draw(ctx, last, pad, 94 + size * 1.22, { ...st, size }); mark(ctx, li, iLast, size); }
  const us = { font: F.mono, weight: 600, size: SIZE.note, fill: P.ice }, ux = D - pad, dx = ux - TXT.width('kcal', us) - 18;
  const seg = { ...STY.seg, size: Math.min(108, TXT.fit('888888', { w: dx - pad }, STY.seg)) };
  TXT.draw(ctx, 'kcal', ux, 312, { ...us, align: 'right' });
  TXT.draw(ctx, '888888', dx, 312, { ...seg, align: 'right', opacity: 0.13 });
  if (readout) TXT.draw(ctx, readout, dx, 312, { ...seg, align: 'right' });
  if (status && t >= tStatus) TXT.draw(ctx, status, pad, 374, { font: F.mono, weight: 700, size: SIZE.note, fill: P.ice });
  ctx.restore();
}
SCENE({ id: '07.his', t0: B(271), t1: B(275), z: Z_GFX, draw(ctx, t) {
  // before Error: a new guess on every sixteenth note. After: Error, off for the last third of each half beat.
  const guess = Math.floor(hash(Math.floor(BEAT.pos(t) * 4 + 1e-4), 7) * 2310);
  const readout = t < B(271.5) ? '0' : t < ERROR ? String(guess) : (BEAT.pos(t) * 2 + 1e-4) % 1 < 0.66 ? 'Error' : '';
  hisPanel(ctx, t, { x: 56, y: 48, w: 600, li: 72, tIn: B(271), readout, status: 'USUARIO NO ENCONTRADO', tStatus: ERROR });
  // the empty seat. A loose box in frame pixels, far wider than any drift of the picture; it blinks out before the cut.
  const tOut = B(274.5), lit = t < tOut || (t < B(274.875) && (BEAT.pos(t) * 8 + 1e-4) % 1 < 0.5);
  if (lit) KIT.hisTag(ctx, t, { x: 1130, y: 96, w: 690, h: 360, label: 'NADIE', kcal: 0, tIn: B(272), chip: 'tl', lead: 0 });
}});

// Line 73, "Yo contando pepperonis": her panel, with room for four digits. The count runs from the cut, faster
// and faster, and stops at 9999 on beat 280. The panel also covers the candle with the glyph in its glow.
function herPanel(ctx, t, o) {
  const { x, y, w, li, tIn, n = 0, pop = 1 } = o;
  if (t < tIn) return;
  const L = LYR.line(li), D = 900, Hh = 250, k = w / D, pad = 34;
  const words = L.words.map(v => v.w), head = words.slice(0, -1), last = words[words.length - 1], iLast = words.length - 1;
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, D * EASE.outExpo(clamp((t - tIn) / 0.14)), Hh); ctx.clip();
  ctx.fillStyle = P.tomato; ctx.fillRect(0, 0, D, Hh);
  const big = { font: F.caps, size: 200, fill: P.mozz }, dw = TXT.width('0', big) + 6, numW = dw * 4, nx = D - pad - numW / 2;
  rule(ctx, D - pad - numW - 30, 30, 5, Hh - 60, P.mozz);
  const digits = String(Math.min(9999, Math.round(n))).padStart(4, '0');
  ctx.save(); ctx.translate(nx, Hh / 2); ctx.scale(pop, pop);
  for (let i = 0; i < 4; i++) TXT.draw(ctx, digits[i], (i - 1.5) * dw, 0, { ...big, align: 'center', baseline: 'center' });
  ctx.restore();
  const st = { ...STY.caps, size: 84 }, room = D - 2 * pad - numW - 56;
  const size = Math.min(84, TXT.fit(head.join(' '), { w: room }, st), TXT.fit(last, { w: room }, st));
  const cap = TXT.capH({ ...st, size }), y1 = Hh / 2 - 12, y2 = y1 + cap + 26;
  let cx = pad;
  head.forEach((wd, i) => {
    if (t >= L.words[i].t0) { TXT.draw(ctx, wd, cx, y1, { ...st, size }); mark(ctx, li, i, size); }
    cx += TXT.width(wd + ' ', { ...st, size });
  });
  if (t >= L.words[iLast].t0) { TXT.draw(ctx, last, pad, y2, { ...st, size }); mark(ctx, li, iLast, size); }
  ctx.restore();
}
SCENE({ id: '07.hers', t0: word(73, 0).t0, t1: B(281), z: Z_GFX, draw(ctx, t) {
  const n = KIT.race(t, B(275), MAX, 0, 9999, 3.2);
  const pop = 1 + 0.04 * BEAT.pulse(t, 0.16) + 0.07 * KIT.hit(t, MAX, 0.2);
  herPanel(ctx, t, { x: 1010, y: 794, w: 866, li: 73, tIn: word(73, 0).t0, n, pop });
}});

// ---------------------------------------------------------------- 5. the breakdown: commandments

// pickups: the words before the hit, small white caps on tomato, set right-aligned in a row at the top right.
function pickups(ctx, t, li, upTo, o = {}) {
  const { right = 1872, y = 130, size = 150, gap = 14 } = o;
  const L = LYR.line(li), st = { font: F.caps, tracking: 0.01, upper: true, size };
  const ws = L.words.slice(0, upTo).map(v => TXT.width(v.w, st) + 2 * 0.17 * size);
  let x = right - ws.reduce((a, b) => a + b, 0) - gap * (upTo - 1);
  for (let i = 0; i < upTo; i++) {
    KIT.slab(ctx, t, L.words[i].w, { x: x + ws[i] / 2, y, size, rot: i % 2 ? 0.025 : -0.025, bg: P.tomato, ink: P.mozz, from: 1.8, li, wi: i });
    x += ws[i] + gap;
  }
}

// poster: the whole frame in tomato with the line in caps, from tHit. The hit frame is the negative: red caps
// on white. The field stays put and the type takes the shake.
function poster(ctx, t, li, tHit) {
  const flash = t - tHit < FRAME;
  rule(ctx, 0, 0, W, H, flash ? P.mozz : P.tomato);
  ctx.save();
  CAM.apply(ctx, [CAM.shake(t, tHit, 16), CAM.punch(t, tHit, 0.04), CAM.beat(t, 0.012)]);
  KIT.commandment(ctx, t, li, { bg: null, ink: flash ? P.tomato : P.mozz, tIn: tHit });
  ctx.restore();
}

// One line per cut. `hit` is the word that brings the poster: the verb, which lands on the kick. The long line
// holds its picture until the last word.
const CMD = [
  { sid: 's075', li: 74, hit: 2 },
  { sid: 's076', li: 75, hit: 2 },
  { sid: 's077', li: 76, hit: 4, pick: { size: 116, y: 110 } },
  { sid: 's078', li: 77, hit: 2 },
  { sid: 's079', li: 78, hit: 2 },
];
for (const c of CMD) {
  const tHit = word(c.li, c.hit).t0, t0 = SHOT.t0(c.sid), t1 = SHOT.t1(c.sid);
  SCENE({ id: `07.${c.sid}`, t0, t1, z: 0, draw(ctx, t) { if (t < tHit) SHOT.draw(ctx, c.sid, t, CAM_OF[c.sid](t)); } });
  SCENE({ id: `07.no.${c.sid}`, t0, t1, z: Z_GFX, draw(ctx, t) {
    if (t < tHit) pickups(ctx, t, c.li, c.hit, c.pick);
    else poster(ctx, t, c.li, tHit);
  }});
}

// Line 79, "Pásame los cuatro quesos". The picture moves left so the four plates keep the left three fifths of
// the frame, and the line takes the tomato column on the right: four words, four rows. From the stop each row
// is a reel. It spins through the four cheeses and stops on QUESO, top to bottom, on beats 298 to 299.5.
const COL = { x: 1280, w: 640, top: 44, row: 248 };
const CHEESES = ['MOZZARELLA', 'PARMESANO', 'GORGONZOLA', 'PROVOLONE'];
const TURNS = [7, 10, 13, 16];       // rows each reel travels before it stops
SCENE({ id: '07.s080', t0: SHOT.t0('s080'), t1: SHOT.t1('s080'), z: 0, draw(ctx, t) {
  ctx.save();
  ctx.translate(COL.x / 2 - W / 2, 0);
  SHOT.draw(ctx, 's080', t, CAM_OF.s080(t));
  ctx.restore();
}});
function quesos(ctx, t, li) {
  const L = LYR.line(li), st = { font: F.caps, tracking: 0.005, upper: true, fill: P.mozz };
  const fitTo = { w: COL.w - 110, h: COL.row - 44 };
  const size = Math.min(...L.words.map(v => TXT.fit(v.w, fitTo, st)));
  rule(ctx, COL.x, 0, COL.w, H, P.tomato);
  // one symbol of a reel: text centred in its row, moved dy down the reel
  const symbol = (i, text, dy, s, sz) => {
    const cy = COL.top + COL.row * (i + 0.5) + dy;
    ctx.save(); ctx.translate(COL.x + COL.w / 2, cy); ctx.scale(s, s);
    TXT.draw(ctx, text, 0, 0, { ...st, size: sz, align: 'center', baseline: 'center' });
    ctx.restore();
  };
  L.words.forEach((v, i) => {
    const y = COL.top + COL.row * i;
    ctx.save();
    ctx.beginPath(); ctx.rect(COL.x, i ? y : 0, COL.w, i === 3 ? H - y : i ? COL.row : COL.top + COL.row); ctx.clip();
    if (t < STOP) {
      const lt = t - v.t0;
      if (lt >= 0) {
        if (lt < FRAME) { rule(ctx, COL.x, 0, COL.w, H, P.mozz); st.fill = P.tomato; }      // the hit frame, in negative
        symbol(i, v.w, 0, KIT.slam(lt, 1.35, 0.07), size);
        mark(ctx, li, i, size);
        st.fill = P.mozz;
      }
    } else {
      const n = TURNS[i], u = clamp((t - STOP) / (REEL_STOPS[i] - STOP)), p = n * (1 - Math.pow(1 - u, 1.5));
      for (const r of [Math.floor(p), Math.floor(p) + 1]) {
        if (r > n) continue;
        const text = r === 0 ? v.w : r === n ? 'QUESO' : CHEESES[(r + i) % 4];
        const sz = r === 0 ? size : TXT.fit(text, fitTo, st);
        symbol(i, text, (p - r) * COL.row, r === n && u >= 1 ? KIT.slam(t - REEL_STOPS[i], 1.22, 0.08) : 1, sz);
        if (r === 0 && p < 0.25) mark(ctx, li, i, size);
      }
    }
    ctx.restore();
  });
  for (let i = 1; i < 4; i++) rule(ctx, COL.x + 40, COL.top + COL.row * i - 3, COL.w - 80, 6, P.mozz);
}
SCENE({ id: '07.quesos', t0: B(293), t1: B(300), z: Z_GFX, draw(ctx, t) {
  quesos(ctx, t, 79);
}});
