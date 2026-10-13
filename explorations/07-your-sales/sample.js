// Sample data. Every number here is invented for illustration.
// One year of daily sales per dish: 364 days, Tue 14 Oct 2025 to Mon 12 Oct 2026.
// Day 0 is a Tuesday, so with seven days a turn every Tuesday sits at twelve o'clock.

export const DAYS = 364;
const START = Date.UTC(2025, 9, 14);
const DAY = 86400000;

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function iso(i) { return new Date(START + i * DAY).toISOString().slice(0, 10); }

// Days the sample restaurant is closed, and days that break the pattern.
const CLOSED = new Set(['2025-11-27', '2025-12-25', '2026-01-01']);
export const HOLIDAYS = [
  { date: '2026-02-14', name: "Valentine's Day" },
  { date: '2026-05-10', name: "Mother's Day" },
];

// Weekday factors start at Tuesday (day 0).
const DISHES = {
  margherita: {
    name: 'Margherita', base: 31, seed: 7,
    week: [0.74, 0.84, 0.95, 1.36, 1.52, 1.12, 0.68],
    season: (doy) => 1 + 0.16 * Math.cos((2 * Math.PI * (doy - 196)) / 365),
    lift: { '2026-02-14': 1.5, '2026-05-10': 1.75, '2025-12-31': 1.3, '2026-07-04': 0.62 },
  },
  soup: {
    name: 'Lentil soup', base: 13, seed: 11,
    week: [1.18, 1.2, 1.16, 1.08, 0.62, 0.55, 1.2],
    season: (doy) => 1 + 0.5 * Math.cos((2 * Math.PI * (doy - 20)) / 365),
    lift: {},
  },
  tiramisu: {
    name: 'Tiramisu', base: 12, seed: 23,
    week: [0.7, 0.78, 0.9, 1.3, 1.62, 1.05, 0.62],
    season: (doy) => 1 + 0.08 * Math.cos((2 * Math.PI * (doy - 350)) / 365),
    lift: { '2026-02-14': 2.6, '2026-05-10': 1.9, '2025-12-31': 1.6 },
  },
  shortrib: {
    name: 'Short rib', base: 8, seed: 31, firstDay: DAYS - 19,
    week: [0.8, 0.9, 1, 1.3, 1.4, 1.1, 0.7],
    season: () => 1,
    lift: {},
  },
};

function series(d) {
  const r = rng(d.seed);
  const out = new Array(DAYS);
  for (let i = 0; i < DAYS; i++) {
    const date = iso(i);
    const doy = Math.floor((START + i * DAY - Date.UTC(new Date(START + i * DAY).getUTCFullYear(), 0, 0)) / DAY);
    if ((d.firstDay ?? 0) > i || CLOSED.has(date)) { out[i] = 0; continue; }
    const noise = 1 + 0.15 * ((r() + r() + r()) / 1.5 - 1);
    out[i] = Math.max(1, Math.round(d.base * d.week[i % 7] * d.season(doy) * (d.lift[date] ?? 1) * noise));
  }
  return out;
}

// Tomorrow (day 364, a Tuesday): the recent same weekdays, plus a small cushion for prep.
// A simple stand-in so the sample is self-consistent; it is not Tooey's model.
function tomorrow(values, d) {
  if (d.firstDay !== undefined && DAYS - d.firstDay < 35) return null;
  const same = [1, 2, 3, 4].map((k) => values[DAYS - 7 * k]);
  const predicted = same.reduce((a, b) => a + b, 0) / same.length;
  return { predicted: Math.round(predicted), prep: Math.round(predicted * 1.1), length: predicted };
}

export const dishes = Object.fromEntries(
  Object.entries(DISHES).map(([key, d]) => {
    const values = series(d);
    return [key, { key, name: d.name, values, firstDay: d.firstDay ?? 0, next: tomorrow(values, d) }];
  })
);

export const holidayIndex = HOLIDAYS.map((h) => ({
  ...h, i: Math.round((Date.parse(h.date) - START) / DAY),
}));

export const WEEKDAYS = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];

// Geometry, shared by the canvas and the prerendered pictures.
// The year is one ribbon wound into a coil, one day per stretch of ribbon. Day i runs from
// angle 2*pi*i/P to 2*pi*(i+1)/P, measured from twelve o'clock. Its radius grows with time, so
// a year always fills the same ring whatever the period, and the ribbon is as thick as the
// day's sales. At seven days a turn every weekday stacks into one straight spoke.
export function ring(g, P) {
  return ((g.outer - g.inner) * P) / DAYS; // distance between turns
}

export function arc(i, P, g) {
  const a0 = (2 * Math.PI * i) / P - Math.PI / 2;
  const a1 = (2 * Math.PI * (i + 1)) / P - Math.PI / 2;
  const r = g.inner + (g.outer - g.inner) * ((i + 0.5) / DAYS);
  return [a0, a1, r];
}

// Line width for a day: full ring spacing at the usual peak, so busy days touch.
// Slightly exaggerated so quiet days read as thin and busy days as solid.
export function width(v, P, g) {
  return Math.pow(v / g.vmax, 1.35) * ring(g, P) * 0.94;
}

// SVG path data for the coil, grouped by width so it stays small.
export function coilSvg(values, P, g, from = 0) {
  const groups = new Map();
  const f = (n) => Math.round(n * 10) / 10;
  for (let i = from; i < values.length; i++) {
    if (!values[i]) continue;
    const w = Math.round(width(values[i], P, g) * 4) / 4;
    const [a0, a1, r] = arc(i, P, g);
    const d = `M${f(g.cx + Math.cos(a0) * r)} ${f(g.cy + Math.sin(a0) * r)}A${f(r)} ${f(r)} 0 0 1 ${f(g.cx + Math.cos(a1) * r)} ${f(g.cy + Math.sin(a1) * r)}`;
    groups.set(w, (groups.get(w) || '') + d);
  }
  return [...groups].map(([w, d]) => `<path stroke-width="${w}" d="${d}"/>`).join('');
}
