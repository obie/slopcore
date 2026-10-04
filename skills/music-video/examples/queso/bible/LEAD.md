# Queso — cast and world canon

Every Midjourney and Seedance prompt takes its wording from here, so she reads the same in every shot.

## How plates are made (decided 2026-10-03 after three casting rounds)

Midjourney **v8.2** with `--raw --hd`, 16:9, and her two reference images attached through the edit model:

```
--ar 16:9 --v 8.2 --raw --hd --edit <reference-image-url> <reference-image-url>
```

- `Q-A6dblBGxQ` is the canon portrait (job 5bcbadcd…, image 1). `mcrE9LsoDn0` is the frontal face close-up. Copies are in `refs/`.
- v7 with `--oref` holds her face but gives stiff, posed glamour shots where the action never happens. Obie: "v7 is extremely terrible".
- v8.2 with text only gives the best pictures and the funniest action, but the face is someone else. Obie: "v8 has more usable stuff but doesn't look like saindra".
- v8.2 with `--edit` references gives both. Obie on that sheet: "these are much much better".
- Her v7 profiles (`--profile <your-profile> --profile <your-profile>`) pull v8.2 back toward smooth glamour. Leave them off.
- Shots without her (food, hands, the room, the boyfriend alone) take no `--edit` references.
- Plate fixes go through an image-edit model (GPT Image 2.5 on OpenRouter, offered by Obie), never painted by hand.

## Her

**Close and medium shots:**
> the woman from the reference images, the same face, warm tan skin, dark brown eyes, sharp winged eyeliner and glossy coral lips, jet-black hair pulled back off her face in a messy bun, a few loose strands beside her face and none across her eyes or mouth, a black patent-leather choker and a black patent-leather halter top

**Full length** (add): `, loose grey trousers`

For Seedance, where no Midjourney reference applies, say: "the woman from @Image1: warm tan skin, dark brown eyes, winged eyeliner, coral lips, jet-black hair pulled back in a messy bun, her face clear of hair, a black patent-leather choker and halter top".

## Him (the boyfriend)

> her boyfriend, a slim clean-shaven man in a pale blue polo shirt with neat side-parted brown hair

His props: a glass of sparkling water, a small green salad, a pocket calculator. He never eats pizza. He never sings.

## The world

> in an old red-sauce Italian trattoria at night, a red leather booth, a white tablecloth, a red glass candle holder, dark wood panelling, warm tungsten light and direct camera flash

Short form: `in a red-sauce Italian trattoria at night, red leather booth, white tablecloth, warm tungsten light and direct camera flash`

## The look

> high-fashion editorial photograph, 35mm film still, fine grain, no text, no letters, no logos

Every prompt ends with "no text, no letters, no logos". All type is drawn by the engine.

Keep each prompt under about 800 characters before the parameters. Longer ones get reworded by Midjourney.

## Hair

Her hair stays off her face. Obie, 2026-10-03: "can we get some of the excessive hair out of her face? ... there are strands literally across her eyes and look like it would go in her mouth as she's eating. that's cute but no good". The first canon text asked for "long loose strands across her face" and Midjourney obliged in nearly every close-up; 27 plates were corrected with the edit model. Every Seedance prompt says her face is clear of hair.

## Taste notes from Obie

- The pure v8.2 pull and bite frames (casting-01, first eight): "really good and quite funny haha". Chaotic, too close, tilted, mouth full. That energy is the target.
- The unsung Italian asides on the lyric sheet are dropped: "don't worry about the unsung asides".
