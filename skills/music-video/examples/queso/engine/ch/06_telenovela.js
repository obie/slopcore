// 06_telenovela.js: chapter 6, the bridge. Beats 196 to 248 (120.42 to 152.26 s), shots s055 to s066, lines 54 to 65.
//
// The breakup, staged as a telenovela and played straight: title script over a triple crash zoom, a news
// banner that holds over two shots, an order ticket stamped SERVIDO, three gasps, an episode card, his tape
// measure against her counter, two speech quotes, a stand-off cut like a western, a notice of termination
// signed with a kiss, and the status card that flips as he walks out.
//
// Every shot of the film becomes a Seedance clip made from its plate. So nothing here is pinned to plate
// pixels: every surface sits in frame space, in a part of the frame the people leave free, with room to spare
// around faces and hands. Cameras are crash zooms, punches and shakes only; a still keeps the kit's own slow
// push until its clip lands. Type is drawn on top, never through a matte, because the clips have none.

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;
const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));

// ---------------------------------------------------------------- 1. cameras

// Every camera here is one object, combined with CAM.mix. A list handed to SHOT.draw as `cam` is dropped while
// the shot shows a plate: SHOT.at nests it inside its own list and CAM.mix flattens one level only.
const AY1 = LYR.line(54).words.map(w => w.t0), AY2 = LYR.line(58).words.map(w => w.t0);

// s059, three gasps: the second "ay" is sung on the half beat, so the cuts are at 212.5 and 213.
const GASP = [
  { plate: 'gasp-him', t0: B(212), about: [0.43, 0.42] },
  { plate: 'gasp-waiter', t0: B(212.5), about: [0.48, 0.34] },
  { plate: 'gasp-nonna', t0: B(213), about: [0.5, 0.46] },
];
const gaspAt = t => (t < GASP[1].t0 ? 0 : t < GASP[2].t0 ? 1 : 2);

// s066: she sings until beat 245, then he leaves. The edit list keys a clip by shot, so today the singing
// take would play over the second plate too: hold the plate there until that plate has a clip of its own.
const T_LEAVES = B(245);
function heLeaves(t, o) {
  const a = SHOT.at('s066', t, { ...o, plate: 'he-leaves' });      // the kit plays the plate's own clip (F66b) when the edit list has it
  return a.kind === 'clip' && /^W66/.test(a.name) ? { ...o, plate: 'he-leaves', clip: null } : { ...o, plate: 'he-leaves' };
}

// Her counter in s062, and the three bites that take half of MUNDO off it on the eighth notes after the line.
// The bites are in the panel's own units (640 wide); the camera punches on each.
const MUNDO = { x: 44, y: 50, w: 570 };
const BITES = [
  { x: 620, y: 212, r: 92, rot: 3.3, t: B(226.5) },
  { x: 510, y: 296, r: 78, rot: 4.5, t: B(227) },
  { x: 540, y: 130, r: 58, rot: 2.2, t: B(227.5) },
].map(b => ({ ...b, x: MUNDO.x + (b.x * MUNDO.w) / 640, y: MUNDO.y + (b.y * MUNDO.w) / 640, r: (b.r * MUNDO.w) / 640 }));

const CAM_OF = {
  // "Ay, ay, ay": the triple crash zoom into her face, one step per "ay"
  s055: t => ({ about: [0.44, 0.37], cam: CAM.mix(CAM.crash(t, AY1[0], 1.1), CAM.crash(t, AY1[1], 1.1), CAM.crash(t, AY1[2], 1.12)) }),
  // the news photo: the camera crashes onto her and the gasping waiters on "nacional"
  s056: t => ({ about: [0.37, 0.33], cam: CAM.crash(t, B(201), 1.2) }),
  // the runway: a pump on every step
  s057: t => ({ about: [0.5, 0.35], cam: CAM.beat(t, 0.03) }),
  // the sauce: a punch on "salsa", and the frame takes the stamp on beat 211
  s058: t => ({ about: [0.42, 0.3], cam: CAM.mix(CAM.punch(t, word(57, 2).t0, 0.04), CAM.punch(t, B(211), 0.05), CAM.shake(t, B(211), 12)) }),
  // three gasps, a crash zoom on each face, and one more on the grandmother on beat 214
  s059: t => {
    const k = gaspAt(t), g = GASP[k];
    return { plate: g.plate, about: g.about, cam: CAM.mix(CAM.crash(t, AY2[k], 1.3), k === 2 ? CAM.crash(t, B(214), 1.18) : null) };
  },
  // nose to nose. Framed in past the glove at the bottom left of the plate (PLATES.md), and a still keeps a
  // slow push. The crash lands on beat 216.
  s060: t => ({ move: { zoom: SHOT.edit('s060') ? [1.3, 1.3] : [1.3, 1.35] }, about: [0.56, 0.2], cam: CAM.crash(t, B(216), 1.14) }),
  // he squints through the tape: a crash zoom into the squint on beat 221, under "mi figura"
  s061: t => ({ about: [0.5, 0.36], cam: CAM.crash(t, B(221), 1.28) }),
  // she eats the world: a punch on "mundo" and on every bite that follows
  s062: t => ({ about: [0.5, 0.45], cam: CAM.mix(CAM.punch(t, [word(61, 3).t0, ...BITES.map(b => b.t)], 0.045), CAM.shake(t, word(61, 3).t0, 10)) }),
  // the postcard
  s063: t => ({ about: [0.45, 0.42], cam: CAM.punch(t, word(62, 5).t0, 0.05) }),
  // deadpan, cheeks full: a crash zoom on "sobrevivir". It grows from the left edge, away from her quote.
  s064: t => ({ about: [0.12, 0.42], cam: CAM.crash(t, B(234), 1.16) }),
  // the stand-off, cut like a western on every kick: the two of them, his hand, her and the gun, him
  s065: t => {
    if (t < B(237)) return { about: [0.5, 0.45] };
    if (t < B(238)) return { about: [0.52, 1], cam: CAM.crash(t, B(237), 1.5) };
    if (t < B(239)) return { move: { zoom: [1.48, 1.48] }, about: [0, 0], cam: CAM.crash(t, B(238), 1.08, 0.12) };
    return { move: { zoom: [1.48, 1.48] }, about: [1, 0], cam: CAM.mix(CAM.crash(t, B(239), 1.08, 0.12), CAM.punch(t, B(240), 0.04)) };
  },
  // the ultimatum: a crash zoom on "aquí". Then he leaves, and the frame takes the switch on beat 246.
  s066: t => (t < T_LEAVES
    ? { plate: 'ultimatum', about: [0.44, 0.34], cam: CAM.crash(t, B(244), 1.16) }
    : heLeaves(t, { about: [0.6, 0.5], cam: CAM.punch(t, B(246), 0.04) })),
};

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s055', 's056', 's057', 's058', 's059', 's060', 's061', 's062', 's063', 's064', 's065', 's066']) {
  SCENE({ id: `06.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}

// ---------------------------------------------------------------- 3. private devices

// a small channel bug: white caps on black, an optional tomato square for "live"
function bug(ctx, text, x, y, live) {
  const st = { font: FACE.sans, weight: 800, size: SIZE.note, tracking: 0.14, fill: PAL.mozz };
  const lead = live ? 40 : 0, w = TXT.width(text, st) + 40 + lead;
  ctx.fillStyle = PAL.patent; ctx.fillRect(x, y, w, 52);
  if (live) { ctx.fillStyle = PAL.tomato; ctx.fillRect(x + 18, y + 16, 20, 20); }
  TXT.draw(ctx, text, x + 20 + lead, y + 27, { ...st, baseline: 'center' });
}

// his panel with a score on it: cold mono caps and a seven-segment number with one decimal that runs up from
// 0.0 between tIn and tLand. No sung words on it.
function hisScore(ctx, t, o) {
  const { x, y, w = 380, label = 'MODELO', value = 9.8, unit = '/10', tIn = 0, tLand = tIn + 0.6 } = o;
  if (t < tIn) return;
  const D = 380, Hh = 214, k = w / D, pad = 30;
  const v = value * Math.pow(clamp((t - tIn) / (tLand - tIn)), 1.6);
  const pop = 1 + 0.1 * KIT.hit(t, tLand, 0.18);
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, D * EASE.outExpo(clamp((t - tIn) / 0.14)), Hh); ctx.clip();
  ctx.fillStyle = PAL.patent; ctx.fillRect(0, 0, D, Hh);
  ctx.strokeStyle = PAL.ice; ctx.lineWidth = 2.5; ctx.strokeRect(10, 10, D - 20, Hh - 20);
  TXT.draw(ctx, label, pad, 70, { ...STY.his, size: 42 });
  const seg = { ...STY.seg, size: 92 };
  TXT.draw(ctx, unit, D - pad, 178, { font: FACE.mono, weight: 600, size: SIZE.note, fill: PAL.ice, align: 'right' });
  ctx.translate(pad, 178); ctx.scale(pop, pop);
  TXT.draw(ctx, '8.8', 0, 0, { ...seg, opacity: 0.13 });
  TXT.draw(ctx, v.toFixed(1), 0, 0, seg);
  ctx.restore();
}

// a tailor's tape pulled across the frame, with the sung line printed on it. y: centre of the band, which is
// tilted by `rot` about the frame centre. extra(ctx, {x0, cm, top}) draws in the tape's own tilted frame: x0 is
// the zero of the tape, cm the px per centimetre, top the upper edge.
function cinta(ctx, t, li, o = {}) {
  const L = LYR.line(li);
  const { y = 900, h = 176, rot = -0.022, size = 116, tIn = L.t0, cm = 19, extra = null } = o;
  if (t < tIn) return;
  const run = EASE.outExpo(clamp((t - tIn) / 0.2)), x0 = -80, len = (W + 160) * run;
  const st = { font: FACE.caps, size, tracking: 0.015, upper: true, fill: PAL.patent };
  ctx.save();
  ctx.translate(W / 2, y); ctx.rotate(rot); ctx.translate(-W / 2, 0);
  ctx.fillStyle = PAL.cheese; ctx.fillRect(x0, -h / 2, len, h);
  ctx.fillStyle = PAL.patent; ctx.fillRect(x0 + len - 16, -h / 2 - 10, 16, h + 20);      // the end hook
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, -h / 2, len - 16, h); ctx.clip();
  const num = { font: FACE.mono, weight: 700, size: 24, fill: PAL.patent };
  for (let i = 1; x0 + i * cm < W + 80; i++) {                                           // one tick per centimetre
    const x = x0 + i * cm, ten = i % 10 === 0, five = i % 5 === 0;
    ctx.fillRect(x - (ten ? 2 : 1.25), -h / 2, ten ? 4 : 2.5, ten ? 40 : five ? 27 : 16);
    if (ten) TXT.draw(ctx, String(i), x + 8, -h / 2 + 40, num);
  }
  ctx.fillRect(x0, h / 2 - 7, len, 3);
  const sp = TXT.width(' ', st) * 1.15, ws = L.words.map(v => TXT.width(v.w, st));
  const total = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1), cap = TXT.capH(st);
  let cx = W / 2 - total / 2;
  const base = h / 2 - 22;
  L.words.forEach((v, i) => {
    const lt = t - v.t0;
    if (lt >= 0) {
      const s = KIT.slam(lt, 1.25, 0.07);
      ctx.save(); ctx.translate(cx + ws[i] / 2, base - cap / 2); ctx.scale(s, s);
      TXT.draw(ctx, v.w, 0, cap / 2, { ...st, align: 'center' });
      mark(ctx, li, i, size);
      ctx.restore();
    }
    cx += ws[i] + sp;
  });
  ctx.restore();
  if (extra) extra(ctx, { x0, cm, top: -h / 2 });
  ctx.restore();
}

// her counter for "Yo comiéndome medio mundo": white caps on tomato, a percentage that runs to 50 on "medio",
// and MUNDO landing beside it. Draw it inside KIT.bitten so the bites take half the word.
function mundo(ctx, t, o = {}) {
  const li = 61, L = LYR.line(li);
  const { x = 44, y = 50, w = 570, tIn = SHOT.t0('s062') } = o;
  if (t < tIn) return;
  const D = 640, Hh = 300, k = w / D, pad = 30;
  const tCount = L.words[1].t0, tHalf = L.words[2].t0, tWorld = L.words[3].t0;
  const n = Math.floor(50 * Math.pow(clamp((t - tCount) / (tHalf - tCount)), 1.4));
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, D * EASE.outExpo(clamp((t - tIn) / 0.14)), Hh); ctx.clip();
  ctx.fillStyle = PAL.tomato; ctx.fillRect(0, 0, D, Hh);
  const st = { ...STY.caps };
  const s1 = Math.min(72, TXT.fit(L.words.slice(0, 3).map(v => v.w).join(' '), { w: D - 2 * pad }, st));
  let cx = pad;
  for (let i = 0; i < 3; i++) {
    if (t >= L.words[i].t0) { TXT.draw(ctx, L.words[i].w, cx, 88, { ...st, size: s1 }); mark(ctx, li, i, s1); }
    cx += TXT.width(L.words[i].w + ' ', { ...st, size: s1 });
  }
  ctx.fillStyle = PAL.mozz; ctx.fillRect(pad, 112, D - 2 * pad, 5);
  // the count, a divider, and the word: MUNDO is the larger of the two
  const big = { ...st, size: 108 }, cy = 117 + (Hh - 117) / 2 + 2;
  const pw = TXT.width('50%', big), ps = 1 + 0.14 * KIT.hit(t, tHalf, 0.16);
  ctx.save(); ctx.translate(pad + pw / 2, cy); ctx.scale(ps, ps);
  TXT.draw(ctx, `${n}%`, 0, 0, { ...big, align: 'center', baseline: 'center' });
  ctx.restore();
  ctx.fillRect(pad + pw + 20, 140, 5, Hh - 164);
  if (t >= tWorld) {
    const room = D - pad - (pad + pw + 46), ms = Math.min(150, TXT.fit(L.words[3].w, { w: room }, st)), mw = TXT.width(L.words[3].w, { ...st, size: ms });
    const s = KIT.slam(t - tWorld, 1.3, 0.08);
    ctx.save(); ctx.translate(D - pad - mw / 2, cy); ctx.scale(s, s);
    TXT.draw(ctx, L.words[3].w, 0, 0, { ...st, size: ms, align: 'center', baseline: 'center' });
    mark(ctx, li, 3, ms);
    ctx.restore();
  }
  ctx.restore();
}

// a small flat sun. x, y: where its centre comes to rest; it rises there from 2.4 radii below.
function sol(ctx, t, o = {}) {
  const { x, y, r = 80, tIn = 0 } = o;
  const lt = t - tIn;
  if (lt < 0) return;
  const cy = y + (1 - EASE.outBack(clamp(lt / 0.32))) * r * 2.4;
  const R = r * (1.5 + 0.14 * BEAT.pulse(t, 0.25)), n = 12, a0 = lt * 0.5, da = 0.11;
  ctx.save();
  ctx.translate(x, cy);
  ctx.fillStyle = PAL.cheese;
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - da) * r * 1.14, Math.sin(a - da) * r * 1.14);
    ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
    ctx.lineTo(Math.cos(a + da) * r * 1.14, Math.sin(a + da) * r * 1.14);
    ctx.closePath(); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.restore();
}

// warning tape across the frame: black condensed caps on yellow, hazard stripes at both ends.
// y: centre of the band. shake: a CAM.shake result that jolts the tape.
function precinto(ctx, t, li, o = {}) {
  const L = LYR.line(li);
  const { y = 92, h = 132, rot = -0.016, size = 100, tIn = L.t0, shake = null } = o;
  if (t < tIn) return;
  const run = EASE.outExpo(clamp((t - tIn) / 0.2));
  const st0 = { font: FACE.caps, tracking: 0.02, upper: true, fill: PAL.patent };
  const line = L.words.map(v => v.w).join(' ');
  const sz = Math.min(size, TXT.fit(line, { w: W - 520 }, st0)), st = { ...st0, size: sz };
  const sp = TXT.width(' ', st) * 1.15, ws = L.words.map(v => TXT.width(v.w, st));
  const total = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1), cap = TXT.capH(st);
  const xl = -W / 2 - 80, full = W + 160;
  ctx.save();
  ctx.translate(W / 2 + (shake ? shake.x : 0), y + (shake ? shake.y : 0)); ctx.rotate(rot + (shake ? shake.rot : 0));
  ctx.beginPath(); ctx.rect(xl, -h / 2, full * run, h); ctx.clip();
  ctx.fillStyle = PAL.cheese; ctx.fillRect(xl, -h / 2, full, h);
  ctx.fillStyle = PAL.patent;
  const sw = 44, lean = h * 0.7, gapX = total / 2 + 56;
  for (const [a, b] of [[xl, -gapX], [gapX, xl + full]]) {                               // the stripes
    ctx.save();
    ctx.beginPath(); ctx.rect(a, -h / 2, b - a, h); ctx.clip();
    for (let x = a - lean; x < b + lean; x += sw * 2) {
      ctx.beginPath();
      ctx.moveTo(x + lean, -h / 2); ctx.lineTo(x + lean + sw, -h / 2); ctx.lineTo(x + sw, h / 2); ctx.lineTo(x, h / 2);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  let cx = -total / 2;
  L.words.forEach((v, i) => {
    const lt = t - v.t0;
    if (lt >= 0) {
      const s = KIT.slam(lt, 1.25, 0.07);
      ctx.save(); ctx.translate(cx + ws[i] / 2, 0); ctx.scale(s, s);
      TXT.draw(ctx, v.w, 0, cap / 2, { ...st, align: 'center' });
      mark(ctx, li, i, sz);
      ctx.restore();
    }
    cx += ws[i] + sp;
  });
  ctx.restore();
}

// a notice of termination: paper, a thick rule, the sung line in bold book serif on two rows, one line of
// small print and a signature line that takes her kiss on the last word. x, y: top left.
function aviso(ctx, t, li, o = {}) {
  const L = LYR.line(li);
  const { x = 1190, y = 84, w = 660, tIn = L.t0, brk = 2, title = 'AVISO DE TERMINACIÓN', small = 'Con efecto inmediato.' } = o;
  if (t < tIn) return;
  const D = 660, pad = 42, k = w / D;
  const body = { font: FACE.book, weight: 700, tracking: -0.015, fill: PAL.patent };
  const rows = [L.words.slice(0, brk), L.words.slice(brk)];
  const fit = Math.min(92, ...rows.map(r => TXT.fit(r.map(v => v.w).join(' '), { w: D - 2 * pad }, body)));
  const st = { ...body, size: fit }, cap = TXT.capH(st);
  const y1 = 116 + 40 + cap, y2 = y1 + fit * 1.22, yRule = y2 + 38, ySmall = yRule + 46, ySign = ySmall + 96, Hh = ySign + 46;
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, D, Hh * EASE.outExpo(clamp((t - tIn) / 0.22))); ctx.clip();
  ctx.fillStyle = PAL.mozz; ctx.fillRect(0, 0, D, Hh);
  ctx.strokeStyle = PAL.patent; ctx.lineWidth = 6; ctx.strokeRect(3, 3, D - 6, Hh - 6);
  TXT.draw(ctx, title, pad, 78, { font: FACE.sans, weight: 800, size: 31, tracking: 0.17, fill: PAL.patent });
  ctx.fillStyle = PAL.patent; ctx.fillRect(pad, 100, D - 2 * pad, 16);
  let wi = 0;
  rows.forEach((row, ri) => {
    let cx = pad;
    for (const v of row) {
      if (t >= v.t0) { TXT.draw(ctx, v.w, cx, ri ? y2 : y1, st); mark(ctx, li, wi, fit); }
      cx += TXT.width(v.w + ' ', st);
      wi++;
    }
  });
  ctx.fillRect(pad, yRule, D - 2 * pad, 2);
  TXT.draw(ctx, small, pad, ySmall, { font: FACE.sans, weight: 500, size: 27, fill: PAL.patent });
  const lab = { font: FACE.sans, weight: 800, size: 27, fill: PAL.patent };
  const lw = TXT.draw(ctx, 'Firma', pad, ySign, lab);
  ctx.fillRect(pad + lw + 16, ySign + 2, D - 2 * pad - lw - 16, 3);
  ctx.restore();
  KIT.kiss(ctx, t, { x: D - pad - 170, y: ySign - 30, size: 190, rot: -0.16, tHit: L.words[L.words.length - 1].t0 });
  ctx.restore();
}

// ---------------------------------------------------------------- 4. lyric surfaces and graphics

// Line 54, "Ay, ay, ay": the title script, one word per crash zoom, down the right of the frame where she is not.
SCENE({ id: '06.ay', t0: SHOT.t0('s055'), t1: SHOT.t1('s055'), z: Z_GFX, draw(ctx, t) {
  KIT.script(ctx, t, 54, { at: [[1450, 215, 240, -0.1], [1620, 510, 270, 0.07], [1460, 790, 310, -0.05]] });
}});

// Lines 55 and 56: the news. One banner holds over the cut to the runway; the headline changes, the ticker
// runs on. Live picture, then library pictures, and his panel gives the model her score as "modelo" lands.
const TICKER = 'NOVIO EXIGE ENSALADA   ·   LA PIZZA SIGUE EN LA MESA   ·   TESTIGOS: «NO PARPADEÓ»';
SCENE({ id: '06.noticia', t0: B(199), t1: B(206.5), z: Z_GFX, draw(ctx, t) {
  const archive = t >= B(203);
  KIT.news(ctx, t, { li: archive ? 56 : 55, tIn: B(199), ticker: TICKER, y: 760 });
  if (t - B(199) > 0.1) bug(ctx, archive ? 'IMÁGENES DE ARCHIVO' : 'EN VIVO', 90, 64, !archive);
  if (archive) hisScore(ctx, t, { x: 1450, y: 64, w: 380, label: 'MODELO', value: 9.8, tIn: B(204), tLand: word(56, 4).t0 });
}});

// Line 57, "Yo quiero salsa adicional": the order ticket, top left, clear of her open arms. Stamped on beat 211.
SCENE({ id: '06.comanda', t0: SHOT.t0('s058'), t1: SHOT.t1('s058'), z: Z_GFX, draw(ctx, t) {
  KIT.receipt(ctx, t, { x: 40, y: -10, w: 540, head: ['COMANDA', 'MESA 7'], rows: [['PIZZA PEPPERONI', '1'], ['ENSALADA', '1']], li: 57, b0: 205.25, step: 0.25 });
  KIT.stamp(ctx, t, { text: 'SERVIDO', x: 310, y: 158, size: 94, rot: -0.12, tHit: B(211), from: 2 });
}});

// Line 58, "Ay, ay, ay": one "ay" per gasp. The words stay up over the cuts, in the corners every face leaves free.
SCENE({ id: '06.gasp', t0: SHOT.t0('s059'), t1: SHOT.t1('s059'), z: Z_GFX, draw(ctx, t) {
  KIT.script(ctx, t, 58, { at: [[1500, 250, 260, 0.08], [400, 270, 290, -0.1], [1530, 795, 320, -0.05]] });
}});

// Line 59, "Qué conflicto tan profundo": the episode card, under the two profiles.
SCENE({ id: '06.capitulo', t0: SHOT.t0('s060'), t1: SHOT.t1('s060'), z: Z_GFX, draw(ctx, t) {
  KIT.episode(ctx, t, { li: 59, y: 890, w: 1560, tIn: B(215) });
}});

// Line 60, "Él cuidando mi figura": printed on a tape measure pulled across the frame. His tag reads the tape.
SCENE({ id: '06.cinta', t0: SHOT.t0('s061'), t1: SHOT.t1('s061'), z: Z_GFX, draw(ctx, t) {
  cinta(ctx, t, 60, { y: 905, tIn: SHOT.t0('s061'), extra: (c, g) => {
    const x = g.x0 + 60 * g.cm;                       // the 60 on the tape
    KIT.hisTag(c, t, { x: x - 70, y: g.top - 7, w: 140, h: 62, label: 'META', kcal: 60, unit: 'cm', tIn: word(60, 3).t0, chip: 'tr' });
  }});
}});

// Line 61, "Yo comiéndome medio mundo": her counter runs to 50% on "medio", MUNDO lands, and three bites on
// the eighth notes after the line take half of it.
SCENE({ id: '06.mundo', t0: SHOT.t0('s062'), t1: SHOT.t1('s062'), z: Z_GFX, draw(ctx, t) {
  KIT.bitten(ctx, t, g => mundo(g, t, MUNDO), BITES, 'ch06.mundo');
}});

// Line 62, his quote: “piensa en el verano”, and a small sun comes up behind the block on "verano". The block
// sits high in the top left corner: in the clip he waves his free hand up to head height on the right and lifts
// the postcard to y 330 on the left, from x 600. Above that, left of x 560, he leaves the frame alone.
SCENE({ id: '06.verano', t0: SHOT.t0('s063'), t1: SHOT.t1('s063'), z: Z_GFX, draw(ctx, t) {
  const q = { who: 'his', x: 56, y: 118, w: 500, size: 80, tail: 'right' };
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, q.y + 1); ctx.clip();
  sol(ctx, t, { x: q.x + 356, y: q.y - 4, r: 64, tIn: word(62, 5).t0 });
  ctx.restore();
  KIT.quote(ctx, t, 62, q);
}});

// Line 63, her answer: “piensa en sobrevivir”, on the other side of the frame. Her survival kit prints on a
// slip at the top right from the crash zoom on beat 234, one line per sixteenth note.
SCENE({ id: '06.sobrevivir', t0: SHOT.t0('s064'), t1: SHOT.t1('s064'), z: Z_GFX, draw(ctx, t) {
  KIT.quote(ctx, t, 63, { who: 'hers', x: 48, y: 236, w: 500, size: 92, tail: 'right' });
  KIT.receipt(ctx, t, { x: 1420, y: -10, w: 470, head: ['KIT DE SUPERVIVENCIA'], rows: [['PIZZA', '1'], ['PIZZA', '1'], ['PIZZA', '1']], b0: 234, step: 0.25 });
}});

// Line 64, "Porque si tocas mi rebanada": warning tape across the top, above every face in all four framings.
// It jolts when the camera crashes onto his hand.
SCENE({ id: '06.rebanada', t0: SHOT.t0('s065'), t1: SHOT.t1('s065'), z: Z_GFX, draw(ctx, t) {
  precinto(ctx, t, 64, { y: 76, h: 120, size: 92, tIn: SHOT.t0('s065'), shake: CAM.shake(t, [B(237), B(238), B(239)], 7, 0.3) });
}});

// Line 65, "Esta relación termina aquí": a notice of termination, right of her. Her kiss signs it on "aquí".
SCENE({ id: '06.aviso', t0: SHOT.t0('s066'), t1: T_LEAVES, z: Z_GFX, draw(ctx, t) {
  aviso(ctx, t, 65, { x: 1200, y: 84, w: 650, tIn: SHOT.t0('s066') });
}});

// He leaves. The status card comes up on the cut and the switch goes over on beat 246.
SCENE({ id: '06.estado', t0: T_LEAVES, t1: SHOT.t1('s066'), z: Z_GFX, draw(ctx, t) {
  KIT.status(ctx, t, { x: 90, y: 110, w: 860, tIn: T_LEAVES, tFlip: B(246) });
}});
