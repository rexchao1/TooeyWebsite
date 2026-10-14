// Builds index.html and privacy.html for explorations/18-hospitable.
// Run: node _src/build.mjs   (from the 18-hospitable folder)
// The drawings are generated here so the wide and narrow hero share one model.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..');

const INK = '#24180F';
const RED = '#AE3317';     // china marker
const TAPE = '#EEDFB4';
const DELI = '#FCFBF7';
const FOOD = {
  braise: ['#93401F', '#B4613A'],
  risotto: ['#E3AE4A', '#F0CB7A'],
  soup: ['#7A9443', '#9DB466'],
};

// ---------- hand helpers ----------
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const jit = (a) => (rnd() * 2 - 1) * a;
const f = (n) => Math.round(n * 10) / 10;

// a line with a slight bow, as a pen would make it
function wob(x1, y1, x2, y2, amt = 2.5) {
  const mx = (x1 + x2) / 2 + jit(amt), my = (y1 + y2) / 2 + jit(amt);
  return `M${f(x1)} ${f(y1)} Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`;
}

// single-stroke handwritten digits in a 20 x 30 box
const DIGITS = {
  0: 'M10 1 C3 1 1 9 1 15 C1 23 4 29 10 29 C16 29 19 22 19 15 C19 7 16 1 9 2',
  1: 'M4 7 L11 1 L11 29',
  2: 'M2 8 C3 2 9 0 13 2 C18 5 17 11 13 16 L2 29 L19 28',
  3: 'M2 5 C6 0 16 0 16 7 C16 12 11 14 7 14 C13 14 18 17 18 22 C18 29 7 31 2 26',
  4: 'M14 29 L14 1 L1 20 L19 20',
  5: 'M17 1 L4 1 L3 13 C7 10 14 10 17 15 C20 21 16 29 9 29 C6 29 3 27 2 25',
  6: 'M15 2 C8 1 2 9 2 19 C2 26 6 29 10 29 C15 29 18 25 18 20 C18 14 14 12 10 12 C6 12 3 15 2 19',
  7: 'M1 2 L19 2 L8 29',
  8: 'M10 14 C4 13 3 8 4 5 C5 2 8 1 10 1 C14 1 16 3 16 6 C16 10 13 13 10 14 C5 15 2 18 2 22 C2 26 6 29 10 29 C15 29 18 26 18 22 C18 17 14 15 10 14',
  9: 'M17 10 C17 4 13 1 10 1 C5 1 2 4 2 9 C2 14 6 16 10 16 C14 16 17 13 17 10 L16 29',
};
function number(n, x, y, s = 1, color = RED, w = 3.2) {
  return String(n).split('').map((d, i) =>
    `<path class="pen" pathLength="1" d="${DIGITS[d]}" transform="translate(${f(x + i * 23 * s)} ${f(y)}) scale(${s}) rotate(${f(jit(3))} 10 15)" stroke="${color}" stroke-width="${f(w / s)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  ).join('');
}

function tapePath(w, h) {
  const t = 4, pts = [];
  pts.push([0, 0]);
  for (let i = 1; i < 5; i++) pts.push([w + (i % 2 ? t : -1) + jit(1), (h * i) / 5]);
  pts.splice(1, 0, [w, 0 + jit(1)]);
  pts.push([w, h]);
  pts.push([0, h + jit(1)]);
  for (let i = 4; i > 0; i--) pts.push([(i % 2 ? -t : 1) + jit(1), (h * i) / 5]);
  return 'M' + pts.map(([a, b]) => `${f(a - w / 2)} ${f(b - h / 2)}`).join(' L') + ' Z';
}

// Catmull-Rom through points, as cubic Beziers
function smooth(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

// ---------- the deli quart ----------
// level: fraction of height the food reaches (0 = empty)
function quart(o) {
  const { id, cx, base, w, h, food, level, tape, fs = 21, cushion, tapeAt = 0.42 } = o;
  const top = base - h, hw = w / 2, bw = w * 0.43;
  const half = (y) => bw + (hw - bw) * ((base - y) / h);
  const body = `M${f(cx - hw)} ${f(top + 6)} L${f(cx - bw)} ${f(base - 6)} Q${f(cx)} ${f(base + 10)} ${f(cx + bw)} ${f(base - 6)} L${f(cx + hw)} ${f(top + 6)}`;
  const clip = `<clipPath id="${id}-clip"><path d="${body} Q${f(cx)} ${f(top + 18)} ${f(cx - hw)} ${f(top + 6)} Z"/></clipPath>`;
  const ly = base - h * level;
  const lyR = Math.min(ly, base - 4);
  let foodG = '';
  if (food) {
    const [deep, light] = FOOD[food];
    foodG = `<g clip-path="url(#${id}-clip)"><g class="fill" data-level="${f(base - lyR)}">
      <rect x="${f(cx - hw - 4)}" y="${f(lyR)}" width="${f(w + 8)}" height="${f(base - lyR + 14)}" fill="${deep}"/>
      <ellipse class="surface" cx="${f(cx)}" cy="${f(lyR)}" rx="${f(half(lyR))}" ry="9" fill="${light}" stroke="${INK}" stroke-width="2"/>
    </g></g>`;
  }
  // ridges on the side, like the moulded fill lines on a real quart
  let ridges = '';
  for (let i = 1; i <= 3; i++) {
    const y = top + 30 + i * 14;
    ridges += `<path d="${wob(cx + half(y) - 22, y, cx + half(y) - 6, y + 1, 1)}" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".55"/>`;
  }
  let tapeG = '';
  if (tape) {
    const tw = w * 0.86, th = fs * 3.55, rot = tape.rot ?? jit(3);
    const nameY = -th / 2 + fs * 1.25;
    const num = tape.num != null
      ? number(tape.num, -tw / 2 + 12, -th / 2 + fs * 1.55, fs / 20)
      : `<path class="pen" pathLength="1" d="${wob(-tw / 2 + 14, -th / 2 + fs * 2.4, -tw / 2 + 14 + fs * 1.5, -th / 2 + fs * 2.35, 1.5)}" stroke="${RED}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
    tapeG = `<g class="tape" transform="translate(${f(cx)} ${f(top + h * tapeAt)}) rotate(${f(rot)})">
      <path d="${tapePath(tw, th)}" fill="${TAPE}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      <g class="write"><text x="${f(-tw / 2 + 12)}" y="${f(nameY)}" class="hand" font-size="${fs}" fill="${INK}">${tape.name}</text></g>
      ${num}
    </g>`;
    if (tape.note) {
      tapeG += `<g class="note"><text x="${f(cx)}" y="${f(top + h * tapeAt + th / 2 + fs * 1.3)}" text-anchor="middle" class="hand" font-size="${f(fs * 0.7)}" fill="${INK}">${tape.note}</text></g>`;
    }
  }
  return `<g class="quart" id="${id}" style="transform-origin:${f(cx)}px ${f(base)}px">
    <defs>${clip}</defs>
    <ellipse cx="${f(cx + 6)}" cy="${f(base + 3)}" rx="${f(bw + 10)}" ry="7" fill="${INK}" opacity=".13"/>
    <path d="${body} Q${f(cx)} ${f(top + 18)} ${f(cx - hw)} ${f(top + 6)} Z" fill="#fff" opacity=".3"/>
    ${foodG}
    ${cushion || ''}
    <path d="${wob(cx - hw + 14, top + 26, cx - bw + 12, base - 22, 3)}" stroke="#fff" stroke-width="5" opacity=".55" fill="none" stroke-linecap="round"/>
    ${ridges}
    <path d="${body}" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <ellipse cx="${f(cx)}" cy="${f(top + 6)}" rx="${f(hw + 3)}" ry="11" fill="none" stroke="${INK}" stroke-width="3"/>
    <path d="M${f(cx - hw - 2)} ${f(top + 13)} Q${f(cx)} ${f(top + 32)} ${f(cx + hw + 2)} ${f(top + 13)}" fill="none" stroke="${INK}" stroke-width="2"/>
    ${tapeG}
  </g>`;
}

// ---------- the ticket spike ----------
function spike({ cx, base, tip, n = 5 }) {
  let tickets = '';
  for (let i = 0; i < n; i++) {
    const y = base - 70 - i * 15, r = jit(9);
    let rows = '';
    for (let k = 0; k < 4; k++) {
      const ry = -26 + k * 13;
      rows += `<path d="${wob(-24, ry, -24 + 20 + rnd() * 26, ry + jit(1), 1)}" stroke="${INK}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    }
    tickets += `<g class="ticket"><g transform="translate(${f(cx + jit(5))} ${f(y)}) rotate(${f(r)})">
      <path d="M-34 -46 L34 -46 L34 42 L28 47 L22 42 L16 47 L10 42 L4 47 L-2 42 L-8 47 L-14 42 L-20 47 L-26 42 L-34 46 Z" fill="${DELI}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-34 -34 L34 -34" stroke="${INK}" stroke-width="1.5"/>
      ${rows}
      <path d="${wob(14, 28, 26, 28, 1)}" stroke="${RED}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="${f(-6)}" r="3" fill="${INK}"/>
    </g></g>`;
  }
  return `<g class="spike">
    <ellipse cx="${cx + 5}" cy="${base + 3}" rx="50" ry="7" fill="${INK}" opacity=".13"/>
    <path d="M${cx - 40} ${base} Q${cx} ${base - 18} ${cx + 40} ${base} Z" fill="${INK}"/>
    <path d="M${cx} ${base - 8} L${cx} ${tip}" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
    ${tickets}
  </g>`;
}

function sky(cx, cy, r = 26) {
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rays += `<path class="ray pen" pathLength="1" d="${wob(cx + Math.cos(a) * (r + 9), cy + Math.sin(a) * (r + 9), cx + Math.cos(a) * (r + 21), cy + Math.sin(a) * (r + 21), 1.5)}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  return `<g class="sky">
    <g class="moon"><path d="M${cx + 8} ${cy - r} A${r} ${r} 0 1 0 ${cx + r} ${cy + 6} A${r * 0.8} ${r * 0.8} 0 1 1 ${cx + 8} ${cy - r} Z" fill="${DELI}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>
    <g class="sun"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${FOOD.risotto[1]}" stroke="${INK}" stroke-width="3"/>${rays}</g>
  </g>`;
}

const counter = (x1, x2, y) => `<path d="M${x1} ${y} L${x2} ${y} L${x2} ${y + 60} L${x1} ${y + 60} Z" fill="${INK}" opacity=".07"/>
  <path class="counter" d="${wob(x1, y, (x1 + x2) / 2, y + 1.5, 1)} ${wob((x1 + x2) / 2, y + 1.5, x2, y, 1).replace('M', 'L')}" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;

const DISHES = [
  { name: 'Short rib', num: 19, food: 'braise', level: 19 / 30 },
  { name: 'Risotto', num: 24, food: 'risotto', level: 24 / 30 },
  { name: 'Soup', num: 14, food: 'soup', level: 14 / 30 },
  { name: 'Special', num: null, food: null, level: 0, note: 'new this week' },
];

function heroWide() {
  seed = 11;
  const qs = DISHES.map((d, i) => quart({
    id: `qw${i}`, cx: 425 + i * 200, base: 418, w: 156, h: 236, food: d.food, level: d.level,
    tape: { name: d.name, num: d.num, note: d.note }, fs: 21,
  })).join('');
  return `<svg class="stage stage--wide" viewBox="0 28 1200 472" role="img" aria-labelledby="hero-art-t">
    <title id="hero-art-t">Yesterday's order tickets on a spike, then four deli quarts on the counter, labelled with an example count and filled to it. The special is new this week, so its quart has a dash and stays empty.</title>
    <g class="art" filter="url(#boil-h)">
      ${counter(20, 1180, 420)}
      ${sky(1112, 84)}
      ${spike({ cx: 170, base: 418, tip: 205 })}
      ${qs}
      <text x="1176" y="476" text-anchor="end" class="hand ex" font-size="19" fill="${INK}">example</text>
    </g>
  </svg>`;
}

function heroNarrow() {
  seed = 11;
  const pos = [[298, 350], [492, 350], [200, 700], [410, 700]];
  const qs = DISHES.map((d, i) => quart({
    id: `qn${i}`, cx: pos[i][0], base: pos[i][1], w: 178, h: 240, food: d.food, level: d.level,
    tape: { name: d.name, num: d.num, note: d.note }, fs: 27,
  })).join('');
  return `<svg class="stage stage--narrow" viewBox="0 0 600 770" aria-hidden="true">
    <g class="art" filter="url(#boil-h)">
      ${counter(10, 590, 352)}
      ${counter(10, 590, 702)}
      ${sky(530, 52, 24)}
      ${spike({ cx: 92, base: 350, tip: 96 })}
      ${qs}
      <text x="584" y="756" text-anchor="end" class="hand ex" font-size="25" fill="${INK}">example</text>
    </g>
  </svg>`;
}

// ---------- prep: expect vs make ----------
function prepArt() {
  seed = 23;
  const base = 470, unit = 15, cx = 190, w = 250, h = 360;
  const yExp = base - 17 * unit, yMake = base - 19 * unit;
  const hw = w / 2, bw = w * 0.43;
  const half = (y) => bw + (hw - bw) * ((base - y) / h);
  const cushion = `<g clip-path="url(#pq-clip)"><g class="cushion">
      <rect x="${cx - hw}" y="${yMake}" width="${w}" height="${yExp - yMake}" fill="url(#hatch)"/>
      <ellipse class="surface" cx="${cx}" cy="${yMake}" rx="${f(half(yMake))}" ry="9" fill="${FOOD.braise[1]}" stroke="${INK}" stroke-width="2"/>
    </g></g>`;
  const big = quart({ id: 'pq', cx, base, w, h, food: 'braise', level: 17 / 24, tape: { name: 'Short rib', num: 19, rot: -2 }, fs: 26, cushion, tapeAt: 0.7 });
  // surface for the final make level, moved by JS
  const ticks = [5, 10, 15, 20].map((c) => {
    const y = base - c * unit;
    return `<path d="${wob(cx + half(y) - 22, y, cx + half(y) - 5, y, 0.6)}" stroke="${INK}" stroke-width="2" fill="none"/>`;
  }).join('');
  const lx = cx + hw + 34;
  const small = quart({ id: 'ps', cx: 548, base, w: 120, h: 180, food: null, level: 0, tape: { name: 'Special', num: null, rot: 3 }, fs: 21 });
  return `<svg class="prep-art" viewBox="0 64 640 456" role="img" aria-labelledby="prep-art-t">
    <title id="prep-art-t">A quart of short rib, example only. It fills to 17, what we expect to sell, then a hatched layer tops it up to 19, how many to make. Beside it a quart for the special has a dash on its label and stays empty.</title>
    <defs><pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <rect width="9" height="9" fill="${FOOD.braise[1]}"/><path d="M0 0 L0 9" stroke="${FOOD.braise[0]}" stroke-width="3"/></pattern></defs>
    <g class="art" filter="url(#boil-p)">
      ${counter(10, 630, 472)}
      ${big}
      ${ticks}
      <path class="lvl lvl-exp pen" pathLength="1" d="${wob(cx - hw + 4, yExp, lx + 6, yExp, 1)}" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path class="lvl lvl-make pen" pathLength="1" d="${wob(cx - hw + 2, yMake, lx + 6, yMake, 1)}" stroke="${RED}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <g class="lab lab-make"><text x="${lx + 14}" y="${yMake + 8}" class="hand" font-size="31" fill="${RED}">make 19</text></g>
      <g class="lab lab-exp"><text x="${lx + 14}" y="${yExp + 22}" class="hand" font-size="27" fill="${INK}">expect 17</text></g>
      ${small}
      <text x="634" y="510" text-anchor="end" class="hand ex" font-size="20" fill="${INK}">example</text>
    </g>
  </svg>`;
}

// ---------- coming: drawn on order-pad sheets, inked but not coloured in ----------
function sheet(inner, rot, id, title) {
  let rules = '';
  for (let y = 78; y < 380; y += 30) rules += `<path d="M28 ${y} L492 ${y}" stroke="#C9BDA6" stroke-width="1"/>`;
  return `<svg class="sheet" viewBox="0 0 520 420" role="img" aria-labelledby="${id}-t">
    <title id="${id}-t">${title}</title>
    <g transform="rotate(${rot} 260 210)">
      <path d="M22 26 L498 22 L500 398 L24 402 Z" fill="${INK}" opacity=".12" transform="translate(5 6)"/>
      <path d="M22 26 L498 22 L500 398 L24 402 Z" fill="${DELI}" stroke="${INK}" stroke-width="1.5"/>
      ${rules}
      <path d="M22 54 L498 52" stroke="${INK}" stroke-width="1.5" opacity=".5"/>
      <g class="art" filter="url(#boil-${id})">${inner}</g>
      <path d="${tapePath(96, 30)}" transform="translate(40 26) rotate(-34)" fill="${TAPE}" stroke="${INK}" stroke-width="1.2" opacity=".96"/>
      <path d="${tapePath(96, 30)}" transform="translate(482 24) rotate(31)" fill="${TAPE}" stroke="${INK}" stroke-width="1.2" opacity=".96"/>
    </g>
  </svg>`;
}

function shiftsArt() {
  seed = 41;
  const X = (hr) => 70 + (hr - 17) * 78; // 5pm .. 10pm
  const axisY = 352;
  const hill = smooth([[17, 262], [18, 210], [19, 150], [20, 112], [21, 140], [21.5, 200], [22, 236]].map(([t, y]) => [X(t), y]));
  const bars = [
    [17, 22, 'grill'], [17, 22, 'floor'], [18, 22, 'bar'], [18, 21.5, ''], [19, 21.25, ''], [19.4, 21, ''],
  ];
  const bh = 24;
  const barsSvg = bars.map(([a, b, lab], i) => {
    const y = axisY - 14 - (i + 1) * (bh + 5) + bh / 2;
    const x1 = X(a) + 3, x2 = X(b) - 3, cy = y;
    return `<g class="bar" style="transform-origin:${f((x1 + x2) / 2)}px ${f(cy)}px"><g transform="rotate(${f(jit(1.2))} ${f((x1 + x2) / 2)} ${f(cy)})">
      <path d="${tapePath(x2 - x1, bh)}" transform="translate(${f((x1 + x2) / 2)} ${f(cy)})" fill="none" stroke="${INK}" stroke-width="2"/>
      ${lab ? `<text x="${f(x1 + 9)}" y="${f(cy + 6)}" class="hand" font-size="17" fill="${INK}">${lab}</text>` : ''}
    </g></g>`;
  }).join('');
  const inner = `
    <path class="pen hill" pathLength="1" d="${hill}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="pen" pathLength="1" d="${wob(X(17) - 10, axisY, X(22) + 10, axisY, 1)}" stroke="${INK}" stroke-width="2.6" fill="none"/>
    ${[17, 18, 19, 20, 21, 22].map((t) => `<path d="M${X(t)} ${axisY - 5} L${X(t)} ${axisY + 6}" stroke="${INK}" stroke-width="2"/>`).join('')}
    <text x="${X(17)}" y="${axisY + 30}" text-anchor="middle" class="hand" font-size="18" fill="${INK}">5pm</text>
    <text x="${X(21)}" y="${axisY + 30}" text-anchor="middle" class="hand" font-size="18" fill="${INK}">9pm</text>
    ${barsSvg}`;
  return sheet(inner, -1.6, 'sh', 'A sketch, not yet built: the shape of a busy evening rising to a peak around eight, with shift strips for grill, floor and bar stacked under it, more of them where the night is busiest.');
}

function growthArt() {
  seed = 57;
  const tables = [[130, 140], [260, 132], [390, 140], [130, 290], [260, 298], [390, 290]];
  const seatedAtStart = { 0: [0, 2], 4: [1, 3] };
  const fillOrder = [[1, [0, 1, 2, 3]], [3, [0, 1, 2]], [2, [0, 1, 2, 3]], [5, [1, 2, 3]], [0, [1, 3]], [4, [0, 2]]];
  const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  let s = '';
  tables.forEach(([x, y], t) => {
    s += `<circle cx="${x}" cy="${y}" r="38" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
    dirs.forEach(([dx, dy], k) => {
      const cx = x + dx * 54, cy = y + dy * 54;
      const w = dx ? 12 : 26, h = dx ? 26 : 12;
      s += `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="5" fill="none" stroke="${INK}" stroke-width="2"/>`;
      const start = (seatedAtStart[t] || []).includes(k);
      const later = fillOrder.findIndex(([tt, ks]) => tt === t && ks.includes(k));
      if (start || later >= 0) {
        s += `<circle class="${start ? 'plate plate--start' : 'plate plate--new'}" data-step="${start ? -1 : later}" cx="${x + dx * 22}" cy="${y + dy * 22}" r="10" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
      }
    });
  });
  const inner = `
    <text x="100" y="45" class="hand" font-size="21" fill="${INK}">Tue</text>
    ${s}
    <path class="pen loop" pathLength="1" d="M${390 - 6} ${140 - 72} C${390 + 70} ${140 - 76} ${390 + 84} ${140 + 60} ${390 + 6} ${140 + 74} C${390 - 70} ${140 + 80} ${390 - 84} ${140 - 50} ${390 - 18} ${140 - 70}" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <g class="lab back"><text x="300" y="45" class="hand" font-size="19" fill="${INK}">back again</text></g>`;
  return sheet(inner, 1.4, 'gr', 'A sketch, not yet built: a dining room from above on a Tuesday. Only two tables have guests at first, then plates appear at most tables, and one table is circled as regulars back again.');
}

// ---------- page shell ----------
const filters = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  ${['h', 'p', 'sh', 'gr'].map((k) => `<filter id="boil-${k}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="${k === 'h' || k === 'p' ? 2.6 : 2.2}" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('')}
</defs></svg>`;

const head = (title, desc) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/besley.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.classList.add('js');setTimeout(function(){var s=document.querySelector('.stage-wrap');if(s)s.classList.add('ready')},2500)</script>
</head>`;

const header = (home) => `<header class="top">
  <div class="wrap top__in">
    <a class="brand" href="${home ? '#top' : 'index.html'}"><img src="logo.png" alt="Tooey" width="343" height="148"></a>
    <button class="menu" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav id="nav" class="nav" aria-label="Main">
      <a href="${home ? '' : 'index.html'}#prep">Prep</a>
      <a href="${home ? '' : 'index.html'}#next">What's next</a>
      <a href="${home ? '' : 'index.html'}#start">Start</a>
      <a class="btn btn--small" href="${home ? '' : 'index.html'}#join">Join the free pilot</a>
    </nav>
  </div>
</header>`;

const footer = `<footer class="foot">
  <div class="wrap foot__in">
    <p>Tooey LLC</p>
    <p><a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a></p>
    <p><a href="privacy.html">Privacy</a></p>
  </div>
</footer>`;

const index = `${head('Tooey', 'Tooey minds the back end of your restaurant. It starts with prep: every night it reads the day\'s sales and emails how much of each dish to make. Free pilot.')}
<body id="top">
<a class="skip" href="#main">Skip to content</a>
${filters}
${header(true)}
<main id="main">
  <section class="hero" aria-labelledby="h1">
    <div class="wrap hero__words">
      <h1 id="h1">Tooey minds the back end, so you can look after the people.</h1>
      <div class="hero__side">
        <p class="lead">Make more, manage less. It starts with prep: every night Tooey reads the day’s sales and emails how much of each dish to make.</p>
        <a class="btn" href="#join">Join the free pilot</a>
      </div>
    </div>
    <div class="wrap stage-wrap">
      ${heroWide()}
      ${heroNarrow()}
    </div>
  </section>

  <section class="prep" id="prep" aria-labelledby="prep-h">
    <div class="wrap prep__in">
      <div class="prep__words">
        <h2 id="prep-h">In your inbox before prep.</h2>
        <p>For each dish: what we expect to sell, and a prep count a little over. Too new or too slow to call? A blank, and why.</p>
      </div>
      <div class="prep__art">${prepArt()}</div>
    </div>
  </section>

  <section class="next" id="next" aria-labelledby="next-h">
    <div class="wrap">
      <div class="next__head">
        <h2 id="next-h">What we’re building next.</h2>
        <p>Prep is live today. Shifts and growth are still being built, so they’re pinned up, not coloured in yet.</p>
      </div>
      <div class="next__grid">
        <article class="plan">
          ${shiftsArt()}
          <h3>The right people on.</h3>
          <p>Shifts matched to how busy the night will be.</p>
        </article>
        <article class="plan">
          ${growthArt()}
          <h3>Fuller slow nights.</h3>
          <p>Quiet Tuesdays filled, and regulars coming back.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="start" id="start" aria-labelledby="start-h">
    <div class="wrap start__in">
      <div class="start__steps">
        <h2 id="start-h">Start with a free pilot.</h2>
        <ol class="steps">
          <li>We set up a nightly download from your POS. It works with most systems.</li>
          <li>Tooey needs about five weeks of past sales. Setup takes about a week.</li>
          <li>You check the counts against what sold, then decide.</li>
        </ol>
        <p class="team">We’re a small team of university students. Write to <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>.</p>
      </div>
      <form class="form" id="join" action="https://formsubmit.co/tooeyteam@gmail.com" method="POST" novalidate aria-labelledby="form-h">
        <h3 id="form-h" class="form__h">Join the free pilot</h3>
        <input type="hidden" name="_subject" value="New Tooey inquiry">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_captcha" value="false">
        <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="_honey" tabindex="-1" autocomplete="off"></label></div>
        <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="f-rest">Restaurant</label><input id="f-rest" name="restaurant" type="text" autocomplete="organization" required></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        <div class="row">
          <div class="field"><label for="f-phone">Phone <span>(optional)</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
          <div class="field"><label for="f-pos">Your POS <span>(optional)</span></label><input id="f-pos" name="pos" type="text"></div>
        </div>
        <div class="field"><label for="f-msg">Anything else <span>(optional)</span></label><textarea id="f-msg" name="message" rows="3"></textarea></div>
        <button class="btn" type="submit">Send</button>
        <p class="status" role="status" aria-live="polite"></p>
        <p class="fine">Your sales are used only for your restaurant. Never sold or shared. <a href="privacy.html">Privacy</a></p>
      </form>
    </div>
  </section>
</main>
${footer}
<script src="vendor/gsap.min.js"></script>
<script src="site.js"></script>
</body>
</html>
`;

const privacy = `${head('Tooey privacy', 'What Tooey does with the contact form and with a restaurant\'s sales.')}
<body class="page-privacy">
<a class="skip" href="#main">Skip to content</a>
${header(false)}
<main id="main" class="wrap prose">
  <h1>Privacy</h1>
  <p>Short version: we use what you send us to reply to you, and a restaurant’s sales only to make that restaurant’s counts.</p>

  <h2>The contact form</h2>
  <p>When you send the form, your name, restaurant, email and anything else you type go through FormSubmit, a form service, to tooeyteam@gmail.com. We use them only to reply to you. We don’t add you to a mailing list.</p>

  <h2>Your restaurant’s sales</h2>
  <p>During a pilot we set up a nightly download of your item-level sales from your POS. We use them only to make your restaurant’s counts.</p>
  <ul>
    <li>They are not sold.</li>
    <li>They are not shared with other restaurants.</li>
    <li>They are not published.</li>
    <li>Only the Tooey team sees them.</li>
  </ul>

  <h2>Deleting your data</h2>
  <p>Email <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a> and we’ll delete what we hold about you or your restaurant.</p>

  <h2>Who we are</h2>
  <p>Tooey LLC, a small team of university students. Questions go to the same address.</p>
</main>
${footer}
<script src="site.js"></script>
</body>
</html>
`;

writeFileSync(join(OUT, 'index.html'), index);
writeFileSync(join(OUT, 'privacy.html'), privacy);
console.log('built index.html and privacy.html');
