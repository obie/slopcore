// time.js: BEAT (the uniform beat grid) and LYR (timed lyric lines and words).
'use strict';

const BEAT = {
  period: NaN, t0: NaN, bpm: NaN, duration: NaN,

  _init(b) {
    if (!b) throw new Error('assets/beats.js is missing: run `render.py assets`');
    this.period = b.period; this.t0 = b.t0; this.bpm = b.bpm; this.duration = b.duration;
  },
  // time of beat n (n may be fractional: BEAT.t(16.5) is the off-beat after beat 16)
  t(n) { return this.t0 + n * this.period; },
  // fractional beat position of time t; beat 0 is at t0
  pos(t) { return (t - this.t0) / this.period; },
  // index of the last beat at or before t
  n(t) { return Math.floor(this.pos(t) + 1e-9); },
  // 1 on the beat, falling as (1 - dt/decay)^2 to 0 at `decay` seconds after it. `every` = beats between pulses.
  pulse(t, decay = 0.25, every = 1) {
    const p = this.pos(t) / every;
    const dt = Math.max(0, p - Math.floor(p + 1e-9)) * every * this.period;
    const u = 1 - dt / decay;
    return u > 0 ? u * u : 0;
  },
  // nearest grid time to t; div = 2 snaps to half beats, 4 to quarters
  snap(t, div = 1) {
    const p = this.period / div;
    return this.t0 + Math.round((t - this.t0) / p) * p;
  },
};

const LYR = {
  lines: [],       // [{li, section, stanza, text, aside, t0, t1, words: [{w, t0, t1}]}], frozen
  duration: NaN,

  _init(l) {
    if (!l) throw new Error('assets/lyrics.js is missing: run `render.py assets`');
    const freeze = o => { Object.values(o).forEach(v => v && typeof v === 'object' && freeze(v)); return Object.freeze(o); };
    this.lines = freeze(l.lines);
    this.duration = l.duration;
  },
  // line by index
  line(li) {
    const L = this.lines[li];
    if (!L) throw new Error(`LYR.line: no line ${li}`);
    return L;
  },
  // word wi of line li: {w, t0, t1}
  word(li, wi) {
    const w = this.line(li).words[wi];
    if (!w) throw new Error(`LYR.word: line ${li} has no word ${wi}`);
    return w;
  },
  // lines sounding at t (t0 <= t < t1); lines can overlap
  at(t) { return this.lines.filter(L => L.t0 <= t && t < L.t1); },
  // lines of stanza s
  stanza(s) { return this.lines.filter(L => L.stanza === s); },
};
