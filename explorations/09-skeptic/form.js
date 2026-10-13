(function () {
  'use strict';
  var form = document.querySelector('.form');
  if (!form || !window.fetch) return;
  var status = form.querySelector('.status');
  var button = form.querySelector('button[type="submit"]');
  var ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';

  var messages = {
    name: 'Add your name.',
    restaurant: 'Add your restaurant’s name.',
    email: 'Add an email we can reply to.',
    emailBad: 'That email looks incomplete. Check it and try again.'
  };

  function setError(input, text) {
    var id = input.id + '-err';
    var err = document.getElementById(id);
    if (!text) {
      input.removeAttribute('aria-invalid');
      if (err) err.remove();
      input.removeAttribute('aria-describedby');
      return;
    }
    if (!err) {
      err = document.createElement('p');
      err.className = 'err';
      err.id = id;
      input.parentNode.appendChild(err);
    }
    err.textContent = text;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', id);
  }

  function check() {
    var bad = null;
    ['name', 'restaurant', 'email'].forEach(function (n) {
      var input = form.elements[n];
      var v = input.value.trim();
      var text = '';
      if (!v) text = messages[n];
      else if (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) text = messages.emailBad;
      setError(input, text);
      if (text && !bad) bad = input;
    });
    return bad;
  }

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') check();
  });

  function mailto() {
    var f = form.elements;
    var body = 'Name: ' + f.name.value + '\nRestaurant: ' + f.restaurant.value +
      '\nEmail: ' + f.email.value + '\nPhone: ' + f.phone.value + '\nPOS: ' + f.pos.value +
      '\n\n' + f.message.value;
    return 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = check();
    if (bad) {
      status.className = 'status bad';
      status.textContent = 'Fill in the marked fields, then send.';
      bad.focus();
      return;
    }
    if (form.elements._honey.value) return;

    var f = form.elements;
    var data = {
      name: f.name.value.trim(),
      restaurant: f.restaurant.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      pos: f.pos.value.trim(),
      message: f.message.value.trim(),
      _subject: 'New Tooey inquiry',
      _template: 'table',
      _captcha: 'false',
      _honey: ''
    };

    button.disabled = true;
    button.textContent = 'Sending…';
    status.className = 'status';
    status.textContent = '';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || String(j.success) !== 'true') throw new Error('not sent');
      });
    }).then(function () {
      form.reset();
      button.textContent = 'Sent';
      status.className = 'status ok';
      status.textContent = 'Sent. We’ll reply from tooeyteam@gmail.com.';
    }).catch(function () {
      button.disabled = false;
      button.textContent = 'Send';
      status.className = 'status bad';
      status.innerHTML = '';
      status.append('That didn’t send. ');
      var a = document.createElement('a');
      a.href = mailto();
      a.textContent = 'Email it to tooeyteam@gmail.com instead';
      status.append(a, '.');
    });
  });
})();
