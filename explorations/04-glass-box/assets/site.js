/* Tooey — glass box exploration. Small, dependency-free.
   Everything here is an enhancement: without it the diagram shows without
   wires, every worked example is shown, and the form posts normally. */
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

  /* ── Hero: draw the wires. Four inputs run into the glass box, one line
        comes out and runs down the list as a rail. Wide screens run left to
        right; narrow screens run top to bottom. ── */
  var fig = document.getElementById('machine');
  var svg = document.getElementById('wires');
  var glass = document.getElementById('glass');
  var list = document.getElementById('list');
  var wide = window.matchMedia('(min-width: 1180px)');
  var NS = 'http://www.w3.org/2000/svg';

  function rel(el, f) {
    var r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - f.left, y: r.top + r.height / 2 - f.top,
      left: r.left - f.left, right: r.right - f.left, top: r.top - f.top, bottom: r.bottom - f.top,
      w: r.width, h: r.height
    };
  }
  function path(d, color, width, cls) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', width);
    if (cls) p.setAttribute('class', cls);
    svg.appendChild(p);
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function drawWires() {
    if (!fig || !svg || !glass || !list) return;
    var f = fig.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + f.width + ' ' + f.height);
    svg.innerHTML = '';

    var g = rel(glass, f);
    var stations = list.querySelectorAll('.stn');
    if (!stations.length) return;
    var first = rel(stations[0], f);
    var last = rel(stations[stations.length - 1], f);
    var railX = first.x;
    var ink = css('--ink');
    var off = css('--off');
    var nodes = fig.querySelectorAll('.feeds .node');

    if (wide.matches) {
      // inputs enter the left edge, meet at the right edge, level with the first dish
      var exitY = first.y;
      Array.prototype.forEach.call(nodes, function (n) {
        var p = rel(n, f);
        var c = getComputedStyle(n).backgroundColor;
        var gw = g.right - g.left;
        path('M' + p.x + ' ' + p.y + ' H' + g.left +
             ' C' + (g.left + gw * 0.55) + ' ' + p.y + ' ' + (g.right - gw * 0.45) + ' ' + exitY + ' ' + g.right + ' ' + exitY,
             c, 3);
      });
      path('M' + g.right + ' ' + exitY + ' H' + railX + ' V' + last.y, ink, 3.5);
      // unplugged inputs: a short lead that stops, with a plug end
      fig.querySelectorAll('.off-list .ring').forEach(function (r) {
        var p = rel(r, f);
        var x0 = p.right + 2, x1 = p.right + 30;
        path('M' + x0 + ' ' + p.y + ' H' + x1 + ' M' + x1 + ' ' + (p.y - 6) + ' V' + (p.y + 6), off, 2);
      });
    } else {
      // inputs drop into the top of the box, run behind the nameplate,
      // and meet at the bottom edge above the list's rail
      var bend = Math.min(44, (g.bottom - g.top) * 0.3);
      Array.prototype.forEach.call(nodes, function (n) {
        var p = rel(n, f);
        var c = getComputedStyle(n).backgroundColor;
        var yb = g.bottom - bend;
        path('M' + p.x + ' ' + p.y + ' V' + yb +
             ' C' + p.x + ' ' + (yb + bend * 0.6) + ' ' + railX + ' ' + (g.bottom - bend * 0.4) + ' ' + railX + ' ' + g.bottom,
             c, 3);
      });
      path('M' + railX + ' ' + g.bottom + ' V' + last.y, ink, 3.5);
    }
  }

  if (fig) {
    var raf = 0;
    var schedule = function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawWires); };
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
