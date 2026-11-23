---
name: music-video
description: Make an AI music video or lyric video for a song the user already has, end to end. Characters and sets are designed first, GPT Image stills become Seedance video clips, singing and talking shots go through a lip-sync model, and every lyric and graphic is drawn in code on the beat. Use this whenever the user wants a music video, lyric video, visualizer or "slopcore" video for a track, wants generated footage or lyrics synced to a song, wants an AI character to sing or speak to a vocal, mentions Seedance, Sume, Higgsfield, GPT Image, Midjourney or another image or video model for a song, or needs the finishing and release work on such a video (title, credits, watermark, audio master, cover art, vertical cuts and teasers for TikTok, Reels and Shorts, Spotify Canvas, posting). Also use it to plan or budget one before any money is spent.
---

# Music video

This skill turns a finished song into a finished music video. The picture is generated footage: stills ("plates") made with image models, turned into video clips by Seedance 2.5. Singing and talking shots go through a lip-sync model. Every lyric and every graphic is drawn in code on top of the footage, timed to the word and the beat.

The method was built across five productions for the artist Saindra between 3 and 28 October 2026: "Queso" (3:49, 93 shots), "READ ME" (2:49, 66 shots), "Juego" (2:28, 35 shots), "Vuela" (3:55, 57 shots, with spoken dialogue) and "Tía Mari Juana" (a painted Día de Muertos film with a band and two singers). It follows the one anabology documented for their videos BLISS and CLODYSSEY. Queso is included in `examples/queso/` as a worked example, and the scripts are in `toolkit/`.

## Who does what

The producer brings the song, the lyrics, the look of the lead, the taste and the money. You do everything else, and you stop at each gate below for a yes.

Taste is where these videos succeed or fail. Producers reject pictures that pass every technical check, ask for gags nobody planned, and catch things no check measures, like sauce on a lip that looks like a sore. Build the process around getting pictures in front of the producer early and often, and do your own quality control first so they only see work that is ready to judge.

## What you need before you start

Ask for anything missing. Do not start generating without them.

1. The song as a WAV, final mix or close to it, and its stems if they exist.
2. The lyrics as sung. Ask where the recording differs from the sheet. The lyrics are the producer's work; treat them as such.
3. The lead's look: reference images of the face and the body. If there is no clean frontal close-up, make one in phase 3 and get it approved before any plates.
4. A spending ceiling for generation. Video is nearly all of the money.
5. Where it will be posted. YouTube and X get a 16:9 master at 1080p. TikTok, Reels and Shorts get vertical versions laid out again at 1080 x 1920.
6. Accounts: a Sume API key (Seedance, GPT Image, lip sync) or a Higgsfield key for Seedance plus OpenRouter for images. Midjourney in a Chrome you can drive is optional, for look exploration. Fish Audio if the video has dialogue.

Then set up a workspace. Read `references/setup.md`.

## The pipeline

Each phase ends at a gate. The producer approves, and only then does the next phase begin. Every phase costs more than the one before it, so a mistake caught in the storyboard is free and the same mistake caught in the rough cut means paying for clips twice.

| # | Phase | You produce | Gate |
|---|---|---|---|
| 1 | Song analysis | Beat grid with its downbeats, a time for every sung word, who sings each line, a timing-proof video | Producer watches the proof with headphones and confirms. The data is frozen after that. |
| 2 | Concept | A production brief: the joke or feeling, where every lyric lives on screen, a banned list, the producer's words quoted exactly | Producer approves. |
| 3 | Cast and world | Identity text and sheets for every character, floor plans and empty set views for every location, the look frame | Producer approves the sheets and the look. |
| 4 | Storyboard | A shot list as data: every shot a video clip, cut on a downbeat, with camera, size, cast, props and lyric surface | Producer approves, after an independent review. |
| 5 | Plates | A checked still for every shot on a review board | Producer comments in rounds until sign-off. |
| 6 | Prompt book and pilot | A written prompt for every clip, then a pilot of each kind of clip as 480p drafts | Producer watches the pilot. |
| 7 | Clips | Every clip as a 480p draft, cut against the song; approved shots finalized at 1080p | An explicit go on a stated cost before each batch. |
| 8 | Lip sync | Every singing and talking shot through a lip-sync model on its own voice | Producer watches the cut with sound. |
| 9 | Chapters | Lyrics and graphics for each section, drawn in code, then a rough cut | Producer watches and sends notes, in rounds. |
| 10 | Finishing | First frame, title, credits, handle, flash-frame scan, audio master, cover art | Producer signs off the master. |
| 11 | Release | Vertical full version, teasers, a cut that introduces the sound, Spotify Canvas, posting plan | Producer approves each piece. |

Phase by phase:

- **1 to 4:** `references/analysis-and-storyboard.md`
- **3 and 5:** `references/plates.md` for character sheets, set views, the look frame and every plate
- **6 and 7:** `references/clips.md`
- **8:** `references/lipsync.md`
- **9:** `references/chapters.md`, then `toolkit/engine/ANIMATION_GUIDE.md` before writing any chapter code
- **10 and 11:** `references/finishing.md`, and `references/vertical-cuts.md` for the tall versions
- **Throughout:** `references/review.md` for how to show work and take notes

`references/costs.md` has the real numbers from all five films. `references/lessons.md` lists what went wrong and the rule each mistake produced. Read both before you plan.

## Rules that cost money or time when broken

**Plan every shot as video.** A still under a slow zoom reads as a slideshow. On Queso the first storyboard kept 40 of 93 shots as stills to save money, the producer said "I want everything to be video", and the fix cost 46 more clips. A clip that runs out and freezes on its last frame counts as a still.

**Cut on the one.** Every shot boundary lands on the downbeat of a bar. Cutting on lyric-line starts put only 21 of READ ME's 74 cuts on a downbeat, and the producer found it "really distracting". Check the downbeat against the bass, not only the kick: on Tía Mari Juana bar 1 first landed on the snare.

**Design the world before the plates.** Write each character's identity text once and paste it into every prompt word for word. Draw a floor plan for every location, make one empty view per camera position, and build every plate from those. Without them, sets "are literally changing in every shot". Prefer close shots: every wide gives the model more details to get wrong.

**Check every plate before the producer sees it.** Look at full size against a written checklist, and have an independent reviewer check too. On Tía Mari Juana two reviewer families agreed on 44 of 59 plates and passed only 3, where a quick self-check had passed most of them. Fix passes name the exact defect and what must not change, and every fix gets looked at.

**Put the expression in the still, then animate.** A video model moves what is in the picture and invents faces badly. Three takes at $3.20 failed to cross her eyes; editing the eyes into the still cost six cents and the next take worked. If two takes miss the same thing, change the still.

**Anything with people moving gets the music.** Silent image-to-video invents its own tempo, and strums, steps and mouths land off the beat. Give those clips the song segment as an audio reference. Shots where nobody sings get the instrumental and a line saying nobody sings, or the mouths keep moving.

**The subject is alive and the camera moves.** Lead each prompt with what the subject does, give every shot a specific camera move, and never a slow push. Prompts that said "stay exactly" and "very slow push" came back as "a kind of lame ken burns effect".

**Draft at 480p, finalize once.** Iterate on Seedance drafts at about a fifth of the 1080p price, cut and review at draft quality, and re-render only approved shots at 1080p from their draft job. Tía Mari Juana ran every pass at 1080p and spent about $400.

**Every singing and talking shot goes through a lip-sync model.** Seedance re-sings a line in its own timing. On Vuela the retimed takes passed every check, the video went out, five of six replies said the lip sync was off, and it came down. A dedicated lip-sync model fixed 20 shots for $6.62. Feed each shot only its own singer's words, gated by the word timings.

**Spend after sign-off, and say the cost first.** Before each batch state the count, the seconds and the cost, and wait for a go. Check the balance before a large send. Payment is the producer's job. Sume jobs cannot be cancelled once generation starts, so say that before starting anything you might want to stop.

**When the producer criticises something, fix it and show the fix.** Do not drop the feature or hand back a list of options while the bad version stays in the cut. On Queso "it's not that good" about lip sync was read as "remove lip sync", and the answer was "whoa whoa whoa, don't drop all the lip sync". If you believe something should be cut, ask, with your recommendation.

**No lettering in footage.** Every prompt ends with "No text, letters or logos." All type is drawn by the engine, where it is spelled right and placed on the beat.

**Lyrics never cover a face, and graphics fade.** Type sits on the picture, not on solid boards ("huge solid color shapes that obscure my beautiful characters"). A lyric line keeps one place for its whole life, across cuts. Graphic objects fade in and out over about a quarter second instead of popping; sung words may still land hard.

**Every frame is a pure function of song time.** The renderer draws frames in any order across several browsers. The lyric gate must print N of N words before a chapter counts as done.

**Show work where the producer is.** Serve reviews from a local page with per-item notes that save themselves, and put it behind a tunnel when they are on a phone. See `references/review.md`.

**Say what a delete does before running it.** Keep the old version of anything you replace. Producers change their minds.

**The lead is in the first frame.** Feeds show frame one before anyone presses play. Open on the best shot of the lead, never on black or a fade up from black. Ask the producer where the title goes: the opening seconds or the end card.

## Working with subagents

The work parallelises well in four places: reviewing plates and storyboards, animating chapters, running clip batches and checking takes. Give each agent a narrow brief and a file contract.

- Reviewers work from the written checklist with crops, and do not see your verdicts first. A second family of reviewer (for example `codex exec`) catches what yours misses.
- An animator edits its own chapter file and nothing else. The engine, the shared kit, the tools and the data are read-only to it.
- Subagents never generate or buy anything. Image and video jobs run from the lead session only, because that is where the budget and the approvals live.
- Build one chapter first as the exemplar, then hand the others out with that file as the pattern. On Queso eight animators returned their chapters in 39 to 63 minutes each.
- Keep prompt writing in one context so the characters and the world stay consistent.

## The toolkit

`toolkit/` holds the scripts and the render engine, and `toolkit/README.md` documents every command. `sume.py` drives Seedance, GPT Image and the lip-sync models; `hfapi.py` and `clips.py` drive Seedance on Higgsfield; `imgedit.py` makes and fixes stills through OpenRouter; `mj.mjs` drives Midjourney. Copy the toolkit into the workspace before use, since the tools expect projects to live beside them.

Some steps are written up as methods rather than shipped as scripts, because each production needed its own version: set views from floor plans, plate composition from references, word-gated vocals for lip sync, motion measurement, vertical layouts. The references say exactly what each one does, so write the script for the project at hand.

The example project in `examples/queso/` shows what each document and each chapter file looks like when finished. Its stills were made with Midjourney, before the switch to GPT Image for character plates. Start a new project's `engine/common.js` and `engine/ch/_kit.js` from the Queso ones: keep the shot, camera, subtitle and title helpers, and replace the surfaces that belong to that song.
