(function () {
  'use strict';

  /* ---------- phone menu ---------- */
  var menu = document.querySelector('.menu');
  var nav = document.getElementById('nav');
  if (menu && nav) {
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menu.setAttribute('aria-expanded', 'false');
        menu.textContent = 'Menu';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menu.setAttribute('aria-expanded', 'false');
        menu.textContent = 'Menu';
        menu.focus();
      }
    });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('join');
  if (form && window.fetch) {
    var status = form.querySelector('.status');
    var button = form.querySelector('button[type="submit"]');
    var required = ['name', 'restaurant', 'email'];
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      var missing = [];
      required.forEach(function (k) {
        var input = form.elements[k];
        var bad = !data[k] || (k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[k]));
        input.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) missing.push(input);
      });
      status.classList.remove('is-bad');
      if (missing.length) {
        status.classList.add('is-bad');
        status.textContent = 'Add your name, restaurant and a working email, then send again.';
        missing[0].focus();
        return;
      }
      if (data._honey) return;
      button.disabled = true;
      button.textContent = 'Sending…';
      status.textContent = '';
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        return r.json();
      }).then(function (j) {
        if (j && (j.success === true || j.success === 'true')) {
          form.reset();
          button.textContent = 'Sent';
          status.textContent = 'Sent. We’ll reply from tooeyteam@gmail.com, usually within a day or two.';
        } else { throw new Error('not accepted'); }
      }).catch(function () {
        button.disabled = false;
        button.textContent = 'Send';
        status.classList.add('is-bad');
        var body = encodeURIComponent('Name: ' + data.name + '\nRestaurant: ' + data.restaurant + '\nPhone: ' + (data.phone || '') + '\nPOS: ' + (data.pos || '') + '\n\n' + (data.message || ''));
        status.innerHTML = 'That didn’t send. Email us instead at <a href="mailto:tooeyteam@gmail.com?subject=New%20Tooey%20inquiry&amp;body=' + body + '">tooeyteam@gmail.com</a> and your details will be in the draft.';
      });
    });
  }

  /* ---------- drawings ---------- */
  var stageWrap = document.querySelector('.stage-wrap');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  function ready() { if (stageWrap) stageWrap.classList.add('ready'); }
  if (!gsap || reduce || !document.querySelector('.art')) { ready(); return; }

  var $ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // a pen stroke: hide, then draw
  function penSet(els) { gsap.set(els, { strokeDasharray: '1 1', strokeDashoffset: 1 }); }
  function pen(tl, els, at, dur, stagger) {
    tl.to(els, { strokeDashoffset: 0, duration: dur || 0.3, ease: 'power1.inOut', stagger: stagger || 0 }, at);
  }
  // marker writing of a word: wipe left to right at pen speed
  function wipeSet(els) { gsap.set(els, { clipPath: 'inset(-40% 100% -40% -5%)' }); }
  function wipe(tl, els, at, dur) {
    tl.to(els, { clipPath: 'inset(-40% -5% -40% -5%)', duration: dur || 0.45, ease: 'none' }, at);
  }
  function slosh(tl, surface, at, amt) {
    tl.fromTo(surface, { rotation: amt || -6, svgOrigin: surfaceOrigin(surface) },
      { rotation: 0, duration: 1.3, ease: 'elastic.out(1, 0.32)' }, at);
  }
  function surfaceOrigin(el) {
    return el.getAttribute('cx') + ' ' + el.getAttribute('cy');
  }

  /* line boil: the ink is redrawn a few times a second while on screen */
  var seeds = [3, 11, 23];
  function boil(filterId, watchEls) {
    var turb = document.querySelector('#' + filterId + ' feTurbulence');
    if (!turb || !watchEls.length) return;
    var visible = 0, i = 0, timer = null;
    function tick() { i = (i + 1) % seeds.length; turb.setAttribute('seed', seeds[i]); }
    function update() {
      var on = visible > 0 && !document.hidden;
      if (on && !timer) timer = setInterval(tick, 160);
      if (!on && timer) { clearInterval(timer); timer = null; }
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible += en.isIntersecting ? 1 : (en.target._seen ? -1 : 0); en.target._seen = en.isIntersecting; });
      visible = Math.max(0, visible);
      update();
    });
    watchEls.forEach(function (el) { io.observe(el); });
    document.addEventListener('visibilitychange', update);
  }

  function onEnter(el, fn, threshold) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); fn(); }
      });
    }, { threshold: threshold || 0.35 });
    io.observe(el);
  }

  /* ---------- hero: tickets on the spike, night to morning, quarts labelled and filled ---------- */
  var narrow = window.matchMedia('(max-width: 900px)').matches;
  var stage = document.querySelector(narrow ? '.stage--narrow' : '.stage--wide');
  if (stage) {
    var tickets = $('.ticket', stage);
    var moon = stage.querySelector('.moon');
    var sun = stage.querySelector('.sun');
    var rays = $('.ray', stage);
    var counters = $('.counter', stage);
    var quarts = $('.quart', stage);
    var ex = $('.ex', stage);

    penSet(counters.concat(rays));
    gsap.set(tickets, { y: -340, opacity: 0 });
    gsap.set(sun, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
    gsap.set(ex, { opacity: 0 });
    quarts.forEach(function (q) {
      wipeSet($('.write text, .note text', q));
      penSet($('.tape .pen', q));
      var fill = q.querySelector('.fill');
      if (fill) gsap.set(fill, { y: parseFloat(fill.getAttribute('data-level')) + 14 });
    });
    ready();

    var tl = gsap.timeline({ delay: 0.25 });
    pen(tl, counters, 0, 0.5);
    tickets.forEach(function (t, i) {
      var at = 0.35 + i * 0.17;
      tl.to(t, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.in' }, at);
      tl.fromTo(t, { scaleY: 1 }, { scaleY: 0.88, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: '50% 100%', ease: 'power1.out' }, at + 0.3);
    });
    // the night's tickets get read
    tl.to(tickets, { rotation: '+=5', duration: 0.09, yoyo: true, repeat: 1, stagger: 0.06, ease: 'sine.inOut', transformOrigin: '50% 40%' }, 1.35);
    tl.to(moon, { opacity: 0, y: 26, rotation: -25, transformOrigin: '50% 50%', duration: 0.45, ease: 'power2.in' }, 1.4);
    tl.to(sun, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2.2)' }, 1.7);
    pen(tl, rays, 1.9, 0.18, 0.04);

    var t0 = 2.15;
    quarts.forEach(function (q, i) {
      var at = t0 + i * 0.62;
      var name = $('.write text', q);
      var digits = $('.tape .pen', q);
      var fill = q.querySelector('.fill');
      var note = $('.note text', q);
      wipe(tl, name, at, 0.32);
      pen(tl, digits, at + 0.3, 0.2, 0.17);
      if (fill) {
        tl.to(fill, { y: 0, duration: 0.85, ease: 'power2.out' }, at + 0.4);
        slosh(tl, fill.querySelector('.surface'), at + 1.05, i % 2 ? 7 : -7);
      }
      if (note.length) wipe(tl, note, at + 0.62, 0.5);
    });
    tl.to(ex, { opacity: 1, duration: 0.6 }, '>-0.2');

    // a nudge from the cursor sloshes a quart
    quarts.forEach(function (q, i) {
      var busy = false;
      q.addEventListener('pointerenter', function () {
        if (busy || tl.isActive()) return;
        busy = true;
        var s = q.querySelector('.surface');
        var t = gsap.timeline({ onComplete: function () { busy = false; } });
        t.to(q, { rotation: i % 2 ? -3 : 3, transformOrigin: '50% 100%', duration: 0.22, ease: 'power2.out' })
          .to(q, { rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        if (s) slosh(t, s, 0.1, i % 2 ? 9 : -9);
      });
    });
    boil('boil-h', [stage]);
  } else { ready(); }

  /* ---------- prep: fill to what we expect, top up to what to make ---------- */
  var prepArt = document.querySelector('.prep-art');
  if (prepArt) {
    var pq = prepArt.querySelector('#pq');
    var pFill = pq.querySelector('.fill');
    var cushion = pq.querySelector('.cushion');
    var pName = $('.write text', pq);
    var pDigits = $('.tape .pen', pq);
    var lvlExp = prepArt.querySelector('.lvl-exp');
    var lvlMake = prepArt.querySelector('.lvl-make');
    var labExp = $('.lab-exp text', prepArt);
    var labMake = $('.lab-make text', prepArt);
    var ps = prepArt.querySelector('#ps');
    var sName = $('.write text', ps);
    var sDash = $('.tape .pen', ps);
    var pEx = $('.ex', prepArt);

    wipeSet(pName.concat(labExp, labMake, sName));
    penSet(pDigits.concat([lvlExp, lvlMake], sDash));
    gsap.set(pFill, { y: parseFloat(pFill.getAttribute('data-level')) + 14 });
    gsap.set(cushion, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(pEx, { opacity: 0 });

    onEnter(prepArt, function () {
      var tl = gsap.timeline();
      wipe(tl, pName, 0, 0.4);
      pen(tl, pDigits, 0.38, 0.22, 0.2);
      tl.to(pFill, { y: 0, duration: 1.3, ease: 'power2.out' }, 0.5);
      slosh(tl, pFill.querySelector('.surface'), 1.6, -6);
      pen(tl, lvlExp, 1.75, 0.45);
      wipe(tl, labExp, 2.05, 0.5);
      // a little over: the cushion goes on top
      tl.to(cushion, { scaleY: 1, duration: 0.75, ease: 'power2.out' }, 2.9);
      slosh(tl, cushion.querySelector('.surface'), 3.5, 5);
      pen(tl, lvlMake, 3.6, 0.45);
      wipe(tl, labMake, 3.9, 0.45);
      wipe(tl, sName, 4.4, 0.4);
      pen(tl, sDash, 4.85, 0.3);
      tl.to(pEx, { opacity: 1, duration: 0.5 }, 5);
    });
    boil('boil-p', [prepArt]);
  }

  /* ---------- the plans pinned up: inked, not coloured in ---------- */
  var sh = document.querySelector('.sheet[aria-labelledby="sh-t"]');
  if (sh) {
    var hill = sh.querySelector('.hill');
    var shPens = $('.art > .pen', sh).filter(function (p) { return p !== hill; });
    var bars = $('.bar', sh);
    penSet([hill].concat(shPens));
    gsap.set(bars, { opacity: 0, scale: 1.3, rotation: function (i) { return i % 2 ? 6 : -5; } });
    onEnter(sh, function () {
      var tl = gsap.timeline();
      pen(tl, shPens, 0, 0.4);
      pen(tl, hill, 0.3, 1.3);
      bars.forEach(function (b, i) {
        tl.to(b, { opacity: 1, scale: 1, rotation: 0, duration: 0.42, ease: 'back.out(2.6)' }, 1.2 + i * 0.22);
      });
    });
    boil('boil-sh', [sh]);
  }

  var gr = document.querySelector('.sheet[aria-labelledby="gr-t"]');
  if (gr) {
    var plates = $('.plate--new', gr);
    var loop = gr.querySelector('.loop');
    var back = $('.back text', gr);
    gsap.set(plates, { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' });
    penSet(loop);
    wipeSet(back);
    onEnter(gr, function () {
      var tl = gsap.timeline({ delay: 0.3 });
      plates.forEach(function (p) {
        var step = parseInt(p.getAttribute('data-step'), 10);
        tl.to(p, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, 0.2 + step * 0.32 + Math.random() * 0.12);
      });
      pen(tl, loop, '>+0.2', 0.7);
      wipe(tl, back, '>-0.1', 0.55);
    });
    boil('boil-gr', [gr]);
  }
})();
