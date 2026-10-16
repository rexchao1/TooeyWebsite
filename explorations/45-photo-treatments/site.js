/* Exploration 45: one photo, three treatments, all drawn on canvas from the
   photo's luminance. A camera { x, y, z } picks the view: x and y are the
   view centre in the photo (0 to 1), z the zoom. */
(function () {
  var SLATE = '#232a2f', PAPER = '#f2f1ec';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var img = new Image();
  img.src = 'prep.jpg';
  img.onload = function () { start(luma(img)); };

  // Luminance grid, stretched so the 2nd and 98th percentiles hit 0 and 1.
  function luma(im) {
    var w = 1600, h = Math.round(w * im.height / im.width);
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.drawImage(im, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data, L = new Float32Array(w * h);
    for (var i = 0; i < w * h; i++) L[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
    var raw = stretch(Float32Array.from(L));
    // Local contrast: push each pixel away from its neighbourhood, so edges read in line and type.
    var B = blur(L, w, h, 18);
    for (i = 0; i < L.length; i++) L[i] = L[i] + 1.3 * (L[i] - B[i]);
    return { w: w, h: h, L: stretch(L), raw: raw };
  }

  function stretch(L) {
    var s = Array.prototype.slice.call(L.filter(function (_, i) { return i % 37 === 0; })).sort();
    var lo = s[Math.floor(s.length * .02)], hi = s[Math.floor(s.length * .98)];
    for (var i = 0; i < L.length; i++) L[i] = Math.min(1, Math.max(0, (L[i] - lo) / (hi - lo)));
    return L;
  }

  // Separable box blur, run twice (close to a gaussian).
  function blur(src, w, h, r) {
    var a = Float32Array.from(src), b = new Float32Array(src.length);
    for (var pass = 0; pass < 2; pass++) {
      for (var y = 0; y < h; y++) {
        var acc = 0, row = y * w;
        for (var x = -r; x <= r; x++) acc += a[row + Math.min(w - 1, Math.max(0, x))];
        for (x = 0; x < w; x++) {
          b[row + x] = acc / (2 * r + 1);
          acc += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
        }
      }
      for (x = 0; x < w; x++) {
        acc = 0;
        for (y = -r; y <= r; y++) acc += b[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (y = 0; y < h; y++) {
          a[y * w + x] = acc / (2 * r + 1);
          acc += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
        }
      }
    }
    return a;
  }

  // Bilinear luminance at photo coords u, v in 0..1.
  function at(G, u, v) {
    var fx = Math.min(G.w - 1.001, Math.max(0, u * (G.w - 1)));
    var fy = Math.min(G.h - 1.001, Math.max(0, v * (G.h - 1)));
    var x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0, i = y0 * G.w + x0, L = G.L;
    return (L[i] * (1 - tx) + L[i + 1] * tx) * (1 - ty) + (L[i + G.w] * (1 - tx) + L[i + G.w + 1] * tx) * ty;
  }

  // Keep the view inside the photo.
  function clampCam(c) {
    var hw = .5 / c.z;
    return { x: Math.min(1 - hw, Math.max(hw, c.x)), y: Math.min(1 - hw, Math.max(hw, c.y)), z: c.z };
  }
  // Screen point (0..1) to photo point.
  function map(c, sx, sy) { return [c.x + (sx - .5) / c.z, c.y + (sy - .5) / c.z]; }

  // Slow breathing drift used by every panel once it has drawn in.
  function drift(t) {
    var a = t / 1000;
    return clampCam({ x: BASE.x + .025 * Math.sin(a * .21), y: BASE.y + .02 * Math.sin(a * .17 + 1), z: BASE.z + .05 * Math.sin(a * .13) });
  }
  // Framed past the blurred foreground at the photo's left and right.
  var BASE = { x: .55, y: .48, z: 1.22 };

  // Ink fades to paper toward the frame's edges, so the photo bleeds off like 35's drawings.
  function edge(sx, sy) { return smooth(0, .14, sx) * smooth(1, .86, sx) * smooth(0, .12, sy) * smooth(1, .88, sy); }

  function smooth(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }

  function rnd(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function sizer(cv) {
    var ctx = cv.getContext('2d'), box = { w: 0, h: 0, ctx: ctx };
    function fit() {
      var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      box.w = r.width; box.h = r.height;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    window.addEventListener('resize', fit);
    return box;
  }

  /* 1. Engraving. One filled band per row; its half-width follows ink. */
  function engrave(G, B, cam, grow, gap) {
    var ctx = B.ctx, W = B.w, H = B.h;
    gap = gap || 4.5;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = SLATE;
    var step = 2, rows = Math.ceil(H / gap), max = gap * .42;
    for (var r = 0; r < rows; r++) {
      var y = (r + .5) * gap, top = [], bot = [];
      for (var x = 0; x <= W + step; x += step) {
        var p = map(cam, x / W, y / H);
        var e = edge(x / W, y / H), ink = Math.pow(1 - at(G, p[0], p[1]), 1.9) * e;
        var k = grow ? grow(x, y, r) : 1;
        var hw = (.1 * e + ink * max) * k;
        top.push(x, y - hw); bot.push(x, y + hw);
      }
      ctx.beginPath();
      ctx.moveTo(top[0], top[1]);
      for (var i = 2; i < top.length; i += 2) ctx.lineTo(top[i], top[i + 1]);
      for (i = bot.length - 2; i >= 0; i -= 2) ctx.lineTo(bot[i], bot[i + 1]);
      ctx.closePath(); ctx.fill();
    }
  }

  function panelEngrave(G, cv) {
    var B = sizer(cv), t0, DUR = 2200;
    function frame(now) {
      var t = now - t0, f = still ? 1 : Math.min(1, t / DUR);
      // A plotter head sweeping down and across: each row starts a little later.
      var grow = f >= 1 ? null : function (x, y, r) {
        var front = (f * 1.35 - r / (B.h / 4.5) * .35) * (B.w + 240);
        return smooth(0, 240, front - x);
      };
      engrave(G, B, still ? clampCam(BASE) : drift(Math.max(0, t - DUR) + 0), grow);
    }
    return loop(cv, frame, function () { t0 = performance.now(); });
  }

  /* 2. Characters. Denser glyphs for darker cells. */
  var RAMP = ' .·:;-=+*cxo#%@';
  var JUNK = 'abcdefghkmnoprstuvwxz0123456789#%&*+=';
  function panelAscii(G, cv) {
    var B = sizer(cv), t0, R = rnd(7), cw = 6, ch = 10, delay = null;
    function frame(now) {
      var t = now - t0, ctx = B.ctx, W = B.w, H = B.h;
      var cols = Math.floor(W / cw), rows = Math.floor(H / ch);
      if (!delay || delay.length !== cols * rows) {
        delay = new Float32Array(cols * rows);
        for (var i = 0; i < delay.length; i++) delay[i] = Math.floor(i / cols) * 22 + R() * 260;
      }
      var cam = still ? clampCam(BASE) : drift(Math.max(0, t - rows * 22 - 300));
      ctx.globalAlpha = 1;
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = SLATE;
      ctx.font = '500 9.6px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.textBaseline = 'top';
      var ox = (W - cols * cw) / 2, oy = (H - rows * ch) / 2;
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var i2 = r * cols + c, age = still ? 1e9 : t - delay[i2];
        if (age < 0) continue;
        var p = map(cam, (c + .5) / cols, (r + .5) / rows);
        var ink = Math.pow(1 - at(G, p[0], p[1]), 1.7) * edge((c + .5) / cols, (r + .5) / rows);
        var g = RAMP[Math.min(RAMP.length - 1, Math.floor(ink * RAMP.length))];
        // Freshly typed cells flash one wrong glyph; resting cells resettle now and then.
        var scramble = age < 90 || (!still && g !== ' ' && ((i2 * 7919 + Math.floor(t / 140) * 104729) % 997) < 3);
        if (scramble && g !== ' ') g = JUNK[(i2 * 31 + Math.floor(t / 60)) % JUNK.length];
        if (g === ' ') continue;
        // Tone comes from the glyph and from the ink's strength, so light areas stay light.
        ctx.globalAlpha = .3 + .7 * Math.min(1, ink * 1.4);
        ctx.fillText(g, ox + c * cw, oy + r * ch);
      }
    }
    return loop(cv, frame, function () { t0 = performance.now(); delay = null; R = rnd(7); });
  }

  /* 3. Duotone: a mapped copy of the photo, drawn through the camera, with grain. */
  function panelDuotone(G, cv) {
    var B = sizer(cv), t0, DUR = 1800;
    var tone = document.createElement('canvas');
    tone.width = G.w; tone.height = G.h;
    var tc = tone.getContext('2d'), id = tc.createImageData(G.w, G.h);
    var stops = [[0, [35, 42, 47]], [.45, [96, 94, 90]], [.75, [214, 200, 174]], [1, [242, 241, 236]]];
    for (var i = 0; i < G.raw.length; i++) {
      var l = G.raw[i], s = 1;
      while (s < stops.length - 1 && l > stops[s][0]) s++;
      var a = stops[s - 1], b = stops[s], k = (l - a[0]) / (b[0] - a[0]);
      for (var ch = 0; ch < 3; ch++) id.data[i * 4 + ch] = a[1][ch] + (b[1][ch] - a[1][ch]) * k;
      id.data[i * 4 + 3] = 255;
    }
    tc.putImageData(id, 0, 0);
    var grains = [];
    for (var g = 0; g < 4; g++) {
      var gc = document.createElement('canvas'); gc.width = gc.height = 256;
      var gx = gc.getContext('2d'), gd = gx.createImageData(256, 256), R = rnd(g + 11);
      for (var j = 0; j < gd.data.length; j += 4) { var v = R() * 255; gd.data[j] = gd.data[j + 1] = gd.data[j + 2] = v; gd.data[j + 3] = 30; }
      gx.putImageData(gd, 0, 0); grains.push(gc);
    }
    function frame(now) {
      var t = now - t0, ctx = B.ctx, W = B.w, H = B.h, f = still ? 1 : Math.min(1, t / DUR);
      var cam = still ? clampCam(BASE) : drift(Math.max(0, t - DUR));
      var e = smooth(0, 1, f);
      cam = clampCam({ x: cam.x, y: cam.y, z: cam.z * (1 + .06 * (1 - e)) });
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      var vw = G.w / cam.z, vh = G.h / cam.z;
      ctx.globalAlpha = e;
      ctx.drawImage(tone, cam.x * G.w - vw / 2, cam.y * G.h - vh / 2, vw, vh, 0, 0, W, H);
      ctx.globalAlpha = 1;
      if (!still) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = ctx.createPattern(grains[Math.floor(t / 83) % 4], 'repeat');
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    return loop(cv, frame, function () { t0 = performance.now(); });
  }

  // Runs a panel's frame only while it is on screen.
  function loop(cv, frame, reset) {
    var on = false, raf = 0;
    function tick(now) { frame(now); if (on && !still) raf = requestAnimationFrame(tick); }
    new IntersectionObserver(function (es) {
      var was = on; on = es[0].isIntersecting;
      if (on && !was) { if (!reset.done) { reset(); reset.done = 1; } raf = requestAnimationFrame(tick); }
      if (!on) cancelAnimationFrame(raf);
    }).observe(cv);
    return function replay() { reset(); if (still) frame(performance.now()); };
  }

  /* 4. Scroll: three camera stops, eased between, held at each. */
  function scrollDemo(G) {
    var sec = document.querySelector('.scroll'), cv = sec.querySelector('canvas'), B = sizer(cv);
    var items = sec.querySelectorAll('.stops li');
    var STOPS = [{ x: .5, y: .5, z: 1 }, { x: .64, y: .32, z: 1.8 }, { x: .5, y: .6, z: 2 }];
    var want = 0, have = 0, last = -1;
    function progress() {
      var r = sec.getBoundingClientRect(), span = r.height - window.innerHeight;
      return Math.min(1, Math.max(0, -r.top / span));
    }
    function camAt(p) {
      // Each third of the scroll: hold, move, hold.
      var seg = p * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(seg)), k = smooth(.25, .75, seg - i);
      var a = STOPS[i], b = STOPS[i + 1], z = a.z * Math.pow(b.z / a.z, k);
      return clampCam({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: z });
    }
    function tick() {
      want = progress();
      have += (want - have) * (still ? 1 : .14);
      if (Math.abs(have - last) > .0002) {
        engrave(G, B, camAt(have), null, 4.5);
        last = have;
        var n = Math.round(have * (STOPS.length - 1));
        items.forEach(function (li, j) { li.classList.toggle('on', j === n); });
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', function () { last = -1; });
    tick();
  }

  function start(G) {
    var make = { engrave: panelEngrave, ascii: panelAscii, duotone: panelDuotone };
    document.querySelectorAll('.panel').forEach(function (p) {
      var replay = make[p.dataset.kind](G, p.querySelector('canvas'));
      p.querySelector('.replay').addEventListener('click', replay);
    });
    scrollDemo(G);
  }
})();
