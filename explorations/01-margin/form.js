/* Pilot form: posts JSON to FormSubmit, with a mailto fallback. */
(() => {
  'use strict';
  const form = document.getElementById('form');
  const status = document.getElementById('status');
  if (!form || !status || !window.fetch) return;
  const button = form.querySelector('button[type="submit"]');
  const ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';

  function say(text, kind, link) {
    status.textContent = text;
    status.dataset.kind = kind || '';
    if (link) {
      status.append(' ');
      const a = document.createElement('a');
      a.href = link.href; a.textContent = link.text;
      status.append(a);
    }
  }

  function mailto(data) {
    const body = ['name', 'restaurant', 'email', 'phone', 'pos', 'message']
      .filter((k) => data[k]).map((k) => `${k}: ${data[k]}`).join('\n');
    return `mailto:tooeyteam@gmail.com?subject=${encodeURIComponent('New Tooey inquiry')}&body=${encodeURIComponent(body)}`;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    // the browser's own messages, field by field
    for (const el of form.querySelectorAll('input[required]')) el.setAttribute('aria-invalid', el.checkValidity() ? 'false' : 'true');
    const firstBad = form.querySelector('[aria-invalid="true"]');
    if (firstBad) {
      say('Add your name, restaurant, and a valid email, then send again.', 'error');
      firstBad.focus();
      return;
    }
    if (data._honey) return; // a bot filled the hidden field

    button.disabled = true;
    const label = button.textContent;
    button.textContent = 'Sending';
    say('Sending your note.', 'busy');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error('not sent');
      form.reset();
      say("Sent. We'll reply by email.", 'ok');
    } catch (e) {
      say('That did not send.', 'error', { href: mailto(data), text: 'Email us instead.' });
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
})();
