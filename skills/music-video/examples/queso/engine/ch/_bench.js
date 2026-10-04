// _bench.js: the kit on one sheet. A proof chapter: its scenes register only with `--ch _bench`, so it never
// ships. Every device gets a card of CARD seconds from t = 0. Each card plays the device over the part of the
// song it was built for, squeezed into the card, so the last third of a card shows the device at rest.
//
//   cd engine && VIDEO_PROJECT=queso ../.venv/bin/python render.py sheet 2.7:77.7:25 --cols 5 --w 760 \
//       --ch _bench --out ../queso/media/scratch/kit/bench.jpg
//
// Card k is on screen for k * CARD <= t < (k + 1) * CARD. The name of the device is in the bottom left corner.
// A device takes any time you hand it, so a card passes it song time while the scene itself runs from 0.

const CARD = 3;
const cards = [];
// card(name, [a, b], draw): draw(ctx, tt) is called with tt running from a to b (song seconds) across the card
const card = (name, span, draw) => cards.push({ name, span, draw });
const line = li => LYR.line(li);
const shot = sid => [SHOT.t0(sid), SHOT.t1(sid)];

card('KIT.label plain', [SHOT.t0('s003'), SHOT.t1('s004')], (ctx, tt) => {
  SHOT.draw(ctx, tt < SHOT.t0('s004') ? 's003' : 's004', tt);
  KIT.label(ctx, tt, { x: 1300, y: 60, w: 540, grasa: 2, culpa: 3, bar: [18.5, 20.5] });
});
card('KIT.label wide', shot('s081'), (ctx, tt) => {
  SHOT.draw(ctx, 's081', tt, { behind: c => KIT.label(c, tt, { layout: 'wide', grasa: 80, tIn: SHOT.t0('s081'), gap: [620, 1300] }) });
});
card('KIT.label gold', [SHOT.t0('s067'), SHOT.t1('s068')], (ctx, tt) => {
  SHOT.draw(ctx, tt < SHOT.t0('s068') ? 's067' : 's068', tt);
  KIT.label(ctx, tt, { x: 110, y: 60, w: 540, variant: 'gold', grasa: 66, culpa: 67, bar: [253.5, 255.5] });
});
card('KIT.label altar', [SHOT.t0('s081'), SHOT.t1('s082')], (ctx, tt) => {
  SHOT.draw(ctx, 's081', tt);
  KIT.label(ctx, tt, { x: 1330, y: 40, w: 500, variant: 'altar', grasa: 80, extra: [{ name: 'Culpa', value: '0%', t: BEAT.t(304) }, { name: 'Queso', value: '100%', t: BEAT.t(305) }] });
});
card('KIT.hisTag  KIT.hisCounter', shot('s009'), (ctx, tt) => {
  const pic = SHOT.draw(ctx, 's009', tt), b = n => BEAT.t(36 + n);
  KIT.hisTag(ctx, tt, { ...SHOT.box(pic.place, 640, 995, 935, 1575), label: 'AGUA', kcal: 0, tIn: b(0.5), chip: 'tl', lead: 0 });
  KIT.hisTag(ctx, tt, { ...SHOT.box(pic.place, 1100, 1345, 1690, 1570), label: 'CALCULADORA', kcal: 0, tIn: b(1), chip: 'tr' });
  KIT.hisTag(ctx, tt, { ...SHOT.box(pic.place, 120, 875, 465, 1640), label: 'VELA', kcal: 0, tIn: b(1.5), chip: 'tl', lead: 0 });
  KIT.hisCounter(ctx, tt, { x: 1240, y: 60, w: 620, li: 8, total: KIT.race(tt, b(0), b(4), 0, 2310) });
});
card('KIT.herBox  KIT.herCounter', shot('s010'), (ctx, tt) => {
  const pic = SHOT.draw(ctx, 's010', tt), hits = [];
  [[1830, 724], [1444, 730], [1500, 486], [1756, 360], [1150, 460], [764, 516], [756, 816], [1020, 820]].forEach(([px, py], i) => {
    const [x, y] = SHOT.pt(pic.place, px, py), tIn = BEAT.t(40 + i * 0.5);
    hits.push(tIn);
    KIT.herBox(ctx, tt, { x, y, r: 106 * SHOT.scale(pic.place), n: i + 1, tIn });
  });
  KIT.herCounter(ctx, tt, { x: 70, y: 770, w: 700, li: 9, hits });
});
card('KIT.subtitle  KIT.bars', [0, SHOT.t1('s001')], (ctx, tt) => {
  SHOT.draw(ctx, 's001', tt);
  KIT.bars(ctx, tt, { curtain: [0, BEAT.t(1.5)] });
  KIT.subtitle(ctx, tt, 0, { tag: '[en italiano]', y: 900, tOut: 99 });
});
card('KIT.quote his', [SHOT.t0('s017'), line(16).t1 + 0.4], (ctx, tt) => {
  SHOT.draw(ctx, 's017', tt);
  KIT.quote(ctx, tt, 16, { who: 'his', x: 110, y: 170, w: 760, tail: 'right' });
});
card('KIT.quote hers', [SHOT.t0('s018'), line(17).t1 + 0.4], (ctx, tt) => {
  SHOT.draw(ctx, 's018', tt);
  KIT.quote(ctx, tt, 17, { who: 'hers', x: 1060, y: 170, w: 780, tail: 'left' });
});
card('KIT.receipt', shot('s016'), (ctx, tt) => {
  SHOT.draw(ctx, 's016', tt);
  KIT.receipt(ctx, tt, { x: 1280, y: -10, w: 540, head: ['CUENTA', 'MESA 7'], rows: [['PIZZA PEPPERONI', '2310'], ['SEGUNDA PIZZA', '2310'], ['AGUA CON GAS', '0'], ['ENSALADA', '45']], total: ['TOTAL KCAL', '4665'], li: 15, b0: 68, step: 0.25 });
});
card('KIT.menuRow', shot('s022'), (ctx, tt) => {
  const pic = SHOT.draw(ctx, 's022', tt, { move: { zoom: [1.3, 1.36] }, about: [0.5, 0.46] });
  KIT.menuRow(ctx, tt, 21, { place: pic.place, price: '16', desc: 'pomodoro, mozzarella, sin consejos' });
});
card('KIT.notice  KIT.stamp', [line(7).t0 - 0.1, SHOT.t1('s008')], (ctx, tt) => {
  SHOT.draw(ctx, 's008', tt);
  KIT.notice(ctx, tt, { x: 1200, y: 60, w: 660, body: ['Meta diaria superada.', 'Sugerencia: ensalada.'], tIn: BEAT.t(31.75) });
  KIT.quote(ctx, tt, 7, { who: 'hers', x: 1200, y: 262, w: 660, size: 100, tail: null });
  KIT.stamp(ctx, tt, { x: 1560, y: 168, size: 116, rot: -0.1, tHit: BEAT.t(35) });
});
card('KIT.versus', [SHOT.t0('s025'), SHOT.t1('s026')], (ctx, tt) => {
  SHOT.draw(ctx, tt < SHOT.t0('s026') ? 's025' : 's026', tt);
  KIT.versus(ctx, tt, { x: 260, y: 150, w: 1400, tu: 24, yo: 25, rows: [{ tu: '0 kcal', yo: '1200 kcal', t: BEAT.t(95) }, { tu: '0 alegría', yo: 'toda', t: BEAT.t(96) }] });
});
card('KIT.rating', [0, 1], (ctx, tt) => KIT.rating(ctx, tt, {}));
card('KIT.perfume', shot('s037'), (ctx, tt) => {
  SHOT.draw(ctx, 's037', tt);
  KIT.perfume(ctx, tt, 36, { x: 960, y: 250, w: 1600, size: 150 });
});
card('KIT.commandment', shot('s075'), (ctx, tt) => KIT.commandment(ctx, tt, 74, {}));
card('KIT.script  CAM.crash', shot('s055'), (ctx, tt) => {
  const L = line(54), cam = L.words.map((w, i) => CAM.crash(tt, w.t0, 1.14, 0.14));
  SHOT.draw(ctx, 's055', tt, { cam, about: [0.46, 0.4] });
  KIT.script(ctx, tt, 54, { at: [[430, 250, 250, -0.12], [1500, 330, 280, 0.08], [1320, 820, 330, -0.06]] });
});
card('KIT.news', shot('s056'), (ctx, tt) => {
  SHOT.draw(ctx, 's056', tt);
  KIT.news(ctx, tt, { li: 55, ticker: 'NOVIO EXIGE ENSALADA   ·   LA PIZZA SIGUE EN LA MESA   ·   TESTIGOS: «NO PARPADEÓ»' });
});
card('KIT.episode', shot('s060'), (ctx, tt) => {
  SHOT.draw(ctx, 's060', tt);
  KIT.episode(ctx, tt, { li: 59, y: 860 });
});
card('KIT.status', [0, 3], (ctx, tt) => {
  SHOT.draw(ctx, 's066', SHOT.t0('s066') + tt, { plate: 'he-leaves' });
  KIT.status(ctx, tt, { x: 520, y: 700, w: 880, tIn: 0.2, tFlip: 1.6 });
});
card('KIT.napkin  KIT.kiss', [SHOT.t0('s006'), SHOT.t1('s006')], (ctx, tt) => {
  SHOT.draw(ctx, 's006', tt);
  KIT.napkin(ctx, tt, 5, { x: 1230, y: 90, w: 620 });
  KIT.kisses(ctx, tt, { b0: 27, n: 5, step: 0.25, box: { x: 60, y: 620, w: 520, h: 360 }, size: 200, seed: 3 });
});
card('KIT.title', [0, 3], (ctx, tt) => {
  SHOT.draw(ctx, 's093', SHOT.t0('s093') + tt, { plate: 'end-plate' });
  KIT.title(ctx, tt, { tQueso: 0.3, tName: 1.4, x: 1400, y: 300, size: 250 });
});
card('KIT.slab  KIT.bitten', shot('s005'), (ctx, tt) => {
  SHOT.draw(ctx, 's005', tt);
  KIT.bitten(ctx, tt, g => {
    KIT.slab(g, tt, 'MIRA', { x: 300, y: 190, size: 210, rot: -0.05, bg: PAL.mozz, li: 4, wi: 0 });
    KIT.slab(g, tt, 'COMO', { x: 1580, y: 860, size: 250, rot: 0.04, bg: PAL.cheese, li: 4, wi: 4 });
  }, [{ x: 480, y: 120, r: 80, rot: 2.6, t: BEAT.t(22) }, { x: 1820, y: 800, r: 100, rot: 3.4, t: BEAT.t(23.5) }]);
});
// the first take of the s003 clip on disk, if there is one; without it the card shows the plate
const TAKE = Object.keys(ASSETS.clips).filter(c => c.startsWith('W03')).sort()[0] || null;
card(`SHOT.draw ${TAKE ? 'clip ' + TAKE : 'plate (no clip)'}  CAM.punch  CAM.shake`, [SHOT.t0('s003'), SHOT.t1('s003')], (ctx, tt) => {
  const hitT = line(2).words[4].t0;
  SHOT.draw(ctx, 's003', tt, { clip: TAKE, in: 0.61, cam: [CAM.punch(tt, hitT, 0.08), CAM.shake(tt, hitT, 18)] });
});
card('SHOT.draw plate  CAM.beat  CAM.drift', shot('s004'), (ctx, tt) => {
  SHOT.draw(ctx, 's004', tt, { move: { zoom: [1.05, 1.16], x: [30, -30] }, cam: CAM.beat(tt, 0.03), about: [0.42, 0.3] });
});

cards.forEach((c, i) => SCENE({
  id: `bench.${String(i).padStart(2, '0')}`,
  proof: true,
  t0: i * CARD,
  t1: (i + 1) * CARD,
  draw(ctx, t, lt) {
    c.draw(ctx, lerp(c.span[0], c.span[1], lt / CARD));
    const st = { font: FACE.mono, weight: 700, size: 30, fill: PAL.patent };
    const w = TXT.width(c.name, st) + 28;
    ctx.fillStyle = PAL.cheese; ctx.fillRect(0, H - 50, w, 50);
    TXT.draw(ctx, c.name, 14, H - 25, { ...st, baseline: 'center' });
  },
}));
