// 02_cuentas.js: chapter 2, the Italian chorus and verse 1. Beats 45 to 89 (27.97 to 54.91 s), shots s011 to
// s024, lines 10 to 23.
//
// The Italian chorus is a foreign film again: bars, subtitles, and an order ticket that keeps printing. Verse 1
// is his arithmetic against her appetite: his gaze meter and his worry reading, her soap-opera script, his mile
// of calculator tape, what he said against what she heard, his dream of salad, a place card for his date, a
// dish pasted into the menu, and the one thing he is allowed to say about her body.
//
// Every shot of the film is a Seedance clip, so nothing here that carries a lyric or a joke is pinned to the
// picture. Surfaces sit in frame space with room around faces and hands, and hold when the picture under them
// moves. One thing follows the picture: the chip over the flaw at his ear in s014, keyframed in clip time for
// the take it was measured on. A shot that falls back to its plate gets the kit's slow push for a still.
//
// A line whose last word is still being sung at a cut keeps its surface over the cut until the next line's
// first word (lines 16, 17, 22 and 23), or hands that word to the next surface (line 20: "consejos" lands in
// the menu's small print).

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;
const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));

// ---------------------------------------------------------------- 1. cameras

// hold(sid, z): a fixed frame at zoom z once the shot is a clip. While it still shows its plate, the kit's own
// slow push for a still (1.2% a beat) from that zoom.
const beatsOf = sid => (SHOT.t1(sid) - SHOT.t0(sid)) / BEAT.period;
const hold = (sid, z = 1, extra = {}) => ({ zoom: SHOT.edit(sid) ? z : [z, z + 0.012 * beatsOf(sid)], ...extra });

// s020, the reveal: tight on him until "invítala", then the frame pulls back and finds his date on the chair
const REVEAL = word(19, 1).t0;
const revealZoom = t => lerp(1.5, 1.02, EASE.outExpo(clamp((t - REVEAL) / 0.3)));

// when each "1 × FETTA" prints on the order ticket (s012)
const FETTE = [word(11, 1).t0, B(54), B(55), B(56)];
// the worry reading lands on this beat (s014)
const WORRY = B(64);

const CAM_OF = {
  // the waiters at the kitchen door
  s011: t => ({ move: hold('s011'), about: [0.46, 0.34] }),
  // another slice: a small punch every time the ticket prints one
  s012: t => ({ move: hold('s012'), about: [0.55, 0.6], cam: CAM.punch(t, FETTE, 0.03) }),
  // his eyes drop: a punch when his gaze lands on "cintura". Set a little left, to clear the panel.
  s013: t => ({ move: hold('s013', 1.08, { x: -75 }), about: [0.5, 0.4], cam: CAM.punch(t, word(12, 3).t0, 0.045) }),
  // his worried little face, set left of centre so the panel has the right of the frame
  s014: t => ({ move: hold('s014', 1.1, { x: -90 }), about: [0.5, 0.42], cam: CAM.punch(t, WORRY, 0.05) }),
  // she thinks it is tenderness: the one slow push of the chapter, a soap opera's
  s015: t => ({ move: { zoom: [1.02, 1.1] }, about: [0.47, 0.33] }),
  // smash cut to the tape; a second punch when the excess prints
  s016: t => ({ move: hold('s016'), about: [0.45, 0.4], cam: [CAM.punch(t, [B(68), B(72)], 0.07), CAM.shake(t, B(68), 14)] }),
  // the palm: the sign lands on beat 74
  s017: t => ({ move: hold('s017'), about: [0.4, 0.5], cam: [CAM.punch(t, B(74), 0.05), CAM.shake(t, B(74), 12)] }),
  // she heard something else: set left so her answer has the right of the frame, and held by the top edge so
  // her finger keeps its height. The sign flips on beat 76.
  s018: t => ({ move: hold('s018', 1.12, { x: -115 }), about: [0.5, 0], cam: CAM.punch(t, B(76), 0.05) }),
  // his salad
  s019: t => ({ move: hold('s019'), about: [0.5, 0.55] }),
  // him and his date
  s020: t => ({ move: { zoom: revealZoom(t) }, about: [0.02, 0.45] }),
  // talk to the hand: the palm arrives with the cut
  s021: t => ({ move: hold('s021'), about: [0.3, 0.6], cam: [CAM.punch(t, B(81), 0.07), CAM.shake(t, B(81), 10)] }),
  // the menu, close enough to read
  s022: t => ({ move: hold('s022', 1.4), about: [0.5, 0.455] }),
  // she towers over the table
  s023: t => ({ move: hold('s023'), about: [0.48, 0.3], cam: CAM.punch(t, word(22, 6).t0, 0.05) }),
  // she sings it to the lens: a punch on "buena" and on "estás"
  s024: t => ({ move: hold('s024'), about: [0.5, 0.4], cam: CAM.punch(t, [word(23, 2).t0, word(23, 3).t0], 0.04) }),
};
const at = (sid, t) => SHOT.at(sid, t, CAM_OF[sid](t));

// ---------------------------------------------------------------- 2. private devices

// A flat heart about 2.4 r wide, centred on x, y.
function heart(ctx, x, y, r, fill, edge = null, lw = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.95);
  ctx.bezierCurveTo(-r * 1.6, -r * 0.1, -r * 0.8, -r * 1.2, 0, -r * 0.42);
  ctx.bezierCurveTo(r * 0.8, -r * 1.2, r * 1.6, -r * 0.1, 0, r * 0.95);
  ctx.closePath();
  if (edge) { ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = edge; ctx.stroke(); }
  ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
}

// ticket(ctx, t, {x, y, w, tIn, rows, text}): a kitchen order ticket that hangs from y and prints one row at
// each time in `rows`. KIT.receipt prints on a fixed step and sets its rows small; this one prints on given
// times and sets the order large enough to read.
function ticket(ctx, t, o) {
  const { x, y, w, tIn, rows, text = '1 × FETTA' } = o;
  if (t < tIn) return;
  const D = 400, k = w / D, pad = 30, lh = 64, headH = 150;
  const feed = (t0, d = 0.09) => EASE.outCubic(clamp((t - t0) / d));
  let h = headH * feed(tIn, 0.16);
  for (const r of rows) h += lh * feed(r);
  h += 22;
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = PAL.mozz;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(D, 0); ctx.lineTo(D, h);
  const teeth = 20;
  for (let i = teeth; i >= 0; i--) ctx.lineTo((D * i) / teeth, h + (i % 2 ? 11 : 0));
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.rect(0, 0, D, h); ctx.clip();
  const st = { font: FACE.mono, weight: 700, size: 30, fill: PAL.patent };
  TXT.draw(ctx, 'COMANDA', D / 2, 68, { ...st, align: 'center' });
  TXT.draw(ctx, 'MESA 7', D / 2, 106, { ...st, weight: 500, size: 26, align: 'center' });
  ctx.fillStyle = PAL.patent;
  for (let dx = pad; dx < D - pad; dx += 14) ctx.fillRect(dx, 128, 8, 3);
  rows.forEach((r, i) => {
    if (t >= r) TXT.draw(ctx, text, pad, headH + i * lh + 46, { ...st, weight: 800, size: 50 });
  });
  ctx.restore();
}

// chip(ctx, text, x, y, {inv, s, size, w}): a tab in his colour, the kit's tag chip at any size. x: left edge,
// y: centre. inv: dark with a cold edge. w: a fixed width, for a number that changes.
function chip(ctx, text, x, y, o = {}) {
  const size = o.size ?? SIZE.note;
  const st = { font: FACE.mono, weight: 700, size, fill: o.inv ? PAL.ice : PAL.patent };
  const cw = o.w ?? TXT.width(text, st) + size * 0.93, ch = size * 1.57, s = o.s ?? 1;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = o.inv ? PAL.patent : PAL.ice; ctx.fillRect(0, -ch / 2, cw, ch);
  if (o.inv) { ctx.strokeStyle = PAL.ice; ctx.lineWidth = 2.5; ctx.strokeRect(0, -ch / 2, cw, ch); }
  TXT.draw(ctx, text, size * 0.465, 0, { ...st, baseline: 'center' });
  ctx.restore();
  return cw;
}
// a line in his colour with the dark underlay the kit's tags have
function hisLine(ctx, x0, y0, x1, y1, lw = 2.5) {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
  ctx.strokeStyle = PAL.patent; ctx.globalAlpha *= 0.5; ctx.lineWidth = lw + 3.5; ctx.stroke();
  ctx.globalAlpha *= 2; ctx.strokeStyle = PAL.ice; ctx.lineWidth = lw; ctx.stroke();
  ctx.restore();
}

// gazeMeter(ctx, t, {x, y0, y1, tIn, tDrop, tLand}): his gaze on a scale. The pointer starts at OJOS and
// comes down to CINTURA between tDrop and tLand. Frame space: nothing here follows the picture.
function gazeMeter(ctx, t, o) {
  const { x, y0, y1, tIn, tDrop, tLand } = o;
  if (t < tIn) return;
  const u = EASE.outExpo(clamp((t - tIn) / 0.18)), yb = lerp(y0, y1, u), N = 12, big = { size: 36 };
  hisLine(ctx, x, y0, x, yb, 4);
  for (let i = 0; i <= N; i++) {
    const yy = lerp(y0, y1, i / N);
    if (yy <= yb + 0.5) hisLine(ctx, x, yy, x + (i % 6 === 0 ? 44 : 22), yy, 4);
  }
  chip(ctx, 'MIRADA', x - 70, y0 - 78, { inv: true });
  chip(ctx, 'OJOS', x + 62, y0, big);
  const landed = t >= tLand;
  if (u >= 1) chip(ctx, landed ? 'CINTURA ?' : 'CINTURA', x + 62, y1, { ...big, inv: landed, s: landed ? KIT.slam(t - tLand, 1.35) * (1 + 0.08 * BEAT.pulse(t, 0.2)) : 1 });
  const yp = lerp(y0, y1, EASE.inOutCubic(clamp((t - tDrop) / (tLand - tDrop))));
  ctx.save();
  ctx.translate(x - 14, yp);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-58, -32); ctx.lineTo(-58, 32); ctx.closePath();
  ctx.lineJoin = 'miter'; ctx.strokeStyle = PAL.patent; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = PAL.ice; ctx.fill();
  ctx.restore();
}

// reticle(ctx, t, {x, y, w, h, tIn}): the box of the kit's tag without its chip, for a box wide of its subject.
function reticle(ctx, t, o) {
  const { x, y, w, h, tIn } = o, lt = t - tIn;
  if (lt < 0) return;
  const s = lerp(1.3, 1, EASE.outExpo(clamp(lt / 0.12)));
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s);
  ctx.strokeStyle = PAL.patent; ctx.globalAlpha *= 0.5; ctx.lineWidth = 6; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.globalAlpha *= 2;
  ctx.strokeStyle = PAL.ice; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = PAL.ice;
  const c = 30, th = 8;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const cx = (sx * w) / 2, cy = (sy * h) / 2;
    ctx.fillRect(sx < 0 ? cx - th / 2 : cx - c + th / 2, cy - th / 2, c, th);
    ctx.fillRect(cx - th / 2, sy < 0 ? cy - th / 2 : cy - c + th / 2, th, c);
  }
  ctx.restore();
}

// hisPanel(ctx, t, {x, y, w, li, seg, unit, tIn}): KIT.hisCounter with a readout that is not a number.
// The kit's panel prints only a total; here the instrument has no reading yet, so the display shows `seg`
// (digits, minus, colon and point are all the seven-segment face has). Same geometry as the kit's panel.
function hisPanel(ctx, t, o) {
  const { x, y, w, li, seg = '---', unit = 'cm', digits = 3 } = o;
  const L = LYR.line(li), tIn = o.tIn ?? KIT.beatBefore(L.t0);
  if (t < tIn) return;
  const D = 620, Hh = 356, k = w / D, pad = 34, n = L.words.length;
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, D * EASE.outExpo(clamp((t - tIn) / 0.14)), Hh); ctx.clip();
  ctx.fillStyle = PAL.patent; ctx.fillRect(0, 0, D, Hh);
  ctx.strokeStyle = PAL.ice; ctx.lineWidth = 2.5; ctx.strokeRect(10, 10, D - 20, Hh - 20);
  const st = { ...STY.his, size: 62 };
  const head = L.words.slice(0, -1).map(v => v.w), last = L.words[n - 1].w;
  const size = Math.min(62, TXT.fit(head.join(' '), { w: D - 2 * pad }, st), TXT.fit(last, { w: D - 2 * pad }, st));
  let cx = pad;
  head.forEach((wd, i) => {
    if (t >= L.words[i].t0) { TXT.draw(ctx, wd, cx, 94, { ...st, size }); mark(ctx, li, i, size); }
    cx += TXT.width(wd + ' ', { ...st, size });
  });
  if (t >= L.words[n - 1].t0) { TXT.draw(ctx, last, pad, 94 + size * 1.22, { ...st, size }); mark(ctx, li, n - 1, size); }
  const us = { font: FACE.mono, weight: 600, size: SIZE.note };
  const ux = D - pad, dx = ux - TXT.width(unit, us) - 18;
  const sg = { ...STY.seg, size: Math.min(108, TXT.fit('8'.repeat(digits), { w: dx - pad }, STY.seg)) };
  TXT.draw(ctx, unit, ux, 312, { ...us, fill: PAL.ice, align: 'right' });
  TXT.draw(ctx, '8'.repeat(digits), dx, 312, { ...sg, align: 'right', opacity: 0.13 });
  if (seg) TXT.draw(ctx, seg, dx, 312, { ...sg, align: 'right' });
  ctx.restore();
}

// tape(ctx, t, {x, y, w, li, tIn, head, rows, total, after}): his calculator's tape. KIT.receipt opens the lyric at
// the foot of the paper only after its last row has printed, and line 15 starts before the shot does. Here
// the paper comes down whole at tIn with the sung line at its foot, and the rows above it print one by one
// at the times given: rows [[left, right, t], ...], total [left, right, t], after [[left, right, t], ...] in
// bold under the total. The kit's paper, type and teeth.
function tape(ctx, t, o) {
  const { x, y = -10, w, li, tIn, head = [], rows = [], total, after = [] } = o;
  if (t < tIn) return;
  const L = LYR.line(li), D = 560, k = w / D, pad = 34, lh = 46;
  const row = (r, bold) => ({ l: r[0], r: r[1], t: r[2], bold });
  const lines = [...head.map(c => ({ c, t: tIn })), { rule: 1, t: tIn }, ...rows.map(r => row(r, 0)),
    { rule: 1, t: total[2] }, row(total, 1), ...after.map(r => row(r, 1))];
  const big = { font: FACE.mono, weight: 800, size: 60, fill: PAL.patent, lineHeight: 1.12, upper: true };
  const lb = TXT.layout(L.words, { x: pad, y: 0, w: D - 2 * pad }, { ...big, align: 'left' });
  const nl = lb[lb.length - 1].line + 1;
  const hh = 30 + lines.length * lh;
  const h = hh + 26 + TXT.capH(big) + (nl - 1) * big.size * 1.12 + 10 + 44;
  // it drops in already most of the way down, so "Tú" is in the frame on its first frame
  const drop = 0.4 * (1 - EASE.outCubic(clamp((t - tIn) / 0.1)));
  ctx.save();
  ctx.translate(x, y - h * k * drop); ctx.scale(k, k);
  ctx.fillStyle = PAL.mozz;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(D, 0); ctx.lineTo(D, h);
  const teeth = 28;
  for (let i = teeth; i >= 0; i--) ctx.lineTo((D * i) / teeth, h + (i % 2 ? 12 : 0));
  ctx.closePath(); ctx.fill();
  const st = { font: FACE.mono, weight: 500, size: 30, fill: PAL.patent };
  lines.forEach((ln, i) => {
    if (t < ln.t) return;
    const yy = 30 + i * lh, base = yy + lh * 0.72;
    if (ln.rule) { ctx.fillStyle = PAL.patent; for (let dx = pad; dx < D - pad; dx += 14) ctx.fillRect(dx, yy + lh / 2 - 1.5, 8, 3); }
    else if (ln.c) TXT.draw(ctx, ln.c, D / 2, base, { ...st, weight: 700, align: 'center' });
    else {
      const s2 = { ...st, weight: ln.bold ? 800 : 500 };
      const wl = TXT.draw(ctx, ln.l, pad, base, s2), wr = TXT.width(ln.r, s2);
      TXT.draw(ctx, ln.r, D - pad, base, { ...s2, align: 'right' });
      ctx.fillStyle = PAL.patent;
      for (let dx = pad + wl + 14; dx < D - pad - wr - 14; dx += 12) ctx.fillRect(dx, base - 4, 3.5, 3.5);
    }
  });
  for (const b of lb) {
    if (t < L.words[b.i].t0) continue;
    TXT.draw(ctx, b.text, b.x, hh + 26 + b.y, { ...big, size: b.size, upper: false });
    mark(ctx, li, b.i, b.size);
  }
  ctx.restore();
}

// sign(ctx, t, {x, y, r, tHit, tFlip}): a no-entry sign, the white bar on red. It lands on tHit. On tFlip it
// turns over, and the bar that was a minus comes back as + 1.
function sign(ctx, t, o) {
  const { x, y, r, tHit, tFlip } = o;
  if (t < tHit) return;
  const f = clamp((t - tFlip) / 0.16), turned = f >= 0.5;
  const sx = Math.max(0.03, Math.abs(Math.cos(Math.PI * f)));
  const s = KIT.slam(t - tHit, 2.2) * (1 + 0.1 * KIT.hit(t, tFlip + 0.16, 0.16));
  ctx.save();
  ctx.translate(x, y); ctx.scale(s * sx, s);
  ctx.fillStyle = PAL.mozz; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.tomato; ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, TAU); ctx.fill();
  if (!turned) { ctx.fillStyle = PAL.mozz; ctx.fillRect(-r * 0.6, -r * 0.16, r * 1.2, r * 0.32); }
  else TXT.draw(ctx, '+1', 0, 0, { font: FACE.caps, size: r * 1.15, tracking: 0.02, fill: PAL.mozz, align: 'center', baseline: 'center' });
  ctx.restore();
}

// thought(ctx, t, li, {tIn}): the frame becomes his thought bubble. His cold blue fills the frame around a
// cloud that the picture shows through, two small bubbles trail off toward the dreamer, and the line is set
// on the blue in his type.
const CLOUD = { cx: 960, cy: 440, rx: 600, ry: 250, lobes: 11 };
function thought(ctx, t, li, o = {}) {
  const L = LYR.line(li), tIn = o.tIn ?? L.t0;
  if (t < tIn) return;
  const pop = lerp(0.9, 1, EASE.outBack(clamp((t - tIn) / 0.16)));
  const g = CANVAS.scratch('02.thought');
  g.setTransform(ctx.getTransform());
  g.fillStyle = PAL.ice; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = '#000';
  g.save();
  g.translate(CLOUD.cx, CLOUD.cy); g.scale(pop, pop);
  g.beginPath(); g.ellipse(0, 0, CLOUD.rx, CLOUD.ry, 0, 0, TAU); g.fill();
  for (let i = 0; i < CLOUD.lobes; i++) {
    const a = (i / CLOUD.lobes) * TAU + 0.2, rr = 150 + 46 * hash(i, 77);
    g.beginPath(); g.arc(Math.cos(a) * CLOUD.rx * 0.9, Math.sin(a) * CLOUD.ry * 0.86, rr, 0, TAU); g.fill();
  }
  g.restore();
  ctx.save(); ctx.resetTransform(); ctx.drawImage(g.canvas, 0, 0); ctx.restore();
  ctx.fillStyle = PAL.mozz;
  [[330, 846, 66, 0.05], [196, 962, 38, 0.1]].forEach(([bx, by, br, d]) => {
    const s = EASE.outBack(clamp((t - tIn - d) / 0.14));
    if (s > 0) { ctx.beginPath(); ctx.arc(bx, by, br * s, 0, TAU); ctx.fill(); }
  });
  const st = { font: FACE.mono, weight: 800, size: 86, upper: true, lineHeight: 1.1 };
  const boxes = TXT.layout([...L.words.slice(0, 3), '\n', ...L.words.slice(3)], { x: 560, y: 846, w: 1300 }, { ...st, align: 'right' });
  for (const b of boxes) {
    const wi = b.i > 3 ? b.i - 1 : b.i;
    if (t < L.words[wi].t0) continue;
    TXT.word(ctx, b, { ...st, fill: PAL.patent });
    mark(ctx, li, wi, b.size);
  }
}

// placeCard(ctx, t, li, {x, y, w, rot, tIn}): a reservation card. x, y: centre. The line is the name on it.
function placeCard(ctx, t, li, o = {}) {
  const L = LYR.line(li);
  const { x = W / 2, y = 900, w = 880, rot = -0.02 } = o, tIn = o.tIn ?? KIT.beatBefore(L.t0);
  if (t < tIn) return;
  const D = 880, Hh = 300, k = w / D, s = KIT.slam(t - tIn, 1.3);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k * s, k * s); ctx.translate(-D / 2, -Hh / 2);
  ctx.fillStyle = PAL.mozz; ctx.fillRect(0, 0, D, Hh);
  ctx.strokeStyle = PAL.patent; ctx.lineWidth = 5; ctx.strokeRect(16, 16, D - 32, Hh - 32);
  ctx.lineWidth = 1.5; ctx.strokeRect(27, 27, D - 54, Hh - 54);
  TXT.draw(ctx, 'RESERVADO', D / 2, 82, { font: FACE.book, weight: 600, size: 30, tracking: 0.42, fill: PAL.patent, align: 'center' });
  const st = { font: FACE.book, weight: 600, italic: true, size: 96, fill: PAL.patent };
  const boxes = TXT.layout(L.words, { x: 60, y: 118, w: D - 120 }, { ...st, wrap: false, fit: true, align: 'center' });
  for (const b of boxes) {
    if (t < L.words[b.i].t0) continue;
    TXT.word(ctx, b, st);
    mark(ctx, li, b.i, b.size);
  }
  ctx.fillStyle = PAL.patent; ctx.fillRect(D / 2 - 150, 214, 300, 2);
  TXT.draw(ctx, 'mesa para dos', D / 2, 256, { font: FACE.book, weight: 400, italic: true, size: 34, tracking: 0.04, fill: PAL.patent, align: 'center' });
  ctx.restore();
}

// menuStrip(ctx, t, {y, rot, li, tIn, price, desc, tail}): a correction strip pasted across the menu, set like
// the menu's own rows at the size they have under s022's camera (KIT.MENU's ink, caps and leaders; the name,
// the leaders, the price and the small print each start where the menu's columns do). KIT.menuRow prints into
// the empty row of the plate in plate pixels, which does not survive a clip; the strip sits in frame space and
// covers that row. y: the strip's centre.
//   desc: the small print under the dish. tail: {li, wi, t1} a word of the line before that is still being
//   sung when the shot starts: it is the last word of the small print and is marked until it ends.
const STRIP = { x: 40, w: 1840, h: 146, name: 44, lead: 1630, price: 1802, desc: 104, caps: 55, small: 44 };
function menuStrip(ctx, t, o) {
  const { y, rot = 0, li, tIn, price = '16', desc = '', tail = null } = o;
  if (t < tIn) return;
  const L = LYR.line(li), M = KIT.MENU, S = STRIP, s = KIT.slam(t - tIn, 1.04, 0.07);
  ctx.save();
  ctx.translate(S.x + S.w / 2, y); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-S.w / 2, -S.h / 2);
  ctx.fillStyle = PAL.mozz; ctx.fillRect(0, 0, S.w, S.h);
  ctx.fillStyle = M.ink; ctx.fillRect(0, 0, S.w, 2); ctx.fillRect(0, S.h - 2, S.w, 2);
  const st = { font: FACE.book, weight: M.weight, size: S.caps, tracking: M.track, upper: true, fill: M.ink };
  const base = 64;
  let cx = S.name;
  L.words.forEach((v, i) => {
    if (t >= v.t0) { TXT.draw(ctx, v.w, cx, base, st); mark(ctx, li, i, st.size); }
    cx += TXT.width(v.w + ' ', st) + M.track * st.size;
  });
  ctx.fillStyle = M.ink;
  for (let dx = cx + 12; dx < S.lead; dx += 29) { ctx.beginPath(); ctx.arc(dx, base - 2, 3.2, 0, TAU); ctx.fill(); }
  TXT.draw(ctx, price, S.price, base, { ...st, tracking: 0.04, align: 'right' });
  const ds = { font: FACE.book, italic: true, weight: 400, size: S.small, tracking: M.descTrack, fill: M.ink };
  TXT.draw(ctx, desc, S.desc, base + 55, ds);
  if (tail && t < tail.t1) mark(ctx, tail.li, tail.wi, ds.size);
  ctx.restore();
}

// stack(ctx, t, li, {x, y, w, rows, align, max, ink, from}): tall condensed caps, one row per entry of `rows` (lists
// of word indexes), every row the same size, the widest fitted to w. Each word slams on at its t0.
function stack(ctx, t, li, o) {
  const L = LYR.line(li);
  const { x, y, w, rows, align = 'left', max = 260, ink = PAL.mozz, from = 1.35 } = o;
  const st = { font: FACE.caps, tracking: 0.01, upper: true };
  const text = r => r.map(wi => L.words[wi].w).join(' ');
  const size = Math.min(max, ...rows.map(r => TXT.fit(text(r), { w }, st)));
  const s1 = { ...st, size }, cap = TXT.capH(s1), gap = TXT.width(' ', s1);
  rows.forEach((r, ri) => {
    const rw = TXT.width(text(r), s1), base = y + cap + ri * (cap + size * 0.2);
    let cx = align === 'right' ? x + w - rw : x;
    for (const wi of r) {
      const ww = TXT.width(L.words[wi].w, s1), lt = t - L.words[wi].t0;
      if (lt >= 0) {
        const s = KIT.slam(lt, from, 0.07);
        ctx.save();
        ctx.translate(cx + ww / 2, base - cap / 2); ctx.scale(s, s);
        TXT.draw(ctx, L.words[wi].w, 0, 0, { ...s1, fill: ink, align: 'center', baseline: 'center' });
        mark(ctx, li, wi, size);
        ctx.restore();
      }
      cx += ww + gap;
    }
  });
}

// ---------------------------------------------------------------- 3. pictures

for (const sid of ['s011', 's012', 's013', 's014', 's015', 's016', 's017', 's018', 's019', 's020', 's021', 's022', 's024']) {
  SCENE({ id: `02.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}

// Line 22, "Si vas a hablar de mi cuerpo": tall caps in two stacks, one each side of her. They are drawn
// through the matte when the picture has one, so an edge tucks behind her; without one they sit on top, and
// the stacks stand clear of her either way.
const CUERPO_L = { x: 50, y: 400, w: 550, rows: [[0, 1, 2], [3]], align: 'right' };
const CUERPO_R = { x: 1350, y: 300, w: 510, rows: [[4, 5], [6]], align: 'left' };
SCENE({ id: '02.s023', t0: SHOT.t0('s023'), t1: SHOT.t1('s023'), z: 0, draw(ctx, t) {
  SHOT.draw(ctx, 's023', t, { ...CAM_OF.s023(t), behind: c => { stack(c, t, 22, CUERPO_L); stack(c, t, 22, CUERPO_R); } });
}});

// ---------------------------------------------------------------- 4. lyric surfaces and graphics

// Lines 10 and 11, the Italian chorus: the foreign film is back. Bars cut on with the waiters and off with
// verse 1. A heart sits on the i of "formaggio". In s012 an order ticket hangs out of the top bar and prints
// "1 × FETTA" on "fetta", then one more on every beat she waits.
SCENE({ id: '02.film', t0: B(45), t1: B(57), z: Z_GFX, draw(ctx, t) {
  if (t >= SHOT.t0('s012')) ticket(ctx, t, { x: 384, y: 112, w: 340, tIn: SHOT.t0('s012'), rows: FETTE });
  KIT.bars(ctx, t, {});
  const boxes = KIT.subtitle(ctx, t, 10, { y: 900, tag: '[en italiano]', tOut: SHOT.t1('s011') });
  const f = boxes.find(b => b.i === 5), tF = word(10, 5).t0;
  if (f && t >= tF) {
    const st = { ...STY.sub, size: f.size };
    const ix = f.x + TXT.width('formagg', st) + TXT.width('i', st) * 0.5 + f.size * 0.1;
    const s = KIT.slam(t - tF, 2.2) * (1 + 0.22 * BEAT.pulse(t, 0.2));
    heart(ctx, ix, 900 - f.size * 0.76, f.size * 0.19 * s, PAL.tomato, PAL.patent, f.size * 0.1);
  }
  KIT.subtitle(ctx, t, 11, { y: 900, tOut: SHOT.t1('s012') });
}});

// Line 12, "Me miraste la cintura": his panel has no reading yet, and his gaze comes down the scale from her
// eyes to her waist, landing on "cintura".
SCENE({ id: '02.gaze', t0: B(57), t1: B(61), z: Z_GFX, draw(ctx, t) {
  gazeMeter(ctx, t, { x: 210, y0: 280, y1: 860, tIn: B(57), tDrop: word(12, 1).t0, tLand: word(12, 3).t0 });
  hisPanel(ctx, t, { x: 1330, y: 60, w: 530, li: 12, tIn: B(57), seg: BEAT.pos(t) % 1 < 0.5 ? '---' : '', unit: 'cm' });
}});

// Line 13, "Con carita preocupada": the instrument turns on him and reads it without trouble. 87 %.
// The box is in frame space, wide of his head; he leans into it. Its chip rides the box's left edge at his
// ear, over the white flaw there (PLATES.md, him-worried). The flaw is in the clip too for its first second, so
// the chip is there from the cut. EAR says where the flaw is in the pixels of each picture: one point on the
// plate, keyframes [clip second, x, y] on take M14-t1 (after 1.2 s, when the flaw is gone, they follow his ear).
// On any other take the chip is a tab on the box's corner.
const EAR = { plate: [1346, 556], 'M14-t1': [[0.54, 809, 355], [0.79, 797, 358], [1.04, 783, 363], [1.21, 771, 368], [1.54, 752, 374], [2.04, 723, 384], [2.54, 694, 394], [3.04, 665, 403]] };
function earAt(pic) {
  if (pic.kind === 'plate') return pic.name === 'him-worried' ? SHOT.pt(pic.place, ...EAR.plate) : null;
  const keys = EAR[pic.name];
  if (!keys) return null;
  let i = 0;
  while (i < keys.length - 2 && pic.lt >= keys[i + 1][0]) i++;
  const [k0, x0, y0] = keys[i], [k1, x1, y1] = keys[i + 1], u = clamp((pic.lt - k0) / (k1 - k0));
  return SHOT.pt(pic.place, lerp(x0, x1, u), lerp(y0, y1, u));
}
const FACE_BOX = { x: 470, y: 60, w: 790, h: 910 };
SCENE({ id: '02.carita', t0: B(61), t1: B(65), z: Z_GFX, draw(ctx, t) {
  const pic = at('s014', t), worry = KIT.race(t, word(13, 2).t0, WORRY, 0, 87, 1);
  reticle(ctx, t, { ...FACE_BOX, tIn: B(61) });
  const size = 40, cw = TXT.width('CARITA 87 %', { font: FACE.mono, weight: 700, size }) + size * 0.93, ch = size * 1.57;
  const ear = earAt(pic), past = (pic.kind === 'plate' ? 58 : 38) * SHOT.scale(pic.place);   // the chip's right edge clears the flaw
  const [cx, cy] = ear ? [ear[0] + past - cw, ear[1]] : [FACE_BOX.x - 1.25, FACE_BOX.y - ch / 2];
  chip(ctx, `CARITA ${worry} %`, cx, cy, { size, w: cw });
  KIT.hisCounter(ctx, t, { x: 1320, y: 60, w: 540, li: 13, tIn: B(61), digits: 3, unit: '%', total: worry });
}});

// Line 14, "Yo pensé que era ternura": a soap opera's title script, and hearts that rise beside her. It all
// goes on line 15's first word, a frame before the cut.
const TERNURA = [[1420, 172, 124, -0.05], [1668, 160, 124, -0.05], [1448, 322, 124, -0.05], [1668, 311, 124, -0.05], [1590, 500, 214, -0.05]];
SCENE({ id: '02.ternura', t0: B(65), t1: word(15, 0).t0, z: Z_GFX, draw(ctx, t) {
  for (let i = 0; i < 7; i++) {
    const lt = t - B(65.25 + i * 0.4);
    if (lt < 0) continue;
    const r = 22 + 20 * hash(i, 3), px = 1380 + 440 * hash(i, 5) + 22 * Math.sin(lt * 2.4 + i * 1.9), py = 1010 - 90 * hash(i, 7) - (110 + 80 * hash(i, 9)) * lt;
    heart(ctx, px, py, r * EASE.outBack(clamp(lt / 0.14)), PAL.mozz, PAL.tomato, r * 0.34);
  }
  KIT.script(ctx, t, 14, { at: TERNURA });
}});

// Line 15, "Tú ya estabas sacando cuentas": his calculator's tape. "Tú" is sung a frame before the cut, so
// the tape drops in there. Her dinner prints above the line, a slice every half beat, and the total lands on
// "cuentas".
SCENE({ id: '02.tape', t0: word(15, 0).t0, t1: B(73), z: Z_GFX, draw(ctx, t) {
  tape(ctx, t, {
    x: 1290, w: 540, li: 15, tIn: word(15, 0).t0, head: ['CUENTAS', 'MESA 7 · KCAL'],
    rows: [['PIZZA PEPPERONI', '2310', B(68)], ['1 × FETTA', '290', B(68.5)], ['1 × FETTA', '290', B(69)], ['1 × FETTA', '290', B(69.5)], ['1 × FETTA', '290', B(70)]],
    total: ['TOTAL KCAL', '3470', word(15, 4).t0],
    after: [['META DIARIA', '1800', B(71.5)], ['EXCESO', '1670', B(72)]],
  });
}});

// Lines 16 and 17: what he said, and what she heard, on the same spot of the frame. His block stays over the
// cut to her ("mucho" is still being sung) and hers replaces it on "Yo". Hers stays over the cut to the salad
// until line 18 starts. Beside them the sign: no entry on beat 74, + 1 on beat 76.
const SAID = { x: 1360, y: 190, w: 510, size: 94, tail: null };
SCENE({ id: '02.dijiste', t0: B(73), t1: word(17, 0).t0, z: Z_GFX, draw(ctx, t) {
  KIT.quote(ctx, t, 16, { who: 'his', ...SAID });
}});
SCENE({ id: '02.entendi', t0: word(17, 0).t0, t1: word(18, 0).t0, z: Z_GFX, draw(ctx, t) {
  KIT.quote(ctx, t, 17, { who: 'hers', ...SAID });
}});
SCENE({ id: '02.sign', t0: B(74), t1: B(77), z: Z_GFX, draw(ctx, t) {
  sign(ctx, t, { x: 1690, y: 720, r: 150, tHit: B(74), tFlip: B(76) });
}});

// Line 18, "Si tú sueñas con ensalada": the frame is his thought bubble.
SCENE({ id: '02.suenas', t0: word(18, 0).t0, t1: B(79), z: Z_GFX, draw(ctx, t) {
  thought(ctx, t, 18, {});
}});

// Line 19, "Pues invítala a cenar": a reservation card on the table between him and his date.
SCENE({ id: '02.invitala', t0: B(79), t1: B(81), z: Z_GFX, draw(ctx, t) {
  placeCard(ctx, t, 19, { x: 830, y: 900, w: 860, tIn: B(79) });
}});

// Line 20, "Yo no vine por consejos": her answer, on her palm.
SCENE({ id: '02.consejos', t0: B(81), t1: B(83), z: Z_GFX, draw(ctx, t) {
  KIT.quote(ctx, t, 20, { who: 'hers', x: 350, y: 530, w: 440, size: 84, tail: null, rot: -0.05 });
}});

// Line 21, "Yo vine por el menú": her line is a dish, on a strip pasted over the menu. "consejos" is still
// being sung when the menu cuts on, and it is the last word of the dish's small print.
SCENE({ id: '02.menu', t0: B(83), t1: B(85), z: Z_GFX, draw(ctx, t) {
  menuStrip(ctx, t, { y: 514, rot: KIT.MENU.rot, li: 21, tIn: B(83), price: '16', desc: 'pomodoro, mozzarella, sin consejos', tail: { li: 20, wi: 4, t1: word(20, 4).t1 } });
}});

// Line 22 over the cut: "cuerpo" is still being sung when she turns to the lens, so "de mi cuerpo" stays
// beside her until line 23 starts.
SCENE({ id: '02.cuerpo', t0: B(87), t1: word(23, 0).t0, z: Z_GFX, draw(ctx, t) {
  stack(ctx, t, 22, CUERPO_R);
}});

// Line 23, "Di: “qué buena estás tú”": her block, beside her face. "tú" is sung after beat 89, so the block
// stays over the cut into chapter 3 until that word ends.
SCENE({ id: '02.buena', t0: word(23, 0).t0, t1: word(23, 4).t1, z: Z_GFX, draw(ctx, t) {
  KIT.quote(ctx, t, 23, { who: 'hers', x: 1330, y: 330, w: 560, size: 88, tail: 'left' });
}});
