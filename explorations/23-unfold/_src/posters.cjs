// Renders each shot's finished frame from the real scene into ../posters/*.webp.
// These are the stills for reduced motion, no JavaScript and no WebGL.
// Needs the folder served at http://127.0.0.1:5233/explorations/23-unfold/
//   PLAYWRIGHT=/path/to/playwright node _src/posters.cjs
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const base = process.env.UNFOLD_URL || 'http://127.0.0.1:5233/explorations/23-unfold/';
const out = path.join(__dirname, '..', 'posters');
const jobs = [
  ['hero', 'wide', 1400, 1340], ['hero', 'tall', 900, 1125],
  ['prep', 'wide', 1800, 900], ['prep', 'tall', 900, 1125],
  ['line', 'wide', 1800, 900], ['line', 'tall', 900, 1125],
  ['room', 'wide', 1800, 900], ['room', 'tall', 900, 1125],
  ['close', 'wide', 1800, 900], ['close', 'tall', 900, 1125]
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
  await p.goto(base + '?capture');
  await p.waitForFunction(() => document.documentElement.classList.contains('capture-ready'), null, { timeout: 180000 });
  for (const [shot, kind, w, h] of jobs) {
    const url = await p.evaluate(([s, w, h]) => window.__unfold.frame(s, window.__unfold.shots[s], w, h, 'image/webp', 0.8), [shot, w, h]);
    const file = path.join(out, `${shot}-${kind}.webp`);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    console.log(path.basename(file), (fs.statSync(file).size / 1024).toFixed(0) + ' KB');
  }
  await b.close();
})();
