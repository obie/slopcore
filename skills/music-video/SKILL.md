---
name: music-video
description: Make an AI music video or lyric video for a song the user already has, end to end. Midjourney stills become Seedance video clips, and every lyric and graphic is drawn in code on the beat. Use this whenever the user wants a music video, lyric video, visualizer or "slopcore" video for a track, wants generated footage or lyrics synced to a song, wants an AI character to lip-sync to a vocal, mentions Midjourney plus Seedance, Higgsfield or another video model for a song, or needs the finishing work on such a video (title card, credits, watermark, audio master, cover art, posting). Also use it to plan or budget one before any money is spent.
---

# Music video

This skill turns a finished song into a finished music video. The picture is generated footage: Midjourney stills ("plates") and Seedance clips made from them. Every lyric and every graphic is drawn in code on top of the footage, timed to the word and the beat.

It comes from one real production, "Queso" by Saindra: 3 minutes 49 seconds, 93 shots, all of them video, made in about 11 hours of agent time across two sittings, with a Seedance bill of $309. By the producer's own count it took a couple of hours of his attention. The method follows the one anabology documented for their videos BLISS and CLODYSSEY. The whole Queso project is in `examples/queso/` as a worked example, and the scripts that made it are in `toolkit/`.

## Who does what

The producer brings the song, the lyrics, the look of the lead, the taste and the money. You do everything else, and you stop at each gate below for a yes.

That division matters because taste is where these videos succeed or fail. On Queso the producer rejected plates that passed every technical check, asked for gags nobody had planned (a burp, crossed eyes, a Guadalupe parody), and caught sauce on her lips that looked like sores. Build your process around getting pictures in front of the producer early and often.

## What you need before you start

Ask for anything missing. Do not start generating without them.

1. The song as a WAV, final mix or close to it.
2. The lyrics as sung. Ask where the recording differs from the sheet.
3. The lead's look: two reference images work best, a portrait and a frontal face close-up. If there is no close-up, make one during the casting test and get it approved before the plates.
4. A spending ceiling for video generation. Confirm that it covers the clips only. Image fixes add about $10 and Midjourney is a subscription.
5. Where it will be posted. For X and YouTube make a 16:9 master at 1080p. X needs a paid account for videos longer than 2 minutes 20 seconds. TikTok and Instagram get vertical cut-downs later, as their own layouts.
6. Accounts: Midjourney in a Chrome you can drive, a Higgsfield API key for Seedance, an OpenRouter key for image fixes.

Then set up a workspace. Read `references/setup.md`.

## The pipeline

Each phase ends at a gate. The producer approves, and only then does the next phase begin. The gates exist because every later phase costs more than the one before it, and a mistake caught at the storyboard is free while the same mistake caught in the rough cut means paying for clips twice.

| # | Phase | You produce | Gate |
|---|---|---|---|
| 1 | Song analysis | Beat grid, a time for every sung word, a timing-proof video | Producer watches the proof and confirms the timing by ear. The data is frozen after that. |
| 2 | Concept | A production brief and a design language | Producer approves the concept. |
| 3 | Casting test | Comparison sheets of the lead made several ways | Producer picks the route. |
| 4 | Storyboard | One shot per lyric line: picture, lyric surface, graphics. Every shot is planned as a video clip. | Producer approves. |
| 5 | Plates | A picked still for every shot, on a review board | Producer comments in rounds until sign-off. |
| 6 | Prompt book and pilot | Every clip prompt written by hand, then three pilot clips, one of each kind | Producer watches the pilot. |
| 7 | Main clip run | All clips, in batches of about ten | An explicit go on a stated cost. |
| 8 | Chapters | Lyrics and graphics for each section of the song, then a rough cut | Producer watches and sends notes. |
| 9 | Finishing | Opening frame, title, credits, watermark, audio master, cover art | Producer signs off the master. |

Phase by phase:

- **1 to 4:** `references/analysis-and-storyboard.md`
- **5:** `references/plates.md`
- **6 and 7:** `references/clips.md`, and `references/lipsync.md` for singing shots
- **8:** `references/chapters.md`, then `toolkit/engine/ANIMATION_GUIDE.md` before writing any chapter code
- **9:** `references/finishing.md`
- **Throughout:** `references/review.md` for how to show work and take notes

`references/costs.md` has the real numbers from Queso for budgeting. `references/lessons.md` lists what went wrong and the rule each mistake produced. Read both before you plan.

## Rules that cost money or time when broken

**Plan every shot as video.** A still under a slow zoom reads as a slideshow. On Queso the first storyboard kept 40 of 93 shots as stills to save money. The producer's reaction was "I want everything to be video", and the fix meant a second pass of prompt writing and 46 more clips. Budget a clip for every shot from the start, including one-beat cuts and object inserts. A shot that cuts between several pictures needs one clip per picture.

**Spend after sign-off, and say the cost first.** Hold video spending to the pilot until the plates are approved. Before each batch, state how many clips, how many seconds and the estimated cost, and wait for a go. Check the account balance before a large send. On Queso a run stalled for 11 hours on an empty balance because the producer was asleep and only he could add funds.

**When the producer criticises something, fix it and show the fix.** Do not drop the feature, shrink the plan, or hand back a list of options while the bad version stays in the cut. On Queso "the lip sync is not that good" was read as "remove lip sync", which was wrong. He wanted it kept and made better. If you believe something should be cut, put that as a question with your recommendation.

**Put the expression in the still, then animate.** A video model performs motion well and invents faces badly. Asked for crossed eyes from a prompt, Seedance rolled her eyes white twice and gave a side-eye once. Editing the eyes in the still took six cents, and the clip from that still worked on the first take. The same goes for any detail that has to read at a glance.

**Measure lip sync, then retime it.** Seedance sings the line again in its own timing and the mouth follows that. Transcribe each take's own soundtrack, compare word ends with the song, pin the best take, and warp it so every word ends where it ends in the song. Details in `references/lipsync.md`.

**Look at every picture full size before it goes on the board.** Contact sheets hide hands, teeth and eyes. Hands were the producer's most frequent rejection on Queso. Fix them by cropping the region and redrawing only the crop, never the whole frame.

**Identity lives in text and references together.** Every prompt carries the same written description of each character and the same reference images. State that her hair is off her face in every prompt. One phrase in the character description ("loose strands across her face") put hair over her eyes in 27 plates.

**No lettering in footage.** Every prompt ends with "no text, no letters, no logos". All type is drawn by the engine, where it can be spelled correctly and placed on the beat.

**Every frame is a pure function of song time.** The renderer draws frames in any order across several browsers. Nothing may depend on an earlier frame. The lyric gate must print N of N words before a chapter counts as done.

**Show work where the producer is.** If they are on a phone, a file opened on the desktop is invisible to them. Put a review page behind a tunnel and send the link. See `references/review.md`.

**Say what a delete does before running it.** Keep the old version of any plate you replace. Producers change their minds, and a command that removes files looks alarming from the other side of the screen.

**The lead is in the first frame, and the title is in the first seconds.** Feeds show frame one before anyone presses play. Open on the best shot of the lead with the title beside the face.

## Working with subagents

The work parallelises well in three places: checking plates at full size, animating chapters, and running clip batches. Give each agent a narrow brief and a file contract.

- An animator edits its own chapter file and nothing else. The engine, the shared kit, the tools and the data are read-only to it. A missing helper gets written inside the chapter and reported.
- Animators never generate or buy anything. Midjourney and Seedance are run by the lead session only, because that is where the budget and the producer's approvals live.
- Build one chapter first as the exemplar, then hand the other chapters to parallel animators with that file as the pattern. On Queso eight animators returned their chapters in 39 to 63 minutes each.
- Keep prompt writing in one context. All clip prompts for a video should come from one author so the characters and the world stay consistent.

## The toolkit

`toolkit/` holds the scripts and the render engine. `toolkit/README.md` documents every command. Copy the toolkit into the workspace before use, since the tools expect projects to live beside them.

The example project in `examples/queso/` shows what each document and each chapter file looks like when finished. Start a new project's `engine/common.js` and `engine/ch/_kit.js` from the Queso ones: keep the shot, camera, subtitle, slab and title helpers, and replace the surfaces that belong to that song.
