#!/usr/bin/env python3
"""serve.py <project> [port]: the local review server (default port 8765, this machine only).

    http://127.0.0.1:8765/review/<name>     the review page for <project>/review/<name>.json

A review is one manifest, <project>/review/<name>.json:
    {"title": "...", "intro": "...",
     "sections": [{"id", "name", "what", "wide": false,
                   "items": [{"id", "src", "kind": "video"|"image", "label",
                              "title", "details": [{"name", "text"}], "url"}]}]}
`src` is a path under the project. `title`, `details` and `url` are optional. The page saves each vote
(up, fix, down) and note as it is made to <project>/review/<name>.feedback.json:
    {item_id: {"vote": "up"|"fix"|"down"|null, "note": "...", "at": "2026-01-31T12:00:00"}}
Read that file before the next round. Move it to a new name to start a round with empty boxes.

The whole project folder is served, with HTTP Range so video seeks, which is why this binds 127.0.0.1 and
nothing else. Requests whose Host is not this server's own address are refused, and so are writes sent by
another web page (Origin). To review from a phone use serve_tailnet.py, which serves the review folder only.
"""
import json, os, re, sys, threading, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit

PAGE = Path(__file__).resolve().parent.parent / 'review' / 'page.html'
LOCK = threading.Lock()
MAX_BODY = 1 << 20

def write_atomic(f, data):
    tmp = f.with_name(f'.{f.name}.{os.getpid()}.tmp'); tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1)); os.replace(tmp, f)

class H(SimpleHTTPRequestHandler):
    project = None      # Path of the project folder; set by serve()
    hosts = ()          # the Host values this server answers to, lower case, with the port

    def __init__(self, *a, **k): super().__init__(*a, directory=str(self.project), **k)
    def log_message(self, *a): pass
    def list_directory(self, path): return self.send_error(404)

    def refused(self, write=False):
        """True (and a 403 sent) unless the request names this server, and a write does not come from another page."""
        if (self.headers.get('Host') or '').lower() not in self.hosts:
            self.send_error(403, 'unknown Host'); return True
        origin = self.headers.get('Origin')
        if write and origin is not None and urlsplit(origin).netloc.lower() != self.headers['Host'].lower():
            self.send_error(403, 'cross-origin write'); return True
        if any(seg.startswith('.') for seg in unquote(urlsplit(self.path).path).split('/')):
            self.send_error(404); return True
        return False

    def send_body(self, b, ctype, code=200):
        self.send_response(code); self.send_header('Content-Type', ctype); self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

    def send_json(self, obj, code=200): self.send_body(json.dumps(obj, ensure_ascii=False).encode(), 'application/json', code)

    def read_body(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n > MAX_BODY: raise ValueError('body too large')
        d = json.loads(self.rfile.read(n) or b'{}')
        if not isinstance(d, dict): raise ValueError('body must be a JSON object')
        return d

    def do_HEAD(self):
        if not self.refused(): super().do_HEAD()

    def do_GET(self):
        if self.refused(): return
        path = urlsplit(self.path).path
        m = re.fullmatch(r'/review/([\w-]+)/?', path)
        if m: return self.send_body(PAGE.read_text().replace('__NAME__', m.group(1)).encode(), 'text/html; charset=utf-8')
        m = re.fullmatch(r'/api/feedback/([\w-]+)', path)
        if m:
            f = self.project / 'review' / f'{m.group(1)}.feedback.json'
            return self.send_json(json.loads(f.read_text()) if f.exists() else {})
        if 'Range' in self.headers: return self.ranged()
        return super().do_GET()

    def do_POST(self):
        if self.refused(write=True): return
        m = re.fullmatch(r'/api/feedback/([\w-]+)', urlsplit(self.path).path)
        if not m: return self.send_json({'error': 'not found'}, 404)
        try:
            body = self.read_body(); item = str(body['id'])
        except (ValueError, KeyError) as e:
            return self.send_json({'error': str(e)}, 400)
        f = self.project / 'review' / f'{m.group(1)}.feedback.json'
        with LOCK:
            data = json.loads(f.read_text()) if f.exists() else {}
            data[item] = {'vote': body.get('vote'), 'note': str(body.get('note', ''))[:8000], 'at': time.strftime('%Y-%m-%dT%H:%M:%S')}
            write_atomic(f, data)
        return self.send_json({'ok': True})

    def ranged(self):
        path = Path(self.translate_path(self.path))
        m = re.fullmatch(r'bytes=(\d*)-(\d*)', self.headers['Range'].strip())
        if not path.is_file() or not m or not (m.group(1) or m.group(2)): return super().do_GET()
        size = path.stat().st_size; a, b = m.groups()
        start = int(a) if a else max(0, size - int(b)); end = min(int(b), size - 1) if a and b else size - 1
        if start > end:
            self.send_response(416); self.send_header('Content-Range', f'bytes */{size}'); self.end_headers(); return
        length = end - start + 1
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path))); self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}'); self.send_header('Content-Length', str(length)); self.end_headers()
        with open(path, 'rb') as fh:
            fh.seek(start); left = length
            while left > 0:
                chunk = fh.read(min(1 << 20, left))
                if not chunk: break
                try: self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError): break
                left -= len(chunk)

def serve(handler, project, address, port, names):
    """Serve `project` on address:port, answering only to the given host names (each with this port)."""
    handler.project = Path(project).resolve(); handler.hosts = tuple(f'{n}:{port}'.lower() for n in names)
    if not handler.project.is_dir(): sys.exit(f'no such project folder: {handler.project}')
    (handler.project / 'review').mkdir(exist_ok=True)
    ThreadingHTTPServer((address, port), handler).serve_forever()

if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8765
    print(f'serving {Path(sys.argv[1]).resolve()} on http://127.0.0.1:{port}/review/<name>', flush=True)
    serve(H, sys.argv[1], '127.0.0.1', port, ('127.0.0.1', 'localhost'))
