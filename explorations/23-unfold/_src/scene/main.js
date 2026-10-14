import * as THREE from 'three';
import { buildWorld, levelY, PORTIONS } from './world.js';
import { Marks } from './textures.js';
import { Lens } from './post.js';

/* ---------- timing helpers ---------- */
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lin = (t, a, b) => clamp01((t - a) / (b - a));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const sm = (t, a, b) => ease(lin(t, a, b));
const mix = (a, b, k) => a + (b - a) * k;

/* ---------- camera poses ----------
   A pose names what the frame must hold (fit w x h metres around target),
   the view direction (yaw from -z toward +x, pitch down) and the lens.
   Distance follows from the frame's aspect, so phones get a real portrait
   composition. `tall` overrides apply below aspect 1. */
const P = {
  A0: { target: [1.078, 1.372, 0.88], yaw: 1.2, pitch: 0.07, fit: [0.11, 0.11], fov: 15, aperture: 30, tall: { fit: [0.085, 0.13] } },
  A1: { target: [1.13, 1.38, 1.10], yaw: 1.15, pitch: 0.12, fit: [0.86, 0.34], fov: 22, aperture: 18, tall: { target: [1.13, 1.38, 1.09], fit: [0.68, 0.6] } },
  B: { target: [0.45, 1.18, 0.72], yaw: 0.5, pitch: 0.17, fit: [2.25, 1.1], fov: 30, aperture: 4, tall: { target: [0.8, 1.17, 0.78], yaw: 0.3, fit: [1.35, 1.1] } },
  C: { target: [4.45, 1.28, 0.78], yaw: -0.22, pitch: 0.22, fit: [3.4, 1.6], fov: 34, aperture: 3.2, tall: { target: [4.3, 1.25, 0.85], yaw: -0.15, fit: [1.9, 2.4] } },
  D: { target: [3.75, 1.15, 2.4], yaw: -0.03, pitch: 0.15, fit: [7.6, 3.1], fov: 40, aperture: 2.2, tall: { target: [4.6, 1.2, 2.8], fit: [3.2, 3.6] } },
  BC: { target: [2.6, 1.3, 1.2], yaw: 0.1, pitch: 0.16, fit: [4.5, 2.2], fov: 34, aperture: 2.5, tall: { fit: [2.6, 3.0] } },
  E0: { target: [1.12, 1.37, 1.0], yaw: 1.15, pitch: 0.12, fit: [0.5, 0.3], fov: 20, aperture: 8, tall: { fit: [0.34, 0.42] } },
  E1: { target: [1.08, 1.37, 0.88], yaw: 1.2, pitch: 0.06, fit: [0.16, 0.19], fov: 15, aperture: 26, tall: { fit: [0.15, 0.21] } }
};
function resolve(p, aspect) {
  const o = { ...p };
  if (aspect < 1 && p.tall) Object.assign(o, p.tall);
  return o;
}
function lerpPose(a, b, k) {
  const lg = (x, y) => Math.exp(mix(Math.log(x), Math.log(y), k));
  return {
    target: a.target.map((v, i) => mix(v, b.target[i], k)),
    yaw: mix(a.yaw, b.yaw, k), pitch: mix(a.pitch, b.pitch, k),
    fit: [lg(a.fit[0], b.fit[0]), lg(a.fit[1], b.fit[1])],
    fov: mix(a.fov, b.fov, k), aperture: lg(Math.max(a.aperture, 0.1), Math.max(b.aperture, 0.1))
  };
}
const _f = new THREE.Vector3();
function placeCamera(cam, pose, aspect) {
  const vf = THREE.MathUtils.degToRad(pose.fov) / 2;
  const dist = Math.max(pose.fit[1] / 2 / Math.tan(vf), pose.fit[0] / 2 / (Math.tan(vf) * aspect));
  _f.set(Math.sin(pose.yaw) * Math.cos(pose.pitch), -Math.sin(pose.pitch), -Math.cos(pose.yaw) * Math.cos(pose.pitch));
  const t = new THREE.Vector3(...pose.target);
  cam.fov = pose.fov; cam.aspect = aspect;
  cam.near = Math.max(0.02, dist * 0.25); cam.far = 40;
  cam.position.copy(t).addScaledVector(_f, -dist);
  cam.lookAt(t);
  cam.updateProjectionMatrix();
  return dist;
}

/* ---------- lighting looks ---------- */
const LOOK = {
  dawn: { sun: 1, sky: [1.0, 0.78, 0.55], prep: 0.0, hood: 0.3, pass: 0, room: 0, heat: 0, hemi: 0.1, env: 'dawn', envI: 0.32, exposure: 1.1 },
  dark: { sun: 0, sky: [0.2, 0.22, 0.3], prep: 0.0, hood: 0.3, pass: 0, room: 0, heat: 0, hemi: 0.08, env: 'dawn', envI: 0.2, exposure: 1.1 },
  service: { sun: 0, sky: [0.12, 0.16, 0.26], prep: 0.45, hood: 1, pass: 0.55, room: 0.3, heat: 1, hemi: 0.06, env: 'night', envI: 0.28, exposure: 0.82 },
  room: { sun: 0, sky: [0.05, 0.06, 0.1], prep: 0.6, hood: 1, pass: 0.8, room: 0.22, heat: 1, hemi: 0.08, env: 'night', envI: 0.45, exposure: 1.0 },
  close: { sun: 0, sky: [0.02, 0.025, 0.04], prep: 0.7, hood: 0.6, pass: 0.15, room: 0, heat: 0, hemi: 0.05, env: 'night', envI: 0.3, exposure: 0.86 }
};
function lerpLook(a, b, k) {
  const o = {};
  for (const key of Object.keys(a)) {
    if (key === 'env') o.env = k < 0.5 ? a.env : b.env;
    else if (Array.isArray(a[key])) o[key] = a[key].map((v, i) => mix(v, b[key][i], k));
    else o[key] = mix(a[key], b[key], k);
  }
  return o;
}

/* ---------- the night's tickets ----------
   minutes after 5 pm -> how many tickets on the rail (a busy middle) */
function ticketsAt(m) {
  const pts = [[0, 0.5], [40, 2.2], [90, 5.0], [140, 7.4], [190, 7.6], [235, 5.4], [275, 4.6], [300, 4.4]];
  for (let i = 1; i < pts.length; i++) if (m <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return mix(va, vb, (m - a) / (b - a)); }
  return pts[pts.length - 1][1];
}
const STATION_ON = [-1, -1, 4.0, 6.2]; // tickets needed for each station to be staffed

/* ---------- shots ----------
   Each returns everything that moves, as a function of its own time t (ms). */
const BASE = { pork: 26, porkInk: 1, porkTick: 1, porkGuess: 0, residue: 0, slaw: 20, aioli: 40, clock: 7 * 60, tickets: 0, stations: [1, 1, 0, 0], tables: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], passPlates: 0, fade: 0 };
const TABLE_ORDER = [[1, 0], [5, 0], [8, 0], [4, 1000], [0, 1450], [6, 1900], [2, 2350], [9, 2800]];

const SHOTS = {
  hero: {
    dur: 4200, prev: null,
    params(t) {
      const look = lerpLook(LOOK.dark, LOOK.dawn, sm(t, 0, 1300));
      return {
        ...BASE, look, slaw: 0, aioli: 0,
        pork: 26 * easeOut(lin(t, 400, 1600)), porkInk: lin(t, 1200, 1800), porkTick: lin(t, 1650, 1900),
        cam: { from: 'A0', to: 'A1', k: sm(t, 2000, 4200) }
      };
    }
  },
  prep: {
    dur: 2600, prev: 'hero',
    params(t) {
      return {
        ...BASE, look: LOOK.dawn,
        slaw: 20 * easeOut(lin(t, 800, 1900)), aioli: 40 * easeOut(lin(t, 1100, 2600)),
        cam: { from: 'A1', to: 'B', k: sm(t, 0, 1400) }
      };
    }
  },
  line: {
    dur: 4400, prev: 'prep',
    params(t) {
      const look = lerpLook(LOOK.dawn, LOOK.service, sm(t, 0, 1300));
      const m = 300 * lin(t, 1200, 4400);
      const f = ticketsAt(m);
      const stations = STATION_ON.map((need) => (need < 0 ? 1 : clamp01((f - need) * 2.5 + 0.5)));
      return { ...BASE, look, clock: 17 * 60 + m, tickets: f, stations, passPlates: clamp01((f - 3) / 3), cam: { from: 'B', via: 'BC', to: 'C', k: sm(t, 0, 1500) } };
    }
  },
  room: {
    dur: 3600, prev: 'line',
    params(t) {
      const look = lerpLook(LOOK.service, LOOK.room, sm(t, 0, 1300));
      const tables = BASE.tables.slice();
      for (const [i, at] of TABLE_ORDER) tables[i] = at === 0 ? 1 : easeOut(lin(t, at, at + 420));
      const f = ticketsAt(300);
      const stations = STATION_ON.map((need) => (need < 0 ? 1 : clamp01((f - need) * 2.5 + 0.5)));
      return { ...BASE, look, clock: 22 * 60, tickets: f, stations, passPlates: 0.5, tables, cam: { from: 'C', to: 'D', k: sm(t, 0, 1400) } };
    }
  },
  close: {
    dur: 3800, prev: null,
    params(t) {
      return {
        ...BASE, look: LOOK.close,
        fade: 1 - lin(t, 0, 380),
        porkGuess: lin(t, 700, 1500),
        pork: mix(26, 1, ease(lin(t, 1500, 3800))),
        residue: lin(t, 1700, 3800),
        clock: 23 * 60,
        cam: { from: 'E0', to: 'E1', k: sm(t, 0, 1300) }
      };
    }
  }
};

/* ---------- environment light for reflections ---------- */
function makeEnv(renderer, kind) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.11, 0.1, 0.09), side: THREE.BackSide }));
  env.add(room);
  const panel = (w, h, color, k, x, y, z, ry, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m);
  };
  if (kind === 'dawn') {
    panel(6, 4, '#ffcf95', 4, -9.8, 1.5, -3, Math.PI / 2);
    panel(10, 0.6, '#ffe6c4', 0.6, 0, 3.9, 0, 0, Math.PI / 2);
    panel(4, 1.2, '#ffd9a8', 1.2, 9.8, 1.6, -2, -Math.PI / 2);
    panel(3, 2, '#ffd2a0', 3, -2, 1.6, -9.8, 0);
    panel(20, 2, '#5a3a2a', 0.6, 0, -3.9, 0, 0, -Math.PI / 2);
  } else {
    panel(3, 0.6, '#fff0da', 4, -3, 3.9, 0, 0, Math.PI / 2);
    panel(3, 0.6, '#fff0da', 4, 3, 3.9, 0, 0, Math.PI / 2);
    panel(8, 1.4, '#ffcf98', 2.4, 9.8, 1.8, 0, -Math.PI / 2);
    panel(6, 4, '#202838', 0.6, -9.8, 1.5, 0, Math.PI / 2);
    panel(20, 2, '#3a2a20', 0.4, 0, -3.9, 0, 0, -Math.PI / 2);
  }
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(env, 0.04);
  pm.dispose();
  return rt.texture;
}

/* ---------- boot ---------- */
async function boot() {
  const params = new URLSearchParams(location.search);
  const capture = params.has('capture');
  const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || Math.min(screen.width, screen.height) < 600;
  const hi = params.get('tier') === 'low' ? false : capture || !mobile;
  try { await document.fonts.load('100px "Permanent Marker"'); } catch (e) { /* draws in fallback */ }

  const glCanvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = new URLSearchParams(location.search).get('tm') === 'agx' ? THREE.AgXToneMapping : THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(1);

  const S = buildWorld({ quality: hi ? 'high' : 'low' });
  const scene = S.scene;
  const envs = { dawn: makeEnv(renderer, 'dawn'), night: makeEnv(renderer, 'night') };
  scene.environment = envs.dawn;
  const marks = new Marks();
  // tick at Tooey's 26; the guess at 34; both on the tape side (u 0.5)
  marks.setup({ tickV: levelY(26) / 0.135, tickU0: 0.455, tickU1: 0.49, guessV: levelY(34) / 0.135, u0: 0.43, u1: 0.53, text: 'GUESS 34', size: 44 });
  S.quarts.pork.addMarks(marks);
  const lens = new Lens(renderer, { hi });
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40);

  const sunMax = 9;
  const stationPoints = S.lights.points.slice(0, 4);
  const tablePoints = S.lights.points.slice(4);
  stationPoints.forEach((p, i) => { p.position.set(S.stations[i].cx, 1.72, 0.68); p.distance = 2.4; });
  // the two table lamps nearest the room camera get real light; the rest glow and pool
  const litTables = [4, 5];
  tablePoints.forEach((p, i) => { p.position.copy(S.tables[litTables[i]].lampPos); p.distance = 1.8; p.decay = 2; });

  function apply(p) {
    const L = p.look;
    S.lights.sun.intensity = L.sun * sunMax;
    S.sky.color.setRGB(L.sky[0], L.sky[1], L.sky[2]).multiplyScalar(2.6);
    S.lights.hemi.intensity = L.hemi;
    S.lights.prepLight.intensity = L.prep * 26;
    S.lights.passLight.intensity = L.pass * 22;
    S.lights.roomLight.intensity = L.room * 30;
    scene.environment = envs[L.env];
    scene.environmentIntensity = L.envI;
    renderer.toneMappingExposure = L.exposure;
    S.heat.forEach((h) => { h.material.emissiveIntensity = L.heat * 2.2; });
    // quarts
    S.quarts.pork.setLevel(levelY(p.pork));
    S.quarts.pork.tape.set(1, p.porkInk);
    marks.draw(p.porkTick, p.porkGuess, p.residue, levelY(p.pork) / 0.135);
    S.quarts.slaw.setLevel(levelY(Math.min(p.slaw, PORTIONS) * 0.9));
    S.quarts.aioli.setLevel(levelY(Math.min(p.aioli / 48 * PORTIONS, PORTIONS)));
    // line
    S.stations.forEach((st, i) => {
      const on = p.stations[i] * L.hood;
      const k = p.stations[i];
      st.hoodLight.material.emissiveIntensity = mix(0.25, 3.2, k) * L.hood;
      st.flame.material.opacity = k * 0.9 * (L.heat > 0.1 ? 1 : 0);
      st.glow.material.opacity = k * 0.55 * (L.heat > 0.1 ? 1 : 0);
      st.pan.visible = k > 0.02;
      st.pan.position.y = 0.887 + (1 - k) * 0.02;
      stationPoints[i].intensity = on * 3.2 + L.hood * 0.25;
    });
    S.tickets.forEach((tk, i) => {
      const k = clamp01(p.tickets - i);
      tk.mesh.visible = k > 0.01;
      tk.mesh.position.x = tk.home - (1 - easeOut(k)) * 0.5;
      tk.mesh.rotation.set(tk.tilt * 2, 0, tk.tilt);
      tk.mesh.material.opacity = 1;
    });
    S.passPlates.forEach((pl, i) => { const v = clamp01(p.passPlates * 4 - i); pl.visible = v > 0.05; });
    const mins = p.clock;
    S.clock.minPivot.rotation.z = -((mins % 60) / 60) * Math.PI * 2;
    S.clock.hourPivot.rotation.z = -(((mins / 60) % 12) / 12) * Math.PI * 2;
    // room
    S.tables.forEach((tb, i) => {
      const k = p.tables[i];
      tb.shade.emissiveIntensity = k * 2.4;
      tb.bulb.visible = k > 0.4;
      tb.pool.opacity = k * 0.5;
      tb.plates.forEach((pl, j) => { const v = clamp01(k * 2 - j * 0.6); pl.visible = v > 0.05; pl.scale.setScalar(0.85 + 0.15 * v); });
    });
    tablePoints.forEach((pt, i) => { pt.intensity = p.tables[litTables[i]] * 1.6; });
  }

  const poseCache = {};
  let lastShot = null;
  function render(shot, t, w, h, { cut = false } = {}) {
    const def = SHOTS[shot];
    if (shot !== lastShot) { marks.key = ''; lastShot = shot; }
    const p = def.params(Math.max(0, Math.min(def.dur, t)));
    if (cut) {
      // arrived by a jump: keep the action, skip the travel and the light change
      p.cam.k = 1; if (shot !== 'hero') p.look = def.params(def.dur).look;
    }
    apply(p);
    const aspect = w / h;
    const a = resolve(P[p.cam.from], aspect), b = resolve(P[p.cam.to], aspect);
    let pose;
    if (p.cam.via) {
      // two legs through the open room, so the camera never passes a wall
      const v = resolve(P[p.cam.via], aspect);
      pose = p.cam.k < 0.5 ? lerpPose(a, v, p.cam.k * 2) : lerpPose(v, b, (p.cam.k - 0.5) * 2);
    } else pose = lerpPose(a, b, p.cam.k);
    const dist = placeCamera(camera, pose, aspect);
    renderer.setSize(w, h, false);
    lens.setSize(w, h);
    lens.render(scene, camera, { focus: dist, aperture: pose.aperture, maxBlur: 15, fade: p.fade, seed: (t * 0.013) % 7 });
    poseCache[shot] = pose;
    return glCanvas;
  }

  /* ---------- bands ---------- */
  const order = ['hero', 'prep', 'line', 'room', 'close'];
  const bands = [...document.querySelectorAll('.shot[data-shot]')].map((el) => {
    const c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    el.appendChild(c);
    return { el, canvas: c, ctx: c.getContext('2d'), shot: el.dataset.shot, state: 'idle', t: 0, cut: false };
  });
  const byShot = Object.fromEntries(bands.map((b) => [b.shot, b]));
  const dpr = Number(params.get('dpr')) || Math.min(window.devicePixelRatio || 1, hi ? 2 : 1.5);
  const sizeOf = (b) => {
    const r = b.el.getBoundingClientRect();
    return [Math.max(2, Math.round(r.width * dpr)), Math.max(2, Math.round(r.height * dpr))];
  };
  function draw(b, t) {
    const [w, h] = sizeOf(b);
    if (b.canvas.width !== w || b.canvas.height !== h) { b.canvas.width = w; b.canvas.height = h; }
    const src = render(b.shot, t, w, h, { cut: b.cut });
    b.ctx.drawImage(src, 0, 0, w, h);
    if (!b.el.classList.contains('is-live')) b.el.classList.add('is-live');
  }

  // capture hooks for posters and frame sequences
  window.__unfold = {
    shots: Object.fromEntries(order.map((k) => [k, SHOTS[k].dur])),
    frame(shot, t, w, h, type = 'image/webp', q = 0.86, cut = false) {
      const src = render(shot, t, w, h, { cut });
      return src.toDataURL(type, q);
    },
    seek(shot, t) { const b = byShot[shot]; if (!b) return; b.state = 'done'; b.t = t; draw(b, t); },
    hold: capture,
    S, renderer
  };
  if (capture) { document.documentElement.classList.add('capture-ready'); return; }

  // compile shaders before the first frame so dawn does not open on a stall
  try { placeCamera(camera, resolve(P.A0, 1), 1); apply(SHOTS.hero.params(0)); await renderer.compileAsync(scene, camera); } catch (e) { /* first frame compiles instead */ }

  let active = null, last = 0, raf = 0;
  const log = (window.__unfold.log = []);
  const stamp = (what, b) => log.push([what, b.shot, Math.round(performance.now())]);
  function finish(b) { b.state = 'done'; b.t = SHOTS[b.shot].dur; draw(b, b.t); stamp('done', b); }
  function play(b) {
    if (b.state === 'playing' || b.state === 'done') return;
    if (active && active !== b) finish(active);
    const prev = SHOTS[b.shot].prev;
    b.cut = !!prev && byShot[prev] && byShot[prev].state !== 'done';
    b.state = 'playing'; b.t = 0; active = b; stamp(b.cut ? 'play-cut' : 'play', b);
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    if (!active) return;
    if (document.hidden) { last = now; raf = requestAnimationFrame(tick); return; }
    const dt = Math.min(250, now - last); last = now;
    active.t += dt;
    const dur = SHOTS[active.shot].dur;
    if (active.t >= dur) { finish(active); active = null; return; }
    draw(active, active.t);
    raf = requestAnimationFrame(tick);
  }
  function prime(b) {
    if (b.state !== 'idle') return;
    const prev = SHOTS[b.shot].prev;
    b.cut = !!prev && byShot[prev] && byShot[prev].state !== 'done';
    b.state = 'primed';
    draw(b, 0);
  }

  const near = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const b = bands.find((x) => x.el === e.target);
      if (b && b.shot !== 'hero' && e.isIntersecting) prime(b);
    }
  }, { rootMargin: '40% 0px 40% 0px' });
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const b = bands.find((x) => x.el === e.target);
      if (b && b.shot !== 'hero' && e.isIntersecting && e.intersectionRatio >= 0.34) { prime(b); play(b); }
    }
  }, { threshold: [0.35] });
  bands.forEach((b) => { near.observe(b.el); seen.observe(b.el); });
  if (byShot.hero) {
    // too late to open on dawn: the still is already showing, so hold its frame
    if (!document.documentElement.classList.contains('motion')) finish(byShot.hero);
    else play(byShot.hero);
  }

  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      for (const b of bands) {
        if (b === active) continue;
        if (b.state === 'done') draw(b, SHOTS[b.shot].dur);
        else if (b.state === 'primed') draw(b, 0);
      }
    }, 180);
  });
}

boot().catch((e) => { document.documentElement.classList.remove('motion'); console.warn('Scene unavailable; keeping stills.', e); });
