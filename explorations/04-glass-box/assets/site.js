/* Tooey — glass box exploration. Small, dependency-free.
   Everything here is an enhancement: without it the notes sit under the
   sample list, every worked example is shown, and the form posts normally. */
(function () {
  'use strict';


  /* ── Header: hairline once the page scrolls, phone menu ── */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 4); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function () { setMenu(false); });
  }

  /* ── Hero: place each note beside its row and draw a leader to it ── */
  var drawing = document.getElementById('drawing');
  var sheet = document.getElementById('sheet');
  var notes = document.getElementById('notes');
  var svg = document.getElementById('leaders');
  var wide = window.matchMedia('(min-width: 1000px)');
  var NS = 'http://www.w3.org/2000/svg';

  function clearNotes() {
    if (!notes) return;
    notes.style.height = '';
    notes.classList.remove('is-placed');
    Array.prototype.forEach.call(notes.children, function (li) { li.style.top = ''; });
    if (svg) svg.innerHTML = '';
  }

  function layoutNotes() {
    if (!drawing || !sheet || !notes || !svg) return;
    if (!wide.matches) { clearNotes(); return; }

    var d = drawing.getBoundingClientRect();
    var s = sheet.getBoundingClientRect();
    var n = notes.getBoundingClientRect();
    var notesTop = n.top - d.top;
    var prevBottom = -Infinity;
    var paths = [];

    notes.classList.add('is-placed');
    notes.style.height = s.height + 'px';

    Array.prototype.forEach.call(notes.children, function (li) {
      var target = document.getElementById(li.getAttribute('data-target'));
      if (!target) return;
      var row = target.closest('tr') || target;
      var r = row.getBoundingClientRect();
      var rowY = r.top + r.height / 2 - d.top;
      var firstLine = 12; // centre of the note's first line
      var top = Math.max(rowY - notesTop - firstLine, prevBottom + 18);
      li.style.top = top + 'px';
      prevBottom = top + li.offsetHeight;
      paths.push({
        li: li,
        target: target,
        sx: s.right - d.left,
        sy: rowY,
        nx: n.left - d.left,
        ny: notesTop + top + firstLine
      });
    });

    var lastBottom = prevBottom + notesTop;
    if (lastBottom > s.height) notes.style.height = (prevBottom) + 'px';

    svg.setAttribute('viewBox', '0 0 ' + d.width + ' ' + d.height);
    svg.innerHTML = '';
    paths.forEach(function (p, i) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('data-i', i);
      var path = document.createElementNS(NS, 'path');
      var midX = p.sx + 22;
      var d1 = 'M' + p.sx + ' ' + p.sy + ' H' + midX + ' L' + (p.nx - 22) + ' ' + p.ny + ' H' + (p.nx - 8);
      path.setAttribute('d', d1);
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', p.sx);
      dot.setAttribute('cy', p.sy);
      dot.setAttribute('r', 3);
      g.appendChild(path);
      g.appendChild(dot);
      svg.appendChild(g);
      p.g = g;
    });

    // Pointing at a note lights its value on the sheet, and the other way round.
    paths.forEach(function (p) {
      var on = function () { p.target.classList.add('is-lit'); p.g.classList.add('is-lit'); };
      var off = function () { p.target.classList.remove('is-lit'); p.g.classList.remove('is-lit'); };
      p.li.onmouseenter = on; p.li.onmouseleave = off;
      var row = p.target.closest('tr') || p.target;
      row.onmouseenter = on; row.onmouseleave = off;
    });
  }

  if (drawing) {
    var raf = 0;
    var schedule = function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(layoutNotes); };
    window.addEventListener('resize', schedule);
    wide.addEventListener('change', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    window.addEventListener('load', schedule);
    schedule();
  }

  /* ── Worked examples: tabs ── */
  var tablist = document.getElementById('tabs');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var k = e.key, next = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (k === 'ArrowUp' || k === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === 'Home') next = tabs[0];
        else if (k === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
    select(tabs[0], false);
  }

  /* ── Contact form ── */
  var form = document.getElementById('contact-form');
  if (form && window.fetch) {
    var status = document.getElementById('f-status');
    var send = document.getElementById('f-send');
    var setStatus = function (cls, html) {
      status.className = 'status' + (cls ? ' ' + cls : '');
      status.innerHTML = html;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = form.querySelectorAll('[required]');
      var firstBad = null;
      Array.prototype.forEach.call(required, function (el) {
        var ok = el.value.trim() !== '' && (el.type !== 'email' || /.+@.+\..+/.test(el.value.trim()));
        el.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !firstBad) firstBad = el;
      });
      if (firstBad) {
        setStatus('err', 'Please add your name, your restaurant, and an email we can reply to.');
        firstBad.focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });
      if (data._honey) return; // a bot filled the hidden field

      send.disabled = true;
      send.textContent = 'Sending…';
      setStatus('', 'Sending your message…');

      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) === 'true') {
            form.classList.add('is-sent');
            setStatus('ok', '<strong>Thanks, it’s sent.</strong> One of us will write back to ' + escapeHtml(data.email) + '.');
            status.setAttribute('tabindex', '-1');
            status.focus();
          } else {
            throw new Error('not sent');
          }
        })
        .catch(function () {
          setStatus('err', 'That didn’t go through. Please try again, or email <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a> directly.');
        })
        .then(function () {
          send.disabled = false;
          send.textContent = 'Send';
        });
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim() !== '') {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

})();
