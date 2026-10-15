/* Tooey, exploration 39: the string, in depth.
   The hero is one-point perspective from the dining room, through the pass,
   into the kitchen. Everything is placed in metres in front of a camera and
   projected (pr), then drawn as three depth planes: the kitchen (chef at the
   range on the left, the fridge on the right), the pass (wall, heat lamps,
   shelf), and the counter with the POS. Far planes are lighter and softer,
   near ones darker and crisper. The camera breathes a few pixels over the
   loop, so the planes slide against each other.

   One lamplight thread runs POS -> fridge -> chef -> pass -> POS, and a pulse
   runs along it. Each thing reacts when the pulse arrives. The thread is cut
   where it passes the heat lamps: the part beyond sits behind the pass. The
   whole loop is a pure function of t (0..10 s), so it repeats without a seam.

   The headline and the line under it come on like a VHS tape locking in.
   The real words stay in the HTML; the animated copies are aria-hidden.
   Under reduced motion: no loop and no glitch, one still frame, all lit.
   ?freeze=<s> holds the scene and the headline at that second (for review). */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var fig = document.querySelector('.pass-scene');
  var art = fig && fig.querySelector('.pass-art');
  if (!art) return;
  var params = new URLSearchParams(location.search);
  var freeze = params.has('freeze') ? parseFloat(params.get('freeze')) : null;
  var T = 10;

  /* ---------- the camera ---------- */
  var F = 900, VX = 806, VY = 420, W = 1200, H = 900;
  function n(v) { return Math.round(v * 10) / 10; }
  function pr(x, y, z) { return [VX + F * x / z, VY - F * y / z]; }
  function pts(list) {
    var s = '';
    for (var i = 0; i < list.length; i++) s += (i ? 'L' : 'M') + n(list[i][0]) + ' ' + n(list[i][1]);
    return s;
  }
  function P3(list) { return pts(list.map(function (a) { return pr(a[0], a[1], a[2]); })) + 'Z'; }
  function L3(a, b) { return pts([pr(a[0], a[1], a[2]), pr(b[0], b[1], b[2])]); }
  // a circle lying flat (y constant), as projected points
  function ringY(cx, y, cz, r, k) {
    var out = [];
    k = k || 28;
    for (var i = 0; i < k; i++) {
      var a = i / k * Math.PI * 2;
      out.push(pr(cx + r * Math.cos(a), y, cz + r * Math.sin(a)));
    }
    return out;
  }
  function closed(list) { return pts(list) + 'Z'; }
  // the side of a short cylinder: its near half, between the top and base rings
  function drum(cx, y0, y1, cz, r) {
    var top = ringY(cx, y1, cz, r, 32), base = ringY(cx, y0, cz, r, 32);
    return pts([top[16]].concat(base.slice(16)).concat([base[0], top[0]])) + 'Z';
  }

  var C = { porcelain: '#f2f1ec', slate: '#232a2f' };

  /* ---------- the drawing ---------- */
  var defs = '', gb = '', gm = '', gf = '';
  // paint goes in a style attribute: the site's line classes set fill: none
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

  defs += '<filter id="pg-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6"/></filter>';
  defs += '<filter id="pg-glow2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6"/></filter>';

  // tones: the dining room nearer and darker, the kitchen beyond lighter
  lin('g-wall', 0, 0, 0, 1, [[0, '#d9d5cc'], [0.4, '#e2ded6'], [1, '#dbd6cd']]);
  lin('g-kwall', 0, 0, 0, 1, [[0, '#e8e7e3'], [0.5, '#f1f0ec'], [1, '#e9e8e4']]);
  lin('g-kside', 0, 0, 1, 0, [[0, '#d9d6cf'], [1, '#e5e3de']]);
  lin('g-kside-r', 0, 0, 1, 0, [[0, '#e5e3de'], [1, '#d9d6cf']]);
  lin('g-kceil', 0, 0, 0, 1, [[0, '#d6d3cc'], [1, '#e0ded8']]);
  lin('g-dceil', 0, 0, 0, 1, [[0, '#d2cdc3'], [1, '#dcd8cf']]);
  lin('g-steel', 0, 0, 1, 0, [[0, '#cfd3d4'], [0.45, '#eaeceb'], [1, '#cdd1d2']]);
  lin('g-shelf', 0, 0, 0, 1, [[0, '#d5d9d9'], [1, '#e9ebea']]);
  lin('g-ctop', 0, 0, 0, 1, [[0, '#dccdb1'], [1, '#cdb795']]);
  lin('g-cfront', 0, 0, 0, 1, [[0, '#b7a183'], [0.25, '#c3af92'], [1, '#cdbca2']]);
  lin('g-pfront', 0, 0, 0, 1, [[0, '#cfc9be'], [1, '#d7d2c8']]);
  lin('g-fridge', 0, 0, 1, 0, [[0, '#e3e6e6'], [1, '#eef0f0']]);
  lin('g-door', 0, 0, 1, 0, [[0, '#f0f1f1'], [1, '#e1e4e4']]);
  lin('g-heat', 0, 0, 0, 1, [[0, '#f3ad55', 0.42], [0.55, '#f3b25f', 0.1], [1, '#f3b25f', 0]]);
  lin('g-jacket', 0, 0, 1, 0, [[0, '#f7f6f2'], [0.55, '#efeee9'], [1, '#d6d5cf']]);
  lin('g-paper', 0, 0, 0, 1, [[0, '#fdfcf8'], [1, '#f1eee6']]);
  rad('g-fin', [[0, '#ffffff'], [0.55, '#f4f9f9'], [1, '#d3e2e3']], ' cx=".5" cy=".35" r=".8"');
  rad('g-pool', [[0, '#f4ad57', 0.9], [0.5, '#f6c27e', 0.4], [1, '#f6c27e', 0]]);
  rad('g-warm', [[0, '#fbd39a', 1], [0.45, '#fbd39a', 0.5], [1, '#fbd39a', 0]]);
  rad('g-flare', [[0, '#ffe4ae', 1], [0.3, '#f7ae52', 0.8], [1, '#f39a3c', 0]]);
  rad('g-cool', [[0, '#cfe7ea', 1], [0.5, '#dcedef', 0.5], [1, '#dcedef', 0]]);
  rad('g-shadow', [[0, C.slate, 0.36], [1, C.slate, 0]]);
  lin('g-scr', 0, 0, 0, 1, [[0, '#fce8c4'], [1, '#f6d39b']]);
  lin('g-haze', 0, 0, 0, 1, [[0, C.porcelain, 0.36], [0.6, C.porcelain, 0.2], [1, C.porcelain, 0.3]]);
  lin('g-ao', 0, 0, 0, 1, [[0, C.slate, 0.16], [1, C.slate, 0]]);

  /* ---- the kitchen (back) ---- */
  var KZ = 6.4, KX = 1.75, KC = 1.25, FL = -1.55, K0 = 3.75;
  gb += path(P3([[-KX, KC, K0], [KX, KC, K0], [KX, KC, KZ], [-KX, KC, KZ]]), 'f', { fill: 'url(#g-kceil)' });
  gb += path(P3([[-KX, KC, K0], [-KX, KC, KZ], [-KX, FL, KZ], [-KX, FL, K0]]), 'f', { fill: 'url(#g-kside)' });
  gb += path(P3([[KX, KC, K0], [KX, KC, KZ], [KX, FL, KZ], [KX, FL, K0]]), 'f', { fill: 'url(#g-kside-r)' });
  gb += path(P3([[-KX, KC, KZ], [KX, KC, KZ], [KX, FL, KZ], [-KX, FL, KZ]]), 'f', { fill: 'url(#g-kwall)' });
  // soft shade where the ceiling meets the back wall
  var ao0 = pr(-KX, KC, KZ), ao1 = pr(KX, KC - 0.25, KZ);
  gb += el('rect', { x: n(ao0[0]), y: n(ao0[1]), width: n(ao1[0] - ao0[0]), height: n(ao1[1] - ao0[1]), fill: 'url(#g-ao)' });
  // corners of the room, running to the vanishing point
  gb += path(L3([-KX, KC, K0], [-KX, KC, KZ]) + L3([KX, KC, K0], [KX, KC, KZ]) + L3([-KX, FL, KZ], [-KX, KC, KZ]) + L3([KX, FL, KZ], [KX, KC, KZ]) + L3([-KX, KC, KZ], [KX, KC, KZ]), 'k');
  // a strip light on the kitchen ceiling
  gb += path(P3([[-0.3, KC, 4.5], [0.3, KC, 4.5], [0.3, KC, 6.0], [-0.3, KC, 6.0]]), 'q', { fill: '#f6f5f1' });
  gb += path(L3([-0.2, KC, 4.6], [-0.2, KC, 5.9]) + L3([0.2, KC, 4.6], [0.2, KC, 5.9]), 'd');
  gb += path(L3([-KX, KC, 4.8], [KX, KC, 4.8]) + L3([-KX, KC, 5.6], [KX, KC, 5.6]), 'd');
  // tiles behind the range (left), on the back wall and the left wall
  var tl = '', row = 0, ty, tx;
  for (ty = -0.95; ty <= 0.78; ty += 0.11) tl += L3([-KX, ty, KZ], [0.15, ty, KZ]) + L3([-KX, ty, 4.4], [-KX, ty, KZ]);
  for (ty = -0.95; ty < 0.76; ty += 0.11, row++) {
    for (tx = -KX + (row % 2 ? 0.11 : 0.22); tx < 0.15; tx += 0.22) tl += L3([tx, ty, KZ], [tx, ty + 0.11, KZ]);
  }
  gb += path(tl, 'x');
  // an open shelf on the back wall, right of the hood, with tubs and a jar
  var SHY = 0.3;
  gb += path(P3([[0.08, SHY, KZ - 0.28], [0.8, SHY, KZ - 0.28], [0.8, SHY, KZ], [0.08, SHY, KZ]]), 'q', { fill: '#dcd9d1' });
  gb += path(L3([0.08, SHY - 0.02, KZ - 0.28], [0.8, SHY - 0.02, KZ - 0.28]), 'k');
  [[0.15, 0.12, 0.15], [0.31, 0.11, 0.12], [0.47, 0.09, 0.22], [0.62, 0.11, 0.13]].forEach(function (b, i) {
    var x0 = b[0], w = b[1], h = b[2], z = KZ - 0.16;
    gb += path(P3([[x0, SHY, z], [x0 + w, SHY, z], [x0 + w, SHY + h, z], [x0, SHY + h, z]]), 'q', { fill: i === 2 ? '#e4e0d7' : '#eeece6' });
    if (i !== 2) gb += path(L3([x0, SHY + h - 0.025, z], [x0 + w, SHY + h - 0.025, z]), 'd');
  });

  // the hood over the range
  var HX0 = -KX + 0.02, HX1 = -0.12, HZ = 5.62, HY = 0.8;
  gb += path(P3([[HX0, HY, HZ], [HX1, HY, HZ], [HX1, HY, KZ], [HX0, HY, KZ]]), 'f', { fill: '#c3c7c8' });
  gb += path(P3([[HX1, HY, HZ], [HX1, HY + 0.2, HZ], [HX1, KC, 6.05], [HX1, KC, KZ], [HX1, HY, KZ]]), 'q', { fill: '#d3d7d7' });
  gb += path(P3([[HX0, HY + 0.2, HZ], [HX1, HY + 0.2, HZ], [HX1, KC, 6.05], [HX0, KC, 6.05]]), 'q', { fill: '#e2e5e5' });
  gb += path(P3([[HX0, HY, HZ], [HX1, HY, HZ], [HX1, HY + 0.2, HZ], [HX0, HY + 0.2, HZ]]), 'k', { fill: 'url(#g-steel)' });
  gb += path(L3([HX0 + 0.05, HY + 0.05, HZ], [HX1 - 0.05, HY + 0.05, HZ]), 'd');
  // the warm light under the hood
  var hl = pr(-0.9, -0.5, 6.1);
  gb += el('ellipse', { cx: n(hl[0]), cy: n(hl[1] - 10), rx: 120, ry: 44, fill: 'url(#g-warm)', 'class': 'mul', opacity: '.6' });

  // the range
  var RX0 = -KX + 0.05, RX1 = -0.18, RZ = 5.78, RY = -0.6;
  gb += path(P3([[RX0, RY, RZ], [RX1, RY, RZ], [RX1, RY, KZ], [RX0, RY, KZ]]), 'k', { fill: 'url(#g-steel)' });
  gb += path(P3([[RX0, RY, RZ], [RX1, RY, RZ], [RX1, RY - 0.25, RZ], [RX0, RY - 0.25, RZ]]), 'q', { fill: '#d1d5d6' });
  gb += path(P3([[RX1, RY, RZ], [RX1, RY, KZ], [RX1, RY - 0.4, KZ], [RX1, RY - 0.4, RZ]]), 'q', { fill: '#c9cdce' });
  var kn = '';
  [-1.5, -1.25, -1.0, -0.75, -0.5].forEach(function (x) { var p = pr(x, RY - 0.08, RZ); kn += 'M' + n(p[0] - 2) + ' ' + n(p[1]) + 'a2 2 0 1 0 4 0a2 2 0 1 0 -4 0'; });
  gb += path(kn, 'q');
  gb += path(closed(ringY(-1.3, RY, 6.15, 0.13)) + closed(ringY(-0.45, RY, 6.12, 0.13)), 'd');

  // the stock pot, simmering
  var POT = [-1.28, 6.16, 0.16];
  gb += path(drum(POT[0], RY, RY + 0.28, POT[1], POT[2]), 'q', { fill: '#dde0e0' });
  gb += path(closed(ringY(POT[0], RY + 0.28, POT[1], POT[2])), 'q', { fill: '#c5c9ca' });
  var pot = pr(POT[0], RY + 0.28, POT[1]);

  // steam paths, set going every frame
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
  gb += '<g>' + steamAt(pot, 'stm-pot', 2, 40) + '</g>';

  // the chef's pan (it tosses)
  var PB = [-0.42, RY + 0.05, 6.0];
  var pb = pr(PB[0], PB[1], PB[2]);
  var panSvg = path(drum(PB[0], RY + 0.005, PB[1], PB[2], 0.15), 'k', { fill: '#4a5156', 'fill-opacity': '.88' }) +
    path(closed(ringY(PB[0], PB[1], PB[2], 0.15)), 'k', { fill: '#5d6469' }) +
    path(closed(ringY(PB[0], PB[1] - 0.01, PB[2], 0.11)), 'd', { fill: '#dcae73' }) +
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
  var csh = c(0.02, -0.8);
  chef += el('ellipse', { cx: n(csh[0]), cy: n(csh[1]), rx: 52, ry: 11, fill: 'url(#g-shadow)', opacity: '.55' });
  // left sleeve, behind
  chef += path(cp([[-0.19, -0.06], [-0.28, -0.14], [-0.31, -0.36], [-0.26, -0.47], [-0.19, -0.41]]) + 'Z', 'k', { fill: '#e6e5e0' });
  // torso
  var torso = 'M' + cn(-0.06, 0.012) + 'C' + cn(-0.14, 0.0) + ' ' + cn(-0.22, -0.03) + ' ' + cn(-0.225, -0.13) +
    'L' + cn(-0.205, -0.5) + 'L' + cn(-0.2, -0.95) + 'L' + cn(0.2, -0.95) + 'L' + cn(0.205, -0.5) + 'L' + cn(0.225, -0.13) +
    'C' + cn(0.22, -0.03) + ' ' + cn(0.14, 0.0) + ' ' + cn(0.06, 0.012) + 'Z';
  chef += path(torso, 'k', { fill: 'url(#g-jacket)' });
  chef += path(cp([[0, -0.02], [0, -0.48]]) + cp([[-0.13, -0.005], [-0.12, -0.16]]) + cp([[0.13, -0.005], [0.12, -0.16]]), 'd');
  // apron band and its bow
  chef += path(cp([[-0.205, -0.5], [0.205, -0.5], [0.205, -0.545], [-0.205, -0.545]]) + 'Z', 'q', { fill: '#3a4247', 'fill-opacity': '.85' });
  chef += path(cq([0, -0.52], [-0.09, -0.44], [-0.08, -0.57]) + 'Z' + cq([0, -0.52], [0.09, -0.44], [0.08, -0.57]) + 'Z', 'q', { fill: '#4a5257', 'fill-opacity': '.82' });
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
  // the toque
  var tq = 'M' + cn(-0.082, 0.15) + 'L' + cn(-0.086, 0.215) +
    'C' + cn(-0.15, 0.24) + ' ' + cn(-0.14, 0.37) + ' ' + cn(-0.07, 0.36) +
    'C' + cn(-0.05, 0.42) + ' ' + cn(0.06, 0.43) + ' ' + cn(0.07, 0.36) +
    'C' + cn(0.14, 0.37) + ' ' + cn(0.15, 0.24) + ' ' + cn(0.086, 0.215) +
    'L' + cn(0.082, 0.15) + 'Z';
  chef += path(tq, 'k', { fill: '#fcfcf9' });
  chef += path(cp([[-0.086, 0.21], [0.086, 0.21]]) + cp([[-0.03, 0.225], [-0.04, 0.35]]) + cp([[0.03, 0.225], [0.035, 0.36]]), 'd');
  // the right arm works the pan: its own group, so it can move
  var armSvg = path(cp([[0.19, -0.05], [0.25, -0.1], [0.31, -0.27], [0.33, -0.4], [0.27, -0.44], [0.23, -0.33], [0.19, -0.2]]) + 'Z', 'k', { fill: '#ecebe6' }) +
    path(cp([[0.27, -0.41], [0.33, -0.41]]), 'd');
  var shoulder = c(0.21, -0.07);

  /* ---- the fridge (kitchen right) ---- */
  var FX0 = 0.82, FX1 = 1.45, FZ = 4.3, FT = 0.62, FD = 0.62;
  var fsh = pr((FX0 + FX1) / 2, -0.62, FZ + 0.3);
  gb += el('ellipse', { cx: n(fsh[0]), cy: n(fsh[1] + 22), rx: 80, ry: 16, fill: 'url(#g-shadow)', opacity: '.5' });
  gb += path(P3([[FX0, FT, FZ], [FX0, FT, FZ + FD], [FX0, FL, FZ + FD], [FX0, FL, FZ]]), 'k', { fill: '#d4d8d8' });
  gb += path(P3([[FX0, FT, FZ], [FX1, FT, FZ], [FX1, FL, FZ], [FX0, FL, FZ]]), 'k', { fill: 'url(#g-fridge)' });
  // the inside: back, right wall, ceiling, shelves
  var IX0 = FX0 + 0.04, IX1 = FX1 - 0.04, IT = FT - 0.05, IZ = FZ + 0.01, IB = FZ + FD - 0.06;
  var inside = '';
  inside += path(P3([[IX0, IT, IB], [IX1, IT, IB], [IX1, FL, IB], [IX0, FL, IB]]), 'q', { fill: 'url(#g-fin)' });
  inside += path(P3([[IX1, IT, IZ], [IX1, IT, IB], [IX1, FL, IB], [IX1, FL, IZ]]), 'q', { fill: '#d9e4e5' });
  inside += path(P3([[IX0, IT, IZ], [IX1, IT, IZ], [IX1, IT, IB], [IX0, IT, IB]]), 'q', { fill: '#cddadb' });
  [0.17, -0.25].forEach(function (sy) {
    inside += path(P3([[IX0, sy, IZ], [IX1, sy, IZ], [IX1, sy, IB], [IX0, sy, IB]]), 'q', { fill: '#e6eded', 'fill-opacity': '.92' });
    inside += path(P3([[IX0, sy, IZ], [IX1, sy, IZ], [IX1, sy - 0.022, IZ], [IX0, sy - 0.022, IZ]]), 'k', { fill: '#d2dbdb' });
  });
  // the tubs, with counts pencilled on tape (an example)
  var tw = (IX1 - IX0 - 0.06) / 2;
  var tubs = [
    { x: IX0 + 0.02, y: 0.17, name: 'Short rib', c: '27' },
    { x: IX0 + 0.04 + tw, y: 0.17, name: 'Risotto', c: '33' },
    { x: IX0 + 0.02, y: -0.25, name: 'Burrata', c: '19' },
    { x: IX0 + 0.04 + tw, y: -0.25, name: 'Focaccia', c: '12' }
  ];
  var labels = '';
  tubs.forEach(function (b, i) {
    var z0 = IZ + 0.06, z1 = z0 + 0.3, h = 0.17, y1 = b.y + h, w = tw;
    if (y1 < 0) inside += path(P3([[b.x, y1, z0], [b.x + w, y1, z0], [b.x + w, y1, z1], [b.x, y1, z1]]), 'q', { fill: '#f2f1eb' });
    inside += path(P3([[b.x, b.y, z0], [b.x + w, b.y, z0], [b.x + w, y1, z0], [b.x, y1, z0]]), 'q', { fill: '#f7f6f1', 'fill-opacity': '.95' });
    inside += path(L3([b.x, y1 - 0.022, z0], [b.x + w, y1 - 0.022, z0]), 'd');
    var a = pr(b.x + 0.022, y1 - 0.035, z0), bb = pr(b.x + w - 0.022, b.y + 0.02, z0);
    labels += '<g class="lbl">' +
      el('rect', { x: n(a[0]), y: n(a[1]), width: n(bb[0] - a[0]), height: n(bb[1] - a[1]), 'class': 'tape' }) +
      el('text', { x: n(a[0] + 2.5), y: n(a[1] + 8.4), 'class': 'tub-n' }, b.name) +
      el('text', { x: n(bb[0] - 2.5), y: n(bb[1] - 2.5), 'class': 'tub-c', 'text-anchor': 'end' }, b.c) +
      '</g>';
  });
  var ex = pr(IX0 + 0.03, IT - 0.065, IB);
  labels += el('text', { x: n(ex[0]), y: n(ex[1]), 'class': 'tub-ex' }, 'Example');
  var fgl = pr((FX0 + FX1) / 2, 0.0, FZ);
  var fridge = '<g class="fr-in">' + inside + '<g class="fr-lit">' +
    el('ellipse', { cx: n(fgl[0]), cy: n(fgl[1]), rx: 80, ry: 140, fill: 'url(#g-cool)', opacity: '.95' }) + '</g>' + labels + '</g>';
  // the door, hinged on the right (its shape is set every frame); its seam glows first
  fridge += path(P3([[IX0, IT, FZ], [IX1, IT, FZ], [IX1, FL, FZ], [IX0, FL, FZ]]), 'fr-seam');
  fridge += el('path', { 'class': 'k fr-door', fill: 'url(#g-door)' }) + el('path', { 'class': 'fr-handle' });
  // the fridge's light spills on the kitchen
  var fsp = pr((FX0 + FX1) / 2 - 0.2, -0.55, FZ - 0.3);
  fridge += el('ellipse', { 'class': 'fr-spill', cx: n(fsp[0]), cy: n(fsp[1]), rx: 150, ry: 40, fill: 'url(#g-cool)' });
  gb += fridge;

  // the range and the chef
  gb += '<g class="ck-pan">' + panSvg + '</g>';
  gb += el('ellipse', { 'class': 'ck-flare', cx: n(pb[0]), cy: n(pb[1] - 20), rx: 80, ry: 70, fill: 'url(#g-flare)' });
  gb += '<g class="ck-flames">' + flameSvg + '</g>';
  gb += '<g class="ck-body">' + chef + '<g class="ck-arm">' + armSvg + '</g></g>';
  gb += '<g>' + steamAt([pb[0] + 2, pb[1] - 8], 'stm-pan', 3, 54) + '</g>';

  /* ---- the pass (mid) ---- */
  var PZ = 3.4, PZ2 = 3.75, OX = 1.3, OT = 0.95, OB = -0.55, DC = 1.45;
  gm += path(P3([[-9, DC, 1.0], [9, DC, 1.0], [9, DC, PZ], [-9, DC, PZ]]), 'f', { fill: 'url(#g-dceil)' });
  var bm = '';
  [-2.6, -1.3, 0, 1.3, 2.6].forEach(function (x) { bm += L3([x, DC, 1.05], [x, DC, PZ]); });
  gm += path(bm, 'q');
  // the wall, with the opening cut out
  gm += path(P3([[-9, DC, PZ], [9, DC, PZ], [9, FL, PZ], [-9, FL, PZ]]) + P3([[-OX, OT, PZ], [-OX, OB, PZ], [OX, OB, PZ], [OX, OT, PZ]]), 'f', { fill: 'url(#g-wall)', 'fill-rule': 'evenodd' });
  gm += path(L3([-9, DC, PZ], [9, DC, PZ]), 'k');
  gm += path(L3([-9, DC - 0.07, PZ], [9, DC - 0.07, PZ]), 'd');
  // the reveals: jambs and soffit, in shade
  gm += path(P3([[-OX, OT, PZ], [-OX, OT, PZ2], [-OX, OB, PZ2], [-OX, OB, PZ]]), 'q', { fill: '#c9c3b9' });
  gm += path(P3([[OX, OT, PZ], [OX, OT, PZ2], [OX, OB, PZ2], [OX, OB, PZ]]), 'q', { fill: '#d0cbc1' });
  gm += path(P3([[-OX, OT, PZ], [OX, OT, PZ], [OX, OT, PZ2], [-OX, OT, PZ2]]), 'q', { fill: '#bfb9ae' });
  gm += path(P3([[-OX, OT, PZ], [-OX, OB, PZ], [OX, OB, PZ], [OX, OT, PZ]]), 'k');
  gm += path(L3([-OX, OT, PZ2], [OX, OT, PZ2]) + L3([-OX, OT, PZ2], [-OX, OB, PZ2]) + L3([OX, OT, PZ2], [OX, OB, PZ2]), 'q');
  // the pass counter under the shelf, on the dining side
  gm += path(P3([[-OX - 0.1, OB - 0.035, 3.2], [OX + 0.1, OB - 0.035, 3.2], [OX + 0.1, FL, 3.2], [-OX - 0.1, FL, 3.2]]), 'q', { fill: 'url(#g-pfront)' });
  var sl = '';
  for (var sx = -OX + 0.15; sx < OX; sx += 0.18) sl += L3([sx, OB - 0.07, 3.2], [sx, FL, 3.2]);
  gm += path(sl, 'x');
  // the shelf: steel, running through into the kitchen
  gm += path(P3([[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX, OB, 4.0], [-OX, OB, 4.0]]), 'q', { fill: 'url(#g-shelf)' });
  gm += path(P3([[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX + 0.1, OB - 0.035, 3.2], [-OX - 0.1, OB - 0.035, 3.2]]), 'k', { fill: '#c3c7c8' });
  // the ticket rail along the soffit, with a few tickets on it
  gm += path(P3([[-OX + 0.08, OT - 0.02, 3.42], [OX - 0.08, OT - 0.02, 3.42], [OX - 0.08, OT - 0.06, 3.42], [-OX + 0.08, OT - 0.06, 3.42]]), 'k', { fill: '#d0d4d5' });
  [[-1.02, 2], [-0.88, -3], [0.55, 1], [0.95, -2], [1.08, 3]].forEach(function (tk) {
    var a = pr(tk[0], OT - 0.05, 3.41), w = 0.075 * F / 3.41, h = 0.12 * F / 3.41;
    gm += '<g transform="rotate(' + tk[1] + ' ' + n(a[0]) + ' ' + n(a[1]) + ')">' +
      el('rect', { x: n(a[0] - w / 2), y: n(a[1]), width: n(w), height: n(h), 'class': 'q', fill: '#f8f7f2' }) +
      path('M' + n(a[0] - w / 2 + 3.5) + ' ' + n(a[1] + 7) + 'h' + n(w - 7) + 'M' + n(a[0] - w / 2 + 3.5) + ' ' + n(a[1] + 12) + 'h' + n(w - 11) + 'M' + n(a[0] - w / 2 + 3.5) + ' ' + n(a[1] + 17) + 'h' + n(w - 8), 'd') +
      '</g>';
  });
  // the heat lamps: three, always warm, brighter with a plate under them
  var LZ = 3.58, LX = [-1.0, -0.35, 0.3], lamps = '', cones = '', pools = '';
  LX.forEach(function (lx) {
    var top = pr(lx, OT, LZ), sh0 = pr(lx, 0.58, LZ), sh1 = pr(lx, 0.46, LZ), r0 = 0.035 * F / LZ, r1 = 0.1 * F / LZ;
    lamps += path('M' + n(top[0]) + ' ' + n(top[1]) + 'V' + n(sh0[1]), 'q');
    lamps += path('M' + n(sh0[0] - r0) + ' ' + n(sh0[1]) + 'L' + n(sh1[0] - r1) + ' ' + n(sh1[1]) + 'Q' + n(sh1[0]) + ' ' + n(sh1[1] + 4) + ' ' + n(sh1[0] + r1) + ' ' + n(sh1[1]) + 'L' + n(sh0[0] + r0) + ' ' + n(sh0[1]) + 'Z', 'k', { fill: '#5d666b' });
    lamps += el('ellipse', { cx: n(sh1[0]), cy: n(sh1[1] + 1.5), rx: n(r1 * 0.8), ry: 3.8, 'class': 'hl-bulb' });
    var p0 = pr(lx, OB, 3.36), pw0 = 0.38 * F / 3.36;
    cones += path('M' + n(sh1[0] - r1 * 0.85) + ' ' + n(sh1[1] + 2) + 'L' + n(p0[0] - pw0) + ' ' + n(p0[1]) + 'L' + n(p0[0] + pw0) + ' ' + n(p0[1]) + 'L' + n(sh1[0] + r1 * 0.85) + ' ' + n(sh1[1] + 2) + 'Z', 'hl-cone', { fill: 'url(#g-heat)' });
    var pc = pr(lx, OB, 3.6);
    pools += el('ellipse', { cx: n(pc[0]), cy: n(pc[1]), rx: n(0.42 * F / 3.6), ry: 15, fill: 'url(#g-pool)' });
  });
  gm += '<g class="hl-light">' + cones + pools + '</g>';
  // the plate (placed every frame), drawn about its centre at z 3.6
  var PLX = -0.35, PLZ = 3.6, pls = F / PLZ, plc = pr(PLX, OB + 0.005, PLZ);
  var plate = '';
  plate += el('ellipse', { cx: n(plc[0]), cy: n(plc[1] + 2.5), rx: n(0.165 * pls), ry: 7, fill: 'url(#g-shadow)', opacity: '.85' });
  plate += el('ellipse', { cx: n(plc[0]), cy: n(plc[1]), rx: n(0.14 * pls), ry: 6, 'class': 'k', fill: '#fcfcf9' });
  plate += el('ellipse', { cx: n(plc[0]), cy: n(plc[1] - 0.6), rx: n(0.095 * pls), ry: 3.6, 'class': 'd', fill: '#f1f0ea' });
  var m0 = [plc[0] - 0.07 * pls, plc[1] - 0.5], m1 = [plc[0] + 0.07 * pls, plc[1] - 0.5];
  plate += path('M' + n(m0[0]) + ' ' + n(m0[1]) + 'C' + n(m0[0] + 4) + ' ' + n(m0[1] - 15) + ' ' + n(m1[0] - 7) + ' ' + n(m1[1] - 17) + ' ' + n(m1[0]) + ' ' + n(m1[1]) + 'Z', 'k', { fill: '#b47248', 'fill-opacity': '.92' });
  plate += path('M' + n(plc[0] - 7) + ' ' + n(plc[1] - 11) + 'q3 -6 8 -3M' + n(plc[0] + 2) + ' ' + n(plc[1] - 13) + 'q2 -5 7 -2', 'q', { stroke: '#5b7a52' });
  gm += '<g class="plate">' + plate + '</g>';
  gm += '<g class="hl-lamps">' + lamps + '</g>';

  /* ---- the counter and the POS (fore) ---- */
  var CY = -0.55, CZ0 = 1.25, CZ1 = 1.95;
  gf += path(P3([[-9, CY, CZ0], [9, CY, CZ0], [9, CY, CZ1], [-9, CY, CZ1]]), 'f', { fill: 'url(#g-ctop)' });
  gf += path(L3([-9, CY, CZ1], [9, CY, CZ1]), 'q');
  gf += path(P3([[-9, CY, CZ0], [9, CY, CZ0], [9, -0.61, CZ0], [-9, -0.61, CZ0]]), 'k', { fill: '#c4a67b' });
  gf += path(P3([[-9, -0.61, CZ0 + 0.03], [9, -0.61, CZ0 + 0.03], [9, FL, CZ0 + 0.03], [-9, FL, CZ0 + 0.03]]), 'q', { fill: 'url(#g-cfront)' });
  // oak: the grain runs away from us, to the vanishing point
  var grain = '', gr = window.TooeyDraw ? window.TooeyDraw.rng(39) : Math.random;
  for (var gx = -3.2; gx < 3.2; gx += 0.07 + gr() * 0.09) {
    var z0g = CZ0 + gr() * 0.25, z1g = CZ1 - gr() * 0.2;
    grain += L3([gx, CY, z0g], [gx + (gr() - 0.5) * 0.02, CY, z1g]);
  }
  gf += path(grain, 'x');
  gf += path(L3([-1.3, CY, CZ0], [-1.3, CY, CZ1]) + L3([1.15, CY, CZ0], [1.15, CY, CZ1]), 'd');
  var pnl = '';
  [-1.3, -0.5, 0.3, 1.15].forEach(function (x) { pnl += L3([x, -0.65, CZ0 + 0.03], [x, FL, CZ0 + 0.03]); });
  gf += path(pnl, 'x');

  // the POS: a tablet on a stand, facing us, and a ticket printer
  var TX0 = 0.02, TX1 = 0.4, TZ = 1.62, TM = (TX0 + TX1) / 2;
  var tb = pr(TM, CY, TZ + 0.06);
  gf += el('ellipse', { 'class': 'pos-glow', cx: n(tb[0]), cy: n(tb[1] + 6), rx: 170, ry: 34, fill: 'url(#g-warm)' });
  gf += el('ellipse', { cx: n(tb[0] + 8), cy: n(tb[1] + 3), rx: 78, ry: 11, fill: 'url(#g-shadow)', 'class': 'mul' });
  gf += path(closed(ringY(TM, CY + 0.006, TZ + 0.06, 0.075, 24)), 'k', { fill: '#454c51' });
  gf += path(P3([[TM - 0.016, CY, TZ + 0.06], [TM + 0.016, CY, TZ + 0.06], [TM + 0.016, -0.36, TZ + 0.08], [TM - 0.016, -0.36, TZ + 0.08]]), 'k', { fill: '#596065' });
  var sb = -0.44, st = -0.2, zb = TZ, zt = TZ + 0.07, m = 0.013;
  gf += path(P3([[TX0, st, zt], [TX1, st, zt], [TX1, sb, zb], [TX0, sb, zb]]), 'k', { fill: '#50585d' });
  var scr = P3([[TX0 + m, st - m, zt], [TX1 - m, st - m, zt], [TX1 - m, sb + m, zb], [TX0 + m, sb + m, zb]]);
  gf += path(scr, 'pos-off');
  function sp(u, v) { // a point on the screen: u across, v down, 0..1
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
  gf += '<g class="pos-on">' + ui + '</g>';
  gf += path(scr, 'k', { 'stroke-opacity': '.4' });
  // the printer, and the ticket it prints (set every frame)
  var PX0 = 0.47, PX1 = 0.64, PZ0 = 1.55, PZ1 = 1.78, PY = -0.455;
  var ptr = pr((PX0 + PX1) / 2, CY, (PZ0 + PZ1) / 2);
  gf += el('ellipse', { cx: n(ptr[0] + 8), cy: n(ptr[1] + 5), rx: 58, ry: 12, fill: 'url(#g-shadow)', 'class': 'mul' });
  gf += path(P3([[PX0, PY, PZ0], [PX1, PY, PZ0], [PX1, PY, PZ1], [PX0, PY, PZ1]]), 'k', { fill: '#e2dfd8' });
  gf += path(P3([[PX0, PY, PZ0], [PX1, PY, PZ0], [PX1, CY, PZ0], [PX0, CY, PZ0]]), 'k', { fill: '#c6c2ba' });
  gf += path(P3([[PX0, PY, PZ0], [PX0, PY, PZ1], [PX0, CY, PZ1], [PX0, CY, PZ0]]), 'q', { fill: '#d3d0c9' });
  // the paper slot, and the lid's seam
  gf += path(P3([[PX0 + 0.025, PY, PZ0 + 0.045], [PX1 - 0.025, PY, PZ0 + 0.045], [PX1 - 0.025, PY, PZ0 + 0.065], [PX0 + 0.025, PY, PZ0 + 0.065]]), 'q', { fill: '#3e464b' });
  gf += path(L3([PX0 + 0.012, PY, PZ0 + 0.13], [PX1 - 0.012, PY, PZ0 + 0.13]), 'd');
  var led = pr(PX1 - 0.03, PY - 0.035, PZ0);
  gf += el('circle', { cx: n(led[0]), cy: n(led[1]), r: 2.2, 'class': 'pr-led' });
  gf += '<g class="ticket">' + el('path', { 'class': 'q tk-paper', fill: 'url(#g-paper)' }) + el('path', { 'class': 'd tk-lines' }) + '</g>';

  /* ---- the thread ---- */
  var NODES = [
    { p: [TM, -0.185, TZ + 0.075], layer: 'f' },          // POS: the top of the tablet
    { p: [FX0 + 0.012, 0.3, FZ - 0.01], layer: 'b' },     // fridge: on its frame, by the door
    { p: [-0.42, HY - 0.012, HZ - 0.01], layer: 'b' },     // chef: on the hood, over his pan
    { p: [PLX, OB - 0.012, 3.19], layer: 'm' }            // pass: the shelf's edge, under a lamp
  ];
  // legs: from node a to node b, between two times (s)
  var LEGS = [[0, 1, 1.35, 3.05], [1, 2, 4.4, 5.5], [2, 3, 6.4, 7.4], [3, 0, 8.95, 10]];
  var ZS = 3.62; // nearer than this, the thread is in front of the pass
  var tb2 = '', tf2 = '';
  LEGS.forEach(function (lg, i) {
    tb2 += '<path class="th-glow" data-e="' + i + '" data-s="b"/><path class="th-core" data-e="' + i + '" data-s="b"/>';
    tf2 += '<path class="th-glow" data-e="' + i + '" data-s="f"/><path class="th-core" data-e="' + i + '" data-s="f"/>';
  });
  NODES.forEach(function (nd, i) {
    var s = '<circle class="nd-glow" data-n="' + i + '" r="9"/><circle class="nd" data-n="' + i + '" r="3"/>';
    if (nd.p[2] > ZS) tb2 += s; else tf2 += s;
  });
  function pulseSvg(sd) {
    var s = '<g class="pulse" data-s="' + sd + '">';
    for (var i = 0; i < 9; i++) s += '<circle class="pu-tail" r="0"/>';
    return s + '<circle class="pu-glow" r="0"/><circle class="pu-head" r="0"/></g>';
  }
  tb2 += pulseSvg('b');
  tf2 += pulseSvg('f');

  /* ---- assemble ---- */
  art.innerHTML = '<svg class="pass-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
    '<defs>' + defs + '</defs>' +
    '<rect width="' + W + '" height="' + H + '" style="fill:' + C.porcelain + '"/>' +
    '<g class="pl pl-b">' + gb + '</g>' +
    '<rect class="haze" x="-20" y="-20" width="' + (W + 40) + '" height="' + (H + 40) + '" style="fill:url(#g-haze)"/>' +
    '<g class="thread th-b">' + tb2 + '</g>' +
    '<g class="pl pl-m">' + gm + '</g>' +
    '<g class="pl pl-f">' + gf + '</g>' +
    '<g class="thread th-f">' + tf2 + '</g>' +
    '</svg>';

  /* ---------- the moving parts ---------- */
  var S = art.querySelector('svg');
  function q(s) { return S.querySelector(s); }
  function qa(s) { return [].slice.call(S.querySelectorAll(s)); }
  var R = {
    b: q('.pl-b'), m: q('.pl-m'), f: q('.pl-f'),
    door: q('.fr-door'), handle: q('.fr-handle'), seam: q('.fr-seam'), lit: q('.fr-lit'), spill: q('.fr-spill'),
    lbls: qa('.lbl'), ex: q('.tub-ex'),
    arm: q('.ck-arm'), pan: q('.ck-pan'), body: q('.ck-body'), flare: q('.ck-flare'), flames: q('.ck-flames'),
    stmPot: qa('.stm-pot'), stmPan: qa('.stm-pan'),
    plate: q('.plate'), hlight: q('.hl-light'), bulbs: qa('.hl-bulb'),
    posOn: q('.pos-on'), posGlow: q('.pos-glow'), led: q('.pr-led'), ticket: q('.ticket'), tkPaper: q('.tk-paper'), tkLines: q('.tk-lines'),
    seg: { b: { g: qa('.th-b .th-glow'), c: qa('.th-b .th-core') }, f: { g: qa('.th-f .th-glow'), c: qa('.th-f .th-core') } },
    nds: [], ndg: [],
    pulse: { b: q('.pulse[data-s="b"]'), f: q('.pulse[data-s="f"]') }
  };
  NODES.forEach(function (nd, i) { R.nds[i] = q('.nd[data-n="' + i + '"]'); R.ndg[i] = q('.nd-glow[data-n="' + i + '"]'); });
  ['b', 'f'].forEach(function (sd) {
    var g = R.pulse[sd];
    R.pulse[sd] = { g: g, tails: [].slice.call(g.querySelectorAll('.pu-tail')), head: g.querySelector('.pu-head'), glow: g.querySelector('.pu-glow') };
  });

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sm(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function eio(x) { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  // 0 before a, up to 1 by b, held to c, down to 0 by d
  function env(t, a, b, c, d) { return t <= a || t >= d ? 0 : t < b ? sm((t - a) / (b - a)) : t <= c ? 1 : 1 - sm((t - c) / (d - c)); }
  // the same, wrapping round the loop, for things that run past 10 s
  function wenv(t, a, b, c, d) { return Math.max(env(t, a, b, c, d), env(t + T, a, b, c, d), env(t - T, a, b, c, d)); }

  // the camera breathes: each plane slides by an amount that falls off with depth
  var ZREF = { f: 1.65, m: 3.45, b: 5.0 }, BR = 11;
  function offs(t) {
    var a = t / T * Math.PI * 2, sx = Math.sin(a), sy = Math.cos(a) * 0.4, o = {};
    for (var k in ZREF) o[k] = [BR / ZREF[k] * sx, BR / ZREF[k] * sy];
    return o;
  }
  // a point on leg i at 3D parameter u: on screen, with its planes' offsets
  function onLeg(i, u, o) {
    var lg = LEGS[i], A = NODES[lg[0]], B = NODES[lg[1]];
    var x = A.p[0] + (B.p[0] - A.p[0]) * u, y = A.p[1] + (B.p[1] - A.p[1]) * u, z = A.p[2] + (B.p[2] - A.p[2]) * u;
    var s = pr(x, y, z);
    var sa = (u / B.p[2]) / ((1 - u) / A.p[2] + u / B.p[2]); // perspective-correct blend
    var oa = o[A.layer], ob = o[B.layer];
    return { x: s[0] + oa[0] + (ob[0] - oa[0]) * sa, y: s[1] + oa[1] + (ob[1] - oa[1]) * sa, z: z };
  }
  function uAtZ(i, z) { var lg = LEGS[i], a = NODES[lg[0]].p[2], b = NODES[lg[1]].p[2]; return (z - a) / (b - a); }
  function pulseAt(t) {
    for (var i = 0; i < LEGS.length; i++) {
      var lg = LEGS[i];
      if (t >= lg[2] && t <= lg[3]) return { i: i, u: eio((t - lg[2]) / (lg[3] - lg[2])) };
    }
    return null;
  }
  function attr(e, a) { for (var k in a) e.setAttribute(k, a[k]); }
  function rib(a, b, k) {
    var dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    var wa = KW / a.z * k, wb = KW / b.z * k;
    return 'M' + n(a.x + nx * wa) + ' ' + n(a.y + ny * wa) + 'L' + n(b.x + nx * wb) + ' ' + n(b.y + ny * wb) +
      'L' + n(b.x - nx * wb) + ' ' + n(b.y - ny * wb) + 'L' + n(a.x - nx * wa) + ' ' + n(a.y - ny * wa) + 'Z';
  }

  var KW = 4.4; // the thread's width at 1 m
  var ARRIVE = [LEGS[3][3], LEGS[0][3], LEGS[1][3], LEGS[2][3]];
  function render(t, still) {
    var o = offs(still ? 0 : t);
    ['b', 'm', 'f'].forEach(function (k) { R[k].setAttribute('transform', 'translate(' + o[k][0].toFixed(2) + ' ' + o[k][1].toFixed(2) + ')'); });

    /* the thread: each leg a ribbon that thins as it goes back, cut at the pass */
    LEGS.forEach(function (lg, i) {
      var h = still ? 0.7 : wenv(t, lg[2] - 0.05, lg[2] + 0.25, lg[3] + 0.15, lg[3] + 1.9);
      var za = NODES[lg[0]].p[2], zb = NODES[lg[1]].p[2];
      var us = (za - ZS) * (zb - ZS) < 0 ? uAtZ(i, ZS) : null;
      var A = onLeg(i, 0, o), B = onLeg(i, 1, o), M = us == null ? null : onLeg(i, us, o);
      var parts = { b: null, f: null };
      if (M) { if (za > ZS) { parts.b = [A, M]; parts.f = [M, B]; } else { parts.f = [A, M]; parts.b = [M, B]; } }
      else parts[za > ZS ? 'b' : 'f'] = [A, B];
      ['b', 'f'].forEach(function (sd) {
        var core = R.seg[sd].c[i], glow = R.seg[sd].g[i], pp = parts[sd];
        if (!pp) { core.setAttribute('d', 'M0 0'); glow.setAttribute('d', 'M0 0'); return; }
        attr(core, { d: rib(pp[0], pp[1], 0.5), 'fill-opacity': (0.62 + 0.38 * h).toFixed(3) });
        attr(glow, { d: rib(pp[0], pp[1], 3.4), 'fill-opacity': (0.22 + 0.55 * h).toFixed(3) });
      });
    });
    // the nodes flash as the pulse arrives
    NODES.forEach(function (nd, k) {
      var s = pr(nd.p[0], nd.p[1], nd.p[2]), oo = o[nd.layer], at = ARRIVE[k] % T;
      var fl = still ? 0.7 : wenv(t, at - 0.12, at, at + 0.5, at + 1.7);
      var r = 3.3 * 1.65 / nd.p[2] + 1.3;
      attr(R.nds[k], { cx: n(s[0] + oo[0]), cy: n(s[1] + oo[1]), r: n(r) });
      attr(R.ndg[k], { cx: n(s[0] + oo[0]), cy: n(s[1] + oo[1]), r: n(r * (2.2 + 2 * fl)), 'fill-opacity': (0.28 + 0.62 * fl).toFixed(3) });
    });
    // the pulse, with a short tail; each part shows on its own side of the pass
    var pa = still ? null : pulseAt(t);
    ['b', 'f'].forEach(function (sd) {
      var P = R.pulse[sd];
      if (!pa) { P.g.style.opacity = '0'; return; }
      P.g.style.opacity = '1';
      var hp = onLeg(pa.i, pa.u, o), z = 1.65 / hp.z, mine = (hp.z > ZS) === (sd === 'b');
      attr(P.head, { cx: n(hp.x), cy: n(hp.y), r: mine ? n(1.8 + 3.2 * z) : 0 });
      attr(P.glow, { cx: n(hp.x), cy: n(hp.y), r: mine ? n(7 + 12 * z) : 0 });
      P.tails.forEach(function (cEl, j) {
        var tp = pulseAt(t - (j + 1) * 0.024);
        if (!tp) { cEl.setAttribute('r', 0); return; }
        var p = onLeg(tp.i, tp.u, o), zz = 1.65 / p.z;
        if ((p.z > ZS) !== (sd === 'b')) { cEl.setAttribute('r', 0); return; }
        attr(cEl, { cx: n(p.x), cy: n(p.y), r: n((1.6 + 2.6 * zz) * (1 - j / 11)), 'fill-opacity': (0.8 * (1 - j / 9)).toFixed(3) });
      });
    });

    /* POS: the screen lights, a ticket prints, and lifts away as the pulse leaves */
    var pos = still ? 1 : wenv(t, -0.05, 0.15, 1.6, 2.8);
    R.posOn.style.opacity = (0.22 + 0.78 * pos).toFixed(3);
    R.posGlow.style.opacity = (0.15 + 0.6 * pos).toFixed(3);
    R.led.style.opacity = (0.2 + 0.8 * (still ? 1 : env(t, 0.05, 0.15, 1.2, 1.5))).toFixed(3);
    var tk = still ? 1 : sm((t - 0.25) / 0.95), gone = still ? 0 : sm((t - 1.35) / 0.6);
    var tH = 0.16 * tk;
    if (tH < 0.003 || gone >= 1) R.ticket.style.opacity = '0';
    else {
      R.ticket.style.opacity = (1 - gone).toFixed(3);
      var x0 = 0.51, x1 = 0.6, yb = PY + 0.06 * gone, zb2 = PZ0 + 0.055, curl = tH * 0.4;
      R.tkPaper.setAttribute('d', P3([[x0, yb, zb2], [x1, yb, zb2], [x1, yb + tH, zb2 + curl], [x0, yb + tH, zb2 + curl]]));
      var ls = '';
      for (var li = 1; li <= 6; li++) {
        var yy = li * 0.021;
        if (yy > tH - 0.012) break;
        var zz2 = zb2 + curl * (1 - yy / tH);
        ls += L3([x0 + 0.014, yb + tH - yy, zz2], [x1 - 0.014 - (li % 3) * 0.015, yb + tH - yy, zz2]);
      }
      R.tkLines.setAttribute('d', ls || 'M0 0');
    }

    /* the fridge: the seam glows, the door swings open, the counts are pencilled in */
    var seam = still ? 0 : env(t, 2.8, 3.05, 3.15, 3.45);
    var open = still ? 0.95 : eio(clamp((t - 3.1) / 0.75, 0, 1)) * (1 - eio(clamp((t - 5.5) / 0.85, 0, 1)));
    var th = open * 1.5, hx = IX1 + 0.02, hz = FZ, dw = IX1 - IX0 + 0.04;
    var fx = hx - dw * Math.cos(th), fz = hz - dw * Math.sin(th);
    R.door.setAttribute('d', P3([[hx, IT + 0.03, hz], [fx, IT + 0.03, fz], [fx, FL, fz], [hx, FL, hz]]));
    var hdx = hx - (dw - 0.06) * Math.cos(th), hdz = hz - (dw - 0.06) * Math.sin(th) - 0.035 * Math.cos(th);
    R.handle.setAttribute('d', L3([hdx, 0.32, hdz], [hdx, -0.42, hdz]));
    R.seam.style.opacity = seam.toFixed(3);
    var lit = still ? 1 : env(t, 3.05, 3.45, 5.55, 6.3);
    R.lit.style.opacity = lit.toFixed(3);
    R.spill.style.opacity = (0.85 * lit).toFixed(3);
    R.lbls.forEach(function (g, i) {
      g.style.opacity = (still ? 1 : env(t, 3.5 + i * 0.16, 3.8 + i * 0.16, 5.45, 5.85)).toFixed(3);
    });
    R.ex.style.opacity = (still ? 1 : env(t, 3.65, 4.05, 5.45, 5.85)).toFixed(3);

    /* the chef: two tosses of the pan, a flare, steam */
    var ck = t - 5.5, toss = 0;
    if (!still && ck > 0 && ck < 1.5) {
      if (ck < 0.62) toss = Math.sin(ck / 0.62 * Math.PI);
      else if (ck > 0.75 && ck < 1.35) toss = 0.75 * Math.sin((ck - 0.75) / 0.6 * Math.PI);
    }
    var sway = still ? 0 : Math.sin(t / T * Math.PI * 4) * 0.9;
    R.body.setAttribute('transform', 'translate(' + n(sway + toss * 1.5) + ' 0)');
    R.arm.setAttribute('transform', 'rotate(' + n(-toss * 8) + ' ' + n(shoulder[0]) + ' ' + n(shoulder[1]) + ')');
    R.pan.setAttribute('transform', 'translate(' + n(toss * 2 + sway) + ' ' + n(-toss * 10) + ') rotate(' + n(toss * 7) + ' ' + n(pb[0]) + ' ' + n(pb[1]) + ')');
    var flare = still ? 0.55 : clamp(env(t, 5.57, 5.75, 5.9, 6.7) + 0.6 * env(t, 6.3, 6.4, 6.5, 7.0), 0, 1);
    R.flare.style.opacity = flare.toFixed(3);
    R.flare.setAttribute('transform', 'translate(' + n(pb[0]) + ' ' + n(pb[1]) + ') scale(' + (0.65 + 0.55 * flare).toFixed(3) + ') translate(' + n(-pb[0]) + ' ' + n(-pb[1]) + ')');
    R.flames.style.opacity = (0.2 + 0.8 * flare).toFixed(3);
    R.flames.setAttribute('transform', 'translate(0 ' + n(-toss * 2) + ')');
    R.stmPan.forEach(function (p, i) {
      var s0 = 5.7 + i * 0.22, k = clamp((t - s0) / 2.3, 0, 1);
      var a = still ? 0.5 : env(t, s0, s0 + 0.4, s0 + 1.0, s0 + 2.3);
      p.setAttribute('transform', 'translate(0 ' + n(still ? -8 : -k * 44) + ')');
      p.style.opacity = (0.62 * a).toFixed(3);
    });
    R.stmPot.forEach(function (p, i) {
      var k = (t / T * 3 + i * 0.5) % 1;
      p.setAttribute('transform', 'translate(0 ' + n(-k * 30) + ')');
      p.style.opacity = (0.34 * Math.sin(k * Math.PI)).toFixed(3);
    });

    /* the plate slides onto the pass; the lamps warm it; then it is taken */
    var pin = still ? 1 : eio(clamp((t - 6.7) / 0.75, 0, 1));
    var pout = still ? 0 : eio(clamp((t - 8.5) / 0.8, 0, 1));
    var pv = pin > 0.001 && pout < 0.999;
    R.plate.style.opacity = pv ? (sm(pin * 2.5) * (1 - pout)).toFixed(3) : '0';
    if (pv) {
      var pz = 3.98 - (3.98 - 3.5) * pin, pc = pr(PLX + 0.7 * pout, OB + 0.005, pz), k2 = PLZ / pz;
      R.plate.setAttribute('transform', 'translate(' + n(pc[0]) + ' ' + n(pc[1]) + ') scale(' + k2.toFixed(3) + ') translate(' + n(-plc[0]) + ' ' + n(-plc[1]) + ')');
    }
    var heat = still ? 1 : 0.5 + 0.5 * env(t, 7.1, 7.45, 8.5, 9.2);
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
