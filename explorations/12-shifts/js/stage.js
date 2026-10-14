// One night on the rota, scrubbed by scroll, as one continuous shot.
// Tuesday: six on, work for three. Saturday: the same six, work for nine.
// Then a pencilled rota cut to the night, the night pouring into the inked prep count,
// and a pencilled Tuesday that fills up. The rush is a spring-coupled height field, so it sloshes.
import {
  T0, T1, MAXROWS, INK, NIGHTS, FIT, PREP, clamp, mix, ease,
  geom, grid, tide, inkBrick, pencilBrick, growthLine, dayTag, tooeyRow, tooeyHeight, logoBox,
} from './core.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const section = document.querySelector('.rota');
const stage = document.querySelector('.stage');
const hero = document.querySelector('.hero');
const capsBox = document.querySelector('.captions');
const box = document.querySelector('.board');
const svg = document.querySelector('.board-live');
const caps = [...document.querySelectorAll('.captions li')];

if (section && svg && !reduce.matches) start();

function start() {
  root.classList.add('live');
  const NS = 'http://www.w3.org/2000/svg';
  const logo = document.createElementNS(NS, 'image');
  logo.setAttribute('href', 'logo.png');
  const dyn = document.createElementNS(NS, 'g');
  svg.append(logo, dyn);

  // ---- the rush: a height field sampled every six minutes across the night
  const M = 90;
  const ts = Array.from({ length: M + 1 }, (_, i) => T0 + (i * (T1 - T0)) / M);
  const curve = (fn) => ts.map(fn);
  const TUE = curve(NIGHTS.tue), SAT = curve(NIGHTS.sat), GROW = curve(NIGHTS.grow);
  const h = new Float32Array(M + 1), v = new Float32Array(M + 1);

  // ---- falling shifts: one spring per level (lift, in rows above its slot)
  const drop = Array.from({ length: MAXROWS }, () => ({ y: MAXROWS + 1, v: 0 }));
  let drops = []; // droplets for the pour into the prep count

  // ---- layout
  let W = 0, H = 0, compact = false, inStage = true;
  const CAPGAP = 6;
  let capsBottom = 0, capsTop = 0, heroBottom = 0, heroOff = 0, RUN = 1;
  function measure() {
    root.classList.remove('hero-flow');
    H = stage.clientHeight;
    W = box.clientWidth;
    compact = W < 640;
    heroBottom = hero.offsetTop + hero.offsetHeight;
    inStage = H - heroBottom >= Math.max(300, 0.38 * H);
    root.classList.toggle('hero-flow', !inStage);
    capsBottom = capsBox.offsetTop + capsBox.offsetHeight;
    heroBottom = hero.offsetTop + hero.offsetHeight;
    capsTop = capsBox.offsetTop;
    heroOff = inStage ? Math.max(0, heroBottom + CAPGAP - capsTop) : hero.offsetHeight;
    RUN = Math.round(H * 1.9);
    section.style.height = `${heroOff + H + RUN}px`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    if (shown >= 0) capH = capWant = caps[shown].offsetHeight;
  }

  let p = 0, lastP = 0, sy = 0;
  function readScroll() {
    sy = scrollY - section.offsetTop;
    p = clamp((sy - heroOff) / RUN);
  }

  let capH = 0, capWant = 0;
  let shift = 0; // the caption rides just under the headline until the headline has gone
  function board(p) {
    const heroNow = inStage ? heroBottom - Math.max(0, sy) : 0;
    shift = inStage ? Math.max(0, heroNow + CAPGAP - capsTop) : 0;
    const top = capsTop + shift + capH + (compact ? 26 : 30);
    const rows = mix(mix(7, MAXROWS, ease((p - 0.09) / 0.12)), 7, ease((p - 0.79) / 0.09));
    const card = compact ? 64 + 18 + 96 + 74 + 46 + 56 : 92 + 36 + 132 + 92 + 60 + 70;
    const zmax = clamp((W - 4) / card, 1, compact ? 1.3 : 1.6);
    const z = mix(1, zmax, ease((p - 0.54) / 0.07) * (1 - ease((p - 0.76) / 0.06)));
    const G = geom(W, H, { tooeyH: tooeyHeight(compact) * z, compact, top, rows, gap: compact ? 16 : 22 });
    G.z = z;
    return G;
  }

  const t0 = performance.now();
  const skipIntro = scrollY > 40;

  // ---- what the scene should be at progress p and intro time e (the deterministic part)
  function plan(G, p, e) {
    const toSat = ease((p - 0.1) / 0.12);
    const drain = ease((p - 0.56) / 0.12);
    const refill = ease((p - 0.79) / 0.09);
    let T;
    if (p < 0.5) T = (i) => mix(TUE[i], SAT[i], toSat);
    else if (p < 0.75) T = (i) => SAT[i] * (1 - drain);
    else T = (i) => TUE[i] * refill;

    // the inked rota: prints on load, steps back when the pencil arrives, gone before prep
    const inkFade = ease((p - 0.28) / 0.1);
    const inkGone = ease((p - 0.46) / 0.08);
    const ink = [];
    for (let k = 0; k < 6; k++) {
      ink.push({ k, a: INK.a, b: INK.b, draw: ease((e - 0.3 - 0.07 * k) / 0.42), alpha: mix(1, 0.22, inkFade) * (1 - inkGone), labelAlpha: 1 - ease((p - 0.28) / 0.06) });
    }

    // the pencilled rota
    const back = ease((p - 0.79) / 0.08);   // Saturday back to Tuesday
    const grow = ease((p - 0.88) / 0.07);   // the slow night fills
    const dim = mix(1, 0.4, ease((p - 0.55) / 0.05)) * mix(1, 2.5, ease((p - 0.76) / 0.04));
    const pen = FIT.sat.map((s, k) => {
      const b = { k, a: s.a, b: s.b, alpha: Math.min(1, dim), draw: 0, dx: 0, lift: 0 };
      if (k < 6) b.draw = ease((p - 0.3 - 0.014 * k) / 0.09);
      else { b.draw = 1; b.lift = drop[k].y; if (!wantsLanded(k)) b.alpha = 0; }
      if (k < FIT.tue.length) {
        const tt = FIT.tue[k], gg = FIT.grow[k];
        b.a = mix(mix(s.a, tt.a, back), gg.a, grow);
        b.b = mix(mix(s.b, tt.b, back), gg.b, grow);
      } else {
        const off = ease((back - 0.05 * (k - FIT.tue.length)) / 0.75);
        b.dx = -off * (G.X(b.b) + 60);
        b.alpha *= 1 - off;
        if (k === FIT.tue.length && p >= 0.91) { // one back on, for the fuller Tuesday
          const gg = FIT.grow[k];
          Object.assign(b, { a: gg.a, b: gg.b, dx: 0, alpha: 1, draw: 1, lift: drop[k].y });
        }
      }
      return b;
    });

    const useInk = 1 - ease((p - 0.3) / 0.12);
    return {
      T, fill: ease((e - 0.95) / 0.35), ink, pen, grow, useInk,
      spill: mix(0.22, 1, useInk) * (1 - ease((p - 0.56) / 0.06)) + (p > 0.6 ? 0.22 : 0),
      hatch: ease((e - 1.5) / 0.4) * (1 - ease((p - 0.54) / 0.04)) + (p > 0.8 ? ease((p - 0.84) / 0.04) * (1 - grow) : 0),
      day: p < 0.17 || p >= 0.8 ? 'Tue' : 'Sat',
      tooey: ease((e - 1.5) / 0.5),
      swipe: ease((e - 1.85) / 0.5),
      nums: numsAt(p),
      grid: ease(e / 0.6),
    };
  }

  function numsAt(p) {
    const t = ease((p - 0.57) / 0.11) * (1 - ease((p - 0.79) / 0.09));
    return PREP.tue.map((r, i) => r.map((n, j) => Math.round(mix(n, PREP.sat[i][j], t))));
  }

  // ---- physics, fixed step
  const DT = 1 / 120, K = 26, C = 37, DAMP = 0.982;
  function wantsLanded(k) {
    if (k >= 6) return p >= 0.38 + 0.025 * (k - 6);
    if (k === FIT.tue.length) return p >= 0.91;
    return false;
  }
  function step(P) {
    for (let i = 0; i <= M; i++) {
      const l = h[i > 0 ? i - 1 : 0], r = h[i < M ? i + 1 : M];
      const acc = K * (P.T(i) * P.fill - h[i]) + C * (l + r - 2 * h[i]);
      v[i] = (v[i] + acc * DT) * DAMP;
    }
    for (let i = 0; i <= M; i++) h[i] = Math.max(0, h[i] + v[i] * DT);
    for (let k = 0; k < MAXROWS; k++) {
      const d = drop[k], want = wantsLanded(k) ? 0 : MAXROWS + 1;
      d.v = (d.v + (want - d.y) * 260 * DT) * 0.965;
      d.y += d.v * DT;
      if (want === 0 && d.y < 0) { d.y = -d.y * 0.3; d.v = -d.v * 0.3; } // lands, with a small bounce
    }
    for (const q of drops) {
      q.vy += 1500 * DT;
      q.vx += (q.tx - q.x) * 9 * DT;
      q.vx *= 0.98;
      q.x += q.vx * DT; q.y += q.vy * DT;
    }
    drops = drops.filter((q) => q.y < q.ty);
  }

  // ---- droplets while the night pours into the prep count
  function pour(G, dp) {
    if (p < 0.55 || p > 0.7 || dp <= 0) return;
    const n = Math.min(18, Math.ceil(dp * 1400));
    const lb = logoBox(G);
    const tx = G.x0 + (lb.w + (compact ? 18 + 96 + 74 + 24 : 36 + 132 + 92 + 30)) * G.z;
    for (let j = 0; j < n; j++) {
      const i = Math.floor(M * (0.18 + Math.random() * 0.66));
      if (h[i] < 0.3) continue;
      drops.push({ x: G.X(ts[i]), y: G.Y(h[i]), vx: 0, vy: 20 + Math.random() * 60, tx: tx + (Math.random() - 0.5) * 30, ty: G.tooeyY + 44 * G.z, r: 2.6 + Math.random() * 2.6 });
    }
  }

  // ---- render
  function render(G, P) {
    const perHour = (G.x1 - G.x0) / (T1 - T0);
    const S = ts.map((t) => {
      let ink = 0, pen = 0;
      for (const b of P.ink) if (b.alpha > 0.01 && t >= b.a && t <= b.a + (b.b - b.a) * b.draw) ink += 1;
      for (const b of P.pen) {
        if (b.draw <= 0 || b.alpha < 0.05) continue;
        const a = b.a + b.dx / perHour;
        if (t >= a && t <= a + (b.b - b.a)) pen += clamp(1 - b.lift) * Math.min(1, b.draw * 1.5) * clamp(b.alpha * 2.5);
      }
      return mix(pen, ink, P.useInk);
    });
    const cap = G.rows + 0.35;
    const N = Array.from(h, (x) => (x > cap - 0.6 ? cap - 0.6 * Math.exp(-(x - cap + 0.6) / 0.6) : x));
    let out = grid(G, { alpha: P.grid, reach: P.grid });
    out += tide(G, ts, N, S, { hatch: clamp(P.hatch), spill: clamp(P.spill) });
    out += '<g filter="url(#graphite)">';
    if (P.grow > 0.01) out += growthLine(G, ts, ts.map((_, i) => mix(TUE[i], GROW[i], P.grow)), P.grow);
    for (const b of P.pen) out += pencilBrick(G, b);
    out += '</g>';
    for (const b of P.ink) out += inkBrick(G, b);
    out += dayTag(G, P.day, P.grid);
    for (const q of drops) out += `<circle class="drop" cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${q.r.toFixed(1)}"/>`;
    const zt = `translate(${G.x0} ${G.tooeyY}) scale(${G.z.toFixed(3)}) translate(${-G.x0} ${-G.tooeyY})`;
    out += `<g transform="${zt}">${tooeyRow(G, { alpha: P.tooey, swipe: P.swipe, nums: P.nums, logo: false })}</g>`;
    dyn.innerHTML = out;
    const lb = logoBox(G);
    logo.setAttribute('x', lb.x); logo.setAttribute('y', G.tooeyY + (lb.y - G.tooeyY) * G.z);
    logo.setAttribute('width', lb.w * G.z); logo.setAttribute('height', lb.h * G.z);
    logo.setAttribute('opacity', P.tooey.toFixed(2));
  }

  // ---- captions follow the acts, once the headline has scrolled clear
  const acts = [0, 0.13, 0.3, 0.55, 0.79];
  let shown = -2;
  function captions() {
    capsBox.style.transform = shift ? `translateY(${shift.toFixed(1)}px)` : '';
    let i = 0;
    for (let j = 0; j < acts.length; j++) if (p >= acts[j]) i = j;
    if (i !== shown) { caps.forEach((c, j) => c.classList.toggle('on', j === i)); shown = i; capWant = caps[i].offsetHeight; }
  }

  // ---- loop
  let acc = 0, last = performance.now(), running = false, visible = true;
  function frame(now) {
    if (!visible) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    readScroll();
    const e = skipIntro ? 9 : (now - t0) / 1000;
    capH += (capWant - capH) * Math.min(1, dt * 7);
    const G = board(p);
    pour(G, p - lastP);
    lastP = p;
    acc += dt;
    while (acc >= DT) { step(plan(G, p, e)); acc -= DT; }
    captions();
    render(G, plan(G, p, e));
    requestAnimationFrame(frame);
  }
  function wake() { if (!running && visible) { running = true; last = performance.now(); requestAnimationFrame(frame); } }

  new IntersectionObserver((en) => { visible = en[0].isIntersecting; wake(); }).observe(section);
  new ResizeObserver(() => { measure(); wake(); }).observe(stage);
  addEventListener('scroll', wake, { passive: true });
  reduce.addEventListener?.('change', () => location.reload());
  measure();
  readScroll();
  captions();
  capH = capWant;
  if (skipIntro) {
    const P = plan(board(p), p, 9);
    for (let i = 0; i <= M; i++) h[i] = P.T(i);
    for (let k = 0; k < MAXROWS; k++) if (wantsLanded(k)) drop[k].y = 0;
  }
  wake();
}
