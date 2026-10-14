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

  initJourney();
  initForm();

  /* ---------- The sideways tracking shot ---------- */
  function initJourney() {
    var journey = document.getElementById('journey');
    var track = document.getElementById('track');
    if (!journey || !track) return;

    var rooms = Array.prototype.slice.call(track.querySelectorAll('.room'));
    var N = rooms.length;
    var layers = rooms.map(function (room) {
      return Array.prototype.slice.call(room.querySelectorAll('[data-f]')).map(function (el) {
        return { el: el, f: parseFloat(el.getAttribute('data-f')) };
      });
    });
    var frontDoor = track.querySelector('.door-front');
    var threadPath = document.getElementById('thread-path');
    var threadHead = document.getElementById('thread-head');
    var sheetNums = Array.prototype.slice.call(track.querySelectorAll('.sheet b[data-n]'));

    var S = { tracking: false, u: 1, vw: 0, vh: 0, roomW: 0, Tmax: 0, Ti: [], r: 0, rTarget: 0, raf: 0 };
    var threadLen = 0, threadLut = [];

    if (threadPath && threadPath.getTotalLength) {
      threadLen = threadPath.getTotalLength();
      for (var s = 0; s <= 200; s++) {
        var l = threadLen * s / 200;
        threadLut.push({ l: l, x: threadPath.getPointAtLength(l).x });
      }
      threadPath.style.strokeDasharray = threadLen + ' ' + threadLen;
    }

    function measure() {
      S.vw = root.clientWidth;
      S.vh = window.innerHeight;
      S.tracking = motion && S.vw >= 900 && S.vh >= 560;
      root.classList.toggle('tracking', S.tracking);
      S.u = (S.tracking ? Math.min(S.vh * 1.6, S.vw) : S.vw) / 1440;
      root.style.setProperty('--u', S.u + 'px');
      S.roomW = 1440 * S.u;
      S.Tmax = Math.max(0, S.roomW * N - S.vw);
      S.Ti = rooms.map(function (_, i) {
        return clamp((i + 0.5) * S.roomW - S.vw / 2, 0, S.Tmax);
      });
      if (S.tracking) {
        /* about one screen of scrolling per room */
        journey.style.height = Math.round(S.vh * N) + 'px';
      } else {
        journey.style.height = '';
        track.style.transform = '';
        layers.forEach(function (ls) { ls.forEach(function (o) { o.el.style.transform = ''; }); });
        if (frontDoor) frontDoor.style.removeProperty('--a');
      }
    }

    /* each room centre is a soft detent: the move slows as a room settles */
    function detent(x) {
      var i = Math.floor(x), f = x - i;
      var sm = f * f * (3 - 2 * f);
      return i + 0.45 * f + 0.55 * sm;
    }

    function target() {
      var dist = journey.offsetHeight - S.vh;
      var p = dist > 0 ? clamp(-journey.getBoundingClientRect().top / dist, 0, 1) : 0;
      return detent(p * (N - 1));
    }

    function apply(r) {
      var i0 = Math.min(N - 1, Math.floor(r));
      var i1 = Math.min(N - 1, i0 + 1);
      var f = r - i0;
      var T = S.Ti[i0] + (S.Ti[i1] - S.Ti[i0]) * f;
      track.style.transform = 'translate3d(' + (-T).toFixed(2) + 'px,0,0)';

      for (var i = 0; i < N; i++) {
        var near = Math.abs(T - S.Ti[i]) < S.roomW * 1.6;
        if (!near) continue;
        var ls = layers[i];
        for (var k = 0; k < ls.length; k++) {
          var d = (1 - ls[k].f) * (T - S.Ti[i]);
          ls[k].el.style.transform = 'translate3d(' + d.toFixed(2) + 'px,0,0)';
        }
      }

      /* the front door opens as you step off the pavement */
      if (frontDoor) {
        var o = clamp((r - 0.06) / 0.5, 0, 1);
        o = 1 - Math.pow(1 - o, 2);
        frontDoor.style.setProperty('--a', (-86 + 72 * o).toFixed(1) + 'deg');
      }

      /* the night's sales run ahead of you, through the ceiling */
      if (threadLen) {
        var x = (T + S.vw * 0.85 - 2 * S.roomW) / S.u;
        var len = lengthAtX(x);
        threadPath.style.strokeDashoffset = (threadLen - len).toFixed(1);
        var pt = threadPath.getPointAtLength(len);
        threadHead.setAttribute('cx', pt.x.toFixed(1));
        threadHead.setAttribute('cy', pt.y.toFixed(1));
        threadHead.style.opacity = len > 2 ? '1' : '0';
      }

      for (var j = 0; j < N; j++) {
        if (Math.abs(r - j) < 0.3) play(j);
      }
    }

    function lengthAtX(x) {
      /* the path runs left to right, apart from its two vertical legs */
      if (x <= threadLut[0].x) return 0;
      var best = 0;
      for (var i = 0; i < threadLut.length; i++) {
        if (threadLut[i].x <= x + 0.5) best = threadLut[i].l; else break;
      }
      /* at the end, drop down onto the sheet */
      if (x >= threadLut[threadLut.length - 1].x) best = threadLen;
      return best;
    }

    var played = [];
    function play(i) {
      if (played[i]) return;
      played[i] = true;
      rooms[i].classList.add('on');
      if (rooms[i].classList.contains('r6')) countUp();
    }

    function countUp() {
      if (!motion) return;
      sheetNums.forEach(function (b, k) {
        var n = parseInt(b.getAttribute('data-n'), 10);
        var start = null, delay = 300 + k * 320, dur = 650;
        b.textContent = '0';
        function step(ts) {
          if (start === null) start = ts + delay;
          var t = clamp((ts - start) / dur, 0, 1);
          b.textContent = String(Math.round(n * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }

    function loop() {
      S.raf = 0;
      var diff = S.rTarget - S.r;
      if (Math.abs(diff) < 0.0008) S.r = S.rTarget;
      else S.r += diff * 0.14;
      apply(S.r);
      if (S.r !== S.rTarget) S.raf = requestAnimationFrame(loop);
    }

    function onScroll() {
      if (!S.tracking) return;
      S.rTarget = target();
      if (!S.raf) S.raf = requestAnimationFrame(loop);
    }

    function onResize() {
      measure();
      if (S.tracking) {
        S.rTarget = S.r = target();
        apply(S.r);
      }
    }

    measure();
    if (S.tracking) {
      S.rTarget = S.r = target();
      apply(S.r);
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      /* stills: play each room's detail when it comes into view */
      if (motion && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { play(rooms.indexOf(en.target)); io.unobserve(en.target); }
          });
        }, { threshold: 0.45 });
        rooms.forEach(function (rm) { io.observe(rm); });
      } else {
        rooms.forEach(function (_, i) { rooms[i].classList.add('on'); });
      }
    }

    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var was = S.tracking;
        onResize();
        if (was !== S.tracking) window.location.reload();
      }, 120);
    });

    /* the hero plays on load, once the type is in */
    var started = false;
    function go() {
      if (started) return;
      started = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () { play(0); }); });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 700);
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- Contact form ---------- */
  function initForm() {
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
  }
})();
