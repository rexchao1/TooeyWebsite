/* Tooey, exploration 32: the walk-through.
   One line drawing of the whole restaurant. The scroll walks a camera through
   it, one room per stop; each room draws itself as the camera gets there
   (structure, then furniture, then detail), its lamps come up, and one small
   thing happens in it. Then the contact form. No libraries. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');

  form();

  var walk = document.querySelector('.walk');
  if (!walk) return;
  var stage = walk.querySelector('.stage');
  var svg = stage.querySelector('.drawing');
  var world = svg.querySelector('#world');
  var rooms = [].slice.call(world.querySelectorAll('.room'));
  var stops = [].slice.call(stage.querySelectorAll('.stop'));

  // the part of the drawing each stop frames: x, y, width, height (drawing units)
  var FRAMES = [
    [250, 70, 1180, 830],    // street front
    [1440, 150, 1460, 720],  // dining room
    [2950, 220, 930, 650],   // behind the counter
    [3990, 180, 1290, 650],  // kitchen line
    [5730, 340, 480, 350]    // the prep sheet on the prep table
  ];
  var N = FRAMES.length - 1;

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  seen();

  if (!motion) { stills(); return; }

  /* ---------- drawing order: structure, then furniture, then detail ---------- */
  var START = { s: 0, f: 0.34, d: 0.7 };
  rooms.forEach(function (room) {
    [].forEach.call(room.querySelectorAll('.ln'), function (layer) {
      var t = layer.getAttribute('data-t');
      var paths = [].slice.call(layer.querySelectorAll('path')).map(function (p) {
        var b = p.getBBox();
        return { p: p, len: p.getTotalLength(), key: b.x + b.width * 0.25 + b.y * 0.35 };
      });
      paths.sort(function (a, b) { return a.key - b.key; }); // sweep across the room
      var n = paths.length, span = t === 's' ? 0.5 : 0.62;
      paths.forEach(function (o, i) {
        var s = o.p.style;
        s.setProperty('--L', o.len.toFixed(1));
        s.setProperty('--du', clamp(0.42 + o.len / 1700, 0.45, 1.05).toFixed(2) + 's');
        s.setProperty('--dl', (START[t] + (n > 1 ? i / (n - 1) : 0) * span).toFixed(2) + 's');
      });
    });
  });

  var state = rooms.map(function () { return { on: 0, arrived: false }; });

  function on(i) {
    var st = state[i];
    if (st.on) return;
    st.on = performance.now();
    var room = rooms[i];
    room.style.setProperty('--ld', i === 0 ? '1.35s' : '1.1s');
    room.classList.add('on');
    setTimeout(function () { room.classList.add('done'); }, 3800);
  }
  function arrive(i) {
    var st = state[i];
    if (st.arrived) return;
    on(i);
    st.arrived = true;
    var ready = st.on + (i === 0 ? 1750 : 1300);
    var ad = Math.max(120, ready - performance.now()) / 1000;
    rooms[i].style.setProperty('--ad', ad.toFixed(2) + 's');
    rooms[i].classList.add('arrive');
  }

  /* ---------- the camera ---------- */
  var cams = [];
  function layout() {
    var W = stage.clientWidth, H = stage.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    var narrow = W <= 760;
    var g = clamp(W * 0.034, 16, 56), col = (W - 2 * g) / 4;
    var hero = narrow ? { l: 8, r: W - 8, t: 76, b: H * 0.5 } : { l: g + col * 1.8, r: W - g * 0.3, t: 100, b: H - 18 };
    var room = narrow ? { l: 8, r: W - 8, t: 28, b: H * 0.52 } : { l: g + col * 1.16, r: W - g * 0.6, t: 46, b: H - 36 };
    cams = FRAMES.map(function (f, i) {
      var b = i ? room : hero;
      var s = Math.min((b.r - b.l) / f[2], (b.b - b.t) / f[3]);
      return { cx: f[0] + f[2] / 2, cy: f[1] + f[3] / 2, s: s, ax: (b.l + b.r) / 2, ay: (b.t + b.b) / 2 };
    });
  }

  var lastK = 0;
  function render(t) {
    var i = Math.min(Math.floor(t), N - 1), f = t - i;
    var e = smooth(0.14, 0.86, f);          // hold a little at each stop
    var A = cams[i], B = cams[i + 1];
    var s = Math.exp(lerp(Math.log(A.s), Math.log(B.s), e)) * (1 - 0.2 * Math.sin(Math.PI * e)); // step back while walking
    var cx = lerp(A.cx, B.cx, e), cy = lerp(A.cy, B.cy, e);
    var ax = lerp(A.ax, B.ax, e), ay = lerp(A.ay, B.ay, e);
    world.setAttribute('transform', 'matrix(' + s.toFixed(5) + ' 0 0 ' + s.toFixed(5) + ' ' + (ax - cx * s).toFixed(2) + ' ' + (ay - cy * s).toFixed(2) + ')');
    var k = Math.pow(s, -0.85);              // lines stay fine as the camera closes in
    if (Math.abs(k - lastK) / k > 0.012) { world.style.setProperty('--k', k.toFixed(3)); lastK = k; }
  }

  var active = 0, started = false;
  function update(t) {
    // a stop's words show only while the camera is at that room
    var a = Math.round(t);
    if (Math.abs(t - a) > 0.3) a = -1;
    if (a !== active) {
      if (active > -1) stops[active].classList.remove('is-on');
      if (a > -1) stops[a].classList.add('is-on');
      active = a;
    }
    if (!started) return;
    for (var i = 0; i < rooms.length; i++) {
      if (t > i - 0.48) on(i);
      if (t > i - 0.12) arrive(i);
    }
    rooms[3].classList.toggle('steaming', state[3].arrived && t > 2.4 && t < 3.75);
  }

  function readScroll() {
    var span = walk.offsetHeight - stage.offsetHeight;
    return clamp(-walk.getBoundingClientRect().top / Math.max(1, span) * N, 0, N);
  }

  var target = 0, cur = 0, raf = 0;
  function tick() {
    raf = 0;
    var d = target - cur;
    cur = Math.abs(d) < 0.0005 ? target : cur + d * 0.15;
    render(cur);
    update(cur);
    if (cur !== target) raf = requestAnimationFrame(tick);
  }
  function onScroll() {
    target = readScroll();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  layout();
  target = cur = readScroll();
  render(cur);
  stops[0].classList.remove('is-on');
  active = -1;
  update(cur);
  // let one frame render the undrawn state first, so the transitions have a
  // starting point; then the street draws itself and lights up
  requestAnimationFrame(function () {
    svg.classList.add('ready');
    requestAnimationFrame(function () {
      getComputedStyle(rooms[0].querySelector('.ln path')).strokeDashoffset;
      started = true;
      arrive(0);
      update(cur);
    });
  });
  window.addEventListener('scroll', onScroll, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { layout(); lastK = 0; render(cur); }, 120);
  });

  /* ---------- reduced motion: each room as a finished, lit still ---------- */
  function stills() {
    stops.forEach(function (stop, i) {
      var fig = stop.querySelector('.still');
      if (!fig) return;
      var el = i === 0 ? svg : svg.cloneNode(true);
      var f = FRAMES[i], m = i === 4 ? 30 : 0;
      el.setAttribute('viewBox', (f[0] - m) + ' ' + (f[1] - m) + ' ' + (f[2] + 2 * m) + ' ' + (f[3] + 2 * m));
      el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      fig.appendChild(el);
    });
  }
})();

/* the steps' rule draws across when How to start comes into view */
function seen() {
  var start = document.querySelector('.start');
  if (!start || !('IntersectionObserver' in window)) { if (start) start.classList.add('seen'); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { start.classList.add('seen'); io.disconnect(); } });
  }, { threshold: 0.35 });
  io.observe(start);
}

/* ---------- contact form (as site 31) ---------- */
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
