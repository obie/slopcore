# Queso: a worked example

"Queso" is a 3:49 lyric music video for the virtual artist Saindra. The picture is generated footage (Midjourney plates and Seedance clips), and every lyric and graphic is drawn in code on top, on the beat. This folder holds the paperwork and the code from that project, scrubbed of private details, so you can see what a finished production looked like on paper.

## What is here, in reading order

1. `PRODUCTION.md`: the production brief. Format, credits, watermark, how a render is run.
2. `DESIGN.md`: the look and the rules every chapter follows.
3. `LYRICS.md`: the lyrics.
4. `STORYBOARD.md`: the shot-by-shot plan against the song's timeline. `storyboard.py` is the script that holds the same plan as data and builds the board.
5. `PROMPTS.md`: the prompt book. Every Midjourney and Seedance prompt, with the shared character blocks and the clip timing notes.
6. `PLATES.md`: how the plates were made and chosen.
7. `bible/LEAD.md`: the lead character's reference sheet and the rules for keeping her face consistent.
8. `NOTES.md`: working notes, including licences of tools used.
9. `engine/common.js` and `engine/ch/`: the chapter code. One file per section of the song (`01_aperitivo.js` through `09_cierre.js`), plus a timing overlay (`00_timing.js`), a watermark (`99_marca.js`), a benchmark (`_bench.js`) and the shared kit (`_kit.js`). `engine/fonts/` has the fonts with their licence files.
10. Data the code reads: `shots.json` (shot list with prompts), `edl.json` (edit decision list), `picks.json` (chosen takes), `align_overrides.json` (hand corrections to word timing), `media/audio/words.json` (word timings) and `media/audio/beatmap.json` (beat grid).
11. `cover/queso-cover-pull.jpg`: the chosen cover.
12. `stills/`: eight frames from the finished video, at 0.0, 9.6, 16.6, 44.0, 124.0, 163.5, 195.3 and 228.6 seconds.

## What is deliberately absent

The audio (song, stems, references), the video, the plate images, the generated clips and the reference images of her face. The song and the footage are the artist's releases, so they are not republished here. The owner's private review comments, per-clip request records and generated engine assets are also left out.

## Running the chapter code

The chapter code runs with the engine in `skills/music-video/toolkit/engine` once a project has its own media: audio, plates and clips placed where the engine expects them. Without those files the code will not render, but it reads as a complete example of how chapters are written.

Placeholders in the text mark scrubbed values: `<reference-image-url>`, `<your-profile>` (a Midjourney profile code) and `<job-id>`.
