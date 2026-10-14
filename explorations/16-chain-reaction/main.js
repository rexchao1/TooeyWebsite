/* Tooey: the kitchen marble run.
   One ball of sales sets off prep, shifts, and Monday. Built on GSAP. */
(function () {
  'use strict';

  var root = document.documentElement;
  var motion = root.classList.contains('motion') && window.gsap;
  var $ = function (s) { return document.querySelector(s); };

  /* ---------------- the machine's geometry (world units) ---------------- */
  var G = {
    chute: [{ x: 230, y: 245 }, { x: 760, y: 372 }],
    bowl: { x: 790, y: 450 },           // inner bottom of the ladle bowl
    pivot: { x: 842, y: 410 },
    tip: -26,                            // ladle tip, degrees
    rail: [{ x: 752, y: 505 }, { x: 232, y: 567 }],
    tubs: [650, 500, 350],
    track: [{ x: 158, y: 842 }, { x: 880, y: 922 }],
    cooks: [560, 690, 820],
    backboard: 930,
    ramp: [{ x: 924, y: 1054 }, { x: 452, y: 1174 }],
    bell: { x: 330, r: 54, y: 1174 }
  };

  var DAYS = {
    fri: { r: 34, label: 'Fri', fills: [0.84, 0.62, 0], cooks: [1, 1, 1], speed: 1 },
    tue: { r: 22, label: 'Tue', fills: [0.42, 0.3, 0], cooks: [0, 1, 0], speed: 1.12 }
  };

  function upNormal(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    var nx = dy / L, ny = -dx / L;
    if (ny > 0) { nx = -nx; ny = -ny; }
    return { x: nx, y: ny };
  }
  function off(p, n, r) { return { x: p.x + n.x * r, y: p.y + n.y * r }; }
  function onLine(line, x) {
    var a = line[0], b = line[1];
    return { x: x, y: a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x) };
  }
  function rot(p, c, deg) {
    var a = deg * Math.PI / 180, dx = p.x - c.x, dy = p.y - c.y;
    return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function pt(p) { return f(p.x) + ' ' + f(p.y); }
  function dist(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }

  /* ---------------- elements ---------------- */
  var el = {
    svg: $('#world'),
    ball: $('#ball'), spin: $('#ballspin'), body: $('#ballbody'), seam: $('#ballseam'), label: $('#balllabel'),
    receipt: $('#receipt'), printer: $('#printer'), ladle: $('#ladle'), track: $('#track'),
    backboard: $('#backboard'), bell: $('#bell'), rings: $('#rings'),
    fills: [$('#fill1'), $('#fill2'), null], lids: [$('#lid1'), $('#lid2'), $('#lid3')],
    cooks: [$('#cook1'), $('#cook2'), $('#cook3')],
    table1: $('#table1'), t1g: $('#t1g'), table2: $('#table2'), table3: $('#table3'),
    clock: $('#clock'), handH: $('#hand-h'), handM: $('#hand-m'), mail: $('#mail'), chips: [$('#chip1'), $('#chip2')],
    nums: [$('#n-p1'), $('#n-q1'), $('#n-p2'), $('#n-q2')], blank: $('#n-g')
  };
  var lines = Array.prototype.slice.call(document.querySelectorAll('.r-line'));
  var dayButtons = Array.prototype.slice.call(document.querySelectorAll('.day'));

  /* fills scale from the tub floor (y = 704) */
  var fillState = [0.84, 0.62, 0];
  function setFill(i, s) {
    fillState[i] = s;
    if (!el.fills[i]) return;
    el.fills[i].setAttribute('transform', 'matrix(1 0 0 ' + f(s * 1000) / 1000 + ' 0 ' + f((1 - s) * 704) + ')');
  }

  function setBall(day) {
    var d = DAYS[day], r = d.r, k = r * 0.7 * Math.SQRT1_2;
    el.body.setAttribute('r', r);
    el.seam.setAttribute('d', 'M' + f(-k) + ' ' + f(-k) + ' A' + f(r * 0.7) + ' ' + f(r * 0.7) + ' 0 0 1 ' + f(k) + ' ' + f(-k));
    el.seam.setAttribute('stroke-width', r > 25 ? 4 : 3);
    el.label.textContent = d.label;
    el.label.setAttribute('font-size', r > 25 ? 20 : 14);
    el.label.setAttribute('y', r > 25 ? 7 : 5);
    lines.forEach(function (l) { l.classList.toggle('is-hot', l.getAttribute('data-day') === day); });
  }
  function restPoint(r) { return { x: G.bell.x + G.bell.r + r, y: G.bell.y - r }; }

  /* The finished scene for a day, with no motion (reduced motion, and the end of every run). */
  function applyEnd(day) {
    var d = DAYS[day];
    setBall(day);
    var p = restPoint(d.r);
    el.ball.setAttribute('transform', 'translate(' + f(p.x) + ' ' + f(p.y) + ')');
    d.fills.forEach(function (s, i) { setFill(i, s); });
    el.cooks.forEach(function (c, i) { c.setAttribute('transform', d.cooks[i] ? '' : 'matrix(1 0 0 0.06 0 0)'); });
  }

  function syncButtons(day) {
    dayButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-day') === day)); });
  }

  /* ---------------- reduced motion or no GSAP: a finished, still machine ---------------- */
  if (!motion) {
    dayButtons.forEach(function (b) {
      b.addEventListener('click', function () { var day = b.getAttribute('data-day'); syncButtons(day); applyEnd(day); });
    });
    setupForm();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  var FLAT = 0.06;

  /* initial, folded state of everything the run touches */
  function foldRun(day, dur) {
    var d = DAYS[day];
    var tl = gsap.timeline();
    var start = off(G.chute[0], upNormal(G.chute[0], G.chute[1]), d.r);
    tl.to(el.receipt, { y: 110, duration: dur, ease: 'power2.in' }, 0)
      .to(el.ladle, { rotation: 0, svgOrigin: G.pivot.x + ' ' + G.pivot.y, duration: dur }, 0)
      .to(el.cooks, { scaleY: FLAT, transformOrigin: '50% 100%', duration: dur, ease: 'power2.in' }, 0)
      .to(el.t1g, { scaleY: 0, transformOrigin: '50% 100%', duration: dur * 0.6 }, 0)
      .to(el.table1, { scaleY: FLAT, transformOrigin: '50% 100%', duration: dur, ease: 'power2.in' }, 0)
      .to(el.rings, { opacity: 0, duration: dur * 0.5 }, 0)
      .to(el.bell, { rotation: 0, transformOrigin: '50% 100%', duration: dur }, 0)
      .to(fillState, {
        0: 0, 1: 0, duration: dur, ease: 'power2.in',
        onUpdate: function () { setFill(0, fillState[0]); setFill(1, fillState[1]); }
      }, 0)
      .to(el.ball, { opacity: 0, duration: dur * 0.6 }, 0)
      .add(function () { setBall(day); }, dur * 0.6)
      .set(el.ball, { x: start.x, y: start.y, opacity: 1 }, dur)
      .set(el.spin, { rotation: 0, svgOrigin: '0 0' }, dur);
    return tl;
  }

  /* ---------------- the run ---------------- */
  function buildRun(day) {
    var d = DAYS[day], R = d.r, s = d.speed;
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    var nC = upNormal(G.chute[0], G.chute[1]);
    var nR = upNormal(G.rail[0], G.rail[1]);
    var nT = upNormal(G.track[0], G.track[1]);
    var nP = upNormal(G.ramp[0], G.ramp[1]);
    var spin = 0, t = 0;

    // move the ball along a path starting at time `at`; rolling paths also spin it
    function move(path, dur, ease, at, len, dir) {
      tl.to(el.ball, { motionPath: { path: path }, duration: dur, ease: ease }, at);
      if (len) {
        spin += dir * len / R * 180 / Math.PI;
        tl.to(el.spin, { rotation: spin, svgOrigin: '0 0', duration: dur, ease: ease }, at);
      }
      return at + dur;
    }

    // 1. the printer prints the day's sales and lets the ball go
    tl.to(el.printer, { x: 2, duration: 0.05, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0)
      .fromTo(el.receipt, { y: 110 }, { y: 0, duration: 0.62, ease: 'steps(8)' }, 0);

    // 2. down the sheet pan
    var a = off(G.chute[0], nC, R), b = off(G.chute[1], nC, R);
    t = move('M' + pt(a) + ' L' + pt(b), 0.78 * s, 'power2.in', 0.55, dist(a, b), 1);

    // 3. off the end, into the ladle
    var inBowl = { x: G.bowl.x, y: G.bowl.y - R };
    t = move('M' + pt(b) + ' Q' + pt({ x: b.x + 26, y: b.y - 4 }) + ' ' + pt(inBowl), 0.24 * s, 'power1.in', t);
    tl.to(el.ball, { scaleX: 1.1, scaleY: 0.9, transformOrigin: '50% 100%', duration: 0.06, yoyo: true, repeat: 1 }, t);

    // 4. the ladle tips under the weight; the ball spills onto the rail; the ladle swings back
    var tTip = 0.34 * s;
    tl.to(el.ladle, { rotation: G.tip, svgOrigin: G.pivot.x + ' ' + G.pivot.y, duration: tTip, ease: 'power2.in' }, t);
    var lip = rot({ x: 744 + R * 0.25, y: 404 - R * 0.8 }, G.pivot, G.tip);
    var mid = rot({ x: inBowl.x - 18, y: inBowl.y + 2 }, G.pivot, G.tip * 0.6);
    t = move('M' + pt(inBowl) + ' Q' + pt(mid) + ' ' + pt(lip), tTip, 'power2.in', t);
    var land = off(onLine(G.rail, 712), nR, R);
    tl.to(el.ladle, { rotation: 0, svgOrigin: G.pivot.x + ' ' + G.pivot.y, duration: 1.3, ease: 'elastic.out(1, 0.32)' }, t + 0.04);
    t = move('M' + pt(lip) + ' Q' + pt({ x: lip.x - 16, y: lip.y + 4 }) + ' ' + pt(land), 0.24 * s, 'power1.in', t);

    // 5. along the rail, over the tubs: each tub fills as the ball passes
    var railEnd = off(G.rail[1], nR, R);
    var tRail = 0.92 * s, railAt = t;
    t = move('M' + pt(land) + ' L' + pt(railEnd), tRail, 'sine.in', t, dist(land, railEnd), -1);
    G.tubs.forEach(function (x, i) {
      var frac = (land.x - x) / (land.x - railEnd.x);
      var at = railAt + tRail * Math.pow(frac, 0.8);
      tl.to(el.lids[i], { y: -12, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, at);
      if (d.fills[i] > 0) {
        var proxy = { v: 0 };
        tl.to(proxy, {
          v: d.fills[i], duration: 0.7, ease: 'elastic.out(1, 0.45)',
          onUpdate: function () { setFill(i, proxy.v); }
        }, at + 0.04);
      } else {
        tl.to(el.lids[i], { rotation: 5, svgOrigin: x + ' 590', duration: 0.07, yoyo: true, repeat: 3 }, at + 0.1);
      }
    });

    // 6. off the rail, down past the card backstop, onto the card track
    var trackStart = off(onLine(G.track, 158 + 14 + R + 6), nT, R);
    t = move('M' + pt(railEnd) + ' Q' + pt({ x: railEnd.x - 34, y: railEnd.y + 30 }) + ' ' + pt(trackStart), 0.34 * s, 'power1.in', t);
    tl.to(el.track, { y: 5, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.out' }, t);

    // 7. along the card track; cooks stand up as the ball goes by
    var trackEnd = off(G.track[1], nT, R);
    var tTrack = 1.05 * s, trackAt = t;
    t = move('M' + pt(trackStart) + ' L' + pt(trackEnd), tTrack, 'sine.in', t, dist(trackStart, trackEnd), 1);
    G.cooks.forEach(function (x, i) {
      if (!d.cooks[i]) return;
      var frac = Math.max((x - 30 - trackStart.x) / (trackEnd.x - trackStart.x), 0);
      tl.to(el.cooks[i], { scaleY: 1, transformOrigin: '50% 100%', duration: 0.5, ease: 'back.out(2.4)' }, trackAt + tTrack * Math.sqrt(frac));
    });

    // 8. off the track, against the backboard, down to the ramp
    var touch = { x: G.backboard - R, y: trackEnd.y + 26 };
    var rampLand = off(onLine(G.ramp, 884), nP, R);
    tl.to(el.backboard, { x: 3, duration: 0.05, yoyo: true, repeat: 3 }, t + 0.17);
    t = move('M' + pt(trackEnd) + ' Q' + pt({ x: trackEnd.x + 36, y: trackEnd.y - 4 }) + ' ' + pt(touch) +
        ' Q' + pt({ x: touch.x - 6, y: touch.y + 60 }) + ' ' + pt(rampLand), 0.5 * s, 'power1.in', t);

    // 9. down the ramp to the bell
    var rampEnd = off(G.ramp[1], nP, R), rest = restPoint(R);
    t = move('M' + pt(rampLand) + ' L' + pt(rampEnd) + ' L' + pt(rest), 0.8 * s, 'power2.in', t,
             dist(rampLand, rampEnd) + dist(rampEnd, rest), -1);

    // 10. ding: the bell rocks, rings show, Monday's table pops up
    var hit = t;
    tl.set(el.bell, { transformOrigin: '50% 100%' }, 0);
    tl.to(el.bell, {
      keyframes: [{ rotation: -8, duration: 0.08 }, { rotation: 6, duration: 0.14 }, { rotation: -4, duration: 0.14 },
                  { rotation: 2, duration: 0.14 }, { rotation: 0, duration: 0.16 }],
      ease: 'sine.inOut'
    }, hit)
      .fromTo(el.rings, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.08, duration: 0.28, ease: 'power2.out' }, hit)
      .to(el.rings, { opacity: 0, scale: 1.2, duration: 0.7, ease: 'power1.in' }, hit + 0.6)
      .to(el.ball, { x: rest.x + 12, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 }, hit)
      .to(el.table1, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.5, ease: 'back.out(2.2)' }, hit + 0.18)
      .to(el.t1g, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.45, ease: 'back.out(2.6)' }, hit + 0.42);
    return tl;
  }

  var current = null, started = false;
  function run(day) {
    if (current) current.kill();
    started = true;
    syncButtons(day);
    var master = gsap.timeline();
    gsap.killTweensOf(follow);
    holdCam();
    master.add(foldRun(day, 0.45)).add(buildRun(day), '+=0.12').add(function () { releaseCam(0.2); });
    current = master;
  }

  /* ---------------- set the folded opening state ---------------- */
  (function initial() {
    var start = off(G.chute[0], upNormal(G.chute[0], G.chute[1]), DAYS.fri.r);
    setBall('fri');
    gsap.set(el.receipt, { y: 110 });
    gsap.set(el.ball, { x: start.x, y: start.y });
    gsap.set(el.cooks, { scaleY: FLAT, transformOrigin: '50% 100%' });
    gsap.set([el.table1, el.table2, el.table3], { scaleY: FLAT, transformOrigin: '50% 100%' });
    gsap.set(el.t1g, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(document.querySelectorAll('#table2 .pop-g, #table3 .pop-g'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(el.clock, { scaleY: FLAT, transformOrigin: '50% 100%' });
    gsap.set(el.handH, { rotation: 150, svgOrigin: '0 0' });
    gsap.set(el.handM, { rotation: 0, svgOrigin: '0 0' });
    gsap.set(el.rings, { opacity: 0 });
    setFill(0, 0); setFill(1, 0);
  })();

  ScrollTrigger.create({
    trigger: '#stage', start: 'top 75%', once: true,
    onEnter: function () { gsap.delayedCall(0.45, function () { if (!started) firstRun(); }); }
  });
  function firstRun() {
    started = true;
    syncButtons('fri');
    current = buildRun('fri');
    current.add(function () { releaseCam(0.2); });
  }
  window.__tooey = { run: run, current: function () { return current; } };
  dayButtons.forEach(function (b) {
    b.addEventListener('click', function () { run(b.getAttribute('data-day')); });
  });

  /* ---------------- the camera: one shot that follows the consequences ---------------- */
  var WIDE = [50, 20, 1010, 1356];
  var SHOTS = {
    wide: [WIDE, [240, 330, 960, 440], [120, 650, 920, 340], [150, 1010, 920, 370], WIDE],
    narrow: [WIDE, [150, 440, 620, 300], [150, 680, 800, 290], [180, 1040, 760, 330], WIDE]
  };
  var mqWide = window.matchMedia('(min-width: 960px)');
  var segP = [0, 0, 0, 0];
  var camT = 0;
  // While the ball runs, the opening shot rides along with it; `follow.w` blends that in.
  var follow = { w: 1 }, fr = null;

  function followTarget() {
    var bx = gsap.getProperty(el.ball, 'x'), by = gsap.getProperty(el.ball, 'y');
    var box = el.svg.getBoundingClientRect(), aspect = box.width / Math.max(box.height, 1);
    var w = mqWide.matches ? 1010 : 620, h = w / aspect;
    if (h > WIDE[3]) { h = WIDE[3]; w = h * aspect; }
    var cx = mqWide.matches ? WIDE[0] + WIDE[2] / 2 : clamp(bx, WIDE[0] + w / 2, WIDE[0] + WIDE[2] - w / 2);
    var cy = clamp(by + h * 0.12, WIDE[1] + h / 2, WIDE[1] + WIDE[3] - h / 2);
    return [cx - w / 2, cy - h / 2, w, h];
  }
  function clamp(v, lo, hi) { return lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)); }
  function mix(A, B, e) { return A.map(function (v, k) { return v + (B[k] - v) * e; }); }

  function setCam(t) {
    var keys = (mqWide.matches ? SHOTS.wide : SHOTS.narrow).slice();
    if (fr && follow.w > 0) keys[0] = mix(WIDE, fr, follow.w);
    var i = Math.min(Math.floor(t), keys.length - 2), u = t - i;
    var e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; // ease in-out
    var A = keys[i], B = keys[i + 1];
    var w = A[2] + (B[2] - A[2]) * e, h = A[3] + (B[3] - A[3]) * e;
    var cx = A[0] + A[2] / 2 + ((B[0] + B[2] / 2) - (A[0] + A[2] / 2)) * e;
    var cy = A[1] + A[3] / 2 + ((B[1] + B[3] / 2) - (A[1] + A[3] / 2)) * e;
    var z = 1 + 0.16 * Math.sin(Math.PI * u);   // the camera eases back a touch while it travels
    w *= z; h *= z;
    el.svg.setAttribute('viewBox', f(cx - w / 2) + ' ' + f(cy - h / 2) + ' ' + f(w) + ' ' + f(h));
  }
  gsap.ticker.add(function () {
    var target = segP[0] + segP[1] + segP[2] + segP[3];
    camT += (target - camT) * 0.09;
    if (Math.abs(target - camT) < 0.0005) camT = target;
    if (follow.w > 0) {
      var ft = followTarget();
      fr = fr ? mix(fr, ft, 0.085) : ft;
    }
    setCam(camT);
  });
  function releaseCam(delay) { return gsap.to(follow, { w: 0, duration: 1.8, ease: 'power2.inOut', delay: delay || 0 }); }
  function holdCam() { return gsap.to(follow, { w: 1, duration: 0.7, ease: 'power2.inOut' }); }

  ScrollTrigger.matchMedia({
    '(min-width: 960px)': function () { camera('top 92%', 'top 38%', 'bottom 120%', 'bottom 70%'); extras(true); },
    '(max-width: 959px)': function () { camera('top 98%', 'top 40%', 'bottom 118%', 'bottom 78%'); extras(false); }
  });

  function camera(s, e, s3, e3) {
    ['#prep', '#shifts', '#monday'].forEach(function (id, i) {
      ScrollTrigger.create({ trigger: id, start: s, end: e, onUpdate: function (st) { segP[i] = st.progress; } });
    });
    ScrollTrigger.create({ trigger: '#monday', start: s3, end: e3, onUpdate: function (st) { segP[3] = st.progress; } });
  }

  function extras(wide) {
    // Prep: the tubs' counts fly into the morning email (wide screens only), then it goes out
    if (wide) {
      var counts = [58, 64, 22, 25], shown = { a: 0, b: 0, c: 0, d: 0 };
      var paint = function () {
        el.nums[0].textContent = Math.round(shown.a); el.nums[1].textContent = Math.round(shown.b);
        el.nums[2].textContent = Math.round(shown.c); el.nums[3].textContent = Math.round(shown.d);
      };
      gsap.set(el.mail, { opacity: 0, x: 40 });
      gsap.set(el.blank, { opacity: 0 });
      paint();
      var mt = gsap.timeline({
        scrollTrigger: { trigger: '#prep', start: 'top 48%', endTrigger: '#shifts', end: 'top 60%', scrub: 0.6 },
        defaults: { ease: 'none' }
      });
      mt.to(el.mail, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, 0)
        .fromTo(el.chips[0], { opacity: 1, x: 650, y: 640 }, { motionPath: { path: 'M650 640 Q 900 470 1132 628' }, duration: 1, ease: 'power1.inOut' }, 0.6)
        .to(el.chips[0], { opacity: 0, duration: 0.2 }, 1.5)
        .to(shown, { a: counts[0], b: counts[1], duration: 0.7, onUpdate: paint }, 1.2)
        .fromTo(el.chips[1], { opacity: 1, x: 500, y: 660 }, { motionPath: { path: 'M500 660 Q 820 520 1132 680' }, duration: 1, ease: 'power1.inOut' }, 1.1)
        .to(el.chips[1], { opacity: 0, duration: 0.2 }, 2.0)
        .to(shown, { c: counts[2], d: counts[3], duration: 0.7, onUpdate: paint }, 1.7)
        .to(el.blank, { opacity: 0.85, duration: 0.4 }, 2.2)
        .to({}, { duration: 1.6 })
        .to(el.mail, { x: 140, opacity: 0, duration: 0.9, ease: 'power2.in' });
    }
    // Shifts: a card clock stands up beside the line and runs into the evening rush
    gsap.timeline({ scrollTrigger: { trigger: '#shifts', start: wide ? 'top 50%' : 'top 70%', end: wide ? 'top -10%' : 'top 15%', scrub: 0.6 } })
      .to(el.clock, { scaleY: 1, transformOrigin: '50% 100%', ease: 'back.out(1.8)', duration: 0.6 }, 0)
      .to(el.handH, { rotation: 240, svgOrigin: '0 0', ease: 'none', duration: 1.4 }, 0.3)
      .to(el.handM, { rotation: 1080, svgOrigin: '0 0', ease: 'none', duration: 1.4 }, 0.3);
    // Monday: the bell keeps the room filling, table by table
    var g2 = document.querySelector('#table2 .pop-g'), g3 = document.querySelector('#table3 .pop-g');
    gsap.timeline({ scrollTrigger: { trigger: '#monday', start: wide ? 'top 48%' : 'top 70%', end: wide ? 'top -5%' : 'top 25%', scrub: 0.6 } })
      .to(el.table2, { scaleY: 1, transformOrigin: '50% 100%', ease: 'back.out(2)', duration: 1 }, 0)
      .to(g2, { scaleY: 1, transformOrigin: '50% 100%', ease: 'back.out(2.4)', duration: 0.8 }, 0.6)
      .to(el.table3, { scaleY: 1, transformOrigin: '50% 100%', ease: 'back.out(2)', duration: 1 }, 1)
      .to(g3, { scaleY: 1, transformOrigin: '50% 100%', ease: 'back.out(2.4)', duration: 0.8 }, 1.6);
  }

  setupForm();

  /* ---------------- contact form ---------------- */
  function setupForm() {
    var form = document.getElementById('form');
    if (!form) return;
    var status = document.getElementById('status');
    var send = document.getElementById('send');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var bad = null;
      ['f-name', 'f-rest', 'f-email'].forEach(function (id) {
        var i = document.getElementById(id);
        var ok = i.value.trim() !== '' && (i.type !== 'email' || /.+@.+\..+/.test(i.value));
        i.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) bad = i;
      });
      if (bad) {
        status.textContent = 'Add your name, restaurant, and a working email, then send again.';
        bad.focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      send.disabled = true;
      send.textContent = 'Sending…';
      status.textContent = '';
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        return r.json();
      }).then(function (j) {
        if (j && (j.success === true || j.success === 'true')) done(form);
        else throw new Error('not accepted');
      }).catch(function () {
        send.disabled = false;
        send.textContent = 'Send';
        status.innerHTML = 'That didn’t send. Try again, or email <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>.';
      });
    });
  }

  function done(form) {
    var box = document.createElement('div');
    box.className = 'done';
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.innerHTML =
      '<svg viewBox="250 1010 160 130" aria-hidden="true">' +
      '<g class="dbell"><rect class="c-card" x="262" y="1110" width="136" height="14" rx="6"/>' +
      '<path class="c-card" d="M276 1110 A54 54 0 0 1 384 1110 Z"/><path class="c-shade" d="M330 1056 A54 54 0 0 1 384 1110 L330 1110 Z"/>' +
      '<rect class="c-card" x="325" y="1044" width="10" height="13"/><ellipse class="c-card" cx="330" cy="1042" rx="14" ry="6"/></g>' +
      '<g class="drings"><path class="ring" d="M262 1026 q -22 34 0 68"/><path class="ring" d="M398 1026 q 22 34 0 68"/></g></svg>' +
      '<p>Sent. We’ll reply from tooeyteam@gmail.com.</p>';
    form.innerHTML = '';
    form.appendChild(box);
    box.focus();
    if (window.gsap && root.classList.contains('motion')) {
      gsap.fromTo(box.querySelector('.dbell'), { rotation: -9, svgOrigin: '330 1124' },
        { rotation: 0, duration: 1.1, ease: 'elastic.out(1.2, 0.3)', svgOrigin: '330 1124' });
      gsap.fromTo(box.querySelector('.drings'), { opacity: 0, scale: 0.7, svgOrigin: '330 1060' },
        { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1, repeatDelay: 0.5 });
    }
  }
})();
