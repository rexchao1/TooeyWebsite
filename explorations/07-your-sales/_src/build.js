// Prerenders the still pictures into the HTML: the hero still (strip and tuned rosette),
// the four dish rosettes, and the favicon. Run: node explorations/07-your-sales/_src/build.js
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dishes, DAYS, WEEKDAYS, holidayIndex, arc, width, coilSvg } from '../sample.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const f = (n) => Math.round(n * 10) / 10;

function vmaxOf(values) {
  const hol = new Set(holidayIndex.map((h) => h.i));
  return Math.max(...values.filter((_, i) => !hol.has(i)));
}

// Tomorrow's stretch of ribbon, just outside the year, at seven days a turn.
function nextSvg(d, g) {
  const [a0, a1, r] = arc(DAYS, 7, g);
  const w = Math.max(width(d.next.length, 7, g), 1.5);
  return `<path class="next" stroke-width="${f(w * 1.6)}" d="M${f(g.cx + Math.cos(a0) * r)} ${f(g.cy + Math.sin(a0) * r)}A${f(r)} ${f(r)} 0 0 1 ${f(g.cx + Math.cos(a1) * r)} ${f(g.cy + Math.sin(a1) * r)}"/>`;
}

// Hero still: the year laid end to end on top, the same year wound to a week below.
function heroStill() {
  const d = dishes.margherita;
  const vmax = vmaxOf(d.values);
  let out = '<g class="ink">';
  const x0 = 20, x1 = 580, base = 90, h = 70;
  const groups = new Map();
  d.values.forEach((v, i) => {
    if (!v) return;
    const w = Math.round((v / vmax) * h * 2) / 2;
    const xa = x0 + ((x1 - x0) * i) / DAYS, xb = x0 + ((x1 - x0) * (i + 1)) / DAYS;
    groups.set(w, (groups.get(w) || '') + `M${f(xa)} ${base}H${f(xb)}`);
  });
  out += [...groups].map(([w, p]) => `<path stroke-width="${w}" d="${p}"/>`).join('');
  out += '</g><text class="cap" x="20" y="164">Laid end to end</text><text class="cap" x="20" y="204">Wound to a week</text><g class="ink">';
  const g = { cx: 300, cy: 480, inner: 44, outer: 250, vmax };
  out += coilSvg(d.values, 7, g) + '</g>';
  out += nextSvg(d, g);
  WEEKDAYS.forEach((w, k) => {
    const a = (2 * Math.PI * (k + 0.5)) / 7 - Math.PI / 2;
    const r = 282;
    out += `<text class="wd" x="${f(g.cx + Math.cos(a) * r)}" y="${f(g.cy + Math.sin(a) * r + 6)}">${w}</text>`;
  });
  return `<svg class="still-art" viewBox="0 0 600 790" role="img" aria-label="Sample data. Above, a year of one dish's daily sales laid end to end, a ribbon as thick as each day's sales, looks like noise. Below, the same ribbon wound seven days to a turn: every weekday lines up into one spoke, thickest on Friday and Saturday. Tomorrow's stretch is marked at the edge.">${out}</svg>`;
}

const withNextValues = (d) => (d.next ? [...d.values, d.next.length] : d.values);
export const glyphGeo = { cx: 0, cy: 0, inner: 14, outer: 96 };
function glyph(d) {
  const g = { ...glyphGeo, vmax: vmaxOf(d.values) };
  return `<svg class="glyph" viewBox="-110 -110 220 220" aria-hidden="true"><g class="ink">${coilSvg(d.values, 7, g, d.firstDay)}</g>${d.next ? nextSvg(d, g) : ''}</svg>`;
}

function favicon() {
  const d = dishes.margherita;
  const g = { cx: 32, cy: 32, inner: 4, outer: 30, vmax: vmaxOf(d.values) };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#5E5A20"/><g fill="none" stroke="#F1EAD2">${coilSvg(d.values, 7, g, DAYS - 182)}</g></svg>\n`;
}

function inject(file, marker, html) {
  const p = join(root, file);
  const src = readFileSync(p, 'utf8');
  const re = new RegExp(`(<!--${marker}-->)[\\s\\S]*?(<!--/${marker}-->)`, 'g');
  if (!src.match(re)) throw new Error(`marker ${marker} missing in ${file}`);
  writeFileSync(p, src.replace(re, `$1${html}$2`));
}

inject('index.html', 'still', heroStill());
for (const key of ['margherita', 'soup', 'tiramisu', 'shortrib']) inject('index.html', `glyph-${key}`, glyph(dishes[key]));
inject('index.html', 'prep-margherita', String(dishes.margherita.next.prep));
inject('index.html', 'prep-soup', String(dishes.soup.next.prep));
inject('index.html', 'prep-tiramisu', String(dishes.tiramisu.next.prep));
writeFileSync(join(root, 'favicon.svg'), favicon());
console.log('built', { margherita: dishes.margherita.next, soup: dishes.soup.next, tiramisu: dishes.tiramisu.next });
