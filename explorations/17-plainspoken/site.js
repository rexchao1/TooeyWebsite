(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Phone nav ---------- */
  var menuBtn = $('.menu-btn');
  var nav = $('#site-nav');
  if (menuBtn && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
    };
    menuBtn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); menuBtn.focus(); }
    });
  }

  /* ---------- Contact form ---------- */
  var form = $('#pilot-form');
  if (form) {
    var status = $('.status', form);
    var button = $('button[type="submit"]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      status.className = 'status';
      if (data._honey) { status.textContent = 'Sent. We’ll reply by email.'; status.classList.add('ok'); form.reset(); return; }
      status.textContent = 'Sending…';
      button.disabled = true;
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || String(j.success) !== 'true') throw new Error('not sent');
        });
      }).then(function () {
        status.textContent = 'Sent. We’ll reply by email.';
        status.classList.add('ok');
        form.reset();
      }).catch(function () {
        var body = 'Name: ' + (data.name || '') + '\nRestaurant: ' + (data.restaurant || '') + '\nEmail: ' + (data.email || '') +
          '\nPhone: ' + (data.phone || '') + '\nPOS: ' + (data.pos || '') + '\n\n' + (data.message || '');
        var href = 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') + '&body=' + encodeURIComponent(body);
        status.innerHTML = 'That didn’t send. Email us at <a href="' + href + '">tooeyteam@gmail.com</a> instead.';
        status.classList.add('err');
      }).then(function () { button.disabled = false; });
    });
  }

  /* ---------- Motion ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  if (reduce || !gsap) { root.classList.remove('pre'); return; }

  var DIG = '0123456789';
  var FIG_SPACE = ' ';

  function seq(a, b, dir, spin) {
    if (DIG.indexOf(a) > -1 && DIG.indexOf(b) > -1) {
      var out = [a], i = +a;
      var steps = (dir > 0 ? (+b - i + 10) % 10 : (i - +b + 10) % 10) + (spin ? 10 : 0);
      for (var s = 0; s < steps; s++) { i = (i + dir + 10) % 10; out.push(String(i)); }
      return out;
    }
    return a === b ? [a] : [a, b];
  }

  // Odometer: rolls each digit of `from` into the matching digit of `to`.
  function odometer(el, from, to, opts) {
    opts = opts || {};
    var n = Math.max(from.length, to.length);
    from = from.padStart(n, ' ');
    to = to.padStart(n, ' ');
    var a = parseInt(from, 10), b = parseInt(to, 10);
    var dir = (isNaN(a) || isNaN(b) || b >= a) ? 1 : -1;
    el.textContent = '';
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = to.trim();
    var wrap = document.createElement('span');
    wrap.className = 'odo';
    wrap.setAttribute('aria-hidden', 'true');
    var strips = [];
    for (var i = 0; i < n; i++) {
      var list = seq(from[i], to[i], dir, opts.spin && i === n - 1 && from[i] !== ' ');
      if (dir < 0) list = list.slice().reverse();
      var col = document.createElement('span'); col.className = 'odo-col';
      var strip = document.createElement('span'); strip.className = 'odo-strip';
      list.forEach(function (ch) {
        var c = document.createElement('span');
        c.textContent = ch === ' ' ? FIG_SPACE : ch;
        strip.appendChild(c);
      });
      col.appendChild(strip); wrap.appendChild(col);
      strips.push({ el: strip, len: list.length, dir: dir });
    }
    el.appendChild(sr); el.appendChild(wrap);
    strips.forEach(function (s) {
      var end = -(s.len - 1) / s.len * 100;
      gsap.set(s.el, { yPercent: s.dir > 0 ? 0 : end });
    });
    return {
      tween: function (duration, ease) {
        var tl = gsap.timeline();
        strips.forEach(function (s, k) {
          var end = -(s.len - 1) / s.len * 100;
          tl.to(s.el, { yPercent: s.dir > 0 ? end : 0, duration: duration, ease: ease || 'power3.inOut' }, k * 0.04);
        });
        return tl;
      },
      done: function () { el.textContent = to.trim(); }
    };
  }

  function wrapText(el) {
    if (el.querySelector('.tx')) return el.querySelector('.tx');
    var s = document.createElement('span');
    s.className = 'tx';
    s.style.display = 'inline-block';
    while (el.firstChild) s.appendChild(el.firstChild);
    el.appendChild(s);
    return s;
  }

  function splitChars(el) {
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    return text.split('').map(function (ch) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(s);
      return s;
    });
  }

  var replayIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v5h5"/></svg>';
  function addReplay(host, fn) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'replay';
    b.setAttribute('aria-label', 'Replay');
    b.innerHTML = replayIcon;
    b.addEventListener('click', fn);
    host.appendChild(b);
    return b;
  }

  var LEDGER = '#63686b', INK = '#000000', TEAL = '#00766d';

  /* Hero: Monday's sales become Tuesday's prep count */
  function makeHero() {
    var fig = $('#fig-hero');
    if (!fig) return null;
    var sRows = $$('.sales tbody tr', fig);
    var pRows = $$('.prep tbody tr', fig);
    var data = pRows.map(function (tr, i) {
      var sName = wrapText($('th', sRows[i]));
      var sNum = wrapText($('td', sRows[i]));
      var pName = $('.nm', tr);
      var pred = $('td.pred', tr);
      var pp = $('td.pp', tr);
      var why = $('.why', tr);
      return {
        sName: sName, sNum: sNum, sVal: sNum.textContent.trim(),
        pName: pName, pred: pred, predFinal: pred.textContent.trim(), predFrom: pred.getAttribute('data-from'),
        pp: pp, ppFinal: pp.textContent.trim(), why: why, whyText: why ? why.textContent : ''
      };
    });
    var btn = addReplay($('.fig-foot', fig), function () { play(); });
    var tl;

    function reset() {
      if (tl) tl.kill();
      data.forEach(function (d) {
        gsap.set([d.sName, d.sNum, d.pName, d.pred, d.pp], { clearProps: 'all' });
        d.sNum.textContent = d.sVal;
        d.pred.textContent = d.predFinal;
        d.pp.textContent = d.ppFinal;
        if (d.why) { d.why.textContent = d.whyText; gsap.set(d.why, { clearProps: 'all' }); }
      });
    }

    function play() {
      reset();
      btn.classList.remove('on');
      tl = gsap.timeline({ onComplete: function () { finish(); } });

      data.forEach(function (d, i) {
        // measure where the prep text sits against the sales text
        var sn = d.sName.getBoundingClientRect(), pn = d.pName.getBoundingClientRect();
        var sNumR = d.sNum.getBoundingClientRect();
        var predTx = wrapText(d.pred);
        var pr = predTx.getBoundingClientRect();
        var nameScale = parseFloat(getComputedStyle(d.sName).fontSize) / parseFloat(getComputedStyle(d.pName).fontSize);
        var numScale = parseFloat(getComputedStyle(d.sNum).fontSize) / parseFloat(getComputedStyle(d.pred).fontSize);

        // the predicted figure starts life as the sold figure
        var odo = odometer(predTx, d.predFrom, d.predFinal, { spin: d.predFinal !== '—' });
        var ppOdo = d.ppFinal ? odometer(d.pp, d.ppFinal.replace(/\d/g, '0'), d.ppFinal, { spin: true }) : null;
        d.odo = odo; d.ppOdo = ppOdo;

        gsap.set(d.pName, { x: sn.left - pn.left, y: sn.bottom - pn.bottom, scale: nameScale, transformOrigin: '0% 100%', color: LEDGER, fontWeight: 400, autoAlpha: 0 });
        gsap.set(predTx, { x: sNumR.right - pr.right, y: sNumR.bottom - pr.bottom, scale: numScale, transformOrigin: '100% 100%', color: LEDGER, autoAlpha: 0 });
        gsap.set(d.pp, { autoAlpha: 0 });
        if (d.why) { d.whyChars = splitChars(d.why); gsap.set(d.whyChars, { autoAlpha: 0 }); }

        // 1. the night's tally
        var counter = { v: 0 };
        d.sNum.textContent = '0';
        tl.to(counter, {
          v: +d.sVal, duration: 0.8, ease: 'power2.out',
          onUpdate: function () { d.sNum.textContent = String(Math.round(counter.v)); }
        }, 0.15 + i * 0.12);

        // 2. lift the row off the sales sheet and carry it across
        var t = 1.0 + i * 0.11;
        tl.set([d.sName, d.sNum], { autoAlpha: 0 }, t);
        tl.set([d.pName, predTx], { autoAlpha: 1 }, t);
        tl.to(d.pName, { x: 0, y: 0, scale: 1, color: INK, fontWeight: 700, duration: 0.75, ease: 'power3.inOut' }, t);
        tl.to(predTx, { x: 0, y: 0, scale: 1, color: d.predFinal === '—' ? LEDGER : INK, duration: 0.75, ease: 'power3.inOut' }, t);
        tl.add(odo.tween(0.8, 'power2.inOut'), t + 0.05);
        // the record stays behind
        tl.to([d.sName, d.sNum], { autoAlpha: 1, duration: 0.5, ease: 'none' }, t + 0.6);

        // 3. prep, a little over
        if (ppOdo) {
          var tp = 1.75 + i * 0.11;
          tl.set(d.pp, { autoAlpha: 1 }, tp);
          tl.add(ppOdo.tween(0.6, 'power3.out'), tp);
        }
        // 4. too new to call
        if (d.whyChars) {
          tl.to(d.whyChars, { autoAlpha: 1, duration: 0.01, stagger: 0.035 }, 2.3);
        }
      });
      root.classList.remove('pre');
    }

    function finish() {
      data.forEach(function (d) {
        if (d.odo) d.odo.done();
        if (d.ppOdo) d.ppOdo.done();
        if (d.why) d.why.textContent = d.whyText;
        if (d.why) d.why.removeAttribute('aria-label');
        gsap.set([d.pName, d.pred, d.pp, d.sName, d.sNum], { clearProps: 'all' });
      });
      btn.classList.add('on');
    }

    return play;
  }

  /* Prep: the call comes from past Tuesdays, prep sits a little over */
  function makePrep() {
    var fig = $('#fig-prep');
    if (!fig) return null;
    var past = $$('.past-nums > span', fig);
    var pastVals = past.map(function (s) { return s.textContent; });
    var pred = $('.c-pred', fig), prep = $('.c-prep', fig);
    var prepLabel = $('.call-label.t-prep', fig);
    var predFinal = pred.textContent, prepFinal = prep.textContent;
    var btn = addReplay(fig, function () { play(); });
    var tl, clones = [];

    function reset() {
      if (tl) tl.kill();
      clones.forEach(function (c) { c.remove(); }); clones = [];
      past.forEach(function (s, i) { s.textContent = pastVals[i]; });
      pred.textContent = predFinal; prep.textContent = prepFinal;
      gsap.set(past.concat([pred, prep, prepLabel]), { clearProps: 'all' });
    }

    function play() {
      reset();
      btn.classList.remove('on');
      prime();
      tl = gsap.timeline({ onComplete: finish });
      var big = parseFloat(getComputedStyle(pred).fontSize);

      // 1. the last five Tuesdays come in
      past.forEach(function (s, i) {
        var o = odometer(s, '00', pastVals[i]);
        tl.set(s, { autoAlpha: 1 }, 0.1 + i * 0.12);
        tl.add(o.tween(0.45, 'power2.out'), 0.1 + i * 0.12);
        tl.call(o.done, null, 0.6 + i * 0.12);
      });

      // 2. each one is carried down into the call; the call keeps a running average
      var sum = 0, shown = null;
      past.forEach(function (s, i) {
        var t = 1.05 + i * 0.24;
        tl.call(function () {
          var r = s.getBoundingClientRect();
          var b = fig.getBoundingClientRect();
          var c = document.createElement('span');
          c.className = 'flyer';
          c.setAttribute('aria-hidden', 'true');
          c.textContent = pastVals[i];
          var cs = getComputedStyle(s);
          c.style.cssText = 'position:absolute;left:' + (r.left - b.left) + 'px;top:' + (r.top - b.top) + 'px;font-size:' + cs.fontSize + ';line-height:1;color:' + LEDGER + ';pointer-events:none;transform-origin:0 0;';
          fig.appendChild(c);
          clones.push(c);
          var pr = pred.getBoundingClientRect();
          gsap.to(s, { autoAlpha: 0.35, duration: 0.2 });
          gsap.to(c, {
            x: pr.left - r.left, y: pr.top - r.top, scale: big / parseFloat(cs.fontSize) * 0.9,
            color: INK, autoAlpha: 0.0, duration: 0.5, ease: 'power2.in',
            onComplete: function () {
              c.remove();
              sum += +pastVals[i];
              var avg = String(Math.round(sum / (i + 1)));
              gsap.set(pred, { autoAlpha: 1 });
              if (shown === null) { pred.textContent = avg; }
              else if (shown !== avg) { var o = odometer(pred, shown, avg); o.tween(0.22, 'power2.out').eventCallback('onComplete', o.done); }
              shown = avg;
            }
          });
        }, null, t);
      });

      // 3. prep slides out from behind the call and counts a little over
      var tp = 1.05 + 4 * 0.24 + 0.75;
      tl.call(function () {
        pred.textContent = predFinal;
        var a = pred.getBoundingClientRect(), b = prep.getBoundingClientRect();
        var o = odometer(prep, predFinal, prepFinal);
        gsap.set(prep, { x: a.left - b.left, color: INK, fontWeight: 400, autoAlpha: 0 });
        var t2 = gsap.timeline();
        t2.to(prep, { autoAlpha: 1, duration: 0.25, ease: 'none' }, 0.1);
        t2.to(prep, { x: 0, color: TEAL, fontWeight: 800, duration: 0.9, ease: 'power3.inOut' }, 0);
        t2.add(o.tween(0.8, 'power2.inOut'), 0.15);
        t2.to(prepLabel, { autoAlpha: 1, duration: 0.3 }, 0.6);
        t2.call(o.done);
        tl.add(t2, tl.time());
      }, null, tp);
      tl.to(past, { autoAlpha: 1, duration: 0.4 }, tp + 1.1);
      tl.to({}, { duration: 0.1 }, tp + 1.5);
    }

    function prime() {
      gsap.set(past, { autoAlpha: 0 });
      gsap.set(pred, { autoAlpha: 0 });
      gsap.set([prep, prepLabel], { autoAlpha: 0 });
    }
    function finish() {
      reset();
      btn.classList.add('on');
    }
    prime();
    return play;
  }

  /* Shifts: people on, by hour, swelling with the night */
  function makeShifts() {
    var fig = $('#fig-shifts');
    if (!fig) return null;
    var cells = $$('.crew .n', fig);
    var finals = cells.map(function (c) { return c.textContent; });
    var btn = addReplay(fig, function () { play(); });
    var tl;
    function reset() {
      if (tl) tl.kill();
      cells.forEach(function (c, i) { c.textContent = finals[i]; });
      gsap.set(cells, { clearProps: 'fontWeight,transform,scale' });
    }
    function play() {
      reset();
      btn.classList.remove('on');
      prime();
      tl = gsap.timeline({ onComplete: function () { reset(); btn.classList.add('on'); } });
      cells.forEach(function (c, i) {
        var k = +finals[i];
        var o = odometer(c, '4', finals[i]);
        var t = 0.5 + i * 0.13;
        tl.add(o.tween(0.55, 'power2.inOut'), t);
        tl.to(c, { fontWeight: 200 + (k - 1) * 100, scale: 0.6 + (k - 1) * 0.2, duration: 0.8, ease: 'power3.inOut' }, t);
        tl.call(o.done, null, t + 0.8);
      });
    }
    // everyone on all night: the same figure in every hour
    function prime() {
      gsap.set(cells, { fontWeight: 500, scale: 1.2, transformOrigin: '50% 100%' });
      cells.forEach(function (c) { c.textContent = '4'; });
    }
    prime();
    return play;
  }

  /* Growth: a week of nights; Tuesday fills, letter by letter */
  function makeGrowth() {
    var fig = $('#fig-growth');
    if (!fig) return null;
    var days = $$('.week li', fig);
    var tue = $('.week .tue', fig);
    var chars = splitChars(tue);
    var btn = addReplay(fig, function () { play(); });
    var tl;
    function reset() {
      if (tl) tl.kill();
      gsap.set(days.concat(chars), { clearProps: 'fontWeight' });
    }
    function play() {
      reset();
      btn.classList.remove('on');
      prime();
      tl = gsap.timeline({ onComplete: function () { reset(); btn.classList.add('on'); } });
      days.forEach(function (d, i) {
        if (d === tue) return;
        var w = +getComputedStyle(d).getPropertyValue('--w');
        tl.to(d, { fontWeight: w, duration: 0.7, ease: 'power2.out' }, 0.2 + i * 0.09);
      });
      tl.set(tue, { fontWeight: 760 }, 1.3);
      tl.to(chars, { fontWeight: 760, duration: 0.55, ease: 'power2.inOut', stagger: 0.14 }, 1.3);
      tl.to({}, { duration: 0.2 });
    }
    function prime() { gsap.set(days.concat(chars), { fontWeight: 200 }); }
    prime();
    return play;
  }

  /* Getting started: prep against what sold */
  function makeCheck() {
    var fig = $('#fig-check');
    if (!fig) return null;
    var sold = $('.c-sold', fig);
    var final = sold.textContent;
    var btn = addReplay(fig, function () { play(); });
    var tl;
    function reset() { if (tl) tl.kill(); sold.textContent = final; gsap.set(sold, { clearProps: 'all' }); }
    function play() {
      reset();
      btn.classList.remove('on');
      prime();
      var c = { v: 0 };
      tl = gsap.timeline({ onComplete: function () { reset(); btn.classList.add('on'); } });
      tl.to(c, { v: +final, duration: 2.2, ease: 'power1.inOut', onUpdate: function () { sold.textContent = String(Math.round(c.v)); } }, 0.3);
      tl.to(sold, { color: INK, duration: 0.4 }, 2.3);
    }
    function prime() { sold.textContent = '0'; gsap.set(sold, { color: LEDGER }); }
    prime();
    return play;
  }

  function onView(el, fn) {
    if (!el || !fn) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); fn(); }
      });
    }, { threshold: 0.45 });
    io.observe(el);
  }

  function start() {
    var hero = makeHero();
    if (hero) hero(); else root.classList.remove('pre');
    onView($('#fig-prep'), makePrep());
    onView($('#fig-shifts'), makeShifts());
    onView($('#fig-growth'), makeGrowth());
    onView($('#fig-check'), makeCheck());
  }

  var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(start);
})();
