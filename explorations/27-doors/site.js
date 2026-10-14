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

  if (motion) journey();
  form();

  /* ---------------------------------------------------------------- */
  /* The walk. Openings follow the scroll; rooms play once on arrival. */
  function journey() {
    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
    var io = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
    var smooth = function (t) { return t * t * (3 - 2 * t); };
    var q = function (el, s) { return el.querySelector(s); };

    /* Hero: the street lights come on once the type is in. */
    var dining = q(document, '.r-dining');
    var lit = false;
    var light = function () { if (!lit) { lit = true; requestAnimationFrame(function () { requestAnimationFrame(function () { dining.classList.add('lit'); }); }); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(light);
    setTimeout(light, 700);

    var rooms = [];

    /* Origin of a layer's scale, as a point on its 1600 x 900 drawing. */
    function origin(layer, sx, sy) {
      layer.style.transform = 'none';
      var st = q(layer, '.stage').getBoundingClientRect();
      var lr = layer.getBoundingClientRect();
      layer.style.transformOrigin = (st.left - lr.left + sx / 1600 * st.width).toFixed(1) + 'px ' +
        (st.top - lr.top + sy / 900 * st.height).toFixed(1) + 'px';
    }

    function room(el, threshold, onPlay, setup, update) {
      var r = { el: el, threshold: threshold, onPlay: onPlay, setup: setup, update: update, p: -1, played: false };
      rooms.push(r);
      return r;
    }

    /* Room 1: front doors, host stand, a table. */
    (function () {
      var el = dining;
      var out = q(el, '.street'), leafL = q(el, '.leaf-l'), leafR = q(el, '.leaf-r');
      var hero = q(el, '.txt-hero'), host = q(el, '.d-host'), near = q(el, '.d-near');
      room(el, .8, null,
        function () { origin(out, 1080, 580); },
        function (p) {
          var a = io(seg(p, .05, .4));
          leafL.style.transform = 'rotateY(' + (a * 76).toFixed(2) + 'deg)';
          leafR.style.transform = 'rotateY(' + (-a * 76).toFixed(2) + 'deg)';
          hero.style.opacity = (1 - seg(p, .03, .18)).toFixed(3);
          var t = smooth(seg(p, .26, .66));
          out.style.transform = 'scale(' + Math.pow(8, t).toFixed(4) + ')';
          var o = 1 - seg(p, .56, .66);
          out.style.opacity = o.toFixed(3);
          out.style.visibility = o <= 0 ? 'hidden' : '';
          var h = io(seg(p, .58, .84));
          host.style.transform = 'translate(' + (620 * h).toFixed(1) + 'px,' + (110 * h).toFixed(1) + 'px) scale(' + (1 + .5 * h).toFixed(3) + ')';
          host.style.opacity = (1 - seg(p, .7, .84)).toFixed(3);
          near.style.transform = 'translateY(' + (200 * (1 - io(seg(p, .6, .86)))).toFixed(1) + 'px)';
        });
    })();

    /* Room 2: the till drawer opens. */
    (function () {
      var el = q(document, '.r-counter');
      var drawer = q(el, '.c-drawer'), glow = q(el, '.c-glow');
      room(el, .5, null, null, function (p) {
        var d = io(seg(p, .04, .48));
        drawer.style.transform = 'translateY(' + (210 * d).toFixed(1) + 'px)';
        glow.style.opacity = (.03 + .1 * d).toFixed(3);
      });
    })();

    /* Room 3: the kitchen door swings away. */
    (function () {
      var el = q(document, '.r-kitchen');
      var out = q(el, '.kdoor'), leaf = q(el, '.leaf-k'), spill = q(el, '.kd-spill');
      room(el, .62, null,
        function () { origin(out, 1120, 550); },
        function (p) {
          var a = io(seg(p, .03, .4));
          leaf.style.transform = 'rotateY(' + (a * 94).toFixed(2) + 'deg)';
          spill.style.opacity = (.35 + .65 * a).toFixed(3);
          var t = smooth(seg(p, .24, .6));
          out.style.transform = 'scale(' + Math.pow(7, t).toFixed(4) + ')';
          var o = 1 - seg(p, .5, .6);
          out.style.opacity = o.toFixed(3);
          out.style.visibility = o <= 0 ? 'hidden' : '';
        });
    })();

    /* Room 4: the prep sheet feeds off the printer and lands on the steel. */
    (function () {
      var el = q(document, '.r-prep');
      var out = q(el, '.printer'), paper = q(el, '.pt-paper'), sheet = q(el, '.sheet');
      var nums = el.querySelectorAll('.ps-n');
      room(el, .72,
        function () {
          nums.forEach(function (n, i) {
            var to = +n.getAttribute('data-n'), t0 = performance.now() + 200 + i * 350;
            n.textContent = '0';
            var step = function (now) {
              var k = clamp((now - t0) / 650, 0, 1);
              n.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
              if (k < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
        },
        /* The fed strip (x 1064 to 1176) grows until its edges sit where the
           sheet's edges are (x 760 to 1340): scale 580 / 112, about the point
           that maps one onto the other. Then the crisp sheet takes over. */
        function () { origin(out, 1136.7, 200); },
        function (p) {
          var f = io(seg(p, .02, .4));
          paper.style.transform = 'translateY(' + (-470 * f).toFixed(1) + 'px)';
          var t = io(seg(p, .36, .64));
          out.style.transform = 'scale(' + Math.pow(580 / 112, t).toFixed(4) + ')';
          var o = 1 - seg(p, .62, .7);
          out.style.opacity = o.toFixed(3);
          out.style.visibility = o <= 0 ? 'hidden' : '';
          sheet.style.opacity = seg(p, .6, .68).toFixed(3);
        });
    })();

    var vh = 0, raf = 0;

    function measure() {
      vh = window.innerHeight;
      rooms.forEach(function (r) {
        if (r.setup) r.setup();
        var b = r.el.getBoundingClientRect();
        r.top = b.top + window.scrollY;
        r.len = Math.max(1, b.height - vh);
        r.p = -1;
      });
      tick();
    }

    function tick() {
      raf = 0;
      var y = window.scrollY;
      rooms.forEach(function (r) {
        if (y + vh < r.top - vh * .5 || y > r.top + r.len + vh) return;
        var p = clamp((y - r.top) / r.len, 0, 1);
        if (p === r.p) return;
        r.p = p;
        r.update(p);
        if (!r.played && p >= r.threshold) {
          r.played = true;
          r.el.classList.add('played');
          if (r.onPlay) r.onPlay();
        }
      });
    }

    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 120); });
    window.addEventListener('load', measure);
    measure();
  }

  /* ---------------------------------------------------------------- */
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
      new FormData(f).forEach(function (v, k) { data[k] = String(v).trim(); });

      var missing = [];
      required.forEach(function (k) {
        var el = f.elements[k];
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
