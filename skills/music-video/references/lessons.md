# What went wrong, and the rule each mistake produced

From the making of "Queso", "READ ME", "Juego", "Vuela" and "Tía Mari Juana" (TMJ). Quotes are the producer's.

## Planning

| What happened | Rule |
|---|---|
| Queso's storyboard kept 40 of 93 shots as stills moved by the camera. "That's not what I want. I want everything to be video." Cost: 46 more clips. | Every shot is a clip from the first storyboard. |
| A clip for a shot that cut between three pictures only covered one. | One clip per picture. |
| The title only appeared on the end card. "Most viral music videos I've seen these days usually have a title overlay within the first 5-10 seconds." | Title in the first seconds. On later films the same producer kept the title for the end card, so ask each producer (`finishing.md`). |
| The video opened on a title over black. "She just has to show in the first frame." | The lead is in frame one. |
| On READ ME, cutting on lyric-line starts put 21 of 74 cuts on a downbeat. "For such a fast track with such a dominant kick it's really distracting." | Cut on the 1 of a bar, about two bars minimum. |
| TMJ's tempo was right but the grid put bar 1 on the snare. "The 1 bar is mostly falling on the snare." | Check the downbeat with a kick and snare histogram, and find the 1 from the bass stem's chord roots. |
| TMJ's first plates had sets that changed in every shot. "They're literally changing in every shot." | Draw floor plans and per-camera set views, and write the shot list as data, before any plate. |
| Wide shots gave the model too many details to get wrong. | Prefer close-ups with a few wides painted once. TMJ's second storyboard was 78% close-ups. |

## Characters and plates

| What happened | Rule |
|---|---|
| Midjourney v7 with an omni-reference kept her face and gave stiff glamour. Text-only v8.2 was lively with the wrong face. | Run a casting test and let the producer choose the route. |
| The boyfriend was a different man in every plate. | Cast each recurring character once and attach that frame as a reference everywhere. |
| READ ME: a strict check passed 3 of 60 Midjourney stills with people. "You should seriously consider using grok and gpt image 2.5 a lot more than midjourney." 57 re-shot stills cost about $21 and none failed. TMJ's 59 Midjourney plates: "Very very few are anywhere near perfect." | Make plates with named characters in GPT Image. Midjourney supplies look and composition, then every pick gets a GPT Image identity pass. |
| GPT layout plates with 10 to 14 references became generic cartoons. "We lost the artistic beauty that we had." | Few references. Work in stages: layout plate, painterly pass, identity touch-up that changes only what you name. |
| The character text said "long loose strands across her face". Hair crossed her eyes and mouth in 27 plates. | Read your identity text for what it will cause. State that her face is clear of hair. |
| "Like a microphone" produced a microphone. "Tomato sauce on her lips" produced a red ball. "Jaguar and hummingbird" gave a cat with a beak. | Describe the body and object literally, part by part. Similes become props. |
| Contact sheets passed plates with fused fingers. "Fingerslop." Whole-frame edits left them broken. | Look at every pick at full size. Crop the region, redraw it, paste it back. |
| The edit model's filter refused close crops of skin. | Keep a second edit model ready. |
| GPT Image ignored "CU" and added creatures nobody cast. A fix pass swapped a character's identity. | Add "the face fills two thirds of the frame height" and "nothing else alive in frame". Name what must stay unchanged, and look at every fix. |
| My own QC passed most of TMJ's 59 plates. Two reviewer families (6 Claude agents, 6 `codex exec` batches) agreed on 44 and passed only 3. | QC with two independent reviewers against a written checklist before showing the producer. |
| A changed plate was offered as a choice while the old one stayed in the cut. "It didn't get switched like I asked." | Swap in your best candidate first, then mention the others. |
| Sauce on her lips in a kiss shot read as sores to someone seeing it cold. | A messy detail has to be unmistakable or absent. |

## Clips

| What happened | Rule |
|---|---|
| A hand in the opening shot "looks horrific". Three takes could not cross her eyes from a prompt. | Fix the plate: take out the hand, or put the expression in. Then animate. |
| A close-up of a blown kiss was refused three times. | When the picture is the trigger, make a new plate. Refusals look nondeterministic, so retry once unchanged first. |
| Silent image-to-video clips of a band were off the beat. "Nothing that has people moving can be done without the music, it looks cheap and terrible." | Any clip with people moving gets the song segment as audio reference. Silent is for empty sets, objects and smoke. |
| Prompts said "faces stay exactly" and "very slow push". Motion measured 0.3 to 0.9 px per frame, against 1.5 to 2.5 for short action prompts. "This might as well be a slideshow." | Lead with what the subject does. One short identity line. A specific camera move, opened with "MOVING CAMERA SHOT". |
| Mouths moved in shots where nobody sings. | Give non-singing shots the instrumental as audio reference and "nobody sings, talks or mouths words". |
| Hands dressing a character morphed garments and grew a fourth hand. | A real clip as video reference, a base outfit every look goes over, three physical steps, "exactly two hands". |
| Graphics pinned to plate pixels drifted once stills became clips. | Key pinned graphics to clip time. |
| Clips were checked on frame sheets only. | Say so, and ask the producer to watch in motion with sound. |
| Seedance rendered a camera flash as one pure white frame. It went out in the first upload, at 3:09. | Scan every clip for one-frame brightness spikes before the master render. |

## Lip sync

| What happened | Rule |
|---|---|
| Queso's first pilot was half a second late. The agent proposed dropping all singing shots. "Whoa whoa whoa, don't drop all the lip sync." | Criticism means improve. Changing scope is the producer's decision. |
| Seedance re-sang the line in its own timing. READ ME's automatic warping won on only 4 of 21 measurable clips. | Measure each take against the song, pin the best, retime it, and expect a model pass after. |
| Vuela's talking shots generated without sound had mouths that barely moved. | Generate speaking and singing shots with sound on. |
| Every Vuela check passed. Posted on X, five of six comments said the lip sync was off, and the video came down. The checks compared Seedance's invented soundtrack with the recording. | Run every singing and talking shot through a lip-sync model. Vuela's 20 shots cost $6.62. |
| TMJ's bake-off picked sync-lipsync-3, including on painted faces. | Feed it the finalized clip, trimmed to whole seconds, and that shot's own vocal. Lay the song back over it. |
| Lines were matched to singers by order. It drifted and one singer's lip sync "completely disappeared". A loudness gate passed stem bleed. | Pin who sings what by line start time, gate on word timings, and check each vocal track has energy in every window. |
| The model drives one face, so a two-singer shot failed. | Sync each half of the frame on its own singer's track and join with a feathered seam. |

## Graphics

| What happened | Rule |
|---|---|
| Vuela's lyrics sat on solid boards. "I'm just hating these huge solid color shapes that obscure my beautiful characters and films." | Type straight on the picture, nothing over a face. |
| A lyric line moved when the picture cut. "The phrase needs to finish where it started." | One layout per line, held across cuts. |
| The camera pulsed on snares and in drumless passages. "It's just pulsing for no apparent reason." | React to the kick only, and switch it off where a shot's own motion is the point. |
| TMJ's cards popped on and off, and the end card arrived as a cut. "Quick fade much better." | Fade every graphic about 0.25 s in and out. Dissolve into the end card over about 1 s. |

## Money

| What happened | Rule |
|---|---|
| Queso's balance ran out mid-run while the producer slept. Thirteen clips waited 11 hours. | Check the balance before a large send, and ask for a top-up while the producer is there. |
| The agent tried to add funds and stopped at the card's security prompt. | Payment is the producer's job. |
| Every cost quoted assumed a 15% discount. The account paid 30% under list. The reported total was $64 too high. | Read the billing page. Report the billed figure. |
| "There are definitely some issues to address before we burn much on higgsfield." | Spend follows sign-off. |
| TMJ's three full 1080p passes of 49 clips cost about $400. "I thought this was supposed to be cheaper." Vuela's whole 720p first draft was thrown away. | Iterate at 480p drafts, finalize approved shots at 1080p once, and settle the storyboard before a full pass. |
| Three Sume jobs billed after the producer said stop. | A started job cannot be cancelled. Warn before stopping. |

## Tools and process

| What happened | Rule |
|---|---|
| A script waiting on Midjourney's live feed stalled when Chrome throttled the hidden tab. | Never wait on a hidden tab. Reload and pair by prompt text. |
| The quick tunnel returned 404 because of the machine's own tunnel config. A filtered process listing made the agent declare a live link dead. | Start it with an empty config file. Test a link by fetching it. |
| A delete command was stopped. "I didn't understand what that rm was about." | Explain a delete first. Move files aside, never delete in bulk. |
| A master with a -0.2 dB ceiling went over full scale after AAC encoding. | Ask for -1 dB and use the better encoder. |
| Tens of thousands of regenerable frames choked the folder sync, and an offline placeholder made ffprobe hang. | Keep frames, previews and scratch out of synced folders. Keep superseded video takes: they became teaser footage. |
| A re-rendered video opened at the same path showed the old one. | Quit the player and wait for it to exit before `open`. |

## Release

| What happened | Rule |
|---|---|
| The first Instagram teaser set the 16:9 picture as a strip between bars. The lyrics were too small to read on a phone. | A vertical version is its own layout, with type set for the tall frame. |
| TMJ's vertical had a title lockup. The producer found it cheap and had it removed. | No lockup in the picture. |
| The end card was centred twice. "I said to put the big end card in the lower third." | Lower third, across the safe width. |
| 16:9 footage in a tall card window. "Doesn't frame the content properly." Sliding the crop did not save it. | Full-frame footage, graphics beside it. |
| A plan held TMJ's Día de Muertos video until its streaming date. The producer never approved it, and the video went out before the holiday. | Propose timing and wait for approval. |
| Queso's Canvas script failed on newer ffmpeg: xfade needs a constant frame rate. | Add `fps=24` after each `setpts` in the trim branches. |
