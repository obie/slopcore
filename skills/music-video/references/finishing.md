# Finishing

Phase 9. The rough cut is approved and every shot is video. What remains decides how the video looks in a feed and whether it survives being reposted.

## The first frame

Feeds show frame one before anyone presses play. A black frame or a title on black wastes it.

Open on the lead. On Queso the film opens with one beat of the cover shot playing as video, the title beside her face, then cuts on the beat to where the story starts. The footage is borrowed from a shot later in the film:

```js
// examples/queso/engine/ch/01_aperitivo.js
const T_OPEN = B(1), POSTER = SHOT.edit('s092');
if (t < T_OPEN) SHOT.draw(ctx, 's001', t, { clip: POSTER.clip, in: 0, warp: null });
```

Some platforms pick their own thumbnail from the middle of the video. Tell the producer to check the preview in the composer and set it by hand if it is wrong.

## Title and credits

- Put the title on screen in the first seconds. Keep it clear of the first chorus hook if the hook is a visual gag, so the title does not step on it.
- Ask the producer for the exact wording of every credit. Do not guess the language or the phrasing. Queso's producer wanted a Spanish presenting line at the start ("Obie Fernandez presenta") and an English credit at the end ("Original lyrics and produced by").
- Set credits as small tracked capitals next to the artist's name. They should be readable on a phone, so 34 px or larger on the 1080p frame.
- An end card that lands on the last bar gives a credit only a second or two. Offer a held slate after the last note if the producer wants it readable for longer.

## Watermark

Reposts strip the caption and the account name. A mark inside the picture is the only credit that travels with a clip.

- Keep it faint and small: about 28 px, half transparent, with a thin dark edge so it holds on light and dark footage.
- Put it at the bottom centre. A repost cropped to a square or a vertical keeps the middle columns of the frame.
- Name the platform as well as the handle ("X: @name"), so it means something on another platform.
- Draw it as its own layer (`99_marca.js` in the example) and render the master twice, with and without. Check it against every surface that uses the bottom edge. On Queso it moved to the top for five seconds while a news ticker ran along the bottom.

## Audio

The video is timed to the mix you analysed. A new master has to line up with it to the sample, or every cut and lyric shifts.

1. Check alignment before swapping: cross-correlate the new file against the old one in several windows. The lag must be zero.
2. Keep the old file under another name and put the new one at `media/audio/song.wav`.
3. The picture does not need rendering again. Render once with `--no-audio` and attach the audio:

```bash
ffmpeg -i video.mp4 -i song.wav -map 0:v -map 1:a -c:v copy -c:a aac_at -b:a 320k -shortest -movflags +faststart master.mp4
```

Loudness and peaks, measured on Queso:

- The scratch mix was -16.1 LUFS, which is quiet next to the roughly -14 that YouTube plays at. Ask for a proper master.
- A master with a -0.2 dB ceiling went over full scale once compressed: +1.9 dB with ffmpeg's own AAC encoder and +0.3 dB with Apple's (`aac_at`, macOS only).
- Ask for a limiter ceiling of -1 dB with true-peak mode on. That master measured -10.2 LUFS and stayed at -0.5 dB after encoding.

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
- Keep the type off her face. Look at the result and move it until it is clear.
- The picture the producer chooses for the cover is a good candidate for the first frame of the video.

## Release order

If the song may get reposted widely, the producer should register it with their distributor before the video goes out, so the recording is claimed under their name. That needs the cover and the audio master, which is why both are finished before posting.

## Posting

For videos of this kind on X, the posts that travelled share a shape: one or two casual lines that tell how it was made, the tools named in plain words, the video attached, and the details in a reply (prompts, counts, cost).

Hold to what is true. If the producer wrote the song and directed every shot, the post says so. Report the billed cost from the provider's billing page.

Leave out "repost and I'll send you the files". Platforms demote that kind of ask, direct messages are capped per day, and this genre spreads by sharing openly.

## Vertical versions

A 16:9 master does not crop well to vertical once type is on it. Plan vertical cut-downs as their own layouts: 15 to 30 second sections with the graphics re-set for the tall frame. Keeping the action near the centre of every plate makes this possible later.
