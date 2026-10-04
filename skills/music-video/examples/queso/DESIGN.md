# Queso: design spec

Binding for every chapter author. Read `PRODUCTION.md` and `engine/ANIMATION_GUIDE.md` first. Then read this, then `engine/ch/01_aperitivo.js`, the chapter every other chapter copies.

The lyric lives on things that belong to the trattoria and to his head: a nutrition label, his calorie counter, her pepperoni counter, film subtitles, a receipt, a menu. Each surface is drawn flat and square, the way that object is printed or displayed, on top of a picture that is too close and mid-bite. The graphics explain the joke with a straight face.

Everything below is in `engine/common.js` (palette, faces, sizes) and `engine/ch/_kit.js` (devices). Both load before every chapter, whatever `--ch` you pass. One sheet shows the whole kit: `media/scratch/kit/bench.jpg`, rendered from `engine/ch/_bench.js` with the command at the top of that file. Example paths below are under `media/scratch/kit/`.

## Palette

| Colour | `PAL.` | Hex | Where it goes |
|---|---|---|---|
| Tomato red | `tomato` | `#E2321E` | Commandments, her blocks, the strike through Grasa, stamps, kiss prints |
| Mozzarella white | `mozz` | `#FBF6EA` | Every paper surface, and type that sits on a colour |
| Cheese yellow | `cheese` | `#FFD23F` | The accent: the QUESO slab, film subtitles |
| Basil green | `basil` | `#2F8F4E` | The rating card. Nowhere else without a reason |
| Patent black | `patent` | `#0C0B0E` | Ink on paper, his panel, edges |
| His cold blue | `ice` | `#BFE6FF` | Everything he measures |
| Gold | `gold` | `#E3B23C` | The label from chorus 3 on. Flat, one value |

| Who is speaking | Ground | Type |
|---|---|---|
| A printed thing (label, receipt, napkin, card) | `mozz` | `patent` |
| Her | `tomato` | `mozz` |
| Him | `ice`, or his `patent` panel | `patent` on ice, `ice` on the panel |

Keep one yellow thing in a frame. Colours come from `PAL` only.

## Type

| Job | `FACE.` | Face | Why |
|---|---|---|---|
| Hook, slabs, commandments, stamps, her counter | `caps` | Anton | Tall and loud. It holds a frame alone and it has every Spanish capital with its accent |
| The label, charts, the news banner, cards | `sans` | Inter 800 and 900 | The black weights read as the heavy grotesque of a real nutrition panel |
| His tags and his panel, the receipt | `mono` | JetBrains Mono | Fixed width keeps a racing number still while its digits change |
| His total | `seg` | DSEG7 Classic Bold | A pocket calculator's display. Digits, minus, colon and point only: his words stay in mono so the accents survive |
| Film subtitles, the menu row, the end-card name | `book` | Libre Baskerville | A sturdy book italic for subtitles that keeps its hairlines under a black edge. Its semibold caps match the menu plate's printed dish names |
| Verse 2 | `perfume` | Playfair Display Italic | The high-contrast italic of a perfume advert |
| Telenovela titles | `script` | Yesteryear | A heavy brush script with a readable capital Q for "Qué", which the lighter scripts turn into a 2 |
| The napkin | `hand` | Caveat 700 | Quick pen handwriting with a full Spanish set |

The project fonts are in `engine/fonts/` with their licences in `LICENSES.md` there. All are SIL OFL 1.1.

Sizes are font px on the 1080p frame, from `SIZE`:

| `SIZE.` | px | Use |
|---|---|---|
| `fine` | 20 | Small print that is not lyric |
| `note` | 28 | Tags and units that are not lyric |
| `floor` | 44 | The smallest a sung word is ever set |
| `row` | 64 | A sung word inside a panel |
| `sub` | 68 | Film subtitles |
| `line` | 96 | A sung line set alone |
| `display` | 150 | A slab, a stamp, a script title |
| `slam` | 240 | QUESO |

## Lyric rules

1. A sung word is on screen from its own `t0`. Every device with an `li` does this for you. When a word is sung a frame or two before a cut, start its surface at that `t0` and let it ride over the cut (line 7 in chapter 1).
2. The floor is 40 px. The gate checks the font size as drawn, after every scale, and fails under 36. `render.py lyrics A:B --ch NN` must print N/N.
3. Her face stays clear. Put a surface where she is absent, or hand it to `SHOT.draw` as `behind` and it sits between the background and her. A device has no way to know what she covers, so look at the render and check each word still reads.
4. Spanish punctuation is set as written: accents and ñ in capitals too, ¿ and ¡ where the line has them, “ ” for quoted speech. `KIT.quote` draws the marks. Text set with `upper: true` uses Spanish casing.
5. One line, one surface. A line stays up until its shot cuts or the next line's surface replaces it.
6. Words cut on or slam on. Two devices write a word on over a fraction of its length, the napkin and the perfume serif, and both finish before the word's midpoint.
7. Non-lyric copy on a surface is a short deadpan fact in Spanish, such as "Porción: toda" or "Meta diaria superada."

## The kit

Every device is a pure function of the time you pass it. Positions are frame px. `li` is a line index from `LYR`. A time option (`tIn`, `tHit`, `tOut`) is song seconds: give it `BEAT.t(n)` or a word's `t0`. Unless a recipe says otherwise, a device with a line appears on the last whole beat before that line's first word.

The names, all global:

| Group | Calls |
|---|---|
| Lyric surfaces | `KIT.label`, `KIT.hisCounter`, `KIT.herCounter`, `KIT.subtitle`, `KIT.quote`, `KIT.receipt`, `KIT.menuRow`, `KIT.versus`, `KIT.perfume`, `KIT.commandment`, `KIT.script`, `KIT.news`, `KIT.episode`, `KIT.napkin`, `KIT.slab` |
| Graphics without lyric | `KIT.hisTag`, `KIT.herBox`, `KIT.bars`, `KIT.caption`, `KIT.notice`, `KIT.stamp`, `KIT.rating`, `KIT.status`, `KIT.kiss`, `KIT.kisses`, `KIT.title`, `KIT.bitten`, `KIT.bitePath` |
| Timing helpers | `KIT.hit(t, at, decay)`, `KIT.slam(lt, from, d)`, `KIT.beatBefore(t)`, `KIT.race(t, t0, t1, a, b)`, `KIT.num(n)` |
| Pictures | `SHOT.draw`, `SHOT.at`, `SHOT.t0`, `SHOT.t1`, `SHOT.pt`, `SHOT.box`, `SHOT.scale`, `SHOT.enter`, `SHOT.clipTime`, `SHOT.plateAt`, `SHOT.edit` |
| Camera | `CAM.punch`, `CAM.beat`, `CAM.crash`, `CAM.shake`, `CAM.drift`, `CAM.mix`, `CAM.apply` |

A lyric surface marks its own words for the gate. When you set sung words by hand, call `LY.mark(li, wi, size * LY.scale(ctx))` for each word that is readable in the frame.

### 1. Nutrition label: every chorus

```js
KIT.label(ctx, t, { x: 1340, y: 60, w: 520, grasa: 2, culpa: 3, bar: [18.5, 20.5] });
```

The panel unrolls at `tIn`. "No es" and "Grasa," arrive on their words, a tomato bar strikes Grasa on the second "es", and the QUESO slab slams over the struck row on "queso". With `culpa` the panel grows a second group on the beat before that line: "Culpa, 0%" and "Progreso" with a loading bar.

| Option | Default | Meaning |
|---|---|---|
| `x, y, w` | 1300, 70, 540 | Top left and width. Height follows. Keep `w` at 440 or more so "No es" stays at 40 px |
| `grasa`, `culpa` | none | Line indexes of "No es grasa, es queso" and "No es culpa, es progreso". Either may be left out |
| `bar` | from the word | `[b0, b1, step]` in beats: one chunk at `b0`, `b0 + step`, up to `b1`. Step defaults to 0.5 |
| `variant` | `'plain'` | `'plain'`, `'gold'` (chorus 3), `'altar'` (final chorus: arched, with rays that jump on every kick) |
| `extra` | `[]` | Closing rows `{name, value, t}`, such as `{name: 'Queso', value: '100%', t: BEAT.t(352)}` |
| `layout` | `'tall'` | `'wide'` fills the frame for chorus 2. Pass it as `behind`. It takes `gap: [x0, x1]`, the columns she stands in |
| `tIn`, `tCulpa`, `portion`, `rot` | | When the panel and its second group arrive, the portion text, a tilt |

Examples: `media/scratch/kit/ex/label-plain.jpg`, `label-wide.jpg`, `label-gold.jpg`, `label-altar.jpg`.

### 2. His counter and her counter

```js
KIT.hisTag(ctx, t, { ...SHOT.box(pic.place, 640, 995, 935, 1575), label: 'AGUA', kcal: 0, tIn: BEAT.t(36.5), chip: 'tl', lead: 0 });
KIT.hisCounter(ctx, t, { x: 1240, y: 60, w: 620, li: 8, total: KIT.race(t, BEAT.t(36), BEAT.t(40), 0, 2310) });
KIT.herBox(ctx, t, { x, y, r: 106 * SHOT.scale(pic.place), n: 1, tIn: BEAT.t(40) });
KIT.herCounter(ctx, t, { x: 70, y: 770, w: 700, li: 9, hits: TAPS, tIn: BEAT.t(40) });
```

His: a thin cold box around a thing and a chip that reads "AGUA 0 kcal", the number racing up as it lands. `chip` is the corner (`'tr'`, `'tl'`, `'br'`, `'bl'`); `lead` is the leader length and `lead: 0` makes a flush tab; `chipAt: [x, y]` pins the chip over a flaw in a plate. His panel sets the line in cold mono caps with a seven-segment total; you compute `total` for the frame, and `KIT.race(t, t0, t1, a, b)` gives a run that speeds up.

Hers: thick white corner brackets that snap onto one pepperoni, with its number on a tomato chip. Her panel sets the line in white caps on tomato beside a count; `hits` lists the times of each count and the number pops on each.

Examples: `ex/his.jpg`, `ex/hers.jpg`.

### 3. Film subtitle: the Italian asides

```js
KIT.bars(ctx, t, { curtain: [0, BEAT.t(1.5)] });
KIT.subtitle(ctx, t, 0, { y: 900, tag: '[en italiano]', tOut: SHOT.t1('s001') });
KIT.caption(ctx, t, '(eructo)', { t0: 224.6, t1: 226 });
```

Yellow book italic with a thin black edge, bottom centre. Options: `y` baseline (968; use 900 under bars), `size` (68), `tag`, `tOut` (half a second after the line), `w`, `x`. `KIT.caption` is the same type for a sound that is not a sung line. `KIT.bars` draws 2.39:1 letterbox bars; `curtain: [t0, t1]` parts two black halves sideways, and `tOut` cuts the bars off.

Example: `ex/subtitle.jpg`.

### 4. Speech quotes: two colours

```js
KIT.quote(ctx, t, 16, { who: 'his', x: 110, y: 170, w: 760, tail: 'right' });
KIT.quote(ctx, t, 7, { who: 'hers', x: 1200, y: 262, w: 660, size: 100, tail: null, hug: false });
```

A line of speech on a block: `who: 'his'` is cold blue with black type, `'hers'` is tomato with white type. In `Me dijiste: “ya fue mucho”` the words before the “ become a small caption above the block and the quoted words sit inside it between big marks. A line without quotes goes on the block whole, which is how she answers back. Options: `x, y` top left, `w` the widest it may be, `size` (104), `tail` (`'left'`, `'right'`, `null`), `align: 'right'`, `hug: false` to keep the full width, `rot`. The block grows a row when that row's first word is sung.

Examples: `ex/quote-his.jpg`, `ex/quote-hers.jpg`.

### 5. Receipt

```js
KIT.receipt(ctx, t, { x: 1280, y: -10, w: 540, head: ['CUENTA', 'MESA 7'], rows: [['PIZZA PEPPERONI', '2310'], ['ENSALADA', '45']], total: ['TOTAL KCAL', '2355'], li: 15, b0: 68, step: 0.25 });
```

Thermal paper that hangs from `y` and feeds out one printed line per `step` beats from beat `b0`: the head lines, a rule, the rows, a rule, the total. The sung line is the last thing printed, set large. Without `b0` the last row lands on the beat before the line. Example: `ex/receipt.jpg`.

### 6. Menu row

```js
const pic = SHOT.draw(ctx, 's022', t, { move: { zoom: [1.3, 1.36] }, about: [0.5, 0.46] });
KIT.menuRow(ctx, t, 21, { place: pic.place, price: '16', desc: 'pomodoro, mozzarella, sin consejos' });
```

Sets the line as a dish in the empty row of the `menu` plate, between PEPPERONI and QUATTRO FORMAGGI, matched to the plate's printing: tracked semibold caps, dotted leaders, a price, an italic description. The row rides the plate through any camera move. Its position in plate pixels is `KIT.MENU`: caps baseline at x 542, y 761, leaders to x 2222, price flush right at x 2408, description at x 598, y 819, tilt 0.0052 rad. Frame the plate at zoom 1.1 or more. Example: `ex/menu.jpg`.

### 7. Stamp, and the notification it lands on

```js
KIT.notice(ctx, t, { x: 1200, y: 56, w: 660, body: ['Meta diaria superada.', 'Sugerencia: ensalada.'], tIn: BEAT.t(32) });
KIT.stamp(ctx, t, { x: 1540, y: 158, size: 112, rot: -0.1, tHit: BEAT.t(35), from: 1.8 });
```

The stamp lands on `tHit` from `from` times its size (3), solid on the hit frame, and stays as an imprint with dropouts in the ink. `text` defaults to RECHAZADO. Near her face lower `from` so the hit frame clears it. `KIT.notice` is a phone notification from his diet app (`app`, `when`, `body`, `from: 'right' | 'left' | 'top'`). Example: `ex/notice-stamp.jpg`.

### 8. Versus chart: the pre-chorus

```js
KIT.versus(ctx, t, { x: 260, y: 150, w: 1400, tu: 24, yo: 25, rows: [{ tu: '0 kcal', yo: '1200 kcal', t: BEAT.t(95) }] });
```

TÚ in cold blue on black against YO in white on tomato. The first word of each line slams into its column head and the rest fills the cell under it. `rows` are plain facts that build under the lyric, each at its own beat. Example: `ex/versus.jpg`.

### 9. Rating card, perfume serif, commandment

```js
KIT.rating(ctx, t, { tIn: BEAT.t(138), tOut: BEAT.t(140) });
KIT.perfume(ctx, t, 36, { x: 960, y: 250, w: 1600, size: 150 });
KIT.commandment(ctx, t, 74, {});
```

The rating card fills the frame with basil green: CLASIFICACIÓN, a boxed G, GASTRONÓMICO. `KIT.perfume` sets a line in slow italic serif, letter by letter; `x, y` is the centre and first baseline, with `align`, `ink`, `edge` (a black edge in px for a bright picture) and `words: [from, to)`. Put it over the dark part of the frame. `KIT.commandment` fills `box` (the whole frame) with tomato and sets the line in white caps as large as the box takes, one slam per word; pass a smaller `box` to share the frame with the picture.

Examples: `ex/rating.jpg`, `ex/perfume.jpg`, `ex/commandment.jpg`.

### 10. Telenovela: the bridge

```js
KIT.script(ctx, t, 54, { at: [[430, 250, 250, -0.12], [1500, 330, 280, 0.08], [1320, 820, 330, -0.06]] });
KIT.news(ctx, t, { li: 55, ticker: 'NOVIO EXIGE ENSALADA   ·   LA PIZZA SIGUE EN LA MESA' });
KIT.episode(ctx, t, { li: 59, y: 860 });
KIT.status(ctx, t, { x: 520, y: 700, w: 880, tIn: BEAT.t(244), tFlip: BEAT.t(246) });
```

`KIT.script`: white brush script with a tomato edge. Each word crashes in on its `t0`, from a fifth of its size to full in 0.14 s. Give `x, y, w, size, rot` for a row, or `at: [[x, y, size, rot], ...]` to place each word. Pair it with `CAM.crash` on the same word times. `KIT.news`: a red ÚLTIMA HORA tab, the line as the headline, a ticker and a clock (`label`, `ticker`, `clock`, `y`). `KIT.episode`: a tracked CAPÍTULO 247 between two rules over the line in script. `KIT.status`: a card that reads "En una relación" until `tFlip`, when the switch goes over to tomato and it reads "Soltera, con pizza" (`label`, `from`, `to`).

Examples: `ex/script.jpg`, `ex/news.jpg`, `ex/episode.jpg`, `ex/status.jpg`.

### 11. Kiss print, napkin, end card

```js
KIT.napkin(ctx, t, 5, { x: 1250, y: 96, w: 580 });
KIT.kiss(ctx, t, { x: 1500, y: 700, size: 300, rot: -0.2, tHit: BEAT.t(27) });
KIT.kisses(ctx, t, { b0: 311, n: 8, step: 1, box: { x: 60, y: 620, w: 520, h: 360 }, seed: 3 });
KIT.title(ctx, t, { tQueso: BEAT.t(362), tName: BEAT.t(366), x: 1400, y: 300, size: 250 });
```

The napkin slides in at `tIn` and the line is written on it in pen, word by word, with a lip print on the last word (`brk`: the word that starts the second row; `kiss: false` leaves the print off). `KIT.kiss` stamps one print (`color`: tomato, patent or mozz; `pulse` throbs it on the beat). `KIT.kisses` multiplies them over a `box`, one per `step` beats from beat `b0`. Tomato on the red booths is weak, so land prints on paper, skin or the tablecloth. `KIT.title` is the end card: the QUESO slab, then Saindra in book italic (`ink` for the name, `bg` to fill the frame). It cuts on quietly.

Examples: `ex/napkin-kiss.jpg`, `ex/title.jpg`.

### Slab and bites: the surface of last resort

```js
KIT.bitten(ctx, t, g => {
  KIT.slab(g, t, 'MIRA', { x: 280, y: 172, size: 200, rot: -0.05, bg: PAL.mozz, li: 4, wi: 0 });
}, [{ x: 510, y: 132, r: 84, rot: 2.9, t: BEAT.t(23.75) }]);
```

`KIT.slab` puts one word on a flat block and slams it on, like a sticker on packaging. With `li, wi` it is that sung word and lands on its `t0`. Options: `x, y` centre, `size`, `rot`, `bg`, `ink`, `tHit`, and `from`, the scale on the hit frame (2.4): lower it for a slab beside her face. Use a slab when a line has no surface of its own. `KIT.bitten` draws anything on a layer and takes bites out of it at given times, so the picture shows through. Example: `ex/slab-bitten.jpg`.

## Pictures: SHOT and the edit list

```js
const pic = SHOT.draw(ctx, 's003', t, { move: { zoom: [1.04, 1.09] }, about: [0.47, 0.36], cam: CAM.punch(t, hit, 0.06) });
```

`SHOT.draw(ctx, sid, t, opts)` draws shot `sid`: its Seedance clip when `queso/edl.json` has one, else its plate under a slow move. The edit list maps a shot to a clip and says which clip second plays when:

```json
{
  "s003": { "clip": "W03-t2", "in": 0.55 },
  "s081": { "clip": "W81-t1", "in": 0.989, "warp": [[1.008, 2.0], [1.778, 3.06]] }
}
```

Write `u` for seconds since the shot's first frame, `t - SHOT.t0(sid)`.

- `in`: the clip second on the shot's first frame. Clip time is `u + in`.
- `warp`: knots `[u, k]`, with `u` ascending and `k` in clip seconds, for a lip-sync take retimed so each sung word lands on the song. Clip time is piecewise linear through the knots. Before the first knot the clip runs at normal speed into it, `k = u + (k0 - u0)`. Between two knots it is interpolated. After the last knot it runs on at normal speed, `k = u + (kn - un)`. When an entry has `warp`, `in` is ignored.
- Clip time is clamped to the clip: the first frame holds before 0 and the last frame holds after the end.

`SHOT.clipTime(u, entry)` is that function. The `lt` that `SHOT.draw` returns for a clip is the clip time of the frame, so pins keyed to clip time follow a warp for free. `tools/clips.py` writes `edl.json`; chapter authors leave it alone.

| Option | Meaning |
|---|---|
| `move` | `{zoom: [a, b], x: [a, b], y: [a, b], rot: [a, b], ease}` across the shot. A plate without one pushes in 1.2% per beat. A clip has no default move |
| `about` | `[fx, fy]`, 0 to 1: the point of the picture that stays put while the zoom changes. Aim it at her face or at the prop |
| `cam` | One `CAM` result or a list: punches, shakes, a crash |
| `behind` | `c => {...}` draws type between the background and the subject through the matte. Without a matte it draws on top |
| `plate` | A name or an index, for a shot with several plates. By default they share the shot's beats equally |
| `clip`, `in`, `warp` | Override the edit list, one field at a time. `clip: null` forces the plate, `warp: null` turns a warp off |

It returns `{kind, name, lt, place, src, matte}`. `SHOT.at(sid, t, opts)` returns the same without drawing, for a graphics scene that pins things to a picture drawn by another scene. `SHOT.pt(place, px, py)` and `SHOT.box(place, x0, y0, x1, y1)` map plate pixels (2944 x 1648) to the frame; `SHOT.enter(ctx, place)` lets you draw in plate pixels. `SHOT.t0(sid)` and `SHOT.t1(sid)` are the shot's cut times.

Pins in plate pixels are right only while `kind === 'plate'`. When a clip lands, check `kind` and give the pins keyframes in clip time. A plate with a known flaw (see `PLATES.md`) gets a crop through `about` and `move`, or a chip over it (`chipAt`).

Examples: `ex/shot-clip.jpg`, `ex/shot-plate.jpg`.

## Camera and edit

| Move | Call | What it looks like | When |
|---|---|---|---|
| Slow push or drift | `move` in `SHOT.draw` | 1 to 1.5% zoom per beat, or 20 to 40 px of travel across a shot | Every still. A plate never sits static for more than two beats; `SHOT.draw` also adds 3 px of handheld float |
| Punch | `CAM.punch(t, at, 0.05)`, `CAM.beat(t, 0.025)` | The frame jumps in 3 to 6% on a kick and settles in 0.28 s | A word landing, a pump on each beat of a physical action. One per beat at most |
| Shake | `CAM.shake(t, at, 14)` | 10 to 18 px of jitter that dies in 0.35 s | Something hits: the QUESO slam, the stamp, the pizza landing. Once per shot |
| Crash zoom | `CAM.crash(t, at, 1.5)` | 1 to 1.15 or as far as 1.6 in 0.16 s, then it holds | The telenovela bridge. Elsewhere once per chapter at most |
| Pull back | `move: {zoom: [1.12, 1.03], ease: EASE.outCubic}` | A reveal | When a shot shows who else is at the table |

- Cuts fall on the beats in `shots.json`: use `SHOT.t0(sid)` and `SHOT.t1(sid)`. Hard cuts only. A wipe exists only where the storyboard names an object that makes it.
- A surface arrives on a beat or on a word's `t0` and leaves on a cut. Words cut on or slam from 2.4 times their size in two frames; a panel unrolls in under a quarter second.
- Pass the same `CAM` values to `CAM.apply(ctx, cam)` when a graphics layer has to move with the picture.
- `CAM.mix(a, b)` combines cameras: zooms multiply, offsets add.

## Banned

Drop shadows, glows and gradients as decoration. Emoji. Lens flares. Glitch, grain, halftone, vignette or any grade on the footage. Generic lower thirds. Anything that looks like a retro computer. Fades on lyric type, the perfume serif's letters excepted. Type over her face. Lettering inside the footage. A second joke in the small print.

## The pattern of a chapter

`01_aperitivo.js` is laid out the way every chapter is:

1. `CAM_OF`: one function per shot that returns the `SHOT.draw` options for time `t`.
2. Picture scenes at `z: 0`, one per shot, from `SHOT.t0(sid)` to `SHOT.t1(sid)`.
3. Graphics scenes at `z: 10`, one per lyric surface, starting at the first word's `t0` or the beat before it.
4. Pins in plate pixels, drawn only while the shot shows its plate.

Checks, from `engine/` with `VIDEO_PROJECT=queso`: `render.py lyrics A:B --ch NN` prints N/N, `render.py check A:B --n 48 --ch NN` prints HISTORY-INDEPENDENT, and you have read a sheet of every shot's first and last frame, every line's first and last word and every cut.
