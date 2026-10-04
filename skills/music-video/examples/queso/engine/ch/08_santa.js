// 08_santa.js: chapter 8, the final chorus. Beats 300 to 333 (184.09 to 204.30 s), shots s081 to s088,
// lines 80 to 87.
//
// Her canonisation. The nutrition label becomes an altarpiece: a gold retablo with her in the niche (s081), a
// gold arched panel beside the conga line (s082), and gold leaf set straight on the apparition like the print
// of a prayer card (s085). Between them the chorus repeats its devices one last time: a word per bite, the
// napkin and its kisses, the line stamped on a pizza box lid, his counter at zero, her counter at a million.
//
// Every shot here is, or will be, a Seedance clip. So nothing is pinned to plate pixels: each surface sits in
// frame space, in a part of the frame her face and hands stay out of, and holds up when the picture moves.
// Cameras carry punches and shakes only; a plate that is still waiting for its clip takes SHOT.draw's default
// push.
//
// Layout, as in 01_aperitivo.js: cameras, picture scenes at z 0, lyric surfaces at z 10. The retablo, the altar
// panel, the prayer card, the stamped lid and the two counters are drawn here, in the kit's faces and colours:
// the kit's own label, stamp and counters do not stretch to them. The slabs, the napkin and the kisses are the
// kit's.

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const P = PAL, F = FACE;
const Z_GFX = 10;

// ---------------------------------------------------------------- private helpers

const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));
const rule = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
const capFirst = s => s.charAt(0).toLocaleUpperCase('es') + s.slice(1);

// the label's faces, as the kit sets them
const SM = { font: F.sans, weight: 800, tracking: -0.02 };       // "No es", "es"
const HV = { font: F.sans, weight: 900, tracking: -0.025 };      // the struck name, the rows
const TT = { font: F.sans, weight: 900, tracking: -0.035 };      // Información Nutricional
const QS = { font: F.caps, tracking: 0.01, upper: true };        // QUESO

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

const Q1 = word(80, 4).t0, Q2 = word(84, 4).t0, TOTAL = B(331);

const CAM_OF = {
  // she sings in the niche: the frame takes the QUESO slab. A fixed 3% zoom buys the room to centre her.
  s081: t => ({ plate: 'guadalupe', move: { zoom: 1.03, x: 26 }, about: [0.5, 0.45], cam: [CAM.punch(t, Q1, 0.05), CAM.shake(t, Q1, 10)] }),
  // the conga: a pump on every kick
  s082: t => ({ about: [0.32, 0.36], cam: CAM.beat(t, 0.022) }),
  // the kiss: a punch on "beso"
  s084: t => ({ about: [0.45, 0.38], cam: CAM.punch(t, word(83, 4).t0, 0.06) }),
  // the apparition takes the second QUESO
  s085: t => ({ about: [0.49, 0.45], cam: [CAM.punch(t, Q2, 0.05), CAM.shake(t, Q2, 12)] }),
  // out the door: a punch for each of the two heavy stamps
  s086: t => ({ about: [0.5, 0.3], cam: CAM.punch(t, [word(85, 2).t0, word(85, 4).t0], 0.04) }),
  // him at the window: nothing moves
  s087: t => ({ about: [0.42, 0.36] }),
  // the scooter: the frame takes the final total
  s088: t => ({ about: [0.38, 0.3], cam: [CAM.punch(t, TOTAL, 0.05), CAM.shake(t, TOTAL, 14)] }),
};

// s083, three bites, one plate per beat. A punch as each bite's word lands; the last one shakes.
const BITE_CAM = [
  t => ({ about: [0.4, 0.42], cam: CAM.punch(t, word(82, 0).t0, 0.05) }),
  t => ({ about: [0.45, 0.45], cam: CAM.punch(t, word(82, 2).t0, 0.05) }),
  t => ({ about: [0.45, 0.5], cam: [CAM.punch(t, word(82, 4).t0, 0.07), CAM.shake(t, word(82, 4).t0, 12)] }),
];

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s081', 's082', 's084', 's085', 's086', 's087', 's088']) {
  SCENE({ id: `08.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}
BITE_CAM.forEach((cam, i) => {
  SCENE({ id: `08.s083.${i}`, t0: B(308 + i), t1: B(309 + i), z: 0, draw(ctx, t) { SHOT.draw(ctx, 's083', t, { plate: i, ...cam(t) }); } });
});

// ---------------------------------------------------------------- 3. lyric surfaces and graphics

// ---- s081, line 80, "No es grasa, es queso": the retablo.
// The frame is the label in gold leaf and she sings in its niche. On the cut the frame is solid gold; the
// niche opens from its centre line in a third of a second, before the first word. "No es Grasa," is set in the
// left leaf and struck on the second "es"; QUESO slams into the right leaf.
const NICHE = { cx: 960, cy: 500, r: 440, bot: 1064 };
function nichePath(ctx, u = 1, grow = 0, open = false) {
  const n = NICHE, rx = Math.max(0.5, (n.r + grow) * u), ry = n.r + grow;
  ctx.moveTo(n.cx - rx, n.bot);
  ctx.lineTo(n.cx - rx, n.cy);
  ctx.ellipse(n.cx, n.cy, rx, ry, 0, Math.PI, TAU);
  ctx.lineTo(n.cx + rx, n.bot);
  if (!open) ctx.closePath();
}

SCENE({ id: '08.retablo', t0: B(300), t1: B(303), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(80), w = i => L.words[i], on = i => t >= w(i).t0, ink = P.patent;
  const lt = t - B(300), u = EASE.outCubic(clamp(lt / 0.3)), tS = w(3).t0, kick = BEAT.pulse(t, 0.3);

  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.rect(0, 0, W, H); nichePath(ctx, u); ctx.fill('evenodd');

  // rays round the arch: out once the niche is open, longer on every kick, longest when QUESO lands
  const out = EASE.outBack(clamp((lt - 0.24) / 0.16));
  if (out > 0) {
    const k = out * (1 + 0.5 * kick + 0.9 * KIT.hit(t, Q1, 0.35));
    ctx.save();
    ctx.beginPath(); ctx.rect(20, 20, W - 40, H - 40); ctx.clip();   // the top rays run under the frame's edge
    ctx.fillStyle = ink;
    rays(ctx, NICHE.cx, NICHE.cy, NICHE.r + 30, NICHE.r + 30, Math.PI * 1.235, Math.PI * 1.765, 19, i => (i % 2 ? 30 : 52) * k, 0.014);
    ctx.restore();
  }

  ctx.strokeStyle = ink; ctx.lineJoin = 'miter';
  ctx.lineWidth = 8; ctx.strokeRect(16, 16, W - 32, H - 32);
  ctx.beginPath(); nichePath(ctx, u, 0, true); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); nichePath(ctx, u, 14, true); ctx.stroke();

  // the two leaves: x of the left one, x of the right one, width of both
  const X0 = 58, CW = 424, XR = W - 58 - CW;
  const TS = Math.min(TXT.fit('Información', { w: CW }, TT), TXT.fit('Nutricional', { w: CW }, TT));
  const fine = { font: F.sans, weight: 500, size: 26, fill: ink }, fineB = { ...fine, weight: 800 };
  TXT.draw(ctx, 'Información', X0, 132, { ...TT, size: TS, fill: ink });
  TXT.draw(ctx, 'Nutricional', XR + CW, 132, { ...TT, size: TS, fill: ink, align: 'right' });
  for (const [x, a, b] of [[X0, 'Porción', 'toda'], [XR, 'Culpa diaria*', '0%']]) {
    rule(ctx, x, 150, CW, 2.5, ink);
    TXT.draw(ctx, a, x, 185, fine); TXT.draw(ctx, b, x + CW, 185, { ...fineB, align: 'right' });
    rule(ctx, x, 198, CW, 16, ink);
  }

  // left leaf: No es Grasa,
  const sm = { ...SM, size: 62, fill: ink }, yNo = 420;
  if (on(0)) { TXT.draw(ctx, w(0).w, X0, yNo, sm); mark(ctx, 80, 0, sm.size); }
  if (on(1)) { TXT.draw(ctx, w(1).w, X0 + TXT.width(w(0).w + ' ', sm), yNo, sm); mark(ctx, 80, 1, sm.size); }
  const name = capFirst(w(2).w), gst = { ...HV, size: Math.min(150, TXT.fit(name, { w: CW }, HV)), fill: ink };
  const gcap = TXT.capH(gst), yG = yNo + 40 + gcap;
  if (on(2)) { TXT.draw(ctx, name, X0, yG, gst); mark(ctx, 80, 2, gst.size); }
  const su = clamp((t - tS) / 0.09);
  if (su > 0) rule(ctx, X0 - 10, yG - gcap * 0.5 - 9, (TXT.width(name, gst) + 20) * EASE.outCubic(su), 18, P.tomato);
  rule(ctx, X0, yG + 44, CW, 2.5, ink);
  if (t >= tS) {
    const row = { ...HV, size: 54, fill: ink };
    TXT.draw(ctx, 'Grasa', X0, yG + 44 + 66, row); TXT.draw(ctx, '0 g', X0 + CW, yG + 44 + 66, { ...row, align: 'right' });
    rule(ctx, X0, yG + 44 + 86, CW, 2.5, ink);
  }

  // right leaf: es QUESO
  if (on(3)) { TXT.draw(ctx, w(3).w, XR, yNo, sm); mark(ctx, 80, 3, sm.size); }
  const qsz = slabSize('QUESO', CW + 8), qh = slabH(qsz), qy = yNo + 34 + qh / 2;
  rule(ctx, XR, qy + qh / 2 + 34, CW, 2.5, ink);
  if (t >= Q1) {
    const row = { ...HV, size: 54, fill: ink }, yR = qy + qh / 2 + 34 + 66;
    TXT.draw(ctx, 'Queso', XR, yR, row); TXT.draw(ctx, '100%', XR + CW, yR, { ...row, align: 'right' });
    rule(ctx, XR, yR + 20, CW, 2.5, ink);
  }

  // roses of pepperoni and stars under each leaf; the stars throb on the kick
  for (const cx of [X0 + CW / 2, XR + CW / 2]) {
    rose(ctx, cx, 868, 74);
    ctx.fillStyle = ink;
    for (const d of [-1, 1]) { star(ctx, cx + d * 140, 868, 24 * (1 + 0.3 * kick)); star(ctx, cx + d * 196, 868, 12 * (1 + 0.3 * kick)); }
  }
  rule(ctx, X0, 984, CW, 10, ink); rule(ctx, XR, 984, CW, 10, ink);
  TXT.draw(ctx, '* Culpa diaria con base en una dieta de pizza.', X0, 1022, { font: F.sans, weight: 500, size: 18, fill: ink });

  KIT.slab(ctx, t, 'QUESO', { x: XR + CW / 2 + 6, y: qy, size: qsz, rot: -0.035, bg: P.tomato, ink: P.mozz, li: 80, wi: 4, from: 1.8 });
}});

// ---- s082, line 81, "No es culpa, es progreso": the altar panel beside the conga line.
// Arched, gold, rays behind the arch. Culpa gets its 0%, Progreso its bar, and when the bar is full the rest
// of the line reports in at 100%.
const ALTAR = { x: 1432, y: 96, w: 472 };
const FIELES = [['Meseros', 307], ['Abuela', 307.25], ['Pizzaiolo', 307.5]];
const BAR = [305.5, 306.5, 0.25];
SCENE({ id: '08.progreso', t0: B(303), t1: B(308), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(81), w = i => L.words[i], on = i => t >= w(i).t0, ink = P.patent;
  const D = 560, R = D / 2, pad = 30, IW = D - 2 * pad, k = ALTAR.w / D, tIn = B(303);
  const grow = (t0, d = 0.14) => EASE.outCubic(clamp((t - t0) / d));
  const open = EASE.outExpo(clamp((t - tIn) / 0.22)), kick = BEAT.pulse(t, 0.3);

  // heights, in design units
  const TS = Math.min(TXT.fit('Información', { w: IW }, TT), TXT.fit('Nutricional', { w: IW }, TT));
  const yT1 = 268, yT2 = yT1 + TS * 0.97, yHead = yT2 + 76;
  const sm = { ...SM, size: 52, fill: ink };
  const cName = capFirst(w(2).w), c100 = TXT.width(cName, { ...HV, size: 100 }) + TXT.width('0%', { ...HV, size: 100 });
  const cst = { ...HV, size: Math.min(110, ((IW - 26) * 100) / c100), fill: ink }, ccap = TXT.capH(cst);
  const yNo = yHead + 62, yC = yNo + 28 + ccap, yEs = yC + 22 + 74;
  const esW = TXT.width(w(3).w + ' ', sm) * 1.1;
  const pName = capFirst(w(4).w), pst = { ...HV, size: Math.min(96, TXT.fit(pName, { w: IW - esW }, HV)), fill: ink };
  const yBar = yEs + 24, hBar = 46, yRows = yBar + hBar + 22;
  let hRows = 0;
  for (const [, b] of FIELES) hRows += 60 * grow(B(b));
  const full = yRows + hRows + 46, h = full * open;

  ctx.save();
  ctx.translate(ALTAR.x, ALTAR.y); ctx.scale(k, k);

  ctx.fillStyle = P.cheese;
  rays(ctx, R, R, R + 12, R + 12, Math.PI * 1.16, Math.PI * 1.96, 17, i => (i % 2 ? 44 : 76) * open * (1 + 0.6 * kick), 0.04);

  const path = (inset = 0) => {
    ctx.beginPath();
    ctx.moveTo(inset, full - inset); ctx.lineTo(inset, R);
    ctx.arc(R, R, R - inset, Math.PI, 0);
    ctx.lineTo(D - inset, full - inset); ctx.closePath();
  };
  ctx.beginPath(); ctx.rect(-20, -20, D + 40, h + 20); ctx.clip();   // the panel unrolls from the top
  ctx.fillStyle = P.gold; path(); ctx.fill();

  rose(ctx, R, 116, 56);
  ctx.fillStyle = ink;
  for (const d of [-1, 1]) star(ctx, R + d * 118, 150, 20 * (1 + 0.3 * kick));
  TXT.draw(ctx, 'Información', R, yT1, { ...TT, size: TS, fill: ink, align: 'center' });
  TXT.draw(ctx, 'Nutricional', R, yT2, { ...TT, size: TS, fill: ink, align: 'center' });
  rule(ctx, pad, yT2 + 16, IW, 2, ink);
  TXT.draw(ctx, 'Porción', pad, yT2 + 48, { font: F.sans, weight: 500, size: 25, fill: ink });
  TXT.draw(ctx, 'toda', D - pad, yT2 + 48, { font: F.sans, weight: 800, size: 25, fill: ink, align: 'right' });
  rule(ctx, pad, yT2 + 60, IW, 16, ink);

  // No es Culpa, 0%
  if (on(0)) { TXT.draw(ctx, w(0).w, pad, yNo, sm); mark(ctx, 81, 0, sm.size); }
  if (on(1)) { TXT.draw(ctx, w(1).w, pad + TXT.width(w(0).w + ' ', sm), yNo, sm); mark(ctx, 81, 1, sm.size); }
  if (on(2)) {
    TXT.draw(ctx, cName, pad, yC, cst); mark(ctx, 81, 2, cst.size);
    const s = KIT.slam(t - w(2).t0, 1.7, 0.08), zw = TXT.width('0%', cst);
    ctx.save(); ctx.translate(D - pad - zw / 2, yC - ccap / 2); ctx.scale(s, s);
    TXT.draw(ctx, '0%', 0, 0, { ...cst, align: 'center', baseline: 'center' });
    ctx.restore();
  }
  rule(ctx, pad, yC + 22, IW, 2, ink);

  // es Progreso, and its bar
  if (on(3)) { TXT.draw(ctx, w(3).w, pad, yEs, sm); mark(ctx, 81, 3, sm.size); }
  if (on(4)) {
    TXT.draw(ctx, pName, pad + esW, yEs, pst); mark(ctx, 81, 4, pst.size);
    const [b0, b1, step] = BAR, n = Math.round((b1 - b0) / step) + 1, bw = IW - 122;
    ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.strokeRect(pad + 2, yBar + 2, bw - 4, hBar - 4);
    const cw = (bw - 16 - (n - 1) * 5) / n;
    let done = 0;
    for (let i = 0; i < n; i++) {
      const lt = t - B(b0 + i * step);
      if (lt < 0) continue;
      done++;
      const s = lerp(0.3, 1, EASE.outCubic(clamp(lt / 0.07)));
      ctx.fillStyle = done === n ? P.tomato : ink;
      ctx.fillRect(pad + 8 + i * (cw + 5), yBar + 8 + ((hBar - 16) * (1 - s)) / 2, cw, (hBar - 16) * s);
    }
    if (done === n) {                                  // full: the whole bar goes tomato
      ctx.fillStyle = P.tomato;
      for (let i = 0; i < n; i++) ctx.fillRect(pad + 8 + i * (cw + 5), yBar + 8, cw, hBar - 16);
    }
    const ps = done === n ? KIT.slam(t - B(b1), 1.5, 0.08) : 1, pct = { ...HV, size: 40, fill: ink };
    ctx.save(); ctx.translate(D - pad - TXT.width('100%', pct) / 2, yBar + hBar / 2); ctx.scale(ps, ps);
    TXT.draw(ctx, `${Math.round((100 * done) / n)}%`, 0, 0, { ...pct, align: 'center', baseline: 'center' });
    ctx.restore();
  }
  rule(ctx, pad, yBar + hBar + 20, IW, 2, ink);

  // the rest of the line, each at 100%
  let yy = yRows;
  const row = { ...HV, size: 40, fill: ink };
  for (const [who, b] of FIELES) {
    if (t >= B(b)) {
      TXT.draw(ctx, who, pad, yy + 44, row); TXT.draw(ctx, '100%', D - pad, yy + 44, { ...row, align: 'right' });
      rule(ctx, pad, yy + 58, IW, 2, ink);
    }
    yy += 60 * grow(B(b));
  }
  rule(ctx, pad, yy + 8, IW, 10, ink);

  ctx.strokeStyle = ink; ctx.lineWidth = 6; path(3); ctx.stroke();
  ctx.lineWidth = 2; path(13); ctx.stroke();
  ctx.restore();
}});

// ---- s083, line 82, "Mira cómo me lo como": a gold plaque per word, a plate per bite, and bites out of the
// plaques. Each plaque belongs to the plate it lands on and leaves with it. "cómo" is sung a hair before the
// second plate, so it starts there and rides over the cut.
const MIRA = [
  { wi: 0, text: 'MIRA', x: 1672, y: 184, w: 404, rot: 0.04, out: 309, bites: [{ fx: -1.08, fy: 1.14, r: 66, rot: 5.5, b: 308.75 }] },
  { wi: 1, text: 'CÓMO', x: 258, y: 180, w: 400, rot: -0.05, out: 310, from: 1.2, bites: [{ fx: 1.1, fy: 1.14, r: 60, rot: 3.9, b: 309.5 }] },
  { wi: 2, text: 'ME', x: 1500, y: 180, w: 226, rot: 0.03, out: 310, bites: [] },
  { wi: 3, text: 'LO', x: 1756, y: 198, w: 226, rot: -0.05, out: 310, bites: [{ fx: 1.16, fy: -1.2, r: 54, rot: 2.3, b: 309.75 }] },
  { wi: 4, text: 'COMO', x: 1614, y: 400, w: 500, rot: -0.04, out: 311, from: 1.4, bg: P.tomato, ink: P.mozz,
    bites: [{ fx: 1.08, fy: -1.16, r: 70, rot: 2.3, b: 310.25 }, { fx: -1.08, fy: 1.16, r: 70, rot: 5.5, b: 310.5 }, { fx: 1.1, fy: 1.2, r: 64, rot: 3.9, b: 310.75 }] },
].map(s => ({ ...s, size: slabSize(s.text, s.w) }));
SCENE({ id: '08.mira', t0: B(308), t1: B(311), z: Z_GFX, draw(ctx, t) {
  const live = MIRA.filter(s => t >= word(82, s.wi).t0 && t < B(s.out));
  if (!live.length) return;
  const bites = [];
  for (const s of live) for (const b of s.bites) bites.push({ x: s.x + (b.fx * s.w) / 2, y: s.y + (b.fy * slabH(s.size)) / 2, r: b.r, rot: b.rot, t: B(b.b) });
  KIT.bitten(ctx, t, g => {
    for (const s of live) {
      const ink = s.ink || P.patent;
      const r = KIT.slab(g, t, s.text, { x: s.x, y: s.y, size: s.size, rot: s.rot, bg: s.bg || P.gold, ink, from: s.from || 1.7, li: 82, wi: s.wi });
      g.save();                                        // the plaque's engraved edge
      g.translate(s.x, s.y); g.rotate(s.rot); g.scale(r.s, r.s);
      g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(-r.w / 2 + 9, -r.h / 2 + 9, r.w - 18, r.h - 18);
      g.restore();
    }
  }, bites, '08.bite');
}});

// ---- s084, line 83, "Y te mando un beso": the napkin, and kisses that multiply.
// The plate (kiss-4) is her in the booth, a kiss on one palm and a slice held high in the other hand, two
// waiters clapping behind. The free ground is red leather and dark wood, where a tomato print is weak, so every
// kiss lands on paper: the line's napkin sits on the booth beside the palm that sends it, and each new kiss
// arrives on a small napkin of its own. One a beat while she writes, then faster than the beat.
const NAPKIN = { x: 46, y: 690, w: 420, rot: -0.05 };
// kissed napkins: centre x, y, side, tilt, beat. Clear of her raised arm, the slice and the waiters.
const BESITOS = [
  [1768, 548, 220, 0.08, 312], [1650, 924, 226, -0.1, 313], [1846, 356, 140, -0.12, 314.5],
  [166, 150, 196, 0.1, 315], [1838, 790, 176, 0.14, 315.25], [1492, 986, 150, 0.06, 315.5],
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
SCENE({ id: '08.beso', t0: B(311), t1: B(316), z: Z_GFX, draw(ctx, t) {
  for (const [x, y, s, rot, b] of BESITOS) besito(ctx, t, x, y, s, rot, B(b));
  // the kit's napkin slides in from the right, across her; here it comes from the left edge instead
  const u = EASE.outExpo(clamp((t - B(311)) / 0.2)), k = NAPKIN.w / 620;
  ctx.save();
  ctx.translate(-(1 - u) * (NAPKIN.x + NAPKIN.w + 60), 0);
  KIT.napkin(ctx, t, 83, { ...NAPKIN, tIn: 0 });
  ctx.translate(NAPKIN.x + NAPKIN.w / 2, NAPKIN.y + 250 * k); ctx.rotate(NAPKIN.rot); ctx.scale(k, k); ctx.translate(-310, -250);
  for (const [x, y, size, rot, b] of REBESOS) KIT.kiss(ctx, t, { x, y, size, rot, tHit: B(b) });
  ctx.restore();
}});

// ---- s085, line 84, "No es grasa, es queso": the prayer card.
// The label printed on the apparition in gold leaf: a gold edge, a rose in each corner. On her right hand the
// label itself, with its struck row. On her left QUESO in glory: a gold plaque with rays behind it, the way a
// monstrance holds the host. A few more stars come out on every kick.
const ASTROS = [
  [150, 742, 26, 316], [352, 900, 16, 316], [1668, 960, 22, 316], [1452, 862, 14, 316],
  [296, 700, 14, 317], [96, 936, 18, 317], [1820, 850, 26, 317], [1392, 986, 16, 317],
  [236, 968, 24, 318], [372, 792, 12, 318], [1560, 912, 18, 318], [1764, 1000, 12, 318],
];
const GLORIA = { x: 1620, y: 430, w: 470 };
SCENE({ id: '08.estampa', t0: B(316), t1: B(319), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(84), w = i => L.words[i], on = i => t >= w(i).t0, G = P.gold;
  const tS = w(3).t0, kick = BEAT.pulse(t, 0.3);

  // QUESO's rays first, so the card's edge closes over their tips
  const qsz = slabSize('QUESO', GLORIA.w), qh = slabH(qsz);
  if (t >= Q2) {
    const k = EASE.outBack(clamp((t - Q2) / 0.16)) * (1 + 0.1 * kick), a = GLORIA.w / 2 + 96, b = qh / 2 + 150, n = 48;
    ctx.fillStyle = G;
    rays(ctx, GLORIA.x, GLORIA.y, 70, 70, 0, TAU * (1 - 1 / n), n, i => {
      const th = (i / n) * TAU, r = (a * b) / Math.hypot(b * Math.cos(th), a * Math.sin(th));
      return (r * (i % 2 ? 0.8 : 1) - 70) * k;
    }, 0.11);
  }

  ctx.strokeStyle = G; ctx.lineWidth = 22; ctx.strokeRect(11, 11, W - 22, H - 22);
  ctx.lineWidth = 3; ctx.strokeRect(38, 38, W - 76, H - 76);
  for (const [x, y] of [[38, 38], [W - 38, 38], [38, H - 38], [W - 38, H - 38]]) rose(ctx, x, y, 30, G);

  ctx.fillStyle = G;
  for (const [x, y, r, b] of ASTROS) {
    const lt = t - B(b);
    if (lt >= 0) star(ctx, x, y, r * KIT.slam(lt, 2.2, 0.1) * (1 + 0.22 * kick), 0.2 * Math.sin(x));
  }

  // on her right: the label. Its title, No es Grasa, and what is left of the row.
  const X0 = 78, CW = 452;
  const TS = Math.min(TXT.fit('Información', { w: CW }, TT), TXT.fit('Nutricional', { w: CW }, TT));
  const yT2 = 138 + TS * 0.97;
  TXT.draw(ctx, 'Información', X0, 138, { ...TT, size: TS, fill: G });
  TXT.draw(ctx, 'Nutricional', X0, yT2, { ...TT, size: TS, fill: G });
  rule(ctx, X0, yT2 + 20, CW, 14, G);
  const sm = { ...SM, size: 64, fill: G }, yNo = yT2 + 34 + 74;
  if (on(0)) { TXT.draw(ctx, w(0).w, X0, yNo, sm); mark(ctx, 84, 0, sm.size); }
  if (on(1)) { TXT.draw(ctx, w(1).w, X0 + TXT.width(w(0).w + ' ', sm), yNo, sm); mark(ctx, 84, 1, sm.size); }
  const name = capFirst(w(2).w), gst = { ...HV, size: Math.min(160, TXT.fit(name, { w: CW }, HV)), fill: G };
  const gcap = TXT.capH(gst), yG = yNo + 38 + gcap;
  if (on(2)) { TXT.draw(ctx, name, X0, yG, gst); mark(ctx, 84, 2, gst.size); }
  const su = clamp((t - tS) / 0.09);
  if (su > 0) rule(ctx, X0 - 10, yG - gcap * 0.5 - 10, (TXT.width(name, gst) + 20) * EASE.outCubic(su), 20, P.tomato);
  rule(ctx, X0, yG + 42, CW, 3, G);
  if (t >= tS) {
    const row = { ...HV, size: 50, fill: G };
    TXT.draw(ctx, 'Grasa', X0, yG + 42 + 58, row); TXT.draw(ctx, '0 g', X0 + CW, yG + 42 + 58, { ...row, align: 'right' });
    rule(ctx, X0, yG + 42 + 78, CW, 3, G);
  }

  // on her left: "es" on a tab, then the plaque under it
  if (on(3)) {
    const es = { ...SM, size: 64, fill: P.patent }, ew = TXT.width(w(3).w, es) + 48, eh = 86;
    ctx.save();
    ctx.translate(GLORIA.x, GLORIA.y); ctx.rotate(-0.035);
    ctx.fillStyle = G; ctx.fillRect(-GLORIA.w / 2, -qh / 2 - eh + 4, ew, eh);
    TXT.draw(ctx, w(3).w, -GLORIA.w / 2 + 24, -qh / 2 - eh / 2 + 4, { ...es, baseline: 'center' });
    mark(ctx, 84, 3, es.size);
    ctx.restore();
  }
  const r = KIT.slab(ctx, t, 'QUESO', { x: GLORIA.x, y: GLORIA.y, size: qsz, rot: -0.035, bg: G, ink: P.patent, li: 84, wi: 4, from: 1.8 });
  if (r) {                                             // the plaque's engraved edge
    ctx.save();
    ctx.translate(GLORIA.x, GLORIA.y); ctx.rotate(-0.035); ctx.scale(r.s, r.s);
    ctx.strokeStyle = P.patent; ctx.lineWidth = 3; ctx.strokeRect(-r.w / 2 + 10, -r.h / 2 + 10, r.w - 20, r.h - 20);
    ctx.restore();
  }
}});

// ---- s086, line 85, "No me vengas con complejos": stamped on a pizza box lid.
// The lid is hers to carry out, so it sits on the near side of the frame, away from the door. Each word is
// pressed into the block on its own time. "No" is sung a frame before the cut, so the lid starts there.
const LID = { x: 54, y: 222, s: 630, rot: -0.035 };
const SELLO = [[0, 1], [2, 3], [4]];                    // the block's rows, by word index
SCENE({ id: '08.caja', t0: word(85, 0).t0, t1: B(323), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(85), tIn = L.words[0].t0, s = LID.s, R = P.tomato;
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
  const st = { font: F.caps, tracking: 0.03, upper: true }, bx = 62, by = 104, BW = s - 2 * bx, BH = s - by - 62, gap = 26;
  const rows = SELLO.map(ws => {
    const text = ws.map(i => L.words[i].w).join(' '), size = Math.min(230, TXT.fit(text, { w: BW - 56 }, st));
    return { ws, size, cap: TXT.capH({ ...st, size }) };
  });
  const f = Math.min(1, (BH - 56 - gap * (rows.length - 1)) / rows.reduce((a, r) => a + r.cap, 0));
  const g = CANVAS.scratch('08.sello');
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
      const lt = t - L.words[wi].t0;
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

// ---- s087, line 86, "Tú contando calorías": his counter, with nothing left to count.
// The kit's panel, but the total is a dim zero that blinks, and under it his readings report in: all zero.
const NADA = [['CENA', '0 kcal', 325], ['NOVIA', '0', 325.5], ['TODO', '0', 326]];
SCENE({ id: '08.cero', t0: B(323), t1: B(327), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(86), tIn = B(323), X = 60, Y = 60, D = 620, k = 600 / D, pad = 34;
  const grow = b => EASE.outCubic(clamp((t - B(b)) / 0.12));
  let hR = 0;
  for (const r of NADA) hR += 64 * grow(r[2]);
  const Hh = 356 + hR + (hR > 0 ? 10 : 0);
  ctx.save();
  ctx.translate(X, Y); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, D * EASE.outExpo(clamp((t - tIn) / 0.14)), Hh); ctx.clip();
  ctx.fillStyle = P.patent; ctx.fillRect(0, 0, D, Hh);
  ctx.strokeStyle = P.ice; ctx.lineWidth = 2.5; ctx.strokeRect(10, 10, D - 20, Hh - 20);

  const st = { ...STY.his, size: 62 }, words = L.words.map(v => v.w), head = words.slice(0, -1), last = words[words.length - 1];
  const size = Math.min(62, TXT.fit(head.join(' '), { w: D - 2 * pad }, st), TXT.fit(last, { w: D - 2 * pad }, st));
  let cx = pad;
  head.forEach((wd, i) => {
    if (t >= L.words[i].t0) { TXT.draw(ctx, wd, cx, 94, { ...st, size }); mark(ctx, 86, i, size); }
    cx += TXT.width(wd + ' ', { ...st, size });
  });
  if (t >= L.words[words.length - 1].t0) { TXT.draw(ctx, last, pad, 94 + size * 1.22, { ...st, size }); mark(ctx, 86, words.length - 1, size); }

  // the total: every segment dark but one zero, and that one low and blinking
  const unit = { font: F.mono, weight: 600, size: SIZE.note, fill: P.ice };
  const ux = D - pad, dx = ux - TXT.width('kcal', unit) - 18;
  const seg = { ...STY.seg, size: Math.min(108, TXT.fit('888888', { w: dx - pad }, STY.seg)) };
  TXT.draw(ctx, 'kcal', ux, 312, { ...unit, align: 'right', opacity: 0.6 });
  TXT.draw(ctx, '888888', dx, 312, { ...seg, align: 'right', opacity: 0.13 });
  if (BEAT.pos(t) % 1 < 0.62) TXT.draw(ctx, '0', dx, 312, { ...seg, align: 'right', opacity: 0.55 });

  let yy = 356;
  const rs = { font: F.mono, weight: 700, size: 36, fill: P.ice };
  for (const [name, val, b] of NADA) {
    if (t >= B(b)) {
      rule(ctx, pad, yy - 6, D - 2 * pad, 2, P.ice);
      const wl = TXT.draw(ctx, name, pad, yy + 42, rs), wr = TXT.width(val, rs);
      TXT.draw(ctx, val, D - pad, yy + 42, { ...rs, align: 'right' });
      ctx.fillStyle = P.ice;
      for (let x = pad + wl + 16; x < D - pad - wr - 16; x += 14) ctx.fillRect(x, yy + 36, 4, 4);
    }
    yy += 64 * grow(b);
  }
  ctx.restore();
}});

// ---- s088, line 87, "Yo contando pepperonis": her counter, and its final total.
// It picks up at the 9 999 of the last chorus, passes a hundred thousand as she sings "pepperonis" and is
// closed on beat 331 by a gold plaque: one million. "Yo" is sung a frame before the cut, so it starts there.
const CUENTA = { x: 1236, y: 548, w: 640 };
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
const tabularSize = (text, w) => {
  const st = { font: F.caps, size: 100 }, cw = Math.max(...[...DIGITS].map(d => TXT.width(d, st)));
  const digits = text.replace(/ /g, '').length, gaps = text.length - digits;
  return (100 * w) / (digits * cw + gaps * 20);
};
function pepperonis(t) {
  const a = B(327), m = word(87, 2).t0;
  if (t >= TOTAL) return 1000000;
  if (t < a) return 9999;
  if (t < m) return Math.floor(lerp(9999, 100000, Math.pow((t - a) / (m - a), 2.2)));
  return Math.floor(lerp(100000, 999999, Math.pow((t - m) / (TOTAL - m), 1.8)));
}
SCENE({ id: '08.total', t0: word(87, 0).t0, t1: B(333), z: Z_GFX, draw(ctx, t) {
  const L = LYR.line(87), tIn = L.words[0].t0, pad = 38, IW = CUENTA.w - 2 * pad;
  const st = { ...STY.caps, size: Math.min(TXT.fit('YO CONTANDO', { w: IW }, STY.caps), TXT.fit('PEPPERONIS', { w: IW }, STY.caps)) };
  const cap = TXT.capH(st), ns = tabularSize('1 000 000', IW), nst = { font: F.caps, size: ns, fill: P.mozz }, ncap = TXT.capH(nst);
  const y1 = pad + cap, y2 = y1 + 24 + cap, yR = y2 + 28, yN = yR + 5 + 34 + ncap, Hh = yN + pad;
  const k = KIT.slam(t - tIn, 1.08, 0.1);
  ctx.save();
  ctx.translate(CUENTA.x + CUENTA.w / 2, CUENTA.y + Hh / 2); ctx.scale(k, k); ctx.translate(-CUENTA.w / 2, -Hh / 2);
  ctx.fillStyle = P.tomato; ctx.fillRect(0, 0, CUENTA.w, Hh);
  let cx = pad;
  L.words.forEach((v, i) => {
    const x = i < 2 ? cx : pad, y = i < 2 ? y1 : y2;
    if (t >= v.t0) { TXT.draw(ctx, v.w, x, y, st); mark(ctx, 87, i, st.size); }
    if (i < 2) cx += TXT.width(v.w + ' ', st);
  });
  rule(ctx, pad, yR, IW, 5, P.mozz);
  if (t < TOTAL) {                                     // the count, ticking on the eighth notes
    const z = 1 + 0.06 * BEAT.pulse(t, 0.12, 0.5);
    ctx.save(); ctx.translate(CUENTA.w - pad, yN - ncap / 2); ctx.scale(z, z);
    tabular(ctx, pepperonis(t), 0, ncap / 2, nst);
    ctx.restore();
  } else {                                             // the total: a gold plaque over the row
    const z = KIT.slam(t - TOTAL, 1.8, 0.09) * (1 + 0.035 * BEAT.pulse(t, 0.25));
    const pw = CUENTA.w + 36, ph = ncap + 78;
    ctx.save(); ctx.translate(CUENTA.w / 2, yN - ncap / 2); ctx.rotate(-0.03); ctx.scale(z, z);
    ctx.fillStyle = P.gold; ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.strokeStyle = P.patent; ctx.lineWidth = 3; ctx.strokeRect(-pw / 2 + 9, -ph / 2 + 9, pw - 18, ph - 18);
    tabular(ctx, 1000000, IW / 2, ncap / 2, { ...nst, fill: P.patent });
    ctx.restore();
  }
  ctx.restore();
}});
