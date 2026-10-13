// Builds the still version of the pass (no JS, reduced motion) and writes it into index.html
// between the TRIPTYCH markers. Run: node explorations/01-margin/_src/triptych.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, '..', 'index.html');

const W = 420, H = 244;
const pan = { x: 12, y: 92, cell: 34, pad: 14, cols: 6, rows: 3 };
pan.w = pan.cols * pan.cell + pan.pad * 2; pan.h = pan.rows * pan.cell + pan.pad * 2;
const bin = { x: 346, y: 158, r: 58 };
const R = 14;
const slot = (i) => { const s = Math.floor(i / 3), k = i % 3; return [pan.x + pan.pad + s * pan.cell + pan.cell / 2, pan.y + pan.pad + k * pan.cell + pan.cell / 2]; };

function defs(p) {
  return `<defs>
  <linearGradient id="${p}rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3F5F6"/><stop offset=".4" stop-color="#C3CACE"/><stop offset=".65" stop-color="#E6EAEC"/><stop offset="1" stop-color="#9AA4AA"/></linearGradient>
  <linearGradient id="${p}well" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#B4BCC0"/><stop offset="1" stop-color="#8F999F"/></linearGradient>
  <linearGradient id="${p}bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F4F5"/><stop offset=".5" stop-color="#B9C1C5"/><stop offset="1" stop-color="#8E989E"/></linearGradient>
  <linearGradient id="${p}cuprim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7F9F9"/><stop offset=".55" stop-color="#D3D9DC"/><stop offset="1" stop-color="#A5AEB3"/></linearGradient>
  <radialGradient id="${p}food" cx=".4" cy=".36" r=".62"><stop offset="0" stop-color="#C07B45"/><stop offset=".55" stop-color="#9C5B32"/><stop offset="1" stop-color="#6F3A1D"/></radialGradient>
  <radialGradient id="${p}shine" cx=".32" cy=".28" r=".35"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="${p}bag" cx=".42" cy=".4" r=".6"><stop offset="0" stop-color="#11161A"/><stop offset=".7" stop-color="#1A2024"/><stop offset="1" stop-color="#2A3237"/></radialGradient>
  <linearGradient id="${p}binrim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5C666C"/><stop offset=".5" stop-color="#3B4449"/><stop offset="1" stop-color="#262D31"/></linearGradient>
  <filter id="${p}soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="${p}softer" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
  <symbol id="${p}cup" viewBox="-16 -16 32 32" overflow="visible">
    <circle cx="1.5" cy="3" r="${R}" fill="#121A1F" opacity=".35" filter="url(#${p}softer)"/>
    <circle r="${R}" fill="url(#${p}cuprim)"/>
    <circle r="${R * 0.82}" fill="url(#${p}food)"/>
    <circle r="${R * 0.86}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".7"/>
    <circle r="${R * 0.84}" fill="url(#${p}shine)"/>
  </symbol>
  <clipPath id="${p}bagclip"><circle cx="${bin.x}" cy="${bin.y}" r="${bin.r - 8}"/></clipPath>
</defs>`;
}

const cup = (p, x, y, s = 1, dark = false) =>
  `<use href="#${p}cup" x="${(x - 16 * s).toFixed(1)}" y="${(y - 16 * s).toFixed(1)}" width="${32 * s}" height="${32 * s}"${dark ? ' style="filter:brightness(.45)"' : ''}/>`;

function rail(p, tickets) {
  let out = '';
  tickets.forEach((t, k) => {
    const x = 16 + k * 44, w = 30, h = 46;
    if (t === 'printed') {
      out += `<g transform="translate(${x} 16)"><rect width="${w}" height="${h}" fill="#FAFAF7" filter="url(#${p}softer)" opacity=".35" transform="translate(1 2)"/><rect width="${w}" height="${h}" fill="#FAFAF7"/>`
        + `<rect x="5" y="9" width="11" height="2" fill="#262C38" opacity=".85"/><rect x="5" y="15" width="20" height="4" fill="#262C38" opacity=".85"/><rect x="5" y="23" width="15" height="2" fill="#262C38" opacity=".85"/><rect x="5" y="28" width="18" height="2" fill="#262C38" opacity=".85"/></g>`;
    } else if (typeof t === 'number') {
      out += `<g transform="translate(${x} 16)" opacity="${t}"><rect width="${w}" height="${h}" fill="#FAFAF7" opacity=".7"/><rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" fill="none" stroke="#fff" stroke-width="1.2"/><rect x="1.75" y="1.75" width="${w - 3}" height="${h - 3}" fill="none" stroke="#1F2A33" stroke-opacity=".2"/></g>`;
    }
  });
  return out + `<rect x="10" y="10" width="400" height="9" rx="4.5" fill="url(#${p}bar)" stroke="#1F2A33" stroke-opacity=".3" stroke-width=".6"/>`;
}

function panel(p, { tickets, inPan = [], sliding = [], inBin = [], line = null }) {
  let s = defs(p);
  s += `<circle cx="${bin.x}" cy="${bin.y + 5}" r="${bin.r}" fill="#18212A" opacity=".35" filter="url(#${p}soft)"/>`;
  s += `<circle cx="${bin.x}" cy="${bin.y}" r="${bin.r}" fill="url(#${p}binrim)"/><circle cx="${bin.x}" cy="${bin.y}" r="${bin.r - 8}" fill="url(#${p}bag)"/>`;
  s += `<g clip-path="url(#${p}bagclip)">${inBin.map(([u, v]) => cup(p, bin.x + u * 40, bin.y + v * 40, 0.62, true)).join('')}</g>`;
  s += `<rect x="${pan.x}" y="${pan.y + 6}" width="${pan.w}" height="${pan.h}" rx="16" fill="#18212A" opacity=".3" filter="url(#${p}soft)"/>`;
  s += `<rect x="${pan.x}" y="${pan.y}" width="${pan.w}" height="${pan.h}" rx="16" fill="url(#${p}rim)" stroke="#1F2A33" stroke-opacity=".35" stroke-width=".7"/>`;
  s += `<rect x="${pan.x + 6}" y="${pan.y + 6}" width="${pan.w - 12}" height="${pan.h - 12}" rx="11" fill="url(#${p}well)" stroke="#fff" stroke-opacity=".6"/>`;
  s += inPan.map((i) => { const [x, y] = slot(i); return cup(p, x, y); }).join('');
  s += sliding.map(([x, y, sc, d]) => cup(p, x, y, sc, d)).join('');
  if (line != null) {
    const x = pan.x + pan.pad + line * pan.cell;
    s += `<line x1="${x}" y1="${pan.y - 6}" x2="${x}" y2="${pan.y + pan.h + 6}" stroke="#2E6B4F" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<text x="${x}" y="${pan.y - 12}" text-anchor="middle" fill="#245740" font-family="Plex Condensed, IBM Plex Sans Condensed, sans-serif" font-weight="600" font-size="19">Tooey's count</text>`;
  }
  s += rail(p, tickets);
  return s;
}

const P = 'printed';
const panels = [
  {
    id: 'sa', cap: 'Too much, you can see.',
    alt: 'Overhead view: the pan still holds prepped cups at close, and the leftovers slide into the bin.',
    body: panel('sa-', {
      tickets: [P, P, P, P, P, P, P, P, P],
      inPan: [0, 1, 2, 3, 4, 5, 7],
      sliding: [[pan.x + pan.w + 6, 150, 0.9, false], [pan.x + pan.w + 30, 176, 0.75, false]],
      inBin: [[-0.3, 0.2], [0.2, -0.25], [0.35, 0.3], [-0.1, -0.45], [0.05, 0.05], [-0.45, -0.1]],
    }),
  },
  {
    id: 'sb', cap: "Too little, you can't.",
    alt: 'Overhead view: the pan is empty, and the last tickets on the rail are blank and fading away. Nothing goes in the bin.',
    body: panel('sb-', { tickets: [P, P, P, P, 1, 0.75, 0.5, 0.28, 0.12] }),
  },
  {
    id: 'sc', cap: 'Closer, not perfect.', sub: "What your sales say you'll sell, plus a little.",
    alt: "Overhead view: a green line marks Tooey's count on the pan. Every ticket printed and one cup is left at close.",
    body: panel('sc-', { tickets: [P, P, P, P, P, P, P, P, P], inPan: [0], line: 4 }),
  },
];

const html = panels.map((p) => `          <div class="still-panel">
            <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${p.id}-alt"><title id="${p.id}-alt">${p.alt}</title>${p.body}</svg>
            <p class="still-cap">${p.cap.replaceAll("'", '\u2019')}</p>${p.sub ? `\n            <p class="still-sub">${p.sub.replaceAll("'", '\u2019')}</p>` : ''}
          </div>`).join('\n');

const src = readFileSync(file, 'utf8');
const out = src.replace(/<!--TRIPTYCH:start-->[\s\S]*<!--TRIPTYCH:end-->/, `<!--TRIPTYCH:start-->\n${html}\n<!--TRIPTYCH:end-->`);
writeFileSync(file, out);
console.log('triptych written', html.length, 'chars');
