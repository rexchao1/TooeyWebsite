/* Tooey, exploration 31: light on porcelain.
   Ties each lit picture to the page: the street comes on as the page loads,
   the others follow the scroll. Then the contact form. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var params = new URLSearchParams(location.search);
  var forced = params.has('p') ? parseFloat(params.get('p')) : null;

  form();
  if (!window.TooeyLight) return;
  var T = window.TooeyLight, clamp = T.clamp, smooth = T.smooth;

  var scenes = [].map.call(document.querySelectorAll('.scene'), function (el) { return new T.Scene(el); });
  var hero = scenes[0];
  var what = document.querySelector('.what');
  var whatScenes = scenes.filter(function (s) { return s.el.classList.contains('scene-what'); });
  var closer = document.querySelector('.closer');
  var closerScene = scenes.filter(function (s) { return s.el.classList.contains('scene-closer'); })[0];
  var startScene = scenes.filter(function (s) { return s.el.classList.contains('scene-start'); })[0];

  /* the street switches on as the page loads, then carries on with the scroll */
  var t0 = null, LOAD = 2600, LOADED = 0.7;
  function heroP(vh) {
    if (!motion) return 1;
    var now = performance.now();
    var l = t0 === null ? 0 : clamp((now - t0) / LOAD, 0, 1);
    l = l * l * (3 - 2 * l);
    var sp = smooth(0.02, 0.5, window.scrollY / vh);
    return Math.max(l * LOADED, sp > 0 ? LOADED + (1 - LOADED) * sp : 0);
  }

  function sectionT(el, vh) {
    var r = el.getBoundingClientRect();
    return -r.top / Math.max(1, r.height - vh);
  }

  // What Tooey does: the light leaves one room and comes up in the next
  var KEYS = [
    { on: [-0.42, -0.04], off: [0.2, 0.28], show: [-1, -1], hide: [0.28, 0.34] },
    { on: [0.33, 0.46], off: [0.54, 0.61], show: [0.29, 0.34], hide: [0.61, 0.67] },
    { on: [0.66, 0.8], off: [9, 9], show: [0.62, 0.67], hide: [9, 9] }
  ];
  var active = -1;
  function stepWhat(vh) {
    var t = sectionT(what, vh);
    whatScenes.forEach(function (sc, i) {
      var k = KEYS[i];
      var p = motion ? smooth(k.on[0], k.on[1], t) * (1 - smooth(k.off[0], k.off[1], t)) : 1;
      var o = motion ? smooth(k.show[0], k.show[1], t) * (1 - smooth(k.hide[0], k.hide[1], t)) : 1;
      if (i === 0 && motion) o = 1 - smooth(k.hide[0], k.hide[1], t);
      sc.el.style.opacity = o.toFixed(3);
      if (forced !== null) p = forced;
      if (o > 0.001) sc.draw(p);
    });
    var a = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
    if (a !== active) { active = a; what.setAttribute('data-active', String(a)); }
  }

  function inView(el, vh) {
    var r = el.getBoundingClientRect();
    return r.bottom > -60 && r.top < vh + 60;
  }

  var animating = false;
  function frame() {
    var vh = window.innerHeight;
    if (hero && inView(hero.el, vh)) hero.draw(forced !== null ? forced : heroP(vh));
    if (what && inView(what, vh)) stepWhat(vh);
    if (closerScene && inView(closer, vh)) {
      var t = sectionT(closer, vh);
      closerScene.draw(forced !== null ? forced : motion ? clamp((t + 0.5) / 1.15, 0, 1) : 1);
    }
    if (startScene && inView(startScene.el, vh)) {
      var r = startScene.el.getBoundingClientRect();
      startScene.draw(forced !== null ? forced : motion ? clamp((vh * 0.9 - r.top) / (vh * 0.75), 0, 1) : 1);
    }
    if (animating) {
      if (t0 !== null && performance.now() - t0 > LOAD + 50) animating = false;
      requestAnimationFrame(frame);
    }
  }
  var queued = false;
  function request() {
    if (queued || animating) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; frame(); });
  }
  window.addEventListener('scroll', request, { passive: true });

  // build the pictures one after another, nearest first
  function buildAll() {
    var vh = window.innerHeight;
    var dist = function (s) { return Math.abs(s.el.getBoundingClientRect().top); };
    var order = [hero].concat(scenes.slice(1).sort(function (a, b) { return dist(a) - dist(b); }));
    var i = 0;
    (function next() {
      if (i >= order.length) { root.dataset.ready = '1'; request(); return; }
      var sc = order[i++];
      sc.build().then(function () {
        if (sc === hero && t0 === null) {
          t0 = performance.now();
          if (motion && forced === null) { animating = true; requestAnimationFrame(frame); }
        }
        request();
        // let the street finish switching on before the heavier work starts,
        // unless the reader is already scrolling down to the next pictures
        if (sc === hero && animating) holdUntilCalm(next);
        else setTimeout(next, 16);
      }, function (e) { console.error(e); setTimeout(next, 16); });
    })();
    return vh;
  }

  function holdUntilCalm(go) {
    var done = false;
    function fire() {
      if (done) return;
      done = true;
      window.removeEventListener('scroll', fire);
      setTimeout(go, 16);
    }
    window.addEventListener('scroll', fire, { passive: true });
    setTimeout(fire, LOAD + 150);
  }

  var fonts = document.fonts && document.fonts.load
    ? Promise.all([
        document.fonts.load('420 54px Literata'),
        document.fonts.load('400 34px "Source Serif 4"'),
        document.fonts.load('italic 400 34px "Source Serif 4"'),
        document.fonts.load('500 20px "Schibsted Grotesk"')
      ]).catch(function () {})
    : Promise.resolve();
  fonts.then(buildAll);

  var lastW = window.innerWidth, rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (window.innerWidth === lastW) { request(); return; }
      lastW = window.innerWidth;
      buildAll();
    }, 250);
  });

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
        say('error', 'Add your name, your restaurant and a working email, then send again.');
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
          encodeURIComponent('New Tooey inquiry') + '&amp;body=' + body + '">email instead</a>.');
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
