/* The pass, seen from above.
   The visitor sets how much to prep with the line across the pan, then runs a service.
   Tickets pull cups out of the pan. Cups left at close slide into the bin, where they stay.
   Tickets that arrive after the pan is empty print blank and fade, leaving gaps on the rail.
   After the first call, Tooey's count is drawn on the pan.
   Every count in here is illustrative: the demand is random each run. */
(() => {
  'use strict';

  const pass = document.getElementById('pass');
  if (!pass) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return; // the still triptych stays

  const live = pass.querySelector('.live');
  const stage = pass.querySelector('.stage');
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const range = document.getElementById('level');
  const serveBtn = document.getElementById('serve');
  const tooeyBtn = document.getElementById('tooey');
  const callEl = document.getElementById('call');
  const subEl = document.getElementById('call-sub');
  const promptEl = document.getElementById('prompt');
  if (!ctx) return;

  live.hidden = false;
  pass.classList.add('is-live');

  /* ---------- palette ---------- */
  const C = {
    ink: '#1F2A33',
    thermal: '#FAFAF7',
    green: '#2E6B4F',
    greenInk: '#245740',
  };

  /* ---------- easing ---------- */
  const ease = {
    linear: (p) => p,
    outCubic: (p) => 1 - Math.pow(1 - p, 3),
    inQuad: (p) => p * p,
    inCubic: (p) => p * p * p,
    inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outBack: (p) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    outQuint: (p) => 1 - Math.pow(1 - p, 5),
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* seeded random so cups and tickets look the same each visit */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* ---------- layout ---------- */
  const SLICES = 10, PER = 3, MAX = SLICES * PER, CUP_R = 33;
  const TOOEY_LEVEL = 6;
  let L = null; // current layout
  let scale = 1, dpr = 1, cssW = 0;

  function makeLayout(w) {
    if (w >= 600) {
      const pan = { x: 18, y: 186, cell: 80, pad: 30, cols: 10, rows: 3 };
      pan.w = pan.cols * pan.cell + pan.pad * 2; pan.h = pan.rows * pan.cell + pan.pad * 2;
      return {
        wide: true, W: 1200, H: 560,
        rail: { x0: 10, x1: 1190, y: 30, tw: 66, th: 104 },
        pan,
        bin: { x: 1052, y: 336, r: 124 },
        knob: { off: 34 },
        label: 22,
      };
    }
    const pan = { x: 60, y: 136, cell: 80, pad: 26, cols: 3, rows: 10 };
    pan.w = pan.cols * pan.cell + pan.pad * 2; pan.h = pan.rows * pan.cell + pan.pad * 2;
    return {
      wide: false, W: 600, H: 1020,
      rail: { x0: 8, x1: 592, y: 26, tw: 54, th: 88 },
      pan,
      bin: { x: 474, y: 362, r: 104 },
      knob: { off: 32 },
      label: 30,
    };
  }

  function slotPos(i) {
    const p = L.pan, s = Math.floor(i / PER), k = i % PER;
    if (L.wide) return { x: p.x + p.pad + s * p.cell + p.cell / 2, y: p.y + p.pad + k * p.cell + p.cell / 2 };
    return { x: p.x + p.pad + k * p.cell + p.cell / 2, y: p.y + p.pad + s * p.cell + p.cell / 2 };
  }
  function linePos(lv) { const p = L.pan; return (L.wide ? p.x : p.y) + p.pad + lv * p.cell; }

  /* ---------- state ---------- */
  const cups = Array.from({ length: MAX }, (_, i) => ({ i, present: false, s: 1, a: 1, lift: 0, ox: 0, oy: 0, dark: 0, free: false, clip: 0 }));
  const binned = []; // { ux, uy, rot, s, bounce }
  let tickets = [];  // { k, x, tx, rot, a, ink, blank, emboss }
  let level = 0;     // what the visitor set (0..10)
  let lineVis = 0, lineVel = 0;
  let tilt = 0;
  let tooeyDraw = 0, tooeyShown = false;
  let serving = false, spent = false, touched = false, demoRunning = false, ran = 0;
  let focusRing = 0, focused = false, hoverKnob = false, nudging = false;

  /* ---------- tween engine ---------- */
  const tweens = new Set();
  let raf = 0;
  const now = () => performance.now();
  function tween(dur, fn, e = ease.outCubic, delay = 0) {
    return new Promise((res) => { tweens.add({ start: now() + delay, dur, fn, e, res }); kick(); });
  }
  const wait = (ms) => tween(ms, () => {}, ease.linear);
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  function frame(t) {
    raf = 0;
    let busy = false;
    for (const tw of tweens) {
      if (t < tw.start) { busy = true; continue; }
      const p = Math.min(1, (t - tw.start) / tw.dur);
      tw.fn(tw.e(p), p);
      if (p >= 1) { tweens.delete(tw); tw.res(); } else busy = true;
    }
    // the line follows the level on a damped spring, so it has a little weight
    const k = 0.16, d = 0.62;
    lineVel = (lineVel + (level - lineVis) * k) * d;
    lineVis += lineVel;
    if (Math.abs(level - lineVis) > 0.001 || Math.abs(lineVel) > 0.001) busy = true; else { lineVis = level; lineVel = 0; }
    const fr = focused ? 1 : 0;
    focusRing += (fr - focusRing) * 0.25;
    if (Math.abs(fr - focusRing) > 0.01) busy = true; else focusRing = fr;
    if (nudging) busy = true;
    draw();
    if (busy) kick();
  }

  /* ---------- sprites ---------- */
  let cupSprite = null, cupDark = null, steelTex = null;

  function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

  function buildSprites() {
    const px = CUP_R * scale * dpr; // cup radius in device pixels
    const size = px * 2 + 4;
    const paint = (dark) => {
      const c = makeCanvas(size, size), g = c.getContext('2d');
      g.translate(size / 2, size / 2);
      const r = px;
      // rim: translucent plastic of a deli container lid
      let gr = g.createLinearGradient(-r, -r, r, r);
      gr.addColorStop(0, '#F7F9F9'); gr.addColorStop(0.55, '#D3D9DC'); gr.addColorStop(1, '#A5AEB3');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      // food
      gr = g.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.05, 0, 0, r * 0.84);
      gr.addColorStop(0, '#C07B45'); gr.addColorStop(0.55, '#9C5B32'); gr.addColorStop(1, '#6F3A1D');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 0.82, 0, Math.PI * 2); g.fill();
      // texture: a braise has bits in it
      const s0 = seed; seed = dark ? 91 : 41;
      for (let n = 0; n < 16; n++) {
        const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r * 0.7;
        g.fillStyle = rnd() > 0.5 ? 'rgba(70,32,14,0.45)' : 'rgba(214,150,90,0.35)';
        g.beginPath(); g.ellipse(Math.cos(a) * d, Math.sin(a) * d, r * (0.05 + rnd() * 0.07), r * (0.035 + rnd() * 0.05), rnd() * 3, 0, Math.PI * 2); g.fill();
      }
      seed = s0;
      // lid film and the inner lip
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(0, 0, r * 0.82, 0, Math.PI * 2); g.fill();
      g.lineWidth = Math.max(1, r * 0.045); g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.beginPath(); g.arc(0, 0, r * 0.86, 0, Math.PI * 2); g.stroke();
      g.lineWidth = Math.max(1, r * 0.03); g.strokeStyle = 'rgba(31,42,51,0.28)';
      g.beginPath(); g.arc(0, 0, r - g.lineWidth / 2, 0, Math.PI * 2); g.stroke();
      // specular: a soft window reflection on the lid
      gr = g.createRadialGradient(-r * 0.38, -r * 0.42, 0, -r * 0.38, -r * 0.42, r * 0.55);
      gr.addColorStop(0, 'rgba(255,255,255,0.62)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 0.84, 0, Math.PI * 2); g.fill();
      if (dark) {
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(16,20,23,0.55)'; g.fillRect(-r, -r, r * 2, r * 2);
      }
      return c;
    };
    cupSprite = paint(false);
    cupDark = paint(true);

    // brushed steel streaks for the pan well
    const tw = 512, th = 512, c = makeCanvas(tw, th), g = c.getContext('2d');
    const s0 = seed; seed = 3;
    for (let n = 0; n < 900; n++) {
      const y = rnd() * th, x = rnd() * tw, len = 40 + rnd() * 260;
      g.strokeStyle = rnd() > 0.5 ? `rgba(255,255,255,${0.03 + rnd() * 0.06})` : `rgba(20,30,36,${0.02 + rnd() * 0.05})`;
      g.lineWidth = 0.6 + rnd() * 0.9;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y + (rnd() - 0.5) * 0.6); g.stroke();
      g.beginPath(); g.moveTo(x - tw, y); g.lineTo(x - tw + len, y); g.stroke();
    }
    seed = s0;
    steelTex = ctx.createPattern(c, 'repeat');
  }

  /* ---------- drawing ---------- */
  function rr(g, x, y, w, h, r, keep) {
    if (!keep) g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }

  // the pan tips toward the bin around its right edge
  function tiltPoint(x, y) {
    const p = L.pan, px = p.x + p.w, k = 1 - 0.035 * tilt;
    return { x: px + (x - px) * k, y: y + (y - (p.y + p.h / 2)) * 0.02 * tilt };
  }

  function drawPan() {
    const p = L.pan;
    ctx.save();
    const px = p.x + p.w;
    ctx.translate(px, p.y + p.h / 2);
    ctx.scale(1 - 0.035 * tilt, 1 + 0.02 * tilt);
    ctx.translate(-px, -(p.y + p.h / 2));

    // shadow on the counter
    ctx.save();
    ctx.shadowColor = 'rgba(24,34,40,0.38)';
    ctx.shadowBlur = 34 * scale * dpr; ctx.shadowOffsetY = (14 + tilt * 10) * scale * dpr; ctx.shadowOffsetX = (4 - tilt * 6) * scale * dpr;
    rr(ctx, p.x, p.y, p.w, p.h, 30); ctx.fillStyle = '#C9CFD2'; ctx.fill();
    ctx.restore();

    // rim
    let g = ctx.createLinearGradient(p.x, p.y, p.x + p.w * 0.35, p.y + p.h * 1.3);
    g.addColorStop(0, '#F3F5F6'); g.addColorStop(0.35, '#C3CACE'); g.addColorStop(0.6, '#E6EAEC'); g.addColorStop(1, '#9AA4AA');
    rr(ctx, p.x, p.y, p.w, p.h, 30); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(31,42,51,0.35)'; ctx.stroke();

    // well
    const inset = 13, wx = p.x + inset, wy = p.y + inset, ww = p.w - inset * 2, wh = p.h - inset * 2;
    g = ctx.createLinearGradient(wx, wy, wx + ww * 0.3, wy + wh * 1.4);
    g.addColorStop(0, '#B4BCC0'); g.addColorStop(0.5, '#A3ACB1'); g.addColorStop(1, '#8F999F');
    rr(ctx, wx, wy, ww, wh, 20); ctx.fillStyle = g; ctx.fill();
    ctx.save();
    rr(ctx, wx, wy, ww, wh, 20); ctx.clip();
    ctx.fillStyle = steelTex; ctx.globalAlpha = 1; ctx.fillRect(wx, wy, ww, wh);
    // a soft light from the hood, sliding as the pan tips
    g = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
    const sh = 0.32 + tilt * 0.12;
    g.addColorStop(clamp(sh - 0.18, 0, 1), 'rgba(255,255,255,0)');
    g.addColorStop(sh, 'rgba(255,255,255,0.22)');
    g.addColorStop(clamp(sh + 0.2, 0, 1), 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
    // inner shadow under the rim
    ctx.shadowColor = 'rgba(20,28,34,0.55)'; ctx.shadowBlur = 16 * scale * dpr; ctx.shadowOffsetX = 3 * scale * dpr; ctx.shadowOffsetY = 5 * scale * dpr;
    ctx.beginPath(); ctx.rect(wx - 200, wy - 200, ww + 400, wh + 400);
    rr(ctx, wx, wy, ww, wh, 20, true);
    ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fill('evenodd');
    ctx.restore();
    // rim lip highlight
    rr(ctx, wx - 1, wy - 1, ww + 2, wh + 2, 21);
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.stroke();

    // cups resting in the pan
    for (const c of cups) if (c.present && !c.free) drawCup(c, slotPos(c.i));

    ctx.restore();
  }

  function drawCup(c, base) {
    const x = base.x + c.ox, y = base.y + c.oy, s = c.s, r = CUP_R * s;
    if (c.a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = c.a;
    // contact shadow grows softer and further as the cup lifts toward the camera
    const lift = c.lift;
    const off = 3 + lift * 16, blur = 0.25 + lift * 0.45;
    const g = ctx.createRadialGradient(x + off * 0.4, y + off, r * (0.6 - blur * 0.4), x + off * 0.4, y + off, r * (1.05 + blur));
    g.addColorStop(0, `rgba(18,26,31,${0.42 * (1 - lift * 0.55) * (1 - c.dark * 0.5)})`);
    g.addColorStop(1, 'rgba(18,26,31,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + off * 0.4, y + off, r * (1.05 + blur), 0, Math.PI * 2); ctx.fill();
    const d = r * 2 * (cupSprite.width / (cupSprite.width - 4));
    if (c.dark < 1) ctx.drawImage(cupSprite, x - d / 2, y - d / 2, d, d);
    if (c.dark > 0) { // darkens as it falls away from the light
      ctx.globalAlpha = c.a * Math.min(1, c.dark);
      ctx.drawImage(cupDark, x - d / 2, y - d / 2, d, d);
    }
    ctx.restore();
  }

  function drawBin() {
    const b = L.bin;
    ctx.save();
    ctx.shadowColor = 'rgba(24,34,40,0.4)'; ctx.shadowBlur = 30 * scale * dpr; ctx.shadowOffsetY = 12 * scale * dpr;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = '#3C454A'; ctx.fill();
    ctx.restore();
    let g = ctx.createLinearGradient(b.x - b.r, b.y - b.r, b.x + b.r, b.y + b.r);
    g.addColorStop(0, '#5C666C'); g.addColorStop(0.5, '#3B4449'); g.addColorStop(1, '#262D31');
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    // the bag
    const ir = b.r - 14;
    g = ctx.createRadialGradient(b.x - ir * 0.2, b.y - ir * 0.25, ir * 0.1, b.x, b.y, ir);
    g.addColorStop(0, '#11161A'); g.addColorStop(0.7, '#1A2024'); g.addColorStop(1, '#2A3237');
    ctx.beginPath(); ctx.arc(b.x, b.y, ir, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(b.x, b.y, ir, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 3;
    for (let n = 0; n < 7; n++) {
      const a = n * 0.9 + 0.3;
      ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * ir * 0.9, b.y + Math.sin(a) * ir * 0.9, ir * 0.55, a + 2.2, a + 3.6); ctx.stroke();
    }
    // what went in stays in
    for (const bc of binned) {
      const c = { s: bc.s * (1 + bc.bounce), a: 1, lift: 0, ox: 0, oy: 0, dark: 1 };
      ctx.save();
      ctx.translate(b.x + bc.ux * ir, b.y + bc.uy * ir); ctx.rotate(bc.rot);
      drawCup(c, { x: 0, y: 0 });
      ctx.restore();
    }
    // the bag's inner shadow over its contents
    ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 18 * scale * dpr; ctx.shadowOffsetY = 6 * scale * dpr;
    ctx.beginPath(); ctx.rect(b.x - ir * 3, b.y - ir * 3, ir * 6, ir * 6); ctx.arc(b.x, b.y, ir, 0, Math.PI * 2, true);
    ctx.fillStyle = '#000'; ctx.fill();
    ctx.restore();
    // rim highlight
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 1.5, Math.PI * 0.95, Math.PI * 1.75);
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke();
  }

  function drawLines() {
    const p = L.pan, wide = L.wide;
    // Tooey's count: drawn once, in green, etched across the pan
    if (tooeyShown) {
      const pos = linePos(TOOEY_LEVEL);
      const a0 = (wide ? p.y : p.x) - 12, a1 = (wide ? p.y + p.h : p.x + p.w) + 12;
      const a = lerp(a0, a1, tooeyDraw);
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = C.green;
      ctx.shadowColor = 'rgba(255,255,255,0.5)'; ctx.shadowOffsetY = 1 * scale * dpr;
      ctx.beginPath();
      if (wide) { ctx.moveTo(pos, a0); ctx.lineTo(pos, a); } else { ctx.moveTo(a0, pos); ctx.lineTo(a, pos); }
      ctx.stroke();
      ctx.restore();
      if (tooeyDraw > 0.4) {
        ctx.save();
        ctx.globalAlpha = clamp((tooeyDraw - 0.4) / 0.4, 0, 1);
        ctx.fillStyle = C.greenInk;
        ctx.font = `600 ${L.label}px "Plex Condensed", "IBM Plex Sans Condensed", sans-serif`;
        if (wide) { ctx.textAlign = 'center'; ctx.fillText('Tooey’s count', pos, p.y - 20); }
        else { ctx.textAlign = 'left'; ctx.fillText('Tooey’s', p.x + p.w + 18, pos - 4); ctx.fillText('count', p.x + p.w + 18, pos + L.label - 2); }
        ctx.restore();
      }
    }

    // the visitor's line and its handle
    const pos = linePos(lineVis);
    const knob = wide ? { x: pos, y: p.y + p.h + L.knob.off } : { x: p.x - L.knob.off + 2, y: pos };
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5;
    ctx.globalAlpha = serving ? 0.45 : 1;
    ctx.beginPath();
    if (wide) { ctx.moveTo(pos, p.y + 6); ctx.lineTo(pos, knob.y); } else { ctx.moveTo(p.x + p.w - 6, pos); ctx.lineTo(knob.x, pos); }
    ctx.stroke();
    // knob
    ctx.shadowColor = 'rgba(20,28,34,0.35)'; ctx.shadowBlur = 8 * scale * dpr; ctx.shadowOffsetY = 3 * scale * dpr;
    const kr = (L.wide ? 21 : 27) + (hoverKnob ? 2 : 0);
    ctx.beginPath(); ctx.arc(knob.x, knob.y, kr, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(250,250,247,0.85)'; ctx.lineWidth = 2;
    for (let n = -1; n <= 1; n++) {
      ctx.beginPath();
      const gs = kr * 0.28, gl = kr * 0.4;
      if (wide) { ctx.moveTo(knob.x + n * gs, knob.y - gl); ctx.lineTo(knob.x + n * gs, knob.y + gl); }
      else { ctx.moveTo(knob.x - gl, knob.y + n * gs); ctx.lineTo(knob.x + gl, knob.y + n * gs); }
      ctx.stroke();
    }
    if (nudging && !serving) {
      const ph = (now() % 1600) / 1600;
      ctx.globalAlpha = (1 - ph) * 0.55;
      ctx.lineWidth = 2.5; ctx.strokeStyle = C.green;
      ctx.beginPath(); ctx.arc(knob.x, knob.y, kr + 4 + ph * 18, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (focusRing > 0.01) {
      ctx.globalAlpha = focusRing;
      ctx.lineWidth = 3; ctx.strokeStyle = C.green;
      ctx.beginPath(); ctx.arc(knob.x, knob.y, kr + 7, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawRail() {
    const r = L.rail;
    // tickets hang under the bar
    for (const t of tickets) {
      if (t.a <= 0.003) continue;
      ctx.save();
      ctx.translate(t.x + r.tw / 2, r.y);
      ctx.rotate(t.rot);
      ctx.globalAlpha = t.a;
      const w = r.tw, h = r.th, x = -w / 2, y = -6;
      if (!t.blank || t.a > 0.5) {
        ctx.shadowColor = 'rgba(24,34,40,0.28)'; ctx.shadowBlur = 8 * scale * dpr; ctx.shadowOffsetY = 4 * scale * dpr;
      }
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
      const teeth = 7;
      for (let n = teeth; n >= 0; n--) ctx.lineTo(x + (w / teeth) * n, y + h - (n % 2 ? 3 : 0));
      ctx.closePath();
      ctx.fillStyle = t.blank ? `rgba(250,250,247,${0.35 + 0.65 * t.paper})` : C.thermal;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      if (t.blank && t.emboss > 0) {
        // the sale that never printed: only the impression of a ticket is left
        ctx.globalAlpha = t.emboss;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.strokeRect(x + 1, y + 1, w - 2, h - 4);
        ctx.strokeStyle = 'rgba(31,42,51,0.22)'; ctx.strokeRect(x + 2.5, y + 2.5, w - 4, h - 6);
        ctx.globalAlpha = t.a;
      }
      if (!t.blank && t.ink > 0) {
        const u = w / 66;
        const bars = [[10, 24, 20, 3], [10, 35, 44, 6], [10, 50, 32, 3], [10, 58, 38, 3], [10, 72, 16, 3], [34, 72, 20, 3]];
        ctx.fillStyle = 'rgba(38,44,56,0.72)';
        for (const [bx, by, bw, bh] of bars) {
          const yy = y + by * u;
          if (yy - y > (h - 6) * t.ink) break;
          ctx.fillRect(x + bx * u, yy, bw * u * (0.85 + 0.15 * ((t.k * 7 + by) % 3) / 2), bh * u);
        }
      }
      ctx.restore();
    }
    // the bar itself
    const g = ctx.createLinearGradient(0, r.y - 8, 0, r.y + 8);
    g.addColorStop(0, '#F2F4F5'); g.addColorStop(0.45, '#B9C1C5'); g.addColorStop(0.55, '#D9DEE0'); g.addColorStop(1, '#8E989E');
    ctx.save();
    ctx.shadowColor = 'rgba(24,34,40,0.3)'; ctx.shadowBlur = 6 * scale * dpr; ctx.shadowOffsetY = 3 * scale * dpr;
    rr(ctx, r.x0, r.y - 8, r.x1 - r.x0, 16, 8); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(31,42,51,0.3)';
    rr(ctx, r.x0, r.y - 8, r.x1 - r.x0, 16, 8); ctx.stroke();
  }

  function draw() {
    if (!L) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    drawBin();
    drawPan();
    // cups on their way into the bin, under the rail and over the bin rim until they drop below it
    for (const c of cups) {
      if (!(c.present && c.free && c.kind === 'dump')) continue;
      if (c.clip > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(L.bin.x, L.bin.y, L.bin.r - 14, 0, Math.PI * 2); ctx.clip();
        drawCup(c, { x: 0, y: 0 }); ctx.restore();
      } else drawCup(c, { x: 0, y: 0 });
    }
    drawLines();
    drawRail();
    // cups being served are lifted toward the camera, above everything
    for (const c of cups) if (c.present && c.free && c.kind === 'serve') drawCup(c, { x: 0, y: 0 });
  }

  /* ---------- sizing ---------- */
  function resize() {
    const w = stage.clientWidth;
    if (!w) return;
    const next = makeLayout(w);
    const flipped = !L || L.wide !== next.wide;
    L = next; cssW = w;
    scale = w / L.W;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const h = Math.round(L.H * scale);
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    buildSprites();
    if (flipped) for (const c of cups) if (c.free) { c.present = false; c.free = false; }
    draw();
  }
  new ResizeObserver(resize).observe(stage);

  /* ---------- filling the pan ---------- */
  function setLevel(next, { quick = false } = {}) {
    next = clamp(Math.round(next), 0, SLICES);
    const was = spent ? 0 : level;
    level = next; spent = false;
    range.value = String(next);
    range.setAttribute('aria-valuetext', next === 0 ? 'Nothing prepped' : `${next} of ${SLICES} rows of the pan`);
    const want = next * PER;
    let n = 0;
    for (const c of cups) {
      if (c.free) continue;
      const should = c.i < want;
      if (should && !c.present) {
        // dropped in from just above: a little large, then it settles with a bounce
        c.present = true; c.s = 1.22; c.a = 0; c.lift = 0.7; c.ox = 0; c.oy = 0; c.dark = 0;
        const delay = quick ? 0 : Math.max(0, (Math.floor(c.i / PER) - Math.floor(was)) * 24 + (c.i % PER) * 14);
        tween(300, (e) => { c.s = lerp(1.22, 1, e); c.lift = lerp(0.7, 0, e); }, ease.outBack, delay);
        tween(140, (e) => { c.a = e; }, ease.linear, delay);
        n++;
      } else if (!should && c.present) {
        tween(170, (e) => { c.s = lerp(1, 1.14, e); c.a = 1 - e; c.lift = e * 0.6; }, ease.outCubic).then(() => {
          if (c.i >= level * PER || spent) { c.present = false; c.s = 1; c.a = 1; c.lift = 0; }
        });
      }
    }
    kick();
    return wait(quick ? 0 : 320 + n * 6);
  }

  /* ---------- service ---------- */
  /* Demand is the same for everyone: it wanders around a centre every run, whoever preps.
     Tooey's line sits a little above that centre, so usually a few cups are left,
     sometimes it's nearly exact, and now and then a late ticket prints blank even at the line.
     Illustrative only: no accuracy has been measured at a live restaurant. */
  function randomDemand() {
    const u = 1 - Math.random(), v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return clamp(Math.round(16.4 + z * 1.7), 11, 22);
  }

  function railSlot(k, D) {
    const r = L.rail;
    const span = r.x1 - r.x0 - r.tw - 24;
    const gap = Math.min(r.tw * 0.95, span / Math.max(D - 1, 1));
    return r.x0 + 12 + k * gap;
  }

  async function clearRail() {
    if (!tickets.length) return;
    const old = tickets;
    await Promise.all(old.map((t, i) => {
      const x0 = t.x;
      return tween(320, (e) => { t.x = x0 + e * 90; t.a = Math.min(t.a, 1 - e); }, ease.inCubic, i * 8);
    }));
    tickets = tickets.filter((t) => !old.includes(t));
  }

  function serveCup(c, toX) {
    const from = tiltPoint(slotPos(c.i).x, slotPos(c.i).y);
    c.free = true; c.kind = 'serve'; c.ox = from.x; c.oy = from.y;
    const r = L.rail, tx = toX + r.tw / 2, ty = r.y + r.th * 0.45;
    return tween(150, (e) => { c.lift = e; c.s = 1 + e * 0.12; }, ease.outCubic)
      .then(() => tween(420, (e, p) => {
        c.ox = lerp(from.x, tx, e); c.oy = lerp(from.y, ty, e) - Math.sin(p * Math.PI) * 30;
        c.s = lerp(1.12, 0.5, e); c.a = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
      }, ease.inOutCubic))
      .then(() => { c.present = false; c.free = false; c.kind = null; c.s = 1; c.a = 1; c.lift = 0; c.ox = 0; c.oy = 0; });
  }

  function addTicket(k, D, blank) {
    const r = L.rail;
    const tx = railSlot(k, D);
    const t = { k, x: r.x0 - r.tw - 40, tx, rot: (Math.random() - 0.5) * 0.05, a: 1, ink: 0, blank, paper: 1, emboss: 0 };
    tickets.push(t);
    const x0 = t.x;
    return tween(440, (e) => { t.x = lerp(x0, tx, e); }, ease.outQuint).then(() => {
      if (!blank) return tween(260, (e) => { t.ink = e; }, ease.linear);
      // nothing printed. it hangs there a moment, then it's as if it never came in
      return wait(420)
        .then(() => tween(500, (e) => { t.paper = 1 - e; t.emboss = e; }, ease.inOutCubic))
        .then(() => tween(1100, (e) => { t.a = 1 - e; }, ease.inCubic));
    });
  }

  async function dumpLeftovers() {
    const left = cups.filter((c) => c.present && !c.free);
    if (!left.length) return;
    const p = L.pan, b = L.bin;
    await tween(420, (e) => { tilt = e; }, ease.inOutCubic);
    const rightEdge = p.x + p.w;
    const jobs = left.map((c) => {
      const start = tiltPoint(slotPos(c.i).x, slotPos(c.i).y);
      const dist = rightEdge - start.x;
      const delay = dist * 0.32 + Math.random() * 60;
      const exit = { x: rightEdge - 8, y: start.y };
      // where it lands in the bin: biased toward the near side, never outside the bag
      const ang = Math.random() * Math.PI * 2, rad = Math.sqrt(Math.random()) * 0.6;
      const land = { ux: Math.cos(ang) * rad - 0.12, uy: Math.sin(ang) * rad };
      const ir = b.r - 14;
      const tgt = { x: b.x + land.ux * ir, y: b.y + land.uy * ir };
      return wait(delay).then(() => {
        c.free = true; c.kind = 'dump'; c.ox = start.x; c.oy = start.y; c.clip = 0;
        const slide = 160 + dist * 0.3;
        return tween(slide, (e) => { c.ox = lerp(start.x, exit.x, e); c.oy = start.y; c.lift = 0; }, ease.inQuad);
      }).then(() => tween(380, (e, q) => {
        c.ox = lerp(exit.x, tgt.x, e); c.oy = lerp(exit.y, tgt.y, ease.outCubic(q));
        c.s = lerp(1, 0.7, e); c.dark = e; c.clip = q > 0.62 ? 1 : 0;
      }, ease.inQuad)).then(() => {
        c.present = false; c.free = false; c.kind = null; c.s = 1; c.dark = 0; c.clip = 0; c.ox = 0; c.oy = 0;
        const bc = { ux: land.ux, uy: land.uy, rot: Math.random() * 6, s: 0.7, bounce: 0 };
        binned.push(bc);
        if (binned.length > 90) binned.shift();
        return tween(260, (e, q) => { bc.bounce = Math.sin(q * Math.PI) * 0.06 * (1 - q); }, ease.linear);
      });
    });
    await Promise.all(jobs);
    tween(420, (e) => { tilt = 1 - e; }, ease.inOutCubic);
  }

  async function runService(mode, D) {
    if (serving) return;
    serving = true;
    pass.classList.add('is-serving');
    serveBtn.disabled = true; tooeyBtn.disabled = true; range.disabled = true;
    setCall('');
    await clearRail();
    if (spent) await setLevel(level);
    await wait(150);

    const prep = level * PER;
    const T = 2100 + D * 55;
    const times = [];
    for (let k = 0; k < D; k++) {
      const u = (k + 0.5) / D;
      times.push(T * (u + 0.12 * Math.sin(2 * Math.PI * u)) + (Math.random() - 0.5) * 50);
    }
    const t0 = now();
    const jobs = [];
    let served = 0;
    for (let k = 0; k < D; k++) {
      const dt = times[k] - (now() - t0);
      if (dt > 0) await wait(dt);
      const avail = cups.filter((c) => c.present && !c.free).sort((a, b) => b.i - a.i);
      if (avail.length) {
        served++;
        jobs.push(addTicket(k, D, false));
        jobs.push(serveCup(avail[0], railSlot(k, D)));
      } else {
        jobs.push(addTicket(k, D, true));
      }
    }
    await wait(500);
    const leftover = cups.filter((c) => c.present && !c.free).length;
    if (leftover) await dumpLeftovers();
    await Promise.all(jobs);
    spent = true;

    const missed = D - served;
    let line;
    if (mode === 'tooey') line = 'Closer, not perfect.';
    else if (missed > 0) line = 'Too little, you can’t.';
    else if (leftover >= 5) line = 'Too much, you can see.';
    else line = 'Close. Now every dish, every day.';
    setCall(line, mode === 'tooey' ? 'What your sales say you’ll sell, plus a little.' : '');

    serving = false;
    pass.classList.remove('is-serving');
    serveBtn.disabled = false; tooeyBtn.disabled = false; range.disabled = false;
    if (mode !== 'demo') ran++;
    if (mode === 'user' && !tooeyShown) {
      tooeyShown = true;
      await wait(500);
      tween(800, (e) => { tooeyDraw = e; }, ease.inOutCubic);
      tooeyBtn.hidden = false;
    }
    if (mode === 'demo' && !touched) { promptEl.classList.add('is-nudged'); nudging = true; kick(); }
  }

  function setCall(text, sub = '') {
    if (callEl.textContent === text && subEl.textContent === sub) return;
    callEl.classList.add('is-out'); subEl.classList.add('is-out');
    window.setTimeout(() => {
      callEl.textContent = text; subEl.textContent = sub;
      callEl.classList.remove('is-out'); subEl.classList.remove('is-out');
    }, text ? 160 : 0);
  }

  /* ---------- input ---------- */
  function toWorld(ev) {
    const r = canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / scale, y: (ev.clientY - r.top) / scale };
  }
  function levelAt(w) {
    const p = L.pan;
    const v = L.wide ? (w.x - p.x - p.pad) / p.cell : (w.y - p.y - p.pad) / p.cell;
    return clamp(Math.round(v), 0, SLICES);
  }
  function overControl(w) {
    const p = L.pan, m = 46;
    return w.x > p.x - m && w.x < p.x + p.w + (L.wide ? 0 : 12) && w.y > p.y - 12 && w.y < p.y + p.h + m + 10;
  }
  let dragging = false;
  function takeOver() {
    touched = true; nudging = false;
    promptEl.classList.remove('is-nudged');
  }
  canvas.addEventListener('pointerdown', (ev) => {
    if (serving) return;
    const w = toWorld(ev);
    if (!overControl(w)) return;
    takeOver();
    dragging = true;
    canvas.setPointerCapture(ev.pointerId);
    const lv = levelAt(w);
    if (lv !== level || spent) setLevel(lv);
    ev.preventDefault();
  });
  canvas.addEventListener('pointermove', (ev) => {
    const w = toWorld(ev);
    const over = !serving && overControl(w);
    canvas.style.cursor = over ? (dragging ? 'grabbing' : 'grab') : 'default';
    if (over !== hoverKnob) { hoverKnob = over; kick(); }
    if (!dragging || serving) return;
    const lv = levelAt(w);
    if (lv !== level) setLevel(lv);
  });
  const endDrag = () => { dragging = false; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { if (hoverKnob) { hoverKnob = false; kick(); } });

  range.addEventListener('input', () => { if (serving) return; takeOver(); setLevel(+range.value); });
  range.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); serveBtn.click(); } });
  range.addEventListener('focus', () => { focused = true; kick(); });
  range.addEventListener('blur', () => { focused = false; kick(); });

  serveBtn.addEventListener('click', () => { takeOver(); runService('user', randomDemand()); });
  tooeyBtn.addEventListener('click', async () => {
    if (serving) return;
    takeOver();
    await setLevel(TOOEY_LEVEL);
    await wait(250);
    runService('tooey', randomDemand());
  });

  /* ---------- the demo on load: one over-prepped service ---------- */
  async function demo() {
    if (touched || demoRunning) return;
    demoRunning = true;
    await wait(350);
    for (let k = 1; k <= 9; k++) {
      if (touched) { demoRunning = false; return; }
      setLevel(k);
      await wait(70);
    }
    await wait(420);
    if (touched) { demoRunning = false; return; }
    await runService('demo', 15);
    demoRunning = false;
  }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); (document.fonts ? document.fonts.ready : Promise.resolve()).then(demo); }
  }, { threshold: 0.35 });
  io.observe(stage);

  // test hook: lets the screenshot script jump to known moments
  window.__pass = { setLevel, runService: (m, d) => runService(m, d), randomDemand, get state() { return { level, serving, ran, tooeyShown }; }, takeOver };
})();
