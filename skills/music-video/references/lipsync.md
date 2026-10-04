# Lip sync

Seedance does not copy the vocal you give it. It sings the line again in its own timing, and the mouth follows that new soundtrack. A raw take is therefore late, early or drifting against the real song. The first Queso pilot was half a second late, and the producer said "it's not that good". The method below is what turned that into "perfect lip sync".

## 1. Give it a clean vocal

`tools/clips.py` cuts the reference audio for a `lips` clip from the vocal stem and mutes everything except the lines named in `lines:`. A full mix, or a vocal with words she does not sing on camera, gives a worse mouth.

## 2. Make several takes

Two or three per singing shot. Takes differ a lot, and the cost of an extra take is small next to a shot that looks wrong.

## 3. Measure each take

`clips.py collect` runs the sync check for you, and `clips.py sync` runs it again.

- Each take's own soundtrack is transcribed with Whisper, with word times.
- The end of each word in the take is compared with the end of the same word in the song.
- The lag is the median of those offsets. An estimate from the loudness envelope locked onto the wrong syllable, so the tool reports it and does not use it.
- You get a lag, the worst word, and the mean offset.

Very short words measure badly. A 40 ms "es" read 0.2 to 0.4 seconds late in every take, which says more about the measuring than about the mouth. Judge by the long words.

## 4. Pin the best take

Pick the take whose worst word is smallest after the lag is removed, then look at it. The measurement reads the soundtrack the model generated. The eye decides.

## 5. Retime it

```bash
.venv/bin/python tools/clips.py mysong preview W03 --warp
```

This writes knots at the end of each sung word that lasts 0.15 seconds or more. Each knot maps a moment in the song to a moment in the take. Between knots the take plays faster or slower so that every word ends where it ends in the song. Before the first knot and after the last it plays at normal speed. A knot that would need a speed below 0.6 or above 1.7 is dropped, since that much stretch shows.

The command writes `<clip>-retimed.mp4` beside the plain preview and stores the knots in the clip's `pin`. `clips.py edl` then passes them to the engine, which plays the take through the same map.

Show the producer the plain and the retimed version of the first singing shot side by side. Queso's producer chose the retimed one, and every singing shot after that was retimed as a matter of course.

## What makes a singing shot work

- Her mouth is large in the frame and nothing crosses it: no hand, no food, no hair. Say so in the prompt.
- The line is short. One lyric line per clip.
- The plate already has her mouth in a natural position for the first syllable.
- The beats in the prompt quote the words with their times: `0.85–1.09 s ("No es"): she sings the first two words to the lens`.
- The shot ends on an action after the last word (a wink, a blown kiss, a grin), so the cut has something to land on.

## What has not been tested

Queso's sung lines are short, rhythmic pop phrases. Long sustained notes, fast rap and whispered passages were not tried. Run the pilot on the hardest line of the song before planning more singing shots.

## Running a retake safely

`clips.py collect` holds the clip's record in memory while it waits. If you pin a take while a collect for the same clip is still waiting on another take, the collect overwrites your pin when it finishes. Either wait for it, or set the pin again afterwards and re-run `clips.py edl`.
