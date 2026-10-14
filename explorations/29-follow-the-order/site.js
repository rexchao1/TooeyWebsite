(function () {
  'use strict';
  window.__tooey = true;

  var root = document.documentElement;
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

  /* ---------- The journey ---------- */
  var rooms = [].slice.call(document.querySelectorAll('[data-room]'));
  if (rooms.length) journey();

  function journey() {
    var stills = rooms.map(function (r) { return r.querySelector('.still'); });
    var played = [];
    var wide = window.matchMedia('(min-width: 901px)');

    if (!motion) {
      rooms.forEach(function (r) { r.classList.add('play'); });
      return;
    }

    /* Narrow screens: no traveler, each room plays when it comes into view. */
    var io = null;
    function watchRooms() {
      if (io || !('IntersectionObserver' in window)) return;
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('play'); io.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      rooms.forEach(function (r) { if (!r.classList.contains('play')) io.observe(r); });
    }

    /* Build the traveler from the stills, so there is one source for each form. */
    var tr = document.createElement('div');
    tr.className = 'traveler';
    tr.setAttribute('aria-hidden', 'true');
    tr.innerHTML = '<div class="t-move"><div class="t-in"><div class="t-flip"><div class="face front"></div><div class="face back"></div></div></div></div>';
    var move = tr.firstChild, tin = move.firstChild, flip = tin.firstChild;
    var check = stills[1].querySelector('.check').cloneNode(true);
    var ticket = stills[2].querySelector('.ticket').cloneNode(true);
    var spark = stills[3].querySelector('.spark').cloneNode(true);
    var sheet = stills[5].querySelector('.sheet').cloneNode(true);
    flip.children[0].appendChild(check);
    flip.children[1].appendChild(ticket);
    tin.appendChild(spark);
    tin.appendChild(sheet);
    document.body.appendChild(tr);
    var rowMain = sheet.querySelector('.row-main');
    var heroScene = rooms[0].querySelector('.scene');
    var scenes = rooms.map(function (r) { return r.querySelector('.scene'); });

    var A = [], P = [], rowBand = { top: 0, bottom: 0, h: 1, mid: 0 };
    var on = false, lit = false;

    function measure() {
      var sy = window.scrollY, vh = window.innerHeight;
      A = rooms.map(function (r, i) {
        if (i === 0) return 0;
        var b = r.getBoundingClientRect();
        return b.top + sy + b.height / 2 - vh / 2;
      });
      P = stills.map(function (s) {
        var cs = getComputedStyle(s);
        return { r: parseFloat(cs.getPropertyValue('--r')) || 0, s: parseFloat(cs.getPropertyValue('--s')) || 1 };
      });
      var h = sheet.offsetHeight;
      rowBand = {
        h: h,
        top: rowMain.offsetTop,
        bottom: h - (rowMain.offsetTop + rowMain.offsetHeight),
        mid: rowMain.offsetTop + rowMain.offsetHeight / 2 - h / 2
      };
    }

    function setMode() {
      var want = wide.matches;
      if (want === on) return;
      on = want;
      root.classList.toggle('travel', on);
      if (on) { measure(); frame(); }
      else {
        heroScene.style.transform = '';
        heroScene.style.opacity = '';
        scenes.forEach(function (s) { s.style.transform = ''; });
        watchRooms();
      }
    }

    function play(i) {
      if (played[i]) return;
      played[i] = true;
      rooms[i].classList.add('play');
      tr.classList.add('t-p' + i);
      if (i === 4) tick();
    }

    /* Counts on the sheet run up as each row prints. */
    function tick() {
      var bs = sheet.querySelectorAll('li:not(.row-main) b');
      [].forEach.call(bs, function (b, k) {
        var end = parseInt(b.textContent, 10), t0 = null, delay = 350 + k * 280, dur = 700;
        b.textContent = '0';
        function step(ts) {
          if (t0 === null) t0 = ts + delay;
          var u = Math.min(1, Math.max(0, (ts - t0) / dur));
          b.textContent = String(Math.round(end * (1 - Math.pow(1 - u, 3))));
          if (u < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }

    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function smooth(v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function center(el) {
      var b = el.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    }

    function frame() {
      raf = 0;
      if (!on) return;
      var y = window.scrollY, vh = window.innerHeight, last = A.length - 1;

      var i = 0;
      while (i < last && y >= A[i + 1]) i++;
      var t = i < last ? clamp((y - A[i]) / (A[i + 1] - A[i]), 0, 1) : 0;
      var w = smooth((t - 0.12) / 0.76);
      var g = i + w;
      var j = Math.min(i + 1, last);

      /* Path: from this room's spot to the next, turning on the way. */
      var c0 = center(stills[i]), c1 = center(stills[j]);
      var arc = Math.sin(Math.PI * w);
      var x = lerp(c0.x, c1.x, w);
      var yy = lerp(c0.y, c1.y, w);
      var rot = lerp(P[i].r, P[j].r, w) + arc * 14 * (i % 2 ? 1 : -1);
      var sc = lerp(P[i].s, P[j].s, w) * (1 + 0.08 * arc);
      move.style.transform = 'translate(' + x.toFixed(1) + 'px,' + yy.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';

      /* Forms. 1 to 2: the check turns over into the ticket. */
      var u = clamp(g - 1, 0, 1);
      var v = clamp(g - 2, 0, 1);
      var z = clamp(g - 3, 0, 1);
      var shrink = 1 - smooth(v / 0.6);
      flip.style.transform = 'perspective(1000px) rotateY(' + (180 * u).toFixed(1) + 'deg) scale(' + Math.max(shrink, 0.001).toFixed(3) + ',' + Math.max(shrink * shrink, 0.001).toFixed(3) + ')';
      flip.style.opacity = g < 2.6 ? 1 : 0;
      flip.style.filter = v > 0 ? 'brightness(' + (1 + v * 1.4).toFixed(2) + ')' : '';

      /* 2 to 3: it folds into a point of light. 3 to 4: the light draws a line, and the sheet prints around it. */
      var sparkOn = g < 3 ? smooth((v - 0.3) / 0.3) : 1 - smooth((z - 0.5) / 0.25);
      var stretch = 1 + 17 * smooth((z - 0.1) / 0.35);
      var lift = rowBand.mid * smooth(z / 0.3);
      spark.style.opacity = sparkOn.toFixed(3);
      spark.style.transform = 'translateY(' + lift.toFixed(1) + 'px) scale(' + stretch.toFixed(2) + ',' + (1 - 0.6 * smooth((z - 0.1) / 0.35)).toFixed(2) + ')';

      var open = g >= 4 ? 1 : smooth((z - 0.4) / 0.45);
      var shown = g >= 3.38;
      sheet.style.opacity = shown ? 1 : 0;
      sheet.style.clipPath = open >= 1 ? '' : 'inset(' + (rowBand.top * (1 - open)).toFixed(1) + 'px -60px ' + (rowBand.bottom * (1 - open)).toFixed(1) + 'px -60px)';
      if (shown && !lit && z > 0.42) { lit = true; rowMain.classList.add('lit'); }

      /* Arrivals: each room's detail plays once. */
      for (var k = 1; k <= last; k++) {
        if (!played[k] && g >= k - 0.06) play(k);
      }

      /* The street: walking up to the door and through it. */
      var hh = rooms[0].offsetHeight;
      var q = clamp(y / (hh * 0.9), 0, 1);
      heroScene.style.transform = 'scale(' + (1 + q * 1.2).toFixed(3) + ')';
      heroScene.style.opacity = (1 - q * 0.95).toFixed(3);

      /* The rooms drift a little slower than the text. */
      for (var n = 1; n < scenes.length; n++) {
        var b = rooms[n].getBoundingClientRect();
        if (b.bottom < -200 || b.top > vh + 200) continue;
        var off = (b.top + b.height / 2 - vh / 2) * -0.1;
        scenes[n].style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      }
    }

    var raf = 0;
    function req() { if (!raf) raf = requestAnimationFrame(frame); }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { setMode(); if (on) { measure(); req(); } });
    if (wide.addEventListener) wide.addEventListener('change', setMode);

    var started = false;
    function start() {
      if (started) return;
      started = true;
      setMode();
      if (!on) watchRooms();
      requestAnimationFrame(function () { requestAnimationFrame(function () { play(0); }); });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    setTimeout(start, 900);
    window.addEventListener('load', function () { if (on) { measure(); req(); } });
  }

  /* ---------- Contact form ---------- */
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
