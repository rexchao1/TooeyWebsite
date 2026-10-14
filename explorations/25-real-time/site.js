/* Tooey, real time: phone menu, the live kitchen, and the contact form. */
(function () {
  var html = document.documentElement;
  var still = /[?&]still=/.test(location.search);

  // ---------- phone menu ----------
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
  }

  // ---------- the live kitchen ----------
  // Only with motion allowed and WebGL present. Otherwise the stills stay.
  function hasGL() {
    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return false;
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return true;
    } catch (e) { return false; }
  }
  if (html.classList.contains('motion') || still) {
    if (!hasGL()) {
      html.classList.add('no-gl');
    } else {
      import('./assets/scene.js').then(function (m) { return m.start(); })
        .catch(function () { html.classList.add('no-gl'); });
      // the counts must be on screen within a few seconds, live or not
      setTimeout(function () {
        if (!document.querySelector('.shot-hero.live')) html.classList.add('hero-still');
      }, 4500);
    }
  }

  // ---------- contact form ----------
  var form = document.getElementById('form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');
  var ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';

  function say(msg, html_) {
    if (html_) status.innerHTML = msg; else status.textContent = msg;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var required = ['name', 'restaurant', 'email'];
    var first = null;
    required.forEach(function (n) {
      var el = form.elements[n];
      var bad = !el.value.trim() || (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !first) first = el;
    });
    if (first) {
      say(first.name === 'email' && first.value.trim() ? 'Check the email address.' : 'Add your name, restaurant and email.');
      first.focus();
      return;
    }
    if (form.elements._honey.value) return;

    var data = {};
    ['name', 'restaurant', 'email', 'phone', 'pos', 'message', '_subject', '_template', '_captcha', '_honey'].forEach(function (n) {
      data[n] = form.elements[n] ? form.elements[n].value.trim() : '';
    });
    submit.disabled = true;
    submit.textContent = 'Sending';
    say('Sending your message.');
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().then(function (j) { return r.ok && String(j.success) === 'true'; });
    }).then(function (ok) {
      if (!ok) throw new Error('not sent');
      form.reset();
      submit.textContent = 'Sent';
      say('Message sent. We will write back from tooeyteam@gmail.com.');
    }).catch(function () {
      submit.disabled = false;
      submit.textContent = 'Send message';
      var body = encodeURIComponent('Name: ' + data.name + '\nRestaurant: ' + data.restaurant + '\nEmail: ' + data.email +
        (data.phone ? '\nPhone: ' + data.phone : '') + (data.pos ? '\nPOS: ' + data.pos : '') + (data.message ? '\n\n' + data.message : ''));
      say('The message did not send. Email it to <a href="mailto:tooeyteam@gmail.com?subject=' +
        encodeURIComponent('New Tooey inquiry') + '&amp;body=' + body + '">tooeyteam@gmail.com</a> instead.', true);
    });
  });
})();
