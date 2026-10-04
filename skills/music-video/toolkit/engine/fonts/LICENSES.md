# Font licences

Every font in this folder is under the SIL Open Font License 1.1. The full licence text that shipped with each
family sits next to it as `OFL-<family>.txt`. All four files were downloaded on 2026-10-03 from the
`google/fonts` repository (`https://github.com/google/fonts/tree/main/ofl/<family>`) and renamed. Nothing
else about them was changed.

| File | Family in code | Role | Copyright | Licence | Licence text | Upstream file |
|---|---|---|---|---|---|---|
| `Anton-Regular.ttf` | `FONT.hook` = `'Anton'` | heavy condensed grotesque for hooks, one weight | Copyright 2020 The Anton Project Authors (https://github.com/googlefonts/AntonFont.git) | SIL OFL 1.1 | `OFL-Anton.txt` | `ofl/anton/Anton-Regular.ttf` |
| `Inter-Variable.ttf` | `FONT.sans` = `'Inter'` | clean sans, variable weight 100 to 900 | Copyright 2020 The Inter Project Authors (https://github.com/rsms/inter) | SIL OFL 1.1 | `OFL-Inter.txt` | `ofl/inter/Inter[opsz,wght].ttf` |
| `JetBrainsMono-Variable.ttf` | `FONT.mono` = `'JetBrains Mono'` | monospace for readouts, variable weight 100 to 800 | Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono) | SIL OFL 1.1 | `OFL-JetBrainsMono.txt` | `ofl/jetbrainsmono/JetBrainsMono[wght].ttf` |
| `PlayfairDisplay-Italic-Variable.ttf` | `FONT.serif` = `'Playfair Display'` | high-contrast italic serif, variable weight 400 to 900 | Copyright 2017 The Playfair Display Project Authors (https://github.com/clauseggers/Playfair-Display), with Reserved Font Name "Playfair Display" | SIL OFL 1.1 | `OFL-PlayfairDisplay.txt` | `ofl/playfairdisplay/PlayfairDisplay-Italic[wght].ttf` |

The OFL allows use in a video and bundling in this repository. It forbids selling the font files on their own.
A modified copy of Playfair Display must take a different name, because that family declares a Reserved Font
Name.

To add a font: put the file here or in `<project>/engine/fonts/`, add a row to this table with its licence,
and register it in the project's `common.js` with `TXT.addFont('Family', '/engine/fonts/File.ttf')`.
