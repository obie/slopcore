#!/usr/bin/env python3
"""serve_tailnet.py <project> [port]: the review pages on this machine's Tailscale address, for a phone (default port 8767).

The same pages as serve.py, bound to the tailnet interface only and limited to /review/... and
/api/feedback/<name>: the review pages, the manifests, the media kept under <project>/review/, and the
votes and notes. Nothing else in the project is reachable, and there are no folder listings. Put (or link)
the media a review shows under <project>/review/ so that it is inside what this serves.

Needs the `tailscale` command and a signed-in tailnet. Anyone on the tailnet can open the pages and vote.
"""
import json, posixpath, re, subprocess, sys
from pathlib import Path
from urllib.parse import unquote, urlsplit
from serve import H, serve

class T(H):
    def allowed(self):
        p = posixpath.normpath(unquote(urlsplit(self.path).path))
        return (p.startswith('/review/') and not p.endswith('/')) or re.fullmatch(r'/api/feedback/[\w-]+', p)
    def do_GET(self): return super().do_GET() if self.allowed() else self.send_error(404)
    def do_HEAD(self): return super().do_HEAD() if self.allowed() else self.send_error(404)
    def do_POST(self): return super().do_POST() if self.allowed() else self.send_error(404)

if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8767
    me = json.loads(subprocess.run(['tailscale', 'status', '--json'], capture_output=True, text=True).stdout)['Self']
    ip = next(a for a in me['TailscaleIPs'] if '.' in a); name = me['DNSName'].rstrip('.')
    print(f'serving {Path(sys.argv[1]).resolve()}/review on http://{name}:{port}/review/<name>  (http://{ip}:{port})', flush=True)
    serve(T, sys.argv[1], ip, port, (ip, name, name.split('.')[0]))
