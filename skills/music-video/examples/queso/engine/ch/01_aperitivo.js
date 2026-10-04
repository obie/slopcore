// 01_aperitivo.js: chapter 1, the exemplar. Beats 0 to 45 (0.00 to 27.97 s), shots s001 to s010, lines 0 to 9.
//
// Intro: a one-beat cold open on the last cheese pull with the title, then two Italian asides as film
// subtitles under letterbox bars. Chorus 1: the nutrition label is built,
// "Mira cómo me lo como" as slabs that get eaten, the kiss on a napkin, the couple, the stamp, his counter
// against hers.
//
// How this file is laid out, for the chapters that copy it:
//   1. CAM_OF: one camera per shot, a function of t that returns SHOT.draw options. A picture scene and any
//      graphics scene that pins things to the picture both read it, so they agree on every frame.
//   2. Picture scenes at z 0, one per shot, t0 and t1 straight from the shot's beats.
//   3. Graphics scenes at z 10, one per lyric surface. A surface starts at its first word's t0 even when that
//      is a frame or two before the cut (line 7 here), so no sung word waits for the picture.
//   4. Things pinned to the picture (his tags, her boxes) are given in plate pixels and mapped with SHOT.box and
//      SHOT.pt. These three clips keep the plate's framing under a locked camera, so the same boxes are scaled
//      onto the clip (k = picture width / 2944). Where something crosses a pin, the pin hides in clip time (HIDDEN).

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;

// ---------------------------------------------------------------- 1. cameras

const CAM_OF = {
  // the empty plate: a slow push toward it
  s001: t => ({ move: { zoom: [1.05, 1.13] }, about: [0.48, 0.62] }),
  // she waits: push toward her face. On beat 12 the pizza lands: a punch and a shake.
  s002: t => ({ move: { zoom: [1.04, 1.15] }, about: [0.44, 0.45], cam: [CAM.punch(t, B(12), 0.05), CAM.shake(t, B(12), 12)] }),
  // "No es grasa, es queso": the frame jumps when QUESO lands
  s003: t => ({ move: { zoom: [1.04, 1.09] }, about: [0.47, 0.36], cam: [CAM.punch(t, word(2, 4).t0, 0.06), CAM.shake(t, word(2, 4).t0, 14)] }),
  // the flex, pumping on every beat
  s004: t => ({ move: { zoom: [1.04, 1.1] }, about: [0.41, 0.28], cam: CAM.beat(t, 0.025) }),
  // the bite: a punch on each kick, a shake when COMO lands
  s005: t => ({ move: { zoom: [1.06, 1.12] }, about: [0.5, 0.45], cam: [CAM.punch(t, [B(22), B(23)], 0.05), CAM.shake(t, word(4, 4).t0, 10)] }),
  // the kiss: push in, punch on "beso"
  s006: t => ({ move: { zoom: [1.04, 1.12] }, about: [0.42, 0.5], cam: CAM.punch(t, word(5, 4).t0, 0.06) }),
  // the reveal: pull back to show the two of them
  s007: t => ({ move: { zoom: [1.12, 1.03], ease: EASE.outCubic }, about: [0.5, 0.5] }),
  // the finger: push in, the frame takes the stamp on beat 35
  s008: t => ({ move: { zoom: [1.03, 1.08] }, about: [0.55, 0.42], cam: [CAM.punch(t, B(35), 0.05), CAM.shake(t, B(35), 16)] }),
  // him and the calculator
  s009: t => ({ move: { zoom: [1.04, 1.1] }, about: [0.5, 0.42], cam: CAM.beat(t, 0.02) }),
  // the pizza from above, turning a little, a small tick on every eighth note
  s010: t => ({ move: { zoom: [1.05, 1.11], rot: [-0.012, 0.012] }, about: [0.45, 0.5], cam: CAM.beat(t, 0.012, 0.12, 0.5) }),
};
const at = (sid, t) => SHOT.at(sid, t, CAM_OF[sid](t));

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s002', 's003', 's004', 's005', 's006', 's008', 's009', 's010']) {
  SCENE({ id: `01.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}

// s001 opens cold on her: up to the first kick after the downbeat (beat 1) the picture is the last cheese pull,
// the clip of s092 from its first frame, which is the plate the single's cover is cut from. So frame one of the
// film, the frame a feed shows before anyone presses play, is her and the title. On beat 1 it cuts to the
// empty plate and the story starts. Obie, 2026-10-04: "she just has to show in the first frame".
const T_OPEN = B(1), POSTER = SHOT.edit('s092');
SCENE({ id: '01.s001', t0: SHOT.t0('s001'), t1: SHOT.t1('s001'), z: 0, draw(ctx, t) {
  if (t >= T_OPEN) SHOT.draw(ctx, 's001', t, CAM_OF.s001(t));
  else if (POSTER) SHOT.draw(ctx, 's001', t, { clip: POSTER.clip, in: 0, warp: null });
  else SHOT.draw(ctx, 's001', t, { clip: null, plate: 'last-pull', move: { zoom: [1, 1] } });
}});

// s007 draws its label between the background and the two of them, so it has its own picture scene.
SCENE({ id: '01.s007', t0: SHOT.t0('s007'), t1: SHOT.t1('s007'), z: 0, draw(ctx, t) {
  SHOT.draw(ctx, 's007', t, { ...CAM_OF.s007(t), behind: c => KIT.label(c, t, { x: 626, y: 34, w: 444, grasa: 6 }) });
}});

// ---------------------------------------------------------------- 3. lyric surfaces and graphics

// The title card: the presenting credit, her name and QUESO are on screen from the first frame to the cut to
// s002. They sit right of centre, over the wood panelling beside her face in the cold open, and keep that place
// over the empty plate. The slab and the name are the end card's (KIT.title). The credit and the name sit in
// the top letterbox bar, white on black, and the slab hangs under the bar.
const TITLE = { x: 1430, y: 292, size: 250, nameY: 120, nameSize: 72, byY: 42, bySize: 34 };
const CREDIT = { font: FACE.sans, weight: 700, upper: true, tracking: 0.16, fill: PAL.mozz, align: 'center' };
function titleCard(ctx, t) {
  if (t >= SHOT.t1('s001')) return;
  KIT.slab(ctx, t, 'QUESO', { x: TITLE.x, y: TITLE.y, size: TITLE.size, rot: -0.035, from: 1 });
  TXT.draw(ctx, 'Obie Fernandez presenta', TITLE.x, TITLE.byY, { ...CREDIT, size: TITLE.bySize });
  TXT.draw(ctx, 'Saindra', TITLE.x, TITLE.nameY, { font: FACE.book, italic: true, weight: 500, size: TITLE.nameSize, fill: PAL.mozz, align: 'center' });
}

// Intro, lines 0 and 1: a foreign film. The bars stay until the chorus cuts them off.
SCENE({ id: '01.film', t0: 0, t1: B(13), z: Z_GFX, draw(ctx, t) {
  KIT.bars(ctx, t);
  titleCard(ctx, t);
  KIT.subtitle(ctx, t, 0, { y: 900, tag: '[en italiano]', tOut: SHOT.t1('s001') });
  KIT.subtitle(ctx, t, 1, { y: 900, tOut: B(9) });
}});

// Chorus, lines 2 and 3: the label. It unrolls on the cut, holds through the cut to s004 and grows there.
SCENE({ id: '01.label', t0: B(13), t1: B(21), z: Z_GFX, draw(ctx, t) {
  KIT.label(ctx, t, { x: 1340, y: 60, w: 520, grasa: 2, culpa: 3, bar: [18.5, 20.5] });
}});

// Line 4, "Mira cómo me lo como": one slab per word. CÓMO throws a copy of itself down the frame; it lands on
// "como" as COMO, and the first bite takes the accent. Three more bites on the eighth notes that follow.
// `from` is how large a slab is on its hit frame. The three beside her face land from 1.7 so they stay off it.
const MIRA = [
  { wi: 0, text: 'MIRA', x: 280, y: 172, size: 200, rot: -0.05, bg: PAL.mozz, from: 1.7 },
  { wi: 1, text: 'CÓMO', x: 1600, y: 180, size: 200, rot: 0.04, bg: PAL.mozz },
  { wi: 2, text: 'ME', x: 190, y: 900, size: 170, rot: 0.03, bg: PAL.mozz, from: 1.7 },
  { wi: 3, text: 'LO', x: 420, y: 912, size: 170, rot: -0.04, bg: PAL.mozz, from: 1.7 },
  { wi: 4, text: 'COMO', x: 1560, y: 880, size: 250, rot: -0.04, bg: PAL.cheese },
];
// where the accent of CÓMO sits on the slab that lands, so the first bite can take it
const ANTON = { font: FACE.caps, size: MIRA[4].size, tracking: 0.01 };
const ACCENT = {
  x: MIRA[4].x - TXT.width('COMO', ANTON) / 2 + TXT.width('C', ANTON) + 0.01 * ANTON.size + TXT.width('O', ANTON) / 2,
  y: MIRA[4].y - TXT.capH(ANTON) / 2 - ANTON.size * 0.1,
};
SCENE({ id: '01.mira', t0: B(21), t1: B(24), z: Z_GFX, draw(ctx, t) {
  const land = word(4, 4).t0, from = MIRA[1], to = MIRA[4], eaten = land + 0.125;
  KIT.bitten(ctx, t, g => {
    for (const s of MIRA) KIT.slab(g, t, s.wi === 4 && t < eaten ? 'CÓMO' : s.text, { ...s, li: 4 });
    const u = clamp((t - (land - 0.2)) / 0.2);
    if (u > 0 && u < 1) {                              // the copy in flight: not yet the sung word, so not marked
      const e = EASE.inQuad(u);
      KIT.slab(g, t, 'CÓMO', { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e), size: lerp(from.size, to.size, e), rot: lerp(from.rot, to.rot - TAU, e), bg: PAL.mozz, from: 1 });
    }
  }, [
    { x: ACCENT.x + 6, y: ACCENT.y - 22, r: 60, rot: Math.PI / 2, t: eaten },      // the accent
    { x: from.x - 250, y: from.y + 110, r: 84, rot: -0.7, t: B(23.25) },
    { x: to.x + 300, y: to.y + 150, r: 104, rot: 3.9, t: B(23.5) },
    { x: MIRA[0].x + 230, y: MIRA[0].y - 40, r: 84, rot: 2.9, t: B(23.75) },
  ]);
}});

// Line 5, "Y te mando un beso": written on a paper napkin, with the print of the kiss on "beso".
SCENE({ id: '01.napkin', t0: B(24), t1: B(29), z: Z_GFX, draw(ctx, t) {
  KIT.napkin(ctx, t, 5, { x: 1250, y: 96, w: 580 });
}});

// s007: he measures everything, her pizza included. Plate pixels; the chip on the glass hides a logo there.
const HIS_7 = [
  { box: [1865, 1140, 2360, 1370], label: 'ENSALADA', kcal: 45, b: 29.5, chip: 'bl' },
  { box: [2392, 915, 2625, 1490], label: 'AGUA', kcal: 0, b: 30, chip: 'tl', logo: [2450, 1065] },
  { box: [505, 1120, 1290, 1455], label: 'PIZZA', kcal: 2310, b: 30.5, chip: 'tr' },
];
SCENE({ id: '01.his7', t0: SHOT.t0('s007'), t1: SHOT.t1('s007'), z: Z_GFX, draw(ctx, t) {
  const pic = at('s007', t), k = pic.place.dims.w / 2944;      // the clip holds the plate's framing: same boxes, scaled
  for (const h of HIS_7) KIT.hisTag(ctx, t, { ...SHOT.box(pic.place, ...h.box.map(v => v * k)), label: h.label, kcal: h.kcal, tIn: B(h.b), chip: h.chip, chipAt: h.logo && pic.kind === 'plate' ? SHOT.pt(pic.place, ...h.logo) : null });
}});

// Line 7, "No me vengas con complejos": his diet app speaks up, she answers, the answer is stamped.
// "No" is sung two frames before the cut to s008, so the surface starts there and rides over the cut.
SCENE({ id: '01.complejos', t0: word(7, 0).t0 - 0.07, t1: B(36), z: Z_GFX, draw(ctx, t) {
  KIT.notice(ctx, t, { x: 1200, y: 56, w: 660, body: ['Meta diaria superada.', 'Sugerencia: ensalada.'], tIn: word(7, 0).t0 - 0.07 });
  KIT.quote(ctx, t, 7, { who: 'hers', x: 1200, y: 262, w: 660, size: 100, tail: null, hug: false });
  KIT.stamp(ctx, t, { x: 1540, y: 158, size: 112, rot: -0.1, tHit: B(35), from: 1.8 });
}});

// Line 8, "Tú contando calorías": his counter, and a kcal tag on everything he looks at.
// Everything on the table gets a number, and every number is zero. The total races anyway.
const HIS_9 = [
  { box: [640, 995, 935, 1575], label: 'AGUA', kcal: 0, b: 36.5, chip: 'tl' },
  { box: [120, 875, 465, 1640], label: 'VELA', kcal: 0, b: 37.5, chip: 'tl' },
  { box: [1800, 1020, 2400, 1640], label: 'LÁMPARA', kcal: 0, b: 38.5, chip: 'tl' },
];
SCENE({ id: '01.his', t0: B(36), t1: B(40), z: Z_GFX, draw(ctx, t) {
  const pic = at('s009', t), k = pic.place.dims.w / 2944;
  for (const h of HIS_9) KIT.hisTag(ctx, t, { ...SHOT.box(pic.place, ...h.box.map(v => v * k)), label: h.label, kcal: h.kcal, tIn: B(h.b), chip: h.chip, lead: 0 });
  KIT.hisCounter(ctx, t, { x: 1240, y: 60, w: 620, li: 8, total: KIT.race(t, B(36), B(39.5), 0, 2310) });
}});

// Line 9, "Yo contando pepperonis": a box snaps onto one pepperoni on every eighth note, and the count climbs.
// Plate pixels, in counting order; the first is the one her finger is on.
const PEPPERONI = [[1830, 724], [1444, 730], [1500, 486], [1756, 360], [1150, 460], [764, 516], [756, 816], [1020, 820], [1300, 1012], [1570, 992]];
const TAPS = PEPPERONI.map((p, i) => B(40 + i * 0.5));
// On the clip (F10, take 1: locked camera, the plate is its first frame) her finger hops from pepperoni to pepperoni
// and she takes one away. HIDDEN[i] lists the clip seconds when pepperoni i is under her hand or gone, measured on
// the take's frames; its box drops out then, the way a tracker loses its target.
const HIDDEN = [[[0.12,0.54],[0.79,2.12],[2.29,3.75]], [[0.79,3.5]], [[2.29,3.67]], [[2.62,4.0]], [[2.38,3.58]], [[3.25,5.12]], [[1.88,2.46]], [[1.46,2.62]], [[1.38,2.62]], [[1.38,3.42]]];
SCENE({ id: '01.hers', t0: B(40), t1: B(45), z: Z_GFX, draw(ctx, t) {
  const pic = at('s010', t), k = pic.place.dims.w / 2944;
  if (pic.kind === 'plate' || pic.name === 'F10-t1') PEPPERONI.forEach(([px, py], i) => {
    if (pic.kind === 'clip' && HIDDEN[i].some(([a, b]) => pic.lt >= a && pic.lt < b)) return;
    const [x, y] = SHOT.pt(pic.place, px * k, py * k);
    KIT.herBox(ctx, t, { x, y, r: 106 * k * SHOT.scale(pic.place), n: i + 1, tIn: TAPS[i] });
  });
  KIT.herCounter(ctx, t, { x: 70, y: 770, w: 700, li: 9, hits: TAPS, tIn: B(40) });
}});
