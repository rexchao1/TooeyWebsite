// The rota scene, as data and SVG strings.
// Shared by the live stage (js/stage.js) and the static board (_src/build-static.mjs).
// Every shape here is illustrative: no measured figure is drawn.

export const T0 = 15;          // 3pm, left edge of the rota
export const T1 = 24;          // midnight, right edge
export const MAXROWS = 10;     // headroom on the board, in people
export const ROLES = ['Grill', 'Floor', 'Dish', 'Line', 'Bar', 'Host']; // bottom up
export const INK = { a: 16, b: 23 };  // the fixed rota: everyone 4pm to 11pm

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a, b, t) => a + (b - a) * t;
export const ease = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const bell = (t, m, s) => Math.exp(-(((t - m) / s) ** 2));
const open = (t, a0, a1, b0, b1) => smooth(a0, a1, t) * (1 - smooth(b0, b1, t));

// How many hands each night needs, hour by hour. Shapes only, for illustration.
export const NIGHTS = {
  tue: (t) => open(t, 16.0, 17.2, 21.9, 22.95) * (1.0 + 2.15 * bell(t, 19.4, 1.35)),
  sat: (t) => open(t, 15.7, 16.9, 22.2, 23.4) * (1.4 + 7.5 * bell(t, 20, 1.75)),
  grow: (t) => NIGHTS.tue(t) + open(t, 16.0, 17.2, 21.9, 22.95) * 1.2 * bell(t, 19.6, 1.6),
};

// Example prep numbers for the Tooey row: [predicted, prep]
export const PREP = {
  tue: [[9, 10], [12, 13]],
  sat: [[17, 19], [23, 25]],
};
export const DISHES = ['Short rib', 'Mussels', 'Ramp pasta'];

// A rota cut to a night: nested shifts, at least three hours, on the half hour.
export function fit(fn) {
  const out = [];
  let pa = 15.5, pb = 23.5;
  for (let k = 0; k < MAXROWS; k++) {
    const th = k + 0.45;
    let a = null, b = null;
    for (let i = 0; i <= 180; i++) {
      const t = T0 + i * 0.05;
      if (fn(t) >= th) { if (a === null) a = t; b = t; }
    }
    if (a === null) break;
    a = Math.floor(a * 2) / 2; b = Math.ceil(b * 2) / 2;
    if (b - a < 3) { const c = (a + b) / 2; a = Math.floor((c - 1.5) * 2) / 2; b = a + 3; }
    a = Math.max(a, pa); b = Math.min(b, pb);
    out.push({ k, a, b });
    pa = a; pb = b;
  }
  return out;
}

export const FIT = { tue: fit(NIGHTS.tue), sat: fit(NIGHTS.sat), grow: fit(NIGHTS.grow) };

// Board geometry for a W x H box.
export function geom(W, H, o = {}) {
  const top = o.top ?? 30;
  const tooeyH = o.tooeyH ?? 0;
  const gap = o.gap ?? 16;
  const x0 = o.x0 ?? 0, x1 = o.x1 ?? W;
  const base = H - tooeyH - (tooeyH ? gap : 0);
  const rows = o.rows ?? MAXROWS;
  const rowH = (base - top) / rows;
  return {
    W, H, top, base, rowH, rows, x0, x1, tooeyH, compact: !!o.compact,
    tooeyY: base + gap,
    X: (t) => x0 + ((t - T0) / (T1 - T0)) * (x1 - x0),
    Y: (n) => base - n * rowH,
  };
}

const f = (n) => Math.round(n * 10) / 10;

// The page's own grid: hour lines, row lines, the baseline.
export function grid(G, s = {}) {
  const a = s.alpha ?? 1;
  const reach = s.reach ?? 1; // how far the lines have drawn, 0..1
  let out = `<g class="grid" opacity="${f(a)}">`;
  for (let k = 1; k <= Math.floor(G.rows + 0.01); k++) {
    const y = f(G.Y(k));
    out += `<line class="g-row" x1="${f(G.x0)}" x2="${f(mix(G.x0, G.x1, reach))}" y1="${y}" y2="${y}"/>`;
  }
  for (let t = T0 + 1; t <= T1; t++) {
    const strong = t === 16 || t === 20 || t === 24;
    const y2 = mix(G.top, G.base, reach);
    out += `<line class="${strong ? 'g-hour g-strong' : 'g-hour'}" x1="${f(G.X(t))}" x2="${f(G.X(t))}" y1="${f(G.top - (strong ? 6 : 0))}" y2="${f(y2)}"/>`;
  }
  out += `<line class="g-base" x1="${f(G.x0)}" x2="${f(mix(G.x0, G.x1, reach))}" y1="${f(G.base)}" y2="${f(G.base)}"/>`;
  if (s.ticks !== false) {
    const ty = f(G.top - 11);
    out += `<text class="t-tick" x="${f(G.X(16))}" y="${ty}" text-anchor="middle">4pm</text>`;
    out += `<text class="t-tick" x="${f(G.X(20))}" y="${ty}" text-anchor="middle">8pm</text>`;
    out += `<text class="t-tick" x="${f(G.X(24))}" y="${ty}" text-anchor="end">midnight</text>`;
  }
  return out + '</g>';
}

function band(G, ts, upper, lower) {
  let d = '';
  for (let i = 0; i < ts.length; i++) d += (i ? 'L' : 'M') + f(G.X(ts[i])) + ',' + f(G.Y(upper[i]));
  for (let i = ts.length - 1; i >= 0; i--) d += 'L' + f(G.X(ts[i])) + ',' + f(G.Y(lower[i]));
  return d + 'Z';
}
function line(G, ts, vals) {
  let d = '';
  for (let i = 0; i < ts.length; i++) d += (i ? 'L' : 'M') + f(G.X(ts[i])) + ',' + f(G.Y(vals[i]));
  return d;
}

// The night's rush (N, in people) against the people on (S).
// Blue where the rota covers it, pink where it spills over, graphite hatch where people stand idle.
export function tide(G, ts, N, S, s = {}) {
  const zero = ts.map(() => 0);
  const lo = N.map((n, i) => Math.min(n, S[i]));
  const hi = N.map((n, i) => Math.max(n, S[i]));
  let out = `<g class="tide">`;
  out += `<path class="tide-fill" d="${band(G, ts, N, zero)}"/>`;
  if ((s.spill ?? 1) > 0.01) out += `<path class="tide-spill" opacity="${f(s.spill ?? 1)}" d="${band(G, ts, hi, S)}"/>`;
  if ((s.hatch ?? 1) > 0.01) out += `<path class="tide-slack" opacity="${f(s.hatch ?? 1)}" d="${band(G, ts, S, lo)}"/>`;
  out += `<path class="tide-surface" d="${line(G, ts, N)}"/>`;
  return out + '</g>';
}

// Highlighter mark with ragged ends.
export function swipe(x, y, w, h, seed = 1) {
  if (w <= 0.5) return '';
  const j = (i) => Math.sin(seed * 12.9898 + i * 78.233) * 0.5 + 0.5; // stable jitter
  const r = Math.min(4, w / 3);
  const d = `M${f(x + r * j(1))},${f(y + 1)} L${f(x + w - r * j(2))},${f(y)} L${f(x + w + r * 0.3 * j(3))},${f(y + h * 0.35)} L${f(x + w - r * j(4) * 0.6)},${f(y + h * 0.7)} L${f(x + w)},${f(y + h - 1)} L${f(x + r * j(5) * 0.5)},${f(y + h)} L${f(x - r * 0.3)},${f(y + h * 0.6)} L${f(x + r * 0.4 * j(6))},${f(y + h * 0.3)}Z`;
  return `<path class="lime" d="${d}"/>`;
}

const label = (G, x, y, h, w, text, cls, alpha) => {
  if (!text || alpha <= 0.01) return '';
  const fs = clamp(h * 0.5, 10, G.compact ? 12 : 15);
  const wdth = Math.round(clamp(mix(58, 100, (w - 34) / 120), 58, 100));
  if (w < fs * 1.9) return '';
  return `<text class="${cls}" x="${f(x + 7)}" y="${f(y + h / 2)}" dy="0.36em" opacity="${f(alpha)}" style="font-size:${f(fs)}px;font-variation-settings:'wdth' ${wdth}">${text}</text>`;
};

// A shift written in ink: biro outline, role inside.
export function inkBrick(G, b) {
  const inset = Math.max(2, G.rowH * 0.09);
  const x = G.X(b.a), full = G.X(b.b) - x;
  const w = full * (b.draw ?? 1);
  if (w < 1) return '';
  const y = G.Y(b.k + 1) + inset, h = G.rowH - inset * 2;
  return `<g opacity="${f(b.alpha ?? 1)}"><rect class="ink" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="2.5"/>` +
    label(G, x, y, h, w, ROLES[b.k], 't-ink', b.labelAlpha ?? 1) + '</g>';
}

// A shift pencilled in: graphite, sketched twice, drawn as it appears.
export function pencilBrick(G, b) {
  const inset = Math.max(2, G.rowH * 0.12);
  const x = G.X(b.a) + (b.dx ?? 0), w = G.X(b.b) - G.X(b.a);
  const y = G.Y(b.k + 1) + inset - (b.lift ?? 0) * G.rowH, h = G.rowH - inset * 2;
  const d = b.draw ?? 1;
  if (d <= 0.001 || (b.alpha ?? 1) <= 0.01) return '';
  const dash = d >= 1 ? '' : ` stroke-dasharray="${f(d)} 2"`;
  const r = (ox, oy) => `M${f(x + ox)},${f(y + oy)} h${f(w)} v${f(h)} h${f(-w)}Z`;
  const txt = b.k < ROLES.length && b.labelled !== false ? ROLES[b.k] : '';
  return `<g class="pencil" opacity="${f(b.alpha ?? 1)}">` +
    `<path class="pen" pathLength="1"${dash} d="${r(0, 0)}"/>` +
    `<path class="pen pen-2" pathLength="1"${dash} d="${r(1.2, -0.8)}"/>` +
    label(G, x, y, h, w, txt, 't-pencil', clamp((d - 0.55) / 0.3)) + '</g>';
}

export function growthLine(G, ts, vals, alpha = 1) {
  if (alpha <= 0.01) return '';
  return `<path class="pen pen-grow" opacity="${f(alpha)}" d="${line(G, ts, vals)}"/>`;
}

export function dayTag(G, text, alpha = 1) {
  const fs = G.compact ? 20 : 26;
  return `<text class="t-day" x="${f(G.x1 - 4)}" y="${f(G.top + fs + 6)}" text-anchor="end" opacity="${f(alpha)}" style="font-size:${fs}px">${text}</text>`;
}

// Tooey's own row on the rota: the prep count, in ink, with the live column highlighted.
export function tooeyRow(G, s = {}) {
  const a = s.alpha ?? 1;
  if (a <= 0.01) return '';
  const nums = s.nums ?? PREP.sat;
  const c = G.compact;
  const y0 = G.tooeyY;
  const logoW = c ? 64 : 92, logoH = logoW * (148 / 342);
  const cx = G.x0 + logoW + (c ? 18 : 36);
  const nameW = c ? 96 : 132, predW = c ? 74 : 92, prepW = c ? 46 : 60;
  const step = c ? 21 : 25, fs = c ? 13 : 15;
  const hy = y0 + (c ? 13 : 15);
  const colP = cx + nameW + predW, colQ = colP + prepW;
  const sw = (s.swipe ?? 1);
  let out = `<g class="tooey" opacity="${f(a)}">`;
  if (s.logo !== false) out += `<image href="logo.png" x="${f(G.x0)}" y="${f(y0 - 2)}" width="${f(logoW)}" height="${f(logoH)}"/>`;
  // live column, highlighted
  out += swipe(colP + 6, hy + 6, (prepW + 2) * sw, step * 2 + 4, 3);
  out += `<text class="t-head" x="${f(colP)}" y="${f(hy)}" text-anchor="end" style="font-size:${fs - 2}px">Predicted</text>`;
  out += `<text class="t-head" x="${f(colQ)}" y="${f(hy)}" text-anchor="end" style="font-size:${fs - 2}px">Prep</text>`;
  out += `<text class="t-example" x="${f(colQ + (c ? 10 : 18))}" y="${f(hy)}" style="font-size:${fs - 3}px">Example</text>`;
  for (let i = 0; i < 3; i++) {
    const y = hy + step * (i + 1);
    out += `<text class="t-dish" x="${f(cx)}" y="${f(y)}" style="font-size:${fs}px">${DISHES[i]}</text>`;
    if (i < 2) {
      out += `<text class="t-num" x="${f(colP)}" y="${f(y)}" text-anchor="end" style="font-size:${fs}px">${nums[i][0]}</text>`;
      out += `<text class="t-num t-prep" x="${f(colQ)}" y="${f(y)}" text-anchor="end" style="font-size:${fs + 1}px">${nums[i][1]}</text>`;
    } else {
      out += `<text class="t-blank" x="${f(colQ)}" y="${f(y)}" text-anchor="end" style="font-size:${fs - 1}px">too new to call</text>`;
    }
  }
  return out + '</g>';
}

export function tooeyHeight(compact) { return compact ? 92 : 104; }
export function logoBox(G) {
  const w = G.compact ? 64 : 92;
  return { x: G.x0, y: G.tooeyY - 2, w, h: w * (148 / 342) };
}
