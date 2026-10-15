/* Tooey, exploration 41: the relay.
   Site 39's view through the pass, made full-bleed and filmed with a moving
   camera. Everything is placed in metres. The room's big surfaces (walls,
   ceilings, floor, counter, the pass and its reveals, the shelf, the fridge
   and its inside) are re-projected through the camera every frame, so the
   perspective really changes as the camera moves. Smaller things (the chef,
   the pan, the POS, lamps, labels, shadows and glows) are drawn once as flat
   cards at their depth and scaled and moved by the camera, so they slide
   against each other by depth.

   Three objects relay through the restaurant, and the camera travels with
   them (12 s, a pure function of t, so it has no seam):
   the POS prints a receipt; the receipt floats through the pass to the
   fridge, which opens on its labelled counts; a piece of short rib leaves
   the fridge for the chef's pan; the pan flares; the finished dish goes out
   under the heat lamps toward the dining room as the camera pulls back to
   where it began, and the POS prints the next receipt.

   The headline and the line under it come on like a VHS tape locking in
   (39's, unchanged). Under reduced motion: no loop and no camera move, one
   designed still frame. ?freeze=<s> holds the scene at that second. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var fig = document.querySelector('.pass-scene');
  var art = fig && fig.querySelector('.pass-art');
  if (!art) return;
  var params = new URLSearchParams(location.search);
  var freeze = params.has('freeze') ? parseFloat(params.get('freeze')) : null;
  var T = 12;

  /* ---------- the camera ---------- */
  var F = 1000, W = 1600, H = 900, NEAR = 0.06;
  var cam = { x: 0, y: 0, z: 0, vx: 1110, vy: 440 };
  function n(v) { return Math.round(v * 10) / 10; }
  // base projection, for cards: camera at the origin, the centre at 0,0
  function pr(x, y, z) { return [F * x / z, -F * y / z]; }
  // live projection through the camera
  function pc(x, y, z) { var d = z - cam.z; return [cam.vx + F * (x - cam.x) / d, cam.vy - F * (y - cam.y) / d]; }
  function pts(list) {
    var s = '';
    for (var i = 0; i < list.length; i++) s += (i ? 'L' : 'M') + n(list[i][0]) + ' ' + n(list[i][1]);
    return s;
  }
  function P3(list) { return pts(list.map(function (a) { return pr(a[0], a[1], a[2]); })) + 'Z'; }
  function L3(a, b) { return pts([pr(a[0], a[1], a[2]), pr(b[0], b[1], b[2])]); }
  // a circle lying flat (y constant), as 3D points
  function ring(cx, y, cz, r, k) {
    var out = [];
    k = k || 28;
    for (var i = 0; i < k; i++) {
      var a = i / k * Math.PI * 2;
      out.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
    }
    return out;
  }
  function ringB(cx, y, cz, r, k) { return pts(ring(cx, y, cz, r, k).map(function (a) { return pr(a[0], a[1], a[2]); })) + 'Z'; }
  // the side of a short cylinder (base projection): its near half
  function drumB(cx, y0, y1, cz, r) {
    var top = ring(cx, y1, cz, r, 32).map(function (a) { return pr(a[0], a[1], a[2]); });
    var base = ring(cx, y0, cz, r, 32).map(function (a) { return pr(a[0], a[1], a[2]); });
    return pts([top[16]].concat(base.slice(16)).concat([base[0], top[0]])) + 'Z';
  }

  var C = { porcelain: '#f2f1ec', slate: '#232a2f' };

  /* ---------- the drawing ---------- */
  var defs = '';
  var PAINT = { fill: 1, 'fill-opacity': 1, stroke: 1, 'stroke-opacity': 1, opacity: 1, 'fill-rule': 1 };
  function el(tag, attrs, inner) {
    var s = '<' + tag, st = '';
    for (var k in attrs) if (attrs[k] != null) {
      if (PAINT[k]) st += k + ':' + attrs[k] + ';';
      else s += ' ' + k + '="' + attrs[k] + '"';
    }
    if (st) s += ' style="' + st + '"';
    return s + (inner == null ? '/>' : '>' + inner + '</' + tag + '>');
  }
  function path(d, cls, extra) { var a = { d: d, 'class': cls }; for (var k in extra || {}) a[k] = extra[k]; return el('path', a); }
  function stops(list) {
    return list.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('');
  }
  function lin(id, x1, y1, x2, y2, list) {
    defs += '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops(list) + '</linearGradient>';
  }
  function rad(id, list, extra) { defs += '<radialGradient id="' + id + '"' + (extra || '') + '>' + stops(list) + '</radialGradient>'; }

  /* surfaces re-projected every frame */
  var DYN = [];
  function Q(list) { return { p: list, c: 1 }; }
  function Ln(a, b) { return { p: [a, b], c: 0 }; }
  function dyn(polys, cls, extra, fn) {
    var a = { 'data-d': DYN.length, 'class': cls };
    for (var k in extra || {}) a[k] = extra[k];
    DYN.push({ polys: polys, fn: fn || null });
    return el('path', a);
  }
  /* flat cards at a depth, moved and scaled by the camera */
  var CARDS = [];
  function card(z, inner, cls) {
    CARDS.push(z);
    return '<g class="cd' + (cls ? ' ' + cls : '') + '" data-c="' + (CARDS.length - 1) + '">' + inner + '</g>';
  }

  defs += '<filter id="pg-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6"/></filter>';

  // tones: 39's, the dining room nearer and darker, the kitchen beyond lighter
  lin('g-wall', 0, 0, 0, 1, [[0, '#d9d5cc'], [0.4, '#e2ded6'], [1, '#dbd6cd']]);
  lin('g-kwall', 0, 0, 0, 1, [[0, '#e8e7e3'], [0.5, '#f1f0ec'], [1, '#e9e8e4']]);
  lin('g-kside', 0, 0, 1, 0, [[0, '#d9d6cf'], [1, '#e5e3de']]);
  lin('g-kside-r', 0, 0, 1, 0, [[0, '#e5e3de'], [1, '#d9d6cf']]);
  lin('g-kceil', 0, 0, 0, 1, [[0, '#d6d3cc'], [1, '#e0ded8']]);
  lin('g-kfloor', 0, 0, 0, 1, [[0, '#dcd7ce'], [1, '#d2ccc1']]);
  lin('g-dceil', 0, 0, 0, 1, [[0, '#d2cdc3'], [1, '#dcd8cf']]);
  lin('g-steel', 0, 0, 1, 0, [[0, '#cfd3d4'], [0.45, '#eaeceb'], [1, '#cdd1d2']]);
  lin('g-shelf', 0, 0, 0, 1, [[0, '#d5d9d9'], [1, '#e9ebea']]);
  lin('g-ctop', 0, 0, 0, 1, [[0, '#dccdb1'], [1, '#cdb795']]);
  lin('g-cfront', 0, 0, 0, 1, [[0, '#bfa98b'], [0.25, '#c8b498'], [1, '#d2c2a8']]);
  lin('g-pfront', 0, 0, 0, 1, [[0, '#cfc9be'], [1, '#d7d2c8']]);
  lin('g-fridge', 0, 0, 1, 0, [[0, '#e3e6e6'], [1, '#eef0f0']]);
  lin('g-door', 0, 0, 1, 0, [[0, '#f0f1f1'], [1, '#e1e4e4']]);
  lin('g-heat', 0, 0, 0, 1, [[0, '#f3ad55', 0.3], [0.55, '#f3b25f', 0.07], [1, '#f3b25f', 0]]);
  lin('g-jacket', 0, 0, 1, 0, [[0, '#f7f6f2'], [0.55, '#efeee9'], [1, '#d6d5cf']]);
  lin('g-paper', 0, 0, 0, 1, [[0, '#fffefa'], [1, '#f3f0e8']]);
  rad('g-fin', [[0, '#ffffff'], [0.55, '#f4f9f9'], [1, '#d3e2e3']], ' cx=".5" cy=".35" r=".8"');
  rad('g-pool', [[0, '#f4ad57', 0.9], [0.5, '#f6c27e', 0.4], [1, '#f6c27e', 0]]);
  rad('g-warm', [[0, '#fbd39a', 1], [0.45, '#fbd39a', 0.5], [1, '#fbd39a', 0]]);
  rad('g-flare', [[0, '#ffe4ae', 1], [0.3, '#f7ae52', 0.8], [1, '#f39a3c', 0]]);
  rad('g-cool', [[0, '#cfe7ea', 1], [0.5, '#dcedef', 0.5], [1, '#dcedef', 0]]);
  rad('g-shadow', [[0, C.slate, 0.36], [1, C.slate, 0]]);
  lin('g-scr', 0, 0, 0, 1, [[0, '#fdecd0'], [1, '#f8dcaa']]);
  lin('g-haze', 0, 0, 0, 1, [[0, C.porcelain, 0.36], [0.6, C.porcelain, 0.2], [1, C.porcelain, 0.3]]);
  lin('g-ao', 0, 0, 0, 1, [[0, C.slate, 0.16], [1, C.slate, 0]]);

  var gb = '', gl = '', gm = '', gp = '', gf = '';

  /* ---- the kitchen (back) ---- */
  var KZ = 6.4, KX = 1.75, KC = 1.25, FL = -1.55, K0 = 3.75;
  gb += dyn([Q([[-KX, KC, K0], [KX, KC, K0], [KX, KC, KZ], [-KX, KC, KZ]])], 'f', { fill: 'url(#g-kceil)' });
  gb += dyn([Q([[-KX, KC, K0], [-KX, KC, KZ], [-KX, FL, KZ], [-KX, FL, K0]])], 'f', { fill: 'url(#g-kside)' });
  gb += dyn([Q([[KX, KC, K0], [KX, KC, KZ], [KX, FL, KZ], [KX, FL, K0]])], 'f', { fill: 'url(#g-kside-r)' });
  gb += dyn([Q([[-KX, FL, K0], [KX, FL, K0], [KX, FL, KZ], [-KX, FL, KZ]])], 'f', { fill: 'url(#g-kfloor)' });
  var fq = [], fx, fz;
  for (fx = -KX + 0.35; fx < KX; fx += 0.35) fq.push(Ln([fx, FL, K0], [fx, FL, KZ]));
  for (fz = K0 + 0.35; fz < KZ; fz += 0.35) fq.push(Ln([-KX, FL, fz], [KX, FL, fz]));
  gb += dyn(fq, 'x');
  gb += dyn([Q([[-KX, KC, KZ], [KX, KC, KZ], [KX, FL, KZ], [-KX, FL, KZ]])], 'f', { fill: 'url(#g-kwall)' });
  gb += dyn([Q([[-KX, KC, KZ], [KX, KC, KZ], [KX, KC - 0.25, KZ], [-KX, KC - 0.25, KZ]])], 'f', { fill: 'url(#g-ao)' });
  gb += dyn([Ln([-KX, KC, K0], [-KX, KC, KZ]), Ln([KX, KC, K0], [KX, KC, KZ]), Ln([-KX, FL, KZ], [-KX, KC, KZ]), Ln([KX, FL, KZ], [KX, KC, KZ]), Ln([-KX, KC, KZ], [KX, KC, KZ]),
    Ln([-KX, FL, K0], [-KX, FL, KZ]), Ln([KX, FL, K0], [KX, FL, KZ]), Ln([-KX, FL, KZ], [KX, FL, KZ])], 'k');
  // a strip light on the kitchen ceiling
  gb += dyn([Q([[-0.3, KC, 4.5], [0.3, KC, 4.5], [0.3, KC, 6.0], [-0.3, KC, 6.0]])], 'q', { fill: '#f6f5f1' });
  gb += dyn([Ln([-0.2, KC, 4.6], [-0.2, KC, 5.9]), Ln([0.2, KC, 4.6], [0.2, KC, 5.9]), Ln([-KX, KC, 4.8], [KX, KC, 4.8]), Ln([-KX, KC, 5.6], [KX, KC, 5.6])], 'd');
  // tiles behind the range (left), on the back wall and the left wall
  var tl = [], row = 0, ty, tx;
  for (ty = -0.95; ty <= 0.78; ty += 0.11) { tl.push(Ln([-KX, ty, KZ], [0.15, ty, KZ])); tl.push(Ln([-KX, ty, 4.4], [-KX, ty, KZ])); }
  for (ty = -0.95; ty < 0.76; ty += 0.11, row++) {
    for (tx = -KX + (row % 2 ? 0.11 : 0.22); tx < 0.15; tx += 0.22) tl.push(Ln([tx, ty, KZ], [tx, ty + 0.11, KZ]));
  }
  gb += dyn(tl, 'x');
  // an open shelf on the back wall, right of the hood, with tubs and a jar
  var SHY = 0.3;
  gb += dyn([Q([[0.08, SHY, KZ - 0.28], [0.8, SHY, KZ - 0.28], [0.8, SHY, KZ], [0.08, SHY, KZ]])], 'q', { fill: '#dcd9d1' });
  gb += dyn([Ln([0.08, SHY - 0.02, KZ - 0.28], [0.8, SHY - 0.02, KZ - 0.28])], 'k');
  [[0.15, 0.12, 0.15], [0.31, 0.11, 0.12], [0.47, 0.09, 0.22], [0.62, 0.11, 0.13]].forEach(function (b, i) {
    var x0 = b[0], w = b[1], h = b[2], z = KZ - 0.16;
    gb += dyn([Q([[x0, SHY, z], [x0 + w, SHY, z], [x0 + w, SHY + h, z], [x0, SHY + h, z]])], 'q', { fill: i === 2 ? '#e4e0d7' : '#eeece6' });
  });
  // the plating counter under the shelf: steel, right of the range
  var PCX0 = -0.12, PCX1 = 0.7, PCZ = 5.85, PCY = -0.6;
  gb += dyn([Q([[PCX0, PCY, PCZ], [PCX0, PCY, KZ], [PCX0, FL, KZ], [PCX0, FL, PCZ]])], 'q', { fill: '#c9cdce' });
  gb += dyn([Q([[PCX0, PCY, PCZ], [PCX1, PCY, PCZ], [PCX1, PCY, KZ], [PCX0, PCY, KZ]])], 'k', { fill: 'url(#g-steel)' });
  gb += dyn([Q([[PCX0, PCY, PCZ], [PCX1, PCY, PCZ], [PCX1, FL + 0.12, PCZ], [PCX0, FL + 0.12, PCZ]])], 'q', { fill: '#d6dada' });
  gb += dyn([Ln([PCX0 + 0.04, -1.05, PCZ], [PCX1 - 0.04, -1.05, PCZ])], 'd');

  // the hood over the range
  var HX0 = -KX + 0.02, HX1 = -0.12, HZ = 5.62, HY = 0.8;
  gb += dyn([Q([[HX0, HY, HZ], [HX1, HY, HZ], [HX1, HY, KZ], [HX0, HY, KZ]])], 'f', { fill: '#c3c7c8' });
  gb += dyn([Q([[HX1, HY, HZ], [HX1, HY + 0.2, HZ], [HX1, KC, 6.05], [HX1, KC, KZ], [HX1, HY, KZ]])], 'q', { fill: '#d3d7d7' });
  gb += dyn([Q([[HX0, HY + 0.2, HZ], [HX1, HY + 0.2, HZ], [HX1, KC, 6.05], [HX0, KC, 6.05]])], 'q', { fill: '#e2e5e5' });
  gb += dyn([Q([[HX0, HY, HZ], [HX1, HY, HZ], [HX1, HY + 0.2, HZ], [HX0, HY + 0.2, HZ]])], 'k', { fill: 'url(#g-steel)' });
  gb += dyn([Ln([HX0 + 0.05, HY + 0.05, HZ], [HX1 - 0.05, HY + 0.05, HZ])], 'd');
  var hl = pr(-0.9, -0.5, 6.1);
  gb += card(6.1, el('ellipse', { cx: n(hl[0]), cy: n(hl[1] - 10), rx: 120, ry: 44, fill: 'url(#g-warm)', 'class': 'mul', opacity: '.6' }));

  // the range, down to the floor
  var RX0 = -KX + 0.05, RX1 = -0.18, RZ = 5.78, RY = -0.6;
  gb += dyn([Q([[RX1, RY, RZ], [RX1, RY, KZ], [RX1, FL, KZ], [RX1, FL, RZ]])], 'q', { fill: '#c9cdce' });
  gb += dyn([Q([[RX0, RY, RZ], [RX1, RY, RZ], [RX1, RY, KZ], [RX0, RY, KZ]])], 'k', { fill: 'url(#g-steel)' });
  gb += dyn([Q([[RX0, RY, RZ], [RX1, RY, RZ], [RX1, RY - 0.22, RZ], [RX0, RY - 0.22, RZ]])], 'q', { fill: '#d1d5d6' });
  gb += dyn([Q([[RX0, RY - 0.22, RZ], [RX1, RY - 0.22, RZ], [RX1, FL + 0.1, RZ], [RX0, FL + 0.1, RZ]])], 'q', { fill: '#dadede' });
  gb += dyn([Q([[RX0 + 0.06, RY - 0.3, RZ], [-0.98, RY - 0.3, RZ], [-0.98, FL + 0.18, RZ], [RX0 + 0.06, FL + 0.18, RZ]]),
    Q([[-0.9, RY - 0.3, RZ], [RX1 - 0.06, RY - 0.3, RZ], [RX1 - 0.06, FL + 0.18, RZ], [-0.9, FL + 0.18, RZ]])], 'd');
  gb += dyn([Ln([RX0 + 0.12, RY - 0.36, RZ], [-1.04, RY - 0.36, RZ]), Ln([-0.84, RY - 0.36, RZ], [RX1 - 0.12, RY - 0.36, RZ])], 'q');
  var kn = '';
  [-1.5, -1.25, -1.0, -0.75, -0.5].forEach(function (x) { var p = pr(x, RY - 0.08, RZ); kn += 'M' + n(p[0] - 2) + ' ' + n(p[1]) + 'a2 2 0 1 0 4 0a2 2 0 1 0 -4 0'; });
  gb += card(RZ, path(kn, 'q'));
  gb += dyn([Q(ring(-1.3, RY, 6.15, 0.13)), Q(ring(-0.45, RY, 6.12, 0.13))], 'd');

  // the stock pot, simmering
  var POT = [-1.28, 6.16, 0.16];
  var pot = pr(POT[0], RY + 0.28, POT[1]);
  function steamAt(p, cls, k, len) {
    var out = '';
    for (var i = 0; i < k; i++) {
      var x = p[0] + (i - (k - 1) / 2) * 8, y = p[1] - 4, s = '';
      for (var j = 0; j <= 14; j++) {
        var tt = j / 14;
        s += (j ? 'L' : 'M') + n(x + Math.sin(tt * Math.PI * 2.2 + i * 1.7) * 4.5) + ' ' + n(y - tt * len);
      }
      out += '<path class="stm ' + cls + '" d="' + s + '"/>';
    }
    return out;
  }
  gb += card(POT[1], path(drumB(POT[0], RY, RY + 0.28, POT[1], POT[2]), 'q', { fill: '#dde0e0' }) +
    path(ringB(POT[0], RY + 0.28, POT[1], POT[2]), 'q', { fill: '#c5c9ca' }) + steamAt(pot, 'stm-pot', 2, 40));

  // the chef's pan (it tosses)
  var PB = [-0.42, RY + 0.05, 6.0];
  var pb = pr(PB[0], PB[1], PB[2]);
  var panSvg = path(drumB(PB[0], RY + 0.005, PB[1], PB[2], 0.15), 'k', { fill: '#59616a', 'fill-opacity': '.85' }) +
    path(ringB(PB[0], PB[1], PB[2], 0.15), 'k', { fill: '#6c737a' }) +
    path(ringB(PB[0], PB[1] - 0.01, PB[2], 0.11), 'd', { fill: '#dcae73' }) +
    path(pts([pr(PB[0] - 0.14, PB[1], PB[2] - 0.03), pr(PB[0] - 0.3, PB[1] + 0.03, PB[2] - 0.26)]), 'pan-h');
  var flameSvg = '';
  [-12, -5, 2, 9].forEach(function (dx, i) {
    var h = 10 + (i % 2) * 6;
    flameSvg += path('M' + n(pb[0] + dx - 3.5) + ' ' + n(pb[1] + 7) + 'Q' + n(pb[0] + dx) + ' ' + n(pb[1] + 7 - h) + ' ' + n(pb[0] + dx + 3.5) + ' ' + n(pb[1] + 7), 'flm');
  });

  // the chef: back to us, at the range. Simple forms, no face.
  var CH = [-0.86, 0, 5.45], cs = F / CH[2], cc = pr(CH[0], CH[1], CH[2]);
  function c(x, y) { return [cc[0] + x * cs, cc[1] - y * cs]; }
  function cn(x, y) { return c(x, y).map(n).join(' '); }
  function cp(list) { return pts(list.map(function (q) { return c(q[0], q[1]); })); }
  function cq(a, b, e) { return 'M' + cn(a[0], a[1]) + 'Q' + cn(b[0], b[1]) + ' ' + cn(e[0], e[1]); }
  var chef = '';
  var csh = c(0, -1.55);
  chef += el('ellipse', { cx: n(csh[0]), cy: n(csh[1]), rx: 62, ry: 9, fill: 'url(#g-shadow)', opacity: '.6' });
  // legs and shoes
  chef += path(cp([[-0.185, -0.93], [-0.015, -0.93], [-0.03, -1.5], [-0.15, -1.5]]) + 'Z' + cp([[0.015, -0.93], [0.185, -0.93], [0.15, -1.5], [0.03, -1.5]]) + 'Z', 'k', { fill: '#7b8287' });
  chef += path(cp([[-0.16, -1.5], [-0.025, -1.5], [-0.025, -1.55], [-0.17, -1.55]]) + 'Z' + cp([[0.025, -1.5], [0.16, -1.5], [0.17, -1.55], [0.025, -1.55]]) + 'Z', 'q', { fill: '#4e565b' });
  // left sleeve, behind
  chef += path(cp([[-0.19, -0.06], [-0.28, -0.14], [-0.31, -0.36], [-0.26, -0.47], [-0.19, -0.41]]) + 'Z', 'k', { fill: '#e6e5e0' });
  var torso = 'M' + cn(-0.06, 0.012) + 'C' + cn(-0.14, 0.0) + ' ' + cn(-0.22, -0.03) + ' ' + cn(-0.225, -0.13) +
    'L' + cn(-0.205, -0.5) + 'L' + cn(-0.2, -0.95) + 'L' + cn(0.2, -0.95) + 'L' + cn(0.205, -0.5) + 'L' + cn(0.225, -0.13) +
    'C' + cn(0.22, -0.03) + ' ' + cn(0.14, 0.0) + ' ' + cn(0.06, 0.012) + 'Z';
  chef += path(torso, 'k', { fill: 'url(#g-jacket)' });
  chef += path(cp([[0, -0.02], [0, -0.48]]) + cp([[-0.13, -0.005], [-0.12, -0.16]]) + cp([[0.13, -0.005], [0.12, -0.16]]), 'd');
  // apron band and its bow
  chef += path(cp([[-0.205, -0.5], [0.205, -0.5], [0.205, -0.545], [-0.205, -0.545]]) + 'Z', 'q', { fill: '#4a5257', 'fill-opacity': '.8' });
  chef += path(cq([0, -0.52], [-0.09, -0.44], [-0.08, -0.57]) + 'Z' + cq([0, -0.52], [0.09, -0.44], [0.08, -0.57]) + 'Z', 'q', { fill: '#566064', 'fill-opacity': '.8' });
  chef += path(cq([-0.01, -0.53], [-0.04, -0.62], [-0.06, -0.74]) + cq([0.01, -0.53], [0.03, -0.63], [0.05, -0.75]), 'apr');
  // the back of the head: neck, ears, hair; the collar wraps the neck
  chef += path(cp([[-0.045, -0.01], [-0.042, 0.05], [0.042, 0.05], [0.045, -0.01]]) + 'Z', 'q', { fill: '#dcc5ab' });
  var eL = c(-0.083, 0.1), eR = c(0.083, 0.1);
  chef += el('ellipse', { cx: n(eL[0]), cy: n(eL[1]), rx: 2.6, ry: 4.2, 'class': 'q', fill: '#d8bfa3' });
  chef += el('ellipse', { cx: n(eR[0]), cy: n(eR[1]), rx: 2.6, ry: 4.2, 'class': 'q', fill: '#d8bfa3' });
  var hd = c(0, 0.118);
  chef += el('ellipse', { cx: n(hd[0]), cy: n(hd[1]), rx: n(0.078 * cs), ry: n(0.088 * cs), 'class': 'q', fill: '#857a70' });
  chef += path(cq([-0.055, 0.05], [0, 0.025], [0.055, 0.05]) + cq([-0.03, 0.17], [-0.045, 0.1], [-0.035, 0.05]) + cq([0.0, 0.18], [-0.005, 0.11], [0.0, 0.045]) + cq([0.03, 0.17], [0.045, 0.1], [0.035, 0.05]), 'q');
  chef += path('M' + cn(-0.07, 0.0) + 'Q' + cn(0, 0.035) + ' ' + cn(0.07, 0.0) + 'L' + cn(0.06, -0.025) + 'Q' + cn(0, 0.0) + ' ' + cn(-0.06, -0.025) + 'Z', 'q', { fill: '#f4f3ee' });
  var tq = 'M' + cn(-0.082, 0.15) + 'L' + cn(-0.086, 0.215) +
    'C' + cn(-0.15, 0.24) + ' ' + cn(-0.14, 0.37) + ' ' + cn(-0.07, 0.36) +
    'C' + cn(-0.05, 0.42) + ' ' + cn(0.06, 0.43) + ' ' + cn(0.07, 0.36) +
    'C' + cn(0.14, 0.37) + ' ' + cn(0.15, 0.24) + ' ' + cn(0.086, 0.215) +
    'L' + cn(0.082, 0.15) + 'Z';
  chef += path(tq, 'k', { fill: '#fcfcf9' });
  chef += path(cp([[-0.086, 0.21], [0.086, 0.21]]) + cp([[-0.03, 0.225], [-0.04, 0.35]]) + cp([[0.03, 0.225], [0.035, 0.36]]), 'd');
  var armSvg = path(cp([[0.19, -0.05], [0.25, -0.1], [0.31, -0.27], [0.33, -0.4], [0.27, -0.44], [0.23, -0.33], [0.19, -0.2]]) + 'Z', 'k', { fill: '#ecebe6' }) +
    path(cp([[0.27, -0.41], [0.33, -0.41]]), 'd');
  var shoulder = c(0.21, -0.07);

  /* ---- the fridge (kitchen right) ---- */
  var FX0 = 0.72, FX1 = 1.5, FZ = 4.5, FT = 0.72, FD = 0.66;
  var IX0 = FX0 + 0.04, IX1 = FX1 - 0.04, IT = 0.54, IZ = FZ + 0.01, IB = FZ + FD - 0.06, IBOT = FL + 0.14;
  var fsh = pr((FX0 + FX1) / 2, FL, FZ + 0.3);
  gb += card(FZ + 0.3, el('ellipse', { cx: n(fsh[0]), cy: n(fsh[1]), rx: 110, ry: 14, fill: 'url(#g-shadow)', opacity: '.5' }));
  gb += dyn([Q([[FX0, FT, FZ], [FX0, FT, FZ + FD], [FX0, FL, FZ + FD], [FX0, FL, FZ]])], 'k', { fill: '#d4d8d8' });
  gb += dyn([Q([[FX0, FT, FZ], [FX1, FT, FZ], [FX1, FL, FZ], [FX0, FL, FZ]])], 'k', { fill: 'url(#g-fridge)' });
  gb += dyn([Ln([FX0 + 0.03, IT + 0.12, FZ], [FX1 - 0.03, IT + 0.12, FZ]), Ln([FX0, FL + 0.1, FZ], [FX1, FL + 0.1, FZ])], 'd');
  var vents = [];
  for (var vx = FX0 + 0.1; vx < FX1 - 0.08; vx += 0.05) vents.push(Ln([vx, IT + 0.03, FZ], [vx, IT + 0.09, FZ]));
  gb += dyn(vents, 'x');
  // the inside: back, right wall, ceiling, floor, shelves
  var inside = '';
  inside += dyn([Q([[IX0, IT, IB], [IX1, IT, IB], [IX1, IBOT, IB], [IX0, IBOT, IB]])], 'q', { fill: 'url(#g-fin)' });
  inside += dyn([Q([[IX1, IT, IZ], [IX1, IT, IB], [IX1, IBOT, IB], [IX1, IBOT, IZ]])], 'q', { fill: '#d9e4e5' });
  inside += dyn([Q([[IX0, IT, IZ], [IX1, IT, IZ], [IX1, IT, IB], [IX0, IT, IB]])], 'q', { fill: '#cddadb' });
  inside += dyn([Q([[IX0, IBOT, IZ], [IX1, IBOT, IZ], [IX1, IBOT, IB], [IX0, IBOT, IB]])], 'q', { fill: '#e2eaea' });
  var SHV = [0.17, -0.29];
  SHV.forEach(function (sy) {
    inside += dyn([Q([[IX0, sy, IZ], [IX1, sy, IZ], [IX1, sy, IB], [IX0, sy, IB]])], 'q', { fill: '#e6eded', 'fill-opacity': '.92' });
    inside += dyn([Q([[IX0, sy, IZ], [IX1, sy, IZ], [IX1, sy - 0.022, IZ], [IX0, sy - 0.022, IZ]])], 'k', { fill: '#d2dbdb' });
  });
  // a closed crisper drawer at the bottom
  inside += dyn([Q([[IX0 + 0.02, -0.75, IZ + 0.04], [IX1 - 0.02, -0.75, IZ + 0.04], [IX1 - 0.02, IBOT + 0.02, IZ + 0.04], [IX0 + 0.02, IBOT + 0.02, IZ + 0.04]])], 'q', { fill: '#edf1f1' });
  inside += dyn([Ln([IX0 + 0.2, -0.82, IZ + 0.04], [IX1 - 0.2, -0.82, IZ + 0.04])], 'q');
  // the tubs: two on each shelf, labelled on tape (an example)
  var tw = (IX1 - IX0 - 0.06) / 2, TH = 0.2, TD = 0.32;
  var tubs = [
    { x: IX0 + 0.02, y: SHV[0], name: 'Short rib', c: '27' },
    { x: IX0 + 0.04 + tw, y: SHV[0], name: 'Risotto', c: '33' },
    { x: IX0 + 0.02, y: SHV[1], name: 'Burrata', c: '19' },
    { x: IX0 + 0.04 + tw, y: SHV[1], name: 'Focaccia', c: '12' }
  ];
  var TZ0 = IZ + 0.07;
  var labels = '';
  tubs.forEach(function (b, i) {
    var z0 = TZ0, z1 = z0 + TD, y1 = b.y + TH, w = tw;
    inside += dyn([Q([[b.x, y1, z0], [b.x + w, y1, z0], [b.x + w, y1, z1], [b.x, y1, z1]])], 'q', { fill: '#eeede7' });
    inside += dyn([Q([[b.x, b.y, z0], [b.x + w, b.y, z0], [b.x + w, y1, z0], [b.x, y1, z0]])], 'q', { fill: '#f8f7f2' });
    inside += dyn([Ln([b.x, y1 - 0.024, z0], [b.x + w, y1 - 0.024, z0])], 'd');
    if (i === 0) {
      var hg = pr(b.x + w / 2, y1 - 0.02, z0);
      inside += card(z0, el('ellipse', { 'class': 'tub-hot', cx: n(hg[0]), cy: n(hg[1]), rx: 52, ry: 30, fill: 'url(#g-warm)' }));
    }
    // the tape: name in ink, count pencilled in
    var a = pr(b.x + 0.022, y1 - 0.036, z0), bb = pr(b.x + w - 0.022, b.y + 0.026, z0);
    labels += card(z0, '<g class="lbl">' +
      el('rect', { x: n(a[0]), y: n(a[1]), width: n(bb[0] - a[0]), height: n(bb[1] - a[1]), 'class': 'tape' }) +
      el('text', { x: n(a[0] + 2.6), y: n(a[1] + 8.6), 'class': 'tub-n' }, b.name) +
      el('text', { x: n(bb[0] - 2.6), y: n(bb[1] - 3), 'class': 'tub-c', 'text-anchor': 'end' }, b.c) +
      '</g>');
  });
  // "Example", on a strip of tape across the fridge's top panel
  var ex0 = pr(FX0 + 0.08, IT + 0.105, FZ), ex1 = pr(FX0 + 0.36, IT + 0.035, FZ);
  labels += card(FZ, '<g class="lbl-ex">' + el('rect', { x: n(ex0[0]), y: n(ex0[1]), width: n(ex1[0] - ex0[0]), height: n(ex1[1] - ex0[1]), 'class': 'tape' }) +
    el('text', { x: n((ex0[0] + ex1[0]) / 2), y: n(ex1[1] - 3.6), 'class': 'tub-ex', 'text-anchor': 'middle' }, 'Example') + '</g>');
  var fgl = pr((FX0 + FX1) / 2, 0.0, FZ + 0.3);
  var fridge = '<g class="fr-in">' + inside + card(FZ + 0.3, el('ellipse', { 'class': 'fr-lit', cx: n(fgl[0]), cy: n(fgl[1]), rx: 90, ry: 150, fill: 'url(#g-cool)', opacity: '.95' })) + '</g>';
  fridge += dyn([Q([[IX0, IT, FZ], [IX1, IT, FZ], [IX1, IBOT, FZ], [IX0, IBOT, FZ]])], 'fr-seam');
  var DOOR = { open: 0 };
  var HXg = IX1 + 0.02, DW = IX1 - IX0 + 0.04;
  function doorPts() {
    var th = DOOR.open * 1.25, fx2 = HXg - DW * Math.cos(th), fz2 = FZ - DW * Math.sin(th);
    return [Q([[HXg, IT + 0.03, FZ], [fx2, IT + 0.03, fz2], [fx2, IBOT - 0.03, fz2], [HXg, IBOT - 0.03, FZ]])];
  }
  function handlePts() {
    var th = DOOR.open * 1.25, hx = HXg - (DW - 0.06) * Math.cos(th), hz = FZ - (DW - 0.06) * Math.sin(th) - 0.035 * Math.cos(th);
    return [Ln([hx, 0.34, hz], [hx, -0.5, hz])];
  }
  fridge += dyn([], 'k fr-door', { fill: 'url(#g-door)' }, doorPts) + dyn([], 'fr-handle', null, handlePts);
  var fsp = pr((FX0 + FX1) / 2 - 0.2, FL, FZ - 0.4);
  fridge += card(FZ - 0.4, el('ellipse', { 'class': 'fr-spill', cx: n(fsp[0]), cy: n(fsp[1]), rx: 170, ry: 30, fill: 'url(#g-cool)' }));

  // kitchen, back to front
  gb += '<g class="ck-pan">' + card(PB[2], '<g class="ck-pan-in">' + panSvg + '</g>') + '</g>';
  gb += card(PB[2], el('ellipse', { 'class': 'ck-flare', cx: n(pb[0]), cy: n(pb[1] - 20), rx: 80, ry: 70, fill: 'url(#g-flare)' }) +
    '<g class="ck-flames">' + flameSvg + '</g>');
  gb += card(CH[2], '<g class="ck-body">' + chef + '<g class="ck-arm">' + armSvg + '</g></g>');
  gb += card(PB[2], steamAt([pb[0] + 2, pb[1] - 8], 'stm-pan', 3, 54));
  gb += fridge;

  /* ---- the pass (mid) ---- */
  var PZ = 3.4, PZ2 = 3.75, OX = 1.3, OT = 0.95, OB = -0.55, DC = 1.45;
  gm += dyn([Q([[-9, DC, 0.2], [9, DC, 0.2], [9, DC, PZ], [-9, DC, PZ]])], 'f', { fill: 'url(#g-dceil)' });
  gm += dyn([-2.6, -1.3, 0, 1.3, 2.6].map(function (x) { return Ln([x, DC, 0.25], [x, DC, PZ]); }), 'q');
  gm += dyn([Q([[-9, DC, PZ], [9, DC, PZ], [9, FL, PZ], [-9, FL, PZ]]), Q([[-OX, OT, PZ], [-OX, OB, PZ], [OX, OB, PZ], [OX, OT, PZ]])], 'f', { fill: 'url(#g-wall)', 'fill-rule': 'evenodd' });
  gm += dyn([Ln([-9, DC, PZ], [9, DC, PZ])], 'k');
  gm += dyn([Ln([-9, DC - 0.07, PZ], [9, DC - 0.07, PZ])], 'd');
  gm += dyn([Q([[-OX, OT, PZ], [-OX, OT, PZ2], [-OX, OB, PZ2], [-OX, OB, PZ]])], 'q', { fill: '#c9c3b9' });
  gm += dyn([Q([[OX, OT, PZ], [OX, OT, PZ2], [OX, OB, PZ2], [OX, OB, PZ]])], 'q', { fill: '#d0cbc1' });
  gm += dyn([Q([[-OX, OT, PZ], [OX, OT, PZ], [OX, OT, PZ2], [-OX, OT, PZ2]])], 'q', { fill: '#bfb9ae' });
  gm += dyn([Q([[-OX, OT, PZ], [-OX, OB, PZ], [OX, OB, PZ], [OX, OT, PZ]])], 'k');
  gm += dyn([Ln([-OX, OT, PZ2], [OX, OT, PZ2]), Ln([-OX, OT, PZ2], [-OX, OB, PZ2]), Ln([OX, OT, PZ2], [OX, OB, PZ2])], 'q');
  // the pass counter under the shelf, on the dining side
  gm += dyn([Q([[-OX - 0.1, OB - 0.035, 3.2], [OX + 0.1, OB - 0.035, 3.2], [OX + 0.1, FL, 3.2], [-OX - 0.1, FL, 3.2]])], 'q', { fill: 'url(#g-pfront)' });
  var sl = [];
  for (var sx = -OX + 0.15; sx < OX; sx += 0.18) sl.push(Ln([sx, OB - 0.07, 3.2], [sx, FL, 3.2]));
  gm += dyn(sl, 'x');
  // the shelf: steel, running through into the kitchen
  gm += dyn([Q([[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX, OB, 4.0], [-OX, OB, 4.0]])], 'q', { fill: 'url(#g-shelf)' });
  gm += dyn([Q([[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX + 0.1, OB - 0.035, 3.2], [-OX - 0.1, OB - 0.035, 3.2]])], 'k', { fill: '#c3c7c8' });
  // the ticket rail along the soffit, with a few tickets on it
  gm += dyn([Q([[-OX + 0.08, OT - 0.02, 3.42], [OX - 0.08, OT - 0.02, 3.42], [OX - 0.08, OT - 0.06, 3.42], [-OX + 0.08, OT - 0.06, 3.42]])], 'k', { fill: '#d0d4d5' });
  var tks = '';
  [[-1.02, 2], [-0.88, -3], [0.55, 1], [0.95, -2], [1.08, 3]].forEach(function (tk) {
    var a = pr(tk[0], OT - 0.05, 3.41), w = 0.075 * F / 3.41, h = 0.12 * F / 3.41;
    tks += '<g transform="rotate(' + tk[1] + ' ' + n(a[0]) + ' ' + n(a[1]) + ')">' +
      el('rect', { x: n(a[0] - w / 2), y: n(a[1]), width: n(w), height: n(h), 'class': 'q', fill: '#f8f7f2' }) +
      path('M' + n(a[0] - w / 2 + 3.5) + ' ' + n(a[1] + 7) + 'h' + n(w - 7) + 'M' + n(a[0] - w / 2 + 3.5) + ' ' + n(a[1] + 12) + 'h' + n(w - 11) + 'M' + n(a[0] - w / 2 + 3.5) + ' ' + n(a[1] + 17) + 'h' + n(w - 8), 'd') +
      '</g>';
  });
  gm += card(3.41, tks);
  // the heat lamps: three, always warm, brighter with a dish under them
  var LZ = 3.58, LX = [-1.0, -0.35, 0.3], lamps = '', cones = [], pools = '';
  LX.forEach(function (lx) {
    var top = pr(lx, OT, LZ), sh0 = pr(lx, 0.58, LZ), sh1 = pr(lx, 0.46, LZ), r0 = 0.035 * F / LZ, r1 = 0.1 * F / LZ;
    lamps += path('M' + n(top[0]) + ' ' + n(top[1]) + 'V' + n(sh0[1]), 'q');
    lamps += path('M' + n(sh0[0] - r0) + ' ' + n(sh0[1]) + 'L' + n(sh1[0] - r1) + ' ' + n(sh1[1]) + 'Q' + n(sh1[0]) + ' ' + n(sh1[1] + 4) + ' ' + n(sh1[0] + r1) + ' ' + n(sh1[1]) + 'L' + n(sh0[0] + r0) + ' ' + n(sh0[1]) + 'Z', 'k', { fill: '#b3b9bc' });
    lamps += el('ellipse', { cx: n(sh1[0]), cy: n(sh1[1] + 1.5), rx: n(r1 * 0.8), ry: 3.8, 'class': 'hl-bulb' });
    cones.push(Q([[lx - 0.085, 0.455, LZ], [lx + 0.085, 0.455, LZ], [lx + 0.38, OB, 3.36], [lx - 0.38, OB, 3.36]]));
    pools += dyn([Q(ring(lx, OB + 0.002, 3.6, 0.42, 24))], 'f', { fill: 'url(#g-pool)' });
  });
  gm += '<g class="hl-light">' + cones.map(function (q) { return dyn([q], 'f', { fill: 'url(#g-heat)' }); }).join('') + pools + '</g>';
  gm += '<g class="slot slot-m"></g>';
  gm += card(LZ, '<g class="hl-lamps">' + lamps + '</g>');

  /* ---- pendants in the dining room, between us and the pass ---- */
  [[-0.42, 2.3], [0.92, 2.6]].forEach(function (pd) {
    var x = pd[0], z = pd[1], s = F / z;
    var top = pr(x, DC, z), a = pr(x, 0.92, z), r0 = pr(x, 0.82, z);
    var w = 0.12 * s;
    var g = '';
    g += el('ellipse', { cx: n(r0[0]), cy: n(r0[1] + 0.12 * s), rx: n(0.42 * s), ry: n(0.3 * s), fill: 'url(#g-warm)', 'class': 'mul', opacity: '.35' });
    g += path('M' + n(top[0]) + ' ' + n(top[1]) + 'V' + n(a[1]), 'q');
    g += path('M' + n(r0[0] - w) + ' ' + n(r0[1]) + 'Q' + n(r0[0] - w) + ' ' + n(a[1]) + ' ' + n(a[0]) + ' ' + n(a[1]) + 'Q' + n(r0[0] + w) + ' ' + n(a[1]) + ' ' + n(r0[0] + w) + ' ' + n(r0[1]) + 'Z', 'k', { fill: '#f6f4ee' });
    g += path('M' + n(r0[0] - w - 2) + ' ' + n(r0[1]) + 'H' + n(r0[0] + w + 2), 'k');
    g += el('ellipse', { cx: n(r0[0]), cy: n(r0[1] + 0.012 * s), rx: n(0.05 * s), ry: n(0.022 * s), 'class': 'pd-bulb' });
    gp += card(z, g);
  });

  /* ---- the counter and the POS (fore) ---- */
  var CY = -0.55, CZ0 = 1.25, CZ1 = 1.95;
  gf += dyn([Q([[-9, CY, CZ0], [9, CY, CZ0], [9, CY, CZ1], [-9, CY, CZ1]])], 'f', { fill: 'url(#g-ctop)' });
  gf += dyn([Ln([-9, CY, CZ1], [9, CY, CZ1])], 'q');
  gf += dyn([Q([[-9, CY, CZ0], [9, CY, CZ0], [9, -0.61, CZ0], [-9, -0.61, CZ0]])], 'q', { fill: '#cdb38c' });
  gf += dyn([Q([[-9, -0.61, CZ0 + 0.03], [9, -0.61, CZ0 + 0.03], [9, FL, CZ0 + 0.03], [-9, FL, CZ0 + 0.03]])], 'q', { fill: 'url(#g-cfront)' });
  var grain = [], gr = window.TooeyDraw ? window.TooeyDraw.rng(39) : Math.random;
  for (var gx = -3.4; gx < 3.4; gx += 0.07 + gr() * 0.09) {
    var z0g = CZ0 + gr() * 0.25, z1g = CZ1 - gr() * 0.2;
    grain.push(Ln([gx, CY, z0g], [gx + (gr() - 0.5) * 0.02, CY, z1g]));
  }
  gf += dyn(grain, 'x');
  var pnl = [];
  [-2.1, -1.3, -0.5, 0.3, 1.15, 1.95].forEach(function (x) { pnl.push(Ln([x, -0.65, CZ0 + 0.03], [x, FL, CZ0 + 0.03])); });
  gf += dyn(pnl, 'x');

  // the POS: a light tablet on a stand, facing us, and a ticket printer
  var TX0 = 0.02, TX1 = 0.4, TZ = 1.62, TM = (TX0 + TX1) / 2;
  var pos = '';
  var tb = pr(TM, CY, TZ + 0.06);
  pos += el('ellipse', { 'class': 'pos-glow', cx: n(tb[0]), cy: n(tb[1] + 6), rx: 190, ry: 36, fill: 'url(#g-warm)' });
  pos += el('ellipse', { cx: n(tb[0] + 8), cy: n(tb[1] + 3), rx: 78, ry: 10, fill: 'url(#g-shadow)', 'class': 'mul', opacity: '.7' });
  pos += path(ringB(TM, CY + 0.006, TZ + 0.06, 0.075, 24), 'q', { fill: '#d6d3cc' });
  pos += path(P3([[TM - 0.016, CY, TZ + 0.06], [TM + 0.016, CY, TZ + 0.06], [TM + 0.016, -0.36, TZ + 0.08], [TM - 0.016, -0.36, TZ + 0.08]]), 'q', { fill: '#cfd2d2' });
  var sb = -0.44, st = -0.2, zb = TZ, zt = TZ + 0.07, m = 0.013;
  pos += path(P3([[TX0, st, zt], [TX1, st, zt], [TX1, sb, zb], [TX0, sb, zb]]), 'k', { fill: '#dcdad4' });
  var scr = P3([[TX0 + m, st - m, zt], [TX1 - m, st - m, zt], [TX1 - m, sb + m, zb], [TX0 + m, sb + m, zb]]);
  pos += path(scr, 'pos-off');
  function sp(u, v) {
    var x = TX0 + m + (TX1 - TX0 - 2 * m) * u, y = st - m - (st - sb - 2 * m) * v, z = zt - (zt - zb) * v;
    return pr(x, y, z);
  }
  var ui = path(scr, 'pos-scr', { fill: 'url(#g-scr)' });
  ui += path(pts([sp(0.07, 0.15), sp(0.38, 0.15)]), 'pos-ln pos-ln-h');
  [0.34, 0.48, 0.62].forEach(function (v, i) {
    ui += path(pts([sp(0.07, v), sp(0.44 - i * 0.07, v)]) + pts([sp(0.47, v), sp(0.54, v)]), 'pos-ln');
  });
  var b0 = sp(0.62, 0.64), b1 = sp(0.93, 0.86), t0 = sp(0.62, 0.14), t1 = sp(0.93, 0.5);
  ui += el('rect', { x: n(t0[0]), y: n(t0[1]), width: n(t1[0] - t0[0]), height: n(t1[1] - t0[1]), rx: 1.5, 'class': 'pos-card' });
  ui += el('rect', { x: n(b0[0]), y: n(b0[1]), width: n(b1[0] - b0[0]), height: n(b1[1] - b0[1]), rx: 2, 'class': 'pos-btn' });
  pos += '<g class="pos-on">' + ui + '</g>';
  pos += path(scr, 'q');
  // the printer
  var PX0 = 0.47, PX1 = 0.64, PZ0 = 1.55, PZ1 = 1.78, PY = -0.455;
  var ptr = pr((PX0 + PX1) / 2, CY, (PZ0 + PZ1) / 2);
  pos += el('ellipse', { cx: n(ptr[0] + 8), cy: n(ptr[1] + 5), rx: 58, ry: 11, fill: 'url(#g-shadow)', 'class': 'mul', opacity: '.7' });
  pos += path(P3([[PX0, PY, PZ0], [PX1, PY, PZ0], [PX1, PY, PZ1], [PX0, PY, PZ1]]), 'q', { fill: '#f0eee8' });
  pos += path(P3([[PX0, PY, PZ0], [PX1, PY, PZ0], [PX1, CY, PZ0], [PX0, CY, PZ0]]), 'q', { fill: '#dcd9d2' });
  pos += path(P3([[PX0, PY, PZ0], [PX0, PY, PZ1], [PX0, CY, PZ1], [PX0, CY, PZ0]]), 'q', { fill: '#e4e1db' });
  pos += path(P3([[PX0 + 0.025, PY, PZ0 + 0.045], [PX1 - 0.025, PY, PZ0 + 0.045], [PX1 - 0.025, PY, PZ0 + 0.065], [PX0 + 0.025, PY, PZ0 + 0.065]]), 'q', { fill: '#7d858a' });
  pos += path(L3([PX0 + 0.012, PY, PZ0 + 0.13], [PX1 - 0.012, PY, PZ0 + 0.13]), 'd');
  var led = pr(PX1 - 0.03, PY - 0.035, PZ0);
  pos += el('circle', { cx: n(led[0]), cy: n(led[1]), r: 2.2, 'class': 'pr-led' });
  gf += card(TZ, pos);
  var SLOT = [(PX0 + PX1) / 2, PY, PZ0 + 0.055];

  /* ---- the three things that travel (drawn in millimetres) ---- */
  // the receipt: origin at its foot, the paper rising above it
  var RL = 190, teeth = '';
  for (var ti = 0; ti < 12; ti++) teeth += 'l4 -6l4 6';
  var receipt = '<g class="mv mv-rc">' + el('ellipse', { 'class': 'mv-halo', cx: 0, cy: -95, rx: 170, ry: 190, fill: 'url(#g-warm)' }) +
    '<g class="rc-clip" clip-path="url(#rc-clip)"><g class="rc-in"><g class="rc-flip">' +
    path('M-48 0V-' + (RL - 6) + teeth + 'V0Z', 'rc-paper', { fill: 'url(#g-paper)' }) +
    path('M-34 -162h46', 'rc-ln rc-h') +
    path('M-34 -138h62M-34 -122h44M-34 -106h56', 'rc-ln') +
    path('M-34 -88h68', 'rc-ln rc-dash') +
    path('M-34 -70h38M22 -70h12M-34 -54h46M22 -54h12', 'rc-ln') +
    path('M-34 -30h68', 'rc-ln rc-h') +
    '</g></g></g></g>';
  defs += '<clipPath id="rc-clip" clipPathUnits="userSpaceOnUse"><rect x="-300" y="-600" width="600" height="600"/></clipPath>';
  // the short rib: a meaty piece on the bone; raw, then seared
  var MEAT_D = 'M-82 -6C-84 -32 -54 -42 -14 -40C28 -42 66 -34 70 -10C74 12 62 32 22 35C-14 38 -60 37 -75 21C-82 14 -81 4 -82 -6Z';
  function meatSvg(cls) {
    return '<g class="' + cls + '">' +
      path('M62 -10L96 -15C99 -27 116 -25 114 -12C121 -7 119 6 110 7C108 16 94 16 95 7L62 10Z', 'mt-bone') +
      path(MEAT_D, 'mt-raw') + path(MEAT_D, 'mt-cook') +
      path('M-66 -18C-44 -27 -12 -16 16 -25C36 -30 52 -24 62 -20M-60 4C-32 -4 -2 10 28 2C42 -2 54 2 64 0M-48 22C-22 17 6 27 36 21', 'mt-fat') +
      path(MEAT_D, 'mt-ln') + '</g>';
  }
  defs += '<clipPath id="mt-clip" clipPathUnits="userSpaceOnUse"><rect class="mt-clip-r" x="-5000" y="-5000" width="12000" height="12000"/></clipPath>';
  var meat = '<g class="mv-wrap" clip-path="url(#mt-clip)"><g class="mv mv-mt">' + el('ellipse', { 'class': 'mv-halo', cx: 0, cy: 0, rx: 180, ry: 130, fill: 'url(#g-warm)' }) +
    '<g class="mt-rot">' + meatSvg('mt mt-a') + '</g></g></g>';
  // the dish: a plate, seen at the angle the camera sees it, the short rib on it
  var dish = '<g class="mv mv-pt"><g class="pt-disc">' +
    el('ellipse', { 'class': 'pt-shadow', cx: 8, cy: 22, rx: 168, ry: 160, fill: 'url(#g-shadow)' }) +
    el('circle', { r: 145, 'class': 'pt-rim' }) + el('circle', { r: 100, 'class': 'pt-well' }) +
    path('M-80 40C-40 66 46 60 92 26', 'pt-sauce') + '</g>' +
    '<g class="pt-food"><g transform="translate(-6 -18) scale(.95)">' + meatSvg('mt mt-b') + '</g>' +
    path('M-58 -30q8 -16 24 -10M-44 -38q4 -14 18 -12M40 -40q10 -12 24 -4', 'pt-herb') + '</g></g>';

  /* ---- assemble ---- */
  art.innerHTML = '<svg class="pass-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
    '<defs>' + defs + '</defs>' +
    '<rect x="-2000" y="-2000" width="6000" height="6000" style="fill:' + C.porcelain + '"/>' +
    '<g class="pl pl-b">' + gb + '</g>' +
    '<rect class="haze" x="-2000" y="-2000" width="6000" height="6000" style="fill:' + C.porcelain + '"/>' +
    '<g class="pl pl-l">' + labels + '</g>' +
    '<g class="slot slot-b"></g>' +
    '<g class="pl pl-m">' + gm + '</g>' +
    '<g class="pl pl-p">' + gp + '</g>' +
    '<g class="pl pl-f">' + gf + '</g>' +
    '<g class="slot slot-f">' + receipt + meat + dish + '</g>' +
    '</svg>';

  /* ---------- the moving parts ---------- */
  var S = art.querySelector('svg');
  function q(s) { return S.querySelector(s); }
  function qa(s) { return [].slice.call(S.querySelectorAll(s)); }
  var dynEls = qa('[data-d]'), cardEls = qa('[data-c]');
  var R = {
    b: q('.pl-b'), m: q('.pl-m'), f: q('.pl-f'), haze: q('.haze'),
    slot: { b: q('.slot-b'), m: q('.slot-m'), f: q('.slot-f') },
    seam: q('.fr-seam'), lit: q('.fr-lit'), spill: q('.fr-spill'), frIn: q('.fr-in'),
    lbls: qa('.lbl'), ex: q('.lbl-ex'), tubC: qa('.tub-c'), hot: q('.tub-hot'),
    arm: q('.ck-arm'), pan: q('.ck-pan-in'), body: q('.ck-body'), flare: q('.ck-flare'), flames: q('.ck-flames'),
    stmPot: qa('.stm-pot'), stmPan: qa('.stm-pan'),
    hlight: q('.hl-light'), bulbs: qa('.hl-bulb'),
    posOn: q('.pos-on'), posGlow: q('.pos-glow'), led: q('.pr-led'),
    rc: q('.mv-rc'), rcIn: q('.rc-in'), rcFlip: q('.rc-flip'), rcClip: q('.rc-clip'), rcHalo: q('.mv-rc .mv-halo'),
    mt: q('.mv-mt'), mtW: q('.mv-wrap'), mtClip: S.querySelector('.mt-clip-r'), mtRot: q('.mt-rot'), mtHalo: q('.mv-mt .mv-halo'), mtCook: q('.mt-a .mt-cook'),
    pt: q('.mv-pt'), ptDisc: q('.pt-disc'), ptFood: q('.pt-food'), ptShadow: q('.pt-shadow')
  };
  var dynEl = [];
  dynEls.forEach(function (e) { dynEl[+e.getAttribute('data-d')] = e; });
  var cardEl = [];
  cardEls.forEach(function (e) { cardEl[+e.getAttribute('data-c')] = e; });

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sm(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function eio(x) { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function esin(x) { x = clamp(x, 0, 1); return 0.5 - 0.5 * Math.cos(Math.PI * x); }
  function env(t, a, b, c, d) { return t <= a || t >= d ? 0 : t < b ? sm((t - a) / (b - a)) : t <= c ? 1 : 1 - sm((t - c) / (d - c)); }
  function wenv(t, a, b, c, d) { return Math.max(env(t, a, b, c, d), env(t + T, a, b, c, d), env(t - T, a, b, c, d)); }
  function bz(P, u) {
    var v = 1 - u, a = v * v * v, b = 3 * v * v * u, c2 = 3 * v * u * u, d = u * u * u;
    return [0, 1, 2].map(function (k) { return a * P[0][k] + b * P[1][k] + c2 * P[2][k] + d * P[3][k]; });
  }
  function mix(a, b, u) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; }
  function attr(e, a) { for (var k in a) e.setAttribute(k, a[k]); }

  /* the camera path: keys of [t, camera x y z, look-at x y z, where the look-at
     sits in the frame]. A periodic monotone cubic runs through them, so the
     move is smooth, never overshoots, and ends where it starts. */
  var KEYS = [
    [0.95, 0.03, 0.0, 0.14, 0, -0.02, 3.4, 1112, 442],      // wide, creeping in as the receipt prints
    [3.85, 0.55, 0.02, 1.95, 1.12, -0.04, 4.65, 1150, 468], // pushed in through the pass to the fridge
    [4.75, 0.62, 0.03, 2.2, 1.12, -0.04, 4.65, 1140, 462],  // closer, on the labels
    [7.2, -0.38, 0.05, 2.15, -0.62, -0.2, 5.6, 1060, 478],  // tracked across the kitchen to the chef
    [8.4, -0.34, 0.08, 2.3, -0.6, -0.2, 5.6, 1052, 470],  // settling on the pan
    [11.55, 0, 0, 0, 0, 0, 3.4, 1110, 440]                  // pulled back to the start
  ];
  var NK = KEYS.length, NV = 8, TAN = [];
  (function () {
    for (var k = 0; k < NK; k++) {
      var kp = (k - 1 + NK) % NK, kn = (k + 1) % NK;
      var h0 = (KEYS[k][0] - KEYS[kp][0] + T) % T, h1 = (KEYS[kn][0] - KEYS[k][0] + T) % T;
      TAN[k] = [0];
      for (var j = 1; j <= NV; j++) {
        var d0 = (KEYS[k][j] - KEYS[kp][j]) / h0, d1 = (KEYS[kn][j] - KEYS[k][j]) / h1;
        if (d0 * d1 <= 0) TAN[k][j] = 0;
        else { var w1 = 2 * h1 + h0, w2 = h1 + 2 * h0; TAN[k][j] = (w1 + w2) / (w1 / d0 + w2 / d1); }
      }
    }
  })();
  function camAt(t) {
    var k = NK - 1;
    for (var i = 0; i < NK; i++) if (KEYS[i][0] <= t) k = i;
    var kn = (k + 1) % NK, t0 = KEYS[k][0], h = (KEYS[kn][0] - t0 + T) % T, s = ((t - t0 + T) % T) / h;
    var s2 = s * s, s3 = s2 * s, h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2, v = [];
    for (var j = 1; j <= NV; j++) v[j] = h00 * KEYS[k][j] + h10 * h * TAN[k][j] + h01 * KEYS[kn][j] + h11 * h * TAN[kn][j];
    return v;
  }
  function setCam(v) {
    cam.x = v[1]; cam.y = v[2]; cam.z = v[3];
    cam.vx = v[7] - F * (v[4] - cam.x) / (v[6] - cam.z);
    cam.vy = v[8] + F * (v[5] - cam.y) / (v[6] - cam.z);
  }
  // the designed still (reduced motion): looking in through the pass, fridge and chef both in frame
  var STILL = [0, 0.2, 0.02, 1.55, 0.25, -0.12, 4.6, 1085, 470];

  /* projecting the surfaces */
  function clipPoly(p, zc) {
    var out = [];
    for (var i = 0; i < p.length; i++) {
      var a = p[i], b = p[(i + 1) % p.length], ain = a[2] >= zc, bin = b[2] >= zc;
      if (ain) out.push(a);
      if (ain !== bin) { var u = (zc - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, zc]); }
    }
    return out;
  }
  function dPath(polys) {
    var s = '', zc = cam.z + NEAR;
    for (var i = 0; i < polys.length; i++) {
      var P = polys[i], j, a, b;
      if (P.c) {
        var qq = clipPoly(P.p, zc);
        if (qq.length < 3) continue;
        for (j = 0; j < qq.length; j++) { a = pc(qq[j][0], qq[j][1], qq[j][2]); s += (j ? 'L' : 'M') + n(a[0]) + ' ' + n(a[1]); }
        s += 'Z';
      } else {
        for (j = 0; j + 1 < P.p.length; j++) {
          var A = P.p[j], B = P.p[j + 1];
          if (A[2] < zc && B[2] < zc) continue;
          if (A[2] < zc) A = mix(A, B, (zc - A[2]) / (B[2] - A[2]));
          else if (B[2] < zc) B = mix(A, B, (zc - A[2]) / (B[2] - A[2]));
          a = pc(A[0], A[1], A[2]); b = pc(B[0], B[1], B[2]);
          s += 'M' + n(a[0]) + ' ' + n(a[1]) + 'L' + n(b[0]) + ' ' + n(b[1]);
        }
      }
    }
    return s || 'M0 0';
  }
  // a card's transform: drawn as seen from the origin, re-seen from the camera
  function cardTf(z) {
    var d = z - cam.z, k = z / d;
    return 'matrix(' + k.toFixed(4) + ' 0 0 ' + k.toFixed(4) + ' ' + (cam.vx - F * cam.x / d).toFixed(2) + ' ' + (cam.vy + F * cam.y / d).toFixed(2) + ')';
  }
  // a travelling thing: screen place and scale (millimetres to the frame)
  function placeObj(e, p, rot, extra) {
    var d = p[2] - cam.z;
    if (d < 0.2) { e.style.display = 'none'; return 0; }
    e.style.display = '';
    var s = pc(p[0], p[1], p[2]), k = F / d / 1000;
    e.setAttribute('transform', 'translate(' + n(s[0]) + ' ' + n(s[1]) + ') scale(' + k.toFixed(4) + ')' + (rot ? ' rotate(' + rot.toFixed(2) + ')' : '') + (extra || ''));
    return d;
  }
  function toSlot(e, name) { var g = R.slot[name]; if (e.parentNode !== g) g.appendChild(e); }

  /* the relay: paths in metres */
  var RC_PATH = [SLOT, [0.6, 0.02, 1.95], [0.95, 0.42, 3.1], [1.1, 0.06, 4.4]];
  var tub0 = tubs[0], MT0 = [tub0.x + tw / 2, tub0.y + 0.1, TZ0 + 0.16];
  var MT_UP = [tub0.x + tw / 2, tub0.y + TH + 0.08, FZ - 0.16];
  var PAN = [PB[0], PB[1] + 0.04, PB[2]];
  var MT_PATH = [MT_UP, [0.45, 0.6, 4.3], [-0.15, 0.55, 5.4], PAN];
  var PLATE0 = [0.18, PCY + 0.008, 6.02];
  var SHELF = [-0.35, OB + 0.006, 3.6];
  var PT_PATH1 = [PLATE0, [0.12, -0.38, 5.2], [-0.35, -0.4, 4.2], SHELF];
  var PT_PATH2 = [SHELF, [-0.35, -0.5, 2.9], [-0.28, -0.4, 1.9], [-0.2, -0.36, 0.85]];

  var ZB = { b: 5.0, m: 3.6, f: 1.7 }, dynLast = [], cardLast = [], kzLast = {};
  function render(t, still) {
    // each part keeps its own clock, so the still can show every part at its best
    var tR = still ? 2.48 : t, tF = still ? 5.0 : t, tM = still ? 7.66 : t, tC = still ? 7.0 : t, tP = still ? 9.55 : t;
    setCam(still ? STILL : camAt(t));

    /* fridge door (needed before projecting) */
    DOOR.open = still ? 0.95 : eio((tF - 3.45) / 0.6) * (1 - eio((tF - 5.6) / 0.7));

    /* surfaces and cards */
    // (only what changed is written back, so a still moment costs nothing)
    for (var i = 0; i < DYN.length; i++) {
      var d = dPath(DYN[i].fn ? DYN[i].fn() : DYN[i].polys);
      if (d !== dynLast[i]) { dynEl[i].setAttribute('d', d); dynLast[i] = d; }
    }
    for (i = 0; i < CARDS.length; i++) {
      var tf = CARDS[i] - cam.z < 0.22 ? null : cardTf(CARDS[i]);
      if (tf === cardLast[i]) continue;
      cardLast[i] = tf;
      if (tf) { cardEl[i].style.display = ''; cardEl[i].setAttribute('transform', tf); } else cardEl[i].style.display = 'none';
    }
    // lines grow a little heavier as the camera comes close; the haze thins
    ['b', 'm', 'f'].forEach(function (k) {
      var kz = clamp(ZB[k] / (ZB[k] - cam.z), 1, 2).toFixed(2);
      if (kz !== kzLast[k]) { R[k].style.setProperty('--kz', kz); kzLast[k] = kz; }
    });
    R.haze.style.opacity = (0.3 * (1 - 0.6 * clamp(cam.z / 2.2, 0, 1))).toFixed(3);

    /* POS: the screen lights, the receipt prints */
    var pos = wenv(tR, 10.7, 10.95, 12.5, 13.3);
    R.posOn.style.opacity = (0.25 + 0.75 * pos).toFixed(3);
    R.posGlow.style.opacity = (0.2 + 0.55 * pos).toFixed(3);
    R.led.style.opacity = (0.25 + 0.75 * wenv(tR, 11.3, 11.4, 12.85, 13.1)).toFixed(3);

    /* the receipt: prints (11.35 to 0.85), tears, floats through the pass to the fridge (1.1 to 3.55), slips in */
    var r = ((tR - 11.35) % T + T) % T;
    if (r < 4.6) {
      var rp, rot = 0, flip = 1, op = 1, lift = 0, fly = 0;
      if (r < 1.5) { rp = SLOT; R.rcIn.setAttribute('transform', 'translate(0 ' + n((1 - sm(r / 1.5)) * RL) + ')'); }
      else {
        R.rcIn.setAttribute('transform', '');
        if (r < 1.75) { lift = sm((r - 1.5) / 0.25) * 0.015; rp = [SLOT[0], SLOT[1] + lift, SLOT[2]]; }
        else if (r < 4.2) {
          var u = esin((r - 1.75) / 2.45);
          rp = bz(RC_PATH, u); rp[1] += 0.015 * (1 - u);
          fly = Math.sin(u * Math.PI);
          rot = fly * (7 * Math.sin(r * 3.1) - 4);
          flip = 1 - 0.28 * fly * (0.5 + 0.5 * Math.sin(r * 4.3));
        } else {
          var w2 = sm((r - 4.2) / 0.4);
          rp = mix(RC_PATH[3], [1.1, 0.04, 4.85], w2); op = 1 - w2;
        }
      }
      R.rcFlip.setAttribute('transform', 'scale(' + flip.toFixed(3) + ' 1)');
      R.rcHalo.style.opacity = (0.55 * Math.max(fly, r < 1.5 ? 0 : r < 1.75 ? sm((r - 1.5) / 0.25) * 0.3 : 0)).toFixed(3);
      toSlot(R.rc, rp[2] > 3.55 ? 'b' : 'f');
      R.rc.style.opacity = op.toFixed(3);
      placeObj(R.rc, rp, rot);
      if (still) R.rcHalo.style.opacity = '0';
    } else R.rc.style.display = 'none';

    /* the fridge: the seam glows as the receipt comes, the door opens, the counts are pencilled in */
    R.seam.style.opacity = (still ? 0 : env(tF, 3.1, 3.35, 3.45, 3.8)).toFixed(3);
    var lit = still ? 1 : env(tF, 3.45, 3.8, 5.6, 6.3);
    R.lit.style.opacity = lit.toFixed(3);
    R.spill.style.opacity = (0.85 * lit).toFixed(3);
    var lb = still ? 1 : env(tF, 3.9, 4.15, 5.45, 5.75);
    R.lbls.forEach(function (g) { g.style.opacity = lb.toFixed(3); });
    R.ex.style.opacity = lb.toFixed(3);
    R.tubC.forEach(function (e, i) {
      var k = still ? 1 : sm((tF - 4.05 - i * 0.15) / 0.3);
      e.style.opacity = k.toFixed(3);
    });
    R.hot.style.opacity = (still ? 0 : env(tF, 4.25, 4.5, 4.8, 5.2)).toFixed(3);

    /* the short rib: lifts out of its tub, crosses the kitchen to the pan, sears, hops onto the plate */
    var mp = null, mrot = 0, cook = 0, mhalo = 0, ms = 1.15;
    if (tM >= 4.45 && tM < 8.4) {
      if (tM < 4.85) { var a1 = esin((tM - 4.45) / 0.4); mp = mix(MT0, MT_UP, a1); mhalo = a1; }
      else if (tM < 6.85) { var u2 = esin((tM - 4.85) / 2.0); mp = bz(MT_PATH, u2); mrot = Math.sin(u2 * Math.PI) * -14; mhalo = 1 - sm((u2 - 0.75) / 0.25); }
      else if (tM < 8.0) {
        mp = PAN.slice(); cook = sm((tM - 6.9) / 0.6);
        var ck0 = tM - 7.1, ts = 0;
        if (ck0 > 0 && ck0 < 0.55) ts = Math.sin(ck0 / 0.55 * Math.PI);
        else if (ck0 > 0.65 && ck0 < 1.15) ts = 0.75 * Math.sin((ck0 - 0.65) / 0.5 * Math.PI);
        mp[1] += ts * 0.1; mrot = ts * 30;
      } else {
        var u3 = esin((tM - 8.0) / 0.4); cook = 1;
        mp = mix(PAN, [PLATE0[0] - 0.006, PLATE0[1] + 0.018, PLATE0[2]], u3); mp[1] += Math.sin(u3 * Math.PI) * 0.16; mrot = u3 * 360; ms = 1.15 - 0.2 * u3;
      }
    }
    if (mp) {
      toSlot(R.mtW, 'b');
      // while it rises out of its tub, the tub's front hides its lower part
      var lip = tM < 4.85 ? pc(MT0[0], tub0.y + TH, TZ0)[1] : 99999;
      R.mtClip.setAttribute('height', n(lip + 5000));
      R.mt.style.opacity = '1';
      R.mtCook.style.opacity = cook.toFixed(3);
      R.mtHalo.style.opacity = (0.5 * mhalo).toFixed(3);
      placeObj(R.mt, mp, 0);
      R.mtRot.setAttribute('transform', 'rotate(' + mrot.toFixed(1) + ') scale(' + ms.toFixed(3) + ')');
    } else R.mt.style.display = 'none';

    /* the chef: the pan flares as the meat goes in, two tosses, steam */
    var ck = tC - 7.1, toss = 0;
    if (ck > 0 && ck < 1.15) {
      if (ck < 0.55) toss = Math.sin(ck / 0.55 * Math.PI);
      else if (ck > 0.65) toss = 0.75 * Math.sin((ck - 0.65) / 0.5 * Math.PI);
    }
    if (still) toss = 0;
    var sway = still ? 0 : Math.sin(t / T * Math.PI * 4) * 0.9;
    R.body.setAttribute('transform', 'translate(' + n(sway + toss * 1.5) + ' 0)');
    R.arm.setAttribute('transform', 'rotate(' + n(-toss * 8) + ' ' + n(shoulder[0]) + ' ' + n(shoulder[1]) + ')');
    R.pan.setAttribute('transform', 'translate(' + n(toss * 2 + sway) + ' ' + n(-toss * 10) + ') rotate(' + n(toss * 7) + ' ' + n(pb[0]) + ' ' + n(pb[1]) + ')');
    var flare = still ? 0.75 : clamp(env(tC, 6.82, 6.98, 7.15, 7.9) + 0.65 * env(tC, 7.55, 7.68, 7.78, 8.3), 0, 1);
    R.flare.style.opacity = flare.toFixed(3);
    R.flare.setAttribute('transform', 'translate(' + n(pb[0]) + ' ' + n(pb[1]) + ') scale(' + (0.65 + 0.7 * flare).toFixed(3) + ') translate(' + n(-pb[0]) + ' ' + n(-pb[1]) + ')');
    R.flames.style.opacity = (0.25 + 0.75 * flare).toFixed(3);
    R.flames.setAttribute('transform', 'translate(0 ' + n(-toss * 2) + ')');
    R.stmPan.forEach(function (p, i) {
      var s0 = 6.9 + i * 0.2, k = clamp((tC - s0) / 2.3, 0, 1);
      var a = still ? 0.6 : env(tC, s0, s0 + 0.35, s0 + 1.0, s0 + 2.3);
      p.setAttribute('transform', 'translate(0 ' + n(still ? -10 : -k * 50) + ')');
      p.style.opacity = (0.7 * a).toFixed(3);
    });
    R.stmPot.forEach(function (p, i) {
      var k = (t / T * 4 + i * 0.5) % 1;
      p.setAttribute('transform', 'translate(0 ' + n(-k * 30) + ')');
      p.style.opacity = (0.34 * Math.sin(k * Math.PI)).toFixed(3);
    });

    /* the dish: set down on the plating counter, carried to the pass, warmed under the lamps, out to the dining room */
    var pp = null, pop = 1, food = 0, shadow = 1;
    if (tP >= 7.45 && tP < 11.05) {
      food = tP >= 8.38 ? 1 : 0;
      if (tP < 8.42) { pp = PLATE0; pop = sm((tP - 7.45) / 0.3); }
      else if (tP < 9.35) { var u4 = esin((tP - 8.42) / 0.93); pp = bz(PT_PATH1, u4); shadow = 1 - Math.sin(u4 * Math.PI); }
      else if (tP < 9.8) pp = SHELF;
      else { var u5 = esin((tP - 9.8) / 1.25); pp = bz(PT_PATH2, u5); shadow = 1 - sm(u5 * 4); pop = 1 - sm((u5 - 0.72) / 0.28); }
    }
    if (pp) {
      toSlot(R.pt, pp[2] > 4.1 ? 'b' : pp[2] > 3.2 ? 'm' : 'f');
      R.pt.style.opacity = pop.toFixed(3);
      R.ptFood.style.display = food ? '' : 'none';
      R.ptShadow.style.opacity = shadow.toFixed(3);
      var dz = Math.max(pp[2] - cam.z, 0.2), ratio = clamp((cam.y - pp[1]) / Math.hypot(cam.y - pp[1], dz), 0.2, 1);
      placeObj(R.pt, pp, 0);
      R.ptDisc.setAttribute('transform', 'scale(1 ' + ratio.toFixed(3) + ')');
    } else R.pt.style.display = 'none';
    var heat = still ? 1 : 0.55 + 0.45 * env(tP, 9.1, 9.45, 9.95, 10.7);
    R.hlight.style.opacity = heat.toFixed(3);
    R.bulbs.forEach(function (b) { b.style.opacity = (0.55 + 0.45 * heat).toFixed(3); });
  }

  /* ---------- the headline: a tape locking in ---------- */
  var h1 = document.getElementById('hero-title');
  var copy = h1 && h1.closest('.hero-copy');
  var lead = copy && copy.querySelector('.lead');
  var btns = copy ? [].slice.call(copy.querySelectorAll('.btn')) : [];
  var BANDS = 7;
  function hash(a, b) {
    var h = (a * 374761393 + b * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vhs(el, bands) {
    var text = el.textContent.trim();
    var fx = '<span class="vhs-fx" aria-hidden="true"><span class="vhs-c vhs-warm">' + text + '</span><span class="vhs-c vhs-cool">' + text + '</span>';
    for (var i = 0; i < bands; i++) {
      var a = (i / bands * 100).toFixed(2), b = (100 - (i + 1) / bands * 100).toFixed(2);
      fx += '<span class="vhs-b" style="clip-path:inset(' + a + '% -30% ' + b + '% -30%)">' + text + '</span>';
    }
    el.innerHTML = '<span class="vhs-real">' + text + '</span>' + fx + '</span>';
    el.classList.add('vhs');
    return {
      el: el, fx: el.querySelector('.vhs-fx'),
      warm: el.querySelector('.vhs-warm'), cool: el.querySelector('.vhs-cool'),
      bands: [].slice.call(el.querySelectorAll('.vhs-b'))
    };
  }
  // one frame of the effect: split (px), band shifts (px), roll (px), ink opacity
  function apply(v, f) {
    if (!f) { v.el.classList.remove('vhs-on'); return; }
    v.el.classList.add('vhs-on');
    v.fx.style.transform = 'translateY(' + f.roll.toFixed(1) + 'px)';
    v.fx.style.opacity = f.alpha.toFixed(2);
    v.warm.style.transform = 'translate(' + (-f.split).toFixed(1) + 'px,' + (f.sy || 0).toFixed(1) + 'px)';
    v.cool.style.transform = 'translate(' + (f.split * 0.9).toFixed(1) + 'px,' + (-(f.sy || 0)).toFixed(1) + 'px)';
    var co = (v.co || 1) * (f.split > 3 ? 1 : 0.75);
    v.warm.style.opacity = v.cool.style.opacity = f.split > 0.2 ? co.toFixed(2) : '0';
    v.bands.forEach(function (b, i) { b.style.transform = 'translateX(' + (f.shift[i] || 0).toFixed(1) + 'px)'; });
  }
  // the intro, as a function of time (s) and a strength
  function introFrame(t, k, seed, bands) {
    if (t < 0) return { alpha: 0, split: 0, roll: 0, shift: [] };
    if (t >= 1.5) return null;
    var step = Math.floor(t / 0.05), r = function (j) { return hash(step + seed * 101, j); };
    var shift = [], split, roll = 0, alpha = 1, i;
    if (t < 0.09) return { alpha: 0, split: 0, roll: 0, shift: [] };
    if (t < 0.6) {
      var heavy = 1 - (t - 0.09) / 0.6 * 0.5;
      split = (8 + r(1) * 7) * heavy * k;
      for (i = 0; i < bands; i++) shift.push(r(10 + i) > 0.42 ? (r(30 + i) - 0.5) * 70 * heavy * k : (r(50 + i) - 0.5) * 6 * k);
      roll = t < 0.5 ? Math.round(Math.sin(step * 2.3) * 24 * (1 - t / 0.5) * k) : 0;
      alpha = 0.55 + r(2) * 0.45;
    } else if (t < 1.1) {
      var mid = 1 - (t - 0.6) / 0.5;
      split = (2 + r(1) * 3 * mid) * k;
      for (i = 0; i < bands; i++) shift.push(r(10 + i) > 0.72 ? (r(30 + i) - 0.5) * 26 * mid * k : 0);
      alpha = 0.85 + r(2) * 0.15;
    } else {
      split = (0.6 + r(1) * 0.8) * k;
      for (i = 0; i < bands; i++) shift.push(r(10 + i) > 0.9 ? (r(30 + i) - 0.5) * 8 * k : 0);
      if (t > 1.38 && t < 1.43) split = 3 * k;
      else if (t > 1.43) { split = 0; shift = []; }
    }
    return { alpha: alpha, split: split, roll: roll, shift: shift, sy: (r(3) - 0.5) * 1.5 * k };
  }

  var V = null, Vl = null, noise = null, nctx = null, scan = null, track = null;
  function setupText() {
    if (!h1 || !lead) return;
    V = vhs(h1, BANDS);
    Vl = vhs(lead, 4);
    Vl.co = 0.4;
    copy.classList.add('vhs-copy');
    var box = document.createElement('div');
    box.className = 'vhs-screen';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<canvas class="vhs-noise" width="240" height="120"></canvas><i class="vhs-scan"></i><i class="vhs-track"></i>';
    copy.insertBefore(box, copy.firstChild);
    noise = box.querySelector('.vhs-noise');
    nctx = noise.getContext && noise.getContext('2d');
    scan = box.querySelector('.vhs-scan');
    track = box.querySelector('.vhs-track');
    btns.forEach(function (b) { b.classList.add('vhs-btn'); });
  }
  var lastNoise = -1;
  function drawNoise(t, amt) {
    if (!nctx) return;
    noise.style.opacity = amt.toFixed(3);
    if (amt < 0.01) return;
    var step = Math.floor(t / 0.04);
    if (step === lastNoise) return;
    lastNoise = step;
    var img = nctx.createImageData(240, 120), d = img.data;
    for (var i = 0; i < 240 * 120; i++) {
      var r = hash(step, i), row = Math.floor(i / 240);
      var streak = hash(step, 100000 + row) > 0.86 ? 1 : 0;
      var v = r > (streak ? 0.62 : 0.86) ? 1 : 0;
      var c = v ? 35 : 242;
      d[i * 4] = c; d[i * 4 + 1] = c + (v ? 7 : -1); d[i * 4 + 2] = c + (v ? 12 : -6);
      d[i * 4 + 3] = v ? Math.round(40 + r * 90) : 0;
    }
    nctx.putImageData(img, 0, 0);
  }
  function textAt(t) {
    if (!V) return;
    apply(V, introFrame(t, 1, 1, BANDS));
    apply(Vl, introFrame(t - 0.14, 0.5, 2, 4));
    drawNoise(t, t < 0 ? 0 : t < 0.1 ? 0.55 : 0.55 * (1 - sm((t - 0.1) / 0.45)));
    scan.style.opacity = (t < 0.8 ? 0.55 : 0.55 * (1 - sm((t - 0.8) / 0.5))).toFixed(3);
    // the tracking bar rolls down twice
    var tr = t < 0.12 ? -1 : t < 0.5 ? (t - 0.12) / 0.38 : t < 0.62 ? -1 : t < 0.92 ? (t - 0.62) / 0.3 : -1;
    track.style.opacity = tr < 0 ? '0' : (t < 0.5 ? 0.85 : 0.45).toFixed(2);
    if (tr >= 0) track.style.top = (tr * 112 - 12).toFixed(1) + '%';
    var on = t >= 1.2;
    btns.forEach(function (b) { b.classList.toggle('in', on); });
  }
  function textDone() {
    if (!V) return;
    apply(V, null); apply(Vl, null);
    noise.style.opacity = '0'; scan.style.opacity = '0'; track.style.opacity = '0';
    btns.forEach(function (b) { b.classList.add('in'); });
  }

  /* the rare small glitch after: under 250 ms, every 7 to 10 s */
  var nextBlip = 0, blip = null;
  function blipAt(now) {
    if (!V) return;
    if (!blip && now >= nextBlip) {
      var kind = Math.random() < 0.55 ? 'split' : 'slice';
      blip = { at: now, kind: kind, dur: kind === 'split' ? 160 : 120, band: Math.floor(Math.random() * BANDS), dir: Math.random() < 0.5 ? -1 : 1, lead: Math.random() < 0.3 };
    }
    if (!blip) return;
    var e = now - blip.at;
    if (e > blip.dur) {
      apply(V, null); if (blip.lead) apply(Vl, null);
      blip = null;
      nextBlip = now + 7000 + Math.random() * 3000;
      return;
    }
    var step = Math.floor(e / 45), f = { alpha: 1, roll: 0, shift: [], split: 0 };
    if (blip.kind === 'split') f.split = step % 2 ? 1.5 : 3;
    else { f.shift[blip.band] = blip.dir * (step % 2 ? 3 : 7); f.split = 1.2; }
    apply(V, f);
    if (blip.lead) apply(Vl, { alpha: 1, roll: 0, shift: [], split: f.split * 0.6 });
  }

  /* ---------- fit the drawing to its box ----------
     The scene is 1600 x 900. Wide boxes crop top and bottom; narrow ones
     (a phone) crop the sides and keep the stage, where the relay happens. */
  var STAGE = 1120;
  function fit() {
    var w = fig.clientWidth, h = fig.clientHeight;
    if (!w || !h) return;
    var ar = w / h, vb;
    if (ar >= W / H) { var vh = W / ar; vb = [0, (H - vh) * 0.5, W, vh]; }
    else { var vw = H * ar; vb = [clamp(STAGE - vw / 2, 0, W - vw), 0, vw, H]; }
    S.setAttribute('viewBox', vb.map(function (v) { return v.toFixed(1); }).join(' '));
  }
  fit();
  window.addEventListener('resize', fit);

  /* ---------- run ---------- */
  if (!motion) {
    render(0, true);
    return;
  }
  setupText();
  if (freeze != null && !isNaN(freeze)) {
    render(((freeze % T) + T) % T, false);
    var hold = function () {
      sizeScreen();
      if (freeze < 1.5) textAt(freeze); else textDone();
      root.classList.remove('vhs-pending');
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(hold);
    return;
  }
  render(0, false);
  textAt(0);

  var start = 0, raf = 0, visible = true, textOver = false, pausedAt = 0, offset = 0;
  function tick(now) {
    var e = (now - start) / 1000;
    render(((e + offset) % T + T) % T, false);
    if (!textOver) {
      if (e < 1.55) textAt(e);
      else { textOver = true; textDone(); nextBlip = now + 7000 + Math.random() * 3000; }
    } else blipAt(now);
    raf = requestAnimationFrame(tick);
  }
  function sizeScreen() {
    var box = copy && copy.querySelector('.vhs-screen');
    if (box && lead) box.style.height = (lead.offsetTop + lead.offsetHeight + 28) + 'px';
  }
  function go() {
    root.classList.remove('vhs-pending');
    sizeScreen();
    start = performance.now();
    raf = requestAnimationFrame(tick);
  }
  // pause the loop when the hero is off screen or the tab is hidden
  function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; pausedAt = performance.now(); } }
  function resume() {
    if (raf || !visible || document.hidden || !start) return;
    start += performance.now() - pausedAt;
    raf = requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) resume(); else pause();
    }).observe(fig);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else resume(); });

  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise(function (r) { setTimeout(r, 700); })]).then(function () { requestAnimationFrame(go); });
})();
