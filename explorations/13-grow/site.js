/* Tooey, "Room to grow": one drawing, one camera. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- form: the title block ---------------- */
  var form = $('#form');
  var nameField = $('#f-rest');
  var placeName = $('#placeName');
  function letterPlace() {
    if (!placeName) return;
    var v = (nameField.value || '').trim().replace(/\s+/g, ' ');
    if (v.length > 28) v = v.slice(0, 27) + '…';
    placeName.textContent = v || 'Your place';
    var len = Math.max(10, (v || 'Your place').length);
    placeName.style.fontSize = Math.min(34, Math.round(560 / (len * 0.82))) + 'px';
  }
  if (nameField) nameField.addEventListener('input', letterPlace);

  if (form) {
    var status = $('#status');
    var send = $('#send');
    var stamp = $('#stamp');
    var mail = '<a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = $$('[required]', form);
      var missing = required.filter(function (el) { return !el.value.trim() || (el.type === 'email' && !el.checkValidity()); });
      required.forEach(function (el) { el.setAttribute('aria-invalid', missing.indexOf(el) > -1 ? 'true' : 'false'); });
      if (missing.length) {
        status.textContent = 'Add your name, your restaurant and an email we can reply to.';
        missing[0].focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._honey) { done(); return; }
      send.disabled = true;
      send.textContent = 'Sending it over';
      status.textContent = '';
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (j) {
        if (j && (j.success === true || j.success === 'true')) done();
        else throw new Error('rejected');
      }).catch(function () {
        send.disabled = false;
        send.textContent = 'Try again';
        status.innerHTML = 'That didn’t send. Try again, or email ' + mail + '.';
      });
    });
    function done() {
      send.textContent = 'Sent';
      send.disabled = true;
      status.textContent = 'Received. We’ll write back by email.';
      if (stamp) stamp.classList.add('on');
    }
  }

  /* ---------------- the drawing ---------------- */
  if (!root.classList.contains('motion')) return;
  if (!window.gsap || !window.ScrollTrigger) { root.className = 'js still'; return; }
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  var svg = $('#world');
  var stage = $('.stage');
  var hero = $('.hero');

  // Focus rectangles in world units.
  var F = {
    hero: { x: -36, y: 24, w: 1012, h: 716 },
    pans: { x: 528, y: 44, w: 424, h: 184 },
    over: { x: 20, y: 20, w: 960, h: 950 },
    dine: { x: 40, y: 236, w: 920, h: 436 },
    patio: { x: 20, y: 210, w: 960, h: 760 },
    placeB: { x: 1090, y: 110, w: 1010, h: 640 },
    whole: { x: -40, y: -40, w: 2220, h: 1030 }
  };
  var ORDER = ['hero', 'pans', 'over', 'dine', 'patio', 'placeB', 'whole'];
  var frames = [];

  function safeFor(key, W, H) {
    var wide = W >= 900;
    if (key === 'hero') {
      if (wide) {
        var right = Math.max($('h1', hero).getBoundingClientRect().right, $('.lead', hero).getBoundingClientRect().right);
        var x0 = Math.max(W * 0.47, right + 36);
        return { x: x0, y: 100, w: W * 0.98 - x0, h: H - 110 };
      }
      var hb = hero.getBoundingClientRect().bottom + window.scrollY - stage.getBoundingClientRect().top - window.scrollY;
      var top = Math.max(hb + 10, H * 0.42);
      return { x: 12, y: top, w: W - 24, h: Math.max(200, H - top - 12) };
    }
    if (key === 'whole') {
      if (wide) return { x: W * 0.04, y: H * 0.06, w: W * 0.92, h: H * 0.62 };
      return { x: 10, y: H * 0.12, w: W - 20, h: H * 0.5 };
    }
    if (wide) return { x: W * 0.37, y: 60, w: W * 0.6, h: H - 110 };
    return { x: 10, y: 70, w: W - 20, h: Math.max(220, H - 70 - 200) };
  }
  function computeFrames() {
    var W = stage.clientWidth, H = stage.clientHeight;
    frames = ORDER.map(function (k) {
      var f = F[k], s = safeFor(k, W, H);
      var sc = Math.min(s.w / f.w, s.h / f.h);
      var vw = W / sc, vh = H / sc;
      var cx = f.x + f.w / 2, cy = f.y + f.h / 2;
      return { x: cx - (s.x + s.w / 2) / sc, y: cy - (s.y + s.h / 2) / sc, w: vw, h: vh };
    });
  }
  var cam = { f: 0 };
  function applyCam() {
    var i = Math.min(Math.floor(cam.f), frames.length - 2), t = cam.f - i;
    var a = frames[i], b = frames[i + 1];
    // zoom geometrically, pan linearly in the frame's centre
    var w = a.w * Math.pow(b.w / a.w, t), h = a.h * Math.pow(b.h / a.h, t);
    var acx = a.x + a.w / 2, bcx = b.x + b.w / 2, acy = a.y + a.h / 2, bcy = b.y + b.h / 2;
    var cx = acx + (bcx - acx) * t, cy = acy + (bcy - acy) * t;
    svg.setAttribute('viewBox', (cx - w / 2).toFixed(1) + ' ' + (cy - h / 2).toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1));
  }
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  computeFrames(); applyCam();

  /* ---- elements ---- */
  var walls = $$('#walls .wall');
  var wallBits = $$('#walls .glass, #walls .door, #walls .swing');
  var fixtures = $$('#fixtures > *');
  var tables = $$('.tbl');
  var chairs = $$('.chair');
  var floors = $$('.floor');
  var sales = $$('.sale');
  var note = $('#salesNote');
  var env = $('#envelope');
  var pans = $$('.pan');
  var preds = $$('.pred');
  var overs = $$('.portion.over');
  var pencil = $('#pencil');
  var staffers = $$('.staffer');
  var scalebar = $('#scalebar');
  var hours = $('#hours');
  var busy = $('#busy');
  var bars = $$('.shift-bar');
  var barDots = $$('.bar-dot');
  var rota = $('#rotaLabel');
  var inkG = $$('.guest.ink-g');
  var blueG = $$('.guest.blue-g');
  var rings = $$('.ring');
  var patioLine = $('#patio .b-line');
  var patioBits = $$('#patio .b-thin');
  var sheet = $('#sheet'), frameR = $('#sheetFrame'), clipR = $('#sheetClipRect'), roll = $('#roll');
  var curbs = $$('#street .curb');
  var bWalls = $$('#placeB .b-wall, #placeB .b-line');
  var bBits = $$('#placeB .b-thin');
  var linkPath = $('#linkPath'), linkDots = $$('#link .b-dot');
  var beats = $$('.beats li');
  var tally = $$('.tally i');
  var stretch = $('.stretch');
  var payoff = $('.payoff');
  var legend = $('.legend');

  var draw = function (els) { gsap.set(els, { strokeDasharray: '1 1', strokeDashoffset: 1 }); };
  var R = function (el) { return parseFloat(el.getAttribute('r')); };
  var C = function (el) { return { x: +el.getAttribute('cx'), y: +el.getAttribute('cy') }; };
  var guestHome = new Map();
  inkG.concat(blueG).forEach(function (g) { guestHome.set(g, { c: C(g), r: R(g) }); });
  var ink = '#2b1a33', blue = '#2f4fd0', plaster = '#fce9d4', candle = '#fff4dc';

  /* ---- starting state ---- */
  draw(walls);
  gsap.set(wallBits.concat(fixtures, tables, chairs), { opacity: 0 });
  gsap.set(sales, { attr: { r: 0 } });
  gsap.set(note, { opacity: 0 });
  gsap.set(env, { opacity: 0 });
  pans.forEach(function (p) {
    gsap.set($$('.pan-rim, text', p), { opacity: 0 });
    gsap.set($$('.portion', p), { scale: 0, transformOrigin: '50% 50%' });
  });
  gsap.set(preds, { scaleX: 0, transformOrigin: '0% 50%' });
  staffers.forEach(function (s) { gsap.set(s, { x: 10, y: 175, opacity: 0 }); });
  gsap.set([hours, rota], { opacity: 0 });
  draw(busy);
  gsap.set(bars, { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set(barDots, { opacity: 0 });
  gsap.set(inkG.concat(blueG), { opacity: 0 });
  gsap.set(tables, { fill: plaster });
  gsap.set('.glow', { opacity: 0 });
  gsap.set(rings, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' });
  draw(patioLine);
  gsap.set(patioBits, { opacity: 0 });
  var narrow = 1080;
  gsap.set(sheet, { attr: { width: narrow } });
  gsap.set(frameR, { attr: { width: narrow - 36 } });
  gsap.set(clipR, { attr: { width: narrow } });
  gsap.set(roll, { x: -40 + narrow, y: 0 });
  draw(curbs.concat(bWalls, [linkPath]));
  gsap.set(bBits.concat(linkDots, [placeName]), { opacity: 0 });
  gsap.set(beats.concat([payoff, legend]), { autoAlpha: 0, clipPath: 'inset(0% 100% 0% 0%)' });

  /* ---- on load: last night becomes this morning's count ---- */
  var load = gsap.timeline({ delay: 0.15 });
  load.to(walls, { strokeDashoffset: 0, duration: 0.75, stagger: 0.1, ease: 'power2.inOut' }, 0)
    .to(wallBits, { opacity: 1, duration: 0.3, stagger: 0.04 }, 0.55)
    .to(fixtures, { opacity: 1, duration: 0.35, stagger: 0.03 }, 0.6)
    .to(tables.concat(chairs), { opacity: 1, duration: 0.3, stagger: { each: 0.004, from: 'random' } }, 0.7)
    .to(note, { opacity: 1, duration: 0.35 }, 1.1)
    .to(sales, { attr: { r: 3.4 }, duration: 0.22, ease: 'back.out(3)', stagger: { each: 0.0055, from: 'random' } }, 1.1)
    .to(sales, { attr: { cx: 587, cy: 619, r: 1.2 }, duration: 0.55, ease: 'power2.in', stagger: { each: 0.003, from: 'random' } }, 2.05)
    .set(sales, { opacity: 0 }, 2.95)
    .to(env, { opacity: 1, duration: 0.15 }, 2.85)
    .to(env, { keyframes: [{ x: -108, y: 0, duration: 0.18 }, { x: -108, y: -366, duration: 0.42 }, { x: 160, y: -380, duration: 0.3 }], ease: 'power1.inOut' }, 2.95)
    .to(env, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.2 }, 3.82)
    .to(note, { opacity: 0, duration: 0.4 }, 3.6);
  pans.forEach(function (p, i) {
    var t0 = 3.8 + i * 0.16;
    load.to($$('.pan-rim', p), { opacity: 1, duration: 0.2 }, t0 - 0.1)
      .to($$('.portion', p), { scale: 1, duration: 0.16, ease: 'back.out(2.4)', stagger: 0.022 }, t0)
      .to($$('text', p), { opacity: 1, duration: 0.25 }, t0 + 0.1);
    var count = $('.pan-count', p);
    if (count) {
      var n = { v: 0 }, target = +count.textContent;
      count.textContent = '0';
      load.to(n, { v: target, duration: target * 0.022, ease: 'none', onUpdate: function () { count.textContent = Math.round(n.v); } }, t0);
    }
  });

  /* ---- the scroll: one camera move over the day and the sheet ---- */
  function caption(tl, el, at, outAt) {
    tl.to(el, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 2.2, ease: 'power2.out' }, at);
    if (outAt != null) tl.to(el, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.6, ease: 'power2.in' }, outAt)
      .set(el, { autoAlpha: 0 }, outAt + 1.6);
  }
  function camTo(tl, idx, at, dur) { tl.to(cam, { f: idx, duration: dur, ease: 'power2.inOut', onUpdate: applyCam }, at); }

  var tl = gsap.timeline({ defaults: { ease: 'none' } });
  // 0. the headline steps aside
  tl.fromTo(hero, { autoAlpha: 1 }, { autoAlpha: 0, duration: 5, ease: 'power1.in' }, 1);
  // 1. this morning's count, close up
  camTo(tl, 1, 3, 10);
  caption(tl, beats[1], 6, 17);
  tl.to(preds, { scaleX: 1, duration: 3, stagger: 0.6, ease: 'power2.out' }, 9)
    .fromTo(overs, { opacity: 0.34 }, { opacity: 0.12, duration: 1, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 9.5);

  // 2. shifts, proposed
  camTo(tl, 2, 17, 6);
  caption(tl, beats[2], 20, 37);
  tl.to(legend, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 2 }, 19);
  staffers.forEach(function (s, k) {
    var x = +s.dataset.x, y = +s.dataset.y;
    tl.to(s, { opacity: 1, duration: 0.6 }, 21 + k * 1.4)
      .to(s, { keyframes: [{ x: 70, y: 175, duration: 1 }, { x: x, y: y, duration: 2.6 }], ease: 'power1.inOut' }, 21 + k * 1.4);
  });
  tl.to(scalebar, { scaleY: 0, transformOrigin: '50% 100%', opacity: 0, duration: 1.6 }, 26)
    .to(hours, { opacity: 1, duration: 1.4 }, 27)
    .to(busy, { strokeDashoffset: 0, duration: 3, ease: 'power1.inOut' }, 27.5)
    .to(barDots, { opacity: 1, duration: 0.6, stagger: 0.4 }, 29)
    .to(bars, { scaleX: 1, duration: 2, stagger: 0.5, ease: 'power2.out' }, 29.2)
    .to(rota, { opacity: 1, duration: 1.2 }, 32);

  // 3. four Tuesdays
  camTo(tl, 3, 37, 5);
  caption(tl, beats[3], 39, 61);
  var tablesNamed = function (gs) {
    var ids = {};
    gs.forEach(function (g) { var t = g.dataset.t; if (t !== undefined && t !== '-1') ids[t] = 1; });
    return Object.keys(ids).map(function (k) { return $('#tbl' + k); }).filter(Boolean);
  };
  tl.to('#diningFloor', { fill: '#f1cba3', duration: 3 }, 40);
  for (var w = 1; w <= 4; w++) {
    var t0 = 42 + (w - 1) * 5;
    var cast = inkG.concat(blueG.filter(function (g) { return +g.dataset.week <= w; }));
    var lit = tablesNamed(cast);
    tl.set(tally[w - 1], { className: 'on' }, t0);
    cast.forEach(function (g, k) {
      var h = guestHome.get(g);
      tl.fromTo(g, { opacity: 0, attr: { cx: 485, cy: 652, r: 0 } },
        { opacity: 1, attr: { cx: h.c.x, cy: h.c.y, r: h.r }, duration: 1.7, ease: 'power2.out', immediateRender: false }, t0 + k * 0.03);
    });
    tl.to(lit, { fill: candle, duration: 0.8 }, t0 + 1)
      .to(lit.map(function (t) { return $('#glow' + t.id.slice(3)); }), { opacity: 1, duration: 0.8 }, t0 + 1);
    if (w > 1) tl.to(rings[w - 2], { opacity: 1, scale: 1, duration: 1, ease: 'back.out(2)' }, t0 + 1.5);
    if (w < 4) {
      tl.to(cast, { opacity: 0, attr: { r: 0 }, duration: 0.9, ease: 'power1.in' }, t0 + 3.6)
        .to(lit, { fill: plaster, duration: 0.8 }, t0 + 3.6)
        .to(lit.map(function (t) { return $('#glow' + t.id.slice(3)); }), { opacity: 0, duration: 0.8 }, t0 + 3.6);
    }
  }

  // 4. more room: patio, wider type, a bigger sheet, a second place
  camTo(tl, 4, 62, 4);
  caption(tl, beats[4], 63, 81);
  var sw = { v: 70 };
  tl.fromTo(sw, { v: 68 }, { v: window.innerWidth < 600 ? 100 : 135, duration: 15, ease: 'power1.inOut', onUpdate: function () { stretch.style.fontStretch = sw.v + '%'; } }, 63);
  tl.to(patioLine, { strokeDashoffset: 0, duration: 3, ease: 'power1.inOut' }, 64)
    .to(patioBits, { opacity: 1, duration: 0.6, stagger: 0.15 }, 65.5);
  camTo(tl, 5, 68, 8.5);
  var full = 2220;
  tl.to(sheet, { attr: { width: full }, duration: 9, ease: 'power2.inOut' }, 68.5)
    .to(frameR, { attr: { width: full - 36 }, duration: 9, ease: 'power2.inOut' }, 68.5)
    .to(clipR, { attr: { width: full }, duration: 9, ease: 'power2.inOut' }, 68.5)
    .to(roll, { x: -40 + full, duration: 9, ease: 'power2.inOut' }, 68.5)
    .to(curbs, { strokeDashoffset: 0, duration: 3 }, 70)
    .to(bWalls, { strokeDashoffset: 0, duration: 4, stagger: 0.6, ease: 'power1.inOut' }, 71.5)
    .to(bBits, { opacity: 1, duration: 0.5, stagger: 0.12 }, 74)
    .to(placeName, { opacity: 1, duration: 1.5 }, 77.5)
    .to(linkPath, { strokeDashoffset: 0, duration: 3, ease: 'power1.inOut' }, 77)
    .to(linkDots, { opacity: 1, duration: 0.6 }, 78.5);

  // 5. the whole sheet, and the line that answers the headline
  camTo(tl, 6, 82, 7);
  caption(tl, payoff, 86, null);
  tl.to({}, { duration: 10 }, 90);

  var st = window.ScrollTrigger.create({
    trigger: '#scene', start: 'top top', end: 'bottom bottom', scrub: 0.7, animation: tl
  });

  var lastW = window.innerWidth;
  var pending;
  window.addEventListener('resize', function () {
    clearTimeout(pending);
    pending = setTimeout(function () {
      computeFrames(); applyCam();
      if (Math.abs(window.innerWidth - lastW) > 60) { lastW = window.innerWidth; window.ScrollTrigger.refresh(); }
    }, 120);
  });
  document.fonts && document.fonts.ready.then(function () { computeFrames(); applyCam(); });
  window.__tooey = { tl: tl, load: load, st: st, cam: cam };
})();
