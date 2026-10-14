/* Tooey, "In control": a desk with motorised faders, a patch cable, and a key for the owner. */
(function () {
  'use strict';

  var root = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap || null;

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var touched = false;
  window.addEventListener('pointerdown', function () { touched = true; }, { capture: true, once: true });
  var buzz = function (ms) { if (!touched) return; try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* no haptics */ } };
  var later = function (s, fn) { return G ? G.delayedCall(s, fn) : setTimeout(fn, s * 1000); };

  /* ---------- one animation loop for everything ---------- */
  var tickers = [];
  var last = 0;
  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    for (var i = 0; i < tickers.length; i++) tickers[i](dt, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* =========================================================
     Fader: a cap with weight. Modes: rest, motor, hand, detent.
     ========================================================= */
  function Fader(el, opts) {
    var self = this;
    opts = opts || {};
    this.el = el;
    this.slot = el.querySelector('.slot');
    this.max = +el.dataset.max || 10;
    this.blank = el.dataset.set === 'blank';
    this.setVal = this.blank ? 0 : (+el.dataset.set || 0);
    this.p = (+el.getAttribute('aria-valuenow') || 0) / this.max;
    this.vel = 0;
    this.target = this.p;
    this.handTarget = this.p;
    this.mode = 'rest';
    this.jx = 0;
    this.motorised = !!opts.motorised;
    this.lcd = opts.lcd || null;
    this.label = opts.label || '';
    this.lastInt = Math.round(this.p * this.max);
    this.onSettle = null;

    el.addEventListener('pointerdown', function (e) { self.down(e); });
    el.addEventListener('pointermove', function (e) { self.move(e); });
    el.addEventListener('pointerup', function (e) { self.up(e); });
    el.addEventListener('pointercancel', function (e) { self.up(e); });
    el.addEventListener('lostpointercapture', function (e) { self.up(e); });
    el.addEventListener('keydown', function (e) { self.key(e); });
  }

  Fader.prototype.capFrac = function (rect, horiz) {
    var capH = parseFloat(getComputedStyle(this.el).getPropertyValue('--cap-h')) || 50;
    var along = horiz ? this.slot.offsetWidth : this.slot.offsetHeight;
    return clamp(capH / Math.max(1, along), 0, 0.9);
  };
  Fader.prototype.pointerP = function (e) {
    var r = this.slot.getBoundingClientRect();
    var horiz = r.width > r.height * 1.5;
    var cf = this.capFrac(r, horiz);
    var f = horiz ? (e.clientX - r.left) / r.width : 1 - (e.clientY - r.top) / r.height;
    return (f - cf / 2) / (1 - cf);
  };
  Fader.prototype.down = function (e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    try { this.el.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
    this.el.focus({ preventScroll: true, focusVisible: false });
    var pp = this.pointerP(e);
    var onCap = !!e.target.closest('.cap');
    this.grabOff = onCap ? pp - this.p : 0;
    this.held = true;
    this.el.classList.add('held');
    this.handTarget = clamp(pp - this.grabOff, 0, 1);
    this.release();
    if (still) { this.p = this.handTarget; this.render(); this.ints(); }
    else this.mode = 'hand';
  };
  Fader.prototype.move = function (e) {
    if (!this.held) return;
    this.handTarget = clamp(this.pointerP(e) - this.grabOff, 0, 1);
    if (still) { this.p = this.handTarget; this.render(); this.ints(); }
  };
  Fader.prototype.up = function () {
    if (!this.held) return;
    this.held = false;
    this.el.classList.remove('held');
    this.snap();
  };
  Fader.prototype.snap = function () {
    var t = Math.round(this.p * this.max) / this.max;
    if (still) { this.p = t; this.render(); this.ints(); this.mode = 'rest'; this.markOwned(); return; }
    this.target = t;
    this.mode = 'detent';
  };
  Fader.prototype.key = function (e) {
    var cur = Math.round((this.mode === 'detent' ? this.target : this.p) * this.max);
    var n = cur;
    switch (e.key) {
      case 'ArrowUp': case 'ArrowRight': n = cur + 1; break;
      case 'ArrowDown': case 'ArrowLeft': n = cur - 1; break;
      case 'PageUp': n = cur + 5; break;
      case 'PageDown': n = cur - 5; break;
      case 'Home': n = 0; break;
      case 'End': n = this.max; break;
      default: return;
    }
    e.preventDefault();
    n = clamp(n, 0, this.max);
    this.release();
    this.target = n / this.max;
    if (still) { this.p = this.target; this.render(); this.ints(); this.markOwned(); return; }
    this.mode = 'detent';
  };
  /* the motor lets go the moment a hand is on the cap */
  Fader.prototype.release = function () {
    if (this.motorTimer) { if (G && this.motorTimer.kill) this.motorTimer.kill(); else clearTimeout(this.motorTimer); this.motorTimer = null; }
    this.el.classList.remove('set');
    if (this.motorised) this.el.classList.add('touched');
  };
  Fader.prototype.motorTo = function (val, delay, done) {
    var self = this;
    var go = function () {
      self.motorTimer = null;
      self.target = val / self.max;
      self.el.classList.remove('owned', 'set', 'touched');
      self.onSettle = done || null;
      if (still) { self.p = self.target; self.vel = 0; self.render(); self.ints(); self.settled('motor'); return; }
      self.mode = 'motor';
    };
    if (delay > 0 && !still) this.motorTimer = later(delay, go); else go();
  };
  Fader.prototype.step = function (dt) {
    if (this.mode === 'rest') return;
    var k, c, vmax = Infinity, tgt;
    if (this.mode === 'motor') { k = 95; c = 12.5; vmax = 1.45; tgt = this.target; }
    else if (this.mode === 'hand') { k = 620; c = 44; tgt = this.handTarget; }
    else { k = 430; c = 30; tgt = this.target; }
    var n = Math.ceil(dt / (1 / 240)), h = dt / n;
    for (var i = 0; i < n; i++) {
      var a = k * (tgt - this.p) - c * this.vel;
      this.vel += a * h;
      if (this.vel > vmax) this.vel = vmax; else if (this.vel < -vmax) this.vel = -vmax;
      this.p += this.vel * h;
      if (this.p < 0) { this.p = 0; this.vel = -this.vel * 0.25; }
      if (this.p > 1) { this.p = 1; this.vel = -this.vel * 0.25; }
    }
    /* the motor hums through the cap while it drives */
    this.jx = (this.mode === 'motor' && Math.abs(this.vel) > 0.06) ? (Math.random() - 0.5) * 0.9 : 0;
    this.render();
    this.ints();
    if (this.mode !== 'hand' && Math.abs(tgt - this.p) < 0.0007 && Math.abs(this.vel) < 0.004) {
      this.p = tgt; this.vel = 0; this.jx = 0; this.render();
      var m = this.mode; this.mode = 'rest';
      this.settled(m);
    }
  };
  Fader.prototype.settled = function (m) {
    if (m === 'motor') {
      if (this.motorised && this.p > 0 && Math.round(this.p * this.max) === this.setVal) this.el.classList.add('set');
      var cb = this.onSettle; this.onSettle = null;
      if (cb) cb(this);
    } else this.markOwned();
  };
  Fader.prototype.markOwned = function () {
    if (!this.motorised) return;
    var v = Math.round(this.p * this.max);
    var mine = v !== this.setVal;
    this.el.classList.toggle('owned', mine && root.querySelector('.bank-prep.powered') !== null);
    if (!mine && this.el.closest('.powered')) this.el.classList.add('set');
  };
  Fader.prototype.render = function () {
    this.el.style.setProperty('--p', this.p.toFixed(4));
    this.el.style.setProperty('--jx', this.jx.toFixed(2) + 'px');
  };
  Fader.prototype.ints = function () {
    var v = Math.round(this.p * this.max);
    if (v === this.lastInt) return;
    if (this.mode === 'hand' || this.mode === 'detent') buzz(4);
    this.lastInt = v;
    this.show(v);
  };
  Fader.prototype.show = function (v) {
    this.el.setAttribute('aria-valuenow', String(v));
    if (this.blank && v === 0) this.el.setAttribute('aria-valuetext', 'Blank, too new to call');
    else if (this.motorised) this.el.setAttribute('aria-valuetext', v + (this.blank ? '' : (v === this.setVal ? ', as Tooey set it' : ', Tooey set ' + this.setVal)));
    else this.el.removeAttribute('aria-valuetext');
    if (!this.lcd) return;
    if (this.blank && v === 0) { this.lcd.textContent = 'Too new to call'; this.lcd.classList.add('lcd-note'); }
    else { this.lcd.textContent = String(v); this.lcd.classList.remove('lcd-note'); }
  };

  /* =========================================================
     Knob: detented, with a little hesitation at each click
     ========================================================= */
  function Knob(el) {
    var self = this;
    this.el = el;
    this.max = 10;
    this.v = 0; this.vel = 0; this.target = 0; this.mode = 'rest';
    this.lastInt = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
      el.focus({ preventScroll: true, focusVisible: false });
      self.held = true; el.classList.add('held');
      self.prevA = self.angleOf(e);
      self.handTarget = self.v;
      self.mode = 'hand';
    });
    el.addEventListener('pointermove', function (e) {
      if (!self.held) return;
      var a = self.angleOf(e);
      var d = a - self.prevA;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      self.prevA = a;
      self.handTarget = clamp(self.handTarget + d / 27, 0, self.max);
      if (still) { self.v = self.handTarget; self.render(); }
    });
    var up = function () {
      if (!self.held) return;
      self.held = false; el.classList.remove('held');
      self.target = Math.round(self.v);
      if (still) { self.v = self.target; self.render(); self.mode = 'rest'; return; }
      self.mode = 'detent';
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    el.addEventListener('keydown', function (e) {
      var cur = Math.round(self.mode === 'detent' ? self.target : self.v), n = cur;
      switch (e.key) {
        case 'ArrowUp': case 'ArrowRight': n++; break;
        case 'ArrowDown': case 'ArrowLeft': n--; break;
        case 'PageUp': n += 3; break;
        case 'PageDown': n -= 3; break;
        case 'Home': n = 0; break;
        case 'End': n = self.max; break;
        default: return;
      }
      e.preventDefault();
      self.target = clamp(n, 0, self.max);
      if (still) { self.v = self.target; self.render(); return; }
      self.mode = 'detent';
    });
  }
  Knob.prototype.angleOf = function (e) {
    var r = this.el.getBoundingClientRect();
    return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
  };
  Knob.prototype.step = function (dt) {
    if (this.mode === 'rest') return;
    var tgt = this.mode === 'hand' ? this.handTarget : this.target;
    var k = this.mode === 'hand' ? 300 : 260, c = this.mode === 'hand' ? 30 : 22;
    var a = k * (tgt - this.v) - c * this.vel;
    this.vel += a * dt; this.v += this.vel * dt;
    this.v = clamp(this.v, 0, this.max);
    this.render();
    if (this.mode === 'detent' && Math.abs(tgt - this.v) < 0.002 && Math.abs(this.vel) < 0.01) {
      this.v = tgt; this.vel = 0; this.mode = 'rest'; this.render();
    }
  };
  Knob.prototype.render = function () {
    /* detent feel: the pointer lingers on each click, then falls into the next */
    var n = Math.round(this.v), r = this.v - n;
    var shown = n + 0.5 * Math.sign(r) * Math.pow(Math.abs(2 * r), 2.6);
    this.el.style.setProperty('--a', (-135 + shown * 27).toFixed(2) + 'deg');
    if (n !== this.lastInt) {
      this.lastInt = n; buzz(5);
      this.el.setAttribute('aria-valuenow', String(n));
    }
  };

  /* =========================================================
     The prep bank
     ========================================================= */
  var bank = document.getElementById('bank-prep');
  var deskScroll = document.getElementById('desk-scroll');
  var stage = document.getElementById('stage');
  var desk = document.getElementById('desk');
  var honest = document.getElementById('honest');
  if (!bank) return;

  var prepFaders = [].map.call(bank.querySelectorAll('.fader'), function (el) {
    var ch = el.closest('.ch');
    return new Fader(el, { motorised: true, lcd: ch.querySelector('.lcd-num') });
  });
  var lcds = [].slice.call(bank.querySelectorAll('.lcd'));
  var ledPrep = document.getElementById('led-prep');
  var keyCall = document.getElementById('key-call');
  var lampCall = document.getElementById('lamp-call') || document.createElement('span');

  /* shifts: eight short faders, in the desk but not wired */
  var shiftWrap = document.getElementById('shift-channels');
  var shiftFaders = [];
  if (shiftWrap) {
    var hours = ['3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm'];
    hours.forEach(function (h) {
      var d = document.createElement('div');
      d.className = 'fader';
      d.setAttribute('role', 'slider');
      d.tabIndex = 0;
      d.setAttribute('aria-label', 'Shifts, ' + h + ', not connected yet');
      d.setAttribute('aria-valuemin', '0');
      d.setAttribute('aria-valuemax', '10');
      d.setAttribute('aria-valuenow', '0');
      d.dataset.max = '10';
      d.style.setProperty('--p', '0');
      d.innerHTML = '<div class="slot"><span class="cap"><i class="cap-led"></i></span></div>';
      shiftWrap.appendChild(d);
      shiftFaders.push(new Fader(d, {}));
    });
  }
  var knobEl = document.getElementById('knob');
  var knob = knobEl ? new Knob(knobEl) : null;

  tickers.push(function (dt) {
    for (var i = 0; i < prepFaders.length; i++) prepFaders[i].step(dt);
    for (var j = 0; j < shiftFaders.length; j++) shiftFaders[j].step(dt);
    if (knob) knob.step(dt);
  });

  /* =========================================================
     Cable: a verlet rope from "Your sales" to Prep
     ========================================================= */
  var canvas = document.getElementById('cable');
  var hit = document.getElementById('plug-hit');
  var jackSrc = document.getElementById('jack-src');
  var jackDst = document.getElementById('jack-prep');
  var ctx = canvas.getContext('2d');
  var N = 28, PADX = 40, PADT = 80, PADB = 30;
  var rope = { x: [], y: [], px: [], py: [], seg: 8, state: 'seated', ex: 0, ey: 0, src: { x: 0, y: 0 }, dst: { x: 0, y: 0 }, w: 0, h: 0, len: 0, ax: 0, sleep: 0 };

  function offsetIn(el, anc) {
    var x = 0, y = 0, n = el;
    while (n && n !== anc) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y };
  }
  function layoutCable(first) {
    var w = bank.offsetWidth, h = bank.offsetHeight;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round((w + 2 * PADX) * dpr); canvas.height = Math.round((h + PADT + PADB) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, PADX * dpr, PADT * dpr);
    rope.w = w; rope.h = h;
    var a = offsetIn(jackSrc, bank), b = offsetIn(jackDst, bank);
    rope.src = { x: a.x + jackSrc.offsetWidth / 2, y: a.y + jackSrc.offsetHeight / 2 };
    rope.dst = { x: b.x + jackDst.offsetWidth / 2, y: b.y + jackDst.offsetHeight / 2 };
    var D = Math.hypot(rope.dst.x - rope.src.x, rope.dst.y - rope.src.y);
    rope.len = Math.max(110, D * 1.05 + 10);
    rope.seg = rope.len / N;
    if (rope.state === 'seated') { rope.ex = rope.dst.x; rope.ey = rope.dst.y; }
    if (first || rope.x.length !== N + 1) resetRope(rope.state === 'seated');
    else settleRope(90);
    rope.sleep = 0;
  }
  function resetRope(toDst) {
    for (var i = 0; i <= N; i++) {
      var t = i / N, x, y;
      if (toDst) {
        x = rope.src.x + (rope.dst.x - rope.src.x) * t;
        y = rope.src.y + (rope.dst.y - rope.src.y) * t + Math.sin(Math.PI * t) * rope.len * 0.3;
      } else {
        x = rope.src.x + Math.sin(t * 2.2) * 6;
        y = rope.src.y + t * rope.len * 0.98;
      }
      rope.x[i] = rope.px[i] = x; rope.y[i] = rope.py[i] = y;
    }
    settleRope(240);
  }
  function settleRope(n) { for (var i = 0; i < n; i++) ropeStep(1 / 120, 0); for (var j = 0; j <= N; j++) { rope.px[j] = rope.x[j]; rope.py[j] = rope.y[j]; } }
  function endPinned() { return rope.state !== 'free'; }
  function ropeStep(h, ax) {
    var g = 1700, damp = 0.986, i;
    var last = endPinned() ? N - 1 : N;
    for (i = 1; i <= last; i++) {
      var vx = (rope.x[i] - rope.px[i]) * damp, vy = (rope.y[i] - rope.py[i]) * damp;
      rope.px[i] = rope.x[i]; rope.py[i] = rope.y[i];
      rope.x[i] += vx + ax * h * h;
      rope.y[i] += vy + g * h * h;
    }
    rope.x[0] = rope.src.x; rope.y[0] = rope.src.y;
    if (endPinned()) { rope.x[N] = rope.ex; rope.y[N] = rope.ey; }
    for (var it = 0; it < 26; it++) {
      for (i = 0; i < N; i++) {
        var dx = rope.x[i + 1] - rope.x[i], dy = rope.y[i + 1] - rope.y[i];
        var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        var diff = (d - rope.seg) / d * 0.5;
        var ox = dx * diff, oy = dy * diff;
        var fixA = i === 0, fixB = (i + 1 === N) && endPinned();
        if (fixA && fixB) continue;
        if (fixA) { rope.x[i + 1] -= ox * 2; rope.y[i + 1] -= oy * 2; }
        else if (fixB) { rope.x[i] += ox * 2; rope.y[i] += oy * 2; }
        else { rope.x[i] += ox; rope.y[i] += oy; rope.x[i + 1] -= ox; rope.y[i + 1] -= oy; }
      }
      /* the panel's bottom edge is a floor */
      for (i = 1; i <= N; i++) if (rope.y[i] > rope.h - 8) rope.y[i] = rope.h - 8;
    }
    if (!endPinned()) { rope.ex = rope.x[N]; rope.ey = rope.y[N]; }
  }
  var acc = 0;
  tickers.push(function (dt) {
    if (!rope.w) return;
    acc += dt;
    var moving = false;
    while (acc >= 1 / 120) {
      ropeStep(1 / 120, rope.ax);
      acc -= 1 / 120;
    }
    for (var i = 1; i <= N; i++) {
      if (Math.abs(rope.x[i] - rope.px[i]) + Math.abs(rope.y[i] - rope.py[i]) > 0.02) { moving = true; break; }
    }
    if (moving || rope.state !== 'seated' || rope.sleep < 3) { drawCable(); rope.sleep = moving ? 0 : rope.sleep + 1; }
    placeHit();
  });

  function pathRope(ox, oy) {
    ctx.beginPath();
    ctx.moveTo(rope.x[0] + ox, rope.y[0] + oy);
    for (var i = 1; i < N; i++) {
      var mx = (rope.x[i] + rope.x[i + 1]) / 2, my = (rope.y[i] + rope.y[i + 1]) / 2;
      ctx.quadraticCurveTo(rope.x[i] + ox, rope.y[i] + oy, mx + ox, my + oy);
    }
    ctx.lineTo(rope.x[N] + ox, rope.y[N] + oy);
  }
  function bootEndOn(x, y, shadow) {
    if (shadow) {
      ctx.fillStyle = 'rgba(58,44,26,.28)';
      ctx.beginPath(); ctx.arc(x + 4, y + 7, 15, 0, Math.PI * 2); ctx.fill();
    }
    var g = ctx.createRadialGradient(x - 4, y - 5, 1, x, y, 15);
    g.addColorStop(0, '#5d5e62'); g.addColorStop(0.55, '#2b2c2f'); g.addColorStop(1, '#17181a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
  }
  function bootSide(x, y, ang) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang);
    /* shadow */
    ctx.save(); ctx.translate(5, 8); ctx.fillStyle = 'rgba(58,44,26,.22)';
    roundRect(-34, -8, 34, 16, 5); ctx.fill(); ctx.restore();
    /* tip, matte nickel */
    var t = ctx.createLinearGradient(0, -3, 0, 3);
    t.addColorStop(0, '#b9b6ae'); t.addColorStop(0.5, '#8d8a83'); t.addColorStop(1, '#6a6862');
    ctx.fillStyle = t; roundRect(-2, -3.2, 17, 6.4, 3); ctx.fill();
    ctx.fillStyle = '#3a3936'; ctx.fillRect(9, -3.3, 1.6, 6.6);
    /* boot */
    var b = ctx.createLinearGradient(0, -8, 0, 8);
    b.addColorStop(0, '#55565a'); b.addColorStop(0.35, '#2d2e31'); b.addColorStop(1, '#16171a');
    ctx.fillStyle = b; roundRect(-34, -8, 34, 16, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    for (var i = 0; i < 4; i++) ctx.fillRect(-28 + i * 5, -7, 1.5, 14);
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function drawCable() {
    ctx.clearRect(-PADX, -PADT, rope.w + 2 * PADX, rope.h + PADT + PADB);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    /* soft shadow on the panel */
    ctx.save();
    ctx.strokeStyle = 'rgba(58,44,26,.2)'; ctx.lineWidth = 11;
    if ('filter' in ctx) ctx.filter = 'blur(3px)';
    pathRope(5, 10); ctx.stroke();
    ctx.restore();
    /* body */
    ctx.strokeStyle = '#1f2023'; ctx.lineWidth = 9; pathRope(0, 0); ctx.stroke();
    ctx.strokeStyle = '#34353a'; ctx.lineWidth = 5; pathRope(-0.6, -0.8); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1.6; pathRope(-1.6, -2.2); ctx.stroke();
    /* plugs */
    bootEndOn(rope.src.x, rope.src.y, true);
    if (rope.state === 'seated') bootEndOn(rope.ex, rope.ey, true);
    else {
      var ang = Math.atan2(rope.y[N] - rope.y[N - 2], rope.x[N] - rope.x[N - 2]);
      bootSide(rope.x[N], rope.y[N], ang);
    }
  }
  function placeHit() {
    var x = rope.state === 'seated' ? rope.ex : rope.x[N];
    var y = rope.state === 'seated' ? rope.ey : rope.y[N];
    hit.style.transform = 'translate(' + (x - 23).toFixed(1) + 'px,' + (y - 23).toFixed(1) + 'px)';
  }

  /* power: the bank lights only when the cable is seated */
  function setLabel() {
    var seated = rope.state === 'seated';
    hit.setAttribute('aria-pressed', seated ? 'true' : 'false');
    hit.setAttribute('aria-label', seated
      ? 'Your sales cable, plugged into Prep. Press to unplug.'
      : 'Your sales cable, unplugged. Press to plug it into Prep.');
  }
  function lightLcds(stagger) {
    lcds.forEach(function (l, i) {
      if (still || !G) { l.classList.remove('dark'); return; }
      var t = G.timeline({ delay: i * stagger });
      t.call(function () { l.classList.remove('dark'); })
        .call(function () { l.classList.add('dark'); }, null, 0.05)
        .call(function () { l.classList.remove('dark'); }, null, 0.11)
        .call(function () { l.classList.add('dark'); }, null, 0.15)
        .call(function () { l.classList.remove('dark'); }, null, 0.24);
    });
  }
  function recall(onDone) {
    var left = 0;
    prepFaders.forEach(function (f, i) {
      if (f.blank) { f.motorTo(0, 0); return; }
      left++;
      f.motorTo(f.setVal, 0.32 + i * 0.09, function () { if (--left === 0 && onDone) onDone(); });
    });
  }
  function seat(quiet) {
    rope.state = 'seated';
    rope.ex = rope.dst.x; rope.ey = rope.dst.y;
    rope.sleep = 0;
    setLabel();
    buzz(14);
    if (G && !still && !quiet) {
      G.fromTo(bank, { y: 0 }, { keyframes: [{ y: 1.8, duration: 0.035 }, { y: -0.7, duration: 0.06 }, { y: 0, duration: 0.12 }], ease: 'power1.out', clearProps: 'transform' });
      var t = G.timeline();
      [0, 0.08, 0.16, 0.24, 0.32].forEach(function (s, i) { t.call(function () { ledPrep.classList.toggle('on', i % 2 === 0); }, null, s); });
    } else ledPrep.classList.add('on');
    bank.classList.remove('unpowered'); bank.classList.add('powered');
    lightLcds(quiet ? 0 : 0.07);
    recall(function () { if (!quiet) invite(); });
  }
  function unplug() {
    rope.state = 'held';
    setLabel();
    ledPrep.classList.remove('on');
    bank.classList.remove('powered'); bank.classList.add('unpowered');
    lcds.forEach(function (l) { l.classList.add('dark'); });
    keyCall.setAttribute('aria-pressed', 'false'); lampCall.className = 'lamp';
    prepFaders.forEach(function (f, i) { f.el.classList.remove('owned'); f.motorTo(0, 0.12 + i * 0.05); });
  }
  var invited = false;
  function invite() {
    if (invited || still || !G) return;
    invited = true;
    G.timeline()
      .to(lampCall, { duration: 0.01, onStart: function () { lampCall.classList.add('red'); } })
      .to(keyCall.querySelector('.key-face'), { filter: 'brightness(1.18)', duration: 0.5, ease: 'sine.inOut' }, 0)
      .to(keyCall.querySelector('.key-face'), { filter: 'brightness(1)', duration: 0.7, ease: 'sine.inOut', clearProps: 'filter' }, 0.5)
      .call(function () { if (keyCall.getAttribute('aria-pressed') !== 'true') lampCall.classList.remove('red'); }, null, 1.2);
  }
  /* guide the plug along an arc into the jack */
  function guideIn(dur) {
    if (!G || still) { seat(true); return; }
    rope.state = 'guided';
    var sx = rope.x[N], sy = rope.y[N];
    var cx = rope.dst.x - 10, cy = Math.max(sy, rope.dst.y + 70);
    var o = { t: 0 };
    G.to(o, {
      t: 1, duration: dur, ease: 'power2.inOut',
      onUpdate: function () {
        var t = o.t, u = 1 - t;
        rope.ex = u * u * sx + 2 * u * t * cx + t * t * rope.dst.x;
        rope.ey = u * u * sy + 2 * u * t * cy + t * t * rope.dst.y;
      },
      onComplete: function () { seat(false); }
    });
  }

  /* hand on the plug */
  var drag = null;
  function local(e) {
    var r = bank.getBoundingClientRect();
    var sc = r.width / bank.offsetWidth || 1;
    return { x: (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc };
  }
  function reach(p) {
    var dx = p.x - rope.src.x, dy = p.y - rope.src.y, d = Math.hypot(dx, dy), m = rope.len * 0.97;
    if (d > m) { p.x = rope.src.x + dx / d * m; p.y = rope.src.y + dy / d * m; }
    p.x = clamp(p.x, 8 - PADX, rope.w + PADX - 8); p.y = clamp(p.y, 12 - PADT, rope.h - 8);
    return p;
  }
  hit.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    try { hit.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
    var p = local(e);
    drag = { dx: (rope.state === 'seated' ? rope.ex : rope.x[N]) - p.x, dy: (rope.state === 'seated' ? rope.ey : rope.y[N]) - p.y, moved: false, wasSeated: rope.state === 'seated' };
    hit.classList.add('held');
  });
  hit.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var p = local(e);
    p.x += drag.dx; p.y += drag.dy;
    if (!drag.moved) {
      var bx = rope.state === 'seated' ? rope.ex : rope.x[N], by = rope.state === 'seated' ? rope.ey : rope.y[N];
      if (Math.hypot(p.x - bx, p.y - by) < 6) return;
      drag.moved = true;
      if (rope.state === 'seated') unplug(); else { rope.state = 'held'; setLabel(); }
    }
    reach(p);
    rope.ex = p.x; rope.ey = p.y;
  });
  function endDrag() {
    if (!drag) return;
    var d = drag; drag = null;
    hit.classList.remove('held');
    if (!d.moved) { toggleCable(); return; }
    if (Math.hypot(rope.ex - rope.dst.x, rope.ey - rope.dst.y) < 40) {
      if (G && !still) {
        rope.state = 'guided';
        G.to(rope, { ex: rope.dst.x, ey: rope.dst.y, duration: 0.11, ease: 'power3.in', onComplete: function () { seat(false); } });
      } else seat(true);
    } else { rope.state = 'free'; setLabel(); }
  }
  hit.addEventListener('pointerup', endDrag);
  hit.addEventListener('pointercancel', endDrag);
  hit.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCable(); }
  });
  hit.addEventListener('click', function (e) { if (e.detail === 0) return; e.preventDefault(); });
  function toggleCable() {
    if (rope.state === 'seated') {
      unplug();
      /* pulled out: it springs up and away, then hangs */
      var o = { x: rope.ex, y: rope.ey };
      if (G && !still) {
        G.to(o, { x: rope.ex - 26, y: rope.ey - 40, duration: 0.14, ease: 'power2.out',
          onUpdate: function () { rope.ex = o.x; rope.ey = o.y; },
          onComplete: function () { rope.state = 'free'; setLabel(); } });
      } else {
        rope.state = 'free'; setLabel(); settleRope(400);
      }
    } else if (rope.state === 'free' || rope.state === 'held') {
      guideIn(0.6);
    }
  }

  /* the owner's key */
  keyCall.addEventListener('click', function () {
    var on = keyCall.getAttribute('aria-pressed') !== 'true';
    keyCall.setAttribute('aria-pressed', on ? 'true' : 'false');
    lampCall.classList.toggle('red', on);
    buzz(on ? 18 : 8);
    if (on) {
      bank.classList.remove('called'); void bank.offsetWidth; bank.classList.add('called');
    }
  });
  keyCall.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { keyCall.classList.add('is-down'); setTimeout(function () { keyCall.classList.remove('is-down'); }, 110); }
  });

  /* =========================================================
     Start: the recall
     ========================================================= */
  var intro = root.classList.contains('intro') && !still && !!G;
  lcds.forEach(function (l) { l.classList.toggle('dark', intro); });
  if (intro) {
    prepFaders.forEach(function (f) { f.p = 0; f.lastInt = -1; f.render(); f.ints(); });
    rope.state = 'free';
    ledPrep.classList.remove('on');
    bank.classList.remove('powered'); bank.classList.add('unpowered');
  } else {
    ledPrep.classList.add('on');
    prepFaders.forEach(function (f) { if (!f.blank) f.el.classList.add('set'); });
  }
  setLabel();
  layoutCable(true);
  root.classList.remove('intro');
  if (intro) {
    var go = function () { later(0.35, function () { guideIn(0.62); }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutCable(false); go(); });
    else go();
  }

  /* =========================================================
     The dolly: one camera move along the desk
     ========================================================= */
  var mqWide = window.matchMedia('(min-width: 900px)');
  var dolly = false;
  var cam = { t: 0, target: 0, keys: null, fit: 1, stageW: 0, deskH: 0, tx: 0, vx: 0, s: 1 };
  var banks = [bank, document.getElementById('bank-shifts'), document.getElementById('bank-slow')];
  var st = null;

  function hermite(T, P, t) {
    var n = T.length;
    if (t <= T[0]) return P[0];
    if (t >= T[n - 1]) return P[n - 1];
    var i = 0;
    while (i < n - 2 && t > T[i + 1]) i++;
    var m = function (k) {
      if (k === 0 || k === n - 1) return 0;
      return (P[k + 1] - P[k - 1]) / (T[k + 1] - T[k - 1]);
    };
    var dT = T[i + 1] - T[i], u = (t - T[i]) / dT, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * P[i] + (u3 - 2 * u2 + u) * dT * m(i) + (-2 * u3 + 3 * u2) * P[i + 1] + (u3 - u2) * dT * m(i + 1);
  }
  function measure() {
    if (!dolly) return;
    cam.stageW = stage.clientWidth;
    var deskW = desk.offsetWidth;
    cam.deskH = desk.offsetHeight;
    var c = banks.map(function (b) { return b.offsetLeft + b.offsetWidth / 2; });
    var P = c[0], S = c[1], W = c[2], D = deskW / 2;
    cam.fit = Math.min(1, (cam.stageW * 0.92) / deskW);
    cam.keys = {
      T: [0, 0.1, 0.33, 0.48, 0.68, 0.88],
      X: [P, P + (S - P) * 0.22, S, S + (W - S) * 0.2, W, D],
      S: [1, 0.84, 0.86, 0.83, 0.9, cam.fit]
    };
    var stageH = stage.offsetHeight;
    var vh = window.innerHeight;
    var stick = Math.max(12, (vh - stageH) / 2);
    root.style.setProperty('--stick', stick.toFixed(0) + 'px');
    root.style.setProperty('--scroll-h', (stageH + vh * 2.5).toFixed(0) + 'px');
  }
  function applyCam(dt) {
    if (!dolly || !cam.keys) return;
    var k = 1 - Math.exp(-dt * 6.5);
    cam.t += (cam.target - cam.t) * k;
    if (Math.abs(cam.target - cam.t) < 0.00005) cam.t = cam.target;
    var x = hermite(cam.keys.T, cam.keys.X, cam.t);
    var s = hermite(cam.keys.T, cam.keys.S, cam.t);
    var tx = cam.stageW / 2 - x * s;
    var vx = dt > 0 ? (tx - cam.tx) / dt : 0;
    var ax = dt > 0 ? (vx - cam.vx) / dt : 0;
    cam.tx = tx; cam.vx = vx; cam.s = s;
    /* the cable feels the camera's acceleration */
    rope.ax = clamp(-ax / s * 0.55, -2600, 2600);
    if (Math.abs(rope.ax) > 30) rope.sleep = 0;
    desk.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,0,0) scale(' + s.toFixed(4) + ')';
    var o = clamp((cam.t - 0.74) / 0.12, 0, 1);
    var lift = -(cam.deskH * (1 - s)) / 2;
    honest.style.opacity = o.toFixed(3);
    honest.style.transform = 'translateY(' + (lift + (1 - o) * 14).toFixed(1) + 'px)';
  }
  tickers.push(function (dt) { applyCam(dt); });

  function setMode() {
    var want = mqWide.matches && !still && !!G && !!window.ScrollTrigger;
    if (want !== dolly) {
      dolly = want;
      root.classList.toggle('dolly', dolly);
      if (!dolly) {
        desk.style.transform = ''; honest.style.opacity = ''; honest.style.transform = '';
        root.style.removeProperty('--scroll-h'); root.style.removeProperty('--stick');
        rope.ax = 0;
      }
    }
    measure();
    layoutCable(false);
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  if (G && window.ScrollTrigger) {
    G.registerPlugin(window.ScrollTrigger);
    st = window.ScrollTrigger.create({
      trigger: deskScroll,
      start: function () { return 'top top+=' + (parseFloat(getComputedStyle(root).getPropertyValue('--stick')) || 0); },
      end: function () { return 'bottom top+=' + ((parseFloat(getComputedStyle(root).getPropertyValue('--stick')) || 0) + stage.offsetHeight); },
      invalidateOnRefresh: true,
      onUpdate: function (self) { cam.target = self.progress; }
    });
  }
  setMode();
  cam.t = cam.target;
  var rz;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(setMode, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setMode);
  window.addEventListener('load', setMode);

  /* =========================================================
     Pilot: three toggles flip on, left to right, once
     ========================================================= */
  var toggles = [].slice.call(document.querySelectorAll('.toggle'));
  function setToggle(t, on) {
    t.setAttribute('aria-checked', on ? 'true' : 'false');
    var lamp = t.parentNode.querySelector('.lamp');
    if (lamp) lamp.classList.toggle('on', on);
  }
  toggles.forEach(function (t) {
    t.addEventListener('click', function () { var on = t.getAttribute('aria-checked') !== 'true'; setToggle(t, on); buzz(on ? 10 : 6); });
  });
  if (still || !('IntersectionObserver' in window)) toggles.forEach(function (t) { setToggle(t, true); });
  else {
    toggles.forEach(function (t) { setToggle(t, false); });
    var strip = document.getElementById('strip');
    var io = new IntersectionObserver(function (ents) {
      var en = ents[0];
      var passed = en.boundingClientRect.bottom < (window.innerHeight || 0);
      if (!(en.isIntersecting && (en.intersectionRatio >= 0.6 || passed)) && en.boundingClientRect.top > 0) return;
      io.disconnect();
      toggles.forEach(function (t, i) { setTimeout(function () { setToggle(t, true); buzz(8); }, 250 + i * 380); });
    }, { threshold: [0, 0.6, 1] });
    io.observe(strip);
  }

  /* =========================================================
     Menu
     ========================================================= */
  var menuKey = document.querySelector('.menu-key');
  var nav = document.getElementById('nav');
  if (menuKey && nav) {
    var closeNav = function () { nav.classList.remove('open'); menuKey.setAttribute('aria-expanded', 'false'); };
    menuKey.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menuKey.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { closeNav(); menuKey.focus(); } });
  }

  /* =========================================================
     Form
     ========================================================= */
  var form = document.getElementById('form');
  if (form) {
    var status = document.getElementById('status');
    var lamp = document.getElementById('send-lamp');
    var send = document.getElementById('send');
    var MAIL = '<a href="mailto:tooeyteam@gmail.com?subject=Tooey%20pilot">tooeyteam@gmail.com</a>';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [];
      ['f-name', 'f-rest', 'f-email'].forEach(function (id) {
        var f = document.getElementById(id);
        var ok = f.value.trim() !== '' && f.checkValidity();
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) bad.push(f);
      });
      if (bad.length) {
        lamp.className = 'lamp';
        status.textContent = 'Add your name, your restaurant and a working email, then press Ask to join again.';
        bad[0].focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._honey) { status.textContent = 'Request sent.'; return; }
      lamp.className = 'lamp on blink';
      status.textContent = 'Sending…';
      send.disabled = true; send.classList.add('is-down');
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && (j.success === true || j.success === 'true'); });
      }).catch(function () { return false; }).then(function (ok) {
        send.disabled = false; send.classList.remove('is-down');
        if (ok) {
          lamp.className = 'lamp on';
          status.innerHTML = 'Request sent. We’ll write back from ' + MAIL + '.';
          form.reset();
          buzz(20);
        } else {
          lamp.className = 'lamp red';
          status.innerHTML = 'That didn’t send. Email ' + MAIL + ' instead, or try again.';
        }
      });
    });
  }
})();
