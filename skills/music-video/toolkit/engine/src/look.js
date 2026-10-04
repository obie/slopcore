// look.js: the final-look hook. look(ctx, mode) runs once per frame after the last scene.
//
// 'native' leaves the frame as drawn. A project adds a mode in common.js:
//   LOOKS.warm = ctx => { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = '#ffb060'; ctx.fillRect(0, 0, W, H); };
//   ENGINE.look = 'warm';
// A look obeys the same purity rules as a scene. `render.py --look <mode>` overrides ENGINE.look.
'use strict';

const LOOKS = {
  native(ctx) {},
};

function look(ctx, mode = 'native') {
  const f = LOOKS[mode];
  if (!f) throw new Error(`look: unknown mode "${mode}" (have: ${Object.keys(LOOKS).join(', ')})`);
  f(ctx);
}
