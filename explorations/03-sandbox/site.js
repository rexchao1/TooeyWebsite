import { sheetBody, dishNotes, esc } from './sample.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- phone menu ---------- */
{
  const btn = $('.menu-btn');
  const nav = $('#nav');
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.top')) set(false);
  });
}

/* ---------- the sample ---------- */
const bench = $('#bench');
if (bench) {
  // Only the home page needs the sample's numbers.
  const { default: data } = await import('./sample-data.js');
  const sheet = $('#sheet');
  const notes = $('#notes');
  const panel = $('.board-body');
  const legend = $('#legend');
  const status = $('#status');
  const tabs = $$('.day');
  const wide = matchMedia('(min-width: 980px)');
  const state = { day: 1, item: null };

  const itemName = (id) => data.items.find((i) => i.id === id).name;
  const say = (t) => { status.textContent = ''; requestAnimationFrame(() => { status.textContent = t; }); };

  function renderInputs() {
    const day = data.days[state.day];
    $$('[data-in="day"]').forEach((el) => { el.textContent = day.long; });
    $$('[data-in="short"]').forEach((el) => { el.textContent = day.short; });
    $$('[data-in="holiday"]').forEach((el) => {
      el.textContent = day.holiday || 'no holiday';
      el.classList.toggle('is-hol', Boolean(day.holiday));
    });
  }

  function renderTabs() {
    tabs.forEach((t, i) => {
      const on = i === state.day;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    sheet.setAttribute('aria-labelledby', `tab-${state.day}`);
  }

  function placeNotes() {
    $$('.note-row', sheet).forEach((r) => r.remove());
    $$('.row', sheet).forEach((r) => r.classList.toggle('is-on', r.dataset.item === state.item));
    $$('.dish', sheet).forEach((b) => {
      const on = b.dataset.item === state.item;
      b.setAttribute('aria-expanded', String(on));
      if (on) b.setAttribute('aria-controls', 'notes'); else b.removeAttribute('aria-controls');
    });

    if (!state.item) {
      notes.hidden = true;
      notes.innerHTML = '';
      panel.appendChild(notes);
      bench.classList.remove('has-note');
      return;
    }

    const close = wide.matches ? 'Back to reading the list' : 'Close these notes';
    notes.innerHTML = dishNotes(data, state.item, state.day) +
      `<p class="note-back"><button type="button" class="link-btn" data-close>${close}</button></p>`;
    notes.hidden = false;
    notes.classList.remove('note');
    void notes.offsetWidth; // replay the short fade-in
    notes.classList.add('note');
    bench.classList.add('has-note');

    if (wide.matches) {
      panel.appendChild(notes);
    } else {
      const row = $(`.row[data-item="${state.item}"]`, sheet);
      const tr = document.createElement('tr');
      tr.className = 'note-row';
      const td = document.createElement('td');
      td.colSpan = 4;
      td.appendChild(notes);
      tr.appendChild(td);
      row.after(tr);
    }
  }

  function render() {
    sheet.innerHTML = sheetBody(data, state.day, true);
    renderTabs();
    renderInputs();
    placeNotes();
  }

  function setDay(d, { announce = true } = {}) {
    if (d === state.day) return;
    state.day = d;
    if (!reduce.matches) {
      sheet.classList.add('is-switching');
      render();
      requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.remove('is-switching')));
    } else {
      render();
    }
    if (announce) {
      const day = data.days[d];
      say(`${day.long}${day.holiday ? `, ${day.holiday}` : ''}.` +
        (state.item ? ` Notes for ${itemName(state.item)}.` : ''));
    }
  }

  function setItem(id) {
    state.item = id;
    placeNotes();
    if (id) {
      const r = data.items.find((i) => i.id === id).byDay[state.day];
      say(`Notes for ${itemName(id)}, ${data.days[state.day].long}.` +
        (r.pred != null ? ` Predicted ${r.pred}, prep ${r.prep}.` : ' Left blank.'));
    }
  }

  // Tabs: click, and arrow keys across the week.
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setDay(i));
    t.addEventListener('keydown', (e) => {
      const n = tabs.length;
      let j = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = n - 1;
      if (j === null) return;
      e.preventDefault();
      setDay(j);
      tabs[j].focus();
    });
  });

  // Dishes on the sheet.
  sheet.addEventListener('click', (e) => {
    const b = e.target.closest('.dish');
    if (b) {
      setItem(state.item === b.dataset.item ? null : b.dataset.item);
      return;
    }
    handleNoteClick(e);
  });
  panel.addEventListener('click', handleNoteClick);

  function handleNoteClick(e) {
    const wk = e.target.closest('.wk');
    if (wk) {
      setDay(+wk.dataset.day);
      $(`.wk[data-day="${state.day}"]`, notes)?.focus();
      return;
    }
    if (e.target.closest('[data-close]')) {
      const id = state.item;
      setItem(null);
      $(`.dish[data-item="${id}"]`, sheet)?.focus();
      return;
    }
    const tr = e.target.closest('[data-try]');
    if (tr) {
      state.item = tr.dataset.try;
      if (+tr.dataset.day !== state.day) setDay(+tr.dataset.day, { announce: false });
      setItem(tr.dataset.try);
      if (wide.matches) {
        $('.note-title', notes)?.focus({ preventScroll: true });
        const r = $(`.row[data-item="${state.item}"]`, sheet).getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight) {
          $(`.row[data-item="${state.item}"]`, sheet).scrollIntoView({ block: 'center', behavior: reduce.matches ? 'auto' : 'smooth' });
        }
      } else {
        $(`.row[data-item="${state.item}"]`, sheet).scrollIntoView({ block: 'start', behavior: reduce.matches ? 'auto' : 'smooth' });
        $('.note-title', notes)?.focus({ preventScroll: true });
      }
    }
  }

  // The reading guide is open beside the list on wide screens and folded
  // under it on phones, so the list and the way out stay close together.
  const fitLegend = () => { legend.open = wide.matches; };
  wide.addEventListener('change', () => { fitLegend(); placeNotes(); });
  fitLegend();
  $('#print')?.addEventListener('click', () => window.print());

  render();
}

/* ---------- contact form ---------- */
const form = $('#form');
if (form) {
  const send = $('#f-send');
  const box = $('#f-msg-box');
  const fields = [
    ['f-name', 'e-name', 'Please add your name.'],
    ['f-rest', 'e-rest', 'Please add your restaurant’s name.'],
    ['f-email', 'e-email', 'Please add an email we can reply to.'],
  ];

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
      e.target.removeAttribute('aria-invalid');
      const err = document.getElementById(e.target.getAttribute('aria-describedby'));
      if (err) err.textContent = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let first = null;
    for (const [id, errId, text] of fields) {
      const input = document.getElementById(id);
      const err = document.getElementById(errId);
      input.value = input.value.trim();
      const ok = input.checkValidity();
      input.toggleAttribute('aria-invalid', !ok);
      if (!ok) input.setAttribute('aria-invalid', 'true');
      err.textContent = ok ? '' : (input.type === 'email' && input.value ? 'That email doesn’t look right.' : text);
      if (!ok && !first) first = input;
    }
    if (first) { first.focus(); return; }

    const v = (n) => (form.elements[n]?.value || '').trim();
    const name = v('name');
    const email = v('email');

    const done = () => {
      form.classList.add('is-done');
      box.className = 'form-msg field-wide is-ok';
      box.innerHTML = `<strong>Thanks, ${esc(name)}.</strong> We have your note and will write back to ${esc(email)}.`;
      box.focus();
    };

    if (v('_honey')) { done(); return; } // a bot filled the hidden field

    send.disabled = true;
    send.textContent = 'Sending…';
    box.className = 'form-msg field-wide';
    box.textContent = '';
    try {
      const res = await fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          restaurant: v('restaurant'),
          email,
          phone: v('phone'),
          pos: v('pos'),
          message: v('message'),
          _subject: v('_subject'),
          _template: v('_template'),
          _captcha: v('_captcha'),
          _honey: '',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error('not sent');
      done();
    } catch {
      send.disabled = false;
      send.textContent = 'Send';
      box.className = 'form-msg field-wide is-bad';
      box.innerHTML = 'That didn’t go through. Please try again, or email us at <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>.';
      box.focus();
    }
  });
}
