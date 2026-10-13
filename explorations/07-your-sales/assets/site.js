// Small enhancements. Every page reads fine without this file.
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Phone menu ---------- */
  var navBtn = document.querySelector('.nav-btn');
  var navList = document.getElementById('nav-list');
  if (navBtn && navList) {
    navBtn.hidden = false;
    var setOpen = function (open) {
      navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      navList.classList.toggle('is-open', open);
      navBtn.querySelector('.nav-btn-label').textContent = open ? 'Close' : 'Menu';
    };
    navBtn.addEventListener('click', function () {
      setOpen(navBtn.getAttribute('aria-expanded') !== 'true');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navBtn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        navBtn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (navBtn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.nav')) setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  /* ---------- Hero card: read the past Tuesdays, then fill in the next ---------- */
  var card = document.querySelector('.cal[data-play]');
  if (card) {
    var start = function () { card.classList.add('is-on'); };
    if (reduce || !('IntersectionObserver' in window)) {
      start();
    } else {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          io.disconnect();
          var go = function () { requestAnimationFrame(start); };
          if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
        }
      }, { threshold: 0.25 });
      io.observe(card);
    }
  }

  /* ---------- The four readings of the year ledger ---------- */
  var ledger = document.getElementById('ledger');
  var items = document.querySelectorAll('.rd[data-reading]');
  if (ledger && items.length) {
    var buttons = [];
    // On a phone the year is one strip you swipe; take it to the part of
    // the year each reading is about (in weeks from the start of the record).
    var strip = ledger.querySelector('.lg-scroll');
    var where = { week: 0, year: 12, holidays: 16, dish: 40 };
    var moveStrip = function (name) {
      if (!strip || strip.scrollWidth <= strip.clientWidth + 4) return;
      var cell = strip.querySelector('.lg-grid .c');
      var col = cell ? cell.getBoundingClientRect().width : 30;
      var wk = where[name] || 0;
      var first = strip.querySelector('.lg-half');
      var x = wk < 27 ? first.offsetLeft + wk * col : strip.querySelectorAll('.lg-half')[1].offsetLeft + (wk - 27) * col;
      var lab = strip.querySelector('.lg-pin').offsetWidth;
      strip.scrollTo({ left: Math.max(0, x - lab - col), behavior: reduce ? "auto" : "smooth" });
    };
    var choose = function (name, user) {
      ledger.setAttribute('data-reading', name);
      if (user) moveStrip(name);
      items.forEach(function (li, n) {
        var on = li.getAttribute('data-reading') === name;
        li.classList.toggle('is-on', on);
        buttons[n].setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    };
    items.forEach(function (li, n) {
      var h = li.querySelector('.rd-t');
      var body = li.querySelector('.rd-b');
      body.id = 'rd-b-' + n;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rd-btn';
      b.textContent = h.textContent;
      b.setAttribute('aria-controls', 'ledger');
      b.setAttribute('aria-describedby', body.id);
      h.textContent = '';
      h.appendChild(b);
      b.addEventListener('click', function () { choose(li.getAttribute('data-reading'), true); });
      buttons.push(b);
    });
    var hint = document.createElement('p');
    hint.className = 'rd-hint';
    hint.textContent = 'Choose one to see it in the numbers.';
    items[0].parentNode.insertAdjacentElement('afterend', hint);
    choose(ledger.getAttribute('data-reading') || 'week');
  }

  /* ---------- Key beside the sample list lights its column ---------- */
  var sheet = document.getElementById('sheet');
  if (sheet) {
    document.querySelectorAll('.key-i[data-col], .key-blank[data-col]').forEach(function (k) {
      k.addEventListener('mouseenter', function () {
        sheet.setAttribute('data-hi', k.getAttribute('data-col'));
        k.classList.add('is-hi');
      });
      k.addEventListener('mouseleave', function () {
        sheet.removeAttribute('data-hi');
        k.classList.remove('is-hi');
      });
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('talk-form');
  if (form && window.fetch) {
    var status = form.querySelector('.f-status');
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.querySelector('.btn-label');

    var clearErr = function (input) {
      input.removeAttribute('aria-invalid');
      var err = document.getElementById(input.id + '-err');
      if (err) err.remove();
      input.removeAttribute('aria-describedby');
    };
    var showErr = function (input, msg) {
      input.setAttribute('aria-invalid', 'true');
      var err = document.createElement('p');
      err.className = 'f-err';
      err.id = input.id + '-err';
      err.textContent = msg;
      input.insertAdjacentElement('afterend', err);
      input.setAttribute('aria-describedby', err.id);
    };
    form.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) clearErr(el); });
    });

    var check = function () {
      var first = null;
      form.querySelectorAll('[required]').forEach(function (el) {
        clearErr(el);
        var msg = '';
        if (!el.value.trim()) msg = 'Please fill this in.';
        else if (el.type === 'email' && !el.checkValidity()) msg = 'This doesn’t look like an email address.';
        if (msg) {
          showErr(el, msg);
          if (!first) first = el;
        }
      });
      if (first) first.focus();
      return !first;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('is-err');
      if (!check()) return;

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });

      // A filled honeypot means a bot. Look sent, send nothing.
      if (data._honey) { done(data); return; }

      btn.disabled = true;
      label.textContent = 'Sending…';
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (json) {
          if (json && (json.success === true || json.success === 'true')) done(data);
          else throw new Error('Not sent');
        })
        .catch(function () {
          btn.disabled = false;
          label.textContent = 'Send';
          status.classList.add('is-err');
          status.innerHTML = '';
          status.appendChild(document.createTextNode('That didn’t go through. Please try again, or email us at '));
          var a = document.createElement('a');
          a.href = 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('Tooey: ' + (data.restaurant || 'a restaurant'));
          a.textContent = 'tooeyteam@gmail.com';
          status.appendChild(a);
          status.appendChild(document.createTextNode('.'));
        });
    });

    function done(data) {
      var box = document.createElement('div');
      box.className = 'sent';
      box.setAttribute('tabindex', '-1');
      var h = document.createElement('h3');
      h.textContent = 'Thanks' + (data.name ? ', ' + data.name.split(' ')[0] : '') + '.';
      var p = document.createElement('p');
      p.textContent = 'Your note is with us. One of us will write back to ' + (data.email || 'you') + '.';
      box.appendChild(h);
      box.appendChild(p);
      form.replaceWith(box);
      box.focus();
    }
  }
})();
