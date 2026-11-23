#!/usr/bin/env python3
"""sume.py: a minimal client for the Sume API (https://api.sume.com/v1), which routes image and video models,
Seedance 2.5 and GPT Image 2.5 among them, at about half Higgsfield's list price.

    sume.py models image|video                       list the model ids the routers take, with $/s for video
    sume.py upload FILE [...]                        upload, print the public URL (cached in <root>/.sume-uploads.json)
    sume.py image OUT.png MODEL "prompt" [--ref FILE|URL ...] [--ar 16:9] [--q high] [--res 2K] [--n 1]
    sume.py video OUT.mp4 MODEL "prompt" [--image FILE|URL] [--end FILE|URL] [--ref FILE|URL ...]
                  [--aref AUDIO ...] [--vref VIDEO ...] [--audio] [--res 720p] [--dur 5] [--ar 16:9] [--draft]
    sume.py video OUT.mp4 MODEL --draft-job JOB_ID   re-render an approved 480p draft at 1080p (same scene)
    sume.py video OUT.mp4 MODEL "" --video CLIP --audio-url VOCAL    lip sync (e.g. sync-lipsync-3)
    sume.py fetch OUT JOB_ID                         wait for a job and download its result

Every generate command takes --dry, which prints the request body and sends nothing.

--image is image-to-video (the picture is frame 1). --ref, --aref and --vref are reference-to-video (@Image1,
@Audio1, @Video1 in the prompt); Sume does not take a first frame together with audio references. --draft makes a
480p Seedance draft (duration required); keep the job id the script writes to OUT.job.json and finalize with
--draft-job once the shot is approved. A lip-sync result also returns a poster image, saved as OUT-1.<ext>.

Key: SUME_API_KEY in the environment or in <root>/.env (root = the folder that holds tools/). It is a model-API key:
/v1/me and /v1/balance answer open_key_route_not_allowed, so read the balance on the website.
Jobs cannot be cancelled once generation has started, and they bill either way.
"""
import argparse, json, os, pathlib, sys, time, urllib.error, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
API = "https://api.sume.com/v1"
CACHE = ROOT / ".sume-uploads.json"
UA = {"User-Agent": "curl/8.0"}   # media.sume.com answers 403 to Python's default User-Agent


def key():
    k = os.environ.get("SUME_API_KEY")
    if not k and (ROOT / ".env").exists():
        k = next((l.split("=", 1)[1].strip() for l in (ROOT / ".env").read_text().splitlines()
                  if l.startswith("SUME_API_KEY=")), "")
    if not k:
        sys.exit("SUME_API_KEY is not set (environment or <root>/.env)")
    return k


def call(method, path, body=None, tries=4):
    for k in range(tries):
        try:
            req = urllib.request.Request(path if path.startswith("http") else API + path, method=method,
                                         data=json.dumps(body).encode() if body is not None else None,
                                         headers={"x-api-key": key(), "Content-Type": "application/json", **UA})
            return json.load(urllib.request.urlopen(req, timeout=120))
        except urllib.error.HTTPError as e:
            sys.exit(f"{method} {path} -> {e.code}: {e.read().decode()[:1500]}")
        except (urllib.error.URLError, ConnectionError, TimeoutError):
            if k == tries - 1: raise
            time.sleep(5 * (k + 1))


def upload(path):
    if path.startswith("http"):
        return path
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    ck = f"{os.path.abspath(path)}:{os.path.getmtime(path)}"
    if ck in cache:
        return cache[ck]
    ctype = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp",
             "mp4": "video/mp4", "wav": "audio/wav", "mp3": "audio/mpeg"}[path.rsplit(".", 1)[-1].lower()]
    data = open(path, "rb").read()
    for attempt in range(5):   # large PUTs sometimes die with a broken pipe; get a fresh URL and retry
        try:
            d = call("POST", "/files/generate-upload-url",
                     {"content_type": ctype, "size_bytes": len(data), "filename": os.path.basename(path)})["data"]
            urllib.request.urlopen(urllib.request.Request(d["upload_url"], data=data, method="PUT",
                                                          headers=d["upload_headers"]), timeout=300)
            break
        except OSError:
            if attempt == 4: raise
            time.sleep(3 * (attempt + 1))
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    cache[ck] = d["public_url"]
    tmp = CACHE.with_suffix(f".{os.getpid()}.tmp"); tmp.write_text(json.dumps(cache, indent=1)); os.replace(tmp, CACHE)   # per-process tmp: parallel jobs raced on one .tmp
    return d["public_url"]


def wait_and_save(jid, out, usage=None):
    print(f"{out}: job {jid} usage={usage}", file=sys.stderr)
    while True:
        st = call("GET", f"/jobs/{jid}/status")["data"]
        status = (st.get("sume_status") or st.get("status") or "").lower()   # status comes back UPPERCASE
        if status in ("completed", "failed", "canceled"):
            break
        time.sleep(st.get("next_poll_after_seconds") or 5)
    if status != "completed":
        full = call("GET", f"/jobs/{jid}")
        sys.exit(f"{out}: {status}: {json.dumps(full.get('data', {}).get('error') or full)[:1500]}")
    res = call("GET", f"/jobs/{jid}/result")["data"]
    arts = res.get("artifacts") or res.get("result", {}).get("artifacts")
    base, ext = os.path.splitext(out)
    for i, a in enumerate(arts):
        src = a["url"]
        dest = out if i == 0 else f"{base}-{i}{os.path.splitext(src.split('?')[0])[1] or ext}"
        open(dest, "wb").write(urllib.request.urlopen(urllib.request.Request(src, headers=UA), timeout=300).read())
        print(dest, src)
    pathlib.Path(f"{base}.job.json").write_text(json.dumps({"job": jid, "result": res}, indent=1))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("cmd", choices=["models", "upload", "image", "video", "fetch"])
    p.add_argument("args", nargs="*")
    for f in ("--ref", "--aref", "--vref"):
        p.add_argument(f, action="append", default=[])
    for f in ("--image", "--end", "--video", "--audio-url", "--draft-job", "--ar", "--q", "--res", "--size"):
        p.add_argument(f)
    p.add_argument("--dur", type=int)
    p.add_argument("--n", type=int)
    p.add_argument("--audio", action="store_true", help="generate sound with the clip (on for anyone who speaks or sings)")
    p.add_argument("--draft", action="store_true", help="480p Seedance draft")
    p.add_argument("--dry", action="store_true", help="print the request body, send nothing")
    a = p.parse_args()

    if a.cmd == "models":
        for m in call("GET", f"/{a.args[0]}-router/models")["data"]["models"]:
            usd = m.get("pricing", {}).get("usd_per_second_by_resolution")
            print(m["id"], " ".join(f"{r} ${v}/s" for r, v in (usd or {}).items()))
        return
    if a.cmd == "upload":
        for f in a.args:
            print(upload(f))
        return
    if a.cmd == "fetch":
        wait_and_save(a.args[1], a.args[0])
        return

    out, model = a.args[0], a.args[1]
    prompt = a.args[2] if len(a.args) > 2 else ""
    up = (lambda f: f) if a.dry else upload
    if a.cmd == "image":
        body = {"model": model, "prompt": prompt, "output_format": "png"}
        if a.ref: body["image_urls"] = [up(r) for r in a.ref]
        for k, v in (("aspect_ratio", a.ar), ("quality", a.q), ("resolution", a.res), ("image_size", a.size), ("num_images", a.n)):
            if v: body[k] = v
        path = "/image-router/generate"
    elif a.draft_job:
        body = {"model": model, "draft_job_id": a.draft_job, "resolution": a.res or "1080p"}
        path = "/video-router/generate"
    else:
        body = {"model": model}
        if prompt: body.update(prompt=prompt, generate_audio=a.audio)
        for k, v in (("image_url", a.image), ("end_image_url", a.end), ("video_url", a.video), ("audio_url", a.audio_url)):
            if v: body[k] = up(v)
        for k, v in (("reference_image_urls", a.ref), ("reference_audio_urls", a.aref), ("reference_video_urls", a.vref)):
            if v: body[k] = [up(u) for u in v]
        for k, v in (("resolution", a.res), ("duration", a.dur), ("aspect_ratio", a.ar)):
            if v: body[k] = v
        if a.draft: body["draft"] = True
        path = "/video-router/generate"
    if a.dry:
        print(json.dumps(body, indent=1))
        return
    sub = call("POST", path, body)["data"]
    wait_and_save(sub["job"]["id"], out, sub.get("usage"))


if __name__ == "__main__":
    main()
