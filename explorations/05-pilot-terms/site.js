/* Tooey · exploration 05. Everything here is an enhancement: the pages read
   in full without it, and the form falls back to a plain POST. */
(function () {
  'use strict';

  var EMAIL = 'tooeyteam@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;

  /* Phone menu ---------------------------------------------------------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    var setOpen = function (open, returnFocus) {
      menuBtn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      menuBtn.textContent = open ? 'Close' : 'Menu';
      if (!open && returnFocus) menuBtn.focus();
    };
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
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
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !e.target.closest('.top')) setOpen(false);
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* "Ask about this" fills in the start of a message ------------------ */
  var message = document.getElementById('f-message');
  var lastPrefill = '';
  document.querySelectorAll('[data-ask]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!message) return;
      var text = link.getAttribute('data-ask');
      if (message.value.trim() === '' || message.value === lastPrefill) {
        message.value = text;
        lastPrefill = text;
      }
      window.setTimeout(function () {
        message.focus({ preventScroll: true });
        var end = message.value.length;
        try { message.setSelectionRange(end, end); } catch (err) { /* ignore */ }
      }, 450);
    });
  });

  /* Print just the terms --------------------------------------------- */
  var printBtn = document.querySelector('[data-print]');
  if (printBtn && window.print) {
    printBtn.hidden = false;
    var note = document.querySelector('.terms__print-note');
    if (note) note.hidden = false;
    printBtn.addEventListener('click', function () {
      document.body.classList.add('print-terms');
      window.print();
    });
    window.addEventListener('afterprint', function () {
      document.body.classList.remove('print-terms');
    });
  }

  /* Contact form ------------------------------------------------------ */
  var form = document.getElementById('contact-form');
  if (!form) return;
  var sent = document.getElementById('form-sent');
  var status = form.querySelector('.form__status');
  var submit = form.querySelector('button[type="submit"]');

  var messages = {
    name: 'Add your name so we know who to reply to.',
    restaurant: 'Add the name of your restaurant.',
    email: 'Add an email address we can reply to.',
    emailFormat: 'That email address looks incomplete.'
  };

  var showError = function (input, text) {
    var err = document.getElementById(input.id + '-err');
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    if (!err) return;
    err.textContent = text || '';
    err.hidden = !text;
  };

  var check = function (input) {
    if (!input.required) return true;
    var v = input.value.trim();
    if (!v) { showError(input, messages[input.name]); return false; }
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      showError(input, messages.emailFormat);
      return false;
    }
    showError(input, '');
    return true;
  };

  form.querySelectorAll('input[required]').forEach(function (input) {
    input.addEventListener('blur', function () {
      if (input.getAttribute('aria-invalid') === 'true' || input.value.trim()) check(input);
    });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') check(input);
    });
  });

  var mailtoFrom = function (data) {
    var body = [
      'Name: ' + data.name,
      'Restaurant: ' + data.restaurant,
      'Email: ' + data.email,
      data.phone ? 'Phone: ' + data.phone : '',
      data.pos ? 'POS: ' + data.pos : '',
      '',
      data.message || ''
    ].filter(function (line, i) { return line !== '' || i === 5; }).join('\n');
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('About the Tooey pilot') +
      '&body=' + encodeURIComponent(body);
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');

    var required = Array.prototype.slice.call(form.querySelectorAll('input[required]'));
    var firstBad = null;
    required.forEach(function (input) {
      if (!check(input) && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); return; }

    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });

    // A filled honeypot is a bot. Show success and send nothing.
    if (data._honey) { done(data); return; }

    submit.disabled = true;
    var label = submit.textContent;
    submit.textContent = 'Sending…';
    status.textContent = 'Sending your message…';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || String(json.success) !== 'true') throw new Error('not sent');
          done(data);
        });
      })
      .catch(function () {
        submit.disabled = false;
        submit.textContent = label;
        status.classList.add('is-error');
        status.innerHTML = '';
        status.appendChild(document.createTextNode('It didn’t send, and what you wrote is still here. Try again, or '));
        var a = document.createElement('a');
        a.href = mailtoFrom(data);
        a.textContent = 'send it from your own email';
        status.appendChild(a);
        status.appendChild(document.createTextNode(' to ' + EMAIL + '.'));
      });
  });

  function done(data) {
    var who = sent.querySelector('[data-sent-email]');
    if (who && data.email) who.textContent = data.email;
    form.hidden = true;
    sent.hidden = false;
    sent.focus();
  }
})();
