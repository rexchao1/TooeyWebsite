// The tuning dial. A year of one dish's daily sales (sample data) drawn as ticks on a coil.
// The visitor turns the coil; at seven days a turn the weekly rhythm lines up and locks.
import { dishes, DAYS, WEEKDAYS, holidayIndex, arc, ring, width } from './sample.js';

const root = document.documentElement;
const fig = document.getElementById('dial');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

if (fig && !reduce.matches && window.HTMLCanvasElement) start();

function start() {
  const stage = fig.querySelector('.stage');
  const canvas = fig.querySelector('.coil');
  const knob = fig.querySelector('.knob');
  const hubNum = fig.querySelector('.hub .hub-num');
  const prepEl = fig.querySelector('[data-prep]');
  const daysEl = fig.querySelector('.days');
  const announce = fig.querySelector('[data-announce]');
  const ctx = canvas.getContext('2d');

  const dish = dishes.margherita;
  const values = dish.values;
  const hol = new Set(holidayIndex.map((h) => h.i));
  const vmax = Math.max(...values.filter((_, i) => !hol.has(i)));

  const SEVEN = 7, MIN = 5, MAX = 12.5, START = 10.6;
  const SNAP = 0.24, PULL = 0.6, RELEASE = 0.66; // detent: captured within SNAP, bent within PULL
  const DAYS_PER_TURN = 3.4; // one full turn of the knob moves the period this much

  const s = {
    raw: START,      // where the hand has put the dial
    P: START,        // what is drawn (spring-follows the detented raw value)
    v: 0,            // spring velocity
    fling: 0,        // raw velocity after release
    dragging: false,
    locked: false,
    lockAt: 0,
    intro: 0,        // 0..1 tape winding
    introStart: 0,
    touched: false,
    idleSince: 0,
    auto: false,
    visible: true,
    pulse: 0,
    reveal: 0,       // 0..1 after lock
    hold: 0,         // wheel ignored until then, after the detent catches it
  };

  let S = 0, dpr = 1;
  function size() {
    const r = stage.getBoundingClientRect();
    S = r.width;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(S * dpr);
    canvas.height = Math.round(S * dpr);
    placeLabels();
    wake();
  }

  const geo = () => ({ cx: S / 2, cy: S / 2, inner: S * 0.1, outer: S * 0.425, vmax });

  // Weekday names, positioned for the locked state.
  WEEKDAYS.forEach((w) => { const el = document.createElement('span'); el.textContent = w; daysEl.append(el); });
  function placeLabels() {
    const g = geo();
    [...daysEl.children].forEach((el, k) => {
      const a = (2 * Math.PI * (k + 0.5)) / 7 - Math.PI / 2;
      const r = S * 0.458;
      el.style.left = `${g.cx + Math.cos(a) * r}px`;
      el.style.top = `${g.cy + Math.sin(a) * r}px`;
    });
  }
  // Detent: the dial pulls toward seven near it and holds it there.
  function detent(raw) {
    const d = raw - SEVEN, ad = Math.abs(d);
    if (ad <= SNAP) return SEVEN;
    if (ad < PULL) return SEVEN + Math.sign(d) * ((ad - SNAP) / (PULL - SNAP)) * PULL;
    return raw;
  }

  // The opening: the year starts as a flat ribbon, as thick as each day's sales, and winds up
  // like tape. Curl c turns each day by c * 2pi/P; at c = 1 it is the coil at START days a turn.
  const SUB = 5, N = DAYS * SUB + 1;
  const tape = new Float32Array(N * 2);
  function windTape(c, P) {
    const g = geo();
    const step0 = (S * 0.9) / (N - 1);
    const dh = (c * 2 * Math.PI) / P / SUB;
    let x = 0, y = 0, h = 0;
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (let k = 0; k < N; k++) {
      const r = g.inner + ((g.outer - g.inner) * k) / (N - 1);
      const ds = Math.max(step0, r * dh);
      tape[k * 2] = x; tape[k * 2 + 1] = y;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      x += Math.cos(h + dh / 2) * ds; y += Math.sin(h + dh / 2) * ds;
      h += dh;
    }
    return [g.cx - (minX + maxX) / 2, g.cy - (minY + maxY) / 2];
  }

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, t) => { t = clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // Colours come from the stylesheet so the page has one palette.
  const css = getComputedStyle(root);
  const hex = (v) => { const h = css.getPropertyValue(v).trim().replace('#', ''); return [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16)).join(','); };
  const INK = hex('--ink');
  const MARK = `rgb(${hex('--mark')})`;

  function draw() {
    const g = geo();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    ctx.lineCap = 'butt';

    // Knurled rim: turns with the hand.
    const turn = ((START - s.P) / DAYS_PER_TURN) * 2 * Math.PI;
    const rimIn = S * 0.488, rimOut = S * 0.5;
    const rimA = smooth(0.6, 1, s.intro);
    if (rimA > 0) {
      ctx.strokeStyle = `rgba(${INK},${0.42 * rimA})`;
      ctx.lineWidth = Math.max(1, S * 0.0022);
      ctx.beginPath();
      for (let k = 0; k < 140; k++) {
        const a = turn + (k / 140) * 2 * Math.PI;
        const r0 = k % 10 === 0 ? rimOut - (rimOut - rimIn) * 2 : rimIn;
        ctx.moveTo(g.cx + Math.cos(a) * r0, g.cy + Math.sin(a) * r0);
        ctx.lineTo(g.cx + Math.cos(a) * rimOut, g.cy + Math.sin(a) * rimOut);
      }
      ctx.stroke();
    }

    const dim = 1 - 0.2 * smooth(0.3, 0.75, s.reveal);
    ctx.strokeStyle = `rgba(${INK},${(0.86 + 0.14 * s.pulse) * dim})`;

    if (s.intro < 1) {
      // A pen lays the year down left to right as a flat ribbon, then the ribbon winds up.
      const drawn = ease(clamp(s.intro / 0.3, 0, 1)) * DAYS;
      const c = Math.pow(smooth(0.34, 1, s.intro), 2.6);
      const [ox, oy] = windTape(c, START);
      const exact = smooth(0.88, 1, s.intro);
      const flatW = S * 0.13;
      const wScale = Math.min(flatW, ring(g, START / Math.max(c, 1e-4)) * 0.94);
      for (let i = 0; i < Math.ceil(drawn); i++) {
        const v = values[i];
        if (!v) continue;
        const part = clamp(drawn - i, 0, 1);
        ctx.lineWidth = Math.pow(v / vmax, 1.35) * wScale;
        ctx.beginPath();
        if (exact > 0) {
          const [a0, a1, r] = arc(i, START, g);
          for (let k = 0; k <= SUB; k++) {
            const t = k / SUB, q = (i * SUB + k) * 2;
            const a = a0 + (a1 - a0) * t;
            const x = ox + tape[q], y = oy + tape[q + 1];
            const px = x + (g.cx + Math.cos(a) * r - x) * exact, py = y + (g.cy + Math.sin(a) * r - y) * exact;
            k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
        } else {
          const q0 = i * SUB * 2;
          ctx.moveTo(ox + tape[q0], oy + tape[q0 + 1]);
          for (let k = 1; k <= SUB * part; k++) ctx.lineTo(ox + tape[q0 + k * 2], oy + tape[q0 + k * 2 + 1]);
        }
        ctx.stroke();
      }
      return;
    }

    for (let i = 0; i < DAYS; i++) {
      const v = values[i];
      if (!v) continue;
      const [a0, a1, r] = arc(i, s.P, g);
      ctx.lineWidth = width(v, s.P, g) * (1 + 0.18 * s.pulse);
      ctx.beginPath();
      ctx.arc(g.cx, g.cy, r, a0, a1);
      ctx.stroke();
    }

    // Tomorrow: the next stretch of ribbon, drawn on a spring after the lock.
    const grow = s.reveal > 0.4 ? spring(clamp((s.reveal - 0.4) / 0.6, 0, 1)) : 0;
    if (grow > 0) {
      const [a0, a1, r] = arc(DAYS, SEVEN, g);
      const w = Math.max(3, width(dish.next.length, SEVEN, g) * 1.5);
      ctx.strokeStyle = MARK;
      ctx.lineWidth = w * Math.max(0.3, Math.min(1.25, grow));
      ctx.beginPath();
      ctx.arc(g.cx, g.cy, r + w * 0.3, a0, a0 + (a1 - a0) * Math.min(1, grow));
      ctx.stroke();
    }
  }

  // Under-damped spring from 0 to 1, for tomorrow's stroke.
  function spring(t) { return 1 - Math.exp(-6 * t) * Math.cos(11 * t); }

  // Animation loop, idle when nothing moves.
  let raf = 0, last = 0;
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    let busy = false;

    if (s.intro < 1) {
      s.intro = clamp((now - s.introStart) / 2900, 0, 1);
      busy = true;
      if (s.intro === 1) { s.idleSince = now; nudgeLater(); }
      fig.classList.toggle('coiled', s.intro > 0.8);
    } else {
      // Auto-tune: a gentle hand if nobody has touched the dial.
      if (!s.touched && !s.locked && s.visible && now - s.idleSince > 4200) s.auto = true;
      if (s.auto && !s.touched) {
        const d = SEVEN - s.raw;
        s.raw += Math.sign(d) * Math.min(Math.abs(d), (0.25 + Math.abs(d) * 1.1) * dt);
        busy = true;
      }
      if (!s.dragging && s.fling) {
        s.raw = clamp(s.raw + s.fling * dt, MIN, MAX);
        s.fling *= Math.pow(0.04, dt);
        if (Math.abs(s.raw - SEVEN) < SNAP && Math.abs(s.fling) < 2.2) s.fling = 0;
        if (Math.abs(s.fling) < 0.02) s.fling = 0;
        busy = true;
      }
      const target = detent(s.raw);
      // Critically damped follow.
      const k = 260, c = 2 * Math.sqrt(k);
      s.v += (k * (target - s.P) - c * s.v) * dt;
      s.P += s.v * dt;
      if (Math.abs(target - s.P) < 1e-4 && Math.abs(s.v) < 1e-3) { s.P = target; s.v = 0; } else busy = true;

      const atSeven = target === SEVEN && Math.abs(s.P - SEVEN) < 0.004;
      if (!s.locked && atSeven && (!s.dragging || now - s.lockAt > 260)) lock(now);
      if (!atSeven || target !== SEVEN) s.lockAt = now;
      if (s.locked && Math.abs(s.raw - SEVEN) > RELEASE) unlock();

      if (s.pulse > 0) { s.pulse = Math.max(0, s.pulse - dt * 2.6); busy = true; }
      const want = s.locked ? 1 : 0;
      if (s.reveal !== want) {
        s.reveal = want ? Math.min(1, s.reveal + dt / 2.2) : Math.max(0, s.reveal - dt / 0.4);
        busy = true;
        stepReveal();
      }
      updateReadout();
    }
    draw();
    if (busy) raf = requestAnimationFrame(frame);
  }

  function lock(now) {
    s.locked = true; s.auto = false; s.fling = 0; s.raw = SEVEN; s.pulse = 1;
    fig.classList.add('locked');
    if (navigator.vibrate && s.dragging) navigator.vibrate(8);
    announce.textContent = `Locked at seven days a turn. Fridays and Saturdays line up longest. Tomorrow: ${dish.next.prep} margheritas to prep.`;
  }
  function unlock() {
    s.locked = false;
    fig.classList.remove('locked', 'told');
    [...daysEl.children].forEach((el) => el.classList.remove('on'));
    announce.textContent = '';
  }
  function stepReveal() {
    [...daysEl.children].forEach((el, k) => el.classList.toggle('on', s.locked && s.reveal > 0.04 + k * 0.03));
    const told = s.locked && s.reveal > 0.5;
    if (told && !fig.classList.contains('told')) { fig.classList.add('told'); countUp(); }
  }
  function countUp() {
    const end = dish.next.prep, t0 = performance.now();
    const step = (now) => {
      const t = clamp((now - t0) / 700, 0, 1);
      prepEl.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1 && fig.classList.contains('told')) requestAnimationFrame(step);
      else prepEl.textContent = end;
    };
    requestAnimationFrame(step);
  }
  let shown = '';
  function updateReadout() {
    const p = Math.abs(s.P - SEVEN) < 0.05 ? '7' : s.P.toFixed(1);
    if (p !== shown) {
      shown = p;
      hubNum.textContent = p;
      knob.setAttribute('aria-valuenow', s.raw.toFixed(1));
      knob.setAttribute('aria-valuetext', `${p} days a turn`);
    }
  }

  function touch() { s.touched = true; s.auto = false; }
  // The loop sleeps when nothing moves, so wake it when the auto-tune is due.
  let nudge = 0;
  function nudgeLater() {
    clearTimeout(nudge);
    if (!s.touched && !s.locked) nudge = setTimeout(wake, Math.max(0, 4200 - (performance.now() - s.idleSince)) + 30);
  }

  // Pointer: turn around the centre like a knob.
  let lastA = 0, lastT = 0, lastX = 0;
  const angleAt = (e) => {
    const r = stage.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  };
  knob.addEventListener('pointerdown', (e) => {
    if (s.intro < 1) return;
    touch();
    s.dragging = true; s.fling = 0;
    lastA = angleAt(e); lastT = performance.now(); lastX = e.clientX;
    knob.setPointerCapture(e.pointerId);
    wake();
  });
  knob.addEventListener('pointermove', (e) => {
    if (!s.dragging) return;
    const r = stage.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const a = Math.atan2(dy, dx);
    let da = a - lastA;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    // Near the centre the angle is jumpy; use sideways travel instead.
    if (Math.hypot(dx, dy) < r.width * 0.12) da = (e.clientX - lastX) / (r.width * 0.3);
    lastA = a; lastX = e.clientX;
    const dP = (-da / (2 * Math.PI)) * DAYS_PER_TURN;
    const now = performance.now();
    const dtt = Math.max(1, now - lastT) / 1000; lastT = now;
    s.raw = clamp(s.raw + dP, MIN, MAX);
    s.fling = s.fling * 0.6 + (dP / dtt) * 0.4;
    wake();
  });
  const end = (e) => {
    if (!s.dragging) return;
    s.dragging = false;
    if (performance.now() - lastT > 80) s.fling = 0;
    s.fling = clamp(s.fling, -14, 14);
    wake();
  };
  knob.addEventListener('pointerup', end);
  knob.addEventListener('pointercancel', end);

  // Wheel tunes until the lock, then lets the page scroll on.
  knob.addEventListener('wheel', (e) => {
    if (s.intro < 1 || s.locked) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const px = e.deltaMode === 1 ? d * 16 : e.deltaMode === 2 ? d * 400 : d;
    const now = performance.now();
    if (now < s.hold) { e.preventDefault(); return; }
    let next = clamp(s.raw - px * 0.0042, MIN, MAX);
    if (next === s.raw) return;
    e.preventDefault();
    touch();
    // The detent catches the wheel: crossing or nearing seven stops there for a moment.
    if ((s.raw - SEVEN) * (next - SEVEN) <= 0 || Math.abs(next - SEVEN) < SNAP) { next = SEVEN; s.hold = now + 700; }
    s.raw = next; s.fling = 0;
    wake();
  }, { passive: false });

  // Keys: arrows nudge, page keys jump, Home and End go to the ends.
  knob.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.5 : 0.2;
    const map = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step, PageDown: -1, PageUp: 1 };
    let next = s.raw;
    if (e.key in map) next += map[e.key];
    else if (e.key === 'Home') next = MIN;
    else if (e.key === 'End') next = MAX;
    else return;
    e.preventDefault();
    touch();
    if (s.intro < 1) s.introStart = -1e9;
    fig.classList.add('coiled');
    // Keys step through the detent cleanly.
    if (Math.abs(next - SEVEN) < SNAP + 0.01 || (s.raw - SEVEN) * (next - SEVEN) < 0) next = s.locked ? next : SEVEN;
    if (s.locked && Math.abs(next - SEVEN) <= RELEASE) next = SEVEN + Math.sign(next - SEVEN) * (RELEASE + 0.01);
    s.raw = clamp(next, MIN, MAX); s.fling = 0;
    wake();
  });

  new IntersectionObserver(([en]) => {
    s.visible = en.intersectionRatio > 0.45;
    if (s.visible && !s.touched && !s.locked && s.intro === 1) { s.idleSince = Math.max(s.idleSince, performance.now() - 2500); nudgeLater(); }
  }, { threshold: [0, 0.45, 1] }).observe(stage);

  root.classList.add('live');
  fig.classList.add('live');
  new ResizeObserver(size).observe(stage);
  size();
  s.introStart = performance.now() + 250;
  wake();

  // Test hook: ?p=8.4 freezes the dial at a period (used for frame captures).
  const q = new URLSearchParams(location.search);
  if (q.has('p')) {
    s.introStart = -1e9; s.touched = true;
    s.raw = s.P = clamp(parseFloat(q.get('p')), MIN, MAX);
    wake();
  }
}
