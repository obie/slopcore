# Plates

Phases 3 and 5. A plate is the still each clip is made from. The video model keeps what the plate shows, so every fault in a plate is in the clip too. Fix plates before paying for video.

Phase 3 makes the assets every plate is composed from: character sheets, face and outfit sheets, empty set views and the look frame. Phase 5 composes one plate per shot from them. Most plate faults come from a weak phase-3 asset, so spend the time there.

## Which model

- **Character plates: GPT Image 2.5.** It follows references and written instructions closely enough to hold a face across shots. Run it through Sume (`sume.py image OUT.png gpt-image-2.5 "prompt" --ref FILE ... --ar 16:9 --q high --res 2K`) or through OpenRouter (`imgedit.py make` and `edit`).
- **Midjourney: look exploration, and an optional beauty pass.** It gives composition and paint and no character consistency. On READ ME a strict full-size check passed 3 of the 60 Midjourney stills with people in them, and the producer wrote: "you should seriously consider using grok and gpt image 2.5 a lot more than midjourney. it's so so much better and accurate." On the painterly Tía Mari Juana, four GPT Image style frames got "all of these suck. you need to use midjourney". So pick the look in Midjourney and make the people in GPT Image.
- **Gemini image (`--model google/gemini-3-pro-image` in `imgedit.py`)** is the fallback when OpenAI's filter refuses.
- **Grok Imagine drifted** to a different, older woman from the same references. Last resort only.

Cost: about $0.06 a plate on Sume at high quality and 2K, about $0.10 on OpenRouter. READ ME's 57 re-shot stills cost about $21. Keep a running total. GPT Image 2.5 renders up to 3840 on the long edge (about 8.3 MP), so 3840x2160 plates need no upscaling. Upscalers made skin waxy, so serve plates at native size.

## Phase 3: cast and world assets

**Identity text.** One fixed paragraph per character, pasted word for word into every prompt. The model takes it literally. On Queso "long loose strands across her face" put hair over her eyes in 27 stills, "like a microphone" put a real microphone in three of four pictures, and "tomato sauce on her lips" drew a red ball on her mouth. Describe the body literally ("index finger raised and wagging in a firm no"), and say the face is clear of hair. Avoid similes. For a hybrid creature, describe the fusion part by part and add "one animal, never a cat with a bird stuck on". A "jaguar and hummingbird" prompt gave a cat with a beak, and the producer said it "looks more like the cat ate the bird than a hybrid mix".

**Character sheets.** Build a LOCK sheet for each recurring character from the producer's approved face: a face sheet with several views (front, three-quarter, profiles, expressions) and an outfit sheet with front, side and back views, cut below the chin. A band or crowd that always appears together gets one locked group image with its order stated left to right. An ambiguous group sheet produced a random band order on Tía Mari Juana. Put a face on the sheet that the producer chose. When the producer said "there she is!" about one portrait, it became reference number one from then on.

**Face references.** The first reference dominates: it stamps its angle, light and expression on every output. Use head crops, list the canon face first, and say "references for identity only; do not copy hair, makeup, angle, light or expression". A reference with hands at the face made every output copy that pose, so add "hands away from her face unless stated". Prefer finished plates the producer approved as references over earlier explorations.

**Set design first.** On Tía Mari Juana the second round of plates had sets that changed in every shot. The producer: "you need to do some set design and specifications for the different sets because they're literally changing in every shot". The method that worked in round 3:

1. Draw a top-down floor plan of each place in SVG, with labelled camera positions. In the prompt, the plan's role line says "layout only; never draw its text".
2. Generate one empty master set view, then derive each camera's view from the master and the plan ("same room, different camera").
3. Make a spec sheet for recurring dressing (an altar, a shopfront) and one canonical asset for any picture that appears inside the world, such as a framed photo. Attach it whenever it is in the shot.
4. Remove risky features from set views that tight shots crop into. A door beside the altar propagated into plates until the set view was fixed.
5. Place references must be empty. A person in a place reference becomes a second copy of that person.

State the geography in words as well, per camera: which wall is behind the singer, which side the gate is on, whether the stage is visible at all. If something is absent in a direction (no roof, no stage in the reverse view), say so.

**Look frame.** One approved frame with no person in it, used as a style anchor on every plate: "a colour and film-look reference only". Name the banned looks too (Disney or Pixar, glossy 3D, big-eyed cartoon, anime, photographic). Section colours must be painted into one look frame per section. Adjectives alone drifted dusk to orange. State the palette in words after the references and then restate any set colour it must not change ("the plaster wall stays weathered green"). A palette line that overrode the set turned a green wall blue or violet in most night shots.

**Shot list as data.** Phase 4 writes, for every shot: camera, size, the exact cast list, only the props that shot needs, and blocking relative to the camera. Compose from that list. Never infer cast from prose, and never add a prop to every shot. A blanket "producer's desk in every shot" rule produced a DJ in nearly every frame, and the staging went singer, then crowd, then band in depth. The producer: "think about some of the compositions like a movie director would... the boombox can just appear once".

## Phase 5: composing a plate

Compose each plate directly in GPT Image 2.5 from references, each with a role line:

```
Image 1: <character>: identity only, never shown as a frame; do not use its background or pose.
Image 2: BACKGROUND ONLY: <set view>. The camera is much closer than this view; do not reproduce its framing.
Image 3: the colour palette and light for this section. Not its content.
```

- **Order and count.** Cast sheets first. With 10 to 14 references the model averages the faces down to a clean generic cartoon, and the producer said "we lost the artistic beauty... what we have now is kinda just shitty cartoons". Send only the characters in frame and one set view.
- **Shot size first.** State the size at the start of the prompt. For MS, CU and ECU, demote the set view to background only: a set view as first reference pulled every frame wide. GPT Image ignores "CU" unless forced, so add a framing check line: "the face fills at least two thirds of the frame height; nothing below the collarbone".
- **Camera height.** Say where the camera is. Performers appeared at crowd level in stage close-ups until the prompt said "camera at stage level; her feet on the same stage as the band; crowd below, out of frame".
- **Nothing else alive in frame** whenever no creature is cast. GPT Image decorated night shots with winged jaguars.
- **Continuity references only from the same camera.** An A-camera plate fed to a C shot made the C plate come out A-like.
- **Tight stage shots** drop the stage set view and banner references, or the banner, instruments and other players creep in.
- **Cropping a wide plate** to a close shot with an edit pass rarely removes people baked into it. Compose the close shot fresh.

**Beauty pass (optional).** When GPT plates are correct and flat, restore the paint in three stages:
1. The GPT plate gives composition, sets and continuity.
2. Midjourney: the plate as an image prompt, the look frame as `--sref`, `--iw 2 --chaos 0 --hd`. This restores the rendering and roughly holds the layout. Identity drifts.
3. GPT identity touch-up with only the character sheets: "keep it EXACTLY as it is... change ONLY these identity details". Drive Midjourney with `mj.mjs` and `sheets.py` as described in `toolkit/README.md`, and copy picks with `pick.py`.

A style LoRA trained on one palette learned "warm and dark is the style" and turned day and neon shots orange. A local Lab colour transfer from the layout plate fixed that: low-frequency a and b from the layout, about 60 percent of its low-frequency L, Gaussian sigma near 3 percent of the width.

## Refusals

OpenAI's filter is nondeterministic. A refusal costs nothing.

1. Resubmit unchanged. A refusal on a plate whose reference showed a cigarette passed on the second try.
2. Crop references to head and neck. Uncropped references showing cleavage were refused.
3. Add "tasteful, modest neckline" to the prompt.
4. Remove filtered words: halter, slip dress, sheer, mini, corset, slit.
5. For close crops of bare skin, switch to the Gemini fallback.

## QC before the producer sees anything

Write a checklist file for the film and run every plate through it. The producer found defects in plates that had "passed", and the checklist's first line says each plate is guilty until proven clean. It holds:

- **Sources of truth in priority order:** the producer's notes, the shot list entry (cast, props, picture, state, palette), the floor plan and the camera's set view, the locked group images, the character sheets.
- **Geography:** stage position, wall colours, which side doors and gates are on from each camera, no roof or no stage where there is none.
- **Cast:** only the listed people identifiable; no extras that look like named characters; each named character matches face, hair, wardrobe and signature props; banned props never appear.
- **State:** time of day, crowd density, who is where, matching the previous and next shots.
- **Anatomy:** count fingers, limbs, merged bodies, extra people, a mic stand passing through a body, an instrument in the wrong hands.
- **Style:** only flaws that would survive a later pass (Pixar faces, 3D gloss, stray text).

Verdicts are PASS, FIX (a targeted edit pass) or REDO (the composition is wrong and the prompt must change).

**Two independent reviewers.** The producer asked for an adversarial review of every frame. On Tía Mari Juana 6 Claude agents and 6 `codex exec` batches each covered all 59 plates against the checklist, with crops. They agreed on 44 of 59 and only 3 plates passed. The author's own earlier QC had passed most of them. Trace repeated defects to a root cause (a bad set view, an ambiguous sheet, a reference order) and fix that first. Close stdin for Codex (`< /dev/null`) or it hangs. Run the same review on the shot list before any plate is made; Codex caught lyric timing errors and band members who were not adjacent on stage.

Check every plate at full size too. Contact sheets catch gross errors and hide the rest: hands and fingers, teeth and eyes, hair across the face, stray lettering, a face drifted from the references, props nobody asked for. Split the plates among parallel agents. They report, you decide. When a checker questions a plate the producer approved, the producer's word stands.

## Fixing

Fix through an edit model or the prompt. Never hand-paint.

```bash
.venv/bin/python tools/imgedit.py region IN.jpg OUT.jpg x,y,w,h "what this region should show"
```

`region` crops the area, gives the model the crop enlarged to about 2,000 px, and pastes the result back with a feathered edge. Everything outside stays pixel-identical. It writes a before-and-after image beside the output. Open it every time.

- Whole-frame edits did not fix hands on Queso. Crop-and-paste did. The same method fixes an eye, a sleeve or a mouth.
- Put expressions in the plate as well as defects. Queso's crossed eyes took three video takes at $3.20 each and produced blank white eyeballs. The edit cost six cents and the next take worked first time. If two takes miss the same thing, change the still.
- **A fix pass names the exact defects, says what must stay unchanged and who is who.** Fix passes can swap identities: "no other woman in a teal blouse" turned a background aunt into a second copy of the lead, and "replace the altar photo" pasted the photo onto a street wall.
- **Keep the before image** (`kiss-sauce.jpg` beside the new plate, or `*-before.png`) and **look at every fix result.** A failed download once left a plate renamed and empty; restore from the before file and rerun.
- Some flaws will not come out. Write them into `PLATES.md` with their position so the animators crop or cover them.

## The review rounds

Build the board and serve it (`board.py mysong serve 8765`). Every review page the producer sees has a thumbs up, a thumbs down and a note box on each image, and the feedback is stored where you can read it back: `notes.json` locally, or an artifact database for a published page. Read it before the next generation round instead of asking for verdicts in chat.

- **Notes autosave.** One producer lost about a dozen notes to a Save button and said "make the goddam comment inputs save automatically". Save 700 ms after typing stops and on blur, include the textarea's current value in every vote write, and never overwrite a field that is focused or has unsaved text.
- **Zoom in the page.** Linking an image to its published file blocks in a new tab. Use a lightbox: click to zoom, arrow keys to step, Esc to close.

Fix what they flagged, mark the changed plates as new, and send them back. Queso took three rounds and ended with "checked, all good to go".

What this producer rejected, in order of frequency: hands ("fingerslop", "slop hands"), accidental nudity, plates that looked like stock photos, props nobody had asked for, a face that was not hers, and on later films sets that changed between shots. He also uses the comment box to direct: "in the video she should cross her eyes", "make her into the virgin mary or guadalupe hahah go wild".

When the producer rejects a plate, replace it with your best candidate at once, so the next thing they see has it fixed. Mention that alternatives exist. Asking them to choose first while the bad plate stays in the cut reads as the fix not being done.

**Gate.** The producer signs off the plates. Until then, video spending stays at the pilot.
