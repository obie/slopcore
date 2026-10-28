# Lip sync

Phase 8. Every singing or talking shot goes through a lip-sync model. Seedance does not copy the vocal you give it. It sings or says the line again in its own timing, and the mouth follows that new performance. A take can look great and still be half a second off your song.

## Why a model, and not retiming

Queso retimed Seedance takes so each word ended where it ends in the song. The producer typed "perfect lip sync". READ ME pushed the same method across 21 singing shots, and the automatic warp won on only 4 of the 21 clips that could be measured. Vuela added spoken dialogue, and there the method failed in public. Every check passed. The producer posted the film and five of six comments said the lip sync was off, and the film came down.

The checks compared the soundtrack Seedance made up against the real recording. They never looked at the lips. A mouth tracker only said how wide a mouth opened, which cannot show whether the lips shape the right words.

The fix was a lip-sync model that redraws the mouth. Vuela's 20 talking and singing shots went through Sync's lipsync-2-pro on fal for $6.62, and the producer called the result "much better". Tía Mari Juana picked **sync-lipsync-3** on Sume from a bake-off against kling-lipsync and latentsync. It costs $0.13 a second ($0.52 for a four-second shot), keeps the source resolution, and works on painted faces. It costs less than one retake.

## 1. Generate the shot so it can be synced

- Reference-to-video with the plate as `@Image1` and that line's vocal as `@Audio1`, sound on. The result gives rough singing and the right body motion. The lip-sync model supplies the mouth.
- Write the words into the prompt with their times, in whole-second segments: `0-3s: she sings "…"`. Write silence as silence: `3-4s: @Audio1 is silent; her mouth is closed and still`. Vuela's dialogue prompts quoted the exact Spanish line ("saying exactly: ...") and that fixed off-script lips.
- Silence the reference before the first word. A breath on the stem opened a mouth two seconds early.
- Say "Her face is clearly visible in the frame whenever she sings."
- Seedance still fails on some material. It could not lip-sync Vuela's sped-up chorus (M18, M20, M11 partial). The lip-sync pass fixed those shots.
- Where a shot is wide or singing keeps failing, make it a groove shot: the instrumental as audio and a mouth block saying she "does not sing, speak or mouth any words". Writing "smile" draws a toothy grin through the silences, so write "laughing" with a timed beat for each laugh.

What makes a singing shot work:

- Her mouth is large in the frame and nothing crosses it: no hand, no food, no hair.
- The line is short. One lyric line per clip.
- The plate has her mouth in a natural position for the first syllable.
- The shot ends on an action after the last word (a wink, a blown kiss, a grin), so the cut has something to land on.
- Choose singing shots where the mouth is large in frame (`analysis-and-storyboard.md`).

## 2. Build the voice track for each shot

The model draws the mouth from the audio it is given, so the audio must hold only what this face says or sings.

- **One singer per track.** Build a word-gated vocal for each singer from the word timings: silent except while that character sings a word, with a few tens of milliseconds of lead and tail. Mouths then close in the gaps. A loudness gate on the demucs vocal is useless because the stem bleeds everywhere.
- **Held notes:** gating word by word closed a mouth during a held "a-do-ra-ba". For a shouted or held phrase, keep the gate open from the first word to the end of the window.
- **A character who mouths only one phrase** of a line they do not sing gets a track gated to that phrase.
- **Quiet phrases** under a hand near the mouth need a stronger drive. Raise the level, about 9 dB on one shot.
- **Dialogue:** cut the dialogue stem to the lines that belong to this shot, with 20 ms ramps at the edges, so nobody mouths an off-screen line.
- **Pin singer attribution by line start time.** Never align lyric lines to the vocal map by order. On Tía Mari Juana it drifted, fed Saindra a silent track, and her lip sync "completely disappeared". Before calling a shot synced, check that its gated track has energy in every lip-sync window.
- **Chorus rules come from the producer.** There, both sang "Mi tía Mari" and one man sang the rest, which no map could have guessed. Keep it in a per-word roles file.

## 3. Run it

Cut the clip exactly as it plays in the film: retimed, graded, no graphics. Trim it to whole seconds and cut the audio to the same length.

```bash
.venv/bin/python tools/sume.py video lips/N08.mp4 sync-lipsync-3 "" --video src/N08.mp4 --audio-url src/N08-voice.wav
```

- **Only finalized clips.** The model keeps the source resolution, so a draft would give a draft-quality result. Regrading or retiming a shot invalidates its lip-sync file; make it again.
- **Lay the real song back over** the result and discard the model's audio.
- Sume returns a poster image as a second artifact. The client saves it as `*-1.mp4`; move it aside.
- Have the cut play the lip-sync file in place of the raw clip. Keep the unsynced clip, so a bad result can be redone for cents.

**Two faces in one frame.** The model drives one face. Sync each half of the frame on its own singer's track, then join the halves with a feathered seam. Vuela's shot of six boys singing was left unsynced for the same reason.

## 4. Check it

By eye, with the song playing. Frame sheets cannot show lips. The producer rejects: a mouth open before the vocal starts, a mouth closing while a note is held, and stuttering from retiming. And on Tía Mari Juana: "if you keep singing when the vocals stop in the song that's no good".

One audit helps the eye: track mouth open and close cycles with face landmarks in the windows where nobody sings.

## The retime method, as a fallback

`clips.py` still measures and retimes. Use it to estimate how late a take is, or when no lip-sync model is available.

- `clips.py mysong collect` and `clips.py mysong sync` transcribe each take's own soundtrack with Whisper and report the median offset of word ends against the song. A 40 ms word like "es" measures 0.2 to 0.4 seconds late in every take, so judge by the long words.
- `clips.py mysong preview W03 --warp` writes knots at the end of each sung word of 0.15 seconds or more, and plays the take faster or slower between them. A speed below 0.6 or above 1.7 is dropped, since that much stretch shows.
- A warp whose clip times run past the take's length freezes the mouth. On Vuela that left a "Volé" on a frozen frame. Check warps after every retake.
- Pinning a take while a `collect` for the same clip is still waiting lets the collect overwrite the pin. Wait, or pin again and re-run `edl`.
- This method checks the soundtrack Seedance invented. Treat a pass as a timing estimate and never as proof the lips are right.
