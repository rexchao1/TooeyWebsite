// Shared 3D kit: canvas-made textures, materials and object builders.
// Units are centimetres, y is up. Everything is procedural; no image files.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, { srgb = true, repeat = null } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

// Soft blotches, used for food surfaces.
function blobs(ctx, r, n, w, h, colors, rmin, rmax, alpha = 1) {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, rad = rmin + r() * (rmax - rmin);
    const col = colors[Math.floor(r() * colors.length)];
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col);
    g.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad * (0.6 + r() * 0.6), r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

const cache = {};
function once(key, fn) { return cache[key] || (cache[key] = fn()); }

// ---------- Textures ----------

export function brushedMap() {
  return once('brushed', () => {
    const [c, x] = canvas(1024, 1024);
    const r = rng(7);
    x.fillStyle = '#8a8a8a'; x.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 9000; i++) {
      const v = Math.floor(100 + r() * 70);
      x.strokeStyle = `rgba(${v},${v},${v},${0.05 + r() * 0.18})`;
      x.lineWidth = 0.5 + r() * 1.4;
      const y = r() * 1024, x0 = r() * 1024, len = 60 + r() * 600;
      x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + len, y + (r() - 0.5) * 1.5); x.stroke();
    }
    // a few wipe marks and faint scuffs, so the steel looks used
    for (let i = 0; i < 40; i++) {
      const v = Math.floor(120 + r() * 60);
      x.strokeStyle = `rgba(${v},${v},${v},0.06)`;
      x.lineWidth = 20 + r() * 50;
      x.beginPath();
      const cx = r() * 1024, cy = r() * 1024;
      x.arc(cx, cy, 80 + r() * 200, r() * 6, r() * 6 + 1.2);
      x.stroke();
    }
    const t = tex(c, { srgb: false, repeat: [1, 1] });
    return t;
  });
}

// Flour-dusted surface for dough balls and the dough box floor.
export function flourMap() {
  return once('flour', () => {
    const [c, x] = canvas(512, 512);
    const r = rng(14);
    x.fillStyle = '#efe6d4'; x.fillRect(0, 0, 512, 512);
    blobs(x, r, 260, 512, 512, ['rgba(248,244,234,1)', 'rgba(226,212,186,1)', 'rgba(236,224,200,1)'], 8, 40, 0.5);
    blobs(x, r, 1600, 512, 512, ['rgba(255,255,252,1)'], 0.6, 2.2, 0.7);
    return tex(c);
  });
}

// Par-cooked risotto seen through a deli lid: creamy rice, a few herb flecks.
export function risottoMap() {
  return once('risotto', () => {
    const [c, x] = canvas(256, 256);
    const r = rng(15);
    x.fillStyle = '#e2ad3c'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const v = 200 + Math.floor(r() * 50);
      x.fillStyle = `rgba(${v + 10},${v - 50},${v - 170},0.75)`;
      x.beginPath(); x.ellipse(r() * 256, r() * 256, 2.6, 1.3, r() * 3, 0, Math.PI * 2); x.fill();
    }
    blobs(x, r, 30, 256, 256, ['rgba(200,130,30,1)', 'rgba(240,200,110,1)'], 6, 18, 0.35);
    for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(70,96,46,0.8)'; x.fillRect(r() * 256, r() * 256, 2, 1.5); }
    return tex(c);
  });
}

export function ticketMap(seed, big86 = false) {
  const [c, x] = canvas(192, 320);
  const r = rng(seed);
  x.fillStyle = '#f3f1ea'; x.fillRect(0, 0, 192, 320);
  const g = x.createLinearGradient(0, 0, 192, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.05)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.06)');
  x.fillStyle = g; x.fillRect(0, 0, 192, 320);
  x.fillStyle = 'rgba(40,40,44,0.85)';
  // header bar and lines of thermal print (not words: illegible at this size)
  x.fillRect(24, 34, 90 + r() * 40, 9);
  x.fillRect(24, 52, 50, 6);
  let y = 84;
  const n = 2 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    x.fillRect(24, y, 12, 9);
    x.fillRect(46, y, 50 + r() * 80, 9);
    if (r() < 0.4) { x.fillRect(56, y + 16, 40 + r() * 40, 6); y += 14; }
    y += 30;
  }
  x.fillRect(24, 286, 140, 2);
  return tex(c);
}

// flan custard top in the ramekin: pale gold with a set skin and a few bubbles
export function custardMap() {
  return once('custard', () => {
    const [c, x] = canvas(256, 256);
    const r = rng(19);
    x.fillStyle = '#463226'; x.fillRect(0, 0, 256, 256);
    blobs(x, r, 160, 256, 256, ['rgba(92,70,54,1)', 'rgba(60,42,32,1)', 'rgba(80,60,46,1)'], 6, 26, 0.5);
    blobs(x, r, 1400, 256, 256, ['rgba(130,92,64,1)', 'rgba(52,32,20,1)'], 0.6, 2, 0.6);
    const g = x.createRadialGradient(128, 128, 96, 128, 128, 128);
    g.addColorStop(0, 'rgba(230,214,190,0)'); g.addColorStop(1, 'rgba(232,218,196,0.5)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    return tex(c);
  });
}

// ---------- Materials ----------

export function mats() {
  return once('mats', () => {
    const brushed = brushedMap();
    const steel = new THREE.MeshPhysicalMaterial({
      color: 0xc8c8c4, metalness: 1, roughness: 0.62, roughnessMap: brushed,
      bumpMap: brushed, bumpScale: 0.25, anisotropy: 0.6, anisotropyRotation: 0,
    });
    const counter = steel.clone();
    counter.roughnessMap = brushed.clone(); counter.roughnessMap.repeat.set(2, 1); counter.roughnessMap.needsUpdate = true;
    counter.bumpMap = counter.roughnessMap;
    counter.color.set(0xbdbcb8);
    const panSteel = new THREE.MeshPhysicalMaterial({ color: 0xdcdcd8, metalness: 0.88, roughness: 0.36, roughnessMap: brushed, bumpMap: brushed, bumpScale: 0.1 });
    const alu = new THREE.MeshPhysicalMaterial({ color: 0xc9c7c2, metalness: 0.9, roughness: 0.5 });
    const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf2f1ec, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });
    const caramel = new THREE.MeshPhysicalMaterial({ map: custardMap(), roughness: 0.92, bumpMap: custardMap(), bumpScale: 0.5 });
    const binPlastic = new THREE.MeshStandardMaterial({ color: 0x7a7d7b, roughness: 0.66 });
    const liner = new THREE.MeshPhysicalMaterial({ color: 0x0f0f10, roughness: 0.35, clearcoat: 0.5, side: THREE.DoubleSide });
    const paper = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
    const wall = new THREE.MeshPhysicalMaterial({ color: 0xa9a9a5, metalness: 1, roughness: 0.55, roughnessMap: brushed, bumpMap: brushed, bumpScale: 0.2 });
    return { steel, counter, panSteel, alu, porcelain, caramel, binPlastic, liner, paper, wall };
  });
}

// ---------- Geometry helpers ----------

function rrect(w, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function rrectPath(w, d, r) {
  const s = rrect(w, d, r);
  const p = new THREE.Path();
  p.curves = s.curves; p.currentPoint = s.currentPoint;
  return p;
}
function ring(w, d, r, t) {
  const s = rrect(w + t, d + t, r + t / 2);
  s.holes.push(rrectPath(w, d, r));
  return s;
}

// Hotel pan: thin walls, a floor and a rolled flange. Origin at the floor centre.
export function makePan(w, d, h, mat, { flange = 1.6 } = {}) {
  const g = new THREE.Group();
  const r = 2.4;
  const walls = new THREE.ExtrudeGeometry(ring(w, d, r, 0.25), { depth: h, bevelEnabled: false, curveSegments: 6 });
  walls.rotateX(-Math.PI / 2);
  const floor = new THREE.ShapeGeometry(rrect(w, d, r), 6); floor.rotateX(-Math.PI / 2); floor.translate(0, 0.05, 0);
  const lip = new THREE.ExtrudeGeometry(ring(w + 0.2, d + 0.2, r, flange), { depth: 0.18, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.18, bevelSegments: 2, curveSegments: 6 });
  lip.rotateX(-Math.PI / 2); lip.translate(0, h - 0.1, 0);
  for (const geo of [walls, floor, lip]) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

export function counterTop(w, d) {
  const m = mats();
  const g = new THREE.Group();
  const top = new THREE.Mesh(new RoundedBoxGeometry(w, 5, d, 3, 1.6), m.counter);
  top.position.y = -2.5; top.receiveShadow = true;
  g.add(top);
  // lowboy fridge under the counter: steel doors, gasket seams, bar handles
  const box = new THREE.Mesh(new THREE.BoxGeometry(w - 4, 82, d - 6), m.wall);
  box.position.set(0, -46, -2); box.receiveShadow = true;
  g.add(box);
  const seamMat = new THREE.MeshStandardMaterial({ color: 0x151413, roughness: 0.9 });
  for (const sx of [-w / 4, w / 4]) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 70, 0.4), seamMat);
    seam.position.set(sx + (sx < 0 ? w / 4 : -w / 4), -48, d / 2 - 2.8);
    g.add(seam);
    const handle = new THREE.Mesh(new RoundedBoxGeometry(w / 2 - 30, 2.2, 2.6, 2, 0.8), m.alu);
    handle.position.set(sx, -14, d / 2 - 0.6); handle.castShadow = true;
    g.add(handle);
  }
  // backsplash
  const back = new THREE.Mesh(new RoundedBoxGeometry(w, 34, 1.4, 2, 0.5), m.wall);
  back.position.set(0, 17, -d / 2 + 0.7); back.receiveShadow = true;
  g.add(back);
  return g;
}

// Aluminium ticket rail on the backsplash.
export function ticketRail(w) {
  const m = mats();
  const g = new THREE.Group();
  const bar = new THREE.Mesh(new RoundedBoxGeometry(w, 2.6, 2.2, 2, 0.4), m.alu);
  bar.castShadow = true; bar.receiveShadow = true;
  g.add(bar);
  const lipG = new THREE.Mesh(new RoundedBoxGeometry(w, 0.6, 0.8, 1, 0.2), m.alu);
  lipG.position.set(0, -1.5, 1.2);
  g.add(lipG);
  return g;
}

export function ticket(seed) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 11.5), new THREE.MeshStandardMaterial({ map: ticketMap(seed), roughness: 0.9, side: THREE.DoubleSide }));
  m.castShadow = true;
  m.geometry.translate(0, -5.75, 0);
  return m;
}

// Round bin with a black liner folded over the rim. Origin at the rim centre.
export function bin() {
  const m = mats();
  const g = new THREE.Group();
  const R = 16;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R - 2, 76, 40, 1, true), m.binPlastic);
  body.position.y = -38; body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.8, R - 3, 58, 40, 1, true), m.liner);
  inner.position.y = -29.5; inner.receiveShadow = true;
  g.add(inner);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R - 3, 32), m.liner);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -40;
  g.add(floor);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R + 0.3, 1.1, 10, 48), m.liner);
  rim.rotation.x = Math.PI / 2; rim.castShadow = true;
  g.add(rim);
  // liner overhang: a slightly wavy skirt
  const skirt = new THREE.CylinderGeometry(R + 1.2, R + 1.4, 7, 48, 2, true);
  const pos = skirt.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const a = Math.atan2(pos.getZ(i), pos.getX(i));
    const k = 1 + Math.sin(a * 7) * 0.025 + Math.sin(a * 13 + 1) * 0.015;
    pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k);
  }
  skirt.computeVertexNormals();
  const sk = new THREE.Mesh(skirt, m.liner);
  sk.position.y = -3.6;
  g.add(sk);
  return g;
}

// ---------- Food ----------

// Pizza dough balls proofing in a box: soft, floured, slightly irregular.
let ballGeos = null;
function ballGeometries() {
  if (ballGeos) return ballGeos;
  ballGeos = [];
  for (let v = 0; v < 5; v++) {
    const r = rng(600 + v);
    const geo = new THREE.SphereGeometry(3.3, 40, 24);
    const pos = geo.attributes.position;
    const ph = [r() * 6, r() * 6, r() * 6];
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const n = 1 + Math.sin(x * 0.8 + ph[0]) * Math.sin(z * 0.9 + ph[1]) * 0.05 + Math.sin(y * 1.3 + ph[2]) * 0.02;
      // slumped: flat bottom, wide middle, low dome
      const sy = y < 0 ? y * 0.3 : y * 0.82;
      const spread = 1 + (1 - Math.abs(y) / 3.3) * 0.12;
      pos.setXYZ(i, x * n * spread, sy * n, z * n * spread);
    }
    geo.computeVertexNormals();
    geo.translate(0, 0.99, 0);
    geo.userData.shared = true;
    ballGeos.push(geo);
  }
  return ballGeos;
}

export function doughBalls(cols, rows, n, pitch = 7.6) {
  const dough = once('dough', () => new THREE.MeshPhysicalMaterial({
    color: 0xf3e7cf, map: flourMap(), roughness: 0.78, sheen: 0.6, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xfff6e6),
  }));
  const geos = ballGeometries();
  const r = rng(61);
  const out = [];
  let k = 0;
  for (let ci = 0; ci < cols; ci++) {
    for (let ri = 0; ri < rows; ri++) {
      if (k >= n) break;
      const m = new THREE.Mesh(geos[k % geos.length], dough);
      m.castShadow = true; m.receiveShadow = true;
      m.position.set((ci - (cols - 1) / 2) * pitch + (r() - 0.5) * 0.7, 0.15, (ri - (rows - 1) / 2) * pitch + (r() - 0.5) * 0.7);
      m.rotation.y = r() * 6.28;
      const sc = 0.96 + r() * 0.08; m.scale.set(sc, sc, sc);
      m.userData.col = ci; m.userData.row = ri;
      out.push(m);
      k++;
    }
  }
  return out;
}

// White polypropylene dough box (no lid), floured floor. Origin at the floor centre.
export function doughBox(w, d) {
  const g = new THREE.Group();
  const plastic = once('pp', () => new THREE.MeshPhysicalMaterial({ color: 0xe9e7e0, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.4 }));
  const floorMat = once('ppFloor', () => new THREE.MeshStandardMaterial({ color: 0xe6e1d4, map: flourMap(), roughness: 0.9 }));
  const h = 7.5, r = 3;
  const walls = new THREE.ExtrudeGeometry(ring(w, d, r, 0.5), { depth: h, bevelEnabled: false, curveSegments: 6 });
  walls.rotateX(-Math.PI / 2);
  const lip = new THREE.ExtrudeGeometry(ring(w + 0.4, d + 0.4, r, 1.4), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 2, curveSegments: 6 });
  lip.rotateX(-Math.PI / 2); lip.translate(0, h - 0.3, 0);
  const floor = new THREE.ShapeGeometry(rrect(w, d, r), 6); floor.rotateX(-Math.PI / 2); floor.translate(0, 0.1, 0);
  for (const [geo, mat] of [[walls, plastic], [lip, plastic], [floor, floorMat]]) {
    const m = new THREE.Mesh(geo, mat); m.castShadow = geo !== floor; m.receiveShadow = true; g.add(m);
  }
  return g;
}

// Deli pint of par-cooked risotto with a clear lid. Origin at the base centre.
let pintGeo = null;
export function pints(cols, rows, n, pitch = 9.6) {
  if (!pintGeo) {
    const prof = [[0, 0], [4.1, 0], [4.25, 0.3], [4.55, 6.6], [4.85, 6.75], [4.85, 7.05], [4.5, 7.0], [4.2, 0.6], [0, 0.6]].map(([a, b]) => new THREE.Vector2(a, b));
    const shell = new THREE.LatheGeometry(prof, 36);
    const fill = new THREE.CylinderGeometry(4.35, 4.15, 5.2, 36); fill.translate(0, 3.2, 0);
    const lid = new THREE.CylinderGeometry(4.95, 4.95, 0.35, 40); lid.translate(0, 7.25, 0);
    const lidRim = new THREE.TorusGeometry(4.75, 0.28, 8, 40); lidRim.rotateX(Math.PI / 2); lidRim.translate(0, 7.15, 0);
    for (const gg of [shell, fill, lid, lidRim]) gg.userData.shared = true;
    pintGeo = { shell, fill, lid, lidRim };
  }
  const clear = once('clearPP', () => new THREE.MeshPhysicalMaterial({ color: 0xf4f6f6, roughness: 0.12, transparent: true, opacity: 0.32, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false, side: THREE.DoubleSide }));
  const lidMat = once('lidPP', () => new THREE.MeshPhysicalMaterial({ color: 0xf8faf9, roughness: 0.2, transparent: true, opacity: 0.24, clearcoat: 1, clearcoatRoughness: 0.04, depthWrite: false }));
  const rice = once('rice', () => new THREE.MeshStandardMaterial({ map: risottoMap(), roughness: 0.6 }));
  const out = [];
  let k = 0;
  const r = rng(71);
  for (let ci = 0; ci < cols; ci++) {
    for (let ri = 0; ri < rows; ri++) {
      if (k >= n) break;
      const g = new THREE.Group();
      const f = new THREE.Mesh(pintGeo.fill, rice); f.castShadow = true; f.receiveShadow = true;
      const sh = new THREE.Mesh(pintGeo.shell, clear); sh.renderOrder = 2;
      const l = new THREE.Mesh(pintGeo.lid, lidMat); l.renderOrder = 3;
      const lr = new THREE.Mesh(pintGeo.lidRim, clear); lr.renderOrder = 3;
      g.add(f, sh, l, lr);
      g.position.set((ci - (cols - 1) / 2) * pitch + (r() - 0.5) * 0.5, 0.05, (ri - (rows - 1) / 2) * pitch + (r() - 0.5) * 0.5);
      g.userData.col = ci; g.userData.row = ri;
      out.push(g);
      k++;
    }
  }
  return out;
}

let ramGeo = null;
export function flanPieces(cols, rows, n, pitch = 8.6) {
  const m = mats();
  if (!ramGeo) {
    const prof = [
      [0, 0], [3.3, 0], [3.6, 0.25], [3.75, 0.8], [3.8, 4.0], [3.82, 4.25], [3.7, 4.4], [3.55, 4.3], [3.5, 4.0], [3.45, 0.7], [0, 0.7],
    ].map(([a, b]) => new THREE.Vector2(a, b));
    const body = new THREE.LatheGeometry(prof, 40);
    // flutes on the outside
    const pos = body.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i);
      const rad = Math.hypot(x, z);
      if (rad > 3.7 && y > 0.6 && y < 4.05) {
        const a = Math.atan2(z, x);
        const k = 1 + Math.abs(Math.sin(a * 12)) * 0.035;
        pos.setX(i, x * k); pos.setZ(i, z * k);
      }
    }
    body.computeVertexNormals();
    const top = new THREE.CylinderGeometry(3.47, 3.47, 0.3, 36);
    top.translate(0, 3.95, 0);
    // a slight dome of caramel
    const tp = top.attributes.position;
    for (let i = 0; i < tp.count; i++) if (tp.getY(i) > 4.0) tp.setY(i, tp.getY(i) + 0.12 * (1 - Math.hypot(tp.getX(i), tp.getZ(i)) / 3.47));
    top.computeVertexNormals();
    body.userData.shared = true; top.userData.shared = true;
    ramGeo = { body, top };
  }
  const out = [];
  let k = 0;
  for (let ri = rows - 1; ri >= 0; ri--) {
    for (let ci = 0; ci < cols; ci++) {
      if (k >= n) break;
      const g = new THREE.Group();
      const b = new THREE.Mesh(ramGeo.body, m.porcelain); b.castShadow = true; b.receiveShadow = true;
      const t = new THREE.Mesh(ramGeo.top, m.caramel); t.receiveShadow = true;
      g.add(b, t);
      g.position.set((ci - (cols - 1) / 2) * pitch, 0.1, (ri - (rows - 1) / 2) * pitch);
      g.rotation.y = k * 0.7;
      g.userData.col = ci; g.userData.row = ri;
      out.push(g);
      k++;
    }
  }
  return out;
}

export { THREE };
