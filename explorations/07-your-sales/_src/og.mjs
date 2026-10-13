// Renders assets/og.png (1200x630 share image) from the built home page's
// hero, using Playwright. Run after build.mjs, with the folder served:
//
//   python3 -m http.server 5207 --bind 127.0.0.1   (from the repo root)
//   node _src/og.mjs
//
// PLAYWRIGHT can point at a Playwright install; the default is the global one
// on the machine this was made on.

import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const here = dirname(fileURLToPath(import.meta.url));
const url = process.env.OG_URL || 'http://127.0.0.1:5207/explorations/07-your-sales/index.html';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await page.goto(url, { waitUntil: 'networkidle' });
await page.addStyleTag({
  content: `
    .site-head, .hero-act, .hero-early, .hero-lead, .hero-card figcaption { display: none !important; }
    body { overflow: hidden; }
    .hero { padding: 0 !important; height: 630px; display: flex; align-items: center; }
    .hero-in { grid-template-columns: 1.05fr 0.95fr !important; gap: 64px !important; padding-inline: 72px !important; max-width: none !important; }
    .hero h1 { font-size: 60px !important; max-width: 12ch; margin-top: 72px; }
    .og-logo { position: absolute; left: 72px; top: 48px; width: 112px; }
  `,
});
await page.evaluate(() => {
  const img = document.createElement('img');
  img.src = 'assets/logo.png';
  img.className = 'og-logo';
  img.alt = '';
  document.body.appendChild(img);
  document.querySelector('.card').classList.add('is-on');
});
await page.waitForTimeout(400);
await page.screenshot({ path: join(here, '..', 'assets', 'og.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('wrote assets/og.png');
