(function () {
  'use strict';
  var doc = document.documentElement;
  var motion = doc.classList.contains('motion');

  /* ---------- phone nav ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
    };
    menuBtn.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); menuBtn.focus(); }
    });
  }

  /* ---------- figures ---------- */
  var F = window.TooeyFigures;
  var players = [];

  function visible(svg) { return svg.getClientRects().length > 0 && getComputedStyle(svg).display !== 'none'; }

  function Player(el) {
    this.el = el;
    this.name = el.getAttribute('data-fig');
    this.fig = F.figures[this.name];
    this.svgs = [].slice.call(el.querySelectorAll('svg.fig'));
    this.raf = 0;
    this.played = false;
  }
  Player.prototype.drawAll = function (t) {
    var fig = this.fig;
    this.svgs.forEach(function (svg) { svg.innerHTML = fig.render(svg.getAttribute('data-variant'), t); });
  };
  Player.prototype.stop = function () { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; };
  Player.prototype.seek = function (t) {
    this.stop();
    this.el.classList.add('is-primed');
    this.drawAll(Math.min(t, this.fig.end));
  };
  Player.prototype.play = function () {
    var self = this, fig = this.fig;
    this.stop();
    this.played = true;
    this.el.classList.remove('is-done');
    var live = this.svgs.filter(visible);
    // anything not on screen rests at its final state
    this.svgs.forEach(function (svg) { if (live.indexOf(svg) < 0) svg.innerHTML = fig.render(svg.getAttribute('data-variant'), fig.end); });
    var start = performance.now();
    var tick = function (now) {
      var t = (now - start) / 1000;
      live.forEach(function (svg) { svg.innerHTML = fig.render(svg.getAttribute('data-variant'), Math.min(t, fig.end)); });
      if (t < fig.end) self.raf = requestAnimationFrame(tick);
      else { self.raf = 0; self.el.classList.add('is-done'); }
    };
    this.raf = requestAnimationFrame(tick);
  };

  if (F) {
    [].forEach.call(document.querySelectorAll('[data-fig]'), function (el) {
      var p = new Player(el);
      players.push(p);
      if (!motion) return; // reduced motion: the resting state is already drawn
      p.drawAll(0);
      el.classList.add('is-primed');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'replay';
      btn.setAttribute('aria-label', 'Replay animation');
      btn.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 10a5.5 5.5 0 1 1-1.8-4.07" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14.6 2.6v3.9h-3.9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
      btn.addEventListener('click', function () { p.play(); });
      el.querySelector('.fig-stage').appendChild(btn);
    });

    if (motion) {
      var autoplay = players.filter(function (p) { return p.el.hasAttribute('data-autoplay'); });
      var rest = players.filter(function (p) { return !p.el.hasAttribute('data-autoplay'); });
      var go = function () { autoplay.forEach(function (p) { if (!p.played) p.play(); }); };
      if (document.fonts && document.fonts.ready) {
        Promise.race([document.fonts.ready, new Promise(function (res) { setTimeout(res, 700); })]).then(go);
      } else go();

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var p = players.filter(function (x) { return x.el === e.target; })[0];
            if (p && !p.played) p.play();
            io.unobserve(e.target);
          });
        }, { threshold: 0.4 });
        rest.forEach(function (p) { io.observe(p.el); });
      } else rest.forEach(function (p) { p.play(); });
    }
  }

  // test and review hook: draw any figure at a given moment
  window.TooeyPlayer = {
    seek: function (name, t) { players.forEach(function (p) { if (p.name === name) p.seek(t); }); },
    play: function (name) { players.forEach(function (p) { if (p.name === name) p.play(); }); }
  };

  /* ---------- contact form ---------- */
  var form = document.getElementById('pilot-form');
  if (form && window.fetch) {
    var status = form.querySelector('.form-status');
    var mail = '<a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = [].slice.call(form.querySelectorAll('[required]'));
      var firstBad = null;
      required.forEach(function (input) {
        var bad = !input.value.trim() || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
        input.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && !firstBad) firstBad = input;
      });
      status.classList.remove('is-error');
      if (firstBad) {
        status.classList.add('is-error');
        status.textContent = 'Add your name, restaurant and a working email, then send again.';
        firstBad.focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      form.classList.add('is-sending');
      status.textContent = 'Sending…';
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || String(body.success) !== 'true') throw new Error('not sent');
        });
      }).then(function () {
        form.reset();
        status.innerHTML = 'Sent. We will reply from ' + mail + '.';
      }).catch(function () {
        status.classList.add('is-error');
        status.innerHTML = 'That did not send. Email us at ' + mail + ' instead.';
      }).then(function () { form.classList.remove('is-sending'); });
    });
  }
})();
