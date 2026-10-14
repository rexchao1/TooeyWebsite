/* Light only. A render is reduced to its pools and edges of light: what is
   lit stays, in porcelain and lamplight, and everything unlit falls away
   into the basalt ground. The finished light is computed once per image and
   canvas size, then a small WebGL shader switches the lights on in order
   against a progress value from 0 (dark) to 1 (all on). Adapted from the
   samples page's "Light only" treatment. No libraries. */
(function () {
  'use strict';

  var HEX = { porcelain: '#f2f1ec', lamp: '#f1d2a0' };
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var C = { porcelain: rgb(HEX.porcelain), lamp: rgb(HEX.lamp) };

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  function down(src, w, h, f) {
    var dw = Math.ceil(w / f), dh = Math.ceil(h / f), out = new Float32Array(dw * dh), n = new Float32Array(dw * dh);
    for (var y = 0; y < h; y++) {
      var dy = (y / f) | 0, row = dy * dw;
      for (var x = 0; x < w; x++) { var i = row + ((x / f) | 0); out[i] += src[y * w + x]; n[i]++; }
    }
    for (var j = 0; j < out.length; j++) out[j] /= n[j];
    return { a: out, w: dw, h: dh, f: f };
  }
  function blur(m, r) {
    var w = m.w, h = m.h, a = m.a, t = new Float32Array(a.length), pass, x, y, s, k;
    if (r < 1) return m;
    for (pass = 0; pass < 3; pass++) {
      for (y = 0; y < h; y++) {
        s = 0;
        for (k = -r; k <= r; k++) s += a[y * w + clamp(k, 0, w - 1)];
        for (x = 0; x < w; x++) {
          t[y * w + x] = s / (2 * r + 1);
          s += a[y * w + Math.min(x + r + 1, w - 1)] - a[y * w + Math.max(x - r, 0)];
        }
      }
      for (x = 0; x < w; x++) {
        s = 0;
        for (k = -r; k <= r; k++) s += t[clamp(k, 0, h - 1) * w + x];
        for (y = 0; y < h; y++) {
          a[y * w + x] = s / (2 * r + 1);
          s += t[Math.min(y + r + 1, h - 1) * w + x] - t[Math.max(y - r, 0) * w + x];
        }
      }
    }
    return m;
  }
  function sampler(m) {
    var w = m.w, h = m.h, a = m.a, f = m.f;
    return function (x, y) {
      var fx = clamp(x / f - 0.5, 0, w - 1.001), fy = clamp(y / f - 0.5, 0, h - 1.001);
      var x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0, i = y0 * w + x0;
      return (a[i] * (1 - tx) + a[i + 1] * tx) * (1 - ty) + (a[i + w] * (1 - tx) + a[i + w + 1] * tx) * ty;
    };
  }

  var images = {};
  function load(url) {
    if (images[url]) return images[url];
    images[url] = new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = rej;
      im.src = url;
    });
    return images[url];
  }

  /* The source, cropped to the canvas (cover, with a focus point and zoom),
     as linear-ish channels and a normalised luminance. */
  function prepare(img, W, H, o) {
    var c = canvas(W, H), x = c.getContext('2d', { willReadFrequently: true });
    var zoom = o.zoom || 1, fx = o.fx == null ? 0.5 : o.fx, fy = o.fy == null ? 0.5 : o.fy;
    var sc = Math.max(W / img.naturalWidth, H / img.naturalHeight) * zoom;
    var dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    x.drawImage(img, (W - dw) * fx, (H - dh) * fy, dw, dh);
    var d = x.getImageData(0, 0, W, H).data, n = W * H;
    var R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n), L = new Float32Array(n);
    var i;
    for (i = 0; i < n; i++) {
      R[i] = d[i * 4] / 255; G[i] = d[i * 4 + 1] / 255; B[i] = d[i * 4 + 2] / 255;
      L[i] = 0.2126 * R[i] + 0.7152 * G[i] + 0.0722 * B[i];
    }
    var hist = new Uint32Array(256);
    for (i = 0; i < n; i++) hist[Math.min(255, (L[i] * 255) | 0)]++;
    var lo = 0, hi = 255, acc = 0;
    for (i = 0; i < 256; i++) { acc += hist[i]; if (acc > n * 0.01) { lo = i; break; } }
    acc = 0;
    for (i = 255; i >= 0; i--) { acc += hist[i]; if (acc > n * 0.004) { hi = i; break; } }
    lo /= 255; hi /= 255;
    var gam = o.gamma || 1;
    for (i = 0; i < n; i++) L[i] = Math.pow(clamp((L[i] - lo) / Math.max(0.1, hi - lo), 0, 1), gam);
    // pools: where the story is, the light is kept; elsewhere it is let down
    // pools and lights are given as fractions of the source image
    var ox = (W - dw) * fx, oy = (H - dh) * fy;
    function map(p) { return [(p[0] * dw + ox) / W, (p[1] * dh + oy) / H, (p[2] || 0) * dw / W, (p[3] || 0) * dh / H]; }
    if (o.pools) {
      var floor = o.floor == null ? 0.3 : o.floor, boost = o.boost || 1.08, pools = o.pools.map(map);
      for (var yy = 0; yy < H; yy++) for (var xx = 0; xx < W; xx++) {
        var f = 0, u = xx / W, v = yy / H;
        for (var k = 0; k < pools.length; k++) {
          var pp = pools[k], dx = (u - pp[0]) / pp[2], dy = (v - pp[1]) / pp[3];
          f = Math.max(f, Math.exp(-(dx * dx + dy * dy)));
        }
        i = yy * W + xx;
        L[i] = clamp(L[i] * (floor + (boost - floor) * f), 0, 1);
      }
    }
    return { W: W, H: H, R: R, G: G, B: B, L: L, map: map };
  }

  /* Only what is lit survives: lamps, lit tops and rims, with a soft glow in
     lamplight. Then the lights are found, so they can switch on in order. */
  function build(P, s, o) {
    var W = P.W, H = P.H, n = W * H, i, x, y, q;
    var c0 = o.core || 0.36, warmBias = o.warm == null ? 0.3 : o.warm;
    var f4 = Math.max(2, Math.round(4 * s));
    var hiA = new Float32Array(n);
    for (i = 0; i < n; i++) hiA[i] = smooth(0.55, 1, P.L[i]);
    var bloom = sampler(blur(down(hiA, W, H, f4), Math.round(7 * s)));
    var wide = sampler(blur(down(hiA, W, H, f4 * 2), Math.round(8 * s)));
    var pool = sampler(blur(down(P.L, W, H, f4), Math.round(6 * s)));
    var Lf = P.L, img = new ImageData(W, H), d = img.data, lit = new Float32Array(n);
    var glow = o.glow == null ? 1 : o.glow;
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        i = y * W + x;
        var L = Lf[i], b = bloom(x, y), bw = wide(x, y), pl = pool(x, y);
        var xl = x > 0 ? i - 1 : i, xr = x < W - 1 ? i + 1 : i, yu = y > 0 ? i - W : i, yd = y < H - 1 ? i + W : i;
        var ex = Lf[xr] - Lf[xl], ey = Lf[yd] - Lf[yu], g = Math.sqrt(ex * ex + ey * ey);
        var warmth = clamp((P.R[i] - P.B[i]) * 2.6 + warmBias, 0, 1);
        var core = Math.pow(smooth(c0, 0.97, L), 1.3);
        var rim = clamp(g * 2.2, 0, 1) * smooth(0.25, 0.6, pl) * smooth(0.2, 0.5, L);
        var a = clamp(core * 0.96 + (b * 0.5 + bw * 0.28) * glow + rim * 0.35, 0, 1);
        lit[i] = a;
        var hot = smooth(0.85, 1, L);
        var mixL = clamp(0.3 + 0.7 * warmth, 0, 1) * (1 - hot * 0.8);
        mixL = lerp(1, mixL, clamp(core * 1.4, 0, 1));
        q = i * 4;
        d[q] = lerp(C.porcelain[0], C.lamp[0], mixL);
        d[q + 1] = lerp(C.porcelain[1], C.lamp[1], mixL);
        d[q + 2] = lerp(C.porcelain[2], C.lamp[2], mixL);
        d[q + 3] = Math.round(a * 255);
      }
    }
    var col = canvas(W, H); col.getContext('2d').putImageData(img, 0, 0);

    // the lights: local maxima of the blurred light map
    var f8 = Math.round(8 * s), m = blur(down(lit, W, H, f8), 2), mw = m.w, mh = m.h, mx = 0;
    for (i = 0; i < m.a.length; i++) mx = Math.max(mx, m.a[i]);
    var peaks = [], R = 4;
    for (y = 1; y < mh - 1; y++) for (x = 1; x < mw - 1; x++) {
      var v = m.a[y * mw + x];
      if (v < mx * 0.28) continue;
      var best = true;
      for (var yy = -R; yy <= R && best; yy++) for (var xx = -R; xx <= R; xx++) {
        var X = x + xx, Y = y + yy;
        if (X < 0 || Y < 0 || X >= mw || Y >= mh || (xx === 0 && yy === 0)) continue;
        if (m.a[Y * mw + X] > v) { best = false; break; }
      }
      if (best) peaks.push({ x: (x + 0.5) * f8, y: (y + 0.5) * f8, v: v });
    }
    peaks.sort(function (a, b) { return b.v - a.v; });
    var keep = [];
    peaks.forEach(function (p) {
      if (keep.length < 14 && keep.every(function (k) { return Math.hypot(k.x - p.x, k.y - p.y) > 80 * s; })) keep.push(p);
    });
    if (!keep.length) keep.push({ x: W / 2, y: H / 2, v: 1 });
    // order: a focus point first if given, otherwise back of the room forward
    var ox = o.first ? o.first[0] * W : null, oy = o.first ? o.first[1] * H : null;
    keep.sort(function (a, b) {
      if (ox !== null) return Math.hypot(a.x - ox, a.y - oy) - Math.hypot(b.x - ox, b.y - oy);
      return (a.y + a.x * 0.25) - (b.y + b.x * 0.25);
    });
    // or the lights are named, in the order they come on
    if (o.lights) keep = o.lights.map(function (l) { var m = P.map(l); return { x: m[0] * W, y: m[1] * H, v: 1 }; });
    var N = keep.length;
    keep.forEach(function (p, j) { p.t = N === 1 ? 0 : (j / (N - 1)) * 0.72; });
    return { color: col, lights: keep.slice(0, 16), sig: 34 * s };
  }

  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform sampler2D uC;uniform float uP;uniform vec2 uSize;',
    'uniform vec3 uPk[16];uniform float uN,uSig;',
    'varying vec2 v;',
    // a lamp coming on: a first catch, a short dip, then full
    'float ramp(float x,float w){float u=clamp(x/w,0.,1.);',
    '  float f=smoothstep(0.,.08,u)*.85;',
    '  f*=1.-.8*smoothstep(.08,.13,u)*(1.-smoothstep(.17,.24,u));',
    '  return max(f*(1.-step(.24,u)),smoothstep(.2,1.,u));}',
    'void main(){',
    '  vec4 c=texture2D(uC,v);',
    '  vec2 px=v*uSize;float dm=1e9;',
    '  for(int j=0;j<16;j++){if(float(j)>=uN)break;dm=min(dm,distance(px,uPk[j].xy));}',
    '  float sw=0.,sa=0.;',
    '  for(int j=0;j<16;j++){if(float(j)>=uN)break;float w=exp(-(distance(px,uPk[j].xy)-dm)/uSig);sw+=w;sa+=w*ramp(uP-uPk[j].z,.13);}',
    '  gl_FragColor=c*(sa/max(sw,1e-4));',
    '}'
  ].join('\n');

  function Renderer(cv) {
    var gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: false });
    this.gl = gl;
    if (!gl) return;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var u = this.u = {};
    ['uC', 'uP', 'uSize', 'uPk', 'uN', 'uSig'].forEach(function (k) { u[k] = gl.getUniformLocation(pr, k); });
    this.tex = gl.createTexture();
    gl.uniform1i(u.uC, 0);
  }
  Renderer.prototype.load = function (res, W, H) {
    var gl = this.gl; if (!gl) return;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, res.color);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var pk = new Float32Array(48);
    res.lights.forEach(function (l, j) { pk[j * 3] = l.x; pk[j * 3 + 1] = l.y; pk[j * 3 + 2] = l.t; });
    gl.uniform3fv(this.u.uPk, pk); gl.uniform1f(this.u.uN, res.lights.length); gl.uniform1f(this.u.uSig, res.sig);
    gl.uniform2f(this.u.uSize, W, H);
    gl.viewport(0, 0, W, H);
  };
  Renderer.prototype.draw = function (p) {
    var gl = this.gl; if (!gl) return;
    gl.uniform1f(this.u.uP, p);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /* One lit scene on one canvas. opts: src, fx, fy, zoom, gamma, core,
     glow, warm, first. Scale is capped so builds stay quick. */
  function Scene(cv, opts) {
    this.cv = cv; this.o = opts; this.r = new Renderer(cv); this.ready = false; this.p = -1; this.size = '';
    this.ok = !!this.r.gl;
  }
  Scene.prototype.build = function () {
    var self = this;
    if (!this.ok) return Promise.resolve(false);
    var box = this.cv.getBoundingClientRect();
    var s = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = Math.max(2, Math.round(box.width * s)), H = Math.max(2, Math.round(box.height * s));
    var key = W + 'x' + H;
    if (key === this.size && this.ready) return Promise.resolve(true);
    return load(this.o.src).then(function (img) {
      self.cv.width = W; self.cv.height = H;
      var res = build(prepare(img, W, H, self.o), s, self.o);
      self.r.load(res, W, H);
      self.size = key; self.ready = true; self.p = -1;
      return true;
    });
  };
  Scene.prototype.draw = function (p) {
    if (!this.ready) return;
    p = clamp(p, 0, 1);
    if (Math.abs(p - this.p) < 1e-4) return;
    this.p = p; this.r.draw(p);
  };

  window.LightOnly = { Scene: Scene, clamp: clamp, smooth: smooth };
})();
