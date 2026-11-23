# Clips

Phases 6 and 7. Seedance 2.5 turns each plate into four to ten seconds of video. This is where the money goes. It runs through Sume (`tools/sume.py`) at about half of Higgsfield's list price, or through Higgsfield (`tools/clips.py`, `tools/hfapi.py`).

## Draft first, finalize what is approved

Seedance 2.5 has a 480p draft mode. Every exploratory take is a draft, the producer reviews and cuts at draft quality, and only approved shots are re-rendered at 1080p. A finalize call re-renders the same scene from the draft's job id, so prompt, references and duration carry over.

| Seedance 2.5 on Sume | per second | 4 s clip |
|---|---|---|
| 480p draft | $0.1028 | $0.41 |
| 720p | $0.2312 | $0.92 |
| 1080p | $0.5686 | $2.27 |

Tía Mari Juana rendered every pass at 1080p: three full passes of 49 clips plus re-rolls, about $400. The producer: "i thought this was supposed to be cheaper than higgsfield! in future projects I think I want to investigate a workflow where we use less expensive video resolutions and then upscale later once the storyboard is finalized". The price per second was fine. The volume of iteration at full resolution was the cost.

Keep each draft's job id in the clip's record. For clips that are not Seedance (Kling, for example), `topaz-video` upscales to 1080p for $0.04 a second.

## Three kinds of clip

| Kind | Mode | Inputs | Use |
|---|---|---|---|
| `lips` | reference-to-video | the plate as `@Image1`, the vocal for that line as `@Audio1` | Someone sings or speaks; a lip-sync model finishes it (`lipsync.md`) |
| `motion` | reference-to-video | the plate as `@Image1`, the song from the clip's start as `@Audio1`; where vocals play and nobody on screen sings, the instrumental instead, plus "nobody sings, talks or mouths words" | People moving who should land on the beat |
| `insert` | image-to-video | the plate as the exact first frame, silent; with `- last: PLATE` a second plate as the exact last frame | Empty sets, objects, smoke; a move between two controlled frames, such as a tilt from the floor up to a face |

Rules behind the table:

- **Anyone moving gets the music.** Silent image-to-video invents its own tempo, so strums, steps and mouths land off the beat. The producer on the first silent band clips: "nothing that has people moving can be done without the music, it looks cheap and terrible".
- **Anyone not singing gets the instrumental.** With the full song as the reference the model mouths the words. Producer: "too many mouth movements when there's not any singing going on". On the instrumental version one clip went from mouthing to a closed smile that opens into a laugh.
- **Sume does not take a first frame together with audio references.** In reference mode the plate guides the look and is not locked as frame 1. Only `insert` starts on the exact plate.
- **Kling takes no audio.** Use it only where nobody moves.
- **Sound on when someone speaks or sings.** Vuela's talking shots generated without audio came back with mouths that barely moved. Mux the real song over every clip afterwards.
- **Start each clip one beat before its shot,** so a take that comes back late still covers the cut.

## The prompt book

All prompts live in one file, `PROMPTS.md`, written in one context so the characters and the place read the same in every clip. `tools/clips.py` parses it. A block looks like this:

````
### W03 · s003 · 4 s · 1080p
- kind: lips
- plate: sing-slice
- t0: 7.768
- lines: 2
- story: the thesis of the song, sung straight to the lens: this is not fat, it is cheese.
```
MOVING CAMERA SHOT: handheld, arcing from her left side round to the front, very close on her face.
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: {HER} holds a pizza slice by its crust beside her face, strings of melted cheese hanging from it. She is on a date with a man who counts her calories, and she tells the camera, delighted with herself, that this is not fat, it is cheese.
She sings @Audio1 to the lens, every word in time: "No es grasa, es queso".
0.0–0.85 s: her laugh settles into a grin; she looks straight into the lens.
0.85–1.09 s ("No es"): she sings the first two words, eyebrows up.
1.09–1.58 s ("grasa"): she shakes her head once on the word, her mouth forming it fully.
1.58–2.36 s ("es queso"): she tips her head toward the slice and holds the last vowel with a wide open smile.
2.36–4.0 s: mouth closed, she takes a big bite, cheese stretching from her teeth, her eyes still on the lens.
Her mouth is never hidden by her hand, the slice or her hair. Only she sings. {END}
```
````

`{END}` expands to "One continuous shot, no cuts. No text, letters or logos." The Queso book in `examples/queso/PROMPTS.md` has all 101 prompts. It predates the camera rule below, so copy its structure and not its camera lines.

The shape of every prompt: the camera move, the place and who is in it, what each of them does and wants, timed beats, then the mouth rule.

- **Lead with what the subject does,** with constant secondary motion (hair, fabric, jewellery, smoke, petals) and engagement: a glance to the lens, a grin, a wink. Tía Mari Juana's first batch came back near-frozen. The producer: "so little movement in the frames that this might as well be a slideshow", "a kind of lame ken burns effect slow pan/zooms with no actual life in the subjects". The prompts had said "faces, hair, costumes stay exactly as in @Image1" and "very slow push".
- **The camera is never static and never a slow zoom.** Give every shot a specific move: an orbit, a gliding track, a crane rising or settling, handheld sway on the groove. Open with "MOVING CAMERA SHOT: ..." because Seedance in reference mode underplays a move placed at the end.
- **Identity is one short line.** Put character and place text in a `macros` block at the top of the book (`{HER}`, `{HIM}`, `{ROOM}`, `{END}`) so every prompt carries the same words. Never write "stay exactly". Say her hair stays off her face in the character macro.
- **At most three musical anchors** per motion clip. Times are seconds from the clip's first frame: a beat at song time T sits at T minus the clip's `t0`. Lip-sync clips quote words with their times.
- **Pitch the energy to the song.** The producer on a chill reggae track: "it's not anywhere near rocking until the choruses, and even then it's just a bit bopping". Dreamy verses, a relaxed bop in the choruses.
- **Give the shot a reason.** "She is sending a kiss to the man who has been counting her calories, and she means it as a tease" acts better than a list of movements.
- **Only the singer sings.** Say so in `lips` prompts and say nobody sings in the others.
- **Name only what is in the plate.** Asking for a wristwatch the plate lacks, or a flying shot from a road-level plate, fails. Fix the plate first.
- **No brand names. Hands-only and food-only plates** end with "No people, hands or faces enter the frame."

**Measure motion before showing a draft.** Fit a similarity transform to the optical flow between frames: the fit is the camera, the residual is the subject. On Tía Mari Juana the frozen drafts measured 0.3 to 0.9 px per frame; the short action prompts that worked measured 1.5 to 2.5. Flag a clip as static camera below 0.3 and dead subject below 0.6.

## Copying real choreography

For hands dressing a woman, the prompts alone gave four hands, waxy hands and garments growing out of the floor. The producer: "too sloppy", "too magical", "hands should pick her up if needed and literally help her into her clothes not paint them on her". What worked:

- Pass the real clip as a video reference (`--vref`, `@Video1`), trimmed past anything you do not want copied. Seedance copies the hand choreography.
- Start her in a base outfit every look can really go over (tank and bike shorts). "Dress over a tee" forced impossible morphs.
- Three physical steps per 23 s clip, about two bars each, then a twirl on the last bar.
- Spell out the reactions: a laugh and kicking feet when lifted, a giggle at a tugged waistband.
- Say "exactly two hands" and "nothing appears or morphs".

## Running them

```bash
.venv/bin/python tools/sume.py video clips/W03-d1.mp4 seedance-2.5 "$(cat W03.txt)" --ref plates/W03.jpg --aref audio/W03.wav --draft --dur 4 --dry
.venv/bin/python tools/sume.py video clips/W03.mp4 seedance-2.5 --draft-job <job id from the draft's record>
```

Drop `--dry` to send. `--dry` prints the request body and sends nothing. For Higgsfield, `tools/clips.py mysong apply | submit | collect | preview | edl` reads `PROMPTS.md` directly; `submit --max-usd <ceiling>` is a hard ceiling checked against the ledger. The ledger counts list prices, so set `HF_DISCOUNT` to what the account is really charged.

**Pilot first.** Three drafts, one of each kind, shown to the producer. Then a second pilot of five from the finished book. Only then ask for a go on the main run, with the number of clips, the seconds and the cost in one sentence. On Queso: "46 clips, 219 seconds, about $154". Vuela's whole 720p first draft, thrown away, was part of the $810 it cost at Higgsfield list.

**Batches of about ten.** Read a frame sheet of every clip before the next batch. Look for hair on faces, hands, lettering, a changed face, and the action that was supposed to happen. A fault in one batch is usually in the macro and will repeat. Frame sheets are not playback, so say so when you report.

**Check where the action lands.** One Queso take slammed a pepper mill, lifted it out of frame for a second, and slammed it again. The cut used the second slam by pinning an offset into the take so the hit came just after the cut.

## Fixing a clip

- **Add a missing element** with Runway's Aleph: give it the shot and a corrected still. Vuela's bocho was missing its jet engines; Aleph repainted them in, and the same trick added wiring and gauges to five cockpit shots.
- **Expression the model cannot invent:** if two takes miss the same thing, edit the plate with `imgedit.py region` and run an `insert` from it.
- **Remove an object** (a stray twig, smoke): neither Sume edit is reliable. Seedance's video edit re-copied the clip unchanged. Gemini Omni Flash 1.1 ($0.15 a second at 1080p, $1.20 for 8 s) looked clean in spot-check frames and the producer still saw the twig in playback. Scan every frame where the object appears, not three or four samples. Prefer a video edit to per-frame image edits, which flicker.
- **Flash frames and replays** are an edit problem. Slip or trim, and find them by printing frame-to-frame differences around the reported time.

## The safety filter

Refused takes are not charged. Refusals look nondeterministic, so retry once unchanged before rewording.

- If a prompt could read as suggestive, reword it plainly.
- If a silent clip from the exact picture is refused too, the picture is the trigger. On Queso a blown-kiss close-up was refused three times, and a new plate with waiters applauding behind her passed.
- Low-cut close-ups, mouths near food, and smoke or inhaling gestures are the usual causes.

## Money

- Tell the producer the cost before each send, and for each pass.
- Sume's API cannot report a balance; read it on the website before a large run. Higgsfield: Queso's balance hit zero at 11:14 at night with thirteen clips waiting eleven hours. Ask the producer to top up while they are awake.
- A Sume job cannot be cancelled once generation has started, and it bills anyway. Warn the producer before stopping anything.
- Read the billing page at the end and report the total it shows.
