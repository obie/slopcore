#!/usr/bin/env node
// cdp.mjs — a small client for the user's running Chrome (remote debugging on 127.0.0.1, port and browser id
// read from Chrome's DevToolsActivePort file). No dependencies: Node's built-in WebSocket.
//
//   cdp.mjs serve                      hold ONE connection open and serve commands on a unix socket (one Chrome prompt)
//   cdp.mjs targets [filter]           list page targets whose url or title matches filter (default: our sites only)
//   cdp.mjs open <url> [contextId]     open a tab (in the given browser context = Chrome profile); prints targetId
//   cdp.mjs nav <targetId> <url>       navigate a tab and wait for load
//   cdp.mjs eval <targetId> <js>       evaluate an expression (awaits promises), print the JSON result
//   cdp.mjs evalfile <targetId> <file> the same, reading the expression from a file
//   cdp.mjs shot <targetId> <png>      screenshot the viewport
//   cdp.mjs close <targetId>           close a tab this tool opened
//   cdp.mjs raw <targetId|-> <Method> [jsonParams]
import fs from 'node:fs'; import net from 'node:net'; import os from 'node:os'; import path from 'node:path'

const SOCK = path.join(os.tmpdir(), 'slopcore-cdp.sock')
const SITES = /midjourney\.com|higgsfield\.ai|chatgpt\.com|openai\.com/

function endpoint() {
  const f = process.env.CHROME_DEVTOOLS_PORT_FILE || path.join(os.homedir(), 'Library/Application Support/Google/Chrome/DevToolsActivePort')
  const [port, wsPath] = fs.readFileSync(f, 'utf8').trim().split('\n')
  return `ws://127.0.0.1:${port}${wsPath}`
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.sessions = new Map()
    ws.addEventListener('message', e => { const m = JSON.parse(e.data); const p = this.pending.get(m.id)
      if (p) { this.pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result) } }) }
  static connect(timeoutMs = 120000) { return new Promise((resolve, reject) => { const ws = new WebSocket(endpoint())
    const t = setTimeout(() => reject(new Error('timed out waiting for Chrome (is there an "Allow remote debugging" prompt to accept?)')), timeoutMs)
    ws.addEventListener('open', () => { clearTimeout(t); resolve(new CDP(ws)) })
    ws.addEventListener('error', e => { clearTimeout(t); reject(new Error('websocket error: ' + (e.message || 'connection refused'))) }) }) }
  send(method, params = {}, sessionId) { const id = ++this.id
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })) }) }
  async session(targetId) { if (!this.sessions.has(targetId)) {
      const { sessionId } = await this.send('Target.attachToTarget', { targetId, flatten: true }); this.sessions.set(targetId, sessionId) }
    return this.sessions.get(targetId) }
}

async function run(c, [cmd, a, b, d]) {
  if (cmd === 'targets') { const re = a ? new RegExp(a, 'i') : SITES
    const { targetInfos } = await c.send('Target.getTargets')
    return targetInfos.filter(t => t.type === 'page' && (re.test(t.url) || (a && re.test(t.title))))
      .map(t => ({ targetId: t.targetId, contextId: t.browserContextId, title: t.title.slice(0, 70), url: t.url.slice(0, 140) })) }
  if (cmd === 'open') { const { targetId } = await c.send('Target.createTarget', { url: a, background: true, ...(b ? { browserContextId: b } : {}) }); return { targetId } }
  if (cmd === 'close') return c.send('Target.closeTarget', { targetId: a })
  if (cmd === 'raw') { const s = a && a !== '-' ? await c.session(a) : undefined; return c.send(b, d ? JSON.parse(d) : {}, s) }
  const s = await c.session(a)
  if (cmd === 'nav') { await c.send('Page.enable', {}, s); const r = await c.send('Page.navigate', { url: b }, s)
    for (let i = 0; i < 60; i++) { const { result } = await c.send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true }, s)
      if (result.value === 'complete') break; await new Promise(r => setTimeout(r, 500)) } return r }
  if (cmd === 'eval' || cmd === 'evalfile') { const expression = cmd === 'eval' ? b : fs.readFileSync(b, 'utf8')
    const r = await c.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }, s)
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value }
  if (cmd === 'shot') { const { data } = await c.send('Page.captureScreenshot', { format: 'png' }, s); fs.writeFileSync(b, Buffer.from(data, 'base64')); return { saved: b } }
  throw new Error('unknown command ' + cmd)
}

const argv = process.argv.slice(2)
if (!argv.length || ['-h', '--help', 'help'].includes(argv[0])) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 13).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(0)
}
if (argv[0] === 'serve') {
  const c = await CDP.connect(); try { fs.unlinkSync(SOCK) } catch {}
  c.ws.addEventListener('close', () => { console.error('chrome closed the connection'); process.exit(1) })
  net.createServer(conn => { let buf = ''; conn.on('data', async ch => { buf += ch; if (!buf.endsWith('\n')) return
      try { conn.end(JSON.stringify({ ok: await run(c, JSON.parse(buf)) }) + '\n') } catch (e) { conn.end(JSON.stringify({ error: e.message }) + '\n') } }) }).listen(SOCK)
  console.log('serving on', SOCK)
} else {
  const viaServer = () => new Promise((resolve, reject) => { const conn = net.connect(SOCK); let out = ''
    conn.on('connect', () => conn.write(JSON.stringify(argv) + '\n')); conn.on('data', ch => out += ch)
    conn.on('end', () => resolve(JSON.parse(out))); conn.on('error', reject) })
  let res; try { res = await viaServer() } catch { const c = await CDP.connect(); try { res = { ok: await run(c, argv) } } catch (e) { res = { error: e.message } } c.ws.close() }
  if (res.error) { console.error('ERROR:', res.error); process.exit(1) }
  console.log(typeof res.ok === 'string' ? res.ok : JSON.stringify(res.ok, null, 1))
}
