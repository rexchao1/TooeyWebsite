/* Tooey, exploration 10: "Service is loud."
   The hero plays one service and lets it go quiet by itself: order lines
   stream in heat-lamp red, slow, fly into their dish's row as counts, and
   the lamp cools to the colour of a kitchen after close. Then nothing moves. */

(function () {
  'use strict';

  initForm();

  var doc = document.documentElement;
  if (doc.className !== 'live') return;

  var hero = document.querySelector('.hero');
  var canvas = hero && hero.querySelector('.roar');
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');
  if (!ctx) { doc.className = 'static'; return; }

  var shout = hero.querySelector('.shout');
  var sheet = hero.querySelector('.sheet');
  var table = hero.querySelector('.counts');
  var rows = Array.prototype.slice.call(hero.querySelectorAll('.row'));
  var btn = hero.querySelector('.replay');
  var btnLabel = btn.querySelector('.replay-label');

  /* ---------- Colour, mixed in OKLab so red cools without going muddy ---------- */

  function hexRgb(h) {
    return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  }
  function lin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function gam(c) { return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
  function lab(h) {
    var c = hexRgb(h), r = lin(c[0]), g = lin(c[1]), b = lin(c[2]);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    ];
  }
  function mix(A, B, t) {
    var L = A[0] + (B[0] - A[0]) * t, a = A[1] + (B[1] - A[1]) * t, bb = A[2] + (B[2] - A[2]) * t;
    var l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * bb, 3);
    var m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * bb, 3);
    var s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * bb, 3);
    var rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    ];
    return 'rgb(' + rgb.map(function (v) {
      return Math.round(Math.max(0, Math.min(1, gam(v))) * 255);
    }).join(',') + ')';
  }

  function lerpLab(A, B, t) { return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; }
  function mixLab(A, B, t) { return mix(A, B, t); }
  var EMBER_NOW, FLY_NOW;
  var HEAT = lab('#C4381A'), CALM = lab('#F0C9BD');
  var TICKET = lab('#FFF1E4'), CHAR = lab('#4E1A10'), CHAR_SOFT = lab('#7E3A2A');

  /* ---------- Easing ---------- */

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function prog(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function inOutCubic(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function inOutSine(p) { return -(Math.cos(Math.PI * p) - 1) / 2; }
  function smooth(p) { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); }

  /* ---------- The choreography, in seconds ---------- */

  var T = {
    slow: 2.3,      // the rush starts to ease
    stop: 6.4,      // every lane at rest
    bg0: 2.5, bg1: 7.6,     // lamp cools
    h0: 3.3, h1: 8.0,       // the headline breathes out
    fly0: 3.0, fly1: 6.3,   // order lines leave for their rows
    end: 9.4
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
  var TAKE = [7, 6, 8, 5, 3]; // how many lines fly to each row
  var CHATTER = ['heard', 'behind', 'hands', 'fire 12', 'yes chef', 'corner', 'table 9 waiting',
    'all day 6', 're-fire', 'walking in', '86 fries', 'two minutes', 'sauce on the side',
    'behind you', 'order in', 'pick up 14', 'where’s 7?', 'heard, chef', 'sorry, re-fire'];

  /* ---------- Counts: the screen shows a ticking number, readers get the real one ---------- */

  var cells = rows.map(function (row) {
    return Array.prototype.slice.call(row.querySelectorAll('[data-final]')).map(function (td) {
      var final = +td.getAttribute('data-final');
      td.innerHTML = '<span class="sr-only">' + final + '</span><span aria-hidden="true">0</span>';
      return { el: td.lastChild, final: final, shown: 0, value: 0, target: 0 };
    });
  });

  /* ---------- State ---------- */

  var W = 0, H = 0, dpr = 1;
  var lanes = [], flights = [];
  var t = 0, rt = 0, last = 0, raf = 0;
  var playing = false, launched = false, seen = false;
  var landed = [0, 0, 0, 0, 0], due = [0, 0, 0, 0, 0];
  var rand = Math.random;

  function pickDish() {
    var r = rand(), acc = 0;
    for (var i = 0; i < DISH_WEIGHT.length; i++) { acc += DISH_WEIGHT[i]; if (r < acc) return i; }
    return 0;
  }

  function fontOf(w, s) { return w + ' ' + s + 'px "Mona Sans", ui-sans-serif, system-ui, sans-serif'; }

  function build() {
    W = hero.clientWidth; H = hero.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var k = clamp(Math.sqrt(W / 1280), 0.78, 1.15);
    var SIZES = [14, 16, 18, 21, 26, 34, 44];
    lanes = [];
    var y = 6;
    var i = 0;
    while (y < H + 20) {
      var size = Math.round(SIZES[Math.floor(Math.pow(rand(), 1.25) * SIZES.length)] * k);
      var lane = {
        y: y + size * 0.82,
        size: size,
        weight: [560, 680, 780, 860, 900][Math.floor(rand() * 5)],
        dir: i % 2 ? 1 : -1,
        v: (46 + rand() * 130) * (size < 20 ? 1.25 : 0.85) * k,
        phase: rand() * 6.28,
        off: rand() * 500,
        items: [],
        len: 0
      };
      ctx.font = fontOf(lane.weight, size);
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
          fadeAt: chatter ? 2.2 + rand() * 2.6 : 4.3 + rand() * 2.1,
          flying: false, x: 0
        });
        x += w + size * (0.9 + rand() * 1.6);
      }
      lane.len = x;
      lanes.push(lane);
      y += size * (1.05 + rand() * 0.55) + 4;
      i++;
    }
  }

  function itemX(lane, it) {
    var p = (it.base + lane.off * lane.dir) % lane.len;
    if (p < 0) p += lane.len;
    return p - (lane.len - W) / 2;
  }

  function rel(el) {
    var r = el.getBoundingClientRect(), h = hero.getBoundingClientRect();
    return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
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
      var start = T.fly0 + (n > 1 ? idx / (n - 1) : 0) * (T.fly1 - T.fly0) + rand() * 0.18;
      return {
        dish: c.dish, text: it.text, weight: lane.weight, size: lane.size, a: it.a,
        sx: clamp(x + it.w / 2, -40, W + 40), sy: lane.y - lane.size * 0.35,
        start: start, dur: 1.05 + rand() * 0.55, lift: 40 + rand() * 120,
        done: false
      };
    });
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
    return a;
  }

  function targetOf(d) {
    var row = rows[d];
    var cell = row.querySelector('.likely') || row.querySelector('.reason');
    var r = rel(cell);
    if (d === 4) return { x: r.x + r.w * 0.5, y: r.y + r.h / 2 };
    return { x: r.x + r.w - 14, y: r.y + r.h / 2 };
  }

  function land(f) {
    f.done = true;
    var d = f.dish;
    landed[d]++;
    rows[d].classList.add('is-in');
    table.classList.add('is-open');
    if (d === 4) {
      if (landed[4] >= due[4]) rows[4].classList.add('is-told');
      return;
    }
    var share = landed[d] / due[d];
    cells[d].forEach(function (c) { c.target = landed[d] >= due[d] ? c.final : Math.round(c.final * share); });
  }

  /* ---------- One frame ---------- */

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    rt += dt;
    t += dt;
    if (!seen && t > T.slow) t = T.slow; // keep the rush going until the list is in view

    var bgP = inOutSine(prog(t, T.bg0, T.bg1));
    // type flips from light to dark quickly, so it is never grey on salmon for long
    var inkP = smooth(prog(bgP, 0.24, 0.36));
    var bgLab = lerpLab(HEAT, CALM, bgP);
    hero.style.setProperty('--bg', mix(bgLab, bgLab, 0));
    hero.style.setProperty('--ink', mix(TICKET, CHAR, inkP));
    hero.style.setProperty('--ink-soft', mix(TICKET, CHAR_SOFT, inkP));

    var e = inOutCubic(prog(t, T.h0, T.h1));
    shout.style.fontWeight = Math.round(900 - 640 * e);
    shout.style.letterSpacing = (-0.045 + 0.033 * e).toFixed(4) + 'em';
    shout.style.transform = 'scale(' + (1 - 0.08 * e).toFixed(4) + ')';

    // friction: lanes coast to a stop rather than braking
    var m = t < T.slow ? 1 : Math.pow(1 - prog(t, T.slow, T.stop), 2.2);

    if (!launched && t >= T.fly0) launch();

    ctx.clearRect(0, 0, W, H);
    // the noise is always the ground, a shade darker: tone on tone at every moment
    EMBER_NOW = [bgLab[0] - 0.075 + 0.025 * bgP, bgLab[1] + 0.012, bgLab[2] + 0.008];
    var ember = mix(EMBER_NOW, EMBER_NOW, 0);
    ctx.fillStyle = ember;
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

    var flyP = inkP;
    var flyInk = mix(TICKET, CHAR, flyP);
    FLY_NOW = lerpLab(TICKET, CHAR, flyP);
    ctx.fillStyle = flyInk;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var open = 0;
    for (var k = 0; k < flights.length; k++) {
      var f = flights[k];
      if (f.done) continue;
      open++;
      if (t < f.start) {
        // waiting its turn: it stops where it was, still in the lane's colour
        ctx.fillStyle = ember;
        ctx.globalAlpha = f.a;
        ctx.font = fontOf(f.weight, f.size);
        ctx.fillText(f.text, f.sx, f.sy);
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
      var size = f.size + (13 - f.size) * q;
      // it lifts out of the noise as it leaves: lane colour to ink
      ctx.fillStyle = p < 0.3 ? mixLab(EMBER_NOW, FLY_NOW, smooth(p / 0.3)) : flyInk;
      ctx.globalAlpha = (f.a + (1 - f.a) * smooth(p / 0.3)) * (p < 0.68 ? 1 : 1 - (p - 0.68) / 0.32);
      ctx.font = fontOf(Math.round(f.weight - 300 * q), Math.max(8, size));
      ctx.fillText(f.text, px, py);
    }
    ctx.globalAlpha = 1;

    // numbers roll toward what has landed
    for (var d = 0; d < cells.length; d++) {
      for (var c = 0; c < cells[d].length; c++) {
        var cell = cells[d][c];
        cell.value += (cell.target - cell.value) * Math.min(1, dt * 5.5);
        var shown = Math.round(cell.target - cell.value < 0.5 ? cell.target : cell.value);
        if (shown !== cell.shown) { cell.shown = shown; cell.el.textContent = shown; }
      }
    }

    if (t >= T.end && launched && open === 0) { rest(); return; }
    raf = requestAnimationFrame(frame);
  }

  /* ---------- Rest, skip, replay ---------- */

  function rest() {
    cancelAnimationFrame(raf);
    raf = 0;
    playing = false;
    ctx.clearRect(0, 0, W, H);
    hero.style.setProperty('--bg', mix(CALM, CALM, 0));
    hero.style.setProperty('--ink', mix(CHAR, CHAR, 0));
    hero.style.setProperty('--ink-soft', mix(CHAR_SOFT, CHAR_SOFT, 0));
    shout.style.fontWeight = 260;
    shout.style.letterSpacing = '-0.012em';
    shout.style.transform = 'scale(0.92)';
    rows.forEach(function (r) { r.classList.add('is-in'); });
    rows[4].classList.add('is-told');
    table.classList.add('is-open');
    cells.forEach(function (list) {
      list.forEach(function (c) { c.value = c.target = c.shown = c.final; c.el.textContent = c.final; });
    });
    hero.classList.remove('is-playing');
    hero.classList.add('is-rest');
    btnLabel.textContent = 'Play service again';
  }

  function play() {
    cancelAnimationFrame(raf);
    t = 0; rt = 0; launched = false; flights = [];
    landed = [0, 0, 0, 0, 0]; due = [0, 0, 0, 0, 0];
    rows.forEach(function (r) { r.classList.remove('is-in', 'is-told'); });
    table.classList.remove('is-open');
    cells.forEach(function (list) {
      list.forEach(function (c) { c.value = c.target = c.shown = 0; c.el.textContent = '0'; });
    });
    shout.style.fontWeight = 900;
    shout.style.letterSpacing = '-0.045em';
    shout.style.transform = 'scale(1)';
    hero.classList.remove('is-rest');
    hero.classList.add('is-playing');
    btnLabel.textContent = 'Quiet now';
    build();
    playing = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  btn.hidden = false;
  btn.addEventListener('click', function () {
    if (playing) rest(); else play();
  });

  // Starting over mid-play is not worth a jump: a resize during service just ends it.
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
  var started = false;
  function go() { if (!started) { started = true; play(); } }
  if (document.fonts && document.fonts.load) {
    document.fonts.load(fontOf(900, 20)).then(go, go);
    setTimeout(go, 1200);
  } else {
    go();
  }

  /* expose for frame captures during review */
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
