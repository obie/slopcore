#!/usr/bin/env python3
"""hfapi.py — client for Higgsfield's pay-per-generation API (Seedance 2.5). Every submit costs money.

  auth                          confirm the key works (free: GET on an unknown request id; 404 = key ok, 401 = bad key)
  upload FILE [...]             upload, print the public URL; cached by SHA-256 in <project>/shots/uploads.json
  estimate --res 720p --dur 5 [--ar 16:9] [--video-in SECONDS] [--no-api]
                                local formula (list price and at your account's discount, HF_DISCOUNT) plus POST /estimate/<model> (free; for Seedance 2.5 it returns the formula as text, not a number)
  submit --project DIR --clip ID --mode ref|i2v|t2v --prompt-file TXT --dur N --res 720p --max-usd X
         [--ar 16:9] [--image F ...] [--audio F ...] [--video F ...] [--first-frame F] [--last-frame F]
         [--no-audio] [--bitrate standard|high] [--format mp4|mov] [--video-secs S ...] [--again] [--dry-run]
                                upload inputs, check ledger + estimate <= max-usd, submit with an Idempotency-Key,
                                append a line to <project>/shots/ledger-hf.jsonl, print the request id.
                                --dry-run prints the body and estimate and sends nothing (no upload, no API call)
  status REQUEST_ID             one status poll; prints the video URL when completed
  wait REQUEST_ID [--timeout 900]   poll with backoff (2s growing to 10s) until a terminal status
  download REQUEST_ID OUT.mp4   fetch the finished video (the CDN URL is fetched without credentials)
  cancel REQUEST_ID             cancel a still-queued request (refunded); 400 once it is in_progress
  ledger --project DIR          totals: submitted, refunded, net, by resolution

status/wait/cancel/download take an optional --project DIR (default: the project this tool lives in) where
terminal states are written to the ledger. Statuses: queued, in_progress, completed, failed, nsfw, canceled.
failed, nsfw and canceled-while-queued are documented as not charged / refunded, so the ledger marks them refunded.
Key: HF_KEY=<id>:<secret> in <project root>/.env (or HF_API_KEY_ID + HF_API_KEY_SECRET). Never printed.
"""
import argparse, datetime as dt, hashlib, json, math, mimetypes, os, pathlib, random, shutil, subprocess, sys, time, uuid
import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent
API = 'https://api.higgsfield.ai'
MODEL = 'bytedance/seedance-2.5'
PATHS = {'ref': 'reference-to-video', 'i2v': 'image-to-video', 't2v': 'text-to-video'}
DISCOUNT = float(os.environ.get('HF_DISCOUNT', '1.0'))   # fraction of list price the account pays; read it off the billing page
TOK_PER_K = {'480p': 0.0214, '720p': 0.0214, '1080p': 0.0234}   # $ per 1000 tokens
SHORT_SIDE = {'480p': 480, '720p': 720, '1080p': 1080}
ARS = {'16:9': (16, 9), '9:16': (9, 16), '1:1': (1, 1), '4:3': (4, 3), '3:4': (3, 4), '21:9': (21, 9)}
TERMINAL = {'completed', 'failed', 'nsfw', 'canceled'}
REFUNDED = {'failed', 'nsfw', 'canceled'}      # docs: not charged / refunded (canceled only works while queued)
OK_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/wav', 'audio/x-wav', 'video/mp4'}
UPLOAD_TTL_H = 48     # URL lifetime is undocumented ("retention=temporary"); re-upload cached files older than this
LIMITS = {'image_urls': 30, 'video_urls': 10, 'audio_urls': 10}   # 50 items total

_secret = ''

def die(msg, code=1):
    print(f'hfapi: {_scrub(msg)}', file=sys.stderr)
    sys.exit(code)

def _scrub(s):
    s = str(s)
    return s.replace(_secret, '***') if _secret else s

def key():
    global _secret
    env = {}
    p = ROOT / '.env'
    if p.exists():
        for line in p.read_text().splitlines():
            if '=' in line and not line.lstrip().startswith('#'):
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"\'')
    k = env.get('HF_KEY') or os.environ.get('HF_KEY')
    if not k and env.get('HF_API_KEY_ID') and env.get('HF_API_KEY_SECRET'):
        k = f"{env['HF_API_KEY_ID']}:{env['HF_API_KEY_SECRET']}"
    if not k or ':' not in k:
        die(f'no HF_KEY in {p}')
    _secret = k.split(':', 1)[1]
    return k

def call(method, url, *, json_body=None, headers=None, retries=0, timeout=30):
    """Authenticated call against the API. Retries 5xx and network errors with backoff; returns the Response."""
    h = {'Authorization': f'Key {key()}', **(headers or {})}
    if not url.startswith('http'):
        url = API + url
    for i in range(retries + 1):
        try:
            r = requests.request(method, url, json=json_body, headers=h, timeout=timeout)
        except requests.RequestException as e:
            if i == retries:
                die(f'{method} {url}: network error {type(e).__name__}')
        else:
            if r.status_code < 500 or i == retries:
                return r
        time.sleep(min(2 ** i, 10) + random.random())

def detail(r):
    try:
        d = r.json().get('detail', r.text)
    except Exception:
        d = r.text
    return _scrub(str(d)[:500])

HINTS = {400: 'invalid parameters, rejected input, or concurrency limit reached', 401: 'bad credentials',
         403: 'insufficient credits', 404: 'not found', 422: 'validation failed, or idempotency key reused with different parameters',
         423: 'model temporarily blocked', 503: 'model disabled or not ready'}

def check(r, what):
    if r.status_code >= 300:
        die(f'{what}: HTTP {r.status_code} ({HINTS.get(r.status_code, "error")}): {detail(r)}')
    return r

# ---------- cost ----------

def dims(res, ar):
    """Output width, height. Short side = resolution; the long side is rounded to the nearest even number (inferred; 16:9 matches the published prices)."""
    a, b = ARS[ar]
    s = SHORT_SIDE[res]
    if a >= b:
        h, w = s, 2 * round(s * a / b / 2)
    else:
        w, h = s, 2 * round(s * b / a / 2)
    return w, h

def cost(res, dur, ar='16:9', video_in=0.0):
    """(tokens, list price usd, usd at HF_DISCOUNT of list). Video inputs add seconds to the token count and scale the price by 0.6."""
    w, h = dims(res, ar)
    tokens = math.ceil(h * w * (video_in + dur) * 24 / 1024)
    usd = tokens / 1000 * TOK_PER_K[res] * (0.6 if video_in else 1)
    return tokens, usd, usd * DISCOUNT

def selftest():
    for res, per_s in (('480p', 0.2056), ('720p', 0.4622), ('1080p', 1.1372)):
        got = cost(res, 100)[1] / 100
        assert abs(got - per_s) < 0.0005, (res, got, per_s)
    print('cost formula matches the published $/s at 480p, 720p, 1080p')

def api_estimate(mode, body):
    """POST /estimate/<model>/<endpoint>; returns usd float or None. Documented as a pre-flight cost check."""
    r = call('POST', f'/estimate/{MODEL}/{PATHS[mode]}', json_body=body, retries=1)
    if r.status_code >= 300:
        print(f'hfapi: API estimate unavailable (HTTP {r.status_code}: {detail(r)})', file=sys.stderr)
        return None
    j = r.json()
    if j.get('type') == 'description':   # Seedance 2.5 answers with the pricing formula as text, no number
        return None
    try:
        return float(j['usd'])
    except Exception:
        print(f'hfapi: API estimate had an unexpected shape: {_scrub(r.text[:200])}', file=sys.stderr)
        return None

# ---------- uploads ----------

def now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')

def shots(project):
    d = pathlib.Path(project).resolve() / 'shots'
    d.mkdir(parents=True, exist_ok=True)
    return d

def sha256(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for c in iter(lambda: f.read(1 << 20), b''):
            h.update(c)
    return h.hexdigest()

def ctype(p):
    t = mimetypes.guess_type(str(p))[0] or ''
    if t == 'audio/wave':
        t = 'audio/wav'
    if t not in OK_TYPES:
        die(f'{p}: content type {t or "unknown"} not accepted; allowed: {", ".join(sorted(OK_TYPES))}')
    return t

def cache_load(project):
    f = shots(project) / 'uploads.json'
    return f, (json.loads(f.read_text()) if f.exists() else {})

def cached_url(project, p):
    """URL from the cache if the file was uploaded within the TTL, else None."""
    _, c = cache_load(project)
    e = c.get(sha256(p))
    if e:
        age = (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(e['uploaded_at'])).total_seconds() / 3600
        if age < UPLOAD_TTL_H:
            return e['url']
    return None

def upload(project, path):
    p = pathlib.Path(path).resolve()
    if not p.is_file():
        die(f'{path}: no such file')
    url = cached_url(project, p)
    if url:
        return url
    t = ctype(p)
    r = check(call('POST', '/files/generate-upload-url', json_body={'content_type': t}, retries=2), 'generate-upload-url')
    d = r.json()
    with open(p, 'rb') as f:   # PUT goes to storage: presigned URL, upload_headers only, no API credentials
        pr = requests.put(d['upload_url'], data=f, headers=d.get('upload_headers') or {'Content-Type': t}, timeout=600)
    if pr.status_code >= 300:
        die(f'upload PUT of {p.name}: HTTP {pr.status_code}')
    f, c = cache_load(project)
    c[sha256(p)] = {'url': d['public_url'], 'name': p.name, 'content_type': t, 'bytes': p.stat().st_size, 'uploaded_at': now()}
    f.write_text(json.dumps(c, indent=1))
    return d['public_url']

def media_secs(p):
    if not shutil.which('ffprobe'):
        return None
    o = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)],
                       capture_output=True, text=True).stdout.strip()
    return float(o) if o else None

# ---------- ledger ----------

def ledger_path(project):
    return shots(project) / 'ledger-hf.jsonl'

def ledger_read(project):
    """Per-request rows (submit lines) with the latest status event folded in."""
    f = ledger_path(project)
    rows, order = {}, []
    if f.exists():
        for line in f.read_text().splitlines():
            if not line.strip():
                continue
            e = json.loads(line)
            if e.get('event') == 'status':
                if e['request_id'] in rows:
                    rows[e['request_id']]['status'] = e['status']
                    rows[e['request_id']]['refunded'] = e['status'] in REFUNDED
            else:
                e.setdefault('status', 'queued')
                e['refunded'] = e['status'] in REFUNDED
                rows[e['request_id']] = e
                order.append(e['request_id'])
    return [rows[i] for i in order]

def ledger_append(project, obj):
    with open(ledger_path(project), 'a') as f:
        f.write(json.dumps(obj) + '\n')

def record_status(project, rid, status):
    rows = {r['request_id']: r for r in ledger_read(project)}
    if rid in rows and rows[rid]['status'] != status:
        ledger_append(project, {'time': now(), 'event': 'status', 'request_id': rid, 'status': status,
                                'outcome': 'refunded' if status in REFUNDED else status})

# ---------- commands ----------

def cmd_auth(a):
    r = call('GET', f'/requests/{uuid.UUID(int=0)}/status')
    if r.status_code == 404:
        print('key ok (authenticated; unknown request id returned 404 as expected)')
    elif r.status_code == 401:
        die('key rejected (HTTP 401)')
    else:
        die(f'unexpected HTTP {r.status_code}: {detail(r)}')

def cmd_upload(a):
    for f in a.files:
        print(f'{f}\t{upload(a.project, f)}')

def cmd_estimate(a):
    tok, usd, disc = cost(a.res, a.dur, a.ar, a.video_in)
    print(f'{a.res} {a.ar} {a.dur}s' + (f' + {a.video_in}s video in' if a.video_in else '') + f': {tok} tokens ({"x".join(map(str, dims(a.res, a.ar)))})')
    print(f'  formula, list price:        ${usd:.4f}')
    print(f'  formula, at {DISCOUNT:.0%} of list (HF_DISCOUNT): ${disc:.4f}')
    if a.no_api or a.video_in:
        if a.video_in:
            print('  API estimate skipped (video input needs a real uploaded video)')
        return
    body = {'prompt': 'estimate', 'duration': a.dur, 'resolution': a.res, 'aspect_ratio': a.ar}
    u = api_estimate('t2v', body)
    if u is not None:
        print(f'  API estimate (text-to-video): ${u:.4f}')
    else:
        print('  API estimate: endpoint answers with the pricing formula as text only (rates before discount); no number')

def build_body(a, urls):
    """urls: dict of lists of public URLs (or placeholders). Returns the request body for the mode."""
    prompt = pathlib.Path(a.prompt_file).read_text().strip()
    if not prompt and a.mode == 't2v':
        die('t2v needs a non-empty prompt')
    b = {}
    if prompt:
        b['prompt'] = prompt
    b['duration'] = a.dur
    b['resolution'] = a.res
    if a.mode == 'ref':
        for k in ('image_urls', 'video_urls', 'audio_urls'):
            if urls.get(k):
                b[k] = urls[k]
        b['aspect_ratio'] = a.ar
    elif a.mode == 'i2v':
        b['image_url'] = urls['first'][0]
        if urls.get('last'):
            b['end_image_url'] = urls['last'][0]
    else:
        b['aspect_ratio'] = a.ar
    b['generate_audio'] = not a.no_audio
    if a.bitrate:
        b['bitrate_mode'] = a.bitrate
    if a.format:
        b['output_format'] = a.format
    return b

def cmd_submit(a):
    if a.dur < 4 or a.dur > 30:
        die('--dur must be 4..30')
    if a.mode == 't2v' and (a.image or a.audio or a.video or a.first_frame or a.last_frame):
        die('t2v takes no media inputs')
    if a.mode == 'i2v':
        if not a.first_frame:
            die('i2v needs --first-frame')
        if a.image or a.audio or a.video:
            die('i2v takes only --first-frame and --last-frame (use --mode ref for reference media)')
        if a.ar_given:
            die('image-to-video has no aspect_ratio; output framing follows the first frame')
    if a.mode == 'ref':
        if a.first_frame or a.last_frame:
            die('--first-frame/--last-frame are i2v only')
        if not (a.image or a.audio or a.video):
            die('ref needs at least one of --image/--audio/--video')
        if len(a.image) > 30 or len(a.video) > 10 or len(a.audio) > 10 or len(a.image + a.video + a.audio) > 50:
            die('reference limits: 30 images, 10 videos, 10 audio, 50 items total')
    if a.last_frame and a.mode != 'i2v':
        die('--last-frame is i2v only')
    files = {'image_urls': a.image, 'video_urls': a.video, 'audio_urls': a.audio,
             'first': [a.first_frame] if a.first_frame else [], 'last': [a.last_frame] if a.last_frame else []}
    for fs in files.values():
        for f in fs:
            if not pathlib.Path(f).is_file():
                die(f'{f}: no such file')
            ctype(f)
    # seconds of input video drive the price
    vsecs = list(a.video_secs or [])
    if a.video and not vsecs:
        vsecs = [media_secs(f) for f in a.video]
        if any(s is None for s in vsecs):
            die('cannot measure video length (no ffprobe); pass --video-secs for each --video')
    vin = float(sum(vsecs))
    ar = a.ar if a.mode != 'i2v' else '16:9'
    tok, usd, disc = cost(a.res, a.dur, ar, vin)
    print(f'estimate: {tok} tokens, list ${usd:.4f}, after discount ${disc:.4f}' + (' (approx: i2v follows the image aspect)' if a.mode == 'i2v' else ''), file=sys.stderr)

    if a.dry_run:
        urls = {k: [cached_url(a.project, f) or f'<upload:{pathlib.Path(f).name}>' for f in fs] for k, fs in files.items()}
        print(json.dumps({'endpoint': f'{API}/{MODEL}/{PATHS[a.mode]}', 'body': build_body(a, urls)}, indent=1))
        spent = sum(r['estimate_usd'] for r in ledger_read(a.project) if not r['refunded'])
        print(f'dry run: nothing sent. ledger committed ${spent:.4f} + ${usd:.4f} = ${spent + usd:.4f} vs max ${a.max_usd:.2f}'
              f' -> {"OK" if spent + usd <= a.max_usd else "WOULD BE REFUSED"}')
        return

    urls = {k: [upload(a.project, f) for f in fs] for k, fs in files.items()}
    body = build_body(a, urls)
    ep = f'/{MODEL}/{PATHS[a.mode]}'
    # budget: conservative = list price, or the API's own estimate if that is higher
    est = usd
    api = api_estimate(a.mode, body)
    if api is not None:
        print(f'API estimate: ${api:.4f}', file=sys.stderr)
        est = max(est, api)
    rows = ledger_read(a.project)
    spent = sum(r['estimate_usd'] for r in rows if not r['refunded'])
    if spent + est > a.max_usd:
        die(f'budget: ledger ${spent:.4f} + this ${est:.4f} = ${spent + est:.4f} exceeds --max-usd {a.max_usd:.2f}; nothing sent')
    # --again asks for a new take: the key then counts this clip's earlier submissions, so every --again is distinct
    take = sum(1 for r in rows if r.get('clip') == a.clip) if a.again else 0
    ikey = str(uuid.uuid5(uuid.NAMESPACE_URL, json.dumps([a.clip, ep, body, take], sort_keys=True)))
    for r in rows:
        if r.get('idempotency_key') == ikey:
            print(f'already submitted (same clip, endpoint and body): {r["request_id"]}  (use --again to generate a new take)', file=sys.stderr)
            print(r['request_id'])
            return
    r = check(call('POST', ep, json_body=body, headers={'Idempotency-Key': ikey}, retries=2, timeout=60), 'submit')
    d = r.json()
    rid = d['request_id']
    ledger_append(a.project, {'time': now(), 'clip': a.clip, 'request_id': rid, 'mode': a.mode, 'seconds': a.dur + vin,
                              'resolution': a.res, 'aspect_ratio': ar, 'estimate_usd': round(est, 4),
                              'estimate_discounted_usd': round(est * DISCOUNT, 4), 'idempotency_key': ikey,
                              'endpoint': ep, 'status': d.get('status', 'queued'), 'body': body})
    print(rid)

def get_status(rid):
    r = call('GET', f'/requests/{rid}/status', retries=3)
    check(r, 'status')
    return r.json()

def show(d):
    s = d.get('status')
    out = f'{d.get("request_id", "")} {s}'
    if d.get('error'):
        out += f' error={d["error"]}'
    v = (d.get('video') or {}).get('url')
    if v:
        out += f'\n{v}'
    if s in REFUNDED:
        out += f'\n({s}: documented as not charged / refunded; ledger marks it refunded)'
    print(out)

def cmd_status(a):
    d = get_status(a.request_id)
    show(d)
    if d['status'] in TERMINAL:
        record_status(a.project, a.request_id, d['status'])

def cmd_wait(a):
    t0, delay, last = time.time(), 2.0, None
    while True:
        d = get_status(a.request_id)
        if d['status'] != last:
            print(f'[{int(time.time() - t0):>4}s] {d["status"]}', file=sys.stderr)
            last = d['status']
        if d['status'] in TERMINAL:
            record_status(a.project, a.request_id, d['status'])
            show(d)
            sys.exit(0 if d['status'] == 'completed' else 1)
        if time.time() - t0 > a.timeout:
            print(f'timeout after {a.timeout}s; last status {d["status"]} (the job keeps running and is still charged if it completes)', file=sys.stderr)
            sys.exit(2)
        time.sleep(delay + random.uniform(0, 0.5))
        delay = min(delay * 1.5, 10.0)

def cmd_download(a):
    d = get_status(a.request_id)
    if d['status'] != 'completed':
        die(f'status is {d["status"]}, not completed')
    url = (d.get('video') or {}).get('url')
    if not url:
        die('completed but no video.url in the response')
    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(out.suffix + '.part')
    with requests.get(url, stream=True, timeout=120) as r:   # CDN URL: no API credentials
        if r.status_code >= 300:
            die(f'download: HTTP {r.status_code}')
        with open(tmp, 'wb') as f:
            for c in r.iter_content(1 << 20):
                f.write(c)
    tmp.rename(out)
    record_status(a.project, a.request_id, 'completed')
    print(f'{out} ({out.stat().st_size} bytes)')

def cmd_cancel(a):
    r = call('POST', f'/requests/{a.request_id}/cancel')
    if r.status_code == 202:
        print('canceled (queued requests are refunded)')
        record_status(a.project, a.request_id, 'canceled')
    elif r.status_code == 400:
        die('cannot cancel: processing already started')
    else:
        check(r, 'cancel')

def cmd_ledger(a):
    rows = ledger_read(a.project)
    sub = sum(r['estimate_usd'] for r in rows)
    ref = sum(r['estimate_usd'] for r in rows if r['refunded'])
    print(f'{len(rows)} requests: submitted ${sub:.4f} (list-price estimates), refunded ${ref:.4f}, net ${sub - ref:.4f}'
          f' (about ${(sub - ref) * DISCOUNT:.4f} at {DISCOUNT:.0%} of list, HF_DISCOUNT)')
    by = {}
    for r in rows:
        k = r['resolution']
        b = by.setdefault(k, [0, 0.0, 0.0, 0.0])
        b[0] += 1; b[1] += r['seconds']; b[2] += r['estimate_usd']; b[3] += r['estimate_usd'] if r['refunded'] else 0
    for k, (n, s, u, rf) in sorted(by.items()):
        print(f'  {k}: {n} requests, {s:.0f}s, ${u:.4f} submitted, ${rf:.4f} refunded')
    open_ = [r for r in rows if r['status'] not in TERMINAL]
    if open_:
        print(f'  {len(open_)} not yet seen terminal (run status/wait on: {", ".join(r["request_id"] for r in open_)})')

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest='cmd', required=True)
    def add(name, fn, project=True):
        p = sp.add_parser(name)
        p.set_defaults(fn=fn)
        if project:
            p.add_argument('--project', default=str(ROOT))
        return p
    add('auth', cmd_auth, False)
    add('selftest', lambda a: selftest(), False)
    p = add('upload', cmd_upload); p.add_argument('files', nargs='+')
    p = add('estimate', cmd_estimate, False)
    p.add_argument('--res', default='720p', choices=list(SHORT_SIDE)); p.add_argument('--dur', type=int, required=True)
    p.add_argument('--ar', default='16:9', choices=list(ARS)); p.add_argument('--video-in', type=float, default=0.0)
    p.add_argument('--no-api', action='store_true')
    p = add('submit', cmd_submit)
    p.add_argument('--clip', required=True); p.add_argument('--mode', required=True, choices=list(PATHS))
    p.add_argument('--prompt-file', required=True); p.add_argument('--dur', type=int, required=True)
    p.add_argument('--res', default='720p', choices=list(SHORT_SIDE)); p.add_argument('--ar', default=None, choices=list(ARS))
    p.add_argument('--image', action='append', default=[]); p.add_argument('--audio', action='append', default=[])
    p.add_argument('--video', action='append', default=[]); p.add_argument('--video-secs', type=float, action='append')
    p.add_argument('--first-frame'); p.add_argument('--last-frame'); p.add_argument('--no-audio', action='store_true')
    p.add_argument('--bitrate', choices=['standard', 'high']); p.add_argument('--format', choices=['mp4', 'mov'])
    p.add_argument('--max-usd', type=float, required=True); p.add_argument('--again', action='store_true')
    p.add_argument('--dry-run', action='store_true')
    p = add('status', cmd_status); p.add_argument('request_id')
    p = add('wait', cmd_wait); p.add_argument('request_id'); p.add_argument('--timeout', type=int, default=900)
    p = add('download', cmd_download); p.add_argument('request_id'); p.add_argument('out')
    p = add('cancel', cmd_cancel); p.add_argument('request_id')
    p = add('ledger', cmd_ledger)
    a = ap.parse_args()
    if a.cmd == 'submit':
        a.ar_given = a.ar is not None
        a.ar = a.ar or '16:9'
    a.fn(a)

if __name__ == '__main__':
    main()
