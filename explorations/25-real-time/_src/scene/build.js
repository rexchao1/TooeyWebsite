// The room: a small kitchen with a prep table under a window, a back door with
// apron hooks, a wall clock and a pass into a daylit dining room.
// Units are metres. Kitchen x -4..2, z -3..2.5. Dining room x 2..10, z -4..4.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as T from './textures.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function buildRoom(opts) {
  const lite = !!opts.lite;
  const root = new THREE.Group();
  const R = T.rng(42);

  // ---------- materials ----------
  const steelRough = T.steelRough();
  steelRough.repeat.set(2, 6);
  const steel = new THREE.MeshPhysicalMaterial({
    color: 0xc9ccce, metalness: 1, roughness: 0.42, roughnessMap: steelRough,
    anisotropy: 0.3, anisotropyRotation: 0,
  });
  const steelV = steel.clone(); steelV.anisotropyRotation = Math.PI / 2; steelV.roughness = 0.52;
  const steelDark = new THREE.MeshStandardMaterial({ color: 0x8e9195, metalness: 1, roughness: 0.45 });
  const alu = new THREE.MeshPhysicalMaterial({ color: 0xbfc2c4, metalness: 1, roughness: 0.42 });
  const tile = T.subwayTile();
  const tileMat = new THREE.MeshPhysicalMaterial({
    map: tile.map, normalMap: tile.normalMap, roughnessMap: tile.roughnessMap,
    roughness: 1, clearcoat: 0.5, clearcoatRoughness: 0.12, normalScale: new THREE.Vector2(0.9, 0.9),
  });
  const plasterMat = new THREE.MeshStandardMaterial({ map: T.plaster(), roughness: 0.92 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.95, emissive: 0x2b2a27 });
  const concreteMat = new THREE.MeshStandardMaterial({ map: T.concrete(), roughness: 0.55 });
  concreteMat.map.repeat.set(3, 3);
  const oakFloor = new THREE.MeshPhysicalMaterial({ map: T.wood([142, 104, 66], 31, 8), roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.35 });
  oakFloor.map.repeat.set(2, 2);
  const oak = new THREE.MeshPhysicalMaterial({ map: T.wood([158, 116, 74], 37), roughness: 0.48, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const maple = new THREE.MeshStandardMaterial({ map: T.wood([196, 160, 116], 41), roughness: 0.6 });
  const chairWood = new THREE.MeshStandardMaterial({ map: T.wood([92, 62, 40], 43), roughness: 0.5 });
  const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf2f1ec, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04 });
  const slateMat = new THREE.MeshStandardMaterial({ color: 0x232a2f, roughness: 0.6, metalness: 0.2 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.18,
    specularIntensity: 1, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide,
  });
  const poly = new THREE.MeshPhysicalMaterial({ // clear polycarbonate food box
    color: 0xf4f6f6, roughness: 0.05, transparent: true, opacity: 0.16,
    clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false, side: THREE.DoubleSide,
  });
  const polyLip = new THREE.MeshPhysicalMaterial({ color: 0xeef0ef, roughness: 0.15, transparent: true, opacity: 0.45, clearcoat: 1, depthWrite: false });
  const linenMap = T.linen();
  const linenMat = new THREE.MeshPhysicalMaterial({ map: linenMap, roughness: 0.92, sheen: 0.6, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xffffff), side: THREE.DoubleSide });
  const apronMat = new THREE.MeshPhysicalMaterial({ map: linenMap, color: 0x5d666d, roughness: 0.9, sheen: 0.5, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xc9d0d6), side: THREE.DoubleSide });
  const parchMat = new THREE.MeshStandardMaterial({ map: T.paper('#ece3d2'), normalMap: T.crinkle(19, 0.6), roughness: 0.85 });
  const filmMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.12, transparent: true, opacity: 0.34, normalMap: T.crinkle(29, 2.2),
    clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false, side: THREE.DoubleSide,
  });
  const pastaMat = new THREE.MeshStandardMaterial({ color: 0xe7cb86, roughness: 0.72 });
  const rigaMat = new THREE.MeshStandardMaterial({ color: 0xe0bf7c, roughness: 0.55, side: THREE.DoubleSide });
  const romaineMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, side: THREE.DoubleSide, sheen: 0.3, sheenColor: new THREE.Color(0xe8f0c8) });
  const chickpeaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
  const brineMat = new THREE.MeshPhysicalMaterial({ color: 0xf1ead8, roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false });
  const greyTub = new THREE.MeshStandardMaterial({ color: 0x6d6d6a, roughness: 0.6 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.9 });
  const skyMat = new THREE.MeshBasicMaterial({ map: T.skyGradient(), fog: false });
  const darkFrame = new THREE.MeshStandardMaterial({ color: 0x2c3034, roughness: 0.45, metalness: 0.6 });

  const M = { steel, alu, porcelain, glass, poly, linenMat, filmMat, skyMat, parchMat, metals: [steel, steelV, steelDark, alu, darkFrame] };

  const add = (mesh, parent = root, cast = true, receive = true) => {
    mesh.castShadow = cast; mesh.receiveShadow = receive; parent.add(mesh); return mesh;
  };
  const box = (w, h, d, mat, x, y, z, parent, cast = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    return add(m, parent, cast);
  };
  const rbox = (w, h, d, r, mat, x, y, z, parent) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
    m.position.set(x, y, z);
    return add(m, parent);
  };
  const cyl = (r, h, mat, x, y, z, parent, seg = 20) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    m.position.set(x, y, z);
    return add(m, parent);
  };

  // ---------- walls ----------
  // A wall is a set of rectangles around openings, with tile below 2.2 m in the kitchen.
  // axis 'x': plane at x=c, spans z (u) and y; axis 'z': plane at z=c, spans x (u) and y.
  function wall(axis, c, u0, u1, h, openings, facing, tileTo, parent = root) {
    const cuts = new Set([u0, u1]);
    openings.forEach(o => { cuts.add(o.u0); cuts.add(o.u1); });
    const us = [...cuts].sort((a, b) => a - b);
    for (let i = 0; i < us.length - 1; i++) {
      const a = us[i], b = us[i + 1];
      const ys = new Set([0, h]);
      if (tileTo) ys.add(tileTo);
      const holes = openings.filter(o => o.u0 <= a && o.u1 >= b);
      holes.forEach(o => { ys.add(o.y0); ys.add(o.y1); });
      const yl = [...ys].sort((p, q) => p - q);
      for (let j = 0; j < yl.length - 1; j++) {
        const y0 = yl[j], y1 = yl[j + 1];
        if (holes.some(o => y0 >= o.y0 && y1 <= o.y1)) continue;
        const mat = tileTo && y1 <= tileTo + 1e-6 ? tileMat : plasterMat;
        const g = new THREE.PlaneGeometry(b - a, y1 - y0);
        // UVs in world metres (tile repeat is 0.6 m)
        const uv = g.attributes.uv, pos = g.attributes.position;
        for (let k = 0; k < uv.count; k++) {
          const uu = (a + b) / 2 + pos.getX(k), yy = (y0 + y1) / 2 + pos.getY(k);
          uv.setXY(k, (facing > 0 ? uu : -uu) / 0.6, yy / 0.6);
        }
        const m = new THREE.Mesh(g, mat);
        if (axis === 'x') {
          m.rotation.y = facing > 0 ? Math.PI / 2 : -Math.PI / 2;
          m.position.set(c, (y0 + y1) / 2, (a + b) / 2);
          if (facing < 0) { for (let k = 0; k < uv.count; k++) uv.setX(k, -uv.getX(k)); }
        } else {
          m.rotation.y = facing > 0 ? 0 : Math.PI;
          m.position.set((a + b) / 2, (y0 + y1) / 2, c);
        }
        add(m, parent, true, true);
      }
    }
  }

  const kitchen = new THREE.Group(); root.add(kitchen);
  const dining = new THREE.Group(); root.add(dining);

  // kitchen floor and ceiling
  const kf = new THREE.Mesh(new THREE.PlaneGeometry(6, 5.5), concreteMat);
  kf.rotation.x = -Math.PI / 2; kf.position.set(-1, 0, -0.25); add(kf, kitchen, false, true);
  const kc = new THREE.Mesh(new THREE.PlaneGeometry(6, 5.5), ceilingMat);
  kc.rotation.x = Math.PI / 2; kc.position.set(-1, 3, -0.25); add(kc, kitchen, false, true);

  const WIN = { u0: -2.7, u1: 0.3, y0: 1.05, y1: 2.65 };
  const PASS = { u0: -1.0, u1: 0.8, y0: 1.0, y1: 1.95 };
  const DOOR = { u0: 0.85, u1: 1.8, y0: 0, y1: 2.1 };
  wall('x', -4, -3, 2.5, 3, [WIN], +1, 2.2, kitchen);          // window wall
  wall('z', -3, -4, 2, 3, [DOOR], +1, 2.2, kitchen);           // back wall
  wall('x', 2, -3, 2.5, 3, [PASS], -1, 2.2, kitchen);          // pass wall, kitchen side
  wall('z', 2.5, -4, 2, 3, [], -1, 2.2, kitchen);              // front wall

  // window: reveal, sill, steel frame and mullions, sky beyond
  const wz = (WIN.u0 + WIN.u1) / 2, wl = WIN.u1 - WIN.u0, wh = WIN.y1 - WIN.y0, wy = (WIN.y0 + WIN.y1) / 2;
  box(0.22, 0.03, wl + 0.04, steel, -4.07, WIN.y0 - 0.015, wz, kitchen);
  box(0.2, 0.02, wl, plasterMat, -4.1, WIN.y1 + 0.01, wz, kitchen);
  box(0.2, wh, 0.02, plasterMat, -4.1, wy, WIN.u0 - 0.01, kitchen);
  box(0.2, wh, 0.02, plasterMat, -4.1, wy, WIN.u1 + 0.01, kitchen);
  for (let i = 0; i <= 3; i++) box(0.05, wh, 0.045, darkFrame, -4.12, wy, WIN.u0 + (wl * i) / 3, kitchen);
  box(0.05, 0.045, wl, darkFrame, -4.12, WIN.y0 + wh * 0.62, wz, kitchen);
  box(0.05, 0.05, wl, darkFrame, -4.12, WIN.y0 + 0.02, wz, kitchen);
  box(0.05, 0.05, wl, darkFrame, -4.12, WIN.y1 - 0.02, wz, kitchen);
  const sky1 = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), skyMat);
  sky1.rotation.y = Math.PI / 2; sky1.position.set(-14, 3, -1); kitchen.add(sky1);

  // back door, steel, with a push bar and a kick plate
  const dx = (DOOR.u0 + DOOR.u1) / 2, dw = DOOR.u1 - DOOR.u0;
  box(dw, 2.1, 0.04, new THREE.MeshStandardMaterial({ color: 0xd9d5cd, roughness: 0.38 }), dx, 1.05, -3.04, kitchen);
  box(dw - 0.16, 0.04, 0.05, steel, dx, 1.0, -2.98, kitchen);
  box(dw, 0.3, 0.012, steelV, dx, 0.15, -3.015, kitchen);
  box(0.05, 2.15, 0.08, darkFrame, DOOR.u0 - 0.025, 1.075, -2.99, kitchen);
  box(0.05, 2.15, 0.08, darkFrame, DOOR.u1 + 0.025, 1.075, -2.99, kitchen);
  box(dw + 0.1, 0.05, 0.08, darkFrame, dx, 2.125, -2.99, kitchen);

  // ceiling light fixtures (two long lensed boxes)
  const lens = new THREE.MeshStandardMaterial({ color: 0xf2f1ec, emissive: 0xfff4e4, emissiveIntensity: 0, roughness: 0.6 });
  M.lens = lens;
  [[-2.1, -1.7], [0.3, -0.6]].forEach(([x, z]) => {
    box(1.25, 0.06, 0.32, steelDark, x, 2.97, z, kitchen, false);
    box(1.2, 0.01, 0.27, lens, x, 2.935, z, kitchen, false);
  });

  // ---------- prep table under the window ----------
  const T0 = { x0: -3.75, x1: -0.35, z0: -2.98, z1: -2.22, y: 0.9 };
  const tw = T0.x1 - T0.x0, tcx = (T0.x0 + T0.x1) / 2, tcz = (T0.z0 + T0.z1) / 2, td = T0.z1 - T0.z0;
  box(tw, 0.035, td, steel, tcx, T0.y - 0.0175, tcz, kitchen);
  const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, tw, 16), steel);
  edge.rotation.z = Math.PI / 2; edge.position.set(tcx, T0.y - 0.012, T0.z1); add(edge, kitchen);
  box(tw, 0.12, 0.012, steelV, tcx, T0.y + 0.06, T0.z0 + 0.006, kitchen);
  box(tw - 0.06, 0.02, td - 0.08, steel, tcx, 0.24, tcz, kitchen);
  [T0.x0 + 0.05, tcx, T0.x1 - 0.05].forEach(x => [T0.z0 + 0.06, T0.z1 - 0.06].forEach(z => {
    cyl(0.02, T0.y - 0.03, steelV, x, (T0.y - 0.03) / 2, z, kitchen, 14);
    cyl(0.026, 0.03, rubber, x, 0.015, z, kitchen, 14);
  }));
  // undershelf: stacked sheet trays and a grey bus tub
  for (let i = 0; i < 6; i++) box(0.66, 0.012, 0.46, alu, -2.9, 0.26 + i * 0.016, -2.6, kitchen);
  rbox(0.52, 0.18, 0.38, 0.02, greyTub, -1.4, 0.34, -2.6, kitchen);

  // wall shelf with plates, pans and spare boxes
  const S = { y: 1.94, z: -2.83 };
  box(3.1, 0.025, 0.34, steel, -2.05, S.y, S.z, kitchen);
  box(3.1, 0.03, 0.012, steel, -2.05, S.y + 0.02, S.z + 0.17, kitchen);
  [-3.45, -2.05, -0.65].forEach(x => box(0.02, 0.24, 0.3, steelV, x, S.y - 0.13, S.z, kitchen));
  const plateG = plateGeometry(0.27);
  [-3.3, -3.0].forEach((x, si) => {
    for (let i = 0; i < 9 + si * 3; i++) {
      const p = new THREE.Mesh(plateG, porcelain); p.position.set(x, S.y + 0.0125 + i * 0.018, S.z); add(p, kitchen);
    }
  });
  const bowlG = bowlGeometry(0.17);
  for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(bowlG, porcelain); b.position.set(-2.7, S.y + 0.0125 + i * 0.03, S.z); add(b, kitchen); }
  for (let i = 0; i < 5; i++) box(0.32, 0.065, 0.26, steel, -2.15, S.y + 0.045 + i * 0.022, S.z, kitchen);
  for (let i = 0; i < 2; i++) {
    const c = foodBox(0.19, 0.2); c.position.set(-1.5 + i * 0.24, S.y + 0.013, S.z); kitchen.add(c);
  }
  for (let i = 0; i < 7; i++) { const p = new THREE.Mesh(plateG, porcelain); p.position.set(-0.95, S.y + 0.0125 + i * 0.018, S.z); add(p, kitchen); }

  // cutting board and knife, right end of the table
  const boardGroup = new THREE.Group();
  rbox(0.5, 0.03, 0.32, 0.006, maple, -2.05, T0.y + 0.015, -2.56, boardGroup);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.002, 0.045), steel);
  blade.position.set(-2.08, T0.y + 0.032, -2.53); blade.rotation.y = 0.35; add(blade, boardGroup);
  const handle = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.018, 0.024, 2, 0.008), slateMat);
  handle.position.set(-1.9, T0.y + 0.04, -2.595); handle.rotation.y = 0.35; add(handle, boardGroup);

  // ---------- hero: three labelled food boxes and a tray of tagliatelle ----------
  const hero = new THREE.Group(); kitchen.add(hero); hero.add(boardGroup);
  const labels = [];
  const nestGeos = [nestGeometry(1, lite), nestGeometry(2, lite)];
  const boxes = [
    { name: 'Rigatoni', n: 34, x: -3.42, h: 0.2, fill: 'rigatoni' },
    { name: 'Falafel', n: 30, x: -3.16, h: 0.2, fill: 'chickpeas' },
    { name: 'Caesar', n: 22, x: -2.9, h: 0.25, fill: 'romaine' },
    { name: 'Tagliatelle', n: 26, x: -2.64, h: 0.2, fill: 'nests' },
  ];
  boxes.forEach((b, i) => {
    const g = foodBox(0.21, b.h);
    g.position.set(b.x, T0.y, -2.62);
    g.rotation.y = (R() - 0.5) * 0.05;
    hero.add(g);
    fillBox(g, b.fill, 0.21, b.h, 100 + i);
    const lb = labelMesh(b.name, b.n, 0.15, 0.094);
    lb.position.set(0, Math.min(b.h * 0.5, 0.1), 0.1075);
    g.add(lb);
    labels.push(lb);
  });


  const trayHero = sheetTray(26, 'Tagliatelle', 26);
  trayHero.group.position.set(-1.2, T0.y, -2.6);
  trayHero.group.rotation.y = 0.02;
  kitchen.add(trayHero.group);
  labels.push(trayHero.label);

  // ---------- accuracy: two trays at close ----------
  const acc = new THREE.Group(); kitchen.add(acc); acc.visible = false;
  const trayGuess = sheetTray(40, 'Guess', 40);
  trayGuess.group.position.set(-2.95, T0.y, -2.6); trayGuess.group.rotation.y = -0.015;
  const trayTooey = sheetTray(26, 'Tooey', 26);
  trayTooey.group.position.set(-2.18, T0.y, -2.6); trayTooey.group.rotation.y = 0.012;
  acc.add(trayGuess.group, trayTooey.group);
  // cling film over the guessed tray, drawn from the back edge forward
  const film = new THREE.Mesh(filmGeometry(0.68, 0.48), filmMat);
  film.position.set(0, 0.05, -0.24); film.renderOrder = 5;
  const filmPivot = new THREE.Group(); filmPivot.add(film); trayGuess.group.add(filmPivot);
  filmPivot.position.set(0, 0, 0);

  // ---------- back door corner: apron hooks and the clock ----------
  const hookRail = box(0.02, 0.05, 1.45, oak, 1.985, 1.72, -2.2, kitchen);
  const aprons = [];
  const apronG = apronGeometry(lite);
  for (let i = 0; i < 6; i++) {
    const z = -2.78 + i * 0.235;
    const hk = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.07, 10), steel);
    hk.rotation.z = Math.PI / 2 - 0.35; hk.position.set(1.95, 1.73, z); add(hk, kitchen);
    const ap = new THREE.Mesh(apronG, apronMat.clone());
    ap.material.transparent = true;
    ap.position.set(1.955 - (i % 2) * 0.022, 1.74, z);
    ap.rotation.y = -Math.PI / 2 + (R() - 0.5) * 0.25;
    ap.userData.home = ap.position.clone();
    add(ap, kitchen);
    aprons.push(ap);
  }
  const clock = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.172, 0.016, 12, 64), steel); rim.position.z = 0.004;
  clock.add(rim);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.168, 64), new THREE.MeshStandardMaterial({ map: T.clockFace(), roughness: 0.5 }));
  face.position.z = 0.0; clock.add(face);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 48), slateMat);
  back.rotation.x = Math.PI / 2; back.position.z = -0.018; clock.add(back);
  const hourHand = new THREE.Group(), minHand = new THREE.Group();
  const hh = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.09, 0.003), slateMat); hh.position.y = 0.035; hourHand.add(hh);
  const mh = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.14, 0.003), slateMat); mh.position.y = 0.055; minHand.add(mh);
  hourHand.position.z = 0.003; minHand.position.z = 0.006;
  clock.add(hourHand, minHand);
  const glassFace = new THREE.Mesh(new THREE.CircleGeometry(0.168, 48), glass); glassFace.position.z = 0.01; clock.add(glassFace);
  clock.position.set(1.97, 2.42, -2.2); clock.rotation.y = -Math.PI / 2;
  clock.traverse(o => { if (o.isMesh) o.castShadow = true; });
  kitchen.add(clock);

  // the pass: a steel shelf through the wall with a heat strip above
  box(0.7, 0.03, 1.8, steel, 2.0, 1.0, -0.1, root);
  box(0.24, 0.07, 1.6, steelDark, 1.9, 1.9, -0.1, kitchen);
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(plateG, porcelain); p.position.set(1.85, 1.015 + i * 0.018, 0.45); add(p, kitchen); }
  box(0.15, 0.02, PASS.u1 - PASS.u0, plasterMat, 2.0, PASS.y1 + 0.01, (PASS.u0 + PASS.u1) / 2, root);

  // ---------- dining room ----------
  const df = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), oakFloor);
  df.rotation.x = -Math.PI / 2; df.position.set(6, 0, 0); add(df, dining, false, true);
  const dc = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), ceilingMat);
  dc.rotation.x = Math.PI / 2; dc.position.set(6, 3.2, 0); add(dc, dining, false, true);
  wall('x', 2.0, -4, 4, 3.2, [PASS], +1, 0, dining);
  wall('z', -4, 2, 10, 3.2, [], +1, 0, dining);
  wall('z', 4, 2, 10, 3.2, [], -1, 0, dining);
  // wainscot
  box(8, 1.0, 0.02, oak, 6, 0.5, -3.99, dining);
  box(8, 1.0, 0.02, oak, 6, 0.5, 3.99, dining);
  box(8, 0.03, 0.04, oak, 6, 1.01, -3.98, dining);
  box(8, 0.03, 0.04, oak, 6, 1.01, 3.98, dining);
  // storefront at x=10: sill, glazing bars, sky and a pale street beyond
  box(0.25, 0.45, 8, plasterMat, 10.0, 0.225, 0, dining);
  box(0.25, 0.3, 8, plasterMat, 10.0, 3.05, 0, dining);
  for (let i = 0; i <= 5; i++) box(0.08, 2.45, 0.06, darkFrame, 10.0, 1.675, -4 + i * 1.6, dining);
  box(0.08, 0.06, 8, darkFrame, 10.0, 0.45, 0, dining);
  box(0.08, 0.06, 8, darkFrame, 10.0, 2.25, 0, dining);
  const sky2 = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), skyMat);
  sky2.rotation.y = -Math.PI / 2; sky2.position.set(24, 4, 0); dining.add(sky2);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(14, 30), new THREE.MeshStandardMaterial({ color: 0xa9a59d, roughness: 0.9 }));
  street.rotation.x = -Math.PI / 2; street.position.set(17, -0.05, 0); add(street, dining, false, true);

  const TX = [3.6, 5.2, 6.8, 8.4], TZ = [-2.5, 0, 2.5];
  const tables = [];
  const chairG = chairGeometry();
  const glassG = glassGeometry();
  const plate2 = plateGeometry(0.26);
  const fork = new THREE.BoxGeometry(0.018, 0.004, 0.19);
  TZ.forEach((z, zi) => TX.forEach((x, xi) => {
    const t = new THREE.Group(); t.position.set(x + (R() - 0.5) * 0.06, 0, z + (R() - 0.5) * 0.06); dining.add(t);
    const top = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.035, 0.72, 2, 0.008), oak); top.position.y = 0.745; add(top, t);
    cyl(0.03, 0.72, steelDark, 0, 0.37, 0, t, 12);
    const foot = cyl(0.25, 0.015, steelDark, 0, 0.008, 0, t, 32);
    const set = new THREE.Group(); t.add(set);
    const chairs = [];
    [-1, 1].forEach(side => {
      const ch = new THREE.Mesh(chairG, chairWood); ch.castShadow = ch.receiveShadow = true;
      t.add(ch);
      chairs.push({ mesh: ch, side });
      const p = new THREE.Mesh(plate2, porcelain); p.position.set(0, 0.765, side * 0.2); add(p, set);
      const nap = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.008, 0.2), linenMat); nap.position.set(-0.2, 0.767, side * 0.2); add(nap, set);
      const f = new THREE.Mesh(fork, steel); f.position.set(-0.2, 0.773, side * 0.2); add(f, set);
      const k = new THREE.Mesh(fork, steel); k.position.set(0.19, 0.765, side * 0.2); add(k, set);
      const g = new THREE.Mesh(glassG, glass); g.position.set(0.2, 0.763, side * 0.07); g.renderOrder = 4; set.add(g);
    });
    tables.push({ group: t, set, chairs, open: !(xi === 3 && zi !== 1) && !(xi === 0 && zi === 0) });
  }));
  // a host stand by the kitchen wall and a service station for realism
  rbox(0.5, 1.05, 0.4, 0.01, oak, 2.4, 0.525, 3.4, dining);

  // ---------- helpers that build objects ----------
  function labelMesh(name, n, w, h) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: T.label(name, n), roughness: 0.8, transparent: true }));
    m.castShadow = false; m.receiveShadow = true;
    m.userData.home = { z: 0 };
    return m;
  }

  function foodBox(s, h) {
    const g = new THREE.Group();
    const r = 0.028, t = 0.003;
    const shape = roundedRect(s, s, r);
    const hole = roundedRect(s - 2 * t, s - 2 * t, r - t);
    shape.holes.push(hole);
    const walls = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 6 });
    walls.rotateX(-Math.PI / 2);
    const wm = new THREE.Mesh(walls, poly); wm.renderOrder = 3; g.add(wm);
    const base = new THREE.ShapeGeometry(roundedRect(s, s, r), 6); base.rotateX(-Math.PI / 2);
    const bm = new THREE.Mesh(base, poly); bm.position.y = 0.002; g.add(bm);
    // the thick rolled lip of a polycarbonate food box
    const lipShape = roundedRect(s + 0.008, s + 0.008, r + 0.004);
    lipShape.holes.push(roundedRect(s - 2 * t, s - 2 * t, r - t));
    const lip = new THREE.ExtrudeGeometry(lipShape, { depth: 0.006, bevelEnabled: false, curveSegments: 6 });
    lip.rotateX(-Math.PI / 2);
    const lm = new THREE.Mesh(lip, polyLip); lm.position.y = h - 0.006; lm.renderOrder = 3; g.add(lm);
    return g;
  }

  function fillBox(g, kind, s, h, seed) {
    const r = T.rng(seed);
    const inner = s - 0.05; // keep pieces clear of the walls
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const spot = (fill, pad = 0) => V((r() - 0.5) * (inner - pad), 0.012 + Math.pow(r(), 0.6) * h * fill, (r() - 0.5) * (inner - pad));
    if (kind === 'rigatoni') {
      const geo = rigatoniGeometry();
      const n = lite ? 150 : 300;
      const im = new THREE.InstancedMesh(geo, rigaMat, n);
      for (let i = 0; i < n; i++) {
        e.set(r() * Math.PI, r() * Math.PI, r() * Math.PI); q.setFromEuler(e);
        m.compose(spot(0.7), q, V(1, 1, 1)); im.setMatrixAt(i, m);
      }
      im.castShadow = true; g.add(im);
    } else if (kind === 'chickpeas') {
      const geo = new THREE.SphereGeometry(0.0055, 10, 8);
      geo.scale(1, 0.92, 0.95);
      const n = lite ? 900 : 1800;
      const im = new THREE.InstancedMesh(geo, chickpeaMat, n);
      const col = new THREE.Color();
      for (let i = 0; i < n; i++) {
        e.set(r() * 3, r() * 3, r() * 3); q.setFromEuler(e);
        const sc = 0.85 + r() * 0.3;
        const p = V((r() - 0.5) * (s - 0.02), 0.008 + r() * h * 0.62, (r() - 0.5) * (s - 0.02));
        m.compose(p, q, V(sc, sc, sc)); im.setMatrixAt(i, m);
        im.setColorAt(i, col.setHSL(0.11 + r() * 0.02, 0.45 + r() * 0.15, 0.62 + r() * 0.1));
      }
      im.castShadow = true; g.add(im);
      const water = new THREE.Mesh(new THREE.BoxGeometry(s - 0.008, h * 0.7, s - 0.008), brineMat);
      water.position.y = h * 0.35 + 0.003; water.renderOrder = 2; g.add(water);
    } else if (kind === 'romaine') {
      const geo = leafGeometry();
      const n = lite ? 110 : 220;
      const im = new THREE.InstancedMesh(geo, romaineMat, n);
      const tint = new THREE.Color();
      for (let i = 0; i < n; i++) {
        e.set(r() * Math.PI, r() * Math.PI, r() * Math.PI); q.setFromEuler(e);
        const sc = 0.6 + r() * 0.5;
        m.compose(spot(0.8), q, V(sc, sc, sc)); im.setMatrixAt(i, m);
        const k = 0.8 + r() * 0.35; im.setColorAt(i, tint.setRGB(k, k, k * (0.9 + r() * 0.1)));
      }
      im.castShadow = true; g.add(im);
    } else if (kind === 'nests') {
      for (let i = 0; i < 12; i++) {
        const nm = new THREE.Mesh(nestGeos[i % 2], pastaMat);
        nm.position.set(((i % 2) - 0.5) * 0.085 + (r() - 0.5) * 0.01, 0.004 + Math.floor(i / 4) * 0.028, (((i >> 1) % 2) - 0.5) * 0.085);
        nm.rotation.y = r() * 6;
        nm.castShadow = true; g.add(nm);
      }
    }
  }

  function sheetTray(slots, name, n) {
    // full sheet tray, 0.66 x 0.46, nests on parchment in rows of eight
    const group = new THREE.Group();
    const W = 0.66, D = 0.46, H = 0.025;
    box(W, 0.0015, D, alu, 0, 0.001, 0, group);
    [[W, D / 2], [W, -D / 2]].forEach(([w, z]) => {
      const m = box(w, H, 0.0015, alu, 0, H / 2, z, group);
      const rr = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, w, 10), alu);
      rr.rotation.z = Math.PI / 2; rr.position.set(0, H, z); add(rr, group);
    });
    [[-W / 2], [W / 2]].forEach(([x]) => {
      box(0.0015, H, D, alu, x, H / 2, 0, group);
      const rr = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, D, 10), alu);
      rr.rotation.x = Math.PI / 2; rr.position.set(x, H, 0); add(rr, group);
    });
    const parch = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.02, D - 0.02), parchMat);
    parch.rotation.x = -Math.PI / 2; parch.position.y = 0.003; add(parch, group, false, true);
    // slots: 8 columns x 5 rows at 0.077 m, from the back left
    const pos = [];
    for (let row = 0; row < 5; row++) for (let col = 0; col < 8; col++) {
      pos.push(V(-0.27 + col * 0.077, 0.004, -0.185 + row * 0.072));
    }
    // order for 26: a 6 x 4 block, then two set apart in the last column
    let order;
    if (slots === 26) {
      order = [];
      for (let row = 0; row < 4; row++) for (let col = 0; col < 6; col++) order.push(row * 8 + col);
      order.push(0 * 8 + 7, 1 * 8 + 7);
    } else {
      order = [];
      for (let row = 0; row < 4; row++) for (let col = 0; col < 6; col++) order.push(row * 8 + col);
      for (let row = 0; row < 4; row++) for (let col = 6; col < 8; col++) order.push(row * 8 + col);
      for (let col = 0; col < 8; col++) order.push(4 * 8 + col);
    }
    const rr = T.rng(slots * 13 + name.length);
    const nests = order.map((idx, i) => {
      const m = new THREE.Mesh(nestGeos[i % 2], pastaMat);
      m.position.copy(pos[idx]);
      m.position.x += (rr() - 0.5) * 0.008; m.position.z += (rr() - 0.5) * 0.008;
      m.rotation.y = rr() * Math.PI * 2;
      m.castShadow = true; m.receiveShadow = true;
      group.add(m);
      m.userData.home = m.position.clone();
      return m;
    });
    // label on the parchment: front strip for 26 trays, front-left corner otherwise
    const lb = labelMesh(name, n, 0.12, 0.075);
    lb.rotation.x = -Math.PI / 2;
    if (slots === 26) { lb.position.set(0.215, 0.006, 0.155); lb.rotation.z = 0.04; }
    else { lb.position.set(-0.225, 0.006, 0.172); lb.scale.set(0.85, 0.85, 1); lb.rotation.z = -0.03; }
    group.add(lb);
    return { group, nests, label: lb };
  }

  return {
    root, kitchen, dining, hero, acc, labels, trayHero, trayGuess, trayTooey, film, filmPivot,
    aprons, hourHand, minHand, tables, M, lens,
  };
}

// ---------- geometry helpers ----------
function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function plateGeometry(d) {
  const r = d / 2;
  const pts = [
    [0, 0], [r * 0.55, 0], [r * 0.6, 0.004], [r * 0.62, 0.008], [r * 0.82, 0.012], [r * 0.97, 0.017],
    [r, 0.019], [r * 0.985, 0.0205], [r * 0.95, 0.018], [r * 0.8, 0.0135], [r * 0.62, 0.0115], [0, 0.0105],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 48);
}

function bowlGeometry(d) {
  const r = d / 2, pts = [];
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI / 2; pts.push(new THREE.Vector2(r * 0.45 + Math.sin(a) * r * 0.55, (1 - Math.cos(a)) * 0.06)); }
  pts.unshift(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(r * 0.97, 0.062));
  for (let i = 10; i >= 0; i--) { const a = (i / 10) * Math.PI / 2; pts.push(new THREE.Vector2(r * 0.42 + Math.sin(a) * r * 0.53, 0.006 + (1 - Math.cos(a)) * 0.055)); }
  pts.push(new THREE.Vector2(0, 0.006));
  return new THREE.LatheGeometry(pts, 40);
}

function glassGeometry() {
  const pts = [[0, 0], [0.032, 0], [0.034, 0.003], [0.037, 0.1], [0.035, 0.1], [0.032, 0.006], [0, 0.006]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 32);
}

// A loose nest of egg tagliatelle: a few flat ribbons coiled round a ring.
function nestGeometry(seed, lite) {
  const r = (() => { let s = seed * 9973; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const geos = [];
  const strands = lite ? 6 : 10;
  for (let k = 0; k < strands; k++) {
    const ph = r() * Math.PI * 2, turns = 1.4 + r() * 1.0, wob = 2 + Math.floor(r() * 3), lift = r();
    const rb = 0.008 + r() * 0.016, ra = 0.004 + r() * 0.007;
    const pts = [];
    const steps = lite ? 40 : 64;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, a = ph + t * turns * Math.PI * 2;
      const rad = rb + ra * Math.sin(a * wob + ph) + 0.003 * r();
      const y = 0.006 + 0.012 * (0.5 + 0.5 * Math.sin(a * 1.5 + ph)) * (0.6 + lift * 0.4) + t * 0.006;
      pts.push(new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curve, steps * 2, 0.0028, 4, false);
    geos.push(g);
  }
  return mergeGeos(geos);
}

function mergeGeos(geos) {
  const norm = geos.map(g => { const n = g.index ? g.toNonIndexed() : g; n.deleteAttribute('uv'); return n; });
  return mergeGeometries(norm, false);
}

// A bib apron hung on a hook by its neck loop: narrow at the top, falling in folds.
function apronGeometry(lite) {
  const W = 0.56, H = 0.86, sx = lite ? 14 : 24, sy = lite ? 20 : 34;
  const g = new THREE.PlaneGeometry(W, H, sx, sy);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const v = (H / 2 - y) / H;            // 0 at the hook, 1 at the hem
    const width = 0.22 + 0.78 * Math.min(1, v * 1.8);
    const fold = Math.sin((x / W) * Math.PI * 7 + v * 1.5) * 0.012 * (0.4 + v);
    const belly = Math.cos((x / W) * Math.PI) * 0.03 * v;
    p.setXYZ(i, x * width, -v * H, fold + belly + 0.02 * v);
  }
  g.computeVertexNormals();
  g.deleteAttribute('uv');
  const parts = [g.toNonIndexed()];
  // neck loop over the hook and two waist ties hanging down
  const loop = new THREE.TorusGeometry(0.06, 0.006, 6, 20, Math.PI);
  loop.translate(0, 0.0, 0.0); loop.deleteAttribute('uv'); parts.push(loop.toNonIndexed());
  [-1, 1].forEach(side => {
    const tie = new THREE.PlaneGeometry(0.025, 0.42, 1, 8);
    const tp = tie.attributes.position;
    for (let i = 0; i < tp.count; i++) { const y = tp.getY(i); tp.setZ(i, 0.03 + Math.sin(y * 9 + side) * 0.012); tp.setX(i, tp.getX(i) + side * (0.27 + (0.21 - y) * 0.05)); }
    tie.translate(0, -0.52, 0);
    tie.computeVertexNormals(); tie.deleteAttribute('uv');
    parts.push(tie.toNonIndexed());
  });
  return mergeGeometries(parts, false);
}

// Bistro chair, origin at the floor under the seat centre, facing +z.
function chairGeometry() {
  const parts = [];
  const add = (g, x, y, z, rx = 0) => { g.rotateX(rx); g.translate(x, y, z); parts.push(g); };
  add(new RoundedBoxGeometry(0.42, 0.03, 0.4, 2, 0.008), 0, 0.455, 0);
  [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]].forEach(([x, z]) => add(new THREE.CylinderGeometry(0.016, 0.013, 0.44, 10), x, 0.22, z));
  [-0.18, 0.18].forEach(x => add(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 10), x, 0.68, -0.19, -0.08));
  add(new RoundedBoxGeometry(0.42, 0.07, 0.022, 2, 0.008), 0, 0.86, -0.205);
  add(new RoundedBoxGeometry(0.38, 0.03, 0.018, 2, 0.006), 0, 0.7, -0.195);
  return mergeGeos(parts);
}

function filmGeometry(w, d) {
  const g = new THREE.PlaneGeometry(w, d, 24, 16);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const edge = Math.max(Math.abs(x) / (w / 2), Math.abs(z) / (d / 2));
    const sag = -0.018 * Math.pow(edge, 6) + 0.004 * Math.sin(x * 40) * Math.cos(z * 30);
    p.setY(i, sag);
    p.setZ(i, z + d / 2); // hinge at the back edge
  }
  g.computeVertexNormals();
  return g;
}

// A rigatoni tube with shallow ridges.
function rigatoniGeometry() {
  const g = new THREE.CylinderGeometry(0.0078, 0.0078, 0.044, 18, 1, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x);
    const k = 1 + 0.06 * Math.cos(a * 9);
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  g.computeVertexNormals();
  return g;
}

// A torn piece of romaine: a cupped leaf with a pale rib, coloured by vertex.
function leafGeometry() {
  const g = new THREE.PlaneGeometry(0.055, 0.042, 14, 10);
  const p = g.attributes.position, col = [];
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const edgeK = Math.min(1, Math.abs(x) / 0.0275);
    const cup = (x * x) * 14 + Math.sin(y * 110 + x * 40) * 0.0025 * edgeK * edgeK + Math.sin(x * 160) * 0.001;
    p.setZ(i, cup);
    const rib = Math.max(0, 1 - Math.abs(x) / 0.008);
    const edge = Math.min(1, Math.abs(x) / 0.03);
    c.setRGB(0.36 + 0.42 * rib, 0.5 + 0.3 * rib - 0.08 * edge, 0.18 + 0.32 * rib);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
