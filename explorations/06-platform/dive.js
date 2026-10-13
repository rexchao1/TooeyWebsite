/* The dive: an example restaurant's year as a woven field, and a camera
   that travels from the whole year into one empty cell, tomorrow's short rib.
   Canvas 2D, scrubbed by scroll, no libraries. Every number here is an example. */
(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Palette (rgb)
  const BOTTLE = [23, 58, 47], DEEP = [15, 42, 33], LOW = [33, 76, 61],
        BRASS = [212, 170, 111], PORC = [238, 240, 234];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const css = (c, a) => a == null ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

  // ------------------------------------------------------------------
  // Example data: one year of one imagined restaurant, closed Mondays.
  function rng(seed) {
    return function () {
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = rng(20261013);
  const DAY = 86400000;
  const START = Date.UTC(2025, 9, 14);          // column 0: Tue 14 Oct 2025
  const TODAY = 364, TOM = 365, NCOL = 366;     // today Tue 13 Oct 2026, tomorrow Wed
  const colOf = s => Math.round((Date.parse(s + 'T00:00:00Z') - START) / DAY);
  const dateOf = c => new Date(START + c * DAY);

  const MENU = [
    [{ n: 'Burrata', b: 9 }, { n: 'Calamari', b: 12 }, { n: 'Soup of the day', b: 10, w: 1 },
     { n: 'Caesar salad', b: 14, s: 1 }, { n: 'Wings', b: 16 },
     { n: 'Tomato salad', b: 11, s: 1, from: '2026-06-16', to: '2026-09-20' }],
    [{ n: 'Short rib', b: 24, w: 1, focus: 1 }, { n: 'Roast chicken', b: 30 }, { n: 'Steak frites', b: 20 },
     { n: 'Salmon', b: 17, s: 1 }, { n: 'Burger', b: 34 }, { n: 'Pork chop', b: 11, w: 1 },
     { n: 'Fish tacos', b: 15, s: 1 }, { n: 'Lamb special', b: 9, from: '2026-09-22', blank: 1 }],
    [{ n: 'Mushroom risotto', b: 14, w: 1 }, { n: 'Rigatoni', b: 19 }, { n: 'Carbonara', b: 16 },
     { n: 'Lasagna', b: 12, w: 1 }, { n: 'Pumpkin ravioli', b: 13, w: 1, from: '2025-10-01', to: '2026-01-25' }],
    [{ n: 'Fries', b: 70 }, { n: 'Greens', b: 22 }, { n: 'Mac and cheese', b: 18, w: 1 },
     { n: 'Brussels sprouts', b: 12, w: 1 }],
    [{ n: 'Tiramisu', b: 13 }, { n: 'Cheesecake', b: 10 }, { n: 'Chocolate cake', b: 9 },
     { n: 'Affogato', b: 0.7, blank: 1 }]
  ];
  const WD = [1.12, 0, 0.78, 0.84, 0.98, 1.32, 1.45];   // Sun..Sat; Monday closed
  const HOL = {
    '2025-11-26': 1.25, '2025-11-27': 0, '2025-12-24': 0.6, '2025-12-25': 0, '2025-12-31': 1.55,
    '2026-01-01': 0, '2026-02-14': 1.95, '2026-04-05': 1.3, '2026-05-10': 1.7, '2026-07-03': 1.2, '2026-07-04': 0.55
  };
  for (let d = 5; d <= 11; d++) HOL['2026-01-' + String(d).padStart(2, '0')] = 0;   // a week off in January
  const HOLIDAY_COLS = ['2025-11-27', '2025-12-24', '2025-12-25', '2025-12-31', '2026-02-14', '2026-05-10', '2026-07-04'].map(colOf);

  const rows = [];
  MENU.forEach((g, gi) => g.forEach(d => rows.push(Object.assign({ g: gi }, d))));
  const R = rows.length;
  const FOCUS = rows.findIndex(r => r.focus);
  const GAP = 0.75;
  const T0 = R + GAP * (MENU.length - 1);
  const HF = 0.3 * T0;                                   // focused row height
  const HO = (T0 - HF - GAP * (MENU.length - 1)) / (R - 1);

  function gauss() { return (rand() + rand() + rand() - 1.5) / 0.5; }
  function poisson(l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= rand(); } while (p > L); return k - 1; }

  // vals: -2 not on the menu, -1 closed, else 0..1 (row-normalised)
  const vals = rows.map(r => new Float32Array(NCOL).fill(-2));
  const pred = new Float32Array(R);
  rows.forEach((r, i) => {
    const from = r.from ? colOf(r.from) : -1e9, to = r.to ? colOf(r.to) : 1e9;
    const raw = [];
    for (let c = 0; c <= TODAY; c++) {
      if (c < from || c > to) { raw.push(-2); continue; }
      const d = dateOf(c), key = d.toISOString().slice(0, 10), dow = d.getUTCDay();
      let f = WD[dow];
      if (key in HOL) f *= HOL[key];
      if (f === 0) { raw.push(-1); continue; }
      const doy = (c + 287) % 365;                          // Oct 14 is day ~287
      const summer = Math.sin(2 * Math.PI * (doy - 110) / 365);
      let season = 1 + 0.08 * summer;
      if (r.s) season = 1 + 0.38 * summer;
      if (r.w) season = 1 - 0.3 * summer;
      if (d.getUTCMonth() === 0) season *= 0.86;
      const mean = r.b * f * season;
      const v = mean < 4 ? poisson(mean) : Math.max(0, Math.round(mean * (1 + 0.13 * gauss())));
      raw.push(v);
    }
    const sorted = raw.filter(v => v >= 0).sort((a, b) => a - b);
    const norm = Math.max(1, sorted[Math.floor(sorted.length * 0.96)] || 1);
    raw.forEach((v, c) => { vals[i][c] = v < 0 ? v : Math.min(1, v / norm); });
    // tomorrow (Wednesday): mean of the last four Wednesdays, for the picture only
    const onTomorrow = TOM >= from && TOM <= to;
    if (!onTomorrow) pred[i] = -2;
    else if (r.blank) pred[i] = -3;
    else {
      let s = 0, n = 0;
      for (let c = TODAY; c >= 0 && n < 4; c--) if (dateOf(c).getUTCDay() === 3 && vals[i][c] >= 0) { s += vals[i][c]; n++; }
      pred[i] = Math.min(1, (s / Math.max(1, n)) * 1.06);
    }
  });

  // Bar colours by emphasis step: full brass down to a quiet sage, never an olive blend at rest.
  const AS = 10, SAGE = [70, 104, 91], TRACK = css([28, 67, 54]);
  const BAR = [];
  for (let a = 0; a <= AS; a++) BAR.push(css(mix(SAGE, BRASS, a / AS)));
  // where each row is on the menu (for its track)
  const span = vals.map(v => { let a = -1, b = -1; for (let c = 0; c <= TODAY; c++) if (v[c] !== -2) { if (a < 0) a = c; b = c; } return [a, b]; });

  // ------------------------------------------------------------------
  // Helpers
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const lerp = (a, b, t) => a + (b - a) * t;
  const E = {
    io: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    io4: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
    o: t => 1 - Math.pow(1 - t, 3),
    back: t => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  };
  const lerpRect = (a, b, t) => ({ l: lerp(a.l, b.l, t), t: lerp(a.t, b.t, t), r: lerp(a.r, b.r, t), b: lerp(a.b, b.b, t) });

  function layout(f) {
    const y = new Float32Array(R), h = new Float32Array(R);
    const hf = lerp(1, HF, f), ho = lerp(1, HO, f);
    let acc = 0;
    for (let i = 0; i < R; i++) {
      if (i > 0 && rows[i].g !== rows[i - 1].g) acc += GAP;
      y[i] = acc; h[i] = i === FOCUS ? hf : ho; acc += h[i];
    }
    return { y, h };
  }

  // ------------------------------------------------------------------
  // The scene, for a given state
  function draw(ctx, W, H, s) {
    ctx.clearRect(0, 0, W, H);
    if (s.still) { ctx.fillStyle = css(BOTTLE); ctx.fillRect(0, 0, W, H); }
    const { rect, view } = s;
    const kx = (rect.r - rect.l) / (view.x1 - view.x0);
    const ky = (rect.b - rect.t) / (view.y1 - view.y0);
    const X = x => rect.l + (x - view.x0) * kx;
    const Y = y => rect.t + (y - view.y0) * ky;
    const L = layout(s.f);

    // the whole screen inside one filled cell: skip the work
    if (s.solid) { ctx.fillStyle = css(BRASS); ctx.fillRect(0, 0, W, H); return; }

    const gapX = kx >= 5 ? Math.min(kx * 0.16, 6) : (kx >= 2.2 ? 0.9 : 0.3);
    const c0 = Math.max(0, Math.floor(view.x0 - (s.still ? 0 : rect.l / kx))), c1 = Math.min(TODAY, Math.ceil(view.x1 + (W - rect.r) / kx));
    const buckets = [];
    for (let k = 0; k <= AS; k++) buckets.push([]);
    const weighFade = 1 - seg(s.p, 0.64, 0.7);

    for (let i = 0; i < R; i++) {
      const rowPx = L.h[i] * ky;
      const gapY = rowPx >= 5 ? clamp(rowPx * 0.16, 1, 7) : 0;
      const y = Y(L.y[i]), h = rowPx - gapY;
      if (y > H || y + h < 0) continue;
      const focus = i === FOCUS;
      const rowA = focus ? 1 : 1 - 0.7 * s.dim;
      const revealCol = s.reveal >= 1 ? 1e9 : s.reveal * (NCOL + R * 3) - i * 3;
      // the row's track
      const [sa, sb] = span[i];
      const tx0 = X(Math.max(sa, c0)), tx1 = X(Math.min(sb, c1, revealCol) + 1) - gapX;
      if (tx1 > tx0) { ctx.fillStyle = TRACK; ctx.fillRect(tx0, y, tx1 - tx0, h); }
      const v = vals[i];
      for (let c = c0; c <= c1; c++) {
        if (c > revealCol) break;
        const t = v[c];
        if (t < 0) continue;
        if (c === TODAY && i / R >= s.today) continue;
        let a = rowA;
        if (focus && s.wk > 0 && dateOf(c).getUTCDay() !== 3) a *= 1 - 0.8 * s.wk * weighFade;
        const x = X(c), w = Math.max(kx - gapX, 0.6);
        if (x > W || x + w < 0) continue;
        const bh = h * (0.12 + 0.88 * t);
        buckets[Math.round(a * AS)].push(x, y + h - bh, w, bh);
      }
    }
    buckets.forEach((arr, k) => {
      if (!arr.length) return;
      ctx.fillStyle = BAR[k];
      for (let j = 0; j < arr.length; j += 4) ctx.fillRect(arr[j], arr[j + 1], arr[j + 2], arr[j + 3]);
    });

    // the read head running down today's column
    if (s.today > 0 && s.today < 1) {
      const i = Math.min(R - 1, Math.floor(s.today * R));
      const hw = Math.max(kx - gapX, 3);
      ctx.fillStyle = css(PORC);
      ctx.fillRect(X(TODAY) + (kx - gapX) / 2 - hw / 2, Y(L.y[i]) - 2, hw, L.h[i] * ky + 4);
    }

    // tomorrow: the empty column
    const tx = X(TOM), tw = kx - gapX;
    if (s.tomMark > 0) {
      ctx.strokeStyle = css(PORC, 0.75 * s.tomMark);
      ctx.lineWidth = 1;
      const top = Y(0) - 0.5, bot = Y(T0) - 0.5, ow = Math.max(tw + 3, 7);
      ctx.strokeRect(Math.round(tx + tw / 2 - ow / 2) + 0.5, top - 1, ow, bot - top + 2);
    }
    for (let i = 0; i < R; i++) {
      if (pred[i] === -2) continue;
      const rowPx = L.h[i] * ky, gapY = rowPx >= 5 ? clamp(rowPx * 0.16, 1, 7) : 0;
      const y = Y(L.y[i]), h = rowPx - gapY;
      if (i === FOCUS) {
        if (s.fill > 0) {
          ctx.fillStyle = css(BRASS);
          const fh = h * s.fill;
          ctx.fillRect(tx, y + h - fh, tw, fh);
        }
        continue;
      }
      if (i / R >= s.tom) continue;
      const a = 1 - 0.7 * s.dim;
      if (pred[i] === -3) {
        if (tw > 3 && h > 3) { ctx.strokeStyle = css(PORC, 0.5 * a); ctx.lineWidth = 1; ctx.strokeRect(tx + 1.5, y + 1.5, tw - 3, h - 3); }
      } else {
        const bh = h * (0.12 + 0.88 * pred[i]);
        ctx.fillStyle = BAR[Math.round(a * AS)];
        ctx.fillRect(tx, y + h - bh, tw, bh);
      }
    }
    // ring on short rib's tomorrow
    if (s.ring > 0) {
      const rowPx = L.h[FOCUS] * ky, gapY = rowPx >= 5 ? clamp(rowPx * 0.16, 1, 7) : 0;
      const y = Y(L.y[FOCUS]);
      const pad = s.still ? (s.phone ? 10 : 6) : 4;
      ctx.strokeStyle = css(PORC, s.ring);
      ctx.lineWidth = s.still ? (s.phone ? 5 : 3) : 1.5;
      ctx.strokeRect(tx - pad, y - pad, tw + pad * 2, rowPx - gapY + pad * 2);
    }

    // weighing marks on the focused row: same time last year, the holidays
    const fy = Y(L.y[FOCUS]);
    if (s.band > 0 && weighFade > 0) {
      const a = s.band * weighFade;
      const x0 = X(0), x1 = X(35) - gapX, yb = fy - (s.still ? 22 : 14);
      ctx.strokeStyle = css(PORC, a); ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, yb + 6); ctx.lineTo(x0, yb); ctx.lineTo(lerp(x0, x1, E.o(s.band)), yb);
      if (s.band >= 1) ctx.lineTo(x1, yb + 6);
      ctx.stroke();
    }
    if (s.hol > 0 && weighFade > 0) {
      ctx.fillStyle = css(PORC, weighFade);
      const r = s.still ? (s.phone ? 9 : 5) : 3;
      HOLIDAY_COLS.forEach((c, k) => {
        const t = clamp(s.hol * HOLIDAY_COLS.length - k);
        if (t <= 0) return;
        const cx = X(c) + (kx - gapX) / 2, cy = fy - (s.still ? 10 : 6);
        ctx.beginPath(); ctx.moveTo(cx, cy + r * 1.4 * t); ctx.lineTo(cx + r * t, cy - r * 0.5); ctx.lineTo(cx - r * t, cy - r * 0.5); ctx.closePath(); ctx.fill();
      });
    }

    // labels
    if (s.labels > 0 || s.still) {
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      try { ctx.fontStretch = 'semi-condensed'; } catch (e) { /* older engines */ }
      const gx = Math.max(8, rect.l - s.gutter + (s.small ? 0 : 2));
      for (let i = 0; i < R; i++) {
        const rowPx = L.h[i] * ky;
        const focus = i === FOCUS;
        if (s.still && !focus) continue;
        let fs = clamp(rowPx * 0.62, 0, s.small ? 11 : 13);
        let weight = 500;
        if (focus) { fs = lerp(fs, s.small ? 15 : (s.still ? (s.phone ? 52 : 30) : 20), Math.max(s.f, s.still ? 1 : 0)); weight = s.f > 0.5 ? 650 : 500; }
        const a = (focus ? 1 : (1 - 0.55 * s.dim)) * clamp((fs - 7.5) / 2) * (s.still ? 1 : s.labels);
        if (a <= 0.02) continue;
        ctx.font = `${weight} ${fs.toFixed(1)}px "Encode Sans", sans-serif`;
        ctx.fillStyle = css(PORC, a * (focus ? 1 : 0.86));
        ctx.fillText(rows[i].n, s.still ? 40 : gx, Y(L.y[i]) + (rowPx - (rowPx >= 5 ? clamp(rowPx * 0.16, 1, 7) : 0)) / 2);
      }
    }
    // months along the bottom, and the word over the empty column
    if (s.months > 0) {
      ctx.font = `500 ${s.small ? 10.5 : 12}px "Encode Sans", sans-serif`;
      ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillStyle = css(PORC, 0.62 * s.months);
      const yb = Y(T0) + 10;
      const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthPx = 30.4 * kx;
      const step = monthPx < 34 ? 3 : 1;
      for (let c = 1; c <= TODAY; c++) {
        const d = dateOf(c);
        if (d.getUTCDate() !== 1 || (d.getUTCMonth() % step)) continue;
        const x = X(c);
        if (x < rect.l - 1 || x > rect.r - 70) continue;
        ctx.fillRect(x, yb - 6, 1, 4);
        ctx.fillText(names[d.getUTCMonth()], x + 3, yb - 2);
      }
    }
    if (s.tomLabel > 0) {
      ctx.font = `600 ${s.still ? (s.phone ? 40 : 22) : (s.small ? 11 : 12.5)}px "Encode Sans", sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillStyle = css(PORC, s.tomLabel);
      ctx.fillText('Tomorrow', tx + tw + 1.5, Y(0) - (s.still ? 14 : 8));
    }
  }

  // ------------------------------------------------------------------
  // Timeline: progress p (0..1 over the pinned section) to scene state
  function stateAt(p, g) {
    const { W, H, slot, small, reveal } = g;
    const m = small ? 16 : Math.max(24, Math.min(48, W * 0.034));
    const gut = small ? 102 : (W < 1024 ? 150 : 178);
    const full = { l: m, t: small ? 64 : 84, r: W - m, b: H - (small ? 124 : 128) };
    const e = E.io(seg(p, 0.02, 0.16));
    let rect = lerpRect(slot, full, e);
    const gu = E.io(seg(p, 0.17, 0.3));
    rect.l += gut * gu;
    const k = seg(p, 0.64, 0.86);
    const kk = E.io4(k);
    rect = lerpRect(rect, { l: 0, t: 0, r: W, b: H }, E.io(seg(p, 0.64, 0.8)));

    const f = E.io(seg(p, 0.38, 0.47));
    const L = layout(f);
    // camera: whole field, then a Powers-of-Ten push into the cell
    const v0 = { x0: 0, x1: NCOL, y0: 0, y1: T0 };
    const yf = L.y[FOCUS], hf = L.h[FOCUS];
    const v1 = { x0: TOM + 0.14, x1: TOM + 0.86, y0: yf + hf * 0.1, y1: yf + hf * 0.82 };
    const axis = (a0, a1, b0, b1) => {
      const w0 = a1 - a0, w1 = b1 - b0, w = w0 * Math.pow(w1 / w0, kk);
      const sAmt = (w0 - w) / (w0 - w1 || 1);
      const c = lerp((a0 + a1) / 2, (b0 + b1) / 2, sAmt);
      return [c - w / 2, c + w / 2];
    };
    const [x0, x1] = axis(v0.x0, v0.x1, v1.x0, v1.x1);
    const [y0, y1] = axis(v0.y0, v0.y1, v1.y0, v1.y1);

    return {
      p, rect, view: { x0, x1, y0, y1 }, f, small, gutter: gut * gu,
      reveal,
      dim: f * (1 - 0.35 * seg(p, 0.7, 0.8)),
      today: seg(p, 0.22, 0.34),
      wk: seg(p, 0.47, 0.53), band: seg(p, 0.53, 0.58), hol: seg(p, 0.58, 0.63),
      tom: seg(p, 0.64, 0.73),
      fill: E.io(seg(p, 0.725, 0.785)),
      ring: seg(p, 0.42, 0.48) * (1 - seg(p, 0.79, 0.83)),
      tomMark: 1 - seg(p, 0.7, 0.76),
      tomLabel: seg(reveal, 0.92, 1) * (1 - seg(p, 0.66, 0.7)),
      labels: E.o(seg(p, 0.2, 0.3)) * (1 - seg(p, 0.64, 0.68)),
      months: seg(p, 0.1, 0.16) * (1 - seg(p, 0.6, 0.66)),
      solid: k >= 1
    };
  }

  // A designed still for reduced motion and no-JS: the year, the weighing,
  // and tomorrow's short rib filled and ringed. Used to make img/field-still.webp.
  function stillState(W, H, phone) {
    return {
      p: 0.6, still: true, small: false, phone,
      rect: phone ? { l: 330, t: 110, r: W - 44, b: H - 50 } : { l: 250, t: 90, r: W - 48, b: H - 70 },
      view: { x0: phone ? NCOL - 64 : 0, x1: NCOL, y0: 0, y1: T0 }, f: 1, gutter: 0, reveal: 1, dim: 1, today: 1,
      wk: 1, band: 1, hol: 1, tom: 1, fill: 1, ring: 1, tomMark: 1, tomLabel: 1, labels: 0, months: 0, solid: false
    };
  }
  window.TooeyField = {
    renderStill(canvas, W, H, phone) {
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = css(BOTTLE); ctx.fillRect(0, 0, W, H);
      draw(ctx, W, H, stillState(W, H, phone));
    }
  };

  // ------------------------------------------------------------------
  // Wiring
  const html = document.documentElement;
  if (!html.classList.contains('motion')) return;
  const dive = document.querySelector('.dive');
  const stage = dive && dive.querySelector('.stage');
  const canvas = stage && stage.querySelector('.field');
  if (!canvas || !canvas.getContext) { html.classList.remove('motion'); return; }
  const ctx = canvas.getContext('2d');
  const slotEl = dive.querySelector('.field-slot');
  const caps = [...stage.querySelectorAll('.cap')];
  const words = [...stage.querySelectorAll('[data-w]')];
  const landing = stage.querySelector('.landing');
  const dish = landing.querySelector('.l-dish'), label = landing.querySelector('.l-label');
  const facts = [...landing.querySelectorAll('.l-facts > span')];
  const items = [...landing.querySelectorAll('.l-list li')];

  // odometer from the static "34"
  const numeral = landing.querySelector('.numeral');
  numeral.setAttribute('aria-label', numeral.textContent.trim());
  numeral.textContent = '';
  const mkStrip = (n) => {
    const d = document.createElement('span'); d.className = 'digit'; d.setAttribute('aria-hidden', 'true');
    const s = document.createElement('span'); s.className = 'strip';
    for (let i = 0; i < n; i++) { const x = document.createElement('span'); x.textContent = i % 10; s.appendChild(x); }
    d.appendChild(s); numeral.appendChild(d); return s;
  };
  const tens = mkStrip(10), ones = mkStrip(40);
  numeral.setAttribute('role', 'img');

  const g = { W: 0, H: 0, slot: null, small: false, reveal: 0 };
  let dpr = 1, diveTop = 0, range = 1, pTarget = 0, pCur = 0, lastDrawn = -1, raf = 0, loadStart = 0;

  function measure() {
    g.W = stage.clientWidth; g.H = stage.clientHeight; g.small = g.W < 640;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(g.W * dpr); canvas.height = Math.round(g.H * dpr);
    const sr = slotEl.getBoundingClientRect(), dr = dive.getBoundingClientRect();
    g.slot = { l: sr.left - dr.left, t: sr.top - dr.top, r: sr.right - dr.left, b: sr.bottom - dr.top };
    diveTop = dr.top + window.scrollY;
    range = Math.max(1, dive.offsetHeight - g.H);
    lastDrawn = -1;
  }
  function readScroll() { pTarget = clamp((window.scrollY - diveTop) / range); }

  const fade = (p, a, b, edge = 0.022) => Math.min(seg(p, a, a + edge), 1 - seg(p, b - edge, b));
  const hero = dive.querySelector('.hero');
  function dom(p) {
    const h = seg(p, 0.004, 0.055);
    hero.style.opacity = 1 - h;
    hero.style.pointerEvents = h >= 1 ? 'none' : '';
    caps[0].style.opacity = fade(p, 0.06, 0.27);
    caps[1].style.opacity = fade(p, 0.27, 0.4);
    caps[2].style.opacity = fade(p, 0.42, 0.65);
    caps[2].classList.toggle('weigh', p > 0.46);
    words.forEach((w, i) => w.classList.toggle('on', p >= [0.47, 0.53, 0.58][i]));

    const live = p >= 0.845;
    landing.classList.toggle('live', live);
    if (!live) return;
    const show = (el, a, b, dy = 10) => { const t = E.o(seg(p, a, b)); el.style.opacity = t; el.style.transform = `translateY(${(1 - t) * dy}px)`; };
    show(dish, 0.855, 0.88); show(label, 0.86, 0.885);
    facts.forEach((el, i) => show(el, 0.915 + i * 0.012, 0.94 + i * 0.012));
    items.forEach((el, i) => show(el, 0.935 + i * 0.01, 0.96 + i * 0.01, 14));
    const n = 34 * E.o(seg(p, 0.86, 0.935));
    const onesPos = n, tensPos = Math.floor(n / 10) + Math.max(0, (n % 10) - 9);
    ones.style.transform = `translateY(${-onesPos}em)`;
    tens.style.transform = `translateY(${-tensPos}em)`;
  }

  function frame(now) {
    raf = 0;
    if (!loadStart) loadStart = now;
    g.reveal = pTarget > 0.04 ? 1 : E.io(clamp((now - loadStart) / 1500));
    const d = pTarget - pCur;
    pCur = Math.abs(d) < 0.0004 ? pTarget : pCur + d * 0.16;
    const key = pCur * 1e6 + g.reveal;
    if (key !== lastDrawn) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const st = stateAt(pCur, g);

      draw(ctx, g.W, g.H, st);
      dom(pCur);
      lastDrawn = key;
    }
    if (pCur !== pTarget || g.reveal < 1) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function start() {
    // keyboard focus inside the faded hero brings it back into view
    hero.addEventListener('focusin', () => { if (pTarget > 0.05) window.scrollTo(0, diveTop); });
    measure(); readScroll(); pCur = pTarget; kick();
    window.addEventListener('scroll', () => { readScroll(); kick(); }, { passive: true });
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); readScroll(); pCur = pTarget; kick(); }, 120); });
  }
  const fontReady = document.fonts && document.fonts.load ? document.fonts.load('600 16px "Encode Sans"').catch(() => {}) : Promise.resolve();
  Promise.race([fontReady, new Promise(r => setTimeout(r, 900))]).then(start);
})();
