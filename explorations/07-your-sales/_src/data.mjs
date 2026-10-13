// Sample data for the site. Every number here is invented for illustration:
// one made-up restaurant, two dishes, 52 weeks of nightly plate counts.
// Deterministic (seeded), so the build always prints the same numbers.

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r) {
  const u = Math.max(r(), 1e-9);
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const DAY = 86400000;
// First Monday of the record. The record runs 52 full weeks, Monday to
// Sunday, then one more Monday ("last night"). The Tuesday after is the day
// the sample prep count is for.
export const START = Date.UTC(2025, 9, 13); // Mon 13 Oct 2025
export const WEEKS = 52;

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Holidays in the sample year, as ISO dates. `f` scales a normal day for the
// pasta; `null` means the restaurant was closed.
export const HOLIDAYS = {
  '2025-10-31': { name: 'Halloween', f: 0.8 },
  '2025-11-26': { name: 'Night before Thanksgiving', f: 1.55 },
  '2025-11-27': { name: 'Thanksgiving', f: null },
  '2025-12-24': { name: 'Christmas Eve', f: 0.6 },
  '2025-12-25': { name: 'Christmas Day', f: null },
  '2025-12-31': { name: 'New Year’s Eve', f: 1.7 },
  '2026-02-08': { name: 'Super Bowl Sunday', f: 0.62 },
  '2026-02-14': { name: 'Valentine’s Day', f: 1.5 },
  '2026-05-10': { name: 'Mother’s Day', f: 1.45 },
  '2026-07-04': { name: 'Fourth of July', f: 0.52 },
};

const iso = (t) => new Date(t).toISOString().slice(0, 10);

function dayOfYear(t) {
  const d = new Date(t);
  return Math.floor((t - Date.UTC(d.getUTCFullYear(), 0, 1)) / DAY);
}

function build({ seed, base, dow, season, trend, noise, holidayWeight }) {
  const r = rng(seed);
  const days = [];
  for (let i = 0; i < WEEKS * 7 + 1; i++) {
    const t = START + i * DAY;
    const d = new Date(t);
    const w = i % 7;
    const key = iso(t);
    const hol = HOLIDAYS[key];
    const doy = dayOfYear(t);
    // Season: a cosine over the year, peak at `season.peak` (day of year).
    const s = 1 + season.amp * Math.cos((2 * Math.PI * (doy - season.peak)) / 365);
    const tr = trend(i / (WEEKS * 7));
    let v = base * dow[w] * s * tr * (1 + noise * gauss(r));
    let closed = false;
    if (hol) {
      if (hol.f === null) closed = true;
      else v *= 1 + (hol.f - 1) * holidayWeight;
    }
    days.push({
      i,
      iso: key,
      week: Math.floor(i / 7),
      dow: w,
      month: d.getUTCMonth(),
      date: d.getUTCDate(),
      v: closed ? null : Math.max(1, Math.round(v)),
      hol: hol ? hol.name : null,
      season: s,
    });
  }
  return days;
}

export const pasta = build({
  seed: 7,
  base: 21.5,
  dow: [0.66, 0.7, 0.8, 0.94, 1.45, 1.55, 0.9],
  season: { amp: 0.2, peak: 20 },
  trend: (x) => 1 + 0.03 * x,
  noise: 0.06,
  holidayWeight: 1,
});

export const tacos = build({
  seed: 21,
  base: 11,
  dow: [0.72, 0.76, 0.86, 0.98, 1.36, 1.42, 0.9],
  season: { amp: 0.06, peak: 200 },
  trend: (x) => 0.62 + 0.86 * x,
  noise: 0.08,
  holidayWeight: 0.6,
});

export function summary(days) {
  const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const vals = (f) => days.filter((d) => d.v !== null && !d.hol && f(d)).map((d) => d.v);
  return {
    mon: avg(vals((d) => d.dow === 0)),
    tue: avg(vals((d) => d.dow === 1)),
    fri: avg(vals((d) => d.dow === 4)),
    sat: avg(vals((d) => d.dow === 5)),
    friJan: avg(vals((d) => d.dow === 4 && d.month === 0)),
    friJul: avg(vals((d) => d.dow === 4 && d.month === 6)),
    satJul: avg(vals((d) => d.dow === 5 && d.month === 6)),
    firstWeeks: avg(vals((d) => d.week < 6)),
    lastWeeks: avg(vals((d) => d.week >= 46)),
  };
}
