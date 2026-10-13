/* Tooey, exploration 03.
   The sample menu is set in its own weight: each dish name gets wider and
   heavier the more of it the bistro will likely sell. A roll of day dots
   scrubs through a sample fortnight; every row follows on its own spring. */
(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------------- the sample bistro (made-up numbers) ---------------- */
  // Likely sales per day. Days 0-6 are the week before the sample (used only
  // for "on last Friday"); days 7-20 are the two weeks on the roll. The last
  // Sunday is Mother's Day.
  var DATA = {
    'Short rib':      [17,22,24,28,42,45,30, 20,23,25,31,42,49,31, 19,23,27,29,44,47,48],
    'Roast chicken':  [16,16,19,25,33,36,31, 16,18,20,23,35,36,30, 15,18,20,26,34,39,63],
    'Tagliatelle':    [ 8, 9,11,13,17,19,15,  8, 9,11,14,19,20,13,  9,10,11,14,18,21,20],
    'Frites':         [27,34,37,47,63,70,48, 29,34,41,45,65,68,50, 30,33,39,50,69,68,72],
    'Gem salad':      [ 9,11,12,14,23,25,17, 10,11,14,15,23,29,18, 11,13,14,16,21,27,26],
    'Chocolate pot':  [ 8, 9,10,13,18,20,13,  9, 9,11,14,17,20,13,  9,10,12,13,20,20,35],
    'Olive oil cake': [ 6, 6, 7, 8,11,13, 9,  6, 7, 8, 9,11,13,10,  5, 7, 8, 8,13,15,20]
  };
  var V0 = 7, N = 14, HOLIDAY = 13, START = 4;
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var DOTS = ['#2F6FD0', '#F2C230', '#D8343B', '#7A5230', '#2E9E5B', '#F07E26', '#262626'];
  // Make: a little over the likely count.
  function prepOf(p) { return p + Math.max(1, Math.round(p * 0.1)); }

  var GMAX = 0;
  Object.keys(DATA).forEach(function (k) { DATA[k].slice(V0).forEach(function (p) { GMAX = Math.max(GMAX, p); }); });

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerpAt(arr, f) {
    f = clamp(f, 0, N - 1);
    var i = Math.floor(f), j = Math.min(i + 1, N - 1), u = f - i;
    return arr[i] + (arr[j] - arr[i]) * u;
  }

  /* ---------------- rows ---------------- */
  var menu = document.getElementById('menu');
  if (!menu) return;
  var rowEls = Array.prototype.slice.call(menu.querySelectorAll('.row[data-dish]'));
  var ghostEls = Array.prototype.slice.call(menu.querySelectorAll('.row.ghost'));

  var K = 1; // how much of the width axis the screen can afford

  var rows = rowEls.map(function (li, i) {
    var arr = DATA[li.dataset.dish];
    var vis = arr.slice(V0);
    var prep = vis.map(prepOf);
    var min = Math.min.apply(null, vis), max = Math.max.apply(null, vis);
    var btn = li.querySelector('.dish');
    var count = li.querySelector('.count');
    var detail = li.querySelector('.detail');
    var name = li.querySelector('.name');

    // Odometer: tens wheel starts blank so single digits sit flush right.
    count.innerHTML = '<span class="sr"></span><span class="odo" aria-hidden="true">' +
      '<span class="d"><span class="s">' + ['&nbsp;',1,2,3,4,5,6,7,8,9].map(function (n) { return '<span>' + n + '</span>'; }).join('') + '</span></span>' +
      '<span class="d"><span class="s">' + [0,1,2,3,4,5,6,7,8,9,0].map(function (n) { return '<span>' + n + '</span>'; }).join('') + '</span></span></span>';
    var strips = count.querySelectorAll('.s');
    detail.id = 'detail-' + i;
    btn.setAttribute('aria-controls', detail.id);

    li.style.removeProperty('--w');
    li.style.removeProperty('--g');

    // Stiffness falls a little down the list so a change runs down the menu like a wave.
    var k = 190 - i * 14;
    return {
      li: li, btn: btn, name: name, detail: detail, sr: count.querySelector('.sr'),
      tens: strips[0], units: strips[1],
      arr: arr, vis: vis, prep: prep, min: min, max: max,
      tmax: 0.5 * Math.sqrt(max / GMAX) + 0.5,
      v: START, vel: 0, a: reduce ? 1 : 0,
      k: k, c: 2 * Math.sqrt(k) * 0.58,
      last: { v: -1, a: -1, K: -1 }
    };
  });

  function tOf(r, p) { return clamp(0.5 * Math.sqrt(Math.max(p, 0) / GMAX) + 0.5 * (p - r.min) / (r.max - r.min), 0, 1); }
  function axes(t) { return '"wdth" ' + (50 + 100 * t * K).toFixed(2) + ', "wght" ' + (140 + 760 * t).toFixed(1); }

  function setOdo(r, n) {
    n = Math.max(0, n);
    if (Math.abs(n - Math.round(n)) < 0.04) n = Math.round(n);
    var u = n % 10;
    var tens = Math.floor(n / 10) + Math.max(0, u - 9);
    r.units.style.transform = 'translateY(' + (-u * 100 / 11).toFixed(3) + '%)';
    r.tens.style.transform = 'translateY(' + (-tens * 10).toFixed(3) + '%)';
  }

  function render(r, force) {
    if (!force && Math.abs(r.v - r.last.v) < 1e-4 && r.a === r.last.a && K === r.last.K) return;
    r.last.v = r.v; r.last.a = r.a; r.last.K = K;
    var p = lerpAt(r.vis, r.v);
    var t = clamp(tOf(r, p) * Math.max(r.a, 0), 0, 1);
    r.name.style.fontVariationSettings = axes(t);
    setOdo(r, lerpAt(r.prep, r.v) * clamp(r.a, 0, 1));
  }

  /* ---------------- the roll of day dots ---------------- */
  var dial = document.getElementById('dial');
  var tape = document.getElementById('tape');
  var todayName = document.getElementById('today-name');
  var todayDot = document.getElementById('today-dot');
  var dots = [];
  var S = 64, G = 32, center = 0, pos = [];

  for (var d = 0; d < N; d++) {
    var dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.setProperty('--c', DOTS[d % 7]);
    dot.dataset.i = d;
    tape.appendChild(dot);
    dots.push(dot);
  }
  var weekMark = document.createElement('span');
  weekMark.className = 'week';
  tape.appendChild(weekMark);
  var flag = document.createElement('span');
  flag.className = 'flag';
  flag.textContent = 'Mother’s Day';
  tape.appendChild(flag);

  function geometry() {
    S = window.innerWidth < 760 ? 54 : 64;
    G = Math.round(S * 0.45);
    center = dial.clientWidth / 2;
    pos = [];
    for (var i = 0; i < N; i++) pos.push(S / 2 + i * S + (i >= 7 ? G : 0));
    tape.style.width = (N * S + G) + 'px';
    dots.forEach(function (el, i) { el.style.left = pos[i] + 'px'; });
    weekMark.style.left = (7 * S + G / 2) + 'px';
    flag.style.left = pos[HOLIDAY] + 'px';
  }
  function xOf(i) { return center - pos[i]; }
  function fOfX(x) {
    var c = center - x;
    if (c <= pos[0]) return (c - pos[0]) / S;
    if (c >= pos[N - 1]) return N - 1 + (c - pos[N - 1]) / S;
    for (var i = 0; i < N - 1; i++) {
      if (c <= pos[i + 1]) return i + (c - pos[i]) / (pos[i + 1] - pos[i]);
    }
    return N - 1;
  }

  var F = START;      // where the roll is now (fractional day)
  var dayNow = -1;
  var aim = START;    // the day the roll is heading for

  function sync() {
    var x = gsap.getProperty(tape, 'x');
    F = fOfX(x);
    var c = center - x;
    for (var i = 0; i < N; i++) {
      var dd = Math.abs(pos[i] - c) / S;
      var s = 1 + 0.36 * Math.max(0, 1 - dd);
      dots[i].style.transform = 'scale(' + s.toFixed(3) + ')';
    }
    var di = clamp(Math.round(F), 0, N - 1);
    if (di !== dayNow) setDay(di);
    if (reduce) rows.forEach(function (r) { r.v = F; render(r); });
  }

  function dayLabel(i) { return DAYS[i % 7]; }

  function setDay(i) {
    dayNow = i;
    todayName.textContent = dayLabel(i);
    todayDot.style.background = DOTS[i % 7];
    dial.setAttribute('aria-valuenow', i + 1);
    dial.setAttribute('aria-valuetext', dayLabel(i) + (i < 7 ? ', first week' : ', second week') + (i === HOLIDAY ? ', Mother’s Day' : ''));
    rows.forEach(function (r) {
      r.sr.textContent = ', make ' + r.prep[i];
      if (!r.detail.hidden) writeDetail(r);
    });
  }

  function writeDetail(r) {
    var i = dayNow, p = r.vis[i], last = r.arr[V0 + i - 7], delta = p - last;
    var day = dayLabel(i);
    var change = delta > 0 ? 'Up ' + delta + ' on last ' + day + '.' :
                 delta < 0 ? 'Down ' + (-delta) + ' on last ' + day + '.' :
                 'Same as last ' + day + '.';
    r.detail.textContent = 'Likely to sell ' + p + '. Make ' + r.prep[i] + '. ' + change;
  }

  /* ---------------- fitting the type to the screen ---------------- */
  var meas = document.createElement('span');
  meas.className = 'name';
  meas.setAttribute('aria-hidden', 'true');
  meas.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;font-size:100px;white-space:nowrap;';
  menu.appendChild(meas);

  function widthAt(text, fvs) { meas.textContent = text; meas.style.fontVariationSettings = fvs; return meas.getBoundingClientRect().width; }

  function fit() {
    var desk = window.innerWidth >= 1024;
    var rowW = rows[0].btn.clientWidth;
    var countRatio = 1.3; // two wheels of .5em plus the gap, per px of type
    var ghostW = ghostEls.map(function (g) { return widthAt(g.querySelector('.name').textContent, '"wdth" 66, "wght" 380'); });

    function widthFit(k) {
      var saved = K; K = k;
      var fs = Infinity;
      rows.forEach(function (r) {
        var w = widthAt(r.name.textContent, axes(r.tmax));
        fs = Math.min(fs, rowW / (w / 100 + countRatio));
      });
      ghostW.forEach(function (w) { fs = Math.min(fs, rowW / (w / 100 + countRatio)); });
      K = saved;
      return fs;
    }

    var target;
    if (desk) {
      // Keep the whole list in view beside the headline.
      menu.style.setProperty('--fs', '40px');
      var h40 = menu.offsetHeight;
      menu.style.setProperty('--fs', '80px');
      var h80 = menu.offsetHeight;
      var A = (h80 - h40) / 40, B = h40 - A * 40;
      var top = menu.getBoundingClientRect().top + window.scrollY;
      var avail = window.innerHeight - top - 28;
      target = clamp((avail - B) / A, 50, 104);
    } else {
      target = clamp(window.innerWidth * 0.105, 32, 62);
    }

    var k = 1, fs = widthFit(1);
    if (fs < target) {
      for (k = 0.95; k >= 0.2; k -= 0.05) { fs = widthFit(k); if (fs >= target) break; }
      k = Math.max(k, 0.2);
    }
    K = k;
    fs = Math.floor(Math.min(fs, target));
    menu.style.setProperty('--fs', fs + 'px');
    rows.forEach(function (r) { render(r, true); });
  }

  /* ---------------- motion ---------------- */
  var drag, introTl, userTouched = false, justDragged = false;

  function tick() {
    var dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 30);
    if (!reduce) {
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var acc = r.k * (F - r.v) - r.c * r.vel;
        r.vel += acc * dt;
        r.v += r.vel * dt;
        if (Math.abs(F - r.v) < 1e-4 && Math.abs(r.vel) < 1e-4) { r.v = F; r.vel = 0; }
        render(r);
      }
    }
  }

  function stopIntro() {
    userTouched = true;
    if (introTl) { introTl.progress(1).kill(); introTl = null; }
    gsap.killTweensOf(tape);
    root.classList.remove('intro');
  }

  function goTo(i, instant) {
    i = clamp(i, 0, N - 1);
    aim = i;
    gsap.killTweensOf(tape);
    if (reduce || instant) { gsap.set(tape, { x: xOf(i) }); sync(); return; }
    gsap.to(tape, { x: xOf(i), duration: 0.65, ease: 'power3.out', onUpdate: sync });
  }

  function nearest(x) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < N; i++) { var dd = Math.abs(xOf(i) - x); if (dd < bd) { bd = dd; best = i; } }
    return xOf(best);
  }

  function setupDrag() {
    gsap.registerPlugin(Draggable, InertiaPlugin);
    drag = Draggable.create(tape, {
      type: 'x',
      trigger: [dial, menu],
      inertia: !reduce,
      dragClickables: true,
      minimumMovement: 4,
      edgeResistance: 0.82,
      bounds: { minX: xOf(N - 1), maxX: xOf(0) },
      snap: reduce ? null : function (v) { return nearest(v); },
      onPress: function () { stopIntro(); },
      onDragStart: function () { justDragged = true; menu.classList.add('is-dragging'); },
      onDrag: sync,
      onThrowUpdate: sync,
      onRelease: function () {
        menu.classList.remove('is-dragging');
        setTimeout(function () { justDragged = false; }, 60);
        if (reduce) { gsap.set(tape, { x: nearest(gsap.getProperty(tape, 'x')) }); sync(); }
      },
      onThrowComplete: sync,
      onClick: function (e) {
        var dot = e.target.closest && e.target.closest('.dot');
        if (dot) goTo(+dot.dataset.i);
      }
    })[0];
  }

  function intro() {
    if (reduce) { root.classList.remove('intro'); return; }
    // The roll is pulled from Monday to Friday while the menu fills out.
    gsap.set(tape, { x: xOf(0) + S * 0.6 });
    sync();
    rows.forEach(function (r) { r.v = F; r.a = 0; });
    root.classList.remove('intro');
    introTl = gsap.timeline({ delay: 0.25 });
    introTl.to(tape, { x: xOf(START), duration: 1.25, ease: 'power3.out', onUpdate: sync }, 0);
    rows.forEach(function (r, i) {
      introTl.to(r, { a: 1, duration: 1.35, ease: 'elastic.out(1, 0.55)' }, 0.3 + i * 0.075);
    });
    introTl.fromTo(todayDot, { scale: 1.9, rotate: -14 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(3)', immediateRender: false }, 1.05);
    // A short tug toward Saturday and back, so the roll shows it moves.
    introTl.to(tape, { x: xOf(START) - S * 0.45, duration: 0.55, ease: 'sine.inOut', onUpdate: sync }, 2.6);
    introTl.to(tape, { x: xOf(START), duration: 0.8, ease: 'elastic.out(1, 0.6)', onUpdate: sync }, 3.25);
    introTl.eventCallback('onComplete', function () { introTl = null; });
  }

  function layout() {
    geometry();
    if (drag) drag.applyBounds({ minX: xOf(N - 1), maxX: xOf(0) });
    gsap.set(tape, { x: xOf(clamp(dayNow < 0 ? START : dayNow, 0, N - 1)) });
    fit();
    sync();
  }

  /* ---------------- events ---------------- */
  rows.forEach(function (r) {
    r.btn.addEventListener('click', function () {
      if (justDragged) return;
      var open = r.btn.getAttribute('aria-expanded') === 'true';
      r.btn.setAttribute('aria-expanded', String(!open));
      r.detail.hidden = open;
      if (!open) writeDetail(r);
    });
  });

  dial.addEventListener('keydown', function (e) {
    var i = gsap.isTweening(tape) ? aim : dayNow, to = null;
    switch (e.key) {
      case 'ArrowLeft': case 'ArrowDown': to = i - 1; break;
      case 'ArrowRight': case 'ArrowUp': to = i + 1; break;
      case 'PageDown': to = i - 7; break;
      case 'PageUp': to = i + 7; break;
      case 'Home': to = 0; break;
      case 'End': to = N - 1; break;
    }
    if (to === null) return;
    e.preventDefault();
    stopIntro();
    goTo(to);
  });

  function start() {
    if (!window.gsap || !window.Draggable) { root.classList.remove('intro'); return; }
    geometry();
    gsap.set(tape, { x: xOf(START) });
    sync();
    rows.forEach(function (r) { r.v = F; });
    fit();
    setupDrag();
    gsap.ticker.add(tick);
    intro();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  }

  var fontReady = document.fonts && document.fonts.load ? document.fonts.load('700 40px Anybody') : Promise.resolve();
  Promise.race([fontReady, new Promise(function (res) { setTimeout(res, 1500); })]).then(start, start);
})();

/* ---------------- the form ---------------- */
(function () {
  'use strict';
  var form = document.getElementById('form');
  if (!form) return;
  var status = document.getElementById('status');
  var btn = document.getElementById('submit');
  var label = btn.textContent;

  function say(html, bad) { status.innerHTML = html; status.classList.toggle('bad', !!bad); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var need = [f.name, f.restaurant, f.email];
    var firstBad = null;
    need.forEach(function (el) {
      var ok = el.value.trim() !== '' && (el.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) {
      say('Add your name, your restaurant and a working email.', true);
      firstBad.focus();
      return;
    }
    if (f._honey.value) { say('Thanks. We’ll reply from tooeyteam@gmail.com.'); form.reset(); return; }

    var body = {
      name: f.name.value.trim(), restaurant: f.restaurant.value.trim(), email: f.email.value.trim(),
      phone: f.phone.value.trim(), pos: f.pos.value.trim(), message: f.message.value.trim(),
      _subject: 'New Tooey inquiry', _template: 'table', _captcha: 'false', _honey: ''
    };
    btn.disabled = true; btn.textContent = 'Sending…';
    say('Sending…');

    fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      if (data && (data.success === false || data.success === 'false')) throw new Error('rejected');
      form.reset();
      say('Thanks. We’ll reply from tooeyteam@gmail.com.');
    }).catch(function () {
      var mail = 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('Tooey pilot') + '&body=' +
        encodeURIComponent('Name: ' + body.name + '\nRestaurant: ' + body.restaurant + '\nEmail: ' + body.email +
          (body.phone ? '\nPhone: ' + body.phone : '') + (body.pos ? '\nPOS: ' + body.pos : '') + (body.message ? '\n\n' + body.message : ''));
      say('That didn’t send. <a href="' + mail.replace(/"/g, '&quot;') + '">Email it to us instead</a>.', true);
    }).then(function () {
      btn.disabled = false; btn.textContent = label;
    });
  });
})();
