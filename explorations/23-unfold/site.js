(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  /* Phone menu */
  var menu = document.querySelector('.menu');
  var nav = document.getElementById('nav');
  if (menu && nav) {
    var close = function () { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); };
    menu.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); menu.focus(); }
    });
  }

  /* Contact form */
  var form = document.getElementById('form');
  if (form) {
    var status = document.getElementById('form-status');
    var button = form.querySelector('button[type="submit"]');
    var required = ['name', 'restaurant', 'email'];
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    var mailto = function (d) {
      var body = 'Name: ' + (d.name || '') + '\nRestaurant: ' + (d.restaurant || '') + '\nEmail: ' + (d.email || '') +
        '\nPhone: ' + (d.phone || '') + '\nPOS: ' + (d.pos || '') + '\n\n' + (d.message || '');
      return 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') + '&body=' + encodeURIComponent(body);
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      var firstBad = null;
      required.forEach(function (k) {
        var el = form.elements[k];
        var bad = !data[k] || (k === 'email' && !emailOk(data[k]));
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) {
        status.textContent = 'Add your name, your restaurant and a working email so we can reply.';
        firstBad.focus();
        return;
      }
      if (data._honey) { status.textContent = 'Sent. We will reply soon.'; form.reset(); return; }
      delete data._honey;
      button.disabled = true;
      button.textContent = 'Sending...';
      status.textContent = 'Sending your message.';
      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || String(j.success) !== 'true') throw new Error('not sent');
        });
      }).then(function () {
        status.textContent = 'Sent. We will reply to ' + data.email + ' soon.';
        form.reset();
      }).catch(function () {
        status.innerHTML = '';
        status.appendChild(document.createTextNode('That did not send. '));
        var a = document.createElement('a');
        a.href = mailto(data);
        a.textContent = 'Email it to tooeyteam@gmail.com instead';
        status.appendChild(a);
        status.appendChild(document.createTextNode('.'));
      }).then(function () {
        button.disabled = false;
        button.textContent = 'Send message';
      });
    });
  }

  /* The scene: only with motion allowed and WebGL 2 available. Otherwise the
     posters (each shot's finished frame) stay, which is the designed still. */
  var params = new URLSearchParams(location.search);
  var still = params.has('still') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noScene = function () { root.classList.remove('motion'); };
  if (!document.querySelector('.shot') || (still && !params.has('capture'))) { noScene(); return; }
  var gl = null;
  try { gl = document.createElement('canvas').getContext('webgl2'); } catch (err) { gl = null; }
  if (!gl) { noScene(); return; }
  var lose = gl.getExtension('WEBGL_lose_context');
  if (lose) lose.loseContext();
  gl = null;
  // if the scene is slow to arrive, show the finished still rather than an empty frame
  window.setTimeout(function () {
    var hero = document.querySelector('.shot--hero');
    if (hero && !hero.classList.contains('is-live')) noScene();
  }, Number(params.get('wait')) || 6000);
  import('./scene.js').catch(noScene);
})();
