(function () {
  'use strict';

  /* Header: hairline once the page moves */
  var top = document.querySelector('.top');
  if (top) {
    var onScroll = function () { top.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Phone menu */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.top')) setOpen(false);
    });
    window.matchMedia('(min-width: 881px)').addEventListener('change', function (m) {
      if (m.matches) setOpen(false);
    });
  }

  /* Overnight timetable: the row at mid-screen is "now" */
  var rail = document.querySelector('[data-rail]');
  if (rail && 'IntersectionObserver' in window) {
    var rows = rail.querySelectorAll('.tt__row');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          rows.forEach(function (r) { r.classList.toggle('is-now', r === entry.target); });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { io.observe(r); });
  } else if (rail) {
    rail.querySelectorAll('.tt__row').forEach(function (r) { r.classList.add('is-now'); });
  }

  /* The sheet: pointing at a key lights its column */
  var sheet = document.querySelector('[data-sheet]');
  var keys = document.querySelectorAll('.keys [data-key]');
  if (sheet && keys.length) {
    keys.forEach(function (k) {
      k.addEventListener('mouseenter', function () { sheet.setAttribute('data-active', k.getAttribute('data-key')); });
      k.addEventListener('mouseleave', function () { sheet.removeAttribute('data-active'); });
    });
  }

  /* Contact form: JSON to FormSubmit, with sending, sent, and failed states */
  var form = document.querySelector('[data-form]');
  if (form && window.fetch) {
    var status = form.querySelector('[data-status]');
    var submit = form.querySelector('[data-submit]');
    var required = ['name', 'restaurant', 'email'];
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    var say = function (cls, html) {
      status.className = 'form__status' + (cls ? ' ' + cls : '');
      status.innerHTML = html;
    };

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get('_honey')) return;

      var firstBad = null;
      required.forEach(function (name) {
        var input = form.elements[name];
        var v = String(data.get(name) || '').trim();
        var bad = !v || (name === 'email' && !emailOk(v));
        if (bad) {
          input.setAttribute('aria-invalid', 'true');
          if (!firstBad) firstBad = input;
        } else {
          input.removeAttribute('aria-invalid');
        }
      });
      if (firstBad) {
        say('is-err', 'Please add your name, your restaurant, and an email we can reply to.');
        firstBad.focus();
        return;
      }

      var payload = {};
      data.forEach(function (v, k) { payload[k] = typeof v === 'string' ? v.trim() : v; });

      submit.disabled = true;
      submit.textContent = 'Sending…';
      say('is-busy', 'Sending…');

      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok || String(body.success) !== 'true') throw new Error('not sent');
          });
        })
        .then(function () {
          form.reset();
          say('is-ok', 'Thanks. Your note is on its way to us, and one of us will reply from tooeyteam@gmail.com.');
          submit.textContent = 'Sent';
          setTimeout(function () { submit.disabled = false; submit.textContent = 'Send'; }, 4000);
        })
        .catch(function () {
          say('is-err', 'That didn’t go through. Please try again, or email us at <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>.');
          submit.disabled = false;
          submit.textContent = 'Send';
        });
    });
  }
})();
