// People, photographed the way a long exposure sees them: what holds still
// stays sharp, what moves streaks. Each figure is painted into a canvas in
// parts (legs, body, head, two arms), and each part is laid down many times
// along its own motion: arms swing about the shoulder, a walker slides.
import * as THREE from 'three';
import { rand, rr } from './textures.js';

const W = 256, H = 512; // one figure cell: 0.9 m x 1.8 m

function cell(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function shade(g, x0, y0, x1, y1, base, dark = 0.55) {
  // light falls from above and a little to the left
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  gr.addColorStop(0, mix(base, '#ffffff', 0.08));
  gr.addColorStop(0.55, base);
  gr.addColorStop(1, mix(base, '#000000', dark));
  return gr;
}

function mix(a, b, t) {
  const pa = hex(a), pb = hex(b);
  const r = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${r[0]},${r[1]},${r[2]})`;
}
function hex(h) {
  if (h.startsWith('rgb')) return h.match(/\d+/g).slice(0, 3).map(Number);
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Cylindrical shading across whatever is already drawn: bodies are round.
function roundness(g, x0, x1) {
  g.save();
  g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, 'rgba(0,0,0,0.38)');
  gr.addColorStop(0.3, 'rgba(255,255,255,0.06)');
  gr.addColorStop(0.55, 'rgba(0,0,0,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = gr;
  g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  g.restore();
}

function capsule(g, x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}

// Draws a limb as a tapered stroke from (x0,y0) through (x1,y1) to (x2,y2).
function limb(g, pts, w0, w1, fill) {
  g.save();
  g.strokeStyle = fill;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (let i = 0; i < pts.length - 1; i++) {
    const t = i / (pts.length - 1);
    g.lineWidth = w0 + (w1 - w0) * t;
    g.beginPath();
    g.moveTo(pts[i][0], pts[i][1]);
    g.lineTo(pts[i + 1][0], pts[i + 1][1]);
    g.stroke();
  }
  g.restore();
}

// ---- outfits ------------------------------------------------------------
export const COOKS = [
  { jacket: '#ebe8e1', apron: '#2b2f36', trousers: '#2a2a2c', skin: '#c99a7a', hair: '#1c1612', cap: '#151515' },
  { jacket: '#e6e3dc', apron: '#3a3f47', trousers: '#232326', skin: '#8d5a3b', hair: '#0e0c0b', cap: null },
  { jacket: '#1d1e21', apron: '#5b5a57', trousers: '#1b1b1d', skin: '#e0b597', hair: '#6b4a2e', cap: null },
  { jacket: '#e9e6df', apron: '#ebe8e1', trousers: '#2d2c2e', skin: '#5e3a26', hair: '#0e0c0b', cap: '#2b2f36' },
];
export const GUESTS = [
  { top: '#4a2a26', bottom: '#222326', skin: '#c99a7a', hair: '#2b2018', coat: '#3a332d' },
  { top: '#2a3540', bottom: '#262522', skin: '#8d5a3b', hair: '#0e0c0b', coat: '#1f2226' },
  { top: '#b9ae9a', bottom: '#2f2b27', skin: '#d4a586', hair: '#5a3e26', coat: '#6b5a45' },
  { top: '#3a4334', bottom: '#1c1d20', skin: '#e3bc9c', hair: '#8a6a44', coat: '#2f2f33' },
  { top: '#1d1d20', bottom: '#28272a', skin: '#5e3a26', hair: '#0e0c0b', coat: '#4d4033' },
  { top: '#7a4a33', bottom: '#2a292c', skin: '#cf9f80', hair: '#2a1d14', coat: '#2a2d32' },
];

// ---- parts ----------------------------------------------------------------
function head(o, front, cx, top, hat, guest = false) {
  const c = cell(), g = c.getContext('2d');
  // neck
  g.fillStyle = shade(g, cx - 10, 0, cx + 10, 0, o.skin, 0.4);
  g.fillRect(cx - 10, top + 50, 20, 22);
  // skull
  g.fillStyle = shade(g, cx - 24, top, cx + 24, top + 60, o.skin, 0.45);
  g.beginPath();
  g.ellipse(cx, top + 30, 22, 29, 0, 0, Math.PI * 2);
  g.fill();
  // hair
  g.fillStyle = o.hair;
  g.beginPath();
  if (front) {
    g.ellipse(cx, top + 18, 23, 19, 0, Math.PI, Math.PI * 2);
    g.fill();
    // no features at all: a soft head, lit from above, falling into shadow
    const sh = g.createLinearGradient(0, top + 14, 0, top + 62);
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(0,0,0,0.35)');
    g.save();
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = sh;
    g.fillRect(cx - 30, top, 60, 80);
    g.restore();
  } else {
    g.ellipse(cx, top + 26, 23, 27, 0, 0, Math.PI * 2);
    g.fill();
  }
  if (guest) {
    // hair to the side of the face, and the face itself in shadow
    g.fillStyle = o.hair;
    g.beginPath(); g.ellipse(cx - 20, top + 30, 7, 20, 0.1, 0, 7); g.fill();
    g.beginPath(); g.ellipse(cx + 20, top + 30, 7, 20, -0.1, 0, 7); g.fill();
    g.save();
    g.globalCompositeOperation = 'source-atop';
    const sh = g.createLinearGradient(0, top + 10, 0, top + 70);
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = sh;
    g.fillRect(cx - 30, top, 60, 80);
    g.restore();
  }
  if (hat) {
    g.fillStyle = shade(g, cx - 24, top - 4, cx + 24, top + 16, hat, 0.4);
    g.beginPath();
    g.ellipse(cx, top + 10, 24, 15, 0, Math.PI, Math.PI * 2);
    g.fill();
    g.fillRect(cx - 24, top + 9, 48, 7);
  }
  return c;
}

function cookBody(o, front, cx) {
  const c = cell(), g = c.getContext('2d');
  // legs
  g.fillStyle = shade(g, cx - 40, 0, cx + 40, 0, o.trousers, 0.5);
  const leg = (x0, x1, lean) => {
    g.beginPath();
    g.moveTo(x0, 280); g.lineTo(x0 + 36, 280);
    g.lineTo(x0 + 30 + lean, 486); g.lineTo(x0 + 8 + lean, 486);
    g.closePath(); g.fill();
  };
  leg(cx - 40, 0, -6); leg(cx + 3, 0, 4);
  g.fillStyle = '#121212';
  capsule(g, cx - 44, 480, 38, 18, 8);
  capsule(g, cx + 6, 482, 38, 16, 8);
  // jacket
  g.fillStyle = shade(g, cx - 52, 120, cx + 52, 300, o.jacket, 0.42);
  g.beginPath();
  g.moveTo(cx - 54, 142);
  g.quadraticCurveTo(cx - 50, 122, cx - 20, 118);
  g.lineTo(cx + 20, 118);
  g.quadraticCurveTo(cx + 50, 122, cx + 54, 142);
  g.lineTo(cx + 46, 300);
  g.lineTo(cx - 46, 300);
  g.closePath();
  g.fill();
  if (front) {
    g.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 0; i < 4; i++) {
      g.beginPath(); g.arc(cx + 14, 150 + i * 26, 2.6, 0, 7); g.fill();
      g.beginPath(); g.arc(cx - 14, 150 + i * 26, 2.6, 0, 7); g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(cx - 1, 130, 2, 160);
  }
  // apron, from the waist to the knee
  g.fillStyle = shade(g, cx - 50, 240, cx + 50, 400, o.apron, 0.45);
  g.beginPath();
  g.moveTo(cx - 47, 236);
  g.lineTo(cx + 47, 236);
  g.quadraticCurveTo(cx + 54, 330, cx + 56, 396);
  g.quadraticCurveTo(cx, 402, cx - 56, 396);
  g.quadraticCurveTo(cx - 54, 330, cx - 47, 236);
  g.closePath();
  g.fill();
  g.save();
  g.globalCompositeOperation = 'source-atop';
  for (const [fx, a] of [[-28, 0.16], [-6, 0.1], [18, 0.18], [36, 0.12]]) {
    const fg = g.createLinearGradient(cx + fx - 8, 0, cx + fx + 8, 0);
    fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(0.5, `rgba(0,0,0,${a})`); fg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fg;
    g.fillRect(cx + fx - 8, 270, 16, 132);
  }
  g.restore();
  g.fillStyle = 'rgba(0,0,0,0.2)';
  g.fillRect(cx - 47, 236, 94, 6);
  if (!front) {
    // apron strings tied at the back
    g.strokeStyle = o.apron;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx - 8, 240); g.lineTo(cx - 14, 262);
    g.moveTo(cx + 8, 240); g.lineTo(cx + 15, 260);
    g.stroke();
  }
  roundness(g, cx - 52, cx + 52);
  return c;
}

function cookArm(o, side, pose, cx) {
  // side: -1 left, +1 right (as seen). pose: 'down' | 'fold' | 'work' | 'swing'
  const c = cell(), g = c.getContext('2d');
  const sx = cx + side * 48, sy = 140;
  let pts, hand;
  if (pose === 'fold') {
    pts = [[sx, sy], [sx + side * 4, sy + 70], [cx - side * 30, sy + 56]];
    hand = null; // tucked under the other arm
  } else if (pose === 'work') {
    pts = [[sx, sy], [sx + side * 12, sy + 60], [sx + side * 2, sy + 70]];
    hand = null; // hands are in front of the body, hidden from behind
  } else if (pose === 'swing') {
    pts = [[sx, sy], [sx + side * 4, sy + 70], [sx + side * 10, sy + 132]];
    hand = null;
  } else {
    pts = [[sx, sy], [sx + side * 5, sy + 74], [sx + side * 6, sy + 142]];
    hand = pts[2];
  }
  limb(g, pts, 28, 19, o.jacket);
  roundness(g, sx - 30, sx + 30);
  // a shadow down the inside of the sleeve
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(0,0,0,0.18)';
  g.fillRect(side < 0 ? sx + 2 : sx - 14, sy, 12, 160);
  g.globalCompositeOperation = 'source-over';
  if (hand) {
    g.fillStyle = shade(g, hand[0] - 9, hand[1], hand[0] + 9, hand[1] + 16, o.skin, 0.4);
    g.beginPath();
    g.ellipse(hand[0], hand[1] + 6, 9, 11, 0, 0, Math.PI * 2);
    g.fill();
  }
  return { canvas: c, pivot: [sx, sy] };
}

function guestBody(o, seated, cx, coat) {
  const c = cell(), g = c.getContext('2d');
  const top = seated ? 212 : 118;
  const hip = seated ? 380 : 285;
  if (!seated) {
    g.fillStyle = shade(g, cx - 40, 0, cx + 40, 0, o.bottom, 0.5);
    capsule(g, cx - 36, hip - 6, 32, 210, 13);
    capsule(g, cx + 4, hip - 6, 32, 210, 13);
    g.fillStyle = '#141312';
    capsule(g, cx - 40, 484, 38, 16, 7);
    capsule(g, cx + 2, 484, 38, 16, 7);
  }
  const col = coat ? o.coat : o.top;
  g.fillStyle = shade(g, cx - 50, top, cx + 50, hip + (coat ? 70 : 0), col, 0.5);
  g.beginPath();
  g.moveTo(cx - 44, top + 10);
  g.quadraticCurveTo(cx, top - 6, cx + 44, top + 10);
  g.lineTo(cx + (coat ? 48 : 40), hip + (coat ? 80 : 0));
  g.lineTo(cx - (coat ? 48 : 40), hip + (coat ? 80 : 0));
  g.closePath();
  g.fill();
  roundness(g, cx - 50, cx + 50);
  return c;
}

function guestArm(o, side, pose, cx, seated, coat) {
  const c = cell(), g = c.getContext('2d');
  const top = seated ? 212 : 118;
  const sx = cx + side * 42, sy = top + 18;
  let pts;
  if (pose === 'table') pts = [[sx, sy], [sx + side * 4, sy + 66], [cx + side * 14, sy + 96]];
  else if (pose === 'swing') pts = [[sx, sy], [sx + side * 4, sy + 68], [sx + side * 12, sy + 128]];
  else pts = [[sx, sy], [sx + side * 4, sy + 72], [sx + side * 5, sy + 138]];
  limb(g, pts, 26, 20, coat ? o.coat : o.top);
  roundness(g, sx - 30, sx + 30);
  const h = pts[2];
  if (pose === 'swing') return { canvas: c, pivot: [sx, sy] };
  g.fillStyle = shade(g, h[0] - 8, h[1], h[0] + 8, h[1] + 14, o.skin, 0.4);
  g.beginPath();
  g.ellipse(h[0], h[1] + 5, 8, 10, 0, 0, Math.PI * 2);
  g.fill();
  return { canvas: c, pivot: [sx, sy] };
}

// ---- exposure ---------------------------------------------------------------
// Lays a part down n times along its motion. motion(s) for s in [-.5,.5]
// returns {dx, dy, rot} applied about pivot. Denser at the ends of the swing,
// as a real exposure is, because people pause where a motion turns.
function expose(out, part, n, peak, motion, pivot = [0, 0], ox = 0, soft = 0, weight = null) {
  // lay the copies down sharp on a scratch canvas, then soften once
  const tmp = scratch(out.width, out.height);
  const g = tmp.getContext('2d');
  g.clearRect(0, 0, tmp.width, tmp.height);
  if (n <= 1) {
    g.drawImage(part, ox, 0);
  } else {
    const base = 1 - Math.pow(1 - peak, 1 / n);
    for (let k = 0; k < n; k++) {
      const s = k / (n - 1) - 0.5;
      const w = weight ? weight(s) : 0.55 + 1.6 * Math.pow(Math.abs(s * 2), 3);
      const m = motion(s);
      g.save();
      g.globalAlpha = Math.min(1, base * w);
      g.translate(ox + pivot[0] + m.dx, pivot[1] + m.dy);
      g.rotate(m.rot || 0);
      g.translate(-pivot[0], -pivot[1]);
      g.drawImage(part, 0, 0);
      g.restore();
    }
  }
  const o = out.getContext('2d');
  o.save();
  if (soft) o.filter = `blur(${soft}px)`;
  o.drawImage(tmp, 0, 0);
  o.restore();
}

const scratches = new Map();
function scratch(w, h) {
  const k = w + 'x' + h;
  if (!scratches.has(k)) scratches.set(k, cell(w, h));
  return scratches.get(k);
}

// A walker's exposure: a faint trail, then the person where they are now.
const LEAD = s => 0.18 + 5.5 * Math.pow(s + 0.5, 8);

// A cook. state: 'idle' (sharp, front, arms folded or down), 'work' (back, arms
// and shoulders streaked), 'walk' (the whole figure streaked sideways).
export const cellSize = (wide) => [wide ? W * 2 : W, H];

export function paintCook(o, state, variant = 0) {
  const front = false; // nobody faces the camera
  const wide = state === 'walk';
  const out = cell(wide ? W * 2 : W, H);
  const cx = W / 2;
  const ox = wide ? W / 2 : 0;
  const hd = head(o, front, cx, 58, o.cap);
  const body = cookBody(o, front, cx);
  if (state === 'idle') {
    const pose = variant % 2 ? 'work' : 'down';
    const a1 = cookArm(o, -1, pose, cx), a2 = cookArm(o, 1, pose, cx);
    // the slightest sway: a person standing still is nearly sharp
    const sway = s => ({ dx: s * 4, dy: 0, rot: 0 });
    expose(out, body, 5, 0.99, sway, [0, 0], ox, 1.1, () => 1);
    expose(out, a1.canvas, 5, 0.99, sway, a1.pivot, ox, 1.1, () => 1);
    expose(out, a2.canvas, 5, 0.99, sway, a2.pivot, ox, 1.1, () => 1);
    expose(out, hd, 6, 0.99, s => ({ dx: s * 6, dy: 0, rot: s * 0.04 }), [W / 2, 120], ox, 1.2, () => 1);
  } else if (state === 'work') {
    const a1 = cookArm(o, -1, 'work', cx), a2 = cookArm(o, 1, 'work', cx);
    const dir = variant % 2 ? 1 : -1;
    // legs planted: sharp. Body turns between stove and board: streaked.
    const legs = cell(), lg = legs.getContext('2d');
    lg.drawImage(body, 0, 394, W, H - 394, 0, 394, W, H - 394);
    const torso = cell(), tg = torso.getContext('2d');
    tg.drawImage(body, 0, 0, W, 394, 0, 0, W, 394);
    expose(out, legs, 3, 0.98, s => ({ dx: s * 4, dy: 0, rot: 0 }), [0, 0], ox, 1.2);
    expose(out, torso, 14, 0.9, s => ({ dx: s * 26 * dir, dy: Math.abs(s) * 4, rot: s * 0.06 * dir }), [cx, 330], ox, 0.8);
    expose(out, a1.canvas, 18, 0.82, s => ({ dx: s * 30 * dir, dy: 0, rot: s * 0.9 }), a1.pivot, ox, 1);
    expose(out, a2.canvas, 18, 0.82, s => ({ dx: s * 30 * dir, dy: 0, rot: -s * 1.0 }), a2.pivot, ox, 1);
    expose(out, hd, 14, 0.9, s => ({ dx: s * 30 * dir, dy: Math.abs(s) * 5, rot: 0 }), [0, 0], ox, 1.2, () => 1);
  } else {
    const a1 = cookArm(o, -1, 'swing', cx), a2 = cookArm(o, 1, 'swing', cx);
    const run = s => ({ dx: s * 150, dy: 0, rot: 0 });
    expose(out, body, 14, 0.86, run, [0, 0], ox, 0.9, LEAD);
    expose(out, a1.canvas, 14, 0.8, s => ({ dx: s * 150, dy: 0, rot: Math.sin(s * 9) * 0.35 }), a1.pivot, ox, 0.9, LEAD);
    expose(out, a2.canvas, 14, 0.8, s => ({ dx: s * 150, dy: 0, rot: -Math.sin(s * 9) * 0.35 }), a2.pivot, ox, 0.9, LEAD);
    expose(out, hd, 14, 0.9, run, [0, 0], ox, 0.9, LEAD);
  }
  return finish(out);
}

// A guest. state: 'walk' (streaked through the door), 'seated' (nearly still,
// a hand or head moving as they talk).
export function paintGuest(o, state, variant = 0) {
  const seated = state === 'seated';
  const wide = state === 'walk';
  const out = cell(wide ? W * 2 : W, H);
  const cx = W / 2, ox = wide ? W / 2 : 0;
  const hd = head(o, variant % 2 === 1, cx, seated ? 150 : 56, null, true);
  if (seated) {
    const body = guestBody(o, true, cx, false);
    const a1 = guestArm(o, -1, 'table', cx, true), a2 = guestArm(o, 1, variant % 2 ? 'table' : 'down', cx, true);
    const lean = variant % 2 ? 1 : -1;
    expose(out, body, 10, 0.95, s => ({ dx: s * 16 * lean, dy: 0, rot: s * 0.07 * lean }), [cx, 380], ox, 1.8);
    expose(out, a1.canvas, 8, 0.92, s => ({ dx: s * 10 * lean, dy: 0, rot: s * 0.12 }), a1.pivot, ox, 1.4);
    // one hand talking
    expose(out, a2.canvas, 14, 0.82, s => ({ dx: s * 8, dy: 0, rot: s * 0.8 }), a2.pivot, ox, 1.4);
    expose(out, hd, 16, 0.9, s => ({ dx: s * 30 * lean, dy: Math.abs(s) * 6, rot: s * 0.25 }), [cx, 210], ox, 2.2, () => 1);
  } else {
    const body = guestBody(o, false, cx, true);
    const a1 = guestArm(o, -1, 'swing', cx, false, true), a2 = guestArm(o, 1, 'swing', cx, false, true);
    const run = s => ({ dx: s * 150, dy: 0, rot: 0 });
    expose(out, body, 14, 0.86, run, [0, 0], ox, 0.9, LEAD);
    expose(out, a1.canvas, 14, 0.8, s => ({ dx: s * 150, dy: 0, rot: Math.sin(s * 9) * 0.3 }), a1.pivot, ox, 0.9, LEAD);
    expose(out, a2.canvas, 14, 0.8, s => ({ dx: s * 150, dy: 0, rot: -Math.sin(s * 9) * 0.3 }), a2.pivot, ox, 0.9, LEAD);
    expose(out, hd, 14, 0.9, run, [0, 0], ox, 0.9, LEAD);
  }
  return finish(out);
}

// Light from pendants above: the head and shoulders catch it, legs fall off.
// Then film grain over the figure only.
function finish(c) {
  const g = c.getContext('2d');
  const w = c.width, h = c.height;
  // rim light: the upper-left edge of the silhouette catches the lamp
  const rim = cell(w, h), rg = rim.getContext('2d');
  rg.drawImage(c, 0, 0);
  rg.globalCompositeOperation = 'destination-out';
  rg.drawImage(c, 5, 4);
  rg.globalCompositeOperation = 'source-in';
  rg.fillStyle = 'rgb(255,226,186)';
  rg.fillRect(0, 0, w, h);
  // the room is dim: bodies sit darker than their clothes, lit from above
  g.save();
  g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(0, 40, 0, h);
  gr.addColorStop(0, 'rgba(255,236,210,0.12)');
  gr.addColorStop(0.3, 'rgba(0,0,0,0.12)');
  gr.addColorStop(0.7, 'rgba(0,0,0,0.42)');
  gr.addColorStop(1, 'rgba(0,0,0,0.62)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.restore();
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = 0.4;
  g.filter = 'blur(1.5px)';
  g.drawImage(rim, 0, 0);
  g.restore();
  // soften the whole figure a touch, as a lens at night would
  const soft = cell(w, h), sg = soft.getContext('2d');
  sg.filter = 'blur(0.9px)';
  sg.drawImage(c, 0, 0);
  g.clearRect(0, 0, w, h);
  g.drawImage(soft, 0, 0);
  return c;
}

// ---- in the scene -------------------------------------------------------------
const blobTex = (() => {
  let t = null;
  return () => {
    if (t) return t;
    const c = cell(64, 64), g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,0.7)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();

// one texture per canvas, however many people share it
const texCache = new WeakMap();
export function texFor(c) {
  let t = texCache.get(c);
  if (!t) {
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    texCache.set(c, t);
  }
  return t;
}
const toTex = texFor;

export class Person {
  // frames: array of canvases; the figure flickers between them to read as work.
  constructor(frames, { height = 1.8, wide = false } = {}) {
    this.frames = frames.map(toTex);
    const w = (wide ? 1.8 : 0.9) * height / 1.8;
    const geo = new THREE.PlaneGeometry(w, height);
    geo.translate(0, height / 2, 0);
    this.mat = new THREE.MeshBasicMaterial({ map: this.frames[0], transparent: true, depthWrite: false, opacity: 0 });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.renderOrder = 2;
    // a depth-only twin, so the lens focuses on the person, not the wall behind
    this.depthMat = new THREE.MeshBasicMaterial({ map: this.frames[0], alphaTest: 0.55, colorWrite: false });
    this.mesh.add(new THREE.Mesh(geo, this.depthMat));
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(wide ? 1.4 : 0.7, 0.45),
      new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0 })
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.renderOrder = 1;
    this.group = new THREE.Group();
    this.group.add(this.mesh, this.shadow);
    this.shadow.position.y = 0.006;
    this.opacity = 0;
    this.frameRate = 3 + rand() * 2;
    this.phase = rand() * 10;
    this.floor = true;
  }
  set(x, y, z) { this.group.position.set(x, y, z); return this; }
  // o: 0..1
  show(o) {
    this.opacity = o;
    this.mat.opacity = o;
    this.mat.visible = o > 0.002;
    this.depthMat.visible = o > 0.5;
    this.shadow.material.opacity = this.floor ? o * 0.8 : 0;
    this.shadow.visible = this.mat.visible && this.floor;
  }
  tick(time, camera, tint) {
    if (!this.mat.visible) return;
    const n = this.frames.length;
    if (n > 1) this.mat.map = this.depthMat.map = this.frames[Math.floor(time * this.frameRate + this.phase) % n];
    // cylindrical billboard: stand upright, face the camera
    const p = this.group.position;
    this.mesh.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
    this.mat.color.copy(tint);
  }
}
