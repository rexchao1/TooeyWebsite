(function () {
  'use strict';

  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var ease = 'cubic-bezier(.2,.8,.2,1)';

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function play(el, frames, opts) {
    var a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
    return a.finished.catch(function () {});
  }

  /* Phone menu */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('open')) btn.click();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { btn.click(); btn.focus(); }
    });
  }

  /* Hero: the words swing round to face you, the shelf draws, the counts drop. */
  function hero() {
    var words = document.querySelectorAll('.hero-title .w');
    var side = document.querySelector('.hero-side');
    var counts = document.querySelector('.counts');
    if (!counts) return;
    var nums = counts.querySelectorAll('.n');
    var pill = counts.querySelector('.pill');
    var dishes = counts.querySelectorAll('.dish');
    var note = document.querySelector('.counts-note');

    words.forEach(function (w, i) {
      play(w, [
        { opacity: 0, '--xr': 45, transform: 'translateY(.18em)' },
        { opacity: 1, '--xr': 0, transform: 'translateY(0)' }
      ], { duration: 520, delay: 60 * i, easing: ease });
    });
    play(side, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 380 });

    setTimeout(function () { counts.classList.add('shelf-on'); }, 420);

    nums.forEach(function (n, i) {
      var final = n.getAttribute('data-final');
      var delay = 760 + i * 130;
      setTimeout(function () {
        var r = n.getBoundingClientRect();
        var drop = r.height + 100;
        n.style.opacity = 1;
        var t = setInterval(function () {
          n.textContent = String(10 + Math.floor(Math.random() * 89));
        }, 45);
        setTimeout(function () { clearInterval(t); n.textContent = final; }, 420);
        play(n, [
          { transform: 'translateY(' + (-drop) + 'px) scale(1,1)', easing: 'cubic-bezier(.5,0,1,.6)' },
          { transform: 'translateY(0) scale(1,1)', offset: 0.6 },
          { transform: 'translateY(0) scale(1.12,.78)', offset: 0.7, easing: 'ease-out' },
          { transform: 'translateY(-9%) scale(.96,1.05)', offset: 0.84, easing: 'ease-in' },
          { transform: 'translateY(0) scale(1,1)' }
        ], { duration: 700 });
        play(dishes[i], [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 430 });
      }, delay);
    });

    var pillDelay = 760 + nums.length * 130 + 380;
    setTimeout(function () {
      play(pill, [
        { opacity: 0, transform: 'translateX(70%)' },
        { opacity: 1, transform: 'translateX(0)' }
      ], { duration: 460, easing: 'cubic-bezier(.2,1.2,.4,1)' });
      play(dishes[dishes.length - 1], [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 200 });
      play(note, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 360 });
    }, pillDelay);
  }

  /* Hero lean: the display letters turn toward a mouse pointer. */
  function lean() {
    var heroEl = document.querySelector('.hero');
    if (!heroEl || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    function tick() {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      heroEl.style.setProperty('--lx', x.toFixed(2));
      heroEl.style.setProperty('--ly', y.toFixed(2));
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(tick);
      else raf = 0;
    }
    function aim(nx, ny) { tx = nx; ty = ny; if (!raf) raf = requestAnimationFrame(tick); }
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      aim(px * 24, -py * 18);
    });
    heroEl.addEventListener('pointerleave', function () { aim(0, 0); });
  }

  /* Prep: predicted 57, the lemon "a little over" grows, the count flips to 61. */
  function over(fig) {
    var label = fig.querySelector('.over-label');
    var num = fig.querySelector('.over-num');
    var pred = fig.querySelector('.over-pred');
    var inkBar = fig.querySelector('.over-ink');
    var lemon = fig.querySelector('.over-lemon');
    var tag = fig.querySelector('.over-tag');
    var ex = fig.querySelector('.over-ex');
    return {
      prime: function () {
        label.textContent = 'Predicted'; num.textContent = '57';
        pred.style.opacity = 0; tag.style.opacity = 0; ex.style.opacity = 0;
        inkBar.style.transform = 'scaleX(0)'; lemon.style.transform = 'scaleX(0)';
      },
      run: async function () {
        await play(inkBar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 620, easing: ease });
        play(lemon, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.5,.5,1)' });
        play(tag, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 160 });
        await wait(520);
        await play(num, [{ '--xr': 0, opacity: 1 }, { '--xr': -45, opacity: 0, transform: 'scaleY(.5)' }], { duration: 200, easing: 'ease-in' });
        num.textContent = '61'; label.textContent = 'Prep';
        await play(num, [{ '--xr': 45, opacity: 0, transform: 'scaleY(.5)' }, { '--xr': 0, opacity: 1, transform: 'scaleY(1)' }], { duration: 360, easing: 'cubic-bezier(.2,1.4,.4,1)' });
        play(pred, [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: ease });
        play(ex, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 200 });
      }
    };
  }

  /* Shifts (concept): the night's curve draws, staff pile in too early, then slide to fit. */
  function shifts(fig) {
    var hill = fig.querySelector('.hill');
    var ps = Array.prototype.slice.call(fig.querySelectorAll('.staff .p'));
    var len = hill.getTotalLength();
    var from = ps.map(function (p) {
      var x = +p.querySelector('rect').getAttribute('x');
      return 20 - x;
    });
    return {
      prime: function () {
        hill.style.strokeDasharray = len; hill.style.strokeDashoffset = len;
        ps.forEach(function (p) { p.style.opacity = 0; });
      },
      run: async function () {
        await play(hill, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)' });
        ps.forEach(function (p, i) {
          play(p, [
            { opacity: 0, transform: 'translate(' + from[i] + 'px, -60px)' },
            { opacity: 1, transform: 'translate(' + from[i] + 'px, 0)' }
          ], { duration: 360, delay: i * 70, easing: 'cubic-bezier(.3,1.4,.5,1)' });
        });
        await wait(360 + ps.length * 70 + 450);
        await Promise.all(ps.map(function (p, i) {
          return play(p, [
            { opacity: 1, transform: 'translate(' + from[i] + 'px, 0)' },
            { opacity: 1, transform: 'translate(0, 0)' }
          ], { duration: 720, delay: (ps.length - 1 - i) * 60, easing: 'cubic-bezier(.65,0,.25,1)' });
        }));
      }
    };
  }

  /* Growth (concept): Tuesday comes forward, guests drift in, one regular comes back from Thursday. */
  function growth(fig) {
    var svg = fig.querySelector('svg');
    var nights = Array.prototype.slice.call(fig.querySelectorAll('.night'));
    var tue = fig.querySelector('.night.tue');
    var others = nights.filter(function (n) { return n !== tue; });
    var guests = Array.prototype.slice.call(tue.querySelectorAll('.g'));
    var early = guests.slice(0, 3);
    var later = guests.slice(3, guests.length - 1);
    var regular = guests[guests.length - 1];
    var trail = fig.querySelector('.trail');
    var tlen = trail.getTotalLength();
    var cx = +tue.getAttribute('data-cx'), cy = +tue.getAttribute('data-cy');
    var NS = 'http://www.w3.org/2000/svg';
    /* The regular is the last guest on Tuesday, and comes from Thursday. */
    return {
      prime: function () {
        later.concat([regular]).forEach(function (g) { g.style.opacity = 0; });
        trail.style.strokeDasharray = tlen; trail.style.strokeDashoffset = tlen;
      },
      run: async function () {
        others.forEach(function (n) { play(n, [{ opacity: 1 }, { opacity: 0.3 }], { duration: 400 }); });
        await play(tue, [{ transform: 'scale(1)' }, { transform: 'scale(1.45)' }], { duration: 520, easing: ease });
        later.forEach(function (g, i) {
          var gx = +g.getAttribute('cx') - cx, gy = +g.getAttribute('cy') - cy;
          var ang = Math.atan2(gy, gx) || i;
          var dx = Math.cos(ang) * 70, dy = Math.sin(ang) * 70;
          play(g, [
            { opacity: 0, transform: 'translate(' + dx + 'px,' + dy + 'px)' },
            { opacity: 1, transform: 'translate(0,0)' }
          ], { duration: 520, delay: i * 75, easing: 'cubic-bezier(.3,1.3,.5,1)' });
        });
        await wait(later.length * 75 + 300);
        /* the regular: a ring leaves Thursday and follows the trail home */
        others.forEach(function (n) { play(n, [{ opacity: 0.3 }, { opacity: 1 }], { duration: 300 }); });
        play(tue, [{ transform: 'scale(1.45)' }, { transform: 'scale(1)' }], { duration: 420, easing: ease });
        play(trail, [{ strokeDashoffset: tlen }, { strokeDashoffset: 0 }], { duration: 900, easing: 'cubic-bezier(.4,0,.2,1)' });
        var runner = document.createElementNS(NS, 'circle');
        runner.setAttribute('r', '4.2'); runner.setAttribute('class', 'g');
        svg.appendChild(runner);
        var start = performance.now(), dur = 900;
        var rx = +regular.getAttribute('cx'), ry = +regular.getAttribute('cy');
        await new Promise(function (done) {
          (function step(now) {
            var t = Math.min(1, (now - start) / dur);
            var e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            var p = trail.getPointAtLength(e * tlen);
            var k = Math.max(0, (t - .8) / .2);
            runner.setAttribute('cx', (p.x + (rx - p.x) * k).toFixed(1));
            runner.setAttribute('cy', (p.y + (ry - p.y) * k).toFixed(1));
            if (t < 1) requestAnimationFrame(step); else done();
          })(start);
        });
        runner.remove();
        regular.style.opacity = 1;
        regular.style.transformBox = 'fill-box'; regular.style.transformOrigin = 'center';
        play(regular, [{ transform: 'scale(1)' }, { transform: 'scale(2.2)' }, { transform: 'scale(1)' }],
          { duration: 420, easing: 'ease-out' });
      }
    };
  }

  /* On a narrow screen the week drawing crops to Monday to Thursday, so the rings stay legible. */
  document.querySelectorAll('svg[data-narrow]').forEach(function (svg) {
    var wide = svg.getAttribute('viewBox'), narrow = svg.getAttribute('data-narrow');
    var mq = window.matchMedia('(max-width: 600px)');
    function set() { svg.setAttribute('viewBox', mq.matches ? narrow : wide); }
    set();
    if (mq.addEventListener) mq.addEventListener('change', set);
  });

  var makers = { over: over, shifts: shifts, growth: growth };

  function sections() {
    var figs = document.querySelectorAll('[data-anim]');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var a = en.target._anim;
        if (a) setTimeout(a.run, 150);
      });
    }, { threshold: 0.45 });
    figs.forEach(function (f) {
      var make = makers[f.getAttribute('data-anim')];
      if (!make) return;
      var a = make(f);
      var r = f.getBoundingClientRect();
      /* Leave anything already scrolled past in its finished state. */
      if (r.bottom < 0) return;
      a.prime();
      f._anim = a;
      io.observe(f);
    });
  }

  if (motion) {
    hero();
    lean();
    sections();
  }

  /* Contact form: JSON to FormSubmit, with sending, sent and failed states. */
  var form = document.querySelector('.form');
  if (form) {
    var submit = form.querySelector('button[type="submit"]');
    var status = form.querySelector('.status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var ok = f.checkValidity();
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) bad = f;
      });
      if (bad) {
        status.textContent = bad.type === 'email' && bad.value
          ? 'Check the email address, then send again.'
          : 'Add your name, restaurant and email, then send again.';
        bad.focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._honey) return;
      submit.disabled = true;
      submit.textContent = 'Sending';
      status.textContent = 'Sending your message.';
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('status ' + res.status);
        return res.json();
      }).then(function (json) {
        if (json && String(json.success) === 'false') throw new Error('rejected');
        form.reset();
        submit.textContent = 'Sent';
        status.textContent = 'Sent. We will reply to ' + data.email + ' soon.';
      }).catch(function () {
        submit.disabled = false;
        submit.textContent = 'Send';
        var body = encodeURIComponent('Name: ' + data.name + '\nRestaurant: ' + data.restaurant +
          '\nPhone: ' + (data.phone || '') + '\nPOS: ' + (data.pos || '') + '\n\n' + (data.message || ''));
        status.innerHTML = 'That did not send. Email us at <a href="mailto:tooeyteam@gmail.com?subject=' +
          encodeURIComponent('New Tooey inquiry') + '&body=' + body + '">tooeyteam@gmail.com</a> instead.';
      });
    });
  }
})();
