/* Light only, on porcelain.
   Adapted from the samples page. A drawn room is reduced to two layers:
   a fine slate line drawing of its edges, and warm lamplight washes where
   it is lit. Everything unlit falls away into the porcelain ground. A small
   WebGL shader then switches the lights on, one by one, against a progress
   value the page gives it. No libraries. */
(function () {
  'use strict';

  var HEX = { slate: '#232a2f', lamp: '#f1d2a0', porcelain: '#f2f1ec' };
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var SLATE = rgb(HEX.slate), LAMP = rgb(HEX.lamp);

  /* ---------- helpers (from the samples page) ---------- */
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function down(src, w, h, f) {
    var dw = Math.ceil(w / f), dh = Math.ceil(h / f), out = new Float32Array(dw * dh), n = new Float32Array(dw * dh);
    for (var y = 0; y < h; y++) {
      var dy = (y / f) | 0, row = dy * dw, sr = y * w;
      for (var x = 0; x < w; x++) { var i = row + ((x / f) | 0); out[i] += src[sr + x]; n[i]++; }
    }
    for (var j = 0; j < out.length; j++) out[j] /= n[j];
    return { a: out, w: dw, h: dh, f: f };
  }
  function blur(m, r) {
    var w = m.w, h = m.h, a = m.a, t = new Float32Array(a.length), pass, x, y, s, k, d = 2 * r + 1;
    if (r < 1) return m;
    for (pass = 0; pass < 3; pass++) {
      for (y = 0; y < h; y++) {
        var o = y * w;
        s = 0;
        for (k = -r; k <= r; k++) s += a[o + clamp(k, 0, w - 1)];
        for (x = 0; x < w; x++) {
          t[o + x] = s / d;
          s += a[o + Math.min(x + r + 1, w - 1)] - a[o + Math.max(x - r, 0)];
        }
      }
      for (x = 0; x < w; x++) {
        s = 0;
        for (k = -r; k <= r; k++) s += t[clamp(k, 0, h - 1) * w + x];
        for (y = 0; y < h; y++) {
          a[y * w + x] = s / d;
          s += t[Math.min(y + r + 1, h - 1) * w + x] - t[Math.max(y - r, 0) * w + x];
        }
      }
    }
    return m;
  }
  // a downsampled map, upsampled back to full resolution once (cheaper than sampling per pixel)
  function upsample(m, W, H) {
    var w = m.w, h = m.h, a = m.a, f = m.f, out = new Float32Array(W * H);
    for (var y = 0; y < H; y++) {
      var fy = clamp(y / f - 0.5 + 0.5 / f, 0, h - 1.001), y0 = fy | 0, ty = fy - y0;
      for (var x = 0; x < W; x++) {
        var fx = clamp(x / f - 0.5 + 0.5 / f, 0, w - 1.001), x0 = fx | 0, tx = fx - x0, i = y0 * w + x0;
        out[y * W + x] = (a[i] * (1 - tx) + a[i + 1] * tx) * (1 - ty) + (a[i + w] * (1 - tx) + a[i + w + 1] * tx) * ty;
      }
    }
    return out;
  }

  /* ---------- images ---------- */
  var images = {};
  function loadImage(url) {
    if (images[url]) return images[url];
    images[url] = new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = rej;
      im.src = url;
    });
    return images[url];
  }

  // where the 1600 x 900 drawing sits inside a W x H canvas
  function placement(o, img, W, H) {
    var sc = o.fit === 'width' ? W / img.naturalWidth : Math.max(W / img.naturalWidth, H / img.naturalHeight);
    sc *= o.zoom;
    var dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    return { x: (W - dw) * o.fx, y: (H - dh) * o.fy, w: dw, h: dh, k: dw / 1600 };
  }

  /* ---------- the treatment ---------- */
  function build(img, o, W, H, s) {
    var pl = placement(o, img, W, H);
    var c = canvas(W, H), x2 = c.getContext('2d', { willReadFrequently: true });
    x2.drawImage(img, pl.x, pl.y, pl.w, pl.h);
    var d = x2.getImageData(0, 0, W, H).data, n = W * H, i, x, y;
    var R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n), L = new Float32Array(n);
    for (i = 0; i < n; i++) {
      R[i] = d[i * 4] / 255; G[i] = d[i * 4 + 1] / 255; B[i] = d[i * 4 + 2] / 255;
      L[i] = 0.2126 * R[i] + 0.7152 * G[i] + 0.0722 * B[i];
    }
    // stretch the tonal range: these are dark drawings
    var hist = new Uint32Array(256), cnt = 0;
    for (i = 0; i < n; i++) if (d[i * 4 + 3] > 0) { hist[Math.min(255, (L[i] * 255) | 0)]++; cnt++; }
    var lo = 0, hi = 255, acc = 0;
    for (i = 0; i < 256; i++) { acc += hist[i]; if (acc > cnt * 0.01) { lo = i; break; } }
    acc = 0;
    for (i = 255; i >= 0; i--) { acc += hist[i]; if (acc > cnt * 0.004) { hi = i; break; } }
    lo /= 255; hi /= 255;
    var k = 1 / Math.max(0.1, hi - lo);
    for (i = 0; i < n; i++) L[i] = clamp((L[i] - lo) * k, 0, 1);

    // inside the drawing, away from its cut edges
    var bx0 = Math.max(1, Math.ceil(pl.x) + 3), bx1 = Math.min(W - 2, Math.floor(pl.x + pl.w) - 4);
    var by0 = Math.max(1, Math.ceil(pl.y) + 3), by1 = Math.min(H - 2, Math.floor(pl.y + pl.h) - 4);

    // 1. edges: the strongest Sobel gradient of the three channels, found at
    // twice the canvas size and averaged down, so each edge lands as one fine,
    // smooth line about a pixel wide
    var ss = W * H * 4 <= 7.2e6 ? 2 : 1, W2 = W * ss, H2 = H * ss;
    var c2 = canvas(W2, H2), x3 = c2.getContext('2d', { willReadFrequently: true });
    x3.drawImage(img, pl.x * ss, pl.y * ss, pl.w * ss, pl.h * ss);
    var dd = x3.getImageData(0, 0, W2, H2).data, S4 = W2 * 4;
    var E = new Float32Array(n), ek = 0.5 * 1.7 * k / 255 / (ss * ss);
    var ys0 = Math.max(1, by0 * ss), ys1 = Math.min(H2 - 2, by1 * ss + ss - 1);
    var xs0 = Math.max(1, bx0 * ss), xs1 = Math.min(W2 - 2, bx1 * ss + ss - 1);
    for (y = ys0; y <= ys1; y++) {
      var row = ((y / ss) | 0) * W;
      for (x = xs0; x <= xs1; x++) {
        var q0 = y * S4 + x * 4, best = 0;
        for (var ch = 0; ch < 3; ch++) {
          var q = q0 + ch;
          var gx = dd[q + 4] - dd[q - 4], gy = dd[q + S4] - dd[q - S4];
          var mg = gx * gx + gy * gy;
          if (mg > best) best = mg;
        }
        if (best) E[row + ((x / ss) | 0)] += Math.sqrt(best) * ek;
      }
    }
    dd = null; c2.width = c2.height = 1;

    // 2. maps of where the light is; bright neutral surfaces (paper, cloth)
    // glow less than warm lamps
    var f4 = Math.max(2, Math.round(4 * s));
    var hiA = new Float32Array(n);
    for (i = 0; i < n; i++) hiA[i] = smooth(0.5, 1, L[i]) * (0.4 + 0.6 * clamp((R[i] - B[i]) * 3 + 0.2, 0, 1));
    var bloom = upsample(blur(down(hiA, W, H, f4), Math.round(6 * s)), W, H);
    var wide = upsample(blur(down(hiA, W, H, f4 * 2), Math.round(9 * s)), W, H);
    var pool = upsample(blur(down(L, W, H, f4), Math.round(7 * s)), W, H);
    var near = upsample(blur(down(L, W, H, 1), Math.max(1, Math.round(2 * s))), W, H);

    var ink = new ImageData(W, H), id = ink.data;
    var wash = new ImageData(W, H), wd = wash.data;
    var lit = new Float32Array(n);
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        i = y * W + x;
        var Li = L[i], e = E[i], p = pool[i];
        // the line drawing: every real edge holds, faint ones only where lit
        var inside = x >= bx0 && x <= bx1 && y >= by0 && y <= by1;
        var edge = smooth(o.e0, o.e1, e);
        var strong = smooth(0.14, 0.42, e);
        var gate = smooth(0.05, 0.42, p);
        var la = edge * (0.24 + 0.76 * Math.max(gate, strong * 0.7));
        // small dark marks on lit surfaces (rules, writing, a pencil line) as solid ink
        var mu = near[i];
        var mark = clamp((mu - Li) * 2.2 - 0.12, 0, 1) * smooth(0.42, 0.72, mu);
        var A = Math.max(la * o.ink, mark * 0.78);
        if (!inside) A = 0;
        var q = i * 4;
        if (A > 0.004) {
          id[q] = SLATE[0]; id[q + 1] = SLATE[1]; id[q + 2] = SLATE[2]; id[q + 3] = Math.round(A * 255);
        }
        // the lamplight wash: pools and glow, warmer where the drawing is warm
        var warm = clamp((R[i] - B[i]) * 2.6 + 0.35, 0, 1);
        // brighter is warmer; only small neutral hot spots (a bulb, a glint) stay porcelain
        var base = smooth(0.04, 0.66, Li);
        var hot = smooth(0.97, 1, Li) * (1 - clamp((R[i] - B[i]) * 4, 0, 1));
        var wa = bloom[i] * 0.6 + wide[i] * 0.45 + base * 0.92 * (0.5 + 0.5 * warm);
        wa = clamp(wa, 0, o.wash) * (1 - 0.35 * hot);
        lit[i] = Math.max(wa, hot * 0.8);
        if (wa > 0.004) {
          wd[q] = LAMP[0]; wd[q + 1] = LAMP[1]; wd[q + 2] = LAMP[2]; wd[q + 3] = Math.round(wa * 255);
        }
      }
    }
    var ci = canvas(W, H); ci.getContext('2d').putImageData(ink, 0, 0);
    var cw = canvas(W, H); cw.getContext('2d').putImageData(wash, 0, 0);
    if (o.text && TEXT[o.text]) TEXT[o.text](ci.getContext('2d'), pl);

    // find the lights: local maxima of the blurred light map
    var f8 = Math.max(4, Math.round(8 * s)), mm = blur(down(lit, W, H, f8), 2), mw = mm.w, mh = mm.h, mx = 0;
    for (i = 0; i < mm.a.length; i++) mx = Math.max(mx, mm.a[i]);
    var peaks = [], RR = 4;
    for (y = 1; y < mh - 1; y++) for (x = 1; x < mw - 1; x++) {
      var v = mm.a[y * mw + x];
      if (v < mx * 0.3) continue;
      var best = true;
      for (var yy = -RR; yy <= RR && best; yy++) for (var xx = -RR; xx <= RR; xx++) {
        var X = x + xx, Y = y + yy;
        if (X < 0 || Y < 0 || X >= mw || Y >= mh || (xx === 0 && yy === 0)) continue;
        if (mm.a[Y * mw + X] > v) { best = false; break; }
      }
      if (best) peaks.push({ x: (x + 0.5) * f8, y: (y + 0.5) * f8, v: v });
    }
    peaks.sort(function (a, b) { return b.v - a.v; });
    var keep = [];
    peaks.forEach(function (p) {
      if (keep.length < 14 && keep.every(function (q) { return Math.hypot(q.x - p.x, q.y - p.y) > 90 * s; })) keep.push(p);
    });
    if (!keep.length) keep.push({ x: W / 2, y: H / 2, v: 1 });
    // switch on in reading order of the room: left to right, back to front
    keep.sort(function (a, b) { return (a.x + a.y * 0.6) - (b.x + b.y * 0.6); });
    var N = keep.length;
    keep.forEach(function (p, j) { p.t = N === 1 ? 0 : (j / (N - 1)) * 0.7; });
    return { ink: ci, wash: cw, lights: keep, sig: 40 * s };
  }

  /* ---------- writing on the prep sheets, in the page's own type ---------- */
  var DISHES = ['Short rib', 'Risotto', 'Burrata'];
  function sheetText(cx, pl, cxSrc, title, side, counts, sold, heads) {
    // the sheet in the drawing is turned -1.2 degrees about its centre
    cx.save();
    cx.translate(pl.x, pl.y);
    cx.scale(pl.k, pl.k);
    cx.translate(cxSrc, 450);
    cx.rotate(-1.2 * Math.PI / 180);
    cx.translate(-1050, -450);
    cx.fillStyle = HEX.slate;
    cx.textBaseline = 'alphabetic';
    cx.font = '420 54px Literata, Georgia, serif';
    cx.textAlign = 'left';
    cx.fillText(title, 812, 142);
    if (side) {
      cx.globalAlpha = 0.62;
      cx.font = '500 21px "Schibsted Grotesk", system-ui, sans-serif';
      cx.textAlign = 'right';
      cx.fillText(side, 1290, 140);
      cx.globalAlpha = 1;
    }
    if (heads) {
      cx.globalAlpha = 0.62;
      cx.font = '500 20px "Schibsted Grotesk", system-ui, sans-serif';
      cx.textAlign = 'center';
      cx.fillText('Prep', 1150, 230);
      if (sold) cx.fillText('Sold', 1250, 230);
      cx.globalAlpha = 1;
    }
    for (var r = 0; r < 3; r++) {
      var yy = 300 + r * 90;
      cx.textAlign = 'left';
      cx.font = '400 34px "Source Serif 4", Georgia, serif';
      cx.fillText(DISHES[r], 812, yy);
      cx.textAlign = 'center';
      cx.font = '500 46px Literata, Georgia, serif';
      cx.fillText(String(counts[r]), 1150, yy + 2);
      if (sold) {
        // pencilled in after the night
        cx.globalAlpha = 0.58;
        cx.font = 'italic 400 34px "Source Serif 4", Georgia, serif';
        cx.fillText(String(sold[r]), 1250, yy);
        cx.globalAlpha = 1;
      }
    }
    cx.restore();
  }
  var TEXT = {
    prep: function (cx, pl) { sheetText(cx, pl, 1050, 'Friday', null, [27, 33, 19], null, false); },
    sheets: function (cx, pl) {
      sheetText(cx, pl, 485, 'A guess', 'Friday', [40, 20, 25], [25, 31, 18], true);
      sheetText(cx, pl, 1115, 'Tooey', 'Friday', [27, 33, 19], [25, 31, 18], true);
    }
  };

  /* ---------- WebGL: the lights switch on ---------- */
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform sampler2D uI,uW;uniform float uP,uBase,uN,uSig;uniform vec2 uSize;uniform vec3 uPk[16];',
    'varying vec2 v;',
    // a lamp coming on: a short flicker, then up to full
    'float ramp(float x,float w){float u=clamp(x/w,0.,1.);',
    '  float f=smoothstep(0.,.08,u)*.85;',
    '  f*=1.-.8*smoothstep(.08,.13,u)*(1.-smoothstep(.17,.24,u));',
    '  return max(f*(1.-step(.24,u)),smoothstep(.2,1.,u));}',
    'void main(){',
    '  vec2 px=v*uSize;float dm=1e9;',
    '  for(int j=0;j<16;j++){if(float(j)>=uN)break;dm=min(dm,distance(px,uPk[j].xy));}',
    '  float sw=0.,sa=0.;',
    '  for(int j=0;j<16;j++){if(float(j)>=uN)break;float w=exp(-(distance(px,uPk[j].xy)-dm)/uSig);sw+=w;sa+=w*ramp(uP-uPk[j].z,.14);}',
    '  float a=sa/max(sw,1e-4);',
    '  vec4 I=texture2D(uI,v)*mix(uBase,1.,smoothstep(0.,.55,a));',
    '  vec4 W=texture2D(uW,v)*a;',
    '  gl_FragColor=I+W*(1.-I.a);',
    '}'
  ].join('\n');

  function Renderer(cv) {
    var gl = null;
    try { gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }); } catch (e) { gl = null; }
    this.gl = gl;
    this.cv = cv;
    if (!gl) return;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var u = this.u = {};
    ['uI', 'uW', 'uP', 'uBase', 'uN', 'uSig', 'uSize', 'uPk'].forEach(function (k) { u[k] = gl.getUniformLocation(pr, k); });
    this.tI = gl.createTexture(); this.tW = gl.createTexture();
    gl.uniform1i(u.uI, 0); gl.uniform1i(u.uW, 1);
  }
  Renderer.prototype.tex = function (unit, t, src) {
    var gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  Renderer.prototype.load = function (res, W, H, base) {
    this.res = res;
    var gl = this.gl;
    if (!gl) return;
    this.tex(0, this.tI, res.ink);
    this.tex(1, this.tW, res.wash);
    var u = this.u, pk = new Float32Array(48);
    res.lights.forEach(function (l, j) { pk[j * 3] = l.x; pk[j * 3 + 1] = l.y; pk[j * 3 + 2] = l.t; });
    gl.uniform3fv(u.uPk, pk); gl.uniform1f(u.uN, res.lights.length); gl.uniform1f(u.uSig, res.sig);
    gl.uniform1f(u.uBase, base); gl.uniform2f(u.uSize, W, H);
    gl.viewport(0, 0, W, H);
  };
  Renderer.prototype.draw = function (p) {
    var gl = this.gl;
    if (!gl) {
      // no WebGL: show the finished picture
      var c = this.cv.getContext('2d');
      if (!c || this.drawn) return;
      c.clearRect(0, 0, this.cv.width, this.cv.height);
      c.drawImage(this.res.wash, 0, 0); c.drawImage(this.res.ink, 0, 0);
      this.drawn = true;
      return;
    }
    gl.uniform1f(this.u.uP, p);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /* ---------- scenes ---------- */
  function Scene(el) {
    var ds = el.dataset;
    this.el = el;
    this.cv = el.querySelector('canvas');
    this.o = {
      url: ds.src, fx: parseFloat(ds.fx || '.5'), fy: parseFloat(ds.fy || '.5'), zoom: parseFloat(ds.zoom || '1'),
      fit: ds.fit || 'cover', text: ds.text || null,
      e0: 0.018, e1: 0.15, ink: 0.86, wash: 0.94
    };
    this.base = parseFloat(ds.base || '.32');
    this.r = null; this.ready = false; this.p = -1; this.w = 0; this.h = 0;
  }
  Scene.prototype.size = function () {
    var b = this.el.getBoundingClientRect();
    return { w: Math.round(b.width), h: Math.round(b.height) };
  };
  Scene.prototype.build = function () {
    var self = this, sz = this.size();
    if (sz.w < 2 || sz.h < 2) return Promise.resolve();
    // device pixels, capped so the work stays quick
    var s = Math.min(window.devicePixelRatio || 1, 2);
    var cap = 3.2e6;
    if (sz.w * sz.h * s * s > cap) s = Math.sqrt(cap / (sz.w * sz.h));
    var W = Math.round(sz.w * s), H = Math.round(sz.h * s);
    return loadImage(this.o.url).then(function (img) {
      // the drawings were captured at twice their 1600 x 900 size
      var res = build(img, self.o, W, H, s);
      if (!self.r || self.cv.width !== W || self.cv.height !== H) {
        self.cv.width = W; self.cv.height = H;
        if (!self.r) self.r = new Renderer(self.cv);
      }
      self.r.load(res, W, H, self.base);
      self.w = sz.w; self.h = sz.h;
      self.ready = true; self.p = -1;
      self.el.classList.add('is-ready');
    });
  };
  Scene.prototype.draw = function (p) {
    if (!this.ready) return;
    p = clamp(p, 0, 1);
    if (Math.abs(p - this.p) < 1e-4) return;
    this.p = p;
    this.r.draw(p);
  };

  window.TooeyLight = { Scene: Scene, clamp: clamp, smooth: smooth };
})();
