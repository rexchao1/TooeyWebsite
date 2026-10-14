(function () {
  'use strict';
  window.__tooey = true;

  var root = document.documentElement;
  var motion = root.classList.contains('motion');

  /* Phone menu */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    var closeNav = function () {
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
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeNav(); btn.focus(); }
    });
  }

  if (document.querySelector('.walk')) walk();
  form();

  /* ------------------------------------------------------------------
     The walk. Every plane was drawn for one camera stop; the camera moves
     with the scroll and each plane is scaled and shifted as a flat card at
     its depth would be. Walls split at their doorway and part as you pass.
     ------------------------------------------------------------------ */
  function walk() {
    var rooms = [].slice.call(document.querySelectorAll('.room'));
    if (!motion) {
      rooms.forEach(function (r) { r.classList.add('here'); });
      return;
    }

    // Camera stops: x, y in drawing px at unit distance, z in depth units. Same as build.py.
    var STOPS = [[0, 0, 0], [0, 0, 1], [-141.4, 7, 1.55], [0, 0, 2.1], [16.4, -20.7, 2.664]];
    // Keys along the scroll, in screens. Each channel eases between its own keys.
    var KZ = [[0, 0], [0.3, 0], [1.4, 1], [1.65, 1], [2.35, 1.55], [2.6, 1.55], [3.65, 2.1], [3.9, 2.1], [4.6, 2.664], [5, 2.664]];
    var KX = [[0, 0], [1.65, 0], [2.35, -141.4], [2.6, -141.4], [2.92, 0], [3.9, 0], [4.6, 16.4], [5, 16.4]];
    var KY = [[0, 0], [1.65, 0], [2.35, 7], [2.6, 7], [2.92, 0], [3.9, 0], [4.6, -20.7], [5, -20.7]];
    var DWELL = [[0, 0.3], [1.4, 1.65], [2.35, 2.6], [3.65, 3.9], [4.6, 5]];
    var TRACK = 5;

    var walkEl = document.querySelector('.walk');
    var stage = document.querySelector('.stage');
    var layers = [];
    var doors = [];
    var copies = [].slice.call(document.querySelectorAll('.copy')).map(function (el) {
      return { el: el, stop: +el.dataset.stop, z: STOPS[+el.dataset.stop][2] };
    });

    [].slice.call(document.querySelectorAll('.plane')).forEach(function (el) {
      var cam = STOPS[+el.dataset.cam];
      var base = { z: +el.dataset.z, ax: cam[0], ay: cam[1], az: cam[2], fade: el.classList.contains('fade'),
                   until: el.dataset.until ? +el.dataset.until : null };
      if (el.dataset.split) {
        // Split the wall at its doorway into a left and a right half.
        var cut = +el.dataset.split / 16;
        var part = el.dataset.part.split(',').map(Number);
        var left = el.cloneNode(true);
        left.style.clipPath = 'inset(-400% ' + (100 - cut) + '% -400% -400%)';
        el.style.clipPath = 'inset(-400% -400% -400% ' + cut + '%)';
        el.parentNode.insertBefore(left, el);
        layers.push(Object.assign({ el: left, side: -1, part: part }, base));
        layers.push(Object.assign({ el: el, side: 1, part: part }, base));
        var open = el.dataset.open.split(',').map(Number);
        [left, el].forEach(function (half) {
          [].slice.call(half.querySelectorAll('.leaf')).forEach(function (leaf) {
            var sign = leaf.classList.contains('leaf-l') ? 1 : -1;
            doors.push({ el: leaf, open: open, sign: sign, last: -1 });
          });
        });
      } else {
        layers.push(Object.assign({ el: el, side: 0 }, base));
      }
    });
    layers.forEach(function (L) { L.vis = true; L.last = ''; L.op = -1; });

    var vh = 0, bw = 0, k = 1, top = 0;
    function measure() {
      vh = window.innerHeight;
      walkEl.style.height = Math.round((TRACK + 1) * vh) + 'px';
      var sw = stage.clientWidth, sh = stage.clientHeight || vh;
      bw = Math.max(sw, sh * 1.6);
      k = bw / 1600;
      top = walkEl.getBoundingClientRect().top + window.pageYOffset;
    }

    function smooth(f) { return f * f * (3 - 2 * f); }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function sample(K, u) {
      if (u <= K[0][0]) return K[0][1];
      for (var i = 0; i < K.length - 1; i++) {
        if (u <= K[i + 1][0]) {
          var f = (u - K[i][0]) / (K[i + 1][0] - K[i][0]);
          return K[i][1] + (K[i + 1][1] - K[i][1]) * smooth(f);
        }
      }
      return K[K.length - 1][1];
    }

    function target() { return clamp((window.pageYOffset - top) / vh, 0, TRACK); }

    var u = target(), goal = u, raf = 0, lastT = 0;
    var played = rooms.map(function () { return false; });

    function render() {
      var cz = sample(KZ, u), cx = sample(KX, u), cy = sample(KY, u);
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i], d = L.z - cz;
        var hide = d < 0.02 || d > 2.3 || (L.until !== null && cz > L.until);
        if (hide) {
          if (L.vis) { L.el.style.visibility = 'hidden'; L.vis = false; }
          continue;
        }
        if (!L.vis) { L.el.style.visibility = ''; L.vis = true; }
        var s = (L.z - L.az) / d;
        var tx = (L.ax - cx) / d * k, ty = (L.ay - cy) / d * k;
        if (L.side) {
          var p = clamp((cz - L.part[0]) / (L.part[1] - L.part[0]), 0, 1);
          tx += L.side * p * p * bw * 0.9;
        }
        var t = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
        if (t !== L.last) { L.el.style.transform = t; L.last = t; }
        var op = L.fade ? clamp((d - 0.02) / 0.07, 0, 1) : 1;
        if (op !== L.op) { L.el.style.opacity = op; L.op = op; }
      }
      for (var j = 0; j < doors.length; j++) {
        var D = doors[j];
        var a = smooth(clamp((cz - D.open[0]) / (D.open[1] - D.open[0]), 0, 1)) * 84;
        if (Math.abs(a - D.last) > 0.05) { D.el.style.transform = 'rotateY(' + (D.sign * a).toFixed(2) + 'deg)'; D.last = a; }
      }
      for (var c = 0; c < copies.length; c++) {
        var C = copies[c], w = DWELL[C.stop];
        var away = u < w[0] ? w[0] - u : u > w[1] ? u - w[1] : 0;
        var o = clamp(1 - (away - 0.03) / 0.16, 0, 1);
        var dz = cz - C.z;
        var sc = 0.5 / (0.5 - clamp(dz, -1, 0.3));
        C.el.style.opacity = o.toFixed(3);
        C.el.style.transform = 'scale(' + sc.toFixed(4) + ')';
        C.el.style.visibility = o < 0.02 ? 'hidden' : '';
        if (!played[C.stop] && away < 0.12 && C.stop > 0) {
          played[C.stop] = true;
          rooms[C.stop].classList.add('here');
          if (C.stop === 4) countUp(rooms[4]);
        }
      }
    }

    function tick(now) {
      var dt = lastT ? Math.min(64, now - lastT) : 16;
      lastT = now;
      goal = target();
      var diff = goal - u;
      u += diff * (1 - Math.exp(-dt / 110));
      if (Math.abs(diff) < 0.0005) u = goal;
      render();
      if (u !== goal) raf = requestAnimationFrame(tick);
      else { raf = 0; lastT = 0; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    measure();
    u = goal = target();
    render();
    root.classList.add('ready');
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', function () { measure(); kick(); render(); });

    // The street lights come on as the page opens.
    var lit = false;
    function light() { if (!lit) { lit = true; rooms[0].classList.add('here'); played[0] = true; } }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(light); });
    setTimeout(light, 700);

    // Links to a room scroll to where you stand in it.
    function stopFor(id) {
      for (var i = 0; i < rooms.length; i++) if (rooms[i].id === id) return i;
      return -1;
    }
    function goTo(i, smoothScroll) {
      var y = top + (DWELL[i][0] + (i ? 0.06 : 0)) * vh;
      window.scrollTo({ top: y, behavior: smoothScroll ? 'smooth' : 'auto' });
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var i = stopFor(a.getAttribute('href').slice(1));
      if (i < 0) return;
      e.preventDefault();
      goTo(i, true);
      history.replaceState(null, '', a.getAttribute('href'));
    });
    if (location.hash) {
      var i0 = stopFor(location.hash.slice(1));
      if (i0 >= 0) setTimeout(function () { goTo(i0, false); }, 0);
    }
  }

  function countUp(room) {
    [].slice.call(room.querySelectorAll('[data-count]')).forEach(function (el) {
      var end = +el.dataset.count;
      var delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      var start = null, dur = 520;
      el.textContent = '0';
      setTimeout(function () {
        requestAnimationFrame(function step(t) {
          if (start === null) start = t;
          var f = Math.min(1, (t - start) / dur);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - f, 3))));
          if (f < 1) requestAnimationFrame(step);
        });
      }, delay * 1000);
    });
  }

  /* Contact form */
  function form() {
    var f = document.getElementById('form');
    if (!f) return;
    var status = document.getElementById('form-status');
    var submit = f.querySelector('button[type="submit"]');
    var required = ['name', 'restaurant', 'email'];
    var say = function (state, html) { status.dataset.state = state; status.innerHTML = html; };

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(f).forEach(function (v, key) { data[key] = String(v).trim(); });

      var missing = [];
      required.forEach(function (key) {
        var el = f.elements[key];
        var bad = !data[key] || (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[key]));
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
        f.reset();
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
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
