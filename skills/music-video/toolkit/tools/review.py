#!/usr/bin/env python3
"""review.py <project> — a phone-friendly review page (<project>/review.html): the latest clips cut against the song,
then the plates marked NEW in picks.json. Served by `board.py <project> serve PORT --share` at / .

Clips come from media/render/pilot/*.mp4 (make them with `clips.py <project> preview`). review.json may hold
{"order": [...], "captions": {"<file stem>": "text"}, "intro": "text"} to order and caption them, and
"choose": [{"title", "note", "images": [[path under the project, label], ...]}] for candidates the producer picks from;
"title" sets the page heading (default: the project folder name).
"""
import sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import html, json, pathlib, time
P = pathlib.Path(sys.argv[1]).resolve()
cfg = json.loads((P / 'review.json').read_text()) if (P / 'review.json').exists() else {}
pj = json.loads((P / 'picks.json').read_text()); shots = json.loads((P / 'shots.json').read_text())['shots']
vids = sorted((P / 'media/render/pilot').glob('*.mp4'), key=lambda f: -f.stat().st_mtime)
order = cfg.get('order') or [v.stem for v in vids]; vids = [v for o in order for v in vids if v.stem == o]
TITLE = cfg.get('title', P.name)
cap = cfg.get('captions', {}); v = int(time.time())
vid_html = ''.join(f'<figure><video controls playsinline loop preload="metadata" src="media/render/pilot/{f.name}?v={v}"></video><figcaption><b>{html.escape(f.stem)}</b> {html.escape(cap.get(f.stem, ""))}</figcaption></figure>' for f in vids)
choose = ''.join(f'<h2>{html.escape(c["title"])}</h2><p>{html.escape(c.get("note", ""))}</p>' + ''.join(f'<figure><img loading="lazy" src="{src}?v={v}"><figcaption><b>{html.escape(lab)}</b></figcaption></figure>' for src, lab in c['images']) for c in cfg.get('choose', []))
new = []
for s in shots:
    for p in s['plates']:
        if p['name'] in pj.get('new', []): new.append(f'<figure><img loading="lazy" src="media/plates/{p["name"]}.jpg?v={v}"><figcaption><b>{s["id"]}</b> {html.escape(p["name"])} · {html.escape(s["lyric"])}</figcaption></figure>')
page = f"""<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(TITLE)} review</title><style>
body{{font:16px/1.45 -apple-system,Helvetica,sans-serif;background:#141211;color:#eee6dc;margin:0;padding:14px;max-width:900px;margin:auto}}
h1{{font-size:22px;margin:6px 0}} h2{{font-size:17px;color:#f3c64b;margin:26px 0 8px}} p{{color:#b8ab9c;margin:4px 0 12px}}
figure{{margin:0 0 18px}} video,img{{width:100%;border-radius:8px;display:block;background:#000}} figcaption{{font-size:14px;color:#b8ab9c;margin-top:6px}} figcaption b{{color:#fff}}
a{{color:#f3c64b}}</style>
<h1>{html.escape(TITLE)} — review</h1><p>{html.escape(cfg.get('intro', ''))}</p>
{choose}<h2>Clips, cut against the song</h2>{vid_html or '<p>none yet</p>'}
<h2>Plates changed since your last look</h2>{''.join(new) or '<p>none</p>'}
<p><a href="storyboard.html">Full storyboard</a> (built for a wide screen)</p>"""
(P / 'review.html').write_text(page); print('wrote', P / 'review.html', '|', len(vids), 'clips,', len(new), 'plates')
