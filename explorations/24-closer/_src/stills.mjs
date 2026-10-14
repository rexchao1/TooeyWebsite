// Renders img/*.webp from stills.html. Needs a server on the exploration folder:
//   python3 -m http.server 5234 --bind 127.0.0.1   (from explorations/24-closer)
//   node _src/stills.mjs [port]
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const img = path.join(here, '..', 'img');
fs.mkdirSync(img, { recursive: true });
const port = process.argv[2] || 5234;
const only = process.argv[3];
const shots = [
  ['guess-saturday', 'hero:guess:saturday', 1280, 720],
  ['tooey-saturday', 'hero:tooey:saturday', 1280, 720],
  ['wall', 'wall:wide', 2400, 800],
  ['wall-prep', 'wall:prep', 800, 600],
  ['wall-shifts', 'wall:shifts', 800, 600],
  ['wall-growth', 'wall:growth', 800, 600],
];
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const info = {};
for (const [name, shot, w, h] of shots) {
  if (only && !name.startsWith(only)) continue;
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('console', m => console.log(name, m.type(), m.text()));
  p.on('pageerror', e => console.log(name, 'ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/_src/stills.html?shot=${shot}&w=${w}&h=${h}`);
  await p.waitForFunction('window.__done === true', null, { timeout: 120000 });
  info[name] = await p.evaluate('window.__info');
  const png = path.join(here, 'out', name + '.png');
  await p.locator('canvas').screenshot({ path: png });
  execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(png)}).convert('RGB').save(${JSON.stringify(path.join(img, name + '.webp'))}, quality=80, method=6)`]);
  await p.close();
  console.log('rendered', name);
}
await b.close();
console.log(JSON.stringify(info, null, 1));
