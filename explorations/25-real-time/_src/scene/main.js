// One kitchen, rendered live. Each figure on the page is a camera in it.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { buildRoom } from './build.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - clamp(t), 3);
const easeIO = t => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const params = new URLSearchParams(location.search);
const STILL = params.get('still');

// ---------- lighting presets ----------
const PRESETS = {
  predawn: { sun: 0.0, sunCol: 0xffd6a8, sunDir: [-1, 0.42, 0.55], win: 0.8, winCol: 0x9fb2c8, store: 0, ceil: 0, env: 'dawn', envI: 0.18, hemi: 0.05, exp: 0.95, sky: 0x6f7f95, shadowAt: [-2.2, 0.9, -2.2], shadowR: 3.2 },
  dawn:    { sun: 3.2, sunCol: 0xffdcb0, sunDir: [-1, 0.42, 0.55], win: 2.6, winCol: 0xd4dfeb, store: 0, ceil: 0, env: 'dawn', envI: 0.55, hemi: 0.3, exp: 1.0, sky: 0xffffff, shadowAt: [-2.2, 0.9, -2.2], shadowR: 3.2 },
  morning: { sun: 3.6, sunCol: 0xffe7c8, sunDir: [-1, 0.6, 0.45], win: 3.0, winCol: 0xe0e8ef, store: 0, ceil: 0, env: 'dawn', envI: 0.7, hemi: 0.3, exp: 1.0, sky: 0xffffff, shadowAt: [-2.2, 0.9, -2.2], shadowR: 3.2 },
  evening: { sun: 1.1, sunCol: 0xfff0dc, sunDir: [-0.35, 1, 0.45], win: 0.25, winCol: 0x6d7f9a, store: 0, ceil: 16, env: 'night', envI: 0.6, hemi: 0.25, exp: 1.0, sky: 0x3a4a63, shadowAt: [1.2, 1, -2.0], shadowR: 2.6 },
  day:     { sun: 3.4, sunCol: 0xfff0dc, sunDir: [1, 0.62, -0.42], win: 0, winCol: 0xffffff, store: 3.2, ceil: 0, env: 'day', envI: 0.7, hemi: 0.15, exp: 1.0, sky: 0xffffff, shadowAt: [6.2, 0.5, 0], shadowR: 5.2 },
  night:   { sun: 1.4, sunCol: 0xfff3e2, sunDir: [0.1, 1, 0.4], win: 0.08, winCol: 0x445570, store: 0, ceil: 16, env: 'night', envI: 0.55, hemi: 0.25, exp: 1.15, sky: 0x1b2333, shadowAt: [-2.2, 0.9, -2.2], shadowR: 3 },
};

function mix(a, b, k) {
  const o = {};
  for (const key in b) {
    const x = a[key], y = b[key];
    if (typeof y === 'number' && key.endsWith('Col') || key === 'sky') {
      o[key] = new THREE.Color(x).lerp(new THREE.Color(y), k).getHex();
    } else if (typeof y === 'number') o[key] = lerp(x, y, k);
    else if (Array.isArray(y)) o[key] = y.map((v, i) => lerp(x[i], v, k));
    else o[key] = k < 0.5 ? x : y;
  }
  return o;
}

// ---------- views ----------
// Each camera: position, look-at, vertical fov, and `level` (keep verticals
// straight with a shifted lens, as an architectural photographer would).
const VIEWS = {
  hero: {
    dur: 2.4, drift: true,
    cams: {
      wide: { pos: [-1.72, 1.42, -1.02], look: [-3.0, 1.06, -2.62], fov: 31, level: true, ar: 2000 / 952 },
      tall: { pos: [-3.0, 1.3, -1.42], look: [-3.03, 1.03, -2.62], fov: 50, level: true, ar: 1 },
    },
  },
  prep: {
    dur: 2.5,
    cams: {
      wide: { pos: [-1.05, 1.66, -1.78], look: [-1.22, 0.9, -2.6], fov: 34, ar: 1.6 },
      tall: { pos: [-1.1, 1.82, -1.86], look: [-1.22, 0.9, -2.6], fov: 40, ar: 4 / 3 },
    },
  },
  shifts: {
    dur: 3.4,
    cams: {
      wide: { pos: [-0.25, 1.6, -0.75], look: [1.6, 1.62, -2.6], fov: 50, level: true, ar: 4 / 3 },
      tall: { pos: [-0.25, 1.6, -0.75], look: [1.6, 1.62, -2.6], fov: 52, level: true, ar: 4 / 3 },
    },
  },
  growth: {
    dur: 3.0,
    cams: {
      wide: { pos: [2.45, 1.62, 3.55], look: [7.0, 0.72, -0.6], fov: 50, level: true, ar: 4 / 3 },
      tall: { pos: [2.45, 1.62, 3.55], look: [6.6, 0.75, -0.5], fov: 56, level: true, ar: 4 / 3 },
    },
  },
  accuracy: {
    dur: 3.8,
    cams: {
      wide: { pos: [-2.565, 1.86, -1.62], look: [-2.565, 0.9, -2.62], fov: 33, ar: 2000 / 857 },
      tall: { pos: [-2.565, 2.25, -1.92], look: [-2.565, 0.9, -2.6], fov: 44, ar: 4 / 3 },
    },
  },
};

export async function start() {
  const html = document.documentElement;
  const figs = STILL ? [] : [...document.querySelectorAll('.shot[data-view]')];

  // ---------- renderer ----------
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!STILL });
  } catch (e) {
    html.classList.add('no-gl');
    return;
  }
  const phone = Math.min(screen.width, screen.height) < 700;
  const lite = phone && !STILL;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(1);
  RectAreaLightUniformsLib.init();
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); html.classList.add('no-gl'); stopped = true; });

  // labels and the clock face are drawn in the page font
  try {
    await Promise.race([
      Promise.all([document.fonts.load('600 64px "Hanken Grotesk"'), document.fonts.load('700 200px "Hanken Grotesk"'), document.fonts.load('500 52px "Hanken Grotesk"')]),
      new Promise(r => setTimeout(r, 1500)),
    ]);
  } catch (e) { /* draw with the fallback face */ }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x242220);
  const room = buildRoom({ lite });
  scene.add(room.root);

  // ---------- lights ----------
  const sun = new THREE.DirectionalLight(0xffffff, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.015; sun.shadow.radius = 2.5;
  scene.add(sun, sun.target);
  const winLight = new THREE.RectAreaLight(0xffffff, 0, 3.0, 1.6);
  winLight.position.set(-3.95, 1.85, -1.2); winLight.lookAt(0, 1.85, -1.2); scene.add(winLight);
  const storeLight = new THREE.RectAreaLight(0xffffff, 0, 7.6, 2.4);
  storeLight.position.set(9.85, 1.7, 0); storeLight.lookAt(0, 1.7, 0); scene.add(storeLight);
  const ceil = [[-2.1, -1.7], [0.3, -0.6]].map(([x, z]) => {
    const l = new THREE.RectAreaLight(0xfff3e2, 0, 1.2, 0.27);
    l.position.set(x, 2.93, z); l.lookAt(x, 0, z); scene.add(l); return l;
  });
  const hemi = new THREE.HemisphereLight(0xdfe6ee, 0x6b6157, 0.1); scene.add(hemi);

  // ---------- environment maps for reflections in steel and porcelain ----------
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envs = { dawn: makeEnv('dawn'), day: makeEnv('day'), night: makeEnv('night') };
  function makeEnv(kind) {
    const s = new THREE.Scene();
    const shell = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 12), new THREE.MeshBasicMaterial({ color: kind === 'night' ? 0xa29d95 : 0xd8d3ca, side: THREE.BackSide }));
    shell.position.y = 2; s.add(shell);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: kind === 'night' ? 0x6a655e : 0xa49e94 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; s.add(floor);
    const panel = (w, h, c, k, x, y, z, ry, rx = 0) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
    };
    if (kind === 'dawn') { panel(4, 1.8, 0xdfe7f0, 6, -5.9, 1.9, -0.5, Math.PI / 2); panel(1.2, 0.3, 0xffffff, 1.5, 0, 3.95, 0, 0, Math.PI / 2); }
    if (kind === 'day') { panel(10, 2.6, 0xfff6e8, 7, 5.9, 1.7, 0, -Math.PI / 2); panel(3, 0.4, 0xffffff, 1.2, 0, 3.95, 0, 0, Math.PI / 2); }
    if (kind === 'night') { [-2, 2].forEach(x => panel(1.3, 0.3, 0xfff1dc, 9, x, 3.95, 0, 0, Math.PI / 2)); panel(4, 1.8, 0x31405a, 0.6, -5.9, 1.9, -0.5, Math.PI / 2); }
    const rt = pmrem.fromScene(s, 0.03);
    return rt.texture;
  }

  const tmpC = new THREE.Color();
  // reflections: each lighting is captured once from inside the room itself
  const CAP = { dawn: [-2.4, 1.25, -1.7], morning: [-2.0, 1.25, -1.8], evening: [0.6, 1.5, -1.6], day: [5.5, 1.3, 1.0], night: [-2.4, 1.25, -1.8] };
  const capCache = {};
  function envFor(name, view) {
    if (capCache[name]) return capCache[name];
    baseState(view);
    setLight(PRESETS[name], null);
    scene.environmentIntensity = 1;
    hemi.intensity = Math.max(hemi.intensity, 0.6);
    // in the capture, metal reads as the light grey it looks like in a room
    const saved = room.M.metals.map(m => [m.metalness, m.roughness]);
    room.M.metals.forEach(m => { m.metalness = 0.35; m.roughness = 0.6; });
    const rt = pmrem.fromScene(scene, 0, 0.05, 40, { size: lite ? 128 : 256, position: V(...CAP[name]) });
    room.M.metals.forEach((m, i) => { m.metalness = saved[i][0]; m.roughness = saved[i][1]; });
    capCache[name] = rt.texture;
    return rt.texture;
  }

  function setLight(p, name) {
    const d = V(...p.sunDir).normalize();
    const at = V(...p.shadowAt);
    sun.target.position.copy(at);
    sun.position.copy(at).addScaledVector(d, 12);
    sun.intensity = p.sun; sun.color.setHex(p.sunCol);
    sun.visible = p.sun > 0.01;
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -p.shadowR; sc.right = sc.top = p.shadowR; sc.near = 1; sc.far = 26;
    sc.updateProjectionMatrix();
    winLight.intensity = p.win; winLight.color.setHex(p.winCol); winLight.visible = p.win > 0.01;
    storeLight.intensity = p.store; storeLight.visible = p.store > 0.01;
    ceil.forEach(l => { l.intensity = p.ceil; l.visible = p.ceil > 0.01; });
    room.lens.emissiveIntensity = p.ceil * 0.35;
    hemi.intensity = p.hemi;
    scene.environment = (name && capCache[name]) || envs[p.env];
    scene.environmentIntensity = p.envI;
    renderer.toneMappingExposure = p.exp;
    room.M.skyMat.color.copy(tmpC.setHex(p.sky)).multiplyScalar(p.sky === 0xffffff ? 1.25 : 1);
  }

  // ---------- object states ----------
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 60);
  const outward = new THREE.Vector3();
  const labelHome = room.labels.map(l => ({ p: l.position.clone(), n: V(0, 0, 1).applyEuler(l.rotation) }));
  const qUp = new THREE.Quaternion(), qDown = new THREE.Quaternion();

  function baseState(view) {
    room.hero.visible = view === 'hero' || view === 'prep';
    room.trayHero.group.visible = view === 'prep';
    room.acc.visible = view === 'accuracy';
    room.dining.visible = true;
    room.labels.forEach((l, i) => { l.visible = true; l.position.copy(labelHome[i].p); l.material.opacity = 1; });
    room.trayHero.nests.forEach(n => { n.visible = true; n.position.copy(n.userData.home); n.scale.setScalar(1); });
    room.aprons.forEach(a => { a.visible = true; a.position.copy(a.userData.home); a.material.opacity = 1; });
    setClock(15.5);
    room.tables.forEach(t => setTable(t, 1));
  }

  function setClock(h) {
    const m = (h % 1) * 60;
    room.minHand.rotation.z = -(m / 60) * Math.PI * 2;
    room.hourHand.rotation.z = -((h % 12) / 12) * Math.PI * 2;
  }

  // chair placement: k=0 upturned on the table, k=1 down at the table
  const e1 = new THREE.Euler();
  function setTable(t, k) {
    t.chairs.forEach(({ mesh, side }, i) => {
      const kk = clamp(k * 1.25 - i * 0.25);
      const p = ease(kk);
      const yaw = side < 0 ? 0 : Math.PI;
      qDown.setFromEuler(e1.set(0, yaw, 0));
      qUp.setFromEuler(e1.set(Math.PI, yaw + Math.PI, 0));
      mesh.quaternion.slerpQuaternions(qUp, qDown, p);
      const upPos = V(0, 0.763 + 0.47, side * 0.17);
      const downPos = V(0, 0, side * 0.55);
      mesh.position.lerpVectors(upPos, downPos, p);
      mesh.position.y += Math.sin(p * Math.PI) * 0.18;
    });
    t.set.visible = k >= 0.999 || (k > 0.75);
    t.set.scale.setScalar(k >= 1 ? 1 : clamp((k - 0.75) / 0.25) * 0.999 + 0.001);
  }

  const PRESET_OF = { hero: 'dawn', prep: 'morning', shifts: 'evening', growth: 'day', accuracy: 'night' };
  function applyView(view, t) {
    envFor(PRESET_OF[view], view);
    baseState(view);
    if (view === 'hero') {
      const k = easeIO(t / 1.6);
      setLight(mix(PRESETS.predawn, PRESETS.dawn, k), 'dawn');
      // the four labels go on, one after another
      room.labels.slice(0, 4).forEach((l, i) => {
        const p = clamp((t - (0.75 + i * 0.36)) / 0.24);
        l.visible = p > 0;
        const e = ease(p);
        l.position.copy(labelHome[i].p).addScaledVector(labelHome[i].n, 0.025 * (1 - e));
        l.material.opacity = clamp(p * 3);
      });
    } else if (view === 'prep') {
      setLight(PRESETS.morning, 'morning');
      room.trayHero.nests.forEach((n, i) => {
        const t0 = i < 24 ? 0.35 + i * 0.05 : 1.75 + (i - 24) * 0.3;
        const p = clamp((t - t0) / 0.2);
        n.visible = p > 0;
        n.position.y = n.userData.home.y + 0.04 * (1 - ease(p));
      });
      room.trayHero.label.visible = t > 2.15;
      if (t > 2.15) {
        const p = clamp((t - 2.15) / 0.22);
        const i = room.labels.indexOf(room.trayHero.label);
        room.trayHero.label.position.copy(labelHome[i].p).addScaledVector(labelHome[i].n, 0.025 * (1 - ease(p)));
        room.trayHero.label.material.opacity = clamp(p * 3);
      }
    } else if (view === 'shifts') {
      setLight(PRESETS.evening, 'evening');
      // 3:30 to 7:30. Cooks on: 2 by 4:00, 3 by 5:00, 5 by 6:30. The sixth stays.
      const clockH = 15.5 + 4 * clamp((t - 0.4) / 2.7);
      setClock(clockH);
      const takeAt = [16.0, 15.75, 17.0, 18.25, 18.5];
      const order = [5, 4, 3, 2, 1];
      order.forEach((ai, j) => {
        const a = room.aprons[ai];
        const p = clamp((clockH - takeAt[j]) / 0.45);
        if (p <= 0) return;
        const e = ease(p);
        a.position.copy(a.userData.home);
        a.position.y += 0.18 * e;
        a.position.x -= 0.5 * e * e;
        a.material.opacity = 1 - clamp((p - 0.3) / 0.7);
        a.visible = p < 1;
      });
    } else if (view === 'growth') {
      setLight(PRESETS.day, 'day');
      // nearest tables first, so the big moves settle early and the room fills toward the window
      const open = room.tables.filter(x => x.open).sort((p, q) => q.group.position.z - p.group.position.z || p.group.position.x - q.group.position.x);
      room.tables.forEach(x => setTable(x, 0));
      open.forEach((x, j) => setTable(x, clamp((t - (0.45 + j * 0.24)) / 0.6)));
    } else if (view === 'accuracy') {
      setLight(PRESETS.night, 'night');
      const sold = Math.floor(clamp((t - 0.6) / 2.4) * 24 + 1e-6);
      [room.trayGuess, room.trayTooey].forEach(tr => tr.nests.forEach((n, i) => {
        n.visible = i >= sold;
      }));
      const fp = easeIO((t - 3.15) / 0.6);
      room.film.visible = fp > 0.001;
      room.film.scale.z = Math.max(0.001, fp);
    }
  }

  // ---------- camera with an optional shifted lens ----------
  const look = new THREE.Vector3(), pos = new THREE.Vector3();
  function setCamera(view, aspect, t, now) {
    const c = VIEWS[view].cams[STILL ? (params.get('cam') || (aspect < 1.25 ? 'tall' : 'wide')) : window.innerWidth < 700 ? 'tall' : 'wide'];
    pos.set(...c.pos); look.set(...c.look);
    // a short push in as the shot starts (sections only), and a tiny drift on the hero
    if (!VIEWS[view].drift) {
      const k = 1 + 0.035 * (1 - ease(t / 1.2));
      pos.sub(look).multiplyScalar(k).add(look);
    } else if (now != null) {
      const s = now / 1000;
      pos.x += Math.sin(s * 0.21) * 0.012;
      pos.y += Math.sin(s * 0.17 + 1) * 0.006;
      pos.z += Math.cos(s * 0.13) * 0.01;
    }
    // behave like object-fit: cover on the designed frame, so live and still match
    camera.fov = aspect > c.ar ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(c.fov / 2)) * c.ar / aspect)) : c.fov;
    camera.aspect = aspect;
    camera.position.copy(pos);
    if (c.level) {
      camera.lookAt(look.x, pos.y, look.z);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      const v = look.clone().applyMatrix4(camera.matrixWorldInverse);
      const f = 1 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const ndcY = (f * v.y) / -v.z;
      camera.projectionMatrix.elements[9] = ndcY;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    } else {
      camera.lookAt(look);
      camera.updateProjectionMatrix();
    }
  }

  // ---------- still mode: render one frame for the fallback images ----------
  if (STILL) {
    const w = +params.get('w') || 1600, h = +params.get('h') || 900;
    const t = params.get('pre') ? 0 : params.has('t') ? +params.get('t') : 99;
    renderer.setSize(w, h, false);
    applyView(STILL, t);
    setCamera(STILL, w / h, t, null);
    renderer.render(scene, camera);
    window.__still = renderer.domElement.toDataURL('image/png');
    return;
  }

  // ---------- live: one renderer copies frames into each figure's canvas ----------
  const dprCap = phone ? 1.25 : 1.5;
  const state = figs.map(el => ({
    el, view: el.dataset.view, canvas: el.querySelector('canvas'), ctx: null,
    visible: false, started: null, done: false, w: 0, h: 0, dirty: true, live: false,
  }));
  state.forEach(s => { s.ctx = s.canvas.getContext('2d'); });
  const t0 = performance.now();
  let stopped = false;

  function size() {
    let mw = 1, mh = 1;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    state.forEach(s => {
      const r = s.canvas.getBoundingClientRect();
      s.w = Math.max(2, Math.round(r.width * dpr)); s.h = Math.max(2, Math.round(r.height * dpr));
      if (s.canvas.width !== s.w || s.canvas.height !== s.h) { s.canvas.width = s.w; s.canvas.height = s.h; }
      mw = Math.max(mw, s.w); mh = Math.max(mh, s.h); s.dirty = true;
    });
    renderer.setSize(mw, mh, false);
  }
  size();
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(size, 120); });

  const io = new IntersectionObserver(entries => entries.forEach(en => {
    const s = state.find(x => x.el === en.target);
    s.visible = en.isIntersecting;
    if (en.isIntersecting && en.intersectionRatio >= 0.35 && s.started == null) s.started = performance.now();
    if (en.isIntersecting) s.dirty = true;
  }), { threshold: [0, 0.35, 0.6] });
  state.forEach(s => io.observe(s.el));

  // the hero starts at once; if the scene is late, it shows the finished frame instead
  const hero = state.find(s => s.view === 'hero');
  const late = !params.has('intro') && (performance.now() > 2200 || html.classList.contains('hero-still'));
  if (hero) hero.started = late ? -1e9 : performance.now();

  let lastAmbient = 0, slow = 0, lastFrame = 0, rendered = false;
  function frame(now) {
    if (stopped) return;
    requestAnimationFrame(frame);
    if (document.hidden) { lastFrame = 0; return; }
    // a device that cannot keep up keeps its stills between shots: no drift
    if (rendered && lastFrame && now - lastFrame > 90) slow++;
    else if (rendered && lastFrame && slow < 5) slow = Math.max(0, slow - 0.25);
    lastFrame = now; rendered = false;
    for (const s of state) {
      if (!s.visible) continue;
      const begun = s.started != null;
      const t = begun ? (now - s.started) / 1000 : 0;
      const animating = begun && t < VIEWS[s.view].dur + 0.3;
      const ambient = VIEWS[s.view].drift && slow < 5 && now - lastAmbient > 33;
      if (!(animating || ambient || s.dirty)) continue;
      renderer.setViewport(0, 0, s.w, s.h);
      renderer.setScissor(0, 0, s.w, s.h);
      renderer.setScissorTest(true);
      applyView(s.view, begun ? t : 0);
      setCamera(s.view, s.w / s.h, begun ? t : 0, VIEWS[s.view].drift ? now : null);
      renderer.render(scene, camera);
      const H = renderer.domElement.height;
      s.ctx.drawImage(renderer.domElement, 0, H - s.h, s.w, s.h, 0, 0, s.w, s.h);
      s.dirty = false; rendered = true;
      if (!s.live) { s.live = true; s.el.classList.add('live'); }
      if (s.view === 'hero' && begun && t > VIEWS.hero.dur) html.classList.add('hero-done');
      if (VIEWS[s.view].drift) lastAmbient = now;
    }
  }
  requestAnimationFrame(frame);
  html.classList.add('gl');
}
