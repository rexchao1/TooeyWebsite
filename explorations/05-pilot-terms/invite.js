/* Tooey, exploration 05: the invitation.
   The card is real DOM in CSS 3D. Scroll sets where the cover wants to be;
   a spring with weight carries it there, and the table stops it. */
(function () {
  'use strict';
  var d = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- tomorrow's weekday on the example ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var tmw = new Date(); tmw.setDate(tmw.getDate() + 1);
  Array.prototype.forEach.call(document.querySelectorAll('.weekday'), function (el) { el.textContent = DAYS[tmw.getDay()]; });

  /* ---------- the restaurant's name, written onto the card as it is typed ---------- */
  var form = $('.form');
  var rname = $('.rname');
  if (form && rname) {
    form.restaurant.addEventListener('input', function () {
      var v = form.restaurant.value.replace(/\s+/g, ' ').trim().slice(0, 48);
      rname.textContent = v || 'your restaurant';
      rname.classList.toggle('is-typed', !!v);
    });
  }

  /* ---------- form ---------- */
  if (form) setupForm(form);

  if (!d.classList.contains('is-3d')) return;

  /* ---------- the card ---------- */
  var stage = $('.stage'), scene = $('.scene'), cover = $('.cover');
  var front = $('.front'), back = $('.back'), bshade = $('.bshade'), card = $('.card');
  if (!stage || !scene || !cover) { d.classList.remove('is-3d'); return; }

  var W, H, mode, stageTop, travel, fitOpen;
  function measure() {
    mode = window.innerWidth < 700 ? 'v' : 'h';
    W = scene.offsetWidth; H = scene.offsetHeight;
    fitOpen = mode === 'v'
      ? Math.min(1, (window.innerHeight - 24) / (2 * H))
      : Math.min(1, (window.innerWidth - 24) / (2 * W));
    // the reply card starts tucked under the open card's bottom edge
    var openH = mode === 'v' ? 2 * H * fitOpen : H;
    d.style.setProperty('--pull', Math.max(0, window.innerHeight / 2 - openH / 2 + 64).toFixed(0) + 'px');
    stageTop = stage.getBoundingClientRect().top + window.scrollY;
    travel = Math.max(1, stage.offsetHeight - window.innerHeight);
  }
  measure();
  window.addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var easeIO = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var RAD = Math.PI / 180;

  // lamp: up, left and in front of the table
  var L = norm([-0.45, -0.55, 0.75]);
  var HV = norm([L[0], L[1], L[2] + 1]);
  function norm(v) { var m = Math.hypot(v[0], v[1], v[2]); return [v[0] / m, v[1] / m, v[2] / m]; }

  // state
  var th = 0, vel = 0;               // cover angle, degrees, and its angular velocity
  var dz = 110, vz = 0;              // height above the table while the card is set down
  var t0 = performance.now(), prev = t0;
  var lastScroll = t0, lastHint = t0, everOpened = false;
  var dropping = false;
  setTimeout(function () { dropping = true; d.classList.add('is-live'); }, 380);

  window.addEventListener('scroll', function () { lastScroll = performance.now(); }, { passive: true });
  // "Open" scrolls to the point where the card lies open
  var openLink = $('.open');
  if (openLink) openLink.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: stageTop + travel * .72, behavior: 'smooth' });
  });
  // clicking the closed cover does the same
  front.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    if (th < 20) openLink.click();
  });

  var last = {};
  function set(el, key, prop, val) {
    if (last[key] === val) return;
    last[key] = val;
    el.style.setProperty(prop, val);
  }

  function frame(now) {
    var dt = Math.min(.034, (now - prev) / 1000); prev = now;
    var p = clamp((window.scrollY - stageTop) / travel, 0, 1);
    if (p > .2) everOpened = true;

    // where the scroll wants the cover
    var target = 180 * easeIO((p - .06) / .54);

    // idle: the free edge lifts a little and falls back, as if someone nudged it
    if (!everOpened && dz === 0 && p < .01 && now - lastScroll > 3200 && now - lastHint > 6500) {
      vel += 40; lastHint = now;
    }

    // spring with weight; the table is a hard stop on both sides
    // heavy cotton stock: a soft spring, and it never whips faster than a hand would turn it
    var k = 42, c = 2 * Math.sqrt(k) * .52;
    vel += (k * (target - th) - c * vel) * dt;
    vel = clamp(vel, -430, 430);
    th += vel * dt;
    if (th > 180) { th = 180; vel = -vel * .3; if (Math.abs(vel) < 6) vel = 0; }
    if (th < 0) { th = 0; vel = -vel * .28; if (Math.abs(vel) < 6) vel = 0; }

    // set down: falls the last few centimetres and settles
    if (dropping && (dz > 0 || vz !== 0)) {
      vz -= 2600 * dt; dz += vz * dt;
      if (dz <= 0) { dz = 0; vz = -vz * .26; if (vz < 40) vz = 0; }
    }

    var o = th / 180, so = smooth(o);
    var tl = smooth((p - .04) / .6);
    var s = Math.sin(th * RAD), co = Math.cos(th * RAD);

    var rx = lerp(mode === 'h' ? 17 : 13, 0, tl);
    var rz = lerp(mode === 'h' ? -3.4 : -2, 0, tl) + dz * .03;
    var X = mode === 'h' ? W / 2 * so : 0;
    var Y = mode === 'v' ? H / 2 * so : 0;
    var sc = lerp(1, fitOpen, so) * (1 - .09 * s);

    set(scene, 'scene', 'transform',
      'translate3d(' + X.toFixed(2) + 'px,' + Y.toFixed(2) + 'px,0) rotateX(' + rx.toFixed(3) + 'deg) rotateZ(' + rz.toFixed(3) + 'deg) translateZ(' + dz.toFixed(2) + 'px) scale(' + sc.toFixed(4) + ')');
    set(cover, 'cover', 'transform', mode === 'h'
      ? 'translateZ(2px) rotateY(' + (-th).toFixed(3) + 'deg)'
      : 'translateZ(2px) rotateX(' + th.toFixed(3) + 'deg)');

    // light on each face of the cover
    var n = mode === 'h' ? [-s, 0, co] : [0, -s, co];
    var bF = n[0] * L[0] + n[1] * L[1] + n[2] * L[2];
    var bB = -bF;
    set(front, 'fsh', '--sh', clamp((L[2] - bF) * .8, 0, .55).toFixed(3));
    set(back, 'bsh', '--sh', clamp((L[2] - bB) * .8, 0, .55).toFixed(3));
    var spec = Math.pow(Math.max(0, n[0] * HV[0] + n[1] * HV[1] + n[2] * HV[2]), 40);
    set(front, 'fgl', '--gl', (spec * 1.1).toFixed(3));
    set(front, 'fglx', '--glx', ((o * 2 - .3) * 60).toFixed(1) + '%');

    // where the cover's shadow lands: on the inside page, then on the cloth beside it
    var lx = mode === 'h' ? -L[0] / L[2] : -L[1] / L[2];
    var f = co + lx * s;
    set(bshade, 'bs', '--bs', clamp(f, 0, 1).toFixed(4));
    set(bshade, 'bo', '--bo', (f > 0 ? clamp(1 - s * .45, 0, 1) : 0).toFixed(3));
    set(bshade, 'bb', '--bb', (1 + 14 * s).toFixed(1) + 'px');
    set(card, 'cs', '--cs', clamp(-f, 0, 1).toFixed(4));
    set(card, 'co', '--co', (f < 0 ? .5 + .4 * (1 - s) : 0).toFixed(3));
    set(card, 'cb', '--cb', (2 + 18 * s).toFixed(1) + 'px');

    if (!document.hidden) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { prev = performance.now(); requestAnimationFrame(frame); }
  });

  // test hook: freeze at a given scroll for frame captures
  window.__invite = { state: function () { return { th: th, dz: dz, mode: mode }; } };

  /* ---------- form handling ---------- */
  function setupForm(form) {
    var btn = form.querySelector('button[type=submit]');
    var status = form.querySelector('.status');
    var label = btn.textContent;
    var need = {
      name: 'Add your name.',
      restaurant: 'Add the name of your restaurant.',
      email: 'Add an email we can reply to.'
    };

    function fieldError(input, msg) {
      var wrap = input.closest('.f');
      var err = wrap.querySelector('.err');
      if (!msg) {
        input.removeAttribute('aria-invalid');
        if (err) err.remove();
        input.removeAttribute('aria-describedby');
        return;
      }
      if (!err) {
        err = document.createElement('span');
        err.className = 'err';
        err.id = 'err-' + input.name;
        wrap.appendChild(err);
      }
      err.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', err.id);
    }

    Object.keys(need).forEach(function (k) {
      form[k].addEventListener('input', function () { if (form[k].getAttribute('aria-invalid')) check(k); });
    });
    function check(k) {
      var v = form[k].value.trim();
      var msg = v ? '' : need[k];
      if (k === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'That email looks incomplete.';
      fieldError(form[k], msg);
      return !msg;
    }

    function mailto() {
      var body = ['Name: ' + form.name.value, 'Restaurant: ' + form.restaurant.value, 'Email: ' + form.email.value,
        'Phone: ' + form.phone.value, 'POS: ' + form.pos.value, '', form.message.value].join('\n');
      return 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      Object.keys(need).forEach(function (k) { if (!check(k)) { ok = false; first = first || form[k]; } });
      if (!ok) { first.focus(); return; }

      if (form._honey.value) { done(); return; }

      var data = {
        name: form.name.value.trim(),
        restaurant: form.restaurant.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        pos: form.pos.value.trim(),
        message: form.message.value.trim(),
        _subject: 'New Tooey inquiry',
        _template: 'table',
        _captcha: 'false',
        _honey: ''
      };
      btn.disabled = true;
      btn.textContent = 'Sending…';
      status.textContent = '';

      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || !(j.success === true || j.success === 'true')) throw new Error('not sent');
        });
      }).then(done, function () {
        btn.disabled = false;
        btn.textContent = label;
        status.innerHTML = '';
        status.append('Your application didn’t send. Email it to ');
        var a = document.createElement('a');
        a.href = mailto(); a.textContent = 'tooeyteam@gmail.com';
        status.append(a, ' instead.');
      });
    });

    function done() {
      var who = form.email.value.trim();
      var box = document.createElement('div');
      box.className = 'done';
      box.setAttribute('tabindex', '-1');
      var a = document.createElement('p'); a.textContent = 'Application sent.';
      var b = document.createElement('p');
      b.textContent = 'We’ll reply from tooeyteam@gmail.com' + (who ? ' to ' + who + '.' : '.');
      box.append(a, b);
      form.replaceWith(box);
      box.focus();
    }
  }
})();
