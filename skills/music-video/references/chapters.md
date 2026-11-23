# Chapters

Phase 9. Lyrics and graphics are drawn in code, never by an image or video model, so every letter is correct and every word lands at its time. A chapter is one JavaScript file that draws the picture, the lyrics and the graphics for one section of the song. The engine renders them in headless Chromium. Read `toolkit/engine/ANIMATION_GUIDE.md` before writing one. It is the full contract, and this page covers the rules and how to organise the work.

Chapters are not the only way to put type on a film. A locked picture cut can take its lyrics from a script that reads the word times and a list of lyric cues, lays the type out, and composites it onto the decoded frames. Tía Mari Juana was finished that way. The rules below apply to both routes. Use the engine when the graphics are dense and move with the beat, and the compositing script when the picture is final and the type is the only addition.

## The rules every chapter follows

1. **The lyric gate.** Every sung word is on screen at its time, at least 40 px tall on the 1080p frame so a phone can read it. `render.py lyrics` checks it and must print N of N. On Tía Mari Juana the smallest sung type measured 42 px.
2. **On the beat.** Cuts land on bar starts (`BEAT.t(n)`). Type lands on the start of its word. Camera moves start or end on beats.
3. **Pure functions of time.** No state carries from one frame to the next. `render.py check` renders frames in order and then shuffled, and the pixels must match.
4. **Lyrics hold still.** A sung line gets one on-screen instance. It persists for as long as it is being sung, including across a cut, and is never drawn a second time in the next shot. A line gets one layout in one place for its whole life and keeps it across cuts. A word already sung never moves when the picture cuts: it stays until the phrase is done, or goes away at the cut. Never split a line between two positions. "The phrase needs to finish where it started." And: "too much movement, the eye doesn't get a chance to keep up and read anything."
5. **Dense on the beat.** A first design spec that said "sparse" was the wrong default. The producer admired another film for "the huge amount of effects constantly going to the beat". Plan a beat-driven effects layer from the start (stem events driving picture punches, meter hits, counters), with the type set large. Density has limits: nothing over a face, no strobing. A split screen is a good way to give a strong scene about a bar of screen time.
6. **The camera reacts to the kick only.** "Should only activate on the KICK DRUM not other things." No snare shoves, bar pushes or per-word punches. Give each shot a switch to turn the beat camera off when its own motion is the point (a crowd bobbing their heads: "you can't really appreciate it because the screen is shaking"). Do not pulse anything in passages with no drums: "it's just pulsing for no apparent reason". On READ ME the first version shook on everything, and the lead could not be seen.
7. **Objects fade, words land.** Every graphic object (a card, a note, a block) fades in and out over about 0.25 s, and two objects in the same spot crossfade. "Cards popping in and out of existence, it looks dumb. quick fade much better." The end card dissolves in from the last frame over about 1 s: "the way the final card just pops in as a cut sucks." Sung words still land hard on their word.
8. **Clean.** The footage keeps its own colour. No grade, grain or glitch added in code.
9. **The lead is the star.** Type may tuck behind her using a matte. It never covers her face. Keep a table of face boxes through the cut (Tía Mari Juana sampled six a second) and place each cue at the first candidate position that misses every face in its window, with overrides keyed by cue time for the ones that need a hand.
10. **Footage stays full frame.** Do not crop 16:9 footage into a portrait window. The producer rejected footage inside a tall card, even with the crop sliding per shot: "doesn't frame the content properly". Put graphics beside the footage.
11. **Funny first, or whatever the song's tone is.** Write the tone into the brief. Queso's was "a joke told with a straight face": the graphics explain the joke and never wink at it.
12. **Correct typography for the language.** Queso is in Spanish, so opening marks, accents and ñ are set properly. The typeface is the producer's call. A plain subtitle face was rejected on a painted film and the producer picked a brush script.
13. **Real references for real objects.** When a surface copies a printed object, find the object first. Tía Mari Juana's chorus was first drawn as lotería cards. The producer sent photos of real ones: "real loteria cards never have the name of the card on a plain background." A real carta has a white margin, a thin black frame, the picture running to the frame, a small number top left and the name in plain caps printed over the picture along the bottom. After several versions he ruled "just get rid of the cards, they don't work", and the chorus became four two-line verses. Show a surface in a mock before building a film around it, and treat a rejected surface as dead.
14. **Leave room for the opening.** If an intro credit and a title own the first seconds, the first lyric lines go bare.

## How a chapter file is laid out

`examples/queso/engine/ch/01_aperitivo.js` is the pattern:

1. One camera per shot, as a function of time.
2. Picture scenes at the bottom layer, one per shot, with start and end taken from the shot's beats.
3. Graphics scenes above, one per lyric surface. A surface starts with its first word, even when that is a frame or two before the cut.
4. Anything pinned to the picture is given in plate pixels and mapped through the shot's placement.

Shots play their clip when the edit list (`edl.json`) has one, and fall back to the plate under a slow push while the clip is still rendering. That fallback is a placeholder, so a draft that still shows plates should say so, shot by shot. Chapters can be written against 480p drafts: clip time is the same at every resolution, and the approved 1080p clips drop in through the same edit list.

Once stills become clips the picture moves, so graphics pinned to plate pixels drift off their target. Key them to clip time, and let a tracking box drop out when a hand covers the thing it tracks.

A screen in the picture (a phone, a trading chart) is a real recording or a green-screen plate keyed in, not an imitation drawn by a model. Juego's chart in the drum solo is the coin's real price history, stretched to fit the music.

## Building in parallel

1. One agent builds the kit and chapter 1 as the exemplar.
2. The other chapters go to parallel animators, one file each, with chapter 1 and the brief as their reading.
3. Animators work against plates first. Clips drop in through the edit list as they land.

The file contract, which belongs in `PRODUCTION.md`:

- An animator edits only its own chapter file.
- The engine, `common.js`, the kit, the tools and the data are read-only. A missing helper is written inside the chapter and reported.
- Scratch output goes under `media/scratch/<chapter>/`.
- Nothing is generated or bought by an animator.

On Queso eight animators finished in 39 to 63 minutes each and added jokes nobody had asked for, such as a ticker in the telenovela bridge reading "NOVIO EXIGE ENSALADA".

## Before a chapter is reported done

From `engine/`, with `VIDEO_PROJECT` set:

```bash
python render.py lyrics A:B --ch NN          # N/N
python render.py check A:B --n 48 --ch NN    # HISTORY-INDEPENDENT
python render.py sheet <times> --ch NN --out sheet.jpg
python render.py bench A:B --ch NN           # under 150 ms a frame
```

Make contact sheets at every shot's first and last frame, every line's first and last word, and both sides of every cut. Read every sheet. Then render full-size stills of the four best moments and look at those too.

Checked on its own, a chapter can miss one word that belongs to the previous chapter's last line. The whole-film run is the one that has to pass.

## The rough cut

```bash
python render.py lyrics 0:<length>
python render.py check 0:<length> --n 48
python render.py video 0:<length> --w 1280 --workers 8 --out ../mysong/media/render/rough-cut.mp4
```

A full 1080p render of a four-minute song takes a little over a minute on an M2 Ultra with eight workers. More workers ran slower.

`tools/publish.sh mysong NN A:B` checks one chapter, renders its draft and puts it on the review page.

When new clips land, render a sheet of the film at each affected shot and look at every clip under its graphics before you publish the new cut.

**Gate.** The producer watches the rough cut with sound and sends notes.
