(function () {
  'use strict';

  /* Phone menu. */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    var setOpen = function (open, returnFocus) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      if (!open && returnFocus) btn.focus();
    };
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
      if (open) {
        var first = nav.querySelector('a');
        if (first) first.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });
    document.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    var mq = window.matchMedia('(min-width: 681px)');
    var reset = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', reset);
  }

  /* Print the answers. Hidden without JavaScript, since it needs it. */
  var printBtn = document.querySelector('[data-print]');
  if (printBtn && window.print) {
    printBtn.hidden = false;
    printBtn.addEventListener('click', function () { window.print(); });
  }

  /* Contact form: JSON to FormSubmit, with sending, sent, and failed states. */
  var form = document.getElementById('contact');
  if (!form || !window.fetch) return;

  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');
  var ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';

  var required = {
    name: 'Tell us what to call you.',
    restaurant: 'Which restaurant is this for?',
    email: 'We need an email to write back to.',
    message: 'Ask us something, or tell us a little about your kitchen.'
  };

  function setError(field, msg) {
    var input = form.elements[field];
    var err = document.getElementById('e-' + field);
    if (!input || !err) return;
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      err.textContent = msg;
    } else {
      input.removeAttribute('aria-invalid');
      err.textContent = '';
    }
  }

  function validate() {
    var firstBad = null;
    Object.keys(required).forEach(function (field) {
      var input = form.elements[field];
      var value = (input.value || '').trim();
      var msg = '';
      if (!value) msg = required[field];
      else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = 'That email doesn’t look complete.';
      setError(field, msg);
      if (msg && !firstBad) firstBad = input;
    });
    return firstBad;
  }

  Object.keys(required).forEach(function (field) {
    var input = form.elements[field];
    if (input) input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') setError(field, '');
    });
  });

  function show(kind, html) {
    status.className = 'status' + (kind ? ' is-' + kind : '');
    status.innerHTML = html;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = validate();
    if (bad) { bad.focus(); return; }

    // A filled honeypot means a bot. Pretend it worked and send nothing.
    if (form.elements._honey && form.elements._honey.value) {
      form.classList.add('sent');
      show('ok', '<strong>Sent.</strong>');
      return;
    }

    var data = {};
    ['name', 'restaurant', 'email', 'phone', 'pos', 'message', '_subject', '_template', '_captcha', '_honey'].forEach(function (k) {
      var el = form.elements[k];
      data[k] = el ? String(el.value || '').trim() : '';
    });

    submit.disabled = true;
    submit.textContent = 'Sending…';
    show('sending', 'Sending your note to tooeyteam@gmail.com…');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || String(body.success) !== 'true') throw new Error('not sent');
        });
      })
      .then(function () {
        form.classList.add('sent');
        var who = data.name.split(' ')[0];
        show('ok', '<strong>Sent. Thanks' + (who ? ', ' + escapeHtml(who) : '') + '.</strong>It’s in our inbox now. We’ll reply to ' + escapeHtml(data.email) + '.');
        status.setAttribute('tabindex', '-1');
        status.focus();
      })
      .catch(function () {
        submit.disabled = false;
        submit.textContent = 'Try again';
        show('bad', '<strong>That didn’t send.</strong>Your note is still in the form, so nothing is lost. Try again, or email it to <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>.');
      });
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
