# Animation guide

Read this before writing a chapter. It is the whole contract.

## The one rule

Every frame is a pure function of song time `t` (seconds). The renderer splits the song across cold browsers
that start mid-song and render frames in any order. A frame that depends on an earlier frame comes out wrong
in the final video and fails `check`.

## The stage

- One canvas, 1920 x 1080 px, origin top left. Globals `W = 1920`, `H = 1080`.
- A frame starts black. Every scene with `t0 <= t < t1` draws, lowest `z` first. Ties draw in registration
  order (chapter file name order, then order in the file).
- Frame `i` of a render of `A:B` is at `t = A + i/24`.
- The song's length and beat grid come from `<project>/media/audio/beatmap.json`. Beat `n` is at `BEAT.t(n)` = `BEAT.t0 + n * BEAT.period` s.

## A chapter file

`<project>/engine/ch/NN_name.js`. It runs once at load, inside its own strict-mode function. Its top-level names are
private to it. Shared constants and functions go in `<project>/engine/common.js`, which runs first as a global script.
Fonts, `BEAT` and `LYR` are ready when a chapter loads, so load-time layout is fine.

```js
// 03_verse1.js
const T0 = LYR.line(12).t0 - 0.5, T1 = BEAT.t(89);

SCENE({
  id: '03.bg',            // unique across all chapters: prefix with the chapter number
  t0: T0, t1: T1,         // seconds of song time, draws while t0 <= t < t1
  z: 0,                   // optional, default 0
  draw(ctx, t, lt) {      // lt = t - t0
    MEDIA.drawPlate(ctx, 'kitchen', { zoom: 1 + 0.02 * lt });
  },
});

SCENE({ id: '03.lyric', t0: T0, t1: T1, z: 10, draw(ctx, t) {
  for (const L of LYR.at(t)) LY.line(ctx, t, L.li, { y: 900, size: 110, ...STY.lyric });
}});
```

Each scene is wrapped in `ctx.save()` / `ctx.restore()`. `SCENE({..., proof: true})` marks a scene that is not
part of the video (the timing proof): it registers only when its chapter is picked with `--ch`.

## Purity rules

1. Inside `draw`, `Math.random()`, `Date.now()`, `new Date()` and `performance.now()` throw. Use `hash` or `rnd`.
2. Keep no state between frames. No counters, accumulators, "previous value" variables or step-by-step
   simulation. Compute every position in closed form from `t`. Top-level code may build constant tables from
   the data.
3. `draw` is synchronous. No `await`, `fetch`, timers or `new Image()`. Images come from `MEDIA`.
4. Create canvases only with `CANVAS.make(w, h)` or `CANVAS.scratch(key)`. Both are CPU canvases
   (`willReadFrequently: true`). A canvas made any other way and read with `getImageData` changes how it
   rasterises after the first readback.
5. Balance every `ctx.save()` with a `ctx.restore()`. A leak throws. `ctx.reset()` on the frame context throws.
6. Register fonts in `common.js` with `TXT.addFont`. An unknown font, plate or clip throws.
7. `LYR` data is frozen. Chapters run in strict mode, so an undeclared assignment throws.

## Helpers

### Math and randomness

| Call | Example |
|---|---|
| `clamp(x, a = 0, b = 1)` | `const u = clamp(lt / 0.5)` |
| `lerp(a, b, u)` | `const x = lerp(200, 960, u)` |
| `remap(x, a, b, c = 0, d = 1, ease)` clamped | `const y = remap(lt, 0, 0.4, 1200, 540, EASE.outCubic)` |
| `EASE.<name>(u)`, 0 to 1 in, 0 to 1 out | `EASE.outBack(clamp(lt / 0.3))` |
| `spring(lt, freq = 3, damp = 0.5)` 0 at `lt <= 0`, settles on 1, overshoots when `damp < 1` | `const s = spring(t - w.t0, 3.5, 0.45)` |
| `hash(a, b, ...)` fixed float in [0, 1) | `const tilt = (hash(li, wi) - 0.5) * 0.2` |
| `rnd(seed)` generator, same sequence each time it is built; build it inside `draw` | `const r = rnd(li); r(); r.range(100, 1820); r.int(6); r.pick(colors)` |
| `noise(x, seed = 0)` smooth, [-1, 1], one feature per unit of `x` | `ctx.translate(6 * noise(t * 3, 1), 6 * noise(t * 3, 2))` |
| `mixColor('#rrggbb', '#rrggbb', u)` | `ctx.fillStyle = mixColor('#474a56', '#ffd23f', u)` |
| `TAU` | `ctx.arc(x, y, r, 0, TAU)` |

`EASE` names: `linear inQuad outQuad inOutQuad inCubic outCubic inOutCubic inQuart outQuart inOutQuart inExpo
outExpo inOutExpo inOutSine inBack outBack outElastic outBounce smooth`.

### BEAT

| Call | Example |
|---|---|
| `BEAT.t(n)` time of beat `n`, fractional `n` allowed | `SCENE({ t0: BEAT.t(16), t1: BEAT.t(48), ... })` |
| `BEAT.pos(t)` fractional beat position | `const phase = BEAT.pos(t) % 1` |
| `BEAT.n(t)` index of the last beat at or before `t` | `const flip = BEAT.n(t) % 2` |
| `BEAT.pulse(t, decay = 0.25, every = 1)` 1 on the beat, `(1 - dt/decay)^2` after it, 0 from `decay` seconds on. `every` = beats between pulses | `const k = 1 + 0.06 * BEAT.pulse(t, 0.3)` |
| `BEAT.snap(t, div = 1)` nearest grid time, `div = 2` for half beats | `const hit = BEAT.snap(L.t0)` |
| `BEAT.period`, `BEAT.t0`, `BEAT.bpm`, `BEAT.duration` | seconds per beat, time of beat 0, tempo, song length (for example `0.612241`, `0.4212`, `98.0007`, `229.12`) |

Beats are evenly spaced for the whole song. Bar lengths vary: the chord loop restarts on a different beat in
each section (see `bars` in `<project>/media/audio/beatmap.json`), so `n % 4 === 0` does not reliably mark a bar
start.

### LYR

| Call | Example |
|---|---|
| `LYR.lines` all 93 lines | `LYR.lines.filter(L => L.section === 'Bridge')` |
| `LYR.line(li)` | `const L = LYR.line(12)` |
| `LYR.word(li, wi)` | `const w = LYR.word(12, 3)` |
| `LYR.at(t)` lines with `t0 <= t < t1`; lines can overlap | `for (const L of LYR.at(t)) ...` |
| `LYR.stanza(s)` lines of stanza `s` | `LYR.stanza(9)` |

A line is `{li, section, stanza, text, aside, t0, t1, words: [{w, t0, t1}]}`. `aside` is true for the Italian
asides. `SONG.stanzas` in `common.js` groups lines into `{stanza, section, lines, t0, t1}`.

### MEDIA

| Call | Example |
|---|---|
| `MEDIA.drawPlate(ctx, name, opts)` | `MEDIA.drawPlate(ctx, 'kitchen', { fit: 'cover', zoom: 1.1, x: -40, y: 0, rot: 0.01, opacity: 0.9 })` |
| `MEDIA.drawClip(ctx, clip, lt, opts)` returns the 0-based frame index drawn | `MEDIA.drawClip(ctx, 'dance', lt, { loop: true })` |
| `MEDIA.frame(clip, lt, opts)` frame index without drawing | `const i = MEDIA.frame('dance', lt)` |
| `ASSETS.clips[clip].n`, `ASSETS.plates[name].matte` | `const secs = ASSETS.clips.dance.n / 24` |

Placement options, shared by plates, clips and `OCC` sources:

| Option | Default | Meaning |
|---|---|---|
| `fit` | `'cover'` | `'cover'` fills the box and crops, `'contain'` fits inside it |
| `box` | whole frame | `{x, y, w, h}` to fit into. Clip with `ctx.clip()` yourself if needed |
| `zoom` | `1` | scale about the image centre, after `fit` |
| `x`, `y` | `0` | offset of the image centre from the box centre, in px |
| `rot` | `0` | radians, about the image centre |
| `opacity` | `1` | multiplies `ctx.globalAlpha` |
| `smooth` | `'high'` | `'low'` or `'medium'` for cheaper scaling |
| `loop` (clips) | `false` | `false` holds the first frame before 0 and the last frame after the end |
| `fps` (clips) | `24` | clip frame rate |

Clip frame index is `floor(lt * fps)`. Draw calls are synchronous. An image that is still loading draws
nothing on that pass and the engine redraws the frame when it is decoded, so never branch on whether an image
has loaded.

### OCC

`OCC.behind(ctx, source, drawTypeFn)` draws the type, then redraws the source's subject over it through the
matte. Draw the plate or clip first, then call it with the same placement options.

```js
const place = { zoom: 1.1, x: -30 };
MEDIA.drawPlate(ctx, 'subject', place);
OCC.behind(ctx, { plate: 'subject', ...place }, c => TXT.draw(c, 'TITLE', 960, 700, { ...STY.hook, size: 520, align: 'center' }));

MEDIA.drawClip(ctx, 'walk', lt);
OCC.behind(ctx, { clip: 'walk', lt }, c => TXT.draw(c, 'TITLE', 960, 700, { ...STY.hook, size: 520, align: 'center' }));
```

It throws when the plate or clip has no matte.

### TXT

A style is a plain object. Sizes are canvas px.

| Field | Default | Meaning |
|---|---|---|
| `font` | `FONT.sans` | `FONT.hook` (Anton), `FONT.sans` (Inter, 100 to 900), `FONT.mono` (JetBrains Mono, 100 to 800), `FONT.serif` (Playfair Display italic, 400 to 900) |
| `size` | `64` | font size |
| `weight` | `400` | Anton has one weight and ignores this |
| `italic` | `false` | set `true` with `FONT.serif` |
| `tracking` | `0` | em. `0.05` adds `0.05 * size` px between glyphs |
| `align` | `'left'` | `'left'`, `'center'`, `'right'` about `x` |
| `baseline` | `'alphabetic'` | `'alphabetic'` (y is the baseline), `'center'` (cap height centred on y), `'top'` (cap top at y) |
| `fill` | `'#fff'` | `null` for stroke only |
| `stroke`, `strokeWidth` | none | drawn under the fill |
| `opacity` | `1` | multiplies `ctx.globalAlpha` |
| `upper` | `false` | uppercase (Spanish rules) |

| Call | Example |
|---|---|
| `TXT.draw(ctx, text, x, y, style)` returns the width | `TXT.draw(ctx, 'TITLE', 960, 540, { font: FONT.hook, size: 300, align: 'center', baseline: 'center', fill: PAL.accent })` |
| `TXT.width(text, style)` advance width | `const w = TXT.width('title', S)` |
| `TXT.measure(text, style)` returns `{w, asc, desc, cap}` | `const m = TXT.measure('title', S)` |
| `TXT.layout(words, box, style)` one box per word | `const boxes = TXT.layout(L.words, { x: 160, y: 300, w: 1600, h: 480 }, { ...S, align: 'center', fit: true })` |
| `TXT.word(ctx, b, style)` draws one layout box | `for (const b of boxes) TXT.word(ctx, b, S)` |
| `TXT.fit(text, box, style)` returns a size | `const size = TXT.fit('NO ES GRASA', { w: 1600, h: 300 }, { font: FONT.hook })` |
| `TXT.addFont(family, url, desc)` in `common.js` only | `TXT.addFont('Bungee', '/<project>/engine/fonts/Bungee-Regular.ttf')` |

`TXT.layout`: `words` are strings or `{w}` objects, and a `'\n'` entry forces a line break. Lines wrap at
`box.w`. With `box.h` the block is placed by `style.valign` (`'top'`, `'middle'` default, `'bottom'`); without
it the block starts at `box.y`. Extra style fields: `lineHeight` (em, default 1.15), `wordGap` (default 1),
`wrap: false` for one row, `fit: true` to shrink until the block fits. Each box is
`{text, i, line, x, y, w, size, cx, cy}`: `x` left edge, `y` baseline, `cx, cy` the centre of the cap-height
box, `i` the index into `words`. To animate a word about its own centre:

```js
for (const b of boxes) {
  const s = spring(t - L.words[b.i].t0, 3.5, 0.45);
  ctx.save(); ctx.translate(b.cx, b.cy); ctx.scale(s, s); ctx.translate(-b.cx, -b.cy);
  TXT.word(ctx, b, S);
  ctx.restore();
}
```

`TXT.fit` returns the largest size at which the line is no wider than `box.w` and its ink no taller than
`box.h` (`h` optional), capped at `style.max`.

### LY and the lyric gate

The gate renders every sung word at the midpoint of its span, `(t0 + t1) / 2`, and requires a mark for that
word at 36 px or taller in that frame. 420 words, no exceptions.

| Call | Example |
|---|---|
| `LY.mark(li, wi, px)` word `wi` of line `li` is on screen at `px` tall. `px` is the font size as drawn, after any scale | `LY.mark(L.li, b.i, b.size * LY.scale(ctx))` |
| `LY.scale(ctx)` scale factor of the current transform | see above |
| `LY.line(ctx, t, li, opts)` draws one row and marks it; returns word boxes | `LY.line(ctx, t, 12, { y: 900, size: 110, dim: '#555', active: PAL.accent })` |

`LY.line` options: `x` (default 960), `y` baseline (default 540), `w` max width (default 1680, the row
shrinks to fit), `align` (default `'center'`), `fill`, `dim`, `active`, plus any TXT style field (default
Inter 800, size 96). Each word appears at its own `t0`. Before `t0` it draws in `dim`, or not at all when `dim`
is unset. From `t0` to `t1` it draws in `active` when set. After `t1` it draws in `fill`. It marks a word once
`t >= t0` while the word's centre is inside the frame and it is at least half opaque. It returns
`[{wi, text, x, y, w, size, cx, cy, on, sounding}]`.

When you draw lyric words yourself (with `TXT.layout`), call `LY.mark` for each word that is readable in this
frame. Mark honestly: the gate is the only check that every word reaches the screen.

After a render, the marks of that frame are in `ENGINE.marks` as `[{li, wi, px}]`.

### CANVAS

| Call | Example |
|---|---|
| `CANVAS.scratch(key = 0)` a cleared full-frame 2D context from a pool. It is wiped on every call | `const g = CANVAS.scratch('glow'); drawStuff(g); ctx.globalAlpha = 0.5; ctx.drawImage(g.canvas, 0, 0)` |
| `CANVAS.make(w, h)` a new CPU canvas with its context at `.ctx`. Call at load, never per frame | `const tex = CANVAS.make(256, 256)` |

### look

`look(ctx, mode)` runs once after the last scene. The default mode `'native'` does nothing. A project adds a
mode in `common.js` and selects it:

```js
LOOKS.warm = ctx => { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = '#ff9a3c'; ctx.fillRect(0, 0, W, H); };
ENGINE.look = 'warm';
```

`--look native` on any command overrides it. A look obeys the purity rules.

## Where things live

| Path | What |
|---|---|
| `engine/src/*.js`, `engine/index.html` | the engine. Do not edit from a chapter task |
| `engine/fonts/` | fonts and `LICENSES.md` |
| `<project>/engine/common.js` | palette `PAL`, type styles `STY`, `SONG.stanzas`. Global |
| `<project>/engine/ch/NN_name.js` | chapters, loaded in file name order |
| `<project>/engine/assets/*.js` | generated by `render.py assets`. Do not edit |
| `<project>/media/plates/<name>.jpg` | stills |
| `<project>/media/plates/<name>.matte.png` | matte for a still, white = subject |
| `<project>/media/clipframes/<clip>/f00001.jpg ...` | clip frames at 24 fps, numbered from 1 with no gaps |
| `<project>/media/clipframes/<clip>/matte/f00001.png ...` | one matte per clip frame |
| `<project>/media/audio/` | `song.wav`, `beatmap.json`, `words.json` |
| `<project>/media/scratch/` | test output |
| `<project>/media/render/` | finished renders |

A matte may be any size with the same aspect as its picture. Its alpha is luminance times alpha.

## Verify

Run from `engine/`. Every command regenerates the asset files first. `--ch 03` loads only chapters whose file
name starts with `03`, which keeps another author's broken chapter out of your render. Use it on every command
while you work. Times are seconds. `A:B` means `A <= t < B`.

```sh
cd <toolkit>/engine
export VIDEO_PROJECT=<project>
PY=python3

$PY render.py assets
$PY render.py still 41.2 --ch 03 --out ../<project>/media/scratch/ch03/still_41.2.png
$PY render.py sheet 35.5:55.2:16 --cols 4 --w 480 --ch 03 --out ../<project>/media/scratch/ch03/sheet.jpg
$PY render.py sheet 41.0,41.1,41.2,41.3 --cols 4 --w 480 --ch 03 --out ../<project>/media/scratch/ch03/hit.jpg
$PY render.py lyrics 35.5:55.2 --ch 03          # must print N/N and exit 0
$PY render.py check 35.5:55.2 --n 24 --ch 03    # must print HISTORY-INDEPENDENT
$PY render.py video 35.5:55.2 --ch 03 --workers 8 --out ../<project>/media/render/ch03.mp4
$PY render.py frames 41:42 --ch 03 --out ../<project>/media/scratch/ch03/frames
$PY render.py bench 35.5:45.5 --ch 03           # ms per frame
```

`sheet A:B:n` renders `n` times `A + k*(B-A)/n`. Look at the sheets and stills with your own eyes before you
report. `lyrics A:B` checks the words whose midpoint falls in `A:B`.

A chapter is done when `lyrics` and `check` both pass over its range and you have looked at its sheets. The
whole video is done when the same two commands pass with no `--ch`.

The timing proof is `--ch 00`:

```sh
$PY render.py lyrics --ch 00
$PY render.py video 0:<song length> --ch 00 --w 1280 --out ../<project>/media/render/timing-proof.mp4
```

## Cost of things

Measured on the M2 Ultra, CPU canvas, per call at 1920 x 1080:

| Draw | Time |
|---|---|
| 1080p image at 1:1 | 0.6 ms |
| scaled full-frame image, `smooth: 'high'` | 13 to 30 ms |
| scaled full-frame image, `smooth: 'low'` | 5 to 8 ms |
| `OCC.behind` | two scaled image draws and a 1:1 composite |
| `ctx.filter = 'blur(12px)'` on a full frame | 12 ms |
| text | under 0.3 ms per call |
| frame transfer to the encoder | 12 ms |

The full song renders in about 35 s at 1080p with 8 workers when frames are cheap. More than 8 workers is
slower on this machine.
