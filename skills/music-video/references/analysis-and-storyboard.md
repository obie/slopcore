# Song analysis, concept, casting and storyboard

Phases 1 to 4. Nothing here costs more than a few Midjourney jobs, so this is the place to be thorough.

## 1. Song analysis

The goal is two files that everything else is timed to: a beat grid and a start and end time for every sung word.

```bash
cd mysong/media/audio && demucs -d cpu -n htdemucs song.wav -o stems_raw && cd -
.venv/bin/python tools/beatgrid.py mysong      # media/audio/beatmap.json
.venv/bin/python tools/transcribe.py mysong en # media/audio/whisper.json (en, es, ...; leave it out to auto-detect)
.venv/bin/python tools/align.py mysong         # media/audio/words.json
```

- The beat grid is fitted to the kick on the drum stem: beat n is at `t0 + n * period`. The grid is uniform. Bars are often irregular, so never assume a section starts every fourth beat. Find section starts by ear and by the lyric.
- Alignment works per stanza. Aligning line by line gave bad results. Rows that `align.py` marks with `?` need a listen, and `align_overrides.json` lets you give a line its own window.
- In `LYRICS.md`, lines in (parentheses) are asides and lines in {braces} are on the sheet but absent from the recording. Ask the producer which lines are really sung. On Queso the outro differed from the sheet.

Then make the timing proof: a plain video where each word lights up at its time over a beat counter. Render it with the `00_timing.js` chapter and send it to the producer.

```bash
cd engine && VIDEO_PROJECT=mysong ../.venv/bin/python render.py video 0:<song length> --ch 00 --w 1280 \
  --out ../mysong/media/render/timing-proof.mp4
```

**Gate.** The producer watches it with sound and says the timing is right. After that the grid and the word times are frozen. Every cut and every lyric will sit on them, so a later change here moves the whole film.

## 2. Concept and design language

Write `PRODUCTION.md`. It holds the premise in three sentences, the producer's direction in their own words, the rules, the cast and the world, and the design language.

The design language is one idea: **the lyric always lives on a surface that belongs to the world of the song.** Queso is about a boyfriend who counts his girlfriend's calories, so its chorus is a nutrition label, his lines are a calculator tape, the Italian asides are foreign-film subtitles, and the bridge is a telenovela with a breaking-news banner. Pick surfaces from the song's own world, one per section, and let the chorus surface grow each time it returns.

Keep a banned list too. Queso banned decorative shadows and gradients, emoji, lens flares, glitch effects and generic lower thirds. Type is flat and sharp, and the footage keeps its own colour.

Pitch the concept to the producer in a few lines and wait. Queso's producer answered "yes go crazy with your concept, i love it", and that sentence went into the brief.

## 3. Casting test

Before the storyboard, find out how to generate the lead so that she looks like herself and the pictures are alive. Make the same three or four scenes several ways (model versions, with and without reference images), lay them out as labelled sheets, and let the producer judge.

On Queso, 8 jobs and 32 images settled it in ten minutes:

- Midjourney v7 with an omni-reference held her face and gave stiff posed glamour where the action never happened. The producer called it "extremely terrible".
- v8.2 from text alone was funny and alive with the wrong face.
- v8.2 with her two reference images attached through `--edit` won: "these are much much better lol".

If the producer has no frontal face close-up of the lead, make one here from the portrait and have it approved. It becomes the second reference for every plate.

Cast every recurring character this way. The boyfriend came out as a different man in every plate until one frame of him was picked and attached as a reference to all his shots.

Write the result into `bible/LEAD.md`: the exact parameters, the reference links, the identity text for each character, the world sentence, and what the producer liked. See `examples/queso/bible/LEAD.md`.

## 4. Storyboard

One shot per lyric line, plus the instrumental moments. For each shot write:

- the beats it covers and the lyric line
- the picture, in one sentence, as an action
- the lyric surface for that line
- the graphics that land on its beats
- the clip kind it will need (singing, motion to the beat, or a silent insert)

Rules that held up:

- **Every shot is a video clip.** Plan no stills. A shot that cuts between pictures gets one clip per picture.
- **Size the shot count to the ceiling.** One shot per lyric line is the upper end. With a smaller budget, let a shot run across two or three lines. Work the number out with `references/costs.md` before writing the storyboard, and show the producer the sum.
- **Cuts land on kicks.** Shot boundaries are beat numbers.
- **Choose singing shots sparingly.** Lip sync is the most expensive and least reliable kind of clip. Queso sings on camera in 8 of 93 shots, chosen where the mouth is large in frame and the line is short. Everything else cuts away.
- **Keep the action near the middle of the frame** if vertical versions will be cut later.
- **Write gags as physical actions.** The producer's own additions on Queso were all of this kind: she burps, she crosses her eyes, she gets doused in salsa.
- **A storyboard is data.** Keep it in a script like `examples/queso/storyboard.py` that writes `shots.json`, the readable `STORYBOARD.md` and the Midjourney batch files. Give each plate job a revision counter so a re-shoot keeps the record of jobs already sent.

Split the song into chapters at this point: one per section, with hard cuts on named beats. Queso has nine. The chapters are what you hand to parallel animators in phase 8.

**Gate.** The producer reads the storyboard and approves it.
