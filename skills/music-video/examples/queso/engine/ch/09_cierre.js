// 09_cierre.js: chapter 9, the outro. Beat 333 to the end (204.30 to 229.12 s), shots s089 to s093, lines 88 to 92.
//
// The restaurant is closing. Three of the commandments come back, whispered: two small tomato cards in the
// middle of the frame, then a line that falls with the parmesan. The label assembles one last time, small.
// The last line is a film subtitle, the burp gets a subtitle of its own, and the end card lands beside her.
//
// Every shot here is a Seedance clip or will be one, so nothing is pinned to plate pixels. Each surface sits
// where the picture leaves room in its first frame and carries its shot whatever moves underneath.
//   1. CAM_OF: SHOT.draw options per shot. No scripted moves: a plate gets the kit's default push and a clip
//      plays as shot. `about` is where that push aims.
//   2. Picture scenes at z 0.
//   3. Graphics scenes at z 10, one per lyric surface.

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;
const CREDIT = { font: FACE.sans, weight: 700, upper: true, tracking: 0.16, fill: PAL.mozz, align: 'center' };

// ---------------------------------------------------------------- 1. cameras

const CAM_OF = {
  // after hours: she reaches for the lens
  s089: t => ({ about: [0.42, 0.6] }),
  // the scale in the bin
  s090: t => ({ about: [0.56, 0.62] }),
  // parmesan like snow
  s091: t => ({ about: [0.58, 0.42] }),
  // the last pull: the frame takes a small knock when QUESO lands, half of what the choruses got
  s092: t => ({ about: [0.44, 0.5], cam: CAM.punch(t, word(91, 4).t0, 0.03) }),
  // the whisper. The shot has a second plate, the empty dish, which the W93 clip replaces along with the first;
  // the still stays on her so the plate and the clip are laid out alike.
  s093: t => ({ plate: 'whisper', about: [0.47, 0.45] }),
};

// ---------------------------------------------------------------- private helpers

// when(sid, k): the song time at which second k of the shot's clip is on screen. Without a clip in the edit
// list it assumes the usual one beat of pre-roll.
function when(sid, k) {
  const e = SHOT.edit(sid), t0 = SHOT.t0(sid);
  if (!e) return t0 - BEAT.period + k;
  let a = 0, b = SHOT.t1(sid) - t0;
  for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (SHOT.clipTime(m, e) < k) a = m; else b = m; }
  return t0 + b;
}

// sift(ctx, t, li, {x, y, size, rows, speed, drop, knocks, knock}): a line that falls with the cheese. White
// caps in rows centred on x, with y the cap top of the first row. A word is sprinkled on from its t0, one
// letter after another, each dropping `drop` px into its place and turning as it lands; every letter is on
// before the word's midpoint. From the line's first word the whole block sinks at `speed` px a second and
// drops another `knock` px on each time in `knocks`. Each letter sits a little crooked and sways on its own,
// the way a flake does.
function sift(ctx, t, li, o = {}) {
  const L = LYR.line(li);
  const { x = 240, y = 120, size = 96, rows = [L.words.map((w, i) => i)], speed = 40, drop = 36, lead = 1.12, knocks = [], knock = 26, ink = PAL.mozz } = o;
  const st = { font: FACE.caps, size, fill: ink }, gap = 0.02 * size, space = TXT.width(' ', st);
  const cap = TXT.capH(st), up = s => s.toLocaleUpperCase('es');
  let sink = speed * Math.max(0, t - L.t0);
  for (const tk of knocks) sink += knock * EASE.outCubic(clamp((t - tk) / 0.2));
  rows.forEach((row, ri) => {
    const base = y + cap + ri * size * lead + sink;
    const wide = row.reduce((sum, wi) => sum + [...up(L.words[wi].w)].reduce((a, c) => a + TXT.width(c, st) + gap, -gap), (row.length - 1) * space);
    let cx = x - wide / 2;
    for (const wi of row) {
      const w = L.words[wi], text = up(w.w), n = text.length;
      const span = Math.min(0.5, 0.3 * (w.t1 - w.t0)), step = span / Math.max(1, n - 1);
      for (let i = 0; i < n; i++) {
        const cw = TXT.width(text[i], st), lt = t - (w.t0 + i * step);
        if (lt >= 0) {
          const u = EASE.outCubic(clamp(lt / 0.24)), seed = li * 1000 + wi * 40 + i;
          const rest = (hash(seed, 3) - 0.5) * 0.07, lift = (hash(seed, 5) - 0.5) * 7;
          ctx.save();
          ctx.translate(cx + cw / 2 + 2.5 * noise(t * 0.7, seed), base - cap / 2 + lift - (1 - u) * drop + 3 * noise(t * 0.6, seed + 400));
          ctx.rotate(rest + (1 - u) * (hash(seed, 7) - 0.5) * 0.7 + 0.03 * noise(t * 0.5, seed + 800));
          TXT.draw(ctx, text[i], 0, 0, { ...st, align: 'center', baseline: 'center' });
          ctx.restore();
        }
        cx += cw + gap;
      }
      if (t >= w.t0 + span) LY.mark(li, wi, size * LY.scale(ctx));
      cx += space - gap;
    }
  });
}

// ---------------------------------------------------------------- 2. pictures

for (const sid of ['s089', 's090', 's091', 's092', 's093']) {
  SCENE({ id: `09.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}

// ---------------------------------------------------------------- 3. lyric surfaces and graphics

// Lines 88 and 89, "No me mires" and "No me peses": the commandments of the breakdown, now the size of a
// place card. Same card, same place, on both sides of the cut. Each arrives with its first word.
const CARD = { x: 716, y: 508, w: 488, h: 124 };
SCENE({ id: '09.mires', t0: word(88, 0).t0, t1: SHOT.t1('s089'), z: Z_GFX, draw(ctx, t) {
  KIT.commandment(ctx, t, 88, { box: CARD, pad: 26, tIn: word(88, 0).t0 });
}});
SCENE({ id: '09.peses', t0: word(89, 0).t0, t1: SHOT.t1('s090'), z: Z_GFX, draw(ctx, t) {
  KIT.commandment(ctx, t, 89, { box: CARD, pad: 26, tIn: word(89, 0).t0 });
}});

// Line 90, "No me escondas los aderezos": the third commandment comes loose from its card and falls with the
// parmesan, down the left edge of the frame, where her raised arm never reaches in take 1 of M91. The drums
// come back on beat 346, right after the line, and each of the three kicks left in the shot knocks it down
// a notch.
SCENE({ id: '09.aderezos', t0: word(90, 0).t0, t1: SHOT.t1('s091'), z: Z_GFX, draw(ctx, t) {
  sift(ctx, t, 90, { x: 186, y: 104, size: 82, rows: [[0, 1], [2], [3], [4]], knocks: [B(346), B(347), B(348)] });
}});

// Line 91, "No es grasa, es queso": the label one last time, small and plain. Three closing rows, one a beat.
SCENE({ id: '09.label', t0: SHOT.t0('s092'), t1: SHOT.t1('s092'), z: Z_GFX, draw(ctx, t) {
  KIT.label(ctx, t, { x: 1424, y: 28, w: 450, grasa: 91, portion: 'la última', extra: [
    { name: 'Grasa', value: '0 g', t: B(355) },
    { name: 'Culpa', value: '0%', t: B(356) },
    { name: 'Queso', value: '100%', t: B(357) },
  ] });
}});

// Line 92, the whisper: a film subtitle, as in the first minute. It clears half a second before the burp at
// the latest, so the frame is left alone when she burps. The burp gets a subtitle of its own and nothing
// else; that subtitle clears a beat before the end card, which leaves her hand flying to her mouth a clean
// beat. The end card lands on the downbeat of the last bar, beat 370, beside her and clear of her face:
// QUESO, then the name on the next kick. Both hold to the last frame. Should a take burp late, the card
// waits for the first kick that leaves the burp 0.6 s to itself.
const BURP_K = 5.25;                                  // the burp, in seconds of the W93 clip: take 1's eyes pop here
const T_BURP = when('s093', BURP_K);
const T_CARD = B(Math.max(370, Math.ceil(BEAT.pos(T_BURP + 0.6)))), T_NAME = T_CARD + BEAT.period;
const T_HUSH = T_CARD - BEAT.period - T_BURP >= 0.9 ? T_CARD - BEAT.period : T_CARD;
SCENE({ id: '09.fin', t0: SHOT.t0('s093'), t1: BEAT.duration, z: Z_GFX, draw(ctx, t) {
  KIT.subtitle(ctx, t, 92, { tOut: Math.min(B(366), T_BURP - 0.5) });
  KIT.caption(ctx, t, '(eructo)', { t0: T_BURP, t1: T_HUSH });
  KIT.title(ctx, t, { tQueso: T_CARD, tName: T_NAME, x: 1590, y: 420, size: 196, ink: PAL.mozz });
  if (t >= T_NAME) {                                  // his credit, in English, in the type of the opening's "presenta"
    TXT.draw(ctx, 'Original lyrics', 1590, 650, { ...CREDIT, size: 28 });
    TXT.draw(ctx, 'and produced by', 1590, 686, { ...CREDIT, size: 28 });
    TXT.draw(ctx, 'Obie Fernandez', 1590, 734, { ...CREDIT, size: 36 });
  }
}});
