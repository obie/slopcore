# Song analysis, concept, cast and world, storyboard

Phases 1 to 4. Nothing here costs more than a few dollars of stills, so this is the place to be thorough. Every later phase is timed to, cast from or cut from what these four produce.

## 1. Song analysis

The goal is two files that everything else is timed to: a beat grid and a start and end time for every sung word.

```bash
cd mysong/media/audio && demucs -d cpu -n htdemucs song.wav -o stems_raw && cd -
.venv/bin/python tools/beatgrid.py mysong      # media/audio/beatmap.json
.venv/bin/python tools/transcribe.py mysong en # media/audio/whisper.json (en, es, ...; leave it out to auto-detect)
.venv/bin/python tools/align.py mysong         # media/audio/words.json
```

Run demucs with `-d cpu`. On Apple GPUs it fails with "Output channels > 65536".

**The grid.**

- `beatgrid.py` fits one uniform grid to the kick on the drum stem: beat n is at `t0 + n * period`. Bars are often irregular, so never assume a section starts every fourth beat. Find section starts by ear and by the lyric.
- Check the tempo against the song. On Juego the first grid came out at 80 BPM when the song is at 120, and on Vuela the first fit locked to half time. Every cut would have been in the wrong place.
- A song with drops (the beat cuts out and crashes back in) drifts off a single grid. READ ME runs at 162 BPM with several drops. The producer's instruction was "the grid needs to occasionally reset on the first kick drop", so the grid was rebuilt in pieces, one per drop, and it took four timing proofs to sign off. Vuela sits at exactly 140 BPM from start to finish and needed none of this.
- Check which beat is the one. On Tía Mari Juana (70 BPM, a cumbia feel) the producer heard in the timing proof that "the 1 bar is mostly falling on the snare". The tempo was right, but the fitted bar start sat on an odd beat. A histogram of kick and snare positions within the 4-beat cycle showed kicks on the even beats and snares on the odd ones. A guess from the vocal phrasing was wrong too. The producer's rule was "pretty sure it's always anchored to the bass note": take the bass stem's strongest pitch class on each beat, find where the chord root changes, and put bar 1 there. A bar that stretches by two beats (a 6-beat bar in a 4-beat loop) marks a phrase shift.
- Keep the result as a bar map: for each section, the beat where its bars start. Sung lines often start with a pickup, so a bar start and a lyric start differ. The shipped `beatgrid.py` writes only the single grid, so keep the bar map in a file of your own that the storyboard script reads.

**The words.**

- Alignment works per stanza. Aligning line by line gave bad results. Rows that `align.py` marks with `?` need a listen, and `align_overrides.json` lets you give a line its own window.
- Whisper folds a pause into the next word, so a word can show up on screen a beat before it is sung. On Vuela the fix was to give Whisper the lyric sheet as a hint and then move each word's start to the moment the vocal gets loud.
- In `LYRICS.md`, lines in (parentheses) are asides and lines in {braces} are on the sheet but absent from the recording. Ask the producer which lines are really sung. On Queso the outro differed from the sheet.
- With more than one singer, record who sings each line, pinned by the line's start time and never by order. On Tía Mari Juana, matching lines to singers by order drifted and fed the lead a silent track. The producer's chorus rule overrode the map: both sing "Mi tía Mari", one singer alone on the rest.

**Optional stem maps.** If the picture will follow an instrument, split with a six-stem model and read its events. Tía Mari Juana used the `other` stem of `htdemucs_6s` to find the bars where the brass plays, so horn players appear only on those bars. Drum events (kick, snare) drive camera hits in the engine.

**Dialogue.** If the song stops for spoken scenes, build a film-time copy of the audio, beat map and word times once the scenes are placed, and use that one clock from here on. Keep the grid through the breaks: each spoken scene lasts a whole number of bars, so the music drops back in on the beat. On Vuela (140 BPM), adding a few seconds of real TV news before the music grew the cold open by exactly one bar, and everything after it moved 1.71 seconds later.

Then make the timing proof: a plain video where each word lights up at its time over a beat counter. Render it with the `00_timing.js` chapter and send it to the producer.

```bash
cd engine && VIDEO_PROJECT=mysong ../.venv/bin/python render.py video 0:<song length> --ch 00 --w 1280 \
  --out ../mysong/media/render/timing-proof.mp4
```

**Gate.** The producer watches it with headphones and says the timing is right. After that the grid and the word times are frozen. Every cut and every lyric will sit on them, so a later change here moves the whole film. On Queso the whole analysis took eleven minutes (98 BPM, 420 sung words) and the proof took four minutes of the producer's time.

## 2. Concept and design language

Write `PRODUCTION.md`. It holds the premise in three sentences, the producer's direction in their own words, the rules, the cast and the world, and the design language. Let the model pitch and have the producer react.

The design language is one idea: **the lyric always lives on a surface that belongs to the world of the song.** Queso is about a boyfriend who counts his girlfriend's calories, so its chorus is a nutrition label, his lines are a calculator tape, the Italian asides are foreign-film subtitles, and the bridge is a telenovela with a breaking-news banner. Later films followed the same rule:

- READ ME: a code review. One character's lines are new lines of code, the other's are review comments, and the chorus is the request to merge.
- Juego: a trading screen and the text messages on her phone, both drawn in code so no image model ever has to render a letter. Where a real product appears, use real captures and key them in. The producer's word for a drawn imitation was "caricature".
- Vuela: two graphic systems fighting for the frame, a mission-control webcast with a launch clock and turbine meters, and hand-painted storefront signs.
- Tía Mari Juana: speech blocks for the neighbourhood gossip, a cassette insert, a recipe card, and a calavera literaria broadsheet, in a brush script the producer picked.

Pick surfaces from the song's own world, one per section, and let the chorus surface grow each time it returns.

Keep a banned list. Queso banned decorative shadows and gradients, emoji, lens flares, glitch effects and generic lower thirds. Quote the producer's rulings into the brief exactly as typed. "The constant visual stimulus is a must" (Vuela) shaped every graphic after it, and so did "i'm just hating these huge solid color shapes that obscure my beautiful characters and films". Type goes straight on the picture and nothing covers a face.

Set the tone in one line. If the song tells a joke with a straight face, the graphics present it like real information, the way a label or a news ticker would.

Pitch the concept to the producer in a few lines and wait. Queso's producer answered "yes go crazy with your concept, i love it", and that sentence went into the brief.

## 3. Cast and world

Before the storyboard, settle how every recurring person, place and prop will look, and write it down once. Left alone, a model rounds off a face, changes a jacket's colour, and turns a supporting character into somebody else. Phase 5 (`references/plates.md`) makes the sheets and the plates. This phase decides what goes on them.

**Casting test.** Make the same three or four scenes several ways (model, with and without reference images), lay them out as labelled sheets, and let the producer judge. On Queso, 8 jobs and 32 images settled it in ten minutes: a reference-held face gave stiff posed glamour ("extremely terrible"), text alone gave a lively stranger, and text plus two reference images won ("these are much much better lol"). If the producer has no frontal face close-up of a lead, make one from the portrait and have it approved.

**The look frame.** The look comes from images, not adjectives. Show the producer a sheet of look candidates and keep the one they pick as a reference crop with no person in it. On Tía Mari Juana the producer chose a painterly, flat-planes, candlelit frame ("the first one looks best"), and that crop went to every plate. A section's colour change has to be painted into that section's stills, because a prompt alone does not move the palette. The producer's note was "make sure the whole film isn't locked in to purely green and red tones". Midjourney is the tool for exploring looks. Character plates come from the image models in `plates.md`.

**Identity text.** Each character gets a fixed paragraph describing face, hair, build and clothes, pasted word for word into every prompt. Read it the way a model will, because it takes every word literally. On Queso "long loose strands across her face" put hair over her eyes in 27 stills, and "like a microphone" put a real microphone in three of four pictures. Write what the body does and what the object is.

**Character bible.** One file per character and place, so the next film starts with it already written. Include the identity text, the props in order of importance, the default expression (the tía "laughs a lot": "most of the others looked too sad"), what must never happen, and the producer's rulings in their words. Plan a ten-view face sheet (front, three-quarter, profiles, back, expressions) and a four-view outfit sheet for each recurring character, each reference with a role line such as "identity only, never shown as a frame". Every view of a character shares identical details; the producer's note on one set was "there's consistency issues in all of these turnarounds". Describe a large ensemble in words (costume, paint) rather than with a sheet each.

**Set design.** Sets that changed from shot to shot drew the producer's loudest complaint on two films. On Juego: "it seems to be configured differently in almost every shot". On Tía Mari Juana: "you need to do some set design and specifications for the different sets because they're literally changing in every shot". The method that worked:

- Draw a top-down floor plan with labelled camera positions, and write the geometry in words: where the stage, the altar, the gate and the door are, and what each camera sees.
- Plan an empty master set view, then one view per camera derived from it. Places stay empty, because a person in a place reference becomes a second copy of that person.
- Specify recurring set dressing once, and make one canonical image for anything shown inside the world, such as a framed photo.
- Write down staging rules that stop a model's habits. "Never singer, then crowd, then band in depth" came from a round of plates that put a DJ in nearly every frame.

**Write the QC checklist now**, from the bible and the plans: geography, who may appear in which shot, props, staging, and the producer's rulings. It is what a reviewer checks every plate against in phase 5.

**Gate.** The producer approves the look frame, the cast and the sets.

## 4. Storyboard

The storyboard is the shot list, kept as data. Write it as a script that outputs `shots.json`, a readable `STORYBOARD.md` and the plate job records. `examples/queso/storyboard.py` is the pattern; its Midjourney batch output is the part specific to that film. Give each plate job a revision counter so a re-shoot keeps the record of jobs already sent.

Each shot has these fields:

- an id, the bars or beats it covers, and the lyric line
- shot size and camera: a named set view, or none for a macro detail
- the exact cast and only the props that shot needs (never infer cast from prose, and never add a blanket prop to every shot)
- the state of the world: time of day, who is where
- the clip kind: singing (`lip`), moving to the music (`groove`), effect or transition (`fx`, `morph`), or a silent insert
- whether people move in it (if they do, the clip gets the song as an audio reference)
- the picture, in one sentence, as an action
- the lyric surface and the graphics that land on its beats
- how it exits: a cut, or a dissolve through smoke or an object

Rules that held up:

- **Every shot is a video clip.** Plan no stills. A shot that cuts between pictures gets one clip per picture. A clip that runs out and freezes counts as a still. On Queso 40 of 93 shots were first planned as stills with a slow zoom. "I want everything to be video" cost 46 more clips and about $85.
- **Cuts land on the one.** Shot boundaries are bar starts in the bar map, and the storyboard script should refuse any that are not. On READ ME the first cut started a shot at each lyric line, and only 21 of 74 cuts landed on a downbeat: "for such a fast track with such a dominant kick it's really distracting." Singers seldom start a line on the downbeat, so cut on the bar and let the line start inside the shot.
- **Let shots run.** About two bars is the minimum. "The eye barely gets a chance to take in the image" was the producer's note on a flurry of short cuts.
- **Size the shot count to the money.** One shot per lyric line is the upper end. Work the number out with `references/costs.md` and show the producer the sum. Resolution is decided shot by shot in phase 7.
- **Prefer close shots.** Tía Mari Juana's storyboard is 54 shots, 78% close-ups, with five master wides painted once. The producer's reason: "too many wide shots where there are a lot of little details for the AI to get wrong". Close-ups can then turn abstract through smoke and objects. Horn players appear only on bars where the brass plays: "can't be in the shot unless there's some brass action going on".
- **Choose singing shots sparingly.** Lip sync is the least reliable kind of clip, and phase 8 runs every one through a lip-sync model. Queso sings on camera in 8 of 93 shots, READ ME in 21 of 66, Juego in 2. Pick shots where the mouth is large in frame and the line is short.
- **Mouths move only when someone sings.** "Too many mouth movements when there's not any singing going on." Mark the shots where nobody sings, so the clip prompt says so.
- **Keep the action near the middle of the frame** if vertical versions will be cut later.
- **Write gags as physical actions.** The producer's own additions on Queso were all of this kind: she burps, she crosses her eyes, she gets doused in salsa.
- **Give each shot a camera move** by name (truck left, tilt up, snap zoom). A move between two frames needs both frames from one camera position, or the video model holds and then jumps.
- **Protect the opening.** The lead is in the first frame. If the producer wants an opening title, it appears in the first seconds.

Then let a second model attack the storyboard before anything is generated. A Codex review of Tía Mari Juana's shot list (`codex exec`, told to write a report and not to edit anything) caught lyric timing errors, two band members who could not stand side by side on that stage, and a missing state and props field. Run it again at the plate and clip gates.

Split the song into chapters at this point: one per section, with hard cuts on named beats. Queso has nine. The chapters are what you hand to parallel animators in phase 9 (`references/chapters.md`).

**Gate.** The producer reads the storyboard and approves it.
