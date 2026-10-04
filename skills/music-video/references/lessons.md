# What went wrong, and the rule each mistake produced

All from the making of "Queso". Quotes are the producer's.

## Planning

| What happened | Rule |
|---|---|
| The storyboard kept 40 of 93 shots as stills moved by the camera, to save money. "That's not what I want. I want everything to be video." Cost: a second prompt pass and 46 more clips. | Every shot is a clip from the first storyboard. |
| A clip for a shot that cut between three pictures only covered one of them. | One clip per picture. |
| The title only appeared on the end card. "Most viral music videos I've seen these days usually have a title overlay within the first 5-10 seconds." | Title in the first seconds. |
| The video opened on a title over black. "She just has to show in the first frame." | The lead is in frame one. |
| The end credit was written in Spanish by guesswork and had to be replaced. | Ask for the wording of every credit. |

## Characters and plates

| What happened | Rule |
|---|---|
| Midjourney v7 with an omni-reference kept her face and gave stiff glamour. Text-only v8.2 was lively with the wrong face. | Run a casting test and let the producer choose the route. |
| The boyfriend was a different man in every plate. | Cast each recurring character once and attach that frame as a reference everywhere. |
| The character text said "long loose strands across her face". Hair crossed her eyes and mouth in 27 plates. "That's cute but no good." | Read your own identity text for what it will cause. State that her face is clear of hair. |
| "Like a microphone" produced a microphone. "Tomato sauce on her lips" produced a red ball. | Describe the body and the object literally. Similes become props. |
| Contact sheets passed plates with fused fingers. "Fingerslop." | Look at every pick at full size. |
| Whole-frame edits left the hands broken. | Crop the region, redraw the crop, paste it back. |
| The edit model's filter refused close crops of skin. | Keep a second edit model ready. |
| A changed plate was offered as a choice while the old one stayed in the cut. "It didn't get switched like I asked." | Swap in your best candidate first, then mention the others. |
| Sauce on her lips in a kiss shot read as sores to someone seeing it cold. | A messy detail has to be unmistakable or absent. Show the cut to a fresh pair of eyes. |
| Regenerating the storyboard lost the ids of Midjourney jobs already sent. | Batch files keep the record of every job sent. |

## Clips

| What happened | Rule |
|---|---|
| The first lip-sync pilot was half a second late. The agent proposed dropping all singing shots. "Whoa whoa whoa, don't drop all the lip sync." | Criticism means improve. Changing scope is the producer's decision. |
| Seedance re-sang the line in its own timing. | Measure each take against the song, pin the best, retime it. |
| Three takes could not cross her eyes from a prompt. | Put the expression in the plate, then animate. |
| A hand in the opening shot "looks horrific". | If a shot does not need a hand, take it out of the plate and say so in the prompt. |
| A close-up of a blown kiss was refused three times, even silent and with plain wording. | When the picture is the trigger, make a new plate. |
| A take did its action twice with a gap in between, and the cut landed in the gap. | Check where the action falls inside the take and set the in-point. |
| Graphics pinned to plate pixels drifted once the stills became moving clips. | Key pinned graphics to clip time. |
| Clips were checked on frame sheets only. | Say so, and ask the producer to watch in motion with sound. |

## Money

| What happened | Rule |
|---|---|
| The balance ran out mid-run while the producer slept. Fourteen clips waited 11 hours. | Check the balance before a large send, and ask for a top-up while the producer is there. |
| The agent tried to add funds and stopped at the card's security prompt. | Payment is the producer's job. |
| Every cost quoted assumed a 15% discount. The account paid 30% under list. The reported total was $64 too high. | Read the billing page. Report the billed figure. |
| Plate fixes were finished before any large video spend. "There are definitely some issues to address before we burn much on higgsfield." | Spend follows sign-off. |

## Tools and process

| What happened | Rule |
|---|---|
| A script waiting on Midjourney's live feed stalled when Chrome throttled the hidden tab. | Never wait on a hidden tab. Reload and pair by prompt text. |
| Stem separation failed on the Apple GPU. | Run demucs on the CPU. |
| Line-by-line forced alignment gave bad word times. | Align by stanza inside windows anchored by a transcript. |
| The quick tunnel returned 404 because of the machine's own tunnel config. | Start it with an empty config file. |
| A filtered process listing showed nothing, the agent announced the link was dead and started a second tunnel. It was alive. | Test a link by fetching it. |
| A command that deleted a temporary file was stopped by the producer. "I didn't understand what that rm was about." | Explain a delete before running it, or write temporary files where nothing needs deleting. |
| A retake was pinned while a download for the same clip was still waiting, and the pin was overwritten. | Let a collect finish before editing that clip's record. |
| A master with a -0.2 dB ceiling went over full scale after AAC encoding. | Ask for a -1 dB ceiling and use the better encoder. |
| A defect-check agent questioned four plates the producer had approved. They were left alone. | The producer's approval outranks a checker. |
