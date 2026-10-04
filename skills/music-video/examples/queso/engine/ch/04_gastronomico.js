// 04_gastronomico.js: chapter 4, verse 2, the slow half. Beats 138 to 169 (84.91 to 103.89 s), shots s037 to
// s044, lines 36 to 43.
//
// A rating card certifies what follows: CLASIFICACIÓN G, GASTRONÓMICO. Then eight lines over food, each set in
// the perfume serif, letter by letter. In each shot the type does one quiet thing, the thing the picture does:
// it opens with the box, runs along the crust, sits in the centre, comes on thick, takes each push, stretches
// with the cheese, gets hauled in with the rope.
//
// Laid out like chapter 1: cameras, pictures, then one scene per lyric surface. Three things differ.
//   1. Every shot here is a Seedance clip, or will be. Nothing is pinned to plate pixels. Each surface is set
//      in frame pixels over a part of the picture that holds still, and looks right if the picture drifts.
//   2. Six of the eight lines start a frame or more before their cut. Each surface starts on its first word and
//      the line before it stays up until the cut, so for those frames two lines share the picture. The layouts
//      are placed so they never touch.
//   3. Lines 41 and 43 are over her. They are drawn through `behind`, so they tuck behind her when the clip has
//      a matte, and they sit clear of her face for the frames when it has none.

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;

// ---------------------------------------------------------------- 1. cameras

// Slow pushes only. The two punches of the chapter are on beat 140, when the card cuts to the fire, and on
// beat 165, when the pull cuts to the tug of war.
const CAM_OF = {
  // the oven: push toward the pizza
  s037: t => ({ move: { zoom: [1.0, 1.06] }, about: [0.5, 0.62], cam: CAM.punch(t, B(140), 0.04) }),
  // the box: push toward the gap under the lid
  s038: t => ({ move: { zoom: [1.0, 1.05] }, about: [0.62, 0.5] }),
  // the crust: push toward the fingertip
  s039: t => ({ move: { zoom: [1.0, 1.05] }, about: [0.6, 0.3] }),
  // the centre of the pie: the longest push of the chapter, straight in
  s040: t => ({ move: { zoom: [1.0, 1.1] }, about: [0.5, 0.5] }),
  // the pizzaiolo's hands: push toward the dough
  s041: t => ({ move: { zoom: [1.0, 1.05] }, about: [0.5, 0.7] }),
  // she kneads: push toward her face
  s042: t => ({ move: { zoom: [1.0, 1.05] }, about: [0.47, 0.3] }),
  // the pull: push about the tip of the slice, which keeps the dark side of the frame where the type is
  s043: t => ({ move: { zoom: [1.0, 1.04] }, about: [0.72, 0.25] }),
  // the rope: push toward her
  s044: t => ({ move: { zoom: [1.0, 1.04] }, about: [0.3, 0.3], cam: CAM.punch(t, B(165), 0.04) }),
};

// ---------------------------------------------------------------- the serif, set by hand

// KIT.perfume sets a line in level rows at one weight. Six of these lines need more: a row on a curve, a row
// that tilts, a word that changes weight, a word that stretches, a row that slides. row() sets words of a line
// on one baseline in the style of KIT.perfume, with its write-on, and lets a shot place each letter.

// the write-on of one word as KIT.perfume times it: every letter is in before the word's midpoint
function writeOn(wd, t) {
  const lt = t - wd.t0, d = Math.min(0.42, 0.45 * (wd.t1 - wd.t0)), fade = Math.min(0.14, d);
  return { lt, whole: lt >= d - fade / 2, alpha: (i, n) => clamp((lt - ((d - fade) * i) / Math.max(1, n - 1)) / fade) };
}

// row(ctx, t, li, o): words [o.words[0], o.words[1]) of line li on one baseline. Marks each word once it is whole.
//   x, y, align   the anchor of the row, and which part of the row sits on it ('left', 'center', 'right')
//   at            s => [x, y, rot]: the baseline as a curve, s px from the anchor. Replaces x and y.
//   size, ink     font px and fill
//   edge          width of the black edge in px, for a bright picture
//   weight        a number, or wi => number: the weight as drawn. layWeight: the weight the word's space is cut for.
//   glyph         g => {sy, ay}: stretch a letter by sy, away from the line ay px above its baseline. g = {wi, i, n, ch}
function row(ctx, t, li, o = {}) {
  const L = LYR.line(li);
  const { words = [0, L.words.length], size = 132, ink = PAL.mozz, edge = 0, align = 'center', x = W / 2, y = H / 2 } = o;
  const at = o.at || (s => [x + s, y, 0]);
  const wOf = (w, wi) => (typeof w === 'function' ? w(wi) : w ?? STY.perfume.weight);
  const st = w => ({ ...STY.perfume, size, weight: w, fill: ink });
  const gap = TXT.width(' ', st(STY.perfume.weight));
  const set = [];
  let len = 0;
  for (let wi = words[0]; wi < words[1]; wi++) {
    const text = L.words[wi].w, w = TXT.width(text, st(wOf(o.layWeight ?? o.weight, wi)));
    if (set.length) len += gap;
    set.push({ wi, text, st: st(wOf(o.weight, wi)), s0: len });
    len += w;
  }
  const off = align === 'center' ? -len / 2 : align === 'right' ? -len : 0;
  const glyphs = [];
  for (const wd of set) {
    const on = writeOn(L.words[wd.wi], t), n = wd.text.length;
    if (on.lt < 0) continue;
    for (let i = 0; i < n; i++) {
      const a = on.alpha(i, n);
      if (a <= 0) continue;
      const before = TXT.width(wd.text.slice(0, i), wd.st), adv = TXT.width(wd.text.slice(0, i + 1), wd.st) - before;
      glyphs.push({ ch: wd.text[i], a, adv, st: wd.st, p: at(off + wd.s0 + before + adv / 2), g: o.glyph ? o.glyph({ wi: wd.wi, i, n, ch: wd.text[i] }) : null });
    }
    if (on.whole) LY.mark(li, wd.wi, size * LY.scale(ctx));
  }
  const put = (k, style, dx = 0, dy = 0) => {
    ctx.save();
    ctx.translate(k.p[0] + dx, k.p[1] + dy);
    if (k.p[2]) ctx.rotate(k.p[2]);
    if (k.g) { ctx.translate(0, -k.g.ay); ctx.scale(1, k.g.sy); ctx.translate(0, k.g.ay); }
    TXT.draw(ctx, k.ch, -k.adv / 2, 0, { ...k.st, opacity: k.a, ...style });
    ctx.restore();
  };
  // every edge goes down before any ink, so no letter's edge cuts into its neighbour
  if (edge) for (const k of glyphs) {
    // a stroke would stretch with a stretched letter, so that letter's edge is the letter in black, set eight times round it
    if (k.g) for (let j = 0; j < 8; j++) put(k, { fill: PAL.patent }, (edge / 2) * Math.cos((j * TAU) / 8), (edge / 2) * Math.sin((j * TAU) / 8));
    else put(k, { fill: null, stroke: PAL.patent, strokeWidth: edge });
  }
  for (const k of glyphs) put(k, {});
}

// curve(fn): the curve u => [x, y], u from 0 to 1, measured at load. at(s) is the point s px along it and the slope there.
function curve(fn, n = 96) {
  const pts = [], acc = [0];
  for (let i = 0; i <= n; i++) pts.push(fn(i / n));
  for (let i = 1; i <= n; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const pt = s => {
    const c = clamp(s, 0, acc[n]);
    let i = 1;
    while (i < n && acc[i] < c) i++;
    const u = (c - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
    return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)];
  };
  return { len: acc[n], at(s) { const a = pt(s - 12), b = pt(s + 12), p = pt(s); return [p[0], p[1], Math.atan2(b[1] - a[1], b[0] - a[0])]; } };
}

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s037', 's038', 's039', 's040', 's041', 's043']) {
  SCENE({ id: `04.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}
// s042 and s044 draw their line between the background and her, so each has its own picture scene.
SCENE({ id: '04.s042', t0: SHOT.t0('s042'), t1: SHOT.t1('s042'), z: 0, draw(ctx, t) {
  SHOT.draw(ctx, 's042', t, { ...CAM_OF.s042(t), behind: c => trabajo(c, t) });
}});
SCENE({ id: '04.s044', t0: SHOT.t0('s044'), t1: SHOT.t1('s044'), z: 0, draw(ctx, t) {
  SHOT.draw(ctx, 's044', t, { ...CAM_OF.s044(t), behind: c => jalando(c, t) });
}});

// ---------------------------------------------------------------- 3. lyric surfaces

// The rating card holds the frame for two beats. "Me gusta bien" is sung over it, so those three words take
// the place of the card's small print. On beat 140 the card cuts to the fire.
SCENE({ id: '04.rating', t0: B(138), t1: B(140), z: Z_GFX, draw(ctx, t) {
  KIT.rating(ctx, t, { tIn: B(138), tOut: B(140), line: '' });
  KIT.perfume(ctx, t, 36, { x: 960, y: 966, w: 1400, size: 100, words: [0, 3] });
}});

// Line 36, "Me gusta bien caliente": the whole line over the flames. "caliente" writes on after the cut.
SCENE({ id: '04.caliente', t0: B(140), t1: SHOT.t1('s037'), z: Z_GFX, draw(ctx, t) {
  KIT.perfume(ctx, t, 36, { x: 960, y: 250, w: 1600, size: 150, edge: 3 });
}});

// Line 37, "Y que se abra poco a poco": two rows hinged at the right, like the box. The top row is the lid.
// It lifts a little on "abra" and a little more on each "poco". The block sits on the table, left of the box.
const LID = [word(37, 3).t0, word(37, 4).t0, word(37, 6).t0];
SCENE({ id: '04.abra', t0: word(37, 0).t0, t1: SHOT.t1('s038'), z: Z_GFX, draw(ctx, t) {
  const open = LID.reduce((a, th) => a + EASE.inOutSine(clamp((t - th) / 0.5)), 0) / LID.length;
  const hx = 800, hy = 936, size = 128;
  row(ctx, t, 37, { words: [4, 7], x: hx, y: hy + 64, align: 'right', size, edge: 3 });
  ctx.save();
  ctx.translate(hx, hy - 66); ctx.rotate(0.13 * open);
  row(ctx, t, 37, { words: [0, 4], x: 0, y: 0, align: 'right', size, edge: 3 });
  ctx.restore();
}});

// Line 38, "La prefiero con buen borde": set along the crust, on its pale side, under the fingertip. The curve
// is the crust's own in the middle of the shot. The clip drifts about 60 px under it and the line stays on the
// crust throughout.
const CRUST = curve(u => { const x = 170 + 1640 * u, d = x - 988; return [x, 775 + 0.1875 * d - 4.7e-5 * d * d]; });
SCENE({ id: '04.borde', t0: word(38, 0).t0, t1: SHOT.t1('s039'), z: Z_GFX, draw(ctx, t) {
  row(ctx, t, 38, { at: s => CRUST.at(s), align: 'left', size: 126, edge: 5, weight: 600 });
}});

// Line 39, "Y con el centro bien jugoso": dead centre, a little heavier so it holds on the gloss.
SCENE({ id: '04.centro', t0: word(39, 0).t0, t1: SHOT.t1('s040'), z: Z_GFX, draw(ctx, t) {
  row(ctx, t, 39, { words: [0, 4], x: 960, y: 500, size: 164, edge: 4, weight: 600 });
  row(ctx, t, 39, { words: [4, 6], x: 960, y: 690, size: 164, edge: 4, weight: 600 });
}});

// Line 40, "Si la masa viene gruesa": "gruesa" writes on at the weight of the rest and then thickens to black.
// Its space is cut for the black weight from the start, so nothing beside it moves.
SCENE({ id: '04.gruesa', t0: word(40, 0).t0, t1: SHOT.t1('s041'), z: Z_GFX, draw(ctx, t) {
  const fat = 500 + 20 * Math.round(20 * EASE.inOutSine(clamp((t - word(40, 4).t0 - 0.08) / 0.4)));
  row(ctx, t, 40, { x: 960, y: 176, size: 132, edge: 3, weight: wi => (wi === 4 ? fat : 500), layWeight: wi => (wi === 4 ? 900 : 500) });
}});

// Line 41, "La trabajo sin parar": beside her, at eye level. The block takes every push: it drops and swells on
// each kick, the first on the cut, and settles before the next.
const PUSH = [158, 159, 160, 161].map(B);
function trabajo(ctx, t) {
  const k = KIT.hit(t, PUSH, 0.24);
  ctx.save();
  ctx.translate(1440, 380 + 18 * k); ctx.scale(1 + 0.025 * k, 1 + 0.025 * k); ctx.translate(-1440, -380);
  row(ctx, t, 41, { words: [0, 2], x: 1130, y: 300, align: 'left', size: 140, edge: 3 });
  row(ctx, t, 41, { words: [2, 4], x: 1130, y: 462, align: 'left', size: 140, edge: 3 });
  ctx.restore();
}
// "La" is sung two frames before the cut, over the pizzaiolo's hands.
SCENE({ id: '04.la', t0: word(41, 0).t0, t1: SHOT.t0('s042'), z: Z_GFX, draw(ctx, t) { trabajo(ctx, t); } });

// Line 42, "Cuando estira mozzarella": a column down the dark side of the frame. Through the whole of beat 164
// the last word stretches down over the pie, as the cheese does. Each letter keeps its top where it is and its
// foot goes down: the x-height letters by `pull`, the two l by less, so every foot stays on one line.
SCENE({ id: '04.estira', t0: word(42, 0).t0, t1: SHOT.t1('s043'), z: Z_GFX, draw(ctx, t) {
  const size = 102, x = 1894, pull = 1 + 5.5 * EASE.inQuad(clamp((t - B(164)) / (B(165) - B(164))));
  row(ctx, t, 42, { words: [0, 1], x, y: 132, align: 'right', size, edge: 3 });
  row(ctx, t, 42, { words: [1, 2], x, y: 256, align: 'right', size, edge: 3 });
  row(ctx, t, 42, { words: [2, 3], x, y: 380, align: 'right', size, edge: 3, glyph: g => (g.ch === 'l'
    ? { ay: 0.81 * size, sy: (0.27 + 0.54 * pull) / 0.81 }
    : { ay: 0.54 * size, sy: pull }) });
}});

// Line 43, "La voy jalando sin soltar": the line lies along the rope, just above her fists, and she hauls it
// in: one length to the left on each kick, with a tug past the mark. Words write on at the far end as she sings them.
const HAUL = [166, 167, 168].map(B);
function jalando(ctx, t) {
  const hauled = HAUL.reduce((a, th) => a + EASE.outBack(clamp((t - th) / 0.3)), 0);
  row(ctx, t, 43, { x: 836 + 100 * (HAUL.length - hauled), y: 420, align: 'left', size: 96, edge: 3 });
}
