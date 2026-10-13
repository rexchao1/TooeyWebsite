// Pure rendering for the sample list and its notes. No DOM access here, so
// _src/build-sample.mjs can use the same functions to write the
// no-JavaScript fallback into index.html.

export const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function fmtChange(n) {
  if (n === 0) return '0%';
  return (n > 0 ? '+' : '−') + Math.abs(n) + '%';
}

export function reason(item) {
  return item.blank === 'new' ? 'Too new: under five weeks on the menu' : 'Sells under one a day';
}

// The list itself: what the real product shows, nothing more.
export function sheetBody(data, d, interactive = false) {
  const day = data.days[d];
  let rows = '';
  for (const cat of data.cats) {
    const items = data.items.filter((i) => i.cat === cat);
    rows += `<tbody><tr class="cat"><th colspan="4" scope="rowgroup">${esc(cat)}</th></tr>`;
    for (const item of items) {
      const r = item.byDay[d];
      const name = interactive
        ? `<button type="button" class="dish" data-item="${item.id}" aria-expanded="false">${esc(item.name)}</button>`
        : esc(item.name);
      rows += item.blank
        ? `<tr class="row is-blank" data-item="${item.id}"><th scope="row">${name}</th><td colspan="3" class="why-blank">${esc(reason(item))}</td></tr>`
        : `<tr class="row" data-item="${item.id}"><th scope="row">${name}</th><td class="num">${r.pred}</td><td class="num prep">${r.prep}</td><td class="num chg">${fmtChange(r.chg)}</td></tr>`;
    }
    rows += '</tbody>';
  }
  return `<div class="sheet-head">
  <p class="sheet-from"><span class="sheet-brand">tooey</span><span>Prep list</span></p>
  <p class="sheet-rest">${esc(data.restaurant)}</p>
  <p class="sheet-day">${esc(day.long)}</p>
</div>
<table class="list">
  <caption class="sr-only">Prep list for ${esc(day.long)} at ${esc(data.restaurant)}, a sample restaurant with made-up numbers</caption>
  <colgroup><col class="c-item"><col class="c-num"><col class="c-num"><col class="c-chg"></colgroup>
  <thead><tr><th scope="col">Item</th><th scope="col" class="num">Predicted</th><th scope="col" class="num">Prep</th><th scope="col" class="num">vs. last ${esc(day.short)}</th></tr></thead>
  ${rows}
</table>`;
}

// What the day's counts are made from. Website annotation, not the list.
export function inputsFor(data, d) {
  const day = data.days[d];
  return [
    ['Past sales', 'This restaurant’s own, dish by dish'],
    ['Day of the week', day.long],
    ['Time of year', data.season],
    ['Holiday', day.holiday || 'None'],
  ];
}

// The notes for one dish on one day. Website annotation, not the list.
export function dishNotes(data, itemId, d) {
  const item = data.items.find((i) => i.id === itemId);
  const day = data.days[d];
  const r = item.byDay[d];
  const vals = r.hist.filter((v) => v != null);
  const top = Math.max(...vals, r.prep || 0, 1) * 1.08;
  const pct = (v) => Math.max(2, Math.round((v / top) * 100));

  const n = r.hist.length;
  let bars = r.hist.map((v, i) => {
    const label = i === 0 ? `${n} weeks ago` : i === n - 1 ? `Last ${day.short}` : '';
    if (v == null) return `<li class="bar is-none"><span class="bar-val">–</span><span class="bar-fill" style="--h:2%"></span><span class="bar-x">${label}</span></li>`;
    return `<li class="bar${i === n - 1 ? ' is-last' : ''}"><span class="bar-val">${v}</span><span class="bar-fill" style="--h:${pct(v)}%"></span><span class="bar-x">${label}</span></li>`;
  }).join('');
  bars += item.blank
    ? `<li class="bar is-today is-empty"><span class="bar-val">blank</span><span class="bar-fill" style="--h:2%"></span><span class="bar-x">Today</span></li>`
    : `<li class="bar is-today"><span class="bar-val">${r.pred}</span><span class="bar-fill" style="--h:${pct(r.pred)}%"><span class="bar-prep" style="--p:${((r.prep - r.pred) / r.pred) * 100}%"></span></span><span class="bar-x">Today</span></li>`;

  const histText = r.hist.map((v) => (v == null ? 'not on the menu' : v)).join(', ');
  const chartLabel = `Sold on the past ${n} ${day.long}s, oldest first: ${histText}. ` +
    (item.blank ? 'Today: left blank.' : `Today: predicted ${r.pred}, prep ${r.prep}.`);

  const nums = item.blank
    ? `<p class="note-reason">${esc(reason(item))}</p>`
    : `<dl class="note-nums">
        <div><dt>Predicted</dt><dd>${r.pred}</dd></div>
        <div class="is-prep"><dt>Prep</dt><dd>${r.prep}</dd></div>
        <div><dt>vs. last ${esc(day.short)}</dt><dd>${fmtChange(r.chg)}<small>sold ${r.last}</small></dd></div>
      </dl>`;

  const week = item.blank ? '' : `<div class="note-week">
      <p class="note-sub" id="wk-${item.id}">Prep for this dish all week</p>
      <ul aria-labelledby="wk-${item.id}">${data.days.map((dd, i) => `<li><button type="button" class="wk${i === d ? ' is-on' : ''}" data-day="${i}"${i === d ? ' aria-current="true"' : ''} aria-label="${esc(dd.long)}: prep ${item.byDay[i].prep}"><span>${esc(dd.short)}</span><b>${item.byDay[i].prep}</b></button></li>`).join('')}</ul>
    </div>`;

  return `<h3 class="note-title" tabindex="-1">${esc(item.name)}<span>${esc(day.long)}</span></h3>
    ${nums}
    <figure class="hist">
      <ol class="bars" role="img" aria-label="${esc(chartLabel)}">${bars}</ol>
      <figcaption>What it sold on its last ${n} ${esc(day.long)}s${item.blank ? '' : ', and today’s count. The tick is Prep.'}</figcaption>
    </figure>
    <div class="note-why">${r.why.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    ${week}`;
}
