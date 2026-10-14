// Every surface texture is painted here at runtime: nothing is downloaded.
import * as THREE from 'three';

let seed = 7;
export function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
export const rr = (a, b) => a + (b - a) * rand();

export const FONT = '"Alegreya Sans", sans-serif';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, { srgb = true, repeat = null, aniso = 4 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.anisotropy = aniso;
  return t;
}

// Grain: one small noise tile, laid over as a pattern (fast at any size).
let noiseTile = null;
export function noiseCanvas() {
  if (noiseTile) return noiseTile;
  const [c, g] = canvas(256, 256);
  const img = g.createImageData(256, 256);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = 128 + (rand() - 0.5) * 255;
    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  noiseTile = c;
  return c;
}
function noise(g, w, h, amount) {
  g.save();
  g.globalCompositeOperation = 'overlay';
  g.globalAlpha = Math.min(1, amount / 45);
  g.fillStyle = g.createPattern(noiseCanvas(), 'repeat');
  g.fillRect(0, 0, w, h);
  g.restore();
}

// Oak plank floor for the dining room.
export function plankFloor() {
  const [c, g] = canvas(1024, 1024);
  const rows = 8, rh = 1024 / rows; // eight planks across 1.4 m
  for (let r = 0; r < rows; r++) {
    let x = -rand() * 400;
    while (x < 1024) {
      const len = rr(300, 560);
      const base = rr(0.82, 1.08);
      const cr = 112 * base, cg = 76 * base, cb = 48 * base;
      g.fillStyle = `rgb(${cr},${cg},${cb})`;
      g.fillRect(x, r * rh, len, rh);
      for (let k = 0; k < 26; k++) {
        const y = r * rh + rand() * rh;
        g.strokeStyle = `rgba(${rand() < 0.5 ? '40,24,12' : '170,130,90'},${rr(0.04, 0.14)})`;
        g.lineWidth = rr(0.6, 2.4);
        g.beginPath();
        g.moveTo(x, y);
        for (let s = 0; s <= len; s += 40) g.lineTo(x + s, y + Math.sin(s * 0.01 + k) * rr(0.5, 3));
        g.stroke();
      }
      g.fillStyle = 'rgba(20,12,6,.85)';
      g.fillRect(x, r * rh, 2, rh);
      x += len;
    }
    g.fillStyle = 'rgba(20,12,6,.9)';
    g.fillRect(0, r * rh, 1024, 2);
  }
  noise(g, 1024, 1024, 14);
  return tex(c, { repeat: [3, 3] });
}

// Worn quarry tile for the kitchen floor.
export function quarryTile() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#4a3a33';
  g.fillRect(0, 0, 512, 512);
  const n = 4, s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const b = rr(0.85, 1.1);
    g.fillStyle = `rgb(${132 * b},${62 * b},${44 * b})`;
    g.fillRect(i * s + 4, j * s + 4, s - 8, s - 8);
    const gr = g.createRadialGradient(i * s + s / 2, j * s + s / 2, 4, i * s + s / 2, j * s + s / 2, s * 0.7);
    gr.addColorStop(0, 'rgba(255,220,200,0.07)');
    gr.addColorStop(1, 'rgba(0,0,0,0.12)');
    g.fillStyle = gr;
    g.fillRect(i * s + 4, j * s + 4, s - 8, s - 8);
  }
  noise(g, 512, 512, 22);
  return tex(c, { repeat: [7, 5] });
}

// White subway tile for kitchen walls.
export function subwayTile() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#8c8a84';
  g.fillRect(0, 0, 512, 512);
  const tw = 128, th = 64;
  for (let r = 0; r < 512 / th; r++) {
    const off = r % 2 ? tw / 2 : 0;
    for (let x = -tw; x < 512 + tw; x += tw) {
      const b = rr(0.93, 1.0);
      const gr = g.createLinearGradient(0, r * th, 0, r * th + th);
      gr.addColorStop(0, `rgb(${236 * b},${234 * b},${226 * b})`);
      gr.addColorStop(1, `rgb(${214 * b},${212 * b},${204 * b})`);
      g.fillStyle = gr;
      g.fillRect(x + off + 3, r * th + 3, tw - 6, th - 6);
    }
  }
  noise(g, 512, 512, 8);
  return tex(c, { repeat: [5, 4] });
}

// Dark limewash plaster for the dining room walls.
export function plaster() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#3d3a34';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    const x = rand() * 512, y = rand() * 512, r = rr(20, 90);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const l = rand() < 0.5;
    gr.addColorStop(0, l ? 'rgba(120,110,95,0.07)' : 'rgba(10,8,6,0.08)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  noise(g, 512, 512, 10);
  return tex(c, { repeat: [3, 1.5] });
}

// Walnut, for the bar, tables and wainscot.
export function walnut(dark = false) {
  const [c, g] = canvas(512, 512);
  g.fillStyle = dark ? '#3a2416' : '#5e3d24';
  g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 140; k++) {
    const y = rand() * 512;
    g.strokeStyle = `rgba(${rand() < 0.6 ? '20,10,4' : '150,100,60'},${rr(0.05, 0.18)})`;
    g.lineWidth = rr(0.5, 3);
    g.beginPath();
    g.moveTo(0, y);
    for (let s = 0; s <= 512; s += 16) g.lineTo(s, y + Math.sin(s * 0.012 + k * 0.7) * rr(1, 6));
    g.stroke();
  }
  noise(g, 512, 512, 10);
  return tex(c, { repeat: [1, 1] });
}

// Maple end-grain-ish cutting board.
export function maple() {
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#c9a97c';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) {
    g.fillStyle = `rgba(${rand() < 0.5 ? '120,80,40' : '240,220,190'},${rr(0.05, 0.14)})`;
    g.fillRect(0, i * 32, 256, 32);
  }
  for (let k = 0; k < 120; k++) {
    g.strokeStyle = `rgba(90,60,30,${rr(0.03, 0.1)})`;
    g.beginPath();
    const y = rand() * 256;
    g.moveTo(0, y); g.lineTo(256, y + rr(-3, 3));
    g.stroke();
  }
  for (let k = 0; k < 60; k++) {
    g.strokeStyle = `rgba(60,40,20,${rr(0.04, 0.12)})`;
    g.beginPath();
    const x = rand() * 256, y = rand() * 256, a = rand() * 3;
    g.moveTo(x, y); g.lineTo(x + Math.cos(a) * rr(10, 40), y + Math.sin(a) * rr(10, 40));
    g.stroke();
  }
  noise(g, 256, 256, 12);
  return tex(c);
}

// Brushed stainless: a colour map with long streaks; used as roughness too.
export function brushed() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#8f9396';
  g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 900; k++) {
    const y = rand() * 512;
    g.strokeStyle = `rgba(${rand() < 0.5 ? '255,255,255' : '0,0,0'},${rr(0.02, 0.07)})`;
    g.lineWidth = rr(0.5, 1.6);
    g.beginPath();
    const x = rand() * 512;
    g.moveTo(x - 200, y); g.lineTo(x + 200, y);
    g.stroke();
  }
  for (let k = 0; k < 40; k++) {
    const x = rand() * 512, y = rand() * 512, r = rr(10, 60);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(60,50,40,0.08)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  noise(g, 512, 512, 10);
  return tex(c, { repeat: [2, 2] });
}

// Raw steak portion: deep red with fat seams.
export function beef() {
  const [c, g] = canvas(128, 128);
  g.fillStyle = '#7e1d1c';
  g.fillRect(0, 0, 128, 128);
  for (let k = 0; k < 18; k++) {
    g.strokeStyle = `rgba(236,214,196,${rr(0.25, 0.6)})`;
    g.lineWidth = rr(0.6, 2.5);
    g.beginPath();
    let x = rand() * 128, y = rand() * 128;
    g.moveTo(x, y);
    for (let s = 0; s < 6; s++) { x += rr(-14, 14); y += rr(-14, 14); g.lineTo(x, y); }
    g.stroke();
  }
  const gr = g.createRadialGradient(64, 64, 10, 64, 64, 70);
  gr.addColorStop(0, 'rgba(255,90,80,0.12)');
  gr.addColorStop(1, 'rgba(40,0,0,0.25)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  noise(g, 128, 128, 18);
  return tex(c);
}

// A printed slip from a thermal printer: header, then dish lines with counts.
// Returns { texture, aspect } where aspect = length / width.
export function slip(title, lines, { width = 80, length = 110, big = false } = {}) {
  const W = 512, H = Math.round(W * length / width);
  const [c, g] = canvas(W, H);
  g.fillStyle = '#f3f1ea';
  g.fillRect(0, 0, W, H);
  // faint thermal grey wash
  const gr = g.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, 'rgba(0,0,0,0.05)');
  gr.addColorStop(0.5, 'rgba(0,0,0,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.06)');
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#1d1d1f';
  g.textBaseline = 'alphabetic';
  let y = 92;
  g.font = `700 64px ${FONT}`;
  g.fillText(title, 34, y);
  y += 28;
  g.fillRect(34, y, W - 68, 4);
  y += 18;
  for (const [name, n] of lines) {
    y += big ? 86 : 78;
    g.font = `500 ${big ? 60 : 52}px ${FONT}`;
    g.fillText(name, 34, y);
    g.font = `700 ${big ? 70 : 60}px ${FONT}`;
    const tw = g.measureText(String(n)).width;
    g.fillText(String(n), W - 34 - tw, y);
  }
  y += 40;
  // dashed rule and a run of tiny printer marks below, too small to read
  g.fillStyle = 'rgba(29,29,31,0.7)';
  for (let x = 34; x < W - 34; x += 18) g.fillRect(x, y, 10, 3);
  noise(g, W, H, 10);
  const t = tex(c, { aniso: 8 });
  return { texture: t, aspect: H / W };
}

// A ticket hanging on the rail: printed bars that read as text at a distance.
export function ticket(i) {
  const [c, g] = canvas(128, 192);
  g.fillStyle = '#efede6';
  g.fillRect(0, 0, 128, 192);
  g.fillStyle = 'rgba(30,30,32,0.75)';
  g.fillRect(12, 14, 60 + (i * 13) % 40, 9);
  let y = 40;
  const n = 3 + (i % 4);
  for (let k = 0; k < n; k++) {
    g.fillRect(12, y, 10, 6);
    g.fillRect(28, y, 30 + ((i * 7 + k * 23) % 60), 6);
    y += 18;
  }
  noise(g, 128, 192, 12);
  return tex(c);
}

// Wall clock face, tick marks only.
export function clockFace() {
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#e9e7e0';
  g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#222';
  for (let i = 0; i < 60; i++) {
    g.save();
    g.translate(128, 128);
    g.rotate(i / 60 * Math.PI * 2);
    if (i % 5 === 0) g.fillRect(-3.5, -112, 7, 22);
    else g.fillRect(-1, -112, 2, 8);
    g.restore();
  }
  noise(g, 256, 256, 8);
  return tex(c);
}

// Painted backing seen through the front windows: the street at night, or at dusk.
export function street(dusk) {
  const [c, g] = canvas(1024, 512);
  const sky = g.createLinearGradient(0, 0, 0, 512);
  if (dusk) {
    sky.addColorStop(0, '#2c3d58'); sky.addColorStop(0.6, '#5a6a80'); sky.addColorStop(1, '#8d8a86');
  } else {
    sky.addColorStop(0, '#05070b'); sky.addColorStop(1, '#141a22');
  }
  g.fillStyle = sky;
  g.fillRect(0, 0, 1024, 512);
  // building across the street
  g.fillStyle = dusk ? '#3a3b40' : '#0d0f12';
  g.fillRect(0, 60, 1024, 452);
  for (let fl = 0; fl < 3; fl++) for (let w = 0; w < 9; w++) {
    const lit = rand() < (dusk ? 0.45 : 0.3);
    const x = 40 + w * 112, y = 90 + fl * 110;
    g.fillStyle = lit ? (rand() < 0.5 ? '#d9b27a' : '#c9a86d') : (dusk ? '#262a31' : '#07080a');
    g.fillRect(x, y, 56, 74);
    if (lit) {
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(x + 26, y, 4, 74);
    }
  }
  // pavement and a kerb
  g.fillStyle = dusk ? '#55565a' : '#121417';
  g.fillRect(0, 430, 1024, 82);
  // street lamp pool
  const lp = g.createRadialGradient(700, 300, 10, 700, 300, 420);
  lp.addColorStop(0, dusk ? 'rgba(255,214,160,0.25)' : 'rgba(160,190,210,0.35)');
  lp.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = lp;
  g.fillRect(0, 0, 1024, 512);
  g.fillStyle = dusk ? '#2a2b2e' : '#080a0c';
  g.fillRect(694, 40, 10, 420);
  g.fillStyle = dusk ? '#ffe2b0' : '#cfe3ee';
  g.fillRect(670, 36, 60, 12);
  noise(g, 1024, 512, 16);
  return tex(c);
}

// Morning or evening sky seen through the kitchen's high window.
export function sky(morning) {
  const [c, g] = canvas(256, 256);
  const gr = g.createLinearGradient(0, 0, 0, 256);
  if (morning) { gr.addColorStop(0, '#cfd9df'); gr.addColorStop(1, '#f4e3c4'); }
  else { gr.addColorStop(0, '#0b1018'); gr.addColorStop(1, '#1d2633'); }
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  noise(g, 256, 256, 6);
  return tex(c);
}

// Soft radial glow for bulbs and heat lamps.
export function glow() {
  const [c, g] = canvas(128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.2, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return tex(c);
}

// Soft contact shadow, drawn under furniture and people.
export function blob() {
  const [c, g] = canvas(128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,0.75)');
  gr.addColorStop(0.5, 'rgba(0,0,0,0.35)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return tex(c, { srgb: false });
}

// Bottle glass for the back bar.
export function bottleLabel(i) {
  const [c, g] = canvas(64, 128);
  const hues = ['#5b3a14', '#1f3b26', '#6c5a2a', '#2b2622', '#6a2a1c', '#3e4a3a'];
  g.fillStyle = hues[i % hues.length];
  g.fillRect(0, 0, 64, 128);
  g.fillStyle = 'rgba(235,225,200,0.85)';
  g.fillRect(8, 64, 48, 34);
  g.fillStyle = 'rgba(40,30,20,0.6)';
  g.fillRect(14, 72, 36, 4);
  g.fillRect(18, 82, 28, 3);
  const gr = g.createLinearGradient(0, 0, 64, 0);
  gr.addColorStop(0, 'rgba(0,0,0,0.4)');
  gr.addColorStop(0.35, 'rgba(255,255,255,0.18)');
  gr.addColorStop(0.5, 'rgba(255,255,255,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.5)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 128);
  return tex(c);
}

// The register's screen at rest: dark, a grid of item buttons, no words.
export function posScreen() {
  const [c, g] = canvas(256, 192);
  g.fillStyle = '#10161c';
  g.fillRect(0, 0, 256, 192);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
    g.fillStyle = ['#2b3a48', '#33414c', '#3b3a33', '#2e3b36'][(r + k) % 4];
    g.fillRect(10 + k * 48, 26 + r * 40, 42, 34);
  }
  g.fillStyle = '#1c242c';
  g.fillRect(206, 26, 42, 154);
  g.fillStyle = '#4a7a5a';
  g.fillRect(210, 150, 34, 26);
  noise(g, 256, 192, 8);
  return tex(c);
}
