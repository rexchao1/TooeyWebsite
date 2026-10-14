// The film grade: the scene renders linear into a half-float target with its
// depth, then one pass focuses it like a lens (shallow depth of field),
// tone-maps it, tints shadows toward slate and highlights toward tungsten, and
// adds grain and a soft vignette.
import * as THREE from 'three';

export function makeGrade(renderer) {
  const target = new THREE.WebGLRenderTarget(4, 4, {
    type: THREE.HalfFloatType,
    samples: 4,
    depthBuffer: true,
  });
  target.depthTexture = new THREE.DepthTexture(4, 4);
  target.depthTexture.type = THREE.UnsignedIntType;

  // a fixed spiral of taps for the lens blur
  const TAPS = 20;
  const taps = [];
  for (let i = 0; i < TAPS; i++) {
    const r = Math.sqrt((i + 0.5) / TAPS);
    const a = i * 2.39996;
    taps.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }

  const mat = new THREE.ShaderMaterial({
    defines: { TAPS },
    uniforms: {
      tDiffuse: { value: target.texture },
      tDepth: { value: target.depthTexture },
      uTaps: { value: taps },
      uRes: { value: new THREE.Vector2(4, 4) },
      uNear: { value: 0.05 },
      uFar: { value: 60 },
      uFocus: { value: 2 },
      uAperture: { value: 0.006 },
      uTime: { value: 0 },
      uExposure: { value: 1 },
      uGrain: { value: 0.05 },
      uVig: { value: 0.35 },
      uWarm: { value: 0.5 },
      uLift: { value: 0.012 },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform sampler2D tDiffuse;
      uniform sampler2D tDepth;
      uniform vec2 uTaps[TAPS];
      uniform vec2 uRes;
      uniform float uNear, uFar, uFocus, uAperture;
      uniform float uTime, uExposure, uGrain, uVig, uWarm, uLift;
      varying vec2 vUv;
      float viewZ(vec2 uv) {
        float d = texture2D(tDepth, uv).x * 2.0 - 1.0;
        return (2.0 * uNear * uFar) / (uFar + uNear - d * (uFar - uNear));
      }
      // circle of confusion in pixels for something at distance z
      float coc(float z) {
        return min(uAperture * uRes.y * abs(z - uFocus) / max(z, 0.01), uRes.y * 0.022);
      }
      vec3 aces(vec3 x) {
        const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
      }
      float hash(vec2 p) {
        p = fract(p * vec2(443.897, 441.423));
        p += dot(p, p.yx + 19.19);
        return fract((p.x + p.y) * p.x);
      }
      vec3 toSRGB(vec3 c) {
        return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
      }
      void main() {
        float z0 = viewZ(vUv);
        float c0 = coc(z0);
        vec3 sum = texture2D(tDiffuse, vUv).rgb;
        float wsum = 1.0;
        if (c0 > 0.6) {
          for (int i = 0; i < TAPS; i++) {
            vec2 o = uTaps[i] * c0 / uRes;
            float zi = viewZ(vUv + o);
            // a sharp thing in front must not smear over what is behind it
            float w = zi < z0 ? clamp(coc(zi) / c0, 0.0, 1.0) : 1.0;
            sum += texture2D(tDiffuse, vUv + o).rgb * w;
            wsum += w;
          }
        }
        vec3 col = sum / wsum;
        col *= uExposure;
        col = aces(col);
        float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
        // split tone: slate in the shadows, tungsten in the highlights
        col += vec3(-0.012, 0.002, 0.016) * (1.0 - l) * (1.0 - l);
        col += vec3(0.03, 0.012, -0.026) * l * uWarm;
        col = max(col, 0.0);
        col = toSRGB(col);
        // lifted blacks, like print stock
        col = col * (1.0 - uLift) + uLift * vec3(0.95, 0.92, 0.88);
        vec2 d = vUv - 0.5;
        float r2 = dot(d, d);
        float n = hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5;
        col += n * uGrain * (1.0 - 0.5 * l);
        col *= 1.0 - uVig * smoothstep(0.08, 0.55, r2);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const quad = new THREE.Mesh(geo, mat);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    target,
    uniforms: mat.uniforms,
    setSize(w, h) { target.setSize(w, h); mat.uniforms.uRes.value.set(w, h); },
    render(sceneToRender, camera) {
      mat.uniforms.uNear.value = camera.near;
      mat.uniforms.uFar.value = camera.far;
      renderer.setRenderTarget(target);
      renderer.render(sceneToRender, camera);
      renderer.setRenderTarget(null);
      renderer.render(scene, cam);
    },
  };
}
