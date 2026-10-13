(() => {
  const form = document.getElementById('join');
  if (!form || !window.fetch) return;
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.status');
  const ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';
  const label = button.textContent;

  function say(kind, html) {
    status.className = 'status' + (kind ? ' ' + kind : '');
    status.innerHTML = html;
  }

  function mailto(data) {
    const body = [
      `Name: ${data.name || ''}`,
      `Restaurant: ${data.restaurant || ''}`,
      `Email: ${data.email || ''}`,
      data.phone ? `Phone: ${data.phone}` : '',
      data.pos ? `POS: ${data.pos}` : '',
      data.message ? `\n${data.message}` : '',
    ].filter(Boolean).join('\n');
    return 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
      e.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('input[required]')];
    const bad = fields.filter((f) => !f.checkValidity());
    fields.forEach((f) => {
      if (f.checkValidity()) f.removeAttribute('aria-invalid');
      else f.setAttribute('aria-invalid', 'true');
    });
    if (bad.length) {
      const names = bad.map((f) => form.querySelector(`label[for="${f.id}"]`).textContent.trim().toLowerCase().replace(/^your /, ''));
      say('err', `Add your ${names.join(', ').replace(/, ([^,]*)$/, ' and $1')} so we can reply.`);
      bad[0].focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return;

    button.disabled = true;
    button.textContent = 'Sending…';
    say('', 'Sending your request.');

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.name,
          restaurant: data.restaurant,
          email: data.email,
          phone: data.phone || '',
          pos: data.pos || '',
          message: data.message || '',
          _subject: 'New Tooey inquiry',
          _template: 'table',
          _captcha: 'false',
          _honey: '',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error('not sent');
      form.reset();
      button.textContent = 'Request sent';
      say('ok', 'Request sent. We’ll reply from tooeyteam@gmail.com.');
    } catch (err) {
      button.disabled = false;
      button.textContent = label;
      say('err', `It didn’t send. <a href="${mailto(data)}">Email it to tooeyteam@gmail.com</a> instead, or try again.`);
    }
  });
})();
