// One take through one restaurant. A single WebGL canvas and a single camera
// travel between the page's frames; each section plays one short beat.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildSet } from './set.js';
import { Person, paintCook, paintGuest, COOKS, GUESTS, texFor, cellSize } from './people.js';
import { FONT } from './textures.js';
import { makeGrade } from './grade.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sine = t => -(Math.cos(Math.PI * t) - 1) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (t, a, b) => clamp((t - a) / (b - a));
function keys(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], sine((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
  return k[k.length - 1][1];
}

// ---- stations: where the camera rests at the end of each beat ----------------
// fov is vertical, for a 2:1 frame; pfov is for a 4:5 phone frame.
const STATIONS = {
  0: { focus: 1.9, ap: 0.012, pos: V(4.3, 1.68, 0.75), tgt: V(2.4, 1.05, 3.9), fov: 42, pfov: 64, ppos: V(4.25, 1.7, 0.9), ptgt: V(2.9, 1.1, 3.4) },
  1: { focus: 0.52, ap: 0.016, pos: V(3.74, 1.42, 1.98), tgt: V(3.3, 1.26, 2.25), fov: 30, pfov: 34, ppos: V(3.7, 1.4, 2.03), ptgt: V(3.3, 1.27, 2.25) },
  2: { focus: 0.72, ap: 0.012, pos: V(-4.12, 1.3, -0.62), tgt: V(-4.6, 0.98, -1.42), fov: 38, pfov: 50, ppos: V(-4.02, 1.36, -0.5), ptgt: V(-4.63, 0.97, -1.32) },
  3: { focus: 3.3, ap: 0.008, pos: V(-3.4, 1.72, -0.7), tgt: V(0.4, 1.25, -4.3), fov: 44, pfov: 66 },
  4: { focus: 3.1, ap: 0.011, pos: V(1.9, 1.72, 0.7), tgt: V(1.2, 0.9, 7.6), fov: 46, pfov: 66, ptgt: V(1.0, 0.55, 7.2) },
  5: { focus: 1.8, ap: 0.013, pos: V(0.2, 1.55, 1.75), tgt: V(0.05, 1.25, -3.0), fov: 38, pfov: 56, ppos: V(0.15, 1.5, 2.1), ptgt: V(0.05, 1.5, -3.0) },
};

const PRESETS = {
  night: {
    hemi: 0.06, env: 0.07, sun: 0, street: 30, bar: 9, din: 0, hood: 0, kit: 0, heat: 0,
    bBar: 9, bDin: 0, bHood: 0, bHeat: 0, bCeil: 0, status: 3, screen: 0.5,
    streetN: 1, streetD: 0, skyM: 0, skyE: 1, backS: 0.22, backK: 0.4, exposure: 1.6, warm: 0.6, grain: 0.06, vig: 0.5,
    tintD: [0.34, 0.36, 0.42], tintK: [0.2, 0.2, 0.22], tintO: [0.4, 0.46, 0.55],
  },
  morning: {
    hemi: 0.1, env: 0.16, sun: 9, street: 0, bar: 0, din: 0, hood: 0, kit: 0.6, heat: 0,
    bBar: 0, bDin: 0, bHood: 0, bHeat: 0, bCeil: 1.5, status: 1, screen: 0.2,
    streetN: 0, streetD: 1, skyM: 1, skyE: 0, backS: 0.5, backK: 1.6, exposure: 1.0, warm: 0.4, grain: 0.05, vig: 0.38,
    tintD: [0.6, 0.6, 0.6], tintK: [0.95, 0.9, 0.82], tintO: [0.5, 0.5, 0.5],
  },
  evening: {
    hemi: 0.05, env: 0.24, sun: 0, street: 6, bar: 5, din: 3.2, hood: 5.5, kit: 2.6, heat: 1.6,
    bBar: 8, bDin: 8, bHood: 7, bHeat: 6, bCeil: 3, status: 1, screen: 0.6,
    streetN: 0, streetD: 1, skyM: 0, skyE: 1, backS: 0.55, backK: 0.5, exposure: 1.05, warm: 0.75, grain: 0.055, vig: 0.42,
    tintD: [0.95, 0.78, 0.6], tintK: [1.0, 0.92, 0.82], tintO: [0.6, 0.6, 0.65],
  },
};
const BEAT_PRESET = { 0: 'night', 1: 'night', 2: 'morning', 3: 'evening', 4: 'evening', 5: 'evening' };

// ---- the world ----------------------------------------------------------------
export async function start(opts = {}) {
  const T0 = performance.now();
  const mark = (m) => { if (opts.debug) console.log('take', m, Math.round(performance.now() - T0) + 'ms'); };
  try { await document.fonts.load(`700 40px ${FONT}`); await document.fonts.load(`500 40px ${FONT}`); } catch (e) { /* fall back */ }

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.still });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const grade = makeGrade(renderer);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.FogExp2(0x0b0a09, 0.035);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(40, 2, 0.05, 60);

  // lights
  const L = {};
  L.hemi = new THREE.HemisphereLight(0xcfd6e0, 0x3a3028, 0.1); scene.add(L.hemi);
  L.sun = new THREE.DirectionalLight(0xffe7c4, 0);
  L.sun.position.set(-8.6, 9.6, -3.3);
  L.sun.target.position.set(-4.25, 0.9, -2.1);
  L.sun.castShadow = true;
  L.sun.shadow.mapSize.set(1024, 1024);
  Object.assign(L.sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 16 });
  L.sun.shadow.bias = -0.0004;
  L.sun.shadow.normalBias = 0.02;
  scene.add(L.sun, L.sun.target);
  L.street = new THREE.SpotLight(0xa9c2d8, 0, 0, 0.55, 0.9, 1.4);
  L.street.position.set(1.6, 4.2, 13.5); L.street.target.position.set(0.5, 0, 5);
  scene.add(L.street, L.street.target);
  const pl = (hex, x, y, z, decay = 1.6) => { const l = new THREE.PointLight(hex, 0, 0, decay); l.position.set(x, y, z); scene.add(l); return l; };
  L.bar = new THREE.SpotLight(0xffc791, 0, 0, 0.85, 0.75, 2);
  L.bar.position.set(3.28, 2.17, 2.55); L.bar.target.position.set(3.25, 1.0, 2.35);
  scene.add(L.bar, L.bar.target);
  L.barFill = pl(0xffc98e, 3.4, 2.1, 4.6, 2);
  L.din = pl(0xffc98e, -1.2, 2.4, 4.6, 1.3);
  L.hood = pl(0xfff1df, 0.3, 2.0, -4.0);
  L.kit = pl(0xe9efff, 0.4, 2.8, -2.0, 1.2);
  L.heat = pl(0xff8a4a, 0, 1.75, -0.1, 2);

  mark('renderer');
  const S = buildSet(scene);
  mark('set');

  // people
  const texCache = new Map();
  const P = (canvases, o = {}) => {
    const p = new Person(canvases, o);
    p.room = o.room || 'k';
    scene.add(p.group);
    p.show(0);
    return p;
  };
  // Figures are painted a few at a time after the first shot starts; each
  // person is made now with a blank canvas that the painting fills later.
  const jobs = [];
  const lazy = (fn, wide = false) => {
    const [w, h] = cellSize(wide);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    jobs.push(() => { c.getContext('2d').drawImage(fn(), 0, 0); texFor(c).needsUpdate = true; });
    return c;
  };
  const passerby = P([lazy(() => paintGuest(GUESTS[1], 'walk'), true)], { wide: true, room: 'o' });
  const prepCook = P([lazy(() => paintCook(COOKS[1], 'work', 0)), lazy(() => paintCook(COOKS[1], 'work', 1))]).set(-3.85, 0, -2.25);
  const STATIONS_LINE = [V(-1.95, 0, -3.72), V(-0.35, 0, -3.75), V(2.3, 0, -3.72)];
  const lineCooks = [0, 2, 3].map((ci, i) => P([lazy(() => paintCook(COOKS[ci], 'work', i)), lazy(() => paintCook(COOKS[ci], 'work', i + 1))]).set(STATIONS_LINE[i].x, 0, STATIONS_LINE[i].z));
  const lineWalkers = [0, 2, 3].map(ci => P([lazy(() => paintCook(COOKS[ci], 'walk'), true)], { wide: true }));
  const seatedTex = GUESTS.map((g, i) => lazy(() => paintGuest(g, 'seated', i)));
  const guestWalkTex = GUESTS.slice(0, 4).map(g => lazy(() => paintGuest(g, 'walk'), true));
  const IDLE_SPOTS = [V(-1.3, 0, -2.6), V(-0.25, 0, -3.6), V(0.9, 0, -2.8), V(1.9, 0, -3.6)];
  const idles = [0, 1, 2, 3].map(i => P([lazy(() => paintCook(COOKS[i], 'idle', i))]).set(IDLE_SPOTS[i].x, 0, IDLE_SPOTS[i].z));

  // seats: every chair, plus the banquette side of the wall tables
  const seats = S.chairSpots.map(c => ({ x: c.x, z: c.z, t: c.t }));
  for (const t of S.tables) if (t[0] < -3) seats.push({ x: t[0] - 0.62, z: t[1], t });
  const diners = seats.map((s, i) => {
    const p = P([seatedTex[(i * 5) % GUESTS.length]], { room: 'd' }).set(s.x, 0, s.z);
    p.floor = false;
    return p;
  });
  const tableSeats = S.tables.map(t => diners.filter((d, i) => seats[i].t === t));
  const walkers = Array.from({ length: 14 }, (_, i) => P([guestWalkTex[i % guestWalkTex.length]], { wide: true, room: 'd' }));
  const paintSome = (budget) => {
    const t = performance.now();
    while (jobs.length && performance.now() - t < budget) jobs.shift()();
    return jobs.length === 0;
  };
  const flush = () => paintSome(Infinity);
  const paintLater = () => { if (!paintSome(12)) setTimeout(paintLater, 30); };

  mark('people');
  const everyone = [prepCook, ...lineCooks, ...lineWalkers, ...idles, ...diners, ...walkers, passerby];

  renderer.shadowMap.needsUpdate = true;

  // ---- lighting state -------------------------------------------------------
  const light = { ...PRESETS.night };
  const tints = { d: new THREE.Color(), k: new THREE.Color(), o: new THREE.Color() };
  function applyLight(p) {
    L.hemi.intensity = p.hemi; scene.environmentIntensity = p.env;
    L.sun.intensity = p.sun; L.street.intensity = p.street; L.bar.intensity = p.bar; L.barFill.intensity = p.bar * 0.5; L.din.intensity = p.din;
    L.hood.intensity = p.hood; L.kit.intensity = p.kit; L.heat.intensity = p.heat;
    S.setBulb('bar', p.bBar); S.setBulb('din', p.bDin); S.setBulb('hood', p.bHood); S.setBulb('heat', p.bHeat);
    S.setBulb('ceil', p.bCeil); S.setBulb('status', p.status); S.setBulb('screen', p.screen);
    S.setGlows('bar', p.bBar * 0.12); S.setGlows('din', p.bDin * 0.16); S.setGlows('heat', p.bHeat * 0.12); S.setGlows('hood', p.bHood * 0.1);
    S.streetNight.material.opacity = p.streetN; S.streetDusk.material.opacity = p.streetD;
    S.streetNight.visible = p.streetN > 0.01; S.streetDusk.visible = p.streetD > 0.01;
    S.setBack(p.backS, p.backK);
    S.skyMorning.material.opacity = p.skyM; S.skyEvening.material.opacity = p.skyE;
    grade.uniforms.uExposure.value = p.exposure; grade.uniforms.uWarm.value = p.warm;
    grade.uniforms.uGrain.value = p.grain; grade.uniforms.uVig.value = p.vig;
    tints.d.setRGB(...p.tintD); tints.k.setRGB(...p.tintK); tints.o.setRGB(...p.tintO);
  }
  function mixPreset(a, b, t) {
    const o = {};
    for (const k in a) o[k] = Array.isArray(a[k]) ? a[k].map((v, i) => lerp(v, b[k][i], t)) : lerp(a[k], b[k], t);
    return o;
  }

  // ---- what each beat does, as a pure function of time --------------------
  // Each returns the target opacity for people; everything else is set here.
  const op = new Map();
  const want = (p, o) => op.set(p, Math.max(op.get(p) || 0, o));
  const walk = (p, from, to, t, a, b) => {
    const u = ramp(t, a, b);
    if (u <= 0 || u >= 1) return;
    p.group.position.lerpVectors(from, to, u);
    p.dir = to.clone().sub(from);
    want(p, Math.min(1, Math.min(u, 1 - u) * 6));
  };
  let accState = 'tooey';
  const beatsPlayed = new Set();

  function world(beat) {
    // the props each beat assumes, for things its own action doesn't drive
    S.setChairs(beat <= 1);
    S.barSlip.set(beat <= 2 ? 0.09 : 0);
    S.kitSlip.set(beat >= 2 ? 0.09 : 0);
    S.steaks.count = beat === 3 ? 26 : beat >= 4 ? 11 : 0;
    const tk = beat === 4 ? 8 : beat === 5 ? 2 : 0;
    S.tickets.forEach((t, i) => (t.visible = i < tk));
    S.setClock({ 1: 23.7, 2: 6.0, 3: 19, 4: 20, 5: 17.5 }[beat] || 6);
    S.flames.forEach(f => (f.material.opacity = beat === 4 ? 0.85 : 0));
  }

  const ACT = {
    0: { dur: 0, run() {} },
    1: {
      dur: 2.6,
      run(t) {
        S.barSlip.set(keys(t, [[0, 0], [0.3, 0], [0.55, 0.026], [0.85, 0.026], [1.05, 0.044], [1.3, 0.044], [1.5, 0.058], [1.75, 0.058], [1.95, 0.072], [2.25, 0.09]]));
        S.setBulb('status', t > 0.25 && t < 2.3 ? (Math.floor(t * 8) % 2 ? 5 : 1.5) : 3);
        walk(passerby, V(-6, -0.05, 11.4), V(4, -0.05, 11.4), t, 0.1, 3.2);
      },
    },
    2: {
      dur: 2.9,
      run(t) {
        S.kitSlip.set(keys(t, [[0, 0], [0.1, 0], [0.3, 0.026], [0.5, 0.044], [0.7, 0.058], [0.9, 0.072], [1.15, 0.09]]));
        want(prepCook, 1);
        S.steaks.count = Math.round(26 * ease(ramp(t, 0.9, 2.8)));
      },
    },
    3: {
      dur: 3.3,
      run(t) {
        S.setClock(lerp(16.5, 19, ease(ramp(t, 0, 3.1))));
        const door = V(4.7, 0, -0.95);
        const arrive = [[0.0, 0.55], [0.8, 1.35], [1.65, 2.2]];
        arrive.forEach(([a, b], i) => {
          walk(lineWalkers[i], door, STATIONS_LINE[i], t, a, b);
          if (t >= b - 0.1) want(lineCooks[i], clamp((t - b + 0.1) / 0.25));
          S.flames[i].material.opacity = t >= b ? 0.85 : 0;
        });
        const at = [0.85, 1.05, 1.55, 1.75, 2.35, 2.55, 2.8, 3.05];
        S.tickets.forEach((tk, i) => (tk.visible = i < at.length && t >= at[i]));
      },
    },
    4: {
      dur: 2.9,
      run(t) {
        const early = [1, 6, 10];
        for (const ti of early) tableSeats[ti].forEach(d => want(d, 1));
        const order = [0, 4, 8, 2, 5, 9, 7];
        const door = V(3.95, 0, 8.4);
        order.forEach((ti, k) => {
          // the last couple is still coming in when the beat ends
          const a = 0.1 + k * 0.3, b = k === order.length - 1 ? a + 1.6 : a + 0.55;
          const [tx, tz] = S.tables[ti];
          const dest = V(tx + 0.9, 0, tz + 0.5);
          walk(walkers[k * 2], door, dest, t, a, b);
          walk(walkers[k * 2 + 1], V(door.x + 0.35, 0, door.z + 0.3), V(dest.x + 0.3, 0, dest.z + 0.35), t, a + 0.08, b + 0.08);
          if (t > b) tableSeats[ti].forEach(d => want(d, clamp((t - b) / 0.25)));
        });
      },
    },
    5: {
      dur: 3.0,
      run(t, held) {
        // a quiet Tuesday at half past five, played twice
        const guess = held ? accState === 'guess' : t < 1.55;
        const g = held ? (accState === 'guess' ? 1 : 0) : 1 - ramp(t, 1.3, 1.6);
        const k = held ? (accState === 'tooey' ? 1 : 0) : ramp(t, 1.75, 2.1);
        idles.forEach(p => want(p, g));
        want(lineCooks[0], k); want(lineCooks[1], k);
        S.flames[0].material.opacity = 0.85 * k; S.flames[1].material.opacity = 0.85 * k;
        // the film winds back between the two takes
        const rw = held ? 0 : Math.sin(Math.PI * ramp(t, 1.3, 1.85));
        grade.uniforms.uGrain.value = light.grain + rw * 0.16;
        grade.uniforms.uExposure.value = light.exposure * (1 - rw * 0.35);
        if (!held) setToggle(guess ? 'guess' : 'tooey');
      },
    },
  };

  // ---- camera ----------------------------------------------------------------
  let portrait = false;
  function station(b) {
    const s = STATIONS[b];
    const pos = (portrait && s.ppos) || s.pos;
    const tgt = (portrait && s.ptgt) || s.tgt;
    return { pos: pos.clone(), quat: look(pos, tgt), fov: portrait ? s.pfov : s.fov, focus: s.focus, ap: s.ap };
  }
  const _m = new THREE.Matrix4();
  function look(from, to) {
    _m.lookAt(from, to, V(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(_m);
  }
  function route(from, to) {
    const pts = [from.pos], qs = [from.quat];
    const fk = from.pos.z < 0, tk = to.pos.z < 0;
    if (fk !== tk) {
      const s = fk ? -1 : 1;
      const a = V(0.05, 1.6, 0.9 * s), b = V(0.05, 1.6, -0.9 * s);
      const q = look(a, V(0.05, 1.5, -6 * s));
      pts.push(a, b); qs.push(q, q.clone());
    }
    pts.push(to.pos); qs.push(to.quat);
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const len = cum[cum.length - 1] || 1;
    return {
      len,
      at(u, outPos, outQuat) {
        curve.getPointAt(clamp(u), outPos);
        const d = u * len;
        let i = 0;
        while (i < cum.length - 2 && d > cum[i + 1]) i++;
        const f = clamp((d - cum[i]) / ((cum[i + 1] - cum[i]) || 1));
        outQuat.slerpQuaternions(qs[i], qs[i + 1], sine(f));
      },
    };
  }

  // ---- shots ------------------------------------------------------------------
  // A shot: from wherever the camera is now, to beat b, then b's action.
  let shot = null;
  let clock = 0;
  function makeShot(b, { skipAction = false } = {}) {
    const from = { pos: camera.position.clone(), quat: camera.quaternion.clone(), fov: camera.fov, focus: grade.uniforms.uFocus.value, ap: grade.uniforms.uAperture.value };
    const to = station(b);
    const r = route(from, to);
    let M = b === 1 && !skipAction ? 3.1 : clamp(0.85 + r.len * 0.16, 0.9, 1.7);
    if (r.len < 0.01) M = 0;
    const A0 = b === 1 ? 0 : Math.max(0, M - 0.3);
    const fromLight = { ...light };
    const fromOp = new Map(everyone.map(p => [p, p.opacity]));
    return {
      b, r, M, A0, from, to, fromLight, fromOp, skipAction, hero: b === 1,
      T: skipAction ? M : Math.max(M, A0 + ACT[b].dur),
    };
  }
  const _p = new THREE.Vector3(), _q = new THREE.Quaternion();
  function stage(sh, t) {
    const b = sh.b;
    const u = sh.M ? clamp(t / sh.M) : 1;
    const e = sh.hero ? sine(u) : ease(u);
    sh.r.at(e, _p, _q);
    camera.position.copy(_p);
    camera.quaternion.copy(_q);
    camera.fov = lerp(sh.from.fov, sh.to.fov, e);
    grade.uniforms.uFocus.value = lerp(sh.from.focus, sh.to.focus, e);
    grade.uniforms.uAperture.value = lerp(sh.from.ap, sh.to.ap, e);
    camera.updateProjectionMatrix();
    // light crossfades over the move (and the room's props change in the pass)
    Object.assign(light, mixPreset(sh.fromLight, PRESETS[BEAT_PRESET[b]], ease(u)));
    applyLight(light);
    world(t >= sh.M * 0.5 ? b : sh.prevWorld ?? b);
    op.clear();
    const at = sh.skipAction ? ACT[b].dur : Math.min(t - sh.A0, ACT[b].dur);
    ACT[b].run(Math.max(0, at), sh.skipAction || at >= ACT[b].dur);
    // people: hand over from what was showing to what this beat wants
    const k = clamp(t / 0.35);
    for (const p of everyone) p.show(lerp(sh.fromOp.get(p) ?? 0, op.get(p) || 0, k));
  }

  function tickPeople(time) {
    const right = V(1, 0, 0).applyQuaternion(camera.quaternion);
    for (const p of everyone) {
      p.tick(time, camera, tints[p.room]);
      if (p.dir) p.mesh.scale.x = p.dir.dot(right) >= 0 ? 1 : -1;
    }
  }

  // ---- sizing -------------------------------------------------------------------
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'take';
  let W = 0, H = 0;
  function size(w, h, dprCap = 1.5) {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    W = Math.max(2, Math.round(w)); H = Math.max(2, Math.round(h));
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    grade.setSize(Math.round(W * dpr), Math.round(H * dpr));
    camera.aspect = W / H;
    portrait = camera.aspect < 1.2;
  }
  function draw(time) {
    tickPeople(time);
    grade.uniforms.uTime.value = time;
    grade.render(scene, camera);
  }

  // ---- still mode: render one state and hand it back ------------------------
  if (opts.still) {
    flush();
    const [w, h] = opts.aspect === 'p' ? [720, 900] : [1600, 800];
    size(w, h, 1);
    const key = String(opts.still);
    const b = key === '0' ? 1 : parseInt(key, 10);
    const st = station(key === '0' ? 0 : b);
    camera.position.copy(st.pos); camera.quaternion.copy(st.quat); camera.fov = st.fov;
    grade.uniforms.uFocus.value = st.focus; grade.uniforms.uAperture.value = st.ap;
    camera.updateProjectionMatrix();
    accState = key === '5g' ? 'guess' : 'tooey';
    Object.assign(light, PRESETS[BEAT_PRESET[b]]);
    const sh = makeShot(b, { skipAction: key !== '0' });
    sh.prevWorld = b;
    stage(sh, key === '0' ? 0 : 10);
    for (const p of everyone) p.show(op.get(p) || 0);
    draw(1.3);
    return { canvas, data: () => canvas.toDataURL('image/webp', 0.8) };
  }

  // ---- live ------------------------------------------------------------------------
  let raf = 0, running = false, last = 0, ambientUntil = 0, frameSlow = 0, frames = 0;
  let current = 0;
  function loop(now) {
    raf = 0;
    const dt = Math.min(0.1, (now - last) / 1000 || 0.016);
    last = now;
    clock += dt;
    if (shot) {
      shot.t += dt;
      stage(shot, shot.t);
      if (shot.t >= shot.T) {
        stage(shot, shot.T);
        onShotEnd(shot);
        shot = null;
        ambientUntil = clock + 4;
      }
    }
    draw(clock);
    // a slow device gets a lighter picture
    frames++;
    if (dt > 0.045) frameSlow++;
    if (frames === 40 && frameSlow > 24) { size(W, H, 1); }
    if (shot || clock < ambientUntil) raf = requestAnimationFrame(loop);
    else running = false;
  }
  function kick() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); running = true; }
  }
  let onShotEnd = () => {};
  let setToggle = () => {};

  function play(b, { replay = false } = {}) {
    if (b >= 2) flush();
    const skip = beatsPlayed.has(b) && !replay;
    if (replay) {
      // start the beat over from the previous station, so its move plays too
      const prev = station(b === 1 ? 0 : b - 1);
      camera.position.copy(prev.pos); camera.quaternion.copy(prev.quat); camera.fov = prev.fov;
      grade.uniforms.uFocus.value = prev.focus; grade.uniforms.uAperture.value = prev.ap;
      if (b !== 1) Object.assign(light, PRESETS[BEAT_PRESET[b - 1]]);
      else Object.assign(light, PRESETS.night);
    }
    const prevWorld = current || b;
    shot = makeShot(b, { skipAction: skip });
    shot.prevWorld = replay ? (b === 1 ? 1 : b - 1) : prevWorld;
    shot.t = 0;
    current = b;
    beatsPlayed.add(b);
    kick();
  }

  // initial pose: the establishing shot of the hero
  const s0 = station(0);
  camera.position.copy(s0.pos); camera.quaternion.copy(s0.quat); camera.fov = s0.fov;
  grade.uniforms.uFocus.value = s0.focus; grade.uniforms.uAperture.value = s0.ap;
  applyLight(light);
  world(1);

  jobs.splice(1, 0); // passerby first, the rest after it
  setTimeout(() => { paintSome(30); setTimeout(paintLater, 3400); }, 0);

  return {
    canvas, size, play, draw: () => draw(clock), kick,
    set onShotEnd(f) { onShotEnd = f; },
    set setToggle(f) { setToggle = f; },
    get current() { return current; },
    setAcc(v) {
      accState = v;
      if (current === 5 && !shot) {
        // a short crossfade when the owner flips it
        const from = new Map(everyone.map(p => [p, p.opacity]));
        let t0 = null;
        const step = (now) => {
          if (t0 === null) t0 = now;
          const k = clamp((now - t0) / 350);
          op.clear();
          ACT[5].run(ACT[5].dur, true);
          for (const p of everyone) p.show(lerp(from.get(p), op.get(p) || 0, k));
          draw(clock += 0.016);
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    },
    // for frame captures: render beat b at time t of a shot from beat a
    debugShot(a, b, t) {
      flush();
      const st = station(a);
      camera.position.copy(st.pos); camera.quaternion.copy(st.quat); camera.fov = st.fov;
      grade.uniforms.uFocus.value = st.focus; grade.uniforms.uAperture.value = st.ap;
      Object.assign(light, PRESETS[BEAT_PRESET[a]]);
      for (const p of everyone) p.show(0);
      op.clear();
      if (a >= 1) { world(a); ACT[a].run(ACT[a].dur, true); for (const p of everyone) p.show(op.get(p) || 0); }
      const sh = makeShot(b);
      sh.prevWorld = a || 1;
      stage(sh, t);
      draw(t);
      return sh.T;
    },
  };
}
