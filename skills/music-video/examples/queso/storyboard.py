#!/usr/bin/env python3
"""storyboard.py — the Queso storyboard as data. Run it to write shots.json, STORYBOARD.md and mj/plates-01.json.

Draft 1. One shot per lyric line (93 shots). A shot starts on beat `b` of the kick grid (beat n = t0 + n * period,
media/audio/beatmap.json) and runs to the next shot's start. `how` is the plan for motion:
  L  Seedance singing head, lip-synced to her vocal        M  Seedance motion clip with people
  F  Seedance food or insert motion                         S  still, moved by the engine's camera
Every plate prompt is built from the canon blocks in bible/LEAD.md.
"""
import json, pathlib

P = pathlib.Path(__file__).resolve().parent
bm = json.loads((P / 'media/audio/beatmap.json').read_text()); T0, PER = bm['t0'], bm['period']
words = json.loads((P / 'media/audio/words.json').read_text()); DUR = words['duration']
LINES = {L['li']: L for L in words['lines']}

HER = "the woman from the reference images, the same face, warm tan skin, dark brown eyes, sharp winged eyeliner and glossy coral lips, jet-black hair pulled back off her face in a messy bun, a few loose strands beside her face and none across her eyes or mouth, a black patent-leather choker and a black patent-leather halter top"
HERFAR = "the woman from the reference images, the same face, tan skin, jet-black hair pulled back in a messy bun with her face clear of hair, winged eyeliner, coral lips, a black patent-leather halter top and choker, loose grey trousers"
HERSHORT = "the woman from the reference images, the same face, tan skin, winged eyeliner, coral lips, jet-black hair pulled back off her face"
HIM = "the man from the reference image, the same face, a slim clean-shaven man in his late twenties in a pale blue polo shirt with neat side-parted brown hair"
# Couple shots carry three references: her two, then his.
HER_C = "the woman from the first two reference images, the same face, tan skin, jet-black hair in a messy bun with loose strands, winged eyeliner, coral lips, a black patent-leather halter top and choker"
HIM_C = "the man from the third reference image, the same face, slim and clean-shaven in a pale blue polo shirt with neat side-parted brown hair"
HIMURL = "<reference-image-url>"   # him-worried #3, picked by Obie
WAITER = "an old Italian waiter in a white jacket and black bow tie"
WAITERS = "old Italian waiters in white jackets and black bow ties"
NONNA = "a tiny Italian grandmother in a black dress and pearls"
NAILS = "with glossy black nails"
WORLD = "in a red-sauce Italian trattoria at night, red leather booth, white tablecloth, red glass candle holder, dark wood panelling"
LIGHT = "warm tungsten light and direct camera flash"
WILD = "candid paparazzi snapshot, camera far too close and tilted off-kilter, harsh direct on-camera flash, messy and funny, caught mid-moment"
NOVELA = "telenovela close-up, soft-focus glow, starburst highlights, hair blown by a wind machine"
TAIL = "high-fashion editorial photograph, 35mm film still, fine grain, no text, no letters, no logos"
MACRO = "macro food photograph, glossy, razor-thin focus, hard direct flash, deep shadows, no text, no letters, no logos"
PARAMS = "--ar 16:9 --v 8.2 --raw --hd"
REFS = "--edit <reference-image-url> <reference-image-url>"

def prompt(kind, text):
    t = text; her, him = '{HER' in text, '{HIM}' in text
    if her and him: t = t.replace('{HERFAR}', HER_C + ', loose grey trousers').replace('{HER}', HER_C).replace('{HIM}', HIM_C)
    for k, v in (('{HERFAR}', HERFAR), ('{HERSHORT}', HERSHORT), ('{HER}', HER), ('{HIM}', HIM), ('{WAITERS}', WAITERS), ('{WAITER}', WAITER), ('{NONNA}', NONNA), ('{NAILS}', NAILS)): t = t.replace(k, v)
    refs = f" {REFS} {HIMURL}" if her and him else f" {REFS}" if her else f" --edit {HIMURL}" if him else ''
    if kind == 'wild':   return f"{t}, {WORLD}, {WILD}, {TAIL} {PARAMS}{refs}"
    if kind == 'scene':  return f"{t}, {WORLD}, {LIGHT}, {TAIL} {PARAMS}{refs}"
    if kind == 'novela': return f"{t}, {NOVELA}, {WORLD}, {TAIL} {PARAMS}{refs}"
    if kind == 'bare':   return f"{t}, {LIGHT}, {TAIL} {PARAMS}{refs}"          # its own setting, no trattoria block
    if kind == 'macro':  return f"{t}, {MACRO} {PARAMS}"
    raise ValueError(kind)

# (id, start beat, lyric lines, how, picture, lyric surface, graphics, [(plate, kind, prompt text) | (plate, 'have', source)])
S = [
# ── I. APERITIVO (intro, no drums) ─────────────────────────────────────────────────────────────────────────────
('s001', 0, [0], 'F', "An empty plate. Her nails drum on the tablecloth.", "film subtitle, yellow italic", "black bars open like a cinema curtain; small tag ‘[en italiano]’",
 [('empty-plate', 'scene', "close-up from table height of an empty white plate with a fork and knife, a woman's bare tan forearm and hand {NAILS} resting on the white tablecloth, her fingers drumming impatiently beside the plate, no sleeve", 5)]),
('s002', 5, [1], 'M', "She slumps behind the plate, chin on her hands, looking for the waiter. On the last beat a pizza lands in front of her.", "film subtitle", "none until the pizza lands: the frame shakes on the kick",
 [('chin-wait', 'scene', "medium close-up of {HER}, slumped with her chin on her folded hands on the table behind an empty white plate, bored hungry eyes looking off to the side for the waiter")]),
# ── II. CHORUS 1: the thesis ───────────────────────────────────────────────────────────────────────────────────
('s003', 13, [2], 'L', "She sings to the lens, a dripping slice in her hand.", "NUTRITION LABEL: the row ‘Grasa’ is struck out and ‘QUESO’ slams in over it", "the label panel builds: Información Nutricional, thick rules",
 [('sing-slice', 'wild', "close-up of {HER}, singing straight into the lens with a huge grin, holding a dripping pizza slice in her bare hand up beside her face, a rope of melted cheese hanging from it, no fork and no cutlery", 5)]),
('s004', 16, [3], 'M', "She flexes a bicep like a gym progress photo. The pizza waits on its plate.", "label row ‘Culpa 0%’; ‘PROGRESO’ as a loading bar", "the bar fills one chunk per beat",
 [('flex', 'scene', "medium shot of {HER}, flexing one bicep like a bodybuilder with a proud grin at the lens, her other hand on her hip, nothing in her hands, a whole pizza on a plate on the table in front of her", 5)]),
('s005', 21, [4], 'M', "Mouth wide open, eyes on the lens, a big pepperoni slice on its way in.", "kinetic type: ‘cómo / como’ tumbles and doubles", "bite-mark cutouts eat the type",
 [('mira', 'have', 'plates-11/mira-b')]),
('s006', 24, [5], 'L', "She blows a saucy kiss into the lens and winks.", "handwritten on a napkin", "a tomato-sauce kiss print stamps onto the lens on ‘beso’",
 [('kiss', 'wild', "extreme close-up of {HER}, blowing a kiss straight into the lens with tomato sauce on her lips and one eye winking, a pizza crust in her fingers")]),
('s007', 29, [6], 'M', "The reveal: the couple. She devours, he calculates.", "label, small, pinned to her side of the table", "his side of the frame gets a cold blue HUD, hers stays warm",
 [('couple-wide', 'scene', "wide shot of a couple at a table: on the left {HER} devours a huge pizza with both hands; on the right {HIM} sits stiffly with sparkling water and a small salad, tapping a pocket calculator, frowning at her plate")]),
('s008', 32, [7], 'M', "She wags a cheesy finger at him over the table.", "rubber stamp: RECHAZADO over a diet-app notification", "his phone notification slides in and is stamped",
 [('finger-wag', 'scene', "medium shot over the shoulder of a man in a pale blue polo shirt: {HER} leans across the table with one index finger raised and wagging side to side in a firm no, eyebrow raised, unimpressed, her other hand resting on a pizza box", 3)]),
('s009', 36, [8], 'M', "Him, hunched over the calculator, punching keys.", "seven-segment calculator digits", "computer-vision tags put a kcal number on everything he looks at; the total races",
 [('him-calc', 'scene', "close-up of {HIM}, hunched over a pocket calculator with a blank display, tongue between his teeth, punching the keys with one finger, a glass of sparkling water and a small green salad in front of him")]),
('s010', 40, [9], 'F', "Top-down pizza. Her finger taps each pepperoni.", "counter: PEPPERONIS 01, 02, 03…", "a tracking box snaps onto each pepperoni on the eighth notes",
 [('pizza-top', 'macro', "top-down photograph of a whole pepperoni pizza on a white tablecloth, a woman's hand {NAILS} pointing at one pepperoni slice, a red glass candle holder at the edge of frame")]),
# ── III. THE ITALIAN CHORUS (drums out) ────────────────────────────────────────────────────────────────────────
('s011', 45, [10], 'M', "Three old waiters watch her from the kitchen door. One whispers to the next.", "film subtitle", "‘[en italiano]’ tag; a tiny heart over the i of formaggio",
 [('waiters-watch', 'scene', "medium shot of three {WAITERS} standing shoulder to shoulder at the kitchen door, watching something across the room with wide eyes, one whispering behind his hand to the next")]),
('s012', 52, [11], 'F', "A white-gloved hand slides another slice onto her plate. Her finger is already up.", "film subtitle", "order ticket prints: 1 × fetta",
 [('another-slice', 'scene', "close-up of a waiter's white-gloved hand sliding a huge pizza slice from a silver server onto a white plate, beside it a woman's hand {NAILS} holding up one finger, the edge of her black patent-leather halter top in the corner of the frame", 5)]),
# ── IV. VERSE 1: the accusation ────────────────────────────────────────────────────────────────────────────────
('s013', 57, [12], 'S', "His eyes drop to her waist.", "small caption at his eye line", "his HUD draws a measuring line and a question mark",
 [('him-looks-down', 'scene', "close-up of {HIM} across a table, his eyes dropping to look down at something below the frame with a small worried frown")]),
('s014', 61, [13], 'S', "His worried little face, very close.", "tiny fussy italic", "the HUD blinks: PREOCUPADO 87%",
 [('him-worried', 'have', 'plates-01/him-worried')]),
('s015', 65, [14], 'S', "Her, touched, hand on her heart.", "soft script", "hearts drift up; the glow of a telenovela",
 [('her-tender', 'scene', "close-up of {HER}, one hand over her heart, head tilted, looking across the table with soft dreamy eyes and a touched smile, soft candle glow")]),
('s016', 68, [15], 'S', "Smash cut: he pulls a mile of paper tape out of his calculator and studies it gravely.", "thermal receipt print", "the receipt lists her dinner in kcal; the lyric is the last line of the receipt",
 [('calc-tape', 'scene', "medium close-up of {HIM}, gravely studying an absurdly long curl of white paper tape that spills out of a pocket calculator in his hand and piles up across the white tablecloth around his salad", 5)]),
('s017', 73, [16], 'S', "He holds up a palm: stop.", "speech quote, his colour", "a road sign frame around his hand",
 [('him-stop', 'scene', "medium close-up of {HIM}, holding up one flat palm like a stop sign toward the lens, lips pursed, stern")]),
('s018', 75, [17], 'S', "She cups her ear, grins, and calls the waiter with one finger.", "speech quote, her colour", "the stop sign flips to + 1",
 [('her-order', 'scene', "medium close-up of {HER}, cupping one hand behind her ear with a mischievous grin while her other hand holds one finger up high to call the waiter")]),
('s019', 77, [18], 'S', "His salad, alone and sad.", "dreamy thought bubble", "vignette, a harp gliss of sparkles",
 [('salad-sad', 'macro', "close-up of a small sad green salad in a white bowl on a white tablecloth, three limp lettuce leaves and one cherry tomato, lit by a single spotlight")]),
('s020', 79, [19], 'S', "He sits on one side of the table. Across from him, on the other chair, a big plate of salad: his date.", "place card", "a reservation card: mesa para dos",
 [('salad-date', 'scene', "wide side view of a small restaurant table for two: on the left chair sits {HIM}, leaning on his elbows and gazing tenderly across the table; nobody sits on the wooden chair on the right, only a big white plate piled high with green salad resting on its seat; a candle on the table between them", 6)]),
('s021', 81, [20], 'S', "Talk to the hand: her palm blocks the lens, mouth full.", "big, on her palm", "the type sits on her palm, tracked",
 [('talk-hand', 'wild', "close-up of {HER}, thrusting her open palm straight at the lens so that the hand fills the left half of the frame out of focus, her face behind it with her cheeks full and her eyes rolling", 3)]),
('s022', 83, [21], 'S', "A full close-up of a classic pizzeria menu. Her line is one of the dishes.", "MENU TYPE: set as a dish on the menu, with dotted leaders and a price", "the menu is real: pizzas and prices; the engine sets the lyric into the empty row",
 [('menu', 'have', 'edits/menu')]),
('s023', 85, [22], 'S', "She stands on the booth seat, hands on hips, from below.", "tall condensed caps stacked beside her", "type tucks behind her body",
 [('booth-stand', 'scene', "full-length shot from a low angle of {HERFAR}, standing on the seat of a red leather booth with her hands on her hips, chin up, towering over the table")]),
('s024', 87, [23], 'L', "Hair flip. She sings it to the lens and points at herself with her thumb.", "giant quote marks", "flash frames on each of the three stressed syllables",
 [('buena', 'wild', "close-up of {HER}, flipping her hair and singing straight into the lens with a cocky smile, pointing at herself with one thumb, nothing in her hands and no food in the frame", 5)]),
# ── V. PRE-CHORUS: the duel (drums out) ────────────────────────────────────────────────────────────────────────
('s025', 89, [24], 'M', "Split screen, left: he sips still water through a paper straw.", "comparison table, column TÚ", "a versus chart builds: agua sin gas, 0 kcal, 0 alegría",
 [('him-water', 'scene', "medium shot of {HIM}, sitting bolt upright sipping still water from a glass through a paper straw, pinky raised, joyless")]),
('s026', 93, [25], 'M', "Right: the pizzaiolo throws dough in front of the fire.", "column YO", "the chart's right column fills with stars",
 [('dough-toss', 'bare', "medium shot of a big pizzaiolo with a thick moustache in a white apron tossing a spinning disc of pizza dough high in the air in front of a blazing wood-fired oven in a restaurant kitchen, flour hanging in the air")]),
('s027', 97, [26], 'S', "He wags a finger at the lens.", "health-warning box, black on white", "the box looks like the warning on a cigarette pack",
 [('him-wag', 'scene', "medium close-up of {HIM}, wagging one finger at the lens with a disapproving frown, his other hand resting on a small green salad")]),
('s028', 102, [27], 'M', "She slams a giant pizza box down between them. In the stop, the lid shuts on him.", "stamped on the box lid", "the lid is the wipe into the chorus",
 [('box-slam', 'scene', "medium shot at a restaurant table: {HER} slams an enormous closed white pizza box down on the table in front of a startled {HIM}, napkins flying, she grins")]),
# ── VI. CHORUS 2: the room joins ───────────────────────────────────────────────────────────────────────────────
('s029', 107, [28], 'L', "She kneels on the table and sings into a slice.", "the label, full frame behind her", "type tucks behind her; QUESO in the heaviest weight",
 [('table-top', 'wild', "full-length shot of {HERFAR}, kneeling on top of a restaurant table belting out a song with her mouth wide open, a pizza slice raised to her lips in one hand and her other arm thrown out wide with an empty open hand, plates and glasses pushed aside", 3)]),
('s030', 110, [29], 'S', "Two plates from above: the salad and the bitten slice.", "ANTES / DESPUÉS cards; progress bar", "a wipe slides from salad to slice on the downbeat",
 [('before-after', 'macro', "top-down photograph of two white plates side by side on a white tablecloth: on the left a small sad green salad, on the right a huge glossy pizza slice with one bite taken out of it")]),
('s031', 115, [30], 'M', "Three bites, one per beat. On the second she crosses her eyes.", "one word per bite", "hard cuts on the kicks",
 [('bite-b', 'wild', "extreme close-up of {HER}, head thrown back, taking a huge bite from the tip of a pizza slice dangled above her open mouth"),
  ('bite-c', 'wild', "extreme close-up of {HER}, biting a pizza slice folded in half, cheeks bulging, eyes wide at the lens"),
  ('bite-d', 'wild', "extreme close-up of {HER}, tearing a bite off a pizza slice with her teeth, sauce on her cheek, one eye shut")]),
('s032', 118, [31], 'M', "She plants a saucy kiss on an old waiter's cheek.", "napkin handwriting", "the kiss print stays on his cheek and pulses on the beat",
 [('kiss-waiter', 'scene', "medium shot of {HER}, kissing the cheek of a delighted {WAITER} who beams with his eyes shut, one small neat red kiss print on his other cheek", 3)]),
('s033', 123, [32], 'S', "The whole room holds slices up like lighters.", "label", "the slices sway; the label rows tick",
 [('slices-up', 'scene', "wide shot of a whole dining room, a dozen diners and {WAITERS} all holding pizza slices high in the air like lighters at a concert")]),
('s034', 126, [33], 'M', "She dunks his calculator in the marinara like a biscuit.", "stamp: RECHAZADO", "the calculator's digits glitch",
 [('calc-dunk', 'scene', "close-up of {HER}, grinning at the lens as she lowers a pocket calculator into a bowl of marinara sauce, holding it between her thumb and one finger like a biscuit, her other hand flat on the table, nobody else in the frame", 5)]),
('s035', 130, [34], 'F', "The calculator sinks in the sauce, still counting.", "seven-segment digits, drowning", "kcal numbers float up as bubbles and pop",
 [('calc-sauce', 'macro', "macro photograph of a pocket calculator half sunk in a bowl of thick red marinara sauce, bubbles rising around it")]),
('s036', 134, [35], 'M', "She pins pepperoni on his polo like medals.", "counter", "each medal gets a tracking box and a number",
 [('medals', 'scene', "medium shot of {HIM} sitting frozen and stiff while a woman's hands {NAILS} press slices of pepperoni onto the chest of his polo shirt in a neat row like military medals")]),
# ── VII. VERSE 2: the double entendres, played straight as food ────────────────────────────────────────────────
('s037', 138, [36], 'F', "A pizza slides out of the fire.", "perfume-advert italic serif", "a rating card opens the section: CLASIFICACIÓN G — GASTRONÓMICO",
 [('oven-out', 'macro', "a bubbling pizza sliding out of a blazing wood-fired oven on a long wooden peel, flames behind it, steam rising")]),
('s038', 142, [37], 'F', "A pizza box opens by itself. Gold light and steam.", "serif, letter by letter", "the type opens with the lid",
 [('box-open', 'macro', "a white pizza box on a table in a dark room opening slowly by itself, golden light and steam pouring out of the gap")]),
('s039', 146, [38], 'F', "Her fingertip traces the blistered crust.", "serif along the curve of the crust", "type on a path",
 [('crust-edge', 'macro', "extreme macro of a blistered, charred, puffy pizza crust edge, a woman's fingertip with a glossy black nail tracing along it")]),
('s040', 150, [39], 'S', "The glossy centre of the pie.", "serif, centred", "slow push in",
 [('center-juicy', 'macro', "extreme macro of the centre of a pizza, a pool of glossy tomato sauce and melted mozzarella with beads of olive oil")]),
('s041', 154, [40], 'F', "Big floury hands press into thick dough.", "serif", "flour puffs on the kicks",
 [('dough-thick', 'macro', "close-up of a pizzaiolo's big floury hands pressing deep into a thick ball of pizza dough on a marble counter, a puff of flour in the air")]),
('s042', 158, [41], 'M', "She kneads hard, on the beat, flour on her patent top.", "serif, shaking with each push", "the type jolts on every kick",
 [('her-knead', 'bare', "medium shot of {HER}, kneading pizza dough hard on a floury marble counter in a restaurant kitchen, flour on her arms and on her black patent top, focused, biting her lip")]),
('s043', 162, [42], 'F', "The pull: a curtain of mozzarella.", "the word mozzarella stretches with the cheese", "letters elongate",
 [('cheese-pull', 'macro', "extreme macro of a pizza slice being lifted from the pie, a thick curtain of melted mozzarella stretching in long strands")]),
('s044', 165, [43], 'M', "She walks backwards across the room pulling one endless rope of cheese.", "the line hangs on the cheese rope like washing", "type on a path along the rope",
 [('rope-walk', 'scene', "wide shot of {HERFAR}, leaning back like a tug-of-war player with both hands gripping one thick, impossibly long rope of melted mozzarella in front of her chest, hauling it from a pizza on a far table, the cheese stretched tight across the whole frame, laughing, her arms bent naturally", 7)]),
('s045', 169, [44], 'S', "Two waiters carry a pizza the size of a table.", "condensed caps", "fast cuts from here: one shot per line",
 [('giant-pizza', 'scene', "wide-angle shot of two {WAITERS} carrying an enormous round pizza the size of a table between the booths, straining")]),
('s046', 171, [45], 'F', "A stuffed crust torn open, cheese oozing.", "condensed caps", "",
 [('stuffed-crust', 'macro', "extreme macro of two hands tearing a stuffed pizza crust apart, melted cheese oozing out of the crust")]),
('s047', 173, [46], 'S', "A slice far too big droops over one hand.", "condensed caps", "",
 [('one-hand', 'macro', "close-up of a huge floppy pizza slice drooping over the edges of one open hand {NAILS}, far too big to hold")]),
('s048', 175, [47], 'S', "Two hands grab it.", "condensed caps", "",
 [('two-hands', 'macro', "close-up of two hands {NAILS} gripping an enormous pizza slice and lifting it toward the lens")]),
('s049', 177.5, [48], 'F', "Sauce and cheese run down her fingers.", "condensed caps", "",
 [('drip-fingers', 'macro', "extreme macro of tomato sauce and melted cheese dripping down a woman's fingers {NAILS}")]),
('s050', 180, [49], 'S', "The slice's point of view: her open mouth arrives.", "condensed caps", "",
 [('slice-pov', 'wild', "extreme close-up from the point of view of a pizza slice: {HER} with her mouth wide open coming straight at the lens, the tip of the slice in the foreground")]),
('s051', 182, [50], 'S', "Leftovers in the fridge light.", "condensed caps", "",
 [('fridge-box', 'macro', "a white pizza box with two leftover slices alone on the shelf of an open refrigerator, lit by the cold fridge light in a dark kitchen")]),
('s052', 184, [51], 'S', "She reheats a slice and winks.", "REPETIMOS with a loop arrow", "the arrow spins once per beat",
 [('reheat-wink', 'bare', "medium close-up of {HER} in a dark kitchen lit by the orange glow of an oven, holding a reheated pizza slice on a plate, winking at the lens")]),
('s053', 188, [52], 'M', "The grandmother clutches her chest. The waiter covers his eyes and peeks.", "film subtitle", "a censor bar reading OSCENO is restamped GASTRONOMICO",
 [('scandal', 'scene', "medium shot of {NONNA} clutching her chest in shock beside {WAITER} who covers his eyes with one hand but peeks through his fingers")]),
('s054', 192, [53], 'M', "She fans herself, then holds up two fingers.", "film subtitle", "order ticket: 2 ×",
 [('two-more', 'scene', "close-up of {NONNA} fanning herself with a napkin and holding up two fingers to order")]),
# ── VIII. BRIDGE: the telenovela ───────────────────────────────────────────────────────────────────────────────
('s055', 196, [54], 'M', "Telenovela despair: hand to forehead, one tear, wind machine.", "soap-opera title script", "three crash zooms, one per ‘ay’",
 [('novela-her', 'novela', "close-up of {HER}, the back of her hand pressed to her forehead in despair, eyes to heaven, a single tear on her cheek")]),
('s056', 199, [55], 'S', "The couple frozen like a news photo: she guards the pizza, he points.", "BREAKING NEWS banner: ÚLTIMA HORA", "a news frame, ticker and clock wrap the picture",
 [('tragedy-wide', 'scene', "wide shot of a couple frozen at their table like a news photograph: {HER} clutches a whole pizza to her chest protectively, {HIM} points at it accusingly, {WAITERS} gasping behind them")]),
('s057', 203, [56], 'S', "Cut away: a skinny fashion model struts down a runway.", "news lower third", "his cold blue HUD scores her: 9.8",
 [('runway', 'bare', "full-length shot of a very thin fashion model with slicked-back blonde hair in a pale grey couture dress strutting down a white runway straight toward the lens, a blank bored expression, rows of photographers' flashes in the dark behind her", 5)]),
('s058', 206.5, [57], 'M', "She gets what she asked for: a cascade of marinara pours over her from above, and she loves it.", "order line: + salsa adicional", "the falling sauce wipes the line on",
 [('salsa-douse', 'scene', "medium shot of {HER}, eyes closed and laughing with her arms open as a thick cascade of red tomato marinara sauce pours down over her head and shoulders from above, sauce splashing on the white tablecloth, nobody else in the frame", 5)]),
('s059', 212, [58], 'S', "Three gasps, one per ‘ay’: him, the waiter, the grandmother.", "soap-opera script, one ‘ay’ each", "crash zoom on each face",
 [('gasp-him', 'novela', "close-up of {HIM} gasping, one hand on his cheek, shocked"),
  ('gasp-waiter', 'novela', "close-up of {WAITER} gasping and dropping a silver tray, shocked"),
  ('gasp-nonna', 'novela', "close-up of {NONNA} gasping with both hands on her cheeks, shocked")]),
('s060', 215, [59], 'S', "Stare-down in profile, nose to nose, a crust in her teeth.", "episode title card: CONFLICTO PROFUNDO", "‘capítulo 247’",
 [('stare-down', 'novela', "two-shot in profile of a couple nose to nose across a table in a furious stare-down: {HER} on the left with a pizza crust between her teeth, {HIM} on the right, a candle between them")]),
('s061', 219.5, [60], 'S', "He squints at her through a measuring tape.", "caption on the tape", "a dotted outline labelled FIGURA",
 [('him-tape', 'scene', "medium shot of {HIM} holding a yellow measuring tape stretched between his hands and squinting through it like a surveyor")]),
('s062', 222.5, [61], 'M', "She bites a pizza made to look like the globe.", "counter: MUNDO 50%", "a bite-shaped hole in a world map",
 [('globe-pizza', 'wild', "close-up of {HER}, taking a giant bite out of a round pizza decorated like a globe of the earth with green pesto continents on white cheese oceans, eyes wide")]),
('s063', 228, [62], 'S', "He holds up a beach postcard, hopeful.", "speech quote, his colour", "a tiny sun rises behind the quote",
 [('summer', 'scene', "medium shot of {HIM} holding up a small beach postcard and pointing at it hopefully, sunglasses pushed up on his head")]),
('s064', 232, [63], 'M', "Her, deadpan, cheeks stuffed, a slice in each hand.", "speech quote, her colour", "survival-kit icons",
 [('survive', 'wild', "close-up of {HER}, deadpan, cheeks stuffed with pizza like a hamster, staring straight into the lens, a pizza slice in each hand")]),
('s065', 236, [64], 'S', "His hand creeps toward her last slice. She pulls a gun on him, deadpan, still chewing.", "warning tape type", "freeze frame on the kick; a crash zoom on his hand",
 [('standoff-gun', 'scene', "medium two-shot at a restaurant table: {HIM} freezes with his hand hovering over the last pizza slice on a plate, staring wide-eyed across the table at {HER}, who points a small silver revolver at him with one hand, deadpan, chewing", 5)]),
('s066', 240.5, [65], 'L', "She sings it dead serious, fork pointed at the lens. In the silence he leaves; the salad stays.", "legal small print, then a status toggle", "‘En una relación’ flips to ‘Soltera, con pizza’",
 [('ultimatum', 'scene', "medium close-up of {HER}, dead serious, leaning over the table pointing a fork straight at the lens, guarding a pizza slice with her other arm"),
  ('he-leaves', 'scene', "wide shot of {HIM} walking out of the trattoria's front door into the night, seen from behind, a small green salad left on the empty table in the foreground")]),
# ── IX. CHORUS 3: single, with pizza ───────────────────────────────────────────────────────────────────────────
('s067', 248, [66], 'M', "Alone in the big round booth, arms spread like a queen, four pizzas.", "the label, gold", "",
 [('queen-booth', 'scene', "wide symmetrical shot of {HERFAR}, lounging alone in the middle of a big round red leather booth with her arms spread along the backrest like a queen, four whole pizzas on the table in front of her, singing")]),
('s068', 251, [67], 'M', "Four waiters carry her through the room on a giant pizza peel.", "PROGRESO bar at 100%", "confetti of basil leaves",
 [('peel-carry', 'scene', "wide shot of four {WAITERS} carrying {HERFAR} through the dining room on a giant wooden pizza peel on their shoulders like a queen on a litter, she waves a pizza slice")]),
('s069', 256, [68], 'S', "Three more bites, one per beat.", "one word per bite", "",
 [('bite-e', 'wild', "extreme close-up of {HER}, biting two stacked pizza slices at once, eyes crossed"),
  ('bite-f', 'wild', "close-up of {HER}, a pizza slice hanging from her mouth with no hands, both hands making peace signs"),
  ('bite-g', 'wild', "extreme close-up of {HER}, licking melted cheese off the back of her hand, a slice in the other hand, grinning")]),
('s070', 259, [69], 'M', "The kiss again, closer, sauce on her nose.", "napkin handwriting", "a second kiss print beside the first",
 [('kiss-2', 'wild', "extreme close-up of {HER}, eyes closed, lips puckered into a big kiss aimed straight at the lens, a small smear of tomato sauce at the corner of her mouth", 4)]),
('s071', 264, [70], 'S', "A product shot: her and the slice, commercial smile.", "the label with her as the brand", "‘Porción: toda’",
 [('label-face', 'bare', "centred beauty portrait of {HER}, holding a pizza slice beside her cheek like a product in an advertisement, a bright commercial smile, a plain cream studio backdrop")]),
('s072', 267, [71], 'M', "She tears a measuring tape in half with her teeth.", "stamp: RECHAZADO", "the tape's numbers scatter",
 [('tape-tear', 'scene', "medium close-up of {HER}, tearing a yellow measuring tape in half with both hands and her teeth, fierce and laughing")]),
('s073', 271, [72], 'S', "His calculator, abandoned beside the salad and an empty chair.", "seven-segment: ERROR", "the kcal HUD flickers out",
 [('calc-alone', 'scene', "close-up of a black pocket calculator abandoned on a white tablecloth beside a half-eaten green salad and a glass of water, an empty red leather booth seat behind it, nobody in the frame", 8)]),
('s074', 275, [73], 'M', "Pepperoni rains on her like confetti.", "counter spins to 9,999", "every falling slice gets a tracking box",
 [('pepperoni-rain', 'scene', "medium shot of {HER}, arms open and face turned up, laughing as slices of pepperoni rain down on her like confetti in the dining room")]),
# ── X. BREAKDOWN: the commandments ─────────────────────────────────────────────────────────────────────────────
('s075', 281, [74], 'S', "The measuring tape, served as pasta: coiled on a plate under tomato sauce and basil, a fork twirled into it.", "full-frame caps, white on red", "hard cut and flash on the kick",
 [('tape-pasta', 'macro', "top-down close-up of a yellow fabric measuring tape coiled on a white plate like a nest of tagliatelle, tomato sauce and one basil leaf on top, a dusting of grated parmesan, a fork twirled into the coil lifting a few loops of tape, a white tablecloth, a red glass candle holder at the edge", 10)]),
('s076', 283, [75], 'S', "She drops the bathroom scale in the bin, held between two fingertips.", "full-frame caps", "the lid clangs on the kick",
 [('scale-bin', 'scene', "medium shot of {HER}, holding a bathroom scale at arm's length between two fingertips like something disgusting, nose wrinkled, dropping it into a steel kitchen bin beside the table", 5)]),
('s077', 285, [76], 'S', "His briefcase, full of hidden parmesan and chili. Her hand takes one.", "full-frame caps", "evidence tags on each shaker",
 [('condiments', 'scene', "close-up of a man's brown leather briefcase lying open on a restaurant table, packed with hidden glass shakers of grated parmesan, chili flakes and oregano with plain metal lids and no labels, one bare tan woman's hand {NAILS} reaching in from the right and snatching a shaker, nobody else in the frame", 8)]),
('s078', 289, [77], 'S', "A pepper mill comes down like a gavel.", "full-frame caps", "",
 [('gavel', 'scene', "close-up of a woman's fist {NAILS} gripping a tall wooden pepper mill and slamming its base down on a white tablecloth like a judge's gavel, peppercorns jumping, motion blur", 5)]),
('s079', 291, [78], 'S', "Spa: a pepperoni slice over each eye.", "full-frame caps", "",
 [('spa', 'wild', "close-up of {HER} leaning back in the booth with a slice of pepperoni over each eye like a spa treatment, a blissful smile, hands folded")]),
('s080', 293, [79], 'F', "Four waiters' hands pass four cheeses.", "four-up grid, one cheese per cell", "in the stop the four cells spin like a slot machine",
 [('four-cheeses', 'macro', "top-down photograph of four white plates in a square on a white tablecloth: a ball of mozzarella, a wedge of parmesan, a wedge of blue-veined gorgonzola and a round of provolone, four waiters' hands in white sleeves reaching in from the four corners")]),
# ── XI. FINAL CHORUS: the coronation ───────────────────────────────────────────────────────────────────────────
('s081', 300, [80], 'L', "Nuestra Señora del Queso: she appears as the Virgin of Guadalupe, in a tablecloth mantle with gold stars, a pizza for a halo and breadsticks for rays.", "the label as an altarpiece, gold leaf", "rays pulse on the kicks; gold stars; roses of pepperoni",
 [('guadalupe', 'bare', "devotional portrait in the style of the Virgin of Guadalupe, staged as a fashion photograph, waist up: {HERSHORT}, her hands pressed together in prayer at her chest, head gently tilted and eyes lowered, a mantle made of a red-and-white checkered tablecloth scattered with gold stars draped over her head and shoulders, a whole pepperoni pizza glowing behind her head like a halo, golden breadsticks radiating all around her like rays of light, red roses and lit candles below, a dark red backdrop", 10),
  ('halo', 'scene', "centred portrait of {HER}, gazing down at the lens like a Renaissance saint, a whole pepperoni pizza glowing behind her head like a golden halo, hands open at her sides, candles all around")]),
('s082', 303, [81], 'M', "A conga line through the booths, her at the front.", "PROGRESO, everyone at 100%", "",
 [('conga', 'scene', "wide shot of a conga line dancing between the booths: {HERFAR} at the front holding a pizza high, followed by {WAITERS}, a tiny grandmother in pearls and a pizzaiolo in an apron, everyone laughing")]),
('s083', 308, [82], 'S', "Three more bites, one per beat.", "one word per bite", "",
 [('bite-h', 'wild', "close-up of {HER} and {WAITER} sharing one long string of melted cheese, each biting one end"),
  ('bite-k', 'wild', "extreme close-up of {HER}, a pizza slice in each hand, biting one while the other waits at her cheek, cheeks bulging, eyes wide and delighted", 5),
  ('bite-l', 'wild', "extreme close-up of {HER}, eyes squeezed shut with joy, biting a pizza slice folded in half like a taco, melted cheese stretching, tomato sauce on her chin", 6)]),
('s084', 311, [83], 'M', "Kisses with both hands, laughing.", "napkin handwriting", "kiss prints multiply across the frame, one per beat",
 [('kiss-4', 'have', 'plates-12/kiss-4a')]),
('s085', 316, [84], 'S', "The full apparition: she stands in a mandorla of breadsticks on a crescent of pizza crust, a tiny waiter at her feet.", "a prayer card: the label set in gold along the card's border", "gold leaf border; rays pulse on the kicks",
 [('apparition', 'bare', "full-length devotional image in the style of the Virgin of Guadalupe, staged as a fashion photograph: {HERSHORT}, standing with her hands pressed together in prayer and her eyes lowered, a long mantle made of a red-and-white checkered tablecloth scattered with gold stars over her head and shoulders, surrounded head to toe by golden breadsticks radiating like rays of light, standing on a crescent of pizza crust held up by a small old waiter in a white jacket and bow tie, red roses at her feet, a dark red backdrop", 10)]),
('s086', 319, [85], 'M', "She pushes out the front door with a tower of pizza boxes and looks back.", "stamped on the top box", "",
 [('exit-boxes', 'scene', "full-length shot from behind of {HERFAR}, pushing out through the trattoria's front door into the night street carrying a tall stack of white pizza boxes, glancing back over her shoulder with a grin")]),
('s087', 323, [86], 'S', "Him outside in the rain, face against the window.", "seven-segment, dim", "his HUD: 0 kcal, 0 todo",
 [('him-window', 'bare', "night exterior in the rain: {HIM} standing alone outside a restaurant pressing his face and one hand against the window, looking in at the warm light inside")]),
('s088', 327, [87], 'M', "She rides off on a red scooter with the boxes strapped behind her.", "counter, still climbing", "",
 [('scooter', 'bare', "wide night street shot of {HERFAR}, riding away on a red vintage scooter with a tall stack of white pizza boxes strapped behind her, a pizza slice in one hand, hair flying, wet cobblestones")]),
# ── XII. OUTRO: after hours ────────────────────────────────────────────────────────────────────────────────────
('s089', 333, [88], 'M', "The empty trattoria, chairs up. She reaches out and covers the lens.", "small, centred, on black as her hand closes the frame", "",
 [('after-hours', 'scene', "wide shot of the empty trattoria after closing, chairs upside down on the tables, one light on: {HERFAR} alone in a red leather booth with one last pizza, reaching a hand out toward the lens")]),
('s090', 337, [89], 'S', "The bathroom scale sticks out of the bin where she left it, an empty pizza box dropped on top.", "small, centred", "",
 [('scale-in-bin', 'scene', "close-up of a steel kitchen bin beside a restaurant table with a white bathroom scale sticking out of it and a greasy empty white pizza box dropped on top of the scale, nobody in the frame", 9)]),
('s091', 341, [90], 'M', "Parmesan falls like snow through a beam of light.", "the line falls with the cheese", "particles of type",
 [('parm-snow', 'scene', "close-up of {HER} shaking a parmesan shaker high over a pizza, the grated cheese falling like snow through a beam of light, calm, eyes half closed")]),
('s092', 349, [91], 'M', "The last pull, slow: one rope of mozzarella from her lips to the slice.", "the label assembles one last time: Grasa 0 g, Culpa 0%, Queso 100%", "",
 [('last-pull', 'wild', "extreme close-up of {HER}, slowly pulling the last pizza slice away from her mouth, one long rope of mozzarella stretching between her lips and the slice, eyes on the lens")]),
('s093', 360, [92], 'L', "She whispers it, chin on her hand, then burps and giggles. End card on the plate with one crust.", "title: QUESO, then Saindra", "a film subtitle for the burp: (eructo)",
 [('whisper', 'scene', "extreme close-up of {HER}, resting her chin on her hand in the empty trattoria, whispering to the lens with a small satisfied smile, a clean plate with one crust in front of her"),
  ('end-plate', 'macro', "top-down photograph of an empty white plate holding only one gnawed pizza crust and a few crumbs, a crumpled white napkin beside it on a white tablecloth, a red glass candle holder burned low", 4)]),
]

SECTIONS = [(0, 'I. Aperitivo'), (13, 'II. Chorus 1'), (45, 'III. The Italian chorus'), (57, 'IV. Verse 1'), (89, 'V. Pre-chorus'), (107, 'VI. Chorus 2'),
            (138, 'VII. Verse 2'), (196, 'VIII. Bridge'), (248, 'IX. Chorus 3'), (281, 'X. Breakdown'), (300, 'XI. Final chorus'), (333, 'XII. Outro')]
HOW = {'L': 'lip-sync', 'M': 'motion', 'F': 'insert motion', 'S': 'still'}

shots, jobs, seen = [], [], set()
for i, (sid, b, lines, how, pic, typ, gfx, plates) in enumerate(S):
    b1 = S[i + 1][1] if i + 1 < len(S) else (DUR - T0) / PER
    t0, t1 = (0.0 if b == 0 else T0 + b * PER), min(DUR, T0 + b1 * PER)
    sec = [n for bb, n in SECTIONS if bb <= b][-1]
    ps = []
    for name, kind, text, *rev in plates:
        if kind == 'have': ps.append({'name': name, 'have': text}); continue
        rev = rev[0] if rev else 2 if '{HIM}' in text else 1
        pr = prompt(kind, text); ps.append({'name': name, 'prompt': pr, 'batch': f'plates-{rev:02d}'})
        assert name not in seen, name; seen.add(name)
        assert len(pr.split(' --ar')[0]) <= 900, (name, len(pr.split(' --ar')[0]))
        jobs.append({'name': name, 'prompt': pr, 'job_id': None, 'rev': rev})
    shots.append({'id': sid, 'section': sec, 'b0': b, 'b1': round(b1, 2), 't0': round(t0, 3), 't1': round(t1, 3), 'lines': lines,
                  'lyric': ' / '.join(('(' + LINES[l]['text'] + ')') if LINES[l]['aside'] else LINES[l]['text'] for l in lines),
                  'how': how, 'picture': pic, 'type': typ, 'gfx': gfx, 'plates': ps})
assert sorted(l for s in shots for l in s['lines']) == sorted(LINES), 'every lyric line must belong to a shot'

(P / 'shots.json').write_text(json.dumps({'draft': 1, 'shots': shots}, ensure_ascii=False, indent=1))
(P / 'mj').mkdir(exist_ok=True)
for rev in sorted({j['rev'] for j in jobs}):          # one batch file per revision; a job keeps its id while its prompt is unchanged
    f = P / f'mj/plates-{rev:02d}.json'
    old = {j['name']: j for j in json.loads(f.read_text())['jobs']} if f.exists() else {}
    mine = [j for j in jobs if j['rev'] == rev]
    for j in mine:   # a job that was already sent keeps its record, including the prompt it was sent with; a re-shoot gets a new rev
        if j['name'] in old and (old[j['name']].get('job_id') or old[j['name']].get('sent')): j.update({k: v for k, v in old[j['name']].items() if k != 'rev'})
    f.write_text(json.dumps({'name': f'plates-{rev:02d}', 'jobs': mine}, ensure_ascii=False, indent=1))

md = ["# Queso — storyboard, draft 1", "",
      "Date night at a red-sauce trattoria. He counts her calories. She counts pepperonis. By the last chorus he is gone and the pizza is still there.", "",
      f"{len(shots)} shots on the kick grid (98 BPM). Times are song time. **how**: lip-sync, motion and insert motion are Seedance clips; still is a Midjourney plate moved by the engine.", ""]
sec = None
for s in shots:
    if s['section'] != sec:
        sec = s['section']; md += ["", f"## {sec}", "", "| shot | time | lyric | picture | lyric surface | graphics | how |", "|---|---|---|---|---|---|---|"]
    md.append(f"| {s['id']} | {int(s['t0'] // 60)}:{s['t0'] % 60:05.2f}–{int(s['t1'] // 60)}:{s['t1'] % 60:05.2f} | {s['lyric']} | {s['picture']} | {s['type']} | {s['gfx'] or '—'} | {HOW[s['how']]} |")
(P / 'STORYBOARD.md').write_text('\n'.join(md) + '\n')

secs = {k: round(sum(s['t1'] - s['t0'] for s in shots if s['how'] == k), 1) for k in HOW}
print(f"{len(shots)} shots, {len(jobs)} plate jobs to make, {sum(1 for s in shots for p in s['plates'] if 'have' in p)} plates already made")
print('screen seconds by method:', secs, '| longest prompt', max(len(j['prompt'].split(' --ar')[0]) for j in jobs))
