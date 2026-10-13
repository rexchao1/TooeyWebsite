(() => {
  const form = document.getElementById('form');
  if (!form) return;
  const status = form.querySelector('.status');
  const button = form.querySelector('.btn-send');
  const ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';
  const MAIL = 'tooeyteam@gmail.com';

  const say = (text, kind, withMail) => {
    status.className = 'status' + (kind ? ' is-' + kind : '');
    status.textContent = text;
    if (withMail) {
      const a = document.createElement('a');
      a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('New Tooey inquiry');
      a.textContent = MAIL;
      status.append(' ', a, '.');
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const required = [...form.querySelectorAll('[required]')];
    let first = null;
    required.forEach((el) => {
      const bad = !el.value.trim() || (el.type === 'email' && !el.checkValidity());
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !first) first = el;
    });
    if (first) {
      say('Add your name, restaurant, and a valid email, then send again.', 'error');
      first.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return;

    button.disabled = true;
    button.textContent = 'Sending…';
    say('');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || String(body.success) !== 'true') throw new Error('not sent');
      form.reset();
      button.textContent = 'Sent';
      say('Sent. We’ll reply by email.', 'ok');
      setTimeout(() => { button.disabled = false; button.textContent = 'Send'; }, 4000);
    } catch (err) {
      button.disabled = false;
      button.textContent = 'Send';
      say('Your message didn’t send. Try again, or email us at', 'error', true);
    }
  });
})();
