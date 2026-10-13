/* The pitch falls apart.
   The sentence loads as a sales pitch. The hype words come loose, fall under
   gravity (matter-js) and pile up on the floor of the hero, where they can be
   grabbed and thrown. The true words close up (FLIP, GSAP) into the plain
   sentence. "Exactly" goes last. Undo puts the pitch back and drops it again. */
/* Reduced motion: nothing moves, but the heap is still a real heap. The same
   physics runs to rest off screen in one go and only the settled pile is drawn. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('still') || !window.Matter) return;
  var M = window.Matter;
  var hero = document.querySelector('.hero');
  var stage = hero.querySelector('.stage');
  var src = hero.querySelector('.heap-static');
  if (!src) return;
  var words = [].slice.call(src.querySelectorAll('span'));

  // a fixed seed, so the pile is the same on every visit
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function rand(a, b) { return a + rnd() * (b - a); }

  function bake() {
    seed = 7;
    stage.textContent = '';
    hero.classList.remove('baked');
    var fs = parseFloat(getComputedStyle(src).fontSize);
    var sizes = words.map(function (el) { return { w: el.offsetWidth, h: fs * 1.06, text: el.textContent }; });
    var area = sizes.reduce(function (a, s) { return a + s.w * s.h; }, 0);
    var Wd = hero.clientWidth;
    var heap = Math.max(Wd < 720 ? 170 : 190, area * (Wd < 720 ? 2.1 : 1.9) / Math.min(Wd, 1500) + 44);
    hero.style.setProperty('--heap', Math.round(heap) + 'px');
    hero.classList.add('baked');
    var Hh = hero.clientHeight;

    var engine = M.Engine.create({ enableSleeping: true });
    engine.gravity.scale = 0.0019;
    var t = 400, o = { isStatic: true, friction: 0.9 };
    M.Composite.add(engine.world, [
      M.Bodies.rectangle(Wd / 2, Hh + t / 2, Wd * 3, t, o),
      M.Bodies.rectangle(-t / 2, Hh / 2, t, Hh * 6, o),
      M.Bodies.rectangle(Wd + t / 2, Hh / 2, t, Hh * 6, o)
    ]);
    var lanes = sizes.map(function (_, i) { return (i + rand(0.2, 0.8)) / sizes.length; })
      .sort(function () { return rnd() - 0.5; });
    var items = sizes.map(function (s, i) {
      var top = /[A-Zbdfhklt'’]/.test(s.text) ? 0.15 : 0.34;
      var bot = /[gjpqy]/.test(s.text) ? 1.05 : 0.875;
      var bh = (bot - top) * fs, cy = (top + bot) / 2 * fs;
      var x = lanes[i] * (Wd - s.w) + s.w / 2;
      var y = Hh - heap - i * fs * 1.3;
      var b = M.Bodies.rectangle(x, y, s.w * 0.98, bh, {
        angle: rand(-0.5, 0.5), chamfer: { radius: bh * 0.22 },
        friction: 0.55, frictionStatic: 0.6, frictionAir: 0.012, restitution: 0.18, density: 0.0016
      });
      M.Composite.add(engine.world, b);
      return { s: s, b: b, cy: cy, still: 0, flops: 0 };
    });
    for (var n = 0; n < 1400; n++) {
      M.Engine.update(engine, 1000 / 60);
      items.forEach(function (it) {
        var b = it.b;
        if (b.speed < 0.6 && Math.abs(Math.sin(b.angle)) > 0.72 && it.flops < 3) {
          if (++it.still > 24) {
            var lean = Math.sin(b.angle) * Math.cos(b.angle) >= 0 ? 1 : -1;
            if (it.flops === 1) lean = -lean;
            it.flops++; it.still = 0;
            M.Sleeping.set(b, false);
            M.Body.setVelocity(b, { x: lean * 1.2, y: -4.5 });
            M.Body.setAngularVelocity(b, lean * 0.09);
          }
        } else it.still = 0;
      });
      if (n > 200 && items.every(function (it) { return it.b.isSleeping; })) break;
    }
    items.forEach(function (it) {
      var el = document.createElement('span');
      el.className = 'bit down baked';
      el.textContent = it.s.text;
      el.style.fontSize = fs + 'px';
      el.style.width = it.s.w + 'px';
      el.style.height = it.s.h + 'px';
      el.style.transformOrigin = '50% ' + it.cy.toFixed(1) + 'px';
      el.style.transform = 'translate(' + (it.b.position.x - it.s.w / 2).toFixed(1) + 'px,' +
        (it.b.position.y - it.cy).toFixed(1) + 'px) rotate(' + it.b.angle.toFixed(4) + 'rad)';
      stage.appendChild(el);
    });
  }

  function go() {
    bake();
    var lastW = window.innerWidth, timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (Math.abs(window.innerWidth - lastW) < 2) return;
        lastW = window.innerWidth;
        bake();
      }, 150);
    });
  }
  var ready = document.fonts && document.fonts.load
    ? Promise.race([document.fonts.load('800 40px "Archivo"'), new Promise(function (r) { setTimeout(r, 2500); })])
    : Promise.resolve();
  ready.then(go);
})();

(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('moving')) return;
  if (!window.gsap || !window.Matter) return;   // the head script falls back to the still state

  var M = window.Matter;
  var hero = document.querySelector('.hero');
  var copy = hero.querySelector('.hero-copy');
  var pitch = document.getElementById('pitch');
  var after = hero.querySelector('.after');
  var undoBtn = hero.querySelector('.undo');
  var stage = hero.querySelector('.stage');
  var zone = hero.querySelector('.heap-zone');

  var T = [].slice.call(pitch.querySelectorAll('.t'));
  var X = pitch.querySelector('.x');
  var H = [].slice.call(pitch.querySelectorAll('.h')).filter(function (el) { return el !== X; });
  var P = [].slice.call(pitch.querySelectorAll('.p'));

  var engine, world, walls = [], bits = [], drag = null;
  var running = false, visible = true, busy = true, gen = 0;
  var W = 0, Hh = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function fsA() { return parseFloat(getComputedStyle(pitch).fontSize); }

  // position of an inline word inside the hero, ignoring transforms
  function box(el) {
    return {
      x: el.offsetLeft + copy.offsetLeft,
      y: el.offsetTop + copy.offsetTop,
      w: el.offsetWidth,
      h: el.offsetHeight
    };
  }

  // a timer that dies when the sequence is restarted
  function later(ms, fn) {
    var g = gen;
    return new Promise(function (res) {
      setTimeout(function () { if (g === gen) { if (fn) fn(); res(); } }, ms);
    });
  }

  /* ---------- sizing ---------- */

  function measure() {
    var cls = pitch.className;
    pitch.style.minHeight = '';
    pitch.className = 'pitch on';
    var h0 = pitch.offsetHeight;
    var area = 0;
    H.concat([X]).forEach(function (el) { area += el.offsetWidth * el.offsetHeight; });
    pitch.className = 'pitch on s1 s2';
    var h2 = pitch.offsetHeight;
    pitch.className = cls;
    pitch.style.minHeight = Math.max(h0, h2) + 'px';

    var w = hero.clientWidth;
    var narrow = w < 720;
    // words only drift so far sideways, so very wide screens pile up as if narrower
    var heap = Math.max(narrow ? 170 : 190, area * (narrow ? 2.1 : 1.9) / Math.min(w, 1500) + 44);
    hero.style.setProperty('--heap', Math.round(heap) + 'px');
  }

  /* ---------- physics ---------- */

  function setupWorld() {
    engine = M.Engine.create({ enableSleeping: true });
    engine.gravity.y = 1;
    engine.gravity.scale = 0.0019;
    world = engine.world;
    buildWalls();
  }

  function buildWalls() {
    if (walls.length) M.Composite.remove(world, walls);
    W = hero.clientWidth; Hh = hero.clientHeight;
    var t = 400, opts = { isStatic: true, friction: 0.9, restitution: 0.1 };
    walls = [
      M.Bodies.rectangle(W / 2, Hh + t / 2, W * 3, t, opts),          // floor: the top of the navy band
      M.Bodies.rectangle(-t / 2, Hh / 2, t, Hh * 4, opts),            // left
      M.Bodies.rectangle(W + t / 2, Hh / 2, t, Hh * 4, opts),         // right
      M.Bodies.rectangle(W / 2, -Hh - t / 2, W * 3, t, opts)          // lid, well above
    ];
    M.Composite.add(world, walls);
  }

  function detach(el, kick) {
    var b = box(el);
    var fs = fsA();
    var rot = gsap.getProperty(el, 'rotation') || 0;
    var dy = gsap.getProperty(el, 'y') || 0;
    gsap.killTweensOf(el);

    var c = document.createElement('span');
    c.className = 'bit';
    c.textContent = el.textContent;
    c.style.fontSize = fs + 'px';
    c.style.width = b.w + 'px';
    c.style.height = b.h + 'px';
    stage.appendChild(c);
    el.style.visibility = 'hidden';

    // the body is the word's ink, not its line box: Archivo's baseline sits
    // 0.864em down a 1.06em line; ascenders reach 0.15em, descenders 1.05em
    var txt = el.textContent;
    var top = /[A-Zbdfhklt'’]/.test(txt) ? 0.15 : 0.34;
    var bot = /[gjpqy]/.test(txt) ? 1.05 : 0.875;
    var bh = (bot - top) * fs;
    var cy = (top + bot) / 2 * fs;
    c.style.transformOrigin = '50% ' + cy.toFixed(1) + 'px';
    var body = M.Bodies.rectangle(b.x + b.w / 2, b.y + dy + cy, b.w * 0.98, bh, {
      angle: rot * Math.PI / 180,
      chamfer: { radius: bh * 0.22 },
      friction: 0.55,
      frictionStatic: 0.6,
      frictionAir: 0.012,
      restitution: 0.18,
      density: 0.0016,
      slop: 0.02
    });
    M.Body.setVelocity(body, { x: kick.vx, y: kick.vy });
    M.Body.setAngularVelocity(body, kick.va);
    M.Composite.add(world, body);

    var bit = { el: c, body: body, src: el, w: b.w, h: b.h, cy: cy };
    bits.push(bit);
    bind(bit);
    draw(bit);
    setTimeout(function () { c.classList.add('down'); }, 260);
    wake();
    return bit;
  }

  function draw(bit) {
    var p = bit.body.position;
    bit.el.style.transform = 'translate3d(' + (p.x - bit.w / 2).toFixed(1) + 'px,' +
      (p.y - bit.cy).toFixed(1) + 'px,0) rotate(' + bit.body.angle.toFixed(4) + 'rad)';
  }

  var last = 0, acc = 0, STEP = 1000 / 60;
  function frame(now) {
    if (!running) return;
    acc += Math.min(now - last, 64); last = now;
    while (acc >= STEP) { M.Engine.update(engine, STEP); acc -= STEP; }
    var awake = !!drag;
    for (var i = 0; i < bits.length; i++) {
      var bit = bits[i], b = bit.body;
      if (bit.tween) continue;
      // a word left standing on its end flops over, so the heap stays low
      if (!(drag && drag.bit === bit) && b.speed < 0.6 &&
          Math.abs(Math.sin(b.angle)) > 0.72 && b.position.y > Hh * 0.4 && (bit.flops || 0) < 3) {
        bit.still = (bit.still || 0) + 1;
        if (bit.still > 24) {
          var lean = Math.sin(b.angle) * Math.cos(b.angle) >= 0 ? 1 : -1;
          if (bit.flops === 1) lean = -lean;
          bit.flops = (bit.flops || 0) + 1;
          bit.still = 0;
          M.Sleeping.set(b, false);
          M.Body.setVelocity(b, { x: lean * 1.2, y: -4.5 });
          M.Body.setAngularVelocity(b, lean * 0.09);
          awake = true;
        }
      } else {
        bit.still = 0;
      }
      draw(bit);
      if (!b.isSleeping) awake = true;
    }
    if (!awake || !visible) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function wake() {
    if (running || !visible) return;
    running = true; last = performance.now(); acc = 0;
    requestAnimationFrame(frame);
  }

  /* ---------- grab and throw ---------- */

  function local(e) {
    var r = hero.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function bind(bit) {
    var el = bit.el, start = null;
    el.addEventListener('pointerdown', function (e) {
      if (bit.tween || busy && !bit.free) { /* still falling: allow anyway */ }
      if (bit.tween) return;
      var p = local(e);
      start = { x: p.x, y: p.y, t: performance.now(), type: e.pointerType };
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        grab(bit, p);
      }
    });
    el.addEventListener('pointermove', function (e) {
      if (drag && drag.bit === bit) drag.c.pointA = local(e);
    });
    function end(e) {
      if (!start) return;
      var p = local(e);
      var moved = Math.hypot(p.x - start.x, p.y - start.y);
      var quick = performance.now() - start.t < 350;
      if (drag && drag.bit === bit) release();
      if (moved < 8 && quick && e.type === 'pointerup') toss(bit);
      start = null;
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', function () { if (drag && drag.bit === bit) release(); start = null; });
  }

  function grab(bit, p) {
    var b = bit.body;
    M.Sleeping.set(b, false);
    var c = M.Constraint.create({
      pointA: p,
      bodyB: b,
      pointB: { x: p.x - b.position.x, y: p.y - b.position.y },
      stiffness: 0.18,
      damping: 0.08,
      length: 0
    });
    M.Composite.add(world, c);
    drag = { bit: bit, c: c };
    bit.el.classList.add('held');
    wake();
  }
  function release() {
    M.Composite.remove(world, drag.c);
    drag.bit.el.classList.remove('held');
    drag = null;
    wake();
  }
  function toss(bit) {
    var b = bit.body;
    M.Sleeping.set(b, false);
    var m = Math.sqrt(Math.min(1, 9000 / (b.area || 9000)));
    M.Body.setVelocity(b, { x: rand(-5, 5), y: -rand(13, 18) * (0.75 + 0.25 * m) });
    M.Body.setAngularVelocity(b, rand(-0.22, 0.22));
    wake();
  }

  /* ---------- the true words close up ---------- */

  function flip(change, dur, ease, extra, stagger) {
    var els = T.concat(extra || []);
    gsap.set(els, { clearProps: 'x,y,scale' });
    var first = els.map(function (el) { return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth }; });
    change();
    els.forEach(function (el, i) {
      var f = first[i];
      var dx = f.x - el.offsetLeft, dy = f.y - el.offsetTop, s = f.w / (el.offsetWidth || 1);
      gsap.fromTo(el, { x: dx, y: dy, scale: s, transformOrigin: '0 0' },
        { x: 0, y: 0, scale: 1, duration: dur, ease: ease, delay: i * (stagger || 0.006) });
    });
  }

  // the plain sentence takes up the room the hype left: the type itself grows
  // and re-sets line by line, so the words never cross each other
  function grow() {
    var a = parseFloat(getComputedStyle(pitch).fontSize);
    pitch.classList.add('s2');
    var b = parseFloat(getComputedStyle(pitch).fontSize);
    gsap.set(T, { clearProps: 'x,y,scale' });
    gsap.fromTo(pitch, { fontSize: a }, {
      fontSize: b, duration: 0.85, ease: 'power3.inOut',
      onComplete: function () { pitch.style.fontSize = ''; }
    });
  }

  /* ---------- the sequence ---------- */

  function loosen() {
    // the hype is set a little crooked, and never quite holds still
    H.concat([X]).forEach(function (el) {
      var r = (Math.random() < 0.5 ? -1 : 1) * rand(1.2, 3.4);
      gsap.set(el, { rotation: r, y: rand(-0.07, 0.08) * fsA(), transformOrigin: '50% 60%' });
      gsap.to(el, {
        rotation: r + rand(-1.4, 1.4), duration: rand(0.7, 1.2),
        ease: 'sine.inOut', yoyo: true, repeat: -1, delay: rand(0, 0.5)
      });
    });
  }

  // each word drifts toward its own patch of floor, so the heap spreads out
  // across the width instead of piling up under the text
  var lanes = [];
  function drift(el) {
    var b = box(el);
    if (!lanes.length) {
      var n = H.length + 1;
      for (var i = 0; i < n; i++) lanes.push((i + rand(0.2, 0.8)) / n);
      lanes.sort(function () { return Math.random() - 0.5; });
    }
    var target = lanes.pop() * (W - b.w) + b.w / 2;
    var steps = Math.sqrt(2 * Math.max(120, Hh - b.y) / 0.53);
    var vx = Math.max(-10, Math.min(10, (target - (b.x + b.w / 2)) / steps));
    return { vx: vx, vy: rand(-3.4, -1.4), va: rand(-0.05, 0.05) + vx * 0.006 };
  }

  function fall() {
    lanes = [];
    // roughly reading order, a little out of step
    var order = H.map(function (el, i) { return { el: el, k: i + rand(-1.2, 1.2) }; })
      .sort(function (a, b) { return a.k - b.k; });
    gsap.to(P, { opacity: 0, duration: 0.25, ease: 'power1.out' });
    var stepMs = 62;
    order.forEach(function (o, i) {
      later(120 + i * stepMs, function () {
        detach(o.el, drift(o.el));
      });
    });
    return 120 + order.length * stepMs;
  }

  function play(first) {
    busy = true;
    var g = ++gen;
    loosen();
    if (first) pitch.classList.add('on');
    var hold = first ? 1350 : 900;
    return later(hold).then(function () {
      var dur = fall();
      return later(dur + 60);
    }).then(function () {
      // everything but "exactly" has gone; the line closes up around it
      flip(function () { pitch.classList.add('s1'); }, 0.72, 'power3.inOut', [X]);
      return later(820);
    }).then(function () {
      // "exactly" hangs on, shivers, and goes
      gsap.killTweensOf(X);
      var base = gsap.getProperty(X, 'rotation');
      var tl = gsap.timeline();
      for (var i = 0; i < 9; i++) {
        tl.to(X, { x: (i % 2 ? -1 : 1) * rand(1.2, 2.4), rotation: base + (i % 2 ? -1 : 1) * rand(0.8, 2), duration: 0.045, ease: 'none' });
      }
      tl.to(X, { x: 0, rotation: base, duration: 0.05 });
      tl.to({}, { duration: 0.28 });
      tl.to(X, { rotation: base + 7, y: '+=3', duration: 0.09, ease: 'power2.in', transformOrigin: '100% 100%' });
      return later(1020);
    }).then(function () {
      var k = drift(X);
      detach(X, { vx: k.vx, vy: 0.5, va: 0.06 });
      grow();
      return later(720);
    }).then(function () {
      after.classList.add('on');
      undoBtn.hidden = false;
      busy = false;
      if (g === gen) window.__pitchDone = true;
    });
  }

  function undo() {
    if (busy) return;
    busy = true; gen++;
    if (drag) release();
    after.classList.remove('on');

    // words go back into the pitch at its small size
    flip(function () {
      pitch.classList.remove('s1', 's2');
    }, 0.8, 'expo.inOut');
    gsap.to(P, { opacity: 1, duration: 0.3, delay: 0.55 });

    var slots = H.concat([X]);
    var returned = 0;
    bits.forEach(function (bit, i) {
      var b = bit.body, s = box(bit.src);
      M.Composite.remove(world, b);
      bit.tween = true;
      bit.el.classList.remove('down');
      var from = { x: b.position.x - bit.w / 2, y: b.position.y - bit.cy, r: b.angle * 180 / Math.PI };
      while (from.r - 0 > 180) from.r -= 360;
      while (from.r < -180) from.r += 360;
      gsap.fromTo(from, { x: from.x, y: from.y, r: from.r }, {
        x: s.x, y: s.y, r: 0, duration: 0.85, delay: 0.02 * i, ease: 'expo.inOut',
        onUpdate: function () {
          bit.el.style.transform = 'translate3d(' + from.x + 'px,' + from.y + 'px,0) rotate(' + from.r + 'deg)';
        },
        onComplete: function () {
          bit.src.style.visibility = '';
          gsap.set(bit.src, { rotation: 0, x: 0, y: 0 });
          bit.el.remove();
          if (++returned === bits.length) {
            bits = [];
            gsap.set(T, { clearProps: 'x,y,scale' });
            play(false);
          }
        }
      });
    });
    if (!bits.length) play(false);
  }

  /* ---------- start ---------- */

  function start() {
    window.__pitch = true;
    measure();
    setupWorld();
    play(true);

    undoBtn.addEventListener('click', undo);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) wake();
      }).observe(hero);
    }

    var lastW = window.innerWidth, t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (Math.abs(window.innerWidth - lastW) < 2 && Math.abs(hero.clientHeight - Hh) < 2) return;
        lastW = window.innerWidth;
        measure();
        buildWalls();
        bits.forEach(function (bit) {
          var p = bit.body.position;
          var x = Math.min(Math.max(p.x, bit.w / 2), W - bit.w / 2);
          var y = Math.min(p.y, Hh - bit.h);
          M.Body.setPosition(bit.body, { x: x, y: y });
          M.Sleeping.set(bit.body, false);
        });
        wake();
      }, 150);
    });
  }

  var fontsReady = document.fonts && document.fonts.load
    ? Promise.race([
        document.fonts.load('800 40px "Archivo"').then(function () { return document.fonts.ready; }),
        new Promise(function (r) { setTimeout(r, 2500); })
      ])
    : Promise.resolve();
  window.__pitch = 'waiting';
  fontsReady.then(function () { requestAnimationFrame(start); });
})();
