/* The story: six weeks of plates on a calendar, one dot per plate sold.
   Scroll picks out what Tooey looks at, fills tomorrow's tray from past
   Tuesdays, then tries a dish that is too new and leaves its line blank.
   Every frame is a pure function of scroll progress p (0..1), so scrubbing
   backwards is exact. All figures are example data. */
(() => {
  const story = document.querySelector('.story');
  const board = document.querySelector('.board');
  if (!story || !board) return;

  const COLOR = { plate: '#FBFCFF', glove: '#B4C4FF', yolk: '#FFC93C', roll: '#2340C8' };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- example data ---------- */
  // Day 0 is Monday, Sep 7 (Labor Day). Day 35 is Monday, Oct 12 (today).
  // Day 36 is tomorrow, Tuesday Oct 13: the tray.
  const byWeekday = [
    [46, 27, 29, 26, 28, 30],   // Mon (first is Labor Day)
    [36, 39, 35, 41, 37],       // Tue
    [33, 31, 34, 30, 35],       // Wed
    [36, 38, 34, 37, 39],       // Thu
    [44, 46, 43, 47, 45],       // Fri
    [47, 48, 46, 48, 47],       // Sat
    [40, 38, 41, 39, 42],       // Sun
  ];
  const DAYS = 36, TRAY = 36, PRED = 38, PREP = 41, TUE = 1, HOLIDAY = 0;
  const marg = [];
  for (let i = 0; i < DAYS; i++) marg.push(byWeekday[i % 7][Math.floor(i / 7)]);
  const birria = new Array(DAYS).fill(0);
  [6, 3, 5, 4, 8, 9, 7, 4, 5].forEach((n, j) => { birria[27 + j] = n; }); // on the menu from Sun Oct 4

  // where tomorrow's 38 plates come from: mostly past Tuesdays, some from everywhere else
  const SOURCES = (() => {
    const out = [], used = {};
    const take = (i) => { used[i] = (used[i] || 0) + 1; out.push([i, Math.max(0, marg[i] - used[i])]); };
    const others = [35, 0, 9, 18, 26, 4, 13, 30, 21, 33, 11, 24, 16];
    let n = 0;
    while (out.length < 38) {
      if (n % 3 === 2 && others.length) take(others.shift());
      else take(TUE + (n % 5) * 7);
      n++;
    }
    return out;
  })();

  const dateOf = (i) => {
    const d = new Date(2026, 8, 7 + i);
    const m = d.getMonth() === 8 ? 'Sep' : 'Oct';
    const n = d.getDate();
    return (i === 0 || n === 1) ? `${m} ${n}` : String(n);
  };

  /* ---------- easing ---------- */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);
  const inOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  // fall under gravity, then a small settle
  const drop = (t) => {
    if (t <= 0) return { k: 0, bounce: 0 };
    if (t < .8) { const u = t / .8; return { k: u * u, bounce: 0 }; }
    const u = (t - .8) / .2;
    return { k: 1, bounce: Math.sin(Math.PI * u) * (1 - u) };
  };

  /* ---------- beats ---------- */
  const BEATS = [
    ['hero', 0, .06],
    ['sales', .06, .14],
    ['weekday', .14, .235],
    ['season', .235, .32],
    ['holiday', .32, .405],
    ['nothing', .405, .475],
    ['count', .475, .735],
    ['blank', .735, .905],
    ['check', .905, 1.01],
  ];

  /* ---------- layout ---------- */
  function layout(w, h, fitHeight) {
    const header = 26;
    let s = w / 50.4;
    if (fitHeight) s = Math.min(s, (h - header - 30) / 63.4);
    s = Math.min(s, 14);
    const lab = Math.max(13, s * 1.7);
    const gx = s * 1.4, gy = s * 1.1;
    const cw = 6 * s, ch = lab + 8 * s;
    const W = 7 * cw + 6 * gx;
    const H = header + 6 * ch + 5 * gy;
    const ox = Math.max(0, (w - W) / 2);
    const oy = fitHeight ? Math.max(0, (h - H) / 2) : 0;
    const font = clamp(s * 0.98, 9, 12.5);
    return { s, lab, gx, gy, cw, ch, W, H, ox, oy, header, font, r: s * 0.37, vw: w, vh: h };
  }
  const cellX = (L, i) => L.ox + (i % 7) * (L.cw + L.gx);
  const cellY = (L, i) => L.oy + L.header + Math.floor(i / 7) * (L.ch + L.gy);
  const plateXY = (L, i, k) => {
    const row = Math.floor(k / 6), col = k % 6;
    return [cellX(L, i) + (col + .5) * L.s, cellY(L, i) + L.lab + (7 - row + .5) * L.s];
  };

  /* ---------- drawing ---------- */
  function dot(ctx, x, y, r, color, a) {
    if (a <= 0.004) return;
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function label(ctx, L, text, x, y, color, a, maxW, weight = 500) {
    if (a <= 0.004) return;
    let size = L.font;
    ctx.font = `${weight} ${size}px "Host Grotesk", system-ui, sans-serif`;
    if (maxW) {
      const w = ctx.measureText(text).width;
      if (w > maxW) { size = Math.max(6.5, size * maxW / w); ctx.font = `${weight} ${size}px "Host Grotesk", system-ui, sans-serif`; }
    }
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // fill-in on load: last night's download arriving, day by day
  const appear = (fill, i, k) => clamp((fill - i * 30 - k * 3.5) / 240);

  function draw(ctx, L, p, fill, opts = {}) {
    const { s, r } = L;
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';

    // the camera leans in on the new dish's few weeks and tomorrow's tray
    if (opts.crop) ctx.translate(0, -(cellY(L, 21) - L.s * .9));
    const zb = opts.static ? 0 : inOut(seg(p, .735, .79));
    if (zb > 0) {
      const x0 = L.ox - s, x1 = L.ox + L.W + s;
      const y0 = cellY(L, 21) - s * .5, y1 = cellY(L, TRAY) + L.ch + s;
      const Z = Math.max(1, Math.min(L.vw / (x1 - x0), L.vh / (y1 - y0), 1.7));
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      const k = 1 - zb + zb * Z;
      ctx.translate(zb * (L.vw / 2 - mx * Z), zb * (L.vh / 2 - my * Z));
      ctx.scale(k, k);
    }

    const back = outCubic(seg(p, .41, .46));
    const dim = (col) => outCubic(seg(p, .145 + .011 * Math.abs(col - TUE), .2 + .011 * Math.abs(col - TUE))) * (1 - .55 * back);
    const dates = seg(p, .24, .3);
    const ring = seg(p, .325, .39);
    const trayIn = opts.static ? 1 : outCubic(clamp((fill - 900) / 700));
    const out = (i) => seg(p, .70 + (i % 7) * .0035 + Math.floor(i / 7) * .002, .735 + (i % 7) * .0035 + Math.floor(i / 7) * .002);
    const dishB = p > .70;

    // weekday letters
    'MTWTFSS'.split('').forEach((c, col) => {
      const x = L.ox + col * (L.cw + L.gx);
      const lit = col === TUE ? 1 : 1 - .45 * dim(col);
      label(ctx, L, c, x, L.oy + L.header - 12, col === TUE ? COLOR.plate : COLOR.glove, lit * (1 - zb), 0, col === TUE && dim(col) > .5 ? 700 : 500);
    });

    // date labels, and the holiday name
    for (let i = 0; i <= TRAY; i++) {
      const x = cellX(L, i), y = cellY(L, i) + L.lab - Math.max(4, s * .45);
      if (i === TRAY) {
        label(ctx, L, 'Tomorrow', x, y - s * .35, COLOR.plate, trayIn, L.cw + L.gx * .8, 600);
        continue;
      }
      const col = i % 7;
      const a = outCubic(clamp(dates * 1.6 - i / DAYS * .6)) * (i < 21 ? 1 - zb : 1);
      if (i === HOLIDAY && ring > 0) {
        label(ctx, L, dateOf(i), x, y, COLOR.glove, a * (1 - ring), L.cw);
        label(ctx, L, 'Labor Day', x, y, COLOR.plate, ring * (1 - zb), L.cw + L.gx * .25, 600);
      } else {
        label(ctx, L, dateOf(i), x, y, col === TUE ? COLOR.plate : COLOR.glove, a * (col === TUE ? 1 : .85), L.cw);
      }
    }

    // holiday ring around Labor Day
    if (ring > 0 && !(dishB && seg(p, .70, .74) >= 1)) {
      const x = cellX(L, HOLIDAY) - s * .7, y = cellY(L, HOLIDAY) - s * .45;
      const w = L.cw + s * 1.4, h = L.ch + s * .85;
      const fade = 1 - seg(p, .70, .735);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.strokeStyle = COLOR.plate;
      ctx.lineWidth = Math.max(1.5, s * .16);
      const per = 2 * (w + h);
      ctx.setLineDash([per * outCubic(ring), per]);
      roundRect(ctx, x, y, w, h, s * .9);
      ctx.stroke();
      ctx.restore();
    }

    // tomorrow's tray: outline and empty slots
    if (trayIn > 0) {
      const x = cellX(L, TRAY) - s * .45, y = cellY(L, TRAY) + L.lab - s * .45;
      ctx.save();
      ctx.globalAlpha = trayIn;
      ctx.strokeStyle = COLOR.plate;
      ctx.lineWidth = Math.max(1.5, s * .14);
      roundRect(ctx, x, y, L.cw + s * .9, 8 * s + s * .9, s * .7);
      ctx.stroke();
      ctx.restore();
      for (let k = 0; k < 48; k++) {
        const [px, py] = plateXY(L, TRAY, k);
        ctx.globalAlpha = trayIn * .38;
        ctx.strokeStyle = COLOR.glove;
        ctx.lineWidth = Math.max(.75, s * .08);
        ctx.beginPath(); ctx.arc(px, py, r * .7, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // Margherita plates
    let landed = 0, yolks = 0;
    if (!opts.onlyB) {
      for (let i = 0; i < DAYS; i++) {
        const col = i % 7;
        const o = out(i);
        const d = col === TUE ? 0 : dim(col);
        let a = 1 - .7 * d;
        let color = d > .5 ? COLOR.glove : COLOR.plate;
        if (i === HOLIDAY) a = Math.max(a, .3 + .45 * ring);
        if (i === HOLIDAY && ring > .5) color = COLOR.plate;
        for (let k = 0; k < marg[i]; k++) {
          const ap = opts.static ? 1 : appear(fill, i, k);
          if (ap <= 0) continue;
          let [x, y] = plateXY(L, i, k);
          y -= (1 - outCubic(ap)) * s * 1.2;
          let aa = a * ap;
          if (o > 0) { y += o * o * L.H * .7; aa *= 1 - o; }
          dot(ctx, x, y, r, color, aa);
        }
      }

      // 38 plates drop from the five past Tuesdays into tomorrow's tray
      const fallOut = seg(p, .705, .74);
      for (let j = 0; j < PRED; j++) {
        const [src, k] = SOURCES[j];
        const t0 = .485 + j * .0028;
        const t = seg(p, t0, t0 + .05);
        if (t <= 0) continue;
        const [sx, sy] = plateXY(L, src, k);
        const [tx, ty] = plateXY(L, TRAY, j);
        const { k: kk, bounce } = drop(t);
        const x = lerp(sx, tx, inOut(clamp(t / .8)));
        const y = lerp(sy, ty, kk) - bounce * s * 1.1;
        if (t >= .8) landed++;
        let aa = 1;
        let fy = y;
        if (fallOut > 0) { fy += fallOut * fallOut * L.H * .7; aa = 1 - fallOut; }
        dot(ctx, x, fy, r, COLOR.plate, aa);
      }
      // the cushion: three more, in yolk
      for (let j = 0; j < PREP - PRED; j++) {
        const t0 = .605 + j * .012;
        const t = seg(p, t0, t0 + .045);
        if (t <= 0) continue;
        const [tx, ty] = plateXY(L, TRAY, PRED + j);
        const sy = L.oy - s * 4;
        const { k: kk, bounce } = drop(t);
        const y = lerp(sy, ty, kk) - bounce * s * 1.1;
        if (t >= .8) yolks++;
        let aa = clamp(t * 4), fy = y;
        if (fallOut > 0) { fy += fallOut * fallOut * L.H * .7; aa *= 1 - fallOut; }
        dot(ctx, tx, fy, r * 1.04, COLOR.yolk, aa);
      }
    }

    // Birria tacos: nine days of plates, then a count that will not form
    if (p > .72 || opts.onlyB) {
      for (let i = 27; i < DAYS; i++) {
        for (let k = 0; k < birria[i]; k++) {
          const t0 = .725 + (i - 27) * .003 + k * .0012;
          const t = opts.onlyB ? 1 : seg(p, t0, t0 + .035);
          if (t <= 0) continue;
          const [x, ty] = plateXY(L, i, k);
          const { k: kk, bounce } = drop(t);
          const y = lerp(ty - s * 7, ty, kk) - bounce * s * .9;
          dot(ctx, x, y, r, COLOR.plate, clamp(t * 3));
        }
      }
      // every day's newest plate tries for tomorrow, wanders in the tray, and goes back
      const g = opts.onlyB ? 0 : seg(p, .78, .9);
      if (g > 0 && g < 1) {
        const tx0 = cellX(L, TRAY), ty0 = cellY(L, TRAY) + L.lab;
        for (let i = 27; i < DAYS; i++) {
          const n = i - 27, k = birria[i] - 1;
          const local = clamp((g - n * .035) / .68);
          if (local <= 0 || local >= 1) continue;
          const [sx, sy] = plateXY(L, i, k);
          // a loose spot inside the tray, never a slot
          const hx = tx0 + L.cw * (.18 + .64 * ((n * 37) % 9) / 8);
          const hy = ty0 + 8 * s * (.25 + .5 * ((n * 53) % 7) / 6);
          const go = inOut(clamp(local / .35));
          const back = inOut(clamp((local - .65) / .35));
          const reach = go * (1 - back);
          const wander = Math.sin(Math.PI * clamp((local - .25) / .5));
          const x = lerp(sx, hx, reach) + Math.sin(local * 14 + n * 1.7) * s * .9 * wander;
          const y = lerp(sy, hy, reach) + Math.cos(local * 11 + n) * s * .7 * wander - Math.sin(Math.PI * go) * s * 1.5 * (1 - back);
          dot(ctx, sx, sy, r * .62, COLOR.roll, 1);           // the gap it left at home
          dot(ctx, x, y, r, COLOR.plate, .92);
        }
      }
    }
    ctx.globalAlpha = 1;
    return { landed, yolks };
  }

  /* ---------- canvases ---------- */
  function setup(canvas) {
    const ctx = canvas.getContext('2d');
    return { canvas, ctx, w: 0, h: 0, dpr: 1, L: null };
  }
  function size(view, fitHeight) {
    const rect = view.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    view.w = rect.width; view.h = rect.height; view.dpr = dpr;
    view.canvas.width = Math.round(rect.width * dpr);
    view.canvas.height = Math.round(rect.height * dpr);
    view.L = layout(rect.width, rect.height, fitHeight);
    const tag = view.canvas.closest('.board').querySelector('.board-tag');
    if (tag) tag.style.paddingLeft = view.L.ox + 'px';
  }
  function paint(view, p, fill, opts) {
    const { ctx, dpr } = view;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, view.canvas.width, view.canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return draw(ctx, view.L, p, fill, opts);
  }

  /* ---------- still version (reduced motion) ---------- */
  function still() {
    story.classList.remove('is-live');
    story.classList.add('is-still');
    const fig2 = board.cloneNode(true);
    fig2.querySelector('[data-dish]').textContent = 'Example: Birria tacos';
    fig2.querySelector('figcaption').textContent = 'The same calendar for a dish on the menu for nine days: a few plates a day since October 4, and an empty tray for tomorrow.';
    const wrap = document.createElement('div');
    wrap.className = 'boards';
    board.replaceWith(wrap);
    wrap.append(board, fig2);
    const views = [setup(board.querySelector('canvas')), setup(fig2.querySelector('canvas'))];
    const render = () => {
      views.forEach((v, n) => {
        const w = v.canvas.getBoundingClientRect().width;
        const L = layout(w, 0, false);
        const hh = n === 0 ? L.H + 8 : L.H - cellY(L, 21) + L.s * 2.2;
        v.canvas.style.setProperty('--ratio', (w / hh).toFixed(3));
        size(v, false);
        if (n === 0) paint(v, .69, 1e9, { static: true });
        else paint(v, .96, 1e9, { onlyB: true, static: true, crop: true });
      });
    };
    render();
    new ResizeObserver(render).observe(wrap);
    document.fonts && document.fonts.ready.then(render);
  }

  /* ---------- live version ---------- */
  function live() {
    story.classList.add('is-live');
    const view = setup(board.querySelector('canvas'));
    const hero = story.querySelector('.hero');
    const beats = [...story.querySelectorAll('.beat')];
    const predEl = story.querySelector('[data-num="pred"]');
    const prepEl = story.querySelector('[data-num="prep"]');
    const lineEl = story.querySelector('.ro-line');
    const dishEl = board.querySelector('[data-dish]');
    const countLi = story.querySelector('.beat-count');

    let target = 0, current = 0, last = -1, t0 = performance.now(), fill = 0, raf = 0, active = '';
    let lastPred = -1, lastPrep = -1, dish = '';

    const progress = () => {
      const r = story.getBoundingClientRect();
      const span = story.offsetHeight - window.innerHeight;
      return clamp(-r.top / Math.max(1, span));
    };
    const setBeat = (p) => {
      const name = (BEATS.find(([, a, b]) => p >= a && p < b) || BEATS[BEATS.length - 1])[0];
      if (name === active) return;
      active = name;
      hero.classList.toggle('on', name === 'hero');
      hero.classList.toggle('gone', name !== 'hero');
      hero.toggleAttribute('inert', name !== 'hero');
      beats.forEach((b) => b.classList.toggle('on', b.dataset.beat === name));
    };

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(64, now - (frame.prev || now)); frame.prev = now;
      fill = now - t0;
      current += (target - current) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - current) < .00015) current = target;
      const loading = fill < 1700;
      if (current !== last || loading) {
        last = current;
        const { landed, yolks } = paint(view, current, fill);
        setBeat(current);
        if (landed !== lastPred) { lastPred = landed; predEl.textContent = landed; }
        const prep = landed + yolks;
        if (prep !== lastPrep) { lastPrep = prep; prepEl.textContent = prep; }
        countLi.setAttribute('aria-label', `Predicted ${landed}. Prep ${prep}.`);
        lineEl.style.transform = `scaleX(${outCubic(seg(current, .87, .9)).toFixed(4)})`;
        const d = current > .72 ? 'Example: Birria tacos' : 'Example: Margherita';
        if (d !== dish) { dish = d; dishEl.textContent = d; }
      }
      if (current !== target || loading) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) { frame.prev = performance.now(); raf = requestAnimationFrame(frame); } };

    const onScroll = () => { target = progress(); kick(); };
    const onResize = () => { size(view, true); last = -1; onScroll(); };

    // keyboard and screen-reader users moving through the beats: Tab into the hero CTA still works,
    // and the pilot section follows; the beats themselves are text in the DOM.
    window.addEventListener('scroll', onScroll, { passive: true });
    new ResizeObserver(onResize).observe(board);
    document.fonts && document.fonts.ready.then(() => { last = -1; kick(); });
    size(view, true);
    target = current = progress();
    setBeat(current);
    kick();
  }

  if (reduce.matches) still(); else live();
  reduce.addEventListener && reduce.addEventListener('change', () => location.reload());
})();
