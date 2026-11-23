# Showing work and taking notes

The producer's eye is the quality bar. Everything here is about getting pictures in front of them quickly and acting on what they say. Rounds add up: Queso's stills took three rounds and 59 notes, READ ME 63 notes in three rounds, Vuela 100 notes in seven.

## Review page

Each review is a page with a player or image for every item, thumbs up and down, and a note box. You read the notes straight from a file.

- **Serve it locally.** `toolkit/tools/serve.py <project>` serves the project folder on `127.0.0.1` and the page at `/review/<name>`. It honours HTTP Range requests; without them videos will not seek. It answers only on this machine, and refuses writes that come from another web page. An artifact page caps each file at 16 MB, which forces a down-res of the cut, so use artifacts only to share.
- **One manifest per review,** `<project>/review/<name>.json`: sections of items with `id`, `src`, `kind` (video or image) and `label`. Newest whole thing first: the full cut, then chapters, then clips in story order. Give each item a one-line caption that says what changed.
- **Autosave, always.** Votes (pick, fix, nix) and notes write to a feedback JSON beside the manifest, `<name>.feedback.json`. "Fix" means keep the idea and repair what the note names. There is no Save button. Save on input after a short pause (about 700 ms) and on blur. Every vote write includes the note box's current text. Never overwrite a box that is focused or has unsaved text. A Save button lost a dozen notes once: "make the goddam comment inputs save automatically".
- **Archive old notes each round.** Move the feedback file to a new name before the next round, so the producer starts with empty boxes.
- **Use an in-page lightbox** for zoom: click to enlarge, arrow keys to step, Esc to close. Links that open the image in a new tab can be blocked on hosted pages.
- **Read the feedback file before the next round.** Do not ask for verdicts in chat.

## Review from a phone

Producers often drive the session from a phone. A file opened on the desktop is invisible to them, so put the work behind a link.

If the producer's phone and your machine are on the same Tailscale network, use `toolkit/tools/serve_tailnet.py <project>`. It binds the tailnet address only and serves the review pages, their manifests, the feedback and the media under `<project>/review/`, so votes and notes still save from the phone. Nothing else in the project is reachable. Copy or link the files a review shows into `review/<name>/` before sending the address.

Otherwise a Cloudflare quick tunnel does it, pointed at the view-only server described below (`board.py <project> serve PORT --share`). Do not point a tunnel at `serve.py`: it serves the whole project, and it refuses requests that arrive under any host name but its own.

```bash
: > /tmp/cf-empty.yml
cloudflared tunnel --config /tmp/cf-empty.yml --url http://127.0.0.1:8765
```

- Serve the review folder and the media it names, and nothing else. The song, stems, prompts and `.env` stay private. Never serve the workspace root.
- The empty config file matters when the machine has its own `~/.cloudflared/config.yml`. Without it the quick tunnel answers 404.
- The tunnel's address changes every time `cloudflared` restarts, and quick tunnels expire. Before telling anyone a link is dead, fetch it with `curl` and list processes with `pgrep -fl cloudflared`. Give the producer the new address.
- Phones need `-movflags +faststart` video and byte-range support.

The toolkit's `review.py` and `board.py ... serve --share` build a read-only version: the page, storyboard, plate images and preview clips. Notes then come back in chat.

At a desk, quit the video player and wait for it to exit before opening a file, or a re-render at the same path shows the old one.

## Check before you show

Your own check passes more than it should. On TMJ it passed most of 59 plates. Two independent reviewer families then went through all 59 from a written checklist, with crops: six Claude agents and six `codex exec` batches. They agreed on 44, and only 3 passed.

- Write the checklist first: identity, anatomy, hands, set, props, framing, style.
- Run two families and compare. `codex exec` runs the second one. Close its stdin with `< /dev/null` or it hangs, tell it to write a report and not edit source, and note that its sandbox has no network unless you enable it.
- Trace each defect to its root cause, such as a bad set view or a reference pulling every frame wide. Fix the cause, not the one frame.
- Run the same review at the storyboard gate. It caught lyric timing errors before any image existed.
- The producer's approval outranks a checker.

## Fresh eyes

Before you call a film done, show it to someone who has not seen it. Queso's producer showed it to his girlfriend, and she said of a kiss shot "eew, her lips look like they have herpes". It was remade for $8. Vuela's fresh eyes were the replies on X, the expensive way.

## Acting on notes

- **Fix it, then show it.** When something is rejected, the next thing the producer sees has it fixed. Offer alternatives after that.
- **Criticism means improve.** "It's not that good" is a request for a better version. Dropping the feature is a change of scope, and scope is the producer's call. Ask first, with a recommendation.
- **A later word beats an earlier approval.** A plate approved yesterday can be rejected today.
- **Quote them.** "Her lips look like they have herpes" tells the next agent more than "sauce removed".
- **Keep the old version** of whatever you replace.
- **Say what was not checked.** If you reviewed clips on frame sheets and never watched them in motion, say that.
- **Report costs with the notes.** Every retake has a price, and the producer should hear it before the send.

## What producers catch that checks do not

All found by a person watching, none by a tool:

- stills under a slow zoom that read as a slideshow
- hair across her eyes, and sauce that looked like sores
- a title that only appeared at the end, and a black first frame
- band members out of time with the music
- cards that popped on and off

Expect notes like these after every cut, and leave budget for them. About a third of Queso's clip spend followed from review notes.
