// The wall behind the line: a labelled prep pan, the time clock with its card racks,
// and a full ticket spike. Rendered once at build time into stills.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mats, makePan, doughBox, doughBalls, pints, ticketMap, rng } from './kit.js';

function labelTex(text) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#f2f1ec'; x.fillRect(0, 0, 256, 128);
  x.fillStyle = '#232a2f';
  x.font = '700 84px Chivo, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 128, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function cardTex(seed) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const x = c.getContext('2d');
  const r = rng(seed);
  x.fillStyle = '#d8c695'; x.fillRect(0, 0, 128, 256);
  x.fillStyle = 'rgba(120,96,60,0.25)';
  for (let i = 0; i < 14; i++) x.fillRect(10, 40 + i * 14, 108, 1);
  x.fillStyle = 'rgba(40,40,60,0.7)';
  x.fillRect(14, 12, 40 + r() * 50, 10);
  for (let i = 0; i < 3 + Math.floor(r() * 5); i++) x.fillRect(18 + r() * 6, 44 + i * 14, 30 + r() * 40, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildWall(scene) {
  const m = mats();
  const g = new THREE.Group();
  scene.add(g);

  // wall and shelf
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(520, 260), m.wall);
  wall.position.set(0, 110, -32); wall.receiveShadow = true;
  g.add(wall);
  const shelf = new THREE.Mesh(new RoundedBoxGeometry(520, 5, 74, 3, 1.6), m.counter);
  shelf.position.set(0, -2.5, 4); shelf.receiveShadow = true;
  g.add(shelf);

  // light: one warm lamp raking from the upper left, a soft cool fill
  const lamp = new THREE.SpotLight(0xffdcae, 4.4, 0, 0.9, 0.9, 0);
  lamp.position.set(-150, 230, 160);
  lamp.target.position.set(0, 30, -20);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(2048, 2048);
  lamp.shadow.bias = -0.0003; lamp.shadow.radius = 6;
  lamp.shadow.camera.near = 80; lamp.shadow.camera.far = 600;
  g.add(lamp, lamp.target);

  // ---- prep: the morning's dough and risotto, each with its count on tape
  {
    const p = new THREE.Group();
    p.position.set(-92, 0, -2);
    const dw = 7 * 7.6 + 2.2, dd = 4 * 7.6 + 2.2;
    const db = new THREE.Group(); db.position.set(-16, 0, 0);
    db.add(doughBox(dw, dd));
    doughBalls(7, 4, 28).forEach(x => db.add(x));
    p.add(db);
    const rw = 4 * 9.8 + 1.6, rd = 3 * 9.8 + 1.6;
    const rp = new THREE.Group(); rp.position.set(31, 0, -2); rp.rotation.y = -0.06;
    rp.add(makePan(rw, rd, 2.2, m.alu, { flange: 0.9 }));
    pints(4, 3, 12).forEach(x => rp.add(x));
    p.add(rp);
    for (const [txt, px, py, pz, rot] of [['28', -16, 4.6, dd / 2 + 0.75, -0.03], ['12', 31, 1.4, rd / 2 - 2 + 1.0, 0.04]]) {
      const lab = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshStandardMaterial({ map: labelTex(txt), roughness: 0.85 }));
      lab.position.set(px, py, pz + 0.05); lab.rotation.z = rot;
      p.add(lab);
    }
    g.add(p);
  }

  // ---- shifts: the time clock between two card racks
  {
    const s = new THREE.Group();
    s.position.set(0, -20, -30);
    const paint = new THREE.MeshPhysicalMaterial({ color: 0xb9b1a0, roughness: 0.42, clearcoat: 0.4 });
    const body = new THREE.Mesh(new RoundedBoxGeometry(30, 42, 16, 4, 2.2), paint);
    body.position.set(0, 70, 8); body.castShadow = true; body.receiveShadow = true;
    s.add(body);
    // face
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(10.6, 0.9, 16, 64), m.panSteel);
    bezel.position.set(0, 78, 16.3); s.add(bezel);
    const face = new THREE.Mesh(new THREE.CircleGeometry(10.4, 64), m.porcelain);
    face.position.set(0, 78, 16.1); s.add(face);
    const ink = new THREE.MeshStandardMaterial({ color: 0x232a2f, roughness: 0.5 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const tick = new THREE.Mesh(new THREE.BoxGeometry(i % 3 ? 0.5 : 0.9, i % 3 ? 1.6 : 2.4, 0.2), ink);
      tick.position.set(Math.sin(a) * 8.6, 78 + Math.cos(a) * 8.6, 16.25); tick.rotation.z = -a;
      s.add(tick);
    }
    const hand = (len, w, ang) => {
      const h = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.25), ink);
      h.geometry.translate(0, len / 2 - 1, 0);
      h.position.set(0, 78, 16.45); h.rotation.z = -ang; h.castShadow = true;
      s.add(h);
    };
    hand(6.2, 0.9, (4 + 50 / 60) / 12 * Math.PI * 2); // ten to five
    hand(8.6, 0.55, (50 / 60) * Math.PI * 2);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(10.5, 64), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 0, transparent: true, opacity: 0.08, clearcoat: 1 }));
    glass.position.set(0, 78, 16.9); s.add(glass);
    // card slot
    const slot = new THREE.Mesh(new THREE.BoxGeometry(12, 1.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x141312, roughness: 0.8 }));
    slot.position.set(0, 58, 16.1); s.add(slot);

    // card racks either side: painted steel pockets, a card standing in some
    const rackPaint = new THREE.MeshPhysicalMaterial({ color: 0x9d988c, roughness: 0.38, metalness: 0.5, clearcoat: 0.3 });
    const rack = (x, cards, seed) => {
      const r = new THREE.Group(); r.position.set(x, 0, 0);
      const back = new THREE.Mesh(new RoundedBoxGeometry(15, 66, 1.0, 2, 0.4), rackPaint);
      back.position.set(0, 68, 0.6); back.castShadow = true; back.receiveShadow = true;
      r.add(back);
      const rnd = rng(seed);
      for (let i = 0; i < 6; i++) {
        const y = 38 + i * 11;
        if (cards.includes(i)) {
          const card = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 18.5), new THREE.MeshStandardMaterial({ map: cardTex(seed * 13 + i), roughness: 0.9, side: THREE.DoubleSide }));
          card.position.set((rnd() - 0.5) * 1.0, y + 6.5, 1.75); card.rotation.set(0.1, 0, (rnd() - 0.5) * 0.06);
          card.castShadow = true; card.receiveShadow = true;
          r.add(card);
        }
        const pocket = new THREE.Mesh(new RoundedBoxGeometry(14.4, 3.6, 1.2, 2, 0.3), rackPaint);
        pocket.position.set(0, y, 2.4); pocket.rotation.x = 0.1; pocket.castShadow = true; pocket.receiveShadow = true;
        r.add(pocket);
      }
      s.add(r);
    };
    rack(-25, [0, 1, 3, 4], 3);
    rack(25, [0, 2, 5], 5);
    g.add(s);
  }

  // ---- growth: a ticket spike, full
  {
    const sp = new THREE.Group();
    sp.position.set(100, 0, 0); sp.scale.setScalar(1.35);
    const iron = new THREE.MeshPhysicalMaterial({ color: 0x1c1b1a, roughness: 0.45, metalness: 0.6 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.6, 2.4, 40), iron);
    base.position.y = 1.2; base.castShadow = true; base.receiveShadow = true; sp.add(base);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 22, 12), m.panSteel);
    rod.position.y = 13; rod.castShadow = true; sp.add(rod);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.6, 12), m.panSteel); tip.position.y = 24.8; sp.add(tip);
    const r = rng(9);
    for (let i = 0; i < 30; i++) {
      const tk = new THREE.Mesh(new THREE.PlaneGeometry(8, 13, 1, 4), new THREE.MeshStandardMaterial({ map: ticketMap(500 + i), roughness: 0.9, side: THREE.DoubleSide }));
      // a little curl
      const pos = tk.geometry.attributes.position;
      for (let k = 0; k < pos.count; k++) pos.setZ(k, Math.pow(pos.getY(k) / 6.5, 2) * (0.3 + r() * 0.4));
      tk.geometry.computeVertexNormals();
      tk.geometry.translate(0, -3.5 + (r() - 0.5) * 1.5, 0);
      tk.rotation.set(-Math.PI / 2 + (r() - 0.5) * 0.08, 0, 0);
      tk.position.set(0, 2.8 + i * 0.42, 0);
      tk.castShadow = true; tk.receiveShadow = true;
      // rotate about the spike, not the ticket centre
      const holder = new THREE.Group(); holder.position.y = 0; holder.rotation.y = 0.5 + (r() - 0.5) * 1.4;
      holder.add(tk);
      sp.add(holder);
    }
    g.add(sp);
  }
  return g;
}

export function wallCameras(aspect) {
  const mk = (fov, pos, look) => {
    const c = new THREE.PerspectiveCamera(fov, aspect, 10, 1200);
    c.position.set(...pos); c.lookAt(...look); c.updateProjectionMatrix();
    return c;
  };
  return {
    wide: mk(20, [0, 74, 310], [0, 34, -10]),
    prep: mk(26, [-88, 64, 112], [-88, 4, -6]),
    shifts: mk(30, [0, 52, 130], [0, 46, -24]),
    growth: mk(26, [100, 56, 82], [100, 12, -2]),
  };
}
