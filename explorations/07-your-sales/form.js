// Pilot form: sends JSON to FormSubmit, with a mailto fallback if that fails.
(function () {
  var form = document.querySelector('.form');
  if (!form || !window.fetch) return;
  var status = form.querySelector('.status');
  var button = form.querySelector('button[type=submit]');
  var label = button.textContent;

  function mailto(data) {
    var body = ['Name: ' + data.name, 'Restaurant: ' + data.restaurant, 'Email: ' + data.email,
      'Phone: ' + (data.phone || ''), 'POS: ' + (data.pos || ''), '', data.message || ''].join('\n');
    return 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') + '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    ['name', 'restaurant', 'email'].forEach(function (n) {
      var el = form.elements[n];
      var ok = el.value.trim() !== '' && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.closest('.field').classList.toggle('bad', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !bad) bad = el;
    });
    if (bad) {
      status.textContent = bad.name === 'email' && bad.value.trim() ? 'Check the email address.' : 'Name, restaurant, and email are needed.';
      bad.focus();
      return;
    }
    if (form.elements._honey.value) return;

    var data = {};
    ['name', 'restaurant', 'email', 'phone', 'pos', 'message', '_subject', '_template', '_captcha', '_honey'].forEach(function (n) {
      data[n] = form.elements[n].value.trim();
    });
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = '';

    fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) {
        if (String(j.success) !== 'true') throw new Error('not sent');
        form.reset();
        button.textContent = 'Sent';
        status.textContent = 'Thanks. We will reply by email.';
      })
      .catch(function () {
        button.disabled = false;
        button.textContent = label;
        status.innerHTML = 'That did not send. <a href="' + mailto(data).replace(/"/g, '&quot;') + '">Email it to us instead</a>.';
      });
  });
})();
