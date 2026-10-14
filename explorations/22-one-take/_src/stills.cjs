// Renders each beat's still (wide and phone) from the live scene and writes
// them to ../stills. Needs the site served locally:
//   python3 -m http.server 5232 --bind 127.0.0.1   (from the repo root)
//   node stills.cjs [keys...]
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5232/explorations/22-one-take/';
const OUT = path.join(__dirname, '..', 'stills');
const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['0', '1', '2', '3', '4', '5', '5g'];

(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const key of keys) for (const aspect of ['w', 'p']) {
    const p = await b.newPage({ viewport: aspect === 'w' ? { width: 1600, height: 800 } : { width: 720, height: 900 } });
    p.on('pageerror', e => console.log('err', key, e.message));
    p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console', key, m.text()); });
    await p.goto(`${BASE}?still=${key}&aspect=${aspect}`, { waitUntil: "commit", timeout: 300000 });
    await p.waitForFunction('window.__still', null, { timeout: 300000 });
    const data = await p.evaluate('window.__still');
    const buf = Buffer.from(data.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, `${key}-${aspect}.webp`), buf);
    console.log(key, aspect, Math.round(buf.length / 1024) + ' KB');
    await p.close();
  }
  await b.close();
})();
