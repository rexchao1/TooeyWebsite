/* Contact form: JSON to FormSubmit, with a mailto fallback when it fails. */
(function () {
  'use strict';
  const form = document.querySelector('.form');
  if (!form || !window.fetch) return;
  const status = form.querySelector('.status');
  const button = form.querySelector('button[type="submit"]');
  const ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';

  function say(text, kind, html) {
    status.className = 'status' + (kind ? ' ' + kind : '');
    if (html) status.innerHTML = html; else status.textContent = text;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const required = [...form.querySelectorAll('[required]')];
    let firstBad = null;
    required.forEach((el) => {
      const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) {
      say(firstBad.type === 'email' && firstBad.value.trim()
        ? 'Check the email address; it needs an @ and a domain.'
        : 'Add your name, restaurant, and email so we can reply.', 'err');
      firstBad.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return;            // a bot filled the hidden field
    button.disabled = true;
    say('Sending…');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || String(body.success) !== 'true') throw new Error('not sent');
      form.reset();
      say('Sent. We will reply to ' + data.email + '.', 'ok');
    } catch (e) {
      const mail = 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') +
        '&body=' + encodeURIComponent(
          ['Name: ' + data.name, 'Restaurant: ' + data.restaurant, 'Email: ' + data.email,
           data.phone ? 'Phone: ' + data.phone : '', data.pos ? 'POS: ' + data.pos : '', '', data.message || '']
            .filter((l, i) => l || i > 4).join('\n'));
      say('', 'err', 'Not sent: the form service did not answer. <a href="' + mail + '">Email it to tooeyteam@gmail.com</a> instead; your details are filled in.');
    } finally {
      button.disabled = false;
    }
  });
})();
