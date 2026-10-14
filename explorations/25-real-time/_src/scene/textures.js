// Procedural textures, drawn on canvases. No image files.
import * as THREE from 'three';

const FONT = '"Hanken Grotesk", system-ui, sans-serif';

function cv(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Small seeded random so every load and every still is the same.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tex(c, { color = false, repeat = [1, 1], aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

// Height canvas to normal map (Sobel).
function normalFrom(hc, strength = 2) {
  const w = hc.width, h = hc.height;
  const src = hc.getContext('2d').getImageData(0, 0, w, h).data;
  const out = cv(w, h);
  const ctx = out.getContext('2d');
  const img = ctx.createImageData(w, h);
  const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      let nx = -dx, ny = dy, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      const i = (y * w + x) * 4;
      img.data[i] = (nx / l * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255;
      img.data[i + 2] = (nz / l * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

function speckle(ctx, w, h, n, r, alpha, light, seed) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = light ? `rgba(255,255,255,${alpha * R()})` : `rgba(0,0,0,${alpha * R()})`;
    ctx.fillRect(R() * w, R() * h, r * R() + 0.5, r * R() + 0.5);
  }
}

// Brushed steel: fine streaks in one direction (roughness map).
export function steelRough(seed = 3) {
  const w = 512, c = cv(w), ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(110,110,110)';
  ctx.fillRect(0, 0, w, w);
  const R = rng(seed);
  for (let i = 0; i < 2600; i++) {
    const y = R() * w, len = 40 + R() * 420, x = R() * w;
    const v = 70 + R() * 110;
    ctx.strokeStyle = `rgba(${v},${v},${v},${0.12 + R() * 0.22})`;
    ctx.lineWidth = 0.6 + R() * 1.1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (R() - 0.5) * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x - w + len, y); ctx.stroke();
  }
  // a few soft smudges, as on a wiped table
  for (let i = 0; i < 14; i++) {
    const g = ctx.createRadialGradient(R() * w, R() * w, 0, R() * w, R() * w, 30 + R() * 90);
    g.addColorStop(0, 'rgba(160,160,160,0.18)');
    g.addColorStop(1, 'rgba(160,160,160,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
  }
  return tex(c);
}

// White subway tile in running bond. Returns {map, normalMap, roughnessMap}.
// One texture tile covers 4 x 8 tiles (0.6 m by 0.6 m at 150 x 75 mm).
export function subwayTile(seed = 5) {
  const w = 1024, cols = 4, rows = 8, tw = w / cols, th = w / rows, g = 5;
  const col = cv(w), hc = cv(w), rc = cv(w);
  const c1 = col.getContext('2d'), h1 = hc.getContext('2d'), r1 = rc.getContext('2d');
  c1.fillStyle = '#b9b4aa'; c1.fillRect(0, 0, w, w);
  h1.fillStyle = '#000'; h1.fillRect(0, 0, w, w);
  r1.fillStyle = 'rgb(200,200,200)'; r1.fillRect(0, 0, w, w);
  const R = rng(seed);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * tw / 2;
    for (let k = -1; k <= cols; k++) {
      const x = k * tw + off + g / 2, y = r * th + g / 2, ww = tw - g, hh = th - g;
      const tint = 238 + Math.floor(R() * 10);
      c1.fillStyle = `rgb(${tint},${tint - 1},${tint - 4})`;
      c1.fillRect(x, y, ww, hh);
      // pillowed glaze: raised centre, soft rounded edge
      for (let s = 0; s < 6; s++) {
        const v = 120 + s * 24;
        h1.fillStyle = `rgb(${v},${v},${v})`;
        roundRect(h1, x + s, y + s, ww - 2 * s, hh - 2 * s, 6);
        h1.fill();
      }
      r1.fillStyle = 'rgb(28,28,28)';
      roundRect(r1, x + 1, y + 1, ww - 2, hh - 2, 6); r1.fill();
    }
  }
  speckle(c1, w, w, 9000, 1.6, 0.05, false, seed + 1);
  return {
    map: tex(col, { color: true }),
    normalMap: tex(normalFrom(hc, 3.2)),
    roughnessMap: tex(rc),
  };
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

// Wood with long grain. base: [r,g,b]
export function wood(base = [150, 108, 70], seed = 7, planks = 0) {
  const w = 1024, c = cv(w), ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base.join(',')})`;
  ctx.fillRect(0, 0, w, w);
  const R = rng(seed);
  const bands = planks || 1;
  for (let b = 0; b < bands; b++) {
    const y0 = (b / bands) * w, bh = w / bands;
    const tone = (R() - 0.5) * 26;
    ctx.fillStyle = `rgba(${tone > 0 ? '255,240,220' : '40,20,5'},${Math.abs(tone) / 160})`;
    ctx.fillRect(0, y0, w, bh);
    for (let i = 0; i < 70; i++) {
      const y = y0 + R() * bh, amp = 2 + R() * 8, f = 0.002 + R() * 0.01, ph = R() * 6;
      ctx.strokeStyle = `rgba(60,32,12,${0.05 + R() * 0.12})`;
      ctx.lineWidth = 0.6 + R() * 2.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 16) {
        const yy = y + Math.sin(x * f + ph) * amp;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    if (planks) {
      ctx.fillStyle = 'rgba(30,18,8,0.55)';
      ctx.fillRect(0, y0, w, 2);
      const joint = R() * w;
      ctx.fillRect(joint, y0, 2, bh);
    }
  }
  speckle(ctx, w, w, 5000, 1.2, 0.08, false, seed + 2);
  return tex(c, { color: true });
}

// Sealed concrete floor.
export function concrete(seed = 11) {
  const w = 512, c = cv(w), ctx = c.getContext('2d');
  ctx.fillStyle = '#8d8983'; ctx.fillRect(0, 0, w, w);
  const R = rng(seed);
  for (let i = 0; i < 60; i++) {
    const x = R() * w, y = R() * w, r = 30 + R() * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const d = R() > 0.5;
    g.addColorStop(0, d ? 'rgba(60,55,50,0.10)' : 'rgba(200,195,185,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
  }
  speckle(ctx, w, w, 14000, 1.4, 0.18, false, seed + 1);
  speckle(ctx, w, w, 6000, 1.2, 0.12, true, seed + 2);
  return tex(c, { color: true });
}

// Plaster wall.
export function plaster(seed = 13) {
  const w = 512, c = cv(w), ctx = c.getContext('2d');
  ctx.fillStyle = '#e7e3dc'; ctx.fillRect(0, 0, w, w);
  speckle(ctx, w, w, 9000, 2, 0.04, false, seed);
  return tex(c, { color: true });
}

// Paper (parchment or label stock). Returns colour map.
export function paper(tone = '#efe9dc', seed = 17) {
  const w = 256, c = cv(w), ctx = c.getContext('2d');
  ctx.fillStyle = tone; ctx.fillRect(0, 0, w, w);
  speckle(ctx, w, w, 3000, 1.2, 0.05, false, seed);
  return tex(c, { color: true });
}

// Crinkle normal map for parchment and cling film.
export function crinkle(seed = 19, scale = 1) {
  const w = 512, hc = cv(w), ctx = hc.getContext('2d');
  ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, w, w);
  const R = rng(seed);
  for (let i = 0; i < 260; i++) {
    const x = R() * w, y = R() * w, a = R() * Math.PI, len = 30 + R() * 160;
    ctx.strokeStyle = R() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2 + R() * 8;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
  }
  ctx.filter = 'blur(3px)';
  ctx.drawImage(hc, 0, 0);
  ctx.filter = 'none';
  return tex(normalFrom(hc, 1.6 * scale));
}

// Linen / cotton twill for aprons and napkins.
export function linen(seed = 23) {
  const w = 256, c = cv(w), ctx = c.getContext('2d');
  ctx.fillStyle = '#ece8df'; ctx.fillRect(0, 0, w, w);
  for (let y = 0; y < w; y += 2) {
    ctx.fillStyle = `rgba(90,80,60,${0.05 + (y % 4 ? 0.02 : 0)})`;
    ctx.fillRect(0, y, w, 1);
  }
  for (let x = 0; x < w; x += 2) {
    ctx.fillStyle = 'rgba(90,80,60,0.04)';
    ctx.fillRect(x, 0, 1, w);
  }
  speckle(ctx, w, w, 2000, 1.5, 0.05, false, seed);
  return tex(c, { color: true });
}

// Sky seen through a window: vertical gradient, tinted per view by material.color.
export function skyGradient() {
  const c = cv(16, 256), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#b8c8d8');
  g.addColorStop(0.55, '#dfe3e2');
  g.addColorStop(1, '#f4e6cf');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const t = tex(c, { color: true });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// A printed kitchen label: dish name and the count.
export function label(name, count) {
  const w = 640, h = 400, c = cv(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = '#f6f5f1'; ctx.fillRect(0, 0, w, h);
  speckle(ctx, w, h, 1500, 1.2, 0.03, false, name.length * 7);
  ctx.fillStyle = '#232a2f';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `600 64px ${FONT}`;
  ctx.fillText(name, 44, 104);
  ctx.font = `700 230px ${FONT}`;
  ctx.fillText(String(count), 36, 352);
  // thin printed rule under the name, like a kitchen label printer's template
  ctx.fillRect(44, 132, w - 88, 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Wall clock face.
export function clockFace() {
  const w = 512, c = cv(w), ctx = c.getContext('2d'), m = w / 2;
  ctx.fillStyle = '#f4f3ef'; ctx.fillRect(0, 0, w, w);
  ctx.fillStyle = '#232a2f';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
    const r0 = big ? 206 : 218, r1 = 236;
    ctx.save(); ctx.translate(m, m); ctx.rotate(a);
    ctx.fillRect(big ? -5 : -1.5, -r1, big ? 10 : 3, r1 - r0);
    ctx.restore();
  }
  ctx.font = `500 52px ${FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * Math.PI * 2;
    ctx.fillText(String(n), m + Math.sin(a) * 160, m - Math.cos(a) * 160 + 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
