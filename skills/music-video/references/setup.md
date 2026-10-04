# Setup

## Accounts and what each one is for

| Account | Used for | How the toolkit reaches it |
|---|---|---|
| Midjourney | Every still | Through the producer's signed-in Chrome, driven over the DevTools protocol |
| Higgsfield API (open.higgsfield.ai) | Seedance video clips, pay per generation | `HF_KEY` in `.env` |
| OpenRouter | Image fixes with GPT Image and Gemini | `OPENROUTER_API_KEY` |
| Cloudflare (no account needed) | A quick tunnel so the producer can review from a phone | `cloudflared` |

The Higgsfield API balance is separate from a Higgsfield subscription. Ask the producer to load it and to tell you the ceiling. You cannot add funds yourself: card checks stop at a security prompt, and that is as it should be.

## Machine

Queso was made on an Apple Silicon Mac. The toolkit needs:

- Python 3.11, ffmpeg, ImageMagick (`magick`), Node 22 or later, `cloudflared`
- Google Chrome signed in to Midjourney, with remote debugging turned on at `chrome://inspect/#remote-debugging`. Chrome asks for permission each time something connects, so run `node tools/cdp.mjs serve` once and leave it running. Every other command goes through that one connection.
- `demucs` for stems. On Apple GPUs it fails with "Output channels > 65536", so run it with `-d cpu`.

Check the machine before promising a schedule: `uname -m` should print `arm64` on a Mac. `mlx-whisper` runs on Apple Silicon only. On another machine, swap the transcription call in `tools/transcribe.py` and in the sync check of `tools/clips.py` for a Whisper build that runs there.

## Workspace

The tools find the workspace root as the folder that holds `tools/`, and a project is a folder beside it. So copy the toolkit into a fresh workspace and work there:

```bash
mkdir -p ~/videos && cp -R <this skill>/toolkit/. ~/videos/
cd ~/videos
python3.11 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pip install demucs timm einops kornia
.venv/bin/playwright install chromium
cp .env.example .env        # then fill in the keys
mkdir -p mysong/media/audio mysong/engine/ch
```

Put the song at `mysong/media/audio/song.wav` and the lyric sheet at `mysong/LYRICS.md`. `toolkit/README.md` lists the full project layout the tools expect.

Never print `.env`, never commit it, and never serve the workspace root over the tunnel.

## Starting files for a new project

Copy these from `examples/queso/` and adapt them:

- `PRODUCTION.md`: the binding brief. Rewrite it for the new song. Every agent that works on the video reads it first.
- `DESIGN.md`: palette, type scale, lyric surfaces.
- `engine/common.js` and `engine/ch/_kit.js`: fonts, palette, shot drawing, cameras, and the reusable surfaces (letterbox bars, film subtitles, slabs, title card). Remove the surfaces that belong to Queso, such as the nutrition label and the calorie counters.
- `engine/ch/00_timing.js`: the timing-proof overlay.
- `storyboard.py`: the storyboard as data. It writes `shots.json`, `STORYBOARD.md` and the Midjourney batch files.

## A check before spending anything

```bash
.venv/bin/python tools/hfapi.py selftest     # offline: the cost formula matches the price list
.venv/bin/python tools/hfapi.py auth         # free: the key works
node tools/cdp.mjs targets                   # Chrome answers and the Midjourney tab is found
```

Open the Higgsfield billing page and compare what the account is charged with the list price. Set `HF_DISCOUNT` in `.env` to that fraction. On Queso the account paid 70% of list, the tool assumed 85%, and every cost figure quoted to the producer was too high until the bill was read.
