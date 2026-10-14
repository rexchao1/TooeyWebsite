import * as THREE from 'three';

/* The lens. Scene goes to a float target with its depth; one full-screen pass
   then does a depth-of-field blur (golden-angle disc, after Dennis Gustafsson's
   single-pass bokeh), tone mapping, a soft vignette and fine grain. */

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = (maxSamples) => /* glsl */ `
#include <packing>
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 uRes;
uniform float uNear, uFar, uFocus, uAperture, uMaxBlur, uRadScale;
uniform float uGrain, uSeed, uVignette, uFade;
uniform vec3 uFadeColor;
varying vec2 vUv;

float viewZ(vec2 uv) {
  float d = texture2D(tDepth, uv).x;
  return -perspectiveDepthToViewZ(d, uNear, uFar);
}
float coc(float z) {
  return clamp(uAperture * abs(z - uFocus) / max(z, 1e-3), 0.0, uMaxBlur);
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }

void main() {
  vec2 texel = 1.0 / uRes;
  float cz = viewZ(vUv);
  float cs = coc(cz);
  vec3 col = texture2D(tColor, vUv).rgb;
  float tot = 1.0;
  if (uMaxBlur > 0.5) {
    float radius = uRadScale;
    float ang = 0.0;
    for (int i = 0; i < ${maxSamples}; i++) {
      if (radius >= uMaxBlur) break;
      vec2 tc = vUv + vec2(cos(ang), sin(ang)) * texel * radius;
      vec3 sc = texture2D(tColor, tc).rgb;
      float sz = viewZ(tc);
      float ss = coc(sz);
      if (sz > cz) ss = clamp(ss, 0.0, cs * 2.0);
      float m = smoothstep(radius - 0.5, radius + 0.5, ss);
      col += mix(col / tot, sc, m);
      tot += 1.0;
      radius += uRadScale / radius;
      ang += 2.39996323;
    }
  }
  col /= tot;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  vec2 q = vUv - 0.5;
  q.x *= uRes.x / uRes.y;
  float v = smoothstep(1.15, 0.25, length(q));
  gl_FragColor.rgb *= mix(1.0, v, uVignette);
  gl_FragColor.rgb += (hash(vUv * uRes) - 0.5) * uGrain;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, uFadeColor, uFade);
}
`;

export class Lens {
  constructor(renderer, { hi }) {
    this.renderer = renderer;
    this.hi = hi;
    const depth = new THREE.DepthTexture(1, 1);
    depth.type = THREE.UnsignedIntType;
    this.rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: hi ? 4 : 0, depthTexture: depth, depthBuffer: true });
    this.maxSamples = hi ? 110 : 48;
    this.mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag(this.maxSamples),
      uniforms: {
        tColor: { value: this.rt.texture }, tDepth: { value: depth },
        uRes: { value: new THREE.Vector2(1, 1) },
        uNear: { value: 0.05 }, uFar: { value: 40 },
        uFocus: { value: 1 }, uAperture: { value: 0 }, uMaxBlur: { value: 0 }, uRadScale: { value: 1 },
        uGrain: { value: 0.035 }, uSeed: { value: 0 }, uVignette: { value: 0.35 },
        uFade: { value: 0 }, uFadeColor: { value: new THREE.Color('#2f2d2a') }
      },
      depthTest: false, depthWrite: false
    });
    this.mat.uniforms.uFadeColor.value.setRGB(0x2f / 255, 0x2d / 255, 0x2a / 255, THREE.NoColorSpace);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    this.quad.frustumCulled = false;
    this.qscene = new THREE.Scene();
    this.qscene.add(this.quad);
    this.qcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.w = 0; this.h = 0;
  }
  setSize(w, h) {
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h;
    this.rt.setSize(w, h);
    this.mat.uniforms.uRes.value.set(w, h);
  }
  // aperture / maxBlur are given in px at a 1000 px tall frame
  render(scene, camera, { focus, aperture, maxBlur = 16, fade = 0, seed = 0 }) {
    const r = this.renderer;
    const u = this.mat.uniforms;
    const k = this.h / 1000;
    const mb = Math.max(0, maxBlur * k);
    u.uNear.value = camera.near; u.uFar.value = camera.far;
    u.uFocus.value = focus; u.uAperture.value = aperture * k; u.uMaxBlur.value = aperture > 0 ? mb : 0;
    // keep the sample count bounded: n ~ maxBlur^2 / (2 * radScale)
    u.uRadScale.value = Math.max(0.6, (mb * mb) / (2 * this.maxSamples * 0.9));
    u.uFade.value = fade; u.uSeed.value = seed;
    u.uGrain.value = 0.03;
    r.setRenderTarget(this.rt);
    r.render(scene, camera);
    r.setRenderTarget(null);
    r.render(this.qscene, this.qcam);
  }
}
