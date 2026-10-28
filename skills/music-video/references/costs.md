# What it cost

Real numbers from five films made in October 2026, and a way to estimate the next one. Prices change, so check the provider's price list before quoting.

## The five films

| Film | Length | Video generation | Also paid for |
|---|---|---|---|
| Queso (Oct 3-4) | 3:49, 93 shots | $309.08 billed, about $440 at list, 133 requests | about $10 of image edits, a Midjourney subscription |
| READ ME (Oct 11-13) | 2:49, 66 shots | $294 at list for 99 completed requests: $46 pilots, $194 main run, $54 retakes. The ceiling was $500. | about $21 for 57 re-shot stills |
| Juego (Oct 14) | 2:28, 35 shots | $148 at list, about $104 after the discount | a few dollars of stills |
| Vuela (Oct 17-20) | 3:55, 57 shots, with dialogue | about $810 at list over 186 generations, about $567 after the discount | Runway credits for about 36 shots and the video edits, a Fish Audio plan for the voices, $6.62 of lip sync on fal |
| Tía Mari Juana (Oct 24-28) | 49 clips per pass | about $400 on Sume, every pass at 1080p | GPT Image plates, lip sync at $0.13 a second |

Across the first four: roughly $1,200 of video generation after the discount, about $1,700 at list, for 13 minutes of finished film.

Vuela's total includes a complete first draft at 720p that was thrown away. Dialogue roughly doubled the cost of a film without it. Tía Mari Juana ran three full passes of all 49 clips at 1080p, plus re-rolls. At $0.57 a second the price was fine. The volume of iteration at full resolution was the cost. The producer: "i thought this was supposed to be cheaper than higgsfield! in future projects I think I want to investigate a workflow where we use less expensive video resolutions and then upscale later once the storyboard is finalized". Phase 7 now works that way.

## Queso in detail

- Seedance clips, billed: $309.08 (Higgsfield billing page)
- Image edits through OpenRouter: about $10
- Midjourney: a subscription; about 210 jobs
- Agent time: about 11 hours across two sittings, plus a couple of hours of the producer's attention
- Agent tokens: $387 at API list prices for the first 8.4 hours

The agent's own ledger said $373 for Seedance until the bill was read. It assumed a 15% discount and the account was paying 70% of list. Read the billing page before you give anyone a total.

Counts: 837 Midjourney images, 115 plates used, 101 clips (8 lip-synced), 133 Seedance requests of which 114 completed, 420 sung words placed in 93 lines.

The 19 requests that did not complete were refused by the safety filter or failed on an empty balance. Those are not charged.

## Price lists (28 October 2026)

Seedance 2.5, per second of video:

| Resolution | Higgsfield list | Sume list | A 4 s clip on Sume |
|---|---|---|---|
| 480p (draft) | $0.2056 | $0.1028 | $0.41 |
| 720p | $0.4622 | $0.2312 | $0.92 |
| 1080p | $1.1372 | $0.5686 | $2.27 |

Sume lists Seedance 2.5 at exactly half of Higgsfield. Reference images and reference audio add nothing on either. Queso's Higgsfield account was charged 70% of list.

Other prices:

| Item | Price |
|---|---|
| sync-lipsync-3 on Sume | $0.13 per second of clip |
| Topaz video upscale on Sume | $0.04 per second at 1080p |
| GPT Image 2.5, Sume, high quality 2K | about $0.06 an image |
| GPT Image 2.5, OpenRouter | about $0.10 an image |

A film's stills cost a few dollars to about $20. A Sume job cannot be cancelled once generation has started, so a job you stop is still billed.

## Where Queso's money went

- A three-clip pilot: about $11 at list.
- Lip-sync takes for the first singing shot, six of them, while the method was worked out.
- The main run: 46 clips, 219 seconds, about $154 billed.
- Turning 40 planned stills into video after the producer rejected them: 46 more clips, about $85 billed.
- Thirteen clips after the balance ran out, about $34 billed.
- Retakes from review: four takes chasing crossed eyes at $3.20 each (three from the prompt alone failed; the fourth, from a still with the eyes edited in, is the one in the cut), two takes to remove sauce from a kiss at $4 each.

About a third of the clip spend followed from review notes. Plan for it.

## Estimating a new film

The benchmark: a four-minute song with one shot per lyric line and no dialogue lands at $300 to $450 at list when every take is rendered at final resolution: 1080p for faces held longer than 2.4 seconds, 720p for short cuts and objects, three takes per singing shot, 15% for refusals and retakes, and a pilot.

With 480p drafts the arithmetic changes shape. Every exploratory take is a draft. A shot is rendered at final resolution once, after the producer approves its draft. For a shot of `s` seconds, with `d` draft takes:

```
shot cost = d * s * 0.1028 + s * 0.5686        (Sume)
```

A 4 s shot with three drafts costs 3 * 4 * 0.1028 + 4 * 0.5686 = $1.23 + $2.27 = $3.50. Three takes at 1080p would cost 3 * $2.27 = $6.82. One measured case: a 23 s clip cost $2.37 as a draft and $13.08 to finalize. Finalizing costs the full final-resolution rate, so the saving is in the takes you never render at 1080p.

For a whole film, sum the shot costs, then add:

- lip sync, once per singing or talking shot on the finalized clip: seconds * $0.13
- 15% for refusals that need a new plate, and for retakes after review
- the pilot, which is drafts of one clip of each kind

Put the sum next to the benchmark. Draft passes are cheap and the finalize pass is where the money goes, so cost follows finished running time at 1080p, plus a small fraction of it for every extra round of drafts. Tell the producer the estimated cost of each pass before you run it.

When the ceiling is lower than the sum, cut the number of shots and keep every remaining shot as video. Fewer, longer shots suit a slow song. Put the choice to the producer with the numbers. A new account has no known discount, so budget at list.

## Spending rules

- Quote the price before every batch and wait for a yes.
- Give every batch a ceiling and run a dry run first, which sends nothing.
- Check the balance before a large send. Queso's ran out at 11:14 at night and thirteen clips waited 11 hours.
- Spend follows sign-off. Fix plates before any large video spend.
- Read the real bill, not the agent's ledger.
- Payment is the producer's job. When the card asks for a security code, stop.

## Time

| Phase | On Queso |
|---|---|
| Song analysis and setup | 11 minutes |
| Casting test to a decision | 10 minutes |
| Storyboard | about 20 minutes |
| Plates: first 100 Midjourney jobs, then review in three rounds | 45 and 85 minutes |
| Prompt book, 53 prompts | 10 minutes |
| Pilots and lip-sync method | 45 minutes |
| Main clip run | about 45 minutes in batches |
| Eight chapters by parallel animators | 39 to 63 minutes each, in parallel |
| Finishing | about 2.5 hours, mostly producer requests |

The longest single delay was 11 hours waiting on an empty balance. Review rounds add up: Queso's stills took three rounds and 59 notes, READ ME 63 notes over three rounds, Vuela seven rounds and 100 notes.
