# Finishing

Phases 10 and 11. The rough cut is approved and every shot is video. What remains decides how the video looks in a feed and whether it survives being reposted.

## The first frame

Feeds show frame one before anyone presses play. A black frame or a title on black wastes it. Never fade up from black at the head: a black first frame shows as a black thumbnail on many platforms. Open on picture.

Open on the lead. On Queso the film opens with one beat of the cover shot playing as video, the title beside her face, then cuts on the beat to where the story starts. The footage is borrowed from a shot later in the film:

```js
// examples/queso/engine/ch/01_aperitivo.js
const T_OPEN = B(1), POSTER = SHOT.edit('s092');
if (t < T_OPEN) SHOT.draw(ctx, 's001', t, { clip: POSTER.clip, in: 0, warp: null });
```

Juego took the other route: frame 1 is the full title card (presenting line, artist, title), taken from a later frame of the same master. Replace frame 1 rather than inserting a frame, so the length and the sync do not change, and re-encode at high quality with the audio copied.

YouTube picks its automatic thumbnail from the middle of the video, so the frame-one trick does nothing there. Upload a custom thumbnail. Some other platforms also pick from the middle. Tell the producer to check the preview in the composer and set it by hand if it is wrong.

## Title and credits

- Where the title goes is the producer's choice, so ask. Queso and Juego put it on screen in the first seconds, as described above. On later films the same producer kept the title and the credits for the end card, with nothing in the middle of the film. An opening title stays clear of the first chorus hook if the hook is a visual gag.
- Ask the producer for the exact wording of every credit. Do not guess the language or the phrasing. Queso's producer wanted a Spanish presenting line at the start ("Obie Fernandez presenta") and an English credit at the end ("Original lyrics and produced by").
- Set credits as small tracked capitals next to the artist's name, 34 px or larger on the 1080p frame so they read on a phone.
- Fade graphics in and out over about 0.25 s. Cards that pop on and off look cheap: "quick fade much better". Sung words may still land hard on their beat.
- Dissolve into the end card from the last frame over about 1 s. A cut to the end card was rejected.
- An end card that lands on the last bar gives a credit only a second or two. Offer a held slate after the last note if the producer wants it readable for longer.

## Watermark

Reposts strip the caption and the account name. A mark inside the picture is the only credit that travels with a clip.

- Keep it faint and small: about 28 px, half transparent, with a thin dark edge so it holds on light and dark footage.
- Put it at the bottom centre. A repost cropped to a square or a vertical keeps the middle columns.
- Name the platform as well as the handle ("X: @name").
- Draw it as its own layer (`99_marca.js` in the example) and render the master twice, with the mark and clean. TMJ shipped both. Check it against every surface that uses the bottom edge. On Queso it moved to the top for five seconds while a news ticker ran along the bottom.
- Vertical cuts decide their own handle. See `references/vertical-cuts.md`.

## Flash frames

Seedance sometimes renders a camera flash as a single blown-out frame. Queso's first upload went out with one pure white frame at 3:09. Scan every clip before the master render:

```bash
.venv/bin/python tools/flashscan.py mysong
```

It prints each frame that stands far above both of its neighbours and says whether the edit list puts that frame in the cut. On Queso it found four such frames among 12,018, one of them in the cut, and six clips that open on a bright frame ahead of their in-point. Repair a frame with `--fix CLIP:FRAME`, which averages its neighbours and keeps the original, then render again. The scan reads clip frames only, so a flash you draw on purpose in a chapter is left alone.

## Final assembly

Render the final in segments, never as one continuous encode.

- One video-only segment per scene, and one per gap between scenes. Every segment starts on a keyframe and uses identical encoder settings.
- Join the segments with stream copy (ffmpeg's concat demuxer with `-c copy`) and lay the audio over the join.
- A fix to one scene then re-renders that scene's segment only. The rest of the film is not encoded again, so it cannot change.
- Keep the list of segment ranges in one place, and have the assembly script render only the segments whose inputs changed.

Read the review feedback again at the moment you start a final render, even if you read it earlier in the session. Notes arrive while other work is running. Apply every note or flag it to the producer before rendering.

## Audio

The video is timed to the mix you analysed. A new master has to line up with it to the sample, or every cut and lyric shifts.

1. Check alignment before swapping: cross-correlate the new file against the old one in several windows. The lag must be zero. TMJ's master checked at 0 samples in all 12 windows, so the picture was not rendered again.
2. Keep the old file under another name and put the new one at `media/audio/song.wav`.
3. Render once with `--no-audio` and attach the audio:

```bash
ffmpeg -i video.mp4 -i song.wav -map 0:v -map 1:a -c:v copy -c:a aac_at -b:a 320k -shortest -movflags +faststart master.mp4
```

Loudness and peaks:

- Queso's scratch mix was -16.1 LUFS, quiet next to the roughly -14 YouTube plays at. Ask for a proper master.
- A master with a -0.2 dB ceiling went over full scale once compressed: +1.9 dB with ffmpeg's AAC encoder, +0.3 dB with Apple's (`aac_at`, macOS only).
- Ask for a limiter ceiling of -1 dB with true-peak mode on. Queso's measured -10.2 LUFS and stayed at -0.5 dB after encoding. TMJ's master is -9.9 LUFS at -0.9 dBTP.
- When you cut an excerpt for a short clip, put a limiter in the mux as well, and measure the result. One excerpt peaked at +1.8 dBFS on its first encode.

Measure with `ffmpeg -i file -af ebur128=peak=true -f null -`.

Distributors often want 16-bit files. Make one from the 24-bit master with dither:

```bash
ffmpeg -i master-24.wav -af "aresample=osf=s16:dither_method=triangular" -c:a pcm_s16le master-16.wav
```

## Cover art

```bash
.venv/bin/python tools/cover.py mysong <plate> --x0 500 --title QUESO --artist Saindra \
  --title-pos 1540,1690,320 --artist-pos 1470,1455,140
```

- 2000 x 2000 or larger, sRGB, JPG and PNG.
- Only the title and the artist name. Stores reject covers that carry handles, web addresses or extra credits.
- Offer three: the hook of the song in one picture, the funniest frame, and the cleanest one. Check each at thumbnail size.
- Keep the type off her face. The picture the producer chooses is a good candidate for the first frame.

## Before it spreads

- Register the song with the distributor before the video goes out, so the recording is claimed under the producer's name. That needs the cover and the audio master, so finish both first.
- Expect claims on covers and remixes. Vuela is a remix of a 1991 hit, and it belongs to its rights holders however the video is made.
- On YouTube, answer "Altered or synthetic content" yes for a film with realistic AI characters. Turn on the AI-generated label in the short-video apps.
- Make the description accurate. List what is generated and what is real footage, and the tools. Add chapters that follow the song's sections.

## Release order

Teasers first, then the film, then everything cut from it. For TMJ:

1. Teasers: four vertical sections of 14 to 48 seconds, one a day, each ending on the release card.
2. The full 16:9 video on YouTube, ahead of the streaming date because its theme, Día de Muertos, had a date of its own. The producer decided this over a plan to hold it.
3. The full vertical version for Reels and Shorts.
4. A TikTok cut of the hook that introduces the sound (25.7 s on TMJ). A sound posted before the distributor delivers is its own "original sound", so uses split between it and the official track once that exists. Decide with the producer which comes first.
5. A Spotify Canvas.
6. A pre-save link, set up by the producer, in the end card and the captions.

Pitch the track in Spotify for Artists at least a week before release. Payment and uploads are the producer's job.

### Spotify Canvas

A Canvas is a silent loop of 3 to 8 seconds, 1080 x 1920. Make it from a raw take, not from the master with lyrics on it.

- Candidates come only from takes approved in the edit list. Make four and show them in a review page with thumbs and notes.
- Crop 9:16 around the subject, scale to 1080 x 1920 at 24 fps, and crossfade the last 0.6 s into the first frames so the loop is seamless. The first frame of the loop should equal the last.
- ffmpeg's `xfade` needs a constant frame rate. Add `fps=24` after each `setpts=PTS-STARTPTS` in the trim branches.
- Rule out crops that are mostly a torso, shots with screen UI or lettering, and shots of someone else's character.
- The producer uploads it in Spotify for Artists (Music, the track, Canvas).

## Posting

For videos of this kind on X, the posts that travelled share a shape: one or two casual lines that tell how it was made, the tools named in plain words, the video attached, and the details in a reply (prompts, counts, cost).

Hold to what is true. If the producer wrote the song and directed every shot, the post says so. Report the billed cost from the provider's billing page.

Leave out "repost and I'll send you the files". Platforms demote that kind of ask, direct messages are capped per day, and this genre spreads by sharing openly.

When you show the producer a render, quit the video player first and wait for it to exit, or the stale file opens.
