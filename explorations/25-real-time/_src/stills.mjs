// Renders the designed stills from the live scene.
// Needs the site served at BASE (python3 -m http.server 5235 --bind 127.0.0.1 from the repo root).
// Usage: node stills.mjs [outDir] [only-view]
// Writes PNGs; convert to WebP with: python3 towebp.py <outDir> ../stills
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5235/explorations/25-real-time/';
const out = process.argv[2] || 'png';
const only = process.argv[3];
fs.mkdirSync(out, { recursive: true });

const SHOTS = [
  ['hero', 'wide', 2000, 952], ['hero', 'tall', 900, 900],
  ['hero', 'wide', 2000, 952, 'pre'], ['hero', 'tall', 900, 900, 'pre'],
  ['prep', 'wide', 1400, 875], ['prep', 'tall', 800, 600],
  ['shifts', 'wide', 1000, 750], ['shifts', 'tall', 800, 600],
  ['growth', 'wide', 1000, 750], ['growth', 'tall', 800, 600],
  ['accuracy', 'wide', 2000, 857], ['accuracy', 'tall', 800, 600],
];

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', e => console.log('pageerror:', e.message));
for (const [view, aspect, w, h, pre] of SHOTS) {
  if (only && only !== view) continue;
  const url = `${BASE}?still=${view}&cam=${aspect}&w=${w}&h=${h}${pre ? '&pre=1' : ''}`;
  await page.goto(url);
  await page.waitForFunction(() => window.__still, null, { timeout: 120000 });
  const data = await page.evaluate(() => window.__still);
  const name = `${view}-${aspect}${pre ? '-pre' : ''}.png`;
  fs.writeFileSync(path.join(out, name), Buffer.from(data.split(',')[1], 'base64'));
  console.log('wrote', name);
}
await browser.close();
