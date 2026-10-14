// The hero: the same night played on two stations, a guess and Tooey's count.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Station, NIGHTS, DISHES, NAMES, T, hourAt, timeAt, saleTimes, ticketTimes } from './stations.js';

const HOLD_END = 11.6, DARK_END = 12.0, LAMP_LOW = 0.08;
const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export function makeRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

export function makeScene(renderer) {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.18;
  scene.add(new THREE.HemisphereLight(0xf2efe8, 0x24221f, 0.15));
  return scene;
}

export function stationCamera(cx) {
  const cam = new THREE.PerspectiveCamera(26, 16 / 9, 20, 900);
  cam.position.set(cx - 16, 124, 206);
  cam.lookAt(cx - 16, -4, -4);
  cam.zoom = 1.12;
  return cam;
}

export function planFor(nightKey, side) {
  const night = NIGHTS[nightKey];
  const sales = saleTimes(night);
  return {
    night, side,
    counts: night[side],
    sales,
    tickets: ticketTimes(sales),
    bin: side === 'guess' ? night.bin : [],
    lamp: 1,
  };
}

// 86 time: when the last prepped portion of a dish sells before close.
export function outTimes(plan) {
  const out = {};
  for (const d of DISHES) {
    const n = plan.counts[d], s = plan.sales[d];
    if (n < s.length) out[d] = s[n - 1];
  }
  return out;
}

export function fmtHour(h) {
  const m5 = Math.round((h % 1) * 12) * 5;
  let hh = Math.floor(h) + (m5 === 60 ? 1 : 0);
  const mm = m5 === 60 ? 0 : m5;
  return `${hh > 12 ? hh - 12 : hh}:${String(mm).padStart(2, '0')} pm`;
}

export class Hero {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector('canvas');
    this.views = {
      guess: root.querySelector('[data-view="guess"]'),
      tooey: root.querySelector('[data-view="tooey"]'),
    };
    this.renderer = makeRenderer(this.canvas);
    this.scene = makeScene(this.renderer);
    this.st = { guess: new Station(this.scene, -700), tooey: new Station(this.scene, 700) };
    this.cam = { guess: stationCamera(-700), tooey: stationCamera(700) };
    this.clock = root.querySelector('[data-clock]');
    this.caption = root.querySelector('[data-caption]');
    this.ticket86 = root.querySelector('[data-ticket86]');
    this.nightOrder = ['saturday', 'tuesday'];
    this.nightIx = 0;
    this.setNight('saturday');
    this.s = 0;
    this.running = false;
    this.paused = false;
    this.last = 0;
    this.amb = 0;
    this.resize();
    addEventListener('resize', () => { this.resize(); this.draw(); });
  }

  setNight(key) {
    this.nightKey = key;
    this.plans = {};
    for (const side of ['guess', 'tooey']) {
      const plan = planFor(key, side);
      this.plans[side] = plan;
      this.st[side].build(plan.counts);
      const view = this.views[side];
      for (const d of DISHES) {
        const el = view.querySelector(`[data-label="${d}"]`);
        el.querySelector('b').textContent = plan.counts[d];
      }
      const notes = this.root.querySelector(`[data-notes="${side}"]`);
      notes.innerHTML = '';
      plan.night.notes[side].forEach(text => {
        const span = document.createElement('span');
        span.textContent = text + ' ';
        notes.appendChild(span);
      });
    }
    this.caption.textContent = NIGHTS[key].caption;
    this.out = outTimes(this.plans.guess);
    // when each note shows
    const g = this.plans.guess, notesAt = { guess: [], tooey: [T.close + 0.42] };
    if (key === 'saturday') notesAt.guess = [timeAt(this.out.dough), T.close + 0.1];
    else notesAt.guess = [T.open + 0.3, T.close + 0.1];
    this.notesAt = notesAt;
    this.placeLabels();
  }

  resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(r.width, r.height, false);
    this.canvas.style.width = r.width + 'px';
    this.canvas.style.height = r.height + 'px';
    this.box = r;
    this.placeLabels();
  }

  placeLabels() {
    const v = new THREE.Vector3();
    for (const side of ['guess', 'tooey']) {
      const st = this.st[side], cam = this.cam[side];
      cam.updateMatrixWorld();
      st.root.updateMatrixWorld();
      for (const d of DISHES) {
        v.copy(st.anchors[d]); st.root.localToWorld(v); v.project(cam);
        const el = this.views[side].querySelector(`[data-label="${d}"]`);
        el.style.left = ((v.x + 1) / 2 * 100).toFixed(2) + '%';
        el.style.top = ((1 - v.y) / 2 * 100).toFixed(2) + '%';
      }
    }
  }

  // Lamp level and night time for loop position s.
  frameState(s) {
    let lamp = 1;
    if (s < T.lampUp) lamp = LAMP_LOW + (1 - LAMP_LOW) * ease(s / T.lampUp);
    if (s > HOLD_END) lamp = 1 - (1 - LAMP_LOW) * ease((s - HOLD_END) / (DARK_END - HOLD_END));
    return { t: Math.min(s, T.settle), lamp };
  }

  pose(s) {
    const { t, lamp } = this.frameState(s);
    for (const side of ['guess', 'tooey']) {
      const plan = this.plans[side];
      plan.lamp = lamp;
      this.renderer.toneMappingExposure = 0.18 + 0.82 * lamp;
      plan.ambientT = this.amb;
      this.st[side].pose(t, plan);
    }
    // page overlays
    this.clock.textContent = fmtHour(hourAt(t));
    const fadeOut = s > HOLD_END ? 1 - ease((s - HOLD_END) / 0.3) : 1;
    for (const side of ['guess', 'tooey']) {
      const spans = this.root.querySelectorAll(`[data-notes="${side}"] span`);
      spans.forEach((sp, i) => {
        const p = ease((t - this.notesAt[side][i]) / 0.3) * fadeOut;
        sp.style.opacity = p.toFixed(3);
      });
    }
    this.root.querySelectorAll('[data-label]').forEach(el => (el.style.opacity = (0.25 + 0.75 * lamp).toFixed(3)));
    if (this.ticket86) {
      const h86 = this.out.dough;
      if (h86 == null) { this.ticket86.style.opacity = 0; }
      else {
        const p = ease((t - timeAt(h86)) / 0.28);
        this.ticket86.style.opacity = (p * fadeOut).toFixed(3);
        this.ticket86.style.transform = `translateY(${(-18 * (1 - p)).toFixed(1)}px) rotate(${(-3 - 6 * (1 - p)).toFixed(2)}deg)`;
      }
    }
  }

  draw() {
    const r = this.renderer;
    const cb = this.box;
    r.setScissorTest(true);
    r.setViewport(0, 0, cb.width, cb.height);
    r.setScissor(0, 0, cb.width, cb.height);
    r.clear();
    for (const side of ['guess', 'tooey']) {
      const vr = this.views[side].getBoundingClientRect();
      const x = vr.left - cb.left, y = cb.bottom - vr.bottom;
      r.setViewport(x, y, vr.width, vr.height);
      r.setScissor(x, y, vr.width, vr.height);
      this.cam[side].aspect = vr.width / vr.height;
      this.cam[side].updateProjectionMatrix();
      r.render(this.scene, this.cam[side]);
    }
    r.setScissorTest(false);
  }

  // Jump to loop position s (used by captures and reduced motion).
  seek(s) { this.s = s; this.box = this.canvas.parentElement.getBoundingClientRect(); this.pose(s); this.draw(); }
  freeze() { this.frozen = true; this.stop(); }
  goto(night, s) {
    if (night !== this.nightKey) { this.nightIx = this.nightOrder.indexOf(night); this.setNight(night); }
    this.seek(s);
  }
  // Time one frame's work, for a rough performance check.
  bench(n = 5) { const t = performance.now(); for (let i = 0; i < n; i++) { this.pose(2 + i * 0.1); this.draw(); } this.renderer.getContext().finish(); return (performance.now() - t) / n; }

  tick(now) {
    if (!this.running) return;
    const dt = Math.min((now - (this.last || now)) / 1000, 0.05);
    this.last = now;
    if (!this.paused) {
      this.amb += dt;
      this.s += dt;
      if (this.s >= DARK_END) {
        this.nightIx = (this.nightIx + 1) % this.nightOrder.length;
        this.box = this.canvas.parentElement.getBoundingClientRect();
        this.setNight(this.nightOrder[this.nightIx]);
        this.s = 0;
      }
      this.box = this.canvas.parentElement.getBoundingClientRect();
      this.pose(this.s);
      this.draw();
    }
    requestAnimationFrame(n => this.tick(n));
  }

  start() {
    if (this.running || this.frozen) return;
    this.running = true;
    this.last = 0;
    requestAnimationFrame(n => this.tick(n));
  }
  stop() { this.running = false; }
}
