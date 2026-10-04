// 99_marca.js: the watermark. One quiet line over the whole film, so a clip cut from it and posted somewhere
// else still says where it came from.
//
// Bottom centre: a repost cropped to a square or to a vertical keeps the middle columns of the frame, and the
// film's own type stays above it (the subtitles end near y 990). Half transparent, with the thin dark edge the
// subtitles have, so it holds on a white tablecloth and on a black bar alike.
// Load it with --ch ...,99. Leave 99 out for a clean master.

const MARK = { text: 'X: @obie', x: 960, y: 1054, size: 28, alpha: 0.55 };
// The news banner in the bridge (chapter 6, beats 199 to 206.5) runs a ticker along the bottom edge. For those
// beats the mark sits at the top centre instead.
const TICKER = [BEAT.t(199), BEAT.t(206.5)], Y_TOP = 46;

SCENE({ id: '99.marca', t0: 0, t1: BEAT.duration, z: 100, draw(ctx, t) {
  ctx.save();
  ctx.globalAlpha = MARK.alpha;
  TXT.draw(ctx, MARK.text, MARK.x, t >= TICKER[0] && t < TICKER[1] ? Y_TOP : MARK.y, { font: FACE.sans, weight: 600, size: MARK.size, tracking: 0.04, fill: PAL.mozz, stroke: PAL.patent, strokeWidth: 4, align: 'center' });
  ctx.restore();
}});
