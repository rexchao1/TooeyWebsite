/* The night, as a long exposure.
   Every frame is a pure function of scroll progress p (0..1), so the
   scrub runs both ways exactly. The day's sales sit as a warm band at
   the horizon, lift into the sky, trail round a pole off the top of the
   screen, and at dawn each ring straightens into a dish's dotted leader. */
(() => {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const night = document.querySelector('.night');
  const stage = document.querySelector('.stage');
  const canvas = document.querySelector('.sky');
  const bar = document.querySelector('.bar');
  if (!night || !canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  const clockTime = document.querySelector('.clock span');
  const clockSuffix = document.querySelector('.clock i');
  const clockEl = document.querySelector('.clock');
  const title = document.querySelector('.sheet-title');
  const capB = document.querySelector('.cap-b');
  const rows = [...document.querySelectorAll('.sheet li')].map((li) => ({
    li,
    n: li.hasAttribute('data-new') ? 0 : +li.dataset.n,
    isNew: li.hasAttribute('data-new'),
    leader: li.querySelector('.leader'),
    track: li.querySelector('.track'),
    dish: li.querySelector('.dish'),
    num: li.querySelector('.num'),
    why: li.querySelector('.why'),
  }));

  /* ---------- small maths ---------- */
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const span = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const smooth = (p, a, b) => { const t = span(p, a, b); return t * t * (3 - 2 * t); };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const PASS = hex('#F0B35E');
  const STAR = hex('#D7DEF5');
  const INK = hex('#1B2147');

  /* sky: top, middle, bottom at each key */
  const SKY = [
    [0.00, '#232A58', '#1F2550', '#2E2A55'],
    [0.16, '#161C44', '#171E46', '#1D2350'],
    [0.56, '#10163A', '#121940', '#192048'],
    [0.66, '#141B44', '#1E2756', '#34407A'],
    [0.73, '#27326A', '#4E5E9C', '#B49BA8'],
    [0.79, '#8D9CC9', '#C3C9DE', '#F4C7A1'],
    [0.86, '#DCE4EF', '#E6EAF0', '#F1DDCB'],
    [0.94, '#E8EEF4', '#E8EEF4', '#E8EEF4'],
  ].map(([p, a, b, c]) => [p, hex(a), hex(b), hex(c)]);
  function skyAt(p) {
    let i = 0;
    while (i < SKY.length - 2 && p > SKY[i + 1][0]) i++;
    const A = SKY[i], B = SKY[i + 1];
    const t = easeSine(span(p, A[0], B[0]));
    return [mix(A[1], B[1], t), mix(A[2], B[2], t), mix(A[3], B[3], t)];
  }

  /* timeline */
  const T_TRAIL_END = 0.60;  // trails at full length
  const THETA = 0.44;        // exposure, in radians of sky rotation
  const START_MIN = 22 * 60 + 58, END_MIN = 24 * 60 + 5 * 60 + 41;

  let W = 0, H = 0, dpr = 1, P = { x: 0, y: 0 };
  let stars = [];
  let geo = [];
  let laidOut = false;
  let intro = 1;

  /* the day's sales by hour: lunch, a lull, the dinner push (illustrative shape) */
  const day = (x) => 0.10 + 0.55 * Math.exp(-((x - 0.2) ** 2) / 0.006) + Math.exp(-((x - 0.64) ** 2) / 0.016);

  function visibleArc(r) {
    let a0 = null, a1 = null;
    for (let k = 0; k <= 360; k++) {
      const a = (k / 360) * Math.PI;
      const x = P.x + r * Math.cos(a), y = P.y + r * Math.sin(a);
      if (x >= -4 && x <= W + 4 && y >= 0 && y <= H * 0.97) { if (a0 === null) a0 = a; a1 = a; }
    }
    return a0 === null ? null : [a0, a1];
  }

  function measure() {
    const s = stage.getBoundingClientRect();
    geo = rows.map((r) => {
      const t = r.track.getBoundingClientRect();
      const l = r.leader.getBoundingClientRect();
      const y = t.top + t.height / 2 - s.top;
      if (r.isNew) return { x0: t.left - s.left, L: Math.min(t.width * 0.42, 180), y, n: 0 };
      const L = l.width;
      const spacing = L / r.n;
      const per = Math.max(1, Math.ceil(5.5 / Math.max(spacing, 0.01)));
      const dots = Math.max(1, Math.round(r.n / per));
      return { x0: l.left - s.left, L, y, n: dots };
    });
  }

  function layout() {
    W = motion ? stage.clientWidth : night.clientWidth;
    H = motion ? stage.clientHeight : window.innerHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    const narrow = W < 700;
    P = { x: W * (narrow ? 0.94 : 0.80), y: -H * (narrow ? 0.16 : 0.36) };
    const rMin = H * 0.07 - P.y;
    const rMax = Math.hypot(P.x, H - P.y);
    const bands = rows.length;
    const band0 = rMin + (rMax - rMin) * 0.06, band1 = rMax * 0.97;
    const step = (band1 - band0) / bands;

    if (motion) measure();

    const rand = rng(41);
    stars = [];
    const area = (W * H) / (1440 * 900);
    const per = Math.max(2, Math.round(3 * Math.min(1.15, Math.max(0.55, area))));
    const fieldCount = Math.round(560 * Math.min(1.1, Math.max(0.42, area)));

    const home = () => {
      let x;
      for (;;) { x = rand(); if (rand() * 1.66 < day(x)) break; }
      const hx = W * (0.03 + 0.94 * x);
      const hy = H * 0.985 - Math.pow(rand(), 1.6) * day(x) * H * (narrow ? 0.11 : 0.24);
      return { hx, hy, xr: x };
    };

    const make = (r, band, j) => {
      const arc = visibleArc(r);
      if (!arc) return null;
      const tv = lerp(arc[0], arc[1], rand());
      const th0 = tv - THETA * rand();
      const h = home();
      const r0 = 0.035 + 0.09 * h.xr + 0.035 * rand();
      const mag = Math.pow(rand(), 2.4);
      return {
        r, th0, band, j,
        hx: h.hx, hy: h.hy, xr: h.xr,
        r0, r1: r0 + 0.13,
        a: band >= 0 ? 0.42 + 0.58 * mag : 0.2 + 0.5 * mag,
        w: mag > 0.82 ? 1.7 : 1.05,
        tick: 2 + rand() * 4,
        sx: rand(), sy: rand() - 0.5,
      };
    };

    rows.forEach((row, b) => {
      const g = geo[b];
      const count = row.isNew ? 5 : row.n * per;
      const dots = g ? g.n : row.n;
      for (let k = 0; k < count; k++) {
        const r = band0 + step * (b + 0.22 + 0.56 * rand());
        const s = make(r, b, row.isNew ? 0 : k % dots);
        if (s) stars.push(s);
      }
    });
    for (let k = 0; k < fieldCount; k++) {
      const r = lerp(rMin * 0.55, rMax * 1.04, Math.sqrt(rand()));
      const s = make(r, -1, 0);
      if (s) stars.push(s);
    }
    /* pair each star with a spot on the horizon by rank of x, so every
       spark rises nearly straight up and the field lifts in order */
    const homes = stars.map((st) => ({ hx: st.hx, hy: st.hy, xr: st.xr })).sort((a, b) => a.hx - b.hx);
    const order = stars.slice().sort((a, b) => Math.cos(a.th0) * a.r - Math.cos(b.th0) * b.r);
    order.forEach((st, i) => {
      const h = homes[i];
      st.hx = h.hx; st.hy = h.hy; st.xr = h.xr;
      st.r0 = 0.03 + 0.10 * h.xr + 0.03 * st.sx;
      st.r1 = st.r0 + 0.12;
    });
    laidOut = true;
  }

  /* ---------- drawing ---------- */
  const buckets = new Map();
  function bucket(color, alpha, width, fill) {
    const aq = Math.round(clamp(alpha) * 12) / 12;
    if (aq <= 0) return null;
    const key = `${color}|${aq}|${width}|${fill ? 1 : 0}`;
    let b = buckets.get(key);
    if (!b) { b = { color, alpha: aq, width, fill, path: new Path2D() }; buckets.set(key, b); }
    return b.path;
  }

  function quad(s, t) {
    const sx = P.x + s.r * Math.cos(s.th0), sy = P.y + s.r * Math.sin(s.th0);
    const cx = s.hx, cy = lerp(s.hy, sy, 0.6);
    const u = 1 - t;
    return [u * u * s.hx + 2 * u * t * cx + t * t * sx, u * u * s.hy + 2 * u * t * cy + t * t * sy];
  }

  function draw(p) {
    if (!laidOut) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const [top, mid, bot] = skyAt(p);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(top)); g.addColorStop(0.55, rgb(mid)); g.addColorStop(1, rgb(bot));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    buckets.clear();
    const dawnK = smooth(p, 0.70, 0.82);
    const lineCol = rgb(mix(STAR, INK, dawnK));
    const fieldFade = 1 - smooth(p, 0.63, 0.77);
    const colorSteps = 6;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const rt = span(p, s.r0, s.r1);

      if (rt <= 0) {
        /* still in the dining room: a warm tick on the horizon */
        const iv = intro >= 1 ? 1 : easeOut(clamp((intro - s.xr * 0.82) / 0.18));
        const path = bucket(rgb(PASS), (0.35 + 0.65 * s.a) * iv, 1.25, false);
        if (path) { path.moveTo(s.hx, s.hy); path.lineTo(s.hx, s.hy - s.tick * iv); }
        continue;
      }

      if (rt < 1) {
        /* lifting off: a short streak along its path, cooling as it climbs */
        const e = ease(rt);
        const [x1, y1] = quad(s, e);
        const [x0, y0] = quad(s, Math.max(0, e - 0.03));
        const cq = Math.round(e * colorSteps) / colorSteps;
        const a = s.band < 0 ? s.a * (0.6 + 0.4 * (1 - e)) : s.a;
        const path = bucket(rgb(mix(PASS, STAR, cq)), a, s.w, false);
        if (path) { path.moveTo(x0, y0); path.lineTo(x1 + 0.01, y1); }
        continue;
      }

      const tr = easeSine(span(p, s.r1, T_TRAIL_END));
      const d = Math.max(THETA * tr, 1.6 / s.r);

      if (s.band < 0) {
        const a = s.a * fieldFade;
        if (a <= 0.01) continue;
        const path = bucket(lineCol, a, s.w, false);
        if (path) {
          path.moveTo(P.x + s.r * Math.cos(s.th0), P.y + s.r * Math.sin(s.th0));
          path.arc(P.x, P.y, s.r, s.th0, s.th0 + d);
        }
        continue;
      }

      const row = geo[s.band];
      const lag = s.band * 0.01 + s.sx * 0.04;
      const u = motion && row ? ease(span(p, 0.585 + lag, 0.705 + lag)) : 0;

      if (u <= 0) {
        const path = bucket(lineCol, s.a, s.w, false);
        if (path) {
          path.moveTo(P.x + s.r * Math.cos(s.th0), P.y + s.r * Math.sin(s.th0));
          path.arc(P.x, P.y, s.r, s.th0, s.th0 + d);
        }
        continue;
      }

      /* dawn: the arc straightens (curvature to zero) and slides onto its row */
      const v = ease(span(p, 0.79 + s.band * 0.006, 0.85 + s.band * 0.006));
      const phm = s.th0 + d / 2;
      const m0x = P.x + s.r * Math.cos(phm), m0y = P.y + s.r * Math.sin(phm);
      let tau0 = phm + Math.PI / 2;
      const s0 = s.r * d;
      let mx, my, len, alpha = s.a;
      const k = (1 / s.r) * Math.pow(1 - u, 2);
      let tau1 = Math.cos(tau0) >= 0 ? 0 : Math.PI;
      tau0 = tau1 + Math.atan2(Math.sin(tau0 - tau1), Math.cos(tau0 - tau1));
      const tau = lerp(tau0, tau1, u);

      if (rows[s.band].isNew) {
        const tx = row.x0 + s.sx * row.L, ty = row.y + s.sy * 14;
        mx = lerp(m0x, tx, u); my = lerp(m0y, ty, u);
        len = s0 * Math.pow(1 - u, 1.5);
        alpha = s.a * (1 - smooth(p, 0.77, 0.83)) * 0.9;
      } else {
        const t1x = row.x0 + row.L / 2;
        mx = lerp(m0x, t1x, u); my = lerp(m0y, row.y, u);
        len = lerp(s0, row.L, u);
        const dx = row.x0 + ((s.j + 0.5) / row.n) * row.L;
        mx = lerp(mx, dx, v);
        len = lerp(len, 0, v);
        alpha = lerp(s.a * lerp(0.85, 0.3, u), 0.95, v);
      }
      if (alpha <= 0.01) continue;

      if (len < 1.2) {
        const path = bucket(lineCol, alpha, 0, true);
        if (path) { path.moveTo(mx + 1.6, my); path.arc(mx, my, 1.6, 0, Math.PI * 2); }
        continue;
      }
      const path = bucket(lineCol, alpha, s.w, false);
      if (!path) continue;
      const K = k * len < 0.02 ? 1 : 18;
      for (let q = 0; q <= K; q++) {
        const sg = (q / K - 0.5) * len;
        let lx, ly;
        if (k * Math.abs(sg) < 1e-4) { lx = sg; ly = 0; }
        else { lx = Math.sin(k * sg) / k; ly = (1 - Math.cos(k * sg)) / k; }
        const x = mx + lx * Math.cos(tau) - ly * Math.sin(tau);
        const y = my + lx * Math.sin(tau) + ly * Math.cos(tau);
        if (q === 0) path.moveTo(x, y); else path.lineTo(x, y);
      }
    }

    ctx.lineCap = 'round';
    for (const b of buckets.values()) {
      ctx.globalAlpha = b.alpha;
      if (b.fill) { ctx.fillStyle = b.color; ctx.fill(b.path); }
      else { ctx.strokeStyle = b.color; ctx.lineWidth = b.width; ctx.stroke(b.path); }
    }
    ctx.globalAlpha = 1;

    if (!motion) {
      /* the still frame sits behind the headline: shade the side the type is on */
      const narrow = W < 700;
      const sh = narrow ? ctx.createLinearGradient(0, 0, 0, H) : ctx.createLinearGradient(0, 0, W * 0.62, 0);
      sh.addColorStop(0, 'rgba(16,22,58,0.9)');
      sh.addColorStop(narrow ? 0.75 : 0.7, 'rgba(16,22,58,0.72)');
      sh.addColorStop(1, 'rgba(16,22,58,0)');
      ctx.fillStyle = sh;
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ---------- the type that rides on top ---------- */
  let lastMinute = -1;
  function text(p) {
    const m = Math.round(lerp(START_MIN, END_MIN, smooth(p, 0.02, 0.86))) % (24 * 60);
    if (m !== lastMinute) {
      lastMinute = m;
      const h24 = Math.floor(m / 60), mm = m % 60;
      const h12 = ((h24 + 11) % 12) + 1;
      clockTime.textContent = `${h12}:${String(mm).padStart(2, '0')}`;
      clockSuffix.textContent = h24 >= 12 ? 'pm' : 'am';
    }
    const ink = smooth(p, 0.74, 0.79);
    clockEl.style.color = rgb(mix(STAR, INK, ink));

    title.style.opacity = smooth(p, 0.78, 0.83);
    rows.forEach((r, b) => {
      const t = smooth(p, 0.79 + b * 0.007, 0.835 + b * 0.007);
      r.dish.style.opacity = t;
      if (r.num) {
        const c = smooth(p, 0.80 + b * 0.007, 0.87 + b * 0.007);
        r.num.style.opacity = Math.min(1, c * 3);
        r.num.textContent = Math.round(r.n * easeOut(c));
      }
      if (r.why) r.why.style.opacity = smooth(p, 0.82, 0.87);
    });
    capB.style.opacity = smooth(p, 0.87, 0.92);
    capB.style.transform = `translateY(${(1 - easeOut(span(p, 0.87, 0.93))) * 10}px)`;
  }

  /* ---------- header tone ---------- */
  let tone = 'night';
  function setTone(t) { if (t !== tone) { tone = t; bar.dataset.tone = t; } }

  /* ---------- scroll driver ---------- */
  let target = 0, shown = -1, raf = 0, last = 0;
  function progress() {
    const r = night.getBoundingClientRect();
    const range = r.height - window.innerHeight;
    return range > 0 ? clamp(-r.top / range) : 0;
  }
  function onScroll() {
    if (motion) {
      target = progress();
      setTone(target > 0.775 ? 'day' : 'night');
      bar.classList.toggle('away', target > 0.012 && target < 0.775);
      bar.classList.toggle('solid', night.getBoundingClientRect().bottom < 72);
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    } else {
      const darkEnd = stage.getBoundingClientRect().top + window.innerHeight * 0.3;
      setTone(darkEnd > 40 ? 'night' : 'day');
      bar.classList.toggle('solid', darkEnd <= 40);
    }
  }
  function tick(now) {
    const dt = Math.min(64, now - last); last = now;
    const k = 1 - Math.exp(-dt / 90);
    shown = shown < 0 ? target : shown + (target - shown) * k;
    if (Math.abs(target - shown) < 0.0004) shown = target;
    draw(shown);
    text(shown);
    raf = shown !== target ? requestAnimationFrame(tick) : 0;
  }

  function rebuild() {
    layout();
    if (motion) { shown = -1; target = progress(); cancelAnimationFrame(raf); raf = 0; onScroll(); }
    else draw(0.5);
  }

  /* on load: the day's sales fill in along the horizon, lunch then dinner */
  function runIntro() {
    const t0 = performance.now(), DUR = 2200;
    intro = 0;
    const step = (now) => {
      intro = clamp((now - t0) / DUR);
      if (target > 0.004) { intro = 1; lastMinute = -1; text(shown < 0 ? target : shown); }
      if (!raf) {
        draw(shown < 0 ? target : shown);
        /* the clock runs through service as the day's sales fill in */
        const m = Math.round(lerp(11 * 60, START_MIN, clamp(intro / 0.92)));
        lastMinute = -1;
        if (intro < 1) {
          const h24 = Math.floor(m / 60), h12 = ((h24 + 11) % 12) + 1;
          clockTime.textContent = `${h12}:${String(m % 60).padStart(2, '0')}`;
          clockSuffix.textContent = h24 >= 12 ? 'pm' : 'am';
        } else text(shown < 0 ? target : shown);
      }
      if (intro < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  let lastW = 0, lastH = 0, timer = 0;
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (w === lastW && Math.abs(h - lastH) < 140) return;
    lastW = w; lastH = h;
    clearTimeout(timer);
    timer = setTimeout(rebuild, 120);
  }

  function start() {
    lastW = window.innerWidth; lastH = window.innerHeight;
    rebuild();
    if (motion && progress() < 0.02) runIntro();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) mq.addEventListener('change', () => location.reload());
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();

})();
