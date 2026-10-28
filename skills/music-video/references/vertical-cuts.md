# Vertical cuts

After the master is signed off. TikTok and Reels play 1080 x 1920, and a 16:9 film with type on it does not crop to that. Queso first tried the 16:9 picture as a strip between bars, and the lyrics came out too small to read on a phone.

A vertical cut is a section of the song laid out again for the tall frame. The footage is the film's own clips with the same in-points and retimes, so the lip sync carries over and nothing new is generated. Queso's four cuts added nothing to the Seedance bill.

Three kinds of cut come from one film:

- **Teasers**, 14 to 48 seconds on TMJ, each a section that stands alone and ends on a card. They go out before the film.
- **The full vertical version**, the whole film in the tall frame (TMJ: 3:28), for Reels and Shorts.
- **The sound cut**, the hook and nothing else, which introduces the song on TikTok (TMJ: 25.7 s, from the hook to the end of its line).

Never put 16:9 footage inside a tall window, such as a card or a frame within the frame. The producer rejected it on TMJ: "doesn't frame the content properly", and sliding the crop per shot did not save it. Footage fills the frame, and graphics sit on it or beside it.

## Pick the sections

- Take sections that stand alone, such as a chorus or a breakdown. Queso cut chorus 1, the fast half of verse 2, the breakdown and the final chorus, at 14 to 23 seconds each. TMJ's teasers start and end on the film's own cuts.
- Start on a beat and end on one. Add four beats at the end for a card.
- Build one cut and show it. Once the producer approves it, the others follow it as the pattern and can go to parallel animators, one file each.

## The tall canvas

Every `render.py` command takes `--size`. The engine's `W` and `H` follow it, and so does everything that lays out from them.

```bash
cd engine && export VIDEO_PROJECT=mysong
python render.py video 7.77:30.42 --size 1080x1920 --ch v01 --out ../mysong/release/chorus1-vertical.mp4
```

## One proof chapter per cut

Each cut is its own chapter file, named `vNN_name.js` after the 16:9 chapter it lays out again. `examples/queso/engine/ch/v01_coro1.js` is the pattern.

- Register every scene with `proof: true`. A proof scene exists only when its chapter is picked with `--ch`, so a film render never loads it.
- Return at the top of the file when the frame is landscape, and throw if the file was picked that way.
- Take every picture through the kit's shot helpers, which read `edl.json`. The cut then plays the takes the producer approved.
- Prove the film is untouched. Render the same stills of the 16:9 film before and after adding the file, and compare the files.

## Safe zones

The apps lay their own interface over the top 220 px, the bottom 480 px and the right 150 px of the frame. Type and anything pinned to the picture stay inside the rectangle that is left. Footage runs underneath.

`v99_zonas.js` tints those areas and outlines the rest. Load it beside the cut for check sheets and leave it out of the finished render:

```bash
python render.py sheet 7.77:30.42:16 --cols 8 --w 360 --size 1080x1920 --ch v01,v99 --out ../mysong/media/scratch/vertical/zones.jpg
```

## Framing

A 16:9 clip scaled to fill the tall frame shows a slice 31.6% of its width: 608 px of a 1920 px picture, scaled up to 1080 x 1920. TMJ framed its cuts this way. Each shot is a 608 px slice centred on its subject. The centre comes from a face map, the median position of the largest face in the shot, and a per-shot override fixes the shots where the map is wrong, such as a painted photo with no real face.

- Each shot names the point of the picture that sits in the middle of the frame, as a function of time. Move it where the action moves. In Queso's two-shot the slice starts on her and whips across to him, landing on the beat where the word lands beside his frown.
- Some pictures need more than one slice. A face in extreme close-up is taller than the safe rectangle, and a wide shot keeps its subjects at both edges. Split the frame on a seam: one part holds the subject at a wider crop, the other holds a detail of the same clip, and the lyric surface sits on the detail.
- Camera punches and shakes from the film keep their beats.
- Graphics pinned to the picture go through the shot's placement, as in the film, so a tracking box stays on its pepperoni.

## Lyric surfaces

Lay each surface out again for the tall frame. Scaling the 16:9 layout down is what made the strip between bars unreadable.

- Keep the surface the film uses for that section, so the cut looks like the film.
- Put it where the slice leaves room: in the lower band of the safe rectangle under a face, beside a face, or on the lower part of a split.
- Raise the lyric gate. A phone shows the tall frame edge to edge, and Queso's cuts pass at 56 px:

```bash
python render.py lyrics 7.77:27.97 --size 1080x1920 --min-px 56 --ch v01
```

## Title, handle and end card

- **No title lockup.** Queso's cuts carried a small lockup of the artist and title at the top of the safe rectangle. On TMJ the producer found it cheap and had it removed. Do not add one unless asked.
- **Ask which handle goes in the picture.** Queso's 16:9 master carries the producer's X handle and its vertical cuts carried the artist's own, set faintly. TMJ's verticals carry none.
- **End on a card four beats long** with the title, the artist and the release line ("6 de noviembre · en todas las plataformas" on TMJ; Queso's read "14 de octubre, en todas las plataformas"). Ask for the wording.
- **Make the card big.** It spans the safe width and sits in the lower third of the frame. The producer sent this note after the card had been centred twice: "I said to put the big end card in the lower third."
- **Lay it over the film's next shot**, not a held last frame, and let it land on that shot's cut when the cut falls within a beat and a half, so it never covers a face mid-shot. Fade it in over about a second.
- **Fade the lyric type** in and out over about 0.25 s, like the 16:9 master.

## Placing type

Type avoids faces. Give each surface a few candidate places (the lower band of the safe rectangle, the top, the middle), compare each against the face boxes for the time it is on screen, and take the one that covers the least. TMJ's notes that name a recipe or a skull sit top left at about 0.85 scale, because in close-ups the bottom of the frame is all mouths. Keep a 60 px margin on the left as well as the zones above.

## Before a cut is reported done

```bash
python render.py lyrics A:B --size 1080x1920 --min-px 56 --ch vNN       # N/N
python render.py check A:B --n 48 --size 1080x1920 --ch vNN             # HISTORY-INDEPENDENT
python render.py sheet <times> --size 1080x1920 --ch vNN,v99 --out zones.jpg
```

Read every sheet with the zones drawn. Then compare the 16:9 film with its earlier stills. Frames only show the layout, so say that the cut was checked on frames and ask the producer to watch it in motion with sound.

Use the real audio master for every cut, fade the last 1.2 seconds, and measure the peaks after encoding (Queso's cuts peak at -0.5 to -0.7 dBFS).

**Gate.** The producer watches each cut on a phone.

A Spotify Canvas is a vertical loop of a raw take, and `references/finishing.md` has its method.
