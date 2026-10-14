// Writes the static rota boards (no script, reduced motion) into index.html.
// Run from anywhere: node explorations/12-shifts/_src/build-static.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  T0, T1, INK, NIGHTS, FIT, PREP, geom, grid, tide, inkBrick, pencilBrick, growthLine, dayTag, tooeyRow, tooeyHeight,
} from '../js/core.js';

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, '..', 'index.html');

const M = 90;
const ts = Array.from({ length: M + 1 }, (_, i) => T0 + (i * (T1 - T0)) / M);
const inkS = ts.map((t) => (t >= INK.a && t <= INK.b ? 6 : 0));

// One night: the inked fixed rota against the rush, with the pencilled fit over it.
function panel(G, night, { labels, ticks, growth }) {
  const N = ts.map(NIGHTS[night]);
  let out = grid(G, { ticks });
  out += tide(G, ts, N, inkS, { hatch: 1, spill: 1 });
  out += '<g filter="url(#graphite)">';
  if (growth) out += growthLine(G, ts, ts.map(NIGHTS.grow), 1);
  for (const b of FIT[growth ? 'grow' : night]) out += pencilBrick(G, { ...b, labelled: false });
  out += '</g>';
  for (let k = 0; k < 6; k++) out += inkBrick(G, { k, a: INK.a, b: INK.b, alpha: 0.55, labelAlpha: labels ? 1 : 0 });
  out += dayTag(G, night === 'tue' ? 'Tue' : 'Sat', 1, G.compact);
  return out;
}

const label = 'Example rota. On a Tuesday, six people are on for a night that needs about three; on a Saturday, the same six for a night that needs about nine. Pencilled shifts are cut to each night, and a pencilled line shows a fuller Tuesday. Below, Tooey’s inked row shows an example prep count.';

function wide() {
  const W = 960, H = 560, gap = 48;
  const pw = (W - gap) / 2;
  const tH = tooeyHeight(false);
  const left = geom(pw, H - tH - 22, { top: 30 });
  const right = geom(pw, H, { tooeyH: tH, gap: 22, top: 30 });
  let s = `<svg class="board-static wide" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">`;
  s += `<g>${panel(left, 'tue', { labels: true, ticks: true, growth: true })}</g>`;
  s += `<g transform="translate(${pw + gap} 0)">${panel(right, 'sat', { labels: false, ticks: false })}${tooeyRow(right, { nums: PREP.sat })}</g>`;
  return s + '</svg>';
}

function narrow() {
  const W = 400, ph = 300, gap = 34;
  const tH = tooeyHeight(true);
  const H = ph * 2 + gap + tH + 16;
  const top = geom(W, ph, { top: 26, compact: true });
  const bottom = geom(W, ph + tH + 16, { tooeyH: tH, gap: 16, top: 26, compact: true });
  let s = `<svg class="board-static narrow" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">`;
  s += `<g>${panel(top, 'tue', { labels: true, ticks: true, growth: true })}</g>`;
  s += `<g transform="translate(0 ${ph + gap})">${panel(bottom, 'sat', { labels: false, ticks: false })}${tooeyRow(bottom, { nums: PREP.sat })}</g>`;
  return s + '</svg>';
}

let html = readFileSync(file, 'utf8');
const put = (name, body) => {
  const re = new RegExp(`(<!--${name}-->)[\\s\\S]*?(<!--/${name}-->)`);
  html = html.replace(re, `$1\n          ${body}\n          $2`);
};
put('static-wide', wide());
put('static-narrow', narrow());
writeFileSync(file, html);
console.log('static boards written');
