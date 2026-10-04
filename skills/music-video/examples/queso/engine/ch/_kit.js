// _kit.js: the design kit of "Queso". Every device the chapters share: KIT.*, SHOT.*, CAM.*.
// The binding spec, with one recipe and one picture per device, is queso/DESIGN.md.
//
// Loading. common.js runs this file once with INCLUDE(), before any chapter, whatever --ch picks. The chapter
// manifest lists it too, so it also runs as a chapter; the guard below turns that second run into nothing.
//
// Rules of the kit:
//   - Every device is a pure function of song time t. Nothing here keeps state between frames.
//   - A device that shows sung words takes the line index li, puts each word on screen at that word's t0 and
//     calls LY.mark for it with the size it is drawn at.
//   - Project fonts are still loading while this file runs, so nothing here measures text at load. All layout
//     happens inside draw.

if (globalThis.KIT) return;

const P = PAL, F = FACE;

// ---------------------------------------------------------------- small helpers

// hit(t, at, decay): 1 at `at`, falling as (1 - dt/decay)^2 to 0. `at` is one time or a list of times.
function hit(t, at, decay = 0.25) {
  let k = 0;
  for (const th of [].concat(at)) {
    const dt = t - th;
    if (dt >= 0 && dt < decay) { const u = 1 - dt / decay; k += u * u; }
  }
  return k;
}

// slam(lt, from, d): scale of a thing that lands at lt = 0. 0 before the hit (draw nothing), `from` on the
// hit frame, 1 after d seconds, then one small recoil.
function slam(lt, from = 2.4, d = 0.085) {
  if (lt < 0) return 0;
  if (lt < d) return lerp(from, 1, EASE.outCubic(lt / d));
  return 1 - 0.045 * Math.sin(Math.PI * clamp((lt - d) / 0.14));
}

// the last whole beat at least `lead` seconds before t
const beatBefore = (t, lead = 0.1) => BEAT.t(Math.floor(BEAT.pos(t - lead) + 1e-9));

// 2310 -> '2310', 12400 -> '12 400' (Spanish: groups of three from five digits up)
function num(n) {
  const s = String(Math.round(n));
  return s.length < 5 ? s : s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const capFirst = s => s.charAt(0).toLocaleUpperCase('es') + s.slice(1);
const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));
const wordOn = (li, wi, t) => t >= LYR.word(li, wi).t0;

function rule(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

// ---------------------------------------------------------------- CAM: camera moves tied to beats

// Each helper returns a partial camera {zoom, x, y, rot}. Hand one, or a list, to SHOT.draw as `cam`, or to
// CAM.apply to move a graphics layer with the picture.
const CAM = {
  // punch: the picture jumps in by `amt` on a hit and settles back over `decay` seconds
  punch(t, at, amt = 0.05, decay = 0.28) { return { zoom: 1 + amt * hit(t, at, decay) }; },
  // beat: a punch on every beat (or every `every` beats)
  beat(t, amt = 0.025, decay = 0.25, every = 1) { return { zoom: 1 + amt * BEAT.pulse(t, decay, every) }; },
  // crash: from 1 to `to` in d seconds and stay there. Give SHOT.draw an `about` point to crash into.
  crash(t, at, to = 1.5, d = 0.16) {
    const lt = t - at;
    return { zoom: lt <= 0 ? 1 : lerp(1, to, EASE.outExpo(clamp(lt / d))) };
  },
  // shake: `amp` px of jitter on a hit, gone after `decay` seconds
  shake(t, at, amp = 16, decay = 0.35, seed = 0) {
    let x = 0, y = 0, rot = 0;
    [].concat(at).forEach((th, i) => {
      const k = hit(t, th, decay);
      if (!k) return;
      const f = (t - th) * 30, s = seed + i * 7;
      x += amp * k * noise(f, s + 1);
      y += amp * k * noise(f, s + 2);
      rot += 0.0012 * amp * k * noise(f, s + 3);
    });
    return { x, y, rot };
  },
  // drift: slow handheld float, `amp` px
  drift(t, amp = 5, rate = 0.45, seed = 0) {
    return { x: amp * noise(t * rate, seed + 11), y: amp * 0.7 * noise(t * rate, seed + 12) };
  },
  // mix(a, b, ...): zooms multiply, offsets and rotations add
  mix(...cams) {
    const out = { zoom: 1, x: 0, y: 0, rot: 0 };
    for (const c of cams.flat()) {
      if (!c) continue;
      out.zoom *= c.zoom ?? 1; out.x += c.x || 0; out.y += c.y || 0; out.rot += c.rot || 0;
    }
    return out;
  },
  // apply(ctx, cam): transform ctx about the frame centre. Wrap in ctx.save() / ctx.restore().
  apply(ctx, cam) {
    const c = CAM.mix(cam);
    ctx.translate(W / 2 + c.x, H / 2 + c.y);
    if (c.rot) ctx.rotate(c.rot);
    ctx.scale(c.zoom, c.zoom);
    ctx.translate(-W / 2, -H / 2);
  },
};

// ---------------------------------------------------------------- SHOT: the picture of a storyboard shot

const SHOT_BY_ID = {};
for (const s of (globalThis.SHOTS && SHOTS.shots) || []) SHOT_BY_ID[s.id] = s;
const PLATE = { w: 2944, h: 1648 }, CLIP = { w: 1920, h: 1080 };

const SHOT = {
  get(sid) {
    const s = SHOT_BY_ID[sid];
    if (!s) throw new Error(`SHOT: unknown shot "${sid}" (shots.json has s001 to s093)`);
    return s;
  },
  t0(sid) { const s = this.get(sid); return s.b0 <= 0 ? 0 : BEAT.t(s.b0); },
  t1(sid) { return Math.min(BEAT.duration, BEAT.t(this.get(sid).b1)); },
  // the edit-list entry of a shot, or null: {clip, in, warp}
  edit(sid) { const e = (globalThis.EDL || {})[sid]; return e && e.clip ? e : null; },

  // clipTime(u, entry): clip seconds shown u seconds into the shot (u = t - SHOT.t0(sid)).
  //   Without `warp` it is u + in. With `warp`, a list of knots [u, k] (seconds into the shot, clip seconds)
  //   with u ascending, clip time is piecewise linear: before the first knot and after the last it runs at
  //   normal speed through that knot, and between two knots it is interpolated. `warp` replaces `in`.
  //   A retimed lip-sync take uses it to put each sung word of the clip on that word in the song.
  clipTime(u, e) {
    const w = e.warp;
    if (!w || !w.length) return u + (e.in || 0);
    for (let i = 0; i < w.length; i++) {
      if (!Array.isArray(w[i]) || !Number.isFinite(w[i][0]) || !Number.isFinite(w[i][1]) || (i && !(w[i][0] > w[i - 1][0])))
        throw new Error(`SHOT: bad warp for clip "${e.clip}": need knots [u, k] with u ascending, got ${JSON.stringify(w)}`);
    }
    const n = w.length - 1;
    if (u <= w[0][0]) return u + (w[0][1] - w[0][0]);
    if (u >= w[n][0]) return u + (w[n][1] - w[n][0]);
    let i = 0;
    while (u >= w[i + 1][0]) i++;
    return w[i][1] + ((w[i + 1][1] - w[i][1]) * (u - w[i][0])) / (w[i + 1][0] - w[i][0]);
  },

  // which plate of the shot shows at t, and when that plate came on. A shot with several plates gives each an
  // equal share of its beats, cut on whole beats. Pass `plate` (a name or an index) to choose.
  plateAt(sid, t, plate) {
    const s = this.get(sid), names = s.plates.map(p => p.name);
    if (typeof plate === 'string') return { name: plate, t0: this.t0(sid), t1: this.t1(sid) };
    const n = names.length;
    const cut = k => (k <= 0 ? this.t0(sid) : k >= n ? this.t1(sid) : BEAT.t(Math.round(s.b0 + ((s.b1 - s.b0) * k) / n)));
    let k = plate;
    if (k == null) { k = 0; while (k + 1 < n && t >= cut(k + 1)) k++; }
    return { name: names[clamp(k, 0, n - 1)], t0: cut(k), t1: cut(k + 1) };
  },

  // placement of a picture under a move and a camera: {zoom, x, y, rot, dims}. Pure. Never shows the frame edge.
  //   move  {zoom: [a, b], x: [a, b], y: [a, b], rot: [a, b], ease}  a slow scripted move across u = 0..1
  //   cam   one CAM result or a list of them
  //   about [fx, fy]  the point of the picture, 0..1, that stays put while the zoom changes
  _place(dims, u, o = {}) {
    const mv = o.move || {}, ease = mv.ease || EASE.linear, e = ease(clamp(u));
    const pick = (v, d) => (Array.isArray(v) ? lerp(v[0], v[1], e) : v ?? d);
    const cam = CAM.mix(o.cam || []);
    const rot = pick(mv.rot, 0) + cam.rot;
    const margin = Math.cos(Math.abs(rot)) + (W / H) * Math.sin(Math.abs(rot));   // cover the corners when rotated
    const s0 = Math.max(W / dims.w, H / dims.h), iw = dims.w * s0, ih = dims.h * s0;
    // a shake needs room: the zoom rises just enough to cover the camera's own offset
    const room = Math.max((W + 2 * Math.abs(cam.x)) / iw, (H + 2 * Math.abs(cam.y)) / ih);
    const zoom = Math.max(1, room, pick(mv.zoom, 1) * cam.zoom) * margin;
    const about = o.about || [0.5, 0.5];
    let x = (1 - zoom) * (about[0] - 0.5) * iw + pick(mv.x, 0) + cam.x;
    let y = (1 - zoom) * (about[1] - 0.5) * ih + pick(mv.y, 0) + cam.y;
    const mx = Math.max(0, (iw * zoom) / margin / 2 - W / 2), my = Math.max(0, (ih * zoom) / margin / 2 - H / 2);
    x = clamp(x, -mx, mx); y = clamp(y, -my, my);
    return { zoom, x, y, rot, smooth: o.smooth || 'high', dims };
  },

  // SHOT.draw(ctx, sid, t, opts) -> {kind: 'clip' | 'plate', name, lt, place, src}
  // Draws the shot's Seedance clip when the edit list (queso/edl.json) has one, else its plate under a slow
  // scripted move. opts:
  //   move, cam, about, smooth   see _place. Without `move`, a plate pushes in 1.2% per beat. A clip has no
  //                              default move; `move` and `cam` still apply to it.
  //   plate    name or index, for a shot with several plates
  //   clip, in, warp   override the edit list, one field at a time (clip: null forces the plate, warp: null
  //            turns a warp off). See clipTime for what `in` and `warp` mean.
  //   behind   c => {...} type drawn between the background and the subject when the picture has a matte.
  //            Without a matte it is drawn on top, so place it clear of her face either way.
  // `place` in the result goes to SHOT.pt and SHOT.enter. `src` is the OCC source.
  draw(ctx, sid, t, o = {}) {
    const res = this.at(sid, t, o);
    if (res.kind === 'clip') MEDIA.drawClip(ctx, res.name, res.lt, res.place);
    else MEDIA.drawPlate(ctx, res.name, res.place);
    if (o.behind) {
      if (res.matte) OCC.behind(ctx, res.src, o.behind);
      else o.behind(ctx);
    }
    return res;
  },

  // SHOT.at(sid, t, opts): what SHOT.draw would draw, without drawing it. Same options, same result object.
  // Use it in a graphics scene that has to pin something to a picture drawn by another scene.
  at(sid, t, o = {}) {
    const s = this.get(sid);
    let base = o.clip === null ? null : o.clip ? { clip: o.clip } : this.edit(sid), c0 = this.t0(sid), c1 = this.t1(sid);
    // A shot with several plates can have one clip per plate: EDL[sid].plates[name] = {clip, in}. That clip's time
    // runs from the plate's own cut (plateAt with the plate's index), whichever way the plate was chosen. It is
    // used when the shot has no clip of its own, or when the caller asks for that plate with `plate`.
    const parts = (!base || (o.plate != null && !o.clip)) && o.clip !== null && ((globalThis.EDL || {})[sid] || {}).plates;
    if (parts) {
      const name = this.plateAt(sid, t, o.plate).name, k = s.plates.findIndex(p => p.name === name);
      if (parts[name] && parts[name].clip) { const slot = this.plateAt(sid, t, k); base = parts[name]; c0 = slot.t0; c1 = slot.t1; }
    }
    const lt = t - c0;
    if (base) {
      const e = { clip: base.clip, in: o.in ?? base.in ?? 0, warp: o.warp !== undefined ? o.warp : base.warp };
      const c = MEDIA._clip(e.clip), u = lt / (c1 - c0);
      const place = this._place(CLIP, u, o), clt = this.clipTime(lt, e);
      return { kind: 'clip', name: e.clip, lt: clt, place, src: { clip: e.clip, lt: clt, ...place }, matte: !!c.matte };
    }
    const pl = this.plateAt(sid, t, o.plate), beats = (pl.t1 - pl.t0) / BEAT.period;
    const u = (t - pl.t0) / (pl.t1 - pl.t0);
    const move = o.move || { zoom: [1.04, 1.04 + 0.012 * beats] };
    const cam = [CAM.drift(t, 3, 0.4, s.b0)].concat(o.cam || []);    // o.cam may be one camera or a list; CAM.mix flattens one level
    const place = this._place(PLATE, u, { ...o, move, cam });
    return { kind: 'plate', name: pl.name, lt: t - pl.t0, place, src: { plate: pl.name, ...place }, matte: !!MEDIA._plate(pl.name).matte };
  },

  // frame position of a pixel of the picture (plate pixels: 2944 x 1648) under a placement
  pt(place, px, py) {
    const d = place.dims, s = Math.max(W / d.w, H / d.h) * place.zoom;
    const dx = (px - d.w / 2) * s, dy = (py - d.h / 2) * s, c = Math.cos(place.rot), n = Math.sin(place.rot);
    return [W / 2 + place.x + dx * c - dy * n, H / 2 + place.y + dx * n + dy * c];
  },
  // frame rectangle {x, y, w, h} of the picture rectangle (x0, y0)-(x1, y1) under a placement (rotation ignored)
  box(place, x0, y0, x1, y1) {
    const [ax, ay] = this.pt(place, x0, y0), [bx, by] = this.pt(place, x1, y1);
    return { x: ax, y: ay, w: bx - ax, h: by - ay };
  },
  // frame px per picture px under a placement
  scale(place) { return Math.max(W / place.dims.w, H / place.dims.h) * place.zoom; },
  // enter(ctx, place): from here on ctx draws in picture pixels. Wrap in ctx.save() / ctx.restore().
  enter(ctx, place) {
    const d = place.dims, s = this.scale(place);
    ctx.translate(W / 2 + place.x, H / 2 + place.y);
    if (place.rot) ctx.rotate(place.rot);
    ctx.scale(s, s);
    ctx.translate(-d.w / 2, -d.h / 2);
  },
};

// ---------------------------------------------------------------- textures built once, at load

// speckle tile for stamp imprints: hard-edged dropouts, about 9% of the area
const SPECK = CANVAS.make(256, 256);
(() => {
  const g = SPECK.ctx, r = rnd(4107);
  g.fillStyle = '#000';
  for (let i = 0; i < 150; i++) {
    const x = r.range(0, 256), y = r.range(0, 256), s = r.range(1.2, 5.5);
    g.beginPath();
    g.ellipse(x, y, s, s * r.range(0.4, 1), r.range(0, TAU), 0, TAU);
    g.fill();
  }
  g.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    const x = r.range(0, 256), y = r.range(0, 256), a = r.range(0, TAU), l = r.range(10, 34);
    g.lineWidth = r.range(1, 2.4);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
})();

// the kiss print, 600 x 420, lips 2 units wide at 250 px per unit, one texture per ink colour
function lipPaths() {
  const up = new Path2D(), lo = new Path2D();
  up.moveTo(-1, 0.02);
  up.bezierCurveTo(-0.78, -0.2, -0.5, -0.47, -0.26, -0.45);
  up.bezierCurveTo(-0.14, -0.44, -0.07, -0.34, 0, -0.32);
  up.bezierCurveTo(0.07, -0.34, 0.14, -0.44, 0.26, -0.45);
  up.bezierCurveTo(0.5, -0.47, 0.78, -0.2, 1, 0.02);
  up.bezierCurveTo(0.6, -0.01, 0.3, -0.07, 0, -0.03);
  up.bezierCurveTo(-0.3, -0.07, -0.6, -0.01, -1, 0.02);
  up.closePath();
  lo.moveTo(-0.93, 0.09);
  lo.bezierCurveTo(-0.6, 0.07, -0.3, 0.03, 0, 0.06);
  lo.bezierCurveTo(0.3, 0.03, 0.6, 0.07, 0.93, 0.09);
  lo.bezierCurveTo(0.72, 0.44, 0.36, 0.64, 0, 0.64);
  lo.bezierCurveTo(-0.36, 0.64, -0.72, 0.44, -0.93, 0.09);
  lo.closePath();
  return [up, lo];
}
function kissTexture(color) {
  const c = CANVAS.make(600, 420), g = c.ctx, r = rnd(7);
  const [up, lo] = lipPaths();
  g.translate(300, 190); g.scale(250, 250);
  g.fillStyle = color;
  g.fill(up); g.fill(lo);
  g.globalCompositeOperation = 'destination-out';
  g.lineCap = 'round';
  for (let i = 0; i < 34; i++) {            // the creases of the lips
    const x = -0.9 + (1.8 * i) / 33 + r.range(-0.02, 0.02), up0 = r.range(-0.5, -0.2), len = r.range(0.25, 0.75);
    g.lineWidth = r.range(0.008, 0.024);
    g.beginPath(); g.moveTo(x, up0); g.lineTo(x * 0.88, up0 + len); g.stroke();
  }
  for (let i = 0; i < 40; i++) {            // dry patches
    g.beginPath();
    g.ellipse(r.range(-0.9, 0.9), r.range(-0.4, 0.6), r.range(0.006, 0.03), r.range(0.006, 0.02), r.range(0, TAU), 0, TAU);
    g.fill();
  }
  return c;
}
const KISS = { [P.tomato]: kissTexture(P.tomato), [P.patent]: kissTexture(P.patent), [P.mozz]: kissTexture(P.mozz) };

// ---------------------------------------------------------------- the nutrition label

const SKIN = {
  plain: { field: P.mozz, ink: P.patent, strike: P.tomato, slab: P.cheese, slabInk: P.patent, inner: false, arch: false },
  gold: { field: P.gold, ink: P.patent, strike: P.tomato, slab: P.patent, slabInk: P.cheese, inner: true, arch: false },
  altar: { field: P.gold, ink: P.patent, strike: P.tomato, slab: P.tomato, slabInk: P.mozz, inner: true, arch: true },
};
const LBL = { D: 560, pad: 26, small: 52 };

// the panel outline in design units, h tall; an arch when the skin asks for one
function labelPath(ctx, h, arch, inset = 0) {
  const D = LBL.D;
  ctx.beginPath();
  if (arch) {
    const r = D / 2 - inset;
    ctx.moveTo(inset, h - inset); ctx.lineTo(inset, D / 2);
    ctx.arc(D / 2, D / 2, r, Math.PI, 0);
    ctx.lineTo(D - inset, h - inset); ctx.closePath();
  } else {
    ctx.rect(inset, inset, D - 2 * inset, h - 2 * inset);
  }
}

// rows "No es <Name>," + "es <Value>" of one lyric line. Returns what the caller needs to place the slab or bar.
function labelPair(ctx, t, L, y, sk, big, opts = {}) {
  const { pad, small, D } = LBL, IW = D - 2 * pad;
  const sm = { font: F.sans, weight: 800, size: small, fill: sk.ink, tracking: -0.02 };
  const hv = { ...STY.label, fill: sk.ink };
  const w = i => L.words[i], on = i => t >= w(i).t0;
  const gap = TXT.width(' ', sm) * 0.9;
  const wNo = TXT.width(w(0).w, sm), wEs = TXT.width(w(1).w, sm), x1 = pad + wNo + gap, xName = x1 + wEs + gap * 1.3;
  const name = capFirst(w(2).w);
  const nameSize = Math.min(big, TXT.fit(name, { w: IW - (xName - pad) - (opts.reserve || 0) }, hv));
  const base = y;
  if (on(0)) { TXT.draw(ctx, w(0).w, pad, base, sm); mark(ctx, L.li, 0, small); }
  if (on(1)) { TXT.draw(ctx, w(1).w, x1, base, sm); mark(ctx, L.li, 1, small); }
  const wName = TXT.width(name, { ...hv, size: nameSize });
  if (on(2)) { TXT.draw(ctx, name, xName, base, { ...hv, size: nameSize }); mark(ctx, L.li, 2, nameSize); }
  return { sm, hv, xName, wName, nameSize, base, wEs2: TXT.width(w(3).w, sm), gap };
}

function labelTall(ctx, t, o) {
  const { x = 1300, y = 70, w = 540, variant = 'plain', grasa = null, culpa = null, extra = [], rot = 0, portion = 'toda' } = o;
  const sk = SKIN[variant];
  if (!sk) throw new Error(`KIT.label: unknown variant "${variant}" (plain, gold, altar)`);
  const { D, pad, small } = LBL, IW = D - 2 * pad, k = w / D;
  const gL = grasa != null ? LYR.line(grasa) : null, cL = culpa != null ? LYR.line(culpa) : null;
  const first = gL ? gL.t0 : cL ? cL.t0 : 0;
  const tIn = o.tIn ?? beatBefore(first);
  if (t < tIn) return null;
  const tCulpa = cL ? o.tCulpa ?? Math.max(tIn, beatBefore(cL.t0)) : Infinity;
  const tSlam = gL ? gL.words[4].t0 : Infinity;

  // heights in design units
  const title = { ...STY.label, fill: sk.ink, tracking: -0.035 };
  const TS = Math.min(TXT.fit('Información', { w: IW }, title), TXT.fit('Nutricional', { w: IW }, title));
  const capT = TXT.capH({ ...title, size: TS });
  const top = sk.arch ? 168 : pad;
  const yTitle2 = top + capT + TS * 0.97;
  const yBar = yTitle2 + 16 + 2 + 38 + 10;           // hairline, portion row, gap
  const hHead = yBar + 16;
  const qs = { font: F.caps, tracking: 0.01, upper: true };
  let slab = null, hA = 0;
  if (gL) {                                          // the QUESO slab, sized to the row it shares with "es"
    const sm = { font: F.sans, weight: 800, size: small, tracking: -0.02 };
    const lead = TXT.width(gL.words[3].w, sm) + TXT.width(' ', sm) * 1.2;
    const size = Math.min(176, TXT.fit('QUESO', { w: IW - lead - 44 }, qs));
    const cap = TXT.capH({ ...qs, size }), qw = TXT.width('QUESO', { ...qs, size }) + 44, qh = cap + 44;
    slab = { cx: pad + lead + qw / 2, cy: 92 - 12 + qh / 2, w: qw, h: qh, size, base: 92 - 12 + qh / 2 + cap / 2 };
    hA = 92 - 12 + qh + 30;
  }
  const grow = (t0, d = 0.2) => EASE.outCubic(clamp((t - t0) / d));
  const hB = cL ? 258 * grow(tCulpa) : 0;
  let hX = 0;
  for (const r of extra) hX += 72 * grow(r.t ?? tIn);
  const hFoot = 62;
  const full = hHead + hA + hB + hX + hFoot;
  const open = EASE.outExpo(clamp((t - tIn) / 0.22));
  const h = full * open;

  if (sk.arch) {                                     // rays behind the altarpiece, longer on every kick
    ctx.save();
    ctx.translate(x + w / 2, y + (D / 2) * k);
    ctx.fillStyle = P.cheese;
    const R = (D * 0.62 + 70 * BEAT.pulse(t, 0.3)) * k * open;
    for (let i = 0; i < 18; i++) {
      const a = Math.PI + ((i + 0.5) / 18) * Math.PI, da = 0.045;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - da) * R, Math.sin(a - da) * R); ctx.lineTo(Math.cos(a + da) * R, Math.sin(a + da) * R);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(x + w / 2, y); if (rot) ctx.rotate(rot); ctx.scale(k, k); ctx.translate(-D / 2, 0);
  const jolt = 1 + 0.03 * hit(t, tSlam, 0.22);
  ctx.translate(D / 2, full / 2); ctx.scale(jolt, jolt); ctx.translate(-D / 2, -full / 2);

  ctx.save();
  labelPath(ctx, h, sk.arch); ctx.clip();
  ctx.fillStyle = sk.field; ctx.fillRect(0, 0, D, h);

  if (sk.arch) {                                     // a small pizza in the crown of the arch
    ctx.fillStyle = P.tomato; ctx.beginPath(); ctx.arc(D / 2, 92, 46, 0, TAU); ctx.fill();
    ctx.strokeStyle = P.patent; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = P.cheese;
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3; ctx.beginPath(); ctx.arc(D / 2 + Math.cos(a) * 24, 92 + Math.sin(a) * 24, 8, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.arc(D / 2, 92, 8, 0, TAU); ctx.fill();
  }
  const al = sk.arch ? 'center' : 'left', tx = sk.arch ? D / 2 : pad;
  TXT.draw(ctx, 'Información', tx, top + capT, { ...title, size: TS, align: al });
  TXT.draw(ctx, 'Nutricional', tx, yTitle2, { ...title, size: TS, align: al });
  rule(ctx, pad, yTitle2 + 16, IW, 2, sk.ink);
  TXT.draw(ctx, 'Porción', pad, yTitle2 + 16 + 2 + 30, { font: F.sans, weight: 500, size: 25, fill: sk.ink });
  TXT.draw(ctx, portion, D - pad, yTitle2 + 16 + 2 + 30, { font: F.sans, weight: 800, size: 25, fill: sk.ink, align: 'right' });
  rule(ctx, pad, yBar, IW, 16, sk.ink);

  let yy = hHead;
  if (gL) {
    const r = labelPair(ctx, t, gL, yy + 92, sk, 104);
    const tS = gL.words[3].t0, u = clamp((t - tS) / 0.09);
    if (u > 0) rule(ctx, r.xName - 8, r.base - TXT.capH({ ...r.hv, size: r.nameSize }) * 0.5 - 7, (r.wName + 16) * EASE.outCubic(u), 14, sk.strike);
    if (t >= tS) { TXT.draw(ctx, gL.words[3].w, pad, yy + slab.base, r.sm); mark(ctx, gL.li, 3, small); }
    slab.cy += yy;
    rule(ctx, pad, yy + hA - 2, IW, 2, sk.ink);
    yy += hA;
  }
  if (cL && hB > 0) {
    TXT.draw(ctx, '% Culpa diaria*', D - pad, yy + 25, { font: F.sans, weight: 800, size: 19, fill: sk.ink, align: 'right' });
    rule(ctx, pad, yy + 34, IW, 2, sk.ink);
    const pct = { ...STY.label, fill: sk.ink, size: 68 };
    const r = labelPair(ctx, t, cL, yy + 34 + 66, sk, 68, { reserve: TXT.width('0%', pct) + 18 });
    if (t >= cL.words[2].t0) {
      const s = slam(t - cL.words[2].t0, 1.7, 0.08), cx = D - pad - TXT.width('0%', pct) / 2, cy = r.base - TXT.capH(pct) / 2;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      TXT.draw(ctx, '0%', 0, 0, { ...pct, align: 'center', baseline: 'center' });
      ctx.restore();
    }
    rule(ctx, pad, yy + 34 + 86, IW, 2, sk.ink);
    const b2 = yy + 34 + 86 + 64;
    if (t >= cL.words[3].t0) { TXT.draw(ctx, cL.words[3].w, pad, b2, r.sm); mark(ctx, cL.li, 3, small); }
    const tP = cL.words[4].t0;
    if (t >= tP) {
      const name = capFirst(cL.words[4].w), xP = pad + r.wEs2 + r.gap * 1.3;
      const size = Math.min(68, TXT.fit(name, { w: IW - (xP - pad) }, r.hv));
      TXT.draw(ctx, name, xP, b2, { ...r.hv, size }); mark(ctx, cL.li, 4, size);
      // the loading bar: one chunk per step
      const [b0, b1, step = 0.5] = o.bar || [Math.ceil(BEAT.pos(tP) * 2 - 1e-6) / 2, Math.ceil(BEAT.pos(tP) * 2 - 1e-6) / 2 + 2];
      const n = Math.max(1, Math.round((b1 - b0) / step) + 1);
      const by = b2 + 22, bw = IW - 108, bh = 40;
      ctx.strokeStyle = sk.ink; ctx.lineWidth = 4; ctx.strokeRect(pad + 2, by + 2, bw - 4, bh - 4);
      let done = 0;
      const cw = (bw - 16 - (n - 1) * 5) / n;
      for (let i = 0; i < n; i++) {
        const lt = t - BEAT.t(b0 + i * step);
        if (lt < 0) continue;
        done++;
        const s = lerp(0.3, 1, EASE.outCubic(clamp(lt / 0.07)));
        ctx.fillStyle = sk.ink;
        ctx.fillRect(pad + 8 + i * (cw + 5), by + 8 + ((bh - 16) * (1 - s)) / 2, cw, (bh - 16) * s);
      }
      TXT.draw(ctx, `${Math.round((100 * done) / n)}%`, D - pad, by + bh - 7, { ...r.hv, size: 34, align: 'right' });
    }
    yy += hB;
  }
  for (const r of extra) {                           // closing rows: {name, value, t}
    const g = grow(r.t ?? tIn);
    if (g > 0 && t >= (r.t ?? tIn)) {
      const st = { ...STY.label, fill: sk.ink, size: 54 };
      TXT.draw(ctx, r.name, pad, yy + 54, st);
      TXT.draw(ctx, r.value, D - pad, yy + 54, { ...st, align: 'right' });
      rule(ctx, pad, yy + 70, IW, 2, sk.ink);
    }
    yy += 72 * g;
  }
  rule(ctx, pad, yy + 4, IW, 10, sk.ink);
  TXT.draw(ctx, '* Culpa diaria con base en una dieta de pizza.', pad, yy + 40, { font: F.sans, weight: 500, size: 17.5, fill: sk.ink });
  ctx.restore();

  // border, drawn at the height the panel has reached
  ctx.strokeStyle = sk.ink; ctx.lineWidth = 6;
  labelPath(ctx, h, sk.arch, 3); ctx.stroke();
  if (sk.inner) { ctx.lineWidth = 2; labelPath(ctx, h, sk.arch, 13); ctx.stroke(); }

  // QUESO lands over the struck row
  if (slab && t >= tSlam) {
    const s = slam(t - tSlam, 2.6, 0.09);
    ctx.save();
    ctx.translate(slab.cx, slab.cy); ctx.rotate(-0.035); ctx.scale(s, s);
    ctx.fillStyle = sk.slab; ctx.fillRect(-slab.w / 2, -slab.h / 2, slab.w, slab.h);
    TXT.draw(ctx, 'QUESO', 0, 0, { ...qs, size: slab.size, fill: sk.slabInk, align: 'center', baseline: 'center' });
    mark(ctx, gL.li, 4, slab.size);
    ctx.restore();
  }
  ctx.restore();
  return { x, y, w, h: h * k, tIn, tSlam };
}

// The label as the whole frame: a field for her to stand in front of. Only the "grasa" line.
// "No es Grasa," stacks on the left of `gap`, "es QUESO" on the right of it; she stands in the gap.
function labelWide(ctx, t, o) {
  const { variant = 'plain', grasa = null, gap = [720, 1200], portion = 'toda' } = o;
  const sk = SKIN[variant] || SKIN.plain;
  const gL = grasa != null ? LYR.line(grasa) : null;
  const tIn = o.tIn ?? (gL ? beatBefore(gL.t0) : 0);
  if (t < tIn) return null;
  const pad = 96, R = W - pad;
  ctx.fillStyle = sk.field; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = sk.ink; ctx.lineWidth = 12; ctx.strokeRect(30, 30, W - 60, H - 60);
  if (sk.inner) { ctx.lineWidth = 3; ctx.strokeRect(52, 52, W - 104, H - 104); }
  const title = { ...STY.label, fill: sk.ink, size: 96, tracking: -0.035 };
  TXT.draw(ctx, 'Información', pad, 172, title);
  TXT.draw(ctx, 'Nutricional', R, 172, { ...title, align: 'right' });
  rule(ctx, pad, 206, W - 2 * pad, 28, sk.ink);
  rule(ctx, pad, 930, W - 2 * pad, 14, sk.ink);
  TXT.draw(ctx, `Porción: ${portion}`, pad, 990, { font: F.sans, weight: 700, size: 34, fill: sk.ink });
  TXT.draw(ctx, '* Culpa diaria con base en una dieta de pizza.', R, 990, { font: F.sans, weight: 500, size: 30, fill: sk.ink, align: 'right' });
  if (!gL) return { tIn };
  const sm = { font: F.sans, weight: 800, size: 124, fill: sk.ink, tracking: -0.02 }, hv = { ...STY.label, fill: sk.ink };
  const w = i => gL.words[i], on = i => t >= w(i).t0;
  const lw = gap[0] - pad - 30, rw = R - gap[1] - 30, sp = TXT.width(' ', sm);
  if (on(0)) { TXT.draw(ctx, w(0).w, pad, 400, sm); mark(ctx, gL.li, 0, sm.size); }
  if (on(1)) { TXT.draw(ctx, w(1).w, pad + TXT.width(w(0).w, sm) + sp, 400, sm); mark(ctx, gL.li, 1, sm.size); }
  const name = capFirst(w(2).w), ns = Math.min(330, TXT.fit(name, { w: lw }, hv)), nst = { ...hv, size: ns };
  const base = 480 + TXT.capH(nst) + 60;
  if (on(2)) { TXT.draw(ctx, name, pad, base, nst); mark(ctx, gL.li, 2, ns); }
  const u = clamp((t - w(3).t0) / 0.09);
  if (u > 0) rule(ctx, pad - 14, base - TXT.capH(nst) * 0.5 - ns * 0.06, (TXT.width(name, nst) + 28) * EASE.outCubic(u), ns * 0.12, sk.strike);
  if (on(3)) { TXT.draw(ctx, w(3).w, gap[1] + 30, 400, sm); mark(ctx, gL.li, 3, sm.size); }
  if (on(4)) {
    const qs = { font: F.caps, tracking: 0.01, upper: true };
    const size = Math.min(440, TXT.fit('QUESO', { w: rw - 90 }, qs)), qst = { ...qs, size };
    const qw = TXT.width('QUESO', qst) + 90, qh = TXT.capH(qst) + 90, s = slam(t - w(4).t0, 2.2, 0.09);
    ctx.save();
    ctx.translate(gap[1] + 30 + qw / 2, 460 + qh / 2); ctx.rotate(-0.03); ctx.scale(s, s);
    ctx.fillStyle = sk.slab; ctx.fillRect(-qw / 2, -qh / 2, qw, qh);
    TXT.draw(ctx, 'QUESO', 0, 0, { ...qst, fill: sk.slabInk, align: 'center', baseline: 'center' });
    mark(ctx, gL.li, 4, size);
    ctx.restore();
  }
  return { tIn, tSlam: w(4).t0 };
}

// ---------------------------------------------------------------- KIT

const KIT = {
  hit, slam, beatBefore, num,

  // ------------------------------------------------------------ 1. the nutrition label
  // KIT.label(ctx, t, {x, y, w, variant, grasa, culpa, bar, extra, layout, ...}) -> {x, y, w, h, tIn, tSlam}
  //   x, y, w    top left corner and width; the height follows. w >= 440 keeps "No es" at 40 px.
  //   variant    'plain' | 'gold' | 'altar'
  //   grasa      line index of "No es grasa, es queso": the row is struck on the second "es", QUESO slams on "queso"
  //   culpa      line index of "No es culpa, es progreso": the panel grows a second group on the beat before it
  //   bar        [b0, b1, step = 0.5] beats: the PROGRESO bar gets one chunk at b0, b0 + step, ... b1
  //   extra      [{name, value, t}] closing rows, e.g. {name: 'Queso', value: '100%', t: BEAT.t(352)}
  //   tIn        when the panel unrolls (default: the beat before the first word)
  //   layout     'tall' (a panel) | 'wide' (the whole frame, for SHOT.draw's `behind`; takes gap: [x0, x1], the
  //              columns of the frame she stands in: "No es Grasa," sets left of it, "es QUESO" right of it)
  label(ctx, t, o = {}) { return o.layout === 'wide' ? labelWide(ctx, t, o) : labelTall(ctx, t, o); },

  // ------------------------------------------------------------ slab: one word on a flat block, slapped on
  // KIT.slab(ctx, t, text, {x, y, size, rot, bg, ink, tHit, from, li, wi, font, padX, padY}) -> {w, h, s}
  //   x, y are the centre. With li, wi the slab is that sung word: it lands on the word's t0 and is marked.
  slab(ctx, t, text, o = {}) {
    const { x = W / 2, y = H / 2, size = SIZE.display, rot = 0, bg = P.cheese, ink = P.patent, from = 2.4, li = null, wi = null, padX = 0.17, padY = 0.15 } = o;
    const tHit = o.tHit ?? (li != null ? LYR.word(li, wi).t0 : -Infinity);
    if (t < tHit) return null;
    const st = { font: o.font || F.caps, weight: o.weight || 400, tracking: o.tracking ?? 0.01, upper: o.upper ?? true, size };
    const w = TXT.width(text, st) + 2 * padX * size, h = TXT.capH(st) + 2 * padY * size;
    const s = slam(t - tHit, from);
    ctx.save();
    ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(s, s);
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(-w / 2, -h / 2, w, h); }
    TXT.draw(ctx, text, 0, 0, { ...st, fill: ink, align: 'center', baseline: 'center' });
    if (li != null) mark(ctx, li, wi, size);
    ctx.restore();
    return { w, h, s };
  },

  // ------------------------------------------------------------ 2. his counter, her counter
  // KIT.hisTag(ctx, t, {x, y, w, h, label, kcal, tIn, chip, lead, unit})
  //   A thin cold box around a thing, a leader, and a chip that reads "PIZZA 2310 kcal". The number races up.
  //   chip: the corner the leader leaves from and the chip sits beyond: 'tr' (default) | 'tl' | 'br' | 'bl'
  //   lead: length of the leader on each axis (26). lead: 0 makes the chip a tab flush on that corner's edge.
  //   chipAt: [x, y] puts the chip's centre there instead (use it to cover a flaw in the plate)
  hisTag(ctx, t, o = {}) {
    const { x, y, w, h, label = '', kcal = 0, tIn = 0, chip = 'tr', lead = 26, unit = 'kcal', chipAt = null } = o;
    const lt = t - tIn;
    if (lt < 0) return;
    const s = lerp(1.3, 1, EASE.outExpo(clamp(lt / 0.12)));
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s);
    ctx.strokeStyle = P.patent; ctx.globalAlpha *= 0.5; ctx.lineWidth = 6; ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.globalAlpha *= 2;
    ctx.strokeStyle = P.ice; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = P.ice;
    const c = Math.min(18, w / 4, h / 4), th = 6;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const cx = (sx * w) / 2, cy = (sy * h) / 2;
      ctx.fillRect(sx < 0 ? cx - th / 2 : cx - c + th / 2, cy - th / 2, c, th);
      ctx.fillRect(cx - th / 2, sy < 0 ? cy - th / 2 : cy - c + th / 2, th, c);
    }
    ctx.restore();
    if (lt < 0.06) return;
    const st = { font: F.mono, weight: 700, size: SIZE.note, fill: P.patent };
    const full = `${label} ${num(kcal)} ${unit}`.trim();
    const now = `${label} ${num(kcal * EASE.outCubic(clamp((lt - 0.06) / 0.3)))} ${unit}`.trim();
    const cw = TXT.width(full, st) + 26, ch = 44;
    const right = chip[1] === 'r', topp = chip[0] === 't';
    const ax = right ? x + w : x, ay = topp ? y : y + h;
    const bx = chipAt ? chipAt[0] : ax + (right ? lead : -lead), by = chipAt ? chipAt[1] : ay + (topp ? -lead : lead);
    if (lead || chipAt) { ctx.strokeStyle = P.ice; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
    // with a leader the chip sits beyond the corner; with lead: 0 it is a tab flush on the box edge
    const rx = chipAt ? bx - cw / 2 : lead ? (right ? bx : bx - cw) : right ? ax - cw + 1.25 : ax - 1.25;
    const ry = chipAt ? by - ch / 2 : topp ? by - ch : by;
    ctx.fillStyle = P.ice; ctx.fillRect(rx, ry, cw, ch);
    TXT.draw(ctx, now, rx + 13, ry + ch / 2, { ...st, baseline: 'center' });
  },

  // KIT.hisCounter(ctx, t, {x, y, w, li, total, digits, unit, tIn, text})
  //   His panel: the sung line in cold mono caps, last word on its own row, and a seven-segment total.
  //   total is the number to show in this frame: compute it from t, e.g. KIT.race(t, t0, t1, 0, 2310).
  hisCounter(ctx, t, o = {}) {
    const { x = 1240, y = 70, w = 620, li = null, total = 0, digits = 6, unit = 'kcal' } = o;
    const L = li != null ? LYR.line(li) : null;
    const tIn = o.tIn ?? (L ? beatBefore(L.t0) : 0);
    if (t < tIn) return null;
    const D = 620, Hh = 356, k = w / D, pad = 34;
    const words = L ? L.words.map(v => v.w) : o.text || [];
    ctx.save();
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.beginPath(); ctx.rect(0, 0, D * EASE.outExpo(clamp((t - tIn) / 0.14)), Hh); ctx.clip();
    ctx.fillStyle = P.patent; ctx.fillRect(0, 0, D, Hh);
    ctx.strokeStyle = P.ice; ctx.lineWidth = 2.5; ctx.strokeRect(10, 10, D - 20, Hh - 20);
    const st = { ...STY.his, size: 62 };
    const head = words.slice(0, -1), last = words[words.length - 1] || '';
    const size = Math.min(62, TXT.fit(head.join(' ') || 'X', { w: D - 2 * pad }, st), TXT.fit(last || 'X', { w: D - 2 * pad }, st));
    let cx = pad;
    head.forEach((wd, i) => {
      if (!L || wordOn(li, i, t)) { TXT.draw(ctx, wd, cx, 94, { ...st, size }); if (L) mark(ctx, li, i, size); }
      cx += TXT.width(wd + ' ', { ...st, size });
    });
    if (!L || wordOn(li, words.length - 1, t)) { TXT.draw(ctx, last, pad, 94 + size * 1.22, { ...st, size }); if (L) mark(ctx, li, words.length - 1, size); }
    const ux = D - pad, dx = ux - TXT.width(unit, { font: F.mono, weight: 600, size: SIZE.note }) - 18;
    const seg = { ...STY.seg, size: Math.min(108, TXT.fit('8'.repeat(digits), { w: dx - pad }, STY.seg)) };
    TXT.draw(ctx, unit, ux, 312, { font: F.mono, weight: 600, size: SIZE.note, fill: P.ice, align: 'right' });
    TXT.draw(ctx, '8'.repeat(digits), dx, 312, { ...seg, align: 'right', opacity: 0.13 });
    TXT.draw(ctx, String(Math.max(0, Math.round(total))).slice(-digits), dx, 312, { ...seg, align: 'right' });
    ctx.restore();
    return { x, y, w, h: Hh * k };
  },

  // KIT.race(t, t0, t1, a, b, power): a total that runs from a to b between t0 and t1, faster as it goes
  race(t, t0, t1, a = 0, b = 1000, power = 1.6) { return Math.floor(a + (b - a) * Math.pow(clamp((t - t0) / (t1 - t0)), power)); },

  // KIT.herBox(ctx, t, {x, y, r, n, tIn}): a warm box that snaps onto one pepperoni, with its number
  herBox(ctx, t, o = {}) {
    const { x, y, r = 60, n = null, tIn = 0 } = o;
    const lt = t - tIn;
    if (lt < 0) return;
    const s = lerp(1.7, 1, EASE.outExpo(clamp(lt / 0.11))), hs = r * 1.12 * s, len = hs * 0.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    for (const [col, lw] of [[P.patent, 11], [P.mozz, 6]]) {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        ctx.beginPath();
        ctx.moveTo(sx * hs, sy * (hs - len)); ctx.lineTo(sx * hs, sy * hs); ctx.lineTo(sx * (hs - len), sy * hs);
        ctx.stroke();
      }
    }
    if (n != null) {
      const st = { font: F.caps, size: 34, fill: P.mozz }, label = String(n).padStart(2, '0');
      const cw = TXT.width(label, st) + 20;
      ctx.fillStyle = P.tomato; ctx.fillRect(-hs - 3, -hs - 44, cw, 40);
      TXT.draw(ctx, label, -hs - 3 + cw / 2, -hs - 24, { ...st, align: 'center', baseline: 'center' });
    }
    ctx.restore();
  },

  // KIT.herCounter(ctx, t, {x, y, w, li, hits, tIn, text})
  //   Her panel: the sung line in white caps on tomato, last word on its own row, and a climbing count.
  //   hits: the times of each count, ascending. The number shown is how many have passed; it pops on each.
  herCounter(ctx, t, o = {}) {
    const { x = 80, y = 70, w = 700, li = null, hits = [] } = o;
    const L = li != null ? LYR.line(li) : null;
    const tIn = o.tIn ?? (L ? beatBefore(L.t0) : 0);
    if (t < tIn) return null;
    const D = 700, Hh = 250, k = w / D, pad = 34;
    const words = L ? L.words.map(v => v.w) : o.text || [];
    let n = 0, last = -Infinity;
    for (const h of hits) if (t >= h) { n++; last = h; }
    ctx.save();
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.beginPath(); ctx.rect(0, 0, D * EASE.outExpo(clamp((t - tIn) / 0.14)), Hh); ctx.clip();
    ctx.fillStyle = P.tomato; ctx.fillRect(0, 0, D, Hh);
    const big = { font: F.caps, size: 200, fill: P.mozz, tracking: 0.01 };
    const numW = TXT.width('00', big), nx = D - pad - numW / 2;
    rule(ctx, D - pad - numW - 30, 30, 5, Hh - 60, P.mozz);
    const s = 1 + 0.16 * hit(t, last, 0.16);
    ctx.save(); ctx.translate(nx, Hh / 2); ctx.scale(s, s);
    TXT.draw(ctx, String(n).padStart(2, '0'), 0, 0, { ...big, align: 'center', baseline: 'center' });
    ctx.restore();
    const st = { ...STY.caps, size: 84 }, room = D - 2 * pad - numW - 56;
    const head = words.slice(0, -1), lastW = words[words.length - 1] || '';
    const size = Math.min(84, TXT.fit(head.join(' ') || 'X', { w: room }, st), TXT.fit(lastW || 'X', { w: room }, st));
    const cap = TXT.capH({ ...st, size }), y1 = Hh / 2 - 12, y2 = y1 + cap + 26;
    let cx = pad;
    head.forEach((wd, i) => {
      if (!L || wordOn(li, i, t)) { TXT.draw(ctx, wd, cx, y1, { ...st, size }); if (L) mark(ctx, li, i, size); }
      cx += TXT.width(wd + ' ', { ...st, size });
    });
    if (!L || wordOn(li, words.length - 1, t)) { TXT.draw(ctx, lastW, pad, y2, { ...st, size }); if (L) mark(ctx, li, words.length - 1, size); }
    ctx.restore();
    return { x, y, w, h: Hh * k, n };
  },

  // ------------------------------------------------------------ 3. film subtitle
  // KIT.subtitle(ctx, t, li, {y, size, tag, tOut, w, x}) -> word boxes
  //   Yellow italic serif with a thin black edge, bottom centre. Each word comes on at its t0 and the line
  //   stays until tOut (default: half a second after the last word). tag: '[en italiano]' sits above the line.
  subtitle(ctx, t, li, o = {}) {
    const L = LYR.line(li);
    const { x = W / 2, y = 968, size = SIZE.sub, tag = null, w = 1600, tOut = L.t1 + 0.5 } = o;
    if (t < L.t0 || t >= tOut) return [];
    const st = { ...STY.sub, size };
    const boxes = TXT.layout(L.words, { x: x - w / 2, y: 0, w }, { ...st, wrap: false, fit: true, align: 'center', valign: 'top' });
    for (const b of boxes) {
      if (t < L.words[b.i].t0) continue;
      TXT.draw(ctx, b.text, b.x, y, { ...st, size: b.size, strokeWidth: b.size * 0.115, align: 'left' });
      mark(ctx, li, b.i, b.size);
    }
    if (tag) TXT.draw(ctx, tag, x, y - size * 1.3, { font: F.sans, weight: 600, size: 32, fill: P.mozz, stroke: P.patent, strokeWidth: 5, align: 'center' });
    return boxes;
  },

  // KIT.caption(ctx, t, text, {t0, t1, y, size}): a subtitle that is not a sung line, e.g. '(eructo)'
  caption(ctx, t, text, o = {}) {
    const { t0 = 0, t1 = Infinity, x = W / 2, y = 968, size = SIZE.sub } = o;
    if (t < t0 || t >= t1) return;
    TXT.draw(ctx, text, x, y, { ...STY.sub, size, strokeWidth: size * 0.115, align: 'center' });
  },

  // KIT.bars(ctx, t, {ratio, curtain, tOut}): letterbox bars for the film passages
  //   curtain: [t0, t1] two black halves part sideways between these times, like a cinema curtain
  //   tOut:    the bars cut off at this time (give a beat)
  bars(ctx, t, o = {}) {
    const { ratio = 2.39, curtain = null, tOut = Infinity } = o;
    if (t >= tOut) return;
    const bh = Math.round((H - W / ratio) / 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    if (curtain) {
      const u = EASE.inOutCubic(clamp((t - curtain[0]) / (curtain[1] - curtain[0])));
      if (u < 1) { const hw = (W / 2) * (1 - u); ctx.fillRect(0, 0, hw, H); ctx.fillRect(W - hw, 0, hw, H); }
    }
    return bh;
  },

  // ------------------------------------------------------------ 4. speech quotes
  // KIT.quote(ctx, t, li, {who, x, y, w, size, tail, rot, align, hug}) -> {x, y, w, h}
  //   A line of speech on a flat block in the speaker's colour: who: 'his' (cold) | 'hers' (warm).
  //   In a line like  Me dijiste: “ya fue mucho”  the words before the “ are a small caption over the block
  //   and the quoted words sit inside it between big marks. A line with no “ ” goes on the block whole, with
  //   no marks: that is her answering back. x, y: top left of the block; w: the most it may take. The block
  //   hugs its words (hug: false keeps it w wide); align: 'right' pins it to x + w instead of x.
  //   tail: 'left' | 'right' | null, the corner of the bottom edge that points at the speaker.
  quote(ctx, t, li, o = {}) {
    const L = LYR.line(li);
    const { who = 'hers', x = 200, y = 300, w = 820, size = 104, tail = 'left', rot = 0, align = 'left', hug = true } = o;
    const bg = who === 'his' ? P.ice : P.tomato, ink = who === 'his' ? P.patent : P.mozz;
    const marks = L.words.some(v => v.w.includes('“'));
    const q0 = marks ? L.words.findIndex(v => v.w.includes('“')) : 0;
    const cap = { font: F.sans, weight: 800, size: SIZE.floor + 6, fill: P.mozz, stroke: P.patent, strokeWidth: 7 };
    let cx = x;
    for (let i = 0; i < q0; i++) {
      if (wordOn(li, i, t)) { TXT.draw(ctx, L.words[i].w, cx, y - 22, cap); mark(ctx, li, i, cap.size); }
      cx += TXT.width(L.words[i].w + ' ', cap);
    }
    const tQ = L.words[q0].t0;
    if (t < tQ) return null;
    const st = { font: F.sans, weight: 900, size, tracking: -0.025, lineHeight: 1.06 };
    const padL = size * (marks ? 0.66 : 0.36), padR = size * 0.36, padY = size * 0.36;
    const toks = L.words.slice(q0).map(v => v.w.replace(/[“”]/g, ''));
    const boxes = TXT.layout(toks, { x: padL, y: padY, w: w - padL - padR }, { ...st, fit: true, align: 'left' });
    const lines = boxes[boxes.length - 1].line + 1, bs = boxes[0].size;
    let h = padY * 2 + TXT.capH({ ...st, size: bs });
    for (let k = 1; k < lines; k++) {                 // the block grows a line when that line's first word is sung
      const first = boxes.find(b => b.line === k);
      h += bs * 1.06 * EASE.outCubic(clamp((t - L.words[q0 + first.i].t0) / 0.08));
    }
    const tw = Math.max(...boxes.map(b => b.x + b.w)) - padL;
    const bw = hug ? Math.min(w, padL + tw + padR + (marks ? bs * 0.42 : 0)) : w, bx = align === 'right' ? x + w - bw : x;
    const s = slam(t - tQ, 1.25, 0.08);
    ctx.save();
    ctx.translate(bx + bw / 2, y + h / 2); if (rot) ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-bw / 2, -h / 2);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, bw, h);
    if (tail) {
      const tx = tail === 'left' ? Math.min(bw * 0.2, 120) : bw - Math.min(bw * 0.2, 120), d = tail === 'left' ? -1 : 1;
      ctx.beginPath(); ctx.moveTo(tx - 34, h - 1); ctx.lineTo(tx + 34, h - 1); ctx.lineTo(tx + d * 46, h + 58); ctx.closePath(); ctx.fill();
    }
    const qm = { font: F.book, weight: 700, size: bs * 1.7, fill: ink };
    if (marks) TXT.draw(ctx, '“', size * 0.12, padY + bs * 0.95, qm);
    for (const b of boxes) {
      if (!wordOn(li, q0 + b.i, t)) continue;
      TXT.word(ctx, b, { ...st, fill: ink });
      mark(ctx, li, q0 + b.i, b.size);
    }
    const lb = boxes[boxes.length - 1];
    if (marks && wordOn(li, L.words.length - 1, t)) TXT.draw(ctx, '”', lb.x + lb.w + bs * 0.04, lb.y + bs * 0.52, qm);
    ctx.restore();
    return { x: bx, y, w: bw, h };
  },

  // ------------------------------------------------------------ 5. receipt
  // KIT.receipt(ctx, t, {x, y, w, head, rows, total, li, b0, step, rot}) -> {h}
  //   A strip of thermal paper that hangs from y and feeds out one printed line per step (in beats) from beat
  //   b0: head lines, a rule, rows [[left, right], ...], a rule, total [left, right]. The sung line li is the
  //   last thing on the paper, set large; its words print at their t0.
  receipt(ctx, t, o = {}) {
    const { x = 1260, y = -10, w = 560, head = ['CUENTA'], rows = [], total = null, li = null, step = 0.5, rot = 0 } = o;
    const L = li != null ? LYR.line(li) : null;
    const D = 560, k = w / D, pad = 34, lh = 46;
    const lines = [...head.map(hh => ({ c: hh })), { rule: 1 }, ...rows.map(r => ({ l: r[0], r: r[1] })), { rule: 1 }];
    if (total) lines.push({ l: total[0], r: total[1], bold: 1 });
    const b0 = o.b0 ?? (L ? BEAT.pos(beatBefore(L.t0)) - (lines.length - 1) * step : 0);
    const tLine = i => BEAT.t(b0 + i * step);
    if (t < tLine(0)) return null;
    const feed = (t0, d = 0.09) => EASE.outCubic(clamp((t - t0) / d));
    let hh = 30;
    lines.forEach((ln, i) => { hh += lh * feed(tLine(i)); });
    const big = { font: F.mono, weight: 800, size: 60, fill: P.patent, lineHeight: 1.12, upper: true };
    let lb = null, lyH = 0;
    if (L) {
      lb = TXT.layout(L.words, { x: pad, y: 0, w: D - 2 * pad }, { ...big, fit: false, align: 'left' });
      const nl = lb[lb.length - 1].line + 1;
      lyH = (26 + TXT.capH(big) + (nl - 1) * big.size * 1.12 + 10) * feed(Math.max(tLine(lines.length - 1), beatBefore(L.t0)), 0.12);
    }
    const h = hh + lyH + 44;
    ctx.save();
    ctx.translate(x + w / 2, y); if (rot) ctx.rotate(rot); ctx.scale(k, k); ctx.translate(-D / 2, 0);
    ctx.fillStyle = P.mozz;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(D, 0); ctx.lineTo(D, h);
    const teeth = 28;
    for (let i = teeth; i >= 0; i--) ctx.lineTo((D * i) / teeth, h + (i % 2 ? 12 : 0));
    ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, D, h); ctx.clip();
    const st = { font: F.mono, weight: 500, size: 30, fill: P.patent };
    let yy = 30;
    lines.forEach((ln, i) => {
      if (t < tLine(i)) return;
      const base = yy + lh * 0.72;
      if (ln.rule) { ctx.fillStyle = P.patent; for (let dx = pad; dx < D - pad; dx += 14) ctx.fillRect(dx, yy + lh / 2 - 1.5, 8, 3); }
      else if (ln.c) TXT.draw(ctx, ln.c, D / 2, base, { ...st, weight: 700, align: 'center' });
      else {
        const s2 = { ...st, weight: ln.bold ? 800 : 500 };
        const wl = TXT.draw(ctx, ln.l, pad, base, s2), wr = TXT.width(ln.r, s2);
        TXT.draw(ctx, ln.r, D - pad, base, { ...s2, align: 'right' });
        ctx.fillStyle = P.patent;
        for (let dx = pad + wl + 14; dx < D - pad - wr - 14; dx += 12) ctx.fillRect(dx, base - 4, 3.5, 3.5);
      }
      yy += lh;
    });
    if (L) {
      for (const b of lb) {
        if (!wordOn(li, b.i, t)) continue;
        TXT.draw(ctx, b.text, b.x, hh + 26 + b.y, { ...big, size: b.size, upper: false });
        mark(ctx, li, b.i, b.size);
      }
    }
    ctx.restore();
    ctx.restore();
    return { h: h * k };
  },

  // ------------------------------------------------------------ 6. menu row
  // The empty row of the `menu` plate, in plate pixels: between PEPPERONI and QUATTRO FORMAGGI.
  MENU: Object.freeze({ x: 542, y: 761, lead: 2222, price: 2408, size: 60.5, weight: 600, track: 0.125, rot: 0.0052, descX: 598, descY: 819, descSize: 48, descTrack: 0.04, ink: '#1c1611' }),

  // KIT.menuRow(ctx, t, li, {place, price, desc})
  //   Sets line li as a dish in that row: bold tracked caps, dotted leaders, a price, an italic description.
  //   place: the `place` that SHOT.draw returned for the menu shot, so the row rides the plate.
  //   Frame the plate at zoom 1.1 or more: the caps are 40 px at zoom 1.0 and 53 px at zoom 1.33.
  menuRow(ctx, t, li, o = {}) {
    const L = LYR.line(li), M = KIT.MENU;
    const { place, price = '16', desc = null } = o;
    if (!place) throw new Error('KIT.menuRow: needs {place} from SHOT.draw');
    if (t < L.t0) return;
    const st = { font: F.book, weight: M.weight, size: M.size, tracking: M.track, upper: true, fill: M.ink };
    ctx.save();
    SHOT.enter(ctx, place);
    ctx.translate(M.x, M.y); ctx.rotate(M.rot);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha *= 0.93;
    let cx = 0;
    L.words.forEach((v, i) => {
      if (wordOn(li, i, t)) { TXT.draw(ctx, v.w, cx, 0, st); mark(ctx, li, i, M.size); }
      cx += TXT.width(v.w + ' ', st) + M.track * M.size;
    });
    const tEnd = L.words[L.words.length - 1].t0;
    if (t >= tEnd) {
      const u = EASE.outCubic(clamp((t - tEnd) / 0.3)), x0 = cx + 6, x1 = M.lead - M.x;
      ctx.fillStyle = M.ink;
      for (let dx = x0; dx < x0 + (x1 - x0) * u; dx += 25.5) { ctx.beginPath(); ctx.arc(dx, -1.5, 3.6, 0, TAU); ctx.fill(); }
      if (u >= 1 || t - tEnd > 0.12) TXT.draw(ctx, price, M.price - M.x, 0, { ...st, tracking: 0.04, align: 'right' });
      if (desc) TXT.draw(ctx, desc, M.descX - M.x, M.descY - M.y, { font: F.book, italic: true, weight: 400, size: M.descSize, tracking: M.descTrack, fill: M.ink });
    }
    ctx.restore();
  },

  // ------------------------------------------------------------ 7. stamp
  // KIT.stamp(ctx, t, {text, x, y, size, rot, tHit, color, from}) -> {w, h}
  //   A rubber stamp. Lands on tHit from `from` times its size (3), solid on the hit frame, then stays as an
  //   imprint with dropouts in the ink. x, y: centre. Near her face, lower `from` so the hit frame clears it.
  stamp(ctx, t, o = {}) {
    const { text = 'RECHAZADO', x = W / 2, y = H / 2, size = SIZE.display, rot = -0.14, tHit = 0, color = P.tomato, from = 3 } = o;
    if (t < tHit) return null;
    const st = { font: F.caps, size, tracking: 0.05, upper: true };
    const tw = TXT.width(text, st), cap = TXT.capH(st), bw = tw + size * 0.62, bh = cap + size * 0.5;
    const s = slam(t - tHit, from, 0.085);
    const g = CANVAS.scratch('kit.stamp');
    g.setTransform(ctx.getTransform());
    g.translate(x, y); g.rotate(rot);
    g.save();
    g.scale(s, s);
    g.strokeStyle = color; g.lineWidth = size * 0.085;
    g.beginPath(); g.roundRect(-bw / 2, -bh / 2, bw, bh, size * 0.09); g.stroke();
    g.lineWidth = size * 0.025;
    g.beginPath(); g.roundRect(-bw / 2 + size * 0.1, -bh / 2 + size * 0.1, bw - size * 0.2, bh - size * 0.2, size * 0.04); g.stroke();
    TXT.draw(g, text, 0, 0, { ...st, fill: color, align: 'center', baseline: 'center' });
    g.restore();
    if (t - tHit >= 0.04) {                           // the imprint: ink that did not take
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = g.createPattern(SPECK, 'repeat');
      g.fillRect(-bw, -bh, bw * 2, bh * 2);
    }
    ctx.save(); ctx.resetTransform(); ctx.drawImage(g.canvas, 0, 0); ctx.restore();
    return { w: bw, h: bh };
  },

  // KIT.notice(ctx, t, {x, y, w, app, when, body, tIn, from}) -> {x, y, w, h}
  //   A phone notification card: his diet app talking. Slides in from `from` ('right' | 'left' | 'top') at tIn.
  //   body: a string, or a list of strings for set lines.
  //   Stamp it with KIT.stamp; answer it with KIT.quote (hers, no tail) set right under it.
  notice(ctx, t, o = {}) {
    const { x = 1180, y = 80, w = 680, app = 'CALORÍAS', when = 'ahora', body = '', tIn = 0, from = 'right' } = o;
    if (t < tIn) return null;
    const D = 680, k = w / D, pad = 34;
    const bodySt = { font: F.sans, weight: 600, size: 38, tracking: -0.01, fill: P.patent, lineHeight: 1.22 };
    const toks = [].concat(body).flatMap((ln, i) => (i ? ['\n'] : []).concat(String(ln).split(' ').filter(Boolean)));
    const bb = toks.length ? TXT.layout(toks, { x: pad, y: 104, w: D - 2 * pad }, { ...bodySt, align: 'left' }) : [];
    const h = 104 + (bb.length ? TXT.capH(bodySt) + bb[bb.length - 1].line * 38 * 1.22 : 0) + 36;
    const u = EASE.outExpo(clamp((t - tIn) / 0.2));
    const dx = from === 'right' ? (1 - u) * (W - x + 40) : from === 'left' ? -(1 - u) * (x + w + 40) : 0;
    const dy = from === 'top' ? -(1 - u) * (y + h * k + 40) : 0;
    ctx.save();
    ctx.translate(x + dx, y + dy); ctx.scale(k, k);
    ctx.fillStyle = P.mozz; ctx.beginPath(); ctx.roundRect(0, 0, D, h, 30); ctx.fill();
    ctx.fillStyle = P.ice; ctx.beginPath(); ctx.roundRect(pad, 26, 52, 52, 13); ctx.fill();
    TXT.draw(ctx, 'kcal', pad + 26, 52, { font: F.mono, weight: 800, size: 17, fill: P.patent, align: 'center', baseline: 'center' });
    TXT.draw(ctx, app, pad + 70, 62, { font: F.sans, weight: 800, size: 26, tracking: 0.08, fill: P.patent });
    TXT.draw(ctx, when, D - pad, 62, { font: F.sans, weight: 500, size: 26, fill: P.patent, opacity: 0.55, align: 'right' });
    for (const b of bb) TXT.word(ctx, b, bodySt);
    ctx.restore();
    return { x: x + dx, y: y + dy, w, h: h * k };
  },

  // ------------------------------------------------------------ 8. versus chart
  // KIT.versus(ctx, t, {x, y, w, tu, yo, rows, tIn}) -> {h}
  //   TÚ against YO. tu / yo: line indexes ("Tú con tu agua sin gas" / "Yo con masa artesanal"): the first
  //   word of each lands in its column head, the rest fills the first cell, word by word. rows: [{tu, yo, t}]
  //   plain facts that build under it, each at its own time (give beats).
  versus(ctx, t, o = {}) {
    const { x = 210, y = 150, w = 1500, tu = null, yo = null, rows = [] } = o;
    const Lt = tu != null ? LYR.line(tu) : null, Ly = yo != null ? LYR.line(yo) : null;
    const tIn = o.tIn ?? beatBefore(Math.min(Lt ? Lt.t0 : Infinity, Ly ? Ly.t0 : Infinity, rows.length ? rows[0].t : Infinity));
    if (t < tIn) return null;
    const cw = w / 2, hh = 190, ch = 250, rh = 104, pad = 40;
    const grow = (t0, d = 0.14) => EASE.outCubic(clamp((t - t0) / d));
    let h = hh + ch;
    for (const r of rows) h += rh * grow(r.t);
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath(); ctx.rect(0, 0, w, h * EASE.outExpo(clamp((t - tIn) / 0.2))); ctx.clip();
    ctx.fillStyle = P.mozz; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = P.patent; ctx.fillRect(0, 0, cw, hh);
    ctx.fillStyle = P.tomato; ctx.fillRect(cw, 0, cw, hh);
    const head = { font: F.caps, size: 150, tracking: 0.02, upper: true };
    const cell = { font: F.sans, weight: 800, size: 68, tracking: -0.02, fill: P.patent, lineHeight: 1.12 };
    [[Lt, 0, P.ice, 'TÚ'], [Ly, cw, P.mozz, 'YO']].forEach(([L, cx, ink, fallback]) => {
      const text = L ? L.words[0].w : fallback;
      if (!L || t >= L.words[0].t0) {
        const s = L ? slam(t - L.words[0].t0, 1.8, 0.08) : 1;
        ctx.save(); ctx.translate(cx + cw / 2, hh / 2); ctx.scale(s, s);
        TXT.draw(ctx, text, 0, 0, { ...head, fill: ink, align: 'center', baseline: 'center' });
        if (L) mark(ctx, L.li, 0, head.size);
        ctx.restore();
      }
      if (!L) return;
      const boxes = TXT.layout(L.words.slice(1), { x: cx + pad, y: hh, w: cw - 2 * pad, h: ch }, { ...cell, fit: true, align: 'center' });
      for (const b of boxes) {
        if (t < L.words[b.i + 1].t0) continue;
        TXT.word(ctx, b, cell);
        mark(ctx, L.li, b.i + 1, b.size);
      }
    });
    let yy = hh + ch;
    const fact = { font: F.sans, weight: 700, size: 52, tracking: -0.01, fill: P.patent };
    for (const r of rows) {
      const g = grow(r.t);
      if (t >= r.t) {
        rule(ctx, 0, yy, w, 4, P.patent);
        TXT.draw(ctx, r.tu, cw / 2, yy + rh / 2 + 2, { ...fact, align: 'center', baseline: 'center' });
        TXT.draw(ctx, r.yo, cw + cw / 2, yy + rh / 2 + 2, { ...fact, align: 'center', baseline: 'center' });
      }
      yy += rh * g;
    }
    rule(ctx, cw - 3, 0, 6, h, P.patent);
    rule(ctx, 0, hh - 3, w, 6, P.patent);
    ctx.restore();
    return { h };
  },

  // ------------------------------------------------------------ 9. rating card, perfume serif, commandment
  // KIT.rating(ctx, t, {tIn, tOut, letter, word, line}): the full-frame card that opens verse 2
  rating(ctx, t, o = {}) {
    const { tIn = 0, tOut = Infinity, letter = 'G', word = 'GASTRONÓMICO', line = 'APTO PARA TODO PÚBLICO' } = o;
    if (t < tIn || t >= tOut) return;
    ctx.fillStyle = P.basil; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = P.mozz; ctx.lineWidth = 6; ctx.strokeRect(60, 60, W - 120, H - 120);
    TXT.draw(ctx, 'CLASIFICACIÓN', W / 2, 232, { font: F.sans, weight: 800, size: 54, tracking: 0.42, fill: P.mozz, align: 'center' });
    ctx.lineWidth = 12; ctx.strokeRect(W / 2 - 170, 290, 340, 340);
    TXT.draw(ctx, letter, W / 2, 460, { font: F.caps, size: 300, fill: P.mozz, align: 'center', baseline: 'center' });
    TXT.draw(ctx, word, W / 2, 846, { font: F.caps, size: 176, tracking: 0.03, fill: P.mozz, align: 'center' });
    TXT.draw(ctx, line, W / 2, 938, { font: F.sans, weight: 600, size: 34, tracking: 0.3, fill: P.mozz, align: 'center' });
  },

  // KIT.perfume(ctx, t, li, {x, y, w, size, align, ink, edge, words}) -> word boxes
  //   Slow italic serif, letter by letter. Each word starts on its t0 and is whole before its midpoint.
  //   x, y: left edge (or centre, by align) and first baseline; w wraps. words: [from, to) to set part of a line.
  perfume(ctx, t, li, o = {}) {
    const L = LYR.line(li);
    const { x = W / 2, y = 560, w = 1500, size = 132, align = 'center', ink = P.mozz, edge = 0, words = [0, L.words.length] } = o;
    const st = { ...STY.perfume, size, fill: ink, lineHeight: 1.16 };
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const boxes = TXT.layout(L.words.slice(words[0], words[1]), { x: x0, y: y - TXT.capH(st), w }, { ...st, fit: true, align });
    for (const b of boxes) {
      const wi = words[0] + b.i, wd = L.words[wi], lt = t - wd.t0;
      if (lt < 0) continue;
      const s2 = { ...st, size: b.size }, n = b.text.length;
      const d = Math.min(0.42, 0.45 * (wd.t1 - wd.t0)), fade = Math.min(0.14, d);
      for (let i = 0; i < n; i++) {
        const a = clamp((lt - ((d - fade) * i) / Math.max(1, n - 1)) / fade);
        if (a > 0) TXT.draw(ctx, b.text[i], b.x + TXT.width(b.text.slice(0, i), s2), b.y,
          { ...s2, opacity: a, stroke: edge ? P.patent : null, strokeWidth: edge });
      }
      if (lt >= d - fade / 2) mark(ctx, li, wi, b.size);
    }
    return boxes;
  },

  // KIT.commandment(ctx, t, li, {box, bg, ink, pad, tIn}) -> word boxes
  //   One line, condensed caps as large as the box takes, white on tomato red. The red fills `box` (default:
  //   the whole frame) from tIn (default: the beat before the line). Each word lands on its t0.
  commandment(ctx, t, li, o = {}) {
    const L = LYR.line(li);
    const { box = { x: 0, y: 0, w: W, h: H }, bg = P.tomato, ink = P.mozz, pad = 70 } = o;
    const tIn = o.tIn ?? beatBefore(L.t0);
    if (t < tIn) return [];
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(box.x, box.y, box.w, box.h); }
    const st = { font: F.caps, size: 620, tracking: 0.005, upper: true, lineHeight: 0.98, wordGap: 0.8 };
    const boxes = TXT.layout(L.words, { x: box.x + pad, y: box.y + pad, w: box.w - 2 * pad, h: box.h - 2 * pad }, { ...st, fit: true, align: 'center' });
    for (const b of boxes) {
      const lt = t - L.words[b.i].t0;
      if (lt < 0) continue;
      const s = slam(lt, 1.35, 0.07);
      ctx.save(); ctx.translate(b.cx, b.cy); ctx.scale(s, s); ctx.translate(-b.cx, -b.cy);
      TXT.word(ctx, b, { ...st, fill: ink });
      mark(ctx, li, b.i, b.size);
      ctx.restore();
    }
    return boxes;
  },

  // ------------------------------------------------------------ 10. telenovela
  // KIT.script(ctx, t, li, {x, y, w, size, rot, at, words}) -> word boxes
  //   Soap-opera title script, white with a tomato edge. Each word crashes in on its t0 (from a fifth of its
  //   size to full in 0.14 s). x, y: centre of the row. at: [[x, y, size, rot], ...] places words one by one
  //   (centre, size, tilt) instead of setting a row.
  script(ctx, t, li, o = {}) {
    const L = LYR.line(li);
    const { x = W / 2, y = 560, w = 1640, size = 230, rot = -0.05, at = null, words = [0, L.words.length] } = o;
    const st = { ...STY.script, size };
    const boxes = TXT.layout(L.words.slice(words[0], words[1]), { x: x - w / 2, y: 0, w }, { ...st, wrap: false, fit: true, align: 'center', valign: 'top' });
    const out = [];
    for (const b of boxes) {
      const wi = words[0] + b.i, lt = t - L.words[wi].t0;
      const p = at && at[b.i] ? { x: at[b.i][0], y: at[b.i][1], size: at[b.i][2] ?? b.size, rot: at[b.i][3] ?? rot } : null;
      const sz = p ? p.size : b.size;
      out.push({ wi, x: p ? p.x : b.cx, y: p ? p.y : y, size: sz });
      if (lt < 0) continue;
      const s = lerp(0.2, 1, EASE.outExpo(clamp(lt / 0.14))) * (1 + 0.06 * hit(lt, 0.14, 0.18));
      const s2 = { ...st, size: sz, strokeWidth: sz * 0.13, align: 'center', baseline: 'center' };
      ctx.save();
      if (p) { ctx.translate(p.x, p.y); ctx.rotate(p.rot); }
      else { ctx.translate(x, y); ctx.rotate(rot); ctx.translate(b.cx - x, 0); }
      ctx.scale(s, s);
      TXT.draw(ctx, b.text, 0, 0, s2);
      mark(ctx, li, wi, sz);
      ctx.restore();
    }
    return out;
  },

  // KIT.news(ctx, t, {li, tIn, label, ticker, clock, y}) -> {y}
  //   A breaking-news frame: a red ÚLTIMA HORA tab, the sung line as the headline in a white bar, a ticker
  //   and a clock under it. Builds left to right at tIn.
  news(ctx, t, o = {}) {
    const { li = null, label = 'ÚLTIMA HORA', ticker = '', clock = '21:47', y = 740, headline = '' } = o;
    const L = li != null ? LYR.line(li) : null;
    const tIn = o.tIn ?? (L ? beatBefore(L.t0) : 0);
    if (t < tIn) return null;
    const x0 = 90, x1 = W - 90, bw = x1 - x0, u = EASE.outExpo(clamp((t - tIn) / 0.22));
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, 0, bw * u, H); ctx.clip();
    const tab = { font: F.caps, size: 66, tracking: 0.04, fill: P.mozz };
    const tw = TXT.width(label, tab) + 64;
    ctx.fillStyle = P.tomato; ctx.fillRect(x0, y, tw, 92);
    TXT.draw(ctx, label, x0 + 32, y + 46, { ...tab, baseline: 'center' });
    ctx.fillStyle = P.mozz; ctx.fillRect(x0, y + 92, bw, 150);
    const hs = { font: F.sans, weight: 900, size: 104, tracking: -0.03, upper: true };
    if (L) {
      const boxes = TXT.layout(L.words, { x: x0 + 32, y: y + 92, w: bw - 64, h: 150 }, { ...hs, wrap: false, fit: true, align: 'left' });
      for (const b of boxes) {
        if (!wordOn(li, b.i, t)) continue;
        TXT.word(ctx, b, { ...hs, fill: P.patent });
        mark(ctx, li, b.i, b.size);
      }
    } else if (headline) {
      TXT.draw(ctx, headline, x0 + 32, y + 92 + 75, { ...hs, size: Math.min(104, TXT.fit(headline, { w: bw - 64 }, hs)), fill: P.patent, baseline: 'center' });
    }
    ctx.fillStyle = P.patent; ctx.fillRect(x0, y + 242, bw, 60);
    const ck = { font: F.mono, weight: 700, size: 34, fill: P.patent };
    const cw = TXT.width(clock, ck) + 44;
    if (ticker) {
      const tk = { font: F.sans, weight: 600, size: 32, fill: P.mozz, tracking: 0.02 };
      const unit = ticker + '   ·   ', uw = TXT.width(unit, tk) + 0.02 * 32, sh = ((t - tIn) * 150) % uw;
      ctx.save();
      ctx.beginPath(); ctx.rect(x0, y + 242, bw - cw, 60); ctx.clip();
      for (let dx = x0 + 28 - sh; dx < x1; dx += uw) TXT.draw(ctx, unit, dx, y + 272, { ...tk, baseline: 'center' });
      ctx.restore();
    }
    ctx.fillStyle = P.cheese; ctx.fillRect(x1 - cw, y + 242, cw, 60);
    TXT.draw(ctx, clock, x1 - cw / 2, y + 272, { ...ck, align: 'center', baseline: 'center' });
    ctx.restore();
    return { y };
  },

  // KIT.episode(ctx, t, {li, chapter, x, y, w, size, tIn}): episode card. A tracked "CAPÍTULO 247" between two
  // rules, and the sung line under it as the episode's title in script. x, y: centre of the title row.
  episode(ctx, t, o = {}) {
    const { li, chapter = 'CAPÍTULO 247', x = W / 2, y = 760, w = 1500, size = 190 } = o;
    const L = LYR.line(li), tIn = o.tIn ?? beatBefore(L.t0);
    if (t < tIn) return;
    const cs = { font: F.sans, weight: 800, size: 40, tracking: 0.36, fill: P.cheese, stroke: P.patent, strokeWidth: 7 };
    const cw = TXT.width(chapter, cs), u = EASE.outExpo(clamp((t - tIn) / 0.25)), yc = y - size * 0.86;
    TXT.draw(ctx, chapter, x, yc, { ...cs, align: 'center', baseline: 'center' });
    for (const d of [-1, 1]) {
      const rx = x + d * (cw / 2 + 36);
      ctx.fillStyle = P.patent; ctx.fillRect(d < 0 ? rx - 264 * u : rx - 2, yc - 5, 264 * u + 2, 10);
      ctx.fillStyle = P.cheese; ctx.fillRect(d < 0 ? rx - 262 * u : rx, yc - 3, 262 * u, 6);
    }
    KIT.script(ctx, t, li, { x, y, w, size, rot: 0 });
  },

  // KIT.status(ctx, t, {x, y, w, label, from, to, tIn, tFlip}): a relationship-status row with a switch.
  // Reads `from` until tFlip, then the switch goes over and it reads `to`.
  status(ctx, t, o = {}) {
    const { x = 520, y = 420, w = 880, label = 'Situación sentimental', from = 'En una relación', to = 'Soltera, con pizza', tIn = 0, tFlip = Infinity } = o;
    if (t < tIn) return;
    const D = 880, Hh = 220, k = w / D, pad = 44;
    const u = EASE.outExpo(clamp((t - tIn) / 0.2)), f = EASE.outBack(clamp((t - tFlip) / 0.16)), on = t >= tFlip;
    ctx.save();
    ctx.translate(x, y + (1 - u) * 60); ctx.scale(k, k);
    ctx.globalAlpha *= clamp((t - tIn) / 0.06);
    ctx.fillStyle = P.mozz; ctx.beginPath(); ctx.roundRect(0, 0, D, Hh, 34); ctx.fill();
    TXT.draw(ctx, label, pad, 76, { font: F.sans, weight: 600, size: 32, fill: P.patent, opacity: 0.6 });
    const val = { font: F.sans, weight: 900, size: 68, tracking: -0.03, fill: P.patent };
    ctx.save();
    ctx.beginPath(); ctx.rect(pad - 6, 96, D - 250, 100); ctx.clip();
    const sl = on ? EASE.outCubic(clamp((t - tFlip) / 0.14)) : 0;
    if (sl < 1) TXT.draw(ctx, from, pad, 164 - sl * 90, { ...val, size: Math.min(68, TXT.fit(from, { w: D - 262 }, val)) });
    if (on) TXT.draw(ctx, to, pad, 164 + (1 - sl) * 90, { ...val, size: Math.min(68, TXT.fit(to, { w: D - 262 }, val)) });
    ctx.restore();
    const sx = D - pad - 150, sy = 70, sw = 150, sh = 80;
    ctx.fillStyle = on ? P.tomato : '#C9C4B6';
    ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, sh / 2); ctx.fill();
    ctx.fillStyle = P.mozz;
    ctx.beginPath(); ctx.arc(sx + sh / 2 + (sw - sh) * (on ? f : 0), sy + sh / 2, sh / 2 - 8, 0, TAU); ctx.fill();
    ctx.restore();
  },

  // ------------------------------------------------------------ 11. kiss print, napkin, title and end card
  // KIT.kiss(ctx, t, {x, y, size, rot, tHit, color, pulse}): a lip print. x, y: centre; size: its width in px.
  // Stamps on tHit and stays. color: PAL.tomato (default), PAL.patent or PAL.mozz. pulse: beat throb, 0 to 0.1.
  kiss(ctx, t, o = {}) {
    const { x = W / 2, y = H / 2, size = 300, rot = -0.2, tHit = 0, color = P.tomato, pulse = 0 } = o;
    if (t < tHit) return;
    const tex = KISS[color];
    if (!tex) throw new Error('KIT.kiss: color must be PAL.tomato, PAL.patent or PAL.mozz');
    const s = slam(t - tHit, 2.2, 0.08) * (1 + pulse * BEAT.pulse(t, 0.22)) * (size / 500);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tex, -300, -190);
    ctx.restore();
  },

  // KIT.kisses(ctx, t, {b0, n, step, box, size, seed, color}): prints that multiply, one per `step` beats from
  // beat b0, scattered over `box` by `seed`. Keep the box clear of her face.
  kisses(ctx, t, o = {}) {
    const { b0 = 0, n = 8, step = 1, box = { x: 100, y: 100, w: 1720, h: 880 }, size = 260, seed = 1, color = P.tomato } = o;
    const r = rnd(seed);
    for (let i = 0; i < n; i++) {
      const kx = box.x + r() * box.w, ky = box.y + r() * box.h, rot = r.range(-0.6, 0.6), sz = size * r.range(0.7, 1.25);
      KIT.kiss(ctx, t, { x: kx, y: ky, size: sz, rot, tHit: BEAT.t(b0 + i * step), color });
    }
  },

  // KIT.napkin(ctx, t, li, {x, y, w, rot, tIn, brk, kiss, size}) -> {h}
  //   A paper napkin with the sung line in handwriting, written word by word from each t0. x, y: top left.
  //   brk: index of the word that starts the second row. kiss: true stamps a lip print on the last word.
  napkin(ctx, t, li, o = {}) {
    const L = LYR.line(li);
    const { x = 1230, y = 110, w = 620, rot = 0.06, brk = 3, kiss = true, size = 146 } = o;
    const tIn = o.tIn ?? beatBefore(L.t0);
    if (t < tIn) return null;
    const D = 620, Hh = 500, k = w / D;
    const u = EASE.outExpo(clamp((t - tIn) / 0.2));
    ctx.save();
    ctx.translate(x + w / 2 + (1 - u) * 900, y + (Hh * k) / 2); ctx.rotate(rot + (1 - u) * 0.5); ctx.scale(k, k); ctx.translate(-D / 2, -Hh / 2);
    ctx.fillStyle = P.mozz; ctx.fillRect(0, 0, D, Hh);
    ctx.fillStyle = '#E4DCC8';                        // the embossed border of a paper napkin
    for (const ins of [22, 40]) {
      const nx = Math.round((D - 2 * ins) / 18), ny = Math.round((Hh - 2 * ins) / 18);
      for (let i = 0; i <= nx; i++) for (const yy of [ins, Hh - ins]) { ctx.beginPath(); ctx.arc(ins + ((D - 2 * ins) * i) / nx, yy, ins === 22 ? 3.4 : 2.2, 0, TAU); ctx.fill(); }
      for (let i = 1; i < ny; i++) for (const xx of [ins, D - ins]) { ctx.beginPath(); ctx.arc(xx, ins + ((Hh - 2 * ins) * i) / ny, ins === 22 ? 3.4 : 2.2, 0, TAU); ctx.fill(); }
    }
    const rows = [L.words.slice(0, brk), L.words.slice(brk)].filter(r => r.length);
    const fit = Math.min(size, ...rows.map(r => TXT.fit(r.map(v => v.w).join(' '), { w: D - 150 }, STY.hand)));
    const st = { ...STY.hand, size: fit };
    let wi = 0;
    rows.forEach((row, ri) => {
      let cx = 58 + ri * 30;
      const base = 176 + ri * fit * 0.98;
      for (const v of row) {
        const ww = TXT.width(v.w, st), lt = t - v.t0;
        if (lt >= 0) {
          const d = Math.min(0.18, 0.45 * (v.t1 - v.t0)), wr = clamp(lt / d);
          ctx.save();
          ctx.beginPath(); ctx.rect(cx - 10, base - fit, (ww + 20) * wr, fit * 1.5); ctx.clip();
          TXT.draw(ctx, v.w, cx, base, st);
          ctx.restore();
          if (wr >= 1) mark(ctx, li, wi, fit);
        }
        cx += ww + TXT.width(' ', st);
        wi++;
      }
    });
    if (kiss) KIT.kiss(ctx, t, { x: D - 140, y: Hh - 88, size: 240, rot: -0.3, tHit: L.words[L.words.length - 1].t0 });
    ctx.restore();
    return { h: Hh * k };
  },

  // KIT.title(ctx, t, {tQueso, tName, x, y, size, bg, name, ink}): the end card. QUESO as the label's slab
  //   (black on cheese yellow), then Saindra under it. Quiet: both cut on, nothing slams. bg: a colour to fill
  //   the frame with, or null to sit on the picture. ink: colour of the name (patent on a light plate).
  title(ctx, t, o = {}) {
    const { tQueso = 0, tName = Infinity, x = W / 2, y = H / 2 - 30, size = 300, bg = null, name = 'Saindra', ink = P.patent } = o;
    if (t < tQueso) return;
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
    const r = KIT.slab(ctx, t, 'QUESO', { x, y, size, rot: -0.035, from: 1 });
    if (t >= tName) TXT.draw(ctx, name, x, y + r.h / 2 + size * 0.36, { font: F.book, italic: true, weight: 500, size: size * 0.3, fill: ink, align: 'center' });
  },

  // ------------------------------------------------------------ bites
  // KIT.bitePath(x, y, r, rot) -> Path2D of a bite: a round hole with tooth scallops on the side `rot` points to
  bitePath(x, y, r, rot = 0) {
    const p = new Path2D();
    p.arc(x, y, r, 0, TAU);
    for (let i = -3; i <= 3; i++) {
      const a = rot + i * 0.42, sx = x + Math.cos(a) * r * 0.98, sy = y + Math.sin(a) * r * 0.98;
      p.moveTo(sx + r * 0.25, sy);
      p.arc(sx, sy, r * 0.25, 0, TAU);
    }
    return p;
  },
  // KIT.bitten(ctx, draw, bites, key): draws with draw(g) on a layer, takes the bites out, lays it on ctx.
  //   bites: [{x, y, r, rot, t}] a bite is taken from time t on (omit t for always). Everything drawn in
  //   `draw` gets bitten, so the picture shows through the holes.
  bitten(ctx, t, draw, bites = [], key = 'kit.bite') {
    const g = CANVAS.scratch(key);
    g.setTransform(ctx.getTransform());
    draw(g);
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = '#000';
    for (const b of bites) if (b.t == null || t >= b.t) g.fill(KIT.bitePath(b.x, b.y, b.r, b.rot || 0));
    ctx.save(); ctx.resetTransform(); ctx.drawImage(g.canvas, 0, 0); ctx.restore();
  },
};

globalThis.KIT = KIT;
globalThis.SHOT = SHOT;
globalThis.CAM = CAM;
