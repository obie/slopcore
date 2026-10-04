// math.js: pure helpers (clamp/lerp/remap, easings, a closed-form spring, seeded randomness).
'use strict';

const TAU = Math.PI * 2;

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, u) => a + (b - a) * u;

// remap x from [a, b] to [c, d], clamped, with an optional easing on the way.
function remap(x, a, b, c = 0, d = 1, ease) {
  let u = a === b ? (x >= b ? 1 : 0) : clamp((x - a) / (b - a));
  if (ease) u = ease(u);
  return c + (d - c) * u;
}

// Easings take u in [0, 1] and return a value that starts at 0 and ends at 1.
const EASE = Object.freeze({
  linear: u => u,
  inQuad: u => u * u,
  outQuad: u => 1 - (1 - u) * (1 - u),
  inOutQuad: u => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u)),
  inCubic: u => u * u * u,
  outCubic: u => 1 - (1 - u) ** 3,
  inOutCubic: u => (u < 0.5 ? 4 * u * u * u : 1 - 4 * (1 - u) ** 3),
  inQuart: u => u ** 4,
  outQuart: u => 1 - (1 - u) ** 4,
  inOutQuart: u => (u < 0.5 ? 8 * u ** 4 : 1 - 8 * (1 - u) ** 4),
  inExpo: u => (u <= 0 ? 0 : 2 ** (10 * u - 10)),
  outExpo: u => (u >= 1 ? 1 : 1 - 2 ** (-10 * u)),
  inOutExpo: u => (u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? 2 ** (20 * u - 10) / 2 : 1 - 2 ** (10 - 20 * u) / 2),
  inOutSine: u => 0.5 - 0.5 * Math.cos(Math.PI * u),
  inBack: u => 2.70158 * u * u * u - 1.70158 * u * u,
  outBack: u => 1 + 2.70158 * (u - 1) ** 3 + 1.70158 * (u - 1) ** 2,
  outElastic: u => (u <= 0 ? 0 : u >= 1 ? 1 : 2 ** (-10 * u) * Math.sin((u * 10 - 0.75) * (TAU / 3)) + 1),
  outBounce: u => {
    const n = 7.5625, d = 2.75;
    if (u < 1 / d) return n * u * u;
    if (u < 2 / d) return n * (u -= 1.5 / d) * u + 0.75;
    if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + 0.9375;
    return n * (u -= 2.625 / d) * u + 0.984375;
  },
  smooth: u => u * u * (3 - 2 * u),
});

// spring(lt, freq, damp): step response of a damped spring, 0 at lt <= 0, settling on 1.
// lt in seconds, freq in Hz, damp is the damping ratio (under 1 overshoots, 1 is critical).
function spring(lt, freq = 3, damp = 0.5) {
  if (lt <= 0) return 0;
  const w = TAU * freq;
  if (damp < 1) {
    const wd = w * Math.sqrt(1 - damp * damp);
    return 1 - Math.exp(-damp * w * lt) * (Math.cos(wd * lt) + (damp * w / wd) * Math.sin(wd * lt));
  }
  if (damp === 1) return 1 - Math.exp(-w * lt) * (1 + w * lt);
  const s = Math.sqrt(damp * damp - 1), r1 = -w * (damp - s), r2 = -w * (damp + s);
  return 1 - (r2 * Math.exp(r1 * lt) - r1 * Math.exp(r2 * lt)) / (r2 - r1);
}

// hash(a, b, ...) -> a fixed float in [0, 1) for those numbers. The replacement for Math.random.
const _hf = new Float64Array(1), _hu = new Uint32Array(_hf.buffer);
function hash(...nums) {
  let h = 0x811c9dc5 | 0;
  for (const v of nums) {
    _hf[0] = v + 0;                                   // + 0 folds -0 into 0
    h = Math.imul(h ^ _hu[0], 0x01000193); h = Math.imul(h ^ _hu[1], 0x01000193);
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
  }
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// rnd(seed) -> a generator with the same sequence every time it is built: r(), r.range(a, b), r.int(n), r.pick(arr).
// Build it inside draw(); never keep one across frames.
function rnd(seed = 0) {
  let s = (hash(seed) * 4294967296) | 0;
  const r = () => {
    s = (s + 0x6d2b79f5) | 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  r.range = (a, b) => a + (b - a) * r();
  r.int = n => Math.floor(r() * n);
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  return r;
}

// noise(x, seed) -> smooth value noise in [-1, 1], one feature per unit of x. For drift and shake.
function noise(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  return lerp(hash(i, seed), hash(i + 1, seed), f * f * (3 - 2 * f)) * 2 - 1;
}

// mixColor('#rrggbb', '#rrggbb', u) -> 'rgb(r,g,b)'
function mixColor(a, b, u) {
  const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(u)))).join(',')})`;
}
