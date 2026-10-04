# Chapters

Phase 8. A chapter is one JavaScript file that draws the picture, the lyrics and the graphics for one section of the song. The engine renders them in headless Chromium. Read `toolkit/engine/ANIMATION_GUIDE.md` before writing one. It is the full contract, and this page only covers how to organise the work.

## The rules every chapter follows

1. **The lyric gate.** Every sung word is on screen at its time, at least 40 px tall on the 1080p frame so a phone can read it. `render.py lyrics` checks it and must print N of N.
2. **On the beat.** Cuts land on kicks (`BEAT.t(n)`). Type lands on the start of its word. Camera moves start or end on beats.
3. **Pure functions of time.** No state carries from one frame to the next. `render.py check` renders frames in order and then shuffled, and the pixels must match.
4. **Funny first, or whatever the song's tone is.** Write the tone into the brief. Queso's was "a joke told with a straight face": the graphics explain the joke and never wink at it.
5. **Clean.** The footage keeps its own colour. No grade, grain or glitch added in code.
6. **The lead is the star.** Type may tuck behind her using a matte. It never covers her face.
7. **Correct typography for the language.** Queso is in Spanish, so opening marks, accents and ñ are set properly.

## How a chapter file is laid out

`examples/queso/engine/ch/01_aperitivo.js` is the pattern:

1. One camera per shot, as a function of time.
2. Picture scenes at the bottom layer, one per shot, with start and end taken from the shot's beats.
3. Graphics scenes above, one per lyric surface. A surface starts with its first word, even when that is a frame or two before the cut.
4. Anything pinned to the picture is given in plate pixels and mapped through the shot's placement.

Shots play their clip when the edit list (`edl.json`) has one, and fall back to the plate under a slow push while the clip is still rendering. That fallback is a placeholder. A draft that still shows plates should say so, shot by shot.

Once stills become clips the picture moves, so graphics pinned to plate pixels drift off their target. Key them to clip time, and let a tracking box drop out when a hand covers the thing it tracks.

## Building in parallel

1. One agent builds the kit and chapter 1 as the exemplar.
2. The other chapters go to parallel animators, one file each, with chapter 1 and the brief as their reading.
3. Animators work against plates first. Clips drop in through the edit list as they land.

The file contract, which belongs in `PRODUCTION.md`:

- An animator edits only its own chapter file.
- The engine, `common.js`, the kit, the tools and the data are read-only. A missing helper is written inside the chapter and reported.
- Scratch output goes under `media/scratch/<chapter>/`.
- Nothing is generated or bought by an animator.

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
