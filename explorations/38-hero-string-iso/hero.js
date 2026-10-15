/* Tooey, exploration 38: the hero on a string (axonometric).
   The restaurant is drawn as an architectural axonometric cutaway: a floor
   slab, two cut walls, the kitchen at the back (a tall fridge, a prep table,
   the range and a cook), and the counter with the till at the front right.
   One lamplight thread is strung between three brass eyelets, on the till,
   the fridge and the cook's station. A bead runs round it, every 10 s:
   the till takes an order, the bead carries it to the fridge (the door
   opens, three tubs light with example counts), then to the cook (the pan
   flares, a plate goes up on the pass), then back to the till.

   The headline and the line under it come in like a tape finding its
   tracking: the colour channels split, slices of the letters jump, a few
   scanlines and a little static, then it locks clean. Now and then, every
   7 to 10 s, a small glitch passes. The real words stay in the HTML; the
   animated copies are aria-hidden. Under reduced motion none of this runs:
   the words are plain and the scene is a still with all three lit. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var fig = document.querySelector('.hero-scene');

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function n(v) { return Math.round(v * 10) / 10; }

  /* ================================================================ */
  /* the drawing                                                       */
  /* ================================================================ */

  // 30-degree axonometric: x runs down-right, y down-left, z up. 1 unit = 1 cm.
  var C = 0.8660254, S = 0.5;
  function pr(x, y, z) { return [(x - y) * C, (x + y) * S - (z || 0)]; }
  function d3(pts, close) {
    var s = '';
    for (var i = 0; i < pts.length; i++) {
      var q = pr(pts[i][0], pts[i][1], pts[i][2]);
      s += (i ? 'L' : 'M') + n(q[0]) + ' ' + n(q[1]);
    }
    return close === false ? s : s + 'Z';
  }
  function ln3(a, b) { return d3([a, b], false); }
  function pth(cls, d, extra) { return '<path class="' + cls + '" d="' + d + '"' + (extra || '') + '/>'; }
  // a horizontal circle (an ellipse on screen), as points
  function ring(cx, cy, z, r, a0, a1, k) {
    var out = []; a0 = a0 || 0; a1 = a1 == null ? 360 : a1; k = k || 36;
    for (var i = 0; i <= k; i++) {
      var a = (a0 + (a1 - a0) * i / k) * Math.PI / 180;
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]);
    }
    return out;
  }
  // screen extremes of a horizontal circle: the angles where it turns
  var LEFTA = 135, RIGHTA = -45; // (cos - sin) is least at 135 deg and most at -45 deg

  // a box: three visible faces (top, +y front-left, +x front-right),
  // tonal fills, a key silhouette and quiet inner edges
  function box(x, y, z, dx, dy, dz, o) {
    o = o || {};
    var x1 = x + dx, y1 = y + dy, z1 = z + dz, s = '';
    var top = [[x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]];
    var fr = [[x1, y, z1], [x1, y1, z1], [x1, y1, z], [x1, y, z]];
    var fl = [[x, y1, z1], [x1, y1, z1], [x1, y1, z], [x, y1, z]];
    if (!o.noR) s += pth('fr' + (o.r ? ' ' + o.r : ''), d3(fr));
    if (!o.noL) s += pth('fl' + (o.l ? ' ' + o.l : ''), d3(fl));
    if (!o.noT) s += pth('ft' + (o.t ? ' ' + o.t : ''), d3(top));
    s += pth(o.kq || 'k', d3([[x, y, z1], [x1, y, z1], [x1, y, z], [x1, y1, z], [x, y1, z], [x, y1, z1]]));
    s += pth(o.iq || 'q', ln3([x1, y1, z1], [x, y1, z1]) + ln3([x1, y1, z1], [x1, y, z1]) + ln3([x1, y1, z1], [x1, y1, z]));
    return s;
  }
  // an upright cylinder
  function cyl(cx, cy, z, r, h, o) {
    o = o || {};
    var top = ring(cx, cy, z + h, r), s = '';
    var side = ring(cx, cy, z, r, RIGHTA, LEFTA, 24).concat(ring(cx, cy, z + h, r, LEFTA, RIGHTA + 360, 24));
    s += pth(o.side || 'fl', d3(side));
    s += pth(o.topc || 'ft', d3(top));
    s += pth('q', d3(top) + d3(ring(cx, cy, z, r, RIGHTA, LEFTA, 24), false));
    var a = pr(cx + r * Math.cos(LEFTA * Math.PI / 180), cy + r * Math.sin(LEFTA * Math.PI / 180), z);
    var b = pr(cx + r * Math.cos(RIGHTA * Math.PI / 180), cy + r * Math.sin(RIGHTA * Math.PI / 180), z);
    s += pth('q', 'M' + n(a[0]) + ' ' + n(a[1]) + 'v' + n(-h) + 'M' + n(b[0]) + ' ' + n(b[1]) + 'v' + n(-h));
    return s;
  }
  // a soft contact shadow under a footprint
  function shadow(x, y, dx, dy, a) {
    return pth('shd', d3([[x - 4, y - 2, 0], [x + dx + 10, y - 2, 0], [x + dx + 10, y + dy + 12, 0], [x - 4, y + dy + 12, 0]]), ' style="opacity:' + (a || 1) + '"');
  }
  // a pool of light on a horizontal plane
  function pool(cx, cy, z, r, cls, a) {
    var c = pr(cx, cy, z);
    return '<ellipse class="pool' + (cls ? ' ' + cls : '') + '" cx="' + n(c[0]) + '" cy="' + n(c[1]) + '" rx="' + n(r * 1.2247) + '" ry="' + n(r * 0.7071) + '" style="opacity:' + (a == null ? 1 : a) + '"/>';
  }

  // the room
  var X = 560, Y = 480, T = 9, H = 236, SL = 12;

  // the fridge: against the left wall, its door on the +x face, hinged at the back
  var FR = { x: 0, y: 128, dx: 82, dy: 106, h: 212 };
  var FD = { x: FR.x + FR.dx, y0: FR.y + 3, y1: FR.y + FR.dy - 3, z0: 15, z1: 206 };
  var LEVELS = [18, 76, 134];
  // [level, y centre, lit label, count]
  var TUBS = [
    [2, 146, 'Short rib', 27], [2, 176, null], [2, 206, null],
    [1, 146, null], [1, 176, 'Risotto', 33], [1, 206, null],
    [0, 146, null], [0, 176, null], [0, 206, 'Burrata', 19]
  ];
  var TUBX = 46;
  // the range, the pan, the hood
  var RG = { x: 300, y: 0, dx: 220, dy: 74, h: 90 };
  var PAN = { x: 392, y: 40, z: 92 };
  var COOK = { x: 412, y: 116 };
  // the counter, the till, the printer, the plate
  var CT = { x: 250, y: 300, dx: 310, dy: 64, h: 100 };
  var POS = { x: 470, y: 330, z: 106 };
  var PRN = { x: 503, y: 318, z: 106, dx: 24, dy: 22, dz: 15 };
  var PLATE = { x: 408, y: 314, z: 106 };
  // the three eyelets
  var PINS = {
    pos: [POS.x, 321.5, 178],
    fridge: [64, 181, FR.h + 12],
    cook: [334, 60, 170]
  };

  function buildScene() {
    var s = '';
    var defs =
      '<defs>' +
      '<linearGradient id="hgL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eeece6"/><stop offset="1" stop-color="#e3e0d8"/></linearGradient>' +
      '<linearGradient id="hgR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2dfd7"/><stop offset="1" stop-color="#d3cfc6"/></linearGradient>' +
      '<linearGradient id="hgWallR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0efea"/><stop offset=".75" stop-color="#e8e6df"/><stop offset="1" stop-color="#dedbd3"/></linearGradient>' +
      '<linearGradient id="hgWallL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6e4dd"/><stop offset=".75" stop-color="#dcd9d1"/><stop offset="1" stop-color="#d1cdc4"/></linearGradient>' +
      '<linearGradient id="hgCook" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f8f7f3"/><stop offset=".55" stop-color="#f1efea"/><stop offset="1" stop-color="#d9d5cc"/></linearGradient>' +
      '<linearGradient id="hgIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dcda"/><stop offset="1" stop-color="#c9ccca"/></linearGradient>' +
      '<radialGradient id="hgPool"><stop offset="0" stop-color="#fbd9a2" stop-opacity=".95"/><stop offset=".45" stop-color="#fbdcaa" stop-opacity=".55"/><stop offset="1" stop-color="#fde3b8" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hgHalo"><stop offset="0" stop-color="#f7c47c" stop-opacity=".95"/><stop offset=".35" stop-color="#f9d29a" stop-opacity=".55"/><stop offset="1" stop-color="#fde3b8" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hgFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ee9f45"/><stop offset=".45" stop-color="#f6c27a"/><stop offset="1" stop-color="#fde9c6" stop-opacity=".5"/></linearGradient>' +
      '<filter id="hfBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>' +
      '<filter id="hfSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>' +
      '<clipPath id="hcOpen"><path d="' + d3([[FD.x, FD.y0, FD.z0], [FD.x, FD.y1, FD.z0], [FD.x, FD.y1, FD.z1], [FD.x, FD.y0, FD.z1]]) + '"/></clipPath>' +
      '</defs>';
    s += defs;

    /* --- the slab and its cut edges --- */
    s += pth('floor', d3([[0, 0, 0], [X, 0, 0], [X, Y, 0], [0, Y, 0]]));
    // tiles, 40 cm
    var tl = '';
    for (var i = 40; i < X; i += 40) tl += ln3([i, 0, 0], [i, Y, 0]);
    for (i = 40; i < Y; i += 40) tl += ln3([0, i, 0], [X, i, 0]);
    s += pth('d tiles', tl);
    s += pth('slab-r', d3([[X, -T, 0], [X, Y, 0], [X, Y, -SL], [X, -T, -SL]]));
    s += pth('slab-l', d3([[-T, Y, 0], [X, Y, 0], [X, Y, -SL], [-T, Y, -SL]]));
    s += pth('k', d3([[-T, Y, 0], [X, Y, 0], [X, -T, 0]], false)) + pth('q', d3([[-T, Y, -SL], [X, Y, -SL], [X, -T, -SL]], false) + ln3([X, Y, 0], [X, Y, -SL]));

    /* --- light on the floor (drifts very slowly) --- */
    s += '<g class="pools">' +
      pool(400, 190, 0, 150, 'p1', .8) +
      pool(420, 430, 0, 120, 'p2', .7) +
      pool(150, 300, 0, 120, 'p3', .45) +
      '</g>';

    /* --- contact shadows --- */
    s += '<g class="shadows" filter="url(#hfBlur)">' +
      shadow(FR.x, FR.y, FR.dx, FR.dy) + shadow(110, 0, 160, 62, .8) + shadow(RG.x, RG.y, RG.dx, RG.dy) +
      shadow(CT.x, CT.y, CT.dx, CT.dy) +
      pth('shd', d3(ring(COOK.x + 4, COOK.y + 6, 0, 24)), ' style="opacity:.35"') +
      pth('shd', d3(ring(340, 424, 0, 17)), ' style="opacity:.7"') + pth('shd', d3(ring(450, 424, 0, 17)), ' style="opacity:.7"') +
      '</g>';

    /* --- the walls, cut at H --- */
    s += pth('wallR', d3([[0, 0, 0], [X, 0, 0], [X, 0, H], [0, 0, H]]));
    s += pth('wallL', d3([[0, 0, 0], [0, Y, 0], [0, Y, H], [0, 0, H]]));
    s += pth('q', ln3([0, 0, 0], [0, 0, H]) + ln3([0, 0, 0], [X, 0, 0]) + ln3([0, 0, 0], [0, Y, 0]));
    // skirting
    s += pth('d', ln3([0, 0, 9], [X, 0, 9]) + ln3([0, 0, 9], [0, Y, 9]));
    // tiles behind the prep table and the range
    var wt = '';
    for (var z = 100; z <= 172; z += 9) wt += ln3([104, 0, z], [522, 0, z]);
    for (z = 100, i = 0; z < 172; z += 9, i++) for (var xx = 104 + (i % 2 ? 9 : 0); xx <= 522; xx += 18) wt += ln3([xx, 0, z], [xx, 0, z + 9]);
    s += pth('x', wt) + pth('d', ln3([104, 0, 100], [104, 0, 172]) + ln3([104, 0, 172], [522, 0, 172]) + ln3([522, 0, 100], [522, 0, 172]));
    // the kitchen door in the left wall, with its porthole
    s += pth('door', d3([[0, 22, 0], [0, 108, 0], [0, 108, 200], [0, 22, 200]]));
    s += pth('q', d3([[0, 22, 0], [0, 22, 200], [0, 108, 200], [0, 108, 0]], false) + ln3([0, 65, 0], [0, 65, 200]));
    var port = [];
    for (i = 0; i <= 28; i++) { var a = i / 28 * Math.PI * 2; port.push([0, 43.5 + 11 * Math.cos(a), 150 + 11 * Math.sin(a)]); }
    var port2 = port.map(function (p) { return [0, 86.5 + (p[1] - 43.5), p[2]]; });
    s += pth('glass', d3(port) + d3(port2)) + pth('q', d3(port) + d3(port2));
    s += pth('d', ln3([0, 26, 34], [0, 61, 34]) + ln3([0, 69, 34], [0, 104, 34]));
    // the wall's cut: tops and ends in poche
    s += pth('poche', d3([[-T, -T, H], [X, -T, H], [X, 0, H], [0, 0, H], [0, Y, H], [-T, Y, H]]));
    s += pth('poche', d3([[X, -T, 0], [X, 0, 0], [X, 0, H], [X, -T, H]]));
    s += pth('poche', d3([[-T, Y, 0], [0, Y, 0], [0, Y, H], [-T, Y, H]]));

    /* --- a shelf of jars over the prep table --- */
    s += box(120, 0, 150, 138, 22, 4);
    [[136, 11, 12, 22], [160, 11, 10, 28], [186, 11, 12, 18], [212, 11, 9, 30], [236, 11, 11, 22]].forEach(function (j) {
      s += cyl(j[0], j[1], 154, j[2] / 2 + 1, j[3], { side: 'jar', topc: 'ft' });
    });

    /* --- the prep table --- */
    s += box(110, 0, 18, 160, 62, 3, { iq: 'd' });
    [[114, 56], [264, 56]].forEach(function (lg) { s += box(lg[0], lg[1], 0, 4, 4, 84); });
    s += box(108, 0, 84, 164, 64, 6);
    s += box(150, 20, 90, 54, 32, 3, { t: 'wood', l: 'wood', r: 'wood' });
    s += cyl(238, 34, 90, 12, 8);
    s += pth('q', ln3([162, 46, 93.5], [196, 40, 93.5]));

    /* --- the fridge: body, then its interior through the opening, then its door --- */
    s += box(FR.x, FR.y, 0, FR.dx, FR.dy, FR.h, { r: 'steel' });
    // kick grille
    var gr = '';
    for (z = 4; z <= 11; z += 3.5) gr += ln3([FR.dx, FR.y + 8, z], [FR.dx, FR.y + FR.dy - 8, z]);
    s += pth('d', gr);
    // the opening (only seen when the door swings)
    s += '<g class="fr-in" clip-path="url(#hcOpen)">';
    s += pth('inside', d3([[FD.x, FD.y0, FD.z0], [FD.x, FD.y1, FD.z0], [FD.x, FD.y1, FD.z1], [FD.x, FD.y0, FD.z1]]));
    s += pth('inback', d3([[6, FD.y0, FD.z0], [6, FD.y1, FD.z0], [6, FD.y1, FD.z1], [6, FD.y0, FD.z1]]));
    s += pth('inside', d3([[6, FD.y0, FD.z0], [FD.x, FD.y0, FD.z0], [FD.x, FD.y0, FD.z1], [6, FD.y0, FD.z1]]));
    s += '<g class="fr-light" style="opacity:0">' + pool(44, 182, 120, 70, 'inglow', 1) + '</g>';
    LEVELS.forEach(function (lz, li) {
      // the shelf
      s += pth('shelf', d3([[6, FD.y0, lz], [FD.x, FD.y0, lz], [FD.x, FD.y1, lz], [6, FD.y1, lz]]));
      s += pth('q', ln3([FD.x - 2, FD.y0, lz], [FD.x - 2, FD.y1, lz]));
      TUBS.forEach(function (t, ti) {
        if (t[0] !== li) return;
        var tx = TUBX, ty = t[1] - 13, h = t[2] ? 20 : 15 + (ti % 3) * 3;
        s += '<g class="tub' + (t[2] ? ' tub-lit" data-t="' + ti : '') + '">';
        s += box(tx, ty, lz, 30, 26, h, { r: 'tubr', l: 'tubl', t: 'tubt' });
        s += pth('d', ln3([tx + 30, ty, lz + h - 4], [tx + 30, ty + 26, lz + h - 4]));
        if (t[2]) s += pth('tape', d3([[tx + 30, ty + 6, lz + 6], [tx + 30, ty + 20, lz + 6], [tx + 30, ty + 20, lz + 12], [tx + 30, ty + 6, lz + 12]]));
        s += '</g>';
      });
    });
    s += '</g>';
    // the door's frame on the face, and the hinge line
    s += pth('q', d3([[FD.x, FD.y0, FD.z0], [FD.x, FD.y1, FD.z0], [FD.x, FD.y1, FD.z1], [FD.x, FD.y0, FD.z1]]));
    s += '<g class="fr-door"></g>';
    // the badge on the side of the fridge
    s += pth('d', d3([[30, FR.y + FR.dy, 182], [56, FR.y + FR.dy, 182], [56, FR.y + FR.dy, 190], [30, FR.y + FR.dy, 190]]));

    /* --- the hood --- */
    s += box(316, 0, 196, 200, 46, H - 196 - 0.01, { kq: 'q' });
    s += pth('fl', d3([[300, 62, 176], [520, 62, 176], [516, 46, 196], [316, 46, 196]]));
    s += pth('fr', d3([[520, 0, 176], [520, 62, 176], [516, 46, 196], [516, 0, 196]]));
    s += pth('k', d3([[300, 62, 176], [520, 62, 176], [520, 0, 176]], false) + d3([[300, 62, 176], [316, 46, 196]], false) + d3([[520, 62, 176], [516, 46, 196], [516, 0, 196]], false));
    s += pth('d', ln3([306, 58, 179], [514, 58, 179]));

    /* --- the range --- */
    s += box(RG.x, RG.y, 0, RG.dx, RG.dy, RG.h);
    // oven doors and knobs on its front
    s += pth('q', d3([[312, RG.dy, 12], [404, RG.dy, 12], [404, RG.dy, 62], [312, RG.dy, 62]]) + d3([[416, RG.dy, 12], [508, RG.dy, 12], [508, RG.dy, 62], [416, RG.dy, 62]]));
    s += pth('k', ln3([322, RG.dy, 56], [394, RG.dy, 56]) + ln3([426, RG.dy, 56], [498, RG.dy, 56]));
    var kn = '';
    for (i = 0; i < 6; i++) { var kp = pr(318 + i * 36, RG.dy, 76); kn += 'M' + n(kp[0] + 3.4) + ' ' + n(kp[1]) + 'a3.4 3.4 0 1 0 -6.8 0a3.4 3.4 0 1 0 6.8 0z'; }
    s += pth('knob', kn);
    // burners
    [[340, 22], [340, 54], [450, 22], [450, 52]].forEach(function (b) {
      s += pth('d', d3(ring(b[0], b[1], RG.h, 13)) + d3(ring(b[0], b[1], RG.h, 6)));
    });
    // a stockpot on the back burner
    s += cyl(450, 22, RG.h, 14, 24, { side: 'fr', topc: 'ft' });
    s += '<g class="steam-g">' + [0, 1, 2].map(function (k) {
      var b = pr(446 + k * 5, 22, RG.h + 26);
      return '<path class="steam" style="--i:' + k + '" d="M' + n(b[0]) + ' ' + n(b[1]) + 'q-5 -9 0 -18q5 -9 0 -18"/>';
    }).join('') + '</g>';
    // the burner flame under the pan, and the pan
    s += '<g class="burn"></g>';
    s += '<g class="pan"></g>';
    s += '<g class="flare"></g>';

    /* --- the cook --- */
    s += '<g class="cook"></g>';

    /* --- the counter --- */
    s += box(CT.x, CT.y, 0, CT.dx, CT.dy, CT.h);
    var bd = '';
    for (xx = CT.x + 16; xx < CT.x + CT.dx; xx += 16) bd += ln3([xx, CT.y + CT.dy, 10], [xx, CT.y + CT.dy, CT.h - 2]);
    s += pth('x', bd) + pth('d', ln3([CT.x, CT.y + CT.dy, 10], [CT.x + CT.dx, CT.y + CT.dy, 10]));
    s += box(CT.x - 4, CT.y - 2, CT.h, CT.dx + 6, CT.dy + 8, 6, { t: 'wood', l: 'wood2', r: 'wood2' });
    s += pool(410, 334, CT.h + 6, 70, 'p4', .65);
    s += '<g class="plate"></g>';
    // the printer and its receipt
    s += box(PRN.x, PRN.y, PRN.z, PRN.dx, PRN.dy, PRN.dz);
    s += pth('k', ln3([PRN.x + 4, PRN.y + 9, PRN.z + PRN.dz], [PRN.x + PRN.dx - 4, PRN.y + 9, PRN.z + PRN.dz]));
    s += '<g class="receipt"></g>';
    // the till: a base, a stem and a tilted screen facing the guest
    s += cyl(POS.x, POS.y, POS.z, 12, 3);
    s += cyl(POS.x, POS.y - 2, POS.z + 3, 2.8, 30, { side: 'fr' });
    s += '<g class="till"></g>';
    // the stools
    [[340, 424], [450, 424]].forEach(function (st) {
      s += cyl(st[0], st[1], 0, 14, 2);
      s += cyl(st[0], st[1], 2, 2.2, 66, { side: 'fr' });
      s += pth('q', d3(ring(st[0], st[1], 26, 11)));
      s += cyl(st[0], st[1], 68, 16, 6, { side: 'wood2', topc: 'wood' });
    });

    /* --- the thread, the bead and the eyelets (filled by the loop) --- */
    s += '<g class="thread"></g>';
    return s;
  }

  /* ---------- the pieces that move ---------- */

  // the fridge door at angle th (0 shut, ~1.75 open)
  function doorSvg(th) {
    var w = FD.y1 - FD.y0, hx = FD.x, hy = FD.y0, t = 6;
    var fx = hx + w * Math.sin(th), fy = hy + w * Math.cos(th);
    // the door's outer face looks +x when shut; after 45 deg its inside shows
    var outer = Math.cos(th) - Math.sin(th) > 0;
    // thickness offset, along the outer normal
    var nx = Math.cos(th) * t, ny = -Math.sin(th) * t;
    var A = [hx, hy, FD.z0], B = [fx, fy, FD.z0], Cc = [fx, fy, FD.z1], D = [hx, hy, FD.z1];
    var off = function (p) { return [p[0] + nx, p[1] + ny, p[2]]; };
    var s = '';
    if (th < 0.02) {
      // shut: the door is the face of the fridge
      s += pth('steel-door', d3([A, B, Cc, D]));
      s += pth('q', d3([A, B, Cc, D]));
      s += pth('handle', ln3([hx + 1, FD.y1 - 9, 70], [hx + 1, FD.y1 - 9, 150]));
      s += pth('d', ln3([hx, FD.y0 + 8, 40], [hx, FD.y1 - 20, 40]));
      return s;
    }
    var face = outer ? [off(A), off(B), off(Cc), off(D)] : [A, B, Cc, D];
    // its edge (the free side), drawn first
    s += pth('fr', d3([B, off(B), off(Cc), Cc]));
    s += pth(outer ? 'steel-door' : 'door-in', d3(face));
    s += pth('k', d3(face));
    s += pth('q', d3([B, off(B), off(Cc), Cc]));
    if (!outer) {
      // bins on the inside of the door
      [70, 120, 166].forEach(function (z) {
        s += pth('d', d3([[hx + 4 * Math.sin(th) + 2, hy + 4 * Math.cos(th), z], [fx - 6 * Math.sin(th), fy - 6 * Math.cos(th), z], [fx - 6 * Math.sin(th), fy - 6 * Math.cos(th), z + 10], [hx + 4 * Math.sin(th) + 2, hy + 4 * Math.cos(th), z + 10]]));
      });
      s += pth('q', d3([[hx + 6 * Math.sin(th), hy + 6 * Math.cos(th), FD.z0 + 8], [fx - 6 * Math.sin(th), fy - 6 * Math.cos(th), FD.z0 + 8], [fx - 6 * Math.sin(th), fy - 6 * Math.cos(th), FD.z1 - 8], [hx + 6 * Math.sin(th), hy + 6 * Math.cos(th), FD.z1 - 8]]));
    } else {
      var hf = [fx - 9 * Math.sin(th) + nx, fy - 9 * Math.cos(th) + ny];
      s += pth('handle', ln3([hf[0], hf[1], 70], [hf[0], hf[1], 150]));
    }
    return s;
  }

  // the pan, lifted by `lift` cm, tipped by `tip`
  function panSvg(lift, tip) {
    var z = PAN.z + lift, s = '';
    var rim = ring(PAN.x, PAN.y, z + 6, 15);
    var side = ring(PAN.x, PAN.y, z, 13, RIGHTA, LEFTA, 20).concat(ring(PAN.x, PAN.y, z + 6, 15, LEFTA, RIGHTA + 360, 20));
    s += pth('pan-side', d3(side));
    s += pth('pan-in', d3(rim));
    s += pth('k', d3(rim) + d3(ring(PAN.x, PAN.y, z, 13, RIGHTA, LEFTA, 20), false));
    // a little food in the pan
    s += pth('food', d3(ring(PAN.x - 1, PAN.y + 1, z + 4 + tip * 3, 8)));
    // the handle, toward the cook
    s += pth('k handle-k', ln3([PAN.x, PAN.y + 15, z + 5], [PAN.x + 2, PAN.y + 44, z + 9 + tip * 4]));
    return s;
  }

  // the flame under the pan; f (0..1) is the flare
  function flareSvg(f, t) {
    var s = '', base = pr(PAN.x, PAN.y, PAN.z + 7);
    if (f > 0.01) {
      var r = 30 + 46 * f;
      s += '<ellipse class="flare-halo" cx="' + n(base[0]) + '" cy="' + n(base[1] - 10 - 14 * f) + '" rx="' + n(r * 1.3) + '" ry="' + n(r) + '" style="opacity:' + n(clamp(f * 1.1, 0, 1) * 100) / 100 + '"/>';
      // three soft tongues of flame over the pan
      for (var i = 0; i < 3; i++) {
        var ox = (i - 1) * 8, h = (16 + 30 * f) * (0.75 + 0.25 * Math.sin(t * 0.013 + i * 2.3)) * (i === 1 ? 1.25 : 0.9);
        var bx = base[0] + ox, by = base[1] - 2, sw = i === 1 ? 6.5 : 5;
        var lean = Math.sin(t * 0.006 + i * 1.3) * 2.5;
        s += '<path class="tongue" style="opacity:' + n(clamp(f * 1.3, 0, 1) * 85) / 100 + '" d="M' + n(bx - sw) + ' ' + n(by) +
          'C' + n(bx - sw) + ' ' + n(by - h * 0.45) + ' ' + n(bx - sw * 0.25 + lean) + ' ' + n(by - h * 0.7) + ' ' + n(bx + lean * 1.4) + ' ' + n(by - h) +
          'C' + n(bx + sw * 0.25 + lean) + ' ' + n(by - h * 0.7) + ' ' + n(bx + sw) + ' ' + n(by - h * 0.45) + ' ' + n(bx + sw) + ' ' + n(by) + 'Z"/>';
      }
    }
    return s;
  }
  function burnSvg(t) {
    var s = '', c = pr(PAN.x, PAN.y, PAN.z);
    s += '<ellipse class="burn-glow" cx="' + n(c[0]) + '" cy="' + n(c[1]) + '" rx="26" ry="13"/>';
    for (var i = 0; i < 7; i++) {
      var a = (i / 7) * Math.PI * 2, p = pr(PAN.x + 12 * Math.cos(a), PAN.y + 12 * Math.sin(a), PAN.z);
      var h = 4 + 2 * Math.sin(t * 0.02 + i * 2.1);
      s += '<path class="flame-s" d="M' + n(p[0]) + ' ' + n(p[1]) + 'l' + n(-1.2) + ' ' + n(-h * 0.4) + 'l1.2 ' + n(-h * 0.6) + 'l1.2 ' + n(h * 0.6) + 'z"/>';
    }
    return s;
  }

  // the cook, no face; v: 0 back (at the range), 1 front (to the pass)
  function cookSvg(v, toss) {
    var f = pr(COOK.x, COOK.y, 0), x = f[0], y = f[1];
    var front = v > 0.5, s = '';
    var sq = Math.abs(Math.cos(v * Math.PI)); // squeeze through the turn
    sq = 0.55 + 0.45 * sq;
    s += '<g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + n(sq * 100) / 100 + ' 1)">';
    // legs and shoes
    s += '<path class="trouser" d="M-15 -88 L-2 -88 L-4 -6 L-14 -6 Z M2 -88 L15 -88 L13 -5 L4 -5 Z"/>';
    s += '<path class="shoe" d="M-16 -7 h13 v6 h-14 z M3 -6 h12 v6 h-13 z"/>';
    s += '<path class="k" d="M-15 -88 L-14 -6 M-2 -88 L-4 -6 M2 -88 L4 -5 M15 -88 L13 -5"/>';
    // arms as tubes: an outline, then the sleeve
    function arm(d) { return '<path class="arm-k" d="' + d + '"/><path class="arm" d="' + d + '"/>'; }
    var jacket = 'M-22 -148 C-27 -138 -25 -110 -22 -84 L22 -84 C25 -110 27 -138 22 -148 Q0 -156 -22 -148 Z';
    if (!front) {
      // at the range: both arms forward, so behind the back; the elbows show
      s += arm('M-18 -144 Q-29 -132 -27 -118 Q-22 -112 -12 -112');
      s += arm('M18 -144 Q29 -134 ' + n(28) + ' ' + n(-121 - toss * 3) + ' Q22 ' + n(-114 - toss * 4) + ' 12 ' + n(-113 - toss * 4));
      s += '<path class="jacket" d="' + jacket + '"/><path class="k" d="' + jacket + '"/>';
      // apron strings and the back seam
      s += '<path class="q" d="M-23 -100 Q0 -96 23 -100 M-2 -98 l-7 8 M2 -98 l6 9"/><path class="d" d="M0 -150 C1 -130 -1 -110 0 -86"/>';
    } else {
      // turned to the pass: one hand out toward it
      s += '<path class="jacket" d="' + jacket + '"/><path class="k" d="' + jacket + '"/>';
      s += '<path class="apron" d="M-12 -132 L12 -132 L15 -100 L18 -40 L-18 -40 L-15 -100 Z"/>';
      s += '<path class="q" d="M-12 -132 L12 -132 L15 -100 L18 -40 L-18 -40 L-15 -100 Z M-12 -132 L-8 -150 M12 -132 L8 -150 M-23 -101 L-15 -101 M15 -101 L23 -101"/>';
      s += '<path class="d" d="M-12 -60 h24"/>';
      s += arm('M18 -144 Q27 -128 25 -112 Q24 -102 21 -96');
      s += arm('M-18 -144 Q-28 -130 -30 -121 Q-36 -116 -45 -116');
    }
    // collar, head, cap
    s += '<path class="jacket" d="M-7 -156 L7 -156 L8 -148 L-8 -148 Z"/><path class="q" d="M-8 -148 L-7 -156 M8 -148 L7 -156"/>';
    s += '<ellipse class="head" cx="0" cy="-166" rx="10.5" ry="12"/>';
    s += '<ellipse class="k" cx="0" cy="-166" rx="10.5" ry="12"/>';
    if (!front) s += '<path class="d" d="M-9 -170 Q0 -166 9 -170"/>';
    s += '<path class="toque" d="M-10.5 -172 L-11.5 -186 C-17 -200 -4 -204 0 -199 C4 -204 17 -200 11.5 -186 L10.5 -172 Q0 -169 -10.5 -172 Z"/>';
    s += '<path class="q" d="M-10.5 -172 L-11.5 -186 C-17 -200 -4 -204 0 -199 C4 -204 17 -200 11.5 -186 L10.5 -172 Q0 -169 -10.5 -172 Z M-11 -178 Q0 -175 11 -178"/>';
    s += '</g>';
    return s;
  }

  // the receipt: g (0..1) how far out it has curled, a its opacity
  function receiptSvg(g, a) {
    if (g <= 0.001 || a <= 0.001) return '';
    var x0 = PRN.x + 5, x1 = PRN.x + PRN.dx - 5, y0 = PRN.y + 9, z0 = PRN.z + PRN.dz;
    var L = 64 * g, straight = 26, r = 10, pts = [];
    for (var i = 0; i <= 26; i++) {
      var sl = L * i / 26, u, v;
      if (sl <= straight) { u = 0; v = sl; }
      else { var ph = (sl - straight) / r; u = r * (1 - Math.cos(ph)); v = straight + r * Math.sin(ph); }
      pts.push([u, v]);
    }
    var A = pts.map(function (p) { return [x0, y0 + p[0], z0 + p[1]]; });
    var B = pts.map(function (p) { return [x1, y0 + p[0], z0 + p[1]]; });
    var poly = A.concat(B.slice().reverse());
    var s = '<g style="opacity:' + n(a * 100) / 100 + '">';
    s += pth('paper', d3(poly));
    s += pth('q', d3(poly));
    // printed lines
    var lines = '';
    for (var k = 4; k < 22; k += 4) {
      if (k > L - 2) break;
      lines += ln3([x0 + 2, y0, z0 + k], [x1 - (k % 8 ? 4 : 2), y0, z0 + k]);
    }
    s += pth('d', lines) + '</g>';
    return s;
  }

  // the till's screen; p (0..1) is the pulse
  var TS = (function () {
    var cx = POS.x, cy = POS.y - 2, cz = POS.z + 46, tilt = 22 * Math.PI / 180;
    var u = [23, 0, 0], v = [0, -Math.sin(tilt) * 16, Math.cos(tilt) * 16];
    function at(a, b) { return [cx + u[0] * a + v[0] * b, cy + u[1] * a + v[1] * b, cz + u[2] * a + v[2] * b]; }
    return { at: at };
  })();
  function tillSvg(p) {
    var a = TS.at, s = '';
    var bez = [a(-1, -1), a(1, -1), a(1, 1), a(-1, 1)];
    var scr = [a(-0.86, -0.8), a(0.86, -0.8), a(0.86, 0.82), a(-0.86, 0.82)];
    // the back edge, so it reads as a slab
    var back = [a(1, -1), [a(1, -1)[0], a(1, -1)[1] - 2.5, a(1, -1)[2] - 1], [a(1, 1)[0], a(1, 1)[1] - 2.5, a(1, 1)[2] - 1], a(1, 1)];
    s += pth('bezel', d3(back));
    if (p > 0.01) {
      var c = pr(POS.x, POS.y, POS.z + 46);
      s += '<ellipse class="halo" cx="' + n(c[0]) + '" cy="' + n(c[1]) + '" rx="' + n(46 + 20 * p) + '" ry="' + n(34 + 14 * p) + '" style="opacity:' + n(p * 100) / 100 + '"/>';
    }
    s += pth('bezel', d3(bez));
    s += pth('screen', d3(scr), ' style="fill-opacity:1"');
    s += pth('screen-lit', d3(scr), ' style="opacity:' + n((0.25 + 0.75 * p) * 100) / 100 + '"');
    // a few rows on the screen
    var rows = '';
    for (var i = 0; i < 4; i++) {
      var b = -0.5 + i * 0.36;
      rows += ln3(a(-0.7, -b), a(i === 3 ? 0.1 : 0.5, -b));
    }
    s += pth('scr-row', rows);
    s += pth('k', d3(bez));
    return s;
  }

  function plateSvg(a, drop) {
    if (a <= 0.001) return '';
    var z = PLATE.z + drop, s = '<g style="opacity:' + n(a * 100) / 100 + '">';
    var c = pr(PLATE.x, PLATE.y, z);
    s += '<ellipse class="shd-s" cx="' + n(c[0] + 1) + '" cy="' + n(c[1] + 2 + drop * 0.5) + '" rx="20" ry="10"/>';
    s += pth('plate-f', d3(ring(PLATE.x, PLATE.y, z + 2, 15)));
    s += pth('q', d3(ring(PLATE.x, PLATE.y, z + 2, 15)) + d3(ring(PLATE.x, PLATE.y, z, 14, RIGHTA, LEFTA, 18), false));
    s += pth('d', d3(ring(PLATE.x, PLATE.y, z + 2, 10)));
    // the food: a small dome with a sprig
    var m = pr(PLATE.x, PLATE.y, z + 3);
    s += '<path class="food" d="M' + n(m[0] - 8) + ' ' + n(m[1]) + 'Q' + n(m[0] - 7) + ' ' + n(m[1] - 9) + ' ' + n(m[0]) + ' ' + n(m[1] - 9) + 'Q' + n(m[0] + 7) + ' ' + n(m[1] - 9) + ' ' + n(m[0] + 8) + ' ' + n(m[1]) + 'Z"/>';
    s += '<path class="q" d="M' + n(m[0] - 8) + ' ' + n(m[1]) + 'Q' + n(m[0] - 7) + ' ' + n(m[1] - 9) + ' ' + n(m[0]) + ' ' + n(m[1] - 9) + 'Q' + n(m[0] + 7) + ' ' + n(m[1] - 9) + ' ' + n(m[0] + 8) + ' ' + n(m[1]) + ' M' + n(m[0] + 1) + ' ' + n(m[1] - 9) + 'l2 -4 M' + n(m[0] + 1) + ' ' + n(m[1] - 9) + 'l-3 -3"/>';
    // a wisp of steam
    s += '<path class="steam-on" d="M' + n(m[0] - 2) + ' ' + n(m[1] - 14) + 'q-4 -6 0 -12q4 -6 0 -12"/>';
    return s + '</g>';
  }

  /* ---------- the thread ---------- */
  var PIN = {}, SEG = [];
  ['pos', 'fridge', 'cook'].forEach(function (k) { var p = PINS[k]; PIN[k] = pr(p[0], p[1], p[2]); });
  // three spans, each a sagging quadratic between two eyelets
  [['pos', 'fridge', 34, 0], ['fridge', 'cook', 36, 1.9], ['cook', 'pos', 22, 3.7]].forEach(function (sp) {
    SEG.push({ a: PIN[sp[0]], b: PIN[sp[1]], sag: sp[2], ph: sp[3] });
  });
  function ctrl(sg, t) {
    // the sway: the low point drifts a little, never in step with the loop
    var mx = (sg.a[0] + sg.b[0]) / 2, my = (sg.a[1] + sg.b[1]) / 2;
    var sw = Math.sin(t / 2300 + sg.ph), sw2 = Math.sin(t / 3700 + sg.ph * 2);
    return [mx + sw * 4.5, my + sg.sag * 2 + sw2 * 2.2];
  }
  function qpt(a, c, b, u) {
    var m = 1 - u;
    return [m * m * a[0] + 2 * m * u * c[0] + u * u * b[0], m * m * a[1] + 2 * m * u * c[1] + u * u * b[1]];
  }
  // a part of the span, u0..u1, as its own quadratic
  function qsub(a, c, b, u0, u1) {
    var p0 = qpt(a, c, b, u0), p2 = qpt(a, c, b, u1);
    // the tangent at u0, scaled to the sub-span
    var m = 1 - u0, du = u1 - u0;
    var d0 = [2 * m * (c[0] - a[0]) + 2 * u0 * (b[0] - c[0]), 2 * m * (c[1] - a[1]) + 2 * u0 * (b[1] - c[1])];
    var p1 = [p0[0] + d0[0] * du / 2, p0[1] + d0[1] * du / 2];
    return 'M' + n(p0[0]) + ' ' + n(p0[1]) + 'Q' + n(p1[0]) + ' ' + n(p1[1]) + ' ' + n(p2[0]) + ' ' + n(p2[1]);
  }
  // even speed along a span: a small arc-length table
  function arcU(a, c, b, s) {
    var N = 40, acc = [0], prev = a, tot = 0;
    for (var i = 1; i <= N; i++) { var q = qpt(a, c, b, i / N); tot += Math.hypot(q[0] - prev[0], q[1] - prev[1]); acc.push(tot); prev = q; }
    var want = s * tot;
    for (i = 1; i <= N; i++) if (acc[i] >= want) { var f = (want - acc[i - 1]) / (acc[i] - acc[i - 1] || 1); return (i - 1 + f) / N; }
    return 1;
  }

  /* ---------- the loop ---------- */
  var LOOP = 10000;
  // when the bead runs each span (ms in the loop)
  var RUN = [[900, 2700], [3900, 5500], [7300, 9100]];
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eo(t) { return 1 - Math.pow(1 - t, 3); }
  // a ramp from a to b (ms), 0..1
  function rp(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  // on between a..b with soft edges of e ms
  function win(t, a, b, e) { return Math.min(rp(t, a - e, a), 1 - rp(t, b, b + e)); }

  // the state of everything at loop time t; `still` is the reduced-motion frame
  function state(t, still) {
    var st = {};
    if (still) {
      return { pulse: 0.55, receipt: 1, receiptA: 1, door: 1.62, tubs: [1, 1, 1], notes: 1, inLight: 1,
        flare: 0.35, toss: 0, cookV: 1, plate: 1, plateDrop: 0, bead: null, segLit: [0.6, 0.6, 0.6], pinLit: [1, 1, 1] };
    }
    // the till
    st.pulse = Math.max(win(t, 0, 520, 90) * (0.75 + 0.25 * Math.sin(t / 60)), 0.55 * win(t, 9100, 9400, 300));
    st.pulse = Math.max(st.pulse, 1 - rp(t, 0, 900));
    st.receipt = eo(rp(t, 150, 1150));
    st.receiptA = 1 - rp(t, 9300, 9900);
    // the fridge
    st.door = 1.62 * (ease(rp(t, 2700, 3350)) - ease(rp(t, 6300, 7100)));
    st.inLight = clamp(st.door / 0.9, 0, 1);
    st.tubs = [0, 1, 2].map(function (i) { return eo(rp(t, 3050 + i * 260, 3350 + i * 260)) * (1 - rp(t, 6150, 6700)); });
    st.notes = rp(t, 3150, 3550) * (1 - rp(t, 6100, 6600));
    // the cook
    var fl = rp(t, 5500, 5800) * (1 - rp(t, 6000, 6900));
    st.flare = Math.pow(fl, 0.8);
    st.toss = Math.sin(clamp((t - 5450) / 900, 0, 1) * Math.PI * 2) * win(t, 5450, 6350, 60);
    st.cookV = ease(rp(t, 6450, 6900)) - ease(rp(t, 8700, 9150));
    st.plate = rp(t, 6800, 7150) * (1 - rp(t, 9350, 9900));
    st.plateDrop = 8 * (1 - eo(rp(t, 6800, 7150)));
    // the bead
    st.bead = null; st.segLit = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
      var r = RUN[i];
      if (t >= r[0] && t <= r[1]) st.bead = { seg: i, s: ease(rp(t, r[0], r[1])) };
      st.segLit[i] = win(t, r[0], r[1], 500) * 0.6;
    }
    if (!st.bead) {
      // resting at an eyelet
      st.bead = t < RUN[0][0] || t > RUN[2][1] ? { seg: 0, s: 0 } : t < RUN[1][0] ? { seg: 1, s: 0 } : { seg: 2, s: 0 };
    }
    st.pinLit = [
      Math.max(1 - rp(t, 0, 1100), rp(t, 8900, 9200)),
      win(t, 2700, 3900, 300),
      win(t, 5500, 7300, 300)
    ];
    return st;
  }

  var g = {};
  function threadSvg(t, st) {
    var s = '', i, sg, c;
    var keys = ['pos', 'fridge', 'cook'];
    // the glow under the line, the line, then the run's brighter part
    var paths = SEG.map(function (sg) { c = ctrl(sg, t); return { sg: sg, c: c, d: 'M' + n(sg.a[0]) + ' ' + n(sg.a[1]) + 'Q' + n(c[0]) + ' ' + n(c[1]) + ' ' + n(sg.b[0]) + ' ' + n(sg.b[1]) }; });
    paths.forEach(function (p, i) { s += '<path class="th-glow" d="' + p.d + '" style="opacity:' + n((0.35 + st.segLit[i]) * 100) / 100 + '"/>'; });
    paths.forEach(function (p, i) { s += '<path class="th" d="' + p.d + '" style="stroke-opacity:' + n((0.62 + st.segLit[i] * 0.6) * 100) / 100 + '"/>'; });
    // the eyelets
    keys.forEach(function (k, i) {
      var p = PIN[k], l = st.pinLit[i];
      if (l > 0.01) s += '<circle class="pin-halo" cx="' + n(p[0]) + '" cy="' + n(p[1]) + '" r="' + n(16 + 10 * l) + '" style="opacity:' + n(l * 100) / 100 + '"/>';
      s += '<path class="pin-post" d="M' + n(p[0]) + ' ' + n(p[1] + 3.5) + 'v' + (k === 'cook' ? -12 : 10) + '"/>';
      s += '<circle class="pin" cx="' + n(p[0]) + '" cy="' + n(p[1]) + '" r="3.4"/>';
    });
    // the bead and the bright stretch around it
    if (st.bead) {
      var p = paths[st.bead.seg], sg2 = p.sg;
      var u = arcU(sg2.a, p.c, sg2.b, st.bead.s);
      var q = qpt(sg2.a, p.c, sg2.b, u);
      var moving = st.bead.s > 0 && st.bead.s < 1;
      if (moving) {
        s += '<path class="th-hot-glow" d="' + qsub(sg2.a, p.c, sg2.b, Math.max(0, u - 0.16), Math.min(1, u + 0.05)) + '"/>';
        s += '<path class="th-hot" d="' + qsub(sg2.a, p.c, sg2.b, Math.max(0, u - 0.09), Math.min(1, u + 0.03)) + '"/>';
      }
      s += '<circle class="bead-halo" cx="' + n(q[0]) + '" cy="' + n(q[1]) + '" r="' + (moving ? 26 : 20) + '"/>';
      s += '<circle class="bead" cx="' + n(q[0]) + '" cy="' + n(q[1]) + '" r="5"/>';
    }
    return s;
  }

  // the example counts, as an architect's notes with leaders to the tubs
  var narrow = window.matchMedia('(max-width: 760px)');
  function notesSvg() {
    // on a phone the notes are set larger, so they stay legible
    var NOTE_X = narrow.matches ? -200 : -214, NOTE_NAME = -332;
    var s = '', first = null;
    var lit = TUBS.filter(function (t) { return t[2]; });
    lit.forEach(function (t, i) {
      var lz = LEVELS[t[0]], ty = t[1] - 13;
      var tp = pr(TUBX + 30.5, ty + 13, lz + 9), y = n(tp[1]);
      if (first == null) first = y;
      s += '<g class="hn" data-i="' + i + '">';
      s += '<path class="hn-lead" d="M' + (NOTE_X + 7) + ' ' + y + 'L' + n(tp[0] - 3) + ' ' + y + '"/>';
      s += '<circle class="hn-dot" cx="' + n(tp[0] - 1) + '" cy="' + y + '" r="2.4"/>';
      s += '<text class="hn-name" x="' + NOTE_NAME + '" y="' + n(y + 5) + '">' + t[2] + '</text>';
      s += '<text class="hn-count" x="' + NOTE_X + '" y="' + n(y + 6) + '" text-anchor="end">' + t[3] + '</text>';
      s += '</g>';
    });
    return '<text class="hn-ex" x="' + NOTE_NAME + '" y="' + n(first - 30) + '">Example</text>' + s;
  }

  /* ---------- put it on the page ---------- */
  var VB = '-470 -300 1000 860';
  function render() {
    var art = fig.querySelector('.hs-art'), notes = fig.querySelector('.hs-notes');
    art.innerHTML = '<svg class="hs-svg" viewBox="' + VB + '" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">' + buildScene() + '</svg>';
    notes.innerHTML = '<svg class="hs-svg" viewBox="' + VB + '" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">' + notesSvg() + '</svg>';
    var q = function (sel) { return art.querySelector(sel); };
    var onNarrow = function () {
      notes.innerHTML = '<svg class="hs-svg" viewBox="' + VB + '" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">' + notesSvg() + '</svg>';
      g.notes = [].slice.call(notes.querySelectorAll('.hn')); g.ex = notes.querySelector('.hn-ex');
      if (!motion) fig.classList.add('is-still');
    };
    if (narrow.addEventListener) narrow.addEventListener('change', onNarrow);
    g = {
      door: q('.fr-door'), inLight: q('.fr-light'), pan: q('.pan'), flare: q('.flare'), burn: q('.burn'),
      cook: q('.cook'), plate: q('.plate'), receipt: q('.receipt'), till: q('.till'), thread: q('.thread'),
      pools: q('.pools'),
      tubs: [].slice.call(art.querySelectorAll('.tub-lit')),
      notes: [].slice.call(notes.querySelectorAll('.hn')), ex: notes.querySelector('.hn-ex')
    };
  }

  var last = {};
  function put(key, el, html) { if (last[key] !== html) { last[key] = html; el.innerHTML = html; } }
  function apply(t, st, wall) {
    put('door', g.door, doorSvg(st.door));
    g.inLight.style.opacity = n(st.inLight * 100) / 100;
    put('pan', g.pan, panSvg(st.toss > 0 ? st.toss * 5 : 0, st.toss));
    g.flare.innerHTML = flareSvg(st.flare, wall);
    put('burn', g.burn, burnSvg(Math.round(wall / 90) * 90));
    put('cook', g.cook, cookSvg(st.cookV, Math.max(0, st.toss)));
    put('plate', g.plate, plateSvg(st.plate, st.plateDrop));
    put('receipt', g.receipt, receiptSvg(st.receipt, st.receiptA));
    put('till', g.till, tillSvg(st.pulse));
    g.thread.innerHTML = threadSvg(wall, st);
    g.tubs.forEach(function (el, i) { el.style.setProperty('--lit', n(st.tubs[i] * 100) / 100); el.classList.toggle('is-lit', st.tubs[i] > 0.02); });
    g.notes.forEach(function (el, i) { el.style.opacity = n(clamp(st.notes * 3 - i * 0.6, 0, 1) * 100) / 100; });
    g.ex.style.opacity = n(st.notes * 100) / 100;
    // the light drifts, very slowly
    g.pools.style.opacity = n((0.9 + 0.1 * Math.sin(wall / 2100)) * 100) / 100;
    g.pools.style.transform = 'translate(' + n(Math.sin(wall / 5300) * 6) + 'px,' + n(Math.cos(wall / 6100) * 3) + 'px)';
  }

  if (fig) {
    render();
    if (!motion) {
      apply(0, state(0, true), 0);
      fig.classList.add('is-still');
    } else {
      var t0 = performance.now(), raf = 0, visible = true, params = new URLSearchParams(location.search);
      // ?t=ms holds the loop at one moment (for review)
      var hold = params.has('t') ? +params.get('t') : null;
      var tick = function (now) {
        raf = 0;
        var wall = now - t0, t = hold != null ? hold : wall % LOOP;
        apply(t, state(t, false), hold != null ? hold : wall);
        if (visible && hold == null) raf = requestAnimationFrame(tick);
      };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
          if (visible && !raf) raf = requestAnimationFrame(tick);
        }).observe(fig);
      }
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && visible && !raf) raf = requestAnimationFrame(tick);
      });
      raf = requestAnimationFrame(tick);
      window.TooeyHeroAt = function (ms) { apply(ms, state(ms, false), ms); };
    }
  }

  /* ================================================================ */
  /* the headline: a tape finding its tracking                         */
  /* ================================================================ */
  var copy = document.querySelector('.hero-copy');
  var h1 = document.getElementById('hero-title');
  var lead = copy && copy.querySelector('.lead');
  if (!copy || !h1) return;
  if (!motion) { root.classList.remove('hero-wait'); return; }

  var BANDS = 9;
  function vhs(el) {
    var txt = el.textContent;
    el.innerHTML = '<span class="sr">' + txt + '</span>';
    var vis = document.createElement('span');
    vis.className = 'vhs';
    vis.setAttribute('aria-hidden', 'true');
    var html = '<span class="vhs-l vhs-warm">' + txt + '</span><span class="vhs-l vhs-cool">' + txt + '</span>' +
      '<span class="vhs-base">' + txt + '</span>';
    for (var i = 0; i < BANDS; i++) html += '<span class="vhs-l vhs-band">' + txt + '</span>';
    html += '<canvas class="vhs-noise" width="220" height="70"></canvas><span class="vhs-scan"></span><span class="vhs-track"></span>';
    vis.innerHTML = html;
    el.appendChild(vis);
    return {
      el: el, vis: vis,
      base: vis.querySelector('.vhs-base'), warm: vis.querySelector('.vhs-warm'), cool: vis.querySelector('.vhs-cool'),
      bands: [].slice.call(vis.querySelectorAll('.vhs-band')),
      noise: vis.querySelector('.vhs-noise'), scan: vis.querySelector('.vhs-scan'), track: vis.querySelector('.vhs-track')
    };
  }
  var H1 = vhs(h1), LD = lead ? vhs(lead) : null;
  var btns = [].slice.call(copy.querySelectorAll('.btn'));

  // a seeded random that changes every `step` ms, so the jumps read as frames of tape
  function rnd(seed) { var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  // tape static: short horizontal streaks, dark and light, row by row
  function noiseFill(cv, amt, seed) {
    var c = cv.getContext('2d'); if (!c) return;
    var w = cv.width, h = cv.height, img = c.createImageData(w, h), d = img.data, s = (seed * 9301 + 49297) % 233280;
    function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (var y = 0; y < h; y++) {
      var rowAmt = amt * (0.25 + r() * 1.5), x = 0;
      while (x < w) {
        var len = 2 + Math.floor(r() * 18), on = r() < rowAmt, light = r() < 0.4, al = on ? 40 + r() * 120 : 0;
        for (var k = 0; k < len && x < w; k++, x++) {
          var i = (y * w + x) * 4;
          if (light) { d[i] = 250; d[i + 1] = 248; d[i + 2] = 242; } else { d[i] = 35; d[i + 1] = 42; d[i + 2] = 47; }
          d[i + 3] = al;
        }
      }
    }
    c.putImageData(img, 0, 0);
  }

  // one frame of the effect: k (0..1) how disturbed it is, roll in em, seed
  function frame(V, k, roll, seed, opts) {
    opts = opts || {};
    var split = opts.split != null ? opts.split : k * 9;
    var jx = (rnd(seed + 3) - 0.5) * k * 6;
    V.warm.style.transform = 'translate(' + n(-split + jx) + 'px,' + n(roll) + 'em)';
    V.cool.style.transform = 'translate(' + n(split * 0.8 + jx) + 'px,' + n(roll) + 'em)';
    V.warm.style.opacity = V.cool.style.opacity = split > 0.15 ? Math.min(0.85, 0.3 + split / 6) : 0;
    var tear = opts.tear != null ? opts.tear : k;
    if (tear > 0.02) {
      V.base.style.visibility = 'hidden';
      // partition the height into bands; some jump sideways
      var cuts = [0];
      for (var i = 1; i < BANDS; i++) cuts.push(i / BANDS + (rnd(seed * 7 + i) - 0.5) * 0.08);
      cuts.push(1);
      V.bands.forEach(function (b, i) {
        var top = cuts[i] * 100, bot = (1 - cuts[i + 1]) * 100;
        var r = rnd(seed * 13 + i * 3.1);
        var dx = r < tear * 0.55 ? (rnd(seed * 5 + i) - 0.5) * 70 * tear : (rnd(seed * 3 + i) - 0.5) * 3 * tear;
        if (opts.only != null) dx = i === opts.only ? opts.dx : 0;
        b.style.clipPath = 'inset(' + n(top - 0.2) + '% -20% ' + n(bot - 0.2) + '% -20%)';
        b.style.transform = 'translate(' + n(dx + jx) + 'px,' + n(roll) + 'em)';
        b.style.visibility = 'visible';
      });
    } else {
      V.base.style.visibility = '';
      V.base.style.transform = roll ? 'translateY(' + n(roll) + 'em)' : '';
      V.bands.forEach(function (b) { b.style.visibility = 'hidden'; });
    }
    var nz = opts.noise != null ? opts.noise : k;
    V.noise.style.opacity = nz > 0.02 ? n(nz * 0.8 * 100) / 100 : 0;
    if (nz > 0.02) noiseFill(V.noise, 0.1 + nz * 0.22, seed);
    V.scan.style.opacity = n((opts.scan != null ? opts.scan : k) * 100) / 100;
    var tr = opts.track != null ? opts.track : k;
    V.track.style.opacity = tr > 0.05 ? n(tr * 100) / 100 : 0;
    if (tr > 0.05) V.track.style.top = n((rnd(seed * 0.5) * 120 - 20)) + '%';
    V.vis.style.opacity = opts.op != null ? opts.op : 1;
  }
  function clean(V) { frame(V, 0, 0, 0, { split: 0, tear: 0, noise: 0, scan: 0, track: 0 }); }

  // the opening: about 1.4 s for the headline, the line under it a beat behind
  var INTRO = 1450, LEAD_AT = 220, LEAD_DUR = 1150;
  function introAt(V, t, dur, amp) {
    var p = t / dur;
    if (p >= 1) { clean(V); return true; }
    var seed = Math.floor(t / 55);
    // signal: nothing, then flickers in, then holds
    var op = p < 0.07 ? 0 : p < 0.32 ? (rnd(seed * 1.3) < 0.75 ? 0.55 + rnd(seed) * 0.45 : 0.15) : 1;
    // disturbance falls away; one last small kick near the end
    var k = amp * (p < 0.3 ? 1 : p < 0.8 ? 1 - (p - 0.3) / 0.5 * 0.85 : 0.15 * (1 - (p - 0.8) / 0.2));
    if (p > 0.84 && p < 0.88) k = amp * 0.35;
    // a vertical roll that settles: the picture slips up and catches
    var roll = p < 0.42 ? (1 - p / 0.42) * -0.35 * ((seed % 2) ? 1 : 0.6) : 0;
    frame(V, k, roll, seed, {
      op: op,
      noise: p < 0.45 ? amp * (1 - p / 0.45) : 0,
      scan: p < 0.85 ? amp * 0.9 * (1 - p / 0.85) : 0,
      track: p < 0.6 ? amp * (1 - p / 0.6) : 0
    });
    return false;
  }

  function start() {
    root.classList.remove('hero-wait');
    root.classList.add('hero-run');
    var s0 = performance.now();
    window.TooeyHeroStart = s0;
    (function run(now) {
      var t = now - s0;
      var a = introAt(H1, t, INTRO, 1);
      var b = LD ? (t < LEAD_AT ? (frame(LD, 0, 0, 0, { op: 0, noise: 0, scan: 0, track: 0, split: 0, tear: 0 }), false) : introAt(LD, t - LEAD_AT, LEAD_DUR, 0.6)) : true;
      btns.forEach(function (bt) { bt.style.opacity = clamp((t - 1250) / 400, 0, 1); });
      if (!(a && b) || t < 1700) requestAnimationFrame(run);
      else { btns.forEach(function (bt) { bt.style.opacity = ''; }); root.classList.remove('hero-run'); later(); }
    })(s0);
  }

  // now and then, a small glitch: a quick colour split, or one slice slips
  function later() {
    setTimeout(function () {
      if (document.hidden) { later(); return; }
      var kind = Math.random() < 0.5 ? 'split' : 'slice';
      var V = Math.random() < 0.8 || !LD ? H1 : LD;
      var dur = kind === 'split' ? 200 : 140, s0 = performance.now(), band = Math.floor(Math.random() * BANDS);
      var dx = (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 8);
      (function g(now) {
        var t = now - s0, seed = Math.floor(t / 50);
        if (t >= dur) { clean(V); later(); return; }
        if (kind === 'split') frame(V, 0, 0, seed, { split: 3.5 * (1 - t / dur) + 1, tear: 0, noise: 0, scan: 0.25, track: 0 });
        else frame(V, 0, 0, seed, { split: 1.5, tear: 0.5, only: band, dx: dx, noise: 0, scan: 0, track: 0 });
        requestAnimationFrame(g);
      })(s0);
    }, 7000 + Math.random() * 3000);
  }

  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise(function (r) { setTimeout(r, 700); })]).then(function () { requestAnimationFrame(start); });
})();
