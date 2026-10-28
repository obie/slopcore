# Setup

## Accounts and what each one is for

| Account | Used for | How the toolkit reaches it |
|---|---|---|
| Claude Code | Runs everything: scripts, prompts, downloads, checks, the cut | The session itself |
| Sume (api.sume.com) | Seedance 2.5 video, GPT Image 2.5 stills, Kling, lip sync. Pay as you go | `SUME_API_KEY` in the environment or `.env`; `tools/sume.py` |
| Higgsfield API (open.higgsfield.ai) | Seedance 2.5 at list price. Optional | `HF_KEY` in `.env`; `tools/hfapi.py`, `tools/clips.py` |
| OpenRouter | GPT Image and Gemini image edits. Optional if Sume covers stills | `OPENROUTER_API_KEY`; `tools/imgedit.py` |
| fal.ai | Sync lipsync-2-pro, the alternative lip-sync model | A key kept in `.env` |
| Fish Audio | Voices for spoken dialogue, cloned from real recordings with the right accent. ElevenLabs does the same job | A plan on the account |
| Runway | Aleph, which repaints an existing clip from a corrected still. Optional | Plan credits |
| Midjourney | Look exploration and an optional beauty pass over plates | Through the producer's signed-in Chrome, `tools/mj.mjs` |
| Cloudflare (no account needed) | A quick tunnel so the producer can review from a phone | `cloudflared` |

Start small. Claude Code and Sume cover a film with no dialogue. Add fal.ai when there is a singing or talking shot, Fish Audio when a character speaks, Runway and Midjourney when a producer asks for what they do.

**Video.** Seedance 2.5 does nearly all the footage. Sume lists it at about half of Higgsfield's list price. `sume.py models video` prints the current rates; as listed on 28 October 2026 they were $0.10 a second for a 480p draft, $0.23 at 720p and $0.57 at 1080p. Higgsfield's list was $0.46 at 720p and $1.14 at 1080p. Kling 3 and Kling 4 take no audio reference, so use them only for shots where no one moves.

**Stills.** GPT Image 2.5 is the main image model, through Sume (about $0.06 to $0.08 an image) or OpenRouter. Gemini image is the fallback when OpenAI's safety filter refuses a picture. Grok image is reachable on Sume but drifts on identity, so it is the last resort. Midjourney has no official API, which is why it runs through a browser. On READ ME a strict full-size check passed only 3 of the 60 Midjourney stills with people in them. The 57 stills re-shot with GPT Image cost about $21, and on the second check 36 passed, 24 had minor faults and none failed.

**Lip sync.** sync-lipsync-3 on Sume costs $0.13 a second. Sync lipsync-2-pro on fal.ai also works. See `references/lipsync.md`.

**Money.** The Sume key is a model-API key. `/v1/me` and `/v1/balance` answer `open_key_route_not_allowed`, so read the balance on the website. Sume jobs cannot be cancelled once generation has started, and they bill either way. The Higgsfield API balance is separate from a Higgsfield subscription. Ask the producer to load whichever balance you use and to tell you the ceiling. You cannot add funds yourself: card checks stop at a security prompt, and that is as it should be. Check the balance before a big run. On Queso the Higgsfield balance hit zero in the middle of a batch at 11:14 at night, and thirteen clips waited eleven hours.

## Machine

Queso and every film after it were made on an Apple Silicon Mac. The toolkit needs:

- Python 3.11, ffmpeg, ImageMagick (`magick`), Node 22 or later, `cloudflared`
- Playwright with its Chromium build, which draws the lyrics and graphics
- `demucs` for stems, and `mlx-whisper` for transcription. On Apple GPUs demucs fails with "Output channels > 65536", so run it with `-d cpu`.
- Google Chrome signed in to Midjourney, with remote debugging turned on at `chrome://inspect/#remote-debugging`, only if Midjourney is in use. Chrome asks for permission each time something connects, so run `node tools/cdp.mjs serve` once and leave it running. Every other command goes through that one connection.

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

Put the song at `mysong/media/audio/song.wav` and the lyric sheet at `mysong/LYRICS.md`. `toolkit/README.md` lists the full project layout the tools expect. `sume.py` and `hfapi.py` read `.env` themselves; export the other variables in the shell first.

Never print `.env`, never commit it, and never serve the workspace root over the tunnel.

**Synced folders.** If the workspace sits in a cloud-synced folder, keep regenerable intermediates out of it. Tens of thousands of clip frames slowed one producer's sync to a crawl. On macOS with the File Provider build of Dropbox, mark a folder ignored with `xattr -w 'com.apple.fileprovider.ignore#P' 1 <dir>`, and do it as soon as you create `media/clipframes`, `media/scratch`, preview and archive folders. Do not ignore the approved cuts in `media/render`, and keep superseded video takes in a synced `outtakes/` folder, because they become teasers and vertical cuts. Clips can also arrive as cloud-only placeholders (`ls -lO` shows `dataless`), and `ffprobe` hangs on one until the file downloads. Reading it with `cat file > /dev/null` forces the download.

## Review

Serve review pages from the workspace with the toolkit's own server (`tools/board.py <project> serve`, see `references/review.md`). It handles byte ranges so videos seek, and it saves the producer's flags and notes to a JSON file you can read. For the phone, run `cloudflared` with an empty config file against the view-only `--share` server. The producer can then approve things from anywhere, and the tunnel shows only the review pages.

## Starting files for a new project

Copy these from `examples/queso/` and adapt them:

- `PRODUCTION.md`: the binding brief. Rewrite it for the new song. Every agent that works on the video reads it first.
- `DESIGN.md`: palette, type scale, lyric surfaces.
- `engine/common.js` and `engine/ch/_kit.js`: fonts, palette, shot drawing, cameras, and the reusable surfaces (letterbox bars, film subtitles, slabs, title card). Remove the surfaces that belong to Queso, such as the nutrition label and the calorie counters.
- `engine/ch/00_timing.js`: the timing-proof overlay.
- `storyboard.py`: the storyboard as data. It writes `shots.json` and `STORYBOARD.md`. Rework its plate job output for the image route in use.
- `bible/`: the format for the character and place files (`bible/LEAD.md`).

## A check before spending anything

```bash
.venv/bin/python tools/sume.py models video      # free: the key works, and these are today's prices
.venv/bin/python tools/sume.py video out.mp4 <model> "test" --dry   # prints the request, sends nothing
.venv/bin/python tools/hfapi.py selftest         # only if Higgsfield is in use: the cost formula matches the price list
.venv/bin/python tools/hfapi.py auth             # only if Higgsfield is in use: the key works
node tools/cdp.mjs targets                       # only if Midjourney is in use: Chrome answers and the tab is found
```

Every generate command takes a dry run, and every batch gets a spending ceiling. Quote the price to the producer before each batch and wait for the yes.

Read the real bill before trusting any cost figure. On Queso the account paid 70% of Higgsfield's list, the tool assumed 85%, and Claude's log said $373 when the billing page said $309.08. Set `HF_DISCOUNT` in `.env` to the fraction the billing page shows.
