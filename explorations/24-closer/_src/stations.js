// One prep station on the pass: counter, ticket rail, three pans, a bin.
// Two of these play the same night; only the prep counts differ.
import * as THREE from 'three';
import { mats, makePan, counterTop, ticketRail, ticket, bin, doughBox, doughBalls, pints, flanPieces } from './kit.js';

export const DISHES = ['dough', 'risotto', 'tiramisu'];
export const NAMES = { dough: 'Dough', risotto: 'Risotto', tiramisu: 'Tiramisu' };

// Example nights. Counts are illustrative only.
export const NIGHTS = {
  saturday: {
    caption: 'Example: one Saturday, prepped two ways',
    sold: { dough: 26, risotto: 8, tiramisu: 18 },
    guess: { dough: 20, risotto: 15, tiramisu: 20 },
    tooey: { dough: 28, risotto: 9, tiramisu: 20 },
    mean: 20.06, sd: 0.9,
    bin: ['risotto'],
    out: { dish: 'dough', ticket: 'Pizza' },
    notes: {
      guess: ['Out of dough at 8:40.', 'Risotto binned at close.'],
      tooey: ['Every dish lasts the night, with a little over.'],
    },
  },
  tuesday: {
    caption: 'Example: one Tuesday, prepped two ways',
    sold: { dough: 12, risotto: 4, tiramisu: 9 },
    guess: { dough: 20, risotto: 15, tiramisu: 20 },
    tooey: { dough: 14, risotto: 5, tiramisu: 10 },
    mean: 19.5, sd: 1.0,
    bin: ['dough', 'risotto'],
    notes: {
      guess: ['Prepped like a Saturday.', 'Dough and risotto binned at close.'],
      tooey: ['A smaller prep for a quiet night, a little over.'],
    },
  },
};

// Service runs 5pm to 11pm between these times (seconds into the play).
export const T = { lampUp: 0.4, open: 0.4, close: 3.4, binEnd: 4.15, settle: 4.6, hourPerSec: 2 };
export const hourAt = t => 17 + Math.min(Math.max(t - T.open, 0), T.close - T.open) * T.hourPerSec;
export const timeAt = h => T.open + (h - 17) / T.hourPerSec;

// Inverse normal CDF (Acklam), for spreading sales over the night.
function probit(p) {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40097599354297, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const pl = 0.02425;
  let q, r;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p <= 1 - pl) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

export function saleTimes(night) {
  const out = {};
  for (const dish of DISHES) {
    const n = night.sold[dish];
    out[dish] = Array.from({ length: n }, (_, k) => {
      const h = night.mean + probit((k + 0.5) / n) * night.sd;
      return Math.min(Math.max(h, 17.25), 22.75);
    });
  }
  return out;
}

// Ticket print times shared by both stations: one per few sales.
export function ticketTimes(sales) {
  const all = DISHES.flatMap(d => sales[d]).sort((a, b) => a - b);
  const out = [];
  for (let i = 1; i < all.length; i += 4) out.push(all[i]);
  return out;
}

const PZ = -2;
const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export class Station {
  constructor(scene, cx) {
    this.scene = scene;
    this.cx = cx;
    this.root = new THREE.Group();
    this.root.position.x = cx;
    scene.add(this.root);
    const m = mats();

    // the kitchen around the station: painted wall, quarry-tile floor
    const room = new THREE.Mesh(new THREE.PlaneGeometry(700, 400), new THREE.MeshStandardMaterial({ color: 0x34312d, roughness: 0.85 }));
    room.position.set(0, 80, -42.5); room.receiveShadow = true;
    this.root.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(700, 400), new THREE.MeshStandardMaterial({ color: 0x3b2d27, roughness: 0.7 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -88, 100); floor.receiveShadow = true;
    this.root.add(floor);
    const ct = counterTop(214, 84);
    ct.position.x = 8;
    this.root.add(ct);
    const rail = ticketRail(150);
    rail.position.set(-2, 24, -39.6);
    this.root.add(rail);
    this.railY = 24 - 1.0;
    this.railZ = -38.8;

    this.bin = bin();
    this.bin.position.set(-72, -3, 54);
    this.root.add(this.bin);

    // heat lamp over the pass
    const lamp = new THREE.SpotLight(0xffd9a8, 6.2, 0, 0.6, 1, 0);
    lamp.position.set(-30, 150, 60);
    lamp.target.position.set(-20, 0, -8);
    lamp.castShadow = true;
    lamp.shadow.mapSize.set(1024, 1024);
    lamp.shadow.bias = -0.0004;
    lamp.shadow.normalBias = 0.02;
    lamp.shadow.radius = 5;
    lamp.shadow.camera.near = 60; lamp.shadow.camera.far = 260;
    this.root.add(lamp, lamp.target);
    this.lamp = lamp;
    this.lampBase = 6.2;

    this.food = new THREE.Group();
    this.root.add(this.food);
    this.ticketGroup = new THREE.Group();
    this.root.add(this.ticketGroup);
    this.pans = {};
  }

  // Lay out pans for these prep counts. Returns label anchor points (local).
  build(counts) {
    // drop the last night's pans; shared food geometry and cached materials stay
    for (const c of [...this.food.children]) {
      c.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); });
      this.food.remove(c);
    }
    const m = mats();
    let x = -82;
    const gap = 5;
    this.items = {};
    this.anchors = {};

    // dough: balls proofing in a box, four rows deep
    {
      const n = counts.dough, rows = 4, cols = Math.ceil(n / rows), pitch = 7.6;
      const w = cols * pitch + 2.2, d = rows * pitch + 2.2;
      const g = new THREE.Group();
      g.position.set(x + w / 2, 0, PZ);
      g.add(doughBox(w, d));
      const balls = doughBalls(cols, rows, n, pitch);
      balls.sort((a, b) => b.userData.col - a.userData.col || b.userData.row - a.userData.row);
      balls.forEach(p => g.add(p));
      this.food.add(g);
      this.items.dough = balls;
      this.anchors.dough = new THREE.Vector3(x + w / 2, 7.5, PZ + d / 2 + 1.9);
      x += w + gap;
    }
    // risotto: par-cooked portions in deli pints, three rows deep
    {
      const n = counts.risotto, rows = 3, cols = Math.ceil(n / rows), pitch = 9.8;
      const w = cols * pitch + 1.6, d = rows * pitch + 1.6;
      const tray = makePan(w, d, 2.2, m.alu, { flange: 0.9 });
      const g = new THREE.Group();
      g.position.set(x + w / 2, 0, PZ);
      g.add(tray);
      const ps = pints(cols, rows, n, pitch);
      ps.sort((a, b) => b.userData.col - a.userData.col || b.userData.row - a.userData.row);
      ps.forEach(p => g.add(p));
      this.food.add(g);
      this.items.risotto = ps;
      this.anchors.risotto = new THREE.Vector3(x + w / 2, 2.2, PZ + d / 2 + 1.2);
      x += w + gap;
    }
    // tiramisu: ramekins on a sheet tray, five across
    {
      const n = counts.tiramisu, cols = 5, rows = Math.ceil(n / cols), pitch = 8.6;
      const w = cols * pitch + 2.4, d = rows * pitch + 2.4;
      const tray = makePan(w, d, 2.2, m.alu, { flange: 0.9 });
      const g = new THREE.Group();
      g.position.set(x + w / 2, 0, PZ);
      g.add(tray);
      const pieces = flanPieces(cols, rows, n, pitch);
      pieces.sort((a, b) => b.userData.row - a.userData.row || b.userData.col - a.userData.col);
      pieces.forEach(p => g.add(p));
      this.food.add(g);
      this.items.tiramisu = pieces;
      this.anchors.tiramisu = new THREE.Vector3(x + w / 2, 2.2, PZ + d / 2 + 1.2);
      x += w;
    }
    this.counts = counts;
    for (const d of DISHES) for (const it of this.items[d]) {
      it.userData.base = it.position.clone();
      it.userData.baseRot = it.rotation.clone();
      it.userData.baseScale = it.scale.clone();
    }
    return this.anchors;
  }

  // Set the scene to time t of a night (deterministic, so any frame can be drawn).
  // plan: { counts, sales, tickets, bin: [dishes], lamp: 0..1, ambientT }
  pose(t, plan) {
    const hour = hourAt(t);
    const local = new THREE.Vector3();
    for (const dish of DISHES) {
      const items = this.items[dish];
      const sales = plan.sales[dish];
      const binned = plan.bin.includes(dish);
      items.forEach((it, k) => {
        const u = it.userData;
        it.position.copy(u.base); it.rotation.copy(u.baseRot); it.scale.copy(u.baseScale);
        it.visible = true;
        if (k < sales.length) {
          // sold: lifts out of the pan and is gone
          const ts = timeAt(sales[k]);
          const p = (t - ts) / 0.24;
          if (p >= 1) { it.visible = false; return; }
          if (p > 0) {
            const e = ease(p);
            it.position.y += e * 9;
            it.position.z += e * 6;
            it.scale.multiplyScalar(1 - e * 0.65);
          }
        } else if (binned) {
          // left at close: tipped into the bin, one after another
          const order = k - sales.length;
          const ts = T.close + 0.08 + order * 0.045;
          const p = (t - ts) / 0.42;
          if (p >= 1) { it.visible = false; return; }
          if (p > 0) {
            const parent = it.parent;
            // bin rim in the pan group's local space
            local.set(this.bin.position.x - parent.position.x, this.bin.position.y - parent.position.y, this.bin.position.z - parent.position.z);
            const e = p;
            const sx = u.base.x, sy = u.base.y, sz = u.base.z;
            it.position.set(sx + (local.x - sx) * e, sy + (local.y - 8 - sy) * e + Math.sin(e * Math.PI) * 18, sz + (local.z - sz) * e);
            it.rotation.x += e * 2.2; it.rotation.z += e * 1.4;
          }
        }
      });
    }

    // tickets on the rail: newest slides in from the right, the rail shows seven
    const shown = plan.tickets.filter(h => h <= hour + 1e-6);
    const n = shown.length;
    this.pool = this.pool || [];
    while (this.pool.length < n) {
      const tk = ticket(1000 + this.pool.length * 7);
      this.pool.push(tk);
      this.ticketGroup.add(tk);
    }
    const slot = 9.2, right = 60, cap = 7;
    this.pool.forEach((tk, i) => {
      if (i >= n) { tk.visible = false; return; }
      const age = n - 1 - i; // 0 = newest
      const tIn = timeAt(plan.tickets[i]);
      const pIn = ease((t - tIn) / 0.18);
      let x = right - age * slot;
      if (age === 0) x = right + (1 - pIn) * 22;
      tk.position.set(x, this.railY, this.railZ + 1.3);
      tk.rotation.set(-0.12, 0, ((i * 0.53) % 1 - 0.5) * 0.06);
      tk.visible = age < cap; // older tickets have been pulled by the expo
    });

    // lamp
    this.lamp.intensity = this.lampBase * plan.lamp;

  }
}
