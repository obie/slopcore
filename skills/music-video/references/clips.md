# Clips

Phases 6 and 7. Seedance 2.5 through the Higgsfield API turns each plate into four to eight seconds of video. This is where the money goes.

## Three kinds of clip

| Kind | Mode | Inputs | Use |
|---|---|---|---|
| `lips` | reference-to-video | the plate as `@Image1`, a clean vocal holding only the sung words as `@Audio1` | She sings on camera |
| `motion` | reference-to-video | the plate as `@Image1`, the song from the clip's start as `@Audio1` | Action that should land on the beat, nobody sings |
| `insert` | image-to-video | the plate as the exact first frame, silent | Objects, hands, reactions, and anything where the first frame must match the plate |

`insert` is the cheapest to get right, because the clip starts on a picture you already approved. Use it whenever a shot does not need the song.

## The prompt book

All prompts live in one file, `PROMPTS.md`, written by hand in one context so the characters and the place read the same in every clip. `tools/clips.py` parses it. A block looks like this:

````
### W03 · s003 · 4 s · 1080p
- kind: lips
- plate: sing-slice
- t0: 7.768
- lines: 2
- story: the thesis of the song, sung straight to the lens: this is not fat, it is cheese.
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "No es grasa, es queso".
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: {HER} holds a pizza slice by its crust in her bare hand beside her face, strings of melted cheese hanging from it. She is on a date with a man who counts her calories, and she tells the camera, delighted with herself, that this is not fat, it is cheese.
0.0–0.85 s: her laugh settles into a closed-mouth grin; she opens her eyes and looks straight into the lens.
0.85–1.09 s ("No es"): she sings the first two words to the lens, clearly, eyebrows up.
1.09–1.58 s ("grasa"): she shakes her head once on the word, her mouth forming it fully.
1.58–2.36 s ("es queso"): she tips her head toward the slice and sings "queso" with a wide open smile, holding the last vowel.
2.36–4.0 s: mouth closed again, she takes a big bite of the slice, cheese stretching from her teeth, her eyes still on the lens.
Her face stays large in the frame and turned to the camera the whole time; her mouth is never hidden by her hand, the slice or her hair. Handheld camera, very close and slightly tilted, holding steady on her face. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```
````

The shape of every prompt:

1. The place, who is in it, and what each of them wants.
2. Timed beats, each with an action and a reaction.
3. The camera, then the mouth rule.

Rules for writing them:

- **Times are seconds from the clip's first frame.** A word or beat at song time T sits at T minus the clip's `t0`. Write motion beats as "On each beat (0.61, 1.22, 1.84 s): she pumps the flexed arm once".
- **Start each clip one beat before its shot.** A take that comes back late still covers the shot.
- **Identity is text.** Put the character and place descriptions in a `macros` block at the top of the book (`{HER}`, `{HIM}`, `{ROOM}`, `{END}`) so every prompt carries the same words. `{END}` on Queso was "One continuous shot, no cuts. No text, letters or logos."
- **Say her hair stays off her face** in the character macro.
- **Only the singer sings.** Say so in every `lips` prompt, and say nobody sings in the others.
- **Hands-only and food-only plates stay that way.** End those prompts with "No people, hands or faces enter the frame."
- **No brand names.**
- **Give the shot a reason.** Say what she wants in the scene: "She is sending a kiss to the man who has been counting her calories, and she means it as a tease." A list of movements alone gives flat acting.

`examples/queso/PROMPTS.md` has all 101 prompts.

## Resolution and length

- 1080p for faces held 2.4 seconds or longer.
- 720p for short cuts and objects.
- Four seconds covers most shots. The longest on Queso was eight.

## Running them

```bash
.venv/bin/python tools/clips.py mysong apply                         # PROMPTS.md -> shots/<clip>.json
.venv/bin/python tools/clips.py mysong submit W03 --max-usd <ceiling> --dry-run
.venv/bin/python tools/clips.py mysong submit W03 --max-usd <ceiling>
.venv/bin/python tools/clips.py mysong collect W03                   # waits, downloads, frames, sheet, sync check
.venv/bin/python tools/clips.py mysong preview W03                   # cut against the song for review
.venv/bin/python tools/clips.py mysong edl                           # write the edit list the engine reads
```

`--max-usd` is a hard ceiling for the whole project, checked against the ledger before every submit. The ledger counts list-price estimates. Set `HF_DISCOUNT` so its totals match what the account is really charged.

**Pilot first.** Send three clips, one of each kind, and show them to the producer. Then a second pilot of five from the finished prompt book. Only after that ask for a go on the main run, with the number of clips, the seconds and the cost in the same sentence. On Queso that sentence was "46 clips, 219 seconds, about $154".

**Batches of about ten.** After each batch, read a frame sheet of every clip before sending the next. Look for hair on her face, hands, lettering, a changed face, and the action that was supposed to happen. A fault that shows up in one batch is usually in the prompt macro and will be in the next batch as well.

**Check where the action lands.** A take can do the right thing at the wrong moment. One Queso take slammed a pepper mill, lifted it out of frame for a second, and slammed it again. The cut used the second slam by pinning an offset into the take (`pin.lag` in the clip's JSON file) so the hit came just after the cut.

**Frame sheets are not playback.** Say so when you report. The producer watching in motion with sound will catch things a sheet cannot show.

## The safety filter

Some pictures are refused whatever the words say. Refused takes are not charged.

- If a prompt could be read as suggestive, reword it plainly and try once more.
- If a silent clip from the exact picture is refused too, the picture is the trigger. Make a new plate with a different pose. On Queso a blown-kiss close-up was refused three times, and a new plate with the waiters applauding behind her passed.
- Low-cut close-ups and mouths near food are the usual causes.

## When the video model cannot perform it

Seedance moves what is in the plate. It struggles to invent a new expression. If two takes miss the same thing, stop paying for takes and change the plate: edit the expression in with `imgedit.py region`, then run an `insert` clip from the new plate.

## Money

- Tell the producer the cost before each send.
- Check the balance before a large run, and ask them to add funds while they are still awake.
- Read the billing page at the end and report the total it shows.
