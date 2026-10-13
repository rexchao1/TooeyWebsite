// Takes the gallery's screenshots of the original site and each exploration.
// Run from the repo root with a static server already on :5173:
//   python3 -m http.server 5173 &
//   node explorations/_gallery/shoot.cjs            (all)
//   node explorations/_gallery/shoot.cjs 03-sandbox (one)
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'shots');
const base = process.env.BASE || 'http://localhost:5173';

const all = ['00-original'].concat(
  fs.readdirSync(root).filter((d) => /^\d\d-/.test(d) && fs.existsSync(path.join(root, d, 'index.html')))
);
const only = process.argv.slice(2);
const sites = only.length ? all.filter((s) => only.includes(s)) : all;

const urlFor = (s) => (s === '00-original' ? `${base}/index.html` : `${base}/explorations/${s}/`);

async function shoot(browser, url, file, opts) {
  const ctx = await browser.newContext({
    viewport: opts.viewport,
    deviceScaleFactor: opts.scale || 1,
    reducedMotion: opts.reduce ? 'reduce' : 'no-preference',
    isMobile: !!opts.mobile,
    hasTouch: !!opts.mobile,
  });
  const page = await ctx.newPage();
  await page.route('**/formsubmit.co/**', (r) => r.abort());
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(opts.wait || 3500);
  if (opts.full) {
    // Walk the page so anything revealed on scroll is on screen once.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: file, type: 'jpeg', quality: 78, fullPage: !!opts.full });
  await ctx.close();
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await playwright.chromium.launch();
  for (const s of sites) {
    const url = urlFor(s);
    await shoot(browser, url, path.join(out, `${s}-desktop.jpg`), { viewport: { width: 1440, height: 900 } });
    await shoot(browser, url, path.join(out, `${s}-phone.jpg`), { viewport: { width: 390, height: 844 }, scale: 2, mobile: true });
    await shoot(browser, url, path.join(out, `${s}-desktop-full.jpg`), { viewport: { width: 1440, height: 900 }, full: true, reduce: true, wait: 1500 });
    await shoot(browser, url, path.join(out, `${s}-phone-full.jpg`), { viewport: { width: 390, height: 844 }, full: true, reduce: true, mobile: true, wait: 1500 });
    console.log('shot', s);
  }
  await browser.close();
})();
