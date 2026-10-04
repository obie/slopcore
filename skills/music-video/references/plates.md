# Plates

Phase 5. A plate is the still each clip is made from. The video model keeps what the plate shows, so every fault in a plate is in the clip too. Fix plates before paying for video.

## Generating

The route that worked on Queso, for any shot with the lead in it:

```
<picture> <identity text> <world sentence> <look sentence>, no text, no letters, no logos
--ar 16:9 --v 8.2 --raw --hd --edit <portrait url> <face close-up url>
```

- `--edit` with the two reference links goes in as typed text in the Midjourney web prompt bar.
- Shots without a character take no references.
- Leave personal style profiles off. They pulled the pictures back toward smooth glamour.
- Keep the prompt under about 800 characters before the parameters.
- Plates come out at 2944 x 1648.

The identity text is a fixed block per character, reused word for word. The world sentence is one description of the place and the light. On Queso it was an old red-sauce trattoria at night under direct camera flash. Say in the identity text that her hair is pulled back and her face is clear of hair.

Driving Midjourney:

```bash
node tools/cdp.mjs serve &                             # one connection to Chrome, left running
node tools/mj.mjs submit mysong/mj/batch-01.json       # types each prompt, about 9 s apart
node tools/mj.mjs recover mysong/mj/batch-01.json      # pairs job ids from a fresh feed load
node tools/mj.mjs collect mysong/mj/batch-01.json mysong/mj/batch-01
.venv/bin/python tools/sheets.py mysong/mj/batch-01.json mysong/mj/batch-01 mysong/mj/sheets/b01
```

Chrome throttles timers in a hidden tab, so a script that waits on the live feed stalls after five minutes. `mj.mjs` treats a prompt as sent when the input box empties and pairs job ids afterwards by prompt text. Midjourney's image host refuses plain downloads, so `collect` fetches through the browser.

## Picking

Each job returns four images. Read the contact sheets, record one pick per shot in `picks.json`, and copy them into place with `tools/pick.py`.

Two kinds of fault need different answers:

- **The prompt caused it.** All four images share the fault. Reword and send a second batch. Examples from Queso: "like a microphone" produced a real microphone, "tomato sauce on her lips" produced a red ball on her mouth, and "she feeds him a breadstick" appeared where the shot needed a wagging finger. The fix is to describe the body literally: "index finger raised and wagging in a firm no".
- **One image has it.** Pick another of the four.

## Checking at full size

Contact sheets catch gross errors and hide the rest. Before anything goes to the producer, look at every pick at full size for:

- hands and fingers
- teeth and eyes
- hair across the face
- stray lettering and logos
- a face that has drifted from the references
- props nobody asked for

This is a good job for four parallel agents, each with a slice of the plates and that checklist. They report and you decide. When a checker questions a plate the producer has already approved, the producer's word stands.

## Fixing

Fix through an edit model or through the prompt. Never hand-paint.

```bash
.venv/bin/python tools/imgedit.py region IN.jpg OUT.jpg x,y,w,h "what this region should show"
```

`region` crops the area, gives the model only the crop enlarged to about 2,000 px, and pastes the result back with a feathered edge. Everything outside the region stays pixel-identical. It writes a before-and-after image beside the output, and you should open it every time.

- Whole-frame edits did not fix hands. Region edits did.
- OpenAI's filter refused close crops of bare skin. Add `--model google/gemini-3-pro-image` for those.
- Use it for expressions as well as defects. Crossed eyes, a clean mouth, a wink: put them in the plate so the video model only has to move what is already there.
- Keep the original. Save a replaced plate under a second name (`kiss-sauce.jpg`) before overwriting.

Some flaws will not come out. Write those into `PLATES.md` with their position so the animators crop or cover them.

## The review rounds

Build the board and serve it:

```bash
.venv/bin/python tools/board.py mysong serve 8765
```

The producer clicks through every plate at full size, flags with F and types a note. Notes save to `notes.json`. Fix what they flagged, mark the changed plates as new, and send them back. Queso took three rounds and ended with "checked, all good to go".

What this producer rejected, in order of frequency: hands ("fingerslop", "slop hands"), accidental nudity, plates that looked like stock photos, props he had not asked for, a face that was not hers. He also used the comment box to direct: "in the video she should cross her eyes", "make her into the virgin mary or guadalupe hahah go wild".

When the producer rejects a plate, replace it with your best candidate at once, so the next thing they see has it fixed. Mention that alternatives exist. Asking them to choose first while the bad plate stays in the cut reads as the fix not being done.

**Gate.** The producer signs off the plates. Until then, video spending stays at the pilot.
