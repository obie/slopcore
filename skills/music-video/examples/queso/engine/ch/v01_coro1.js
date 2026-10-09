// v01_coro1.js: chorus 1 as a vertical cut, 1080 x 1920, for TikTok and Reels. Beat 12 to beat 45 (7.77 to
// 27.97 s), shots s002 (its last beat) to s010, lines 2 to 9, then an end card to beat 49 (30.42 s).
// The 16:9 chapter it re-lays is 01_aperitivo.js. Every scene here is a proof scene: this file draws only when
// it is picked, in a tall frame:
//
//   cd engine && VIDEO_PROJECT=queso ../.venv/bin/python render.py video 7.77:30.42 --size 1080x1920 --ch v01 \
//       --no-audio --out ../queso/media/scratch/vertical/video.mp4
//
// How the tall frame is used:
//   1. The picture fills the frame. A 16:9 clip gives a tall frame a slice 31.6% of its width, so each shot
//      names the point of the picture that sits in the middle (CAM_OF), and moves it where the action moves.
//   2. The interface of TikTok and Reels covers the top 220 px, the bottom 480 px and the right 150 px. Type
//      and everything pinned stays inside SAFE. Footage runs under.
//   3. A lyric surface sits where the slice leaves room: under her face, in the lower band of SAFE on the
//      column COL (the label, the quote, her counter), or beside a face (the label of s007, his panel, the
//      slabs). Two shots are extreme close-ups in which her face alone is taller than SAFE (s003, s006). There
//      the frame splits on a seam: her in the top part at a wider crop, the food of the same clip in the bottom
//      part, and the surface on the bottom part. s007 is a two-shot: the slice starts on her and whips to him,
//      landing on beat 30.5.
//   4. Things pinned to the picture (his tags, her boxes) go through the shot's placement with SHOT.pt and
//      SHOT.box, as in the film.

if (W >= H) {
  if (ENGINE.picked.length) throw new Error('v01_coro1.js is a vertical cut: render it with --size 1080x1920');
  return;
}

const MARK = '@saindra_ofc';   // the watermark, and the handle on the end card

const B = n => BEAT.t(n);
const word = (li, wi) => LYR.word(li, wi);
const Z_GFX = 10;
const T_IN = B(12), T_CARD = B(45), T_OUT = B(49);
const SCENE_V = def => SCENE({ ...def, proof: true });   // never in a film render

// ---------------------------------------------------------------- the frame

const SAFE = { x0: 0, y0: 220, x1: W - 150, y1: H - 480 };
const COL = { x: 48, w: SAFE.x1 - 6 - 48 };     // the type column, x 48 to 924
const FLOOR = SAFE.y1 - 8;                      // the lowest edge of a surface
// a split frame: the two boxes above and below a seam
const split = seam => ({ seam, top: { x: 0, y: 0, w: W, h: seam }, bot: { x: 0, y: seam, w: W, h: H - seam } });
const mark = (ctx, li, wi, size) => LY.mark(li, wi, size * LY.scale(ctx));
const rule = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
// a value that goes from a to b between two times
const ramp = (a, b, t, t0, t1, ease = EASE.inOutCubic) => lerp(a, b, ease(clamp((t - t0) / (t1 - t0))));

// ---------------------------------------------------------------- 1. cameras

// A clip laid to cover the tall frame is IW x IH px. view() gives SHOT.draw the options that put the picture
// point (fx, fy), 0..1, on the frame point (tx, ty) at `zoom`; a punch then zooms about that point.
const S0 = Math.max(W / 1920, H / 1080), IW = 1920 * S0, IH = 1080 * S0;
const view = ({ fx = 0.5, fy = 0.5, zoom = 1, tx = W / 2, ty = H / 2, cam = null }) => ({
  about: [fx, fy], cam,
  move: { zoom, x: tx - W / 2 - (fx - 0.5) * IW, y: ty - H / 2 - (fy - 0.5) * IH },
});

const T_WHIP = [B(30.25), B(30.5)];             // s007: from her to him
const CAM_OF = {
  // the pizza lands: the film's punch and shake, on the first frame of this cut
  s002: t => view({ fx: 0.42, fy: 0.42, zoom: 1.08, ty: 720, cam: [CAM.punch(t, B(12), 0.05), CAM.shake(t, B(12), 12)] }),
  // the flex: her raised fist and her face, then both arms
  s004: t => view({ fx: ramp(0.365, 0.40, t, B(19), B(20)), fy: 0.3, zoom: 1.06, ty: 560, cam: CAM.beat(t, 0.025) }),
  // the bite: her head goes back as she pulls
  s005: t => view({ fx: ramp(0.545, 0.50, t, B(22.5), B(24)), cam: [CAM.punch(t, [B(22), B(23)], 0.05), CAM.shake(t, word(4, 4).t0, 10)] }),
  // the couple: she devours, then the slice whips to him and QUESO lands beside his frown
  s007: t => view({ fx: ramp(0.30, 0.715, t, T_WHIP[0], T_WHIP[1]), cam: [CAM.punch(t, word(6, 4).t0, 0.04), CAM.shake(t, word(6, 4).t0, 10)] }),
  // the finger and her face; the stamp shakes the frame on beat 35
  s008: t => view({ fx: 0.485, fy: 0.385, cam: [CAM.punch(t, B(35), 0.05), CAM.shake(t, B(35), 14)] }),
  // him and the calculator, his glass at the left edge
  s009: t => view({ fx: 0.40, cam: CAM.beat(t, 0.02) }),
  // the pizza from above: the slice follows her fingertip from right to left
  s010: t => view({ fx: ramp(0.55, 0.345, t, B(41), B(42.75), EASE.inOutSine), cam: CAM.beat(t, 0.012, 0.12, 0.5) }),
  // under the end card: the waiters of the next shot
  s011: t => view({ fx: 0.44, fy: 0.35, zoom: ramp(1.02, 1.06, t, T_CARD, T_OUT, EASE.linear), ty: 640 }),
};
const at = (sid, t) => SHOT.at(sid, t, CAM_OF[sid](t));

// crop(ctx, sid, t, box, {fx, fy, zoom, tx, ty, cam}): the shot's clip in a box of the frame, with the picture
// point (fx, fy) on the box's centre (or on tx, ty), as far as the picture's edges allow.
function crop(ctx, sid, t, box, o = {}) {
  const { fx = 0.5, fy = 0.5, tx = box.x + box.w / 2, ty = box.y + box.h / 2 } = o;
  const cam = CAM.mix(o.cam || []), pic = SHOT.at(sid, t), zoom = (o.zoom || 1) * cam.zoom;
  const s = Math.max(box.w / 1920, box.h / 1080) * zoom, iw = 1920 * s, ih = 1080 * s;
  const mx = (iw - box.w) / 2, my = (ih - box.h) / 2;
  const x = clamp(tx - (box.x + box.w / 2) - (fx - 0.5) * iw + cam.x, -mx, mx);
  const y = clamp(ty - (box.y + box.h / 2) - (fy - 0.5) * ih + cam.y, -my, my);
  ctx.save();
  ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  if (pic.kind === 'clip') MEDIA.drawClip(ctx, pic.name, pic.lt, { box, zoom, x, y });
  else MEDIA.drawPlate(ctx, pic.name, { box, zoom, x, y });
  ctx.restore();
}
// the line between the two halves of a split frame
const seam = (ctx, y) => rule(ctx, 0, y - 4, W, 8, PAL.mozz);

// ---------------------------------------------------------------- 2. pictures

SCENE_V({ id: 'v01.s002', t0: T_IN, t1: SHOT.t1('s002'), z: 0, draw(ctx, t) { SHOT.draw(ctx, 's002', t, CAM_OF.s002(t)); } });
for (const sid of ['s004', 's005', 's007', 's008', 's009', 's010']) {
  SCENE_V({ id: `v01.${sid}`, t0: SHOT.t0(sid), t1: SHOT.t1(sid), z: 0, draw(ctx, t) { SHOT.draw(ctx, sid, t, CAM_OF[sid](t)); } });
}
SCENE_V({ id: 'v01.s011', t0: T_CARD, t1: T_OUT, z: 0, draw(ctx, t) { SHOT.draw(ctx, 's011', t, CAM_OF.s011(t)); } });

// s003, split in the middle. Top: she sings to the lens with the slice beside her face. Bottom: the slice and
// its cheese, under the label.
const S3 = split(960);
SCENE_V({ id: 'v01.s003', t0: SHOT.t0('s003'), t1: SHOT.t1('s003'), z: 0, draw(ctx, t) {
  const cam = [CAM.punch(t, word(2, 4).t0, 0.06), CAM.shake(t, word(2, 4).t0, 12)];
  crop(ctx, 's003', t, S3.top, { fx: 0.46, fy: 0.5, zoom: 1.04, cam });
  crop(ctx, 's003', t, S3.bot, { fx: 0.22, fy: 0.68, zoom: 1.5, cam });
  seam(ctx, S3.seam);
}});
// s006, split higher: by the end of the shot she leans into the lens and fills the clip, so her half is the
// smaller one and holds her on its left. Bottom: the table beside her, where the napkin lies.
const S6 = split(830);
SCENE_V({ id: 'v01.s006', t0: SHOT.t0('s006'), t1: SHOT.t1('s006'), z: 0, draw(ctx, t) {
  // she leans in after the kiss: the crop goes with her, so her temple stays left of the lockup
  crop(ctx, 's006', t, S6.top, { fx: ramp(0.576, 0.604, t, B(27), B(28.5)), fy: 0.5, cam: CAM.punch(t, word(5, 4).t0, 0.06) });
  crop(ctx, 's006', t, S6.bot, { fx: 0.80, fy: 0.70, zoom: 1.5 });
  seam(ctx, S6.seam);
}});

// ---------------------------------------------------------------- 3. the title lockup and the watermark

// At the top of SAFE for the whole cut: her name in the film's book italic, the QUESO slab beside it, and the
// handle under them, faint, with the thin dark edge the film's watermark has. It sits in the left corner, and
// in the right corner from s004 to s007 (beats 16 to 32), where her fist, her forehead and his hair take the left.
const LOCK = { y: 284, name: 46, slab: 50, gap: 16, markY: 330, markSize: 28, alpha: 0.55, right: [B(16), B(32)] };
SCENE_V({ id: 'v01.marca', t0: T_IN, t1: T_CARD, z: 100, draw(ctx, t) {
  const right = t >= LOCK.right[0] && t < LOCK.right[1];
  const st = { font: FACE.book, italic: true, weight: 500, size: LOCK.name, fill: PAL.mozz, stroke: PAL.patent, strokeWidth: 5 };
  const nw = TXT.width('Saindra', st);
  const sw = TXT.width('QUESO', { font: FACE.caps, size: LOCK.slab, tracking: 0.01 }) + 2 * 0.17 * LOCK.slab;
  const x = right ? COL.x + COL.w - (nw + LOCK.gap + sw) : COL.x;
  TXT.draw(ctx, 'Saindra', x, LOCK.y, st);
  KIT.slab(ctx, t, 'QUESO', { x: x + nw + LOCK.gap + sw / 2, y: LOCK.y - TXT.capH(st) / 2, size: LOCK.slab, rot: -0.035, from: 1 });
  ctx.save();
  ctx.globalAlpha *= LOCK.alpha;
  TXT.draw(ctx, MARK, right ? COL.x + COL.w - 2 : COL.x + 2, LOCK.markY, { font: FACE.sans, weight: 600, size: LOCK.markSize, tracking: 0.04, fill: PAL.mozz, stroke: PAL.patent, strokeWidth: 4, align: right ? 'right' : 'left' });
  ctx.restore();
}});

// ---------------------------------------------------------------- 4. the nutrition label, re-laid

// labelV(ctx, t, {x, w, bottom, grasa, culpa, bar, tIn, tCulpa}): the label as a wide panel that stands on
// `bottom`. Until the second line it holds "No es Grasa," over "es QUESO", the slab as large as the row takes.
// On the beat before the second line the first group folds into one row and the second group builds under
// it, so the panel grows upward and its foot stays put.
function labelV(ctx, t, o) {
  const { x = COL.x, w = COL.w, bottom = FLOOR, grasa, culpa = null } = o;
  const gL = LYR.line(grasa), cL = culpa != null ? LYR.line(culpa) : null;
  const tIn = o.tIn ?? KIT.beatBefore(gL.t0);
  if (t < tIn) return null;
  const tCulpa = cL ? o.tCulpa ?? Math.max(tIn, KIT.beatBefore(cL.t0)) : Infinity;
  const two = t >= tCulpa, tStrike = gL.words[3].t0, tSlam = gL.words[4].t0;
  const ink = PAL.patent, pad = 28, IW = w - 2 * pad;
  const sm = { font: FACE.sans, weight: 800, size: 72, fill: ink, tracking: -0.02 };
  const hv = { ...STY.label, fill: ink }, qs = { font: FACE.caps, tracking: 0.01, upper: true };
  const gap = TXT.width(' ', sm) * 0.9;
  const cap1 = s => s.charAt(0).toLocaleUpperCase('es') + s.slice(1);

  // heights
  const title = { ...STY.label, fill: ink, tracking: -0.035 };
  const TS = Math.min(58, TXT.fit('Información Nutricional', { w: IW }, title)), capT = TXT.capH({ ...title, size: TS });
  const hHead = 22 + capT + 16 + 14;
  const xName = pad + TXT.width(gL.words[0].w, sm) + gap + TXT.width(gL.words[1].w, sm) + gap * 1.3;
  const name = cap1(gL.words[2].w), nameSize = Math.min(120, TXT.fit(name, { w: IW - (xName - pad) }, hv));
  const capN = TXT.capH({ ...hv, size: nameSize });
  const lead = TXT.width(gL.words[3].w, sm) + gap * 1.3;
  const QS = Math.min(184, TXT.fit('QUESO', { w: IW - lead - 48 }, qs)), capQ = TXT.capH({ ...qs, size: QS });
  const qw = TXT.width('QUESO', { ...qs, size: QS }) + 48, qh = capQ + 44;
  const hA = 20 + capN + 24 + qh + 22, hRow = 104, hB = 302, hFoot = 50;
  const g = two ? EASE.outCubic(clamp((t - tCulpa) / 0.2)) : 0;
  const full = hHead + (two ? hRow + hB * g : hA) + hFoot;
  const top = bottom - full, h = full * EASE.outExpo(clamp((t - tIn) / 0.22));

  ctx.save();
  ctx.translate(x, top);
  const jolt = 1 + 0.03 * KIT.hit(t, tSlam, 0.22);
  ctx.translate(w / 2, full / 2); ctx.scale(jolt, jolt); ctx.translate(-w / 2, -full / 2);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  rule(ctx, 0, 0, w, h, PAL.mozz);
  const tw = TXT.draw(ctx, 'Información Nutricional', pad, 22 + capT, { ...title, size: TS });
  const por = { font: FACE.sans, weight: 500, size: 24, fill: ink }, tod = { ...por, weight: 800 };
  if (IW - tw >= TXT.width('Porción toda', tod) + 20) {         // the portion, on the title row when it fits
    TXT.draw(ctx, 'toda', w - pad, 22 + capT, { ...tod, align: 'right' });
    TXT.draw(ctx, 'Porción', w - pad - TXT.width(' toda', tod), 22 + capT, { ...por, align: 'right' });
  }
  rule(ctx, pad, 22 + capT + 16, IW, 14, ink);

  let yy = hHead, slab = null;
  if (!two) {                                         // "No es Grasa," over "es QUESO"
    const base = yy + 20 + capN;
    if (t >= gL.words[0].t0) { TXT.draw(ctx, gL.words[0].w, pad, base, sm); mark(ctx, gL.li, 0, sm.size); }
    if (t >= gL.words[1].t0) { TXT.draw(ctx, gL.words[1].w, pad + TXT.width(gL.words[0].w, sm) + gap, base, sm); mark(ctx, gL.li, 1, sm.size); }
    if (t >= gL.words[2].t0) { TXT.draw(ctx, name, xName, base, { ...hv, size: nameSize }); mark(ctx, gL.li, 2, nameSize); }
    const u = clamp((t - tStrike) / 0.09);
    if (u > 0) rule(ctx, xName - 10, base - capN * 0.5 - 8, (TXT.width(name, { ...hv, size: nameSize }) + 20) * EASE.outCubic(u), 16, PAL.tomato);
    slab = { cx: pad + lead + qw / 2, cy: base + 24 + qh / 2, w: qw, h: qh, size: QS };
    if (t >= tStrike) { TXT.draw(ctx, gL.words[3].w, pad, slab.cy + capQ / 2, sm); mark(ctx, gL.li, 3, sm.size); }
    yy += hA;
  } else {                                            // the first group as one row: Grasa struck, QUESO in its place
    const s2 = { ...sm, size: 44 }, base = yy + 74, n2 = { ...hv, size: 76 };
    const x0 = pad + TXT.draw(ctx, `${gL.words[0].w} ${gL.words[1].w}`, pad, base, s2) + 14;
    const nw = TXT.draw(ctx, name, x0, base, n2);
    rule(ctx, x0 - 8, base - TXT.capH(n2) * 0.5 - 6, nw + 16, 12, PAL.tomato);
    const q2 = { ...qs, size: 76 }, w2 = TXT.width('QUESO', q2) + 30, h2 = TXT.capH(q2) + 26;
    ctx.save();
    ctx.translate(w - pad - w2 / 2, base - TXT.capH(n2) / 2); ctx.rotate(-0.035);
    rule(ctx, -w2 / 2, -h2 / 2, w2, h2, PAL.cheese);
    TXT.draw(ctx, 'QUESO', 0, 0, { ...q2, fill: ink, align: 'center', baseline: 'center' });
    ctx.restore();
    TXT.draw(ctx, gL.words[3].w, w - pad - w2 - 16, base, { ...s2, align: 'right' });
    rule(ctx, pad, yy + hRow - 2, IW, 2, ink);
    yy += hRow;
    if (g > 0) {                                      // "No es Culpa, 0%" over "es Progreso" and its bar
      const wd = i => cL.words[i], on = i => t >= wd(i).t0, pct = { ...hv, size: 88 };
      TXT.draw(ctx, '% Culpa diaria*', w - pad, yy + 25, { font: FACE.sans, weight: 800, size: 22, fill: ink, align: 'right' });
      rule(ctx, pad, yy + 33, IW, 2, ink);
      const b1 = yy + 34 + 72, culpaName = cap1(wd(2).w);
      const cSize = Math.min(88, TXT.fit(culpaName, { w: IW - (xName - pad) - TXT.width('0%', pct) - 18 }, hv));
      if (on(0)) { TXT.draw(ctx, wd(0).w, pad, b1, sm); mark(ctx, cL.li, 0, sm.size); }
      if (on(1)) { TXT.draw(ctx, wd(1).w, pad + TXT.width(wd(0).w, sm) + gap, b1, sm); mark(ctx, cL.li, 1, sm.size); }
      if (on(2)) {
        TXT.draw(ctx, culpaName, xName, b1, { ...hv, size: cSize }); mark(ctx, cL.li, 2, cSize);
        const s = KIT.slam(t - wd(2).t0, 1.7, 0.08);
        ctx.save(); ctx.translate(w - pad - TXT.width('0%', pct) / 2, b1 - TXT.capH(pct) / 2); ctx.scale(s, s);
        TXT.draw(ctx, '0%', 0, 0, { ...pct, align: 'center', baseline: 'center' });
        ctx.restore();
      }
      rule(ctx, pad, yy + 34 + 94, IW, 2, ink);
      const b2 = yy + 34 + 96 + 72;
      if (on(3)) { TXT.draw(ctx, wd(3).w, pad, b2, sm); mark(ctx, cL.li, 3, sm.size); }
      if (on(4)) {
        const pName = cap1(wd(4).w), pSize = Math.min(88, TXT.fit(pName, { w: IW - lead }, hv));
        TXT.draw(ctx, pName, pad + lead, b2, { ...hv, size: pSize }); mark(ctx, cL.li, 4, pSize);
        // the loading bar: one chunk per step
        const p0 = Math.ceil(BEAT.pos(wd(4).t0) * 2 - 1e-6) / 2, [c0, c1, step = 0.5] = o.bar || [p0, p0 + 2];
        const n = Math.max(1, Math.round((c1 - c0) / step) + 1), by = b2 + 20, bw = IW - 132, bh = 44;
        ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.strokeRect(pad + 2, by + 2, bw - 4, bh - 4);
        const cw = (bw - 16 - (n - 1) * 5) / n;
        let done = 0;
        for (let i = 0; i < n; i++) {
          const lt = t - B(c0 + i * step);
          if (lt < 0) continue;
          done++;
          const s = lerp(0.3, 1, EASE.outCubic(clamp(lt / 0.07)));
          rule(ctx, pad + 8 + i * (cw + 5), by + 8 + ((bh - 16) * (1 - s)) / 2, cw, (bh - 16) * s, ink);
        }
        TXT.draw(ctx, `${Math.round((100 * done) / n)}%`, w - pad, by + bh - 7, { ...hv, size: 42, align: 'right' });
      }
      yy += hB * g;
    }
  }
  rule(ctx, pad, yy + 4, IW, 10, ink);
  TXT.draw(ctx, '* Culpa diaria con base en una dieta de pizza.', pad, yy + 38, { font: FACE.sans, weight: 500, size: 21, fill: ink });
  ctx.restore();

  ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.strokeRect(3, 3, w - 6, Math.max(0, h - 6));
  if (slab && t >= tSlam) {                           // QUESO lands over the struck row
    const s = KIT.slam(t - tSlam, 2.4, 0.09);
    ctx.save();
    ctx.translate(slab.cx, slab.cy); ctx.rotate(-0.035); ctx.scale(s, s);
    rule(ctx, -slab.w / 2, -slab.h / 2, slab.w, slab.h, PAL.cheese);
    TXT.draw(ctx, 'QUESO', 0, 0, { ...qs, size: slab.size, fill: ink, align: 'center', baseline: 'center' });
    mark(ctx, gL.li, 4, slab.size);
    ctx.restore();
  }
  ctx.restore();
  return { x, y: top, w, h: full };
}

// labelSlim(ctx, t, {x, y, w, grasa, from}): the label as the narrow tall panel a real one is, for the gap
// beside a face. One word group per row: "No es", "Grasa," struck, "es" and the slab.
function labelSlim(ctx, t, o) {
  const { x, y, w = 440, grasa, from = 1.6 } = o;
  const gL = LYR.line(grasa), tIn = o.tIn ?? KIT.beatBefore(gL.t0);
  if (t < tIn) return null;
  const ink = PAL.patent, pad = 22, IW = w - 2 * pad, tStrike = gL.words[3].t0, tSlam = gL.words[4].t0;
  const sm = { font: FACE.sans, weight: 800, size: 68, fill: ink, tracking: -0.02 }, capS = TXT.capH(sm);
  const hv = { ...STY.label, fill: ink }, qs = { font: FACE.caps, tracking: 0.01, upper: true };
  const gap = TXT.width(' ', sm) * 0.9;
  const title = { ...STY.label, fill: ink, tracking: -0.035 };
  const TS = Math.min(TXT.fit('Información', { w: IW }, title), TXT.fit('Nutricional', { w: IW }, title), 48);
  const capT = TXT.capH({ ...title, size: TS }), yT2 = 20 + capT + TS * 0.97, hHead = yT2 + 14 + 12;
  const name = gL.words[2].w.charAt(0).toLocaleUpperCase('es') + gL.words[2].w.slice(1);
  const nameSize = Math.min(118, TXT.fit(name, { w: IW }, hv)), capN = TXT.capH({ ...hv, size: nameSize });
  const b1 = hHead + 18 + capS, b2 = b1 + 20 + capN;
  const lead = TXT.width(gL.words[3].w, sm) + gap * 1.3;
  const QS = Math.min(150, TXT.fit('QUESO', { w: IW - lead - 36 }, qs)), capQ = TXT.capH({ ...qs, size: QS });
  const qw = TXT.width('QUESO', { ...qs, size: QS }) + 36, qh = capQ + 36, cy = b2 + 24 + qh / 2;
  const full = b2 + 24 + qh + 22 + 14, h = full * EASE.outExpo(clamp((t - tIn) / 0.22));

  ctx.save();
  ctx.translate(x, y);
  const jolt = 1 + 0.03 * KIT.hit(t, tSlam, 0.22);
  ctx.translate(w / 2, full / 2); ctx.scale(jolt, jolt); ctx.translate(-w / 2, -full / 2);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  rule(ctx, 0, 0, w, h, PAL.mozz);
  TXT.draw(ctx, 'Información', pad, 20 + capT, { ...title, size: TS });
  TXT.draw(ctx, 'Nutricional', pad, yT2, { ...title, size: TS });
  rule(ctx, pad, yT2 + 14, IW, 12, ink);
  if (t >= gL.words[0].t0) { TXT.draw(ctx, gL.words[0].w, pad, b1, sm); mark(ctx, gL.li, 0, sm.size); }
  if (t >= gL.words[1].t0) { TXT.draw(ctx, gL.words[1].w, pad + TXT.width(gL.words[0].w, sm) + gap, b1, sm); mark(ctx, gL.li, 1, sm.size); }
  if (t >= gL.words[2].t0) { TXT.draw(ctx, name, pad, b2, { ...hv, size: nameSize }); mark(ctx, gL.li, 2, nameSize); }
  const u = clamp((t - tStrike) / 0.09);
  if (u > 0) rule(ctx, pad - 8, b2 - capN * 0.5 - 8, (TXT.width(name, { ...hv, size: nameSize }) + 16) * EASE.outCubic(u), 16, PAL.tomato);
  if (t >= tStrike) { TXT.draw(ctx, gL.words[3].w, pad, cy + capQ / 2, sm); mark(ctx, gL.li, 3, sm.size); }
  rule(ctx, pad, full - 22 - 6, IW, 10, ink);
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.strokeRect(3, 3, w - 6, Math.max(0, h - 6));
  if (t >= tSlam) {
    const s = KIT.slam(t - tSlam, from, 0.09);
    ctx.save();
    ctx.translate(pad + lead + qw / 2, cy); ctx.rotate(-0.035); ctx.scale(s, s);
    rule(ctx, -qw / 2, -qh / 2, qw, qh, PAL.cheese);
    TXT.draw(ctx, 'QUESO', 0, 0, { ...qs, size: QS, fill: ink, align: 'center', baseline: 'center' });
    mark(ctx, gL.li, 4, QS);
    ctx.restore();
  }
  ctx.restore();
  return { x, y, w, h: full };
}

// Lines 2 and 3: the label unrolls on the cut to s003 over the lower half, holds through the cut to s004 and
// grows there.
SCENE_V({ id: 'v01.label', t0: B(13), t1: B(21), z: Z_GFX, draw(ctx, t) {
  labelV(ctx, t, { grasa: 2, culpa: 3, bar: [18.5, 20.5] });
}});

// ---------------------------------------------------------------- 5. "Mira cómo me lo como"

// One slab per word, as in the film. MIRA and CÓMO stack on the dark wall right of her head, ME, LO and COMO
// stand in a row under her chin. CÓMO throws a copy of itself down the right edge; it lands as COMO and the
// first bite takes the accent. Three more bites on the eighth notes that follow.
const MIRA = [
  { wi: 0, text: 'MIRA', x: 792, y: 448, size: 124, rot: 0.04, bg: PAL.mozz, from: 1.3 },
  { wi: 1, text: 'CÓMO', x: 776, y: 612, size: 124, rot: -0.035, bg: PAL.mozz, from: 1.3 },
  { wi: 2, text: 'ME', x: 150, y: 1332, size: 136, rot: 0.03, bg: PAL.mozz, from: 1.5 },
  { wi: 3, text: 'LO', x: 352, y: 1340, size: 136, rot: -0.04, bg: PAL.mozz, from: 1.5 },
  { wi: 4, text: 'COMO', x: 692, y: 1320, size: 184, rot: -0.04, bg: PAL.cheese, from: 1.5 },
];
SCENE_V({ id: 'v01.mira', t0: B(21), t1: B(24), z: Z_GFX, draw(ctx, t) {
  const land = word(4, 4).t0, from = MIRA[1], to = MIRA[4], eaten = land + 0.125;
  const anton = { font: FACE.caps, size: to.size, tracking: 0.01 };
  const accent = {                                    // where the accent of CÓMO sits on the slab that lands
    x: to.x - TXT.width('COMO', anton) / 2 + TXT.width('C', anton) + 0.01 * anton.size + TXT.width('O', anton) / 2,
    y: to.y - TXT.capH(anton) / 2 - anton.size * 0.1,
  };
  KIT.bitten(ctx, t, g => {
    for (const s of MIRA) KIT.slab(g, t, s.wi === 4 && t < eaten ? 'CÓMO' : s.text, { ...s, li: 4 });
    const u = clamp((t - (land - 0.2)) / 0.2);
    if (u > 0 && u < 1) {                             // the copy in flight: not yet the sung word, so not marked
      const e = EASE.inQuad(u);
      KIT.slab(g, t, 'CÓMO', { x: lerp(from.x, to.x, e) + 150 * Math.sin(Math.PI * e), y: lerp(from.y, to.y, e), size: lerp(from.size, to.size, e), rot: lerp(from.rot, to.rot - TAU, e), bg: PAL.mozz, from: 1 });
    }
  }, [
    { x: accent.x + 5, y: accent.y - 18, r: 48, rot: Math.PI / 2, t: eaten },      // the accent
    { x: from.x + 142, y: from.y + 66, r: 58, rot: -2.4, t: B(23.25) },
    { x: to.x + 205, y: to.y + 96, r: 76, rot: 3.9, t: B(23.5) },
    { x: MIRA[0].x - 134, y: MIRA[0].y - 44, r: 58, rot: 0.6, t: B(23.75) },
  ], 'v01.bite');
}});

// ---------------------------------------------------------------- 6. "Y te mando un beso"

// The napkin lies on the table of the lower part, with the print of the kiss on "beso".
SCENE_V({ id: 'v01.napkin', t0: B(24), t1: B(29), z: Z_GFX, draw(ctx, t) {
  KIT.napkin(ctx, t, 5, { x: 146, y: 852, w: 680 });
}});

// ---------------------------------------------------------------- 7. the couple

// s007: the label stands in the gap right of whoever is in the slice, and stays put while the slice whips.
// He measures everything, her pizza included: plate pixels, as in the film, mapped through the placement.
const TAG_K = 1.4;                                    // his tags, scaled so the chip reads on a phone
function tag(ctx, t, o) {
  const k = TAG_K;
  ctx.save();
  ctx.scale(k, k);
  KIT.hisTag(ctx, t, { ...o, x: o.x / k, y: o.y / k, w: o.w / k, h: o.h / k });
  ctx.restore();
}
const HIS_7 = [
  { box: [505, 1120, 1290, 1455], label: 'PIZZA', kcal: 2310, b: 29.5 },
  { box: [1865, 1140, 2360, 1370], label: 'ENSALADA', kcal: 45, b: 31 },
  { box: [2392, 915, 2625, 1490], label: 'AGUA', kcal: 0, b: 31.5, lead: 46 },
];
SCENE_V({ id: 'v01.his7', t0: SHOT.t0('s007'), t1: SHOT.t1('s007'), z: Z_GFX, draw(ctx, t) {
  const pic = at('s007', t), k = pic.place.dims.w / 2944;
  for (const h of HIS_7) tag(ctx, t, { ...SHOT.box(pic.place, ...h.box.map(v => v * k)), label: h.label, kcal: h.kcal, tIn: B(h.b), chip: 'tl', lead: h.lead || 0 });
  labelSlim(ctx, t, { x: 484, y: 362, w: 440, grasa: 6 });
}});

// ---------------------------------------------------------------- 8. "No me vengas con complejos"

// His diet app speaks up, she answers, the answer is stamped. "No" is sung two frames before the cut to s008,
// so the surface starts there and rides over the cut.
const NOTE = { x: COL.x, y: 1012, w: 640 };
SCENE_V({ id: 'v01.complejos', t0: word(7, 0).t0 - 0.07, t1: B(36), z: Z_GFX, draw(ctx, t) {
  const n = KIT.notice(ctx, t, { ...NOTE, body: ['Meta diaria superada.', 'Sugerencia: ensalada.'], tIn: word(7, 0).t0 - 0.07 });
  const yq = NOTE.y + (n ? n.h : 0) + 8;
  KIT.quote(ctx, t, 7, { who: 'hers', x: COL.x, y: yq, w: COL.w, size: 84, tail: null, hug: false });
  KIT.stamp(ctx, t, { x: NOTE.x + NOTE.w / 2, y: NOTE.y + (n ? n.h : 0) / 2, size: 118, rot: -0.1, tHit: B(35), from: 1.6 });
}});

// ---------------------------------------------------------------- 9. "Tú contando calorías"

// hisPanel(ctx, t, {x, y, w, li, total, digits}): his counter as a column beside his head. The sung line in
// cold mono caps, one word a row, over a seven-segment total.
function hisPanel(ctx, t, o) {
  const { x, y, w = 360, li, total = 0, digits = 4, unit = 'kcal' } = o;
  const L = LYR.line(li), tIn = o.tIn ?? KIT.beatBefore(L.t0);
  if (t < tIn) return null;
  const pad = 30, st = { ...STY.his };
  const size = Math.min(64, ...L.words.map(v => TXT.fit(v.w, { w: w - 2 * pad }, st)));
  const cap = TXT.capH({ ...st, size }), lh = size * 1.24, n = L.words.length;
  const us = { font: FACE.mono, weight: 600, size: 30, fill: PAL.ice }, uw = TXT.width(unit, us);
  const seg = { ...STY.seg, size: Math.min(84, TXT.fit('8'.repeat(digits), { w: w - 2 * pad - uw - 14 }, STY.seg)) };
  const yDig = pad + cap + (n - 1) * lh + 34 + seg.size, h = yDig + pad;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath(); ctx.rect(0, 0, w * EASE.outExpo(clamp((t - tIn) / 0.14)), h); ctx.clip();
  rule(ctx, 0, 0, w, h, PAL.patent);
  ctx.strokeStyle = PAL.ice; ctx.lineWidth = 3; ctx.strokeRect(10, 10, w - 20, h - 20);
  L.words.forEach((v, i) => {
    if (t < v.t0) return;
    TXT.draw(ctx, v.w, pad, pad + cap + i * lh, { ...st, size });
    mark(ctx, li, i, size);
  });
  TXT.draw(ctx, unit, w - pad, yDig, { ...us, align: 'right' });
  const dx = w - pad - uw - 14;
  TXT.draw(ctx, '8'.repeat(digits), dx, yDig, { ...seg, align: 'right', opacity: 0.13 });
  TXT.draw(ctx, String(Math.max(0, Math.round(total))).slice(-digits), dx, yDig, { ...seg, align: 'right' });
  ctx.restore();
  return { x, y, w, h };
}
// Everything he measures is zero, and the total races anyway.
const HIS_9 = [
  { box: [640, 995, 935, 1575], label: 'AGUA', kcal: 0, b: 36.5, chip: 'tr', lead: 26 },
];
SCENE_V({ id: 'v01.his', t0: B(36), t1: B(40), z: Z_GFX, draw(ctx, t) {
  const pic = at('s009', t), k = pic.place.dims.w / 2944;
  for (const h of HIS_9) tag(ctx, t, { ...SHOT.box(pic.place, ...h.box.map(v => v * k)), label: h.label, kcal: h.kcal, tIn: B(h.b), chip: h.chip, lead: h.lead });
  hisPanel(ctx, t, { x: COL.x, y: 392, w: 360, li: 8, total: KIT.race(t, B(36), B(39.5), 0, 2310) });
}});

// ---------------------------------------------------------------- 10. "Yo contando pepperonis"

// The film's ten pepperoni, in its order, on its eighth notes, hidden when her hand is on them (HIDDEN, in
// seconds of the F10 take). The clip's frames are 1282 x 718, a hair wider than 16:9, and the tall frame is
// laid out by their height: PEP_X spreads the pins by that hair so they sit on the pepperoni.
const PEPPERONI = [[1830, 724], [1444, 730], [1500, 486], [1756, 360], [1150, 460], [764, 516], [756, 816], [1020, 820], [1300, 1012], [1570, 992]];
const TAPS = PEPPERONI.map((p, i) => B(40 + i * 0.5));
const HIDDEN = [[[0.12, 0.54], [0.79, 2.12], [2.29, 3.75]], [[0.79, 3.5]], [[2.29, 3.67]], [[2.62, 4.0]], [[2.38, 3.58]], [[3.25, 5.12]], [[1.88, 2.46]], [[1.46, 2.62]], [[1.38, 2.62]], [[1.38, 3.42]]];
const PEP_X = (1282 / 718) / (1920 / 1080), BOX_K = 1.3;
SCENE_V({ id: 'v01.hers', t0: B(40), t1: B(45), z: Z_GFX, draw(ctx, t) {
  const pic = at('s010', t), k = pic.place.dims.w / 2944;
  if (pic.name === 'F10-t1') PEPPERONI.forEach(([px, py], i) => {
    if (HIDDEN[i].some(([a, b]) => pic.lt >= a && pic.lt < b)) return;
    const [x, y] = SHOT.pt(pic.place, 960 + (px * k - 960) * PEP_X, py * k);
    ctx.save();
    ctx.scale(BOX_K, BOX_K);
    KIT.herBox(ctx, t, { x: x / BOX_K, y: y / BOX_K, r: (106 * k * SHOT.scale(pic.place)) / BOX_K, n: i + 1, tIn: TAPS[i] });
    ctx.restore();
  });
  KIT.herCounter(ctx, t, { x: COL.x, y: 1196, w: 660, li: 9, hits: TAPS, tIn: B(40) });
}});

// ---------------------------------------------------------------- 11. the end card

// Beats 45 to 49. The waiters of the next shot keep whispering under a dark veil. QUESO as the label's slab,
// her name under it, then the date and where to hear it in the film's small tracked capitals, and the handle.
const CREDIT = { font: FACE.sans, weight: 700, upper: true, tracking: 0.16, fill: PAL.mozz, align: 'center' };
const CARD = { x: W / 2, y: 650, size: 272, veil: 0.66 };
SCENE_V({ id: 'v01.fin', t0: T_CARD, t1: T_OUT, z: Z_GFX, draw(ctx, t) {
  ctx.save(); ctx.globalAlpha *= CARD.veil; rule(ctx, 0, 0, W, H, PAL.patent); ctx.restore();
  const r = KIT.slab(ctx, t, 'QUESO', { x: CARD.x, y: CARD.y, size: CARD.size, rot: -0.035, from: 1 });
  const yName = CARD.y + r.h / 2 + CARD.size * 0.4;
  if (t >= B(45.5)) TXT.draw(ctx, 'Saindra', CARD.x, yName, { font: FACE.book, italic: true, weight: 500, size: CARD.size * 0.34, fill: PAL.mozz, align: 'center' });
  if (t >= B(46)) TXT.draw(ctx, '14 de octubre', CARD.x, yName + 150, { ...CREDIT, size: 58 });
  if (t >= B(46.5)) {
    TXT.draw(ctx, 'En todas las plataformas', CARD.x, yName + 216, { ...CREDIT, size: 34 });
    TXT.draw(ctx, MARK, CARD.x, yName + 292, { font: FACE.sans, weight: 600, size: 34, tracking: 0.04, fill: PAL.mozz, opacity: 0.85, align: 'center' });
  }
}});
