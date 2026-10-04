# What it cost

Real numbers from "Queso" (3:49, 93 shots, October 2026). Use them to budget and to tell a producer what to expect. Prices change, so check the provider's price list before quoting.

## Totals

| Item | Amount | Source |
|---|---|---|
| Seedance clips, billed | $309.08 | Higgsfield billing page |
| Image edits (GPT Image and Gemini through OpenRouter) | about $10 | OpenRouter usage |
| Midjourney | a subscription; about 210 jobs, roughly 2 fast hours for the first 100 | plan usage |
| Agent time | about 11 hours across two sittings; the producer counts a couple of hours of his own attention | session clocks |
| Agent tokens | $387 at API list prices for the first 8.4 hours | session meter |

The agent's own ledger said $373 for Seedance until the bill was read. It assumed a 15% discount and the account was paying 70% of list. Read the billing page before you give anyone a total.

## Counts

| | |
|---|---|
| Midjourney images generated | 837 |
| Plates used | 115 |
| Clips | 101 (8 of them lip-synced) |
| Seedance requests | 133 |
| Requests that completed | 114 |
| Sung words placed | 420, in 93 lines |
| Code written for this video | about 5,000 lines of chapter and kit JavaScript |
| Tools and engine | about 3,300 lines |

The 19 requests that did not complete were refused by the safety filter or failed on an empty balance. Those are not charged.

## Seedance 2.5 list prices (2 October 2026)

| Resolution | Per second | A 4 s clip |
|---|---|---|
| 480p | $0.2056 | $0.82 |
| 720p | $0.4622 | $1.85 |
| 1080p | $1.1372 | $4.55 |

Reference images and reference audio add nothing. Queso's account was charged 70% of these.

## Where the money went

- A three-clip pilot: about $11 at list.
- Lip-sync takes for the first singing shot, six of them, while the method was worked out.
- The main run: 46 clips, 219 seconds, about $154 billed.
- Turning 40 planned stills into video after the producer rejected them: 46 more clips, about $85 billed.
- Thirteen clips after the balance ran out, about $34 billed.
- Retakes from review: four takes chasing crossed eyes at $3.20 each, two takes to remove sauce from a kiss at $4 each.

About a third of the clip spend followed from review notes. Plan for it.

## A budget for a new video

Count the shots, decide which are faces held longer than 2.4 seconds (1080p) and which are short cuts or objects (720p), and multiply by clip length. Then add:

- 3 takes for each singing shot
- 15% for refusals that need a new plate and for retakes
- a pilot

For a four-minute song with one shot per lyric line that lands between $300 and $450 at list price.

As a sum, with S the seconds of 1080p clips, T the seconds of 720p clips and L the number of singing shots at five seconds each:

```
list cost = (S * 1.1372 + T * 0.4622 + L * 2 * 5 * 1.1372) * 1.15 + 11
```

The `L * 2` term is the two extra takes per singing shot, and 11 is the pilot. Multiply by the account's discount once you have read it off the billing page. A new account has no known discount, so budget at list.

When the ceiling is lower than the sum, cut the number of shots and keep every remaining shot as video. Fewer, longer shots suit a slow song. Put the choice to the producer with the numbers.

## Time

| Phase | On Queso |
|---|---|
| Song analysis and setup | 11 minutes |
| Casting test to a decision | 10 minutes |
| Storyboard | about 20 minutes |
| First 100 Midjourney jobs | 45 minutes |
| Plate review, three rounds | 85 minutes |
| Prompt book, 53 prompts | 10 minutes |
| Pilots and lip-sync method | 45 minutes |
| Main clip run | about 45 minutes in batches |
| Eight chapters by parallel animators | 39 to 63 minutes each, in parallel |
| Finishing | about 2.5 hours, mostly producer requests |

The longest single delay was 11 hours waiting on an empty balance.
