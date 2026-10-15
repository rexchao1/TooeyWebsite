/* Tooey, exploration 33: the living sheet.
   Each room is drawn here in fine slate line, in the same 1100 x 900 frame,
   and tagged by when it is drawn: structure (s), furniture (f), detail (d),
   counts written by hand (n, n2), pencil marks (m), lamplight (l).
   Lines tagged h or v are the ones that travel: when the page moves from one
   room to the next they leave this drawing and become the next one's lines. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var W = 1100, H = 900;

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function rnd(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function f1(n) { return Math.round(n * 10) / 10; }
  function rotP(cx, cy, deg) {
    var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return function (x, y) { var dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };
  }
  // the parts of [x0, x1] at height y not hidden behind anything in occ
  function segs(x0, x1, y, occ) {
    var out = [[x0, x1]];
    occ.forEach(function (o) {
      var iv = typeof o === 'function' ? o(y) : (y >= o[2] && y <= o[3] ? [o[0], o[1]] : null);
      if (!iv) return;
      var n = [];
      out.forEach(function (s) {
        if (iv[1] <= s[0] || iv[0] >= s[1]) { n.push(s); return; }
        if (iv[0] > s[0]) n.push([s[0], iv[0]]);
        if (iv[1] < s[1]) n.push([iv[1], s[1]]);
      });
      out = n;
    });
    return out.filter(function (s) { return s[1] - s[0] > 10; });
  }

  /* ---------- handwritten figures: one pencil stroke set per digit, in a 60 x 100 box ---------- */
  var DIGITS = {
    0: ['M31 5C12 5 5 36 6 58C7 84 18 97 32 96C50 94 56 66 54 40C52 16 44 5 31 5'],
    1: ['M14 24L33 5L31 97'],
    2: ['M8 28C10 10 26 2 40 7C56 13 54 34 42 50L7 95L56 93'],
    3: ['M9 16C20 2 50 1 50 23C50 40 36 46 24 47C42 47 58 58 56 76C54 96 22 101 6 86'],
    4: ['M38 5L6 66L57 65', 'M43 32L41 97'],
    5: ['M17 6L12 45C28 33 56 40 56 66C56 92 26 101 8 86', 'M17 6L53 5'],
    6: ['M47 7C25 14 7 40 8 68C9 90 24 98 35 96C52 93 57 70 47 58C37 47 15 51 9 66'],
    7: ['M6 8L55 6L22 97'],
    8: ['M45 15C38 0 10 2 12 22C14 41 52 50 54 72C56 94 26 102 10 86C-2 70 18 53 34 43C48 34 55 24 45 15'],
    9: ['M51 29C47 7 15 4 10 26C7 46 40 51 50 31L46 97']
  };

  /* ---------- a scene ---------- */
  function Scene(name, cfg) {
    this.name = name;
    this.cfg = cfg || {};
    this.items = [];
    this.morph = { h: [], v: [] };
    this.svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: this.cfg.par || 'xMinYMid slice', 'aria-hidden': 'true', focusable: 'false', class: 'draw draw-' + name });
    var defs = el('defs', {}, this.svg);
    var id = 'lr-' + name;
    var rg = el('radialGradient', { id: id }, defs);
    el('stop', { offset: '0', 'stop-color': '#f1d2a0', 'stop-opacity': '1' }, rg);
    el('stop', { offset: '.42', 'stop-color': '#f1d2a0', 'stop-opacity': '.62' }, rg);
    el('stop', { offset: '.75', 'stop-color': '#f1d2a0', 'stop-opacity': '.18' }, rg);
    el('stop', { offset: '1', 'stop-color': '#f1d2a0', 'stop-opacity': '0' }, rg);
    var lv = el('linearGradient', { id: 'lv-' + name, x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    el('stop', { offset: '0', 'stop-color': '#f1d2a0', 'stop-opacity': '.95' }, lv);
    el('stop', { offset: '1', 'stop-color': '#f1d2a0', 'stop-opacity': '.12' }, lv);
    this.radial = 'url(#' + id + ')';
    this.vert = 'url(#lv-' + name + ')';
    this.gLight = el('g', { class: 'g-light' }, this.svg);
    this.gInk = el('g', { class: 'g-ink' }, this.svg);
    this.gTop = el('g', { class: 'g-top' }, this.svg);
  }
  var P = Scene.prototype;

  P.add = function (e, ph, kind, extra) {
    var it = { el: e, ph: ph, kind: kind };
    if (extra) for (var k in extra) it[k] = extra[k];
    this.items.push(it);
    return it;
  };
  // a stroke drawn by its dash offset
  P.path = function (d, o, parent) {
    o = o || {};
    var e = el('path', {
      d: d, pathLength: '1', 'stroke-dasharray': '1 2', 'stroke-dashoffset': '1',
      'stroke-width': o.w || 1, 'stroke-opacity': o.a == null ? 0.8 : o.a,
      class: o.cls || 'ln', visibility: 'hidden'
    }, parent || this.gInk);
    return this.add(e, o.ph || 's', 'stroke');
  };
  P.line = function (x1, y1, x2, y2, o) {
    o = o || {};
    var it = this.path('M' + f1(x1) + ' ' + f1(y1) + 'L' + f1(x2) + ' ' + f1(y2), o);
    if (o.m) {
      it.m = o.m;
      it.L = { x1: x1, y1: y1, x2: x2, y2: y2, a: o.a == null ? 0.8 : o.a, w: o.w || 1 };
      this.morph[o.m].push(it);
    }
    return it;
  };
  P.poly = function (pts, o, close) {
    var d = 'M' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join('L') + (close ? 'Z' : '');
    return this.path(d, o);
  };
  P.rect = function (x, y, w, h, o, r) {
    if (r) {
      var d = 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) +
        'V' + (y + h - r) + 'Q' + (x + w) + ' ' + (y + h) + ' ' + (x + w - r) + ' ' + (y + h) +
        'H' + (x + r) + 'Q' + x + ' ' + (y + h) + ' ' + x + ' ' + (y + h - r) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Z';
      return this.path(d, o);
    }
    return this.path('M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'Z', o);
  };
  P.ellipse = function (cx, cy, rx, ry, o) {
    return this.path('M' + f1(cx - rx) + ' ' + f1(cy) + 'a' + rx + ' ' + ry + ' 0 1 0 ' + 2 * rx + ' 0a' + rx + ' ' + ry + ' 0 1 0 ' + -2 * rx + ' 0', o);
  };
  // a rotated rectangle, as a closed polyline
  P.rrect = function (cx, cy, w, h, deg, o) {
    var r = rotP(cx, cy, deg);
    return this.poly([r(cx - w / 2, cy - h / 2), r(cx + w / 2, cy - h / 2), r(cx + w / 2, cy + h / 2), r(cx - w / 2, cy + h / 2)], o, true);
  };
  // set type that fades in
  P.text = function (x, y, str, cls, ph, parent) {
    var e = el('text', { x: x, y: y, class: cls, opacity: '0' }, parent || this.gTop);
    e.textContent = str;
    return this.add(e, ph || 'd', 'fade');
  };
  // lamplight: a soft pool that grows and warms in
  P.glow = function (cx, cy, rx, ry, a) {
    var e = el('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: this.radial, opacity: '0' }, this.gLight);
    return this.add(e, 'l', 'light', { a: a == null ? 1 : a, cx: cx, cy: cy });
  };
  // lamplight on a lit surface
  P.wash = function (d, a, fill) {
    var e = el('path', { d: d, fill: fill || '#f1d2a0', opacity: '0' }, this.gLight);
    return this.add(e, 'l', 'light', { a: a == null ? 1 : a });
  };
  // a thread of light, drawn along its length
  P.thread = function (d, w, a) {
    var e = el('path', {
      d: d, pathLength: '1', 'stroke-dasharray': '1 2', 'stroke-dashoffset': '1', fill: 'none',
      stroke: '#e9bf7c', 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', visibility: 'hidden'
    }, this.gInk);
    return this.add(e, 'l', 'stroke');
  };
  // a count, written by hand in pencil, then settling into the typeset figure
  P.count = function (x, y, n, size, style, ph, parent) {
    var g = el('g', { class: 'count' }, parent || this.gTop);
    var sold = style === 'sold';
    var s = size * (sold ? 0.68 : 0.72) / 100;
    var px = sold ? 1.5 : Math.max(1.7, size * 0.046);   // pencil width on screen
    var hand = el('g', { class: 'hand' + (sold ? ' hand-sold' : ''), 'stroke-width': f1(px / s) }, g);
    var str = String(n), adv = 58 * s, gap = 9 * s;
    var tw = str.length * adv + (str.length - 1) * gap;
    var x0 = x - tw / 2, top = y - 100 * s;
    var strokes = [];
    var k = sold ? 0.16 : 0.05;   // lean
    for (var i = 0; i < str.length; i++) {
      var dx = x0 + i * (adv + gap);
      var dg = el('g', { transform: 'matrix(' + s.toFixed(4) + ' 0 ' + (-k * s).toFixed(4) + ' ' + s.toFixed(4) + ' ' + f1(dx + 100 * k * s * 0.5) + ' ' + f1(top) + ')' }, hand);
      DIGITS[str[i]].forEach(function (d) {
        strokes.push(el('path', {
          d: d, pathLength: '1', 'stroke-dasharray': '1 2', 'stroke-dashoffset': '1', visibility: 'hidden'
        }, dg));
      });
    }
    var t = el('text', { x: x, y: y, class: style === 'sold' ? 't-sold' : 't-count', opacity: '0', 'font-size': size }, g);
    t.textContent = str;
    return this.add(g, ph || 'n', 'count', { strokes: strokes, hand: hand, typeset: t });
  };
  // hand-drawn loop around a figure
  P.loop = function (cx, cy, rx, ry, o, parent) {
    var pts = [], a0 = -2.2, turns = 1.12, N = 40, R = rnd(Math.round(cx * 7 + cy));
    for (var i = 0; i <= N; i++) {
      var t = a0 + (i / N) * Math.PI * 2 * turns;
      var k = 1 + 0.05 * Math.sin(i * 0.7) + (i / N) * 0.07 + (R() - 0.5) * 0.015;
      pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
    }
    var d = 'M' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join('L');
    return this.path(d, o, parent);
  };

  /* ================= the rooms ================= */
  var BUILD = {};

  /* ---------- 1. the street front ---------- */
  BUILD.street = function () {
    var S = new Scene('street');
    var R = rnd(11);
    var occ = [
      [458, 842, 250, 336],   // awning
      [500, 800, 316, 816],   // door
      [842, 1080, 338, 740],  // window and sill
      [372, 464, 446, 564],   // menu card
      [462, 504, 410, 456], [796, 838, 410, 456], // sconces
      [788, 848, 680, 800]    // plant
    ];
    // brick courses: the wall's structure
    var courses = [];
    for (var y = 92; y <= 790; y += 34) courses.push(y);
    var starts = courses.map(function (y, i) {
      var edge = 0.5 + 0.5 * Math.cos((i / (courses.length - 1)) * Math.PI * 2);
      return 150 + R() * 130 + edge * 70;
    });
    courses.forEach(function (y, i) {
      segs(starts[i], 1100, y, occ).forEach(function (s) {
        S.line(s[0], y, s[1], y, { ph: 's', w: 1, a: 0.17, m: 'h' });
      });
    });
    // the pavement
    S.line(230, 812, 1100, 812, { ph: 's', w: 1.2, a: 0.55, m: 'h' });
    S.line(300, 858, 1100, 858, { ph: 's', w: 1, a: 0.24, m: 'h' });
    // the door frame and the window frame
    S.line(510, 812, 510, 322, { ph: 's', w: 1.3, a: 0.8, m: 'v' });
    S.line(790, 812, 790, 322, { ph: 's', w: 1.3, a: 0.8, m: 'v' });
    S.line(510, 322, 790, 322, { ph: 's', w: 1.3, a: 0.8, m: 'h' });
    S.line(522, 800, 522, 362, { ph: 's', w: 1, a: 0.5, m: 'v' });
    S.line(778, 800, 778, 362, { ph: 's', w: 1, a: 0.5, m: 'v' });
    S.line(522, 362, 778, 362, { ph: 's', w: 1, a: 0.55, m: 'h' });
    S.line(852, 718, 852, 350, { ph: 's', w: 1.2, a: 0.75, m: 'v' });
    S.line(1064, 718, 1064, 350, { ph: 's', w: 1.2, a: 0.75, m: 'v' });
    S.line(852, 350, 1064, 350, { ph: 's', w: 1.2, a: 0.75, m: 'h' });
    S.line(842, 722, 1076, 722, { ph: 's', w: 1.2, a: 0.7, m: 'h' });
    S.line(842, 735, 1076, 735, { ph: 's', w: 1, a: 0.45, m: 'h' });

    // furniture
    S.poly([[498, 262], [802, 262], [834, 318], [466, 318]], { ph: 'f', w: 1.2, a: 0.78 }, true);
    S.poly([[466, 318], [466, 331], [834, 331], [834, 318]], { ph: 'f', w: 1, a: 0.6 });
    [586, 650, 714].forEach(function (x) { S.line(x, 324, x, 360, { ph: 'f', w: 1, a: 0.5 }); });
    [528, 652].forEach(function (x) {
      S.rect(x, 372, 120, 420, { ph: 'f', w: 1.1, a: 0.72 });
      S.rect(x + 14, 388, 92, 236, { ph: 'f', w: 1, a: 0.6 });
      S.rect(x + 14, 648, 92, 128, { ph: 'f', w: 1, a: 0.55 });
    });
    S.line(637, 520, 637, 642, { ph: 'f', w: 2, a: 0.62 });
    S.line(663, 520, 663, 642, { ph: 'f', w: 2, a: 0.62 });
    S.rect(494, 802, 312, 10, { ph: 'f', w: 1, a: 0.55 });
    S.ellipse(482, 432, 12, 12, { ph: 'f', w: 1.2, a: 0.8 });
    S.rect(495, 419, 7, 27, { ph: 'f', w: 1, a: 0.7 }, 2);
    S.ellipse(818, 432, 12, 12, { ph: 'f', w: 1.2, a: 0.8 });
    S.rect(798, 419, 7, 27, { ph: 'f', w: 1, a: 0.7 }, 2);
    S.rect(380, 454, 78, 104, { ph: 'f', w: 1.2, a: 0.75 });
    S.rect(388, 462, 62, 88, { ph: 'f', w: 1, a: 0.6 });
    S.line(958, 350, 958, 718, { ph: 'f', w: 1, a: 0.55 });
    S.line(852, 440, 1064, 440, { ph: 'f', w: 1, a: 0.5 });
    [905, 1010].forEach(function (x) {
      S.line(x, 350, x, 466, { ph: 'f', w: 1, a: 0.6 });
      S.path('M' + (x - 25) + ' 492C' + (x - 25) + ' 470 ' + (x + 25) + ' 470 ' + (x + 25) + ' 492Z', { ph: 'f', w: 1.1, a: 0.75 });
    });
    S.line(856, 664, 1060, 664, { ph: 'f', w: 1, a: 0.5 });
    S.poly([[800, 744], [838, 744], [833, 802], [805, 802]], { ph: 'f', w: 1, a: 0.6 }, true);

    // detail
    for (var i = 1; i < 12; i++) {
      var tx = 498 + 304 * i / 12, bx = 466 + 368 * i / 12;
      S.line(tx, 263, bx, 317, { ph: 'd', w: 1, a: 0.32 });
    }
    S.line(404, 476, 434, 476, { ph: 'd', w: 1.4, a: 0.7 });
    [492, 504, 516, 532, 544].forEach(function (y, j) {
      S.line(395, y, 395 + (j % 2 ? 26 : 34), y, { ph: 'd', w: 1.2, a: 0.62 });
      S.line(433, y, 443, y, { ph: 'd', w: 1.2, a: 0.62 });
    });
    [528, 652].forEach(function (x) { S.line(x + 24, 470, x + 74, 398, { ph: 'd', w: 1, a: 0.22 }); });
    [905, 1010].forEach(function (x) { S.ellipse(x, 492, 25, 4, { ph: 'd', w: 1, a: 0.6 }); });
    [[912, 606, 16], [1006, 612, 15]].forEach(function (p) {
      var x = p[0], y = p[1], r = p[2];
      S.ellipse(x, y, r, r, { ph: 'd', w: 1, a: 0.5 });
      S.path('M' + (x - 34) + ' 664C' + (x - 32) + ' ' + (y + 30) + ' ' + (x - 18) + ' ' + (y + 20) + ' ' + x + ' ' + (y + 20) + 'C' + (x + 18) + ' ' + (y + 20) + ' ' + (x + 32) + ' ' + (y + 30) + ' ' + (x + 34) + ' 664', { ph: 'd', w: 1, a: 0.45 });
    });
    S.path('M806 742C798 722 806 704 822 706C832 690 852 700 846 718C858 728 846 744 834 742', { ph: 'd', w: 1, a: 0.5 });
    // head joints, a few per course, drawn last
    courses.forEach(function (y, i) {
      if (i === courses.length - 1) return;
      var y2 = courses[i + 1], off = i % 2 ? 34 : 0;
      for (var x = 120 + off; x < 1100; x += 68) {
        if (x < starts[i] + 30 || x < starts[i + 1] + 30) continue;
        if (R() < 0.3) continue;
        if (!segs(x - 1, x + 1, (y + y2) / 2, occ).length) continue;
        S.line(x, y, x, y2, { ph: 'd', w: 1, a: 0.1 });
      }
    });

    // lamplight
    S.glow(482, 432, 150, 140, 0.95);
    S.glow(818, 432, 150, 140, 0.95);
    S.wash('M856 354H1060V718H856Z', 0.32);
    S.glow(905, 510, 110, 120, 0.85);
    S.glow(1010, 510, 110, 120, 0.85);
    S.wash('M388 462h62v88h-62Z', 0.9);
    S.wash('M542 388h92v236h-92ZM666 388h92v236h-92Z', 0.28);
    S.glow(650, 846, 300, 56, 0.75);
    return S;
  };

  /* ---------- 2. the prep sheet ---------- */
  BUILD.prep = function () {
    var S = new Scene('prep');
    var ang = -1.2, r = rotP(590, 450, ang);
    function L(x1, y1, x2, y2, o) { var a = r(x1, y1), b = r(x2, y2); return S.line(a[0], a[1], b[0], b[1], o); }
    var g = el('g', { transform: 'rotate(' + ang + ' 590 450)' }, S.gTop);

    L(372, 36, 812, 36, { ph: 's', w: 1.2, a: 0.75, m: 'h' });
    L(372, 36, 372, 866, { ph: 's', w: 1.2, a: 0.78, m: 'v' });
    L(812, 36, 812, 866, { ph: 's', w: 1.2, a: 0.78, m: 'v' });
    L(402, 176, 782, 176, { ph: 's', w: 1.9, a: 0.86, m: 'h' });
    [266, 350, 434].forEach(function (y) { L(402, y, 782, y, { ph: 's', w: 1, a: 0.4, m: 'h' }); });
    [518, 602, 686, 770].forEach(function (y, i) { L(402, y, 782, y, { ph: 's', w: 1, a: 0.22 - i * 0.03, m: 'h' }); });
    L(372, 866, 812, 866, { ph: 's', w: 1.2, a: 0.6, m: 'h' });

    // furniture: a pencil and a folded cloth beside the sheet
    var A = [858, 372], B = [1010, 290], nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny);
    nx = nx / nl * 7; ny = ny / nl * 7;
    var ux = (B[0] - A[0]) / Math.hypot(B[0] - A[0], B[1] - A[1]), uy = (B[1] - A[1]) / Math.hypot(B[0] - A[0], B[1] - A[1]);
    var T = [B[0] + ux * 26, B[1] + uy * 26];
    S.poly([[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], T, [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]], { ph: 'f', w: 1.1, a: 0.75 }, true);
    S.line(A[0] + ux * 18 + nx, A[1] + uy * 18 + ny, A[0] + ux * 18 - nx, A[1] + uy * 18 - ny, { ph: 'f', w: 1, a: 0.6 });
    S.rrect(930, 620, 170, 112, 7, { ph: 'f', w: 1.1, a: 0.6 });

    // detail: the day and the dishes, in type
    S.text(404, 142, 'Friday', 't-title', 'd', g);
    var dishes = ['Short rib', 'Risotto', 'Burrata'], counts = [27, 33, 19];
    dishes.forEach(function (d, i) { S.text(404, 244 + i * 84, d, 't-dish', 'd', g); });
    var rc = rotP(930, 620, 7);
    [[-72, -24, 72, -24], [-72, 22, 72, 22]].forEach(function (q) {
      var a = rc(930 + q[0], 620 + q[1]), b = rc(930 + q[2], 620 + q[3]);
      S.line(a[0], a[1], b[0], b[1], { ph: 'd', w: 3, a: 0.28 });
    });
    S.line(B[0] + nx, B[1] + ny, B[0] - nx, B[1] - ny, { ph: 'd', w: 1, a: 0.6 });
    // the counts, written by hand
    counts.forEach(function (n, i) { S.count(724, 246 + i * 84, n, 46, 'prep', 'n', g); });

    // lamplight
    var c = [r(372, 36), r(812, 36), r(812, 866), r(372, 866)];
    S.wash('M' + c.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join('L') + 'Z', 0.2);
    S.glow(590, 300, 360, 330, 0.95);
    S.glow(934, 330, 150, 110, 0.5);
    S.wash('M' + [[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]].map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join('L') + 'Z', 0.85);
    return S;
  };

  /* ---------- 3. the line: shifts ---------- */
  BUILD.kitchen = function () {
    var S = new Scene('kitchen');
    var R = rnd(23);
    var cooks = [250, 410, 570, 730, 890];
    // a cook from behind the pass: sloped shoulders, a plain head, a toque
    function body(cx) {
      return 'M' + (cx - 64) + ' 600C' + (cx - 64) + ' 552 ' + (cx - 60) + ' 522 ' + (cx - 40) + ' 510C' + (cx - 28) + ' 503 ' + (cx - 16) + ' 500 ' + cx + ' 500' +
        'C' + (cx + 16) + ' 500 ' + (cx + 28) + ' 503 ' + (cx + 40) + ' 510C' + (cx + 60) + ' 522 ' + (cx + 64) + ' 552 ' + (cx + 64) + ' 600';
    }
    function toque(cx) {
      return 'M' + (cx - 17) + ' 452L' + (cx - 19) + ' 438C' + (cx - 32) + ' 436 ' + (cx - 30) + ' 414 ' + (cx - 14) + ' 418C' + (cx - 10) + ' 406 ' + (cx + 10) + ' 406 ' + (cx + 14) + ' 418' +
        'C' + (cx + 30) + ' 414 ' + (cx + 32) + ' 436 ' + (cx + 19) + ' 438L' + (cx + 17) + ' 452Z';
    }
    var lamps = [330, 570, 810];
    function cookOcc(cx) {
      return function (y) {
        if (y < 410 || y > 600) return null;
        var h = y < 452 ? 30 : y < 492 ? 22 : y < 520 ? 46 : 66;
        return [cx - h - 4, cx + h + 4];
      };
    }
    var occ = lamps.map(function (x) { return [x - 104, x + 104, 368, 406]; })
      .concat(cooks.map(cookOcc))
      .concat([[968, 1052, 428, 512]]);

    // structure: the hood shelf, the tile courses, the pass
    S.line(110, 198, 1100, 198, { ph: 's', w: 1.3, a: 0.6, m: 'h' });
    S.line(110, 210, 1100, 210, { ph: 's', w: 1, a: 0.35, m: 'h' });
    var courses = [], starts = [];
    for (var y = 300; y <= 580; y += 28) { courses.push(y); starts.push(130 + R() * 130); }
    courses.forEach(function (y, i) {
      segs(starts[i], 1100, y, occ).forEach(function (s) { S.line(s[0], y, s[1], y, { ph: 's', w: 1, a: 0.2, m: 'h' }); });
    });
    S.line(96, 600, 1100, 600, { ph: 's', w: 1.6, a: 0.8, m: 'h' });
    S.line(96, 614, 1100, 614, { ph: 's', w: 1, a: 0.5, m: 'h' });
    lamps.forEach(function (x) { S.line(x, 210, x, 370, { ph: 's', w: 1, a: 0.6, m: 'v' }); });

    // furniture
    [160, 390, 620, 850].forEach(function (x) { S.rect(x, 72, 206, 96, { ph: 'f', w: 1, a: 0.5 }); });
    S.line(200, 238, 1064, 238, { ph: 'f', w: 1.6, a: 0.7 });
    lamps.forEach(function (x) { S.rect(x - 100, 370, 200, 32, { ph: 'f', w: 1.1, a: 0.78 }, 3); });
    cooks.forEach(function (cx) {
      S.path(body(cx), { ph: 'f', w: 1.1, a: 0.66 });
      S.ellipse(cx, 470, 20, 21, { ph: 'f', w: 1.1, a: 0.66 });
      S.path(toque(cx), { ph: 'f', w: 1, a: 0.58 });
    });
    S.ellipse(1010, 470, 36, 36, { ph: 'f', w: 1.2, a: 0.78 });
    [330, 490, 650, 810].forEach(function (x) { S.ellipse(x, 594, 34, 6, { ph: 'f', w: 1, a: 0.6 }); });
    S.line(96, 742, 1100, 742, { ph: 'f', w: 1, a: 0.45 });
    [360, 620, 880].forEach(function (x) { S.line(x, 614, x, 742, { ph: 'f', w: 1, a: 0.4 }); });
    S.line(96, 846, 1100, 846, { ph: 'f', w: 1.1, a: 0.5 });

    // detail
    [160, 390, 620, 850].forEach(function (x) {
      for (var k = 0; k < 6; k++) S.line(x + 22 + k * 32, 160, x + 58 + k * 32, 80, { ph: 'd', w: 1, a: 0.26 });
    });
    [222, 262, 350, 390, 498, 536, 574, 676, 714, 752, 860, 898, 990].forEach(function (x, j) {
      var h = 52 + (j % 3) * 4;
      S.rect(x, 240, 28, h, { ph: 'd', w: 1, a: 0.5 });
      for (var k = 0; k < 4; k++) S.line(x + 6, 252 + k * 9, x + (k % 2 ? 18 : 22), 252 + k * 9, { ph: 'd', w: 1, a: 0.4 });
    });
    lamps.forEach(function (x) { S.line(x - 86, 396, x + 86, 396, { ph: 'd', w: 2, a: 0.5 }); });
    cooks.forEach(function (cx) {
      S.line(cx - 18, 440, cx + 18, 440, { ph: 'd', w: 1, a: 0.4 });
      S.poly([[cx - 16, 502], [cx, 526], [cx + 16, 502]], { ph: 'd', w: 1, a: 0.5 });
      [540, 560, 580].forEach(function (y) {
        S.ellipse(cx - 10, y, 2, 2, { ph: 'd', w: 1, a: 0.45 });
        S.ellipse(cx + 10, y, 2, 2, { ph: 'd', w: 1, a: 0.45 });
      });
    });
    [0, 90, 180, 270].forEach(function (a) {
      var t = a * Math.PI / 180, x = 1010 + Math.sin(t) * 30, y = 470 - Math.cos(t) * 30;
      S.line(x, y, 1010 + Math.sin(t) * 25, 470 - Math.cos(t) * 25, { ph: 'd', w: 1.4, a: 0.6 });
    });
    S.line(1010, 470, 1010, 442, { ph: 'd', w: 1.6, a: 0.8 });
    S.line(1010, 470, 997, 490, { ph: 'd', w: 2, a: 0.8 });
    [[330, '#7a3a2c'], [490, '#a07a3c'], [650, '#7a3a2c'], [810, '#6a4a2c']].forEach(function (p) {
      S.ellipse(p[0] - 6, 592, 12, 2.5, { ph: 'd', w: 1, a: 0.45 });
    });
    [[300, 806, 90, 40, 6], [430, 818, 90, 28, 4], [600, 802, 70, 44, 0], [700, 802, 70, 44, 0], [880, 810, 100, 36, 5]].forEach(function (q) {
      S.rect(q[0], q[1], q[2], q[3], { ph: 'd', w: 1, a: 0.42 });
      for (var k = 1; k < q[4]; k++) S.line(q[0], q[1] + k * q[3] / q[4], q[0] + q[2], q[1] + k * q[3] / q[4], { ph: 'd', w: 1, a: 0.22 });
    });
    courses.forEach(function (y, i) {
      if (i === courses.length - 1) return;
      var y2 = courses[i + 1], off = i % 2 ? 28 : 0;
      for (var x = 112 + off; x < 1100; x += 56) {
        if (x < starts[i] + 24 || x < starts[i + 1] + 24) continue;
        if (R() < 0.25) continue;
        if (!segs(x - 1, x + 1, (y + y2) / 2, occ).length) continue;
        S.line(x, y, x, y2, { ph: 'd', w: 1, a: 0.11 });
      }
    });

    // lamplight
    lamps.forEach(function (x) {
      S.wash('M' + (x - 92) + ' 402L' + (x + 92) + ' 402L' + (x + 128) + ' 600L' + (x - 128) + ' 600Z', 0.42, S.vert);
      S.glow(x, 420, 190, 90, 0.75);
    });
    S.glow(570, 600, 520, 40, 0.7);
    cooks.forEach(function (cx) {
      S.wash(body(cx) + 'Z', 0.24);
    });
    return S;
  };

  /* ---------- 4. the dining room: growth ---------- */
  BUILD.dining = function () {
    var S = new Scene('dining');
    var R = rnd(37);
    var pend = [[250, 196, 40], [420, 300, 30], [590, 196, 40], [760, 300, 30], [930, 196, 40], [1090, 300, 30]];
    var backT = [250, 420, 590, 760, 930];
    var front = [[360, 742, 102, 15], [700, 742, 102, 15]];
    var near = [1010, 900, 270, 52];
    var occ = front.map(function (t) { return [t[0] - t[2] - 4, t[0] + t[2] + 4, t[1] - t[3] - 2, t[1] + t[3] + 6]; })
      .concat([function (y) { return y > near[1] - near[3] - 2 ? [near[0] - near[2] * Math.sqrt(Math.max(0, 1 - Math.pow((y - near[1]) / near[3], 2))) - 6, 1100] : null; }]);

    // structure: the cords, the rail, the floorboards
    pend.forEach(function (p) { S.line(p[0], 0, p[0], p[1], { ph: 's', w: 1, a: 0.55, m: 'v' }); });
    S.line(110, 470, 1100, 470, { ph: 's', w: 1.2, a: 0.55, m: 'h' });
    S.line(110, 482, 1100, 482, { ph: 's', w: 1, a: 0.32, m: 'h' });
    S.line(110, 548, 1100, 548, { ph: 's', w: 1.1, a: 0.5, m: 'h' });
    var boards = [650, 663, 678, 696, 717, 742, 772, 807, 848], bst = [];
    boards.forEach(function (y, i) {
      var x0 = 100 + R() * 110 - i * 6;
      bst.push(x0);
      segs(x0, 1100, y, occ).forEach(function (s) { S.line(s[0], y, s[1], y, { ph: 's', w: 1, a: 0.16 + i * 0.012, m: 'h' }); });
    });

    // furniture
    pend.forEach(function (p) {
      var x = p[0], y = p[1], w = p[2], h = w * 0.9;
      S.path('M' + (x - w) + ' ' + (y + h) + 'C' + (x - w) + ' ' + (y + 4) + ' ' + (x + w) + ' ' + (y + 4) + ' ' + (x + w) + ' ' + (y + h) + 'Z', { ph: 'f', w: 1.1, a: 0.78 });
    });
    S.rect(604, 350, 128, 82, { ph: 'f', w: 1.1, a: 0.6 });
    S.line(110, 584, 1100, 584, { ph: 'f', w: 1, a: 0.4 });
    backT.forEach(function (x) {
      S.ellipse(x, 592, 50, 7, { ph: 'f', w: 1.1, a: 0.7 });
      S.line(x, 599, x, 636, { ph: 'f', w: 1.4, a: 0.55 });
      S.ellipse(x, 638, 16, 3, { ph: 'f', w: 1, a: 0.45 });
    });
    front.forEach(function (t) {
      S.ellipse(t[0], t[1], t[2], t[3], { ph: 'f', w: 1.2, a: 0.75 });
      S.path('M' + (t[0] - t[2]) + ' ' + t[1] + 'L' + (t[0] - t[2]) + ' ' + (t[1] + 5) + 'A' + t[2] + ' ' + t[3] + ' 0 0 0 ' + (t[0] + t[2]) + ' ' + (t[1] + 5) + 'L' + (t[0] + t[2]) + ' ' + t[1], { ph: 'f', w: 1, a: 0.5 });
      S.line(t[0], t[1] + t[3] + 5, t[0], 868, { ph: 'f', w: 1.6, a: 0.6 });
      S.ellipse(t[0], 870, 28, 4, { ph: 'f', w: 1, a: 0.45 });
    });
    S.ellipse(near[0], near[1], near[2], near[3], { ph: 'f', w: 1.3, a: 0.8 });

    // detail: the rims, the board joints, the seams, then the room fills
    pend.forEach(function (p) { S.ellipse(p[0], p[1] + p[2] * 0.9, p[2], p[2] * 0.15, { ph: 'd', w: 1, a: 0.55 }); });
    S.path('M626 404C650 410 690 410 712 402', { ph: 'd', w: 1.2, a: 0.45 });
    for (var x = 200; x < 1100; x += 110) S.line(x, 482, x, 548, { ph: 'd', w: 1, a: 0.22 });
    boards.forEach(function (y, i) {
      if (i === boards.length - 1) return;
      var y2 = boards[i + 1];
      for (var k = 0; k < 4; k++) {
        var jx = 160 + R() * 900;
        if (jx < bst[i] + 20 || !segs(jx - 1, jx + 1, (y + y2) / 2, occ).length) continue;
        S.line(jx, y, jx, y2, { ph: 'd', w: 1, a: 0.14 });
      }
    });
    S.ellipse(960, 888, 62, 11, { ph: 'd', w: 1, a: 0.6 });
    S.ellipse(960, 888, 38, 6, { ph: 'd', w: 1, a: 0.45 });
    S.line(886, 884, 886, 898, { ph: 'd', w: 1.4, a: 0.5 });
    S.line(1034, 884, 1034, 898, { ph: 'd', w: 1.4, a: 0.5 });
    S.path('M1058 800C1056 828 1064 842 1072 842C1080 842 1088 828 1086 800Z', { ph: 'd', w: 1, a: 0.55 });
    S.line(1072, 842, 1072, 878, { ph: 'd', w: 1, a: 0.5 });
    S.ellipse(1072, 880, 12, 2.5, { ph: 'd', w: 1, a: 0.45 });
    // the guests, one by one: fuller nights
    var guests = [[226, 520, 13, 'b'], [274, 522, 13, 'b'], [444, 520, 13, 'b'], [588, 522, 13, 'b'], [736, 520, 13, 'b'], [784, 522, 13, 'b'], [952, 520, 13, 'b'],
      [302, 680, 16, 'f'], [418, 682, 16, 'f'], [646, 680, 16, 'f'], [758, 682, 16, 'f']];
    guests.forEach(function (gst) {
      var x = gst[0], y = gst[1], r = gst[2], b = gst[3] === 'b' ? 584 : 742 - 14;
      S.ellipse(x, y, r, r, { ph: 'd', w: 1, a: 0.5 });
      S.path('M' + (x - r * 2.2) + ' ' + b + 'C' + (x - r * 2.1) + ' ' + (y + r * 2.1) + ' ' + (x - r * 1.2) + ' ' + (y + r * 1.4) + ' ' + x + ' ' + (y + r * 1.4) + 'C' + (x + r * 1.2) + ' ' + (y + r * 1.4) + ' ' + (x + r * 2.1) + ' ' + (y + r * 2.1) + ' ' + (x + r * 2.2) + ' ' + b, { ph: 'd', w: 1, a: 0.45 });
    });

    // lamplight
    pend.forEach(function (p) {
      var x = p[0], y = p[1] + p[2] * 0.9, w = p[2];
      S.wash('M' + (x - w * 0.9) + ' ' + y + 'L' + (x + w * 0.9) + ' ' + y + 'L' + (x + w * 2.4) + ' 600L' + (x - w * 2.4) + ' 600Z', 0.36, S.vert);
      S.glow(x, y + 10, w * 3, w * 1.8, 0.8);
    });
    backT.forEach(function (x) { S.wash('M' + (x - 50) + ' 592a50 7 0 1 0 100 0a50 7 0 1 0 -100 0', 0.7); });
    front.forEach(function (t) { S.wash('M' + (t[0] - t[2]) + ' ' + t[1] + 'a' + t[2] + ' ' + t[3] + ' 0 1 0 ' + 2 * t[2] + ' 0a' + t[2] + ' ' + t[3] + ' 0 1 0 ' + -2 * t[2] + ' 0', 0.6); });
    S.glow(1010, 892, 300, 70, 0.8);
    return S;
  };

  /* ---------- 5. closer than a guess: two sheets ---------- */
  BUILD.closer = function () {
    var S = new Scene('closer');
    var sheets = [
      { x: 92, ang: 0.8, title: 'A guess', counts: [40, 20, 25] },
      { x: 572, ang: -0.9, title: 'Tooey', counts: [27, 33, 19] }
    ];
    var sold = [25, 31, 18];
    var groups = [];
    sheets.forEach(function (sh, si) {
      var x0 = sh.x, cx = x0 + 210, r = rotP(cx, 450, sh.ang);
      function L(x1, y1, x2, y2, o) { var a = r(x1, y1), b = r(x2, y2); return S.line(a[0], a[1], b[0], b[1], o); }
      var g = el('g', { transform: 'rotate(' + sh.ang + ' ' + cx + ' 450)' }, S.gTop);
      groups.push(g);
      L(x0, 64, x0 + 420, 64, { ph: 's', w: 1.2, a: 0.72, m: 'h' });
      L(x0, 64, x0, 846, { ph: 's', w: 1.2, a: 0.75, m: 'v' });
      L(x0 + 420, 64, x0 + 420, 846, { ph: 's', w: 1.2, a: 0.75, m: 'v' });
      L(x0 + 30, 186, x0 + 390, 186, { ph: 's', w: 1.9, a: 0.86, m: 'h' });
      [318, 398, 478].forEach(function (y) { L(x0 + 30, y, x0 + 390, y, { ph: 's', w: 1, a: 0.4, m: 'h' }); });
      [558, 638, 718].forEach(function (y, i) { L(x0 + 30, y, x0 + 390, y, { ph: 's', w: 1, a: 0.2 - i * 0.03, m: 'h' }); });
      L(x0, 846, x0 + 420, 846, { ph: 's', w: 1.2, a: 0.55, m: 'h' });
      sh.r = r; sh.g = g;
    });
    // furniture: the column heads, and the pencil that marks the sheets
    sheets.forEach(function (sh) {
      S.text(sh.x + 262, 236, 'Prep', 't-head', 'f', sh.g);
      S.text(sh.x + 344, 236, 'Sold', 't-head', 'f', sh.g);
    });
    var A = [554, 792], B = [532, 612], ux = (B[0] - A[0]) / 181.6, uy = (B[1] - A[1]) / 181.6, nx = -uy * 7, ny = ux * 7;
    S.poly([[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] + ux * 26, B[1] + uy * 26], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]], { ph: 'f', w: 1.1, a: 0.72 }, true);
    S.line(B[0] + nx, B[1] + ny, B[0] - nx, B[1] - ny, { ph: 'f', w: 1, a: 0.55 });
    // detail: titles and dishes
    var dishes = ['Short rib', 'Risotto', 'Burrata'];
    sheets.forEach(function (sh) {
      S.text(sh.x + 32, 150, sh.title, 't-title t-title-s', 'd', sh.g);
      dishes.forEach(function (d, i) { S.text(sh.x + 32, 296 + i * 80, d, 't-dish t-dish-s', 'd', sh.g); });
    });
    // the counts: first the prep, then what sold, pencilled in after the night
    sheets.forEach(function (sh) {
      sh.counts.forEach(function (n, i) { S.count(sh.x + 262, 298 + i * 80, n, 42, 'prep', 'n', sh.g); });
    });
    sheets.forEach(function (sh) {
      sold.forEach(function (n, i) { S.count(sh.x + 344, 296 + i * 80, n, 32, 'sold', 'n2', sh.g); });
    });
    // pencil marks: the guess struck through, Tooey's circled
    var gx = sheets[0].x + 262;
    [0, 1, 2].forEach(function (i) {
      var y = 284 + i * 80;
      S.path('M' + (gx - 34) + ' ' + (y + 6) + 'C' + (gx - 10) + ' ' + (y + 1) + ' ' + (gx + 12) + ' ' + (y - 3) + ' ' + (gx + 36) + ' ' + (y - 7), { ph: 'm', w: 1.8, a: 0.62, cls: 'ln pencil' }, sheets[0].g);
    });
    var tx = sheets[1].x + 262;
    [0, 1, 2].forEach(function (i) { S.loop(tx, 283 + i * 80, 38, 27, { ph: 'm', w: 1.6, a: 0.6, cls: 'ln pencil' }, sheets[1].g); });

    // lamplight
    sheets.forEach(function (sh) {
      var c = [sh.r(sh.x, 64), sh.r(sh.x + 420, 64), sh.r(sh.x + 420, 846), sh.r(sh.x, 846)];
      S.wash('M' + c.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join('L') + 'Z', 0.2);
      S.glow(sh.x + 210, 340, 330, 360, 0.9);
    });
    return S;
  };

  /* ---------- 6. the counter: how to start ---------- */
  BUILD.start = function () {
    var S = new Scene('start');
    var R = rnd(53);
    var occ = [[366, 684, 226, 434], [714, 834, 256, 388], [736, 812, 380, 600], [872, 1060, 260, 420]];
    // structure: the grain of the counter, its edge, the receipt's sides
    [96, 150, 206, 262, 318, 374, 430, 476].forEach(function (y, i) {
      var x0 = 150 + R() * 160;
      segs(x0, 1100, y, occ).forEach(function (s) { S.line(s[0], y, s[1], y, { ph: 's', w: 1, a: 0.13, m: 'h' }); });
    });
    S.line(96, 512, 1100, 512, { ph: 's', w: 1.6, a: 0.78, m: 'h' });
    S.line(96, 524, 1100, 524, { ph: 's', w: 1, a: 0.42, m: 'h' });
    S.line(740, 376, 740, 588, { ph: 's', w: 1.1, a: 0.7, m: 'v' });
    S.line(808, 376, 808, 588, { ph: 's', w: 1.1, a: 0.7, m: 'v' });

    // furniture
    S.rect(372, 232, 306, 196, { ph: 'f', w: 1.2, a: 0.8 }, 16);
    S.rect(388, 248, 274, 164, { ph: 'f', w: 1, a: 0.55 }, 6);
    S.rect(720, 262, 108, 120, { ph: 'f', w: 1.2, a: 0.8 }, 10);
    S.path('M774 262C774 150 930 80 1100 -6', { ph: 'f', w: 1, a: 0.32 });
    S.rrect(964, 340, 176, 104, -7, { ph: 'f', w: 1.1, a: 0.6 });
    S.line(740, 588, 808, 588, { ph: 'f', w: 1, a: 0.6 });

    // detail
    for (var rr = 0; rr < 3; rr++) for (var cc = 0; cc < 3; cc++) S.rect(400 + cc * 66, 262 + rr * 40, 58, 32, { ph: 'd', w: 1, a: 0.38 }, 3);
    S.rect(600, 262, 50, 112, { ph: 'd', w: 1, a: 0.38 }, 3);
    S.rect(400, 384, 250, 18, { ph: 'd', w: 1, a: 0.38 }, 3);
    S.line(730, 372, 818, 372, { ph: 'd', w: 1.2, a: 0.6 });
    S.ellipse(810, 362, 3, 3, { ph: 'd', w: 1, a: 0.7 });
    for (var y = 394; y < 580; y += 12) {
      S.line(750, y, 750 + 16 + R() * 22, y, { ph: 'd', w: 1.6, a: 0.42 });
      S.line(788, y, 788 + 4 + R() * 8, y, { ph: 'd', w: 1.6, a: 0.42 });
    }
    var rc = rotP(964, 340, -7);
    [[-76, -20, 76, -20], [-76, 18, 76, 18]].forEach(function (q) {
      var a = rc(964 + q[0], 340 + q[1]), b = rc(964 + q[2], 340 + q[3]);
      S.line(a[0], a[1], b[0], b[1], { ph: 'd', w: 3, a: 0.26 });
    });

    // lamplight, and last night's sales leaving on a thread of it
    S.glow(525, 330, 300, 210, 0.85);
    S.wash('M742 378H806V586H742Z', 0.75);
    S.glow(774, 470, 120, 170, 0.6);
    S.thread('M774 262C774 150 930 80 1100 -6', 2, 0.95);
    return S;
  };

  window.TooeyScenes = {
    build: function (name) { return BUILD[name](); },
    Scene: Scene,
    el: el
  };
})();
