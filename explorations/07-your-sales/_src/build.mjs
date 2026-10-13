// Builds index.html and privacy.html from the templates in this folder.
// The only generated parts are the two sample ledgers on the home page,
// made from the invented numbers in data.mjs, and the shared header/footer.
//
//   node _src/build.mjs        (run from explorations/07-your-sales/)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pasta, tacos, MONTHS, DOW, WEEKS, summary } from './data.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..');
const read = (f) => readFileSync(join(here, f), 'utf8');

// The sample prep counts for the Tuesday after the record ends.
// Predicted, then Prep (a little over Predicted).
export const TUESDAY = {
  pasta: { predicted: 15, prep: 17 },
  tacos: { predicted: 13, prep: 15 },
};

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const r2 = (x) => Math.round(x * 100) / 100;
const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

function dowMeans(days) {
  return DOW.map((_, w) => avg(days.filter((d) => d.dow === w && d.v !== null && !d.hol).map((d) => d.v)));
}

const pMean = avg(pasta.filter((d) => d.v !== null && !d.hol).map((d) => d.v));
const pDow = dowMeans(pasta);
const tDow = dowMeans(tacos);

// Holidays that get a written label on the wide (desktop) ledger.
const LABELS = {
  'Night before Thanksgiving': null,
  Thanksgiving: 'Thanksgiving',
  'Christmas Day': 'Christmas',
  'Valentine’s Day': 'Valentine’s',
  'Mother’s Day': 'Mother’s Day',
  'Fourth of July': 'July 4',
};

function cell(i) {
  const p = pasta[i];
  const t = tacos[i];
  if (i === WEEKS * 7 + 1) {
    // Tuesday after the record: Tooey's count, in ink.
    return `<span class="c f" style="--w:1;--y:1;--k:1"><span class="p">${TUESDAY.pasta.prep}</span><span class="t">${TUESDAY.tacos.prep}</span></span>`;
  }
  if (!p) return '<span class="c e"></span>';
  if (p.v === null) return '<span class="c x" title="Closed"><span class="p">–</span><span class="t">–</span></span>';
  const w = r2(clamp01((p.v / pMean - 0.5) / 1.0));
  const y = r2(clamp01((p.v / pDow[p.dow] - 0.74) / 0.52));
  const k = r2(clamp01((t.v / tDow[t.dow] - 0.5) / 1.0));
  const cls = ['c'];
  if (p.hol) cls.push('h');
  if (i === WEEKS * 7) cls.push('last');
  return `<span class="${cls.join(' ')}" style="--w:${w};--y:${y};--k:${k}"><span class="p">${p.v}</span><span class="t">${t.v}</span></span>`;
}

// The year is folded in two, like a long printout: October to April on
// top, April to October underneath. Both halves have 27 week columns so the
// days line up. On a phone the halves sit side by side in one strip.
const HALF = 27;

function half(from, to) {
  const cells = [];
  for (let wk = from; wk < from + HALF; wk++) {
    for (let w = 0; w < 7; w++) cells.push(wk <= to ? cell(wk * 7 + w) : '<span class="c e"></span>');
  }

  const months = [];
  let prev = -1;
  for (let wk = from; wk <= to; wk++) {
    const days = pasta.slice(wk * 7, wk * 7 + 7);
    const first = days.find((x) => x.date === 1);
    const m = first ? first.month : wk === from && days[0] ? days[0].month : -1;
    if (m !== -1 && m !== prev) {
      months.push(`<span style="--c:${wk - from + 1}">${MONTHS[m]}</span>`);
      prev = m;
    }
  }

  // Drop a month label that would sit right against the next one.
  for (let n = months.length - 2; n >= 0; n--) {
    const c = (x) => Number(x.match(/--c:(\d+)/)[1]);
    if (c(months[n + 1]) - c(months[n]) < 2) months.splice(n, 1);
  }

  const labels = [];
  for (const d of pasta) {
    if (d.week >= from && d.week <= to && d.hol && LABELS[d.hol]) {
      labels.push(`<span style="--c:${d.week - from + 1}">${LABELS[d.hol]}</span>`);
    }
  }

  const days = DOW.map((d) => `<span>${d}</span>`).join('');
  return `<div class="lg-half">
                <div class="lg-months">${months.join('')}</div>
                <div class="lg-days">${days}</div>
                <div class="lg-grid">${cells.join('')}</div>
                <div class="lg-labels">${labels.join('')}</div>
              </div>`;
}

function yearLedger() {
  const pin = DOW.map((d) => `<span>${d}</span>`).join('');
  return `<div class="lg-scroll" tabindex="0" role="region" aria-label="The sample year, one number a night. Scroll sideways to move through it.">
              <div class="lg-pin">${pin}</div>
              ${half(0, HALF - 1)}
              ${half(HALF, WEEKS)}
            </div>`;
}

function heroLedger() {
  const first = WEEKS - 5; // five full weeks, then the current one
  const rows = [];
  for (let wk = first; wk <= WEEKS; wk++) {
    const d0 = pasta[wk * 7];
    const label = `${MONTHS[d0.month]} ${d0.date}`;
    const cells = [];
    for (let w = 0; w < 7; w++) {
      const i = wk * 7 + w;
      const d = pasta[i];
      if (wk === WEEKS && w === 1) {
        cells.push(`<span class="hc fc"><span class="fc-n">${TUESDAY.pasta.prep}</span><svg class="ring" viewBox="0 0 60 40" aria-hidden="true" focusable="false"><path pathLength="1" d="M33 4.5C18 3.6 5.2 9.4 4.4 19.6 3.6 30 15.8 36.3 30.6 35.8 45.2 35.3 56 29.4 55.6 19.4 55.2 9.8 44 4.4 31 4.8 27.5 4.9 24.6 5.4 22.2 6.1"/></svg></span>`);
      } else if (!d) {
        cells.push('<span class="hc blank"></span>');
      } else {
        const tue = w === 1 ? ' tue' : '';
        const last = i === WEEKS * 7 ? ' last' : '';
        const order = w === 1 ? ` style="--i:${wk - first}"` : '';
        cells.push(`<span class="hc${tue}${last}"${order}>${d.v ?? '–'}</span>`);
      }
    }
    rows.push(`<span class="hl">${label}</span>${cells.join('')}`);
  }
  return rows.join('');
}

const header = read('partials/header.html');
const footer = read('partials/footer.html');

function page(src, dest, extra = {}, home = '') {
  let html = read(src)
    .replace('<!--@header-->', header)
    .replace('<!--@footer-->', footer)
    .replaceAll('{{home}}', home);
  for (const [k, v] of Object.entries(extra)) html = html.replace(`<!--@${k}-->`, v);
  if (/<!--@\w+-->/.test(html)) throw new Error(`Unfilled placeholder in ${src}`);
  writeFileSync(join(out, dest), html);
  console.log('wrote', dest, `${(html.length / 1024).toFixed(1)} KB`);
}

page('index.html', 'index.html', { ledger: yearLedger(), hero: heroLedger() });
page('privacy.html', 'privacy.html', {}, 'index.html');

// Numbers quoted in the copy come from here; print them so the words can be
// checked against the sample data after any change.
const fmt = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 10) / 10]));
console.log('rigatoni', fmt(summary(pasta)));
console.log('fish tacos', fmt(summary(tacos)));
const satJan = avg(pasta.filter((d) => d.dow === 5 && d.month === 0 && !d.hol).map((d) => d.v));
console.log('rigatoni Saturday in Jan', satJan.toFixed(1));
console.log('holidays', pasta.filter((d) => d.hol).map((d) => `${d.hol}: ${d.v ?? 'closed'} (usual ${pDow[d.dow].toFixed(0)})`).join('; '));
console.log('last Tuesdays', pasta.filter((d) => d.dow === 1).slice(-5).map((d) => d.v).join(' '));
