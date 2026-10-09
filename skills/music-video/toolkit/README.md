# Music video toolkit

Scripts for making a music video from a song: beat grid and word timings, Midjourney stills, Seedance clips through
the Higgsfield API, image fixes, subject mattes, review pages, and a canvas renderer for lyrics and graphics.

## Layout

- `tools/` command-line scripts. Each one finds the workspace root as the parent of `tools/`, which is this folder.
- `engine/` the renderer: `render.py`, `index.html`, `src/*.js`, `fonts/` (SIL OFL, licences in `fonts/`) and `ANIMATION_GUIDE.md`.
- `requirements.txt`, `.env.example`.

A project is a folder under the workspace root. Most tools take it as the first argument; `engine/render.py` reads it
from the `VIDEO_PROJECT` environment variable. Paths below are relative to the project.

## System requirements

- Python 3.11 with the packages in `requirements.txt`. `mlx-whisper` needs Apple Silicon; `matte.py` uses the MPS device when present and the CPU otherwise.
- `ffmpeg` and `ffprobe` (`clips.py`, `hfapi.py`, `publish.sh`, `engine/render.py`).
- ImageMagick with the `magick` command (`clips.py`, `imgedit.py`, `sheets.py`).
- Node.js with the built-in `WebSocket` (Node 22 or later) for `cdp.mjs` and `mj.mjs`.
- Google Chrome with remote debugging enabled, signed in to Midjourney and Higgsfield, for `cdp.mjs` and `mj.mjs`. `cdp.mjs` reads the port from Chrome's `DevToolsActivePort` file (macOS location by default; set `CHROME_DEVTOOLS_PORT_FILE` to change it).
- Playwright with its Chromium build (`playwright install chromium`) for `engine/render.py`.
- The `demucs` command, to produce the stems the analysis tools read.
- Accounts and keys: see `.env.example`.

## Project layout the tools expect

```
<project>/LYRICS.md                      lyric sheet (align.py)
<project>/PROMPTS.md                     Seedance prompt book (clips.py)
<project>/shots.json, picks.json         storyboard and picked plates (board.py, review.py, pick.py, clips.py)
<project>/media/audio/song.wav
<project>/media/audio/stems_raw/htdemucs/song/{vocals,drums,bass,other}.wav
<project>/media/audio/{whisper,words,beatmap}.json
<project>/media/plates/<plate>.jpg
<project>/media/clips/, clipframes/, render/pilot/
<project>/mj/                            Midjourney downloads
```

## tools/

### beatgrid.py

`beatgrid.py <project>`: measures the song's beat grid on the drum stem and writes `media/audio/beatmap.json`. The beat
is the kick. A constant-tempo grid (beat n at t0 + n * period) is fitted to low-band onsets of the drum stem, then
checked for drift by fitting the first and second halves separately. The downbeat phase is the one where harmonic
change (bass + other) and section energy steps are strongest.

### transcribe.py

`transcribe.py <project> [lang]`: Whisper large-v3 on the vocal stem, with word times. Writes `media/audio/whisper.json`
and prints one line per segment. Without `lang` Whisper detects the language. The environment variable
`WHISPER_PROMPT` supplies an optional initial prompt (names and unusual words from the lyric).

### align.py

`align.py <project>`: a start and end time for every sung word of the lyric sheet, on the vocal stem.

1. Parses `LYRICS.md` into sections, stanzas (blank-line groups) and lines. (Parenthesised) lines are asides; {braced} lines are on the sheet but not in the recording and get no times.
2. Anchors each stanza in time by matching its words to Whisper's transcript (`media/audio/whisper.json`).
3. Force-aligns each stanza as one piece inside its anchored window with torchaudio's multilingual MMS_FA model.

Writes `media/audio/words.json` and prints one row per line; rows marked `?` need a listen.

### cdp.mjs

A small client for the running Chrome (remote debugging on 127.0.0.1). No dependencies.

```
cdp.mjs serve                      hold one connection open and serve commands on a unix socket (one Chrome prompt)
cdp.mjs targets [filter]           list page targets whose url or title matches filter (default: Midjourney, Higgsfield, ChatGPT/OpenAI)
cdp.mjs open <url> [contextId]     open a tab (in the given browser context = Chrome profile); prints targetId
cdp.mjs nav <targetId> <url>       navigate a tab and wait for load
cdp.mjs eval <targetId> <js>       evaluate an expression (awaits promises), print the JSON result
cdp.mjs evalfile <targetId> <file> the same, reading the expression from a file
cdp.mjs shot <targetId> <png>      screenshot the viewport
cdp.mjs close <targetId>           close a tab this tool opened
cdp.mjs raw <targetId|-> <Method> [jsonParams]
```

### mj.mjs

Midjourney through the signed-in Chrome, via `cdp.mjs serve`, which must be running.

```
mj.mjs submit <batch.json> [--gap 9]           type each unsent prompt into the create page and press Enter; a prompt counts as sent when the box empties, then job ids are paired
mj.mjs recover <batch.json>                    reload the feed, scroll it, and give every sent job without an id the id of the feed row whose prompt text matches
mj.mjs collect <batch.json> <outdir> [--png]   save each finished job's four images as <name>-1..4.jpeg (or .png)
mj.mjs status <batch.json>
```

A batch is `{"name": "...", "jobs": [{"name": "a1", "prompt": "... --ar 16:9 --v 8.2", "job_id": null}]}`. Chrome
throttles timers in a tab that has been hidden for five minutes, so nothing here waits on the live feed; ids come
from a fresh page load, paired by prompt text.

### sheets.py

`sheets.py <batch.json> <image dir> <out prefix> [--rows 6] [--w 480]`: contact sheets for picking plates. One row per
Midjourney job, its four images left to right, each tile labelled `<job> #n`. Writes `<out prefix>-01.jpg`, `-02.jpg`, ...
with `--rows` jobs per sheet, and prints which job is on which sheet.

### pick.py

`pick.py <project>`: copies each picked Midjourney image to `media/plates/<plate>.jpg`, where the engine and `clips.py`
read it. Picks are in `<project>/picks.json` (`{plate: image number}`); a plate's batch folder comes from `shots.json`.
Prints the plates that have no pick or whose picked image is missing.

### imgedit.py

Plate fixes and text-bearing images through an image model on OpenRouter. Needs `OPENROUTER_API_KEY` (and
`RECRAFT_API_KEY` for `inpaint`).

```
imgedit.py edit IN OUT "instruction" [--ref IMG ...] [--model ID] [--size 2944x1648]
imgedit.py make OUT "description" [--ref IMG ...] [--model ID] [--size 2944x1648]
imgedit.py region IN OUT x,y,w,h "instruction" [--ref IMG ...] [--feather 48]
imgedit.py inpaint IN OUT x,y,w,h "what the masked area should show" [--feather 48]
imgedit.py merge ORIG EDIT OUT [--thresh 28] [--grow 40] [--box x,y,w,h ...]
```

`edit` edits IN; a fixed clause says everything else must stay. `make` generates a new image, for pictures that need
correct lettering. `region` crops that region of IN, enlarges it to about 2048 px for the model, and pastes the result
back with a feathered edge; it also writes `OUT.zoom.jpg` (before and after). `inpaint` uses Recraft V3: the whole
picture is sent with a white mask over the region and only that region is pasted back. `merge` resizes EDIT to ORIG's
size, matches its colour, finds where the two differ and pastes only that region into ORIG; it writes `OUT` and
`OUT.mask.jpg`. `--model google/gemini-3-pro-image` is the fallback when OpenAI's safety filter refuses a close crop of skin.

### matte.py

`matte.py <command> <project>`: subject mattes (white = people in front, black = background) so type can sit behind them.

```
matte.py plates <project> [NAME ...] [--force]   media/plates/NAME.matte.png for every plate lacking one, 1472 px wide
matte.py clip <project> CLIP [...] [--force]     media/clipframes/CLIP/matte/fNNNNN.png for every frame, 960 px wide, temporally smoothed
matte.py catchup <project>                       everything missing: plates, then every clip folder
matte.py sheet <project> <out.jpg> [NAME ...]    contact sheet of plates, outside the matte dimmed and tinted red
Options: --model REPO (default ZhengPeng7/BiRefNet; also ZhengPeng7/BiRefNet_HR, run at 2048 px)
         --size N (network input size, default 1024; 2048 for an _HR model)   --cols N (sheet columns, default 5)
```

Model: BiRefNet through `transformers` with `trust_remote_code`. A clip is skipped when it has as many mattes as
frames. Each matte is blended with its neighbours (1-2-1 weights) to calm flicker.

### hfapi.py

Client for Higgsfield's pay-per-generation API (Seedance 2.5). Every submit costs money. Key: `HF_KEY=<id>:<secret>`
in `<workspace root>/.env`, or `HF_API_KEY_ID` and `HF_API_KEY_SECRET`. The key is never printed.

```
hfapi.py selftest                      check the local cost formula against the published $/s (offline)
hfapi.py auth                          confirm the key works (free)
hfapi.py upload FILE [...]             upload, print the public URL; cached by SHA-256 in <project>/shots/uploads.json
hfapi.py estimate --res 720p --dur 5 [--ar 16:9] [--video-in SECONDS] [--no-api]
hfapi.py submit --project DIR --clip ID --mode ref|i2v|t2v --prompt-file TXT --dur N --res 720p --max-usd X
        [--ar 16:9] [--image F ...] [--audio F ...] [--video F ...] [--first-frame F] [--last-frame F]
        [--no-audio] [--bitrate standard|high] [--format mp4|mov] [--video-secs S ...] [--again] [--dry-run]
hfapi.py status REQUEST_ID
hfapi.py wait REQUEST_ID [--timeout 900]
hfapi.py download REQUEST_ID OUT.mp4
hfapi.py cancel REQUEST_ID
hfapi.py ledger --project DIR
```

`submit` uploads inputs, checks the ledger and the estimate against `--max-usd`, submits with an Idempotency-Key and
appends a line to `<project>/shots/ledger-hf.jsonl`. `--dry-run` prints the body and estimate and sends nothing.
`status`, `wait`, `cancel` and `download` take an optional `--project DIR` (default: the workspace root) where terminal
states are written to the ledger. Statuses: queued, in_progress, completed, failed, nsfw, canceled; failed, nsfw and
canceled-while-queued are documented as not charged.

### clips.py

`clips.py <project> <command>`: Seedance clips from the prompt book (`<project>/PROMPTS.md`), through `hfapi.py`.

```
apply                          parse PROMPTS.md into shots/<clip>.json (takes already made are kept)
audio CLIP [...]               cut each clip's reference audio into media/audio/refs/<clip>.wav
submit CLIP [...] --max-usd X [--dry-run] [--again]
collect [CLIP ...]             wait for pending takes, download to media/clips/<clip>/take-N.mp4, extract 24 fps frames, write a contact sheet, run the sync check
sync CLIP [...]                re-run the sync check on the latest take
preview CLIP [...] [--warp]    cut the latest (or pinned) take against the song, lag removed, to media/render/pilot/<clip>.mp4; --warp retimes lips clips word by word
edl                            write <project>/edl.json from each clip's pinned or latest finished take
status                         one line per clip
```

A block in `PROMPTS.md`:

```
### W01 · s003 · 4 s · 1080p
- kind: lips            (lips | motion | insert)
- plate: sing-slice
- t0: 8.30              (song time of the clip's first frame)
- lines: 2              (lips only: lyric line numbers sung on camera; other words are muted)
- story: one sentence
```
followed by a fenced block holding the prompt exactly as it will be sent, after `{MACRO}` expansion from a ```` ```macros ```` block at the top of the book.

Kinds: `lips` is reference-to-video with the plate as `@Image1` and a clean vocal holding only the quoted lines as
`@Audio1`; `motion` is reference-to-video with the song from t0 as `@Audio1`; `insert` is image-to-video with the plate
as the exact first frame, silent. The sync check cross-correlates the take's audio with what it was given to find the
lag, and for lips clips locates each sung word with Whisper. `WHISPER_LANGUAGE` sets the language of that check.

### flashscan.py

`flashscan.py <project> [CLIP ...] [--jump 30] [--fix CLIP:FRAME ...]`: finds single blown-out frames in
`media/clipframes/`. Seedance sometimes renders a camera flash as one frame far brighter than the frames on either side,
and in a cut it reads as a white blink. Each frame's mean brightness (0 to 255) is compared with its neighbours, and a
frame `--jump` levels or more above both is printed, largest first. The last column places the frame using `edl.json`
and `shots.json`: `in the cut at M:SS.ss`, `not in the cut`, or `check the cut` for warped clips and clips that share a
shot. The scan exits 1 when a spike is in the cut. `--fix CLIP:FRAME` replaces a frame with the average of its two
neighbours and keeps the original in `media/scratch/flash-fix/`. Queso's 12,018 frames scan in about five seconds.

### board.py

`board.py <project> [serve [port]]`: the storyboard as one HTML page (`<project>/storyboard.html`). Reads `shots.json`
(optional top-level `title` and `intro` strings head the page) and `picks.json`. Each shot shows its time, lyric,
picture, lyric surface, graphics and method, and the picked plate. Click a plate to open it full size; arrow keys step,
F flags, a comment box takes a note. `serve` runs a local server (default port 8765) that saves flags and comments to
`<project>/notes.json`; `serve PORT --share` is view-only and serves only the page, the plate images, the clips and the notes.

### review.py

`review.py <project>`: a phone-friendly review page (`<project>/review.html`): the latest clips cut against the song,
then the plates marked `new` in `picks.json`. Served by `board.py <project> serve PORT --share` at `/`. Clips come from
`media/render/pilot/*.mp4`. `review.json` may hold `{"order": [...], "captions": {"<file stem>": "text"}, "intro": "text",
"title": "text"}` and `"choose": [{"title", "note", "images": [[path, label], ...]}]` for candidates to pick from.

### mkreview.py

`mkreview.py <project>`: rebuilds `<project>/review.json`: chapter drafts first, then every clip's pinned or latest take
in story order.

### publish.sh

`publish.sh <project> NN A:B`: checks chapter NN (lyrics gate and purity check from `render.py`), renders its draft at
1280 px wide for the time range `A:B`, copies it to `media/render/pilot/ch<NN>-draft.mp4` and rebuilds the review page
with `mkreview.py` and `review.py`. The project is given relative to the workspace root. Python is `$PYTHON`, else
`.venv/bin/python` in the workspace root if present, else `python3`.

### cover.py

`cover.py <project> <plate> --x0 N --title TEXT --artist TEXT --title-pos CX,CY,SIZE --artist-pos X,Y,SIZE [options]`:
square 2000x2000 cover art. A full-height square is cut from the plate at `x0`, enlarged, and set with the title in Anton on
a flat coloured slab, tilted, and the artist name in an italic serif. Options: `--artist-color`, `--slab-color`,
`--ink-color`, `--tilt`, `--title-font`, `--artist-font`, `--name`. Writes `<project>/cover/<name>.jpg` and `.png`.

## engine/

`render.py` renders the motion-design engine in headless Chromium. Run from `engine/` with the project in
`VIDEO_PROJECT`:

```
cd engine && VIDEO_PROJECT=<project> python3 render.py <cmd>
```

```
assets                         regenerate <project>/engine/assets/ from media/audio/*.json and the media and ch/ folders (every other command does this first)
still <t> --out f.png          one frame at song time t (seconds)
sheet <t1,t2,..|A:B:n> --cols 4 --w 480 --out f.jpg
frames A:B --fps 24 --out dir --workers N [--fmt jpg]
video A:B --out f.mp4 --fps 24 --workers N [--w 1920] [--no-audio]
lyrics [A:B] [--workers N] [--min-px 36]
                               the gate: every sung word in range must carry an LY.mark at --min-px or taller; exits 1 on any miss
check [A:B] --n 24             purity: n frames in order, then shuffled in a fresh browser; pixel hashes must match
bench [A:B]                    ms per frame
```

Every command takes `--ch 03,07` (load only chapters whose file name starts with one of the prefixes), `--look <mode>`
and `--size WxH`. The canvas is 1920x1080 unless `--size` or the `VIDEO_SIZE` environment variable names another size;
`--size 1080x1920` renders a vertical cut, and the engine's `W` and `H` follow. Width and height must be even.
The authoring API (`MEDIA`, `OCC`, `TXT`, `LY`, timing helpers) is described in `engine/ANIMATION_GUIDE.md`. A project
supplies its own `engine/common.js`, `engine/ch/NN_name.js` chapter files and media; this folder holds only the engine.
