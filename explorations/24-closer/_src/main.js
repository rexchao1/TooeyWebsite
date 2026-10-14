// Page script: phone menu, contact form, and the hero scene (loaded on demand).
const doc = document.documentElement;
doc.classList.add('js');

// ---------- phone menu ----------
const menuBtn = document.querySelector('[data-menu]');
const nav = document.querySelector('#site-nav');
if (menuBtn && nav) {
  const close = () => { menuBtn.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); menuBtn.focus(); } });
}

// ---------- contact form ----------
const form = document.querySelector('[data-form]');
if (form) {
  const status = form.querySelector('[data-status]');
  const btn = form.querySelector('button[type="submit"]');
  const say = (html, state) => { status.innerHTML = html; status.dataset.state = state; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return;
    btn.disabled = true;
    btn.textContent = 'Sending';
    say('Sending your message.', 'sending');
    try {
      const res = await fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || String(body.success) !== 'true') throw new Error('not sent');
      form.reset();
      say('Sent. We will reply to the email you gave.', 'ok');
      btn.textContent = 'Sent';
    } catch (err) {
      const subject = encodeURIComponent('New Tooey inquiry');
      const text = encodeURIComponent(`Name: ${data.name || ''}\nRestaurant: ${data.restaurant || ''}\nEmail: ${data.email || ''}\nPhone: ${data.phone || ''}\nPOS: ${data.pos || ''}\n\n${data.message || ''}`);
      say(`Your message did not send. Email it to <a href="mailto:tooeyteam@gmail.com?subject=${subject}&body=${text}">tooeyteam@gmail.com</a> instead.`, 'error');
      btn.disabled = false;
      btn.textContent = 'Send';
    }
  });
}

// ---------- hero ----------
const pass = document.querySelector('[data-pass]');
const still = matchMedia('(prefers-reduced-motion: reduce)');
function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
if (pass && !still.matches && webglOK()) {
  import('./hero.js').then(async ({ Hero }) => {
    await document.fonts?.ready;
    const hero = new Hero(pass);
    window.__hero = hero;
    pass.classList.add('live');
    hero.resize();
    hero.seek(0);
    const btn = pass.querySelector('[data-pause]');
    btn.hidden = false;
    btn.addEventListener('click', () => {
      hero.paused = !hero.paused;
      btn.textContent = hero.paused ? 'Play' : 'Pause';
      btn.setAttribute('aria-pressed', String(hero.paused));
    });
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) hero.start(); else hero.stop();
    }, { threshold: 0.4 });
    io.observe(pass.querySelector('.stations'));
    still.addEventListener?.('change', ev => { if (ev.matches) { hero.stop(); hero.seek(4.6); } });
  }).catch(err => { console.warn('Scene unavailable, showing the still.', err); });
}
