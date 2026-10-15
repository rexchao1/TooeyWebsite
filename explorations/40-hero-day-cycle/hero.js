/* Tooey, exploration 40: one day at the restaurant.
   The hero is the room from 39 (the dining room, the pass, the kitchen) built
   as a real 3D set: every wall, table and tub is placed in metres and projected
   through a moving camera on every frame (near-plane clipped), so the planes
   slide past each other by depth as the camera dollies, pans and pulls back.
   Small things (the chef, guests, the till's receipt, labels) are cards: drawn
   once in centimetres and placed by the same camera.

   The loop is one day, 13 s, a pure function of t, so it has no seam:
   close at night (the till prints the night's sales), overnight (the receipt
   drifts back through the pass to the fridge as night turns to morning, the
   camera following it in), morning (the fridge opens on the prep counts), and
   service (a short rib goes to the chef, the pan flares, the dish goes out
   under the heat lamps to a full, lamplit room as the camera pulls back), then
   the lights dim to night again. The light is three tonal washes on the
   palette: basalt night, porcelain morning, lamplight service.

   The headline and the line under it come on like a VHS tape locking in (39).
   The real words stay in the HTML; the animated copies are aria-hidden.
   Under reduced motion: no loop, no camera move, no glitch; one still frame.
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
  var T = 13;
  var NS = 'http://www.w3.org/2000/svg';

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sm(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function smr(x) { x = clamp(x, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); }
  function sine(x) { x = clamp(x, 0, 1); return 0.5 - 0.5 * Math.cos(Math.PI * x); }
  function eio(x) { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  // 0 before a, up to 1 by b, held to c, down to 0 by d
  function env(t, a, b, c, d) { return t <= a || t >= d ? 0 : t < b ? sm((t - a) / (b - a)) : t <= c ? 1 : 1 - sm((t - c) / (d - c)); }
  function wenv(t, a, b, c, d) { return Math.max(env(t, a, b, c, d), env(t + T, a, b, c, d), env(t - T, a, b, c, d)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function n(v) { return Math.round(v * 10) / 10; }
  function bez(P, u) {
    var v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
    return [0, 1, 2].map(function (i) { return a * P[0][i] + b * P[1][i] + c * P[2][i] + d * P[3][i]; });
  }
  function mix3(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }

  /* ---------- the camera ---------- */
  var VW = 1440, VH = 816, PPX = 900, PPY = 380, F = 816, NEAR = 0.12;
  var cam = { x: 0, y: 0, z: -3, yaw: 0, pitch: 0 }, cY = 1, sY = 0, cP = 1, sP = 0;
  function setCam(c) { cam = c; cY = Math.cos(c.yaw); sY = Math.sin(c.yaw); cP = Math.cos(c.pitch); sP = Math.sin(c.pitch); }
  function toCam(p) {
    var dx = p[0] - cam.x, dy = p[1] - cam.y, dz = p[2] - cam.z;
    var x = dx * cY - dz * sY, z1 = dx * sY + dz * cY;
    return [x, dy * cP - z1 * sP, dy * sP + z1 * cP];
  }
  function scr(c) { return [PPX + F * c[0] / c[2], PPY - F * c[1] / c[2]]; }
  function cut(a, b) { var k = (NEAR - a[2]) / (b[2] - a[2]); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, NEAR]; }
  function clipPoly(cs) {
    var out = [], m = cs.length;
    for (var i = 0; i < m; i++) {
      var a = cs[i], b = cs[(i + 1) % m], ia = a[2] >= NEAR, ib = b[2] >= NEAR;
      if (ia) out.push(a);
      if (ia !== ib) out.push(cut(a, b));
    }
    return out;
  }

  /* ---------- the set: shapes re-projected every frame, and cards ---------- */
  var SH = [], CARDS = [];
  var SWB = { k: 1.3, q: 0.9, d: 0.7, x: 0.5 };
  var PAINT = { fill: 1, 'fill-opacity': 1, stroke: 1, 'stroke-opacity': 1, opacity: 1, 'fill-rule': 1 };
  function mk(tag, a, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) if (a[k] != null) {
      if (PAINT[k]) e.style.setProperty(k, a[k]);
      else e.setAttribute(k, a[k]);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  function shape(g, rings, cls, st, closed) {
    if (typeof rings[0][0] === 'number') rings = [rings];
    var a = { 'class': cls }; for (var k in st || {}) a[k] = st[k];
    var s = { e: mk('path', a, g), r: rings, closed: closed, w: SWB[cls.split(' ')[0]] || 0 };
    SH.push(s);
    return s;
  }
  function poly(g, rings, cls, st) { return shape(g, rings, cls, st, true); }
  function lines(g, segs, cls, st) { return shape(g, segs, cls, st, false); }
  function drawShape(s) {
    var d = '', zs = 0, zc = 0;
    for (var i = 0; i < s.r.length; i++) {
      var ring = s.r[i], cs = [], j;
      for (j = 0; j < ring.length; j++) cs.push(toCam(ring[j]));
      if (s.closed) {
        cs = clipPoly(cs);
        if (cs.length < 3) continue;
        for (j = 0; j < cs.length; j++) { var p = scr(cs[j]); d += (j ? 'L' : 'M') + n(p[0]) + ' ' + n(p[1]); zs += cs[j][2]; zc++; }
        d += 'Z';
      } else {
        var pen = false;
        for (j = 0; j < cs.length - 1; j++) {
          var a = cs[j], b = cs[j + 1];
          if (a[2] < NEAR && b[2] < NEAR) { pen = false; continue; }
          var a2 = a[2] < NEAR ? cut(a, b) : a, b2 = b[2] < NEAR ? cut(a, b) : b;
          if (a[2] < NEAR) pen = false;
          var pa = scr(a2), pb = scr(b2);
          if (!pen) d += 'M' + n(pa[0]) + ' ' + n(pa[1]);
          d += 'L' + n(pb[0]) + ' ' + n(pb[1]);
          pen = b[2] >= NEAR;
          zs += a2[2] + b2[2]; zc += 2;
        }
      }
    }
    s.e.setAttribute('d', d || 'M0 0');
    if (s.w && zc) s.e.style.strokeWidth = (s.w * clamp(Math.sqrt(2.6 / (zs / zc)), 0.5, 1.5)).toFixed(2);
  }
  // a card: drawn in centimetres (y down) about a point in the world, facing us
  function card(g, p, inner, cls, k) {
    var e = mk('g', { 'class': 'card' + (cls ? ' ' + cls : '') }, g);
    e.innerHTML = inner;
    var c = { e: e, p: p, k: k || 1, rot: 0, sx: 1, sy: 1, on: 1 };
    CARDS.push(c);
    return c;
  }
  function drawCard(c) {
    if (c.on <= 0.002) { c.e.style.display = 'none'; return; }
    var cc = toCam(c.p);
    if (cc[2] < 0.3) { c.e.style.display = 'none'; return; }
    c.e.style.display = '';
    var s = F / cc[2] / 100 * c.k, o = scr(cc);
    var t = 'translate(' + n(o[0]) + ' ' + n(o[1]) + ') scale(' + s.toFixed(4) + ')';
    if (c.rot) t += ' rotate(' + c.rot.toFixed(2) + ')';
    if (c.sx !== 1 || c.sy !== 1) t += ' scale(' + c.sx.toFixed(3) + ' ' + c.sy.toFixed(3) + ')';
    c.e.setAttribute('transform', t);
    var sw = clamp(Math.sqrt(2.6 / cc[2]), 0.5, 1.5).toFixed(2);
    if (c.sw !== sw) { c.sw = sw; c.e.style.setProperty('--sw', sw); }
    c.e.style.opacity = c.on >= 0.999 ? '' : c.on.toFixed(3);
  }

  /* ---------- paint ---------- */
  var defs = '';
  function stops(list) {
    return list.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('');
  }
  function lin(id, x1, y1, x2, y2, list, us) {
    defs += '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (us ? ' gradientUnits="userSpaceOnUse"' : '') + '>' + stops(list) + '</linearGradient>';
  }
  function rad(id, list, extra) { defs += '<radialGradient id="' + id + '"' + (extra || '') + '>' + stops(list) + '</radialGradient>'; }
  var SL = '#232a2f', PO = '#f2f1ec';
  // the dining room: oak floor, plaster, a beamed ceiling
  lin('g-floor', 0, 0, 0, 1, [[0, '#d9c8a9'], [0.45, '#cdb894'], [1, '#bfa57f']], true);
  lin('g-dceil', 0, 0, 0, 1, [[0, '#cfc9be'], [1, '#dedad1']], true);
  lin('g-wall', 0, 0, 0, 1, [[0, '#d6d1c7'], [0.45, '#e2ded5'], [1, '#d9d4ca']]);
  lin('g-pfront', 0, 0, 0, 1, [[0, '#cfc9be'], [1, '#d7d2c8']]);
  // the kitchen, beyond: lighter and cooler
  lin('g-kwall', 0, 0, 0, 1, [[0, '#e6e5e1'], [0.5, '#f0efeb'], [1, '#e8e7e3']]);
  lin('g-kside', 0, 0, 1, 0, [[0, '#d9d6cf'], [1, '#e5e3de']]);
  lin('g-kside-r', 0, 0, 1, 0, [[0, '#e5e3de'], [1, '#d9d6cf']]);
  lin('g-kceil', 0, 0, 0, 1, [[0, '#d6d3cc'], [1, '#e0ded8']]);
  lin('g-steel', 0, 0, 1, 0, [[0, '#cfd3d4'], [0.45, '#eaeceb'], [1, '#cdd1d2']]);
  lin('g-shelf', 0, 0, 0, 1, [[0, '#d5d9d9'], [1, '#e9ebea']]);
  lin('g-fridge', 0, 0, 1, 0, [[0, '#e3e6e6'], [1, '#eef0f0']]);
  lin('g-door', 0, 0, 1, 0, [[0, '#f0f1f1'], [1, '#e1e4e4']]);
  lin('g-heat', 0, 0, 0, 1, [[0, '#f3ad55', 0.26], [0.55, '#f3b25f', 0.06], [1, '#f3b25f', 0]]);
  lin('g-jacket', 0, 0, 1, 0, [[0, '#f7f6f2'], [0.55, '#efeee9'], [1, '#d6d5cf']]);
  lin('g-paper', 0, 0, 0, 1, [[0, '#fffefb'], [1, '#f3f0e8']]);
  lin('g-ao', 0, 0, 0, 1, [[0, SL, 0.16], [1, SL, 0]]);
  lin('g-shaft', 0, 0, 0, 1, [[0, '#fffaf0', 0.62], [0.55, '#fdf6e8', 0.22], [1, '#fdf6e8', 0]]);
  lin('g-kshaft', 1, 0, 0, 1, [[0, '#fffaf0', 0.7], [0.6, '#fdf6e8', 0.22], [1, '#fdf6e8', 0]]);
  rad('g-fin', [[0, '#ffffff'], [0.55, '#f4f9f9'], [1, '#d3e2e3']], ' cx=".5" cy=".35" r=".8"');
  rad('g-pool', [[0, '#f2a64e', 0.5], [0.5, '#f4bd74', 0.22], [1, '#f6c27e', 0]]);
  rad('g-halo', [[0, '#fff0d4', 0.9], [0.22, '#f9d7a1', 0.45], [1, '#f3c27f', 0]]);
  rad('g-tpool', [[0, '#ffe6b8', 0.85], [0.55, '#f7d39a', 0.35], [1, '#f6cf93', 0]]);
  rad('g-flare', [[0, '#ffe2a8', 0.95], [0.3, '#f6aa50', 0.55], [1, '#f39a3c', 0]]);
  rad('g-cool', [[0, '#f3fafa', 0.8], [0.5, '#e4f1f2', 0.35], [1, '#e4f1f2', 0]]);
  rad('g-shadow', [[0, SL, 0.36], [1, SL, 0]]);
  rad('g-paperglow', [[0, '#fff4dc', 0.9], [0.5, '#fbe2b4', 0.35], [1, '#fbe2b4', 0]]);
  rad('g-vig', [[0, '#1d2126', 0], [0.45, '#1d2126', 0], [1, '#1d2126', 0.55]], ' cx=".62" cy=".45" r=".75"');

  /* ---------- the svg and its layers ---------- */
  var svg = mk('svg', { 'class': 'pass-svg', 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'none' });
  svg.innerHTML = '<defs>' + defs + '</defs>';
  art.appendChild(svg);
  mk('rect', { x: -10, y: -10, width: 4000, height: 3000, fill: PO }, svg);
  var gK = mk('g', { 'class': 'hs hs-k' }, svg);          // the kitchen and the pass's inner parts
  var washK = mk('path', { 'class': 'wash' }, svg);        // the kitchen's light and haze, seen through the opening
  var gKE = mk('g', { 'class': 'hs-e' }, svg);             // the kitchen's lights
  var gS = mk('g', { 'class': 'hs hs-s' }, svg);          // the dining room's shell and the pass wall
  var washD = mk('path', { 'class': 'wash', 'fill-rule': 'evenodd' }, svg);
  var gF = mk('g', { 'class': 'hs hs-f' }, svg);          // furniture, guests, the till (lit by colour)
  var gDE = mk('g', { 'class': 'hs-e' }, svg);             // the dining room's lights
  var lift = mk('rect', { x: -10, y: -10, width: 4000, height: 3000, fill: PO }, svg);
  var vig = mk('rect', { 'class': 'wash', x: 0, y: 0, width: 4000, height: 3000, fill: 'url(#g-vig)' }, svg);
  var gO = mk('g', { 'class': 'hs hs-o' }, svg);           // what travels: receipt, meat, dish

  /* ---------- the world, in metres: x right, y up (eye height 0), z away ---------- */
  var FL = -1.55, DC = 1.75, XL = -4.6, XR = 3.3, ZB = -8;
  var PZ = 3.4, PZ2 = 3.75, OX = 1.3, OT = 0.95, OB = -0.55;
  var K0 = 3.75, KZ = 6.4, KX = 1.75, KC = 1.25;
  var TY = -0.8;
  function ringY(cx, y, cz, r, k) {
    var out = []; k = k || 28;
    for (var i = 0; i < k; i++) { var a = i / k * Math.PI * 2; out.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]); }
    return out;
  }
  function drum(cx, y0, y1, cz, r) {
    var top = ringY(cx, y1, cz, r, 32), base = ringY(cx, y0, cz, r, 32);
    return [top[16]].concat(base.slice(16)).concat([base[0], top[0]]);
  }
  function seg(a, b) { return [a, b]; }
  var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(40);

  /* ---- the kitchen ---- */
  poly(gK, [[-KX, KC, K0], [KX, KC, K0], [KX, KC, KZ], [-KX, KC, KZ]], 'f', { fill: 'url(#g-kceil)' });
  poly(gK, [[-KX, KC, K0], [-KX, KC, KZ], [-KX, FL, KZ], [-KX, FL, K0]], 'f', { fill: 'url(#g-kside)' });
  poly(gK, [[KX, KC, K0], [KX, KC, KZ], [KX, FL, KZ], [KX, FL, K0]], 'f', { fill: 'url(#g-kside-r)' });
  poly(gK, [[-KX, KC, KZ], [KX, KC, KZ], [KX, FL, KZ], [-KX, FL, KZ]], 'f', { fill: 'url(#g-kwall)' });
  poly(gK, [[-KX, KC, KZ], [KX, KC, KZ], [KX, KC - 0.25, KZ], [-KX, KC - 0.25, KZ]], 'f', { fill: 'url(#g-ao)' });
  lines(gK, [seg([-KX, KC, K0], [-KX, KC, KZ]), seg([KX, KC, K0], [KX, KC, KZ]), seg([-KX, FL, KZ], [-KX, KC, KZ]), seg([KX, FL, KZ], [KX, KC, KZ]), seg([-KX, KC, KZ], [KX, KC, KZ])], 'k');
  // the strip light
  poly(gK, [[-0.3, KC, 4.5], [0.3, KC, 4.5], [0.3, KC, 6.0], [-0.3, KC, 6.0]], 'q', { fill: '#f6f5f1' });
  lines(gK, [seg([-0.2, KC, 4.6], [-0.2, KC, 5.9]), seg([0.2, KC, 4.6], [0.2, KC, 5.9]), seg([-KX, KC, 4.8], [KX, KC, 4.8]), seg([-KX, KC, 5.6], [KX, KC, 5.6])], 'd');
  // tiles behind the range
  var tl = [], row = 0, ty, tx;
  for (ty = -0.95; ty <= 0.78; ty += 0.11) { tl.push(seg([-KX, ty, KZ], [-0.02, ty, KZ])); tl.push(seg([-KX, ty, 4.4], [-KX, ty, KZ])); }
  for (ty = -0.95; ty < 0.76; ty += 0.11, row++) for (tx = -KX + (row % 2 ? 0.11 : 0.22); tx < -0.02; tx += 0.22) tl.push(seg([tx, ty, KZ], [tx, ty + 0.11, KZ]));
  lines(gK, tl, 'x');
  // the window on the back wall: night, then morning, then dusk through it
  var WX0 = 0.1, WX1 = 0.78, WY0 = -0.02, WY1 = 0.98;
  poly(gK, [[WX0 - 0.05, WY0 - 0.05, KZ], [WX1 + 0.05, WY0 - 0.05, KZ], [WX1 + 0.05, WY1 + 0.05, KZ], [WX0 - 0.05, WY1 + 0.05, KZ]], 'q', { fill: '#dcd8cf' });
  var winGlass = poly(gK, [[WX0, WY0, KZ], [WX1, WY0, KZ], [WX1, WY1, KZ], [WX0, WY1, KZ]], 'k', { fill: 'var(--win)' });
  lines(gK, [seg([(WX0 + WX1) / 2, WY0, KZ], [(WX0 + WX1) / 2, WY1, KZ]), seg([WX0, 0.5, KZ], [WX1, 0.5, KZ])], 'q');
  poly(gK, [[WX0 - 0.08, WY0 - 0.05, KZ], [WX1 + 0.08, WY0 - 0.05, KZ], [WX1 + 0.08, WY0 - 0.05, KZ - 0.1], [WX0 - 0.08, WY0 - 0.05, KZ - 0.1]], 'q', { fill: '#e9e6df' });
  // a jar and a tub on the sill
  poly(gK, [[0.2, WY0 - 0.05, KZ - 0.05], [0.29, WY0 - 0.05, KZ - 0.05], [0.29, WY0 + 0.13, KZ - 0.05], [0.2, WY0 + 0.13, KZ - 0.05]], 'q', { fill: '#e4e0d7' });
  poly(gK, [[0.55, WY0 - 0.05, KZ - 0.05], [0.68, WY0 - 0.05, KZ - 0.05], [0.68, WY0 + 0.08, KZ - 0.05], [0.55, WY0 + 0.08, KZ - 0.05]], 'q', { fill: '#eeece6' });

  // the hood
  var HX0 = -KX + 0.02, HX1 = -0.12, HZ = 5.62, HY = 0.8;
  poly(gK, [[HX0, HY, HZ], [HX1, HY, HZ], [HX1, HY, KZ], [HX0, HY, KZ]], 'f', { fill: '#c3c7c8' });
  poly(gK, [[HX1, HY, HZ], [HX1, HY + 0.2, HZ], [HX1, KC, 6.05], [HX1, KC, KZ], [HX1, HY, KZ]], 'q', { fill: '#d3d7d7' });
  poly(gK, [[HX0, HY + 0.2, HZ], [HX1, HY + 0.2, HZ], [HX1, KC, 6.05], [HX0, KC, 6.05]], 'q', { fill: '#e2e5e5' });
  poly(gK, [[HX0, HY, HZ], [HX1, HY, HZ], [HX1, HY + 0.2, HZ], [HX0, HY + 0.2, HZ]], 'k', { fill: 'url(#g-steel)' });
  lines(gK, [seg([HX0 + 0.05, HY + 0.05, HZ], [HX1 - 0.05, HY + 0.05, HZ])], 'd');
  // the range
  var RX0 = -KX + 0.05, RX1 = -0.18, RZ = 5.78, RY = -0.6;
  poly(gK, [[RX0, RY, RZ], [RX1, RY, RZ], [RX1, RY, KZ], [RX0, RY, KZ]], 'k', { fill: 'url(#g-steel)' });
  poly(gK, [[RX0, RY, RZ], [RX1, RY, RZ], [RX1, RY - 0.25, RZ], [RX0, RY - 0.25, RZ]], 'q', { fill: '#d1d5d6' });
  poly(gK, [[RX1, RY, RZ], [RX1, RY, KZ], [RX1, RY - 0.4, KZ], [RX1, RY - 0.4, RZ]], 'q', { fill: '#c9cdce' });
  poly(gK, [ringY(-1.3, RY, 6.15, 0.13), ringY(-0.45, RY, 6.12, 0.13)], 'd');
  [-1.5, -1.25, -1.0, -0.75, -0.5].forEach(function (x) { poly(gK, ringY(x, RY - 0.08, RZ - 0.001, 0.02, 8).map(function (p) { return [p[0], RY - 0.08 + (p[2] - RZ), RZ - 0.001]; }), 'q'); });
  // the stock pot
  var POT = [-1.28, 6.16, 0.16];
  poly(gK, drum(POT[0], RY, RY + 0.28, POT[1], POT[2]), 'q', { fill: '#dde0e0' });
  poly(gK, ringY(POT[0], RY + 0.28, POT[1], POT[2]), 'q', { fill: '#c5c9ca' });
  function steamCard(g, p, k, len) {
    var out = '';
    for (var i = 0; i < k; i++) {
      var x = (i - (k - 1) / 2) * 5, s = '';
      for (var j = 0; j <= 14; j++) { var tt = j / 14; s += (j ? 'L' : 'M') + n(x + Math.sin(tt * Math.PI * 2.2 + i * 1.7) * 2.6) + ' ' + n(-tt * len); }
      out += '<path class="stm" d="' + s + '"/>';
    }
    return card(g, p, out, 'steam');
  }
  var stPot = steamCard(gK, [POT[0], RY + 0.3, POT[1]], 2, 26);

  // the chef: back to us, at the range. Simple forms, no face. Drawn in cm.
  function cn(x, y) { return n(x * 100) + ' ' + n(-y * 100); }
  function cp(list) { return list.map(function (q, i) { return (i ? 'L' : 'M') + cn(q[0], q[1]); }).join(''); }
  function cq(a, b, e) { return 'M' + cn(a[0], a[1]) + 'Q' + cn(b[0], b[1]) + ' ' + cn(e[0], e[1]); }
  function P(d, cls, st) { return '<path class="' + cls + '" d="' + d + '"' + (st ? ' style="' + st + '"' : '') + '/>'; }
  var chef = '';
  chef += '<ellipse cx="2" cy="80" rx="32" ry="7" style="fill:url(#g-shadow);opacity:.55"/>';
  chef += P(cp([[-0.19, -0.06], [-0.28, -0.14], [-0.31, -0.36], [-0.26, -0.47], [-0.19, -0.41]]) + 'Z', 'k', 'fill:#e6e5e0');
  chef += P('M' + cn(-0.06, 0.012) + 'C' + cn(-0.14, 0.0) + ' ' + cn(-0.22, -0.03) + ' ' + cn(-0.225, -0.13) + 'L' + cn(-0.205, -0.5) + 'L' + cn(-0.2, -0.95) + 'L' + cn(0.2, -0.95) + 'L' + cn(0.205, -0.5) + 'L' + cn(0.225, -0.13) + 'C' + cn(0.22, -0.03) + ' ' + cn(0.14, 0.0) + ' ' + cn(0.06, 0.012) + 'Z', 'k', 'fill:url(#g-jacket)');
  chef += P(cp([[0, -0.02], [0, -0.48]]) + cp([[-0.13, -0.005], [-0.12, -0.16]]) + cp([[0.13, -0.005], [0.12, -0.16]]), 'd');
  chef += P(cp([[-0.205, -0.5], [0.205, -0.5], [0.205, -0.545], [-0.205, -0.545]]) + 'Z', 'q', 'fill:#4a5257;fill-opacity:.8');
  chef += P(cq([0, -0.52], [-0.09, -0.44], [-0.08, -0.57]) + 'Z' + cq([0, -0.52], [0.09, -0.44], [0.08, -0.57]) + 'Z', 'q', 'fill:#555d62;fill-opacity:.78');
  chef += P(cq([-0.01, -0.53], [-0.04, -0.62], [-0.06, -0.74]) + cq([0.01, -0.53], [0.03, -0.63], [0.05, -0.75]), 'apr');
  chef += P(cp([[-0.045, -0.01], [-0.042, 0.05], [0.042, 0.05], [0.045, -0.01]]) + 'Z', 'q', 'fill:#dcc5ab');
  chef += '<ellipse class="q" cx="-8.3" cy="-10" rx="1.6" ry="2.6" style="fill:#d8bfa3"/><ellipse class="q" cx="8.3" cy="-10" rx="1.6" ry="2.6" style="fill:#d8bfa3"/>';
  chef += '<ellipse class="q" cx="0" cy="-11.8" rx="7.8" ry="8.8" style="fill:#857a70"/>';
  chef += P(cq([-0.055, 0.05], [0, 0.025], [0.055, 0.05]) + cq([-0.03, 0.17], [-0.045, 0.1], [-0.035, 0.05]) + cq([0.0, 0.18], [-0.005, 0.11], [0.0, 0.045]) + cq([0.03, 0.17], [0.045, 0.1], [0.035, 0.05]), 'q');
  chef += P('M' + cn(-0.07, 0.0) + 'Q' + cn(0, 0.035) + ' ' + cn(0.07, 0.0) + 'L' + cn(0.06, -0.025) + 'Q' + cn(0, 0.0) + ' ' + cn(-0.06, -0.025) + 'Z', 'q', 'fill:#f4f3ee');
  chef += P('M' + cn(-0.082, 0.15) + 'L' + cn(-0.086, 0.215) + 'C' + cn(-0.15, 0.24) + ' ' + cn(-0.14, 0.37) + ' ' + cn(-0.07, 0.36) + 'C' + cn(-0.05, 0.42) + ' ' + cn(0.06, 0.43) + ' ' + cn(0.07, 0.36) + 'C' + cn(0.14, 0.37) + ' ' + cn(0.15, 0.24) + ' ' + cn(0.086, 0.215) + 'L' + cn(0.082, 0.15) + 'Z', 'k', 'fill:#fcfcf9');
  chef += P(cp([[-0.086, 0.21], [0.086, 0.21]]) + cp([[-0.03, 0.225], [-0.04, 0.35]]) + cp([[0.03, 0.225], [0.035, 0.36]]), 'd');
  chef += '<g class="ck-arm">' + P(cp([[0.19, -0.05], [0.25, -0.1], [0.31, -0.27], [0.33, -0.4], [0.27, -0.44], [0.23, -0.33], [0.19, -0.2]]) + 'Z', 'k', 'fill:#ecebe6') + P(cp([[0.27, -0.41], [0.33, -0.41]]), 'd') + '</g>';
  var PB = [-0.42, RY + 0.05, 6.0], CH = [-0.86, 0, 5.45];
  // the pan, its flames, under the chef's right hand
  var pan = '<g class="ck-flames">';
  [-8, -3, 2, 7].forEach(function (dx, i) { var h = 8 + (i % 2) * 5; pan += P('M' + (dx - 2.8) + ' 7Q' + dx + ' ' + (7 - h) + ' ' + (dx + 2.8) + ' 7', 'flm'); });
  pan += '</g><g class="ck-pan">' + P('M-15 0Q-15 6.5 0 7Q15 6.5 15 0Z', 'k', 'fill:#4a5156;fill-opacity:.9') +
    '<ellipse class="k" rx="15" ry="3.6" style="fill:#5d6469"/><ellipse class="d" rx="11" ry="2.5" cy=".2" style="fill:#dcae73"/>' +
    P('M-14 1L-30 4', 'pan-h') + '</g>';
  var cPan = card(gK, PB, pan);
  var cChef = card(gK, CH, chef);
  var stPan = steamCard(gK, [PB[0] + 0.02, PB[1] + 0.06, PB[2]], 3, 34);

  /* ---- the fridge (kitchen right) ---- */
  var FX0 = 0.72, FX1 = 1.52, FZ = 4.3, FT = 0.7, FD = 0.65;
  poly(gK, ringY((FX0 + FX1) / 2, FL, FZ + 0.32, 0.55, 20), 'f', { fill: 'url(#g-shadow)', opacity: '.5' });
  poly(gK, [[FX0, FT, FZ], [FX0, FT, FZ + FD], [FX0, FL, FZ + FD], [FX0, FL, FZ]], 'k', { fill: '#d4d8d8' });
  poly(gK, [[FX0, FT, FZ], [FX1, FT, FZ], [FX1, FL, FZ], [FX0, FL, FZ]], 'k', { fill: 'url(#g-fridge)' });
  var IX0 = FX0 + 0.04, IX1 = FX1 - 0.04, IT = FT - 0.05, IZ = FZ + 0.01, IB = FZ + FD - 0.06;
  var gIn = mk('g', { 'class': 'fr-in' }, gK);
  poly(gIn, [[IX0, IT, IB], [IX1, IT, IB], [IX1, FL, IB], [IX0, FL, IB]], 'q', { fill: 'url(#g-fin)' });
  var frLit = card(gIn, [(IX0 + IX1) / 2, 0.0, IB - 0.01], '<ellipse rx="36" ry="80" style="fill:url(#g-cool)"/>', 'glow');
  poly(gIn, [[IX1, IT, IZ], [IX1, IT, IB], [IX1, FL, IB], [IX1, FL, IZ]], 'q', { fill: '#d9e4e5' });
  poly(gIn, [[IX0, IT, IZ], [IX1, IT, IZ], [IX1, IT, IB], [IX0, IT, IB]], 'q', { fill: '#cddadb' });
  var SHV = [0.2, -0.27];
  SHV.forEach(function (sy) {
    poly(gIn, [[IX0, sy, IZ], [IX1, sy, IZ], [IX1, sy, IB], [IX0, sy, IB]], 'q', { fill: '#e6eded', 'fill-opacity': '.92' });
    poly(gIn, [[IX0, sy, IZ], [IX1, sy, IZ], [IX1, sy - 0.022, IZ], [IX0, sy - 0.022, IZ]], 'k', { fill: '#d2dbdb' });
  });
  var tw = (IX1 - IX0 - 0.06) / 2, TH = 0.22;
  var TUBS = [
    { x: IX0 + 0.02, y: SHV[0], name: 'Short rib', c: '27' },
    { x: IX0 + 0.04 + tw, y: SHV[0], name: 'Risotto', c: '33' },
    { x: IX0 + 0.02, y: SHV[1], name: 'Burrata', c: '19' },
    { x: IX0 + 0.04 + tw, y: SHV[1], name: 'Focaccia', c: '12' }
  ];
  var TZ0 = IZ + 0.05;
  TUBS.forEach(function (b) {
    var z1 = TZ0 + 0.32, y1 = b.y + TH, w = tw;
    poly(gIn, [[b.x, y1, TZ0], [b.x + w, y1, TZ0], [b.x + w, y1, z1], [b.x, y1, z1]], 'q', { fill: '#f2f1eb' });
    poly(gIn, [[b.x, b.y, TZ0], [b.x + w, b.y, TZ0], [b.x + w, y1, TZ0], [b.x, y1, TZ0]], 'q', { fill: '#f7f6f1', 'fill-opacity': '.96' });
    lines(gIn, [seg([b.x, y1 - 0.022, TZ0], [b.x + w, y1 - 0.022, TZ0])], 'd');
  });
  // the lid of the short rib tub, so a piece can be lifted out
  var LBLS = TUBS.map(function (b) {
    var w = (tw - 0.04) * 100, h = 12.5;
    return card(gIn, [b.x + 0.02, b.y + TH - 0.04, TZ0 - 0.002],
      '<rect class="tape" width="' + n(w) + '" height="' + h + '" rx=".4"/>' +
      '<text class="tub-n" x="1.6" y="4.9">' + b.name + '</text>' +
      '<text class="tub-c" x="' + n(w - 1.6) + '" y="11.2" text-anchor="end">' + b.c + '</text>');
  });
  var EXL = card(gIn, [IX0 + 0.3, IT - 0.035, IB - 0.02], '<text class="tub-ex" x="0" y="0">Example</text>');
  var gDoor = mk('g', {}, gK);
  var door = poly(gDoor, [[0, 0, 5], [0, 0, 5], [0, 0, 5]], 'k', { fill: 'url(#g-door)' });
  var handle = lines(gDoor, [seg([0, 0, 5], [0, 0, 5])], 'fr-handle');
  handle.w = 0;

  /* ---- the pass, kitchen side: reveals, rail, shelf, heat lamps ---- */
  poly(gK, [[-OX, OT, PZ], [-OX, OT, PZ2], [-OX, OB, PZ2], [-OX, OB, PZ]], 'q', { fill: '#c9c3b9' });
  poly(gK, [[OX, OT, PZ], [OX, OT, PZ2], [OX, OB, PZ2], [OX, OB, PZ]], 'q', { fill: '#d0cbc1' });
  poly(gK, [[-OX, OT, PZ], [OX, OT, PZ], [OX, OT, PZ2], [-OX, OT, PZ2]], 'q', { fill: '#bfb9ae' });
  lines(gK, [seg([-OX, OT, PZ2], [OX, OT, PZ2]), seg([-OX, OT, PZ2], [-OX, OB, PZ2]), seg([OX, OT, PZ2], [OX, OB, PZ2])], 'q');
  poly(gK, [[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX, OB, 4.0], [-OX, OB, 4.0]], 'q', { fill: 'url(#g-shelf)' });
  poly(gK, [[-OX + 0.08, OT - 0.02, 3.42], [OX - 0.08, OT - 0.02, 3.42], [OX - 0.08, OT - 0.06, 3.42], [-OX + 0.08, OT - 0.06, 3.42]], 'k', { fill: '#d0d4d5' });
  [[-1.02, 2], [-0.88, -3], [0.55, 1], [0.95, -2], [1.08, 3]].forEach(function (tk) {
    card(gK, [tk[0], OT - 0.05, 3.41], '<g transform="rotate(' + tk[1] + ')"><rect class="q" x="-3.7" width="7.4" height="12" style="fill:#f8f7f2"/>' +
      P('M-2.6 2.6h5.2M-2.6 4.6h3.6M-2.6 6.6h4.4', 'd') + '</g>');
  });
  var LZ = 3.58, LX = [-1.0, -0.35, 0.3];
  var gHC = mk('g', { 'class': 'hl-light' }, gKE);
  var bulbs = [];
  LX.forEach(function (lx) {
    lines(gK, [seg([lx, OT, LZ], [lx, 0.58, LZ])], 'q');
    poly(gK, [[lx - 0.035, 0.58, LZ], [lx + 0.035, 0.58, LZ], [lx + 0.1, 0.46, LZ], [lx - 0.1, 0.46, LZ]], 'k', { fill: '#a3aaae' });
    poly(gHC, [[lx - 0.085, 0.46, LZ], [lx + 0.085, 0.46, LZ], [lx + 0.38, OB, 3.36], [lx - 0.38, OB, 3.36]], 'f', { fill: 'url(#g-heat)' });
    poly(gHC, ringY(lx, OB + 0.002, 3.66, 0.3, 24), 'f', { fill: 'url(#g-pool)', opacity: '.5' });
    bulbs.push(card(gKE, [lx, 0.455, LZ], '<ellipse rx="16" ry="6" style="fill:url(#g-halo)"/><ellipse class="hl-bulb" rx="7.5" ry="1.5"/>'));
  });

  /* ---- the kitchen's lights ---- */
  // morning through the window: a soft shaft down toward the fridge and the pass
  var KSD = [-0.15, -1, -1.35];
  function shaftQuads(g, top, dir, fill) {
    var bot = top.map(function (p) { var k = (p[1] - FL) / -dir[1]; return [p[0] + dir[0] * k, FL, p[2] + dir[2] * k]; });
    var out = [];
    for (var i = 0; i < 4; i++) {
      var j = (i + 1) % 4;
      out.push(poly(g, [top[i], top[j], bot[j], bot[i]], 'f', { fill: fill }));
    }
    out.push(poly(g, bot, 'f', { fill: fill }));
    return out;
  }
  var gKS = mk('g', { 'class': 'shaft' }, gKE);
  shaftQuads(gKS, [[WX0, WY0, KZ - 0.01], [WX1, WY0, KZ - 0.01], [WX1, WY1, KZ - 0.01], [WX0, WY1, KZ - 0.01]], KSD, 'url(#g-kshaft)');
  var strip = card(gKE, [0, KC - 0.02, 5.25], '<ellipse rx="60" ry="22" style="fill:url(#g-cool)"/>', 'glow');
  var seam = poly(gKE, [[IX0, IT, FZ], [IX1, IT, FZ], [IX1, FL, FZ], [IX0, FL, FZ]], 'fr-seam');
  var frSpill = poly(gKE, ringY((FX0 + FX1) / 2 - 0.25, FL + 0.01, FZ - 0.45, 0.8, 24), 'f', { fill: 'url(#g-cool)' });
  frSpill.e.setAttribute('class', 'f glow');
  var flare = card(gKE, [PB[0], PB[1] + 0.12, PB[2]], '<ellipse cy="-8" rx="46" ry="42" style="fill:url(#g-flare)"/>', 'flare');
  var flareCore = card(gKE, [PB[0], PB[1] + 0.12, PB[2]], '<ellipse cy="-4" rx="20" ry="16" style="fill:url(#g-halo)"/>', 'glow');

  /* ---- the dining room: the shell ---- */
  var floor = poly(gS, [[XL, FL, ZB], [XR, FL, ZB], [XR, FL, PZ], [XL, FL, PZ]], 'f', { fill: 'url(#g-floor)' });
  var bd = [];
  for (var bx = XL + 0.08; bx < XR; bx += 0.17) bd.push(seg([bx, FL, ZB], [bx, FL, PZ]));
  for (var bz = -2; bz < PZ; bz += 0.62) for (bx = XL + 0.08 + (Math.round(bz * 10) % 3) * 0.17; bx < XR - 0.17; bx += 0.17 * 3) bd.push(seg([bx, FL, bz + rnd() * 0.3], [bx + 0.17, FL, bz + rnd() * 0.3]));
  lines(gS, bd, 'x');
  var ceil = poly(gS, [[XL, DC, ZB], [XR, DC, ZB], [XR, DC, PZ], [XL, DC, PZ]], 'f', { fill: 'url(#g-dceil)' });
  // the skylight: night, morning, dusk
  var SKX0 = -1.3, SKX1 = 1.1, SKZ0 = 1.0, SKZ1 = 2.25, SKH = 0.32;
  poly(gS, [[SKX0, DC, SKZ1], [SKX1, DC, SKZ1], [SKX1, DC + SKH, SKZ1], [SKX0, DC + SKH, SKZ1]], 'q', { fill: '#cbc5ba' });
  poly(gS, [[SKX0, DC, SKZ0], [SKX0, DC, SKZ1], [SKX0, DC + SKH, SKZ1], [SKX0, DC + SKH, SKZ0]], 'q', { fill: '#d8d3c9' });
  poly(gS, [[SKX1, DC, SKZ0], [SKX1, DC, SKZ1], [SKX1, DC + SKH, SKZ1], [SKX1, DC + SKH, SKZ0]], 'q', { fill: '#d3cdc2' });
  var skyGlass = poly(gS, [[SKX0, DC + SKH, SKZ0], [SKX1, DC + SKH, SKZ0], [SKX1, DC + SKH, SKZ1], [SKX0, DC + SKH, SKZ1]], 'q', { fill: 'var(--sky)' });
  var sk = [];
  for (var sxx = SKX0 + 0.4; sxx < SKX1 - 0.1; sxx += 0.4) sk.push(seg([sxx, DC + SKH, SKZ0], [sxx, DC + SKH, SKZ1]));
  sk.push(seg([SKX0, DC + SKH, (SKZ0 + SKZ1) / 2], [SKX1, DC + SKH, (SKZ0 + SKZ1) / 2]));
  lines(gS, sk, 'q');
  lines(gS, [[[SKX0, DC, SKZ0], [SKX1, DC, SKZ0], [SKX1, DC, SKZ1], [SKX0, DC, SKZ1], [SKX0, DC, SKZ0]]], 'k');
  // beams across the ceiling
  [-1.6, -0.1, 2.6].forEach(function (z) {
    poly(gS, [[XL, DC - 0.16, z], [XR, DC - 0.16, z], [XR, DC - 0.16, z + 0.18], [XL, DC - 0.16, z + 0.18]], 'q', { fill: '#c6bfb3' });
    poly(gS, [[XL, DC, z], [XR, DC, z], [XR, DC - 0.16, z], [XL, DC - 0.16, z]], 'q', { fill: '#d3cdc3' });
  });
  // the side walls
  poly(gS, [[XL, DC, ZB], [XL, DC, PZ], [XL, FL, PZ], [XL, FL, ZB]], 'q', { fill: '#d4cfc5' });
  poly(gS, [[XR, DC, ZB], [XR, DC, PZ], [XR, FL, PZ], [XR, FL, ZB]], 'q', { fill: '#d0cbc1' });
  lines(gS, [seg([XL, -0.5, ZB], [XL, -0.5, PZ]), seg([XR, -0.5, ZB], [XR, -0.5, PZ])], 'd');
  // the pass wall, with the opening cut out
  poly(gS, [[[XL, DC, PZ], [XR, DC, PZ], [XR, FL, PZ], [XL, FL, PZ]], [[-OX, OT, PZ], [-OX, OB, PZ], [OX, OB, PZ], [OX, OT, PZ]]], 'f', { fill: 'url(#g-wall)', 'fill-rule': 'evenodd' });
  lines(gS, [seg([XL, DC - 0.07, PZ], [XR, DC - 0.07, PZ]), seg([XL, FL + 0.12, PZ], [XR, FL + 0.12, PZ])], 'd');
  lines(gS, [[[-OX, OT, PZ], [-OX, OB, PZ], [OX, OB, PZ], [OX, OT, PZ], [-OX, OT, PZ]]], 'k');
  // the pass counter, dining side, and the shelf's front edge
  poly(gS, [[-OX - 0.1, OB - 0.035, 3.2], [OX + 0.1, OB - 0.035, 3.2], [OX + 0.1, FL, 3.2], [-OX - 0.1, FL, 3.2]], 'q', { fill: 'url(#g-pfront)' });
  var sl = [];
  for (var sx = -OX + 0.15; sx < OX; sx += 0.18) sl.push(seg([sx, OB - 0.07, 3.2], [sx, FL, 3.2]));
  lines(gS, sl, 'x');
  poly(gS, [[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX + 0.1, OB, 3.4], [-OX - 0.1, OB, 3.4]], 'q', { fill: 'url(#g-shelf)' });
  poly(gS, [[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX + 0.1, OB - 0.035, 3.2], [-OX - 0.1, OB - 0.035, 3.2]], 'k', { fill: '#c3c7c8' });

  /* ---- the dining room: tables, chairs, guests, pendants, the till ---- */
  // colours here are set every frame from the light (css variables on gF)
  function chairDown(g, x, z, side) {
    var sy = FL + 0.46, x0 = x - 0.2, x1 = x + 0.2, z0 = z - 0.2, z1 = z + 0.2, bx = side < 0 ? x0 : x1;
    var legs = [];
    [[x0 + 0.03, z0 + 0.03], [x1 - 0.03, z0 + 0.03], [x0 + 0.03, z1 - 0.03], [x1 - 0.03, z1 - 0.03]].forEach(function (q) { legs.push(seg([q[0], sy, q[1]], [q[0], FL, q[1]])); });
    lines(g, legs, 'q', { stroke: 'var(--chair2)', 'stroke-opacity': '1' });
    poly(g, [[bx, sy, z0 + 0.02], [bx, sy + 0.46, z0 + 0.04], [bx, sy + 0.46, z1 - 0.04], [bx, sy, z1 - 0.02]], 'q', { fill: 'var(--chair)' });
    poly(g, [[bx, sy + 0.2, z0 + 0.05], [bx, sy + 0.4, z0 + 0.05], [bx, sy + 0.4, z1 - 0.05], [bx, sy + 0.2, z1 - 0.05]], 'f', { fill: 'var(--chair2)', opacity: '.5' });
    poly(g, [[x0, sy, z0], [x1, sy, z0], [x1, sy, z1], [x0, sy, z1]], 'k', { fill: 'var(--chair)' });
    poly(g, [[x0, sy, z0], [x1, sy, z0], [x1, sy - 0.04, z0], [x0, sy - 0.04, z0]], 'q', { fill: 'var(--chair2)' });
  }
  function chairUp(g, x, z, side) {
    // upside down on the table: seat on the top, legs up, the back hanging over the edge
    var sy = TY + 0.03, x0 = x - 0.18, x1 = x + 0.18, z0 = z - 0.18, z1 = z + 0.18, bx = side < 0 ? x0 : x1;
    poly(g, [[bx, sy, z0 + 0.02], [bx, sy - 0.42, z0 + 0.04], [bx, sy - 0.42, z1 - 0.04], [bx, sy, z1 - 0.02]], 'q', { fill: 'var(--chair)' });
    poly(g, [[x0, sy, z0], [x1, sy, z0], [x1, sy + 0.04, z0], [x0, sy + 0.04, z0]], 'k', { fill: 'var(--chair2)' });
    var legs = [];
    [[x0 + 0.03, z0 + 0.03], [x1 - 0.03, z0 + 0.03], [x0 + 0.03, z1 - 0.03], [x1 - 0.03, z1 - 0.03]].forEach(function (q) { legs.push(seg([q[0], sy + 0.04, q[1]], [q[0], sy + 0.46, q[1]])); });
    lines(g, legs, 'k', { stroke: 'var(--chair2)', 'stroke-opacity': '1' });
    lines(g, [[[x0 + 0.03, sy + 0.3, z0 + 0.03], [x1 - 0.03, sy + 0.3, z0 + 0.03]]], 'q');
  }
  function table(g, x, z) {
    poly(g, ringY(x, FL + 0.003, z, 0.26, 20), 'f', { fill: 'url(#g-shadow)', opacity: '.55' });
    poly(g, ringY(x, FL + 0.01, z, 0.2, 20), 'q', { fill: 'var(--wood3)' });
    poly(g, [[x - 0.03, TY - 0.03, z], [x + 0.03, TY - 0.03, z], [x + 0.03, FL + 0.02, z], [x - 0.03, FL + 0.02, z]], 'q', { fill: 'var(--wood3)' });
    poly(g, drum(x, TY - 0.035, TY, z, 0.4), 'k', { fill: 'var(--wood2)' });
    poly(g, ringY(x, TY, z, 0.4, 32), 'k', { fill: 'var(--wood)' });
  }
  // a guest, seated side-on and facing the table: simple forms, no face
  function guestSvg(body) {
    return P('M-12 0C-14 -16 -14 -36 -9 -48C-4 -53 6 -53 9 -46C12 -36 13 -18 11 0Z', 'k', 'fill:var(' + body + ')') +
      P('M-10 -4L26 -6L28 6L-8 8Z', 'q', 'fill:var(' + body + ');opacity:.85') +
      P('M2 -45C9 -40 10 -30 9 -24L28 -27L29 -21L5 -17C1 -24 -1 -36 2 -45Z', 'q', 'fill:var(' + body + ')') +
      P('M-2 -50L-1 -57L6 -57L6 -50Z', 'q', 'fill:var(--skin)') +
      '<circle class="q" cx="3" cy="-66" r="10" style="fill:var(--skin)"/>' +
      P('M-7 -64C-8 -74 0 -78 7 -76C11 -75 13 -72 12 -69C6 -71 0 -69 -2 -60C-5 -60 -7 -61 -7 -64Z', 'q', 'fill:var(--hair)');
  }
  function pendantSvg() {
    return P('M-15 0C-15 -10 -8 -16 0 -16C8 -16 15 -10 15 0Z', 'k', 'fill:var(--shade)') + P('M-17 0H17', 'k') +
      '<ellipse class="pd-bulb" cx="0" cy="1.2" rx="6" ry="2.4"/>';
  }
  var TABLES = [
    { x: 1.15, z: 2.45, lamp: 1 },   // by the pass: its lamp stays on at night
    { x: -1.15, z: 1.9 },
    { x: -2.45, z: 0.55 },
    { x: -0.1, z: 0.3 }
  ];
  var BODY = ['--g1', '--g2', '--g3', '--g4'];
  var gTpool = mk('g', { 'class': 'glow' }, gDE);
  var gHalo = mk('g', { 'class': 'glow' }, gDE);
  TABLES.forEach(function (tb, i) {
    var g = mk('g', {}, gF);
    tb.down = mk('g', {}, g);
    chairDown(tb.down, tb.x - 0.62, tb.z, -1);
    chairDown(tb.down, tb.x + 0.62, tb.z, 1);
    tb.guests = [
      card(tb.down, [tb.x - 0.6, FL + 0.46, tb.z], guestSvg(BODY[i % 4])),
      card(tb.down, [tb.x + 0.6, FL + 0.46, tb.z], '<g transform="scale(-1 1)">' + guestSvg(BODY[(i + 2) % 4]) + '</g>')
    ];
    table(g, tb.x, tb.z);
    tb.up = mk('g', {}, g);
    chairUp(tb.up, tb.x - 0.17, tb.z, -1);
    chairUp(tb.up, tb.x + 0.17, tb.z, 1);
    lines(g, [seg([tb.x, DC, tb.z], [tb.x, 0.62, tb.z])], 'q');
    tb.pend = card(g, [tb.x, 0.62, tb.z], pendantSvg());
    tb.halo = card(gHalo, [tb.x, 0.6, tb.z], '<ellipse rx="95" ry="80" style="fill:url(#g-halo)"/>');
    tb.pool = poly(gTpool, ringY(tb.x, TY + 0.002, tb.z, 0.62, 28), 'f', { fill: 'url(#g-tpool)' });
  });
  // the host stand and the till, dining-room right, nearest us
  var HS = { x0: 0.62, x1: 1.4, z0: -1.2, z1: -0.7, top: -0.42 };
  var gT = mk('g', {}, gF);
  poly(gT, ringY((HS.x0 + HS.x1) / 2, FL + 0.003, (HS.z0 + HS.z1) / 2, 0.6, 20), 'f', { fill: 'url(#g-shadow)', opacity: '.5' });
  poly(gT, [[HS.x0, HS.top, HS.z0], [HS.x0, HS.top, HS.z1], [HS.x0, FL, HS.z1], [HS.x0, FL, HS.z0]], 'k', { fill: 'var(--st3)' });
  poly(gT, [[HS.x0, HS.top, HS.z0], [HS.x1, HS.top, HS.z0], [HS.x1, FL, HS.z0], [HS.x0, FL, HS.z0]], 'k', { fill: 'var(--st2)' });
  var pn = [];
  for (var px = HS.x0 + 0.16; px < HS.x1; px += 0.16) pn.push(seg([px, HS.top - 0.06, HS.z0], [px, FL + 0.05, HS.z0]));
  lines(gT, pn, 'x');
  poly(gT, [[HS.x0 - 0.03, HS.top, HS.z0 - 0.03], [HS.x1 + 0.03, HS.top, HS.z0 - 0.03], [HS.x1 + 0.03, HS.top, HS.z1], [HS.x0 - 0.03, HS.top, HS.z1]], 'k', { fill: 'var(--st1)' });
  poly(gT, [[HS.x0 - 0.03, HS.top, HS.z0 - 0.03], [HS.x1 + 0.03, HS.top, HS.z0 - 0.03], [HS.x1 + 0.03, HS.top - 0.04, HS.z0 - 0.03], [HS.x0 - 0.03, HS.top - 0.04, HS.z0 - 0.03]], 'q', { fill: 'var(--st2)' });
  // the till: a screen on a stand, and its printer
  var TS = { x0: 0.7, x1: 1.04, zb: -1.0, zt: -0.94, yb: HS.top + 0.12, yt: HS.top + 0.36 };
  poly(gT, ringY((TS.x0 + TS.x1) / 2, HS.top + 0.004, -0.92, 0.07, 18), 'q', { fill: 'var(--till2)' });
  poly(gT, [[0.86, HS.top, -0.92], [0.88, HS.top, -0.92], [0.88, TS.yb + 0.04, -0.92], [0.86, TS.yb + 0.04, -0.92]], 'q', { fill: 'var(--till2)' });
  poly(gT, [[TS.x0, TS.yt, TS.zt], [TS.x1, TS.yt, TS.zt], [TS.x1, TS.yb, TS.zb], [TS.x0, TS.yb, TS.zb]], 'k', { fill: 'var(--till)' });
  var tm = 0.016;
  poly(gT, [[TS.x0 + tm, TS.yt - tm, TS.zt - 0.001], [TS.x1 - tm, TS.yt - tm, TS.zt - 0.001], [TS.x1 - tm, TS.yb + tm, TS.zb - 0.001], [TS.x0 + tm, TS.yb + tm, TS.zb - 0.001]], 'q', { fill: 'var(--scr)' });
  lines(gT, [0.3, 0.45, 0.6].map(function (v, i) {
    var y = lerp(TS.yt - tm, TS.yb + tm, v), z = lerp(TS.zt, TS.zb, v) - 0.002;
    return seg([TS.x0 + 0.04, y, z], [TS.x0 + 0.18 - i * 0.03, y, z]);
  }), 'd');
  var PR = { x0: 1.1, x1: 1.32, z0: -1.08, z1: -0.82, y: HS.top + 0.13 };
  poly(gT, [[PR.x0, PR.y, PR.z0], [PR.x0, PR.y, PR.z1], [PR.x0, HS.top, PR.z1], [PR.x0, HS.top, PR.z0]], 'q', { fill: 'var(--till2)' });
  poly(gT, [[PR.x0, PR.y, PR.z0], [PR.x1, PR.y, PR.z0], [PR.x1, HS.top, PR.z0], [PR.x0, HS.top, PR.z0]], 'k', { fill: 'var(--till)' });
  poly(gT, [[PR.x0, PR.y, PR.z0], [PR.x1, PR.y, PR.z0], [PR.x1, PR.y, PR.z1], [PR.x0, PR.y, PR.z1]], 'k', { fill: 'var(--st1)' });
  poly(gT, [[PR.x0 + 0.03, PR.y + 0.001, PR.z0 + 0.06], [PR.x1 - 0.03, PR.y + 0.001, PR.z0 + 0.06], [PR.x1 - 0.03, PR.y + 0.001, PR.z0 + 0.085], [PR.x0 + 0.03, PR.y + 0.001, PR.z0 + 0.085]], 'q', { fill: '#5b6368' });
  var SLOT = [(PR.x0 + PR.x1) / 2, PR.y + 0.002, PR.z0 + 0.07];
  var led = card(gT, [PR.x1 - 0.03, PR.y - 0.03, PR.z0 - 0.002], '<circle r=".9" class="pr-led"/>');
  var tillGlow = card(gDE, [(TS.x0 + TS.x1) / 2, (TS.yt + TS.yb) / 2, -1.05], '<ellipse rx="46" ry="34" style="fill:url(#g-halo)"/>', 'glow');

  /* ---- the dining room's lights ---- */
  var gSS = mk('g', { 'class': 'shaft' }, gDE);
  shaftQuads(gSS, [[SKX0, DC + SKH, SKZ0], [SKX1, DC + SKH, SKZ0], [SKX1, DC + SKH, SKZ1], [SKX0, DC + SKH, SKZ1]], [-0.32, -1, -0.38], 'url(#g-shaft)');

  /* ---- what travels ---- */
  // the receipt: drawn about the printer's slot, growing upward as it prints
  var rc = P('M-7.5 0L7.5 0L7.5 -32' + (function () { var s = ''; for (var i = 0; i < 10; i++) s += 'L' + n(7.5 - (i + 0.5) * 1.5) + ' ' + (i % 2 ? -32 : -33.4); return s; })() + 'L-7.5 -32Z', 'k', 'fill:url(#g-paper)');
  rc += P('M-3 -28.5h6', 'rc-b');
  rc += P('M-5 -25.6h10', 'rc-l');
  rc += P('M-5.5 -22.6h11', 'rc-dash');
  [-19.6, -16.8, -14, -11.2, -8.4].forEach(function (y, i) { rc += P('M-5.5 ' + y + 'h' + [7, 5.5, 6.5, 4.5, 6][i] + 'M3 ' + y + 'h2.5', 'rc-l'); });
  rc += P('M-5.5 -5.4h11', 'rc-dash');
  rc += P('M-5.5 -2.6h5M2.2 -2.6h3.3', 'rc-b');
  var rHalo = card(gO, SLOT, '<ellipse cy="-17" rx="30" ry="34" style="fill:url(#g-paperglow)"/>', 'glow');
  var rShadow = card(gO, SLOT, '<ellipse cy="2" rx="9" ry="1.6" style="fill:url(#g-shadow)"/>');
  var receipt = card(gO, SLOT, '<g class="rc-in">' + rc + '</g>');
  var rIn = receipt.e.querySelector('.rc-in');
  // a short rib, lifted from its tub to the pan
  var meat = card(gO, [0, 0, 5], '<ellipse cx="0" cy="5.5" rx="6.5" ry="1.2" style="fill:url(#g-shadow)"/>' +
    P('M-6.5 -3.2C-4 -5.4 3.5 -5.4 6 -3.4C7.6 -1.6 7 1.8 5 3C2 4.4 -3.5 4.4 -6 2.8C-7.6 1.4 -7.8 -1.6 -6.5 -3.2Z', 'k', 'fill:#a8654a') +
    P('M-4.5 -2.6C-1.5 -3.8 2.5 -3.8 4.6 -2.4', 'mt-hi') + P('M-4 0.6C-1 1.4 2 1.4 4.4 0.4', 'mt-hi') +
    P('M6 -1.6C8 -2.4 9.6 -1.6 9.6 -0.2C9.6 1.2 8 1.8 6.2 1.1Z', 'q', 'fill:#efe6d6'), 'meat', 1.7);
  // the finished dish
  var dish = card(gO, [0, 0, 5], '<ellipse cx="0" cy="3.2" rx="17" ry="3.6" style="fill:url(#g-shadow)"/>' +
    '<ellipse class="k" rx="16" ry="5.2" style="fill:#fcfcf9"/><ellipse class="d" rx="11" ry="3.4" cy="-.3" style="fill:#f1efe8"/>' +
    P('M-5.5 -0.6C-5 -4.6 3.2 -5.6 5.6 -1.4C4 0.4 -3.5 0.6 -5.5 -0.6Z', 'k', 'fill:#9c5a3e') +
    P('M-3.6 -2.6C-1.4 -3.6 1.6 -3.8 3.6 -2.4', 'mt-hi') +
    P('M-7.6 0.4C-4 1.6 4 1.8 8 0.2', 'q', 'stroke:#8a5a3c;stroke-opacity:.6') +
    P('M-1.6 -4.6q1.6 -2.4 3.6 -1.2M0.8 -5q1.2 -2 3 -0.8', 'q', 'stroke:#5b7a52;stroke-opacity:.9'), 'dish', 1.5);
  var dHalo = card(gO, [0, 0, 5], '<ellipse cy="-2" rx="30" ry="18" style="fill:url(#g-halo)"/>', 'glow');

  /* ---------- the day ---------- */
  // three lights: basalt night, porcelain morning, lamplight service (weights sum to 1)
  function day(t) {
    var a = sm((t - 2.4) / 2.4), b = sm((t - 7.0) / 1.6), c = sm((t - 11.0) / 1.6);
    return { N: (1 - a) + c, D: a * (1 - b), S: b * (1 - c) };
  }
  // each light washes the drawing toward a colour by an amount: basalt at night,
  // a breath of cool grey in the morning, lamplight umber in service
  var LK = { N: ['#22262d', 0.63], D: ['#9a9c98', 0.05], S: ['#6b5235', 0.1] };
  var LD = { N: ['#20242a', 0.6], D: ['#8e908c', 0.11], S: ['#7c501d', 0.22] };
  function light(L, w) {
    var a = 0, c = [0, 0, 0];
    ['N', 'D', 'S'].forEach(function (r) {
      var h = hex(L[r][0]), k = w[r] * L[r][1];
      a += k; c[0] += h[0] * k; c[1] += h[1] * k; c[2] += h[2] * k;
    });
    return { a: a, c: a > 0 ? c.map(function (v) { return v / a; }) : [0, 0, 0] };
  }
  function litc(base, L) { var b = typeof base === 'string' ? hex(base) : base; return [0, 1, 2].map(function (i) { return lerp(b[i], L.c[i], L.a); }); }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgb(c) { return 'rgb(' + Math.round(clamp(c[0], 0, 255)) + ',' + Math.round(clamp(c[1], 0, 255)) + ',' + Math.round(clamp(c[2], 0, 255)) + ')'; }
  function sky(w) {
    var a = hex('#4f5963'), b = hex('#fbf5e6'), c = hex('#a7adb2');
    return rgb([0, 1, 2].map(function (i) { return w.N * a[i] + w.D * b[i] + w.S * c[i]; }));
  }
  var FURN = { '--wood': '#cdb48f', '--wood2': '#b59a76', '--wood3': '#8f7e6b', '--chair': '#ab8f70', '--chair2': '#8c7259',
    '--skin': '#d2bca6', '--hair': '#6e655d', '--g1': '#87929a', '--g2': '#b39a83', '--g3': '#9aa3a8', '--g4': '#a48b78',
    '--st1': '#e2dbcf', '--st2': '#d4cbbb', '--st3': '#c6bcaa', '--till': '#e6e3dc', '--till2': '#9aa1a5', '--shade': '#e9e3d6' };

  // the camera's path: wide on the dining room, in through the pass, over to the chef, back out
  var K0a = { x: 0.2, y: 0.14, z: -2.75, yaw: 0.035, pitch: -0.04 };
  var K0b = { x: 0.12, y: 0.1, z: -3.15, yaw: 0.02, pitch: -0.035 };
  var K1a = { x: 0.62, y: 0.12, z: 2.28, yaw: 0.13, pitch: -0.05 };
  var K1b = { x: 0.64, y: 0.11, z: 2.42, yaw: 0.14, pitch: -0.05 };
  var K2a = { x: 0.1, y: 0.12, z: 2.15, yaw: -0.1, pitch: -0.07 };
  var K2b = { x: 0.08, y: 0.12, z: 2.08, yaw: -0.11, pitch: -0.07 };
  function mixCam(A, B, k) { return { x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), z: lerp(A.z, B.z, k), yaw: lerp(A.yaw, B.yaw, k), pitch: lerp(A.pitch, B.pitch, k) }; }
  function camAt(t) {
    var c, u;
    // every move eases in and out, so the camera never jolts; the holds creep
    if (t < 2.0) return mixCam(K0b, K0a, sine((t + T - 11.8) / 3.2));
    if (t < 5.4) { u = sm((t - 2.0) / 3.4); c = mixCam(K0a, K1a, u); c.y += 0.2 * Math.sin(Math.PI * u); c.pitch -= 0.03 * Math.sin(Math.PI * u); return c; }
    if (t < 7.1) return mixCam(K1a, K1b, sine((t - 5.4) / 1.7));
    if (t < 8.4) return mixCam(K1b, K2a, sm((t - 7.1) / 1.3));
    if (t < 8.75) return mixCam(K2a, K2b, sine((t - 8.4) / 0.35));
    if (t < 11.8) { u = sm((t - 8.75) / 3.05); c = mixCam(K2b, K0b, u); c.y += 0.16 * Math.sin(Math.PI * u); c.pitch -= 0.03 * Math.sin(Math.PI * u); return c; }
    return mixCam(K0b, K0a, sine((t - 11.8) / 3.2));
  }

  // the receipt's flight: from the till, up, back through the pass, to the fridge
  var RP = [SLOT, [0.85, 0.3, 0.5], [0.5, 0.42, 2.9], [0.98, 0.2, 4.0]];
  var RIN = [1.08, 0.12, 4.55];
  // the short rib: from its tub, across the kitchen, to the pan
  var MP = [[TUBS[0].x + tw / 2, TUBS[0].y + TH + 0.04, TZ0 + 0.12], [0.75, 0.62, 4.6], [-0.05, 0.5, 5.7], [PB[0], PB[1] + 0.1, PB[2]]];
  // the dish: up off the pan, onto the pass, then out to the table in the middle of the room
  var DP1 = [[PB[0], PB[1] + 0.14, PB[2]], [-0.45, 0.3, 5.4], [-0.38, 0.0, 4.0], [-0.35, OB + 0.035, 3.62]];
  var TD = TABLES[3];
  var DP2 = [DP1[3], [-0.3, 0.05, 3.0], [-0.15, 0.2, 1.4], [TD.x, TY + 0.03, TD.z - 0.12]];

  // show an element at an opacity; off the paint list entirely at zero
  function vis(e, a) {
    var v = a < 0.003 ? 'none' : '';
    if (e.style.display !== v) e.style.display = v;
    if (v === '') e.style.opacity = a >= 0.997 ? '' : a.toFixed(3);
  }
  var VARS = {};
  function setVar(e, k, v) { var key = k + (e === svg ? 's' : 'f'); if (VARS[key] !== v) { VARS[key] = v; e.style.setProperty(k, v); } }
  function render(t, still, pose) {
    var w = still ? { N: 0, D: 0.2, S: 0.8 } : day(t);
    setCam(pose || camAt(t));
    for (var i = 0; i < SH.length; i++) if (!SH[i].dyn) drawShape(SH[i]);

    /* the light */
    var lk = light(LK, w), ld = light(LD, w);

    washD.style.fill = rgb(ld.c); washD.style.opacity = ld.a.toFixed(3);
    var near = clamp((cam.z + 3.2) / 5.5, 0, 1);
    // the kitchen: its light, then a porcelain haze that thins as we come near, as one wash
    var hz = 0.3 - 0.22 * near, hc = litc(PO, lk), ka = 1 - (1 - lk.a) * (1 - hz);
    washK.style.fill = rgb([0, 1, 2].map(function (i) { return (lk.c[i] * lk.a * (1 - hz) + hc[i] * hz) / ka; }));
    washK.style.opacity = ka.toFixed(3);
    setVar(svg, '--win', sky(w));
    setVar(svg, '--sky', sky(w));
    for (var k in FURN) setVar(gF, k, rgb(litc(FURN[k], ld)));
    var scrOn = clamp(w.N + 0.55 * w.S + (still ? 0 : 0.35 * wenv(t, 0.2, 0.4, 1.8, 2.4)), 0, 1);
    var so = litc('#cfd5d6', ld), sn = hex('#fbe0b2');
    setVar(gF, '--scr', rgb([0, 1, 2].map(function (i) { return lerp(so[i], sn[i], scrOn); })));
    vis(lift, 0.05 * w.D);
    vis(vig, w.N + 0.4 * w.S + 0.08 * w.D);
    vis(gKS, 0.75 * w.D); vis(gSS, w.D);
    strip.on = 0.6 * (w.D + w.S);
    // the dining wash covers all but the opening into the kitchen
    var o = [[-OX, OT, PZ], [OX, OT, PZ], [OX, OB, PZ], [-OX, OB, PZ]].map(function (p) { return scr(toCam(p)); });
    var od = o.map(function (p, i) { return (i ? 'L' : 'M') + n(p[0]) + ' ' + n(p[1]); }).join('') + 'Z';
    washD.setAttribute('d', 'M-10 -10H' + (VW + 10) + 'V' + (VH + 10) + 'H-10Z' + od);
    washK.setAttribute('d', od);
    // floor and ceiling shading follow the camera
    var fy0 = scr(toCam([cam.x, FL, PZ]))[1], cy0 = scr(toCam([cam.x, DC, PZ]))[1];
    var gfl = svg.querySelector('#g-floor'), gce = svg.querySelector('#g-dceil');
    gfl.setAttribute('y1', n(fy0)); gfl.setAttribute('y2', n(Math.max(fy0 + 50, VH * 1.05)));
    gce.setAttribute('y1', n(Math.min(-VH * 0.1, cy0 - 50))); gce.setAttribute('y2', n(cy0));

    /* the dining room: lamps, chairs up or down, guests */
    var full = still ? 1 : wenv(t, 7.4, 8.0, 11.3, 12.2);
    var chairs = still ? 1 : wenv(t, 7.4, 7.6, 11.95, 12.55);
    TABLES.forEach(function (tb, i) {
      var on = tb.lamp ? Math.max(w.N, w.S) : w.S;
      tb.halo.on = on; vis(tb.pool.e, 0.9 * on);
      tb.pend.e.style.setProperty('--bulb', on.toFixed(3));
      tb.down.style.opacity = chairs.toFixed(3);
      tb.up.style.opacity = (1 - chairs).toFixed(3);
      tb.down.style.display = chairs < 0.002 ? 'none' : '';
      tb.up.style.display = chairs > 0.998 ? 'none' : '';
      tb.guests.forEach(function (gc, j) { gc.on = clamp(full * 1.4 - j * 0.2, 0, 1); });
    });
    tillGlow.on = 0.8 * scrOn;
    led.e.style.opacity = (still ? 1 : 0.25 + 0.75 * wenv(t, 0.25, 0.35, 1.7, 1.9)).toFixed(3);

    /* the receipt: prints, tears off, drifts back to the fridge, and goes in */
    var rp = SLOT, ron = 1, rsy = 1, rrot = 0, rk = 1;
    if (still) { rp = [0.98, 0.25, 3.95]; rrot = -4; ron = 0; }
    else if (t < 0.3) { ron = 0; }
    else if (t < 2.2) {
      rsy = sm((t - 0.35) / 1.35);
      var hop = env(t, 1.9, 2.0, 2.05, 2.2);
      rp = [SLOT[0], SLOT[1] + 0.03 * hop, SLOT[2]];
      rrot = -2 * hop;
    } else if (t < 5.45) {
      var u = smr((t - 2.2) / 3.2);
      rp = bez(RP, u);
      rrot = -9 * Math.sin(Math.PI * u) + 3 * Math.sin(t * 2.4) * Math.sin(Math.PI * u);
      rk = 1 + 0.25 * Math.sin(Math.PI * u);
      rp[1] += 0.02 * Math.sin(t * 3.1) * Math.sin(Math.PI * u);
    } else if (t < 6.3) {
      var v = sine((t - 5.55) / 0.7);
      rp = mix3(RP[3], RIN, v);
      rp[1] += 0.015 * Math.sin(t * 3.1) * (1 - v);
      rk = 1 - 0.45 * v;
      ron = 1 - sm((t - 5.75) / 0.5);
    } else ron = 0;
    receipt.p = rp; receipt.on = ron; receipt.rot = rrot; receipt.k = rk;
    rIn.setAttribute('transform', rsy < 1 ? 'scale(1 ' + rsy.toFixed(3) + ')' : '');
    rShadow.p = rp; rShadow.on = ron * (t < 2.2 ? 0 : 0.6) * (still ? 0 : 1); rShadow.k = rk;
    rHalo.p = rp; rHalo.on = ron * (0.25 + 0.75 * w.N) * (t < 0.6 ? sm((t - 0.3) / 0.3) : 1); rHalo.k = rk;

    /* the fridge: the seam glows, the door swings open, the counts appear */
    var sgl = still ? 0 : env(t, 5.05, 5.35, 5.45, 5.75);
    var open = still ? 0.95 : eio(clamp((t - 5.4) / 0.7, 0, 1)) * (1 - eio(clamp((t - 7.95) / 0.75, 0, 1)));
    var th = open * 1.45, hx = IX1 + 0.02, hz = FZ, dw = IX1 - IX0 + 0.04;
    var fx = hx - dw * Math.cos(th), fz = hz - dw * Math.sin(th);
    door.r = [[[hx, IT + 0.03, hz], [fx, IT + 0.03, fz], [fx, FL, fz], [hx, FL, hz]]];
    var hdx = hx - (dw - 0.07) * Math.cos(th), hdz = hz - (dw - 0.07) * Math.sin(th) - 0.04 * Math.cos(th);
    handle.r = [[[hdx, 0.34, hdz], [hdx, -0.46, hdz]]];
    drawShape(door); drawShape(handle);
    vis(seam.e, sgl);
    var lit = still ? 1 : env(t, 5.4, 5.8, 8.0, 8.7);
    frLit.on = 0.9 * lit; vis(frSpill.e, 0.8 * lit);
    LBLS.forEach(function (c, i) { c.on = still ? 1 : env(t, 5.85 + i * 0.14, 6.2 + i * 0.14, 8.0, 8.4); });
    EXL.on = still ? 1 : env(t, 5.75, 6.1, 8.0, 8.4);

    /* the short rib: lifted from its tub, carried to the pan */
    if (still) meat.on = 0;
    else if (t > 7.05 && t < 8.45) {
      var mu = smr((t - 7.2) / 1.1);
      meat.p = t < 7.2 ? mix3(MP[0], [MP[0][0], MP[0][1] + 0.08, MP[0][2]], sm((t - 7.05) / 0.15)) : bez(MP, mu);
      meat.on = sm((t - 7.05) / 0.18) * (1 - sm((t - 8.25) / 0.18));
      meat.rot = -14 * Math.sin(Math.PI * mu);
    } else meat.on = 0;

    /* the chef: two tosses of the pan, a flare, steam */
    var ck = t - 8.3, toss = 0;
    if (!still && ck > 0 && ck < 1.3) {
      if (ck < 0.55) toss = Math.sin(ck / 0.55 * Math.PI);
      else if (ck > 0.65 && ck < 1.2) toss = 0.7 * Math.sin((ck - 0.65) / 0.55 * Math.PI);
    }
    var sway = still ? 0 : Math.sin(t / T * Math.PI * 4) * 0.6;
    cChef.e.querySelector('.ck-arm').setAttribute('transform', 'rotate(' + n(-toss * 8) + ' 21 7)');
    cChef.p = [CH[0] + sway * 0.004 + toss * 0.01, CH[1], CH[2]];
    cPan.e.querySelector('.ck-pan').setAttribute('transform', 'translate(' + n(toss * 1.5) + ' ' + n(-toss * 7) + ') rotate(' + n(toss * 7) + ')');
    var fl = still ? 0.55 : clamp(env(t, 8.32, 8.45, 8.6, 9.25) + 0.6 * env(t, 8.92, 9.02, 9.12, 9.55), 0, 1);
    flare.on = fl; flare.k = 0.65 + 0.55 * fl; flareCore.on = fl; flareCore.k = flare.k;
    cPan.e.querySelector('.ck-flames').style.opacity = (0.15 + 0.85 * Math.max(fl, 0.5 * w.S)).toFixed(3);
    stPan.on = still ? 0.5 : 0.65 * env(t, 8.45, 8.9, 9.6, 10.6);
    stPan.p = [PB[0] + 0.02, PB[1] + 0.06 + (still ? 0.02 : 0.25 * clamp((t - 8.45) / 2.1, 0, 1)), PB[2]];
    var kp = (t / T * 3) % 1;
    stPot.p = [POT[0], RY + 0.3 + kp * 0.2, POT[1]]; stPot.on = 0.4 * Math.sin(kp * Math.PI) * (0.4 + 0.6 * (w.D + w.S));

    /* the dish: off the pan, onto the pass under the lamps, out to the room */
    var dp = null, don = 0, dk = 1.6;
    if (still) { dp = DP1[3]; don = 1; }
    else if (t > 8.85 && t < 12.1) {
      if (t < 9.6) dp = bez(DP1, smr((t - 8.95) / 0.65));
      else if (t < 9.95) dp = DP1[3];
      else if (t < 11.0) { var du = smr((t - 9.95) / 1.05); dp = bez(DP2, du); dk = 1.6 + 0.5 * Math.sin(Math.PI * du) - 0.4 * du; }
      else { dp = DP2[3]; dk = 1.2; }
      don = sm((t - 8.85) / 0.2) * (1 - sm((t - 11.45) / 0.6));
    }
    dish.on = don; dHalo.on = don * (0.35 + 0.65 * env(t, 9.4, 9.6, 9.95, 10.3)) * (still ? 0.8 : 1);
    if (dp) { dish.p = dp; dish.k = dk; dHalo.p = dp; dHalo.k = dk; }
    var heat = still ? 1 : Math.max(0.15 * w.D, 0.75 * w.S + 0.25 * env(t, 9.4, 9.6, 9.95, 10.4));
    vis(gHC, heat);
    bulbs.forEach(function (b) { b.on = 0.25 + 0.75 * heat; });

    for (i = 0; i < CARDS.length; i++) drawCard(CARDS[i]);
  }
  door.dyn = handle.dyn = true;

  /* ---------- size: the viewBox is the figure's own pixels ---------- */
  var phone = false;
  function size() {
    var r = fig.getBoundingClientRect();
    VW = Math.max(200, Math.round(r.width)); VH = Math.max(200, Math.round(r.height));
    phone = window.matchMedia('(max-width: 760px)').matches;
    F = phone ? VH * 0.85 : VH * 1.0;
    PPX = phone ? VW * 0.36 : VW * 0.62;
    PPY = phone ? VH * 0.47 : VH * 0.46;
    svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
  }
  size();

  /* ---------- the headline: a tape locking in (39) ---------- */
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
  // the still: a designed frame between the room and the pass, in lamplight,
  // with the fridge open on its counts and a dish under the heat lamps
  var STILL = { x: -0.42, y: 0.16, z: 1.2, yaw: 0.0, pitch: -0.055 };
  var current = 0, isStill = !motion;
  function paint() { if (isStill) render(0, true, STILL); else render(current, false); }
  window.addEventListener('resize', function () { size(); paint(); });
  if (!motion) { paint(); return; }
  setupText();
  if (freeze != null && !isNaN(freeze)) {
    current = ((freeze % T) + T) % T;
    paint();
    var hold = function () {
      sizeScreen();
      if (freeze < 1.5) textAt(freeze); else textDone();
      root.classList.remove('vhs-pending');
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(hold);
    return;
  }
  paint();
  textAt(0);

  var start = 0, raf = 0, visible = true, textOver = false, pausedAt = 0;
  function tick(now) {
    var e = (now - start) / 1000;
    current = (e % T + T) % T;
    render(current, false);
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
