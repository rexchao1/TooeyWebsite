/* Tooey, exploration 37: the hero boots.
   The restaurant drawing starts in plain line. Its systems come online in
   turn, joined by one lamplight wire: the till ("Sales in"), the forecast
   board ("Forecast ready"), the prep sheet ("Prep sent"), the shift board
   ("Shifts set"), then the dining room's lamps as guests sit ("Open").
   About 4.2 s, then it rests, running: candles and the desk lamp glow.

   The headline and the line under it come on in one of two ways, for the
   founder to compare: ?text=type types them with a caret; ?text=flicker
   (the default) flickers them on like a sign. The real text stays in the
   HTML for screen readers; the animated letters are an aria-hidden copy.
   Under reduced motion none of this runs and the scene is drawn finished.
   The .review-switch in the hero's corner replays it with either effect. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var hero = document.querySelector('.hero');
  var copy = hero && hero.querySelector('.hero-copy');
  var h1 = document.getElementById('hero-title');
  var lead = copy && copy.querySelector('.lead');
  var btns = copy ? [].slice.call(copy.querySelectorAll('.btn')) : [];
  var sw = hero && hero.querySelector('.review-switch');
  var params = new URLSearchParams(location.search);
  var mode = params.get('text') === 'type' ? 'type' : 'flicker';
  var B = window.TooeyScenes && window.TooeyScenes.BOOT;

  var fig = null, onDone = null, raf = 0, t0 = 0, caret = null;
  var segs = [], branch = null, head = null, headGlow = null;
  var events = [], fired = [], textRun = null, settled = false;

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------- the wire ---------- */
  // segment i runs from `at` for `dur` ms; the near pendant's branch starts
  // when the last segment's head passes x 530
  var PLAN = [
    { at: 380, dur: 480 },
    { at: 1280, dur: 400 },
    { at: 2160, dur: 180 },
    { at: 2760, dur: 820 }
  ];

  function setupWire() {
    segs = PLAN.map(function (p, i) {
      var ln = fig.querySelector('.wire-ln[data-w="' + i + '"]');
      var gl = fig.querySelector('.wire-gl[data-w="' + i + '"]');
      return { ln: ln, gl: gl, len: ln.getTotalLength(), at: p.at, dur: p.dur };
    });
    var bi = PLAN.length;
    branch = {
      ln: fig.querySelector('.wire-ln[data-w="' + bi + '"]'),
      gl: fig.querySelector('.wire-gl[data-w="' + bi + '"]'), at: -1, dur: 160
    };
    branch.len = branch.ln.getTotalLength();
    head = fig.querySelector('.wire-hd');
    headGlow = fig.querySelector('.wire-hg');
  }
  function drawSeg(s, p) {
    var off = (s.len * (1 - p)).toFixed(1);
    [s.ln, s.gl].forEach(function (el) {
      el.style.strokeDasharray = s.len.toFixed(1) + ' ' + (s.len + 2).toFixed(1);
      el.style.strokeDashoffset = off;
    });
  }
  function headAt(pt, on) {
    [head, headGlow].forEach(function (el) {
      el.setAttribute('cx', pt ? pt.x.toFixed(1) : -20);
      el.setAttribute('cy', pt ? pt.y.toFixed(1) : -20);
      el.style.opacity = on ? '' : '0';
    });
  }

  /* ---------- the schedule ---------- */
  function on(cls) { return function () { fig.classList.add(cls); }; }
  function plan() {
    events = [
      [120, on('on-pos')],
      [860, on('on-fc')],
      [1680, on('on-prep')],
      [2340, on('on-shift')],
      [3580, on('on-p2')],
      [3780, on('on-open')],
      [4200, finish]
    ];
    fired = events.map(function () { return false; });
  }

  function tick(now) {
    var t = now - t0, moving = null, i, s, p;
    for (i = 0; i < events.length; i++) if (!fired[i] && t >= events[i][0]) { fired[i] = true; events[i][1](); }
    for (i = 0; i < segs.length; i++) {
      s = segs[i];
      p = clamp((t - s.at) / s.dur, 0, 1);
      var e = i === segs.length - 1 ? p : ease(p); // the long run along the ceiling keeps an even pace
      if (p > 0) drawSeg(s, e);
      if (p > 0 && p < 1) moving = s.ln.getPointAtLength(s.len * e);
      // the last run passes the near pendant: light it, and room starts filling
      if (i === segs.length - 1 && branch.at < 0 && p > 0) {
        var pt = s.ln.getPointAtLength(s.len * e);
        if (pt.y > 357 && pt.x <= 530) { branch.at = t; fig.classList.add('on-p1', 'on-dine'); }
      }
    }
    if (branch.at >= 0) drawSeg(branch, ease(clamp((t - branch.at) / branch.dur, 0, 1)));
    headAt(moving, !!moving);
    if (textRun) textRun(t);
    if (!settled || (textRun && t < 3600)) raf = requestAnimationFrame(tick);
    else raf = 0;
  }

  function finish() {
    if (settled) return;
    settled = true;
    ['on-pos', 'on-fc', 'on-prep', 'on-shift', 'on-p1', 'on-p2', 'on-dine', 'on-open', 'booted'].forEach(function (c) { fig.classList.add(c); });
    segs.forEach(function (s) { drawSeg(s, 1); });
    if (branch) drawSeg(branch, 1);
    if (head) headAt(null, false);
    if (onDone) { var f = onDone; onDone = null; f(); }
  }

  // status tags: size each back to its words, once the type has loaded
  function sizeTags() {
    [].forEach.call(fig.querySelectorAll('.tag'), function (g) {
      var t = g.querySelector('.tag-tx'), r = g.querySelector('.tag-bg');
      try { r.setAttribute('width', (17 + t.getComputedTextLength() + 8).toFixed(1)); } catch (e) {}
    });
  }

  /* ---------- the words ---------- */
  // keep the real text for screen readers; show an aria-hidden copy, one
  // span per letter, words kept whole so the lines break where they did
  function split(el) {
    if (!el.hasAttribute('data-text')) el.setAttribute('data-text', el.textContent.trim());
    var text = el.getAttribute('data-text');
    var html = '<span class="sr">' + text + '</span><span class="fx-copy" aria-hidden="true">';
    text.split(' ').forEach(function (w, k, all) {
      html += '<span class="fx-w">';
      for (var i = 0; i < w.length; i++) html += '<span class="fx-c">' + w[i] + '</span>';
      html += '</span>';
      if (k < all.length - 1) html += '<span class="fx-c fx-sp"> </span>';
    });
    el.innerHTML = html + '</span>';
    return [].slice.call(el.querySelectorAll('.fx-c'));
  }
  function unsplit(el) {
    if (el.hasAttribute('data-text')) el.textContent = el.getAttribute('data-text');
    el.classList.remove('fx-type', 'fx-flick', 'go');
  }

  function showButtons(atMs) {
    btns.forEach(function (b) { b.classList.add('fx-btn'); b.classList.remove('in'); });
    return function (t) { if (t >= atMs) btns.forEach(function (b) { b.classList.add('in'); }); };
  }

  // (a) typed: a thin caret leads the letters; the headline in about 1.2 s,
  // the line under it faster; the caret blinks twice and goes
  function typed() {
    var hc = split(h1), lc = split(lead);
    h1.classList.add('fx-type'); lead.classList.add('fx-type');
    if (!caret) { caret = document.createElement('span'); caret.className = 'caret'; caret.setAttribute('aria-hidden', 'true'); copy.appendChild(caret); }
    caret.className = 'caret';
    var H0 = 100, HD = 1200, L0 = H0 + HD + 130, LD = 900, END = L0 + LD;
    var btn = showButtons(END + 60);
    var shownH = 0, shownL = 0;
    function place(chars, n, big) {
      var c = chars[Math.max(0, n - 1)], r = c.getBoundingClientRect(), base = copy.getBoundingClientRect();
      var x = n === 0 ? r.left : r.right;
      var h = r.height * (big ? 0.66 : 0.72);
      caret.style.transform = 'translate(' + (x - base.left + (big ? 3 : 2)).toFixed(1) + 'px,' + (r.top - base.top + r.height * (big ? 0.17 : 0.14)).toFixed(1) + 'px)';
      caret.style.height = h.toFixed(1) + 'px';
      caret.classList.toggle('small', !big);
    }
    place(hc, 0, true);
    return function (t) {
      var nh = clamp(Math.floor((t - H0) / HD * hc.length) + 1, 0, hc.length);
      while (shownH < nh) hc[shownH++].classList.add('v');
      var nl = t < L0 ? 0 : clamp(Math.floor((t - L0) / LD * lc.length) + 1, 0, lc.length);
      while (shownL < nl) lc[shownL++].classList.add('v');
      if (t < L0) place(hc, nh, true); else place(lc, nl, false);
      caret.classList.toggle('blink', t < H0 || (t > H0 + HD && t < L0) || t > END);
      if (t > END + 1100) caret.classList.add('gone');
      btn(t);
    };
  }

  // (b) flicker: letters stutter on with a faint warm glow, settled in about 1 s
  function flicker() {
    var hc = split(h1), lc = split(lead);
    var R = window.TooeyDraw ? window.TooeyDraw.rng(37) : Math.random;
    h1.classList.add('fx-flick'); lead.classList.add('fx-flick');
    hc.forEach(function (c, i) {
      var d = 60 + i / hc.length * 300 + R() * 220;
      c.style.setProperty('--d', Math.round(d) + 'ms');
      c.style.setProperty('--t', Math.round(360 + R() * 140) + 'ms');
      if (R() < 0.45) c.classList.add('alt');
    });
    // the line under it comes on word by word, more quietly
    var words = [].slice.call(lead.querySelectorAll('.fx-w'));
    words.forEach(function (w, i) {
      var d = 420 + i / words.length * 380 + R() * 160;
      [].forEach.call(w.querySelectorAll('.fx-c'), function (c) {
        c.style.setProperty('--d', Math.round(d + R() * 40) + 'ms');
        c.style.setProperty('--t', '320ms');
      });
    });
    void h1.offsetWidth;
    h1.classList.add('go'); lead.classList.add('go');
    if (caret) caret.className = 'caret gone';
    return showButtons(1150);
  }

  /* ---------- run ---------- */
  function reset() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0; settled = false; textRun = null;
    fig.classList.add('rs');
    ['on-pos', 'on-fc', 'on-prep', 'on-shift', 'on-p1', 'on-p2', 'on-dine', 'on-open', 'booted'].forEach(function (c) { fig.classList.remove(c); });
    segs.forEach(function (s) { drawSeg(s, 0); });
    if (branch) { branch.at = -1; drawSeg(branch, 0); }
    headAt(null, false);
    void fig.offsetWidth;
    fig.classList.remove('rs');
  }

  function run() {
    reset();
    plan();
    if (h1 && lead && copy) textRun = mode === 'type' ? typed() : flicker();
    root.classList.remove('fx-pending');
    t0 = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function start(f, done) {
    fig = f; onDone = done;
    if (!B || !fig.querySelector('.wire-ln')) { root.classList.remove('fx-pending'); if (done) done(); return; }
    sizeTags();
    setupWire();
    if (!motion) { finish(); return; }
    run();
    if (sw) setupSwitch();
  }

  function setupSwitch() {
    var bs = [].slice.call(sw.querySelectorAll('button[data-fx]'));
    function mark() { bs.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-fx') === mode ? 'true' : 'false'); }); }
    mark();
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-fx') === 'type' ? 'type' : 'flicker';
        mark();
        if (history.replaceState) {
          var q = new URLSearchParams(location.search); q.set('text', mode);
          history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
        }
        [h1, lead].forEach(unsplit);
        run();
      });
    });
  }

  window.TooeyHero = { start: start };
})();
