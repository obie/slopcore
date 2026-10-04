// 00_timing.js: timing proof for the whole song (0 to 229.12 s). Not part of the final video: a proof scene,
// loaded only when picked with `--ch 00`.
//
// For checking the beat grid and the word times by ear:
//   top left   song time, frame number at 24 fps, section and stanza
//   top right  beat marker: flashes on every beat with the beat index; every fourth beat (index % 4 == 0) flashes
//              larger, in yellow, with a bar across the top of the frame
//   centre     the current stanza. A word is dim until its t0, yellow from t0 to t1, white after t1.
//              Asides are in italic serif. Each line is labelled with its line index and start time.
//   top strip  a line of the previous stanza that is still sounding after the next stanza has begun
//   bottom     the first line of the next stanza, dim; song progress bar
//
// A stanza takes the page 2 s before its first word, or 0.4 s after the previous stanza's last word ends if
// that is later, and never later than its first word.

const HUD = { font: FONT.mono, weight: 500, fill: '#c9ccd6' };
const DIM = '#474a56', LIT = '#ffffff', NOW = PAL.cheese;
const BOX = { x: 250, y: 300, w: 1550, h: 590 };

const pages = SONG.stanzas.map((s, i, all) => {
  const prev = all[i - 1];
  const show = prev ? Math.min(s.t0, Math.max(prev.t1 + 0.4, s.t0 - 2)) : 0;
  const style = L => (L.aside ? { font: FONT.serif, weight: 600, italic: true } : { font: FONT.sans, weight: 800 });
  // one size for the whole stanza: the largest at which its widest line fits and the lines fit the box height
  const n = s.lines.length;
  let size = Math.min(124, BOX.h / (1.3 * (n - 1) + 0.75));
  for (const L of s.lines) size = Math.min(size, TXT.fit(L.words.map(w => w.w).join(' '), { w: BOX.w }, style(L)));
  const lh = size * 1.3, cap = size * 0.73;
  const top = BOX.y + (BOX.h - ((n - 1) * lh + cap)) / 2 + cap;
  return { ...s, show, size, rows: s.lines.map((L, k) => ({ L, y: top + k * lh, style: style(L) })) };
});

const clock = t => {
  const ms = Math.round(t * 1000), m = Math.floor(ms / 60000);
  return `${m}:${((ms - m * 60000) / 1000).toFixed(3).padStart(6, '0')}`;
};

SCENE({
  id: '00.timing',
  proof: true,   // drawn only with --ch 00, so it never stands in for a real chapter at the lyric gate
  t0: 0,
  t1: SONG.duration,
  z: 0,
  draw(ctx, t) {
    ctx.fillStyle = PAL.bg;
    ctx.fillRect(0, 0, W, H);

    let pi = 0;
    while (pi + 1 < pages.length && pages[pi + 1].show <= t) pi++;
    const page = pages[pi], prev = pages[pi - 1], next = pages[pi + 1];

    // beat marker
    const n = BEAT.n(t), since = t - BEAT.t(n), four = ((n % 4) + 4) % 4 === 0;
    const flash = n < 0 ? 0 : since < 0.085 ? 1 : 0.55 * BEAT.pulse(t, 0.32);
    const cx = 1770, cy = 120, r = four ? 92 : 58;
    if (four && flash > 0) {
      ctx.globalAlpha = flash;
      ctx.fillStyle = NOW;
      ctx.fillRect(0, 0, W, 14);
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 92, 0, TAU);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2c2e38';
    ctx.stroke();
    if (flash > 0) {
      ctx.globalAlpha = flash;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fillStyle = four ? NOW : LIT;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    TXT.draw(ctx, 'BEAT', 1650, 84, { ...HUD, size: 30, align: 'right', fill: '#7d8190' });
    TXT.draw(ctx, n < 0 ? '-' : String(n), 1650, 160, { ...HUD, size: 84, weight: 700, align: 'right', fill: four && n >= 0 ? NOW : LIT });
    for (let k = 0; k < 4; k++) {
      const on = n >= 0 && ((n % 4) + 4) % 4 === k;
      ctx.fillStyle = on ? (k === 0 ? NOW : LIT) : '#2c2e38';
      ctx.fillRect(1452 + k * 52, 186, k === 0 ? 44 : 40, 14);
    }

    // clock, frame, section
    TXT.draw(ctx, clock(t), 96, 128, { ...HUD, size: 84, weight: 700, fill: LIT });
    TXT.draw(ctx, `${t.toFixed(3)} s   frame ${Math.round(t * 24)} @24`, 100, 178, { ...HUD, size: 30, fill: '#7d8190' });
    const a = page.lines[0].li, b = page.lines[page.lines.length - 1].li;
    TXT.draw(ctx, page.section.toUpperCase(), 640, 112, { font: FONT.sans, weight: 800, size: 56, fill: NOW, tracking: 0.04 });
    TXT.draw(ctx, `stanza ${page.stanza}   lines ${a}-${b}`, 642, 164, { ...HUD, size: 30, fill: '#7d8190' });

    // a line of the previous stanza that is still sounding
    if (prev) {
      const late = prev.rows.filter(row => t < row.L.t1);
      late.forEach((row, k) => {
        const y = 262 - (late.length - 1 - k) * 60;
        TXT.draw(ctx, `L${row.L.li}`, 100, y, { ...HUD, size: 26, fill: '#7d8190' });
        LY.line(ctx, t, row.L.li, { ...row.style, x: BOX.x, y, w: BOX.w, size: 52, align: 'left', dim: DIM, fill: LIT, active: NOW });
      });
    }

    // the current stanza
    for (const row of page.rows) {
      const L = row.L;
      TXT.draw(ctx, `L${L.li}`, 100, row.y - page.size * 0.32, { ...HUD, size: 30, fill: t >= L.t0 && t < L.t1 ? NOW : '#7d8190' });
      TXT.draw(ctx, L.t0.toFixed(2), 100, row.y, { ...HUD, size: 24, fill: '#5d6170' });
      LY.line(ctx, t, L.li, { ...row.style, x: BOX.x, y: row.y, w: BOX.w, size: page.size, align: 'left', dim: DIM, fill: LIT, active: NOW });
    }

    // next stanza, first line
    if (next) {
      const L = next.lines[0];
      TXT.draw(ctx, `next  L${L.li}  ${L.t0.toFixed(2)}`, 100, 990, { ...HUD, size: 26, fill: '#5d6170' });
      TXT.draw(ctx, L.text, 420, 990, { ...(L.aside ? { font: FONT.serif, weight: 600, italic: true } : { font: FONT.sans, weight: 700 }), size: 40, fill: '#5d6170' });
    }

    // progress bar with a tick at each stanza's first word
    const px = u => 96 + (W - 192) * u;
    ctx.fillStyle = '#2c2e38';
    ctx.fillRect(96, 1036, W - 192, 6);
    ctx.fillStyle = '#5d6170';
    for (const p of pages) ctx.fillRect(px(p.t0 / SONG.duration), 1028, 2, 22);
    ctx.fillStyle = NOW;
    ctx.fillRect(96, 1036, px(t / SONG.duration) - 96, 6);
    ctx.fillRect(px(t / SONG.duration) - 2, 1024, 4, 30);
  },
});
