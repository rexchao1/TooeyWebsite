// Build-time renderer for the static images. Opened by stills.mjs in headless Chromium.
import * as THREE from 'three';
import { makeRenderer, makeScene, stationCamera, planFor } from './hero.js';
import { Station, T } from './stations.js';
import { buildWall, wallCameras } from './wall.js';

const q = new URLSearchParams(location.search);
const shot = q.get('shot') || 'hero:guess:saturday';
const W = +(q.get('w') || 1280), H = +(q.get('h') || 800);

const canvas = document.createElement('canvas');
canvas.width = W; canvas.height = H;
canvas.style.cssText = `width:${W}px;height:${H}px;display:block`;
document.body.style.cssText = 'margin:0;background:#242220';
document.body.appendChild(canvas);

const renderer = makeRenderer(canvas);
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
const scene = makeScene(renderer);

const [kind, a, b] = shot.split(':');
let cam;
const info = {};
if (kind === 'hero') {
  const st = new Station(scene, 0);
  const plan = planFor(b, a);
  st.build(plan.counts);
  plan.lamp = 1; plan.ambientT = 2.0;
  const t = q.has('t') ? +q.get('t') : T.settle;
  st.pose(t, plan);
  cam = stationCamera(0);
  cam.aspect = W / H; cam.zoom *= +(q.get('zoom') || 1); cam.updateProjectionMatrix();
  // label anchors in % of the view, for the static markup
  cam.updateMatrixWorld(); st.root.updateMatrixWorld();
  for (const [d, v0] of Object.entries(st.anchors)) {
    const v = v0.clone(); st.root.localToWorld(v); v.project(cam);
    info[d] = [((v.x + 1) / 2 * 100).toFixed(2), ((1 - v.y) / 2 * 100).toFixed(2)];
  }
  // rail position for the 86 ticket
  const r = new THREE.Vector3(-8 - 75 + 10, st.railY + 1, st.railZ + 1.3); r.project(cam);
  info.rail = [((r.x + 1) / 2 * 100).toFixed(2), ((1 - r.y) / 2 * 100).toFixed(2)];
} else if (kind === 'wall') {
  scene.environmentIntensity = 0.3;
  buildWall(scene);
  cam = wallCameras(W / H)[a];
}
renderer.render(scene, cam);
window.__info = info;
window.__done = true;
