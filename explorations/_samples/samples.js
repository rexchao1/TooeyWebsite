/* Image treatments. Each treatment is computed once per source and canvas
   size into two textures (the finished ink, and a reveal-time map), then a
   tiny WebGL shader reveals it against scroll progress. No libraries. */
(function () {
  'use strict';

  var HEX = {
    basalt: '#2f2d2a', deep: '#242220', porcelain: '#f2f1ec', onDark: '#dcd9d2',
    ash: '#aba69e', slate: '#232a2f', lamp: '#f1d2a0'
  };
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var C = {};
  Object.keys(HEX).forEach(function (k) { C[k] = rgb(HEX[k]); });

  var SOURCES = {
    a: { url: 'img/source-a.webp', fx: 0.91, fy: 0.85, zoom: 1.35 },
    b: { url: 'img/source-b.webp', fx: 0.92, fy: 0.8, zoom: 1.2 }
  };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(location.search);
  var current = params.get('src') === 'b' ? 'b' : 'a';
  var forcedP = params.has('p') ? parseFloat(params.get('p')) : null;

  /* ---------- small helpers ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // average-downsample a float map by integer factor f
  function down(src, w, h, f) {
    var dw = Math.ceil(w / f), dh = Math.ceil(h / f), out = new Float32Array(dw * dh), n = new Float32Array(dw * dh);
    for (var y = 0; y < h; y++) {
      var dy = (y / f) | 0;
      for (var x = 0; x < w; x++) { var i = dy * dw + ((x / f) | 0); out[i] += src[y * w + x]; n[i]++; }
    }
    for (var j = 0; j < out.length; j++) out[j] /= n[j];
    return { a: out, w: dw, h: dh, f: f };
  }
  // separable box blur, 3 passes ~ gaussian
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
  // bilinear sample of a downsampled map at full-res coordinates
  function sampler(m) {
    var w = m.w, h = m.h, a = m.a, f = m.f;
    return function (x, y) {
      var fx = clamp(x / f - 0.5, 0, w - 1.001), fy = clamp(y / f - 0.5, 0, h - 1.001);
      var x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0, i = y0 * w + x0;
      return (a[i] * (1 - tx) + a[i + 1] * tx) * (1 - ty) + (a[i + w] * (1 - tx) + a[i + w + 1] * tx) * ty;
    };
  }
  // smooth value noise in 0..1
  function noise2(seed, cell) {
    var r = rng(seed), G = 64, g = new Float32Array(G * G);
    for (var i = 0; i < g.length; i++) g[i] = r();
    return function (x, y) {
      var fx = x / cell, fy = y / cell, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
      function v(a, b) { return g[((b % G + G) % G) * G + ((a % G + G) % G)]; }
      return lerp(lerp(v(x0, y0), v(x0 + 1, y0), tx), lerp(v(x0, y0 + 1), v(x0 + 1, y0 + 1), tx), ty);
    };
  }

  /* ---------- source preparation (once per source and size) ---------- */
  var images = {}, prepCache = {};
  function loadImage(key) {
    if (images[key]) return images[key];
    images[key] = new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = rej;
      im.src = SOURCES[key].url;
    });
    return images[key];
  }
  function prep(key, img, W, H) {
    var id = key + W + 'x' + H;
    if (prepCache[id]) return prepCache[id];
    var S = SOURCES[key], c = canvas(W, H), x = c.getContext('2d', { willReadFrequently: true });
    var sc = Math.max(W / img.naturalWidth, H / img.naturalHeight) * S.zoom;
    var dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    x.drawImage(img, (W - dw) * S.fx, (H - dh) * S.fy, dw, dh);
    var d = x.getImageData(0, 0, W, H).data, n = W * H;
    var R = new Float32Array(n), Gc = new Float32Array(n), B = new Float32Array(n), L = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      R[i] = d[i * 4] / 255; Gc[i] = d[i * 4 + 1] / 255; B[i] = d[i * 4 + 2] / 255;
      L[i] = 0.2126 * R[i] + 0.7152 * Gc[i] + 0.0722 * B[i];
    }
    // normalise the tonal range so a dark render and a flat drawing both use it
    var hist = new Uint32Array(256);
    for (i = 0; i < n; i++) hist[Math.min(255, (L[i] * 255) | 0)]++;
    var lo = 0, hi = 255, acc = 0;
    for (i = 0; i < 256; i++) { acc += hist[i]; if (acc > n * 0.01) { lo = i; break; } }
    acc = 0;
    for (i = 255; i >= 0; i--) { acc += hist[i]; if (acc > n * 0.004) { hi = i; break; } }
    lo /= 255; hi /= 255;
    for (i = 0; i < n; i++) L[i] = clamp((L[i] - lo) / Math.max(0.1, hi - lo), 0, 1);
    // a local-contrast copy, so shapes hold up when reduced to marks
    var base = sampler(blur(down(L, W, H, 4), 6)), Lc = new Float32Array(n);
    for (var yy = 0; yy < H; yy++) for (var xx = 0; xx < W; xx++) {
      i = yy * W + xx;
      Lc[i] = clamp(L[i] + 0.9 * (L[i] - base(xx, yy)), 0, 1);
    }
    return (prepCache[id] = { W: W, H: H, R: R, G: Gc, B: B, L: L, Lc: Lc });
  }

  function encodeTime16(t) { var v = Math.round(clamp(t, 0, 1) * 65535); return [v >> 8, v & 255]; }

  /* ---------- 1. Tally hatching ---------- */
  // Tone is built from tally groups: up to four strokes and a slash, laid
  // out in ledger rows. Each stroke draws in top to bottom as it is revealed.
  function buildTally(P, dark, s) {
    var W = P.W, H = P.H, r = rng(dark ? 11 : 12);
    // a ledger: every cell holds one tally group, and the count is the tone
    var sp = 1.5 * s, gap = 2.5 * s, rowH = 7 * s, h = 5.6 * s, LW = 0.72 * s;
    var pitch = 3 * sp + gap;
    var cell = blur(down(P.Lc, W, H, Math.max(2, Math.round(2 * s))), 1), tone0 = sampler(cell);
    function tone(x, y) {
      var L = tone0(x, y);
      return dark ? Math.pow(smooth(0.14, 0.9, L), 1.1) : Math.pow(smooth(0.3, 0.97, 1 - L), 1.6);
    }
    var warm = (function () {
      var a = new Float32Array(W * H);
      for (var i = 0; i < a.length; i++) a[i] = clamp((P.R[i] - P.B[i]) * 3, 0, 1) * smooth(0.45, 0.9, P.L[i]);
      return sampler(blur(down(a, W, H, Math.round(4 * s)), 2));
    })();
    var field = noise2(dark ? 5 : 6, 230 * s), field2 = noise2(9, 70 * s);
    var batches = {}, tm = new Uint8Array(W * H * 4), count = 0;
    function raster(ax, ay, bx, by, hw, T) {
      var e = encodeTime16(T), dx = bx - ax, dy = by - ay, ll = dx * dx + dy * dy || 1;
      var x0 = Math.max(0, Math.floor(Math.min(ax, bx) - hw)), x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx) + hw));
      var y0 = Math.max(0, Math.floor(Math.min(ay, by) - hw)), y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by) + hw));
      for (var py = y0; py <= y1; py++) for (var px = x0; px <= x1; px++) {
        var qx = px + 0.5 - ax, qy = py + 0.5 - ay, u = clamp((qx * dx + qy * dy) / ll, 0, 1);
        var ex = qx - u * dx, ey = qy - u * dy;
        if (ex * ex + ey * ey > hw * hw) continue;
        var o = (py * W + px) * 4;
        tm[o] = e[0]; tm[o + 1] = Math.round(u * 255); tm[o + 2] = e[1]; tm[o + 3] = 255;
      }
    }
    function stroke(ax, ay, bx, by, lw, ink, T) {
      lw = Math.round(lw * 10) / 10;
      var key = ink + '|' + lw;
      (batches[key] || (batches[key] = { ink: ink, lw: lw, seg: [] })).seg.push(ax, ay, bx, by);
      raster(ax, ay, bx, by, lw / 2 + 0.7 * s, T);
      count++;
    }
    var x0 = -r() * pitch, y0 = -r() * rowH;
    var LEVELS = [0, 2, 4, 5], row = 0;
    for (var y = y0; y < H + rowH; y += rowH, row++) {
      var err = 0;
      for (var x = x0 + ((row % 2) * 0.5 + (r() - 0.5) * 0.3) * pitch; x < W + pitch; x += pitch * (1 + (r() - 0.5) * 0.08)) {
        var cxm = x + 1.5 * sp, cym = y + h / 2;
        var tg = tone(cxm, cym);
        // counted from the left, as by hand: |, ||, |||, ||||, then the slash
        // few levels, like a woodcut: none, two, four, or a closed five
        var want = tg * 5 + err, n = 0, best = 99;
        for (var li = 0; li < LEVELS.length; li++) { var dl = Math.abs(LEVELS[li] - want); if (dl < best) { best = dl; n = LEVELS[li]; } }
        err = (want - n) * 0.6;
        if (n === 0) continue;
        var Tg = clamp(0.6 * field(x, y) + 0.22 * field2(x, y) + 0.18 * r(), 0, 1) * 0.84;
        var ink = HEX.slate;
        if (dark) {
          var wm = Math.round(warm(cxm, cym) * 4) / 4;
          ink = 'rgb(' + [0, 1, 2].map(function (c) { return Math.round(lerp(C.onDark[c], C.lamp[c], wm)); }).join(',') + ')';
        }
        var lean = 0.05 + (r() - 0.5) * 0.06;
        for (var m = 0; m < Math.min(n, 4); m++) {
          var px = x + m * sp + (r() - 0.5) * 0.25 * s;
          var top = y + (r() - 0.5) * 0.9 * s, bot = y + h + (r() - 0.5) * 1.1 * s;
          var lw = LW * (0.9 + 0.2 * r());
          stroke(px + lean * h * 0.5, top, px - lean * h * 0.5, bot, lw, ink, Tg + m * 0.01);
        }
        if (n === 5) {
          stroke(x - 0.9 * sp, y + h * (0.72 + 0.1 * r()), x + 3.9 * sp, y + h * (0.24 + 0.1 * r()), LW, ink, Tg + 0.045);
        }
      }
    }
    var col = canvas(W, H), cx = col.getContext('2d');
    cx.lineCap = 'round';
    Object.keys(batches).forEach(function (key) {
      var b = batches[key], sg = b.seg;
      cx.strokeStyle = b.ink; cx.lineWidth = b.lw;
      cx.beginPath();
      for (var q = 0; q < sg.length; q += 4) { cx.moveTo(sg[q], sg[q + 1]); cx.lineTo(sg[q + 2], sg[q + 3]); }
      cx.stroke();
    });
    return { color: col, time: tm, mode: 0, strokes: count };
  }

  /* ---------- 2. Thermal print ---------- */
  // A receipt printer's head: 1-bit dots, one print line at a time, diffused
  // only along the line, with the head's heat drifting from line to line.
  function buildThermal(P, dark, s) {
    var W = P.W, H = P.H, r = rng(dark ? 21 : 22);
    var rowH = Math.max(3, Math.round(3 * s)), rows = Math.ceil(H / rowH);
    var img = new ImageData(W, H), d = img.data;
    var ink = dark ? C.onDark : C.slate;
    var line = new Float32Array(W), phase = r() * 6.28;
    for (var row = 0; row < rows; row++) {
      var y0 = row * rowH, y1 = Math.min(H, y0 + rowH);
      for (var x = 0; x < W; x++) {
        var sum = 0;
        for (var y = y0; y < y1; y++) sum += P.L[y * W + x];
        line[x] = sum / (y1 - y0);
      }
      var heat = 1 + 0.05 * Math.sin(row * 0.045 + phase) + 0.03 * (r() - 0.5);
      var err = 0, ltr = row % 2 === 0;
      for (var i = 0; i < W; i++) {
        x = ltr ? i : W - 1 - i;
        var L = line[x], t;
        if (dark) t = Math.pow(smooth(0.16, 0.86, L), 1.3);
        else t = Math.pow(smooth(0.22, 1, 1 - L), 2.3) * 0.9;
        var v = t * heat + err, thr = 0.5 + (r() - 0.5) * 0.36, on = v > thr ? 1 : 0;
        err = v - on;
        if (!on) continue;
        // pale tones print fainter, the way thermal paper fades
        var a = 0.62 + 0.38 * smooth(0.1, 0.7, t);
        for (y = y0; y < y1; y++) {
          var aa = a * (y === y1 - 1 ? (rowH <= 4 ? 0.3 : 0.55) : 1);
          var o = (y * W + x) * 4;
          d[o] = ink[0]; d[o + 1] = ink[1]; d[o + 2] = ink[2]; d[o + 3] = Math.round(aa * 255 * 0.95);
        }
      }
    }
    var col = canvas(W, H); col.getContext('2d').putImageData(img, 0, 0);
    return { color: col, time: null, mode: 1, rowH: rowH };
  }

  /* ---------- 3. Light only ---------- */
  // Only what is lit survives. Shadows drop into the ground; lamps, tops
  // and rims stay, with a soft glow. The lights then switch on in order.
  function buildLight(P, dark, s) {
    var W = P.W, H = P.H, n = W * H, i, x, y, o;
    var f4 = Math.max(2, Math.round(4 * s));
    var hiA = new Float32Array(n);
    for (i = 0; i < n; i++) hiA[i] = smooth(0.55, 1, P.L[i]);
    var bloomM = blur(down(hiA, W, H, f4), Math.round(7 * s)), bloom = sampler(bloomM);
    var wideM = blur(down(hiA, W, H, f4 * 2), Math.round(8 * s)), wide = sampler(wideM);
    var pool = sampler(blur(down(P.L, W, H, f4), Math.round(6 * s)));
    var Lf = P.L;
    var img = new ImageData(W, H), d = img.data;
    var lit = new Float32Array(n);
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        i = y * W + x;
        var L = Lf[i], b = bloom(x, y), bw = wide(x, y), pl = pool(x, y);
        var xl = x > 0 ? i - 1 : i, xr = x < W - 1 ? i + 1 : i, yu = y > 0 ? i - W : i, yd = y < H - 1 ? i + W : i;
        var ex = Lf[xr] - Lf[xl], ey = Lf[yd] - Lf[yu], g = Math.sqrt(ex * ex + ey * ey);
        var warmth = clamp((P.R[i] - P.B[i]) * 2.6 + 0.3, 0, 1);
        o = i * 4;
        if (dark) {
          var core = Math.pow(smooth(0.36, 0.97, L), 1.3);
          var rim = clamp(g * 2.2, 0, 1) * smooth(0.25, 0.6, pl) * smooth(0.2, 0.5, L);
          var a = clamp(core * 0.96 + b * 0.5 + bw * 0.28 + rim * 0.35, 0, 1);
          lit[i] = a;
          var hot = smooth(0.85, 1, L);
          var mixL = clamp(0.3 + 0.7 * warmth, 0, 1) * (1 - hot * 0.8);
          // the glow away from the core is always lamplight
          mixL = lerp(1, mixL, clamp(core * 1.4, 0, 1));
          d[o] = lerp(C.porcelain[0], C.lamp[0], mixL);
          d[o + 1] = lerp(C.porcelain[1], C.lamp[1], mixL);
          d[o + 2] = lerp(C.porcelain[2], C.lamp[2], mixL);
          d[o + 3] = Math.round(a * 255);
        } else {
          // on porcelain the light becomes a warm wash, and the lit surfaces
          // keep only their edges, drawn in warm dark ink
          var mask = Math.pow(smooth(0.14, 0.52, pl), 1.1);
          var edgeInk = clamp(g * 3.4 - 0.05, 0, 1) * mask;
          var form = (1 - L) * mask * smooth(0.2, 0.5, L) * 0.45;
          var inkA = clamp(edgeInk + form, 0, 0.92);
          var glowA = clamp(b * 0.95 + bw * 0.55 + Math.pow(smooth(0.45, 1, L), 1.3) * 0.6, 0, 0.92) * (1 - inkA);
          lit[i] = Math.max(mask * 0.8, b);
          var A = inkA + glowA;
          if (A <= 0.003) continue;
          for (var k = 0; k < 3; k++) d[o + k] = (C.basalt[k] * inkA + C.lamp[k] * glowA) / A;
          d[o + 3] = Math.round(A * 255);
        }
      }
    }
    var col = canvas(W, H); col.getContext('2d').putImageData(img, 0, 0);

    // find the lights: local maxima of the blurred light map
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
      if (keep.length < 14 && keep.every(function (q) { return Math.hypot(q.x - p.x, q.y - p.y) > 80 * s; })) keep.push(p);
    });
    if (!keep.length) keep.push({ x: W / 2, y: H / 2, v: 1 });
    // switch on from the back of the room forward
    keep.sort(function (a, b) { return (a.y + a.x * 0.25) - (b.y + b.x * 0.25); });
    var N = keep.length;
    keep.forEach(function (p, j) { p.t = N === 1 ? 0 : (j / (N - 1)) * 0.72; });
    // the shader blends between the lights by distance, so no reveal map is needed
    return { color: col, time: null, mode: 2, lights: keep.slice(0, 16), sig: 34 * s };
  }

  /* ---------- WebGL reveal ---------- */
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform sampler2D uC,uT;uniform float uP,uMode,uRowH,uS;uniform vec2 uSize;',
    'uniform vec4 uPaper;uniform vec3 uHead,uGlow;uniform float uHeadA,uGlowA;',
    'uniform vec3 uPk[16];uniform float uN,uSig;',
    'varying vec2 v;',
    'float ramp(float x,float w){float u=clamp(x/w,0.,1.);',
    '  float f=smoothstep(0.,.08,u)*.85;',
    '  f*=1.-.8*smoothstep(.08,.13,u)*(1.-smoothstep(.17,.24,u));',
    '  return max(f*(1.-step(.24,u)),smoothstep(.2,1.,u));}',
    'void main(){',
    '  vec4 c=texture2D(uC,v);vec4 t=texture2D(uT,v);vec4 o=vec4(0.);',
    '  if(uMode<.5){',
    '    float T=(t.r*255.*256.+t.b*255.)/65535.;',
    '    float local=(uP-T)/.055;',
    '    float a=t.a<.01?step(.999,uP):smoothstep(t.g-.1,t.g+.02,local);',
    '    o=c*a;',
    '  }else if(uMode<1.5){',
    '    float py=v.y*uSize.y;float rows=uSize.y/uRowH;',
    '    float head=mix(-3.,rows+30.,uP);float row=floor(py/uRowH);',
    '    float age=head-row;float vis=step(1.,age);',
    '    float a=vis*mix(.18,1.,smoothstep(0.,22.,age));',
    '    o=c*a;o=o+uPaper*(1.-o.a);',
    '    if(uP>0.&&uP<1.){',
    '      float d=py-floor(head)*uRowH;',
    '      float g=uGlowA*exp(-abs(d)/(26.*uS))*(d>0.?1.:.35);',
    '      o=vec4(uGlow*g,g)+o*(1.-g);',
    '      float h=uHeadA*(1.-smoothstep(.6*uS,1.6*uS,abs(d-.5*uS)));',
    '      o=vec4(uHead*h,h)+o*(1.-h);',
    '    }',
    '  }else{',
    '    vec2 px=v*uSize;float dm=1e9;',
    '    for(int j=0;j<16;j++){if(float(j)>=uN)break;dm=min(dm,distance(px,uPk[j].xy));}',
    '    float sw=0.,sa=0.;',
    '    for(int j=0;j<16;j++){if(float(j)>=uN)break;float w=exp(-(distance(px,uPk[j].xy)-dm)/uSig);sw+=w;sa+=w*ramp(uP-uPk[j].z,.13);}',
    '    float a=sa/max(sw,1e-4);',
    '    o=c*a;',
    '  }',
    '  gl_FragColor=o;',
    '}'
  ].join('\n');

  function Renderer(cv) {
    var gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    this.gl = gl;
    if (!gl) return;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    var self = this;
    ['uC', 'uT', 'uP', 'uMode', 'uRowH', 'uS', 'uSize', 'uPaper', 'uHead', 'uGlow', 'uHeadA', 'uGlowA', 'uPk', 'uN', 'uSig'].forEach(function (n) { self.u[n] = gl.getUniformLocation(pr, n); });
    this.tC = gl.createTexture(); this.tT = gl.createTexture();
    gl.uniform1i(this.u.uC, 0); gl.uniform1i(this.u.uT, 1);
  }
  Renderer.prototype.setTex = function (unit, tex, src, w, h, premul, linear) {
    var gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premul);
    if (src instanceof HTMLCanvasElement) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    var f = linear ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  Renderer.prototype.load = function (res, W, H, dark, s) {
    var gl = this.gl; if (!gl) return;
    this.setTex(0, this.tC, res.color, W, H, true);
    if (res.time) this.setTex(1, this.tT, res.time, res.timeW || W, res.timeH || H, false, !!res.timeLinear);
    else this.setTex(1, this.tT, new Uint8Array(4), 1, 1, false, false);
    var u = this.u;
    gl.uniform1f(u.uMode, res.mode); gl.uniform1f(u.uRowH, res.rowH || 1); gl.uniform1f(u.uS, s);
    gl.uniform2f(u.uSize, W, H);
    // thermal paper: a faint warmth under the print
    var paper = dark ? [C.lamp, 0.03] : [C.lamp, 0.1];
    var pa = res.mode === 1 ? paper[1] : 0;
    gl.uniform4f(u.uPaper, paper[0][0] / 255 * pa, paper[0][1] / 255 * pa, paper[0][2] / 255 * pa, pa);
    var head = dark ? C.porcelain : C.slate;
    gl.uniform3f(u.uHead, head[0] / 255, head[1] / 255, head[2] / 255);
    gl.uniform3f(u.uGlow, C.lamp[0] / 255, C.lamp[1] / 255, C.lamp[2] / 255);
    gl.uniform1f(u.uHeadA, dark ? 0.85 : 0.75);
    gl.uniform1f(u.uGlowA, dark ? 0.22 : 0.35);
    if (res.lights) {
      var pk = new Float32Array(48);
      res.lights.forEach(function (l, j) { pk[j * 3] = l.x; pk[j * 3 + 1] = l.y; pk[j * 3 + 2] = l.t; });
      gl.uniform3fv(u.uPk, pk); gl.uniform1f(u.uN, res.lights.length); gl.uniform1f(u.uSig, res.sig);
    } else gl.uniform1f(u.uN, 0);
    gl.viewport(0, 0, W, H);
  };
  Renderer.prototype.draw = function (p) {
    var gl = this.gl; if (!gl) return;
    gl.uniform1f(this.u.uP, p);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /* ---------- samples ---------- */
  var BUILD = { tally: buildTally, thermal: buildThermal, light: buildLight };
  var samples = [].map.call(document.querySelectorAll('.sample'), function (el) {
    var cv = el.querySelector('canvas');
    return { el: el, cv: cv, t: el.dataset.t, dark: el.dataset.g === 'dark', r: new Renderer(cv), key: null, p: -1, ready: false };
  });

  function scale() { return Math.min(window.devicePixelRatio || 1, 2); }

  var job = 0;
  function rebuild() {
    var my = ++job, key = current;
    samples.forEach(function (sm) { sm.ready = false; });
    loadImage(key).then(function (img) {
      // nearest sample first, so the one on screen appears quickly
      var order = samples.slice().sort(function (a, b) {
        return Math.abs(a.el.getBoundingClientRect().top) - Math.abs(b.el.getBoundingClientRect().top);
      });
      (function next(i) {
        if (my !== job || i >= order.length) { if (my === job) document.documentElement.dataset.ready = key; return; }
        var sm = order[i], s = scale(), box = sm.cv.parentNode.getBoundingClientRect();
        var W = Math.max(2, Math.round(box.width * s)), H = Math.max(2, Math.round(box.height * s));
        sm.cv.width = W; sm.cv.height = H;
        var P = prep(key, img, W, H);
        var res = BUILD[sm.t](P, sm.dark, s);
        sm.r.load(res, W, H, sm.dark, s);
        sm.key = key; sm.ready = true; sm.p = -1;
        frame();
        setTimeout(function () { next(i + 1); }, 0);
      })(0);
    }).catch(function (e) { console.error(e); });
  }

  function progress(sm, vh) {
    if (reduce) return 1;
    if (forcedP !== null) return clamp(forcedP, 0, 1);
    var top = sm.el.getBoundingClientRect().top;
    // starts as the sample comes in, finishes after about one screen pinned
    return clamp((vh * 0.4 - top) / (vh * 1.3), 0, 1);
  }

  var queued = false;
  function frame() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      var vh = window.innerHeight;
      samples.forEach(function (sm) {
        if (!sm.ready) return;
        var rc = sm.el.getBoundingClientRect();
        if (rc.bottom < -50 || rc.top > vh + 50) return;
        var p = progress(sm, vh);
        if (Math.abs(p - sm.p) < 1e-4) return;
        sm.p = p; sm.r.draw(p);
      });
    });
  }
  window.addEventListener('scroll', frame, { passive: true });

  var lastW = window.innerWidth, rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (window.innerWidth === lastW) { frame(); return; }
      lastW = window.innerWidth; prepCache = {}; rebuild();
    }, 250);
  });

  [].forEach.call(document.querySelectorAll('.switch button'), function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.src === current) return;
      current = b.dataset.src;
      [].forEach.call(document.querySelectorAll('.switch button'), function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      prepCache = {};
      rebuild();
    });
    b.setAttribute('aria-pressed', String(b.dataset.src === current));
  });

  rebuild();
})();
