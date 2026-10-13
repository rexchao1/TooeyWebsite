(function () {
  'use strict';

  var root = document.documentElement;

  /* Header rule once the page moves */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Phone menu */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) setOpen(false);
    });
  }

  /* Show only what works today: hide everything that isn't built */
  var switches = document.querySelectorAll('[data-built-switch]');
  var live = document.getElementById('built-live');
  if (switches.length) {
    var setBuilt = function (on) {
      root.classList.toggle('built-only', on);
      switches.forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      if (live) {
        live.textContent = on
          ? 'Showing only what works today. Everything not built yet is hidden.'
          : 'Showing the whole plan, built and not built.';
      }
    };
    switches.forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', function () {
        setBuilt(b.getAttribute('aria-pressed') !== 'true');
      });
    });
  }

  /* Contact form */
  var form = document.getElementById('contact-form');
  if (!form || !window.fetch) return;

  var card = form.closest('.form-wrap');
  var status = document.getElementById('form-status');
  var submit = document.getElementById('f-submit');
  var done = document.getElementById('form-done');
  var ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';

  var required = [
    { id: 'f-name', err: 'e-name', msg: 'Please add your name.' },
    { id: 'f-restaurant', err: 'e-restaurant', msg: 'Please add your restaurant.' },
    { id: 'f-email', err: 'e-email', msg: 'Please add an email we can reply to.' }
  ];

  function validate() {
    var first = null;
    required.forEach(function (f) {
      var input = document.getElementById(f.id);
      var err = document.getElementById(f.err);
      var value = input.value.trim();
      var bad = !value;
      var msg = f.msg;
      if (!bad && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        bad = true;
        msg = 'That email doesn’t look complete.';
      }
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      err.textContent = bad ? msg : '';
      if (bad && !first) first = input;
    });
    return first;
  }

  required.forEach(function (f) {
    var input = document.getElementById(f.id);
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') validate();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    var firstBad = validate();
    if (firstBad) {
      firstBad.focus();
      return;
    }

    var data = new FormData(form);
    if ((data.get('_honey') || '').toString().trim() !== '') return;

    var payload = {
      name: data.get('name').toString().trim(),
      restaurant: data.get('restaurant').toString().trim(),
      email: data.get('email').toString().trim(),
      phone: (data.get('phone') || '').toString().trim(),
      pos: (data.get('pos') || '').toString().trim(),
      message: (data.get('message') || '').toString().trim(),
      _subject: 'New Tooey inquiry',
      _template: 'table',
      _captcha: 'false',
      _honey: ''
    };

    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = 'Sending your message.';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || body.success === false || body.success === 'false') throw new Error('send failed');
        });
      })
      .then(function () {
        form.reset();
        status.textContent = '';
        card.classList.add('is-done');
        done.focus();
      })
      .catch(function () {
        status.className = 'form-status is-error';
        status.innerHTML = 'That didn’t go through. Your words are still here; try again, or email us at <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>.';
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = 'Send';
      });
  });
})();
