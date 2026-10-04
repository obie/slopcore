// queso/engine/common.js: shared by every chapter of "Queso" (Saindra). Runs once, before the chapters.
// Top-level declarations here are global. Keep this file to constants and pure functions.
// The design spec that explains every value here is queso/DESIGN.md.

// ---------------------------------------------------------------- palette
const PAL = Object.freeze({
  tomato: '#E2321E',   // tomato red: commandments, her counter, the strike, stamps, kiss prints
  mozz: '#FBF6EA',     // mozzarella white: every paper surface (label, receipt, napkin) and type on colour
  cheese: '#FFD23F',   // cheese yellow, the accent: QUESO, subtitles, the one highlight in a frame
  basil: '#2F8F4E',    // basil green, used rarely: the rating card
  patent: '#0C0B0E',   // patent black: ink on paper, his counter's panel, edges
  ice: '#BFE6FF',      // his cold pale blue: everything he measures
  gold: '#E3B23C',     // flat gold for the later labels (no gradient)
  // kept for the timing proof (ch/00_timing.js)
  bg: '#0e0e12',
  ink: '#101014',
  dim: '#4a4d58',
  white: '#ffffff',
  cream: '#fff4d6',
  crust: '#d98e32',
});

// ---------------------------------------------------------------- fonts
// Engine fonts: Anton, Inter, JetBrains Mono, Playfair Display Italic. Project fonts live in queso/engine/fonts/
// (licences in LICENSES.md there).
const _FONTS = `/${ENGINE.project}/engine/fonts`;
TXT.addFont('Libre Baskerville', `${_FONTS}/LibreBaskerville-Variable.ttf`);
TXT.addFont('Libre Baskerville', `${_FONTS}/LibreBaskerville-Italic-Variable.ttf`, { style: 'italic' });
TXT.addFont('Yesteryear', `${_FONTS}/Yesteryear-Regular.ttf`);
TXT.addFont('Caveat', `${_FONTS}/Caveat-Variable.ttf`);
TXT.addFont('DSEG7 Classic', `${_FONTS}/DSEG7Classic-Bold.ttf`);

// One face per job. Use FACE.<job> in a style, never a family name.
const FACE = Object.freeze({
  caps: FONT.hook,             // Anton: QUESO, slabs, commandments, stamps, her counter
  sans: FONT.sans,             // Inter: the nutrition label, the versus chart, the news banner, cards
  mono: FONT.mono,             // JetBrains Mono: his tags, the receipt
  perfume: FONT.serif,         // Playfair Display Italic: verse 2
  book: 'Libre Baskerville',   // film subtitles (italic), the menu row (bold caps, italic description)
  script: 'Yesteryear',        // telenovela titles
  hand: 'Caveat',              // the napkin
  seg: 'DSEG7 Classic',        // the calculator total: digits, minus, colon, point only
});

// Type scale, font px on the 1920x1080 frame.
const SIZE = Object.freeze({
  fine: 20,      // small print that is not lyric
  note: 28,      // tags and units that are not lyric
  floor: 44,     // the smallest a sung word is ever set
  row: 64,       // a lyric word inside a panel
  sub: 68,       // film subtitles
  line: 96,      // a lyric line on its own
  display: 150,  // a slab, a stamp, a script title
  slam: 240,     // QUESO
});

// Type styles. Spread one and override: TXT.draw(ctx, 'QUESO', 960, 540, {...STY.hook, size: 300})
const STY = Object.freeze({
  hook: Object.freeze({ font: FACE.caps, weight: 400, upper: true, tracking: 0.01, fill: PAL.cheese }),
  caps: Object.freeze({ font: FACE.caps, weight: 400, upper: true, tracking: 0.01, fill: PAL.mozz }),
  lyric: Object.freeze({ font: FACE.sans, weight: 800, fill: PAL.white }),
  label: Object.freeze({ font: FACE.sans, weight: 900, tracking: -0.025, fill: PAL.patent }),
  sub: Object.freeze({ font: FACE.book, weight: 500, italic: true, fill: PAL.cheese, stroke: PAL.patent }),
  aside: Object.freeze({ font: FACE.perfume, weight: 600, italic: true, fill: PAL.cream }),
  perfume: Object.freeze({ font: FACE.perfume, weight: 500, italic: true, fill: PAL.mozz }),
  script: Object.freeze({ font: FACE.script, weight: 400, fill: PAL.mozz, stroke: PAL.tomato }),
  hand: Object.freeze({ font: FACE.hand, weight: 700, fill: PAL.patent }),
  his: Object.freeze({ font: FACE.mono, weight: 700, upper: true, fill: PAL.ice }),
  readout: Object.freeze({ font: FACE.mono, weight: 500, fill: PAL.white }),
  seg: Object.freeze({ font: FACE.seg, weight: 700, fill: PAL.ice }),
});

// SONG.stanzas: [{stanza, section, lines, t0, t1}] in song order, from the timed lyric sheet.
const SONG = (() => {
  const stanzas = [];
  for (const L of LYR.lines) {
    let s = stanzas[stanzas.length - 1];
    if (!s || s.stanza !== L.stanza) stanzas.push((s = { stanza: L.stanza, section: L.section, lines: [], t0: L.t0, t1: L.t1 }));
    s.lines.push(L);
    s.t0 = Math.min(s.t0, L.t0);
    s.t1 = Math.max(s.t1, L.t1);
  }
  return Object.freeze({ duration: BEAT.duration, stanzas: Object.freeze(stanzas.map(s => Object.freeze(s))) });
})();

// ---------------------------------------------------------------- the kit
// INCLUDE(url): run a project script now, inside its own strict-mode function, the way boot.js runs a chapter.
// boot.js loads a fixed list of asset files and only the chapters picked with --ch, and the kit has to be there
// for every chapter, so common.js pulls in the shot list, the edit list and ch/_kit.js itself. The request is
// synchronous because common.js runs as a plain script and the chapters that follow need the kit at load.
function INCLUDE(url) {
  const x = new XMLHttpRequest();
  x.open('GET', url, false);
  x.send();
  if (x.status !== 200) throw new Error(`INCLUDE: HTTP ${x.status} for ${url}`);
  let err = null;
  const onErr = e => { err = `${url}:${e.lineno}:${e.colno} ${e.message}`; };
  window.addEventListener('error', onErr);
  const s = document.createElement('script');
  s.textContent = `(function(){'use strict';${x.responseText}\n})();\n//# sourceURL=${url}`;
  const was = ENGINE._file;
  ENGINE._file = url.split('/').pop();
  document.head.appendChild(s);
  ENGINE._file = was;
  window.removeEventListener('error', onErr);
  if (err) throw new Error(err);
}

INCLUDE(`/${ENGINE.project}/engine/assets/shots.js`);   // window.SHOTS, from queso/shots.json
INCLUDE(`/${ENGINE.project}/engine/assets/edl.js`);     // window.EDL, from queso/edl.json
INCLUDE(`/${ENGINE.project}/engine/ch/_kit.js`);        // KIT, SHOT, CAM
