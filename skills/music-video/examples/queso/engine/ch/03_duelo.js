// 03_duelo.js: chapter 3, the pre-chorus and chorus 2. Beats 89 to 138 (54.91 to 84.91 s), shots s025 to s036,
// lines 24 to 35.
//
// Pre-chorus: a versus chart, TÚ against YO. The chart is the frame. s025 is his column, alone. On beat 93 the
// frame splits and s026 takes the right half, so his water and her dough are compared in one picture while
// the facts build under them. s027 and s028 keep the two column heads and give each line a printed thing of
// its own: a health warning for him, the lid of a pizza box for her. In the stop the lid fills the frame.
// Chorus 2: the nutrition label again, and this time the frame is the label. She sings inside a window cut in
// it (s029). It takes half the frame and slides from the slice to the salad (s030). She eats the words (s031).
// The napkin, and a kiss on the lens (s032). The whole room in the window (s033). His diet app, stamped again
// (s034). His counter goes under in the sauce (s035). Her counter is still climbing (s036).
//
// Every shot of this chapter is a Seedance clip. Nothing here is pinned to a pixel of the picture: each lyric
// surface sits in a part of the frame that the people leave free, with room to spare, and holds when they move.
// Layout as in 01_aperitivo.js: cameras, pictures at z 0, lyric surfaces at z 10.

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;
const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));
const sung = (li, wi, t) => t >= LYR.word(li, wi).t0;
const rule = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
const live = sid => !!SHOT.edit(sid);                              // the shot has its clip
const push = (sid, a, b) => (live(sid) ? [a, a] : [a, b]);         // a slow push only while the shot is a still

// ---------------------------------------------------------------- 1. cameras

const KICKS_31 = [B(115), B(116), B(117)];
const CAM_OF = {
  // he wags the finger: the frame is pushed right so his column head has the left third to itself
  s027: t => ({ move: { zoom: push('s027', 1.2, 1.23), x: [192, 192] }, about: [0.5, 0.4], cam: CAM.punch(t, word(26, 4).t0, 0.04) }),
  // the box lands on the cut
  s028: t => ({ move: { zoom: push('s028', 1.0, 1.03) }, about: [0.5, 0.62], cam: [CAM.punch(t, B(102), 0.05), CAM.shake(t, B(102), 12)] }),
  // "No es grasa, es queso": the frame takes the QUESO slam
  s029: t => ({ move: { zoom: push('s029', 1.0, 1.03) }, about: [0.3, 0.2], cam: [CAM.punch(t, word(28, 4).t0, 0.05), CAM.shake(t, word(28, 4).t0, 14)] }),
  // two plates from above: a bump when the label slides across
  s030: t => ({ move: { zoom: push('s030', 1.0, 1.04) }, about: [0.5, 0.5], cam: CAM.punch(t, B(112), 0.04) }),
  // three bites: a punch on each kick. The take is already far too close, so nothing else moves.
  s031: t => ({ about: [0.44, 0.42], cam: CAM.punch(t, KICKS_31, 0.05) }),
  // the kiss
  s032: t => ({ move: { zoom: push('s032', 1.0, 1.05) }, about: [0.45, 0.3], cam: CAM.punch(t, word(31, 4).t0, 0.05) }),
  // the whole room: the frame takes the QUESO slam
  s033: t => ({ move: { zoom: push('s033', 1.0, 1.03) }, about: [0.5, 0.3], cam: [CAM.punch(t, word(32, 4).t0, 0.05), CAM.shake(t, word(32, 4).t0, 12)] }),
  // the calculator goes into the sauce on each kick; the stamp shakes the frame
  s034: t => ({ about: [0.38, 0.35], cam: [CAM.punch(t, [B(126), B(127), B(128)], 0.035), CAM.shake(t, B(129), 14)] }),
  // the calculator in the sauce
  s035: t => ({ move: { zoom: push('s035', 1.0, 1.05) }, about: [0.7, 0.3], cam: CAM.beat(t, 0.015) }),
  // medals: cropped at the left so the woman at the right edge shows only her arms (PLATES.md). A slap per kick.
  s036: t => ({ move: { zoom: [1.16, 1.16] }, about: [0, 0.55], cam: CAM.punch(t, [B(134), B(135), B(136), B(137)], 0.035) }),
};
const at = (sid, t) => SHOT.at(sid, t, CAM_OF[sid](t));

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s027', 's028', 's030', 's031', 's032', 's033', 's034', 's035', 's036']) {
  SCENE({ id: `03.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}

// The versus chart is the frame. Geometry shared by the two picture scenes and the chart drawn over them.
const VS = { head: 140, cw: W / 2, gut: 8, cellY: 808, cellH: 112, rowH: 80, pad: 40 };
const COL = {
  tu: { x: 0, y: VS.head, w: VS.cw - VS.gut / 2, h: H - VS.head },
  yo: { x: VS.cw + VS.gut / 2, y: VS.head, w: VS.cw - VS.gut / 2, h: H - VS.head },
};
const DIMS = { plate: { w: 2944, h: 1648 }, clip: { w: 1920, h: 1080 } };

// colPic(ctx, sid, t, box, {at, zoom}): the picture of shot `sid`, cropped into `box`. Private: SHOT.draw always
// fills the frame. at: [fx, fy], the point of the picture (0 to 1) that sits at the centre of the box.
// zoom: a number, or pic => number. It follows the edit list like SHOT.draw: clip when there is one, else plate.
function colPic(ctx, sid, t, box, o = {}) {
  const pic = SHOT.at(sid, t, {});
  const d = DIMS[pic.kind], zoom = typeof o.zoom === 'function' ? o.zoom(pic) : o.zoom || 1;
  const s = Math.max(box.w / d.w, box.h / d.h) * zoom, iw = d.w * s, ih = d.h * s;
  const [fx, fy] = o.at || [0.5, 0.5];
  const mx = (iw - box.w) / 2, my = (ih - box.h) / 2;
  const place = { fit: 'cover', box, zoom, x: clamp((0.5 - fx) * iw, -mx, mx), y: clamp((0.5 - fy) * ih, -my, my) };
  ctx.save();
  ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  if (pic.kind === 'clip') MEDIA.drawClip(ctx, pic.name, pic.lt, place);
  else MEDIA.drawPlate(ctx, pic.name, place);
  ctx.restore();
  return pic;
}

// His picture. In s025 it has the whole frame under the chart head. On beat 93 the frame splits: he keeps the
// left column and stays on through s026, so the two sides are compared in one frame. Once his clip has run
// out it pushes in slowly; a still does that from the start.
const UNDER = { x: 0, y: VS.head, w: W, h: H - VS.head };
const TU_PIC = (t, fx) => ({
  at: [fx, 0],
  zoom: pic => {
    const idle = pic.kind === 'clip' ? Math.max(0, pic.lt - ASSETS.clips[pic.name].n / 24) : t - B(89);
    return (1 + 0.012 * (idle / BEAT.period)) * CAM.punch(t, word(24, 0).t0, 0.04).zoom;
  },
});
const YO_PIC = t => ({
  at: [0.47, 0.5],
  zoom: pic => (pic.kind === 'clip' ? 1 : 1 + 0.012 * (BEAT.pos(t) - 93)) * CAM.punch(t, [B(93), word(25, 0).t0], 0.04).zoom,
});

SCENE({ id: '03.s025', t0: SHOT.t0('s025'), t1: SHOT.t1('s025'), z: 0, draw(ctx, t) {
  colPic(ctx, 's025', t, UNDER, TU_PIC(t, 0.5));
}});
SCENE({ id: '03.s026', t0: SHOT.t0('s026'), t1: SHOT.t1('s026'), z: 0, draw(ctx, t) {
  colPic(ctx, 's025', t, COL.tu, TU_PIC(t, 0.475));
  colPic(ctx, 's026', t, COL.yo, YO_PIC(t));
}});

// s029: the label is the whole frame. With a matte she kneels in front of it. Without one the label is drawn
// on top with a window cut in it for her (scene 03.label below).
SCENE({ id: '03.s029', t0: SHOT.t0('s029'), t1: SHOT.t1('s029'), z: 0, draw(ctx, t) {
  const o = CAM_OF.s029(t), pic = SHOT.at('s029', t, o);
  SHOT.draw(ctx, 's029', t, pic.matte ? { ...o, behind: c => labelFull(c, t, 28, true) } : o);
}});

// ---------------------------------------------------------------- 3. lyric surfaces and graphics

// ---- lines 24 and 25, "Tú con tu agua sin gas / Yo con masa artesanal": the versus chart.
// The first word of each line slams into its column head. The rest fills the cell under the picture. Then the
// facts, one row at a time. Private, because KIT.versus is one centred table and would sit on both faces.
const FACTS = [
  [{ text: '0 kcal', t: B(92) }, { text: '0 alegría', t: B(93) }],
  [{ text: '1200 kcal', t: B(95) }, { stars: [95.75, 96, 96.25, 96.5, 96.75].map(B), t: B(95.75) }],
];
function starPath(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}
function versus(ctx, t) {
  const { head, cw, cellY, cellH, rowH, pad } = VS;
  rule(ctx, 0, 0, cw, head, PAL.patent);
  rule(ctx, cw, 0, cw, head, PAL.tomato);
  const hs = { font: FACE.caps, size: 124, tracking: 0.02, upper: true, align: 'center', baseline: 'center' };
  const cs = { font: FACE.sans, weight: 800, tracking: -0.02, fill: PAL.patent };
  const fs = { font: FACE.sans, weight: 700, size: 56, tracking: -0.01, fill: PAL.patent, align: 'center', baseline: 'center' };
  const rest = li => LYR.line(li).words.slice(1).map(v => v.w).join(' ');
  const size = Math.min(84, TXT.fit(rest(24), { w: cw - 2 * pad }, cs), TXT.fit(rest(25), { w: cw - 2 * pad }, cs));
  [[24, PAL.ice], [25, PAL.mozz]].forEach(([li, ink], k) => {
    const L = LYR.line(li), x = k * cw, lt = t - L.words[0].t0;
    if (lt >= 0) {                                                 // TÚ, YO
      const s = KIT.slam(lt, 1.8, 0.08);
      ctx.save(); ctx.translate(x + cw / 2, head / 2); ctx.scale(s, s);
      TXT.draw(ctx, L.words[0].w, 0, 0, { ...hs, fill: ink });
      mark(ctx, li, 0, hs.size);
      ctx.restore();
    }
    const tc = L.words[1].t0;
    if (t >= tc) {                                                 // the rest of the line, in the cell
      ctx.save();
      ctx.beginPath(); ctx.rect(x, cellY - 3, cw, (cellH + 3) * EASE.outCubic(clamp((t - tc) / 0.1))); ctx.clip();
      rule(ctx, x, cellY, cw, cellH, PAL.mozz);
      rule(ctx, x, cellY - 3, cw, 6, PAL.patent);
      for (const b of TXT.layout(L.words.slice(1), { x: x + pad, y: cellY, w: cw - 2 * pad, h: cellH }, { ...cs, size, wrap: false, align: 'center' })) {
        if (t < L.words[b.i + 1].t0) continue;
        TXT.word(ctx, b, cs);
        mark(ctx, li, b.i + 1, b.size);
      }
      ctx.restore();
    }
    FACTS[k].forEach((f, i) => {                                   // the facts
      if (t < f.t) return;
      const y = cellY + cellH + i * rowH;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, cw, rowH * EASE.outCubic(clamp((t - f.t) / 0.1))); ctx.clip();
      rule(ctx, x, y, cw, rowH, PAL.mozz);
      rule(ctx, x, y - 2, cw, 4, PAL.patent);
      if (f.text) TXT.draw(ctx, f.text, x + cw / 2, y + rowH / 2 + 2, fs);
      (f.stars || []).forEach((ts, j) => {
        if (t < ts) return;
        const s = KIT.slam(t - ts, 2, 0.07);
        ctx.save(); ctx.translate(x + cw / 2 + (j - 2) * 72, y + rowH / 2 + 2); ctx.scale(s, s);
        ctx.fillStyle = PAL.tomato; starPath(ctx, 0, 0, 30); ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    });
  });
  rule(ctx, 0, head - 3, W, 6, PAL.patent);
  rule(ctx, cw - VS.gut / 2, 0, VS.gut, t < B(93) ? head : H, PAL.patent);   // the frame splits on beat 93
}
SCENE({ id: '03.versus', t0: B(89), t1: B(97), z: Z_GFX, draw(ctx, t) { versus(ctx, t); } });

// ---- line 26, "Tú diciendo: “eso hace mal”": his column head again, and under it what he says, printed as
// the health warning on a cigarette pack: a white box, a thick black border, heavy black type.
function warning(ctx, t) {
  const L = LYR.line(26), x = 56, y = 60, w = 570, hh = 148;
  rule(ctx, x, y, w, hh, PAL.patent);
  const hs = { font: FACE.caps, size: 124, tracking: 0.02, upper: true, fill: PAL.ice };
  const ds = { font: FACE.sans, weight: 800, size: 62, tracking: -0.02, fill: PAL.ice };
  const tw = TXT.width(L.words[0].w, hs), cy = y + hh / 2;
  if (sung(26, 0, t)) {
    const s = KIT.slam(t - L.words[0].t0, 1.8, 0.08);
    ctx.save(); ctx.translate(x + 34 + tw / 2, cy); ctx.scale(s, s);
    TXT.draw(ctx, L.words[0].w, 0, 0, { ...hs, align: 'center', baseline: 'center' });
    mark(ctx, 26, 0, hs.size);
    ctx.restore();
  }
  if (sung(26, 1, t)) {
    TXT.draw(ctx, L.words[1].w, x + 34 + tw + 26, cy + TXT.capH(hs) / 2, ds);
    mark(ctx, 26, 1, ds.size);
  }
  const tQ = L.words[2].t0;
  if (t < tQ) return;
  const toks = L.words.slice(2).map(v => v.w), bw = 14, padX = 40;
  const st = { ...STY.label, tracking: -0.03 };
  const size = Math.min(190, ...toks.map(tk => TXT.fit(tk, { w: w - 2 * (bw + padX) }, st)));
  const cap = TXT.capH({ ...st, size }), lh = size * 0.98, padY = 52;
  let h = 2 * padY + cap;
  for (let k = 1; k < toks.length; k++) h += lh * EASE.outCubic(clamp((t - L.words[2 + k].t0) / 0.08));
  const by = y + hh + 14, s = KIT.slam(t - tQ, 1.2, 0.08);
  ctx.save();
  ctx.translate(x + w / 2, by + h / 2); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  rule(ctx, 0, 0, w, h, PAL.patent);
  rule(ctx, bw, bw, w - 2 * bw, h - 2 * bw, PAL.mozz);
  toks.forEach((tk, k) => {
    if (!sung(26, 2 + k, t)) return;
    TXT.draw(ctx, tk, w / 2, padY + cap + k * lh, { ...st, size, align: 'center' });
    mark(ctx, 26, 2 + k, size);
  });
  ctx.restore();
}
SCENE({ id: '03.warning', t0: B(97), t1: B(102), z: Z_GFX, draw(ctx, t) { warning(ctx, t); } });

// ---- line 27, "Yo: “una grande pa’ llevar”": her column head on the lid of a pizza box, and the order printed
// on it in one colour, the way a box is printed. "Yo:" is sung a frame before the cut, so the lid lands there.
// In the stop she picks the box up and brings it at the lens. The printed lid does the same: its white grows
// until it is the whole frame, one frame before the cut, and the cut lands on the white of the label.
const LID = { x: 840, y: 204, w: 472, h: 330, rot: -0.03 };
function lid(ctx, t) {
  const L = LYR.line(27), t0 = L.words[0].t0;
  if (t < t0) return;
  const { w, h } = LID, s = KIT.slam(t - t0, 1.5, 0.08), m = 13, band = 88;
  ctx.save();
  ctx.translate(LID.x, LID.y); ctx.rotate(LID.rot); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  rule(ctx, 0, 0, w, h, PAL.mozz);
  ctx.strokeStyle = PAL.tomato; ctx.lineWidth = 6; ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);
  rule(ctx, m, m, w - 2 * m, band, PAL.tomato);
  const hs = { font: FACE.caps, size: 74, tracking: 0.03, upper: true, fill: PAL.mozz };
  TXT.draw(ctx, L.words[0].w, w / 2, m + band / 2, { ...hs, align: 'center', baseline: 'center' });
  mark(ctx, 27, 0, hs.size);
  const st = { font: FACE.caps, tracking: 0.015, upper: true, fill: PAL.tomato };
  const rows = [[1, 2], [3, 4]], text = r => r.map(i => L.words[i].w).join(' ');
  const size = Math.min(112, ...rows.map(r => TXT.fit(text(r), { w: w - 2 * m - 48 }, st)));
  const cap = TXT.capH({ ...st, size }), y0 = m + band + 32 + cap, lh = cap + 28;
  rows.forEach((r, k) => {
    let cx = w / 2 - TXT.width(text(r), { ...st, size }) / 2;
    for (const i of r) {
      if (sung(27, i, t)) { TXT.draw(ctx, L.words[i].w, cx, y0 + k * lh, { ...st, size }); mark(ctx, 27, i, size); }
      cx += TXT.width(L.words[i].w + ' ', { ...st, size }) + st.tracking * size;
    }
  });
  ctx.restore();
}
SCENE({ id: '03.lid', t0: word(27, 0).t0, t1: B(107), z: Z_GFX, draw(ctx, t) {
  const u = clamp((t - B(106)) / (B(107) - 0.045 - B(106)));       // the lid comes at the lens: white one frame before the cut
  if (u > 0) {
    const e = EASE.inCubic(u);
    ctx.save();
    ctx.translate(lerp(LID.x, W / 2, e), lerp(LID.y, H / 2, e)); ctx.rotate(LID.rot * (1 - e));
    const w = lerp(LID.w, W * 1.02, e), h = lerp(LID.h, H * 1.02, e);
    rule(ctx, -w / 2, -h / 2, w, h, PAL.mozz);
    ctx.restore();
  }
  lid(ctx, t);
}});

// ---- the chorus-2 label: the frame itself is the label. Paper to every edge, the label's thick border, and
// a window cut in the paper for the picture. paper(ctx, win): win is the window's outline in frame px, or
// null for no window (the whole frame is paper, for SHOT.draw's `behind` when a take has a matte).
function paper(ctx, win) {
  const path = () => { win.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
  ctx.fillStyle = PAL.mozz;
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  if (win) path();
  ctx.fill('evenodd');
  ctx.strokeStyle = PAL.patent;
  if (win) { ctx.lineWidth = 5; ctx.beginPath(); path(); ctx.stroke(); }
  ctx.lineWidth = 12; ctx.strokeRect(22, 22, W - 44, H - 44);
}
const capFirst = v => v.charAt(0).toLocaleUpperCase('es') + v.slice(1);

// ---- line 28, "No es grasa, es queso": she is inside the label.
// Private, because KIT.label's wide layout wants a matte and keeps a gap in the middle of the frame, and here
// she kneels left of centre and throws one arm across the right half. The lyric sets in two blocks at the
// right, above and below that arm, and the window is shaped to where she and her arms go.
const WIN_29 = [[56, 56], [870, 56], [870, 352], [1864, 352], [1864, 762], [1040, 762], [1040, 1024], [56, 1024]];
function labelFull(ctx, t, li, full) {
  const L = LYR.line(li), ink = PAL.patent, x0 = 916, x1 = 1858;
  paper(ctx, full ? null : WIN_29);

  // top block: the title, the thick rule, "No es Grasa,"
  const title = { ...STY.label, tracking: -0.035 };
  const ts = TXT.fit('Información Nutricional', { w: x1 - x0 }, title);
  TXT.draw(ctx, 'Información Nutricional', x0, 150, { ...title, size: ts });
  rule(ctx, x0, 170, x1 - x0, 22, ink);
  const yA = 312;
  const sm = { font: FACE.sans, weight: 800, size: 84, fill: ink, tracking: -0.02 }, hv = { ...STY.label, fill: ink };
  const w = i => L.words[i], gap = TXT.width(' ', sm) * 0.9;
  const xEs = x0 + TXT.width(w(0).w, sm) + gap, xName = xEs + TXT.width(w(1).w, sm) + gap * 1.3;
  if (sung(li, 0, t)) { TXT.draw(ctx, w(0).w, x0, yA, sm); mark(ctx, li, 0, sm.size); }
  if (sung(li, 1, t)) { TXT.draw(ctx, w(1).w, xEs, yA, sm); mark(ctx, li, 1, sm.size); }
  const name = capFirst(w(2).w), nst = { ...hv, size: 132 };
  if (sung(li, 2, t)) { TXT.draw(ctx, name, xName, yA, nst); mark(ctx, li, 2, nst.size); }
  const u = clamp((t - w(3).t0) / 0.09);
  if (u > 0) rule(ctx, xName - 12, yA - TXT.capH(nst) * 0.5 - 9, (TXT.width(name, nst) + 24) * EASE.outCubic(u), 18, PAL.tomato);
  TXT.draw(ctx, 'Porción', x1, yA - 44, { font: FACE.sans, weight: 500, size: 34, fill: ink, align: 'right' });
  TXT.draw(ctx, 'toda', x1, yA, { font: FACE.sans, weight: 800, size: 34, fill: ink, align: 'right' });

  // bottom block: "es" and the slab
  const qs = { font: FACE.caps, tracking: 0.01, upper: true, size: 244 };
  const qw = TXT.width('QUESO', qs) + 80, qh = TXT.capH(qs) + 60, qx = x1 - 10 - qw / 2, qy = 896;
  if (sung(li, 3, t)) { TXT.draw(ctx, w(3).w, qx - qw / 2 - gap * 1.5 - TXT.width(w(3).w, sm), qy + TXT.capH(sm) / 2, sm); mark(ctx, li, 3, sm.size); }
  if (sung(li, 4, t)) {
    const s = KIT.slam(t - w(4).t0, full ? 2.2 : 1.7, 0.09);
    ctx.save();
    ctx.translate(qx, qy); ctx.rotate(-0.03); ctx.scale(s, s);
    rule(ctx, -qw / 2, -qh / 2, qw, qh, PAL.cheese);
    TXT.draw(ctx, 'QUESO', 0, 0, { ...qs, fill: ink, align: 'center', baseline: 'center' });
    mark(ctx, li, 4, qs.size);
    ctx.restore();
  }
}
SCENE({ id: '03.label', t0: B(107), t1: B(110), z: Z_GFX, draw(ctx, t) {
  if (at('s029', t).matte) return;                                 // drawn behind her by the picture scene
  labelFull(ctx, t, 28, false);
}});

// ---- line 29, "No es culpa, es progreso": the label takes half the frame. Two plates from above: ANTES is
// the salad, DESPUÉS is the slice. On the downbeat the label slides off the slice and onto the salad.
SCENE({ id: '03.progreso', t0: B(110), t1: B(115), z: Z_GFX, draw(ctx, t) {
  const u = EASE.outExpo(clamp((t - B(112)) / 0.18));
  KIT.slab(ctx, t, 'ANTES', { x: 250, y: 118, size: 112, rot: -0.03, bg: PAL.ice, tHit: B(110), from: 1.6 });
  KIT.slab(ctx, t, 'DESPUÉS', { x: 1640, y: 962, size: 112, rot: 0.025, bg: PAL.tomato, ink: PAL.mozz, tHit: B(112) + 0.1, from: 1.6 });
  KIT.label(ctx, t, { x: lerp(W / 2, 0, u), y: 48, w: W / 2, culpa: 29, tIn: B(110), tCulpa: B(110), bar: [112.5, 114.5] });
}});

// ---- line 30, "Mira cómo me lo como": she eats her words. One slab per word down the right of the frame. On
// each eighth note that follows she takes the word that has just been sung: a bite leaves half of MIRA and of
// CÓMO for three frames, then nothing; ME and LO go whole, one after the other. COMO is left, nibbled. Each
// slab has its own layer, so a bite takes only its own word. Bites are given from the slab's centre.
const MIRA = [
  { wi: 0, text: 'MIRA', x: 1622, y: 170, size: 240, rot: -0.03, bg: PAL.mozz, from: 1.4,
    bites: [{ x: -120, y: 14, r: 200, rot: 0, t: B(116) }], gone: B(116) + 0.11 },
  { wi: 1, text: 'CÓMO', x: 1624, y: 424, size: 228, rot: 0.025, bg: PAL.mozz, from: 1.3, padY: 0.2,
    bites: [{ x: 130, y: 10, r: 200, rot: Math.PI, t: B(116.5) }], gone: B(116.5) + 0.11 },
  { wi: 2, text: 'ME', x: 1500, y: 664, size: 184, rot: -0.04, bg: PAL.mozz, from: 1.4,
    bites: [], gone: B(117) },
  { wi: 3, text: 'LO', x: 1742, y: 668, size: 184, rot: 0.03, bg: PAL.mozz, from: 1.6,
    bites: [], gone: B(117) + 0.085 },
  { wi: 4, text: 'COMO', x: 1616, y: 912, size: 250, rot: -0.025, bg: PAL.cheese, from: 1.5,
    bites: [{ x: 330, y: -158, r: 76, rot: 2.4, t: B(117.5) }, { x: -330, y: 156, r: 72, rot: -0.7, t: B(117.75) }] },
];
SCENE({ id: '03.mira', t0: B(115), t1: B(118), z: Z_GFX, draw(ctx, t) {
  for (const s of MIRA) {
    if (!sung(30, s.wi, t) || t >= (s.gone ?? Infinity)) continue;
    KIT.bitten(ctx, t, g => KIT.slab(g, t, s.text, { ...s, li: 30 }), s.bites.map(b => ({ ...b, x: s.x + b.x, y: s.y + b.y })), `ch03.bite${s.wi}`);
  }
}});

// ---- line 31, "Y te mando un beso": the napkin again, and this time the kiss is sent to the lens: one big
// print that lands on "beso", over the white of the waiter's jacket, and throbs on every beat after.
SCENE({ id: '03.napkin', t0: B(118), t1: B(123), z: Z_GFX, draw(ctx, t) {
  KIT.napkin(ctx, t, 31, { x: 1392, y: 150, w: 496, rot: 0.05, kiss: false });
  KIT.kiss(ctx, t, { x: 1420, y: 850, size: 360, rot: -0.24, tHit: word(31, 4).t0, pulse: 0.09 });
}});

// ---- line 32, "No es grasa, es queso": the whole room. The same label: the room is in the window and the
// lyric runs across the foot of the frame, under the table.
const WIN_33 = [[56, 56], [1864, 56], [1864, 800], [56, 800]];
function labelFoot(ctx, t, li) {
  const L = LYR.line(li), ink = PAL.patent, x0 = 78, x1 = 1842, cy = 923;
  paper(ctx, WIN_33);
  const ts = { ...STY.label, size: 56, tracking: -0.035 };
  TXT.draw(ctx, 'Información', x0, cy - 32, ts);
  TXT.draw(ctx, 'Nutricional', x0, cy + 28, ts);
  TXT.draw(ctx, 'Porción: toda', x0 + 2, cy + 74, { font: FACE.sans, weight: 600, size: 26, fill: ink });
  const tw = Math.max(TXT.width('Información', ts), TXT.width('Nutricional', ts));
  rule(ctx, x0 + tw + 28, 826, 12, 194, ink);
  const sm = { font: FACE.sans, weight: 800, size: 84, fill: ink, tracking: -0.02 }, hv = { ...STY.label, fill: ink };
  const w = i => L.words[i], gap = TXT.width(' ', sm) * 0.9, base = cy + 52;
  const xNo = x0 + tw + 28 + 12 + 36, xEs = xNo + TXT.width(w(0).w, sm) + gap, xName = xEs + TXT.width(w(1).w, sm) + gap * 1.3;
  // QUESO takes the right end; "Grasa," gets what is left between
  const qs = { font: FACE.caps, tracking: 0.01, upper: true, size: 204 };
  const qw = TXT.width('QUESO', qs) + 72, qh = TXT.capH(qs) + 52, qx = x1 - qw / 2;
  const xEs2 = qx - qw / 2 - gap * 1.4 - TXT.width(w(3).w, sm);
  const name = capFirst(w(2).w), ns = Math.min(156, TXT.fit(name, { w: xEs2 - gap * 2 - xName }, hv)), nst = { ...hv, size: ns };
  if (sung(li, 0, t)) { TXT.draw(ctx, w(0).w, xNo, base, sm); mark(ctx, li, 0, sm.size); }
  if (sung(li, 1, t)) { TXT.draw(ctx, w(1).w, xEs, base, sm); mark(ctx, li, 1, sm.size); }
  if (sung(li, 2, t)) { TXT.draw(ctx, name, xName, base, nst); mark(ctx, li, 2, ns); }
  const u = clamp((t - w(3).t0) / 0.09);
  if (u > 0) rule(ctx, xName - 10, base - TXT.capH(nst) * 0.5 - ns * 0.07, (TXT.width(name, nst) + 20) * EASE.outCubic(u), ns * 0.14, PAL.tomato);
  if (sung(li, 3, t)) { TXT.draw(ctx, w(3).w, xEs2, base, sm); mark(ctx, li, 3, sm.size); }
  if (sung(li, 4, t)) {
    const s = KIT.slam(t - w(4).t0, 1.8, 0.09);
    ctx.save();
    ctx.translate(qx, cy); ctx.rotate(-0.03); ctx.scale(s, s);
    rule(ctx, -qw / 2, -qh / 2, qw, qh, PAL.cheese);
    TXT.draw(ctx, 'QUESO', 0, 0, { ...qs, fill: ink, align: 'center', baseline: 'center' });
    mark(ctx, li, 4, qs.size);
    ctx.restore();
  }
}
SCENE({ id: '03.coro', t0: B(123), t1: B(126), z: Z_GFX, draw(ctx, t) { labelFoot(ctx, t, 32); } });

// ---- line 33, "No me vengas con complejos": his diet app speaks up again, now that its calculator is in the
// sauce. She answers, and the answer is stamped. "No" is sung before the cut, so the surface rides over it.
SCENE({ id: '03.complejos', t0: word(33, 0).t0, t1: B(130), z: Z_GFX, draw(ctx, t) {
  KIT.notice(ctx, t, { x: 1250, y: 56, w: 630, body: ['Calculadora sin conexión.', 'Última ubicación: salsa.'], tIn: word(33, 0).t0 });
  KIT.quote(ctx, t, 33, { who: 'hers', x: 1250, y: 258, w: 630, size: 98, tail: null, hug: false });
  KIT.stamp(ctx, t, { x: 1560, y: 152, size: 150, rot: -0.1, tHit: B(129), from: 1.7 });
}});

// ---- line 34, "Tú contando calorías": his counter, drowning. The panel goes under at the bottom of the frame
// with the total still running, and what it counted comes up as bubbles and pops.
const BUBBLES = [
  { b: 131, x: 820, kcal: 90 }, { b: 131.5, x: 1010, kcal: 285 }, { b: 132, x: 760, kcal: 45 }, { b: 132.5, x: 1180, kcal: 310 },
  { b: 133, x: 890, kcal: 120 }, { b: 133.25, x: 420, kcal: 266 }, { b: 133.5, x: 1100, kcal: 75 },
];
function bubble(ctx, t, o) {
  const rise = 1.5 * BEAT.period, lt = t - B(o.b);
  if (lt < 0 || lt >= rise + 0.14) return;
  const y = lerp(1100, o.y1 ?? 470, EASE.outQuad(clamp(lt / rise))), x = o.x + 16 * Math.sin(lt * 6 + o.b);
  if (lt < rise) {
    const st = { font: FACE.mono, weight: 700, size: 36, fill: PAL.patent }, text = `+${o.kcal} kcal`;
    const cw = TXT.width(text, st) + 32, ch = 56;
    rule(ctx, x - cw / 2, y - ch / 2, cw, ch, PAL.ice);
    TXT.draw(ctx, text, x, y, { ...st, align: 'center', baseline: 'center' });
  } else {                                                         // pop: a ring that opens and is gone
    const p = (lt - rise) / 0.14;
    ctx.strokeStyle = PAL.ice; ctx.lineWidth = 5 * (1 - p);
    ctx.beginPath(); ctx.arc(x, y, lerp(30, 86, EASE.outCubic(p)), 0, TAU); ctx.stroke();
  }
}
SCENE({ id: '03.his', t0: B(130), t1: B(134), z: Z_GFX, draw(ctx, t) {
  for (const o of BUBBLES) bubble(ctx, t, o);
  const e = EASE.inOutQuad(clamp((t - B(132.25)) / (B(134) - B(132.25)))), x = 60, y = 606, w = 720, h = 356 * (720 / 620);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 + 262 * e); ctx.rotate(-0.09 * e); ctx.translate(-w / 2, -h / 2);
  KIT.hisCounter(ctx, t, { x: 0, y: 0, w, li: 34, tIn: B(130), total: KIT.race(t, B(130), B(134), 2310, 9990, 1.3) });
  ctx.restore();
}});

// ---- line 35, "Yo contando pepperonis": her counter, still climbing from where chorus 1 left it at ten. One
// more on every eighth note from the first one she pins on him. "Yo" is sung before the cut, so the panel
// lands over his as it goes under.
const MEDALS = [...Array(10).fill(-1), ...[134.5, 135, 135.5, 136, 136.5, 137, 137.5].map(B)];
SCENE({ id: '03.hers', t0: word(35, 0).t0, t1: B(138), z: Z_GFX, draw(ctx, t) {
  KIT.herCounter(ctx, t, { x: 50, y: 782, w: 760, li: 35, hits: MEDALS, tIn: word(35, 0).t0 });
}});
