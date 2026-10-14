// Page side of the take: decides whether it runs, moves the one canvas into
// whichever frame is in view, and wires the replay and guess/Tooey controls.
import { start } from './take.js';

const root = document.documentElement;
const params = new URLSearchParams(location.search);

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch (e) { return false; }
}

async function stillMode() {
  const r = await start({ still: params.get('still'), aspect: params.get('aspect') || 'w' });
  document.body.innerHTML = '';
  document.body.style.margin = '0';
  document.body.appendChild(r.canvas);
  window.__still = r.data();
}

async function live() {
  const frames = [...document.querySelectorAll('.frame[data-beat]')];
  const byBeat = new Map(frames.map(f => [Number(f.dataset.beat), f]));

  let take;
  try { take = await start({ debug: params.has('debug') }); } catch (e) { console.warn('Take unavailable, showing stills', e); return; }
  root.classList.add('take-on');
  // posters: until a frame has played, it shows where the camera will start
  // from (the previous beat's last frame), so the canvas takes over seamlessly
  const setPoster = (f, name) => {
    const pic = f.querySelector('.screen picture.own');
    if (!pic) return;
    pic.querySelector('source').srcset = `stills/${name}-p.webp`;
    pic.querySelector('img').src = `stills/${name}-w.webp`;
  };

  for (const f of frames) {
    const b = Number(f.dataset.beat);
    setPoster(f, b === 1 ? '0' : String(b - 1));
  }

  // the guess/Tooey control under the last frame
  const acc = byBeat.get(5);
  const toggle = acc && acc.querySelector('.versions');
  const btns = [];
  if (toggle) {
    for (const span of toggle.querySelectorAll('[data-v]')) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ver';
      b.dataset.v = span.dataset.v;
      b.textContent = span.textContent;
      b.setAttribute('aria-pressed', span.dataset.v === 'tooey' ? 'true' : 'false');
      b.addEventListener('click', () => {
        if (take.current !== 5) { mount(acc); take.play(5); }
        mark(b.dataset.v);
        take.setAcc(b.dataset.v);
      });
      span.replaceWith(b);
      btns.push(b);
    }
  }
  const mark = v => btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  take.setToggle = mark;

  let mounted = null;
  function fit() {
    if (!mounted) return;
    const r = mounted.querySelector('.screen').getBoundingClientRect();
    take.size(r.width, r.height);
  }
  function mount(f) {
    if (mounted === f) return;
    if (mounted) mounted.classList.remove('live');
    f.querySelector('.screen').appendChild(take.canvas);
    mounted = f;
    fit();
    take.draw();
    f.classList.add('live');
  }
  take.onShotEnd = (sh) => {
    const f = byBeat.get(sh.b);
    if (!f) return;
    f.classList.add('played');
    setPoster(f, String(sh.b));
  };

  for (const f of frames) {
    const btn = f.querySelector('.replay');
    if (!btn) continue;
    btn.hidden = false;
    btn.addEventListener('click', () => {
      mount(f);
      take.play(Number(f.dataset.beat), { replay: true });
    });
  }

  // whichever frame is most in view gets the camera
  const ratios = new Map();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) ratios.set(e.target, e.intersectionRatio);
    let best = null, br = 0;
    for (const [f, r] of ratios) if (r > br) { best = f; br = r; }
    if (best && br >= 0.5 && take.current !== Number(best.dataset.beat)) {
      mount(best);
      take.play(Number(best.dataset.beat));
    }
  }, { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] });
  if (!params.has('seq')) frames.forEach(f => io.observe(f.querySelector('.screen')));
  window.__seq = (a, b, t) => { mount(byBeat.get(b)); return take.debugShot(a, b, t); };
  // the observer reports screens; map them back to frames
  const screenToFrame = new Map(frames.map(f => [f.querySelector('.screen'), f]));
  const realSet = ratios.set.bind(ratios);
  ratios.set = (k, v) => realSet(screenToFrame.get(k) || k, v);

  let rt = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rt);
    rt = requestAnimationFrame(() => { fit(); take.draw(); });
  });

  window.__take = take;
}

if (params.has('still')) stillMode();
else {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && webglOK() && !params.has('nogl')) live();
}
