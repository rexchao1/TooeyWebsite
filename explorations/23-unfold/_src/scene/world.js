import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as T from './textures.js';

/* One small restaurant, in metres. Back wall at z = 0, the room opens toward +z.
   Prep corner x -2.3..1.6 (window in the left wall), a steel shelving unit at
   x 1.0..1.5 holding the quarts, the line x 2.7..6.5 behind a pass at z 1.6,
   and the dining room in front of the pass. */

const QUART = { h: 0.135, rTop: 0.0585, rBot: 0.0485, foodBottom: 0.005, foodTop: 0.128 };
const rAt = (y) => QUART.rBot + (QUART.rTop - QUART.rBot) * (y / QUART.h);
export const PORTIONS = 40; // the portion scale cooks mark on these quarts
export const levelY = (portions) => QUART.foodBottom + (QUART.foodTop - QUART.foodBottom) * (portions / PORTIONS);

export function buildWorld({ quality = 'high' } = {}) {
  const hi = quality === 'high';
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1c1a18');
  const S = { scene };

  /* ---------- materials ---------- */
  const steelTex = T.brushedSteel();
  steelTex.rough.repeat.set(3, 3); steelTex.bump.repeat.set(3, 3);
  const steel = new THREE.MeshStandardMaterial({ color: '#b5b7b8', metalness: 1, roughness: 1, roughnessMap: steelTex.rough, bumpMap: steelTex.bump, bumpScale: 0.15 });
  const steelDark = new THREE.MeshStandardMaterial({ color: '#8d8f90', metalness: 1, roughness: 1, roughnessMap: steelTex.rough });
  const iron = new THREE.MeshStandardMaterial({ color: '#1b1a19', metalness: 0.6, roughness: 0.62 });
  const blackPlastic = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.45 });
  const tile = T.subwayTile();
  const tileMat = new THREE.MeshStandardMaterial({ map: tile.map, normalMap: tile.normal, normalScale: new THREE.Vector2(0.8, 0.8), roughnessMap: tile.rough, roughness: 1, metalness: 0 });
  const quarry = T.quarryTile();
  const floorMat = new THREE.MeshStandardMaterial({ map: quarry.map, normalMap: quarry.normal, roughness: 0.78 });
  const oak = T.wood('oak');
  const oakMat = new THREE.MeshStandardMaterial({ map: oak, roughness: 0.55, color: '#bfb1a0' });
  const walnut = T.wood('walnut');
  const walnutMat = new THREE.MeshStandardMaterial({ map: walnut, roughness: 0.42 });
  const maple = T.wood('maple');
  const mapleMat = new THREE.MeshStandardMaterial({ map: maple, roughness: 0.6 });
  const plasterMat = new THREE.MeshStandardMaterial({ map: T.plaster(51, [70, 65, 60]), roughness: 0.92 });
  const plasterDark = new THREE.MeshStandardMaterial({ map: T.plaster(52, [48, 45, 42]), roughness: 0.95 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: '#2a2826', roughness: 1 });
  const porcelainMat = new THREE.MeshStandardMaterial({ color: '#f1efe9', roughness: 0.18 });
  const brass = new THREE.MeshStandardMaterial({ color: '#b58f55', metalness: 1, roughness: 0.32 });
  const shadowTex = T.radial('rgba(0,0,0,1)', 'rgba(0,0,0,0)', 128, [0.45, 'rgba(0,0,0,0.55)']);
  const contactMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55, color: '#000' });
  const poolTex = T.radial('rgba(255,255,255,1)', 'rgba(255,255,255,0)', 256, [0.35, 'rgba(255,255,255,0.35)']);
  S.mats = { steel };

  const add = (mesh, parent = scene) => { parent.add(mesh); return mesh; };
  const box = (w, h, d, mat, x, y, z, { r = 0.004, cast = true, receive = true, parent } = {}) => {
    const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.1, h / 2.1, d / 2.1)) : new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = receive;
    return add(m, parent);
  };
  const cyl = (rt, rb, h, mat, x, y, z, { seg = 24, cast = true, parent } = {}) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true;
    return add(m, parent);
  };
  const plane = (w, h, mat, x, y, z, rx = 0, ry = 0, { receive = true, parent } = {}) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = receive;
    return add(m, parent);
  };
  const contact = (w, d, x, y, z, op = 0.55, parent) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), contactMat.clone());
    m.material.opacity = op;
    m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.0015, z); m.renderOrder = 1;
    return add(m, parent);
  };
  const texFor = (mat, rx, ry) => { const m = mat.clone(); ['map', 'normalMap', 'roughnessMap'].forEach((k) => { if (m[k]) { m[k] = m[k].clone(); m[k].repeat.set(rx, ry); m[k].needsUpdate = true; } }); return m; };

  /* ---------- shell ---------- */
  // floors
  plane(3.9, 4.5, texFor(floorMat, 3.25, 3.75), -0.35, 0, 2.25, -Math.PI / 2);
  plane(5.3, 1.6, texFor(floorMat, 4.4, 1.33), 4.25, 0, 0.8, -Math.PI / 2);
  plane(7.8, 8.0, texFor(oakMat, 3.4, 3.4), 5.5, 0.001, 5.6, -Math.PI / 2);
  plane(13, 10, ceilingMat, 3.5, 3.0, 5, Math.PI / 2);
  // tiled walls; texture offset follows position so grout lines run on across pieces
  const tilePiece = (w, h, x0, y0, x, y, z, ry) => {
    const m = tileMat.clone();
    for (const k of ['map', 'normalMap', 'roughnessMap']) { m[k] = m[k].clone(); m[k].repeat.set(w / 1.2, h / 1.2); m[k].offset.set((x0 / 1.2) % 1, (y0 / 1.2) % 1); m[k].needsUpdate = true; }
    return plane(w, h, m, x, y, z, 0, ry);
  };
  // back wall with a window over the prep table (opening x -1.05..0.25, y 1.15..2.2)
  const wx0 = -1.05, wx1 = 0.25, wy0 = 1.15, wy1 = 2.55;
  const backPiece = (x0, x1, y0, y1) => {
    tilePiece(x1 - x0, y1 - y0, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2, 0, 0);
    box(x1 - x0, y1 - y0, 0.12, plasterDark, (x0 + x1) / 2, (y0 + y1) / 2, -0.065, { r: 0, cast: true, receive: false });
  };
  backPiece(-2.3, wx0, 0, 3); backPiece(wx1, 6.9, 0, 3);
  backPiece(wx0, wx1, 0, wy0); backPiece(wx0, wx1, wy1, 3);
  // left wall, solid tile, then plaster where it runs along the room
  tilePiece(4.5, 3, 0, 0, -2.3, 1.5, 2.25, Math.PI / 2);
  // window: reveal, frame, muntins, sill, and the sky outside
  const frameMat = new THREE.MeshStandardMaterial({ color: '#2b2a28', roughness: 0.55 });
  const wcx = (wx0 + wx1) / 2, wcy = (wy0 + wy1) / 2, ww = wx1 - wx0, wh = wy1 - wy0;
  box(ww, 0.04, 0.12, plasterMat, wcx, wy0 - 0.02, -0.06, { r: 0 });
  box(ww + 0.06, 0.03, 0.1, steel, wcx, wy0 + 0.005, 0.03, { r: 0.004 });
  box(ww, 0.05, 0.06, frameMat, wcx, wy1 - 0.025, -0.06, { r: 0.004 });
  box(0.05, wh, 0.06, frameMat, wx0 + 0.025, wcy, -0.06, { r: 0.004 });
  box(0.05, wh, 0.06, frameMat, wx1 - 0.025, wcy, -0.06, { r: 0.004 });
  box(0.03, wh, 0.03, frameMat, wcx, wcy, -0.07, { r: 0.004 });
  box(ww, 0.03, 0.03, frameMat, wcx, wcy + 0.05, -0.07, { r: 0.004 });
  const skyTex = (() => {
    const [c, x] = T.makeCanvas(64, 256);
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#7f8fa6'); g.addColorStop(0.55, '#e9c79c'); g.addColorStop(0.8, '#ffd9a6'); g.addColorStop(1, '#9a7a62');
    x.fillStyle = g; x.fillRect(0, 0, 64, 256);
    const t = T.toTex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
  })();
  const skyMat = new THREE.MeshBasicMaterial({ color: '#ffffff', map: skyTex });
  plane(ww + 0.2, wh + 0.2, skyMat, wcx, wcy, -0.16, 0, 0, { receive: false });
  S.sky = skyMat;
  // open kitchen: a half wall between the prep corner and the room, then walls either side of the pass
  box(0.16, 1.02, 2.3, plasterMat, 1.6, 0.51, 3.35, { r: 0.004 });
  box(0.26, 0.04, 2.34, walnutMat, 1.6, 1.04, 3.35, { r: 0.006 });
  plane(3.9, 5.1, texFor(oakMat, 1.7, 2.2), -0.35, 0.001, 7.05, -Math.PI / 2);
  plane(5.1, 3, plasterDark, -2.3, 1.5, 7.05, 0, Math.PI / 2);
  box(1.0, 3, 0.12, plasterMat, 2.1, 1.5, 1.6, { r: 0 });
  box(2.9, 3, 0.12, plasterMat, 8.05, 1.5, 1.6, { r: 0 });
  box(4.0, 0.75, 0.12, plasterMat, 4.6, 2.625, 1.6, { r: 0 }); // soffit over the pass
  plane(0.3, 3, texFor(tileMat, 0.25, 2.5), 6.9, 1.5, 0.8, 0, -Math.PI / 2);
  box(0.12, 3, 1.6, plasterDark, 6.95, 1.5, 0.8, { r: 0 });
  // dining room walls
  plane(8.0, 3, plasterDark, 9.4, 1.5, 5.6, 0, -Math.PI / 2);
  box(7.8, 1.0, 0.03, walnutMat, 5.5, 0.5, 9.58, { r: 0.004 });
  box(0.03, 1.0, 8.0, walnutMat, 9.38, 0.5, 5.6, { r: 0.004 });
  plane(11.8, 3, plasterDark, 3.55, 1.5, 9.6, 0, Math.PI);

  /* ---------- prep corner ---------- */
  // steel prep table along the back wall
  const tx0 = -1.6, tx1 = 0.9, tz0 = 0.03, tz1 = 0.78, ty = 0.91;
  const tw = tx1 - tx0, td = tz1 - tz0, tcx = (tx0 + tx1) / 2, tcz = (tz0 + tz1) / 2;
  box(tw, 0.04, td, steel, tcx, ty - 0.02, tcz, { r: 0.008 });
  box(tw, 0.11, 0.012, steel, tcx, ty + 0.055, tz0 + 0.006, { r: 0.004 });
  box(tw, 0.02, td - 0.05, steel, tcx, 0.24, tcz, { r: 0.004 });
  for (const lx of [tx0 + 0.04, tx1 - 0.04]) for (const lz of [tz0 + 0.04, tz1 - 0.04]) cyl(0.019, 0.019, ty - 0.04, steel, lx, (ty - 0.04) / 2, lz, { seg: 16 });
  contact(tw + 0.3, td + 0.3, tcx, 0, tcz, 0.5);
  // on the table: board, knife, towel, a lidded hotel pan, the two quarts for prep
  const board = box(0.52, 0.03, 0.36, mapleMat, -0.5, ty + 0.015, 0.44, { r: 0.006 });
  board.rotation.y = 0.04;
  contact(0.62, 0.46, -0.5, ty, 0.44, 0.45);
  const knife = new THREE.Group();
  box(0.24, 0.002, 0.045, steel, 0.0, 0, 0, { r: 0.0008, parent: knife });
  box(0.12, 0.018, 0.022, blackPlastic, -0.18, 0.003, -0.008, { r: 0.006, parent: knife });
  knife.position.set(-0.45, ty + 0.032, 0.5); knife.rotation.y = -0.35; scene.add(knife);
  const towelMat = new THREE.MeshStandardMaterial({ map: T.towel(), roughness: 0.95 });
  const tw1 = box(0.22, 0.02, 0.16, towelMat, -0.98, ty + 0.01, 0.6, { r: 0.008 }); tw1.rotation.y = 0.3;
  const hp = box(0.53, 0.07, 0.32, steel, -1.18, ty + 0.035, 0.3, { r: 0.012 });
  void hp;
  box(0.535, 0.01, 0.325, steelDark, -1.18, ty + 0.075, 0.3, { r: 0.004 });
  contact(0.65, 0.42, -1.18, ty, 0.3, 0.5);
  /* ---------- the shelving unit with the quarts ---------- */
  const ux0 = 1.0, ux1 = 1.5, uz0 = 0.2, uz1 = 1.75;
  const ucx = (ux0 + ux1) / 2, ucz = (uz0 + uz1) / 2;
  for (const px of [ux0 + 0.015, ux1 - 0.015]) for (const pz of [uz0 + 0.015, uz1 - 0.015]) box(0.028, 1.86, 0.028, steel, px, 0.93, pz, { r: 0.006 });
  for (const sy of [0.28, 0.82, 1.30, 1.76]) {
    box(ux1 - ux0, 0.012, uz1 - uz0, steel, ucx, sy - 0.006, ucz, { r: 0.003 });
    box(0.012, 0.035, uz1 - uz0, steel, ux0 + 0.006, sy - 0.02, ucz, { r: 0.003 }); // turned-down edge
    contact(ux1 - ux0, uz1 - uz0, ucx, sy, ucz, 0.18);
  }
  contact(0.8, 1.9, ucx, 0, ucz, 0.5);
  // lower and top shelves: stacked sheet pans, lidded square containers, plates
  const lexan = new THREE.MeshPhysicalMaterial({ color: '#e9edf0', roughness: 0.2, transparent: true, opacity: 0.2, depthWrite: false });
  for (let i = 0; i < 6; i++) box(0.33, 0.02, 0.46, steelDark, ucx, 0.30 + i * 0.024, 0.55, { r: 0.004 });
  // stacked hotel pans on the middle shelf
  for (const [pz, n] of [[0.55, 4], [1.35, 3]]) for (let i = 0; i < n; i++) box(0.3, 0.065, 0.46, steelDark, ucx, 0.82 + 0.034 + i * 0.03, pz, { r: 0.01 });
  void lexan;
  const plateStack = new THREE.Group();
  for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(plateGeo(0.13), porcelainMat); p.position.y = i * 0.012; p.castShadow = true; plateStack.add(p); }
  plateStack.position.set(ucx, 1.761, 1.35); scene.add(plateStack);

  // the quarts, in a row along the shelf; tapes face the prep corner (-x)
  const face = -1.2;
  const shelfY = 1.30;
  const qx = ux0 + 0.13;
  S.quarts = {};
  const tl = (a, b, s1 = 150) => [{ text: a, size: s1, x: 58, y: 212 }, { text: b, size: 196, x: 64, y: 448 }];
  S.quarts.pork = new Quart({ seed: 1, food: 'pork', lines: [{ text: 'PORK BELLY', size: 138, x: 50, y: 212 }, { text: '26', size: 196, x: 64, y: 448 }], hi });
  S.quarts.pork.group.position.set(qx, shelfY, 0.86); S.quarts.pork.group.rotation.y = face;
  S.quarts.polenta = new Quart({ seed: 2, food: 'polenta', lines: tl('POLENTA', '30'), hi });
  S.quarts.polenta.group.position.set(qx + 0.01, shelfY, 1.08); S.quarts.polenta.group.rotation.y = face + 0.1;
  S.quarts.chowder = new Quart({ seed: 3, food: 'chowder', lines: tl('CHOWDER', '16'), hi });
  S.quarts.chowder.group.position.set(qx - 0.005, shelfY, 1.30); S.quarts.chowder.group.rotation.y = face - 0.06;
  for (const k of ['pork', 'polenta', 'chowder']) { scene.add(S.quarts[k].group); contact(0.17, 0.17, S.quarts[k].group.position.x, shelfY, S.quarts[k].group.position.z, 0.6); }
  S.quarts.polenta.setLevel(levelY(30));
  S.quarts.chowder.setLevel(levelY(16));
  // a stack of lids
  const lidMat = new THREE.MeshPhysicalMaterial({ color: '#f4f3ef', roughness: 0.3, transparent: true, opacity: 0.55 });
  for (let i = 0; i < 7; i++) {
    const l = new THREE.Mesh(lidGeo(), lidMat); l.position.set(qx + 0.01, shelfY + i * 0.006, 1.52); l.rotation.y = i; l.castShadow = true; scene.add(l);
  }
  contact(0.16, 0.16, qx + 0.01, shelfY, 1.52, 0.5);
  // on the prep table: slaw and aioli
  S.quarts.slaw = new Quart({ seed: 4, food: 'slaw', lines: tl('SLAW', '20'), hi });
  S.quarts.slaw.group.position.set(0.22, ty, 0.5); S.quarts.slaw.group.rotation.y = 0.15;
  S.quarts.aioli = new Quart({ seed: 5, food: 'aioli', lines: tl('AIOLI', '40'), hi });
  S.quarts.aioli.group.position.set(0.42, ty, 0.42); S.quarts.aioli.group.rotation.y = -0.1;
  for (const k of ['slaw', 'aioli']) { scene.add(S.quarts[k].group); contact(0.17, 0.17, S.quarts[k].group.position.x, ty, S.quarts[k].group.position.z, 0.6); }

  /* ---------- the line ---------- */
  const lx0 = 2.7, sw = 0.95;
  S.stations = [];
  const grateGeo = (() => {
    const parts = [];
    for (let i = 0; i < 7; i++) { const g = new THREE.BoxGeometry(0.012, 0.018, 0.4); g.translate(-0.19 + i * 0.063, 0, 0); parts.push(g); }
    for (let i = 0; i < 3; i++) { const g = new THREE.BoxGeometry(0.4, 0.016, 0.012); g.translate(0, 0, -0.19 + i * 0.19); parts.push(g); }
    return mergeGeometries(parts);
  })();
  const flameGlowTex = T.radial('rgba(255,255,255,1)', 'rgba(255,255,255,0)', 128, [0.3, 'rgba(255,255,255,0.35)']);
  const flameMat = new THREE.MeshBasicMaterial({ color: '#7d96ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const panMat = new THREE.MeshStandardMaterial({ color: '#2a2a2b', metalness: 0.85, roughness: 0.38 });
  const panGeo = new THREE.LatheGeometry([new THREE.Vector2(0, 0.004), new THREE.Vector2(0.12, 0.004), new THREE.Vector2(0.13, 0.012), new THREE.Vector2(0.14, 0.05), new THREE.Vector2(0.145, 0.052), new THREE.Vector2(0.137, 0.052), new THREE.Vector2(0.128, 0.014), new THREE.Vector2(0, 0.012)], 40);
  const hoodLightMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffe2b8', emissiveIntensity: 0, roughness: 0.5 });
  for (let i = 0; i < 4; i++) {
    const cx = lx0 + sw / 2 + i * sw;
    box(sw - 0.02, 0.86, 0.8, steel, cx, 0.43, 0.42, { r: 0.01 });
    box(sw - 0.12, 0.42, 0.01, steelDark, cx, 0.32, 0.825, { r: 0.004 }); // oven door
    box(sw - 0.3, 0.03, 0.03, steel, cx, 0.58, 0.84, { r: 0.012 }); // handle
    for (let k = 0; k < 4; k++) { const kn = cyl(0.022, 0.024, 0.03, blackPlastic, cx - 0.33 + k * 0.22, 0.79, 0.835, { seg: 18 }); kn.rotation.x = Math.PI / 2; }
    const g1 = new THREE.Mesh(grateGeo, iron); g1.position.set(cx - 0.22, 0.875, 0.42); g1.castShadow = true; scene.add(g1);
    const g2 = new THREE.Mesh(grateGeo, iron); g2.position.set(cx + 0.22, 0.875, 0.42); g2.castShadow = true; scene.add(g2);
    box(sw - 0.04, 0.012, 0.76, iron, cx, 0.862, 0.42, { r: 0.003 });
    const flame = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.011, 8, 40), flameMat.clone());
    flame.rotation.x = Math.PI / 2; flame.position.set(cx - 0.22, 0.884, 0.52); scene.add(flame);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: flameGlowTex, color: '#ff9b52', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.set(cx - 0.22, 0.886, 0.52); glow.renderOrder = 6; scene.add(glow);
    const pan = new THREE.Mesh(panGeo, panMat); pan.position.set(cx - 0.22, 0.887, 0.52); pan.castShadow = true;
    const handle = box(0.2, 0.014, 0.026, panMat, 0.24, 0.045, 0, { r: 0.006, parent: pan }); handle.rotation.z = 0.12;
    pan.rotation.y = -0.3 - i * 0.3; scene.add(pan);
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(sw * 0.7, 0.16), hoodLightMat.clone());
    hl.rotation.x = Math.PI / 2; hl.position.set(cx, 1.949, 0.7); scene.add(hl);
    S.stations.push({ cx, flame, glow, pan, hoodLight: hl });
  }
  box(4.0, 0.6, 1.05, steel, lx0 + 1.9, 2.25, 0.52, { r: 0.012 }); // hood
  box(4.0, 1.05, 0.012, steel, lx0 + 1.9, 1.42, 0.012, { r: 0.004 }); // backsplash
  // shelf over the line with plates, and squeeze bottles
  box(3.8, 0.012, 0.22, steel, lx0 + 1.9, 1.5, 0.13, { r: 0.003 });
  const bottleMat = [new THREE.MeshStandardMaterial({ color: '#c79a48', roughness: 0.3, transparent: true, opacity: 0.85 }), new THREE.MeshStandardMaterial({ color: '#e7e1cf', roughness: 0.3, transparent: true, opacity: 0.85 }), new THREE.MeshStandardMaterial({ color: '#7a3427', roughness: 0.3, transparent: true, opacity: 0.85 })];
  for (let i = 0; i < 9; i++) { const b = cyl(0.03, 0.03, 0.19, bottleMat[i % 3], lx0 + 0.5 + i * 0.36, 1.6, 0.12, { seg: 16 }); void b; }
  contact(4.2, 1.2, lx0 + 1.9, 0, 0.45, 0.6);

  /* ---------- the pass ---------- */
  const px0 = 2.6, px1 = 6.6, pcx = (px0 + px1) / 2, pw = px1 - px0;
  box(pw, 0.95, 0.4, plasterDark, pcx, 0.475, 1.65, { r: 0.004 });
  box(pw + 0.04, 0.03, 0.46, steel, pcx, 0.965, 1.65, { r: 0.006 });
  box(pw, 0.012, 0.32, steel, pcx, 1.45, 1.62, { r: 0.003 });
  for (const x of [px0 + 0.03, px1 - 0.03]) box(0.025, 0.5, 0.025, steel, x, 1.2, 1.62, { r: 0.006 });
  const heatMat = new THREE.MeshStandardMaterial({ color: '#222', emissive: '#ff9a4a', emissiveIntensity: 0, roughness: 0.5 });
  S.heat = [];
  for (const hx of [pcx - pw / 4, pcx + pw / 4]) {
    box(pw / 2 - 0.1, 0.07, 0.16, steel, hx, 1.86, 1.62, { r: 0.01 });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(pw / 2 - 0.16, 0.08), heatMat.clone());
    glow.rotation.x = Math.PI / 2; glow.position.set(hx, 1.824, 1.62); scene.add(glow);
    S.heat.push(glow);
    for (const x of [hx - pw / 4 + 0.15, hx + pw / 4 - 0.15]) cyl(0.006, 0.006, 0.4, steel, x, 2.05, 1.62, { seg: 8 });
  }
  // ticket rail along the front of the heat lamps
  box(pw - 0.2, 0.025, 0.02, steel, pcx, 1.79, 1.715, { r: 0.006 });
  S.tickets = [];
  for (let i = 0; i < 9; i++) {
    const t = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.16), new THREE.MeshStandardMaterial({ map: T.thermalTicket(200 + i), roughness: 0.85, side: THREE.DoubleSide }));
    t.position.set(0, 1.79 - 0.085, 1.727); t.castShadow = false;
    scene.add(t);
    S.tickets.push({ mesh: t, home: 3.0 + i * 0.4, tilt: (i % 3 - 1) * 0.03 });
  }
  // plates waiting under the lamps
  S.passPlates = [];
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Group();
    const pl = new THREE.Mesh(plateGeo(0.13), porcelainMat); pl.castShadow = true; p.add(pl);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10), new THREE.MeshStandardMaterial({ map: T.food(i % 2 ? 'pork' : 'polenta'), roughness: 0.4 }));
    f.scale.set(1, 0.35, 0.8); f.position.y = 0.018; p.add(f);
    p.position.set(3.3 + i * 0.95, 1.457, 1.62); scene.add(p);
    S.passPlates.push(p);
  }

  // clock on the wall left of the pass
  const clock = new THREE.Group();
  const face2 = new THREE.Mesh(new THREE.CircleGeometry(0.15, 48), new THREE.MeshStandardMaterial({ map: T.clockFace(), roughness: 0.35 }));
  clock.add(face2);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.012, 10, 48), blackPlastic); clock.add(rim);
  const hourHand = box(0.012, 0.085, 0.004, blackPlastic, 0, 0.035, 0.008, { r: 0, cast: false });
  const minHand = box(0.008, 0.125, 0.004, blackPlastic, 0, 0.055, 0.012, { r: 0, cast: false });
  const hourPivot = new THREE.Group(); hourPivot.add(hourHand); hourHand.position.set(0, 0.035, 0.008);
  const minPivot = new THREE.Group(); minPivot.add(minHand); minHand.position.set(0, 0.055, 0.012);
  scene.remove(hourHand); scene.remove(minHand);
  clock.add(hourPivot); clock.add(minPivot);
  clock.position.set(2.15, 2.0, 1.668); scene.add(clock);
  S.clock = { hourPivot, minPivot };

  // chalkboard on the soffit
  const cb = new THREE.Group();
  box(1.06, 0.62, 0.03, walnutMat, 0, 0, 0, { r: 0.006, parent: cb });
  const cbFace = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.56), new THREE.MeshStandardMaterial({ map: T.chalkboard('TUESDAY'), roughness: 0.9 }));
  cbFace.position.z = 0.016; cb.add(cbFace);
  cb.position.set(4.6, 2.62, 1.68); scene.add(cb);

  /* ---------- dining room ---------- */
  const tables = [];
  const tpos = [[3.0, 3.2], [4.75, 3.2], [6.5, 3.2], [8.25, 3.2], [3.85, 5.15], [5.6, 5.15], [7.35, 5.15], [3.0, 7.1], [4.75, 7.1], [6.5, 7.1]];
  const tableTop = new RoundedBoxGeometry(0.74, 0.035, 0.74, 2, 0.008);
  const chairGeo = makeChair();
  const chairs = new THREE.InstancedMesh(chairGeo, walnutMat, tpos.length * 2);
  chairs.castShadow = true; chairs.receiveShadow = true;
  const lampShadeMat = new THREE.MeshStandardMaterial({ color: '#d9cdb6', roughness: 0.6, emissive: '#ffd59a', emissiveIntensity: 0, side: THREE.DoubleSide });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1);
  tpos.forEach(([x, z], i) => {
    const t = new THREE.Mesh(tableTop, walnutMat); t.position.set(x, 0.755, z); t.castShadow = true; t.receiveShadow = true; scene.add(t);
    cyl(0.035, 0.035, 0.72, iron, x, 0.37, z, { seg: 16 });
    cyl(0.22, 0.24, 0.02, iron, x, 0.01, z, { seg: 28 });
    contact(1.3, 1.3, x, 0.0, z, 0.55);
    for (const s of [-1, 1]) {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s > 0 ? Math.PI : 0);
      m4.compose(new THREE.Vector3(x + (i % 2 ? 0.03 : -0.03), 0, z + s * 0.52), q, sc);
      chairs.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), m4);
    }
    // cordless lamp
    const lamp = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.012, 24), brass); base.position.y = 0.006; lamp.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 10), brass); stem.position.y = 0.11; lamp.add(stem);
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.08, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), lampShadeMat.clone()); shade.position.y = 0.2; shade.castShadow = true; lamp.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff1d6' })); bulb.position.y = 0.19; bulb.visible = false; lamp.add(bulb);
    lamp.position.set(x + 0.18, 0.773, z - 0.15); scene.add(lamp);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: poolTex, color: '#f1d2a0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(x + 0.1, 0.775, z - 0.08); pool.renderOrder = 2; scene.add(pool);
    const plates = [];
    for (const s of [-1, 1]) {
      const p = new THREE.Group();
      const pl = new THREE.Mesh(plateGeo(0.125), porcelainMat); pl.castShadow = true; p.add(pl);
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 10), new THREE.MeshStandardMaterial({ map: T.food((i + s) % 3 === 0 ? 'polenta' : (i + s) % 3 === 1 ? 'pork' : 'slaw'), roughness: 0.45 }));
      f.scale.set(1, 0.32, 0.85); f.position.y = 0.016; p.add(f);
      p.position.set(x - 0.06, 0.774, z + s * 0.2); scene.add(p);
      plates.push(p);
    }
    tables.push({ x, z, shade: shade.material, bulb, pool: pool.material, plates, lampPos: new THREE.Vector3(x + 0.18, 0.773 + 0.19, z - 0.15) });
  });
  scene.add(chairs);
  S.tables = tables;

  /* ---------- light ---------- */
  const hemi = new THREE.HemisphereLight('#d8cfc2', '#3a2c22', 0.3);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffc98c', 0);
  const sunDir = new THREE.Vector3(0.769, -0.375, 0.518).normalize();
  sun.target.position.set(0.6, 1.2, 1.0);
  sun.position.copy(sun.target.position).addScaledVector(sunDir, -11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(hi ? 2048 : 1024, hi ? 2048 : 1024);
  const sc2 = sun.shadow.camera; sc2.left = -2.4; sc2.right = 2.4; sc2.top = 2.0; sc2.bottom = -2.0; sc2.near = 4; sc2.far = 16;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  // kitchen ceiling light over the prep corner and the shelf
  const prepLight = new THREE.SpotLight('#fff0dc', 0, 7, 1.0, 0.9, 1.6);
  prepLight.position.set(0.3, 2.95, 1.5); prepLight.target.position.set(0.6, 0.9, 0.7);
  prepLight.castShadow = true; prepLight.shadow.mapSize.set(1024, 1024); prepLight.shadow.bias = -0.0005; prepLight.shadow.normalBias = 0.02;
  scene.add(prepLight); scene.add(prepLight.target);
  // light from the hood and the pass, plus a pool of point lights reused per shot
  const lineLight = new THREE.RectAreaLight ? null : null; void lineLight;
  const points = [];
  for (let i = 0; i < 6; i++) { const p = new THREE.PointLight('#ffd9a8', 0, 3.2, 1.8); scene.add(p); points.push(p); }
  const passLight = new THREE.SpotLight('#ffcf9a', 0, 6, 1.1, 0.8, 1.6);
  passLight.position.set(pcx, 2.95, 2.6); passLight.target.position.set(pcx, 0.9, 1.0);
  scene.add(passLight); scene.add(passLight.target);
  const roomLight = new THREE.SpotLight('#f6dcb4', 0, 14, 1.2, 1.0, 1.4);
  roomLight.position.set(5.6, 2.95, 6.0); roomLight.target.position.set(5.4, 0, 5.2);
  scene.add(roomLight); scene.add(roomLight.target);
  S.lights = { hemi, sun, prepLight, points, passLight, roomLight };

  return S;
}

/* ---------- small geometries ---------- */
function plateGeo(r) {
  const pts = [[0, 0.004], [r * 0.55, 0.004], [r * 0.6, 0.0], [r * 0.66, 0.002], [r * 0.7, 0.008], [r * 0.95, 0.016], [r, 0.02], [r * 0.99, 0.022], [r * 0.93, 0.019], [r * 0.68, 0.011], [0, 0.009]];
  return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 48);
}
function lidGeo() {
  const r = QUART.rTop + 0.003;
  const pts = [[0, 0.004], [r - 0.012, 0.004], [r - 0.01, 0.0], [r - 0.004, 0.0], [r, 0.006], [r - 0.002, 0.008], [0, 0.008]];
  return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 48);
}
function makeChair() {
  const parts = [];
  const seat = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 32); seat.translate(0, 0.46, 0); parts.push(seat);
  const ring = new THREE.TorusGeometry(0.2, 0.012, 8, 32); ring.rotateX(Math.PI / 2); ring.translate(0, 0.445, 0); parts.push(ring);
  const legRing = new THREE.TorusGeometry(0.16, 0.009, 8, 32); legRing.rotateX(Math.PI / 2); legRing.translate(0, 0.2, 0); parts.push(legRing);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    const leg = new THREE.CylinderGeometry(0.012, 0.014, 0.47, 10);
    leg.rotateZ(0.06 * Math.cos(a)); leg.rotateX(-0.06 * Math.sin(a));
    leg.translate(Math.cos(a) * 0.165, 0.235, Math.sin(a) * 0.165); parts.push(leg);
  }
  const back = new THREE.TorusGeometry(0.15, 0.012, 8, 28, Math.PI); back.translate(0, 0.78, 0); back.rotateX(-0.12); back.translate(0, 0.0, -0.08); parts.push(back);
  for (const s of [-1, 1]) { const p = new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8); p.translate(s * 0.15, 0.64, -0.17); parts.push(p); }
  const inner = new THREE.TorusGeometry(0.09, 0.008, 8, 20, Math.PI); inner.translate(0, 0.72, -0.18); parts.push(inner);
  return mergeGeometries(parts.map((g) => g.toNonIndexed ? g.toNonIndexed() : g));
}

/* ---------- the deli quart ---------- */
let quartShared = null;
function quartMaterials(hi) {
  if (quartShared) return quartShared;
  const grad = T.graduations();
  const wall = hi
    ? new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.16, transmission: 0.94, thickness: 0.0008, ior: 1.49, metalness: 0, bumpMap: grad, bumpScale: 0.5, side: THREE.DoubleSide, specularIntensity: 0.8 })
    : new THREE.MeshStandardMaterial({ color: '#f6f5f1', roughness: 0.2, transparent: true, opacity: 0.26, bumpMap: grad, bumpScale: 0.6, side: THREE.DoubleSide, depthWrite: false });
  const rim = hi
    ? new THREE.MeshPhysicalMaterial({ color: '#f8f7f3', roughness: 0.25, transmission: 0.6, thickness: 0.004, ior: 1.49 })
    : new THREE.MeshStandardMaterial({ color: '#f8f7f3', roughness: 0.25, transparent: true, opacity: 0.6 });
  quartShared = { wall, rim };
  return quartShared;
}

export class Quart {
  constructor({ seed, food, lines, hi }) {
    const mats = quartMaterials(hi);
    this.group = new THREE.Group();
    const { h, rTop, rBot } = QUART;
    const wallGeo = new THREE.CylinderGeometry(rTop, rBot, h, 64, 1, true, -Math.PI, Math.PI * 2);
    wallGeo.translate(0, h / 2, 0);
    const wall = new THREE.Mesh(wallGeo, mats.wall); wall.castShadow = true; wall.receiveShadow = true;
    wall.renderOrder = 3;
    this.group.add(wall);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(rTop + 0.0015, 0.0022, 10, 64), mats.rim); lip.rotation.x = Math.PI / 2; lip.position.y = h; this.group.add(lip);
    const seat = new THREE.Mesh(new THREE.TorusGeometry(rAt(0.118) + 0.0006, 0.0012, 8, 64), mats.rim); seat.rotation.x = Math.PI / 2; seat.position.y = 0.118; this.group.add(seat);
    const base = new THREE.Mesh(new THREE.CircleGeometry(rBot, 48), mats.rim); base.rotation.x = -Math.PI / 2; base.position.y = 0.0015; this.group.add(base);
    const foot = new THREE.Mesh(new THREE.TorusGeometry(rBot - 0.002, 0.0018, 8, 48), mats.rim); foot.rotation.x = Math.PI / 2; foot.position.y = 0.002; this.group.add(foot);
    // food
    this.foodMat = new THREE.MeshStandardMaterial({ map: T.food(food), roughness: food === 'pork' ? 0.32 : 0.5 });
    this.foodMat.map.repeat.set(2, 1);
    this.food = new THREE.Mesh(new THREE.BufferGeometry(), this.foodMat);
    this.food.castShadow = false; this.food.receiveShadow = true;
    this.group.add(this.food);
    this.level = -1;
    this.setLevel(0);
    // tape
    this.tape = new T.Tape(seed, lines, { w: 1024, h: 512 });
    const tapeH = 0.05, ty = 0.052, arc = 0.1;
    const r0 = rAt(ty - tapeH / 2) + 0.0007, r1 = rAt(ty + tapeH / 2) + 0.0007;
    const tl = arc / ((r0 + r1) / 2);
    const tg = new THREE.CylinderGeometry(r1, r0, tapeH, 40, 1, true, -tl / 2, tl);
    tg.translate(0, ty, 0);
    this.tapeMesh = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ map: this.tape.tex, roughness: 0.72, alphaTest: 0.5, side: THREE.FrontSide }));
    this.tapeMesh.castShadow = true; this.tapeMesh.receiveShadow = true;
    this.group.add(this.tapeMesh);
    this.marks = null;
  }
  addMarks(marks) {
    const { h, rTop, rBot } = QUART;
    const g = new THREE.CylinderGeometry(rTop + 0.0005, rBot + 0.0005, h, 64, 1, true, -Math.PI, Math.PI * 2);
    g.translate(0, h / 2, 0);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: marks.tex, transparent: true, roughness: 0.6, depthWrite: false }));
    m.renderOrder = 4;
    this.group.add(m);
    this.marks = marks;
  }
  setLevel(y) {
    y = Math.max(QUART.foodBottom + 0.0005, y);
    if (Math.abs(y - this.level) < 1e-5) return;
    this.level = y;
    const y0 = QUART.foodBottom;
    const inset = 0.0016;
    const pts = [
      new THREE.Vector2(0, y0), new THREE.Vector2(rAt(y0) - inset - 0.002, y0), new THREE.Vector2(rAt(y0 + 0.002) - inset, y0 + 0.002),
      new THREE.Vector2(rAt(y) - inset, y - 0.0015), new THREE.Vector2(rAt(y) - inset - 0.002, y), new THREE.Vector2(0, y + 0.0006)
    ];
    const g = new THREE.LatheGeometry(pts, 48);
    this.food.geometry.dispose();
    this.food.geometry = g;
    this.food.visible = y > y0 + 0.001;
  }
}
