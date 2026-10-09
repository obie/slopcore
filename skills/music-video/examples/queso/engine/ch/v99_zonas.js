// v99_zonas.js: the platform safe zones, drawn over a vertical cut for checking. A proof chapter: it draws
// only when picked, next to the cut it checks, and never in a film render or a finished vertical render.
//
//   cd engine && VIDEO_PROJECT=queso ../.venv/bin/python render.py sheet 7.77:30.42:16 --cols 8 --w 360 \
//       --size 1080x1920 --ch v01,v99 --out ../queso/media/scratch/vertical/zonas.jpg
//
// TikTok and Reels lay their own interface over the top 220 px, the bottom 480 px and the right-hand 150 px of
// a 1080 x 1920 frame. Those areas are tinted red here, and the rectangle that is left is outlined. Type and
// anything that matters stays inside the outline; footage runs under the tint.

if (W >= H) return;   // a landscape frame has no such zones

const ZONE = { top: 220, bottom: 480, right: 150 };

SCENE({ id: 'v99.zonas', proof: true, t0: 0, t1: BEAT.duration, z: 1000, draw(ctx) {
  const x1 = W - ZONE.right, y0 = ZONE.top, y1 = H - ZONE.bottom;
  ctx.fillStyle = 'rgba(255, 0, 60, 0.3)';
  ctx.fillRect(0, 0, W, y0);
  ctx.fillRect(0, y1, W, H - y1);
  ctx.fillRect(x1, y0, W - x1, y1 - y0);
  ctx.strokeStyle = '#00FFC8'; ctx.lineWidth = 6;
  ctx.strokeRect(3, y0, x1 - 3, y1 - y0);
}});
