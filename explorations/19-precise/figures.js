/* Tooey figures. Each figure is a pure function of time: render(name, variant, t)
   returns the inner SVG markup for that moment. The build renders the final
   moment into the HTML (so the page reads without JavaScript and under reduced
   motion); in the browser, site.js replays the same function frame by frame.

   Motion rules: anything that stands for time passing moves at constant speed
   (linear). Anything that stands for a worked-out value settles on one
   ease-out curve, with no bounce. All values are examples. */
(function (root) {
  'use strict';

  /* ---------- helpers ---------- */
  var clamp = function (x, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x)); };
  var seg = function (t, a, b) { return clamp((t - a) / (b - a)); };
  var settle = function (p) { return 1 - Math.pow(1 - p, 3); };
  var lerp = function (a, b, p) { return a + (b - a) * p; };
  var r = function (n) { return Math.round(n * 100) / 100; };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };

  function text(x, y, s, size, cls, extra) {
    return '<text x="' + r(x) + '" y="' + r(y) + '" font-size="' + size + '" class="' + cls + '"' + (extra || '') + '>' + esc(s) + '</text>';
  }

  /* A number whose digits roll into place like a counter wheel. p is 0..1.
     At p = 1 it is plain text, so the resting state is ordinary, crisp text. */
  var DIGIT = 0.5; // advance of a tabular digit in Sofia Sans Semi Condensed, in em
  function rollNumber(id, x, y, value, size, cls, p) {
    if (p >= 1) return text(x, y, value, size, cls);
    if (p <= 0) return '';
    var s = String(value), out = '', adv = size * DIGIT, lh = size * 1.15;
    out += '<clipPath id="' + id + '"><rect x="' + r(x - 2) + '" y="' + r(y - size * 0.86) + '" width="' + r(adv * s.length + 4) + '" height="' + r(size * 1.02) + '"/></clipPath><g clip-path="url(#' + id + ')">';
    for (var i = 0; i < s.length; i++) {
      var d = +s[i];
      // each wheel settles to its digit; later digits start a beat later
      var q = settle(clamp((p - i * 0.12) / (1 - i * 0.12)));
      var v = d * q, lo = Math.floor(v), frac = v - lo;
      var dx = x + i * adv;
      out += text(dx, y - frac * lh, lo % 10, size, cls);
      out += text(dx, y + (1 - frac) * lh, (lo + 1) % 10, size, cls);
    }
    return out + '</g>';
  }

  /* Path through points, cut at x (time runs left to right). */
  function cutPoints(pts, cut) {
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      if (pts[i][0] <= cut) { out.push(pts[i]); continue; }
      if (i > 0) {
        var a = pts[i - 1], b = pts[i], q = (cut - a[0]) / (b[0] - a[0]);
        out.push([cut, lerp(a[1], b[1], q)]);
      }
      break;
    }
    return out;
  }
  function polyD(pts) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + r(p[0]) + ' ' + r(p[1]); }).join(' ');
  }

  /* A path drawn along its length (pathLength trick). */
  function drawn(d, p, cls, extra) {
    if (p <= 0) return '';
    var dash = p >= 1 ? '' : ' pathLength="100" stroke-dasharray="100 101" stroke-dashoffset="' + r(100 * (1 - p)) + '"';
    return '<path d="' + d + '" class="' + cls + '"' + dash + (extra || '') + '/>';
  }
  var op = function (o) { return o >= 1 ? '' : ' opacity="' + r(o) + '"'; };

  /* ---------- shared example data ---------- */
  // Items sold per quarter hour, 5 pm to 11 pm (25 samples). Example.
  var SALES = [6, 8, 11, 15, 19, 24, 30, 35, 38, 40, 37, 34, 31, 27, 24, 21, 17, 14, 12, 10, 8, 6, 5, 3, 2];

  // How many people each half hour needs, 5 pm to 11 pm (13 points). Example.
  var NEED = [1.6, 2.0, 2.9, 4.2, 5.4, 5.9, 5.8, 5.3, 4.6, 3.8, 3.0, 2.2, 1.6];
  // Six shifts, [start, end] in hours. Evenly spread first, then fitted.
  var NAIVE = [[5, 8], [5, 8], [5, 8], [8, 11], [8, 11], [8, 11]];
  var FITTED = [[5, 11], [5, 9], [5.5, 11], [6, 9.5], [6, 10], [6.5, 11]];

  // Monotone cubic interpolation (no overshoot) through NEED, as a function of hour.
  var need = (function () {
    var n = NEED.length, h = 0.5, m = [], dlt = [];
    for (var i = 0; i < n - 1; i++) dlt.push((NEED[i + 1] - NEED[i]) / h);
    m[0] = dlt[0]; m[n - 1] = dlt[n - 2];
    for (i = 1; i < n - 1; i++) m[i] = dlt[i - 1] * dlt[i] <= 0 ? 0 : (dlt[i - 1] + dlt[i]) / 2;
    for (i = 0; i < n - 1; i++) {
      if (dlt[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      var a = m[i] / dlt[i], b = m[i + 1] / dlt[i], s = a * a + b * b;
      if (s > 9) { var tt = 3 / Math.sqrt(s); m[i] = tt * a * dlt[i]; m[i + 1] = tt * b * dlt[i]; }
    }
    return function (hour) {
      var x = clamp((hour - 5) / h, 0, n - 1.000001), k = Math.floor(x), u = x - k;
      var h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
      return h00 * NEED[k] + h10 * h * m[k] + h01 * NEED[k + 1] + h11 * h * m[k + 1];
    };
  })();
  function staffAt(bars, hour) {
    var c = 0;
    for (var i = 0; i < bars.length; i++) if (hour >= bars[i][0] - 1e-9 && hour < bars[i][1] - 1e-9) c++;
    return c;
  }
  /* Closed outline of the staffing steps between hours a and b. */
  function stepPoints(bars, X, Y, a, b) {
    var edges = [a, b];
    bars.forEach(function (s) { edges.push(s[0], s[1]); });
    edges = edges.filter(function (e) { return e >= a && e <= b; }).sort(function (p, q) { return p - q; });
    var pts = [[X(a), Y(0)]];
    for (var i = 0; i < edges.length - 1; i++) {
      if (edges[i + 1] - edges[i] < 1e-6) continue;
      var c = staffAt(bars, (edges[i] + edges[i + 1]) / 2);
      pts.push([X(edges[i]), Y(c)], [X(edges[i + 1]), Y(c)]);
    }
    pts.push([X(b), Y(0)]);
    return pts;
  }

  /* ================= HERO: tonight's sales become decisions ================= */
  var HERO_PREP = [['Short rib', 42], ['Margherita', 57], ['Caesar', 26]];
  var WEEK = [52, 30, 44, 50, 66, 74, 60]; // example covers shape; the short one is Tuesday

  var HERO = {
    wide: {
      w: 1200, h: 420,
      lab: [0, 40], labS: 19,
      tr: { x0: 0, x1: 560, base: 360, top: 110 },
      node: [600, 235],
      routes: {
        prep: 'M600 235 H640 Q652 235 652 223 V112 Q652 100 664 100 H760',
        shifts: 'M600 235 H760',
        growth: 'M600 235 H640 Q652 235 652 247 V358 Q652 370 664 370 H760'
      },
      rings: { shifts: [764, 235], growth: [764, 370] },
      plate: { x: 760, y: 30, w: 440, h: 140 },
      prepLab: [788, 70], cols: [788, 924, 1060], nameY: 108, numY: 154, nameS: 18, numS: 44,
      sh: { lab: [788, 242], x0: 892, x1: 1192, base: 270, top: 198 },
      gr: { lab: [788, 377], x0: 892, bw: 30, gap: 14, base: 406, k: 1 }
    },
    narrow: {
      w: 360, h: 620,
      lab: [0, 26], labS: 17,
      tr: { x0: 0, x1: 360, base: 196, top: 64 },
      node: [348, 230],
      routes: {
        prep: 'M348 230 V294 Q348 306 336 306',
        shifts: 'M348 230 V430 Q348 442 336 442 H328',
        growth: 'M348 230 V550 Q348 562 336 562 H328'
      },
      rings: { shifts: [324, 442], growth: [324, 562] },
      plate: { x: 0, y: 252, w: 336, h: 112 },
      prepLab: [16, 280], cols: [16, 120, 224], nameY: 308, nameS: 15, numY: 348, numS: 36,
      sh: { lab: [0, 448], x0: 92, x1: 306, base: 470, top: 412 },
      gr: { lab: [0, 568], x0: 96, bw: 22, gap: 10, base: 596, k: 0.8 }
    }
  };
  var HERO_END = 4.7;

  function hero(variant, t) {
    var L = HERO[variant], o = '', tr = L.tr, id = 'h' + variant[0];
    var X = function (i) { return tr.x0 + i * (tr.x1 - tr.x0) / (SALES.length - 1); };
    var Y = function (v) { return tr.base - v * (tr.base - tr.top) / 40; };
    var pts = SALES.map(function (v, i) { return [X(i), Y(v)]; });

    // Label and axis
    o += text(L.lab[0], L.lab[1], "Tonight's sales", L.labS, 't-lab', op(seg(t, 0, 0.3)));
    var ax = settle(seg(t, 0, 0.35));
    if (ax > 0) o += '<path d="M' + tr.x0 + ' ' + tr.base + ' H' + r(lerp(tr.x0, tr.x1, ax)) + '" class="s-ink" stroke-width="1.25"/>';
    if (ax > 0) [10, 20, 30, 40].forEach(function (v) {
      o += '<path d="M' + tr.x0 + ' ' + r(Y(v)) + ' H' + r(lerp(tr.x0, tr.x1, ax)) + '" class="s-grid"/>';
    });
    for (var hr = 0; hr <= 6; hr++) {
      var hx = lerp(tr.x0, tr.x1, hr / 6);
      if (lerp(tr.x0, tr.x1, ax) >= hx - 0.5) o += '<path d="M' + r(hx) + ' ' + tr.base + ' v6" class="s-ink" stroke-width="1"/>';
    }

    // The evening's sales, drawn at constant speed (it is time)
    var cut = lerp(tr.x0, tr.x1, seg(t, 0.2, 1.1));
    if (t > 0.2) {
      var part = cutPoints(pts, cut);
      if (part.length > 1) {
        o += '<path d="' + polyD(part) + ' L' + r(part[part.length - 1][0]) + ' ' + tr.base + ' L' + tr.x0 + ' ' + tr.base + 'Z" class="f-wash"/>';
        o += '<path d="' + polyD(part) + '" class="s-ink" stroke-width="2" stroke-linejoin="round"/>';
      }
    }

    // The scan reads the night, then gathers into one point
    var sa = seg(t, 1.1, 1.5), sb = settle(seg(t, 1.5, 1.78));
    var nx = L.node[0], ny = L.node[1];
    if (t > 1.1 && t < 1.78) {
      var sx = sb > 0 ? lerp(tr.x1, nx, sb) : lerp(tr.x0, tr.x1, sa);
      var top = lerp(tr.top - 14, ny, sb), bot = lerp(tr.base, ny, sb);
      o += '<path d="M' + r(sx - 6) + ' ' + r(top) + ' H' + r(sx) + ' V' + r(bot) + ' H' + r(sx - 6) + '" class="s-ink" stroke-width="1.25"/>';
    }
    var nodeR = 5 * sb;

    // Routes. Prep is live: solid, in the accent. The others are drawn in outline.
    var rp = settle(seg(t, 1.78, 2.18)), rs = settle(seg(t, 2.5, 2.85)), rg = settle(seg(t, 3.25, 3.6));
    o += drawn(L.routes.shifts, rs, 's-ink', ' stroke-width="1.25"');
    o += drawn(L.routes.growth, rg, 's-ink', ' stroke-width="1.25"');
    o += drawn(L.routes.prep, rp, 's-acc', ' stroke-width="2.5"');
    if (nodeR > 0) o += '<circle cx="' + nx + '" cy="' + ny + '" r="' + r(nodeR) + '" class="f-ink"/>';

    // Prep readout: a white plate, numbers roll in
    var pl = L.plate, po = seg(t, 2.08, 2.3);
    if (po > 0) {
      o += '<g' + op(po) + '><rect x="' + pl.x + '" y="' + pl.y + '" width="' + pl.w + '" height="' + pl.h + '" rx="5" class="f-plate s-hair"/>';
      o += text(L.prepLab[0], L.prepLab[1], 'Prep', L.labS, 't-lab');
      HERO_PREP.forEach(function (d, i) {
        o += text(L.cols[i], L.nameY, d[0], L.nameS, 't-sub');
      });
      o += '</g>';
      HERO_PREP.forEach(function (d, i) {
        o += rollNumber(id + 'n' + i, L.cols[i], L.numY, d[1], L.numS, 't-num t-acc', seg(t, 2.2 + i * 0.08, 2.75 + i * 0.08));
      });
    }

    // Shifts readout (being built): outline of staffing through the evening
    var sh = L.sh;
    if (rs >= 1) {
      var ring = L.rings.shifts;
      o += '<circle cx="' + ring[0] + '" cy="' + ring[1] + '" r="4" class="s-ink f-ground" stroke-width="1.25"/>';
    }
    var so = seg(t, 2.75, 2.95);
    if (so > 0) {
      o += text(sh.lab[0], sh.lab[1], 'Shifts', L.labS, 't-lab', op(so));
      var SX = function (hh) { return sh.x0 + (hh - 5) * (sh.x1 - sh.x0) / 6; };
      var SY = function (p) { return sh.base - p * (sh.base - sh.top) / 6; };
      var scut = 5 + 6 * seg(t, 2.85, 3.45);
      if (scut > 5) {
        var sp = cutPoints(stepPoints(FITTED, SX, SY, 5, 11).slice(0, -1), SX(scut));
        var last = sp[sp.length - 1];
        o += '<path d="' + polyD(sp) + ' L' + r(last[0]) + ' ' + sh.base + '" class="s-ink" stroke-width="1.5"/>';
      }
      o += '<path d="M' + sh.x0 + ' ' + sh.base + ' H' + sh.x1 + '" class="s-hairline"/>';
    }

    // Growth readout (being built): a week, and the quiet night gains a notch
    var gr = L.gr;
    if (rg >= 1) {
      var ring2 = L.rings.growth;
      o += '<circle cx="' + ring2[0] + '" cy="' + ring2[1] + '" r="4" class="s-ink f-ground" stroke-width="1.25"/>';
    }
    var go = seg(t, 3.5, 3.7);
    if (go > 0) {
      o += text(gr.lab[0], gr.lab[1], 'Growth', L.labS, 't-lab', op(go));
      var notch = settle(seg(t, 4.25, 4.65)) * 16 * gr.k;
      WEEK.forEach(function (v, i) {
        var q = settle(seg(t, 3.6 + i * 0.05, 4.0 + i * 0.05));
        if (q <= 0) return;
        var hgt = v * gr.k * q, x = gr.x0 + i * (gr.bw + gr.gap);
        if (i === 1 && notch > 0) {
          o += '<rect x="' + r(x) + '" y="' + r(gr.base - hgt - notch) + '" width="' + gr.bw + '" height="' + r(hgt + notch) + '" class="s-ink" stroke-width="1.25"/>';
          o += '<path d="M' + r(x) + ' ' + r(gr.base - hgt) + ' h' + gr.bw + '" class="s-ink" stroke-width="0.75"/>';
        } else {
          o += '<rect x="' + r(x) + '" y="' + r(gr.base - hgt) + '" width="' + gr.bw + '" height="' + r(hgt) + '" class="s-ink" stroke-width="1.25"/>';
        }
      });
    }
    return o;
  }

  /* ================= PREP: the count arriving ================= */
  var SR = [34, 41, 36, 39, 37], SR_PRED = 38, SR_PREP = 42, DR_LAST = 12;
  var PREP = {
    wide: {
      w: 700, h: 410,
      head: [[440, 'Predicted'], [580, 'Prep']], headY: 34, headS: 16,
      r1: { name: [0, 34], nameS: 21, base: 200, k: 130 / 45, x0: 4, cw: 40, step: 58, pcx: 316, brx: 364, lineEnd: 416, numX: [440, 580], numS: 46, sub: [4, 228], subS: 15 },
      r2: { name: [0, 274], base: 372, numY: 368, reason: [440, 400], reasonS: 17 }
    },
    narrow: {
      w: 360, h: 492,
      head: [[0, 'Predicted'], [140, 'Prep']], headY: 232, headS: 17,
      r1: { name: [0, 26], nameS: 21, base: 168, k: 106 / 45, x0: 2, cw: 30, step: 42, pcx: 228, brx: 266, lineEnd: 300, numX: [0, 140], numS: 44, numY: 280, sub: [2, 196], subS: 16 },
      r2: { name: [0, 340], base: 418, numY: 474, reason: [214, 468], reasonS: 17, numS: 38 }
    }
  };
  var PREP_END = 4.25;

  function prep(variant, t) {
    var L = PREP[variant], a = L.r1, b = L.r2, o = '', id = 'p' + variant[0];
    var Y1 = function (v) { return a.base - v * a.k; };
    var colX = function (i) { return a.x0 + i * a.step; };
    var wide = variant === 'wide';
    var numY1 = wide ? Y1(SR_PRED) + a.numS * 0.34 : a.numY;

    // Column headers and the first dish
    o += text(a.name[0], a.name[1], 'Short rib', a.nameS, 't-lab');
    L.head.forEach(function (h) { o += text(h[0], L.headY, h[1], L.headS, 't-sub'); });
    var bl = settle(seg(t, 0, 0.3));
    o += '<path d="M0 ' + a.base + ' H' + r(lerp(0, a.pcx + a.cw, bl)) + '" class="s-hairline"/>';
    [10, 20, 30, 40].forEach(function (v) {
      o += '<path d="M0 ' + r(Y1(v)) + ' H' + r(lerp(0, a.pcx + a.cw, bl)) + '" class="s-grid"/>';
    });
    o += text(a.sub[0], a.sub[1], 'Past Mondays', a.subS, 't-sub');

    // Five past Mondays rise, one after another (values settle)
    SR.forEach(function (v, i) {
      var q = settle(seg(t, 0.1 + i * 0.2, 0.45 + i * 0.2));
      if (q <= 0) return;
      var hgt = v * a.k * q;
      o += '<rect x="' + colX(i) + '" y="' + r(a.base - hgt) + '" width="' + a.cw + '" height="' + r(hgt) + '" class="f-ink3"/>';
    });

    // The level line sweeps along the baseline, then rises to the prediction
    var lx = seg(t, 1.2, 1.45), ly = settle(seg(t, 1.45, 1.95));
    var lineY = lerp(a.base, Y1(SR_PRED), ly);
    // residuals: how far each Monday sits from the line (the measuring marks)
    var ro = seg(t, 1.6, 1.95);
    if (ro > 0) {
      SR.forEach(function (v, i) {
        var cx = colX(i) + a.cw / 2, ty = Y1(v);
        if (Math.abs(ty - lineY) > 0.5) o += '<path d="M' + r(cx) + ' ' + r(ty) + ' V' + r(lineY) + '" class="s-ink" stroke-width="1"' + op(ro * 0.9) + '/>';
      });
    }

    // The prep column: up to the prediction, then a little over
    var pc = settle(seg(t, 1.95, 2.3)), cu = settle(seg(t, 2.45, 2.85));
    if (pc > 0) {
      var ph = SR_PRED * a.k * pc;
      o += '<rect x="' + a.pcx + '" y="' + r(a.base - ph) + '" width="' + a.cw + '" height="' + r(ph) + '" class="f-acct"/>';
    }
    if (cu > 0) {
      var ch = (SR_PREP - SR_PRED) * a.k * cu;
      o += '<rect x="' + a.pcx + '" y="' + r(Y1(SR_PRED) - ch) + '" width="' + a.cw + '" height="' + r(ch) + '" class="f-acc"/>';
    }
    var bo = seg(t, 2.7, 2.95);
    if (bo > 0) {
      var y42 = Y1(SR_PREP), y38 = Y1(SR_PRED);
      o += '<path d="M' + (a.brx - 5) + ' ' + r(y42) + ' H' + a.brx + ' V' + r(y38) + ' H' + (a.brx - 5) + '" class="s-ink" stroke-width="1"' + op(bo) + '/>';
      o += text(a.brx + 6, (y42 + y38) / 2 + 5, '+4', wide ? 15 : 17, 't-num t-ink', op(bo));
    }
    if (lx > 0) {
      o += '<path d="M0 ' + r(lineY) + ' H' + r(lerp(0, a.lineEnd, lx)) + '" class="s-acc" stroke-width="2"/>';
    }

    // Readouts
    o += rollNumber(id + 'a', a.numX[0], numY1, SR_PRED, a.numS, 't-num t-ink', seg(t, 1.9, 2.4));
    o += rollNumber(id + 'b', a.numX[1], numY1, SR_PREP, a.numS, 't-num t-acc t-strong', seg(t, 2.6, 3.1));

    // Second dish: too new to call
    var r2o = settle(seg(t, 3.0, 3.3));
    if (r2o > 0) {
      var dy = r(10 * (1 - r2o));
      o += '<g transform="translate(0 ' + dy + ')"' + op(r2o) + '>';
      o += text(b.name[0], b.name[1], 'Duck ragù', a.nameS, 't-lab');
      for (var i = 0; i < 5; i++) {
        o += '<path d="M' + colX(i) + ' ' + b.base + ' h' + a.cw + '" class="s-ink" stroke-width="1.25"/>';
      }
      var h2 = DR_LAST * a.k;
      o += '<rect x="' + colX(4) + '" y="' + r(b.base - h2) + '" width="' + a.cw + '" height="' + r(h2) + '" class="f-ink3"/>';
      o += '</g>';
      // a level line starts, finds too little to go on, and withdraws
      var la = seg(t, 3.3, 3.6), lw = seg(t, 3.6, 3.85);
      if (la > 0 && lw < 1) {
        o += '<path d="M' + r(lerp(0, a.step * 2.4, lw)) + ' ' + b.base + ' H' + r(lerp(0, a.step * 2.4, la)) + '" class="s-acc" stroke-width="2"/>';
      }
      var dd = seg(t, 3.8, 4.0), re = seg(t, 3.95, 4.25);
      if (dd > 0) {
        var dashY = wide ? b.numY : b.numY, dS = wide ? a.numS : b.numS;
        o += text(a.numX[0], dashY, '–', dS, 't-num t-sub', op(dd));
        o += text(a.numX[1], dashY, '–', dS, 't-num t-sub', op(dd));
      }
      if (re > 0) {
        var reason = 'Too new to call', n = Math.round(reason.length * re);
        o += text(b.reason[0], b.reason[1], reason.slice(0, n), b.reasonS, 't-sub');
      }
    }
    return o;
  }

  /* ================= SHIFTS: fitting a busy night (concept) ================= */
  // Wide is for desktop; narrow keeps the same hours but gives people more height on a phone.
  var SHL = {
    wide: { w: 720, h: 322, x0: 20, x1: 700, base: 150, per: 17, laneY: 178, barH: 13, barStep: 20, labS: 16 },
    narrow: { w: 360, h: 350, x0: 8, x1: 352, base: 150, per: 19, laneY: 176, barH: 16, barStep: 25, labS: 15 }
  };
  var SHIFTS_END = 3.45;

  function gapPolys(bars, sign, X, Y) {
    // regions where need is above staff (sign 1) or staff above need (sign -1)
    var polys = [], run = null, N = 360;
    for (var i = 0; i <= N; i++) {
      var h = 5 + 6 * i / N, n = need(h), s = staffAt(bars, Math.min(h, 10.9999));
      var diff = sign > 0 ? n - s : s - n;
      if (diff > 0.02) {
        if (!run) run = { top: [], bot: [] };
        run.top.push([X(h), Y(sign > 0 ? n : s)]);
        run.bot.push([X(h), Y(sign > 0 ? s : n)]);
      } else if (run) { polys.push(run); run = null; }
    }
    if (run) polys.push(run);
    return polys.map(function (p) { return polyD(p.top.concat(p.bot.reverse())) + 'Z'; });
  }

  function shifts(variant, t) {
    var S = SHL[variant], o = '', vs = ' vector-effect="non-scaling-stroke"';
    var X = function (h) { return S.x0 + (h - 5) * (S.x1 - S.x0) / 6; };
    var Y = function (p) { return S.base - p * S.per; };
    o += '<defs><pattern id="hatch-' + variant + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V7" class="s-ink" stroke-width="1.2"/></pattern></defs>';
    var bl = settle(seg(t, 0, 0.3)), blx = lerp(S.x0, S.x1, bl);
    o += '<path d="M' + S.x0 + ' ' + S.base + ' H' + r(blx) + '" class="s-ink" stroke-width="1"' + vs + '/>';
    for (var h = 5; h <= 11; h++) {
      if (blx >= X(h) - 0.5) o += '<path d="M' + r(X(h)) + ' ' + S.base + ' v6" class="s-ink" stroke-width="1"' + vs + '/>';
    }

    // where each shift sits right now: evenly spread first, then fitted (values settle)
    var bars = NAIVE.map(function (nv, i) {
      var q = settle(seg(t, 2.2 + i * 0.08, 3.0 + i * 0.08));
      return [lerp(nv[0], FITTED[i][0], q), lerp(nv[1], FITTED[i][1], q)];
    });

    // the gaps between how busy it is and who is on
    var go = seg(t, 1.6, 2.0);
    if (go > 0) {
      gapPolys(bars, -1, X, Y).forEach(function (d) { o += '<path d="' + d + '" class="f-over"' + op(go) + '/>'; });
      gapPolys(bars, 1, X, Y).forEach(function (d) { o += '<path d="' + d + '" fill="url(#hatch-' + variant + ')"' + op(go) + '/>'; });
    }

    // how busy the night will be: drawn at constant speed (it is time)
    var cut = 5 + 6 * seg(t, 0.1, 1.1);
    if (cut > 5) {
      var pts = [];
      for (var i = 0; i <= 120; i++) { var hh = 5 + 6 * i / 120; if (hh > cut) break; pts.push([X(hh), Y(need(hh))]); }
      pts.push([X(cut), Y(need(cut))]);
      o += '<path d="' + polyD(pts) + '" class="s-ink" stroke-width="2"' + vs + '/>';
    }

    // who is on, hour by hour
    var so = seg(t, 1.3, 1.6);
    if (so > 0) {
      o += '<path d="' + polyD(stepPoints(bars, X, Y, 5, 11)) + '" class="s-ink" stroke-width="1.25"' + vs + op(so) + '/>';
    }

    var ly = S.laneY + 6 * S.barStep + S.labS + 4;
    o += text(S.x0, ly, '5 pm', S.labS, 't-sub', op(bl));
    o += text(S.x1, ly, '11 pm', S.labS, 't-sub', ' text-anchor="end"' + op(bl));

    bars.forEach(function (bar, i) {
      var q = settle(seg(t, 1.1 + i * 0.06, 1.45 + i * 0.06));
      if (q <= 0) return;
      var y = S.laneY + i * S.barStep - 14 * (1 - q);
      o += '<rect x="' + r(X(bar[0])) + '" y="' + r(y) + '" width="' + r(X(bar[1]) - X(bar[0])) + '" height="' + S.barH + '" rx="2" class="s-ink f-ground" stroke-width="1.25"' + vs + op(q) + '/>';
    });
    return o;
  }

  /* ================= GROWTH: a quiet night filling (concept) ================= */
  // Wide: the week, with regulars in a field to the right. Narrow: the field sits below.
  var GRL = {
    wide: { w: 720, h: 296, x0: 24, cw: 40, step: 58, base: 262, field: { x0: 500, y0: 100, gap: 38 }, lift: 110 },
    narrow: { w: 420, h: 452, x0: 20, cw: 40, step: 56, base: 262, field: { x0: 72, y0: 336, gap: 52 }, lift: 260 }
  };
  var DAYS = [150, 86, 128, 140, 180, 196, 160];
  var TYPICAL = 150;
  var FIELD_COLS = 6, FIELD_ROWS = 4, DOT = 6;
  var LAPSED = [1, 4, 8, 9, 14, 16, 19, 22];
  var GROWTH_END = 3.3;

  function growth(variant, t) {
    var G = GRL[variant], o = '', vs = ' vector-effect="non-scaling-stroke"';
    var Y = function (v) { return G.base - v; };
    var tueX = G.x0 + G.step, tueTop = Y(DAYS[1]), typY = Y(TYPICAL);
    var right = G.x0 + 6 * G.step + G.cw + 8;
    var fgapY = variant === 'narrow' ? 34 : G.field.gap;

    o += '<path d="M' + (G.x0 - 8) + ' ' + G.base + ' H' + right + '" class="s-ink" stroke-width="1"' + vs + '/>';
    o += text(tueX + G.cw / 2, G.base + 24, 'Tue', 16, 't-sub', ' text-anchor="middle"' + op(seg(t, 0.1, 0.4)));

    // fill progress of the quiet night, driven by the returning dots
    var targets = [];
    for (var k = 0; k < LAPSED.length; k++) {
      targets.push([tueX + 11 + (k % 2) * 18, tueTop - 9 - Math.floor(k / 2) * 16]);
    }
    var arrive = LAPSED.map(function (_, k) { return settle(seg(t, 1.4 + k * 0.14, 2.1 + k * 0.14)); });
    var filled = arrive.reduce(function (s, v) { return s + v; }, 0) / LAPSED.length;

    DAYS.forEach(function (v, i) {
      var q = settle(seg(t, 0.05 + i * 0.07, 0.55 + i * 0.07));
      if (q <= 0) return;
      var x = G.x0 + i * G.step, hgt = v * q;
      if (i === 1 && filled > 0) {
        var top = lerp(tueTop, typY, filled);
        o += '<rect x="' + x + '" y="' + r(top) + '" width="' + G.cw + '" height="' + r(G.base - top) + '" class="s-ink" stroke-width="1.5"' + vs + '/>';
        o += '<path d="M' + x + ' ' + r(tueTop) + ' h' + G.cw + '" class="s-ink" stroke-width="1"' + vs + op(0.6) + '/>';
      } else {
        o += '<rect x="' + x + '" y="' + r(G.base - hgt) + '" width="' + G.cw + '" height="' + r(hgt) + '" class="s-ink" stroke-width="1.5"' + vs + '/>';
      }
    });

    // a typical night, and how far below it Tuesday sits
    var tl = seg(t, 0.9, 1.3);
    if (tl > 0) o += '<path d="M' + (G.x0 - 8) + ' ' + r(typY) + ' H' + r(lerp(G.x0 - 8, right, tl)) + '" class="s-ink" stroke-width="1"' + vs + op(0.7) + '/>';
    var bo = seg(t, 1.1, 1.35) * (1 - seg(t, 1.6, 2.2));
    if (bo > 0) {
      var bx = tueX + G.cw / 2;
      o += '<path d="M' + (bx - 5) + ' ' + r(typY) + ' H' + (bx + 5) + ' M' + bx + ' ' + r(typY) + ' V' + r(tueTop) + ' M' + (bx - 5) + ' ' + r(tueTop) + ' H' + (bx + 5) + '" class="s-ink" stroke-width="1"' + vs + op(bo) + '/>';
    }

    // regulars: the field, with the ones who haven't been in lately drawn faint
    for (var i = 0; i < FIELD_COLS * FIELD_ROWS; i++) {
      var fx = G.field.x0 + (i % FIELD_COLS) * G.field.gap, fy = G.field.y0 + Math.floor(i / FIELD_COLS) * fgapY;
      var appear = seg(t, 0.4 + (i % FIELD_COLS) * 0.04, 0.8 + (i % FIELD_COLS) * 0.04);
      if (appear <= 0) continue;
      var li = LAPSED.indexOf(i);
      if (li < 0) {
        o += '<circle cx="' + fx + '" cy="' + fy + '" r="' + DOT + '" class="s-ink f-ground" stroke-width="1.5"' + vs + op(appear) + '/>';
        continue;
      }
      var q = arrive[li], tg = targets[li];
      // where a regular used to be, a point stays behind
      if (q > 0) o += '<circle cx="' + fx + '" cy="' + fy + '" r="1.6" class="f-ink3"' + op(q) + '/>';
      // along an exact arc: a quadratic curve that lifts toward the week
      var cx = (fx + tg[0]) / 2, cy = Math.min(fy, tg[1]) - G.lift;
      var px = (1 - q) * (1 - q) * fx + 2 * (1 - q) * q * cx + q * q * tg[0];
      var py = (1 - q) * (1 - q) * fy + 2 * (1 - q) * q * cy + q * q * tg[1];
      o += '<circle cx="' + r(px) + '" cy="' + r(py) + '" r="' + DOT + '" class="s-ink f-ground" stroke-width="1.5"' + vs + op(appear * lerp(0.35, 1, q)) + '/>';
    }
    return o;
  }
  var api = {
    figures: {
      hero: { end: HERO_END, render: hero, size: function (v) { return [HERO[v].w, HERO[v].h]; } },
      prep: { end: PREP_END, render: prep, size: function (v) { return [PREP[v].w, PREP[v].h]; } },
      shifts: { end: SHIFTS_END, render: shifts, size: function (v) { return [SHL[v].w, SHL[v].h]; } },
      growth: { end: GROWTH_END, render: growth, size: function (v) { return [GRL[v].w, GRL[v].h]; } }
    },
    // checks used by the build
    _check: function () {
      var worst = 99;
      for (var i = 0; i <= 600; i++) { var h = 5 + 6 * i / 600; if (h >= 11) break; worst = Math.min(worst, staffAt(FITTED, h) - need(h)); }
      return { fittedMinusNeedMin: worst };
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TooeyFigures = api;
})(this);
