#!/usr/bin/env node
// mj.mjs — Midjourney through the user's signed-in Chrome (via `cdp.mjs serve`, which must be running).
//
//   mj.mjs submit <batch.json> [--gap 9]     type each unsent prompt into the create page and press Enter; a prompt
//                                            counts as sent when the box empties. Then pair job ids (see recover).
//   mj.mjs recover <batch.json>              reload the feed, scroll it, and give every sent job without an id the
//                                            id of the feed row whose prompt text matches (pairing by content)
//   mj.mjs collect <batch.json> <outdir> [--png]   save each finished job's four images as <name>-1..4.jpeg (or .png)
//   mj.mjs status <batch.json>
//
// A batch is {"name": "...", "jobs": [{"name": "a1", "prompt": "... --ar 16:9 --v 8.2", "job_id": null}]}.
// Chrome throttles timers in a tab that has been hidden for five minutes, so the feed in the worker tab stops
// updating live. Nothing here waits on the live feed: ids come from a fresh page load, paired by prompt text.
import fs from 'node:fs'; import net from 'node:net'; import os from 'node:os'; import path from 'node:path'

const SOCK = path.join(os.tmpdir(), 'slopcore-cdp.sock')
const cdp = (...argv) => new Promise((resolve, reject) => { const conn = net.connect(SOCK); let out = ''
  conn.on('connect', () => conn.write(JSON.stringify(argv) + '\n')); conn.on('data', ch => out += ch)
  conn.on('end', () => { const r = JSON.parse(out); r.error ? reject(new Error(r.error)) : resolve(r.ok) })
  conn.on('error', () => reject(new Error('cdp bridge not running: start `node tools/cdp.mjs serve`'))) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ev = (t, js) => cdp('eval', t, js)
const key = (t, type, k, code, extra = {}) => cdp('raw', t, 'Input.dispatchKeyEvent', JSON.stringify({ type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code, ...extra }))
const BOX = `document.querySelector('#desktop_input_bar')`
const norm = s => s.toLowerCase().replace(/\s+/g, ' ').trim()
const body = prompt => norm(prompt.split(' --')[0])
const save = (file, batch) => fs.writeFileSync(file, JSON.stringify(batch, null, 1))

// One worker tab per role in the signed-in profile, reused across runs. Chrome only lets Target.createTarget name
// a profile while that profile's window was the last one used, so when that fails the tab is opened from one of
// the profile's own pages instead.
const WORKER_FILE = role => path.join(os.tmpdir(), role === 'submit' ? 'slopcore-worker-tab.json' : `slopcore-worker-tab-${role}.json`)
async function tab(url, role = 'submit') {
  const pages = async () => (await cdp('raw', '-', 'Target.getTargets')).targetInfos.filter(t => t.type === 'page')
  const mine = await cdp('targets'); if (!mine.length) throw new Error('no signed-in Midjourney/Higgsfield tab found to take the profile from')
  const ctx = mine[0].contextId
  let id = null; try { id = JSON.parse(fs.readFileSync(WORKER_FILE(role), 'utf8')).targetId } catch {}
  if (!id || !(await pages()).some(t => t.targetId === id && t.browserContextId === ctx)) {
    id = null
    for (let i = 0; i < 2 && !id; i++) { try { id = (await cdp('open', 'about:blank', ctx)).targetId } catch { await sleep(1000) } }
    if (!id) { const before = (await pages()).map(t => t.targetId)
      await ev(mine[mine.length - 1].targetId, `(window.open('about:blank','_blank'),1)`); await sleep(1500)
      id = (await pages()).find(t => !before.includes(t.targetId) && t.browserContextId === ctx)?.targetId
      if (!id) throw new Error('could not open a worker tab in the signed-in profile') }
    fs.writeFileSync(WORKER_FILE(role), JSON.stringify({ targetId: id }))
  }
  await cdp('raw', id, 'Emulation.setFocusEmulationEnabled', JSON.stringify({ enabled: true }))
  await cdp('nav', id, url); return id
}
const park = t => cdp('nav', t, 'about:blank').catch(() => {})

// The feed is a virtual list: only a few rows exist at once. Scroll it and collect job id -> row text.
const ROWS = `(()=>{const out=[];const seen=new Set();for(const a of document.querySelectorAll('a[href*="/jobs/"]')){const m=a.getAttribute('href').match(/jobs\\/([0-9a-f-]{36})/);if(!m||seen.has(m[1]))continue;seen.add(m[1]);let row=a;for(let i=0;i<8&&row.parentElement;i++){row=row.parentElement;if(row.innerText&&row.innerText.length>80)break}out.push([m[1],(row.innerText||'').replace(/\\s+/g,' ').slice(0,2500)])}return JSON.stringify(out)})()`
async function feed(t, want) {
  const rows = new Map(); let idle = 0
  for (let step = 0; step < 400 && idle < 8 && rows.size < want; step++) {
    const n = rows.size; for (const [id, text] of JSON.parse(await ev(t, ROWS))) if (!rows.has(id)) rows.set(id, norm(text))
    idle = rows.size === n ? idle + 1 : 0
    await cdp('raw', t, 'Input.dispatchMouseEvent', JSON.stringify({ type: 'mouseWheel', x: 800, y: 600, deltaX: 0, deltaY: 700 })); await sleep(450)
  }
  return rows
}
async function pair(t, file, batch) {
  await cdp('nav', t, 'https://www.midjourney.com/imagine'); await sleep(6000)
  const need = batch.jobs.filter(j => j.sent && !j.job_id); if (!need.length) return
  const rows = await feed(t, need.length + 12); const taken = new Set(batch.jobs.map(j => j.job_id).filter(Boolean))
  for (const job of need) { const b = body(job.prompt)
    const hits = [...rows].filter(([id, text]) => !taken.has(id) && text.includes(b.slice(0, 600)))
    if (hits.length) { job.job_id = hits[hits.length - 1][0]; taken.add(job.job_id); delete job.error   // oldest match; later ones are duplicates
      if (hits.length > 1) job.duplicates = hits.slice(0, -1).map(h => h[0]) }
    console.log(`${job.name} -> ${job.job_id || 'NOT IN FEED'}${hits.length > 1 ? ` (+${hits.length - 1} duplicate)` : ''}`) }
  save(file, batch)
}

async function send(t, job) {
  if (job.prompt.length > 1400) throw new Error('prompt too long')
  await ev(t, `(()=>{const b=${BOX};if(!b)throw new Error('no prompt box');b.focus();b.select();return 1})()`)
  if (await ev(t, `${BOX}.value`)) { await key(t, 'keyDown', 'Backspace', 8); await sleep(300) }
  await cdp('raw', t, 'Input.insertText', JSON.stringify({ text: job.prompt })); await sleep(600)
  const held = await ev(t, `${BOX}.value`)
  if (held.trim() !== job.prompt.trim()) throw new Error(`the box holds ${held.length} chars, expected ${job.prompt.length}; not submitting`)
  await key(t, 'keyDown', 'Enter', 13, { text: '\r' }); await key(t, 'keyUp', 'Enter', 13)
  for (let i = 0; i < 12; i++) { await sleep(1000); if (!(await ev(t, `${BOX}.value`))) return }
  const said = await ev(t, `[...document.querySelectorAll('[role=alert],[role=status],[role=dialog]')].map(e=>e.innerText).join(' | ').slice(0,300)`)
  await ev(t, `(()=>{const b=${BOX};b.focus();b.select();return 1})()`); await key(t, 'keyDown', 'Backspace', 8)
  throw new Error(`not accepted (the prompt stayed in the box). Page says: ${said || 'nothing'}`)
}

async function submit(file, gap) {
  const batch = JSON.parse(fs.readFileSync(file, 'utf8')); const todo = batch.jobs.filter(j => !j.job_id && !j.sent)
  const t = await tab('https://www.midjourney.com/imagine'); await sleep(6000)
  try { let streak = 0
    for (const [n, job] of todo.entries()) {
      try { await send(t, job); job.sent = new Date().toISOString(); delete job.error; streak = 0; console.log(`${job.name} sent`) }
      catch (e) { job.error = e.message; streak++; console.log(`${job.name} FAILED: ${e.message}`) }
      save(file, batch)
      if (streak >= 3) throw new Error('three failures in a row: stopping to look at the page')
      if (n < todo.length - 1) await sleep((gap + (n * 7) % 5) * 1000)
    }
    await sleep(8000); await pair(t, file, batch)
  } finally { await park(t) }
}

async function collect(file, outdir, png) {
  const batch = JSON.parse(fs.readFileSync(file, 'utf8')); fs.mkdirSync(outdir, { recursive: true })
  const ext = png ? 'png' : 'jpeg'; const t = await tab('about:blank', 'collect')
  try {
    for (const job of batch.jobs) { if (!job.job_id) { console.log(`${job.name}: no job id`); continue }
      if ([0, 1, 2, 3].every(k => fs.existsSync(path.join(outdir, `${job.name}-${k + 1}.${ext}`)))) continue
      await cdp('nav', t, `https://cdn.midjourney.com/${job.job_id}/0_0.${ext}`); await sleep(800)
      if (!/^image\//.test(await ev(t, 'document.contentType'))) { console.log(`${job.name}: not ready`); continue }
      for (let k = 0; k < 4; k++) {
        const data = await ev(t, `fetch('https://cdn.midjourney.com/${job.job_id}/0_${k}.${ext}').then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.blob()}).then(b=>new Promise(res=>{const f=new FileReader();f.onload=()=>res(f.result);f.readAsDataURL(b)}))`).catch(() => null)
        if (!data) { console.log(`${job.name}-${k + 1}: missing`); continue }
        fs.writeFileSync(path.join(outdir, `${job.name}-${k + 1}.${ext}`), Buffer.from(data.split(',')[1], 'base64')) }
      console.log(`${job.name}: saved`)
    }
  } finally { await park(t) }
}

const [cmd, file, a] = process.argv.slice(2); const flag = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null }
if (cmd === 'submit') await submit(file, Number(flag('--gap') || 9))
else if (cmd === 'recover') { const batch = JSON.parse(fs.readFileSync(file, 'utf8')); const t = await tab('about:blank'); try { await pair(t, file, batch) } finally { await park(t) } }
else if (cmd === 'collect') await collect(file, a, process.argv.includes('--png'))
else if (cmd === 'status') { for (const j of JSON.parse(fs.readFileSync(file, 'utf8')).jobs) console.log(j.name, j.job_id || (j.sent ? 'sent, no id' : '-'), j.error || '') }
else { const help = !cmd || ['-h', '--help', 'help'].includes(cmd)
  if (help) console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 13).map(l => l.replace(/^\/\/ ?/, '')).join('\n'))
  else console.error('usage: mj.mjs submit|recover|collect|status <batch.json> ...')
  process.exit(help ? 0 : 1) }
