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
    .skip, .nav, .hero-lead, .hero-side, .cal-cap, .cal-foot, .record { display: none !important; }
    .cal-grid .last::after { display: none; }
    .cal-note { font-size: 24px !important; margin-top: 14px !important; }
    body { overflow: hidden; }
    .head-in { padding-block: 22px 14px; }
    .hero h1 { font-size: 64px !important; padding-top: 18px !important; grid-column: 2 / span 6 !important; }
    .cal { margin-top: 26px !important; }
    .cal-grid > span { height: 50px !important; }
    .cal-grid .hc { font-size: 26px !important; }
    .cal-grid > span:nth-child(-n+16) { display: none !important; }
  `,
});
await page.evaluate(() => document.querySelector('.cal').classList.add('is-on'));
await page.waitForTimeout(400);
await page.screenshot({ path: join(here, '..', 'assets', 'og.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('wrote assets/og.png');
