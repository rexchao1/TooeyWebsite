import * as THREE from 'three';

// Seeded random so every load (and every poster) draws the same kitchen.
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

export function toTex(c, { srgb = true, repeat = null, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

// Height canvas (grey) -> tangent-space normal map canvas.
export function heightToNormal(src, strength = 2) {
  const w = src.width, h = src.height;
  const sd = src.getContext('2d').getImageData(0, 0, w, h).data;
  const [c, ctx] = makeCanvas(w, h);
  const out = ctx.createImageData(w, h);
  const H = (x, y) => sd[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      out.data[i] = (-dx / l * 0.5 + 0.5) * 255;
      out.data[i + 1] = (dy / l * 0.5 + 0.5) * 255;
      out.data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return c;
}

function noiseFill(ctx, w, h, r, amount, n = 9000, size = 2) {
  for (let i = 0; i < n; i++) {
    const v = r() < 0.5 ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${r() * amount})`;
    ctx.fillRect(r() * w, r() * h, size * r() + 0.5, size * r() + 0.5);
  }
}

// Brushed stainless: streaky roughness, faint colour variation.
export function brushedSteel() {
  const r = rng(11);
  const w = 512, h = 512;
  const [rc, rx] = makeCanvas(w, h);
  rx.fillStyle = 'rgb(92,92,92)'; rx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    const y = r() * h, len = 40 + r() * 400, x = r() * w;
    const v = 60 + r() * 70;
    rx.strokeStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.4})`;
    rx.lineWidth = 0.6 + r() * 1.2;
    rx.beginPath(); rx.moveTo(x, y); rx.lineTo(x + len, y + (r() - 0.5) * 1.5); rx.stroke();
    if (x + len > w) { rx.beginPath(); rx.moveTo(x - w, y); rx.lineTo(x + len - w, y); rx.stroke(); }
  }
  // a few smudges and wipe marks
  for (let i = 0; i < 14; i++) {
    const g = rx.createRadialGradient(0, 0, 0, 0, 0, 40 + r() * 90);
    g.addColorStop(0, `rgba(150,150,150,${0.15 + r() * 0.2})`); g.addColorStop(1, 'rgba(150,150,150,0)');
    rx.save(); rx.translate(r() * w, r() * h); rx.scale(1 + r() * 2, 0.6 + r()); rx.fillStyle = g; rx.fillRect(-200, -200, 400, 400); rx.restore();
  }
  const rough = toTex(rc, { srgb: false });
  const [hc, hx] = makeCanvas(w, h);
  hx.drawImage(rc, 0, 0);
  const bump = toTex(hc, { srgb: false });
  return { rough, bump };
}

// Subway tile, 15 x 7.5 cm, running bond. One canvas = 8 x 16 tiles = 1.2 m square.
export function subwayTile() {
  const r = rng(21);
  const S = 1024, cols = 8, rows = 16;
  const tw = S / cols, th = S / rows, g = 3;
  const [cc, cx] = makeCanvas(S, S);
  const [hc, hx] = makeCanvas(S, S);
  const [rc, rx] = makeCanvas(S, S);
  cx.fillStyle = '#c4beb2'; cx.fillRect(0, 0, S, S);
  hx.fillStyle = '#000'; hx.fillRect(0, 0, S, S);
  rx.fillStyle = 'rgb(210,210,210)'; rx.fillRect(0, 0, S, S);
  for (let row = 0; row < rows; row++) {
    const off = (row % 2) * tw / 2;
    for (let col = -1; col < cols + 1; col++) {
      const x = col * tw + off, y = row * th;
      const t = 236 + r() * 10;
      const warm = r() * 6;
      cx.fillStyle = `rgb(${t + warm | 0},${t + warm * 0.6 | 0},${t - 4 | 0})`;
      roundRect(cx, x + g / 2, y + g / 2, tw - g, th - g, 5); cx.fill();
      // glaze highlight toward the top
      const gr = cx.createLinearGradient(0, y, 0, y + th);
      gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(0.4, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.05)');
      cx.fillStyle = gr; roundRect(cx, x + g / 2, y + g / 2, tw - g, th - g, 5); cx.fill();
      // height: bevelled edge
      for (let k = 0; k < 6; k++) {
        const v = 120 + k * 22;
        hx.fillStyle = `rgb(${v},${v},${v})`;
        roundRect(hx, x + g / 2 + k * 0.9, y + g / 2 + k * 0.9, tw - g - k * 1.8, th - g - k * 1.8, 6 - k * 0.6); hx.fill();
      }
      rx.fillStyle = `rgb(${30 + r() * 20 | 0},${30 + r() * 20 | 0},${30 + r() * 20 | 0})`;
      roundRect(rx, x + g / 2, y + g / 2, tw - g, th - g, 5); rx.fill();
    }
  }
  // grime in the grout near the bottom of each tile row, faint
  noiseFill(cx, S, S, r, 0.05, 6000, 2);
  const map = toTex(cc);
  const normal = toTex(heightToNormal(hc, 3), { srgb: false });
  const rough = toTex(rc, { srgb: false });
  return { map, normal, rough };
}

function roundRect(ctx, x, y, w, h, rr) {
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Quarry tile floor, 15 cm squares (one canvas = 8 x 8 = 1.2 m).
export function quarryTile() {
  const r = rng(31);
  const S = 512, n = 8, t = S / n, g = 4;
  const [cc, cx] = makeCanvas(S, S);
  const [hc, hx] = makeCanvas(S, S);
  cx.fillStyle = '#3b302a'; cx.fillRect(0, 0, S, S);
  hx.fillStyle = '#000'; hx.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = r();
    cx.fillStyle = `rgb(${104 + v * 22 | 0},${54 + v * 12 | 0},${40 + v * 8 | 0})`;
    cx.fillRect(i * t + g / 2, j * t + g / 2, t - g, t - g);
    hx.fillStyle = '#bbb'; hx.fillRect(i * t + g / 2 + 1, j * t + g / 2 + 1, t - g - 2, t - g - 2);
  }
  noiseFill(cx, S, S, r, 0.12, 14000, 2);
  // worn paths, darker grime
  for (let i = 0; i < 10; i++) {
    const gr = cx.createRadialGradient(0, 0, 0, 0, 0, 120);
    gr.addColorStop(0, 'rgba(20,12,8,0.18)'); gr.addColorStop(1, 'rgba(20,12,8,0)');
    cx.save(); cx.translate(r() * S, r() * S); cx.fillStyle = gr; cx.fillRect(-130, -130, 260, 260); cx.restore();
  }
  return { map: toTex(cc), normal: toTex(heightToNormal(hc, 2), { srgb: false }) };
}

// Wood. kind: 'maple' (cutting board), 'walnut' (tables, chairs), 'oak' (floor planks)
export function wood(kind) {
  const r = rng(kind === 'maple' ? 41 : kind === 'walnut' ? 42 : 43);
  const W = 1024, H = kind === 'oak' ? 1024 : 512;
  const [cc, cx] = makeCanvas(W, H);
  const base = { maple: [196, 156, 106], walnut: [86, 56, 38], oak: [120, 86, 58] }[kind];
  const drawGrain = (x0, y0, w, h, tint) => {
    cx.fillStyle = `rgb(${base[0] * tint | 0},${base[1] * tint | 0},${base[2] * tint | 0})`;
    cx.fillRect(x0, y0, w, h);
    const lines = Math.round(h / 3);
    for (let i = 0; i < lines; i++) {
      const y = y0 + r() * h;
      const a = 0.04 + r() * 0.14;
      const dark = r() < 0.7;
      cx.strokeStyle = dark ? `rgba(40,20,8,${a})` : `rgba(255,235,200,${a * 0.6})`;
      cx.lineWidth = 0.6 + r() * 2.2;
      cx.beginPath();
      const amp = 1 + r() * 4, freq = 0.004 + r() * 0.01, ph = r() * 6;
      for (let x = x0; x <= x0 + w; x += 8) {
        const yy = y + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 3.1 + ph) * amp * 0.3;
        if (x === x0) cx.moveTo(x, yy); else cx.lineTo(x, yy);
      }
      cx.stroke();
    }
  };
  if (kind === 'oak') {
    const ph = H / 8; // 8 planks per canvas
    for (let p = 0; p < 8; p++) {
      let x = -r() * 300;
      while (x < W) {
        const len = 300 + r() * 500;
        drawGrain(x, p * ph, len, ph, 0.8 + r() * 0.35);
        cx.fillStyle = 'rgba(20,12,6,0.85)'; cx.fillRect(x, p * ph, 2, ph);
        x += len;
      }
      cx.fillStyle = 'rgba(20,12,6,0.9)'; cx.fillRect(0, p * ph, W, 2);
    }
  } else {
    drawGrain(0, 0, W, H, 1);
    if (kind === 'maple') {
      // knife marks on a used board
      for (let i = 0; i < 220; i++) {
        cx.strokeStyle = `rgba(90,60,30,${0.05 + r() * 0.12})`;
        cx.lineWidth = 0.6;
        const x = r() * W, y = r() * H, a = (r() - 0.5) * 0.9, l = 20 + r() * 90;
        cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); cx.stroke();
      }
    }
  }
  noiseFill(cx, W, H, r, 0.05, 8000, 2);
  return toTex(cc);
}

export function plaster(seed = 51, tone = [62, 58, 54]) {
  const r = rng(seed);
  const S = 512;
  const [cc, cx] = makeCanvas(S, S);
  cx.fillStyle = `rgb(${tone[0]},${tone[1]},${tone[2]})`; cx.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) {
    const gr = cx.createRadialGradient(0, 0, 0, 0, 0, 30 + r() * 110);
    const v = r() < 0.5 ? 0 : 255;
    gr.addColorStop(0, `rgba(${v},${v},${v},${0.03 + r() * 0.04})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
    cx.save(); cx.translate(r() * S, r() * S); cx.fillStyle = gr; cx.fillRect(-150, -150, 300, 300); cx.restore();
  }
  noiseFill(cx, S, S, r, 0.05, 9000, 2);
  return toTex(cc);
}

export function radial(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 256, mid = null) {
  const [c, x] = makeCanvas(size, size);
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  if (mid) g.addColorStop(mid[0], mid[1]);
  g.addColorStop(1, outer);
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = toTex(c, { srgb: false });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// Food seen through the side of a deli quart.
export function food(kind) {
  const r = rng({ pork: 61, polenta: 62, chowder: 63, slaw: 64, aioli: 65 }[kind] || 66);
  const W = 512, H = 256;
  const [cc, cx] = makeCanvas(W, H);
  if (kind === 'pork') {
    cx.fillStyle = '#3a1a0c'; cx.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) {
      const x = r() * W, y = r() * H, w = 22 + r() * 34, h = 16 + r() * 22;
      cx.save(); cx.translate(x, y); cx.rotate((r() - 0.5) * 1.6);
      // a piece of braised belly: rounded, amber fat over dark lean, uneven
      cx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const a = (k / 12) * Math.PI * 2, rr = 1 + (r() - 0.5) * 0.35;
        const px = Math.cos(a) * w / 2 * rr, py = Math.sin(a) * h / 2 * rr;
        if (k === 0) cx.moveTo(px, py); else cx.lineTo(px, py);
      }
      cx.closePath();
      const g = cx.createLinearGradient(0, -h / 2, 0, h / 2);
      g.addColorStop(0, `rgb(${150 + r() * 30 | 0},${88 + r() * 20 | 0},${44 + r() * 14 | 0})`);
      g.addColorStop(0.35, `rgb(${196 + r() * 24 | 0},${136 + r() * 20 | 0},${82 + r() * 16 | 0})`);
      g.addColorStop(0.5, `rgb(${104 + r() * 20 | 0},${48 + r() * 12 | 0},${26 + r() * 8 | 0})`);
      g.addColorStop(1, `rgb(${76 + r() * 16 | 0},${34 + r() * 10 | 0},${18 + r() * 6 | 0})`);
      cx.fillStyle = g; cx.fill();
      cx.restore();
    }
    // the braise: dark, glossy, over everything, thicker toward the bottom
    const lg = cx.createLinearGradient(0, 0, 0, H);
    lg.addColorStop(0, 'rgba(60,24,8,0.35)'); lg.addColorStop(1, 'rgba(40,14,4,0.6)');
    cx.fillStyle = lg; cx.fillRect(0, 0, W, H);
  } else if (kind === 'polenta') {
    cx.fillStyle = '#d6a43c'; cx.fillRect(0, 0, W, H);
    for (let i = 0; i < 300; i++) {
      const gr = cx.createRadialGradient(0, 0, 0, 0, 0, 6 + r() * 26);
      const light = r() < 0.5;
      gr.addColorStop(0, light ? 'rgba(250,215,120,0.35)' : 'rgba(170,110,30,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      cx.save(); cx.translate(r() * W, r() * H); cx.fillStyle = gr; cx.fillRect(-40, -40, 80, 80); cx.restore();
    }
  } else if (kind === 'chowder') {
    cx.fillStyle = '#e6d9bb'; cx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      cx.fillStyle = `rgba(${245},${238},${215},0.9)`;
      const s = 10 + r() * 16; cx.save(); cx.translate(r() * W, r() * H); cx.rotate(r() * 3); roundRect(cx, -s / 2, -s / 2, s, s, 3); cx.fill(); cx.restore();
    }
    for (let i = 0; i < 260; i++) {
      cx.fillStyle = r() < 0.6 ? 'rgba(90,110,50,0.9)' : 'rgba(150,70,50,0.8)';
      cx.fillRect(r() * W, r() * H, 2 + r() * 4, 1 + r() * 3);
    }
  } else if (kind === 'slaw') {
    cx.fillStyle = '#e9e3c8'; cx.fillRect(0, 0, W, H);
    for (let i = 0; i < 700; i++) {
      cx.strokeStyle = r() < 0.5 ? 'rgba(170,190,120,0.8)' : r() < 0.5 ? 'rgba(150,60,110,0.75)' : 'rgba(230,140,60,0.8)';
      cx.lineWidth = 1.5 + r() * 2;
      const x = r() * W, y = r() * H, a = r() * 6.28, l = 10 + r() * 24;
      cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); cx.stroke();
    }
  } else {
    cx.fillStyle = '#efe4b8'; cx.fillRect(0, 0, W, H);
    for (let i = 0; i < 120; i++) {
      const gr = cx.createRadialGradient(0, 0, 0, 0, 0, 10 + r() * 30);
      gr.addColorStop(0, 'rgba(255,250,225,0.4)'); gr.addColorStop(1, 'rgba(255,250,225,0)');
      cx.save(); cx.translate(r() * W, r() * H); cx.fillStyle = gr; cx.fillRect(-40, -40, 80, 80); cx.restore();
    }
  }
  noiseFill(cx, W, H, r, 0.06, 3000, 2);
  return toTex(cc);
}

/* Masking tape with marker writing.
   lines: [{ text, size, x, y }] in canvas px; ink(progress 0..1 per line) */
export class Tape {
  constructor(seed, lines, { w = 1024, h = 300 } = {}) {
    this.r = rng(seed);
    this.lines = lines;
    this.w = w; this.h = h;
    const [c, ctx] = makeCanvas(w, h);
    this.canvas = c; this.ctx = ctx;
    // base paper with torn ends, kept separately and reused each redraw
    const [bc, bx] = makeCanvas(w, h);
    const r = this.r;
    bx.beginPath();
    const tear = (x, dir) => {
      const pts = [];
      for (let y = 0; y <= h; y += 10) pts.push([x + dir * (r() * 16), y]);
      return pts;
    };
    const L = tear(22, 1), R = tear(w - 22, -1);
    bx.moveTo(L[0][0], 6);
    for (const p of R) bx.lineTo(p[0], Math.min(h - 6, Math.max(6, p[1])));
    for (let i = L.length - 1; i >= 0; i--) bx.lineTo(L[i][0], Math.min(h - 6, Math.max(6, L[i][1])));
    bx.closePath();
    bx.fillStyle = '#e4d6ae'; bx.fill();
    bx.save(); bx.clip();
    // crepe texture: fine crosswise wrinkles and fibres
    for (let i = 0; i < 900; i++) {
      bx.strokeStyle = `rgba(${r() < 0.5 ? '120,100,60' : '255,248,225'},${0.04 + r() * 0.08})`;
      bx.lineWidth = 0.5 + r();
      const x = r() * w; bx.beginPath(); bx.moveTo(x, 0); bx.lineTo(x + (r() - 0.5) * 8, h); bx.stroke();
    }
    noiseFill(bx, w, h, r, 0.07, 5000, 2);
    const eg = bx.createLinearGradient(0, 0, 0, h);
    eg.addColorStop(0, 'rgba(120,95,50,0.22)'); eg.addColorStop(0.08, 'rgba(0,0,0,0)');
    eg.addColorStop(0.92, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(120,95,50,0.25)');
    bx.fillStyle = eg; bx.fillRect(0, 0, w, h);
    bx.restore();
    this.base = bc;
    // per-glyph jitter fixed once
    this.jit = lines.map((ln) => [...ln.text].map(() => [(r() - 0.5) * 0.07, (r() - 0.5) * 5, 0.95 + r() * 0.1]));
    this.tex = toTex(c);
    this.tex.wrapS = this.tex.wrapT = THREE.ClampToEdgeWrapping;
    this.progress = lines.map(() => 1);
    this.draw();
  }
  set(i, p) {
    p = Math.max(0, Math.min(1, p));
    if (Math.abs(this.progress[i] - p) < 1e-4) return;
    this.progress[i] = p; this.draw();
  }
  draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.base, 0, 0);
    this.lines.forEach((ln, li) => {
      const p = this.progress[li];
      if (p <= 0) return;
      ctx.font = `${ln.size}px "Permanent Marker"`;
      ctx.textBaseline = 'alphabetic';
      const chars = [...ln.text];
      const widths = chars.map((ch) => ctx.measureText(ch).width * (ln.track || 1));
      const total = widths.reduce((a, b) => a + b, 0);
      let x = ln.x;
      let shown = p * total;
      ctx.fillStyle = ln.color || 'rgba(24,22,24,0.94)';
      ctx.shadowColor = 'rgba(24,22,24,0.35)'; ctx.shadowBlur = 1.5;
      chars.forEach((ch, i) => {
        const cw = widths[i];
        const [rot, dy, sc] = this.jit[li][i];
        if (shown <= 0) return;
        const frac = Math.min(1, shown / cw);
        ctx.save();
        ctx.beginPath(); ctx.rect(x - 4, 0, cw * frac + 6, h); ctx.clip();
        ctx.translate(x + cw / 2, ln.y + dy); ctx.rotate(rot + (ln.rot || 0)); ctx.scale(sc, sc);
        ctx.fillText(ch, -cw / 2 / (ln.track || 1), 0);
        ctx.restore();
        shown -= cw; x += cw;
      });
      ctx.shadowBlur = 0;
    });
    this.tex.needsUpdate = true;
  }
}

/* Marks drawn straight on the quart's side, on a transparent canvas wrapped
   around the wall: a black marker tick at Tooey's fill line, and a red grease
   pencil line at a guessed level with its note. v is height 0..1 on the wall,
   u the position around it (0.5 faces the tape). */
export class Marks {
  constructor() {
    const w = 2048, h = 512;
    const [c, ctx] = makeCanvas(w, h);
    this.canvas = c; this.ctx = ctx; this.w = w; this.h = h;
    this.tex = toTex(c);
    this.tex.wrapS = THREE.RepeatWrapping; this.tex.wrapT = THREE.ClampToEdgeWrapping;
    this.key = '';
    this.cfg = null;
  }
  setup(cfg) { this.cfg = cfg; this.key = ''; this.draw(0, 0); }
  draw(pTick, pGuess, residue = 0, foodV = 0) {
    pTick = Math.max(0, Math.min(1, pTick)); pGuess = Math.max(0, Math.min(1, pGuess));
    const key = [pTick, pGuess, residue, foodV].map((v) => v.toFixed(4)).join();
    if (key === this.key) return;
    this.key = key;
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    const cfg = this.cfg;
    if (!cfg) { this.tex.needsUpdate = true; return; }
    // braise left on the wall as the level drops: a film with drips, from the
    // morning's line down to where the food is now
    if (residue > 0) {
      const top = (1 - cfg.tickV) * h, bottom = (1 - foodV) * h;
      if (bottom > top) {
        const rr = rng(80);
        // the ring left at the morning's level, then a thin film and a few drips
        ctx.fillStyle = `rgba(92,44,18,${0.55 * residue})`;
        for (let x = 0; x < w; x += 6) ctx.fillRect(x, top - 3 + Math.sin(x * 0.02) * 2 + rr() * 2, 7, 4 + rr() * 3);
        const g = ctx.createLinearGradient(0, top, 0, bottom);
        g.addColorStop(0, `rgba(110,56,24,${0.16 * residue})`); g.addColorStop(1, `rgba(110,56,24,${0.05 * residue})`);
        ctx.fillStyle = g; ctx.fillRect(0, top, w, bottom - top);
        for (let i = 0; i < 26; i++) {
          const x = rr() * w, len = 10 + rr() * (bottom - top) * 0.35;
          ctx.strokeStyle = `rgba(96,46,20,${(0.18 + rr() * 0.22) * residue})`;
          ctx.lineWidth = 1.5 + rr() * 2.5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + (rr() - 0.5) * 3, top + len); ctx.stroke();
        }
      }
    }
    const r = rng(78);
    const stroke = (y, x0, x1, p, color, width) => {
      if (p <= 0) return;
      ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = width;
      ctx.beginPath();
      const xe = x0 + (x1 - x0) * p;
      let first = true;
      for (let x = x0; x <= xe + 0.1; x += 10) {
        const yy = y + Math.sin(x * 0.011) * 1.6 + (r() - 0.5) * 1.2;
        if (first) { ctx.moveTo(x, yy); first = false; } else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    };
    // Tooey's fill line: a short black marker tick
    const ty = (1 - cfg.tickV) * h;
    stroke(ty, cfg.tickU0 * w, cfg.tickU1 * w, pTick, 'rgba(22,21,23,0.92)', 6);
    // the guess: red grease pencil line, then its note under it
    const gy = (1 - cfg.guessV) * h;
    const red = 'rgba(178,52,36,0.96)';
    stroke(gy, cfg.u0 * w, cfg.u1 * w, Math.min(1, pGuess / 0.5), red, 7);
    const tp = Math.max(0, (pGuess - 0.45) / 0.55);
    if (tp > 0) {
      ctx.font = `${cfg.size || 46}px "Permanent Marker"`;
      ctx.fillStyle = red;
      const tw = ctx.measureText(cfg.text).width;
      ctx.save();
      ctx.beginPath(); ctx.rect(cfg.u0 * w, gy, tw * tp + 6, 90); ctx.clip();
      ctx.translate(cfg.u0 * w + 6, gy + 56); ctx.rotate(-0.015);
      ctx.fillText(cfg.text, 0, 0);
      ctx.restore();
      // waxy breakup on the grease pencil only
      ctx.globalCompositeOperation = 'destination-out';
      const r2 = rng(79);
      for (let i = 0; i < 1400; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.25 + r2() * 0.6})`;
        ctx.fillRect(cfg.u0 * w + r2() * ((cfg.u1 - cfg.u0) * w + 60), gy - 8 + r2() * 80, 1 + r2() * 2.5, 1 + r2() * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    this.tex.needsUpdate = true;
  }
}

// Moulded graduations on a deli quart: faint ribs (bump) with small numerals.
export function graduations() {
  const w = 1024, h = 512;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, w, h);
  // ribs on one side only, as on the real container
  ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 4;
  for (let i = 1; i <= 7; i++) {
    const y = h - (i / 8) * h * 0.86 - h * 0.04;
    const long = i % 2 === 0;
    ctx.beginPath(); ctx.moveTo(w * 0.40, y); ctx.lineTo(w * (long ? 0.47 : 0.44), y); ctx.stroke();
  }
  // embossed ring near the base and lid seat
  ctx.fillStyle = '#b0b0b0'; ctx.fillRect(0, h * 0.965, w, 6);
  const t = toTex(c, { srgb: false });
  return t;
}

export function thermalTicket(seed) {
  const r = rng(seed);
  const w = 128, h = 256;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#f3f0e6'; ctx.fillRect(0, 0, w, h);
  // printed lines as grey bars, no legible words
  let y = 18;
  ctx.fillStyle = 'rgba(60,60,64,0.75)';
  ctx.fillRect(14, y, 70 + r() * 30, 8); y += 22;
  ctx.fillStyle = 'rgba(60,60,64,0.45)';
  ctx.fillRect(14, y, 50, 4); y += 18;
  const items = 3 + (r() * 4 | 0);
  for (let i = 0; i < items; i++) {
    ctx.fillStyle = 'rgba(50,50,54,0.7)';
    ctx.fillRect(14, y, 8, 6);
    ctx.fillRect(30, y, 40 + r() * 56, 6);
    y += 14;
    if (r() < 0.4) { ctx.fillStyle = 'rgba(50,50,54,0.45)'; ctx.fillRect(38, y, 30 + r() * 30, 4); y += 12; }
    y += 6;
  }
  noiseFill(ctx, w, h, r, 0.05, 600, 1.5);
  const t = toTex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

export function clockFace() {
  const S = 512;
  const [c, ctx] = makeCanvas(S, S);
  ctx.fillStyle = '#efece4'; ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2, 0, 7); ctx.fill();
  ctx.fillStyle = '#1f1f22';
  for (let i = 0; i < 60; i++) {
    ctx.save(); ctx.translate(S / 2, S / 2); ctx.rotate((i / 60) * Math.PI * 2);
    const big = i % 5 === 0;
    ctx.fillRect(big ? -7 : -2, -S / 2 + 22, big ? 14 : 4, big ? 54 : 18);
    ctx.restore();
  }
  const t = toTex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

export function chalkboard(text) {
  const r = rng(91);
  const w = 1024, h = 640;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#272b29'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 60 + r() * 200);
    gr.addColorStop(0, `rgba(230,230,220,${0.03 + r() * 0.05})`); gr.addColorStop(1, 'rgba(230,230,220,0)');
    ctx.save(); ctx.translate(r() * w, r() * h); ctx.scale(1.8, 0.7); ctx.fillStyle = gr; ctx.fillRect(-260, -260, 520, 520); ctx.restore();
  }
  ctx.font = '150px "Permanent Marker"';
  ctx.fillStyle = 'rgba(236,234,226,0.9)';
  ctx.save(); ctx.translate(w / 2, h / 2 + 50); ctx.rotate(-0.035);
  ctx.textAlign = 'center'; ctx.fillText(text, 0, 0); ctx.restore();
  // a short underline
  ctx.strokeStyle = 'rgba(236,234,226,0.75)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(w * 0.26, h / 2 + 96); ctx.quadraticCurveTo(w * 0.5, h / 2 + 84, w * 0.74, h / 2 + 100); ctx.stroke();
  // chalk breakup
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 9000; i++) { ctx.fillStyle = `rgba(0,0,0,${r() * 0.5})`; ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#272b29'; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  return toTex(c);
}

export function towel() {
  const r = rng(101);
  const w = 256, h = 256;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#e9e6dc'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#3f5f86'; ctx.fillRect(0, 40, w, 10); ctx.fillRect(0, 58, w, 4);
  for (let i = 0; i < 4000; i++) { ctx.fillStyle = `rgba(0,0,0,${r() * 0.06})`; ctx.fillRect(r() * w, r() * h, 1, 1 + r() * 3); }
  return toTex(c);
}
