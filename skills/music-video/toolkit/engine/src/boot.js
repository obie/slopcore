// boot.js: load the project named by ?project= (generated assets, common.js, then every chapter).
//
//   ?project=myvideo           project directory, relative to the repo root
//   &ch=03,07                 load only chapters whose file name starts with one of these prefixes.
//                             Scenes registered with {proof: true} exist only when ch= is given.
//   &look=native              override ENGINE.look
//
// common.js runs as a global script: its top-level declarations are shared with every chapter.
// Each ch/*.js runs inside its own strict-mode function, so chapters cannot collide or leak globals.
'use strict';

(() => {
  const q = new URLSearchParams(location.search);
  const project = (q.get('project') || '').replace(/^\/+|\/+$/g, '');
  const errors = [];
  let current = null;

  window.addEventListener('error', e => {
    errors.push(`${current || e.filename}:${e.lineno}:${e.colno} ${e.message}`);
  });

  const text = async url => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.text();
  };

  // Run source as a script tag so syntax and load-time errors report file, line and column.
  const run = (url, code, wrap) => {
    const s = document.createElement('script');
    s.textContent = (wrap ? "(function(){'use strict';" : '') + code + (wrap ? '\n})();' : '') + `\n//# sourceURL=${url}`;
    const before = errors.length;
    current = url; ENGINE._file = url.split('/').pop();
    document.head.appendChild(s);
    current = null; ENGINE._file = null;
    if (errors.length > before) throw new Error(errors.slice(before).join('\n'));
  };

  ENGINE.ready = (async () => {
    if (!project) throw new Error('index.html needs ?project=<dir>');
    const base = `/${project}/engine`;
    ENGINE.project = project;
    MEDIA.root = `/${project}/media`;

    for (const f of ['beats', 'lyrics', 'plates', 'clips', 'chapters']) run(`${base}/assets/${f}.js`, await text(`${base}/assets/${f}.js`), false);
    BEAT._init(ASSETS.beats);
    LYR._init(ASSETS.lyrics);

    await Promise.all(TXT._loads);
    run(`${base}/common.js`, await text(`${base}/common.js`), false);
    await Promise.all(TXT._loads);

    const only = (q.get('ch') || '').split(',').filter(Boolean);
    ENGINE.picked = only;
    const chapters = ASSETS.chapters.filter(c => !only.length || only.some(p => c.startsWith(p)));
    if (only.length && !chapters.length) throw new Error(`no chapter matches ch=${only.join(',')} (have: ${ASSETS.chapters.join(', ')})`);
    const srcs = await Promise.all(chapters.map(c => text(`${base}/ch/${c}`)));
    chapters.forEach((c, i) => run(`${base}/ch/${c}`, srcs[i], true));

    await Promise.all(TXT._loads);
    await document.fonts.ready;
    if (q.get('look')) ENGINE.look = q.get('look');
    if (!LOOKS[ENGINE.look]) throw new Error(`unknown look "${ENGINE.look}" (have: ${Object.keys(LOOKS).join(', ')})`);
    return { project, chapters, scenes: SCENES.length, skipped: ENGINE.skipped, look: ENGINE.look, fonts: [...TXT.families] };
  })();
  ENGINE.ready.catch(() => {});
})();
