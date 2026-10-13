// Generates the sample restaurant's week (../sample-data.js) and writes the
// no-JavaScript fallback of the list into ../index.html between the
// <!-- sample:start --> and <!-- sample:end --> markers.
//
//   node explorations/03-sandbox/_src/build-sample.mjs
//
// Every number is made up. The model below only exists to make the sample
// internally consistent: past sales = an expected level per dish and day,
// plus noise; Predicted = the expected level for this week; Prep = a little
// over Predicted; the change column = Predicted against what sold on the
// same weekday last week. It uses only the inputs the real product uses:
// past sales, day of week, time of year, holidays.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..');

// ---------- deterministic randomness ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260504);
function normal() {
  const u = 1 - rand(), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------- the sample restaurant ----------
const DAYS = [
  { short: 'Mon', long: 'Monday' },
  { short: 'Tue', long: 'Tuesday' },
  { short: 'Wed', long: 'Wednesday' },
  { short: 'Thu', long: 'Thursday' },
  { short: 'Fri', long: 'Friday' },
  { short: 'Sat', long: 'Saturday' },
  { short: 'Sun', long: 'Sunday', holiday: 'Mother\u2019s Day' },
];
// How busy each day is against an average day.
const DOW = [0.7, 0.78, 0.86, 0.97, 1.3, 1.4, 1.0];
// Lunch dishes swing less across the week, dinner dishes more.
const PROFILE = { lunch: 0.55, all: 1.0, dinner: 1.3 };

const CATS = ['Starters', 'Salads', 'Burgers and sandwiches', 'Plates', 'Desserts'];

const ITEMS = [
  { id: 'wings', name: 'Wings', cat: 'Starters', base: 24, prof: 'all', lift: 1.02 },
  { id: 'soup', name: 'Tomato soup', cat: 'Starters', base: 14, prof: 'lunch', trend: 0.94, lift: 1.15 },
  { id: 'cobb', name: 'Cobb salad', cat: 'Salads', base: 17, prof: 'lunch', trend: 1.04, lift: 1.5 },
  { id: 'caesar', name: 'Caesar salad', cat: 'Salads', base: 19, prof: 'lunch', trend: 1.025, lift: 1.4 },
  { id: 'cheeseburger', name: 'Cheeseburger', cat: 'Burgers and sandwiches', base: 48, prof: 'all', lift: 1.12 },
  { id: 'chicken', name: 'Chicken sandwich', cat: 'Burgers and sandwiches', base: 35, prof: 'all', lift: 1.18 },
  { id: 'club', name: 'Turkey club', cat: 'Burgers and sandwiches', base: 15, prof: 'lunch', lift: 1.35 },
  { id: 'veggie', name: 'Veggie burger', cat: 'Burgers and sandwiches', base: 0.6, prof: 'all', blank: 'slow' },
  { id: 'fish', name: 'Fish and chips', cat: 'Plates', base: 9, prof: 'dinner', friday: 1.5, lift: 1.25 },
  { id: 'salmon', name: 'Grilled salmon', cat: 'Plates', base: 15, prof: 'dinner', trend: 1.01, lift: 1.6 },
  { id: 'steak', name: 'Steak frites', cat: 'Plates', base: 11, prof: 'dinner', lift: 1.45 },
  { id: 'brownie', name: 'Brownie sundae', cat: 'Desserts', base: 11, prof: 'dinner', lift: 1.4 },
  { id: 'shortcake', name: 'Strawberry shortcake', cat: 'Desserts', base: 6, prof: 'dinner', blank: 'new', weeksOn: 2 },
];

const WEEKS_SHOWN = 6; // past same-weekdays shown in the notes

function dayMult(item, d) {
  let m = 1 + (DOW[d] - 1) * PROFILE[item.prof];
  if (item.friday && d === 4) m *= item.friday;
  return m;
}
// Expected sales for week w (0 = this week, -1 = last week, ...) and day d.
function expected(item, w, d) {
  const trend = Math.pow(item.trend || 1, w);
  const holiday = w === 0 && DAYS[d].holiday ? item.lift || 1 : 1;
  return item.base * dayMult(item, d) * trend * holiday;
}
// Older weeks wander more than last week does. Real item counts are noisier
// than this; the sample keeps last week close to its usual level so the
// change column is readable, and a few hand-set days (STORY) show what a
// big swing looks like.
function sold(e, w) {
  const z = Math.max(-1.8, Math.min(1.8, normal()));
  if (w === -1) return Math.max(0, Math.round(e * (1 + Math.max(-0.1, Math.min(0.1, z * 0.06)))));
  return Math.max(0, Math.round(e + z * Math.sqrt(e) * 0.6));
}
function prepFor(p) {
  return p + Math.max(1, Math.round(p * 0.08));
}

// Hand-set past sales where the sample tells a story.
// key: item/day/week -> multiplier on the expected level for that past day
const STORY = {
  'wings/0/-1': 1.5, // a big Monday for wings last week
  'brownie/3/-1': 0.62, // a slow Thursday for the sundae last week
};

const items = ITEMS.map((item) => {
  const byDay = DAYS.map((day, d) => {
    const hist = [];
    for (let w = -WEEKS_SHOWN; w <= -1; w++) {
      const onMenu = item.blank === 'new' ? w >= -item.weeksOn : true;
      if (!onMenu) { hist.push(null); continue; }
      const e = expected(item, w, d) * (STORY[`${item.id}/${d}/${w}`] || 1);
      hist.push(item.blank === 'slow' ? (rand() < item.base ? 1 : 0) + (rand() < 0.1 ? 1 : 0) : sold(e, w));
    }
    const last = hist[hist.length - 1];
    if (item.blank) return { hist, last };
    const pred = Math.round(expected(item, 0, d));
    const chg = Math.round(((pred - last) / last) * 100);
    return { pred, prep: prepFor(pred), last, chg, hist };
  });
  return { ...item, byDay };
});

// ---------- the notes (the website's explanation, not part of the list) ----------
function why(item, d) {
  const day = DAYS[d];
  const r = item.byDay[d];
  const s = [];
  if (item.blank === 'slow') {
    s.push(`It sells under one a day: ${sum(item.byDay.map((x) => x.hist[x.hist.length - 1]))} in the whole of last week. At that rate a count would be a guess, so the row stays blank and says why.`);
    s.push('A blank is not a zero. Prep it the way you do now.');
    return s;
  }
  if (item.blank === 'new') {
    s.push(`It went on the menu two weeks before this Monday. Tooey needs about five weeks of a dish\u2019s sales before it will count it, so until then the row is left blank with the reason.`);
    s.push('A blank is not a zero. It means there isn\u2019t enough history yet to give a fair number.');
    return s;
  }
  const lastName = `last ${day.long}`;
  const past = `its past ${day.long}s`;
  if (day.holiday) {
    const strong = item.lift >= 1.4, weak = item.lift < 1.12;
    s.push(strong
      ? `${day.long} is ${day.holiday}. Holidays are one of the four things the count goes by, and this is one of the dishes the day lifts most.`
      : weak
        ? `${day.long} is ${day.holiday}, but this dish barely moves for it, so the count stays close to an ordinary ${day.long}.`
        : `${day.long} is ${day.holiday}. Holidays are one of the four things the count goes by, so it sits above an ordinary ${day.long}.`);
  }
  if (item.id === 'soup') s.push('Time of year: soup has been slowing week by week this spring. The count follows that slide, not just last week.');
  if (item.id === 'cobb' || item.id === 'caesar') s.push('Time of year: salads have picked up a little each week this spring. The count follows that climb.');
  if (item.friday && !day.holiday) {
    s.push(d === 4
      ? 'Day of the week: Friday is fish and chips night here. It sells more than twice what it does on a Thursday, so this is its biggest count of the week.'
      : `Day of the week: fish and chips sells best on Fridays here. On a ${day.long} the count stays small.`);
  }
  const story = STORY[`${item.id}/${d}/-1`];
  if (story) {
    const others = r.hist.slice(0, -1);
    s.push(story > 1
      ? `${cap(lastName)} was its biggest ${day.long} in six weeks (${r.last} sold). The count goes by ${past}, not just the last one, so it comes in well under last week. The change column shows you that drop so it doesn’t catch you off guard.`
      : `${cap(lastName)} was slow for this dish: ${r.last} sold, against ${Math.min(...others)} to ${Math.max(...others)} the weeks before. The count goes by ${past}, not just the last one, so it comes in well above last week.`);
  }
  if (!s.length) {
    const small = Math.abs(r.pred - r.last) <= 2;
    if (Math.abs(r.chg) > 12) {
      s.push(small
        ? `It sold ${r.last} ${lastName}. On a dish this size, a plate or two either way makes a big percentage.`
        : `${cap(lastName)} ran ${r.chg < 0 ? 'high' : 'low'} for this dish (${r.last} sold). The count goes by ${past}, so it lands ${r.chg < 0 ? 'under' : 'over'} last week.`);
    } else if (d === 0) {
      s.push(`Day of the week: Monday is the quietest day here. For this dish it’s an ordinary Monday, and the count sits among ${past}.`);
    } else if (d === 5) {
      s.push(`Day of the week: Saturday is the busiest day here, so the count is well above a weekday’s. Against ${past} it’s ordinary.`);
    } else if (d === 4) {
      s.push(`Day of the week: Fridays run busy here. Against ${past} this one is ordinary for this dish.`);
    } else {
      s.push(`An ordinary ${day.long} for this dish. The count sits among ${past}.`);
    }
  }
  return s;
}
const sum = (a) => a.reduce((x, y) => x + (y || 0), 0);
const cap = (t) => t[0].toUpperCase() + t.slice(1);

for (const item of items) item.byDay.forEach((r, d) => { r.why = why(item, d); });

const data = {
  restaurant: 'The Corner Booth',
  about: 'Casual dine-in, about 80 seats, lunch and dinner',
  season: 'Early May',
  weeksShown: WEEKS_SHOWN,
  days: DAYS,
  cats: CATS,
  items: items.map(({ id, name, cat, blank, weeksOn, byDay }) => ({ id, name, cat, blank, weeksOn, byDay })),
};

writeFileSync(join(out, 'sample-data.js'),
  '// Generated by _src/build-sample.mjs. Made-up numbers for a made-up restaurant.\n' +
  'export default ' + JSON.stringify(data) + ';\n');

// ---------- fallback list in index.html ----------
const { sheetBody } = await import(join(out, 'sample.js'));
const html = readFileSync(join(out, 'index.html'), 'utf8');
const start = '<!-- sample:start -->', end = '<!-- sample:end -->';
const a = html.indexOf(start), b = html.indexOf(end);
if (a < 0 || b < 0) throw new Error('markers missing in index.html');
const DEFAULT_DAY = 1;
writeFileSync(join(out, 'index.html'),
  html.slice(0, a + start.length) + '\n' + sheetBody(data, DEFAULT_DAY) + '\n' + html.slice(b));

// ---------- a plain summary for checking the numbers ----------
if (process.argv.includes('--print')) {
  for (const it of items) {
    console.log(it.name.padEnd(22), it.byDay.map((r) => it.blank ? '  --' : String(r.pred).padStart(4) + '/' + String(r.prep).padEnd(3) + (r.chg >= 0 ? '+' : '') + r.chg + '%').join(' | '));
    console.log(''.padEnd(22), it.byDay.map((r) => r.hist.map((h) => h ?? '.').join(',')).join(' | '));
  }
  const tot = DAYS.map((_, d) => sum(items.filter((i) => !i.blank && !['Starters', 'Desserts'].includes(i.cat)).map((i) => i.byDay[d].pred)));
  console.log('mains per day', tot.join(' '));
}
