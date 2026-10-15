/* Tooey, exploration 34: the lit room.
   Draws the rooms, then lights them: the street on load, each room as it
   scrolls in, and, with a mouse, the pointer as a lamp. Then the form. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var params = new URLSearchParams(location.search);
  var hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // the lamp needs a mouse; touch, keyboard and reduced motion get the rooms lit
  var canLamp = motion && hover && !params.has('lit');
  var lampMode = canLamp;
  if (lampMode) root.classList.add('lamp');

  form();
  if (!window.TooeyScenes) return;
  var S = window.TooeyScenes;

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- draw ---------- */
  var scenes = [].map.call(document.querySelectorAll('.scene[data-scene]'), function (fig) {
    var D = S[fig.getAttribute('data-scene')]();
    var art = fig.querySelector('.art');
    art.innerHTML = D.svg('base') + D.svg('full full-all') +
      '<div class="spot">' + D.svg('full') + '</div>' + D.actorSvg() +
      '<div class="washes">' + D.washHtml() + '<i class="lampwash"></i></div>';
    return {
      fig: fig, art: art, D: D,
      spot: art.querySelector('.spot'), spotSvg: art.querySelector('.spot .layer'),
      lampwash: art.querySelector('.lampwash'), all: art.querySelector('.full-all'),
      hero: fig.classList.contains('scene-hero'),
      x: 0, y: 0, on: false, w: 0, h: 0, ready: !fig.classList.contains('scene-hero')
    };
  });
  var hero = scenes.filter(function (s) { return s.hero; })[0];
  var closer = scenes.filter(function (s) { return s.fig.classList.contains('scene-closer'); })[0];

  function size() {
    scenes.forEach(function (s) {
      var r = s.art.getBoundingClientRect();
      s.w = r.width; s.h = r.height;
      s.spotSvg.style.width = r.width + 'px';
      s.spotSvg.style.height = r.height + 'px';
    });
  }
  size();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); request(); }, 120); });

  /* ---------- each room plays once as it comes into view ---------- */
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('play'); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    scenes.forEach(function (s) { if (!s.hero) io.observe(s.fig); });
  } else {
    scenes.forEach(function (s) { s.fig.classList.add('play'); });
  }

  // the street lights up on load, then the lamp takes over
  if (hero) {
    var start = function () {
      hero.fig.classList.add('play');
      if (lampMode) {
        hero.all.style.transition = 'opacity 2.2s ease .5s';
        hero.all.style.opacity = '1';
        setTimeout(function () {
          hero.all.style.transition = 'opacity 1.6s ease';
          hero.all.style.opacity = '';
          hero.ready = true;
          request();
        }, 3300);
      }
    };
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 600); })]).then(function () { requestAnimationFrame(start); });
  }

  /* ---------- the closer: the same Friday, run down to close ---------- */
  var closerSec = document.querySelector('.closer');
  var lv = [], surf = [], glows = [], hh, hm;
  if (closer) {
    var g = closer.D.closeGeom;
    lv = [].slice.call(closer.art.querySelectorAll('.actors .lvl'));
    surf = [].slice.call(closer.art.querySelectorAll('.actors .surface'));
    glows = [].slice.call(closer.art.querySelectorAll('.w.left'));
    hh = closer.art.querySelector('.hand-h');
    hm = closer.art.querySelector('.hand-m');
    var top = g.CB - 6;
    closer.setT = function (t) {
      var run = smooth(0.08, 0.66, t);
      lv.forEach(function (r, i) {
        var a = +r.getAttribute('data-from'), b = +r.getAttribute('data-to');
        var level = a + (b - a) * run, y = top - level * g.CH;
        r.setAttribute('y', y.toFixed(1));
        r.setAttribute('height', (g.CB - y).toFixed(1));
        surf[i].setAttribute('transform', 'translate(0 ' + y.toFixed(1) + ')');
      });
      // from half past four to eleven
      var mins = 16.5 * 60 + run * 6.5 * 60;
      hh.setAttribute('transform', 'rotate(' + ((mins / 60) % 12 * 30).toFixed(2) + ' 500 74)');
      hm.setAttribute('transform', 'rotate(' + ((mins % 60) * 6).toFixed(2) + ' 500 74)');
      var glow = smooth(0.68, 0.86, t);
      closer.art.style.setProperty('--glow', glow.toFixed(3));
    };
    closer.setT(motion ? 0 : 1);
  }

  /* ---------- scroll: the light washes in ---------- */
  function scroll(vh) {
    scenes.forEach(function (s) {
      if (s.hero) return;
      var r = s.art.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var lit = motion ? clamp((vh - r.top) / (vh * 0.85), 0, 1) : 1;
      if (s.lit !== lit) { s.lit = lit; s.art.style.setProperty('--lit', lit.toFixed(3)); }
    });
    if (closer && closerSec) {
      var cr = closerSec.getBoundingClientRect();
      var t = motion ? clamp(-cr.top / Math.max(1, cr.height - vh), 0, 1) : 1;
      if (window.innerWidth <= 760) t = motion ? clamp((vh * 0.75 - closer.art.getBoundingClientRect().top) / (vh * 0.6), 0, 1) : 1;
      closer.setT(t);
    }
  }

  /* ---------- the pointer is a lamp ---------- */
  var px = 0, py = 0, has = false, R = 230, LR = 360;
  function setLamp(on) {
    if (on === lampMode) return;
    lampMode = on;
    root.classList.toggle('lamp', on);
    if (!on) {
      has = false;
      scenes.forEach(function (s) { s.on = false; s.fig.classList.remove('lamp-on'); });
    }
    request();
  }
  if (canLamp) {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY; has = true;
      setLamp(true);
      request();
    }, { passive: true });
    window.addEventListener('keydown', function (e) {
      if (/^(Tab|Arrow|Page|Home|End| |Enter)/.test(e.key)) setLamp(false);
    });
    document.documentElement.addEventListener('mouseleave', function () { has = false; request(); });
    window.addEventListener('blur', function () { has = false; request(); });
  }

  function lamp(vh) {
    var moving = false;
    scenes.forEach(function (s) {
      var r = s.art.getBoundingClientRect();
      var inside = has && s.ready && r.bottom > 0 && r.top < vh &&
        px > r.left - 20 && px < r.right + 20 && py > r.top - 20 && py < r.bottom + 20;
      var tx = px - r.left, ty = py - r.top;
      if (inside) {
        if (!s.on) { s.x = tx; s.y = ty; }
        else {
          s.x += (tx - s.x) * 0.14; s.y += (ty - s.y) * 0.14;
          if (Math.abs(tx - s.x) > 0.3 || Math.abs(ty - s.y) > 0.3) moving = true;
          else { s.x = tx; s.y = ty; }
        }
        s.spot.style.transform = 'translate3d(' + (s.x - R).toFixed(1) + 'px,' + (s.y - R).toFixed(1) + 'px,0)';
        s.spotSvg.style.transform = 'translate3d(' + (R - s.x).toFixed(1) + 'px,' + (R - s.y).toFixed(1) + 'px,0)';
        s.lampwash.style.transform = 'translate3d(' + (s.x - LR).toFixed(1) + 'px,' + (s.y - LR).toFixed(1) + 'px,0)';
      }
      if (inside !== s.on) { s.on = inside; s.fig.classList.toggle('lamp-on', inside); }
    });
    return moving;
  }

  var queued = false;
  function frame() {
    queued = false;
    var vh = window.innerHeight;
    scroll(vh);
    if (lampMode && lamp(vh)) request();
  }
  function request() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(frame);
  }
  window.addEventListener('scroll', request, { passive: true });
  request();

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
