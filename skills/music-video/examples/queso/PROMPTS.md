# Queso — the Seedance prompt book

Every clip prompt, written by hand in one context. `tools/clips.py queso apply` reads this file.

## Rules

- **Clip time.** Times in a prompt are seconds from the clip's first frame. `@Audio1` starts on that frame, so a word or beat at song time T sits at T minus the clip's `t0`. Beats fall every 0.612 s. Every clip starts one beat before its shot, so a take that comes back late still covers the shot.
- **Shape.** The place, who is in it and what each of them wants; then timed beats, each with an action and a reaction; then the camera and the mouth rule.
- **Kinds.** `lips`: she sings on camera; the model gets her plate and a clean vocal of only those words. `motion`: the plate plus the song from `t0`, so the action lands on our beats; nobody sings. `insert`: the plate is the exact first frame, silent.
- **Identity is text.** The macros below are expanded into every prompt.
- **He never sings. Nobody but her sings.** No brand names. All type is drawn by the engine, so every prompt ends "No text, letters or logos."
- Plates that show only hands or food stay hands or food: no faces enter.
- **Her hair stays off her face.** The identity macros say so in every prompt; a take with strands across her eyes or mouth is a retake.

```macros
HER = the woman from @Image1 (warm tan skin, dark brown eyes, sharp winged eyeliner, glossy coral lips, jet-black hair pulled back off her face in a messy bun, a black patent-leather choker and a black patent-leather halter top; her face stays clear of hair, no strands across her eyes or mouth)
HERFAR = the woman from @Image1 (warm tan skin, jet-black hair pulled back in a messy bun with her face clear of hair, winged eyeliner, coral lips, a black patent-leather choker and halter top, loose grey trousers)
HIM = the young man from @Image1 (slim, clean-shaven, neat side-parted brown hair, a pale blue short-sleeved polo shirt)
ROOM = an old red-sauce Italian trattoria at night, red leather booths, white tablecloths, dark wood panelling, harsh direct camera flash
MOVE = The scene from @Image1, moving in time with @Audio1.
END = One continuous shot, no cuts. No text, letters or logos.
```

## I. Aperitivo

### F01 · s001 · 5 s · 1080p
- kind: insert
- plate: empty-plate
- t0: 0.0
- story: before the first note of the beat, somebody is hungry and the plate is empty. No hands: Obie on take 1, "AI hands in the first shot looks horrific".
```
Close-up at table height in an old Italian trattoria at night, direct camera flash: an empty white plate with a fork and knife on a white tablecloth, a stemmed glass and a red glass candle holder behind it, a red leather booth. Someone at this table is starving and the food is late.
0.0–1.6 s: the camera creeps slowly toward the empty plate; the candle flame flickers inside the red glass and its red light trembles on the cloth.
1.65 s: a deep stomach growl shakes the table: the fork and knife jump and rattle against each other and the stem of the glass trembles.
1.7–5.0 s: the cutlery settles; the candle flame keeps flickering; the camera keeps creeping in.
The plate stays empty. No people, hands or faces enter the frame. {END}
```

### M02 · s002 · 7 s · 1080p
- kind: motion
- plate: chin-wait
- t0: 2.870
- story: "Dov'è la pizza?": she has been waiting forever. Then the pizza lands.
```
{MOVE} Medium close-up in {ROOM}: {HER} is slumped over the table with her chin resting on her hands behind an empty white plate, bored and starving, looking around for the waiter.
0.0–1.3 s: her eyes drift slowly to the right, searching the room; nothing.
1.3–2.2 s: she puffs out her cheeks and lets out a long sigh.
2.2–4.6 s: her eyes roll to the left, then up to the ceiling; one finger taps the rim of the empty plate.
4.9 s: a waiter's hands in white sleeves set a whole steaming pizza down on her plate from the right with a thud; the plate rattles.
4.9–5.5 s: her head snaps up off her hands, eyes wide, mouth open in delight.
5.5–7.0 s: she grins at the pizza and rubs her hands together.
She does not sing or speak. Locked camera. Only the waiter's hands enter the frame. {END}
```

## II. Chorus 1

### W03 · s003 · 4 s · 1080p
- kind: lips
- plate: sing-slice
- t0: 7.768
- lines: 2
- story: the thesis of the song, sung straight to the lens: this is not fat, it is cheese.
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "No es grasa, es queso".
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: {HER} holds a pizza slice by its crust in her bare hand beside her face, strings of melted cheese hanging from it. She is on a date with a man who counts her calories, and she tells the camera, delighted with herself, that this is not fat, it is cheese.
0.0–0.85 s: her laugh settles into a closed-mouth grin; she opens her eyes and looks straight into the lens.
0.85–1.09 s ("No es"): she sings the first two words to the lens, clearly, eyebrows up.
1.09–1.58 s ("grasa"): she shakes her head once on the word, her mouth forming it fully.
1.58–2.36 s ("es queso"): she tips her head toward the slice and sings "queso" with a wide open smile, holding the last vowel.
2.36–4.0 s: mouth closed again, she takes a big bite of the slice, cheese stretching from her teeth, her eyes still on the lens.
Her face stays large in the frame and turned to the camera the whole time; her mouth is never hidden by her hand, the slice or her hair. Handheld camera, very close and slightly tilted, holding steady on her face. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```

### M04 · s004 · 5 s · 1080p
- kind: motion
- plate: flex
- t0: 9.605
- story: "No es culpa, es progreso": she poses like a gym progress photo. The gains are pizza.
```
{MOVE} Medium shot in {ROOM}: {HER} sits in a booth flexing one bicep like a bodybuilder, her other hand on her hip, a whole pizza on a plate on the table in front of her. This is her progress photo, and she is extremely proud of it.
0.0–0.61 s: she holds the flex and grins at the lens.
On each beat (0.61, 1.22, 1.84 s): she pumps the flexed arm once, harder each time, chin up, like a bodybuilder hitting a pose for the judges.
2.45 s: she snaps into a double-biceps pose with both arms.
3.06 s: she kisses her own bicep, eyes on the lens.
3.67–5.0 s: she drops the pose, winks, and reaches for the pizza.
She does not sing or speak; her mouth stays in a closed, proud grin. Locked camera. Nobody else enters the frame. {END}
```

### M05 · s005 · 4 s · 1080p
- kind: motion
- plate: mira
- t0: 12.666
- story: "Mira cómo me lo como": watch how she eats it. New plate 2026-10-04; Obie threw out the first one ("the pizza smooshed on the girl's face looks horrible").
```
{MOVE} Close-up in {ROOM}: {HER} leans over the table toward the lens, holding a big floppy pepperoni pizza slice up in one hand, her mouth open, her eyes locked on the lens. She wants the camera to see exactly how she eats it.
0.0–0.6 s: she holds the slice up beside her face and raises her eyebrows at the lens: watch this.
0.61 s: she opens wide.
1.22 s: she chomps the tip off the slice in one big bite.
1.84 s: she pulls the slice away; melted cheese stretches between her teeth and the slice, then snaps.
2.4–4.0 s: she chews with her cheeks full, grinning, her eyes never leaving the lens.
She does not sing or speak. Handheld camera, close and a little tilted. Nobody else enters the frame. {END}
```

### W06 · s006 · 5 s · 1080p
- kind: lips
- plate: kiss
- t0: 14.503
- lines: 5
- story: "Y te mando un beso": a kiss for the man who is counting. Clean mouth since 2026-10-04: Obie, "her lips look like they have herpes ... let's just keep her mouth clean on this one". The old plate is kept as kiss-sauce.
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "Y te mando un beso".
Extreme close-up in {ROOM}: {HER}, a pizza crust in her fingers. Her lips are clean, smooth and glossy, with no sauce or food on them or around her mouth. She is sending a kiss to the man across the table who has been counting her calories, and she means it as a tease.
0.0–0.7 s: she looks into the lens with one eyebrow up and winks.
0.73–1.01 s ("Y te"): she sings the two words lightly, leaning toward the lens.
1.21–1.95 s ("mando"): she draws the word out with a slow smile.
2.09–2.26 s ("un"): a quick breath, eyes sparkling.
2.42–3.02 s ("beso"): she sings it with her lips already rounding toward a kiss.
3.1 s: she blows a big kiss straight at the lens with a smack.
3.3–5.0 s: mouth closed, she grins at the lens and lifts one shoulder in a small shrug.
Her mouth is never hidden by her hand or the crust while she sings, and her lips stay clean the whole time. Handheld camera, very close. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```

### M07 · s007 · 4 s · 1080p
- kind: motion
- plate: couple-wide
- t0: 17.564
- story: the reveal: this is a date. She devours, he calculates.
```
{MOVE} Wide shot of a couple at a table in {ROOM}. On the left, the woman from @Image1 (tan skin, jet-black hair in a messy bun, a black patent-leather halter top and choker) devours a huge pizza slice with both hands. On the right, the young man from @Image1 (slim, clean-shaven, side-parted brown hair, pale blue polo shirt) sits stiffly with a glass of sparkling water and a small salad, tapping a pocket calculator. He is adding up everything she eats; she could not care less.
On each beat (0.61, 1.22, 1.84 s): she tears a bite off the slice, cheese stretching, and chews happily; between her bites he jabs a calculator key with one stiff finger.
1.22 s: he glances at her plate, winces, and types faster.
2.45 s: he turns the calculator around and holds it up to show her the total; she does not look, and takes another bite.
3.06–4.0 s: he lowers it, defeated; she licks her thumb.
Neither of them speaks or sings. Locked camera. Nobody else enters the frame. {END}
```

### M08 · s008 · 4 s · 1080p
- kind: motion
- plate: finger-wag
- t0: 19.401
- story: "No me vengas con complejos": do not bring your hang-ups to this table.
```
{MOVE} Over the shoulder of a man in a pale blue shirt, seen from behind, in {ROOM}: {HER} leans across the table toward him with one index finger raised, a whole pizza on a plate beside her. He has just said something about her eating, and she is not having it.
On each beat (0.61, 1.22, 1.84, 2.45 s): her raised finger ticks from side to side like a metronome, a firm no, while her head shakes slowly and one eyebrow stays up.
1.84 s: his shoulders sink.
2.45 s: without taking her eyes off him, her other hand slides the pizza plate across the tablecloth toward herself.
3.06–4.0 s: she lowers the finger, taps the table once, and sits back, satisfied.
She does not sing or speak; her lips stay pressed together. He stays seen from behind. Locked camera. {END}
```

### M09 · s009 · 4 s · 1080p
- kind: motion
- plate: him-calc
- t0: 21.850
- story: "Tú contando calorías": he is counting, and the number frightens him.
```
{MOVE} Close-up in {ROOM}: {HIM} is hunched over a pocket calculator on the table, the tip of his tongue between his teeth, a glass of sparkling water and a small salad in front of him. He is counting every calorie on his date's plate.
On each beat (0.61, 1.22, 1.84, 2.45 s): he jabs one key with a stiff index finger; after each jab his eyes flick up toward her plate across the table and back down to the calculator.
2.45 s: his eyebrows climb as he reads the total.
3.06–4.0 s: he swallows hard and pulls the calculator closer to his chest.
He does not speak or sing. Locked camera. Nobody else enters the frame. {END}
```

### F10 · s010 · 5 s · 720p
- kind: insert
- plate: pizza-top
- t0: 24.299
- story: "Yo contando pepperonis": she counts too, but only the pepperoni.
```
Top-down view of a whole pepperoni pizza on a white tablecloth, direct camera flash; a woman's hand with glossy black nails points at one slice of pepperoni. She is counting them, one by one.
From 0.61 s, on every half beat (0.61, 0.92, 1.22, 1.53, 1.84, 2.14, 2.45, 2.76 s): her fingertip taps a different slice of pepperoni, moving clockwise around the pizza.
3.06 s: she pinches one slice of pepperoni between finger and thumb and lifts it up out of the frame.
3.4–5.0 s: the hand returns and rests on the rim of the plate.
The pizza and the plate stay perfectly still. Locked camera, straight down. No faces enter the frame. {END}
```

## III. The Italian chorus

### M11 · s011 · 6 s · 1080p
- kind: motion
- plate: waiters-watch
- t0: 27.360
- story: "Amore, non è grasso: è formaggio": the old waiters watch her eat, and they approve.
```
{MOVE} Medium shot at the kitchen door of {ROOM}: three old Italian waiters in white jackets and black bow ties stand shoulder to shoulder, watching a woman eat across the room. They have served for forty years and have never seen anyone love pizza like this.
0.0–1.0 s: all three stare, wide-eyed, heads leaning out a little further.
1.04–3.84 s: the waiter on the left leans to the ear of the one in the middle and whispers behind his raised hand; the middle one's eyebrows rise and he nods slowly; the one on the right cranes his neck to hear.
3.9–4.9 s: all three nod together in admiration.
4.3 s: the middle waiter kisses his fingertips and opens his hand, a chef's kiss.
4.9–6.0 s: they keep watching, smiling.
The whisperer's mouth stays hidden behind his hand; nobody is heard speaking. Locked camera. {END}
```

### F12 · s012 · 5 s · 720p
- kind: insert
- plate: another-slice
- t0: 31.645
- story: "Un'altra fetta, per favore": another slice arrives before she has finished asking.
```
Close-up at a restaurant table, direct camera flash: a waiter's white-gloved hand slides a huge pizza slice from a silver server onto a white plate; beside it a woman's hand with glossy black nails holds one finger up.
0.0–1.2 s: the gloved hand tips the server and the slice slides onto the plate and flops down, melted cheese stretching behind it.
1.6–2.4 s: her raised finger wags twice: one more.
2.5–3.2 s: the gloved hand withdraws with the empty server.
3.2–5.0 s: her hand comes down, takes the rim of the plate and pulls it toward her.
Locked camera. No faces enter the frame. {END}
```

## IV. Verse 1

### W24 · s024 · 4 s · 1080p
- kind: lips
- plate: buena
- t0: 53.074
- lines: 23
- story: "Di: qué buena estás tú": if you are going to talk about my body, say this.
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "Di: qué buena estás tú".
Close-up in {ROOM}: {HER}, her hair still flying from a flip, pointing at herself with one thumb. Her date has been commenting on her body; she tells him the only thing he is allowed to say about it.
0.0–0.85 s: her hair settles; she looks into the lens, cocky, lips closed in a half smile.
0.88–1.10 s ("Di: qué"): she sings the two words with her chin lifted.
1.16–1.85 s ("buena estás"): she sings them slowly, jabbing her thumb at her own chest on "buena".
1.95–2.15 s ("tú"): she sings the last word with both eyebrows up and a tilt of the head.
2.2–4.0 s: mouth closed, she holds a smug smile and raises one eyebrow.
Her mouth is never hidden by her hand or her hair while she sings. Handheld camera, very close, slightly tilted. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```

## V. Pre-chorus

### M25 · s025 · 4 s · 1080p
- kind: motion
- plate: him-water
- t0: 54.298
- story: "Tú con tu agua sin gas": he drinks still water, joylessly.
```
{MOVE} Medium shot in {ROOM}: {HIM} sits bolt upright in a booth holding a glass of still water with a paper straw, little finger raised. He is the most careful eater in the city and proud of it.
0.0–1.0 s: he lifts the glass with precise fingers and brings the straw to his lips.
1.1–2.4 s: he takes one long, joyless sip through the straw, cheeks hollow, eyes fixed straight ahead.
2.6–3.1 s: he sets the glass down exactly where it stood and dabs the corners of his mouth with a napkin.
3.2–4.0 s: he straightens his collar and sits even more upright.
He does not speak or sing. Locked camera. Nobody else enters the frame. {END}
```

### M26 · s026 · 4 s · 1080p
- kind: motion
- plate: dough-toss
- t0: 56.747
- story: "Yo con masa artesanal": her side of the argument is a man throwing dough in front of a fire.
```
{MOVE} Medium shot in the kitchen of an old Italian trattoria: a big pizzaiolo with a thick moustache and a white apron tosses a spinning disc of pizza dough in front of a blazing wood-fired oven, flour hanging in the air. This is his art and he knows it.
0.0–0.6 s: he spins the dough on his knuckles.
0.6–1.8 s: he throws it high; it spins flat in the air and he catches it on the backs of his hands.
1.9–3.0 s: a second, higher throw; the flames roar behind him and flour puffs from his apron.
3.0–4.0 s: he catches it, lets it drape over his fists, and grins proudly at the lens.
He does not speak or sing. Locked camera. Nobody else enters the frame. {END}
```

### M28 · s028 · 5 s · 1080p
- kind: motion
- plate: box-slam
- t0: 62.258
- story: "Yo: una grande pa' llevar": his warning is answered with a large one to go.
```
{MOVE} Medium shot at a table in {ROOM}: {HER} has just slammed an enormous closed white pizza box down in front of her startled date, the young man in a pale blue polo shirt; napkins are still in the air. He told her pizza is bad for her. This is her answer.
0.0–0.6 s: the napkins flutter down; he flinches back in his seat, eyes wide.
0.9–2.5 s: she drums both palms on the lid of the box, grinning at him; he looks at the box, then at her, speechless.
3.0–3.67 s: she picks the box up with both hands and thrusts it flat toward the lens until its plain white lid fills the whole frame.
3.67–5.0 s: the white lid holds, filling the frame.
Neither of them speaks or sings. The box is plain white with nothing printed on it. Locked camera. {END}
```

## VI. Chorus 2

### W29 · s029 · 4 s · 1080p
- kind: lips
- plate: table-top
- t0: 65.319
- lines: 28
- story: second chorus: she is on the table now, singing it to the whole room.
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "No es grasa, es queso".
Full-length shot in {ROOM}: {HERFAR} kneels on top of a restaurant table like a diva on a stage, a pizza slice in one hand and her other arm thrown wide. She is singing her gospel to the whole dining room.
0.0–0.85 s: she takes a breath, chest up, eyes on the lens.
0.86–1.10 s ("No es"): she sings the words out to the room.
1.14–1.57 s ("grasa"): she sweeps her free arm across in front of her, dismissing the word.
1.65–2.37 s ("es queso"): she raises the slice high above her head like a trophy and holds the last note.
2.4–4.0 s: mouth closed, she lowers the slice, takes a triumphant bite and bows to the room.
The slice never covers her mouth while she sings. Locked camera, wide. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```

### M31 · s031 · 4 s · 1080p
- kind: motion
- plate: bite-c
- t0: 70.829
- story: the middle bite of three: she crosses her eyes with her mouth full.
```
{MOVE} Extreme close-up in {ROOM}: {HER} bites into a pizza slice folded in half, her cheeks bulging, eyes wide on the lens. She is showing off how she eats, and she is about to pull a face.
0.0–0.6 s: she chews with her cheeks bulging, eyes wide at the lens.
0.61 s: she goes cross-eyed like a child pulling a silly face: her two eyes turn toward each other, her left iris sliding toward her nose and her right iris sliding toward her nose, until both pupils point at the tip of her own nose. Her eyebrows shoot up. She is not looking to the side: each eye looks inward.
0.61–1.3 s: she holds the cross-eyed face, still chewing. Her irises and pupils stay fully visible the whole time; her eyes never roll back and never turn white.
1.3–2.0 s: her eyes uncross and she laughs through her nose.
2.0–4.0 s: she takes another bite of the folded slice.
She does not sing or speak. Handheld camera, far too close. Nobody else enters the frame. {END}
```

### F31 · s031 · 4 s · 1080p
- kind: insert
- plate: bite-x
- t0: 70.829
- story: the crossed-eyes bite, started from a plate whose eyes are already crossed. M31 tried it from the prompt alone three times: two takes rolled her eyes white and one gave a side-eye.
```
Extreme close-up in a red leather booth of an old Italian trattoria at night, direct camera flash: a woman in a black patent-leather halter top and choker, black hair pulled back in a messy bun, bites into a folded pizza slice with her eyes crossed. She is pulling a silly face at the lens on purpose, like a child.
0.0–1.4 s: she holds the cross-eyed face exactly as it is in the first frame, both pupils pointing at the tip of her nose, while she chews with her cheeks bulging and her eyebrows bob up twice. Her irises and pupils stay fully visible the whole time; her eyes never roll back and never turn white.
1.4–2.0 s: her eyes snap back to normal and look straight into the lens; she laughs through her nose with her mouth full.
2.0–4.0 s: she keeps chewing and grinning at the lens.
She does not sing or speak. Handheld camera, far too close. Her hair stays off her face. Nobody else enters the frame. {END}
```

### M32 · s032 · 5 s · 1080p
- kind: motion
- plate: kiss-waiter
- t0: 72.053
- story: "Y te mando un beso": this time the kiss lands on an old waiter, who nearly faints.
```
{MOVE} Medium shot in a booth in {ROOM}: {HER} kisses the cheek of a delighted old Italian waiter in a white jacket and black bow tie, who beams with his eyes shut; a red lip print already marks his other cheek. He brought her the pizza; this is his tip.
0.0–1.2 s: she holds the kiss on his cheek; his shoulders rise and his smile widens.
1.22 s: she pulls back with a smack.
1.8–3.0 s: he touches his cheek with his fingertips and puts his other hand on his heart; she laughs and wipes her mouth with the back of her hand.
3.06–5.0 s: he sways and pretends to swoon back against the booth, fanning himself; she applauds.
Neither of them speaks or sings. Locked camera. Nobody else enters the frame. {END}
```

### M34 · s034 · 4 s · 1080p
- kind: motion
- plate: calc-dunk
- t0: 76.951
- story: "No me vengas con complejos": his calculator goes into the marinara like a biscuit into coffee.
```
{MOVE} Close-up at a table in {ROOM}: {HER} grins at the lens as she holds a pocket calculator over a bowl of marinara sauce. It is her date's calculator, the one he has been counting her calories on.
On each beat (0.61, 1.22, 1.84 s): she dunks the calculator into the sauce and lifts it out again, dripping, like dunking a biscuit, her grin wider each time.
2.45 s: she holds the dripping calculator up beside her face and raises her eyebrows at the lens.
3.06–4.0 s: she drops it into the bowl with a plop and dusts off her fingers.
She does not sing or speak, and she does not lick anything. Locked camera. Nobody else enters the frame, and no other hands appear. {END}
```

### F35 · s035 · 4 s · 720p
- kind: insert
- plate: calc-sauce
- t0: 79.400
- story: "Tú contando calorías": the calculator drowns, still counting.
```
Macro shot of a pocket calculator half sunk in a bowl of thick red marinara sauce, bubbles rising around it, hard direct flash.
0.0–4.0 s: the calculator sinks slowly deeper into the sauce, tilting a little more as it goes.
1.2 s and 2.4 s: a big bubble swells beside it and pops.
3.2–4.0 s: the sauce closes over the last row of keys.
The camera is locked and does not move. No hands or faces enter the frame. {END}
```

### M36 · s036 · 4 s · 1080p
- kind: motion
- plate: medals
- t0: 81.849
- story: "Yo contando pepperonis": she decorates him for his service.
```
{MOVE} Medium shot in {ROOM}: {HIM} sits frozen and stiff in a booth while a woman's two hands with glossy black nails press slices of pepperoni onto the chest of his polo shirt in a neat row, like military medals. He counted her calories all night; she is awarding him for it.
On each beat (0.61, 1.22, 1.84, 2.45 s): one of her hands slaps another slice of pepperoni onto his chest at the end of the row; he flinches at every slap, eyes straight ahead, jaw tight.
3.06 s: her hand pats his chest twice, like pinning on a medal.
3.3–4.0 s: he swallows and looks down at his chest without moving his head.
He does not speak or sing. Only her hands and forearms enter the frame, from the right; her face stays out of frame. Locked camera. {END}
```

## VII. Verse 2

### F37 · s037 · 4 s · 720p
- kind: insert
- plate: oven-out
- t0: 84.298
- story: "Me gusta bien caliente": played as a straight-faced food commercial.
```
A bubbling pizza slides out of a blazing wood-fired oven on a long wooden peel, flames behind it, steam rising. A luxurious, slow food commercial.
0.0–4.0 s: the peel draws the pizza slowly toward the lens out of the mouth of the oven; the cheese bubbles and blisters; flames lick the roof of the oven; steam curls upward.
A very slow push in. No hands or faces enter the frame. {END}
```

### F38 · s038 · 4 s · 720p
- kind: insert
- plate: box-open
- t0: 86.747
- story: "Y que se abra poco a poco": the box opens by itself, slowly.
```
A plain white pizza box on a table in a dark room, its lid lifting by itself; golden light and steam pour out of the gap.
0.0–3.0 s: the lid rises very slowly, a little at a time; the band of golden light widens and steam rolls out over the edge.
3.0–4.0 s: the lid stops half open; the steam keeps rising.
The box is plain, with nothing printed on it. Locked camera. No hands or faces enter the frame. {END}
```

### F39 · s039 · 4 s · 720p
- kind: insert
- plate: crust-edge
- t0: 89.196
- story: "La prefiero con buen borde": a fingertip admires the crust.
```
Extreme macro of the blistered, charred, puffy edge of a pizza crust; a woman's fingertip with a glossy black nail rests on it.
0.0–2.4 s: the fingertip glides slowly along the crust from left to right, riding over each blister.
2.4–3.0 s: it presses one charred bubble, which crackles and flakes.
3.0–4.0 s: the fingertip lifts away; crumbs settle.
A very slow drift to the right with the finger. No faces enter the frame. {END}
```

### F41 · s041 · 4 s · 720p
- kind: insert
- plate: dough-thick
- t0: 94.094
- story: "Si la masa viene gruesa": big hands, thick dough.
```
Close-up of a pizzaiolo's big floury hands pressing into a thick ball of pizza dough on a marble counter, flour in the air, hard direct flash.
0.61 s and 1.84 s: the heels of both hands push deep into the dough and roll it forward; a puff of flour jumps each time.
Between the pushes the hands fold the dough back toward the body.
3.0–4.0 s: the hands rest on the dough; flour drifts down.
Locked camera. No faces enter the frame. {END}
```

### M42 · s042 · 4 s · 1080p
- kind: motion
- plate: her-knead
- t0: 96.543
- story: "La trabajo sin parar": she has gone into the kitchen to do it herself.
```
{MOVE} Medium shot in the kitchen of an old Italian trattoria, direct camera flash: {HER} kneads pizza dough on a floury marble counter, flour up to her elbows, biting her lip in concentration. She does not stop.
On each beat (0.61, 1.22, 1.84, 2.45 s): she drives the heels of both hands forward into the dough with her whole weight, then folds it back; a puff of flour jumps with every push.
3.06 s: without stopping, she wipes her forehead with the back of her wrist, leaving a smudge of flour.
3.3–4.0 s: one more push, harder.
She does not sing or speak. Locked camera. Nobody else enters the frame. {END}
```

### F43 · s043 · 4 s · 720p
- kind: insert
- plate: cheese-pull
- t0: 98.992
- story: "Cuando estira mozzarella": the pull, played as a straight-faced food commercial.
```
Extreme macro of a pizza slice being lifted from the pie: a thick curtain of melted mozzarella stretches between the slice and the pizza. A glossy food commercial, hard direct flash, deep shadows.
0.0–4.0 s: the slice rises slowly and steadily; the strands of mozzarella stretch longer and thinner and glisten; at 2.0 s one strand snaps and springs back; a little steam drifts up from the pie.
The camera is locked and does not move. One continuous shot, no cuts. No hands or faces enter the frame. No text, letters or logos.
```

### M44 · s044 · 4 s · 1080p
- kind: motion
- plate: rope-walk
- t0: 100.829
- story: "La voy jalando sin soltar": she will not let go of the cheese.
```
{MOVE} Wide shot in {ROOM}: {HERFAR} leans back in a booth, hauling on one impossibly long, thick rope of melted mozzarella with both fists, like a tug-of-war; the rope runs to a pizza on the next table at the right edge of the frame. She will not let go, and she thinks this is the funniest thing that has ever happened.
On each beat (0.61, 1.22, 1.84, 2.45 s): she hauls the rope in by one arm's length, hand over hand, leaning further back each time; the rope stretches thinner and bounces but never snaps.
2.45 s: she throws her head back, laughing.
3.06–4.0 s: she wraps the rope once around her fist and pulls again.
The pizza stays on the far table. She laughs but does not sing or speak. Locked camera. Nobody else enters the frame. {END}
```

### F46 · s046 · 4 s · 720p
- kind: insert
- plate: stuffed-crust
- t0: 104.502
- story: "Con los bordes bien rellenos": a stuffed crust, torn open.
```
Extreme macro of two hands tearing a stuffed pizza crust apart; melted cheese oozes out of the crust, hard direct flash.
0.0–4.0 s: the hands pull the two halves slowly apart; thick ropes of cheese stretch between them, sag, and drip; a wisp of steam rises from the torn crust.
Locked camera. No faces enter the frame. {END}
```

### F49 · s049 · 4 s · 720p
- kind: insert
- plate: drip-fingers
- t0: 108.482
- story: "Si me chorrea por los dedos": it runs down her fingers.
```
Extreme macro of a woman's fingers with glossy black nails; tomato sauce and melted cheese run down them, hard direct flash.
0.0–2.0 s: one thick drip of sauce and cheese slides slowly down the fingers, gathers at a fingertip, and falls.
2.0–4.0 s: the fingers flex a little; a second drip forms and stretches.
Locked camera. No faces enter the frame. {END}
```

### M53 · s053 · 4 s · 1080p
- kind: motion
- plate: scandal
- t0: 114.910
- story: "È osceno? No, è gastronomico": the grandmother is shocked, then interested.
```
{MOVE} Medium shot in a booth in {ROOM}: a tiny Italian grandmother in a black dress and pearls clutches her chest in shock beside an old waiter in a white jacket, who covers his eyes with one hand. They have just watched a young woman eat a pizza in a way they cannot unsee.
0.0–1.4 s: the grandmother gasps, her hand flies to her pearls, her eyes are huge; the waiter keeps his eyes covered and turns his head away.
1.66 s: the waiter spreads two fingers and peeks through them.
2.1–3.5 s: the grandmother's shock melts into a slow, interested smile, and she leans forward for a better look; the waiter keeps peeking and begins to nod.
3.5–4.0 s: she pats the waiter's arm without looking away.
Neither of them speaks. Locked camera. Nobody else enters the frame. {END}
```

### M54 · s054 · 4 s · 1080p
- kind: motion
- plate: two-more
- t0: 117.359
- story: "Che vergogna… dammene due": what a disgrace. She will have two.
```
{MOVE} Medium shot in a booth in {ROOM}: a tiny Italian grandmother in a black dress and pearls holds a white napkin at her temple and two fingers in the air. She is scandalised, and she is ordering.
0.6–1.4 s: she fans herself quickly with the napkin, eyes rolled up to heaven.
1.7–2.3 s: she stops fanning, glances left and right, and thrusts two fingers up firmly to order.
2.4–4.0 s: she holds the two fingers high, gives one decisive nod, and lets a small wicked smile escape.
She does not speak. Locked camera. Nobody else enters the frame. {END}
```

## VIII. Bridge

### W55 · s055 · 4 s · 1080p
- kind: lips
- plate: novela-her
- t0: 119.808
- lines: 54
- story: "Ay, ay, ay": telenovela despair, played completely straight.
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "Ay, ay, ay".
Telenovela close-up in {ROOM}, soft glow and starburst highlights, a wind machine in her hair: {HER} with the back of her hand pressed to her forehead, acting out theatrical despair like the heroine of a soap opera who has just heard terrible news. Her boyfriend wants a model for a girlfriend; she wants extra sauce. It is the tragedy of the century, and she is overacting it on purpose.
0.0–0.6 s: she looks up at the ceiling with her eyebrows knitted, mouth closed.
0.63–0.82 s (first "ay"): she sings it as a dramatic sigh of grief, shaking her head.
1.26–1.44 s (second "ay"): she sings it again, looking up, her eyebrows climbing.
1.95–2.23 s (third "ay"): the biggest one, sung straight to the lens with her free hand laid over her heart.
2.3–3.2 s: mouth closed, she holds the tragic pose and sniffs once.
3.2–4.0 s: she peeks sideways at the lens to check the camera is still watching, then goes back to the pose.
Her hand stays on her forehead and never covers her mouth. Slow push in. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```

### M58 · s058 · 5 s · 1080p
- kind: motion
- plate: salsa-douse
- t0: 126.237
- story: "Yo quiero salsa adicional": she asked for extra sauce. She gets all of it.
```
{MOVE} Medium shot in a booth in {ROOM}: {HER} sits with her arms open and her eyes closed, laughing, as a thick cascade of red marinara sauce pours down over her head and shoulders from above and splashes on the white tablecloth. She asked for extra sauce, and this is the happiest moment of her life.
0.0–5.0 s: the sauce keeps pouring in one thick stream onto the top of her head and runs down her shoulders and arms.
0.0–1.4 s: she laughs with her face tipped up into it.
1.44 s: she opens her arms wider and shakes her shoulders.
2.1–3.1 s: she cups both hands and lets them fill with sauce.
3.2–5.0 s: she wipes her eyes with her fingers, opens them, and grins at the lens through the sauce.
She laughs but does not sing or speak. Locked camera. Nobody else enters the frame. {END}
```

### M62 · s062 · 5 s · 1080p
- kind: motion
- plate: globe-pizza
- t0: 136.033
- story: "Yo comiéndome medio mundo": she eats half the world. Literally.
```
{MOVE} Close-up in {ROOM}: {HER} holds a round pizza decorated like the planet Earth, green pesto continents on white cheese oceans, with her mouth on its edge and her eyes wide on the lens. He watches her figure; she is eating half the world.
0.61 s: she takes a huge bite out of the edge of the globe.
1.2–2.0 s: she tears the bite away, cheese stretching from the pizza to her teeth, and chews with her eyes wide.
2.45 s: she turns the pizza a quarter turn in her hands and bites the next continent.
3.0–5.0 s: she chews with her cheeks full and nods slowly, approving of the planet.
She does not sing or speak. Handheld camera, very close. Nobody else enters the frame. {END}
```

### M64 · s064 · 4 s · 1080p
- kind: motion
- plate: survive
- t0: 141.849
- story: "Le dije: piensa en sobrevivir": he said think of the summer. She said think of surviving.
```
{MOVE} Close-up in {ROOM}: {HER} stares straight into the lens, deadpan, her cheeks stuffed with pizza like a hamster, a pizza slice in each hand. She is entirely serious.
0.0–1.2 s: she chews very slowly without blinking, eyes locked on the lens.
1.22 s: she raises the slice in her right hand and takes another bite without breaking the stare.
2.45 s: she does the same with the slice in her left hand; her cheeks get fuller.
3.0–4.0 s: she keeps chewing, expressionless.
She does not sing or speak, and she never smiles. Locked camera. Nobody else enters the frame. {END}
```

### W66 · s066 · 6 s · 1080p
- kind: lips
- plate: ultimatum
- t0: 147.053
- lines: 65
- story: "Esta relación termina aquí": touch her slice and it is over.
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "Esta relación termina aquí".
Medium close-up in {ROOM}: {HER} leans over the table, dead serious, guarding the last pizza slice on her plate with one arm and holding a fork in the other hand. Her date has just reached for her slice. This is an ultimatum.
0.0–0.6 s: she stares into the lens, unblinking, mouth closed.
0.68–0.98 s ("Esta"): she sings it low and cold.
1.16–1.96 s ("relación"): she sings the word slowly, drawing the plate closer with her forearm.
2.12–2.73 s ("termina"): she sings it with a small shake of the head.
2.79–3.23 s ("aquí"): she sings it and stabs the fork down into the slice.
3.3–6.0 s: mouth closed, she holds the stare; at 4.5 s she lifts the slice on the fork and takes one slow bite without looking away.
Her mouth is never hidden while she sings. Locked camera. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```

## IX. Chorus 3

### M67 · s067 · 4 s · 1080p
- kind: motion
- plate: queen-booth
- t0: 151.645
- story: he is gone. She has the big booth and four pizzas to herself.
```
{MOVE} Wide symmetrical shot in {ROOM}: {HERFAR} lounges alone in the middle of a big round red leather booth with her arms spread along the backrest like a queen on a throne, four whole pizzas on the table in front of her. She is single and she has never been happier.
0.0–1.8 s: her head rolls slowly from side to side in bliss, eyes closed; her fingers tap the top of the booth on the beats (0.61, 1.22 s).
1.84 s: without looking, she reaches down and lifts a slice from the nearest pizza.
2.45–4.0 s: she raises the slice like a sceptre and opens her eyes to the lens.
She does not sing or speak. A slow push in. Nobody else enters the frame. {END}
```

### M68 · s068 · 5 s · 1080p
- kind: motion
- plate: peel-carry
- t0: 153.481
- story: "No es culpa, es progreso": the waiters carry her through the room like a queen.
```
{MOVE} Wide shot in {ROOM}: four old Italian waiters in white jackets and black bow ties carry {HERFAR} on their shoulders on a giant wooden pizza peel, like a queen on a litter; she reclines on it holding a pizza slice. The whole restaurant is on her side now.
On each beat (0.61, 1.22, 1.84, 2.45, 3.06 s): the waiters take one step in time, left to right, and the peel bobs gently.
0.6–1.8 s: she waves the slice to the room like a royal wave.
1.84 s: she blows a kiss to the diners.
3.06 s: she takes a bite of the slice.
3.67–5.0 s: the procession keeps marching; she chews and salutes.
Nobody speaks or sings. The camera tracks slowly alongside them. {END}
```

### M70 · s070 · 5 s · 1080p
- kind: motion
- plate: kiss-2
- t0: 158.379
- story: "Y te mando un beso": the kiss again, closer, right onto the lens.
```
{MOVE} Extreme close-up in {ROOM}: {HER} with her eyes closed and her lips puckered into a big kiss aimed at the lens, a smear of tomato sauce at the corner of her mouth. This kiss is for you.
0.0–2.3 s: she leans slowly toward the lens, lips puckered, eyes closed, until her face fills the frame.
2.42 s: she plants the kiss right on the lens with a smack.
2.6–3.6 s: she pulls back, opens her eyes, and laughs.
3.67–5.0 s: she wipes the lens with her thumb and grins.
She does not sing or speak. Locked camera. Nobody else enters the frame. {END}
```

### M72 · s072 · 4 s · 1080p
- kind: motion
- plate: tape-tear
- t0: 163.277
- story: "No me vengas con complejos": the measuring tape does not survive.
```
{MOVE} Medium close-up in {ROOM}: {HER} holds a yellow measuring tape stretched tight between her two fists and bites it in the middle, grinning fiercely. It is the tape her date measured her with.
0.0–1.8 s: she gnaws and tugs at the tape with her teeth, shaking her head from side to side like a terrier, growling playfully.
1.84 s: the tape snaps in two; her fists fly apart.
2.45 s: she spits out the end and tosses both halves back over her shoulders.
3.06–4.0 s: she dusts off her hands and laughs at the lens.
She does not sing or speak. Locked camera. Nobody else enters the frame. {END}
```

### M74 · s074 · 5 s · 1080p
- kind: motion
- plate: pepperoni-rain
- t0: 168.175
- story: "Yo contando pepperonis": too many to count now.
```
{MOVE} Medium shot in a booth in {ROOM}: {HER} sits with her arms open and her face turned up, laughing, as slices of pepperoni rain down on her like confetti. She was counting pepperonis; now there are too many to count.
0.0–5.0 s: pepperoni slices keep falling all around her and bounce off the table.
0.0–1.8 s: she sways from side to side with her arms open, laughing.
1.84 s: she catches one slice in her mouth.
2.45 s: she points at the lens, chewing.
3.06–5.0 s: she tries to count the falling slices on her fingers, loses count, and throws both hands up.
She does not sing or speak. Locked camera. Nobody else enters the frame. {END}
```

## X. Breakdown

### F80 · s080 · 6 s · 720p
- kind: insert
- plate: four-cheeses
- t0: 179.196
- story: "Pásame los cuatro quesos": four waiters pass her the four cheeses.
```
Top-down view of a white tablecloth with four white plates, each holding a different cheese: a ball of mozzarella, a wedge of parmesan, a wedge of blue-veined gorgonzola and a round of provolone. Four waiters' hands in white sleeves reach in from the four corners.
At 0.9, 1.5, 2.1 and 2.7 s, one after another, clockwise: each hand pushes its plate toward the centre of the table.
3.1 s: the four plates meet in the middle with a clink.
3.3–4.2 s: the four hands withdraw to the corners.
4.2–6.0 s: the four plates sit together in the centre, still.
Locked camera, straight down. No faces enter the frame. {END}
```

## XI. Final chorus

### W81 · s081 · 4 s · 1080p
- kind: lips
- plate: guadalupe
- t0: 183.481
- lines: 80
- story: final chorus: Nuestra Señora del Queso. She appears as the Virgin of Guadalupe and delivers the word. Obie: "hopefully the video you make for this makes her into the virgin mary or guadalupe hahah go wild".
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "No es grasa, es queso".
A devotional portrait come to life, waist up, against a dark red backdrop: the woman from @Image1 (warm tan skin, winged eyeliner, coral lips, dark hair under a mantle made of a red-and-white checkered tablecloth scattered with gold stars) holds her hands pressed together in prayer at her chest; a whole pepperoni pizza glows behind her head like a halo, golden breadsticks radiate around her like rays of light, and red roses and lit candles stand below. She is Our Lady of Cheese, and she is delivering the word with perfect serenity.
0.0–0.85 s: her eyes are lowered, her mouth closed; the candle flames sway and the pizza behind her head turns slowly like a wheel.
0.86–1.12 s ("No es"): she lifts her eyes to the lens and sings the two words calmly.
1.18–1.62 s ("grasa"): she sings the word with the smallest shake of her head.
1.68–2.38 s ("es queso"): she sings "queso" with a serene smile, holding the last vowel; the halo and the rays flare brighter.
2.4–4.0 s: mouth closed, she lowers her eyes again with a small holy smile; the gold stars on her mantle glint and the candle flames flicker.
Her hands stay pressed together in prayer below her chin and never cover her mouth. Locked camera with a very slow push in. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```

### M82 · s082 · 5 s · 1080p
- kind: motion
- plate: conga
- t0: 185.318
- story: "No es culpa, es progreso": the whole restaurant joins the conga.
```
{MOVE} Wide shot in {ROOM}: a conga line dances between the booths toward the camera. At the front, {HERFAR} holds a whole pizza high in one hand; behind her come old waiters in white jackets, a tiny grandmother in pearls and a pizzaiolo in an apron, each holding the one in front, everyone laughing.
On each beat (0.61, 1.22, 1.84, 2.45, 3.06, 3.67 s): the whole line takes one conga step toward the camera together; on 1.84 and 3.67 s everyone kicks one leg out to the side.
Throughout: she pumps the pizza up into the air on the beats and looks back over her shoulder, laughing, at 2.45 s.
Nobody sings or speaks. The camera glides backward ahead of the line. {END}
```

### M84 · s084 · 5 s · 1080p
- kind: insert
- plate: kiss-4
- t0: 190.216
- story: "Y te mando un beso": kisses for everyone, and the waiters applaud. New plate 2026-10-04: the safety filter refused the first picture three times.
```
Close-up in a red leather booth of an old Italian trattoria at night, direct camera flash: a woman in a black patent-leather halter top and choker, black hair pulled back in a messy bun, winks and blows a kiss off her open palm toward the lens, holding a pepperoni pizza slice up high in her other hand like a trophy. Behind the booth three old waiters in white jackets and black bow ties applaud. She is having the best night of her life.
On each beat (0.61, 1.22, 1.84 s): she blows a kiss off her palm toward the lens, three kisses, one per beat; the waiters clap in time.
2.42 s: she thrusts the slice higher and laughs with her eyes open; the waiters cheer.
3.06–5.0 s: she nods a little bow to the lens, still holding the slice up; the waiters keep applauding.
Her face stays clear of hair. Nobody sings or speaks. Handheld camera, close. {END}
```

### M86 · s086 · 4 s · 1080p
- kind: motion
- plate: exit-boxes
- t0: 195.114
- story: "No me vengas con complejos": she leaves with every pizza in the building.
```
{MOVE} Full-length shot from inside {ROOM}: {HERFAR}, seen from behind, pushes out through the front door into the night street carrying a tall stack of plain white pizza boxes, glancing back over her shoulder with a grin. She is leaving, and the pizza is coming with her.
0.0–1.2 s: she holds the look back over her shoulder and raises her eyebrows twice.
1.22 s: she turns away and shoulders the door open.
1.84–3.0 s: she walks out into the street with a swing in her hips; the stack of boxes sways and does not fall.
3.06–4.0 s: the door swings shut behind her.
She does not sing or speak. The boxes are plain white with nothing printed on them. Locked camera. Nobody else enters the frame. {END}
```

### M88 · s088 · 5 s · 1080p
- kind: motion
- plate: scooter
- t0: 200.012
- story: "Yo contando pepperonis": she rides off into the night with the boxes.
```
{MOVE} Wide night shot of a wet cobbled street, direct camera flash: {HERFAR} rides a red vintage scooter with a tall stack of plain white pizza boxes strapped behind her, a pizza slice in one hand, her loose hair flying. She got the pizza in the break-up.
0.0–5.0 s: the scooter rolls steadily along the street; the headlight glints on the wet cobbles and the stack of boxes sways.
1.22 s: she takes a bite of the slice without slowing down.
2.45 s: she waves the slice in the air like a flag.
3.67–5.0 s: she leans into a gentle curve and rides on.
She does not sing or speak. The camera tracks alongside her at the same speed. The scooter and the boxes carry no badges or lettering. {END}
```

## XII. Outro

### M89 · s089 · 4 s · 1080p
- kind: motion
- plate: after-hours
- t0: 203.685
- story: "No me mires": after closing. She covers the lens.
```
{MOVE} Wide shot of {ROOM} after closing, chairs upside down on the tables and one light left on: {HERFAR} sits alone in a booth with one last pizza, one hand stretched out toward the lens. The night is over and she would like some privacy with her pizza.
0.0–0.9 s: she looks at the lens, deadpan.
0.9–2.4 s: she leans forward and her open palm comes steadily toward the lens until it covers the whole frame.
2.4–4.0 s: her palm holds over the lens; the frame stays dark.
She does not sing or speak. Locked camera. Nobody else enters the frame. {END}
```

### M91 · s091 · 7 s · 1080p
- kind: motion
- plate: parm-snow
- t0: 208.583
- story: "No me escondas los aderezos": parmesan falls like snow. A quiet moment.
```
{MOVE} Close-up in {ROOM}: {HER} holds a parmesan shaker high above a pizza and shakes it; a wide flurry of grated cheese drifts down through the light like snow. The song is slowing down, and so is she.
0.0–3.0 s: she shakes the shaker gently; the cheese falls slowly in soft flurries; her eyes are half closed.
3.1 s: she turns her face up into the falling cheese and closes her eyes.
3.1–5.0 s: the cheese settles on her hair, her lashes and her shoulders.
5.0–7.0 s: she lowers the shaker, opens her eyes to the lens, and smiles a small, tired, happy smile.
She does not sing or speak. Everything moves slowly and calmly. Locked camera. Nobody else enters the frame. {END}
```

### M92 · s092 · 8 s · 1080p
- kind: insert
- plate: last-pull
- t0: 213.481
- story: "No es grasa… es queso": the last pull, as slow as the music.
```
Extreme close-up in a red leather booth of an old Italian trattoria at night, direct camera flash: a woman in a black patent-leather halter top and choker, black hair pulled back in a messy bun, slowly draws a pizza slice away from her mouth, a long string of melted mozzarella stretching between her teeth and the slice, her eyes on the lens. It is the last slice of the night and she is making it last.
0.0–3.3 s: she pulls the slice away very slowly; the string of cheese stretches longer and thinner; her eyes stay on the lens.
3.3–4.1 s: the slice is at arm's length and the string trembles.
4.1 s: the string snaps and springs back against her chin.
4.5–6.0 s: she laughs silently and wipes the cheese off her chin with one finger.
6.0–8.0 s: she rests her chin on her hand and looks at the lens, content.
Her face stays clear of hair. She does not sing or speak. Everything moves slowly. Locked camera, very close. {END}
```

### W93 · s093 · 10 s · 1080p
- kind: lips
- plate: whisper
- t0: 220.216
- lines: 92
- story: the last line, whispered. Then a burp, and she cannot stop giggling.
```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "No es grasa, es queso".
Close-up in {ROOM} after closing, the room empty behind her: {HER} rests her chin on her hand above a plate with one last pizza crust, a small satisfied smile on her face. She has eaten everything, and she has one last thing to say.
0.0–0.9 s: she gazes at the lens, mouth closed.
0.93–1.85 s ("No es grasa"): she sings the three words softly, almost a whisper.
1.85–2.8 s: mouth closed, a slow knowing smile spreads.
2.84–3.54 s ("es queso"): she sings the two words quietly with a tiny nod.
3.6–5.2 s: mouth closed, she holds the smile.
5.2 s: a small burp escapes her; her eyes go wide and her hand flies up to cover her mouth.
5.8–8.0 s: she dissolves into giggles behind her hand, shoulders shaking.
8.0–10.0 s: she composes herself, lowers her hand, and winks at the lens.
Her hand rests under her chin and never covers her mouth while she sings. Locked camera. One continuous shot, no cuts. Only she sings. No text, letters or logos.
```

## X. Every shot is video

Added 2026-10-04. Obie on the chapter 1 draft: "I want everything to be video." These are the 40 shots the first plan kept as stills. A shot with several plates gets one clip per plate (a, b, c), each starting one beat before its own cut. People alone in a simple frame are `motion`. A plate whose composition is the joke, and every object shot, is `insert`, so the plate is the exact first frame.

### M13 · s013 · 4 s · 1080p
- kind: motion
- plate: him-looks-down
- t0: 34.707
- story: "Me miraste la cintura": he checks her waistline and thinks nobody noticed.
```
{MOVE} Medium close-up in {ROOM}: {HIM} sits alone on his side of the booth, facing the lens, which is where his girlfriend sits. He is checking her waistline and thinks he is being subtle.
0.0–0.8 s: he looks straight into the lens with a polite little smile.
0.8–1.6 s: his eyes slide down, slowly, to a point below the lens, and stay there.
1.6–2.6 s: his eyebrows pinch together and the corners of his mouth pull down; he gives a tiny shake of the head.
2.6–4.0 s: his eyes flick back up to the lens, caught, and he forces the smile back on.
His lips stay closed; he does not speak. Locked camera at her eye level. Only he is in the frame. {END}
```

### M14 · s014 · 4 s · 1080p
- kind: motion
- plate: him-worried
- t0: 37.156
- story: "Con carita preocupada": the most concerned face in the world.
```
{MOVE} Close-up in {ROOM}: {HIM} leans toward the lens with the saddest, most concerned face in the world. He is worried about what his girlfriend is eating and wants her to see how much he cares.
0.0–0.6 s: he looks at the lens, lips pressed together.
0.6–1.5 s: his eyebrows climb and tilt into a pleading arch; his lower lip pushes out a little.
1.5–2.5 s: he tilts his head to one side and lets a slow breath out through his nose.
2.5–4.0 s: he holds the look and blinks twice, slowly.
His lips stay closed; he does not speak. The camera pushes in very slowly on his face. {END}
```

### M15 · s015 · 4 s · 1080p
- kind: motion
- plate: her-tender
- t0: 39.605
- story: "Yo pensé que era ternura": she takes his worry for love.
```
{MOVE} Close-up in {ROOM}: {HER} has one hand flat on her chest and looks up and away, moved. She thinks her boyfriend's worried face means he adores her.
0.0–0.6 s: she gazes off to the side with a soft smile, her hand pressed to her heart.
0.6–1.5 s: she sighs; her shoulders rise and drop and her eyelashes flutter.
1.5–2.5 s: she tilts her head, bites her lower lip and smiles wider, touched.
2.5–4.0 s: her eyes drift back toward the lens and the smile starts to cool into doubt.
She does not sing or speak. Handheld camera, close and steady. {END}
```

### M16 · s016 · 4 s · 1080p
- kind: motion
- plate: calc-tape
- t0: 41.442
- story: "Tú ya estabas sacando cuentas": he was doing the sums all along.
```
{MOVE} Medium shot in {ROOM}: {HIM} sits behind a small green salad with a pocket calculator in his hands and a huge tangle of white paper tape spilling across the tablecloth. He is adding up everything his girlfriend ate and the total is terrible.
0.0–1.2 s: he pulls paper tape out of the calculator hand over hand, fast; more and more of it piles on the table.
1.2–2.4 s: he lifts a length of tape close to his eyes and reads down it, lips pressed tight, shaking his head.
2.4–3.1 s: he punches three more keys with one stiff finger; more tape feeds out.
3.1–4.0 s: he looks up from the tape at the lens, grave, like a doctor with bad news.
His lips stay closed; he does not speak. The tape stays blank white paper. Locked camera. {END}
```

### M17 · s017 · 4 s · 720p
- kind: motion
- plate: him-stop
- t0: 44.503
- story: "Me dijiste: ya fue mucho": that is enough pizza, in his opinion.
```
{MOVE} Medium close-up in {ROOM}: {HIM} holds his open palm up toward the lens like a traffic policeman. His girlfriend has had enough pizza, in his opinion.
0.0–0.6 s: his hand rises from the table, palm out.
0.61 s: the palm stops dead in front of the lens, fingers together.
0.6–1.8 s: he shakes his head slowly with his eyes closed; the palm stays rock steady.
1.8–4.0 s: he opens his eyes and pushes the palm a little closer to the lens.
His lips stay closed; he does not speak. His hand keeps five fingers. Locked camera. {END}
```

### M18 · s018 · 4 s · 720p
- kind: motion
- plate: her-order
- t0: 45.727
- story: "Yo entendí: pide una más": what she heard was "order another".
```
{MOVE} Medium close-up in {ROOM}: {HER} cups one hand behind her ear and raises her other hand with one finger up to call the waiter. She has decided her boyfriend just told her to order another pizza.
0.0–0.6 s: she leans in with her hand behind her ear, pretending to listen hard.
0.6–1.2 s: her face lights up in a huge grin and she nods: got it.
1.2–1.8 s: her raised finger shoots higher and waggles at someone across the room.
1.8–4.0 s: she bounces on the seat, still signalling, laughing with her mouth closed.
She does not sing or speak. Handheld camera, close. {END}
```

### F19 · s019 · 4 s · 720p
- kind: insert
- plate: salad-sad
- t0: 46.952
- story: "Si tú sueñas con ensalada": the saddest salad in the world.
```
Close-up of a white bowl of plain lettuce with two cherry tomatoes on a white tablecloth, hard direct flash: the saddest salad in the world.
0.0–0.6 s: nothing moves.
0.6–1.3 s: one lettuce leaf slowly wilts and droops over the rim of the bowl.
1.3–2.0 s: one cherry tomato rolls a centimetre and settles against the other.
2.0–4.0 s: a single drop of water runs down the outside of the bowl.
Nothing else moves. Locked camera. No hands or faces enter the frame. {END}
```

### F20 · s020 · 4 s · 720p
- kind: insert
- plate: salad-date
- t0: 48.176
- story: "Pues invítala a cenar": so take the salad out to dinner.
```
Wide shot in an old Italian trattoria at night, direct camera flash: a young man in a pale blue polo sits on one side of a table for two with his arms folded on the cloth. Across from him, on the wooden chair, sits a big plate of green salad: his date.
0.0–0.6 s: he looks at the salad with a shy smile.
0.6–1.3 s: he slides the red candle a little toward the salad, to set the mood.
1.3–1.9 s: he leans forward on his elbows and raises his eyebrows at it, hopeful.
1.9–4.0 s: he waits for an answer. The salad does nothing.
He does not speak. The plate of salad never moves. Locked camera. {END}
```

### F21 · s021 · 4 s · 720p
- kind: insert
- plate: talk-hand
- t0: 49.401
- story: "Yo no vine por consejos": talk to the hand.
```
Close-up in an old Italian trattoria at night, direct camera flash: a woman in a black patent-leather halter top and choker, black hair pulled back in a messy bun, holds her open palm out at the lens, close and out of focus, her face behind it.
0.0–0.6 s: the palm pushes a little closer to the lens.
0.6–1.8 s: behind the hand she chews with her cheeks full, eyes half closed, unbothered, and turns her face away.
1.8–4.0 s: the hand stays up, steady; she looks back at the lens over her fingertips and raises one eyebrow.
Her hand stays open with five fingers. Her face stays clear of hair. She does not sing or speak. Handheld camera. {END}
```

### F22 · s022 · 4 s · 720p
- kind: insert
- plate: menu
- t0: 50.625
- story: "Yo vine por el menú": the menu, and a finger that knows what it wants.
```
Top-down close-up of a printed pizzeria menu on cream paper, lit by warm candlelight. The printed words stay exactly as they are, sharp and unchanged, for the whole shot.
0.0–0.6 s: candlelight flickers across the paper.
0.6–1.2 s: a woman's hand with short black nails slides in from the bottom right corner; her index finger lands on the right-hand margin of the page, beside the prices.
1.2–1.8 s: the fingertip slides up the margin, past row after row.
1.8–4.0 s: it stops beside the empty space in the middle of the list and taps the margin twice, decided.
The paper does not move. The finger never covers the printed words. Locked camera. No faces enter the frame. One continuous shot, no cuts. Nothing is written, erased or changed on the page.
```

### M23 · s023 · 4 s · 720p
- kind: motion
- plate: booth-stand
- t0: 51.850
- story: "Si vas a hablar de mi cuerpo": then look up at it.
```
{MOVE} Low wide shot from table height in {ROOM}: {HERFAR} stands on the red booth seat, towering over the lens. If he wants to talk about her body, he can look up at it.
0.0–0.6 s: she plants her feet wide on the seat; her hands slide onto her hips.
0.6–1.2 s: her chin lifts and she stares down at the lens.
1.2–1.8 s: she cocks one hip, slow.
1.8–4.0 s: she holds the pose; her trousers sway.
She does not sing or speak. Locked low camera, looking up. {END}
```

### M27 · s027 · 4 s · 1080p
- kind: motion
- plate: him-wag
- t0: 59.197
- story: "Tú diciendo: eso hace mal": he explains, kindly, that pizza is bad for her.
```
{MOVE} Medium close-up in {ROOM}: {HIM} sits behind his small green salad and raises one index finger at the lens. He is explaining, kindly, that pizza is bad for her.
0.0–0.8 s: he lifts his finger beside his face and takes a breath, about to give advice.
0.8–1.9 s: he wags the finger left and right, slow and patient, eyebrows raised.
1.9–3.1 s: three firmer wags, one per beat, his head shaking with each one, lips pursed.
3.1–4.0 s: he lowers the finger and points it down at his salad instead, nodding.
His lips stay closed; he does not speak. Locked camera. {END}
```

### F30 · s030 · 4 s · 720p
- kind: insert
- plate: before-after
- t0: 67.156
- story: "No es culpa, es progreso": the salad and the slice, and which one is making progress.
```
Top-down shot of two white plates on a white tablecloth, hard direct flash: on the left an untouched green salad with a fork beside it, on the right a big pizza slice with bites taken out of it.
0.0–1.1 s: nothing moves but a faint curl of steam off the slice.
1.2 s: a woman's hand with short black nails comes in from the right, lifts the slice off its plate and takes it out of frame.
2.0 s: the hand drops the slice back on the plate with one more big bite missing; crumbs scatter.
2.6–4.0 s: the same hand pushes the salad plate away with one finger until it is half out of frame on the left.
Locked camera. Only her hand enters the frame, no faces. {END}
```

### F33 · s033 · 4 s · 720p
- kind: insert
- plate: slices-up
- t0: 75.115
- story: "No es grasa, es queso": the whole room holds slices up like lighters at a concert.
```
Wide shot of a table in an old Italian trattoria at night, direct camera flash: a crowd of old waiters in white jackets and black bow ties and dinner guests, every one of them holding a pizza slice high in the air like a lighter at a concert.
0.0–1.7 s: they sway together, left and right, one sway per beat of a slow anthem, slices held high.
1.73 s: every arm thrusts its slice a little higher at the same moment and they all cheer with open mouths.
1.8–4.0 s: the swaying goes on; cheese strings swing from the slices.
Locked camera. {END}
```

### F40 · s040 · 4 s · 720p
- kind: insert
- plate: center-juicy
- t0: 91.645
- story: "Y con el centro bien jugoso": strictly a picture of food.
```
Macro shot of the centre of a hot pepperoni pizza, glossy with oil, hard direct flash.
0.0–1.5 s: the melted cheese bubbles slowly; a bead of orange oil swells in the cup of a pepperoni slice.
1.5–2.2 s: the bead spills over the rim and runs across the cheese.
2.2–4.0 s: a big bubble rises in the cheese and pops; steam curls up through the frame.
The camera creeps forward very slowly, razor-thin focus. No hands or faces enter the frame. {END}
```

### F45 · s045 · 4 s · 720p
- kind: insert
- plate: giant-pizza
- t0: 103.278
- story: "Dámela grande y redonda": a pizza the size of a table.
```
Wide shot in an old Italian trattoria at night, direct camera flash: two old waiters in white jackets and black bow ties carry a pepperoni pizza the size of a table between them, straining.
0.0–0.6 s: they shuffle toward the lens with small careful steps; the giant pizza wobbles.
0.6–1.8 s: they tilt it up toward the lens to show it off, proud, knees bending under the weight.
1.8–4.0 s: one waiter's grip slips, the pizza dips, he catches it; both exhale.
They do not speak. Locked camera. {END}
```

### F47 · s047 · 4 s · 720p
- kind: insert
- plate: one-hand
- t0: 105.727
- story: "Si no cabe en una mano": a slice far too big for one hand.
```
Extreme close-up against a dark background, hard direct flash: one woman's hand with black nails holds up a pizza slice far too big for it; the slice hangs over both sides of her palm.
0.0–0.6 s: the hand lifts the slice; it sags.
0.6–1.8 s: the tip of the slice droops lower and lower, cheese and oil sliding toward the point; her fingers shift to keep hold.
1.8–4.0 s: the slice folds over the edge of her hand and a string of cheese drips off the tip.
Only the one hand is in the frame, with five fingers. Locked camera. No faces. {END}
```

### F48 · s048 · 4 s · 720p
- kind: insert
- plate: two-hands
- t0: 106.951
- story: "Uso las dos para agarrarla": two hands for a slice that size.
```
Extreme close-up against a dark background, hard direct flash: two hands with black nails grip a huge pizza slice from both sides, melted cheese hanging from it in strings.
0.0–0.6 s: both hands tighten their hold on the crust.
0.6–1.4 s: they lift the slice; the cheese strings stretch longer.
1.4–2.2 s: the hands fold the slice in half down the middle; oil runs out of the fold.
2.2–4.0 s: they hold the folded slice up, steady, cheese swinging.
Two hands only, five fingers each. Locked camera. No faces. {END}
```

### F50 · s050 · 4 s · 720p
- kind: insert
- plate: slice-pov
- t0: 110.013
- story: "La acerco más a la boca": the slice's point of view.
```
Close-up in an old Italian trattoria at night, direct camera flash, seen from the point of a pizza slice held up in front of the lens: a woman in a black patent-leather halter top and choker, black hair pulled back in a messy bun, laughs at the slice, about to eat it.
0.0–0.6 s: she laughs, eyes on the slice.
0.6–1.5 s: she leans in toward the lens and the slice rises to meet her.
1.5–2.0 s: she takes a big bite off the tip of the slice and pulls back, cheese stretching.
2.0–4.0 s: she chews with her cheeks full, grinning, eyes closed.
Her face stays clear of hair. She does not sing or speak. Handheld camera. {END}
```

### F51 · s051 · 4 s · 720p
- kind: insert
- plate: fridge-box
- t0: 111.237
- story: "Y si queda para luego": leftovers in the fridge light.
```
Close-up inside a refrigerator: an open white cardboard pizza box with leftover pepperoni slices sits on the shelf under the cold fridge light.
0.0–0.6 s: the fridge light flickers once and steadies; cold mist rolls along the shelf.
0.6–1.4 s: a woman's hand with black nails reaches in from the right and lifts one slice out of the box.
1.4–4.0 s: the hand leaves the frame with the slice; the box lid trembles; the mist settles.
Locked camera. Only her hand enters the frame, no faces. {END}
```

### M52 · s052 · 4 s · 1080p
- kind: motion
- plate: reheat-wink
- t0: 112.462
- story: "La caliento y repetimos": she heats it up and goes again.
```
{MOVE} Medium close-up in a dark restaurant kitchen beside a glowing wood oven, harsh direct camera flash: {HER} holds a white plate with leftover pizza slices on it. She is going to heat them up and do it all again.
0.0–0.6 s: she lifts the plate beside her shoulder, looking at the lens.
0.6–1.5 s: she tips her head toward the glowing oven behind her, eyebrows up, a question.
1.5–2.1 s: she winks at the lens, slow and deliberate, with a closed-mouth smile.
2.1–4.0 s: she turns and slides the plate toward the oven, firelight on her face.
She does not sing or speak. Handheld camera, close. {END}
```

### F56 · s056 · 4 s · 1080p
- kind: insert
- plate: tragedy-wide
- t0: 121.645
- story: "Qué tragedia nacional": the couple as a press photograph of a scandal.
```
Wide shot of a red leather booth in an old Italian trattoria at night, harsh direct camera flash, like a press photograph of a scandal: a woman in a black patent-leather halter top hugs a whole pizza to her chest; beside her a young man in a pale blue polo points an accusing finger across the table; behind them two old waiters in white jackets watch in horror.
0.0–0.6 s: everyone is frozen mid-scandal.
0.61 s: a photographer's flash pops white from the left.
0.6–1.8 s: she pulls the pizza tighter against her and turns her shoulder to shield it, glaring at him; his pointing finger jabs the air twice.
1.84 s: a second flash pops from the right.
1.8–4.0 s: one waiter clamps both hands over his mouth; the other crosses himself; the couple hold their stare.
Nobody speaks. Locked camera. {END}
```

### F57 · s057 · 4 s · 720p
- kind: insert
- plate: runway
- t0: 124.094
- story: "Mi novio quiere una modelo": what he wants her to be.
```
A fashion show at night: a very thin, very tall model in a long pale silk gown walks down a white runway straight toward the lens, a row of spotlights behind her, the audience in darkness on both sides.
0.0–2.7 s: she walks toward the lens with a slow, stiff runway walk, one step per beat, arms hanging, face blank and bored; photographers' flashes pop along both sides of the runway.
2.7–4.0 s: she stops at the end of the runway, puts one hand on her hip and stares over the lens, expressionless.
Locked camera at the end of the runway. {END}
```

### F59a · s059 · 4 s · 720p
- kind: insert
- plate: gasp-him
- t0: 129.604
- story: "Ay": the first gasp is his.
```
Close-up in an old Italian trattoria at night, harsh direct camera flash: a young man in a pale blue polo sits in a red leather booth with one hand pressed to his cheek, appalled.
0.0–0.6 s: his eyes widen.
0.61 s: he gasps, his mouth drops open and his other hand slaps onto his other cheek.
0.6–1.3 s: he rocks back against the booth with both hands on his face.
1.3–4.0 s: he stays like that, frozen in horror, slowly shaking his head.
Locked camera. {END}
```

### F59b · s059 · 4 s · 720p
- kind: insert
- plate: gasp-waiter
- t0: 130.217
- story: "ay": the second gasp is the waiter's.
```
Close-up in an old Italian trattoria at night, harsh direct camera flash: an old waiter with wild white hair and a white moustache, in a white jacket and black bow tie, holds a silver tray and stares at the lens in shock.
0.0–0.6 s: his eyebrows shoot up.
0.61 s: he gasps and jerks back; the tray tilts in his hand.
0.6–1.3 s: his free hand flies up to his chest.
1.3–4.0 s: the tray slides out of his fingers and drops out of frame; he does not look at it.
Locked camera. {END}
```

### F59c · s059 · 4 s · 720p
- kind: insert
- plate: gasp-nonna
- t0: 130.829
- story: "ay": the third gasp is the grandmother's.
```
Close-up in an old Italian trattoria at night, harsh direct camera flash: a tiny old grandmother with white curls, a black dress and a pearl necklace sits in a red leather booth with both hands on her cheeks and her mouth open.
0.0–0.6 s: she sucks in a breath.
0.61 s: she gasps, eyes huge, fingers pressing into her cheeks.
0.6–1.3 s: she crosses herself fast with one hand.
1.3–4.0 s: she clutches her pearls and shakes her head at the lens.
Locked camera. {END}
```

### F60 · s060 · 4 s · 1080p
- kind: insert
- plate: stare-down
- t0: 131.441
- story: "Qué conflicto tan profundo": nose to nose, a crust in her teeth.
```
Profile two-shot across a small table in an old Italian trattoria at night, direct camera flash: on the left a woman in a black patent-leather halter top and choker, black hair in a messy bun, with a pizza crust clamped in her teeth like a cigar; on the right a young man in a pale blue polo. They lean in nose to nose over a red candle, staring each other down.
0.0–1.0 s: they lean in closer, slowly, until their noses almost touch; neither blinks.
1.0–2.0 s: she narrows her eyes and rolls the crust from one corner of her mouth to the other.
2.0–3.0 s: he narrows his eyes back and his jaw tightens; the candle flame between them leans and flickers.
3.0–4.0 s: she bites down and the crust snaps; he flinches.
Nobody speaks. Her face stays clear of hair. The camera pushes in very slowly. {END}
```

### M61 · s061 · 4 s · 720p
- kind: motion
- plate: him-tape
- t0: 134.196
- story: "Él cuidando mi figura": he measures her from across the table.
```
{MOVE} Medium close-up in {ROOM}: {HIM} holds a yellow tailor's measuring tape stretched tight between his two hands at eye level and squints at the lens over it, sizing up his girlfriend from across the table.
0.0–0.6 s: he pulls the tape taut with a snap.
0.6–1.5 s: he closes one eye and lines the tape up against her, tilting it a few degrees, tongue between his teeth.
1.5–2.5 s: he slides his hands wider along the tape, wider again, and frowns at the result.
2.5–4.0 s: he lowers the tape and shakes his head slowly.
He does not speak. The tape shows only plain tick marks. Locked camera. {END}
```

### M63 · s063 · 4 s · 1080p
- kind: motion
- plate: summer
- t0: 139.400
- story: "Me dijo: piensa en el verano": he holds up a beach photo, hopeful.
```
{MOVE} Medium close-up in {ROOM}: {HIM} holds up a small photograph of an empty sunny beach beside his face and taps it with his other index finger, hopeful. He wants his girlfriend to think of summer.
0.0–0.6 s: he raises the beach photo into frame, smiling.
0.6–1.7 s: he taps the photo twice with his finger, eyebrows up, nodding at the lens.
1.7–2.6 s: he fans himself with the photo and mimes a little swimming stroke with his free hand.
2.6–4.0 s: he holds the photo out toward the lens with both hands and a pleading smile.
His lips stay closed; he does not speak. Locked camera. {END}
```

### F65 · s065 · 4 s · 1080p
- kind: insert
- plate: standoff-gun
- t0: 144.298
- story: "Porque si tocas mi rebanada": nobody touches her slice. Deadpan.
```
Medium two-shot in a red leather booth of an old Italian trattoria at night, direct camera flash, played as deadpan comedy: a woman in a black patent-leather halter top and choker, black hair in a messy bun, holds an old revolver at arm's length, pointed at the young man in a pale blue polo sitting next to her. His hand is creeping across the tablecloth toward the last pizza slice on her plate.
0.0–1.2 s: his fingers walk slowly toward the slice; she chews, calm, watching his hand without turning her head.
1.2–2.0 s: his fingertips touch the edge of the plate; she raises one eyebrow.
2.0–3.0 s: he freezes, eyes wide, and slides his hand back across the cloth, very slowly.
3.0–4.0 s: he raises both hands; she keeps chewing.
Nobody speaks. Nothing is fired. Locked camera. {END}
```

### F69a · s069 · 4 s · 720p
- kind: insert
- plate: bite-e
- t0: 156.543
- story: "Mira cómo me lo como", bite one of three.
```
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: a woman in a black patent-leather halter top and choker, black hair in a messy bun, has two whole pizza slices stuffed in her mouth, her eyes rolled up.
0.0–0.6 s: she chews hard, cheeks bulging, the slices flapping.
0.6–1.2 s: she pushes the slices further in with one finger and her eyes cross.
1.2–4.0 s: she keeps chewing, nodding on each beat, her eyes closing.
Her face stays clear of hair. She does not sing or speak. Handheld camera, very close. {END}
```

### F69b · s069 · 4 s · 720p
- kind: insert
- plate: bite-f
- t0: 157.155
- story: "Mira cómo me lo como", bite two of three.
```
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: a woman in a black patent-leather halter top and choker, black hair in a messy bun, holds a pizza slice in her teeth by its crust, the point hanging over her chin, and throws two peace signs at the lens.
0.0–0.6 s: she bounces her shoulders to the beat, peace signs up.
0.6–1.2 s: she shakes her head like a dog with a toy; the slice flaps from her teeth.
1.2–4.0 s: she pumps both peace signs toward the lens on each beat, laughing with her teeth shut on the crust.
Each hand keeps two fingers up. Her face stays clear of hair. She does not sing or speak. Handheld camera, very close. {END}
```

### F69c · s069 · 4 s · 720p
- kind: insert
- plate: bite-g
- t0: 157.767
- story: "Mira cómo me lo como", bite three of three.
```
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: a woman in a black patent-leather halter top and choker, black hair in a messy bun, laughs with her eyes shut, melted cheese all over the fingers of one hand, a pizza slice hanging from her other hand.
0.0–0.6 s: she laughs, shoulders shaking.
0.6–1.2 s: she pulls a string of cheese off her fingers with her teeth.
1.2–4.0 s: she swings the slice in her other hand up for another bite, still laughing.
Her face stays clear of hair. She does not sing or speak. Handheld camera, very close. {END}
```

### F71 · s071 · 4 s · 1080p
- kind: insert
- plate: label-face
- t0: 161.441
- story: "No es grasa, es queso": she is the face on the packet.
```
Commercial product shot against a plain cream studio wall, bright even light: a woman in a black patent-leather halter top and choker, black hair pulled back in a messy bun, holds a pepperoni pizza slice up beside her cheek and beams at the lens like the face on a food packet.
0.0–0.6 s: she holds the slice still beside her face with a perfect smile.
0.6–1.7 s: she tilts her head toward the slice and the smile gets even wider, a television-advert head tilt.
1.74 s: she gives the lens one sharp wink.
1.8–4.0 s: she turns the slice a few degrees toward the lens to present it and holds the pose, smile fixed.
Her face stays clear of hair. She does not sing or speak. Locked camera. {END}
```

### F73 · s073 · 4 s · 720p
- kind: insert
- plate: calc-alone
- t0: 165.727
- story: "Tú contando calorías": he has gone, and his calculator has nobody to count for.
```
Close-up of a table for two in an old Italian trattoria at night, direct camera flash: a black pocket calculator lies beside an untouched green salad and a glass of sparkling water. The red leather seat behind them is empty. He has left.
0.0–1.2 s: bubbles rise in the water glass; nothing else moves.
1.2–2.4 s: a salad leaf slides off the pile and lands on the calculator's keys.
2.4–4.0 s: candlelight flickers across the empty seat; the last bubbles rise.
The calculator's display stays blank. The camera drifts forward very slowly. No hands or faces enter the frame. {END}
```

### F75 · s075 · 4 s · 720p
- kind: insert
- plate: tape-pasta
- t0: 171.849
- story: "No me midas": the measuring tape, served as pasta.
```
Top-down close-up of a white plate on a white tablecloth, hard direct flash: a yellow tailor's measuring tape coiled like tagliatelle under tomato sauce, grated cheese and a basil leaf, with a fork stuck in the coil.
0.0–0.6 s: steam rises off the sauce.
0.6–1.8 s: the fork turns, twirling the yellow tape around its tines like pasta; the loops tighten and the sauce smears.
1.8–4.0 s: the fork lifts a thick twirl of tape off the plate, sauce dripping, and holds it there.
Locked camera. Only the fork and a woman's fingertips with black nails enter the frame, no faces. {END}
```

### M76 · s076 · 4 s · 720p
- kind: motion
- plate: scale-bin
- t0: 173.073
- story: "No me peses": the bathroom scale goes in the bin.
```
{MOVE} Medium shot in {ROOM}: {HER} holds a white bathroom scale out at arm's length between two fingertips, like something that smells, over a steel bin beside the booth. She is done being weighed.
0.0–0.6 s: she dangles the scale over the bin with her nose wrinkled, looking at it sideways.
0.61 s: she opens her fingers.
0.6–1.2 s: the scale drops straight into the bin; the bin rocks.
1.2–1.8 s: she dusts her fingertips together twice.
1.8–4.0 s: she turns to the lens, chin up, satisfied.
She does not sing or speak. The scale's dial has no numbers. Locked camera. {END}
```

### F77 · s077 · 4 s · 720p
- kind: insert
- plate: condiments
- t0: 174.298
- story: "No me escondas los aderezos": his briefcase of hidden parmesan and chili.
```
Close-up on a white tablecloth in an old Italian trattoria at night, direct camera flash: an open brown leather briefcase packed with glass shakers of grated parmesan and chili flakes, his secret stash. A woman's hand with black nails reaches into it.
0.0–0.6 s: her hand hovers over the shakers, fingers wiggling, choosing.
0.6–1.4 s: she plucks out one shaker of chili flakes and holds it up to the light.
1.4–2.2 s: she shakes it twice; the red flakes jump inside the glass.
2.2–4.0 s: she carries the shaker out of frame.
Locked camera. Only her hand enters the frame, with five fingers, no faces. {END}
```

### F78 · s078 · 4 s · 720p
- kind: insert
- plate: gavel
- t0: 176.747
- story: "No me juzgues": a pepper mill comes down like a gavel.
```
Close-up on a white tablecloth in an old Italian trattoria at night, direct camera flash: a hand with black nails grips a tall wooden pepper mill like a judge's gavel.
0.0–0.5 s: the hand raises the pepper mill high.
0.61 s: it slams the mill down on the table; ground pepper and peppercorns burst out across the cloth and the red candle glass jumps.
1.22 s: a second slam, harder; the plates rattle.
1.3–4.0 s: the hand holds the mill down on the table, steady; the pepper dust settles.
Locked camera. Only her hand and forearm are in the frame, no faces. {END}
```

### F79 · s079 · 4 s · 720p
- kind: insert
- plate: spa
- t0: 177.971
- story: "No me estreses": spa treatment, with pepperoni.
```
Medium close-up in a red leather booth of an old Italian trattoria at night, direct camera flash: a woman in a black patent-leather halter top and choker, black hair in a messy bun, leans back with a round pepperoni slice resting over each closed eye like cucumber at a spa, smiling.
0.0–0.6 s: she breathes in slowly through her nose; her shoulders rise.
0.6–1.8 s: she breathes out long, sinks deeper into the booth and her smile widens.
1.8–3.0 s: she lifts one pepperoni off her eye, peeks at the lens and eats it.
3.0–4.0 s: she settles back with one pepperoni still in place, chewing.
She does not sing or speak. Locked camera. {END}
```

### F83a · s083 · 4 s · 720p
- kind: insert
- plate: bite-h
- t0: 188.379
- story: "Mira cómo me lo como", the last chorus, bite one of three: she and the waiter share a string of cheese.
```
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: a woman in a black patent-leather halter top and choker, black hair in a messy bun, and an old waiter with a white moustache, a white jacket and a black bow tie share one long string of melted cheese, an end in each mouth.
0.0–0.6 s: they both chew along the string toward the middle; it shortens.
0.6–1.2 s: she slurps hard and the whole string snaps over to her; the waiter's eyes pop wide.
1.2–4.0 s: she grins at the lens, chewing; he blinks, stunned, his moustache twitching.
Nobody speaks. Handheld camera, very close. {END}
```

### F83b · s083 · 4 s · 720p
- kind: insert
- plate: bite-k
- t0: 188.992
- story: "Mira cómo me lo como", the last chorus, bite two of three.
```
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: a woman in a black patent-leather halter top and choker, black hair in a messy bun, grips a pizza slice in each hand and tears at both with her teeth at once, eyes wide and wild.
0.0–0.6 s: she pulls the two slices outward; cheese stretches between her teeth and each slice.
0.6–1.2 s: the cheese snaps; her head jerks back and she chews fast, eyes locked on the lens.
1.2–4.0 s: she bites the left slice, then the right, one bite per beat.
Her face stays clear of hair. She does not sing or speak. Handheld camera, very close. {END}
```

### F83c · s083 · 4 s · 720p
- kind: insert
- plate: bite-l
- t0: 189.604
- story: "Mira cómo me lo como", the last chorus, bite three of three.
```
Close-up in a red leather booth of an old Italian trattoria at night, harsh direct camera flash: a woman in a black patent-leather halter top and choker, black hair in a messy bun, bites into a floppy pizza slice with her eyes squeezed shut, laughing.
0.0–0.6 s: she tears a bite off; cheese stretches from her teeth.
0.6–1.2 s: the cheese string snaps and lands on her chin; she laughs harder.
1.2–4.0 s: she wipes her chin with the back of her hand and goes in for another bite.
Her face stays clear of hair. She does not sing or speak. Handheld camera, very close. {END}
```

### F85 · s085 · 4 s · 1080p
- kind: insert
- plate: apparition
- t0: 193.277
- story: "No es grasa, es queso": the full apparition.
```
A devotional tableau staged as a fashion photograph against a dark red backdrop: a woman stands with her hands pressed together in prayer and her eyes lowered, wrapped in a long mantle of red-and-white checkered tablecloth scattered with gold stars, inside a tall halo of golden breadsticks that radiate around her whole body. She stands on a crescent of pizza crust held up by a tiny old waiter in a white jacket. Red roses lie at the base.
0.0–1.7 s: the breadstick rays shimmer with warm golden light, slowly brightening; rose petals drift down through the frame.
1.75 s: she raises her eyes to the lens, serene, and the golden light swells.
1.8–4.0 s: the tiny waiter strains and wobbles under the crust, then steadies; she does not move; petals keep falling.
She does not sing or speak. The camera pushes in very slowly. {END}
```

### M87 · s087 · 4 s · 1080p
- kind: motion
- plate: him-window
- t0: 197.563
- story: "Tú contando calorías": he is outside in the rain, looking in.
```
{MOVE} Night, outside in the rain, seen along the front window of an old Italian trattoria: {HIM} stands on the wet pavement with his forehead and both palms pressed against the glass, looking in at the warm red dining room he walked out of.
0.0–1.0 s: rain runs down the glass; he stares in, his hair getting wet.
1.0–2.0 s: his breath fogs a patch of the window; he wipes it clear with the side of his fist and presses closer.
2.0–3.0 s: his eyes follow something inside, left to right, and his mouth falls open a little.
3.0–4.0 s: his forehead bumps softly against the glass and stays there.
He does not speak. Locked camera. {END}
```

### F90 · s090 · 4 s · 720p
- kind: insert
- plate: scale-in-bin
- t0: 206.134
- story: "No me peses": the scale is still in the bin at closing time.
```
Close-up in an old Italian trattoria late at night, the dining room empty: a white bathroom scale sticks out of a steel bin beside a red leather booth, with an empty, grease-stained pizza box dropped on top of it.
0.0–1.2 s: the red candle on the table flickers low; nothing else moves.
1.2–2.4 s: the pizza box lid slowly sinks under its own weight.
2.4–4.0 s: the candle flame gutters and goes out; a thin line of smoke rises.
The camera drifts back very slowly. No hands or faces enter the frame. The box and the scale carry no words or numbers. {END}
```

### F66b · s066 · 4 s · 1080p
- kind: insert
- plate: he-leaves
- t0: 149.808
- story: in the silence after "Esta relación termina aquí", he leaves. The salad stays.
```
Wide shot in an old Italian trattoria at night, direct camera flash: a young man in a pale blue polo and blue trousers is on his way out through the dark wood door at the back, one hand on the brass door handle, glancing back over his shoulder. On the white tablecloth in the foreground he has left a small plate of green salad with a fork in it, beside a red candle lamp. He is leaving her, and leaving the salad.
0.0–1.2 s: he looks back over his shoulder at the table one last time, lips pressed together.
1.2–2.4 s: he turns away, pushes the door open and steps out into the night.
2.4–4.0 s: the door swings shut behind him; the candle flame flickers in the draught; the salad stays where it is.
He does not speak. Locked camera. {END}
```
