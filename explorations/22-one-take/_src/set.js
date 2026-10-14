// The restaurant: a 40-seat bistro, dining room in front (z > 0), kitchen
// behind (z < 0), joined by the pass. Metres throughout.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './textures.js';
import { rand, rr } from './textures.js';

// Box UVs in metres, so tiled textures keep their scale on any box.
function worldUV(geo, w, h, d, scale) {
  const uv = geo.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let i = 0; i < uv.count; i++) {
    const f = Math.min(5, Math.floor(i / (uv.count / 6)));
    uv.setXY(i, uv.getX(i) * dims[f][0] / scale, uv.getY(i) * dims[f][1] / scale);
  }
  return geo;
}

class Builder {
  constructor() { this.groups = new Map(); }
  add(geo, mat, matrix) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    g.applyMatrix4(matrix);
    if (!this.groups.has(mat)) this.groups.set(mat, []);
    this.groups.get(mat).push(g);
  }
  box(mat, x0, x1, y0, y1, z0, z1, scale = 0) {
    const w = x1 - x0, h = y1 - y0, d = z1 - z0;
    const geo = new THREE.BoxGeometry(w, h, d);
    if (scale) worldUV(geo, w, h, d, scale);
    this.add(geo, mat, new THREE.Matrix4().makeTranslation((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
  }
  rbox(mat, cx, cy, cz, w, h, d, r = 0.01, rotY = 0) {
    const geo = new RoundedBoxGeometry(w, h, d, 2, r);
    const m = new THREE.Matrix4().makeRotationY(rotY).setPosition(cx, cy, cz);
    this.add(geo, mat, m);
  }
  cyl(mat, cx, cy, cz, r0, r1, h, seg = 20, rot = null) {
    const geo = new THREE.CylinderGeometry(r0, r1, h, seg);
    const m = new THREE.Matrix4();
    if (rot) m.makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
    m.setPosition(cx, cy, cz);
    this.add(geo, mat, m);
  }
  geo(mat, geo, m) { this.add(geo, mat, m); }
  build(parent, { cast = true, receive = true } = {}) {
    for (const [mat, list] of this.groups) {
      const merged = mergeGeometries(list, false);
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      mesh.matrixAutoUpdate = false;
      parent.add(mesh);
    }
  }
}

export function buildSet(scene) {
  const S = {}; // handles for animation
  const B = new Builder();

  // ---- materials ----------------------------------------------------------
  const tiled = (t, rep = 1) => { t.repeat.set(rep, rep); return t; };
  const M = {
    plank: new THREE.MeshStandardMaterial({ map: tiled(T.plankFloor()), roughness: 0.5 }),
    quarry: new THREE.MeshStandardMaterial({ map: tiled(T.quarryTile()), roughness: 0.62 }),
    subway: new THREE.MeshStandardMaterial({ map: tiled(T.subwayTile()), roughness: 0.22 }),
    plaster: new THREE.MeshStandardMaterial({ map: tiled(T.plaster()), roughness: 0.95 }),
    walnut: new THREE.MeshStandardMaterial({ map: tiled(T.walnut()), roughness: 0.42 }),
    walnutDark: new THREE.MeshStandardMaterial({ map: tiled(T.walnut(true)), roughness: 0.5 }),
    zinc: new THREE.MeshStandardMaterial({ color: 0x8a8b8a, metalness: 0.85, roughness: 0.42, map: tiled(T.brushed()) }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc4c6c6, metalness: 0.55, roughness: 0.42, map: tiled(T.brushed()) }),
    enamel: new THREE.MeshStandardMaterial({ color: 0x1b1b1c, metalness: 0.3, roughness: 0.4 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x121212, metalness: 0.5, roughness: 0.75 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x4a2a20, roughness: 0.55 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x24221f, roughness: 1 }),
    ceilingK: new THREE.MeshStandardMaterial({ color: 0x9c9a94, roughness: 0.9 }),
    black: new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.4, roughness: 0.5 }),
    chair: new THREE.MeshStandardMaterial({ color: 0x2b1b12, roughness: 0.45 }),
    plate: new THREE.MeshStandardMaterial({ color: 0xeeece6, roughness: 0.2 }),
    printer: new THREE.MeshStandardMaterial({ color: 0x2b2c2e, roughness: 0.55, metalness: 0.05 }),
    printerLid: new THREE.MeshStandardMaterial({ color: 0x3c3d40, roughness: 0.35, metalness: 0.05 }),
    maple: new THREE.MeshStandardMaterial({ map: T.maple(), roughness: 0.6 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xb8bab9, metalness: 0.9, roughness: 0.3 }),
    cambro: new THREE.MeshStandardMaterial({ color: 0xe6e2d4, roughness: 0.35, transparent: true, opacity: 0.85 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0c1014, metalness: 0.2, roughness: 0.04, transparent: true, opacity: 0.35, depthWrite: false }),
    frame: new THREE.MeshStandardMaterial({ color: 0x171717, metalness: 0.6, roughness: 0.45 }),
    shade: new THREE.MeshStandardMaterial({ color: 0x1c1b19, metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide }),
  };
  S.M = M;

  // ---- dining room ----------------------------------------------------------
  B.box(M.plank, -5, 5, -0.02, 0, 0, 9, 1.4);
  B.box(M.ceiling, -5, 5, 3.2, 3.25, 0, 9, 3);
  // left wall: plaster over a walnut wainscot
  B.box(M.plaster, -5.15, -5, 1.05, 3.2, 0, 9, 2.5);
  B.box(M.walnutDark, -5.12, -4.98, 0, 1.05, 0, 9, 1.2);
  // right wall behind the bar
  B.box(M.plaster, 5, 5.15, 0, 3.2, 0, 9, 2.5);
  // dining side of the partition, with the pass and the kitchen door cut out
  const partD = (x0, x1, y0, y1) => B.box(M.plaster, x0, x1, y0, y1, 0, 0.08, 2.5);
  partD(-5, -4.3, 0, 3.2); partD(-4.3, -3.3, 2.1, 3.2); partD(-3.3, -1.6, 0, 3.2);
  partD(-1.6, 1.6, 0, 1.05); partD(-1.6, 1.6, 2.15, 3.2); partD(1.6, 5, 0, 3.2);
  B.box(M.walnutDark, -3.3, -1.6, 0, 1.05, 0.08, 0.11, 1.2);
  B.box(M.walnutDark, 1.6, 2.85, 0, 1.05, 0.08, 0.11, 1.2);
  // front wall with two windows and a glazed door
  const front = (x0, x1, y0, y1) => B.box(M.plaster, x0, x1, y0, y1, 9, 9.15, 2.5);
  front(-5, -4.6, 0, 3.2); front(-0.4, 0.2, 0, 3.2); front(3.0, 3.4, 0, 3.2); front(4.5, 5, 0, 3.2);
  front(-4.6, -0.4, 0, 0.7); front(0.2, 3.0, 0, 0.7); front(-4.6, -0.4, 2.7, 3.2); front(0.2, 3.0, 2.7, 3.2);
  front(3.4, 4.5, 2.4, 3.2);
  // window frames and mullions
  for (const [x0, x1] of [[-4.6, -0.4], [0.2, 3.0]]) {
    B.box(M.frame, x0, x1, 0.66, 0.72, 8.98, 9.12);
    B.box(M.frame, x0, x1, 2.68, 2.74, 8.98, 9.12);
    for (let i = 0; i <= 3; i++) {
      const x = x0 + (x1 - x0) * i / 3;
      B.box(M.frame, x - 0.03, x + 0.03, 0.7, 2.7, 8.98, 9.12);
    }
    B.box(M.frame, x0, x1, 2.05, 2.09, 8.98, 9.12);
  }
  B.box(M.frame, 3.4, 3.46, 0, 2.4, 8.98, 9.12); B.box(M.frame, 4.44, 4.5, 0, 2.4, 8.98, 9.12);
  B.box(M.frame, 3.4, 4.5, 2.34, 2.4, 8.98, 9.12); B.box(M.frame, 3.4, 4.5, 1.0, 1.06, 8.98, 9.12);
  B.box(M.frame, 3.4, 4.5, 0, 0.1, 8.98, 9.12);
  // banquette along the left wall
  B.rbox(M.leather, -4.72, 0.24, 4.7, 0.56, 0.46, 7.0, 0.05);
  B.rbox(M.leather, -4.92, 0.76, 4.7, 0.16, 0.62, 7.0, 0.05);
  B.box(M.walnutDark, -4.98, -4.42, 0, 0.06, 1.2, 8.2);

  // bar: walnut body, zinc top, footrail
  B.box(M.walnutDark, 2.92, 3.62, 0, 1.03, 1.4, 6.6, 1.2);
  B.rbox(M.zinc, 3.27, 1.06, 4.0, 0.86, 0.05, 5.32, 0.02);
  B.cyl(M.alu, 2.82, 0.2, 4.0, 0.025, 0.025, 5.1, 12, [Math.PI / 2, 0, 0]);
  // back bar: counter, shelves, bottles
  B.box(M.walnutDark, 4.4, 5, 0, 0.95, 1.2, 6.8, 1.2);
  B.box(M.zinc, 4.36, 5, 0.95, 0.98, 1.2, 6.8, 1);
  for (const y of [1.45, 1.85, 2.25]) B.box(M.walnut, 4.68, 5, y - 0.03, y, 1.4, 6.6, 1.2);
  // stools
  for (let i = 0; i < 5; i++) {
    const z = 2.0 + i * 1.05;
    B.cyl(M.black, 2.5, 0.74, z, 0.19, 0.19, 0.05, 20);
    B.cyl(M.black, 2.5, 0.37, z, 0.025, 0.04, 0.72, 10);
    B.cyl(M.black, 2.5, 0.015, z, 0.2, 0.2, 0.03, 20);
  }
  // register: a tablet on a stand; the receipt printer beside it
  B.rbox(M.printer, 3.3, 1.2, 2.95, 0.1, 0.24, 0.3, 0.01, 0);
  printer(B, M, 3.28, 1.085, 2.25);

  // tables: three columns, four rows
  const tables = [];
  for (const x of [-3.85, -1.9, 0.2]) for (const z of [1.9, 3.7, 5.5, 7.3]) tables.push([x, z]);
  for (const [x, z] of tables) {
    B.rbox(M.walnut, x, 0.74, z, 0.72, 0.04, 0.72, 0.01);
    B.cyl(M.black, x, 0.37, z, 0.035, 0.035, 0.72, 12);
    B.cyl(M.black, x, 0.02, z, 0.22, 0.24, 0.04, 20);
    // a carafe and two glasses catch the light
    B.cyl(M.plate, x + 0.12, 0.765, z - 0.1, 0.11, 0.11, 0.012, 24);
    B.cyl(M.plate, x - 0.12, 0.765, z + 0.1, 0.11, 0.11, 0.012, 24);
  }
  S.tables = tables;

  // ---- partition, kitchen side ------------------------------------------------
  const partK = (x0, x1, y0, y1) => B.box(M.subway, x0, x1, y0, y1, -0.08, 0, 0.6);
  partK(-5, -4.3, 0, 3.0); partK(-4.3, -3.3, 2.1, 3.0); partK(-3.3, -1.6, 0, 3.0);
  partK(-1.6, 1.6, 0, 1.05); partK(-1.6, 1.6, 2.15, 3.0); partK(1.6, 5, 0, 3.0);
  // the pass: a steel shelf through the wall, heat lamp bar above
  B.rbox(M.steel, 0, 1.08, 0, 3.3, 0.04, 0.8, 0.01);
  B.rbox(M.steel, 0, 1.95, -0.05, 3.0, 0.06, 0.16, 0.02);
  B.box(M.steel, -1.6, 1.6, 2.15, 2.19, -0.1, 0.1);
  // the kitchen door frame
  B.box(M.frame, -4.34, -4.3, 0, 2.1, -0.08, 0.08); B.box(M.frame, -3.3, -3.26, 0, 2.1, -0.08, 0.08);

  // ---- kitchen -----------------------------------------------------------
  B.box(M.quarry, -5, 5, -0.02, 0, -5, 0, 0.6);
  B.box(M.ceilingK, -5, 5, 3.0, 3.05, -5, 0, 3);
  B.box(M.subway, -5, 5, 0, 3.0, -5.1, -5, 0.6);
  // left wall with the high window
  const lw = (z0, z1, y0, y1) => B.box(M.subway, -5.1, -5, y0, y1, z0, z1, 0.6);
  lw(-5, -3.4, 0, 3.0); lw(-1.6, 0, 0, 3.0); lw(-3.4, -1.6, 0, 1.9); lw(-3.4, -1.6, 2.7, 3.0);
  B.box(M.frame, -5.1, -4.98, 1.88, 1.92, -3.4, -1.6);
  B.box(M.frame, -5.1, -4.98, 2.68, 2.72, -3.4, -1.6);
  for (const z of [-3.4, -2.8, -2.2, -1.6]) B.box(M.frame, -5.1, -4.98, 1.9, 2.7, z - 0.025, z + 0.025);
  // right wall with the staff door
  const rw = (z0, z1, y0, y1) => B.box(M.subway, 5, 5.1, y0, y1, z0, z1, 0.6);
  rw(-5, -1.5, 0, 3.0); rw(-0.4, 0, 0, 3.0); rw(-1.5, -0.4, 2.15, 3.0);
  B.box(M.frame, 4.96, 5.1, 0, 2.15, -1.54, -1.48); B.box(M.frame, 4.96, 5.1, 0, 2.15, -0.42, -0.36);
  // tall reach-in by the staff door
  B.rbox(M.steel, 4.6, 1.0, -2.6, 0.78, 2.0, 1.4, 0.02);
  B.box(M.black, 4.2, 4.21, 1.1, 1.9, -2.0, -1.97);

  // the line along the back wall
  // range: enamel body, steel front rail, iron grates
  B.rbox(M.enamel, -1.9, 0.45, -4.58, 1.8, 0.9, 0.76, 0.015);
  B.rbox(M.steel, -1.9, 0.82, -4.19, 1.8, 0.08, 0.04, 0.01);
  for (const dx of [-0.45, 0.45]) for (const dz of [-0.18, 0.18]) {
    B.rbox(M.iron, -1.9 + dx, 0.915, -4.58 + dz, 0.4, 0.03, 0.34, 0.005);
  }
  // flat-top
  B.rbox(M.steel, -0.3, 0.45, -4.58, 1.4, 0.9, 0.76, 0.015);
  B.rbox(M.iron, -0.3, 0.915, -4.6, 1.3, 0.03, 0.62, 0.005);
  // fryer
  B.rbox(M.steel, 0.85, 0.45, -4.58, 0.9, 0.9, 0.76, 0.015);
  B.box(M.iron, 0.5, 1.2, 0.9, 0.92, -4.85, -4.35);
  // lowboy for garnish
  B.rbox(M.steel, 2.45, 0.45, -4.58, 2.3, 0.9, 0.76, 0.015);
  for (let i = 0; i < 5; i++) B.rbox(M.cambro, 1.6 + i * 0.42, 0.93, -4.62, 0.32, 0.08, 0.26, 0.01);
  // overshelf with plates, and the ticket rail along its front
  B.box(M.steel, -2.8, 3.6, 1.52, 1.55, -5.0, -4.62);
  for (let i = 0; i < 6; i++) for (let k = 0; k < 6; k++) B.cyl(M.plate, -2.3 + i * 0.95, 1.565 + k * 0.022, -4.82, 0.13, 0.11, 0.02, 24);
  B.cyl(M.alu, 0.4, 1.5, -4.6, 0.012, 0.012, 6.4, 8, [0, 0, Math.PI / 2]);
  // hood
  B.box(M.steel, -3.0, 3.8, 2.2, 2.8, -5.0, -3.9);
  B.box(M.steel, -3.0, 3.8, 2.15, 2.2, -4.0, -3.9);
  // pans on the range
  for (const [dx, dz] of [[-0.45, 0.18], [0.45, 0.18], [-0.45, -0.18]]) {
    B.cyl(M.steel, -1.9 + dx, 0.965, -4.58 + dz, 0.15, 0.13, 0.06, 28);
    B.cyl(M.black, -1.9 + dx + 0.2, 0.985, -4.58 + dz + 0.06, 0.012, 0.012, 0.26, 8, [0, 0.3, Math.PI / 2 - 0.15]);
  }

  // prep table on the left wall with its board, and a wall shelf above
  B.rbox(M.steel, -4.58, 0.885, -2.35, 0.75, 0.04, 2.9, 0.01);
  B.box(M.steel, -4.94, -4.22, 0.25, 0.27, -3.75, -0.95);
  for (const z of [-3.75, -0.95]) for (const x of [-4.92, -4.24]) B.cyl(M.steel, x, 0.44, z, 0.02, 0.02, 0.88, 8);
  B.rbox(M.maple, -4.6, 0.92, -2.55, 0.42, 0.035, 0.58, 0.01);
  B.rbox(M.alu, -4.6, 0.912, -1.6, 0.46, 0.018, 0.66, 0.006); // full sheet tray
  B.box(M.steel, -5.0, -4.66, 1.54, 1.57, -3.7, -0.95);
  for (let i = 0; i < 4; i++) B.rbox(M.cambro, -4.82, 1.68, -3.45 + i * 0.36, 0.26, 0.22, 0.26, 0.015);
  // the kitchen printer on the shelf, facing the room
  printer(B, M, -4.66, 0.905, -1.0);
  // a knife on the board
  B.box(M.steel, -4.55, -4.53, 0.94, 0.945, -2.75, -2.53);
  B.box(M.black, -4.555, -4.525, 0.938, 0.955, -2.87, -2.75);

  // clock on the right kitchen wall
  B.cyl(M.black, 4.97, 2.3, -3.4, 0.2, 0.2, 0.05, 40, [0, 0, Math.PI / 2]);

  B.build(scene);

  // ---- things that move or change -------------------------------------------
  // the outside: painted backings behind the front windows and kitchen window
  const mkBack = (tex, w, h, pos, rotY) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false }));
    m.position.copy(pos); m.rotation.y = rotY;
    scene.add(m);
    return m;
  };
  S.streetNight = mkBack(T.street(false), 22, 11, new THREE.Vector3(0, 3.5, 15.5), Math.PI);
  S.streetDusk = mkBack(T.street(true), 22, 11, new THREE.Vector3(0, 3.5, 15.45), Math.PI);
  S.skyMorning = mkBack(T.sky(true), 5, 3, new THREE.Vector3(-6.6, 2.4, -2.5), Math.PI / 2);
  S.skyEvening = mkBack(T.sky(false), 5, 3, new THREE.Vector3(-6.62, 2.4, -2.5), Math.PI / 2);
  S.setBack = (street, sky) => {
    S.streetNight.material.color.setScalar(street); S.streetDusk.material.color.setScalar(street);
    S.skyMorning.material.color.setScalar(sky); S.skyEvening.material.color.setScalar(sky);
  };
  // pavement outside the front windows
  const pave = new THREE.Mesh(new THREE.PlaneGeometry(24, 7), new THREE.MeshStandardMaterial({ color: 0x2a2a2b, roughness: 0.9 }));
  pave.rotation.x = -Math.PI / 2; pave.position.set(0, -0.05, 12.5);
  scene.add(pave);
  // glass in front
  const glassGeo = [];
  for (const [x0, x1, y0, y1] of [[-4.6, -0.4, 0.7, 2.7], [0.2, 3.0, 0.7, 2.7], [3.46, 4.44, 0.1, 2.34]]) {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, 9.05);
    glassGeo.push(g);
  }
  const glass = new THREE.Mesh(mergeGeometries(glassGeo), M.glass);
  glass.renderOrder = 3;
  scene.add(glass);

  // chairs: one merged chair, instanced, in two arrangements (down, or up on the tables)
  const chairParts = [];
  const leg = (x, z, lean) => {
    const g = new THREE.CylinderGeometry(0.014, 0.012, 0.46, 8);
    g.rotateX(lean); g.translate(x, 0.23, z);
    chairParts.push(g);
  };
  const seat = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 24); seat.translate(0, 0.46, 0); chairParts.push(seat);
  leg(-0.15, -0.15, 0.06); leg(0.15, -0.15, 0.06); leg(-0.15, 0.15, -0.06); leg(0.15, 0.15, -0.06);
  const back = new THREE.TorusGeometry(0.19, 0.014, 8, 24, Math.PI); back.translate(0, 0.62, -0.17); chairParts.push(back);
  const sp1 = new THREE.CylinderGeometry(0.013, 0.013, 0.44, 8); sp1.translate(-0.17, 0.66, -0.18); chairParts.push(sp1);
  const sp2 = sp1.clone(); sp2.translate(0.34, 0, 0); chairParts.push(sp2);
  const chairGeo = mergeGeometries(chairParts.map(g => g.index ? g.toNonIndexed() : g).map(g => { for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); return g; }));
  const chairSpots = [];
  for (const t of tables) {
    const [x, z] = t;
    if (x < -3) chairSpots.push({ x: x + 0.62, z, rot: -Math.PI / 2, t });
    else {
      chairSpots.push({ x: x - 0.6, z, rot: Math.PI / 2, t });
      chairSpots.push({ x: x + 0.6, z, rot: -Math.PI / 2, t });
    }
  }
  S.chairSpots = chairSpots;
  const chairs = new THREE.InstancedMesh(chairGeo, M.chair, chairSpots.length);
  chairs.castShadow = true;
  scene.add(chairs);
  const dm = new THREE.Matrix4(), um = new THREE.Matrix4();
  S.setChairs = (up) => {
    chairSpots.forEach((c, i) => {
      if (!up) {
        dm.makeRotationY(c.rot).setPosition(c.x, 0, c.z);
        chairs.setMatrixAt(i, dm);
      } else {
        // seat down on the table top, legs up
        const k = i % 2 ? 1 : -1;
        um.makeRotationFromEuler(new THREE.Euler(Math.PI, c.rot + 0.15 * k, 0));
        um.setPosition(c.t[0] + k * 0.12, 0.76 + 0.49, c.t[1] + k * 0.05);
        chairs.setMatrixAt(i, um);
      }
    });
    chairs.instanceMatrix.needsUpdate = true;
  };
  S.setChairs(true);

  // bottles on the back bar
  const bottleGeo = new THREE.CylinderGeometry(0.04, 0.042, 0.3, 14);
  bottleGeo.translate(0, 0.15, 0);
  const bottleMat = new THREE.MeshStandardMaterial({ map: T.bottleLabel(0), roughness: 0.12, metalness: 0.1 });
  const bottles = new THREE.InstancedMesh(bottleGeo, bottleMat, 72);
  const bm = new THREE.Matrix4(), col = new THREE.Color();
  let bi = 0;
  const hues = [0xb07a3a, 0x5f8a5a, 0xd8c79a, 0x6a4a3a, 0xb05a3a, 0x8a9a8a, 0xffffff];
  for (const y of [0.98, 1.45, 1.85]) for (let k = 0; k < 24; k++) {
    const z = 1.5 + k * 0.215 + rr(-0.02, 0.02);
    const s = rr(0.8, 1.15);
    bm.makeScale(1, s, 1).setPosition(4.82 + rr(-0.04, 0.04), y, z);
    bottles.setMatrixAt(bi, bm);
    bottles.setColorAt(bi, col.setHex(hues[Math.floor(rand() * hues.length)]));
    bi++;
  }
  scene.add(bottles);

  // bulbs and shades: emissive objects whose brightness follows the light preset
  const bulbMat = (hex) => new THREE.MeshBasicMaterial({ color: hex, toneMapped: false });
  S.bulbs = {
    bar: bulbMat(0xffd9a6), din: bulbMat(0xffd9a6), hood: bulbMat(0xfff4e6), heat: bulbMat(0xff6a2a),
    ceil: bulbMat(0xeef3ff), status: bulbMat(0x55e08a), screen: new THREE.MeshBasicMaterial({ map: T.posScreen(), toneMapped: false }),
  };
  const bulbBase = {};
  for (const k in S.bulbs) bulbBase[k] = S.bulbs[k].color.clone();
  S.setBulb = (k, v) => S.bulbs[k].color.copy(bulbBase[k]).multiplyScalar(v);

  const shadeGeo = new THREE.LatheGeometry([
    new THREE.Vector2(0.03, 0.2), new THREE.Vector2(0.05, 0.17), new THREE.Vector2(0.14, 0.05), new THREE.Vector2(0.17, 0),
  ], 32);
  const bulbGeo = new THREE.SphereGeometry(0.045, 16, 12);
  const pend = (x, z, y, mat) => {
    const sh = new THREE.Mesh(shadeGeo, M.shade); sh.position.set(x, y, z); scene.add(sh);
    const b = new THREE.Mesh(bulbGeo, mat); b.position.set(x, y + 0.03, z); scene.add(b);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 3.2 - y - 0.2, 6), M.black);
    cord.position.set(x, (3.2 + y + 0.2) / 2, z); scene.add(cord);
    return sh;
  };
  S.barPendants = [2.6, 4.0, 5.4].map(z => pend(3.28, z, 2.25, S.bulbs.bar));
  for (const [x, z] of [[-1.9, 2.8], [0.2, 2.8], [-1.9, 6.4], [0.2, 6.4], [-3.85, 4.6]]) pend(x, z, 2.3, S.bulbs.din);
  // hood lights, heat lamps, kitchen ceiling tubes
  const strip = (w, d, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), mat);
    m.position.set(x, y, z); scene.add(m);
  };
  for (const x of [-2.2, -0.6, 1.0, 2.6]) strip(0.7, 0.12, x, 2.14, -4.4, S.bulbs.hood);
  strip(2.8, 0.06, 0, 1.915, -0.05, S.bulbs.heat);
  for (const z of [-1.2, -2.8]) strip(1.8, 0.12, 0.4, 2.99, z, S.bulbs.ceil);
  strip(0.004, 0.008, 3.347, 1.17, 2.3, S.bulbs.status); // printer status light
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.27), S.bulbs.screen);
  scr.position.set(3.355, 1.21, 2.95); scr.rotation.y = Math.PI / 2; scene.add(scr);

  // glow sprites for halation around light sources
  const glowTex = T.glow();
  S.glows = [];
  const glow = (x, y, z, size, hex, key) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: hex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.position.set(x, y, z); s.scale.set(size, size, 1);
    s.userData.key = key; s.userData.base = new THREE.Color(hex);
    scene.add(s);
    S.glows.push(s);
  };
  for (const z of [2.6, 4.0, 5.4]) glow(3.28, 2.2, z, 0.32, 0xffc98a, 'bar');
  for (const [x, z] of [[-1.9, 2.8], [0.2, 2.8], [-1.9, 6.4], [0.2, 6.4], [-3.85, 4.6]]) glow(x, 2.25, z, 0.3, 0xffc98a, 'din');
  for (const x of [-1.0, 0, 1.0]) glow(x, 1.9, -0.05, 0.28, 0xff7a3a, 'heat');
  for (const x of [-2.2, -0.6, 1.0, 2.6]) glow(x, 2.12, -4.3, 0.4, 0xfff0dc, 'hood');
  // pools of light on the surfaces under each lamp (a film-set trick: cheaper
  // than more lights, and they fall off the way practicals do)
  const poolGeo = new THREE.PlaneGeometry(1, 1);
  poolGeo.rotateX(-Math.PI / 2);
  const pool = (x, y, z, sx, sz, hex, key, k = 1) => {
    const m = new THREE.Mesh(poolGeo, new THREE.MeshBasicMaterial({ map: glowTex, color: hex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.position.set(x, y, z); m.scale.set(sx, 1, sz);
    m.userData.key = key; m.userData.base = new THREE.Color(hex).multiplyScalar(k);
    m.renderOrder = 1;
    scene.add(m);
    S.glows.push(m);
  };
  for (const z of [2.6, 4.0, 5.4]) pool(3.28, 1.089, z, 1.2, 1.4, 0x8a5a2a, 'bar');
  for (const [x, z] of [[-1.9, 2.8], [0.2, 2.8], [-1.9, 6.4], [0.2, 6.4], [-3.85, 4.6]]) pool(x, 0.004, z, 2.6, 2.6, 0x5a3818, 'din');
  for (const [x, z] of S.tables) pool(x, 0.763, z, 1.0, 1.0, 0x6a4420, 'din', 0.8);
  for (const x of [-2.2, -0.6, 1.0, 2.6]) pool(x, 0.935, -4.5, 1.3, 0.9, 0x8a8070, 'hood');
  for (const x of [-2.2, -0.6, 1.0, 2.6]) pool(x, 0.004, -3.6, 1.8, 1.8, 0x3a362f, 'hood');
  pool(0, 1.105, 0, 3.4, 0.9, 0x8a3a12, 'heat');
  S.setGlows = (k, v) => { for (const s of S.glows) if (s.userData.key === k) s.material.color.copy(s.userData.base).multiplyScalar(v); };

  // contact shadows where things meet the floor
  const blobTex = T.blob();
  const blobGeo = new THREE.PlaneGeometry(1, 1);
  blobGeo.rotateX(-Math.PI / 2);
  const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.75, color: 0x000000 });
  const blob = (x, y, z, sx, sz) => {
    const m = new THREE.Mesh(blobGeo, blobMat);
    m.position.set(x, y, z); m.scale.set(sx, 1, sz);
    scene.add(m);
  };
  for (const [x, z] of S.tables) blob(x, 0.003, z, 0.9, 0.9);
  for (let i = 0; i < 5; i++) blob(2.5, 0.003, 2.0 + i * 1.05, 0.6, 0.6);
  blob(3.25, 0.003, 4.0, 1.3, 5.8);
  blob(4.7, 0.003, 4.0, 1.0, 6.0);
  blob(-4.7, 0.003, 4.7, 1.0, 7.4);
  blob(0.4, 0.003, -4.4, 7.2, 1.3);
  blob(-4.55, 0.003, -2.35, 1.2, 3.4);
  blob(4.6, 0.003, -2.6, 1.2, 1.9);
  blob(-4.6, 0.93, -1.6, 0.6, 0.85);
  blob(-4.6, 0.94, -2.55, 0.55, 0.72);

  // flames under the pans
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x4a7dff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false });
  const flameGeo = new THREE.TorusGeometry(0.09, 0.012, 6, 24); flameGeo.rotateX(Math.PI / 2);
  S.flames = [[-0.45, 0.18], [0.45, 0.18], [-0.45, -0.18]].map(([dx, dz]) => {
    const f = new THREE.Mesh(flameGeo, flameMat.clone());
    f.position.set(-1.9 + dx, 0.935, -4.58 + dz);
    scene.add(f);
    return f;
  });

  // printers' paper
  S.barSlip = makeSlip(scene, T.slip('Monday', [['Steak frites', 23], ['Mussels', 28], ['Gnocchi', 15]]), new THREE.Vector3(3.318, 1.198, 2.25), 1);
  S.kitSlip = makeSlip(scene, T.slip('Prep', [['Steak frites', 26], ['Mussels', 31], ['Gnocchi', 18]], { big: true }), new THREE.Vector3(-4.622, 1.018, -1.0), 1);

  // steak portions on the sheet tray
  const steakGeo = new RoundedBoxGeometry(0.085, 0.02, 0.07, 2, 0.008);
  const steaks = new THREE.InstancedMesh(steakGeo, new THREE.MeshStandardMaterial({ map: T.beef(), roughness: 0.62, color: 0x9a7070 }), 30);
  const sm = new THREE.Matrix4();
  let si = 0;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) {
    const k = rr(0.85, 1.12);
    sm.makeRotationY(rr(-0.3, 0.3)).scale(new THREE.Vector3(k, rr(0.8, 1.2), rr(0.85, 1.1))).setPosition(-4.6 - 0.17 + c * 0.085 + rr(-0.005, 0.005), 0.932, -1.6 - 0.27 + r * 0.105 + rr(-0.005, 0.005));
    steaks.setMatrixAt(si++, sm);
  }
  steaks.count = 0;
  steaks.castShadow = false;
  steaks.frustumCulled = false;
  scene.add(steaks);
  S.steaks = steaks;

  // tickets on the rail
  S.tickets = [];
  for (let i = 0; i < 9; i++) {
    const t = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.15), new THREE.MeshBasicMaterial({ map: T.ticket(i), color: 0xd8d2c6, side: THREE.DoubleSide }));
    t.position.set(-2.25 + i * 0.36, 1.42, -4.58);
    t.rotation.z = rr(-0.05, 0.05);
    t.visible = false;
    scene.add(t);
    S.tickets.push(t);
  }

  // clock face and hands
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.18, 40), new THREE.MeshStandardMaterial({ map: T.clockFace(), roughness: 0.3 }));
  face.position.set(4.94, 2.3, -3.4); face.rotation.y = -Math.PI / 2;
  scene.add(face);
  const hand = (len, w) => {
    const g = new THREE.BoxGeometry(w, len, 0.004); g.translate(0, len / 2 - 0.02, 0);
    const m = new THREE.Mesh(g, M.black);
    m.position.set(4.93, 2.3, -3.4); m.rotation.y = -Math.PI / 2;
    const pivot = new THREE.Group(); pivot.position.set(4.93, 2.3, -3.4); pivot.rotation.y = -Math.PI / 2;
    m.position.set(0, 0, 0); m.rotation.set(0, 0, 0);
    pivot.add(m); scene.add(pivot);
    return m;
  };
  const hourH = hand(0.1, 0.014), minH = hand(0.15, 0.008);
  S.setClock = (hours) => {
    // hands turn clockwise as seen from the room
    minH.rotation.z = -(hours % 1) * Math.PI * 2;
    hourH.rotation.z = -((hours % 12) / 12) * Math.PI * 2;
  };
  S.setClock(4.5);

  return S;
}

// A thermal receipt printer facing +x: rounded body, a lighter lid over the
// paper roll, the slot at the front with its steel tear bar, a status light.
function printer(B, M, x, y, z) {
  B.rbox(M.printer, x, y + 0.055, z, 0.13, 0.11, 0.15, 0.018);
  B.rbox(M.printerLid, x - 0.012, y + 0.112, z, 0.1, 0.012, 0.142, 0.006);
  B.box(M.black, x + 0.036, x + 0.052, y + 0.108, y + 0.113, z - 0.046, z + 0.046);
  B.box(M.steel, x + 0.042, x + 0.05, y + 0.109, y + 0.118, z - 0.05, z + 0.05);
  B.box(M.black, x + 0.064, x + 0.066, y + 0.07, y + 0.08, z + 0.035, z + 0.05);
}

// Thermal paper leaving a printer: it rises out of the slot, text toward the
// room, and curls back over the printer as more comes out.
function makeSlip(scene, { texture }, slot, facing) {
  const SEG = 48, WIDTH = 0.08, LMAX = 0.11;
  const pos = new Float32Array((SEG + 1) * 2 * 3);
  const uv = new Float32Array((SEG + 1) * 2 * 2);
  const idx = [];
  for (let i = 0; i < SEG; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.75, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  scene.add(mesh);
  const set = (L) => {
    L = Math.max(0.0005, Math.min(LMAX, L));
    let x = 0, y = 0;
    for (let i = 0; i <= SEG; i++) {
      const s = (i / SEG) * L;
      // straight up for the first 11 cm, then curling back toward the wall
      const k = Math.max(0, s - 0.11) / 0.06;
      const th = Math.PI / 2 + Math.min(2.4, k * k * 0.9 + k * 0.5);
      if (i > 0) {
        const ds = L / SEG;
        x += Math.cos(th) * ds * facing;
        y += Math.sin(th) * ds;
      }
      for (let j = 0; j < 2; j++) {
        const o = (i * 2 + j) * 3;
        pos[o] = slot.x + x;
        pos[o + 1] = slot.y + y;
        pos[o + 2] = slot.z + (j === 0 ? WIDTH / 2 : -WIDTH / 2);
        const u = (i * 2 + j) * 2;
        uv[u] = j === 0 ? 0 : 1;
        uv[u + 1] = 1 - (L - s) / LMAX;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.uv.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    mesh.visible = L > 0.001;
  };
  set(0);
  return { mesh, set, LMAX };
}
