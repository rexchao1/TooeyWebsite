// Phone menu and the contact form. The take lives in take.js.
(function () {
  var menu = document.querySelector('.menu');
  var nav = document.getElementById('nav');
  if (menu && nav) {
    var close = function () { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
    menu.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); menu.focus(); } });
  }

  var form = document.getElementById('form');
  if (!form) return;
  var status = form.querySelector('.status');
  var button = form.querySelector('button[type="submit"]');
  var MAIL = 'tooeyteam@gmail.com';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    ['name', 'restaurant', 'email'].forEach(function (n) {
      var el = form.elements[n];
      var ok = el.value.trim() && (n !== 'email' || /.+@.+\..+/.test(el.value));
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !bad) bad = el;
    });
    if (bad) {
      status.textContent = bad.name === 'email' ? 'Add an email address we can reply to.' : 'Fill in your name, restaurant and email.';
      bad.focus();
      return;
    }
    if (form.elements._honey.value) return;
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    button.disabled = true;
    status.textContent = 'Sending…';
    fetch('https://formsubmit.co/ajax/' + MAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().then(function (j) { return r.ok && String(j.success) === 'true'; });
    }).then(function (ok) {
      if (!ok) throw new Error('not sent');
      form.reset();
      status.textContent = 'Sent. We’ll write back soon.';
    }).catch(function () {
      var body = encodeURIComponent('Name: ' + data.name + '\nRestaurant: ' + data.restaurant + '\nEmail: ' + data.email +
        (data.phone ? '\nPhone: ' + data.phone : '') + (data.pos ? '\nPOS: ' + data.pos : '') + (data.message ? '\n\n' + data.message : ''));
      status.innerHTML = 'That didn’t send. <a href="mailto:' + MAIL + '?subject=' + encodeURIComponent('New Tooey inquiry') + '&body=' + body + '">Email it to us instead</a>.';
    }).then(function () { button.disabled = false; });
  });
})();
