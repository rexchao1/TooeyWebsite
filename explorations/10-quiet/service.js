/* Tooey, exploration 10: "Service is loud."
   The hero plays one service and lets it go quiet by itself. Order lines
   stream across a heat-lamp red field, slow, and fly into their dish's row
   as counts. Then the lamp goes off: the whole red field draws back into one
   small red dot, and what is left is a clean white counter. Nothing moves. */

(function () {
  'use strict';

  initForm();

  var doc = document.documentElement;
  if (doc.className !== 'live') return;

  var hero = document.querySelector('.hero');
  var canvas = hero && hero.querySelector('.roar');
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');
  var fly = document.createElement('canvas');
  var fctx = fly.getContext && fly.getContext('2d');
  if (!ctx || !fctx || !window.CSS || !CSS.supports('clip-path', 'circle(10px at 0 0)')) {
    doc.className = 'static';
    return;
  }

  var btn = hero.querySelector('.replay');
  var sheet = hero.querySelector('.sheet');
  var lampEl = btn.querySelector('.lamp');
  btn.hidden = false;

  // Counts: the screen shows a ticking number, assistive tech gets the real one.
  Array.prototype.forEach.call(hero.querySelectorAll('[data-final]'), function (td) {
    var final = td.getAttribute('data-final');
    td.innerHTML = '<span class="sr-only">' + final + '</span><span class="tick" aria-hidden="true">0</span>';
  });

  /* ---------- The hot layer: the same hero, in service colours, clipped by the lamp ---------- */

  var hot = document.createElement('div');
  hot.className = 'hot';
  hot.setAttribute('aria-hidden', 'true');
  hot.setAttribute('inert', '');
  hot.appendChild(canvas);
  ['.nav', '.hero-main', '.hero-foot'].forEach(function (sel) {
    var c = hero.querySelector(sel).cloneNode(true);
    c.removeAttribute('aria-label');
    Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
    Array.prototype.forEach.call(c.querySelectorAll('a, button'), function (n) { n.tabIndex = -1; });
    hot.appendChild(c);
  });

  function layer(root) {
    var rows = Array.prototype.slice.call(root.querySelectorAll('.row'));
    return {
      shout: root.querySelector('.shout'),
      table: root.querySelector('.counts'),
      rows: rows,
      label: root.querySelector('.replay-label'),
      cells: rows.map(function (r) {
        return Array.prototype.slice.call(r.querySelectorAll('[data-final]')).map(function (td) {
          return td.querySelector('.tick');
        });
      }),
      focusables: Array.prototype.slice.call(root.querySelectorAll('a, button'))
    };
  }
  var real = layer(hero);          // collected before the hot layer joins the hero
  var heat = layer(hot);
  var both = [real, heat];
  hero.insertBefore(hot, hero.firstChild);
  fly.className = 'fly';
  fly.setAttribute('aria-hidden', 'true');
  hero.appendChild(fly);

  // Keyboard focus lives on the real layer underneath; show its ring on the hot copy too.
  real.focusables.forEach(function (el, i) {
    var twin = heat.focusables[i];
    if (!twin) return;
    el.addEventListener('focus', function () {
      var visible = true;
      try { visible = el.matches(':focus-visible'); } catch (e) { /* older browsers */ }
      if (visible) twin.classList.add('is-focus');
    });
    el.addEventListener('blur', function () { twin.classList.remove('is-focus'); });
  });

  var finals = real.rows.map(function (r) {
    return Array.prototype.slice.call(r.querySelectorAll('[data-final]')).map(function (td) {
      return { final: +td.getAttribute('data-final'), value: 0, target: 0, shown: -1 };
    });
  });

  /* ---------- Easing ---------- */

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function prog(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function inOutCubic(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function inOutQuart(p) { return p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2; }
  function outCubic(p) { return 1 - Math.pow(1 - p, 3); }
  function smooth(p) { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); }

  /* ---------- The choreography, in seconds ---------- */

  var T = {
    slow: 2.0,               // the rush starts to ease
    stop: 5.6,               // every lane at rest
    fly0: 2.6, fly1: 4.9,    // order lines leave for their rows
    off0: 6.7, off1: 8.0,    // the lamp goes off: red draws back into the dot
    h0: 7.6, h1: 9.5,        // the headline breathes out on the white
    end: 9.9
  };

  /* ---------- What the kitchen says ---------- */

  var DISH = [
    ['2 short rib', 'short rib mid', '1 short rib', 'short rib no jus', '3 short rib'],
    ['1 carbonara', 'carbonara no pepper', '2 carbonara', 'carbonara extra cheese'],
    ['3 smash', 'smash no onion', '2 smash burger', 'smash well done', '4 smash'],
    ['2 caesar', 'caesar dressing side', '1 caesar', 'caesar no croutons'],
    ['1 halibut', 'halibut special', '2 halibut']
  ];
  var DISH_WEIGHT = [0.25, 0.2, 0.3, 0.17, 0.08];
  var TAKE = [7, 6, 8, 5, 3];
  var CHATTER = ['heard', 'behind', 'hands', 'fire 12', 'yes chef', 'corner', 'table 9 waiting',
    'all day 6', 're-fire', 'walking in', '86 fries', 'two minutes', 'sauce on the side',
    'behind you', 'order in', 'pick up 14', 'where’s 7?', 'heard, chef', 'sorry, re-fire'];

  var EMBER = '#A42C10', TICKET = '#FFF1E4', CHAR = '#4E1A10';

  /* ---------- State ---------- */

  var W = 0, H = 0, dpr = 1;
  var lanes = [], flights = [];
  var t = 0, rt = 0, last = 0, raf = 0;
  var playing = false, launched = false, seen = false, dimmed = false;
  var opening = 1;  // 1 = the red field already fills the hero
  var landed = [0, 0, 0, 0, 0], due = [0, 0, 0, 0, 0];
  var lamp = { x: 0, y: 0, r: 6, R: 2000 };
  var started = false;
  var rand = Math.random;

  function pickDish() {
    var r = rand(), acc = 0;
    for (var i = 0; i < DISH_WEIGHT.length; i++) { acc += DISH_WEIGHT[i]; if (r < acc) return i; }
    return 0;
  }

  function fontOf(w, s) { return w + ' ' + s + 'px "Mona Sans", ui-sans-serif, system-ui, sans-serif'; }

  function rel(el) {
    var r = el.getBoundingClientRect(), h = hero.getBoundingClientRect();
    return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
  }

  function measureLamp() {
    var r = rel(lampEl);
    lamp.x = r.x + r.w / 2;
    lamp.y = r.y + r.h / 2;
    lamp.r = r.w / 2;
    lamp.R = Math.ceil(Math.max(
      Math.hypot(lamp.x, lamp.y), Math.hypot(W - lamp.x, lamp.y),
      Math.hypot(lamp.x, H - lamp.y), Math.hypot(W - lamp.x, H - lamp.y)
    )) + 4;
  }

  function clipTo(radius) {
    if (radius >= lamp.R) { hot.style.clipPath = 'none'; hot.style.webkitClipPath = 'none'; return; }
    var v = 'circle(' + radius.toFixed(2) + 'px at ' + lamp.x.toFixed(1) + 'px ' + lamp.y.toFixed(1) + 'px)';
    hot.style.clipPath = v;
    hot.style.webkitClipPath = v;
  }

  function size() {
    W = hero.clientWidth; H = hero.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    [canvas, fly].forEach(function (c) {
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measureLamp();
  }

  function build() {
    size();
    var k = clamp(Math.sqrt(W / 1280), 0.78, 1.15);
    var SIZES = [14, 16, 18, 21, 26, 34, 44];
    lanes = [];
    var y = 6, i = 0;
    while (y < H + 20) {
      var s = Math.round(SIZES[Math.floor(Math.pow(rand(), 1.25) * SIZES.length)] * k);
      var lane = {
        y: y + s * 0.82, size: s,
        weight: [560, 680, 780, 860, 900][Math.floor(rand() * 5)],
        dir: i % 2 ? 1 : -1,
        v: (46 + rand() * 130) * (s < 20 ? 1.25 : 0.85) * k,
        phase: rand() * 6.28, off: rand() * 500, items: [], len: 0
      };
      ctx.font = fontOf(lane.weight, s);
      var x = 0, limit = W + 1200;
      while (x < limit) {
        var chatter = rand() < 0.42;
        var dish = chatter ? -1 : pickDish();
        var list = chatter ? CHATTER : DISH[dish];
        var text = list[Math.floor(rand() * list.length)];
        var w = ctx.measureText(text).width;
        lane.items.push({
          text: text, dish: dish, w: w, base: x,
          a: 0.55 + rand() * 0.45,
          fadeAt: chatter ? 2.0 + rand() * 2.4 : 3.8 + rand() * 2.0,
          flying: false
        });
        x += w + s * (0.9 + rand() * 1.6);
      }
      lane.len = x;
      lanes.push(lane);
      y += s * (1.05 + rand() * 0.55) + 4;
      i++;
    }
  }

  function itemX(lane, it) {
    var p = (it.base + lane.off * lane.dir) % lane.len;
    if (p < 0) p += lane.len;
    return p - (lane.len - W) / 2;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
    return a;
  }

  function launch() {
    launched = true;
    var picks = [];
    for (var d = 0; d < DISH.length; d++) {
      var on = [], off = [];
      lanes.forEach(function (lane) {
        lane.items.forEach(function (it) {
          if (it.dish !== d) return;
          var x = itemX(lane, it);
          (x > -it.w * 0.3 && x + it.w < W * 1.02 ? on : off).push({ lane: lane, it: it });
        });
      });
      shuffle(on); shuffle(off);
      var chosen = on.concat(off).slice(0, TAKE[d]);
      due[d] = chosen.length;
      chosen.forEach(function (c) { c.dish = d; picks.push(c); });
    }
    shuffle(picks);
    // the new dish arrives last: it has the least to say
    picks.sort(function (a, b) { return (a.dish === 4) - (b.dish === 4); });
    var n = picks.length;
    flights = picks.map(function (c, idx) {
      var lane = c.lane, it = c.it;
      it.flying = true;
      var x = itemX(lane, it);
      return {
        dish: c.dish, text: it.text, weight: lane.weight, size: lane.size, a: it.a,
        sx: clamp(x + it.w / 2, -40, W + 40), sy: lane.y - lane.size * 0.35,
        start: T.fly0 + (n > 1 ? idx / (n - 1) : 0) * (T.fly1 - T.fly0) + rand() * 0.18,
        dur: 1.0 + rand() * 0.45, lift: 40 + rand() * 120, done: false
      };
    });
  }

  function targetOf(d) {
    var row = real.rows[d];
    var cell = row.querySelector('.likely') || row.querySelector('.reason');
    var r = rel(cell);
    if (d === 4) return { x: r.x + r.w * 0.5, y: r.y + r.h / 2 };
    return { x: r.x + r.w - 14, y: r.y + r.h / 2 };
  }

  function each(fn) { both.forEach(fn); }

  function land(f) {
    f.done = true;
    var d = f.dish;
    landed[d]++;
    each(function (L) { L.rows[d].classList.add('is-in'); L.table.classList.add('is-open'); });
    if (d === 4) {
      if (landed[4] >= due[4]) each(function (L) { L.rows[4].classList.add('is-told'); });
      return;
    }
    var share = landed[d] / due[d];
    finals[d].forEach(function (c) { c.target = landed[d] >= due[d] ? c.final : Math.round(c.final * share); });
  }

  function setCount(d, i, v) {
    each(function (L) { L.cells[d][i].textContent = v; });
  }

  function setShout(e) {
    var w = Math.round(900 - 640 * e);
    var ls = (-0.045 + 0.033 * e).toFixed(4) + 'em';
    var tf = 'scale(' + (1 - 0.08 * e).toFixed(4) + ')';
    each(function (L) { L.shout.style.fontWeight = w; L.shout.style.letterSpacing = ls; L.shout.style.transform = tf; });
  }

  function setLabel(s) { each(function (L) { L.label.textContent = s; }); }

  /* ---------- One frame ---------- */

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    rt += dt;
    t += dt;
    if (!seen && t > T.slow) t = T.slow; // keep the rush going until the list is in view

    // the lamp: opens from the dot on a replay, draws back into it at the end
    if (opening < 1) opening = Math.min(1, opening + dt / 0.75);
    var close = inOutQuart(prog(t, T.off0, T.off1));
    if (close > 0 && !dimmed) { dimmed = true; hero.classList.remove('is-playing'); }
    var open = outCubic(opening);
    var radius = lamp.r + (lamp.R - lamp.r) * open * (1 - close);
    clipTo(opening >= 1 && close === 0 ? lamp.R : radius);

    setShout(inOutCubic(prog(t, T.h0, T.h1)));

    // friction: lanes coast to a stop rather than braking
    var m = t < T.slow ? 1 : Math.pow(1 - prog(t, T.slow, T.stop), 2.2);
    if (!launched && t >= T.fly0) launch();

    ctx.clearRect(0, 0, W, H);
    if (close < 1) {
      ctx.fillStyle = EMBER;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      for (var i = 0; i < lanes.length; i++) {
        var lane = lanes[i];
        var surge = 1 + 0.5 * Math.pow(Math.max(0, Math.sin(rt * 1.9 + lane.phase)), 3);
        lane.off += lane.v * surge * m * dt;
        ctx.font = fontOf(lane.weight, lane.size);
        for (var j = 0; j < lane.items.length; j++) {
          var it = lane.items[j];
          if (it.flying) continue;
          var x = itemX(lane, it);
          if (x > W || x + it.w < 0) continue;
          var a = it.a * (1 - smooth((t - it.fadeAt) / 0.8));
          if (a <= 0.01) continue;
          ctx.globalAlpha = a;
          ctx.fillText(it.text, x, lane.y);
        }
      }
      ctx.globalAlpha = 1;
    }

    fctx.clearRect(0, 0, W, H);
    fctx.textAlign = 'center';
    fctx.textBaseline = 'middle';
    var r2 = radius * radius;
    var pending = 0;
    for (var k = 0; k < flights.length; k++) {
      var f = flights[k];
      if (f.done) continue;
      pending++;
      if (t < f.start) {
        // waiting its turn: it stops where it was, still in the lane's colour
        fctx.fillStyle = EMBER;
        fctx.globalAlpha = f.a;
        fctx.font = fontOf(f.weight, f.size);
        fctx.fillText(f.text, f.sx, f.sy);
        continue;
      }
      var p = prog(t, f.start, f.start + f.dur);
      if (p >= 1) { land(f); continue; }
      var q = inOutCubic(p);
      var tg = targetOf(f.dish);
      var cx = f.sx + (tg.x - f.sx) * 0.55, cy = Math.min(f.sy, tg.y) - f.lift;
      var u = 1 - q;
      var px = u * u * f.sx + 2 * u * q * cx + q * q * tg.x;
      var py = u * u * f.sy + 2 * u * q * cy + q * q * tg.y;
      var inside = (px - lamp.x) * (px - lamp.x) + (py - lamp.y) * (py - lamp.y) < r2;
      // it lifts out of the noise as it leaves: lane colour, then the ink of whatever it crosses
      fctx.fillStyle = p < 0.18 ? EMBER : (inside ? TICKET : CHAR);
      fctx.globalAlpha = (f.a + (1 - f.a) * smooth(p / 0.3)) * (p < 0.68 ? 1 : 1 - (p - 0.68) / 0.32);
      fctx.font = fontOf(Math.round(f.weight - 300 * q), Math.max(8, f.size + (13 - f.size) * q));
      fctx.fillText(f.text, px, py);
    }
    fctx.globalAlpha = 1;

    // numbers roll toward what has landed
    for (var d = 0; d < finals.length; d++) {
      for (var c = 0; c < finals[d].length; c++) {
        var cell = finals[d][c];
        cell.value += (cell.target - cell.value) * Math.min(1, dt * 5.5);
        var shown = Math.round(cell.target - cell.value < 0.5 ? cell.target : cell.value);
        if (shown !== cell.shown) { cell.shown = shown; setCount(d, c, shown); }
      }
    }

    if (t >= T.end && launched && pending === 0) { rest(); return; }
    raf = requestAnimationFrame(frame);
  }

  /* ---------- Rest, skip, replay ---------- */

  function rest() {
    cancelAnimationFrame(raf);
    raf = 0;
    playing = false;
    ctx.clearRect(0, 0, W, H);
    fctx.clearRect(0, 0, W, H);
    hot.style.visibility = 'hidden';
    setShout(1);
    each(function (L) {
      L.rows.forEach(function (r) { r.classList.add('is-in'); });
      L.rows[4].classList.add('is-told');
      L.table.classList.add('is-open');
    });
    finals.forEach(function (list, d) {
      list.forEach(function (c, i) { c.value = c.target = c.shown = c.final; setCount(d, i, c.final); });
    });
    hero.classList.remove('is-playing');
    hero.classList.add('is-rest');
    setLabel('Play service again');
  }

  function play(fromDot) {
    cancelAnimationFrame(raf);
    t = 0; rt = 0; launched = false; dimmed = false; flights = [];
    landed = [0, 0, 0, 0, 0]; due = [0, 0, 0, 0, 0];
    each(function (L) {
      L.rows.forEach(function (r) { r.classList.remove('is-in', 'is-told'); });
      L.table.classList.remove('is-open');
    });
    finals.forEach(function (list, d) {
      list.forEach(function (c, i) { c.value = c.target = 0; c.shown = 0; setCount(d, i, 0); });
    });
    setShout(0);
    hero.classList.remove('is-rest');
    hero.classList.add('is-playing');
    setLabel('Quiet now');
    build();
    opening = fromDot ? 0 : 1;
    clipTo(fromDot ? lamp.r : lamp.R);
    hot.style.visibility = 'visible';
    playing = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  btn.addEventListener('click', function () {
    if (!started) { started = true; rest(); return; } // quieted before it began
    if (playing) rest(); else play(true);
  });

  // A resize during service just ends it; a resize at rest only needs the lamp's new place.
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth;
    if (playing) rest();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.intersectionRatio >= 0.5) seen = true; });
    }, { threshold: [0, 0.5, 1] }).observe(sheet);
  } else {
    seen = true;
  }

  // Draw with the real face, or not at all for longer than a moment.
  function go() { if (!started) { started = true; play(false); } }
  if (document.fonts && document.fonts.load) {
    document.fonts.load(fontOf(900, 20)).then(go, go);
    setTimeout(go, 1200);
  } else {
    go();
  }

  /* exposed for frame captures during review */
  window.__tooeyService = { time: function () { return t; } };
})();

/* ---------- Join the pilot ---------- */

function initForm() {
  var form = document.querySelector('.form');
  if (!form || !window.fetch || !window.FormData) return;
  var status = form.querySelector('.status');
  var submit = form.querySelector('.submit');
  var label = submit.textContent;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function mailto(data) {
    var body = [
      'Name: ' + (data.name || ''),
      'Restaurant: ' + (data.restaurant || ''),
      'Email: ' + (data.email || ''),
      'Phone: ' + (data.phone || ''),
      'POS: ' + (data.pos || ''),
      '',
      data.message || ''
    ].join('\n');
    return 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var first = null;
    ['name', 'restaurant', 'email'].forEach(function (n) {
      var el = form.elements[n];
      var v = el.value.trim();
      var ok = !!v && (n !== 'email' || EMAIL.test(v));
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !first) first = el;
    });
    if (first) {
      status.textContent = first.name === 'email' && first.value.trim()
        ? 'That email address looks incomplete.'
        : 'Add your name, restaurant, and email so we can reply.';
      first.focus();
      return;
    }
    if (form.elements._honey.value) return;

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';

    fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error('status ' + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || !(j.success === true || j.success === 'true')) throw new Error('not accepted');
      var done = document.createElement('p');
      done.className = 'done';
      done.tabIndex = -1;
      done.textContent = 'Sent. We’ll reply from tooeyteam@gmail.com.';
      form.replaceChildren(done);
      done.focus();
    }).catch(function () {
      submit.disabled = false;
      submit.textContent = label;
      status.innerHTML = 'That didn’t send. Try again, or <a href="' + mailto(data) +
        '">email us instead</a>.';
    });
  });

  form.addEventListener('input', function (ev) {
    if (ev.target.getAttribute('aria-invalid') === 'true') ev.target.setAttribute('aria-invalid', 'false');
  });
}
