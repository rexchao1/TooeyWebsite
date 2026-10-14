/* Tooey, exploration 30. The lights coming up is the motion: the hero
   switches on as the page loads, and every other scene is scrubbed by
   scroll. Plus the contact form. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var L = window.LightOnly;
  var clamp = L.clamp, smooth = L.smooth;
  var q = new URLSearchParams(location.search);

  /* ---------- scenes ---------- */
  var OPTS = {
    hero:  { src: 'img/counts.webp', fx: 0.5, fy: 0.62, zoom: 1.04, first: [0.42, 0.62] },
    prep:  { src: 'img/prep.webp',   fx: 0.3, fy: 0.5, zoom: 1.0, gamma: 0.82, first: [0.1, 0.2] },
    // the line: each station is its own pool, and they come on left to right
    line:  { src: 'img/line.webp', fx: 0.19, fy: 0.5, zoom: 1.0, gamma: 1.1, core: 0.38, glow: 0.75,
             pools: [[0.17, 0.44, 0.1, 0.4], [0.39, 0.46, 0.1, 0.4], [0.63, 0.48, 0.1, 0.4]],
             floor: 0.2, boost: 1.35,
             lights: [[0.17, 0.45], [0.39, 0.47], [0.63, 0.49]] },
    room:  { src: 'img/room.webp',   fx: 0.75, fy: 0.7, zoom: 1.0 },
    // the same Saturday at close: the light goes to what is left in each tray
    guess: { src: 'img/guess.webp', fx: 0.5, fy: 0.5, zoom: 0.93, gamma: 1.15, glow: 0.8,
             pools: [[0.23, 0.42, 0.13, 0.12], [0.53, 0.45, 0.12, 0.1], [0.74, 0.39, 0.06, 0.07]],
             floor: 0.42, boost: 1.15,
             lights: [[0.23, 0.42], [0.53, 0.45], [0.74, 0.39]] },
    tooey: { src: 'img/tooey.webp', fx: 0.5, fy: 0.5, zoom: 0.93, gamma: 1.15, glow: 0.8,
             pools: [[0.16, 0.42, 0.07, 0.08], [0.5, 0.39, 0.05, 0.08], [0.71, 0.39, 0.06, 0.07]],
             floor: 0.42, boost: 1.2,
             lights: [[0.16, 0.42], [0.5, 0.39], [0.71, 0.39]] }
  };
  var scenes = {};
  [].forEach.call(document.querySelectorAll('canvas[data-scene]'), function (cv) {
    var k = cv.dataset.scene;
    scenes[k] = new L.Scene(cv, OPTS[k]);
  });

  var hero = document.querySelector('.hero');
  var does = document.querySelector('.does');
  var closer = document.querySelector('.closer');
  var rows = [].slice.call(document.querySelectorAll('.row'));
  var sides = [document.querySelector('.side-guess'), document.querySelector('.side-tooey')];
  var stack = { prep: scenes.prep && scenes.prep.cv, line: scenes.line && scenes.line.cv, room: scenes.room && scenes.room.cv };

  // how far a pinned section has scrolled: 0 as it pins, 1 as it lets go
  function pinned(el, vh) {
    var r = el.getBoundingClientRect();
    return { t: clamp(-r.top / Math.max(1, r.height - vh), 0, 1), enter: clamp((vh - r.top) / vh, 0, 1), r: r };
  }

  var loadP = reduce ? 1 : 0, forced = q.has('p') ? parseFloat(q.get('p')) : null;
  function heroP(vh) {
    if (reduce) return 1;
    if (forced !== null) return forced;
    var s = clamp(window.scrollY / (vh * 0.7), 0, 1);
    return Math.min(1, loadP * 0.66 + s * 0.34);
  }

  function active(t) { return t < 0.39 ? 0 : t < 0.72 ? 1 : 2; }

  function frame() {
    var vh = window.innerHeight;
    if (scenes.hero) {
      var hr = hero.getBoundingClientRect();
      if (hr.bottom > -50) scenes.hero.draw(heroP(vh));
    }

    // What Tooey does: prep at first light, the line at the rush, the room filling
    var d = pinned(does, vh);
    if (d.r.bottom > -50 && d.r.top < vh + 50) {
      var t = d.t, a = active(t), pre = d.enter;
      var on = reduce ? [1, 1, 1] : [
        clamp(pre * 0.55 + smooth(0, 0.24, t) * 0.45, 0, 1),
        smooth(0.33, 0.62, t),
        smooth(0.66, 0.97, t)
      ];
      var show = reduce ? [a === 0, a === 1, a === 2].map(Number) : [
        1 - smooth(0.31, 0.42, t),
        smooth(0.31, 0.38, t) * (1 - smooth(0.64, 0.75, t)),
        smooth(0.64, 0.71, t)
      ];
      if (forced !== null) on = [forced, forced, forced];
      ['prep', 'line', 'room'].forEach(function (k, i) {
        if (!scenes[k]) return;
        stack[k].style.opacity = show[i].toFixed(3);
        stack[k].style.visibility = show[i] < 0.005 ? 'hidden' : 'visible';
        if (show[i] > 0.005) scenes[k].draw(on[i]);
      });
      rows.forEach(function (row, i) { row.classList.toggle('on', i === a); });
    }

    // Closer than a guess: the guess lights first, then Tooey's
    var c = pinned(closer, vh);
    if (c.r.bottom > -50 && c.r.top < vh + 50) {
      var tc = c.t, pre2 = c.enter;
      var g = reduce ? 1 : clamp(pre2 * 0.25 + smooth(0, 0.42, tc) * 0.75, 0, 1);
      var o = reduce ? 1 : smooth(0.38, 0.86, tc);
      if (forced !== null) g = o = forced;
      if (scenes.guess) scenes.guess.draw(g);
      if (scenes.tooey) scenes.tooey.draw(o);
      sides[0].classList.toggle('dim', !reduce && g < 0.3);
      sides[1].classList.toggle('dim', !reduce && o < 0.3);
    }
  }

  var queued = false;
  function tick() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; frame(); });
  }
  window.addEventListener('scroll', tick, { passive: true });

  // the hero's lights come up on load, about two and a half seconds
  function playHero() {
    if (reduce) { loadP = 1; tick(); return; }
    var t0 = null, dur = 2600;
    function step(now) {
      if (t0 === null) t0 = now;
      var u = clamp((now - t0) / dur, 0, 1);
      loadP = 1 - Math.pow(1 - u, 2.2);
      frame();
      if (u < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // build the hero first, then the rest in page order
  var order = ['hero', 'prep', 'line', 'room', 'guess', 'tooey'].filter(function (k) { return scenes[k]; });
  function buildAll() {
    var i = 0;
    return new Promise(function (done) {
      (function next() {
        if (i >= order.length) { done(); return; }
        var k = order[i++];
        scenes[k].build().then(function () {
          if (k === 'hero') playHero();
          tick();
          setTimeout(next, 30);
        }).catch(function (e) { console.error(e); setTimeout(next, 30); });
      })();
    });
  }
  function start() {
    buildAll().then(function () { root.dataset.ready = '1'; tick(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();

  var lastW = window.innerWidth, lastH = window.innerHeight, rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 120) { tick(); return; }
      lastW = window.innerWidth; lastH = window.innerHeight;
      order.forEach(function (k) { scenes[k].ready = false; });
      buildAll().then(tick);
    }, 250);
  });

  /* ---------- the form ---------- */
  var form = document.getElementById('form');
  if (!form) return;
  var status = document.getElementById('status');
  var btn = form.querySelector('button[type="submit"]');
  var MAIL = 'tooeyteam@gmail.com';

  function mailto(data) {
    var body = 'Name: ' + (data.name || '') + '\nRestaurant: ' + (data.restaurant || '') +
      '\nEmail: ' + (data.email || '') + (data.phone ? '\nPhone: ' + data.phone : '') +
      (data.pos ? '\nPOS: ' + data.pos : '') + (data.message ? '\n\n' + data.message : '');
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent('New Tooey inquiry') + '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    ['name', 'restaurant', 'email'].forEach(function (n) {
      var el = form.elements[n], ok = el.value.trim() !== '' && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.closest('.field').classList.toggle('bad', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      if (!ok && !bad) bad = el;
    });
    if (bad) {
      status.textContent = bad.name === 'email' && bad.value.trim() ? 'Check the email address.' : 'Add your name, restaurant and email.';
      bad.focus();
      return;
    }
    if (form.elements._honey.value) return;
    var data = {};
    [].forEach.call(form.elements, function (el) { if (el.name) data[el.name] = el.value.trim(); });
    btn.disabled = true;
    btn.textContent = 'Sending';
    status.textContent = '';
    fetch('https://formsubmit.co/ajax/' + MAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || String(res.j.success) !== 'true') throw new Error('send failed');
        form.reset();
        btn.textContent = 'Sent';
        status.textContent = 'Thanks. We will write back soon.';
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Send';
        status.innerHTML = '';
        status.append('That did not send. ');
        var a = document.createElement('a');
        a.href = mailto(data);
        a.textContent = 'Email ' + MAIL + ' instead';
        status.append(a, '.');
      });
  });
})();
