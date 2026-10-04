# Font licences: Queso project fonts

Every font in this folder is under the SIL Open Font License 1.1. The licence text that shipped with each family sits next to it as `OFL-<family>.txt`. The files were downloaded on 2026-10-03 and renamed. Nothing else about them was changed. The engine's own fonts (Anton, Inter, JetBrains Mono, Playfair Display Italic) are recorded in `/engine/fonts/LICENSES.md`.

| File | Family in code | Job | Copyright | Licence | Licence text | Source |
|---|---|---|---|---|---|---|
| `LibreBaskerville-Variable.ttf` | `FACE.book` = `'Libre Baskerville'` | menu row caps, weights 400 to 700 | Copyright 2012 The Libre Baskerville Project Authors (https://github.com/impallari/Libre-Baskerville) with Reserved Font Name Libre Baskerville | SIL OFL 1.1 | `OFL-LibreBaskerville.txt` | `google/fonts`, `ofl/librebaskerville/LibreBaskerville[wght].ttf` |
| `LibreBaskerville-Italic-Variable.ttf` | `FACE.book` with `italic: true` | film subtitles, menu descriptions, the end-card name, weights 400 to 700 | same | SIL OFL 1.1 | `OFL-LibreBaskerville.txt` | `google/fonts`, `ofl/librebaskerville/LibreBaskerville-Italic[wght].ttf` |
| `Yesteryear-Regular.ttf` | `FACE.script` = `'Yesteryear'` | telenovela titles, one weight | Copyright (c) 2011 by Brian J. Bonislawsky DBA Astigmatic (AOETI) (astigma@astigmatic.com), with Reserved Font Names "Yesteryear" | SIL OFL 1.1 | `OFL-Yesteryear.txt` | `google/fonts`, `ofl/yesteryear/Yesteryear-Regular.ttf` |
| `Caveat-Variable.ttf` | `FACE.hand` = `'Caveat'` | napkin handwriting, weights 400 to 700 | Copyright 2014 The Caveat Project Authors (https://github.com/googlefonts/caveat) | SIL OFL 1.1 | `OFL-Caveat.txt` | `google/fonts`, `ofl/caveat/Caveat[wght].ttf` |
| `DSEG7Classic-Bold.ttf` | `FACE.seg` = `'DSEG7 Classic'` | the seven-segment calculator total, one weight | Copyright (c) 2017, keshikan (http://www.keshikan.net), with Reserved Font Name "DSEG" | SIL OFL 1.1 | `OFL-DSEG.txt` | `keshikan/DSEG` release v0.46, `fonts-DSEG_v046.zip`, `DSEG7-Classic/DSEG7Classic-Bold.ttf` |

`google/fonts` is `https://github.com/google/fonts/tree/main`. The DSEG release is `https://github.com/keshikan/DSEG/releases/tag/v0.46`.

The OFL allows use in a video and bundling in this repository. It forbids selling the font files on their own. Libre Baskerville, Yesteryear and DSEG declare Reserved Font Names, so a modified copy of any of them must take a different name.

All five are registered in `queso/engine/common.js` with `TXT.addFont`. DSEG7 draws digits, minus, colon and point; it has no accented letters, so sung words are never set in it.
