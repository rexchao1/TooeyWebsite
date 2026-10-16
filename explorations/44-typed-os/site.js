/* Tooey, exploration 44: 35 with the headline typed out on load.
   Exploration 35: the operating system (site 34, revised).
   Draws the rooms, then lights them: the street on load, and, with a mouse,
   the pointer as a lamp. Prep, shifts and growth share one pinned section
   that steps through the three as the page scrolls. When scrolling stops
   between two resting places, the page eases to the nearer one. Then the
   dialog and the form inside it. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var params = new URLSearchParams(location.search);
  var hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // the lamp needs a mouse; touch, keyboard and reduced motion get the rooms lit
  var canLamp = motion && hover && !params.has('lit');
  var lampMode = canLamp;
  if (lampMode) root.classList.add('lamp');

  form();
  dialog();
  snapping();
  if (!window.TooeyScenes) return;
  var S = window.TooeyScenes;

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------- draw ---------- */
  var scenes = [].map.call(document.querySelectorAll('.scene[data-scene]'), function (fig) {
    var D = S[fig.getAttribute('data-scene')]();
    var art = fig.querySelector('.art');
    art.innerHTML = D.svg('base') + D.svg('full full-all') +
      '<div class="spot">' + D.svg('full') + '</div>' + D.actorSvg() +
      '<div class="washes">' + D.washHtml() + '<i class="lampwash"></i></div>';
    return {
      fig: fig, art: art, D: D,
      spot: art.querySelector('.spot'), spotSvg: art.querySelector('.spot .layer'),
      lampwash: art.querySelector('.lampwash'), all: art.querySelector('.full-all'),
      hero: fig.classList.contains('scene-hero'),
      step: fig.hasAttribute('data-step') ? +fig.getAttribute('data-step') : -1,
      x: 0, y: 0, on: false, w: 0, h: 0, ready: !fig.classList.contains('scene-hero')
    };
  });
  var hero = scenes.filter(function (s) { return s.hero; })[0];

  function size() {
    scenes.forEach(function (s) {
      var r = s.art.getBoundingClientRect();
      s.w = r.width; s.h = r.height;
      s.spotSvg.style.width = r.width + 'px';
      s.spotSvg.style.height = r.height + 'px';
    });
  }
  size();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); request(); }, 120); });

  /* ---------- each room plays once as it comes into view ---------- */
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (pinned && e.target.hasAttribute('data-step')) return; // the stepper plays these
        e.target.classList.add('play'); io.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    scenes.forEach(function (s) { if (!s.hero) io.observe(s.fig); });
  } else {
    scenes.forEach(function (s) { s.fig.classList.add('play'); });
  }

  // the street lights up on load, then the lamp takes over
  if (hero) {
    var start = function () {
      heroText();
      hero.fig.classList.add('play');
      if (lampMode) {
        hero.all.style.transition = 'opacity 2.2s ease .5s';
        hero.all.style.opacity = '1';
        setTimeout(function () {
          hero.all.style.transition = 'opacity 1.6s ease';
          hero.all.style.opacity = '';
          hero.ready = true;
          request();
        }, 3300);
      }
    };
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 600); })]).then(function () { requestAnimationFrame(start); });
  }

  /* ---------- the headline, typed out as on a screen ----------
     A block cursor waits, the headline types at an uneven hand, the line
     under it a little faster, then the cursor blinks a moment and goes. */
  function heroText() {
    var copy = document.querySelector('.hero-copy');
    root.classList.remove('hero-wait');
    if (!copy || !motion) return;
    var h1 = copy.querySelector('h1'), lead = copy.querySelector('.lead');
    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    // an aria-hidden copy of the words, one span per letter, over the real ones
    function dup(el) {
      var d = document.createElement('span');
      d.className = 'fx-dup';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML = el.textContent.replace(/\s+/g, ' ').trim().split('').map(function (c) {
        return '<span class="ch">' + escapeHtml(c) + '</span>';
      }).join('');
      el.appendChild(d);
      return [].slice.call(d.children);
    }
    var hc = dup(h1), lc = dup(lead), R = rnd(11);

    // when each letter lands: uneven keys, a beat at each space and a
    // longer one at a stop, now and then a quick run of two or three
    function plan(chars, total, t0) {
      var run = 0;
      var w = chars.map(function (c) {
        var t = c.textContent, v = 0.55 + R() * 0.9;
        if (run > 0) { run--; v *= 0.45; } else if (R() < 0.12) run = 1 + (R() * 2 | 0);
        return v * (t === ' ' ? 1.8 : /[.,]/.test(t) ? 2.6 : 1);
      });
      var sum = w.reduce(function (a, b) { return a + b; }, 0), acc = t0;
      return w.map(function (v) { acc += v / sum * total; return acc; });
    }
    var H0 = 520, HT = 1350, L0 = H0 + HT + 380, LT = 950;
    var th = plan(hc, HT, H0), tl = plan(lc, LT, L0);
    var cur = null, hi = 0, li = 0, t0 = performance.now();
    function caret(el, pre) {
      if (cur) cur.classList.remove('cur', 'pre');
      cur = el;
      if (el) el.classList.add(pre ? 'pre' : 'cur');
    }
    copy.classList.add('fx-run', 'fx-idle');
    caret(hc[0], true);
    (function tick(now) {
      var t = now - t0;
      while (hi < hc.length && th[hi] <= t) hc[hi++].classList.add('on');
      while (li < lc.length && tl[li] <= t) lc[li++].classList.add('on');
      if (li > 0) caret(lc[li - 1]);
      else if (hi === hc.length && t >= L0 - 140) caret(lc[0], true);
      else if (hi > 0) caret(hc[hi - 1]);
      // the cursor blinks only while it waits
      copy.classList.toggle('fx-idle', t < H0 || (hi === hc.length && li === 0) || li === lc.length);
      if (li < lc.length) { requestAnimationFrame(tick); return; }
      later(function () { copy.classList.add('fx-btn'); }, 120);
      later(function () { copy.classList.add('fx-gone'); }, 2100);
      later(function () {
        [].forEach.call(copy.querySelectorAll('.fx-dup'), function (d) { d.parentNode.removeChild(d); });
        copy.className = 'hero-copy';
      }, 2500);
    })(t0);
  }
  function rnd(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* ---------- what it does: one pinned section, three steps ---------- */
  var work = document.querySelector('.work');
  var head = document.querySelector('.top');
  var workFigs = work ? [].slice.call(work.querySelectorAll('.scene[data-step]')) : [];
  var workItems = work ? [].slice.call(work.querySelectorAll('.work-item')) : [];
  var pinQuery = window.matchMedia('(min-width: 761px) and (min-height: 560px)');
  var pinned = false, active = -1, playing = -1, STEPS = workItems.length;

  function headH() { return head ? head.offsetHeight : 0; }

  // the step buttons exist only while the section is pinned
  function setPinned(on) {
    on = !!(on && work && motion);
    if (on === pinned) return;
    pinned = on;
    work.classList.toggle('is-pinned', on);
    workItems.forEach(function (li, i) {
      var h = li.querySelector('h3');
      if (on) {
        h.innerHTML = '<button type="button" class="step-go">' + h.textContent + '</button>';
        h.firstChild.addEventListener('click', function () { jump(i); });
      } else {
        h.textContent = h.textContent;
        li.classList.remove('is-on');
      }
    });
    if (on) {
      active = -1; playing = -1;
      workFigs.forEach(function (f) { f.classList.remove('play', 'is-on'); });
    } else {
      workFigs.forEach(function (f) { f.classList.remove('is-on'); f.classList.add('play'); });
    }
    size();
  }
  if (work) {
    setPinned(pinQuery.matches);
    var onPinChange = function () { setPinned(pinQuery.matches); request(); };
    if (pinQuery.addEventListener) pinQuery.addEventListener('change', onPinChange);
    else if (pinQuery.addListener) pinQuery.addListener(onPinChange);
  }

  function travel(vh) { return Math.max(1, work.offsetHeight - (vh - headH())); }

  // Step i rests at progress i / (STEPS - 1): the first where the pin begins,
  // the last where it ends. Each step is active for the half-way band around
  // its resting place, so easing to the nearest resting place never changes
  // which step is showing.
  function jump(i) {
    var vh = window.innerHeight;
    var y = work.getBoundingClientRect().top + window.pageYOffset - headH();
    y += i * travel(vh) / (STEPS - 1);
    window.scrollTo({ top: Math.round(y), behavior: 'instant' });
  }

  function replay(fig) {
    fig.classList.remove('play');
    void fig.offsetWidth; // restart its animations
    fig.classList.add('play');
  }

  function stepper(vh) {
    if (!pinned) return;
    var r = work.getBoundingClientRect(), top = headH();
    var prog = clamp((top - r.top) / travel(vh), 0, 1);
    var idx = clamp(Math.round(prog * (STEPS - 1)), 0, STEPS - 1);
    if (idx !== active) {
      active = idx;
      workFigs.forEach(function (f, i) { f.classList.toggle('is-on', i === idx); });
      workItems.forEach(function (li, i) {
        li.classList.toggle('is-on', i === idx);
        var b = li.querySelector('.step-go');
        if (b) { if (i === idx) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }
      });
    }
    // each scene plays its own small animation when it becomes the one on view
    var inView = r.top < vh * 0.55 && r.bottom > vh * 0.45;
    if (inView && playing !== idx) { playing = idx; replay(workFigs[idx]); }
    if (r.bottom < 0 || r.top > vh) playing = -1;
  }

  /* ---------- scroll: the light washes in ---------- */
  function scroll(vh) {
    stepper(vh);
    scenes.forEach(function (s) {
      if (s.hero) return;
      var r = s.art.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var lit = motion ? clamp((vh - r.top) / (vh * 0.85), 0, 1) : 1;
      if (s.lit !== lit) { s.lit = lit; s.art.style.setProperty('--lit', lit.toFixed(3)); }
    });
  }

  /* ---------- the pointer is a lamp ---------- */
  var px = 0, py = 0, has = false, R = 230, LR = 360;
  function setLamp(on) {
    if (on === lampMode) return;
    lampMode = on;
    root.classList.toggle('lamp', on);
    if (!on) {
      has = false;
      scenes.forEach(function (s) { s.on = false; s.fig.classList.remove('lamp-on'); });
    }
    request();
  }
  if (canLamp) {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY; has = true;
      setLamp(true);
      request();
    }, { passive: true });
    window.addEventListener('keydown', function (e) {
      if (/^(Tab|Arrow|Page|Home|End| |Enter)/.test(e.key)) setLamp(false);
    });
    document.documentElement.addEventListener('mouseleave', function () { has = false; request(); });
    window.addEventListener('blur', function () { has = false; request(); });
  }

  function lamp(vh) {
    var moving = false;
    scenes.forEach(function (s) {
      var r = s.art.getBoundingClientRect();
      var hidden = pinned && s.step >= 0 && s.step !== active;
      var inside = has && s.ready && !hidden && r.bottom > 0 && r.top < vh &&
        px > r.left - 20 && px < r.right + 20 && py > r.top - 20 && py < r.bottom + 20;
      var tx = px - r.left, ty = py - r.top;
      if (inside) {
        if (!s.on) { s.x = tx; s.y = ty; }
        else {
          s.x += (tx - s.x) * 0.14; s.y += (ty - s.y) * 0.14;
          if (Math.abs(tx - s.x) > 0.3 || Math.abs(ty - s.y) > 0.3) moving = true;
          else { s.x = tx; s.y = ty; }
        }
        s.spot.style.transform = 'translate3d(' + (s.x - R).toFixed(1) + 'px,' + (s.y - R).toFixed(1) + 'px,0)';
        s.spotSvg.style.transform = 'translate3d(' + (R - s.x).toFixed(1) + 'px,' + (R - s.y).toFixed(1) + 'px,0)';
        s.lampwash.style.transform = 'translate3d(' + (s.x - LR).toFixed(1) + 'px,' + (s.y - LR).toFixed(1) + 'px,0)';
      }
      if (inside !== s.on) { s.on = inside; s.fig.classList.toggle('lamp-on', inside); }
    });
    return moving;
  }

  var queued = false;
  function frame() {
    queued = false;
    var vh = window.innerHeight;
    scroll(vh);
    if (lampMode && lamp(vh)) request();
  }
  function request() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(frame);
  }
  window.addEventListener('scroll', request, { passive: true });
  request();

  /* ---------------------------------------------------------------- */
  /* Contact form */
  function form() {
    var f = document.getElementById('form');
    if (!f) return;
    var status = document.getElementById('form-status');
    var submit = f.querySelector('button[type="submit"]');
    var required = ['name', 'restaurant', 'email', 'pos'];
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
        say('error', 'Add your name, your restaurant, a working email and your POS, then send again.');
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
        submit.textContent = 'Send';
        var body = encodeURIComponent(
          'Name: ' + data.name + '\nRestaurant: ' + data.restaurant +
          '\nPOS: ' + (data.pos || '') + '\n\n' + (data.message || ''));
        say('error', 'Not sent: the form service did not answer. Your words are still here. Send them by <a href="mailto:team@usetooey.com?subject=' +
          encodeURIComponent('New Tooey inquiry') + '&amp;body=' + body + '">email instead</a>.');
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* "Try Tooey free": a modal dialog holding the form */
  function dialog() {
    var dlg = document.getElementById('talk-dialog');
    var openers = [].slice.call(document.querySelectorAll('.talk-open'));
    if (!dlg) return;
    var mail = 'mailto:team@usetooey.com?subject=' + encodeURIComponent('New Tooey inquiry');
    var last = null;

    function open(btn) {
      last = btn || null;
      if (typeof dlg.showModal !== 'function') { location.href = mail; return; }
      if (dlg.open) return;
      root.classList.add('modal-open');     // the page behind stays still
      dlg.showModal();
      // focus goes to the first empty field (the name, on a fresh form)
      var first = [].filter.call(dlg.querySelectorAll('.field input'), function (el) { return !el.value; })[0] || dlg.querySelector('#f-name');
      if (first) first.focus();
    }
    function close() { if (dlg.open) dlg.close(); }

    openers.forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
    dlg.querySelector('.dlg-close').addEventListener('click', close);
    // Escape closes it natively; a click on the backdrop closes it too
    var downOnBackdrop = false;
    dlg.addEventListener('pointerdown', function (e) { downOnBackdrop = e.target === dlg; });
    dlg.addEventListener('click', function (e) { if (downOnBackdrop && e.target === dlg) close(); downOnBackdrop = false; });
    dlg.addEventListener('close', function () {
      root.classList.remove('modal-open');
      var to = last && document.contains(last) ? last : openers[0];
      if (to) to.focus();
      if (location.hash === '#talk' && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
    // other pages link to ./#talk: open the dialog there
    if (location.hash === '#talk') {
      var endBtn = document.querySelector('.talk .talk-open') || openers[0];
      // after load, once the browser has scrolled to the fragment (which would take focus back)
      var openLater = function () { setTimeout(function () { open(endBtn); }, 60); };
      if (document.readyState === 'complete') openLater(); else window.addEventListener('load', openLater);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Snap to the nearest resting place, gently.
     Resting places: the top of each section (under the header), each step
     of the pinned section, and the very bottom of the page. Once scrolling
     has been idle for 150ms, and no finger, button or key is down, the page
     eases (0.6s, ease-out) to the nearest one, if it is near enough. Any
     wheel, touch, key or pointer input stops the ease at once. Off under
     reduced motion and while the dialog is open. */
  function snapping() {
    if (!motion || !window.requestAnimationFrame) return;
    var header = document.querySelector('.top');
    var IDLE = 150, DUR = 600;
    var timer = 0, anim = 0, own = false, down = false, held = false, lastSet = -1;

    function points() {
      var vh = window.innerHeight, hh = header ? header.offsetHeight : 0;
      var y0 = window.pageYOffset, max = document.documentElement.scrollHeight - vh;
      var out = [0, max];
      [].forEach.call(document.querySelectorAll('main > section'), function (sec) {
        var top = sec.getBoundingClientRect().top + y0 - hh;
        out.push(top);
        if (sec.classList.contains('is-pinned')) {
          var n = sec.querySelectorAll('.work-item').length;
          var tr = sec.offsetHeight - (vh - hh);
          for (var i = 1; i < n; i++) out.push(top + tr * i / (n - 1));
        }
      });
      return out.filter(function (p) { return p >= 0 && p <= max; });
    }

    function cancel() {
      if (anim) cancelAnimationFrame(anim);
      anim = 0; own = false;
      clearTimeout(timer);
    }

    function settle() {
      if (down) { held = true; return; } // wait for the finger or button to lift
      if (root.classList.contains('modal-open')) return;
      var y = window.pageYOffset, vh = window.innerHeight;
      var best = null, d = Infinity;
      points().forEach(function (p) { var dd = Math.abs(p - y); if (dd < d) { d = dd; best = p; } });
      // only when it is truly between two places, and never a long haul
      if (best === null || d < 2 || d > vh * 0.75) return;
      var from = y, to = Math.round(best), t0 = performance.now();
      own = true;
      (function step(now) {
        var t = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - t, 3);
        lastSet = Math.round(from + (to - from) * e);
        window.scrollTo(0, lastSet);
        if (t < 1) anim = requestAnimationFrame(step);
        else { anim = 0; setTimeout(function () { own = false; }, 50); }
      })(t0);
    }

    function wait() { clearTimeout(timer); timer = setTimeout(settle, IDLE); }

    window.addEventListener('scroll', function () {
      if (own && Math.abs(window.pageYOffset - lastSet) <= 1) return; // our own ease
      if (own) cancel();
      wait();
    }, { passive: true });
    ['wheel', 'touchstart', 'touchmove', 'keydown'].forEach(function (t) {
      window.addEventListener(t, function () { if (own) cancel(); }, { passive: true });
    });
    window.addEventListener('pointerdown', function () { down = true; if (own) cancel(); }, { passive: true });
    window.addEventListener('touchstart', function () { down = true; }, { passive: true });
    // after a drag or a swipe that scrolled, settle once it is let go; a plain click never moves the page
    var up = function () { down = false; if (held) { held = false; wait(); } };
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    window.addEventListener('touchend', up, { passive: true });
    window.addEventListener('touchcancel', up, { passive: true });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
