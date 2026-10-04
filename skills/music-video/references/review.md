# Showing work and taking notes

The producer's eye is the quality bar. Everything here is about getting pictures in front of them quickly and acting on what they say.

## Review from a phone

Producers often drive the session from a phone. A file opened on the desktop is invisible to them, so put the work behind a link.

```bash
.venv/bin/python tools/review.py mysong                       # builds review.html
.venv/bin/python tools/board.py mysong serve 8766 --share &   # view-only server
: > /tmp/cf-empty.yml
cloudflared tunnel --config /tmp/cf-empty.yml --url http://127.0.0.1:8766
```

- The `--share` server exposes the review page, the storyboard, plate images and preview clips, and nothing else. The song, the stems, the prompts and `.env` stay private. Never serve the workspace root.
- The empty config file matters when the machine has its own `~/.cloudflared/config.yml`. Without it the quick tunnel answers 404.
- The tunnel's address changes every time `cloudflared` restarts. Before telling anyone a link is dead, fetch it with `curl` and list processes with `pgrep -fl cloudflared`.
- Phones need video encoded with `-movflags +faststart` and a server that honours byte ranges. `board.py` does the second.
- The shared page is read-only, so notes come back in chat.

Order the page so the newest whole thing is first: the full cut, then chapters, then individual clips in story order. Give each item a one-line caption that says what changed. `review.json` holds the order, the captions and a `choose` section for candidates the producer picks between.

## Review at a desk

`board.py mysong serve 8765` without `--share` lets the producer flag plates and type notes that save to `notes.json`. Archive each round's notes under a new name before the next round.

## Acting on notes

- **Fix it, then show it.** When something is rejected, the next thing the producer sees should have it fixed. Offer alternatives after that.
- **Criticism means improve.** "It's not that good" is a request for a better version. Dropping the feature is a change of scope, and scope is the producer's call. Ask first, with a recommendation.
- **A later word beats an earlier approval.** A plate approved yesterday can be rejected today.
- **Quote them.** Put their words into the brief and the plate notes. "Her lips look like they have herpes" tells the next agent more than "sauce removed".
- **Keep the old version** of whatever you replace.
- **Say what was not checked.** If you reviewed clips on frame sheets and never watched them in motion, say that.
- **Report costs with the notes.** Every retake has a price, and the producer should hear it before the send.

## What producers catch that checks do not

From Queso, all found by a person watching, none by a tool:

- stills under a slow zoom that read as a slideshow
- hair across her eyes in a shot where she eats
- sauce on her lips that looked like sores
- a title that only appeared at the end
- a black first frame in the feed preview

Expect notes like these after every cut, and leave budget for them. About a third of Queso's clip spend followed from review notes.
