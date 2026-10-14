// "Put Tooey on your rota." Sends through FormSubmit, then pencils the restaurant in.
const form = document.querySelector('.form');
const sent = document.querySelector('.sent');

if (form && sent) {
  const note = form.querySelector('.form-note');
  const button = form.querySelector('button[type="submit"]');
  const ENDPOINT = 'https://formsubmit.co/ajax/tooeyteam@gmail.com';

  const mailto = (data) => {
    const body = ['name', 'restaurant', 'email', 'phone', 'pos', 'message']
      .filter((k) => data[k]).map((k) => `${k}: ${data[k]}`).join('\n');
    return `mailto:tooeyteam@gmail.com?subject=${encodeURIComponent('New Tooey inquiry')}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) e.target.removeAttribute('aria-invalid');
    if (!form.querySelector('[aria-invalid="true"]') && !button.disabled && button.textContent === 'Send') note.textContent = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('input[required]')];
    const bad = fields.filter((f) => !f.checkValidity());
    fields.forEach((f) => (f.checkValidity() ? f.removeAttribute('aria-invalid') : f.setAttribute('aria-invalid', 'true')));
    if (bad.length) {
      const WORDS = { name: 'your name', restaurant: 'your restaurant', email: 'your email' };
      const names = bad.map((f) => WORDS[f.name]);
      note.textContent = bad.some((f) => f.type === 'email' && f.value)
        ? 'That email address looks incomplete. Check it and send again.'
        : `We need ${names.join(', ').replace(/, ([^,]*)$/, ' and $1')} to reply.`;
      bad[0].focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) { done(data); return; } // a bot filled the trap: act sent, send nothing

    button.disabled = true;
    button.textContent = 'Sending…';
    note.textContent = '';
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error('not sent');
      done(data);
    } catch {
      button.disabled = false;
      button.textContent = 'Send again';
      note.innerHTML = '';
      note.append('That didn’t send. Email ');
      const a = document.createElement('a');
      a.href = mailto(data);
      a.textContent = 'tooeyteam@gmail.com';
      note.append(a, ' and we’ll pick it up from there.');
    }
  });

  function done(data) {
    const name = data.restaurant.length > 30 ? data.restaurant.slice(0, 29) + '…' : data.restaurant;
    sent.querySelector('.sent-name').textContent = name;
    sent.querySelector('.sent-text').textContent = `Pencilled in. We’ll write back to ${data.email} from tooeyteam@gmail.com.`;
    form.hidden = true;
    sent.hidden = false;
    sent.focus();
  }
}
