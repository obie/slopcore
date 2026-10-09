# Queso — production brief

The binding brief for everyone who works on this video. Read it in full before touching anything.

## The video

A 3:49 lyric music video for **"Queso"** by **Saindra**, a virtual artist produced by Obie Fernandez. Date night at a red-sauce trattoria. Her boyfriend counts her calories. She counts pepperonis. By the last chorus he is gone and the pizza is still there.

The picture is generated footage: Midjourney stills ("plates") and Seedance clips made from them. Every lyric and every graphic is drawn in code on top, on the beat, by the engine in `engine`. Master: 1920×1080, 24 fps, for X and YouTube. Vertical cut-downs for TikTok and Instagram come later as their own layouts.

## Obie's direction, in his words

- On the goal: "i want to make something in the same slopcore vein but with my original music and lyrics". No retro, no Windows XP, no tech memes.
- On the concept pitched to him (the trattoria, the nutrition label, the counters, the subtitles, the telenovela banner): "yes go crazy with your concept, i love it".
- On the storyboard: "i'm happy with the storyboard".
- On the look, judging casting sheets: the pure v8.2 frames of her biting and pulling cheese were "really good and quite funny haha"; the frames with her reference attached were "much much better lol". The stiff glamour version was "extremely terrible".
- On the timing data: "i checkt the timing-proof video and it's perfect". The beat grid and word times are final.
- On the unsung Italian asides that were on the lyric sheet: "don't worry about the unsung asides". They are not in the video.
- On stills, after the chapter 1 draft (2026-10-04): "that chapter demo has a lot of frames that are just like slowly zooming in or out and not actually animated like real video ... that's not what I want. I want everything to be video." Every shot is a Seedance clip. A plate under a camera move is a placeholder while its clip renders, never the finished shot.

## Rules

1. **Lyric gate.** Every sung word is on screen at its time, 40 px or taller on the 1080p frame. `render.py lyrics` must print N/N. The engine's gate threshold is 36 px; aim for 40 so a phone can read it.
2. **On the beat.** Cuts land on kicks (`BEAT.t(n)`). Type lands on its word's `t0`. Camera moves start or end on beats. The grid is uniform at 98 BPM; bars are not (see `media/audio/beatmap.json`), so never assume `n % 4`.
3. **Pure functions of time.** No state between frames. `render.py check` must print HISTORY-INDEPENDENT.
4. **Funny first.** The song is a joke told with a straight face. The graphics explain the joke and never wink at it. Verse 2 is a string of double entendres: the picture stays strictly on food and the type stays elegant.
5. **Clean.** Native colour on the footage: no grade, grain, glitch, halftone or vignette added in code. Graphics are flat and sharp.
6. **No lettering in footage.** Plates and clips carry no text. If a plate shows stray lettering, cover or crop it.
7. **She is the star.** Type may tuck behind her (mattes) and must never cover her face.
8. **Spanish typography.** Opening marks (¿ ¡), accents and ñ are set correctly. Quoted speech in the lyric uses “ ”.

## Cast and world

`bible/LEAD.md` holds the canon. In short: Saindra in a black patent halter and choker, hair in a messy bun; the boyfriend in a pale blue polo with a calculator, sparkling water and a salad; three old waiters in white jackets; a tiny grandmother in pearls; a moustached pizzaiolo. One trattoria, at night, shot with direct flash.

## Design language

The lyric always lives on a surface that belongs to the world of the song.

| Where | Lyric surface |
|---|---|
| Every chorus | **The nutrition label.** A black-on-white "Información Nutricional" panel with thick rules. "Grasa" is struck out and QUESO slams in. "Culpa 0%". "Progreso" is a loading bar. The label grows more glorious each chorus: plain, then full-frame, then gold, then an altarpiece. |
| "Tú contando calorías / Yo contando pepperonis" | **Two counters.** His: cold blue computer-vision tags that put a kcal number on everything he looks at, with a racing seven-segment total. Hers: a warm tracking box on every pepperoni and a climbing count. |
| Italian asides | **Film subtitles.** Yellow italic serif with a thin black edge, bottom centre, as if this were a foreign film. |
| Verse 1 | Small world surfaces: his calculator's paper tape, speech quotes in two colours (his cold, hers warm), a place card, a menu with dotted leaders. |
| Pre-chorus | **A versus chart.** TÚ against YO, built row by row. |
| Verse 2 | **Perfume-advert italic serif**, slow, letter by letter. Opens on a rating card: CLASIFICACIÓN G, GASTRONÓMICO. The fast half switches to tall condensed caps, one line per cut. |
| Bridge | **Telenovela.** Soap-opera title script, crash zooms, a breaking-news banner (ÚLTIMA HORA), an episode card. It ends on a relationship-status toggle: "En una relación" flips to "Soltera, con pizza". |
| Breakdown | **Commandments.** One line per cut, full-frame condensed caps, white on tomato red. |
| Outro | Small, centred, quiet. The label assembles one last time. End card: QUESO, then Saindra. |

**Palette:** tomato red, mozzarella white, cheese yellow as the accent, basil green used rarely, patent black. His graphics are a cold pale blue. Exact values and the type scale are in `DESIGN.md`.

**Banned:** drop shadows as decoration, gradients as decoration, emoji, lens flares, glitch effects, generic lower thirds, anything that looks like a retro operating system.

## Lip sync

Seedance re-voices the vocal it is given in its own timing, and the mouth follows that soundtrack. So each singing take is measured: its soundtrack is transcribed with word times and compared with the song (`tools/clips.py queso sync`). Then:

1. Several takes are made and the best-measured one is pinned (`pin.take` in `shots/<clip>.json`).
2. The pinned take is **retimed**: knots at the end of each sung word map song time to take time, so every word ends where it ends in the song (`pin.warp`). Obie compared a retimed take with the raw one on 2026-10-04: "Yeah retimed one is better".
3. `tools/clips.py queso edl` writes `edl.json`, and the kit's `SHOT.draw` plays each clip through its `in` and `warp`.

Obie's verdicts so far: W03 take 5 "is perfect!!!! perfect lip sync". W81 take 1, retimed, is the Guadalupe shot.

## The data

| File | What |
|---|---|
| `LYRICS.md` | the lyric as sung |
| `media/audio/song.wav` | the song, 229.12 s. Since 2026-10-04 this is Obie's loud master (`audio/Saindra - Queso (Original Mix) 24-BIT MASTER.wav`, 44.1 kHz, -10.2 LUFS, limiter ceiling -1 dB), sample-aligned with the scratch mix the timing was made from (kept as `song-scratch-v1.wav`). A new master must pass the same alignment check before it replaces this file. The master video's audio is encoded with `aac_at` at 320k: ffmpeg's own AAC encoder overshoots a loud master by about 2 dB. |
| `media/audio/beatmap.json` | beat n at 0.4212 + n × 0.612241 s |
| `media/audio/words.json` | 93 lines, 420 sung words, each with start and end time |
| `storyboard.py` → `shots.json`, `STORYBOARD.md`, `storyboard.html` | 93 shots: time, lyric, picture, lyric surface, graphics, method |
| `picks.json`, `media/plates/<name>.jpg` | the picked still for every shot, 2944×1648 |
| `PROMPTS.md`, `shots/<clip>.json`, `media/clipframes/<clip>-tN/` | Seedance clips as they arrive |

## Credits and watermark

- Opening (`01_aperitivo.js`): the film opens cold on her. Up to beat 1 (1.03 s) the picture is the last cheese pull, the s092 clip from its first frame, which is the picture the cover is cut from; then it cuts to the empty plate. Obie: "she just has to show in the first frame".
- Opening title card (`titleCard`): "Obie Fernandez presenta", Saindra, QUESO, right of her face, from frame one to the cut at 0:03. Obie's wording.
- Cover (`cover/make_cover.py`): Obie picked A, `cover/queso-cover-pull.jpg`, 2000x2000.
- End card (`09_cierre.js`): QUESO, Saindra, "Original lyrics and produced by Obie Fernandez". English at the end is Obie's choice.
- Watermark (`99_marca.js`): "X: @obie", bottom centre, loaded only with `--ch ...,99`. `queso-master-1080p-watermark.mp4` has it; `queso-master-1080p.mp4` is the clean master.

## Vertical cuts (TikTok and Instagram)

Rendered with `render.py ... --size 1080x1920`. Each cut is its own chapter file whose scenes are `proof: true`, so it loads only when picked with `--ch`. The picture is a vertical slice of the 16:9 clips; the lyric surfaces are laid out again; type stays out of the top 220 px, the bottom 480 px and the right 150 px (`--ch vNN,v99` draws those zones). Handle in the picture: `@saindra_ofc`. Every cut ends on a four-beat card with the release line (14 de octubre). The lyric gate for a vertical cut runs at `--min-px 56`.

| File | Section | Song time | Output in `release/` |
|---|---|---|---|
| `v01_coro1.js` | chorus 1 | 7.77 to 30.42 s | `tiktok-queso-coro1-vertical.mp4` |
| `v05_repetimos.js` | verse 2, fast half and the asides | 103.89 to 122.87 s | `tiktok-queso-repetimos-vertical.mp4` |
| `v07_mandamientos.js` | breakdown | 172.46 to 186.54 s | `tiktok-queso-mandamientos-vertical.mp4` |
| `v08_santa.js` | final chorus | 184.09 to 206.75 s | `tiktok-queso-santa-vertical.mp4` |

Flash frames: Seedance sometimes renders the camera flash as one blown-out frame. F83b-t1 frame 18 was pure white and showed in the film at 3:09; it is now a blend of its neighbours (original kept in `media/scratch/flash-fix/`). `tools/flashscan.py queso` finds them: F12-t1 frame 3 and F33-t1 frames 11 and 79 have one too, all outside the part the film uses. Run it on new clips before a master render. The one-frame white flash on each commandment's verb in the breakdown is drawn by the chapter on purpose.

## Chapters

Nine chapter files in `engine/ch/`. Cuts between chapters are hard cuts on the beat named.

| File | Section | Beats | Seconds | Shots |
|---|---|---|---|---|
| `01_aperitivo.js` | intro, chorus 1 | 0–45 | 0.00–27.97 | s001–s010 |
| `02_cuentas.js` | Italian chorus, verse 1 | 45–89 | 27.97–54.91 | s011–s024 |
| `03_duelo.js` | pre-chorus, chorus 2 | 89–138 | 54.91–84.91 | s025–s036 |
| `04_gastronomico.js` | verse 2, slow half | 138–169 | 84.91–103.89 | s037–s044 |
| `05_repetimos.js` | verse 2, fast half, the scandalised asides | 169–196 | 103.89–120.42 | s045–s054 |
| `06_telenovela.js` | bridge | 196–248 | 120.42–152.26 | s055–s066 |
| `07_soltera.js` | chorus 3, breakdown | 248–300 | 152.26–184.09 | s067–s080 |
| `08_santa.js` | final chorus | 300–333 | 184.09–204.30 | s081–s088 |
| `09_cierre.js` | outro | 333–end | 204.30–229.12 | s089–s093 |

## File contracts

- An animator edits **only its own chapter file**. Other chapters are being written at the same time.
- Shared files are report-only for animators: the engine (`/engine`), `engine/common.js`, the kit, the tools, the data. A missing helper is written privately inside the chapter and reported.
- Scratch output goes under `media/scratch/<chapter>/`. Renders go under `media/render/`.
- Nothing is generated or bought by an animator. Midjourney and Seedance are run only by the lead session.

## Checks before any chapter is reported done

From `engine`, with `VIDEO_PROJECT=queso`:

1. `render.py lyrics A:B --ch NN` prints N/N.
2. `render.py check A:B --n 48 --ch NN` prints HISTORY-INDEPENDENT.
3. Contact sheets at every shot's first and last frame, every line's first and last word, and every cut. The author reads every sheet and fixes what looks wrong.
4. Full-size stills of the four best moments.
5. `render.py bench` under 150 ms per frame.
