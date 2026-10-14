(function () {
  'use strict';
  window.__tooey = true;

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motion = root.classList.contains('motion');

  /* Phone menu */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    var close = function () {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Menu';
    };
    btn.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { close(); btn.focus(); }
    });
  }

  /* Hero: play once the type is in, so the light lands on real letters. */
  var counter = document.getElementById('counter');
  if (counter && motion) {
    var start = function () { counter.classList.add('play'); };
    var started = false;
    var go = function () { if (!started) { started = true; requestAnimationFrame(function () { requestAnimationFrame(start); }); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 900);
  }

  /* The light follows the cursor a little: shadows lean away from it. */
  var hero = document.querySelector('.hero');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (hero && counter && fine.matches && !reduce.matches) {
    var raf = 0, px = 0.5, py = 0.5;
    var apply = function () {
      raf = 0;
      counter.style.setProperty('--tx', ((0.5 - px) * 30).toFixed(2));
      counter.style.setProperty('--ty', ((0.5 - py) * 14).toFixed(2));
    };
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener('pointerleave', function () {
      counter.style.setProperty('--tx', '0');
      counter.style.setProperty('--ty', '0');
    });
  }

  /* Section figures play once, when most of them is in view. */
  var figs = document.querySelectorAll('[data-play]');
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('play'); io.unobserve(en.target); }
      });
    }, { threshold: 0.45 });
    figs.forEach(function (f) { io.observe(f); });
  } else {
    figs.forEach(function (f) { f.classList.add('play'); });
  }

  /* Contact form */
  var form = document.getElementById('form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');
  var required = ['name', 'restaurant', 'email'];
  var say = function (state, html) { status.dataset.state = state; status.innerHTML = html; };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

    var missing = [];
    required.forEach(function (k) {
      var el = form.elements[k];
      var bad = !data[k] || (k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[k]));
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) missing.push(el);
    });
    if (missing.length) {
      say('error', 'Add your name, restaurant, and a working email, then send again.');
      missing[0].focus();
      return;
    }
    if (data._honey) return;

    submit.disabled = true;
    submit.textContent = 'Sending';
    say('sending', 'Sending your message.');

    fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error('status ' + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || String(j.success) !== 'true') throw new Error('not accepted');
      form.reset();
      submit.textContent = 'Sent';
      say('sent', 'Sent. We will reply to ' + escapeHtml(data.email) + '.');
    }).catch(function () {
      submit.disabled = false;
      submit.textContent = 'Send message';
      var body = encodeURIComponent(
        'Name: ' + data.name + '\nRestaurant: ' + data.restaurant + '\nPhone: ' + (data.phone || '') +
        '\nPOS: ' + (data.pos || '') + '\n\n' + (data.message || ''));
      say('error', 'Not sent: the form service did not answer. Your words are still here. Send them by <a href="mailto:tooeyteam@gmail.com?subject=' +
        encodeURIComponent('New Tooey inquiry') + '&body=' + body + '">email instead</a>.');
    });
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
