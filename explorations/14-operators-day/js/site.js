/* Tooey, "The owner's week".
   One building, seen from across the street, lives through a week.
   Every diner in the window is one cover; every tub on the shelf is one dish.
   Lit means Tooey does it today. A reflection in the glass means we're building it. */
(function () {
  'use strict';
  var root = document.documentElement;
  var MOTION = root.classList.contains('motion');
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---------- menu ---------- */
  var menuBtn = $('.menu-btn'), nav = $('#nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
    });
  }

  /* ---------- form ---------- */
  var form = $('#form');
  if (form) setupForm(form);

  var stage = $('.stage');
  if (!stage) return;

  /* ---------- the example week ---------- */
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var SEATS = 20;
  // Example covers at the lunch and dinner peaks. Illustration only.
  var LEVEL = [[6, 10], [4, 7], [7, 12], [8, 15], [10, 22], [12, 23], [19, 5]];
  var WIDTH = [1.4, 1.3, 1.4, 1.5, 1.7, 2.1, 1.0];
  var CLOSE = [23.2, 23, 23.2, 23.4, 24.2, 24.5, 19.4];
  // Example prep counts, one per tub. The fourth dish is too new to call.
  var COUNTS = [[16, 24, 10], [12, 19, 8], [17, 25, 11], [19, 27, 12], [26, 34, 16], [27, 36, 18], [21, 31, 14]];
  var DAY_W = [1.2, 1.2, 0.8, 0.8, 1.2, 0.85, 1.0];
  var KEY = [7.2, 20.2, 6.4, 15.2, 20.2, 20.6, 20.05]; // the moment each day's caption is about
  var HERO_SH = 5.8, DAWN = 5.62;
  var HERO_END = 0.035, WEEK_END = 0.9;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function bump(h, c, w) { var x = (h - c) / w; return Math.exp(-x * x); }

  function coversAt(d, sh) {
    var open = d === 6 ? 10 : 11;
    if (sh < open || sh > CLOSE[d]) return 0;
    var L = LEVEL[d], v;
    if (d === 6) v = L[0] * bump(sh, 12, 1.25) + L[1] * bump(sh, 17.4, 0.7);
    else v = L[0] * bump(sh, 12.7, 0.9) + L[1] * bump(sh, 19.9, WIDTH[d]);
    var edge = Math.min(1, (sh - open) / 0.5, (CLOSE[d] - sh) / 0.7);
    return clamp(v * edge, 0, SEATS);
  }
  var TOTAL = DAYS.map(function (_, d) { var t = 0; for (var h = 5; h < 30; h += 0.1) t += coversAt(d, h) * 0.1; return t; });
  function cumCovers(d, sh) { var t = 0; for (var h = 5; h < sh; h += 0.1) t += coversAt(d, h) * 0.1; return t; }

  // sky colours by clock hour
  var SKY = [
    [0, '#12091A', '#2A1626'], [5, '#1A0E22', '#3A1E2E'], [6.2, '#4E2840', '#C9786A'],
    [7.6, '#A9817F', '#EBC6A0'], [11, '#CDB4A6', '#EEDBC4'], [16.5, '#C79C8D', '#EDC9A1'],
    [19, '#6E3446', '#DE8A64'], [20.4, '#2C1430', '#6A2E3E'], [22, '#160B1C', '#2E1828'], [24, '#12091A', '#2A1626']
  ];
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + Math.round(lerp(A[0], B[0], t)) + ',' + Math.round(lerp(A[1], B[1], t)) + ',' + Math.round(lerp(A[2], B[2], t)) + ')'; }
  function skyAt(c) {
    for (var i = 0; i < SKY.length - 1; i++) {
      if (c >= SKY[i][0] && c <= SKY[i + 1][0]) {
        var t = sstep(SKY[i][0], SKY[i + 1][0], c);
        return [mix(SKY[i][1], SKY[i + 1][1], t), mix(SKY[i][2], SKY[i + 1][2], t)];
      }
    }
    return [SKY[0][1], SKY[0][2]];
  }

  /* ---------- scene pieces, so a cloned window can be drawn too ---------- */
  function shopParts(svg) {
    return {
      svg: svg,
      dark: $('.room-dark', svg), lit: $('.room-lit', svg), server: $('.server', svg),
      refl: $('.reflection', svg), sheen: $('.sheen', svg),
      diners: $$('.d', svg).map(function (g) {
        return { el: g, x: +g.dataset.x, y: +g.dataset.y, s: +g.dataset.s, rank: +g.dataset.rank };
      })
    };
  }
  function baseParts(svg) {
    return {
      svg: svg,
      dark: $('.room-dark', svg), lit: $('.room-lit', svg), tube: $('.tube', svg), unlit: $('.unlit', svg),
      cooks: $$('.cook', svg), ghosts: $('.ghost-cooks', svg), sheen: $('.sheen', svg),
      tubs: $$('.tub', svg).map(function (g) {
        return { fill: $('.tub-fill', g), num: $('.tape-num', g), tick: $('.tick', g), tape: $('.tape', g) };
      })
    };
  }

  function drawShop(P, d, sh, day) {
    var covers = coversAt(d, sh);
    var dOn = sstep(10.4, 10.7, sh) * (1 - sstep(CLOSE[d] + 0.15, CLOSE[d] + 0.45, sh));
    P.lit.setAttribute('opacity', (dOn * (1 - 0.3 * day)).toFixed(3));
    P.dark.style.fill = mix('#1E0F19', '#4A2B36', day);
    P.sheen.setAttribute('opacity', (0.13 + 0.27 * day).toFixed(3));
    for (var i = 0; i < P.diners.length; i++) {
      var dn = P.diners[i];
      var a = clamp(covers - dn.rank, 0, 1);
      if (a <= 0.001) { dn.el.setAttribute('opacity', '0'); continue; }
      // walk in from the door on the right, then sit
      var e = 1 - Math.pow(1 - a, 2);
      var x = lerp(1080, dn.x, e);
      var y = dn.y - (1 - a) * 16 + Math.sin(a * Math.PI * 5) * 4 * (1 - a);
      dn.el.setAttribute('opacity', Math.min(1, a * 2.5).toFixed(3));
      dn.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + dn.s + ')');
    }
    var sv = Math.min(1, covers / 1.5) * dOn;
    P.server.setAttribute('opacity', sv.toFixed(3));
    P.server.setAttribute('transform', 'translate(' + (500 + 300 * Math.sin(sh * 2.6)).toFixed(1) + ' 452) scale(.86)');
    var refl = d === 1 ? sstep(18.2, 19.2, sh) * (1 - sstep(22.4, 23.2, sh)) : 0;
    P.refl.setAttribute('opacity', (refl * 0.62).toFixed(3));
    return { covers: covers, dOn: dOn, refl: refl };
  }

  function drawBase(P, d, sh, day, forceLabels) {
    var kOn = sh < DAWN ? 0 : (1 - sstep(CLOSE[d] + 0.4, CLOSE[d] + 0.7, sh));
    if (sh >= DAWN && sh < DAWN + 0.06) { // a fluorescent tube catching
      var f = (sh - DAWN) / 0.06;
      kOn = f < 0.25 ? 0.8 : f < 0.45 ? 0.1 : f < 0.62 ? 0.9 : f < 0.7 ? 0.3 : 1;
    }
    P.lit.setAttribute('opacity', kOn.toFixed(3));
    P.tube.style.opacity = (0.25 + 0.75 * kOn).toFixed(3);
    P.unlit.setAttribute('opacity', ((1 - kOn) * 0.82).toFixed(3));
    P.dark.style.fill = mix('#1E0F19', '#3A2430', day * 0.6);
    P.sheen.setAttribute('opacity', (0.1 + 0.2 * day).toFixed(3));
    var counts = COUNTS[d];
    var prepped = sstep(6.4, 10.3, sh);
    var used = TOTAL[d] ? cumCovers(d, sh) / TOTAL[d] : 0;
    for (var i = 0; i < P.tubs.length; i++) {
      var T = P.tubs[i];
      var written = forceLabels ? 1 : (sh > CLOSE[d] + 0.6 ? 0 : sstep(DAWN + 0.07 + i * 0.022, DAWN + 0.085 + i * 0.022, sh));
      if (i < 3) T.num.textContent = counts[i];
      T.num.setAttribute('opacity', written.toFixed(3));
      var full = i < 3 ? 1 : 0.5; // the new dish: the chef's own call
      var level = clamp(prepped * full - used * 0.9 * full, 0, 1);
      if (forceLabels) level = 0;
      var h = level * 82;
      T.fill.setAttribute('y', (112 - h).toFixed(1));
      T.fill.setAttribute('height', h.toFixed(1));
      var tick = i < 3 && d === 3 && sh < CLOSE[d] + 0.6 ? sstep(14 + i * 0.3, 14.25 + i * 0.3, sh) : 0;
      T.tick.style.strokeDashoffset = (1 - tick).toFixed(3);
    }
    var cookOn = [sstep(6.2, 6.5, sh) * (1 - sstep(CLOSE[d] - 0.3, CLOSE[d], sh)), sstep(9.3, 9.6, sh) * (1 - sstep(CLOSE[d] - 0.6, CLOSE[d] - 0.3, sh))];
    P.cooks.forEach(function (c, k) {
      var x = k === 0 ? 300 + 46 * Math.sin(sh * 5.1) : 640 + 56 * Math.sin(sh * 4.3 + 1);
      c.setAttribute('opacity', cookOn[k].toFixed(3));
      c.setAttribute('transform', 'translate(' + x.toFixed(1) + ' 232)');
    });
    var g = d === 4 ? sstep(17.6, 18.5, sh) * (1 - sstep(22.6, 23.4, sh)) : 0;
    P.ghosts.setAttribute('opacity', (g * 0.6).toFixed(3));
  }

  function weightFor(covers) { return Math.round(100 + 800 * clamp(covers / SEATS, 0, 1)); }
  function clockText(sh) {
    var c = ((sh % 24) + 24) % 24, hh = Math.floor(c), mm = Math.floor((c - hh) * 6) * 10;
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  /* ---------- the stage ---------- */
  var shop = shopParts($('.scene-shop', stage));
  var base = baseParts($('.scene-base', stage));
  var dayEl = $('.dayname', stage), clockEl = $('.clock', stage);
  var sky = $('.sky', stage), sun = $('.sun', stage), moon = $('.moon', stage);
  var door = $('.door', stage), intro = $('.intro', stage), glass = $('.glass', stage);
  var days = $('.days'), items = $$('.days li');
  var rulerBtns = $$('.ruler button', stage), mark = $('.ruler-mark', stage), track = $('.ruler-track', stage);
  var payoff = $('.payoff', stage), tapeLis = $$('.tapes li', payoff);
  var facade = $('.facade', stage);

  var size = { skyW: 0, skyH: 0, trackW: 0 };
  function measure() {
    size.skyW = sky.clientWidth; size.skyH = sky.clientHeight; size.trackW = track.clientWidth;
    flip = null;
  }

  function paintSky(sh, day) {
    var c = ((sh % 24) + 24) % 24, s = skyAt(c);
    sky.style.setProperty('--sky-top', s[0]);
    sky.style.setProperty('--sky-bot', s[1]);
    stage.style.setProperty('--day', day.toFixed(3));
    var d = Math.max(18, size.skyH * 0.32);
    if (c > 6.1 && c < 19.9) {
      var x = (c - 6.1) / 13.8;
      sun.style.transform = 'translate(' + (x * (size.skyW + d) - d).toFixed(1) + 'px,' + ((1 - Math.sin(Math.PI * x)) * (size.skyH - d * 0.6) + d * 0.15).toFixed(1) + 'px)';
    } else sun.style.transform = 'translate(-300%,0)';
    var mc = (c - 20.2 + 24) % 24;
    if (mc < 9.6) {
      var m = mc / 9.6;
      moon.style.transform = 'translate(' + (m * (size.skyW + d) - d).toFixed(1) + 'px,' + ((1 - Math.sin(Math.PI * m)) * (size.skyH - d * 0.6) + d * 0.2).toFixed(1) + 'px)';
    } else moon.style.transform = 'translate(-300%,0)';
  }

  // Scroll progress to a day and service hour (5:40 one morning to 5:30 the next).
  var CUM = [0]; DAY_W.forEach(function (w, i) { CUM.push(CUM[i] + w); });
  var WSUM = CUM[7];
  function warp(u, d) {
    var s0 = d === 0 ? HERO_SH : 5.5;
    var P = [[0, s0], [0.1, 10], [0.86, 23.6], [1, 29.5]];
    for (var i = 0; i < 3; i++) if (u <= P[i + 1][0]) return lerp(P[i][1], P[i + 1][1], (u - P[i][0]) / (P[i + 1][0] - P[i][0]));
    return 29.5;
  }
  function unwarp(sh, d) {
    var s0 = d === 0 ? HERO_SH : 5.5;
    var P = [[0, s0], [0.1, 10], [0.86, 23.6], [1, 29.5]];
    for (var i = 0; i < 3; i++) if (sh <= P[i + 1][1]) return lerp(P[i][0], P[i + 1][0], (sh - P[i][1]) / (P[i + 1][1] - P[i][1]));
    return 1;
  }
  function timeAt(p) {
    if (p <= HERO_END) return { d: 0, sh: HERO_SH, w: 0 };
    if (p >= WEEK_END) return { d: 0, sh: HERO_SH, w: 1, payoff: (p - WEEK_END) / (1 - WEEK_END) };
    var w = (p - HERO_END) / (WEEK_END - HERO_END), x = w * WSUM, d = 0;
    while (d < 6 && x > CUM[d + 1]) d++;
    var u = (x - CUM[d]) / DAY_W[d];
    return { d: d, sh: warp(u, d), w: w };
  }
  function progressFor(d, sh) {
    var w = (CUM[d] + unwarp(sh, d) * DAY_W[d]) / WSUM;
    return HERO_END + w * (WEEK_END - HERO_END);
  }

  var flip = null;
  function measureFlip() {
    tapeLis.forEach(function (li) { li.style.transform = 'none'; });
    payoff.classList.add('live');
    var to = tapeLis.map(function (li) { return li.getBoundingClientRect(); });
    var from = base.tubs.map(function (t) { return $('.tape-strip', t.tape.parentNode).getBoundingClientRect(); });
    flip = { to: to, from: from };
  }

  var current = -2;
  function render(p, override) {
    var t = override || timeAt(p);
    var d = t.d, sh = t.sh;
    var c = ((sh % 24) + 24) % 24;
    var day = sstep(5.9, 8.2, c) * (1 - sstep(18.4, 20.6, c));
    paintSky(sh, day);
    var s = drawShop(shop, d, sh, day);
    drawBase(base, d, sh, day, false);
    door.style.setProperty('--door-light', mix('#170C14', '#E9A95E', s.dOn));
    dayEl.textContent = DAYS[d];
    stage.style.setProperty('--w', weightFor(s.covers));
    clockEl.textContent = clockText(sh);

    // hero copy is painted on the glass; it goes once the day starts
    var heroOut = sstep(0.004, HERO_END * 0.8, p);
    glass.style.opacity = (1 - heroOut).toFixed(3);
    var idx = p < HERO_END * 0.7 ? -1 : t.payoff !== undefined ? -3 : d;
    if (idx !== current) {
      current = idx;
      intro.classList.toggle('off', idx !== -1);
      items.forEach(function (li, i) { li.classList.toggle('on', i === idx); });
      rulerBtns.forEach(function (b, i) { b.setAttribute('aria-current', i === d && idx >= 0 ? 'true' : 'false'); });
    }
    if (size.trackW) mark.style.setProperty('--mark', (clamp(t.w, 0, 1) * (size.trackW - 8)).toFixed(1));

    // payoff: Monday 5:40 again; the tape labels come off the tubs and become the count
    var z = t.payoff === undefined ? 0 : t.payoff;
    if (z > 0) {
      drawBase(base, 0, HERO_SH, 0, true);
      if (!flip) measureFlip();
      payoff.classList.add('live');
      var k = sstep(0.12, 0.7, z);
      payoff.style.setProperty('--dim', (0.86 * sstep(0.02, 0.45, z)).toFixed(3));
      payoff.style.setProperty('--line', sstep(0.55, 0.85, z).toFixed(3));
      tapeLis.forEach(function (li, i) {
        var a = flip.from[i], b = flip.to[i];
        var kk = sstep(i * 0.06, 0.82 + i * 0.06, k);
        var sx = lerp(a.width / b.width, 1, kk), sy = lerp(a.height / b.height, 1, kk);
        var tx = lerp(a.left - b.left, 0, kk), ty = lerp(a.top - b.top, 0, kk) - Math.sin(kk * Math.PI) * 40;
        li.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
      });
      base.tubs.forEach(function (T) { T.tape.setAttribute('opacity', '0'); });
    } else {
      payoff.classList.remove('live');
      base.tubs.forEach(function (T) { T.tape.setAttribute('opacity', '1'); });
    }
  }

  if (!MOTION) {
    // Reduced motion, or a static view: the hero frame plus a storyboard of the week.
    measure();
    render(0, { d: 0, sh: HERO_SH, w: 0 });
    storyboard();
    return;
  }

  /* ---------- motion ---------- */
  $('.pier', stage).appendChild(days);
  measure();
  var st = { p: 0 };
  var loading = null;
  render(0);

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    var trig = ScrollTrigger.create({
      trigger: '.week', start: 'top top', end: 'bottom bottom',
      onUpdate: function (self) {
        if (loading) { loading.kill(); loading = null; }
        gsap.to(st, { p: self.progress, duration: 0.5, ease: 'power3.out', overwrite: true, onUpdate: function () { render(st.p); } });
      },
      onRefresh: function () { measure(); render(st.p); }
    });

    // The page opens at Monday 4:50: the kitchen light catches, the counts are written on.
    if (window.scrollY < 10) {
      var lh = { sh: 4.9 };
      loading = gsap.timeline({ delay: 0.25, onComplete: function () { loading = null; } })
        .to(lh, { sh: DAWN - 0.005, duration: 0.9, ease: 'power1.inOut' })
        .to(lh, { sh: DAWN + 0.062, duration: 0.75, ease: 'none' })
        .to(lh, { sh: HERO_SH, duration: 0.95, ease: 'power1.out' });
      loading.eventCallback('onUpdate', function () { render(0, { d: 0, sh: lh.sh, w: 0 }); });
      render(0, { d: 0, sh: 4.9, w: 0 });
      gsap.fromTo(glass.querySelector('h1'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power2.inOut', delay: 0.15 });
    } else {
      st.p = trig.progress; render(st.p);
    }

    rulerBtns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var p = progressFor(i, KEY[i]);
        var top = trig.start + p * (trig.end - trig.start);
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }
  window.addEventListener('resize', function () { measure(); render(st.p); });

  /* ---------- storyboard for reduced motion ---------- */
  function storyboard() {
    var shopSrc = $('.scene-shop', stage), baseSrc = $('.scene-base', stage);
    items.forEach(function (li, i) {
      var frame = document.createElement('div');
      frame.className = 'frame';
      frame.setAttribute('aria-hidden', 'true');
      var a = document.createElement('div'); a.className = 'f-shop';
      var b = document.createElement('div'); b.className = 'f-base basement-frame';
      var s1 = shopSrc.cloneNode(true), s2 = baseSrc.cloneNode(true);
      a.appendChild(s1); b.appendChild(s2); frame.appendChild(a); frame.appendChild(b);
      li.insertBefore(frame, li.firstChild);
      var chip = document.createElement('p'); chip.className = 'example-tag'; chip.textContent = 'Example'; b.appendChild(chip);
      var sh = KEY[i], c = sh % 24;
      var day = sstep(5.9, 8.2, c) * (1 - sstep(18.4, 20.6, c));
      var res = drawShop(shopParts(s1), i, sh, day);
      drawBase(baseParts(s2), i, sh, day, false);
      li.style.setProperty('--w', weightFor(res.covers));
      if (i === 0) {
        var tapes = $('.tapes', payoff).cloneNode(true);
        var wrap = document.createElement('div'); wrap.className = 'storytapes';
        var ex = document.createElement('p'); ex.className = 'example-tag'; ex.textContent = 'Example';
        wrap.appendChild(tapes); wrap.appendChild(ex);
        li.appendChild(wrap);
      }
    });
  }

  /* ---------- form ---------- */
  function setupForm(form) {
    var status = $('.status', form), btn = $('button[type="submit"]', form);
    var checks = [
      ['f-name', 'e-name', function (v) { return v.trim().length > 0; }],
      ['f-rest', 'e-rest', function (v) { return v.trim().length > 0; }],
      ['f-email', 'e-email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }]
    ];
    function validate() {
      var first = null;
      checks.forEach(function (c) {
        var input = document.getElementById(c[0]), err = document.getElementById(c[1]);
        var ok = c[2](input.value);
        input.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (ok) { err.hidden = true; input.removeAttribute('aria-describedby'); }
        else { err.hidden = false; input.setAttribute('aria-describedby', c[1]); if (!first) first = input; }
      });
      return first;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad) { bad.focus(); status.textContent = 'A couple of fields need filling in first.'; status.dataset.state = 'err'; return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._honey) { done(); return; }
      btn.disabled = true; btn.textContent = 'Clocking you in…';
      status.dataset.state = 'sending'; status.textContent = 'Sending.';
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        return r.json();
      }).then(function (j) {
        if (j && (j.success === true || j.success === 'true')) done(); else throw new Error('not accepted');
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Put us on the schedule';
        status.dataset.state = 'err';
        status.innerHTML = 'That didn’t go through. Email <a href="mailto:tooeyteam@gmail.com?subject=New%20Tooey%20inquiry">tooeyteam@gmail.com</a> instead and we’ll pick it up.';
      });
    });
    function done() {
      form.reset();
      btn.disabled = false; btn.textContent = 'Put us on the schedule';
      status.dataset.state = 'ok';
      status.textContent = 'You’re on the schedule. A person replies from tooeyteam@gmail.com.';
    }
  }
})();
