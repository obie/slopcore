#!/usr/bin/env python3
"""board.py <project> [serve [port]] — the storyboard as one HTML page (<project>/storyboard.html) for review.

Reads shots.json (optional top-level "title" and "intro" strings head the page) and picks.json. Each shot shows its time, lyric, picture, lyric surface, graphics and method, and
the picked plate. Clicking a plate opens it full size; arrow keys step, F flags, and a comment box takes a note.
`serve` runs a local server (default port 8765) so flags and comments are saved to <project>/notes.json as they are
typed (`serve PORT --share` is view-only and serves nothing but the page, the plate images and the notes); opened as a plain file, the page keeps them in the browser only and offers a copy button.
"""
import sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import html, http.server, json, pathlib

P = pathlib.Path(sys.argv[1]).resolve()
HOW = {'L': ('lip-sync', '#c0392b'), 'M': ('motion', '#b9770e'), 'F': ('insert', '#6c7a12'), 'S': ('still', '#566573')}

def build():
    sj = json.loads((P / 'shots.json').read_text()); shots = sj['shots']
    pj = json.loads((P / 'picks.json').read_text()) if (P / 'picks.json').exists() else {}
    picks, edited, new = pj.get('picks', {}), pj.get('edited', {}), set(pj.get('new', []))
    def thumb(p):
        name = p['name']; n = picks.get(name)
        if name in edited: cands = [P / 'mj' / edited[name]]; n = 'fixed'
        elif 'have' in p: cands = [P / f"mj/{p['have']}-{n or 1}.jpeg"]
        else: cands = ([P / f"mj/{p.get('batch', 'plates-01')}/{name}-{n}.jpeg"] if n else []) + [P / f"mj/{p.get('batch', 'plates-01')}/{name}-1.jpeg"]
        for cand in cands:
            if cand.exists(): return (f'<figure><img loading="lazy" class="pl" data-plate="{html.escape(name)}" src="{cand.relative_to(P)}">'
                                      f'<figcaption>{"<u>NEW</u> " if name in new else ""}{html.escape(name)}{" #" + str(n) if n else " (no pick yet)"}<em></em></figcaption></figure>')
        return f'<div class="none">{html.escape(name)}: rendering</div>'
    rows, sec = [], None
    t = lambda x: f"{int(x // 60)}:{x % 60:04.1f}"
    for s in shots:
        if s['section'] != sec:
            sec = s['section']; rows.append(f'<tr class="sec"><td colspan="6">{html.escape(sec)}</td></tr>')
        name, col = HOW[s['how']]
        rows.append(f"<tr class='{'hasnew' if any(p['name'] in new for p in s['plates']) else ''}'><td class='id'>{s['id']}<br><span>{t(s['t0'])}–{t(s['t1'])}</span><br><b style='background:{col}'>{name}</b></td>"
                    f"<td class='pl' data-shot='{s['id']}' data-lyric='{html.escape(s['lyric'], quote=True)}'>{''.join(thumb(p) for p in s['plates'])}</td>"
                    f"<td class='ly'>{html.escape(s['lyric'])}</td><td>{html.escape(s['picture'])}</td><td>{html.escape(s['type'])}</td><td>{html.escape(s['gfx'])}</td></tr>")
    page = PAGE.replace('__TITLE__', html.escape(sj.get('title', P.name))).replace('__INTRO__', html.escape(sj.get('intro', ''))).replace('__N__', str(len(shots))).replace('__ROWS__', ''.join(rows))
    (P / 'storyboard.html').write_text(page); print('wrote', P / 'storyboard.html')

PAGE = r"""<!doctype html><meta charset="utf-8"><title>__TITLE__ storyboard</title><style>
body{font:14px/1.4 -apple-system,Helvetica,sans-serif;background:#141211;color:#eee6dc;margin:24px}
h1{font-size:22px;margin:0 0 4px} p{color:#b8ab9c;margin:0 0 10px;max-width:900px}
table{border-collapse:collapse;width:100%} th{text-align:left;color:#b8ab9c;font-weight:500;padding:6px 10px}
td{padding:8px 10px;border-top:1px solid #2c2825;vertical-align:top} tr.sec td{font-size:17px;font-weight:700;color:#f3c64b;padding-top:26px;border:0}
td.id{white-space:nowrap;font-weight:700} td.id span{font-weight:400;color:#b8ab9c;font-size:12px} td.id b{font-size:11px;font-weight:600;padding:1px 6px;border-radius:3px;color:#fff}
td.ly{font-weight:600;color:#fff;min-width:170px} td.pl{width:250px} td.pl img{width:240px;border-radius:4px;display:block;cursor:zoom-in}
figure{margin:0 0 6px} figcaption{font-size:11px;color:#8f8377} figcaption em{display:block;color:#ff6b5e;font-style:normal;font-size:12px} figcaption u{background:#f3c64b;color:#141211;text-decoration:none;font-weight:700;padding:0 5px;border-radius:3px}
body.onlynew tr:not(.hasnew):not(.sec){display:none}
img.flag{outline:4px solid #e23b2e}
#bar{position:sticky;top:0;z-index:5;background:#141211;padding:8px 0;color:#b8ab9c;font-size:13px} #bar b{color:#e23b2e;font-size:15px}
#bar button{background:#2c2825;color:#eee6dc;border:0;border-radius:4px;padding:4px 10px;margin:0 4px;cursor:pointer} #bar span{margin-left:14px} #saved{color:#7fbf7f}
#lb{display:none;position:fixed;inset:0;background:rgba(8,7,6,.95);z-index:10;flex-direction:column;align-items:center;justify-content:center}
#lb.on{display:flex} #lbimg{max-width:96vw;max-height:80vh;border-radius:4px} #lbcap{margin-top:10px;color:#eee6dc;font-size:15px}
#lbcap span{color:#8f8377} #lbcap i{color:#e23b2e;font-style:normal;font-weight:700}
#note{margin-top:10px;width:min(900px,90vw);font:15px -apple-system,Helvetica,sans-serif;padding:9px 12px;border-radius:6px;border:1px solid #4a433d;background:#1f1c1a;color:#fff}
#hint{margin-top:6px;color:#8f8377;font-size:12px}
.none{width:240px;height:60px;border:1px dashed #4a433d;border-radius:4px;color:#7d7268;font-size:12px;display:flex;align-items:center;justify-content:center}
</style><h1>__TITLE__ — storyboard</h1>
<p>__INTRO__ __N__ shots on the kick grid, one per lyric line.</p>
<div id="bar"><b id="nflag">0</b> with a flag or comment <button id="copy">copy list</button> <button id="onlynew">show only NEW</button> <span id="saved"></span>
<span>click a plate to enlarge · ← → step · F flag · type a comment and press Enter · Esc close</span></div>
<table><tr><th>shot</th><th>plate</th><th>lyric</th><th>picture</th><th>lyric surface</th><th>graphics</th></tr>__ROWS__</table>
<div id="lb"><img id="lbimg"><div id="lbcap"></div><input id="note" placeholder="comment on this plate (saved as you type)" autocomplete="off"><div id="hint">Enter: save and go to the next plate</div></div>
<script>
const allImgs=()=>[...document.querySelectorAll('img.pl')].filter(im=>im.offsetParent!==null);let imgs=[...document.querySelectorAll('img.pl')], lb=document.getElementById('lb'), big=document.getElementById('lbimg'), cap=document.getElementById('lbcap'), note=document.getElementById('note'), saved=document.getElementById('saved');
const served=location.protocol.startsWith('http'); let cur=-1, notes={}, timer=null;
const key=i=>imgs[i].closest('td').dataset.shot+' '+imgs[i].dataset.plate;
const marked=k=>notes[k]&&(notes[k].flag||notes[k].note);
function paint(){imgs.forEach((im,i)=>{const k=key(i);im.classList.toggle('flag',!!marked(k));im.parentElement.querySelector('em').textContent=(notes[k]&&notes[k].note)||''});
  document.getElementById('nflag').textContent=Object.keys(notes).filter(marked).length}
function persist(){paint();clearTimeout(timer);timer=setTimeout(()=>{const body=JSON.stringify(notes,null,1);
  if(served)fetch('/notes',{method:'POST',body}).then(r=>{saved.textContent=r.ok?'saved to notes.json':'SAVE FAILED'}).catch(()=>{saved.textContent='SAVE FAILED'});
  else{localStorage.setItem('storyboard-notes',body);saved.textContent='saved in this browser only'}},250)}
function show(i,d){cur=(i+imgs.length)%imgs.length;let g=0;while(imgs[cur].offsetParent===null&&g++<imgs.length)cur=(cur+(d||1)+imgs.length)%imgs.length;const im=imgs[cur],td=im.closest('td'),k=key(cur);big.src=im.src;
  cap.innerHTML='<b>'+td.dataset.shot+'</b> · '+im.dataset.plate+' · '+td.dataset.lyric+(notes[k]&&notes[k].flag?' · <i>FLAGGED</i>':'')+' <span>('+(cur+1)+' of '+imgs.length+')</span>';
  note.value=(notes[k]&&notes[k].note)||'';lb.classList.add('on');im.scrollIntoView({block:'center'})}
function close(){lb.classList.remove('on');cur=-1;note.blur()}
function flag(){const k=key(cur);notes[k]=notes[k]||{};notes[k].flag=!notes[k].flag;if(!marked(k))delete notes[k];persist();show(cur)}
note.addEventListener('input',()=>{const k=key(cur);notes[k]=notes[k]||{};notes[k].note=note.value;if(!marked(k))delete notes[k];persist()});
imgs.forEach((im,i)=>im.addEventListener('click',()=>show(i)));
lb.addEventListener('click',e=>{if(e.target===lb)close()});
document.addEventListener('keydown',e=>{if(cur<0)return;const typing=document.activeElement===note;
  if(e.key==='Escape'){typing?note.blur():close()}
  else if(e.key==='Enter'&&typing){note.blur();show(cur+1)}
  else if(typing)return;
  else if(e.key==='ArrowRight')show(cur+1);else if(e.key==='ArrowLeft')show(cur-1,-1);else if(e.key==='f'||e.key==='F')flag()});
document.getElementById('onlynew').onclick=e=>{const on=document.body.classList.toggle('onlynew');e.target.textContent=on?'show all':'show only NEW'};
document.getElementById('copy').onclick=()=>navigator.clipboard.writeText(Object.keys(notes).filter(marked).sort().map(k=>k+': '+(notes[k].note||'flagged')).join('\n'));
(served?fetch('/notes').then(r=>r.json()):Promise.resolve(JSON.parse(localStorage.getItem('storyboard-notes')||'{}'))).then(n=>{notes=n||{};paint()}).catch(()=>paint());
</script>"""

SHARE = '--share' in sys.argv   # view-only: the page, the plate images and the notes; nothing else in the project

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(P), **k)
    def log_message(self, *a): pass
    def do_GET(self):
        path = self.path.split('?')[0]
        ok_img = path.startswith(('/mj/', '/media/plates/')) and path.endswith(('.jpeg', '.jpg'))
        ok_vid = path.startswith('/media/render/pilot/') and path.endswith('.mp4')
        if SHARE and ('..' in path or not (path in ('/', '/storyboard.html', '/review.html', '/notes') or ok_img or ok_vid)):
            self.send_error(404); return
        if SHARE and path == '/': self.path = '/review.html'
        if path.endswith('.mp4'): return self.send_ranged(P / path.lstrip('/'))
        if self.path == '/notes':
            f = P / 'notes.json'; body = f.read_bytes() if f.exists() else b'{}'
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
        else: super().do_GET()
    def send_ranged(self, f):
        """mp4 with byte ranges: phones will not play a video from a server that ignores Range."""
        if not f.is_file(): self.send_error(404); return
        size = f.stat().st_size; a, b = 0, size - 1; rng = self.headers.get('Range', '')
        if rng.startswith('bytes='):
            x, _, y = rng[6:].partition('-'); a = int(x) if x else max(0, size - int(y)); b = int(y) if x and y else size - 1; b = min(b, size - 1)
        self.send_response(206 if rng else 200); self.send_header('Content-Type', 'video/mp4'); self.send_header('Accept-Ranges', 'bytes')
        if rng: self.send_header('Content-Range', f'bytes {a}-{b}/{size}')
        self.send_header('Content-Length', str(b - a + 1)); self.end_headers()
        with open(f, 'rb') as fh: fh.seek(a); self.wfile.write(fh.read(b - a + 1))

    def do_POST(self):
        if SHARE: self.send_error(403); return
        if self.path != '/notes': self.send_error(404); return
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        json.loads(body); (P / 'notes.json').write_bytes(body)
        self.send_response(200); self.send_header('Content-Length', '2'); self.end_headers(); self.wfile.write(b'ok')

build()
if len(sys.argv) > 2 and sys.argv[2] == 'serve':
    port = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].isdigit() else 8765
    print(f'http://127.0.0.1:{port}/storyboard.html  (notes -> {P / "notes.json"})', flush=True)
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
