/* Tooey, exploration 33: the living sheet.
   Scroll drives everything after the hero. Each room draws itself as it
   arrives: structure, furniture, detail, the counts written by hand, then the
   lamplight. Between rooms, the lines tagged to travel leave one drawing and
   land as the next one's lines (drawn meanwhile in the fixed #morph layer).
   Then the contact form. No libraries. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var params = new URLSearchParams(location.search);
  var forcedT = params.has('t') ? parseFloat(params.get('t')) : null;   // hero clock, for checking frames

  form();
  var TS = window.TooeyScenes;
  if (!TS) return;

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function inout(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* when each layer of each room is drawn, as a share of the room's run:
     0 is the room's top meeting the bottom of the screen, 1 the end of its pin */
  var PH = {
    street:  { s: [0, 0.42], f: [0.26, 0.64], d: [0.44, 0.84], l: [0.6, 1] },
    prep:    { s: [0.15, 0.55], f: [0.4, 0.68], d: [0.54, 0.76], n: [0.64, 0.9], l: [0.66, 0.98] },
    kitchen: { s: [0.15, 0.58], f: [0.4, 0.72], d: [0.55, 0.86], l: [0.68, 0.98] },
    dining:  { s: [0.15, 0.58], f: [0.4, 0.7], d: [0.52, 0.9], l: [0.66, 0.98] },
    closer:  { s: [0.1, 0.45], f: [0.34, 0.54], d: [0.42, 0.6], n: [0.52, 0.71], n2: [0.69, 0.81], m: [0.8, 0.93], l: [0.56, 0.97] },
    start:   { s: [0.15, 0.55], f: [0.38, 0.66], d: [0.5, 0.8], n: [0.6, 0.86], l: [0.66, 0.98] }
  };
  var MORPH_END = 0.9;   // a transition finishes just before the next room pins

  /* ---------- build the rooms ---------- */
  var secs = [];
  [].forEach.call(document.querySelectorAll('main > section'), function (sec) {
    var art = sec.querySelector('.art');
    var rec = { el: sec, art: art, scene: null, top: 0, h: 0, rx: -1 };
    if (art) {
      var sc = TS.build(art.getAttribute('data-scene'));
      art.insertBefore(sc.svg, art.firstChild);
      rec.scene = sc;
    }
    secs.push(rec);
  });
  var startRec = secs.filter(function (r) { return r.el.classList.contains('start'); })[0];

  // the steps' numbers are written by hand too
  if (startRec) {
    [].forEach.call(startRec.el.querySelectorAll('.steps .n'), function (n) {
      var v = n.textContent.trim();
      var svg = TS.el('svg', { viewBox: '0 0 44 48', 'aria-hidden': 'true', focusable: 'false' });
      n.textContent = '';
      n.appendChild(svg);
      startRec.scene.count(14, 41, v, 40, 'prep', 'n', svg);
    });
    // and their rules are where the sheets' rules land
    var lis = startRec.el.querySelectorAll('.steps li');
    var ol = startRec.el.querySelector('.steps');
    var targets = [].map.call(lis, function (li) { return { html: li, edge: 'top' }; }).concat([{ html: ol, edge: 'bottom' }]);
    targets.forEach(function (t) { t.a = 0.32; t.w = 1; t.m = 'h'; startRec.scene.morph.h.push(t); });
  }

  // give every item its window
  secs.forEach(function (r) {
    if (!r.scene) return;
    var ph = PH[r.scene.name], groups = {};
    r.scene.items.forEach(function (it) { (groups[it.ph] = groups[it.ph] || []).push(it); });
    Object.keys(groups).forEach(function (k) {
      var list = groups[k], w = ph[k] || [0, 1], n = list.length, span = w[1] - w[0];
      var d = span * clamp(1.4 / Math.sqrt(n), 0.2, 1);
      list.forEach(function (it, i) {
        it.t0 = w[0] + (span - d) * (n > 1 ? i / (n - 1) : 0);
        it.t1 = it.t0 + d;
      });
    });
  });

  /* ---------- drawing a room at a given progress ---------- */
  function setStroke(it, f) {
    var v = Math.round(f * 10000) / 10000;
    if (v === it._v) return;
    it._v = v;
    if (v <= 0) { it.el.setAttribute('visibility', 'hidden'); return; }
    it.el.setAttribute('visibility', 'visible');
    it.el.setAttribute('stroke-dashoffset', (1 - v).toFixed(4));
  }
  function setOpacity(e, key, holder, v) {
    v = Math.round(v * 1000) / 1000;
    if (holder[key] === v) return;
    holder[key] = v;
    e.setAttribute('opacity', v);
  }

  // morph: null when lines do not travel (narrow screens, reduced motion);
  // otherwise { arrived, leaving, first } for this room
  // gone: how far the next room's arrival has gone (0 to 1); the last-drawn
  // parts of this room are taken back first, so only the travelling lines remain
  function drawScene(sc, p, lightK, morph, gone) {
    var items = sc.items;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var f = smooth(it.t0, it.t1, p), fNat = f, keep = 1;
      if (gone > 0) {
        var a0 = 0.3 * (1 - clamp(it.t0, 0, 1));
        keep = 1 - smooth(a0, a0 + 0.38, gone);
        f = Math.min(f, keep);
      }
      if (it.kind === 'stroke') {
        it._f = fNat;
        if (it.m && morph) {
          var shown = (morph.first || morph.arrived) && !morph.leaving;
          f = shown ? (morph.first ? f : 1) : 0;
          if (!morph.first) it._f = morph.arrived ? 1 : 0;
        }
        setStroke(it, f);
      } else if (it.kind === 'fade') {
        setOpacity(it.el, '_o', it, f);
      } else if (it.kind === 'light') {
        var k = f * lightK;
        setOpacity(it.el, '_o', it, k * it.a);
        if (it.cx != null) {
          var sc2 = Math.round((0.7 + 0.3 * f) * 1000) / 1000;
          if (sc2 !== it._s) {
            it._s = sc2;
            it.el.setAttribute('transform', 'translate(' + it.cx + ' ' + it.cy + ') scale(' + sc2 + ') translate(' + -it.cx + ' ' + -it.cy + ')');
          }
        }
      } else if (it.kind === 'count') {
        // written stroke by stroke, then the figure settles into type
        var span = it.t1 - it.t0, wEnd = it.t0 + span * 0.74, m = it.strokes.length;
        for (var j = 0; j < m; j++) {
          var a = it.t0 + (wEnd - it.t0) * j / m, b = it.t0 + (wEnd - it.t0) * (j + 1) / m;
          var sj = it.strokes[j];
          var g = clamp((p - a) / (b - a), 0, 1);
          g = 1 - (1 - g) * (1 - g);
          var gv = Math.round(g * 1000) / 1000;
          if (gv !== sj._v) {
            sj._v = gv;
            if (gv <= 0) sj.setAttribute('visibility', 'hidden');
            else { sj.setAttribute('visibility', 'visible'); sj.setAttribute('stroke-dashoffset', (1 - gv).toFixed(3)); }
          }
        }
        var settle = smooth(it.t0 + span * 0.66, it.t1, p);
        setOpacity(it.hand, '_h', it, (1 - settle) * keep);
        setOpacity(it.typeset, '_t', it, settle * keep);
      }
    }
  }

  /* ---------- the travelling lines ---------- */
  var ov = document.getElementById('morph');
  var pool = [];
  function poolLine(i) {
    if (!pool[i]) {
      var e = TS.el('path', { pathLength: '1', 'stroke-dasharray': '1 2' }, ov);
      pool[i] = { el: e };
    }
    return pool[i];
  }
  function key(it, dir) {
    if (it.html) return dir === 'h' ? 1e6 : 1e6;
    var L = it.L;
    return dir === 'h' ? (L.y1 + L.y2) / 2 * 10000 + Math.min(L.x1, L.x2) : (L.x1 + L.x2) / 2 * 10000 + Math.min(L.y1, L.y2);
  }
  // pair the travelling lines of two rooms, top to bottom (or left to right)
  function pairsFor(A, B) {
    var out = [];
    ['h', 'v'].forEach(function (dir) {
      var a = A.morph[dir].slice(), b = B.morph[dir].slice();
      if (!a.length || !b.length) return;
      a.sort(function (p, q) { return key(p, dir) - key(q, dir); });
      if (!b.some(function (t) { return t.html; })) b.sort(function (p, q) { return key(p, dir) - key(q, dir); });
      else {
        // html rules sit below the drawing, in their own order
        var svgT = b.filter(function (t) { return !t.html; }).sort(function (p, q) { return key(p, dir) - key(q, dir); });
        b = svgT.concat(b.filter(function (t) { return t.html; }));
      }
      var N = Math.max(a.length, b.length), ma = [], mb = [], list = [];
      for (var i = 0; i < N; i++) {
        var ia = Math.floor(i * a.length / N), ib = Math.floor(i * b.length / N);
        ma[ia] = (ma[ia] || 0) + 1; mb[ib] = (mb[ib] || 0) + 1;
        list.push({ ia: ia, ib: ib, i: i, N: N });
      }
      // where a line sits in its set, 0 to 1 (top to bottom, or left to right)
      function rank(arr) {
        var ks = arr.map(function (t, j) { return t.html ? null : key(t, dir) / 10000; });
        var real = ks.filter(function (v) { return v !== null; });
        var lo = Math.min.apply(null, real), hi = Math.max.apply(null, real);
        return ks.map(function (v, j) { return v === null ? 1 : hi > lo ? (v - lo) / (hi - lo) : 0.5; });
      }
      var ra = rank(a), rb = rank(b);
      list.forEach(function (q) {
        // lines of one row move together, and the lowest rows go first,
        // so the rows keep their order as they slide
        var o = (ra[q.ia] + rb[q.ib]) / 2;
        out.push({ a: a[q.ia], b: b[q.ib], ka: 1 / ma[q.ia], kb: 1 / mb[q.ib], delay: 0.3 * (dir === 'h' ? 1 - o : o) });
      });
    });
    return out;
  }
  function ends(it, ctm) {
    if (it.html) {
      var r = it.html.getBoundingClientRect();
      var y = it.edge === 'top' ? r.top + 0.5 : r.bottom - 0.5;
      return [r.left, y, r.right, y];
    }
    var L = it.L;
    return [ctm.a * L.x1 + ctm.c * L.y1 + ctm.e, ctm.b * L.x1 + ctm.d * L.y1 + ctm.f,
            ctm.a * L.x2 + ctm.c * L.y2 + ctm.e, ctm.b * L.x2 + ctm.d * L.y2 + ctm.f];
  }
  var ovShown = false, ovPairs = null, ovFor = -1;
  function drawMorph(k, m) {
    var A = secs[k - 1].scene, B = secs[k].scene;
    if (ovFor !== k) { ovPairs = pairsFor(A, B); ovFor = k; }
    var ca = A.svg.getScreenCTM(), cb = B.svg.getScreenCTM();
    if (!ca || !cb) return;
    var n = ovPairs.length;
    for (var i = 0; i < n; i++) {
      var q = ovPairs[i], line = poolLine(i);
      var e = inout(clamp((m - q.delay) / (1 - 0.3), 0, 1));
      var pa = ends(q.a, ca), pb = ends(q.b, cb);
      // a line coming from the left or the right keeps its direction
      var x1 = lerp(pa[0], pb[0], e), y1 = lerp(pa[1], pb[1], e), x2 = lerp(pa[2], pb[2], e), y2 = lerp(pa[3], pb[3], e);
      var aa = (q.a.L ? q.a.L.a : q.a.a) * q.ka, ab = (q.b.L ? q.b.L.a : q.b.a) * q.kb;
      var wa = q.a.L ? q.a.L.w : q.a.w, wb = q.b.L ? q.b.L.w : q.b.w;
      var fa = q.a._f == null ? 1 : q.a._f;
      var frac = lerp(fa, 1, e);
      var el = line.el;
      el.setAttribute('d', 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1));
      el.setAttribute('stroke-opacity', lerp(aa, ab, e).toFixed(3));
      el.setAttribute('stroke-width', lerp(wa, wb, e).toFixed(2));
      el.setAttribute('stroke-dashoffset', (1 - frac).toFixed(3));
      el.setAttribute('visibility', frac > 0.001 ? 'visible' : 'hidden');
    }
    for (var j = n; j < pool.length; j++) pool[j].el.setAttribute('visibility', 'hidden');
    if (!ovShown) { ov.style.display = ''; ovShown = true; }
  }
  function hideMorph() {
    if (ovShown) { ov.style.display = 'none'; ovShown = false; }
  }
  hideMorph();

  /* ---------- layout ---------- */
  var travel = false;   // do lines travel between rooms (wide screens, motion allowed)
  function measure() {
    var y = window.scrollY;
    secs.forEach(function (r) {
      var b = r.el.getBoundingClientRect();
      r.top = b.top + y; r.h = b.height;
    });
    travel = motion && window.innerWidth > 760;
    // on a phone the two sheets are framed whole, side by side
    secs.forEach(function (r) {
      if (!r.scene || r.scene.name !== 'closer') return;
      var narrow = window.innerWidth <= 760;
      r.scene.svg.setAttribute('viewBox', narrow ? '70 40 940 830' : '0 0 1100 900');
      r.scene.svg.setAttribute('preserveAspectRatio', narrow ? 'xMidYMin meet' : 'xMinYMid slice');
    });
  }

  /* ---------- the hero plays on load ---------- */
  var HERO_MS = 3000, t0 = null, playing = false;
  function heroClock() {
    if (!motion) return 1;
    if (forcedT !== null) return clamp(forcedT, 0, 1);
    if (t0 === null) return 0;
    return clamp((performance.now() - t0) / HERO_MS, 0, 1);
  }

  /* ---------- each frame ---------- */
  function frame() {
    var y = window.scrollY, vh = window.innerHeight, n = secs.length;
    var st = [], sIn = [], mIn = [], ps = [];
    var i;
    for (i = 0; i < n; i++) {
      var r = secs[i];
      st[i] = r.top - y;
      sIn[i] = i === 0 ? 1 : clamp((vh - st[i]) / vh, 0, 1);
      mIn[i] = i === 0 ? 1 : clamp(sIn[i] / MORPH_END, 0, 1);
    }
    for (i = 0; i < n; i++) {
      var rr = secs[i];
      if (!rr.scene) continue;
      if (!motion) { ps[i] = 1; continue; }
      if (i === 0) {
        ps[i] = Math.max(heroClock(), smooth(0, 0.3, y / vh));
      } else if (travel) {
        var pin = rr.h - vh;
        ps[i] = clamp((vh - st[i]) / (vh + pin), 0, 1);
      } else {
        var ab = rr.art.getBoundingClientRect();
        ps[i] = clamp((vh - ab.top) / (vh * 0.85), 0, 1);
      }
    }
    // writes from here on
    for (i = 0; i < n; i++) {
      var s = secs[i];
      if (i > 0) {
        var rx = motion ? Math.round(smooth(0.02, 0.5, sIn[i]) * 1000) / 1000 : 1;
        if (rx !== s.rx) { s.rx = rx; s.el.style.setProperty('--rx', rx); }
      }
      if (!s.scene) continue;
      var visible = st[i] < vh + 40 && st[i] + s.h > -40;
      if (!visible && s.drawn) continue;
      s.drawn = true;
      var next = i + 1 < n ? sIn[i + 1] : 0;
      var lightK = motion ? 1 - smooth(0.05, 0.75, next) : 1;
      var morph = travel ? { first: i === 0, arrived: mIn[i] >= 1, leaving: i + 1 < n && secs[i + 1].scene ? mIn[i + 1] > 0 : false } : null;
      var gone = travel && i + 1 < n && secs[i + 1].scene ? mIn[i + 1] : 0;
      drawScene(s.scene, ps[i], lightK, morph, gone);
      var so = Math.round((1 - smooth(0.12, 0.6, gone)) * 1000) / 1000;
      if (so !== s.so) { s.so = so; s.art.style.opacity = so; }
      if (s === startRec) {
        var waiting = travel && mIn[i] < 1;
        if (waiting !== s.waiting) { s.waiting = waiting; s.el.classList.toggle('awaiting', waiting); }
      }
    }
    var active = -1;
    if (travel) for (i = 1; i < n; i++) if (secs[i].scene && secs[i - 1].scene && mIn[i] > 0 && mIn[i] < 1) { active = i; break; }
    if (active > 0) drawMorph(active, mIn[active]); else hideMorph();

    if (playing) {
      if (heroClock() >= 1) playing = false;
      else requestAnimationFrame(frame);
    }
  }
  var queued = false;
  function request() {
    if (queued || playing) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; frame(); });
  }
  window.addEventListener('scroll', request, { passive: true });
  var lastW = window.innerWidth, rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      lastW = window.innerWidth;
      measure();
      secs.forEach(function (r) { r.drawn = false; });
      ovFor = -1;
      request();
    }, 150);
  });

  measure();
  frame();
  // start the hero once the type it writes in has arrived
  var fonts = document.fonts && document.fonts.load
    ? Promise.race([
        Promise.all([
          document.fonts.load('420 52px Literata'),
          document.fonts.load('400 32px "Source Serif 4"'),
          document.fonts.load('italic 400 32px "Source Serif 4"'),
          document.fonts.load('500 17px "Schibsted Grotesk"')
        ]),
        new Promise(function (res) { setTimeout(res, 1200); })
      ]).catch(function () {})
    : Promise.resolve();
  fonts.then(function () {
    measure();
    t0 = performance.now() + 250;
    if (motion && forcedT === null) { playing = true; requestAnimationFrame(frame); }
    else frame();
  });
  window.addEventListener('load', function () { measure(); request(); });

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
