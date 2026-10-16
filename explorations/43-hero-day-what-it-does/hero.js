/* Tooey, exploration 43: one day at the restaurant, on scroll, telling what
   Tooey does (42, revised).
   40's room (the dining room, the pass, the kitchen) as a 3D set, filmed by a
   moving camera and drawn on a canvas. The day is driven by scroll, not by a
   clock: the hero pins while the visitor scrolls through it, and scrolling
   back runs it backwards. Only small idle things run on time (steam, flames,
   pendants, a breath of the camera, people shifting in their seats).

   The day, by progress (0..1, written below as s = 0..10):
   night at the till: the camera comes close, and beside the night's sales
   the screen draws tomorrow's forecast (Forecast) -> the receipt prints and
   flies back through the pass to the fridge, night turning to morning ->
   the fridge opens by the prep sheet (Prep) -> a portion of meat goes to the
   pan and sears -> the pan becomes a plate on the pass -> a server takes it
   out to its table in a full, lamplit room (Shifts), and the day ends there.

   As the day starts, the headline fades; the three key words of the lead
   underline and fly up to a rail under the header. Each then gets a note in
   a third of the screen with its moment, alternating left and right.

   Light is computed, not washed on: each surface is its colour times the light
   that reaches it (ambient for the room, plus every lamp by distance), and
   pools of lamplight are added on top. Night is basalt dark, morning crisp.

   The headline comes on like a VHS tape locking in (39). The real words stay
   in the HTML; the animated copies are aria-hidden.
   Under reduced motion: no pin, no scroll animation, no glitch; one still,
   and the three notes as a plain row under it.
   ?p=<0..1> holds the day at that progress, ?freeze=<s> the headline (review). */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var fig = document.querySelector('.pass-scene');
  var art = fig && fig.querySelector('.pass-art');
  if (!art) return;
  var heroEl = fig.closest('.hero');
  var pinEl = fig.closest('.hero-pin');
  var params = new URLSearchParams(location.search);
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  var fixedP = params.has('p') ? clamp(parseFloat(params.get('p')) || 0, 0, 1) : null;
  var freeze = params.has('freeze') ? parseFloat(params.get('freeze')) : null;
  var liveIdle = params.has('live');

  /* ---------- small maths ---------- */
  function sm(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function smr(x) { x = clamp(x, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); }
  function eio(x) { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function ramp(s, a, b) { return sm((s - a) / (b - a)); }
  function lin(s, a, b) { return clamp((s - a) / (b - a), 0, 1); }
  function env(s, a, b, c, d) { return s <= a || s >= d ? 0 : s < b ? sm((s - a) / (b - a)) : s <= c ? 1 : 1 - sm((s - c) / (d - c)); }
  function v3(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
  function add3(a, b, k) { if (k == null) k = 1; return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function len3(a) { return Math.sqrt(dot3(a, a)); }
  function nrm3(a) { var l = len3(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function bez(P, u) {
    var v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
    return [0, 1, 2].map(function (i) { return a * P[0][i] + b * P[1][i] + c * P[2][i] + d * P[3][i]; });
  }
  var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(42);

  /* ---------- colour ---------- */
  var HX = {};
  function col(h) {
    if (typeof h !== 'string') return h;
    return HX[h] || (HX[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  }
  function css(c, a) {
    var r = Math.round(clamp(c[0], 0, 255)), g = Math.round(clamp(c[1], 0, 255)), b = Math.round(clamp(c[2], 0, 255));
    return a == null || a >= 1 ? 'rgb(' + r + ',' + g + ',' + b + ')' : 'rgba(' + r + ',' + g + ',' + b + ',' + clamp(a, 0, 1).toFixed(3) + ')';
  }
  function mixc(a, b, k) { a = col(a); b = col(b); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
  function tmv(v) { v /= 255; return 255 * (v <= 0.7 ? v : 0.7 + 0.3 * (1 - Math.exp(-(v - 0.7) / 0.3))); }
  function mulL(c, L) { c = col(c); return [tmv(c[0] * L[0]), tmv(c[1] * L[1]), tmv(c[2] * L[2])]; }
  function scl(c, k) { c = col(c); return [c[0] * k, c[1] * k, c[2] * k]; }
  function lum(c) { return (0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]) / 255; }

  /* ---------- the canvas ---------- */
  var cv = document.createElement('canvas');
  cv.className = 'pass-cv';
  cv.setAttribute('aria-hidden', 'true');
  art.appendChild(cv);
  var ctx = cv.getContext('2d', { alpha: false });
  var VW = 1440, VH = 816, PPX = 900, PPY = 380, F = 816, NEAR = 0.1, DPR = 1;
  function base() { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  var ADD = 'lighter';   // light is added over the drawing

  /* ---------- the camera ---------- */
  var cam = { x: 0, y: 0, z: -3, yaw: 0, pitch: 0 }, cY = 1, sY = 0, cP = 1, sP = 0;
  function setCam(c) { cam = c; cY = Math.cos(c.yaw); sY = Math.sin(c.yaw); cP = Math.cos(c.pitch); sP = Math.sin(c.pitch); }
  function toCam(p) {
    var dx = p[0] - cam.x, dy = p[1] - cam.y, dz = p[2] - cam.z;
    var x = dx * cY - dz * sY, z1 = dx * sY + dz * cY;
    return [x, dy * cP - z1 * sP, dy * sP + z1 * cP];
  }
  function scr(c) { return [PPX + F * c[0] / c[2], PPY - F * c[1] / c[2]]; }
  function P2(p) { var c = toCam(p); return c[2] < NEAR ? null : scr(c); }
  function camPos() { return [cam.x, cam.y, cam.z]; }
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
  function wf(z) { return clamp(Math.sqrt(2.6 / z), 0.55, 1.6); }   // line weight by depth

  /* ---------- light ---------- */
  // every lamp: a position, a colour (0..1 per channel), a reach (half-intensity
  // distance) and the rooms it lights. LI holds each lamp's intensity this frame.
  var LAMPS = [], LI = [];
  function lamp(p, h, r, rooms) {
    var c = col(h);
    LAMPS.push({ p: p, c: [c[0] / 255, c[1] / 255, c[2] / 255], r: r, rooms: rooms });
    LI.push(0);
    return LAMPS.length - 1;
  }
  var AMB = { d: [1, 1, 1], k: [1, 1, 1] };
  function falloff(l, p) {
    var dx = p[0] - l.p[0], dy = p[1] - l.p[1], dz = p[2] - l.p[2];
    return 1 / (1 + (dx * dx + dy * dy + dz * dz) / (l.r * l.r));
  }
  function lightAt(p, room, lf) {
    var a = AMB[room], L = [a[0], a[1], a[2]];
    for (var i = 0; i < LAMPS.length; i++) {
      var I = LI[i];
      if (I < 0.003) continue;
      var l = LAMPS[i];
      if (l.rooms.indexOf(room) < 0) continue;
      var f = lf ? lf[i] : falloff(l, p);
      L[0] += l.c[0] * I * f; L[1] += l.c[1] * I * f; L[2] += l.c[2] * I * f;
    }
    return L;
  }
  // the ink: slate on lit paper; on a dark surface the line turns to ash, so the
  // drawing still reads at night, like the site's basalt footer
  var SLATE = [35, 42, 47], ASH = [196, 190, 178];
  var LA = { k: 0.62, q: 0.42, d: 0.28, x: 0.15 }, LW = { k: 1.15, q: 0.85, d: 0.65, x: 0.6 };
  function ink(fc, cls, room, mul) {
    var l = fc ? lum(fc) : 0.5, k = sm((l - 0.1) / 0.28);
    var a = LA[cls] * (room === 'k' ? 0.88 : 1) * lerp(0.42, 1, k) * (mul == null ? 1 : mul);
    return css(mixc(ASH, SLATE, k), a);
  }

  /* ---------- shapes: re-projected every frame ---------- */
  function Item(rings, m, closed) {
    if (typeof rings[0][0] === 'number') rings = [rings];
    var it = { r: rings, closed: closed, c: m.c ? col(m.c) : null, ref: m.ref ? col(m.ref) : null, e: m.e || null, ln: m.ln || null,
      tw: m.tw || 0, tc: m.tc ? col(m.tc) : null,
      room: m.room || 'd', lit: m.lit !== false, a: m.a == null ? 1 : m.a, sh: m.sh || null, rule: m.rule || 'nonzero',
      lm: m.lm == null ? 1 : m.lm, hide: false };
    var sx = 0, sy = 0, sz = 0, k = 0;
    rings.forEach(function (ring) { ring.forEach(function (p) { sx += p[0]; sy += p[1]; sz += p[2]; k++; }); });
    it.cent = [sx / k, sy / k, sz / k];
    it.lf = null;
    it.dk = 1;
    var r0 = rings[0];
    if (closed && r0.length >= 3) {
      var n = nrm3(cross3(sub3(r0[1], r0[0]), sub3(r0[2], r0[0])));
      if (len3(n) > 0.5) it.dk = n[1] * n[1] * (it.cent[1] < 0 ? 1.03 : 0.8) + n[0] * n[0] * 0.84 + n[2] * n[2] * 0.95;
    }
    return it;
  }
  function prepLight(it) { it.lf = LAMPS.map(function (l) { return falloff(l, it.cent); }); }
  function poly(list, rings, m) { var it = Item(rings, m, true); list.push(it); return it; }
  function lines(list, segs, m) { var it = Item(segs, m, false); list.push(it); return it; }
  function seg(a, b) { return [a, b]; }

  var bb = [0, 0, 0, 0];
  function trace(it) {
    var zs = 0, zc = 0, any = false;
    bb[0] = 1e9; bb[1] = 1e9; bb[2] = -1e9; bb[3] = -1e9;
    ctx.beginPath();
    for (var i = 0; i < it.r.length; i++) {
      var ring = it.r[i], cs = [], j, p;
      for (j = 0; j < ring.length; j++) cs.push(toCam(ring[j]));
      if (it.closed) {
        cs = clipPoly(cs);
        if (cs.length < 3) continue;
        for (j = 0; j < cs.length; j++) {
          p = scr(cs[j]);
          if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
          if (p[1] < bb[1]) bb[1] = p[1]; if (p[1] > bb[3]) bb[3] = p[1];
          if (p[0] < bb[0]) bb[0] = p[0]; if (p[0] > bb[2]) bb[2] = p[0];
          zs += cs[j][2]; zc++;
        }
        ctx.closePath();
        any = true;
      } else {
        var pen = false;
        for (j = 0; j < cs.length - 1; j++) {
          var a = cs[j], b = cs[j + 1];
          if (a[2] < NEAR && b[2] < NEAR) { pen = false; continue; }
          var a2 = a[2] < NEAR ? cut(a, b) : a, b2 = b[2] < NEAR ? cut(a, b) : b;
          if (a[2] < NEAR) pen = false;
          var pa = scr(a2), pb = scr(b2);
          if (!pen) ctx.moveTo(pa[0], pa[1]);
          ctx.lineTo(pb[0], pb[1]);
          pen = b[2] >= NEAR;
          zs += a2[2] + b2[2]; zc += 2; any = true;
        }
      }
    }
    return any ? zs / zc : -1;
  }
  function drawItem(it) {
    if (it.hide) return;
    var z = trace(it);
    if (z < 0) return;
    var fc = null;
    if (it.e) {
      fc = it.e();
      ctx.fillStyle = css(fc, it.a);
      ctx.fill(it.rule);
    } else if (it.c) {
      var L = it.lit ? lightAt(it.cent, it.room, it.lf) : AMB[it.room];
      if (it.dk !== 1) L = [L[0] * it.dk, L[1] * it.dk, L[2] * it.dk];
      fc = mulL(it.c, L);
      if (it.sh && bb[3] - bb[1] > 4) {
        var g = ctx.createLinearGradient(0, bb[1], 0, bb[3]);
        g.addColorStop(0, css(scl(fc, it.sh[0]), it.a));
        g.addColorStop(0.5, css(scl(fc, it.sh[1]), it.a));
        g.addColorStop(1, css(scl(fc, it.sh[2]), it.a));
        ctx.fillStyle = g;
      } else ctx.fillStyle = css(fc, it.a);
      ctx.fill(it.rule);
    }
    if (it.tw) {
      var Lt = it.lit ? lightAt(it.cent, it.room, it.lf) : AMB[it.room], tcol = mulL(it.tc, Lt);
      ctx.lineWidth = Math.max(0.8, F * it.tw / z);
      ctx.strokeStyle = css(scl(tcol, 0.6));
      ctx.stroke();
      ctx.lineWidth = Math.max(0.5, F * it.tw / z - 1.6);
      ctx.strokeStyle = css(tcol);
      ctx.stroke();
      return;
    }
    if (it.ln) {
      if (!fc) fc = it.ref ? mulL(it.ref, it.lit ? lightAt(it.cent, it.room, it.lf) : AMB[it.room]) : null;
      ctx.lineWidth = LW[it.ln] * wf(z);
      ctx.strokeStyle = ink(fc, it.ln, it.room, it.lm);
      ctx.stroke();
    }
  }
  function drawList(list) { for (var i = 0; i < list.length; i++) drawItem(list[i]); }

  /* ---------- screen helpers ---------- */
  function hull(pts) {
    pts = pts.filter(Boolean).slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (pts.length < 3) return pts;
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [], i;
    for (i = 0; i < pts.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
    up.pop(); lo.pop();
    return lo.concat(up);
  }
  function polyPath(pts) {
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) if (i) ctx.lineTo(pts[i][0], pts[i][1]); else ctx.moveTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }
  // a smooth closed curve through the midpoints of a polygon
  function smoothPath(pts, closed) {
    ctx.beginPath();
    var n = pts.length;
    if (n < 3) { polyPath(pts); return; }
    if (closed !== false) {
      var m0 = mid(pts[n - 1], pts[0]);
      ctx.moveTo(m0[0], m0[1]);
      for (var i = 0; i < n; i++) { var m = mid(pts[i], pts[(i + 1) % n]); ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
      ctx.closePath();
    } else {
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var j = 1; j < n - 1; j++) { var mm = mid(pts[j], pts[j + 1]); ctx.quadraticCurveTo(pts[j][0], pts[j][1], mm[0], mm[1]); }
      ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
    }
  }
  function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  function smoothPathCont(pts) {
    var n = pts.length;
    ctx.lineTo(pts[0][0], pts[0][1]);
    for (var j = 1; j < n - 1; j++) { var mm = mid(pts[j], pts[j + 1]); ctx.quadraticCurveTo(pts[j][0], pts[j][1], mm[0], mm[1]); }
    ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
  function projAll(ps) { var out = []; for (var i = 0; i < ps.length; i++) { var p = P2(ps[i]); if (!p) return null; out.push(p); } return out; }
  function ringPts(c, r, n, rz, a0) {
    var out = []; rz = rz == null ? r : rz; a0 = a0 || 0;
    for (var i = 0; i < n; i++) { var a = a0 + i / n * Math.PI * 2; out.push([c[0] + r * Math.cos(a), c[1], c[2] + rz * Math.sin(a)]); }
    return out;
  }
  function ringY(cx, y, cz, r, k) { return ringPts([cx, y, cz], r, k || 28); }
  // an ellipse lying in a world plane (axes u, v), as an affine of the unit circle
  function planeXf(c, u, v) {
    var o = P2(c), a = P2(add3(c, u)), b = P2(add3(c, v));
    if (!o || !a || !b) return null;
    return [a[0] - o[0], a[1] - o[1], b[0] - o[0], b[1] - o[1], o[0], o[1]];
  }
  function setXf(x) { ctx.setTransform(DPR * x[0], DPR * x[1], DPR * x[2], DPR * x[3], DPR * x[4], DPR * x[5]); }
  // a soft radial sprite, rendered once per colour and falloff
  var SPR = {};
  function sprite(rgb, stops) {
    var key = rgb.map(Math.round).join(',') + '|' + stops.join(';');
    if (SPR[key]) return SPR[key];
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(function (st) { g.addColorStop(st[0], css(rgb, st[1])); });
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return (SPR[key] = c);
  }
  // a pool of light on a plane, added to what is under it
  function pool(c, u, v, rgb, a, stops) {
    if (a < 0.004) return;
    var x = planeXf(c, u, v);
    if (!x) return;
    setXf(x);
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.drawImage(sprite(rgb, stops || [[0, 1], [0.35, 0.6], [0.7, 0.2], [1, 0]]), -1, -1, 2, 2);
    ctx.globalAlpha = 1;
    base();
  }
  // a soft halo round a point, in screen space
  function halo(p, r, rgb, a, stops) {
    if (a < 0.004) return;
    var c = toCam(p);
    if (c[2] < 0.15) return;
    var o = scr(c), R = F * r / c[2];
    if (o[0] + R < 0 || o[0] - R > VW || o[1] + R < 0 || o[1] - R > VH) return;
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.drawImage(sprite(rgb, stops || [[0, 1], [0.25, 0.5], [0.6, 0.14], [1, 0]]), o[0] - R, o[1] - R, 2 * R, 2 * R);
    ctx.globalAlpha = 1;
  }
  // a capsule tapering from (a, ra) to (b, rb), in screen space
  // a limb through three points (shoulder, elbow, wrist; hip, knee, ankle) as
  // one outline, rounded at both ends, so no seam shows at the joint
  function tube(P, R) {
    var a = P[0], b = P[1], c = P[2];
    var d1 = nrm2([b[0] - a[0], b[1] - a[1]]), d2 = nrm2([c[0] - b[0], c[1] - b[1]]);
    var n1 = [-d1[1], d1[0]], n2 = [-d2[1], d2[0]], nm = nrm2([n1[0] + n2[0], n1[1] + n2[1]]);
    var cs = Math.max(0.55, nm[0] * n1[0] + nm[1] * n1[1]), turn = d1[0] * d2[1] - d1[1] * d2[0];
    // the outside of the bend swells a little; the inside creases
    var ro = R[1] / cs, ri = R[1];
    var rp = turn > 0 ? ri : ro, rm = turn > 0 ? ro : ri;
    var a0 = Math.atan2(n1[1], n1[0]), a2 = Math.atan2(n2[1], n2[0]);
    ctx.beginPath();
    ctx.moveTo(a[0] + n1[0] * R[0], a[1] + n1[1] * R[0]);
    ctx.quadraticCurveTo(b[0] + nm[0] * rp, b[1] + nm[1] * rp, c[0] + n2[0] * R[2], c[1] + n2[1] * R[2]);
    ctx.arc(c[0], c[1], R[2], a2, a2 - Math.PI, true);
    ctx.quadraticCurveTo(b[0] - nm[0] * rm, b[1] - nm[1] * rm, a[0] - n1[0] * R[0], a[1] - n1[1] * R[0]);
    ctx.arc(a[0], a[1], R[0], a0 + Math.PI, a0, true);
    ctx.closePath();
  }
  function nrm2(v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
  function capsule(a, ra, b, rb, keep) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    if (!keep) ctx.beginPath();
    if (L < Math.abs(ra - rb) + 0.01) { var R = Math.max(ra, rb), c = ra > rb ? a : b; ctx.moveTo(c[0] + R, c[1]); ctx.arc(c[0], c[1], R, 0, Math.PI * 2); return; }
    var th = Math.atan2(dy, dx), al = Math.asin(clamp((ra - rb) / L, -1, 1)), a0 = th + Math.PI / 2 + al;
    ctx.moveTo(a[0] + ra * Math.cos(a0), a[1] + ra * Math.sin(a0));
    ctx.arc(a[0], a[1], ra, a0, th + 3 * Math.PI / 2 - al);
    ctx.arc(b[0], b[1], rb, th - Math.PI / 2 - al, th + Math.PI / 2 + al);
    ctx.closePath();
  }
  function fillStroke(fc, a, cls, room, z, lm) {
    ctx.fillStyle = css(fc, a);
    ctx.fill();
    if (cls) { ctx.lineWidth = LW[cls] * wf(z); ctx.strokeStyle = ink(fc, cls, room, lm); ctx.stroke(); }
  }

  /* ======================================================================
     THE SET (metres): x right, y up (eye height 0), z away from the start
     ====================================================================== */
  var FL = -1.55, DC = 1.75, XL = -4.6, XR = 3.3, ZB = -8;
  var PZ = 3.4, PZ2 = 3.75, OX = 1.3, OT = 0.95, OB = -0.55;
  var K0 = 3.75, KZ = 7.0, KX = 1.9, KC = 1.25, TY = -0.8;

  /* ---- the lamps ---- */
  var TABLES = [
    { x: 1.85, z: 2.4, night: true, dest: true },   // by the pass: its lamp stays on at night; the dish goes here
    { x: -1.9, z: 2.2 },
    { x: -3.0, z: 0.5 },
    { x: 0.95, z: 0.9 },
    { x: -1.65, z: -0.05 }
  ];
  TABLES.forEach(function (tb) {
    tb.L = lamp([tb.x, 0.42, tb.z], '#ffc285', 1.0, 'd');
    tb.C = lamp([tb.x, TY + 0.14, tb.z], '#ffb066', 0.32, 'd');
  });
  var HS = { x0: 0.75, x1: 1.55, z0: -1.95, z1: -1.45, top: -0.42 };   // the host stand and its till
  var L_TILL = lamp([0.95, -0.2, -1.82], '#ffdca6', 0.55, 'd');
  var LX = [-1.0, -0.4, 0.75], LZ = 3.58, LY = 0.7;
  var L_HEAT = LX.map(function (lx) { return lamp([lx, 0.45, LZ], '#ffae63', 0.55, 'dk'); });
  var L_STRIP = lamp([0, 1.05, 5.5], '#f3f5f4', 1.7, 'k');
  var FX0 = 0.45, FX1 = 1.55, FZ = 5.0, FT = 0.78, FD = 0.68;      // the fridge
  var L_FRIDGE = lamp([(FX0 + FX1) / 2, 0.45, FZ + 0.3], '#eaf6fa', 0.5, 'k');
  var RX0 = -KX + 0.05, RX1 = -0.15, RZ = 6.38, RY = -0.6;          // the range
  var PB = [-0.55, RY + 0.012, 6.62];                              // the pan's burner
  var L_FLARE = lamp([PB[0], PB[1] + 0.45, PB[2] + 0.05], '#ffa94f', 0.5, 'k');
  var L_SKY = lamp([0, 1.6, 1.6], '#fff6e6', 2.4, 'd');            // morning through the skylight

  /* ---- layers ---- */
  var KSH = [];      // the kitchen's shell, back to front
  var KPASS = [];    // the pass, kitchen side (nearer than everything in the kitchen)
  var DSH = [];      // the dining room's shell and the pass wall
  var mK = function (c, ln, ex) { var m = { c: c, ln: ln, room: 'k' }; for (var k in ex || {}) m[k] = ex[k]; return m; };
  var mD = function (c, ln, ex) { var m = { c: c, ln: ln, room: 'd' }; for (var k in ex || {}) m[k] = ex[k]; return m; };

  /* ---- the kitchen ---- */
  poly(KSH, [[-KX, KC, K0], [KX, KC, K0], [KX, KC, KZ], [-KX, KC, KZ]], mK('#dcd9d2', null, { lit: false, sh: [0.86, 0.95, 1.02] }));
  poly(KSH, [[-KX, KC, K0], [-KX, KC, KZ], [-KX, FL, KZ], [-KX, FL, K0]], mK('#dedbd4', null, { lit: false, sh: [0.9, 1, 0.9] }));
  poly(KSH, [[KX, KC, K0], [KX, KC, KZ], [KX, FL, KZ], [KX, FL, K0]], mK('#e2dfd9', null, { lit: false, sh: [0.9, 1, 0.9] }));
  poly(KSH, [[-KX, KC, KZ], [KX, KC, KZ], [KX, FL, KZ], [-KX, FL, KZ]], mK('#e4e2dc', null, { lit: false, sh: [0.88, 1.0, 0.92] }));
  poly(KSH, [[-KX, 0.8, KZ - 0.002], [KX, 0.8, KZ - 0.002], [KX, FL, KZ - 0.002], [-KX, FL, KZ - 0.002]], mK('#5a6863', null, { lit: false, sh: [1.08, 1, 0.86] }));
  poly(KSH, [[-KX + 0.002, 0.8, K0], [-KX + 0.002, 0.8, KZ], [-KX + 0.002, FL, KZ], [-KX + 0.002, FL, K0]], mK('#55635e', null, { lit: false, sh: [1.06, 1, 0.84] }));
  lines(KSH, [seg([-KX, 0.8, KZ - 0.003], [KX, 0.8, KZ - 0.003]), seg([-KX + 0.003, 0.8, K0], [-KX + 0.003, 0.8, KZ])], mK(null, 'q', { ref: '#5a6863', lit: false }));
  poly(KSH, [[-KX, FL, K0], [KX, FL, K0], [KX, FL, KZ], [-KX, FL, KZ]], mK('#7a746c', null, { lit: false, sh: [0.92, 1, 0.9] }));
  lines(KSH, [seg([-KX, KC, K0], [-KX, KC, KZ]), seg([KX, KC, K0], [KX, KC, KZ]), seg([-KX, FL, KZ], [-KX, KC, KZ]), seg([KX, FL, KZ], [KX, KC, KZ]), seg([-KX, KC, KZ], [KX, KC, KZ]), seg([-KX, FL, KZ], [KX, FL, KZ])], mK(null, 'k', { ref: '#ecebe7', lit: false }));
  var kfl = [];
  for (var qx = -KX + 0.3; qx < KX; qx += 0.3) kfl.push(seg([qx, FL, K0], [qx, FL, KZ]));
  for (var qz = K0 + 0.3; qz < KZ; qz += 0.3) kfl.push(seg([-KX, FL, qz], [KX, FL, qz]));
  lines(KSH, kfl, mK(null, 'x', { ref: '#7a746c', lit: false, lm: 1.6 }));
  // the strip light
  poly(KSH, [[-0.3, KC - 0.01, 4.6], [0.3, KC - 0.01, 4.6], [0.3, KC - 0.01, 6.4], [-0.3, KC - 0.01, 6.4]], mK(null, 'q', { e: function () { return mixc('#cfd1d0', '#fbfcfb', clamp(LI[L_STRIP] / 1.2, 0, 1)); } }));
  // tiles behind the range
  var tl = [], row = 0, ty, tx;
  for (ty = FL + 0.12; ty <= 0.78; ty += 0.12) { tl.push(seg([-KX, ty, KZ - 0.003], [KX, ty, KZ - 0.003])); tl.push(seg([-KX + 0.003, ty, K0], [-KX + 0.003, ty, KZ])); }
  for (ty = FL + 0.12; ty < 0.76; ty += 0.12, row++) {
    for (tx = -KX + (row % 2 ? 0.12 : 0.24); tx < KX; tx += 0.24) tl.push(seg([tx, ty, KZ - 0.003], [tx, ty + 0.12, KZ - 0.003]));
    for (var tz = K0 + (row % 2 ? 0.12 : 0.24); tz < KZ; tz += 0.24) tl.push(seg([-KX + 0.003, ty, tz], [-KX + 0.003, ty + 0.12, tz]));
  }
  lines(KSH, tl, mK(null, 'x', { ref: '#5a6863', lit: false, lm: 1.4 }));
  // the window on the back wall: night, then morning, then dusk through it
  var WX0 = -0.02, WX1 = 0.6, WY0 = -0.02, WY1 = 0.98;
  poly(KSH, [[WX0 - 0.05, WY0 - 0.05, KZ], [WX1 + 0.05, WY0 - 0.05, KZ], [WX1 + 0.05, WY1 + 0.05, KZ], [WX0 - 0.05, WY1 + 0.05, KZ]], mK('#d8d4cb', 'q', { lit: false }));
  var SKYC = [0, 0, 0];
  poly(KSH, [[WX0, WY0, KZ], [WX1, WY0, KZ], [WX1, WY1, KZ], [WX0, WY1, KZ]], mK(null, 'k', { e: function () { return SKYC; } }));
  lines(KSH, [seg([(WX0 + WX1) / 2, WY0, KZ], [(WX0 + WX1) / 2, WY1, KZ]), seg([WX0, 0.5, KZ], [WX1, 0.5, KZ])], mK(null, 'q', { ref: '#d8d4cb', lit: false }));
  poly(KSH, [[WX0 - 0.08, WY0 - 0.05, KZ], [WX1 + 0.08, WY0 - 0.05, KZ], [WX1 + 0.08, WY0 - 0.05, KZ - 0.1], [WX0 - 0.08, WY0 - 0.05, KZ - 0.1]], mK('#e9e6df', 'q'));
  poly(KSH, [[0.06, WY0 - 0.05, KZ - 0.05], [0.15, WY0 - 0.05, KZ - 0.05], [0.15, WY0 + 0.15, KZ - 0.05], [0.06, WY0 + 0.15, KZ - 0.05]], mK('#9fb08a', 'q'));
  poly(KSH, [[0.38, WY0 - 0.05, KZ - 0.05], [0.51, WY0 - 0.05, KZ - 0.05], [0.51, WY0 + 0.08, KZ - 0.05], [0.38, WY0 + 0.08, KZ - 0.05]], mK('#d9c7a6', 'q'));
  // an open shelf on the back wall, right of the window
  poly(KSH, [[0.95, 0.42, KZ], [1.7, 0.42, KZ], [1.7, 0.42, KZ - 0.28], [0.95, 0.42, KZ - 0.28]], mK('#d3cfc6', 'q'));
  [[1.02, 0.1, '#b9a98c'], [1.17, 0.13, '#8d9a8e'], [1.33, 0.09, '#c8b9a0'], [1.47, 0.16, '#9a8a78'], [1.6, 0.11, '#bfc4c2']].forEach(function (j) {
    poly(KSH, [[j[0], 0.42, KZ - 0.12], [j[0] + 0.1, 0.42, KZ - 0.12], [j[0] + 0.1, 0.42 + j[1], KZ - 0.12], [j[0], 0.42 + j[1], KZ - 0.12]], mK(j[2], 'q'));
  });
  // the hood
  var HX0 = -KX + 0.02, HX1 = -0.1, HZ = 6.2, HY = 0.8;
  poly(KSH, [[HX0, HY, HZ], [HX1, HY, HZ], [HX1, HY, KZ], [HX0, HY, KZ]], mK('#9da3a5', null));
  poly(KSH, [[HX1, HY, HZ], [HX1, HY + 0.2, HZ], [HX1, KC, HZ + 0.45], [HX1, KC, KZ], [HX1, HY, KZ]], mK('#cfd3d3', 'q'));
  poly(KSH, [[HX0, HY + 0.2, HZ], [HX1, HY + 0.2, HZ], [HX1, KC, HZ + 0.45], [HX0, KC, HZ + 0.45]], mK('#dfe2e2', 'q'));
  poly(KSH, [[HX0, HY, HZ], [HX1, HY, HZ], [HX1, HY + 0.2, HZ], [HX0, HY + 0.2, HZ]], mK('#d4d8d9', 'k', { sh: [1.05, 1, 0.86] }));
  lines(KSH, [seg([HX0 + 0.05, HY + 0.05, HZ], [HX1 - 0.05, HY + 0.05, HZ])], mK(null, 'd', { ref: '#d4d8d9' }));
  // the range
  poly(KSH, [[RX0, RY, RZ], [RX1, RY, RZ], [RX1, RY, KZ], [RX0, RY, KZ]], mK('#c3c8c9', 'k'));
  poly(KSH, [[RX0, RY, RZ], [RX1, RY, RZ], [RX1, FL, RZ], [RX0, FL, RZ]], mK('#b8bdbf', 'q', { sh: [1.05, 1, 0.8] }));
  poly(KSH, [[RX1, RY, RZ], [RX1, RY, KZ], [RX1, FL, KZ], [RX1, FL, RZ]], mK('#aeb3b5', 'q'));
  lines(KSH, [seg([RX0 + 0.05, RY - 0.3, RZ - 0.001], [RX1 - 0.05, RY - 0.3, RZ - 0.001])], mK(null, 'q', { ref: '#b8bdbf' }));
  [-1.5, -1.25, -1.0, -0.75, -0.5].forEach(function (x) { poly(KSH, ringPts([x, RY - 0.1, RZ - 0.002], 0.022, 10).map(function (p) { return [p[0], RY - 0.1 + (p[2] - RZ + 0.002), RZ - 0.002]; }), mK('#6d7376', 'q')); });
  poly(KSH, [ringY(-1.45, RY + 0.002, 6.75, 0.11)], mK('#5c6265', 'q'));
  poly(KSH, [ringY(PB[0], RY + 0.002, PB[2], 0.11)], mK('#5c6265', 'q'));
  // the stock pot, at the back
  var POT = [-1.45, 6.75, 0.16];

  /* ---- the pass, kitchen side ---- */
  poly(KPASS, [[-OX, OT, PZ], [-OX, OT, PZ2], [-OX, OB, PZ2], [-OX, OB, PZ]], mK('#cfc8bc', 'q'));
  poly(KPASS, [[OX, OT, PZ], [OX, OT, PZ2], [OX, OB, PZ2], [OX, OB, PZ]], mK('#d4cec3', 'q'));
  poly(KPASS, [[-OX, OT, PZ], [OX, OT, PZ], [OX, OT, PZ2], [-OX, OT, PZ2]], mK('#c4bdb1', 'q'));
  poly(KPASS, [[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX, OB, 4.0], [-OX, OB, 4.0]], mK('#dfe2e2', 'q', { sh: [0.9, 1, 1.04] }));
  poly(KPASS, [[-OX + 0.08, OT - 0.02, 3.42], [OX - 0.08, OT - 0.02, 3.42], [OX - 0.08, OT - 0.06, 3.42], [-OX + 0.08, OT - 0.06, 3.42]], mK('#c9cdce', 'k'));
  var TICKETS = [[-1.05, 0.04], [-0.9, -0.05], [0.62, 0.02], [0.98, -0.04], [1.1, 0.05]];
  LX.forEach(function (lx) {
    lines(KPASS, [seg([lx, OT, LZ], [lx, LY + 0.12, LZ])], mK(null, 'q', { ref: '#c4bdb1' }));
    poly(KPASS, [[lx - 0.035, LY + 0.12, LZ], [lx + 0.035, LY + 0.12, LZ], [lx + 0.1, LY, LZ], [lx - 0.1, LY, LZ]], mK('#5d6468', 'k'));
  });

  /* ---- the dining room: the shell ---- */
  poly(DSH, [[XL, FL, ZB], [XR, FL, ZB], [XR, FL, PZ], [XL, FL, PZ]], mD('#ccb08a', null, { lit: false }));
  var bd = [];
  for (var bx = XL + 0.08; bx < XR; bx += 0.19) bd.push(seg([bx, FL, ZB], [bx, FL, PZ]));
  for (var bz = -5; bz < PZ; bz += 0.7) for (bx = XL + 0.08 + (Math.round(bz * 10) % 3) * 0.19; bx < XR - 0.19; bx += 0.19 * 3) bd.push(seg([bx, FL, bz + rnd() * 0.3], [bx + 0.19, FL, bz + rnd() * 0.3]));
  lines(DSH, bd, mD(null, 'x', { ref: '#ccb08a', lit: false, lm: 1.6 }));
  poly(DSH, [[XL, DC, ZB], [XR, DC, ZB], [XR, DC, PZ], [XL, DC, PZ]], mD('#d7d1c6', null, { lit: false }));
  // the skylight
  var SKX0 = -1.3, SKX1 = 1.1, SKZ0 = 0.6, SKZ1 = 2.0, SKH = 0.32;
  poly(DSH, [[SKX0, DC, SKZ1], [SKX1, DC, SKZ1], [SKX1, DC + SKH, SKZ1], [SKX0, DC + SKH, SKZ1]], mD('#cbc5ba', 'q', { lit: false }));
  poly(DSH, [[SKX0, DC, SKZ0], [SKX0, DC, SKZ1], [SKX0, DC + SKH, SKZ1], [SKX0, DC + SKH, SKZ0]], mD('#d8d3c9', 'q', { lit: false }));
  poly(DSH, [[SKX1, DC, SKZ0], [SKX1, DC, SKZ1], [SKX1, DC + SKH, SKZ1], [SKX1, DC + SKH, SKZ0]], mD('#d3cdc2', 'q', { lit: false }));
  poly(DSH, [[SKX0, DC + SKH, SKZ0], [SKX1, DC + SKH, SKZ0], [SKX1, DC + SKH, SKZ1], [SKX0, DC + SKH, SKZ1]], mD(null, 'q', { e: function () { return SKYC; } }));
  var sk = [];
  for (var sxx = SKX0 + 0.4; sxx < SKX1 - 0.1; sxx += 0.4) sk.push(seg([sxx, DC + SKH, SKZ0], [sxx, DC + SKH, SKZ1]));
  sk.push(seg([SKX0, DC + SKH, (SKZ0 + SKZ1) / 2], [SKX1, DC + SKH, (SKZ0 + SKZ1) / 2]));
  lines(DSH, sk, mD(null, 'q', { ref: '#d8d3c9', lit: false }));
  lines(DSH, [[[SKX0, DC, SKZ0], [SKX1, DC, SKZ0], [SKX1, DC, SKZ1], [SKX0, DC, SKZ1], [SKX0, DC, SKZ0]]], mD(null, 'k', { ref: '#d7d1c6', lit: false }));
  [-2.4, -0.4, 2.6].forEach(function (z) {
    poly(DSH, [[XL, DC - 0.16, z], [XR, DC - 0.16, z], [XR, DC - 0.16, z + 0.18], [XL, DC - 0.16, z + 0.18]], mD('#bdb4a6', 'q', { lit: false }));
    poly(DSH, [[XL, DC, z], [XR, DC, z], [XR, DC - 0.16, z], [XL, DC - 0.16, z]], mD('#cfc8bc', 'q', { lit: false }));
  });
  // side walls, with a dado rail
  poly(DSH, [[XL, DC, ZB], [XL, DC, PZ], [XL, FL, PZ], [XL, FL, ZB]], mD('#d2ccc1', null, { lit: false, sh: [0.86, 1, 0.92] }));
  poly(DSH, [[XR, DC, ZB], [XR, DC, PZ], [XR, FL, PZ], [XR, FL, ZB]], mD('#cfc9be', null, { lit: false, sh: [0.86, 1, 0.92] }));
  poly(DSH, [[XL, -0.55, ZB], [XL, -0.55, PZ], [XL, FL, PZ], [XL, FL, ZB]], mD('#9f8f78', 'q', { lit: false }));
  poly(DSH, [[XR, -0.55, ZB], [XR, -0.55, PZ], [XR, FL, PZ], [XR, FL, ZB]], mD('#9f8f78', 'q', { lit: false }));
  var wp = [];
  for (var wz = -6; wz < PZ; wz += 0.22) { wp.push(seg([XL, -0.58, wz], [XL, FL, wz])); wp.push(seg([XR, -0.58, wz], [XR, FL, wz])); }
  lines(DSH, wp, mD(null, 'x', { ref: '#9f8f78', lit: false }));
  // framed pictures on the left wall, a mirror on the right
  [[-1.4, -0.1], [0.4, 0.15]].forEach(function (pz) {
    poly(DSH, [[XL + 0.01, 0.75, pz[0]], [XL + 0.01, 0.75, pz[0] + 1.0], [XL + 0.01, 0.05, pz[0] + 1.0], [XL + 0.01, 0.05, pz[0]]], mD('#b7a688', 'k'));
    poly(DSH, [[XL + 0.02, 0.68, pz[0] + 0.07], [XL + 0.02, 0.68, pz[0] + 0.93], [XL + 0.02, 0.12, pz[0] + 0.93], [XL + 0.02, 0.12, pz[0] + 0.07]], mD('#d9cfbd', 'q'));
  });
  poly(DSH, [[XR - 0.01, 0.9, -0.2], [XR - 0.01, 0.9, 1.6], [XR - 0.01, -0.2, 1.6], [XR - 0.01, -0.2, -0.2]], mD('#bfb7a8', 'k'));
  poly(DSH, [[XR - 0.02, 0.84, -0.14], [XR - 0.02, 0.84, 1.54], [XR - 0.02, -0.14, 1.54], [XR - 0.02, -0.14, -0.14]], mD('#c9cdcc', 'q', { sh: [1.08, 0.96, 0.88] }));
  // the pass wall, with the opening cut out
  poly(DSH, [[[XL, DC, PZ], [XR, DC, PZ], [XR, FL, PZ], [XL, FL, PZ]], [[-OX, OT, PZ], [-OX, OB, PZ], [OX, OB, PZ], [OX, OT, PZ]]], mD('#ddd8cf', null, { lit: false, sh: [0.86, 1, 0.92], rule: 'evenodd' }));
  poly(DSH, [[XL, -0.55, PZ - 0.005], [-OX - 0.1, -0.55, PZ - 0.005], [-OX - 0.1, FL, PZ - 0.005], [XL, FL, PZ - 0.005]], mD('#9f8f78', 'q', { lit: false }));
  poly(DSH, [[OX + 0.1, -0.55, PZ - 0.005], [XR, -0.55, PZ - 0.005], [XR, FL, PZ - 0.005], [OX + 0.1, FL, PZ - 0.005]], mD('#9f8f78', 'q', { lit: false }));
  lines(DSH, [seg([XL, DC - 0.07, PZ], [XR, DC - 0.07, PZ])], mD(null, 'd', { ref: '#ddd8cf', lit: false }));
  lines(DSH, [[[-OX, OT, PZ], [-OX, OB, PZ], [OX, OB, PZ], [OX, OT, PZ], [-OX, OT, PZ]]], mD(null, 'k', { ref: '#ddd8cf', lit: false }));
  // the pass counter, dining side
  poly(DSH, [[-OX - 0.1, OB - 0.035, 3.2], [OX + 0.1, OB - 0.035, 3.2], [OX + 0.1, FL, 3.2], [-OX - 0.1, FL, 3.2]], mD('#8e7c66', 'q', { lit: false, sh: [1.1, 1, 0.85] }));
  var sl = [];
  for (var sx = -OX + 0.05; sx < OX + 0.1; sx += 0.12) sl.push(seg([sx, OB - 0.07, 3.2], [sx, FL, 3.2]));
  lines(DSH, sl, mD(null, 'x', { ref: '#8e7c66', lit: false, lm: 1.5 }));
  poly(DSH, [[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX + 0.1, OB, 3.4], [-OX - 0.1, OB, 3.4]], mD('#dfe2e2', 'q', { lit: false }));
  poly(DSH, [[-OX - 0.1, OB, 3.2], [OX + 0.1, OB, 3.2], [OX + 0.1, OB - 0.035, 3.2], [-OX - 0.1, OB - 0.035, 3.2]], mD('#bfc3c4', 'k', { lit: false }));

  /* ======================================================================
     THINGS THAT ARE DRAWN AS GROUPS, sorted by depth every frame
     ====================================================================== */
  // a group holds static items (lit by their own centre) and a draw function
  function Group(key, room) { return { key: key, room: room, items: [], draw: null, z: 0 }; }

  /* ---- a chair: seat centre c, facing angle th (the way a sitter faces) ---- */
  function chairItems(list, c, th, up) {
    var f = [Math.sin(th), 0, Math.cos(th)], r = [Math.cos(th), 0, -Math.sin(th)];
    function W(a, y, b) { return [c[0] + r[0] * a + f[0] * b, y, c[2] + r[2] * a + f[2] * b]; }
    var s = 0.2, sy = FL + 0.46, legs = [];
    if (!up) {
      [[-s + 0.03, -s + 0.03], [s - 0.03, -s + 0.03], [-s + 0.03, s - 0.03], [s - 0.03, s - 0.03]].forEach(function (q) { legs.push(seg(W(q[0], sy, q[1]), W(q[0] * 1.08, FL, q[1] * 1.08))); });
      lines(list, legs, mD(null, 'k', { ref: '#6e543c', lm: 1.3 }));
      poly(list, [W(-s, sy, -s), W(s, sy, -s), W(s, sy, s), W(-s, sy, s)], mD('#5a4536', 'k'));
      poly(list, [W(-s, sy, -s), W(s, sy, -s), W(s, sy - 0.035, -s), W(-s, sy - 0.035, -s)], mD('#4e3c2e', 'q'));
    }
    return { W: W, sy: sy, s: s };
  }
  function chairBack(list, c, th) {
    var f = [Math.sin(th), 0, Math.cos(th)], r = [Math.cos(th), 0, -Math.sin(th)];
    function W(a, y, b) { return [c[0] + r[0] * a + f[0] * b, y, c[2] + r[2] * a + f[2] * b]; }
    var s = 0.2, sy = FL + 0.46, b = -s + 0.01;
    // two posts and a bentwood rail, with three spindles
    lines(list, [seg(W(-s + 0.02, sy, b), W(-s + 0.03, sy + 0.5, b - 0.04)), seg(W(s - 0.02, sy, b), W(s - 0.03, sy + 0.5, b - 0.04))], mD(null, 'k', { ref: '#6e543c', lm: 1.6 }));
    var rail = [];
    for (var i = 0; i <= 8; i++) { var u = i / 8, a = lerp(-s + 0.03, s - 0.03, u); rail.push(W(a, sy + 0.5 + 0.025 * Math.sin(Math.PI * u), b - 0.04 - 0.02 * Math.sin(Math.PI * u))); }
    var rail2 = rail.map(function (p) { return [p[0], p[1] - 0.05, p[2]]; }).reverse();
    poly(list, rail.concat(rail2), mD('#4e3b2c', 'k'));
    lines(list, [-0.07, 0, 0.07].map(function (a) { return seg(W(a, sy + 0.02, b - 0.005), W(a, sy + 0.43, b - 0.035)); }), mD(null, 'q', { ref: '#6e543c', lm: 1.5 }));
    return W;
  }
  function chairUp(list, c, th) {
    // upside down on the table: the seat face down on the top, four thin legs
    // in the air with a ring between them, the back hanging over the edge
    var f = [Math.sin(th), 0, Math.cos(th)], r = [Math.cos(th), 0, -Math.sin(th)];
    function W(a, y, b) { return [c[0] + r[0] * a + f[0] * b, y, c[2] + r[2] * a + f[2] * b]; }
    var s = 0.17, sy = TY + 0.004, st = sy + 0.035;
    // the back, hanging down past the table's edge
    var bk = -s - 0.02;
    poly(list, [W(-s + 0.03, st, bk), W(s - 0.03, st, bk), W(s - 0.03, st - 0.07, bk - 0.03), W(-s + 0.03, st - 0.07, bk - 0.03)], mD('#7d5f44', 'q'));
    lines(list, [seg(W(-s + 0.03, st, bk), W(-s + 0.04, st - 0.42, bk - 0.06)), seg(W(s - 0.03, st, bk), W(s - 0.04, st - 0.42, bk - 0.06))], mD(null, null, { ref: '#6e543c', tw: 0.024, tc: '#6a5038' }));
    poly(list, [W(-s + 0.04, st - 0.32, bk - 0.045), W(s - 0.04, st - 0.32, bk - 0.045), W(s - 0.04, st - 0.4, bk - 0.06), W(-s + 0.04, st - 0.4, bk - 0.06)], mD('#7d5f44', 'q'));
    // the seat, face down
    poly(list, [W(-s, st, -s), W(s, st, -s), W(s, st, s), W(-s, st, s)], mD('#9a7756', 'k'));
    poly(list, [W(-s, sy, -s), W(s, sy, -s), W(s, st, -s), W(-s, st, -s)], mD('#6d533c', 'q'));
    poly(list, [W(-s, sy, s), W(s, sy, s), W(s, st, s), W(-s, st, s)], mD('#6d533c', 'q'));
    // legs, splayed a little, and the ring between them
    var legs = [], ring = [];
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
      var a = q[0] * (s - 0.03), b = q[1] * (s - 0.03);
      legs.push(seg(W(a, st, b), W(a * 1.12, st + 0.43, b * 1.12)));
      ring.push(W(a * 1.06, st + 0.24, b * 1.06));
    });
    lines(list, legs, mD(null, null, { ref: '#6e543c', tw: 0.026, tc: '#5f4733' }));
    ring.push(ring[0]);
    lines(list, [ring], mD(null, null, { ref: '#6e543c', tw: 0.012, tc: '#5f4733' }));
  }

  /* ======================================================================
     PEOPLE: a jointed figure in 3D, drawn as rounded forms round its bones.
     Every joint is a world point, so a figure turns and foreshortens with
     the camera. Figures are lit by the same lamps as the room: a surface
     gets a lamp's light by how much it faces it. Guests face their table's
     lamp, so we see their backs in soft shadow with warm light along the
     edges (the lamp is beyond them). Seen from behind or three-quarter
     behind; no faces.
     ====================================================================== */
  var BUILD = {
    // rings: [height above the seat (or the hips), half-width, half-depth, forward offset]
    m: { sh: 0.2, rings: [[0.07, 0.175, 0.12, -0.02], [0.26, 0.155, 0.1, -0.03], [0.41, 0.178, 0.115, -0.015], [0.505, 0.188, 0.1, -0.005]], shY: 0.535, neckY: 0.6, headY: 0.73, head: [0.073, 0.108, 0.093], neck: 0.05, ua: 0.29, fa: 0.26 },
    f: { sh: 0.178, rings: [[0.07, 0.185, 0.12, -0.02], [0.26, 0.135, 0.092, -0.03], [0.4, 0.157, 0.108, -0.01], [0.495, 0.163, 0.092, -0.005]], shY: 0.52, neckY: 0.585, headY: 0.71, head: [0.068, 0.103, 0.088], neck: 0.042, ua: 0.27, fa: 0.245 },
    chef: { sh: 0.218, rings: [[-0.12, 0.205, 0.14, -0.02], [0.04, 0.198, 0.134, -0.02], [0.2, 0.172, 0.118, -0.025], [0.38, 0.194, 0.124, -0.01], [0.5, 0.204, 0.108, -0.005]], shY: 0.53, neckY: 0.6, headY: 0.74, head: [0.077, 0.113, 0.098], neck: 0.05, ua: 0.3, fa: 0.275 }
  };
  function makeFigure(o) {
    o.th = o.th || 0;
    o.r = [Math.cos(o.th), 0, -Math.sin(o.th)];
    o.f = [Math.sin(o.th), 0, Math.cos(o.th)];
    o.B = BUILD[o.build || 'm'];
    return o;
  }
  function figW(o, l) { return [o.b[0] + o.r[0] * l[0] + o.f[0] * l[2], o.b[1] + l[1], o.b[2] + o.r[2] * l[0] + o.f[2] * l[2]]; }
  function scl3(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  // two-bone reach: shoulder S to wrist W, the elbow pulled toward the pole
  function ik(S, W, a, b, pole) {
    var d = sub3(W, S), L = len3(d);
    L = clamp(L, Math.abs(a - b) + 0.01, a + b - 0.001);
    var u = nrm3(d), x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x));
    var pv = sub3(pole, add3(S, u, dot3(sub3(pole, S), u)));
    return add3(add3(S, u, x), nrm3(pv), h);
  }
  // the joints of a figure this frame
  function joints(o, t) {
    var B = o.B, st = o.stand, H = st ? 0.9 + (o.bob || 0) : 0;
    var br = 0.004 * Math.sin(t * 1.6 + o.ph);                       // breathing
    var lean = (o.lean || 0) + 0.018 * Math.sin(t * 0.37 + o.ph);
    var cl = Math.cos(lean), sl = Math.sin(lean), py = H + 0.08, pz = -0.02;
    var tw = (o.twist || 0) + 0.02 * Math.sin(t * 0.29 + o.ph * 2);  // the shoulders turn a little on the hips
    function Lp(x, y, z) {
      var yy = y - py, zz = z - pz, k = clamp((y - py) / 0.5, 0, 1) * tw;
      var x2 = x * Math.cos(k) - zz * Math.sin(k), z2 = x * Math.sin(k) + zz * Math.cos(k);
      return figW(o, [x2, py + yy * cl - z2 * sl, pz + yy * sl + z2 * cl]);
    }
    var J = { lean: lean };
    J.rings = B.rings.map(function (rg, i) {
      return { c: Lp(0, H + rg[0] + (i > 1 ? br : 0), rg[3]), rx: rg[1] * (o.w || 1), rz: rg[2], k: clamp((rg[0] + 0.1) / 0.6, 0, 1) * tw };
    });
    var sw = B.sh * (o.w || 1);
    J.shL = Lp(-sw, H + B.shY + br, -0.005);
    J.shR = Lp(sw, H + B.shY + br, -0.005);
    J.neck = Lp(0, H + B.neckY + br, 0.0);
    J.pel = Lp(0, H + 0.08, -0.02);
    // the head turns and nods on the neck
    var hy = (o.hYaw ? o.hYaw(t) : 0) + tw, hp = (o.hPitch || 0) + lean * 0.4;
    J.head = Lp(0, H + B.headY + br, 0.03 + (o.hFwd || 0));
    var fx = o.f[0] * Math.cos(hy) + o.r[0] * Math.sin(hy), fz = o.f[2] * Math.cos(hy) + o.r[2] * Math.sin(hy);
    J.hf = nrm3([fx * Math.cos(hp), -Math.sin(hp), fz * Math.cos(hp)]);
    J.hr = nrm3([fz, 0, -fx]);
    J.hu = nrm3(cross3(J.hf, J.hr)); if (J.hu[1] < 0) J.hu = scl3(J.hu, -1);
    ['L', 'R'].forEach(function (sd) {
      var A = o.arm[sd](t), S = J['sh' + sd];
      var Wt = A.world ? A.w : figW(o, A.w);
      var sg = sd === 'L' ? -1 : 1;
      var pole = add3(add3(add3(S, o.r, sg * 0.45), [0, -0.7, 0]), o.f, -0.3);
      J['el' + sd] = ik(S, Wt, B.ua, B.fa, pole);
      J['wr' + sd] = Wt;
      J['hd' + sd] = A.hd ? A.hd : add3(Wt, nrm3(sub3(Wt, J['el' + sd])), 0.075);
    });
    if (st && o.walk != null) {
      // a walk: each foot swings through, lifting as it passes; the knee bends to suit
      var A = 0.17 * (o.stride || 0);
      ['L', 'R'].forEach(function (sd, k) {
        var ph = o.walk + (k ? Math.PI : 0), sg = k ? 1 : -1;
        var hp = figW(o, [0.1 * sg, H, -0.02]);
        var an = figW(o, [0.125 * sg, 0.085 + 0.07 * (o.stride || 0) * Math.max(0, Math.cos(ph)), A * Math.sin(ph) - 0.02]);
        J['hip' + sd] = hp; J['an' + sd] = an;
        J['kn' + sd] = ik(hp, an, 0.42, 0.42, add3(add3(hp, o.f, 0.8), [0, -0.4, 0]));
      });
    } else if (st) {
      J.hipL = figW(o, [-0.1, 0.9, -0.02]); J.hipR = figW(o, [0.1, 0.9, -0.02]);
      J.knL = figW(o, [-0.115, 0.5, 0.02]); J.knR = figW(o, [0.12, 0.5, -0.01]);
      J.anL = figW(o, [-0.125, 0.085, -0.02]); J.anR = figW(o, [0.14, 0.085, -0.05]);
    }
    return J;
  }
  // light on one face of a figure: the room's ambient, plus each lamp by how
  // much the face turns to it (wrapped, so the light rolls round the form)
  function faceLight(p, n, room) {
    var a = AMB[room], L = [a[0], a[1], a[2]];
    for (var i = 0; i < LAMPS.length; i++) {
      var I = LI[i];
      if (I < 0.003) continue;
      var l = LAMPS[i];
      if (l.rooms.indexOf(room) < 0) continue;
      var d = sub3(l.p, p), dl = len3(d) || 1;
      var w = clamp((dot3(n, d) / dl + 0.3) / 1.3, 0, 1);
      var f = falloff(l, p) * I * w * 1.25;
      L[0] += l.c[0] * f; L[1] += l.c[1] * f; L[2] += l.c[2] * f;
    }
    return L;
  }
  // light that grazes a figure's edges from lamps beyond it
  function rimLight(p, room) {
    var view = nrm3(sub3(p, camPos())), c = [0, 0, 0], a = 0;
    for (var i = 0; i < LAMPS.length; i++) {
      var I = LI[i];
      if (I < 0.003) continue;
      var l = LAMPS[i];
      if (l.rooms.indexOf(room) < 0) continue;
      var d = nrm3(sub3(l.p, p)), k = clamp((dot3(d, view) + 0.15) / 1.15, 0, 1);
      var f = falloff(l, p) * I * k * k;
      a += f; c[0] += l.c[0] * f; c[1] += l.c[1] * f; c[2] += l.c[2] * f;
    }
    if (a < 0.001) return { a: 0, c: [255, 220, 170] };
    return { a: clamp(a, 0, 1.4), c: [255 * c[0] / a, 255 * c[1] / a, 255 * c[2] / a] };
  }
  function strokeRim(rim, w, alpha) {
    if (rim.a < 0.02) return;
    ctx.globalCompositeOperation = ADD;
    ctx.lineWidth = w * 1.6; ctx.strokeStyle = css(rim.c, 0.42 * rim.a * alpha); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  // the outline of the torso as the camera sees it, from its rings
  function torsoOutline(o, J) {
    var pr = P2(J.rings[2].c), pr2 = P2(add3(J.rings[2].c, o.r, 0.1));
    if (!pr || !pr2) return null;
    var rd = [pr2[0] - pr[0], pr2[1] - pr[1]], rl = Math.hypot(rd[0], rd[1]) || 1;
    rd = [rd[0] / rl, rd[1] / rl];
    var left = [], right = [];
    for (var i = 0; i < J.rings.length; i++) {
      var R = J.rings[i], best = 1e9, worst = -1e9, bp = null, wp = null;
      var cr = Math.cos(R.k), sr = Math.sin(R.k);
      var rr = add3(scl3(o.r, cr), o.f, sr), ff = add3(scl3(o.f, cr), o.r, -sr);
      for (var k = 0; k < 20; k++) {
        var a = k / 20 * Math.PI * 2;
        var p = P2(add3(add3(R.c, rr, R.rx * Math.cos(a)), ff, R.rz * Math.sin(a)));
        if (!p) return null;
        var d = p[0] * rd[0] + p[1] * rd[1];
        if (d < best) { best = d; bp = p; }
        if (d > worst) { worst = d; wp = p; }
      }
      left.push(bp); right.push(wp);
    }
    var up = [0, 1, 0], nr = 0.045 + (o.B.neck - 0.045);
    function Q(v) { return P2(v); }
    // the shoulder line falls from the neck along the trapezius to a rounded shoulder
    var sLt = Q(add3(add3(J.shL, up, 0.035), o.r, 0.01)), sRt = Q(add3(add3(J.shR, up, 0.035), o.r, -0.01));
    var sLo = Q(add3(add3(J.shL, o.r, -0.045), up, -0.01)), sRo = Q(add3(add3(J.shR, o.r, 0.045), up, -0.01));
    var trapL = Q(add3(add3(J.neck, o.r, -0.095), up, -0.012)), trapR = Q(add3(add3(J.neck, o.r, 0.095), up, -0.012));
    var nL = Q(add3(add3(J.neck, o.r, -nr), up, 0.012)), nR = Q(add3(add3(J.neck, o.r, nr), up, 0.012));
    var nB = Q(add3(add3(J.neck, o.f, -0.04), up, 0.012));
    if (!sLt || !sRt || !nL || !nR || !nB || !trapL || !trapR || !sLo || !sRo) return null;
    var n = left.length;
    var pts = [];
    for (i = 0; i < n; i++) pts.push(left[i]);
    pts.push(sLo, sLt, trapL, nL, nB, nR, trapR, sRt, sRo);
    for (i = n - 1; i >= 0; i--) pts.push(right[i]);
    var top = [sLo, sLt, trapL, nL, nB, nR, trapR, sRt, sRo];
    return { pts: pts, rd: rd, left: left, right: right, top: top };
  }

  function drawFigure(o, t, room, alpha) {
    var J = joints(o, t), B = o.B;
    var pc = J.rings[2].c, cc = toCam(pc);
    if (cc[2] < 0.35) return;
    var so = scr(cc), rad = F * 1.1 / cc[2];
    if (so[0] + rad < 0 || so[0] - rad > VW || so[1] + rad < 0 || so[1] - rad > VH) return;
    var z = cc[2], px = F / z, lw = wf(z);
    var up = [0, 1, 0], nB = scl3(o.f, -1);
    var rim = rimLight(J.neck, room);
    if (o.rimK != null) rim.a *= o.rimK;
    if (alpha != null && alpha < 1) ctx.globalAlpha = alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var parts = [];
    // legs, for a figure standing
    if (o.stand) {
      ['L', 'R'].forEach(function (sd) {
        parts.push({ z: toCam(J['kn' + sd])[2] + 0.06, f: function () {
          var h = P2(J['hip' + sd]), k = P2(J['kn' + sd]), a = P2(J['an' + sd]);
          if (!h || !k || !a) return;
          var Ll = faceLight(J['kn' + sd], add3(nB, o.r, sd === 'L' ? -0.5 : 0.5), room), lc = mulL(o.legs, Ll);
          tube([h, k, a], [0.09 * px, 0.068 * px, 0.058 * px]);
          var gl = ctx.createLinearGradient(h[0], h[1], a[0], a[1]);
          gl.addColorStop(0, css(lc)); gl.addColorStop(1, css(scl(lc, 0.9)));
          ctx.fillStyle = gl; ctx.fill();
          ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(lc, 'q', room); ctx.stroke();
          // a break in the trouser over the shoe, and the shoe
          var ft = P2(add3(add3(J['an' + sd], o.f, 0.13), up, -0.055)), a2 = P2(add3(J['an' + sd], up, -0.045));
          if (ft && a2) { capsule(a2, 0.048 * px, ft, 0.04 * px); fillStroke(mulL(o.shoe || '#232323', Ll), 1, 'q', room, z); }
          ctx.beginPath(); var m1 = [lerp(k[0], a[0], 0.75), lerp(k[1], a[1], 0.75)];
          ctx.moveTo(m1[0] - 0.05 * px, m1[1]); ctx.quadraticCurveTo(m1[0], m1[1] + 0.015 * px, m1[0] + 0.04 * px, m1[1] - 0.01 * px);
          ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(lc, 'd', room, 1.5); ctx.stroke();
        } });
      });
    }
    // arms
    ['L', 'R'].forEach(function (sd) {
      var S = J['sh' + sd], E = J['el' + sd], Wr = J['wr' + sd], Hd = J['hd' + sd], sg = sd === 'L' ? -1 : 1;
      var ez = toCam(E)[2], tz = toCam(add3(J.rings[2].c, o.r, sg * 0.12))[2];
      parts.push({ z: ez < tz - 0.03 ? z - 0.3 : z + 0.05, f: function () {
        var s = P2(add3(add3(S, [0, -0.03, 0]), o.r, -sg * 0.02)), e = P2(E), w = P2(Wr), h = P2(Hd);
        if (!s || !e || !w) return;
        var nOut = nrm3(add3(scl3(o.r, sg), nB, 0.4));
        var La = faceLight(E, nOut, room), sc = mulL(o.sleeve || o.top, La), sk = mulL(o.skin, La);
        var wm = [lerp(e[0], w[0], 0.28), lerp(e[1], w[1], 0.28)];
        // rolled sleeves: the bare forearm and hand first, the sleeve over them
        if (o.rolled) {
          // the bare forearm and hand, then the rolled sleeve over its upper end
          if (h) tube([e, w, h], [0.04 * px, 0.03 * px, 0.029 * px]); else capsule(e, 0.04 * px, w, 0.03 * px);
          fillStroke(sk, 1, 'q', room, z);
          tube([s, e, wm], [0.056 * px, 0.05 * px, 0.047 * px]);
          fillStroke(sc, 1, 'q', room, z);
          // the roll: a band round the sleeve's end
          var wd = nrm2([w[0] - e[0], w[1] - e[1]]);
          ctx.beginPath(); ctx.moveTo(wm[0] - wd[1] * 0.047 * px, wm[1] + wd[0] * 0.047 * px); ctx.lineTo(wm[0] + wd[1] * 0.047 * px, wm[1] - wd[0] * 0.047 * px);
          ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(sc, 'd', room, 1.4); ctx.stroke();
        } else {
          if (h) { capsule(w, 0.028 * px, h, 0.03 * px); fillStroke(sk, 1, 'q', room, z); }
          tube([s, e, w], [0.056 * px, 0.044 * px, 0.033 * px]);
          fillStroke(sc, 1, 'q', room, z);
        }
        if (z < 4.2) {
          tube([s, e, o.rolled ? wm : w], [0.056 * px, 0.046 * px, 0.04 * px]); strokeRim(rim, 1.1 * lw, 0.7);
          // a fold at the inside of the elbow
          ctx.beginPath(); var ee = [lerp(s[0], e[0], 0.8), lerp(s[1], e[1], 0.8)];
          ctx.moveTo(ee[0] - 0.02 * px, ee[1] - 0.012 * px); ctx.quadraticCurveTo(e[0] - sg * 0.005 * px, e[1] + 0.01 * px, ee[0] + 0.025 * px, ee[1] + 0.012 * px);
          ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(sc, 'd', room, 1.6); ctx.stroke();
        }
        if (o.glass && sd === 'R' && h) miniGlass(h, px, La, room, z);
      } });
    });
    // the torso, neck, head and hair: one piece
    parts.push({ z: z, f: function () {
      var nk = P2(J.neck), hd = P2(J.head);
      if (!nk || !hd) return;
      var Ln = faceLight(J.neck, nB, room), skN = mulL(o.skin, scl3(Ln, 0.85));
      var hb = P2(add3(J.head, J.hu, -0.08));
      if (hb) { capsule(nk, B.neck * px, hb, B.neck * 0.92 * px); fillStroke(skN, 1, 'q', room, z); }
      var TO = torsoOutline(o, J);
      if (!TO) return;
      // three faces of the back, by the light they get
      var cL = mulL(o.top, faceLight(pc, add3(scl3(o.r, -1), nB, 0.4), room));
      var cB = mulL(o.top, faceLight(pc, nB, room));
      var cR = mulL(o.top, faceLight(pc, add3(o.r, nB, 0.4), room));
      var cU = mulL(o.top, faceLight(J.neck, up, room));
      var l0 = TO.left[2], r0 = TO.right[2];
      smoothPath(TO.pts);
      var g = ctx.createLinearGradient(l0[0], l0[1], r0[0], r0[1]);
      g.addColorStop(0, css(cL)); g.addColorStop(0.5, css(cB)); g.addColorStop(1, css(cR));
      ctx.fillStyle = g; ctx.fill();
      ctx.save();
      // the shoulders catch the light from above; the small of the back is in shade
      var yTop = Math.min(TO.top[1][1], TO.top[7][1]), yBot = TO.left[0][1];
      var gd = ctx.createLinearGradient(0, yTop, 0, yBot);
      var du = [Math.max(0, cU[0] - cB[0]), Math.max(0, cU[1] - cB[1]), Math.max(0, cU[2] - cB[2])];
      gd.addColorStop(0, css(du, 0.0)); gd.addColorStop(0.45, 'rgba(12,10,9,0)'); gd.addColorStop(1, 'rgba(12,10,9,0.35)');
      ctx.fillStyle = gd; ctx.fill();
      if (du[0] + du[1] + du[2] > 6) {
        var gv = ctx.createLinearGradient(0, yTop, 0, lerp(yTop, yBot, 0.3));
        gv.addColorStop(0, css(du, 0.9)); gv.addColorStop(1, css(du, 0));
        ctx.globalCompositeOperation = ADD; ctx.fillStyle = gv; ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
      // the back's surface: the spine's groove, the shoulder blades, folds at the waist
      var bk = function (ri, u, dy) {
        var R = J.rings[ri];
        return P2(add3(add3(add3(R.c, o.r, R.rx * u), o.f, -R.rz * Math.sqrt(Math.max(0, 1 - u * u)) - 0.004), up, dy || 0));
      };
      var sp = [bk(J.rings.length - 1, 0, 0.02), bk(2, 0.0), bk(1, 0.02), bk(0, 0.0)];
      if (sp.every(Boolean)) {
        smoothPath(sp, false);
        if (z < 4.2) { ctx.lineWidth = 0.05 * px; ctx.strokeStyle = 'rgba(10,10,10,0.1)'; ctx.stroke(); }
        ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(cB, 'd', room, o.seam ? 1.6 : 0.7); ctx.stroke();
      }
      ctx.beginPath();
      [-1, 1].forEach(function (sg) {
        var top2 = J.rings.length - 1;
        var p1 = bk(top2, 0.52 * sg, -0.01), p2 = bk(2, 0.62 * sg), p3 = bk(2, 0.22 * sg, -0.04);
        if (p1 && p2 && p3) { ctx.moveTo(p1[0], p1[1]); ctx.quadraticCurveTo(p2[0], p2[1], p3[0], p3[1]); }
        var w1 = bk(1, 0.8 * sg, 0.02), w2 = bk(1, 0.4 * sg), w3 = bk(1, 0.15 * sg, -0.03);
        if (w1 && w2 && w3) { ctx.moveTo(w1[0], w1[1]); ctx.quadraticCurveTo(w2[0], w2[1] + 0.012 * px, w3[0], w3[1]); }
        var d1 = bk(top2, 0.9 * sg, -0.03), d2 = bk(2, 0.75 * sg, 0.02), d3 = bk(2, 0.45 * sg, -0.05);
        if (d1 && d2 && d3 && o.stand) { ctx.moveTo(d1[0], d1[1]); ctx.quadraticCurveTo(d2[0], d2[1], d3[0], d3[1]); }
      });
      ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(cB, 'd', room, 1.5); ctx.stroke();
      if (o.hem) {
        var h1 = bk(0, -0.85, 0.05), h2 = bk(0, 0, 0.035), h3 = bk(0, 0.85, 0.05);
        if (h1 && h2 && h3) { ctx.beginPath(); ctx.moveTo(h1[0], h1[1]); ctx.quadraticCurveTo(h2[0], h2[1], h3[0], h3[1]); ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(cB, 'q', room, 1.2); ctx.stroke(); }
      }
      // the chef's apron: straps crossed on the back, a tie at the waist
      if (o.apron) {
        var La2 = faceLight(pc, nB, room), ap = mulL(o.apron, La2);
        ctx.lineCap = 'butt';
        if (!o.waistOnly) [-1, 1].forEach(function (sg) {
          var q1 = P2(add3(add3(add3(J.neck, o.r, 0.085 * sg), up, -0.035), o.f, -0.05));
          var q2 = bk(2, -0.12 * sg, -0.04), q3 = bk(1, -0.8 * sg, -0.02);
          if (q1 && q2 && q3) {
            ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.quadraticCurveTo(q2[0], q2[1], q3[0], q3[1]);
            ctx.lineWidth = 0.026 * px; ctx.strokeStyle = css(scl(ap, 0.82)); ctx.stroke();
            ctx.lineWidth = 0.018 * px; ctx.strokeStyle = css(ap); ctx.stroke();
          }
        });
        var t1 = bk(1, -1, -0.02), tc = bk(1, 0, -0.025), t2 = bk(1, 1, -0.02);
        if (t1 && t2 && tc) { ctx.beginPath(); ctx.moveTo(t1[0], t1[1]); ctx.quadraticCurveTo(tc[0], tc[1] + 0.006 * px, t2[0], t2[1]); ctx.lineWidth = 0.03 * px; ctx.strokeStyle = css(ap); ctx.stroke(); }
        ctx.lineCap = 'round';
        // the apron's skirt shows as a narrow edge at each side of the hips
        [-1, 1].forEach(function (sg) {
          var a1 = bk(0, 1.0 * sg, 0.06), a2 = bk(0, 0.86 * sg, 0.05), a3 = bk(0, 0.9 * sg, -0.06), a4 = bk(0, 1.0 * sg, -0.06);
          if (a1 && a2 && a3 && a4) { polyPath([a1, a2, a3, a4]); ctx.fillStyle = css(scl(ap, 0.9)); ctx.fill(); }
        });
      }
      ctx.restore();
      ctx.lineWidth = LW.k * lw; ctx.strokeStyle = ink(cB, 'k', room); smoothPath(TO.pts); ctx.stroke();
      // the light along the shoulders
      smoothPath(TO.top, false);
      strokeRim(rim, 1.4 * lw, 1);
      if (o.apron) {
        var bw = bk(1, 0, -0.025);
        if (bw) {
          var ap2 = mulL(o.apron, faceLight(pc, nB, room));
          ctx.beginPath(); ctx.ellipse(bw[0] - 0.028 * px, bw[1], 0.03 * px, 0.015 * px, 0.35, 0, Math.PI * 2); fillStroke(ap2, 1, 'd', room, z);
          ctx.beginPath(); ctx.ellipse(bw[0] + 0.028 * px, bw[1], 0.03 * px, 0.015 * px, -0.35, 0, Math.PI * 2); fillStroke(ap2, 1, 'd', room, z);
          ctx.beginPath(); ctx.moveTo(bw[0] - 0.008 * px, bw[1]); ctx.quadraticCurveTo(bw[0] - 0.03 * px, bw[1] + 0.09 * px, bw[0] - 0.018 * px, bw[1] + 0.2 * px);
          ctx.moveTo(bw[0] + 0.008 * px, bw[1]); ctx.quadraticCurveTo(bw[0] + 0.035 * px, bw[1] + 0.1 * px, bw[0] + 0.03 * px, bw[1] + 0.19 * px);
          ctx.lineWidth = 0.02 * px; ctx.strokeStyle = css(ap2); ctx.stroke();
        }
      }
      // a collar at the back of the neck
      if (o.collar) {
        var c1 = P2(add3(add3(J.neck, o.r, -B.neck * 1.25), up, -0.005)), c3 = P2(add3(add3(J.neck, o.r, B.neck * 1.25), up, -0.005));
        var c2 = P2(add3(add3(J.neck, o.f, -B.neck * 1.1), up, 0.03)), c4 = P2(add3(add3(J.neck, o.f, -B.neck * 1.2), up, -0.005));
        if (c1 && c2 && c3 && c4) {
          ctx.beginPath(); ctx.moveTo(c1[0], c1[1]); ctx.quadraticCurveTo(c2[0], c2[1] - 0.01 * px, c3[0], c3[1]); ctx.quadraticCurveTo(c4[0], c4[1] + 0.008 * px, c1[0], c1[1]);
          fillStroke(mulL(o.collar, faceLight(J.neck, nB, room)), 1, 'q', room, z);
        }
      }
      drawHead(o, J, hd, z, px, rim, room);
    } });
    parts.sort(function (a, b) { return b.z - a.z; });
    for (var i = 0; i < parts.length; i++) parts[i].f();
    ctx.globalAlpha = 1;
  }
  function miniGlass(h, px, L, room, z) {
    var r = 0.035 * px;
    ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(h[0], h[1] - 0.07 * px);
    ctx.lineWidth = 0.6 * wf(z); ctx.strokeStyle = css(mulL('#e8eef0', L), 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(h[0], h[1] - 0.07 * px);
    ctx.bezierCurveTo(h[0] - r * 1.1, h[1] - 0.08 * px, h[0] - r, h[1] - 0.14 * px, h[0] - r * 0.8, h[1] - 0.15 * px);
    ctx.lineTo(h[0] + r * 0.8, h[1] - 0.15 * px);
    ctx.bezierCurveTo(h[0] + r, h[1] - 0.14 * px, h[0] + r * 1.1, h[1] - 0.08 * px, h[0], h[1] - 0.07 * px);
    ctx.fillStyle = css(mulL('#7a2330', L), 0.85); ctx.fill();
    ctx.strokeStyle = css(mulL('#e8eef0', L), 0.6); ctx.stroke();
  }
  // the outline of an ellipsoid (centre C, three axes with their radii) on screen
  function ellOf(C, axes) {
    var o = P2(C);
    if (!o) return null;
    var a = 0, b = 0, c = 0;
    for (var i = 0; i < 3; i++) {
      var p = P2(add3(C, axes[i][0], axes[i][1]));
      if (!p) return null;
      var vx = p[0] - o[0], vy = p[1] - o[1];
      a += vx * vx; b += vx * vy; c += vy * vy;
    }
    var tr = (a + c) / 2, df = Math.sqrt(Math.max(0, (a - c) * (a - c) / 4 + b * b));
    var rx = Math.sqrt(tr + df), ry = Math.sqrt(Math.max(1e-6, tr - df)), ang = 0.5 * Math.atan2(2 * b, a - c);
    if (Math.abs(Math.cos(ang)) < 0.7) { var t = rx; rx = ry; ry = t; ang -= Math.PI / 2; }
    return { x: o[0], y: o[1], rx: rx, ry: ry, a: ang };
  }
  function ellPath(e, k) { k = k || 1; ctx.beginPath(); ctx.ellipse(e.x, e.y, e.rx * k, e.ry * k, e.a, 0, Math.PI * 2); }
  function drawHead(o, J, hd, z, px, rim, room) {
    var R = o.B.head, H = J.head, lw = wf(z);
    var view = nrm3(sub3(H, camPos()));
    var skin = mulL(o.skin, faceLight(H, add3(scl3(view, -1), J.hf, 0.7), room));
    var skinD = scl(skin, 0.78);
    var hairL = faceLight(H, add3(J.hu, J.hf, -0.7), room), hair = mulL(o.hair, hairL);
    var st = o.hairStyle, cap = st === 'cap', long = st === 'long', bun = st === 'bun';
    // the skull, with the jaw a little forward and down
    var skull = ellOf(H, [[J.hr, R[0]], [J.hu, R[1]], [J.hf, R[2]]]);
    var jaw = ellOf(add3(add3(H, J.hf, 0.025), J.hu, -0.045), [[J.hr, R[0] * 0.8], [J.hu, R[1] * 0.62], [J.hf, R[2] * 0.72]]);
    if (!skull || !jaw) return;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(skull.x, skull.y, skull.rx, skull.ry, skull.a, 0, Math.PI * 2);
    ctx.moveTo(jaw.x + jaw.rx * Math.cos(jaw.a), jaw.y + jaw.rx * Math.sin(jaw.a)); ctx.ellipse(jaw.x, jaw.y, jaw.rx, jaw.ry, jaw.a, 0, Math.PI * 2);
    ctx.fillStyle = css(skin); ctx.fill();
    // shade the skin away from the face
    var fp = P2(add3(H, J.hf, 0.12)), bp = P2(add3(H, J.hf, -0.12));
    if (fp && bp) {
      var g = ctx.createLinearGradient(fp[0], fp[1], bp[0], bp[1]);
      g.addColorStop(0, css(skin, 0)); g.addColorStop(1, css(skinD, 0.85));
      ellPath(skull); ctx.fillStyle = g; ctx.fill();
    }
    ellPath(skull); ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(skin, 'q', room); ctx.stroke();
    ctx.restore();
    // ears, where they face us
    var ears = [];
    [-1, 1].forEach(function (s) {
      var ep = add3(add3(add3(H, J.hr, R[0] * 1.02 * s), J.hu, -0.018), J.hf, 0.004);
      if (dot3(scl3(J.hr, s), nrm3(sub3(camPos(), ep))) > 0.4) {
        var e = ellOf(ep, [[J.hr, 0.012], [J.hu, 0.03], [J.hf, 0.02]]);
        if (e) ears.push(e);
      }
    });
    function earsDraw() {
      if (!ears.length) return;
      ctx.beginPath();
      ears.forEach(function (e) { ctx.moveTo(e.x + e.rx * Math.cos(e.a), e.y + e.rx * Math.sin(e.a)); ctx.ellipse(e.x, e.y, e.rx, e.ry, e.a, 0, Math.PI * 2); });
      ctx.fillStyle = css(scl(skin, 0.94)); ctx.fill();
      ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(skin, 'd', room, 1.3); ctx.stroke();
      if (z < 4.2) {
        ctx.beginPath();
        ears.forEach(function (e) { var a0 = -1.2; ctx.moveTo(e.x + Math.cos(e.a) * e.rx * 0.45 * Math.cos(a0) - Math.sin(e.a) * e.ry * 0.55 * Math.sin(a0), e.y + Math.sin(e.a) * e.rx * 0.45 * Math.cos(a0) + Math.cos(e.a) * e.ry * 0.55 * Math.sin(a0)); ctx.ellipse(e.x, e.y, e.rx * 0.45, e.ry * 0.55, e.a, a0, 1.6); });
        ctx.stroke();
      }
    }
    // hair: a shell over the back and top of the skull, standing a little proud of it
    // short hair comes down to the nape at the back
    var hc = add3(add3(H, J.hf, cap ? -0.006 : -0.014), J.hu, cap ? 0.004 : st === 'short' ? -0.002 : 0.012);
    var hr = cap ? [R[0] * 1.02, R[1] * 0.93, R[2] * 1.01] : long ? [R[0] * 1.12, R[1] * 1.03, R[2] * 1.07] : st === 'short' ? [R[0] * 1.05, R[1] * 1.0, R[2] * 1.05] : [R[0] * 1.05, R[1] * 0.97, R[2] * 1.04];
    var shell = ellOf(hc, [[J.hr, hr[0]], [J.hu, hr[1]], [J.hf, hr[2]]]);
    // the face's side of the skull is not hair: cut the shell where it passes forward of the hairline
    var face = ellOf(add3(add3(H, J.hf, R[2] * 0.72), J.hu, -0.03), [[J.hr, R[0] * 0.95], [J.hu, R[1] * 0.9], [J.hf, R[2] * 0.5]]);
    var nape = ellOf(add3(add3(H, J.hu, -R[1] * 0.92), J.hf, -0.01), [[J.hr, R[0] * 0.7], [J.hu, R[1] * 0.36], [J.hf, R[2] * 0.8]]);
    if (long) longHair(o, J, hair, z, px, room, rim);
    if (shell) {
      ctx.save();
      // under a cap: short dark hair below it, then the cap over the crown, above its band
      var ring = null;
      if (cap) {
        ellPath(shell); ctx.fillStyle = css(scl(hair, 0.9)); ctx.fill();
        ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(hair, 'q', room); ctx.stroke();
        earsDraw();
        ring = [];
        for (var q = 0; q < 24; q++) {
          var an = q / 24 * Math.PI * 2;
          var rp = P2(add3(add3(add3(hc, J.hu, -hr[1] * 0.22), J.hr, Math.cos(an) * hr[0] * 1.0), J.hf, Math.sin(an) * hr[2] * 1.0));
          if (rp) ring.push(rp);
        }
        var hh = hull(ring), li = 0, ri = 0;
        hh.forEach(function (p2, i2) { if (p2[0] < hh[li][0]) li = i2; if (p2[0] > hh[ri][0]) ri = i2; });
        // the lower run of the ring's outline, from its left end to its right end
        var low = [], i3 = li;
        var stepDir = hh[(li + 1) % hh.length][1] > hh[(li - 1 + hh.length) % hh.length][1] ? 1 : -1;
        for (var guard = 0; guard < hh.length; guard++) { low.push(hh[i3]); if (i3 === ri) break; i3 = (i3 + stepDir + hh.length) % hh.length; }
        ring = low;
        ctx.beginPath(); ctx.moveTo(low[0][0], -1e4);
        low.forEach(function (p2) { ctx.lineTo(p2[0], p2[1]); });
        ctx.lineTo(low[low.length - 1][0], -1e4); ctx.closePath();
        ctx.clip();
      }
      var hcol = cap ? mulL(o.cap, hairL) : hair;
      ellPath(shell);
      var gh = ctx.createLinearGradient(shell.x, shell.y - shell.ry, shell.x, shell.y + shell.ry);
      gh.addColorStop(0, css(scl(hcol, 1.22))); gh.addColorStop(0.55, css(hcol)); gh.addColorStop(1, css(scl(hcol, 0.75)));
      ctx.fillStyle = gh; ctx.fill();
      ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(hcol, 'q', room); ctx.stroke();
      // strands from the crown (near figures only), one path, inside the shell
      var crown = z < 4.2 && P2(add3(add3(hc, J.hu, hr[1] * 0.75), J.hf, -hr[2] * 0.45));
      if (crown) {
        ctx.save(); ellPath(shell); ctx.clip();
        ctx.beginPath();
        for (var i = -4; i <= 4; i++) {
          var e1 = P2(add3(add3(add3(hc, J.hr, hr[0] * i / 4.4), J.hu, -hr[1] * 0.8), J.hf, -hr[2] * 0.6 * Math.cos(i / 4.4 * 1.2)));
          if (!e1) continue;
          ctx.moveTo(crown[0], crown[1]);
          ctx.quadraticCurveTo(lerp(crown[0], e1[0], 0.7) + (e1[0] - crown[0]) * 0.2, lerp(crown[1], e1[1], 0.35), e1[0], e1[1]);
        }
        ctx.lineWidth = LW.d * lw; ctx.strokeStyle = cap ? ink(hcol, 'd', room, 0.6) : css(scl(hcol, 1.6), 0.28);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      if (cap && ring && ring.length > 1) {
        // the cap's folded band along its lower edge, inside the head's outline
        ctx.save(); ellPath(shell); ctx.clip();
        smoothPath(ring.map(function (p2) { return [p2[0], p2[1] - 0.008 * px]; }), false);
        ctx.lineWidth = 0.014 * px; ctx.strokeStyle = css(scl(mulL(o.cap, hairL), 1.15)); ctx.stroke();
        smoothPath(ring, false); ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(mulL(o.cap, hairL), 'q', room, 1.2); ctx.stroke();
        ctx.restore();
      }
    }
    // a face, where the head turns toward us: skin forward of the hairline
    var fk = face ? clamp((dot3(J.hf, scl3(view, -1)) - 0.05) / 0.45, 0, 1) : 0;
    if (fk > 0.01 && !cap) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(skull.x, skull.y, skull.rx, skull.ry, skull.a, 0, Math.PI * 2);
      ctx.moveTo(jaw.x + jaw.rx * Math.cos(jaw.a), jaw.y + jaw.rx * Math.sin(jaw.a)); ctx.ellipse(jaw.x, jaw.y, jaw.rx, jaw.ry, jaw.a, 0, Math.PI * 2);
      ctx.clip();
      ellPath(face); ctx.globalAlpha = fk; ctx.fillStyle = css(skin); ctx.fill();
      ctx.lineWidth = 0.008 * px; ctx.strokeStyle = css(scl(hair, 1.1), 0.55); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = fk;
      ctx.beginPath(); ctx.ellipse(jaw.x, jaw.y, jaw.rx, jaw.ry, jaw.a, 0.2, Math.PI - 0.2);
      ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(skin, 'q', room); ctx.stroke();
      ctx.restore();
    }
    if (st === 'short') {
      // the nape below the hairline: skin over the lower back of the skull
      var np = ellOf(add3(add3(H, J.hf, -R[2] * 0.5), J.hu, -R[1] * 0.92), [[J.hr, R[0] * 0.5], [J.hu, R[1] * 0.2], [J.hf, R[2] * 0.45]]);
      if (np) {
        ctx.save(); ellPath(skull); ctx.clip();
        ellPath(np); ctx.fillStyle = css(scl(skin, 0.86)); ctx.fill();
        // the hairline's soft edge
        ctx.beginPath(); ctx.ellipse(np.x, np.y, np.rx, np.ry, np.a, Math.PI * 1.1, Math.PI * 1.9);
        ctx.lineWidth = 0.008 * px; ctx.strokeStyle = css(scl(hair, 1.2), 0.5); ctx.stroke();
        ctx.restore();
      }
      earsDraw();
    }
    if (bun) {
      var bc = add3(add3(H, J.hf, -R[2] * 1.02), J.hu, R[1] * 0.38);
      var be = ellOf(bc, [[J.hr, 0.042], [J.hu, 0.036], [J.hf, 0.034]]);
      if (be) {
        ellPath(be); ctx.fillStyle = css(scl(hair, 1.05)); ctx.fill();
        ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(hair, 'q', room); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(be.x, be.y, be.rx * 0.6, be.ry * 0.55, be.a, -2.6, 0.5); ctx.lineWidth = LW.d * lw; ctx.strokeStyle = css(scl(hair, 1.6), 0.4); ctx.stroke();
      }
      earsDraw();
    }
    // light along the crown, from beyond
    if (shell) { ctx.beginPath(); ctx.ellipse(shell.x, shell.y, shell.rx, shell.ry, shell.a, Math.PI * 1.08, Math.PI * 1.92); strokeRim(rim, 1.3 * lw, 1); }
  }
  // long hair: from the crown, over the nape, spread on the shoulders, with uneven ends
  function longHair(o, J, hair, z, px, room, rim) {
    var R = o.B.head, H = J.head, lw = wf(z), up = [0, 1, 0];
    var back = scl3(o.f, -1), len = o.hairLen || 0.2;
    function Pt(x, y, d) { return P2(add3(add3(add3(J.neck, o.r, x), up, y), back, d)); }
    function Hd(x, y, d) { return P2(add3(add3(add3(H, J.hr, x), J.hu, y), J.hf, -d)); }
    var pts = [
      Hd(-R[0] * 1.1, 0.02, 0.0), Hd(-R[0] * 1.08, -0.06, 0.02), Pt(-0.1, 0.0, 0.03), Pt(-0.12, -len * 0.5, 0.06),
      Pt(-0.1, -len, 0.07), Pt(-0.055, -len - 0.02, 0.075), Pt(-0.015, -len + 0.01, 0.078), Pt(0.03, -len - 0.025, 0.078),
      Pt(0.08, -len, 0.074), Pt(0.115, -len * 0.5, 0.06), Pt(0.1, 0.0, 0.03), Hd(R[0] * 1.08, -0.06, 0.02), Hd(R[0] * 1.1, 0.02, 0.0),
      Hd(R[0] * 0.6, R[1] * 0.9, 0.04), Hd(-R[0] * 0.6, R[1] * 0.9, 0.04)
    ];
    if (!pts.every(Boolean)) return;
    smoothPath(pts);
    var g = ctx.createLinearGradient(0, pts[13][1], 0, pts[6][1]);
    g.addColorStop(0, css(scl(hair, 1.15))); g.addColorStop(0.5, css(hair)); g.addColorStop(1, css(scl(hair, 0.7)));
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(hair, 'q', room); ctx.stroke();
    var top = z < 4.2 && P2(add3(add3(H, J.hu, R[1] * 0.7), J.hf, -R[2] * 0.4));
    if (top) {
      ctx.save(); ctx.clip();
      ctx.beginPath();
      for (var k = 0; k <= 8; k++) {
        var e = pts[3 + k];
        ctx.moveTo(top[0], top[1]);
        ctx.bezierCurveTo(top[0] + (e[0] - top[0]) * 0.9, top[1] + (e[1] - top[1]) * 0.25, e[0], lerp(top[1], e[1], 0.6), e[0], e[1]);
      }
      ctx.lineWidth = LW.d * lw; ctx.strokeStyle = css(scl(hair, 1.6), 0.26); ctx.stroke();
      ctx.restore();
    }
    smoothPath(pts.slice(10).concat(pts.slice(0, 3)), false);
    strokeRim(rim, 1.2 * lw, 0.8);
  }

  /* ======================================================================
     THE DINING ROOM: tables, chairs, guests, settings, pendants, the till
     ====================================================================== */
  var DGROUPS = [];
  // each seat: angle round the table (0 = the far side), and who sits there
  var PEOPLE = [
    // by the pass: a couple, turned to each other; she waits for the plate the server brings
    { t: 0, a: Math.PI + 0.62, build: 'f', top: '#2c3646', skin: '#e0b89c', hair: '#2e2019', hairStyle: 'long',
      lean: 0.08, twist: -0.12, hYaw: function (t) { return 0.3 + 0.05 * Math.sin(t * 0.4) - 0.85 * GUEST_TURN.k; }, arms: 'wait' },
    { t: 0, a: Math.PI - 0.66, build: 'm', top: '#4f5f6c', skin: '#c99d82', hair: '#2c2421', hairStyle: 'short', collar: '#e8e4da',
      lean: 0.16, twist: 0.15, hYaw: function (t) { return 0.5 + 0.05 * Math.sin(t * 0.43 + 1); }, arms: 'glass' },
    // the back left table
    { t: 1, a: Math.PI + 0.42, build: 'm', top: '#36443d', skin: '#8d5f45', hair: '#161413', hairStyle: 'short',
      lean: 0.24, twist: -0.1, hYaw: function (t) { return -0.3 + 0.08 * Math.sin(t * 0.31); }, arms: 'rest', hem: true },
    { t: 1, a: Math.PI - 0.8, build: 'f', top: '#c9b99c', skin: '#d8b294', hair: '#9a6c40', hairStyle: 'bun',
      lean: 0.1, twist: 0.2, hYaw: function (t) { return 0.75 + 0.05 * Math.sin(t * 0.5 + 2); }, arms: 'talk' },
    // the far left
    { t: 2, a: Math.PI + 0.25, build: 'm', top: '#6e4e3e', skin: '#c49478', hair: '#8f8b86', hairStyle: 'short',
      lean: 0.14, hYaw: function () { return 0.25; }, arms: 'rest', seam: true, collar: '#ddd6c8' },
    // the middle of the room
    { t: 3, a: Math.PI - 0.38, build: 'f', top: '#a4583c', skin: '#e2bba0', hair: '#4a2a1c', hairStyle: 'long',
      lean: 0.12, twist: 0.05, hYaw: function (t) { return 0.12 + 0.05 * Math.sin(t * 0.4); }, arms: 'talk' }
  ];
  // the waiting guest turns her head a little as the server comes to her
  var GUEST_TURN = { k: 0 };
  var COATS = [{ t: 2, a: Math.PI - 0.75, c: '#6b5a44' }, { t: 3, a: Math.PI + 0.85, c: null }, { t: 4, a: Math.PI + 0.55, c: '#3f4a52' }, { t: 4, a: Math.PI - 0.6, c: null }];

  function seatPos(tb, a, r) { r = r || 0.6; return [tb.x + Math.sin(a) * r, FL + 0.46, tb.z + Math.cos(a) * r]; }

  TABLES.forEach(function (tb, ti) {
    var G = Group('table' + ti, 'd');
    G.c = [tb.x, TY, tb.z];
    tb.G = G;
    // the table: a pedestal, a round oak top
    G.base = [];
    poly(G.base, ringY(tb.x, FL + 0.003, tb.z, 0.28, 20), mD('#3a3029', null, { a: 0.25 }));
    poly(G.base, ringY(tb.x, FL + 0.01, tb.z, 0.2, 20), mD('#463a30', 'q'));
    poly(G.base, [[tb.x - 0.035, TY - 0.03, tb.z], [tb.x + 0.035, TY - 0.03, tb.z], [tb.x + 0.035, FL + 0.02, tb.z], [tb.x - 0.035, FL + 0.02, tb.z]], mD('#4a3d32', 'q'));
    G.top = [];
    var rimTop = ringY(tb.x, TY, tb.z, 0.42, 36), rimBot = ringY(tb.x, TY - 0.04, tb.z, 0.42, 36);
    G.rimTop = rimTop; G.rimBot = rimBot;
    poly(G.top, rimTop, mD('#a5835f', 'k'));
    G.topIt = G.top[0];
    // seats round the table: chairs at night go up on the table
    G.seats = [];
    var occupied = PEOPLE.filter(function (p) { return p.t === ti; }).map(function (p) { return p.a; });
    var coats = COATS.filter(function (c) { return c.t === ti; });
    var angles = occupied.concat(coats.map(function (c) { return c.a; }));
    if (angles.length < 2) angles.push(angles[0] + Math.PI);
    angles.forEach(function (a, k) {
      var c = seatPos(tb, a, 0.62), th = a + Math.PI;
      var S = { a: a, c: c, th: th, seat: [], back: [], coat: null, who: null };
      chairItems(S.seat, c, th, false);
      chairBack(S.back, c, th);
      var coat = coats.filter(function (q) { return q.a === a; })[0];
      if (coat && coat.c) S.coat = coatItems(c, th, coat.c);
      G.seats.push(S);
    });
    G.up = [];
    chairUp(G.up, [tb.x - 0.13, 0, tb.z + 0.02], 0.3 + ti);
    chairUp(G.up, [tb.x + 0.14, 0, tb.z - 0.03], -0.5 + ti);
    // the setting: plates, glasses, a candle
    G.setting = [];
    G.seats.forEach(function (S) {
      var d = [Math.sin(S.a), 0, Math.cos(S.a)];
      var pc = [tb.x + d[0] * 0.25, TY + 0.003, tb.z + d[2] * 0.25];
      S.plate = pc;
      var gl = [tb.x + d[0] * 0.2 + d[2] * 0.14, TY, tb.z + d[2] * 0.2 - d[0] * 0.14];
      S.glass = gl;
    });
    // the pendant over the table
    G.pend = { p: [tb.x, 0.62, tb.z] };
    lines(DSH, [seg([tb.x, DC, tb.z], [tb.x, 0.66, tb.z])], mD(null, 'q', { ref: '#d7d1c6', lit: false }));
    DGROUPS.push(G);
  });
  function coatItems(c, th, colr) {
    var f = [Math.sin(th), 0, Math.cos(th)], r = [Math.cos(th), 0, -Math.sin(th)];
    function W(a, y, b) { return [c[0] + r[0] * a + f[0] * b, y, c[2] + r[2] * a + f[2] * b]; }
    var sy = FL + 0.46, b = -0.21, top = sy + 0.53;
    var L2 = [];
    var dark = scl(col(colr), 0.72).map(Math.round).reduce(function (s2, v) { return s2 + ('0' + v.toString(16)).slice(-2); }, '#');
    // the body of the coat hanging behind the chair, its hem uneven
    var hang = [W(-0.19, top - 0.02, b - 0.035), W(-0.06, top + 0.005, b - 0.04), W(0.07, top + 0.005, b - 0.04), W(0.19, top - 0.02, b - 0.035),
      W(0.215, top - 0.2, b - 0.07), W(0.22, sy + 0.06, b - 0.1), W(0.1, sy + 0.02, b - 0.11), W(-0.02, sy + 0.05, b - 0.115), W(-0.13, sy + 0.01, b - 0.11), W(-0.225, sy + 0.07, b - 0.095), W(-0.215, top - 0.2, b - 0.07)];
    poly(L2, hang, mD(colr, 'k'));
    // the collar folded over the rail
    poly(L2, [W(-0.18, top - 0.015, b + 0.005), W(0.18, top - 0.015, b + 0.005), W(0.19, top - 0.02, b - 0.035), W(0.08, top - 0.06, b - 0.05), W(-0.08, top - 0.06, b - 0.05), W(-0.19, top - 0.02, b - 0.035)], mD(dark, 'q'));
    // a sleeve falling down the side
    poly(L2, [W(0.18, top - 0.04, b - 0.04), W(0.235, top - 0.08, b - 0.03), W(0.26, sy - 0.08, b - 0.01), W(0.205, sy - 0.1, b - 0.02), W(0.19, top - 0.12, b - 0.05)], mD(dark, 'q'));
    lines(L2, [seg(W(-0.07, top - 0.07, b - 0.06), W(-0.06, sy + 0.08, b - 0.11)), seg(W(0.06, top - 0.06, b - 0.06), W(0.1, sy + 0.06, b - 0.11)), seg(W(-0.15, top - 0.1, b - 0.07), W(-0.17, sy + 0.12, b - 0.1))], mD(null, 'd', { ref: colr, lm: 1.6 }));
    return L2;
  }

  // the people, made into figures at their seats
  var ARMS = {
    rest: function (o) {
      return { L: function () { return { w: [-0.15, 0.31, 0.4] }; }, R: function () { return { w: [0.12, 0.31, 0.44] }; } };
    },
    talk: function (o) {
      return {
        L: function () { return { w: [-0.12, 0.31, 0.41] }; },
        R: function (t) { var k = 0.5 + 0.5 * Math.sin(t * 1.1 + o.ph); return { w: [0.17 + 0.03 * k, 0.38 + 0.07 * k, 0.34] }; }
      };
    },
    glass: function (o) {
      return {
        L: function () { return { w: [-0.12, 0.31, 0.42] }; },
        R: function (t) { var k = 0.5 + 0.5 * Math.sin(t * 0.6 + o.ph); return { w: [0.12, 0.4 + 0.04 * k, 0.33] }; }
      };
    },
    wait: function (o) {
      return { L: function () { return { w: [-0.11, 0.31, 0.4] }; }, R: function () { return { w: [0.1, 0.31, 0.42] }; } };
    }
  };
  PEOPLE.forEach(function (p, i) {
    var tb = TABLES[p.t];
    var o = makeFigure({ b: seatPos(tb, p.a, 0.62), th: p.a + Math.PI, build: p.build, top: col(p.top), skin: col(p.skin), hair: col(p.hair), hairStyle: p.hairStyle,
      collar: p.collar ? col(p.collar) : null, lean: p.lean, twist: p.twist, hYaw: p.hYaw, hem: p.hem, seam: p.seam, ph: i * 1.7 });
    o.arm = ARMS[p.arms](o);
    // the glass in the raised hand
    o.glass = p.arms === 'glass';
    p.fig = o;
    var S = tb.G.seats.filter(function (s) { return s.a === p.a; })[0];
    S.who = o;
  });

  // the host stand and the till, nearest us on the right
  var GT = Group('till', 'd');
  GT.c = [(HS.x0 + HS.x1) / 2, HS.top, (HS.z0 + HS.z1) / 2];
  (function () {
    var L2 = GT.items;
    poly(L2, ringY((HS.x0 + HS.x1) / 2, FL + 0.003, (HS.z0 + HS.z1) / 2, 0.62, 20), mD('#2a2420', null, { a: 0.3 }));
    poly(L2, [[HS.x0, HS.top, HS.z0], [HS.x0, HS.top, HS.z1], [HS.x0, FL, HS.z1], [HS.x0, FL, HS.z0]], mD('#7a6550', 'k'));
    poly(L2, [[HS.x0, HS.top, HS.z0], [HS.x1, HS.top, HS.z0], [HS.x1, FL, HS.z0], [HS.x0, FL, HS.z0]], mD('#8d765e', 'k', { sh: [1.05, 1, 0.85] }));
    var pn = [];
    for (var px = HS.x0 + 0.1; px < HS.x1; px += 0.1) pn.push(seg([px, HS.top - 0.06, HS.z0], [px, FL + 0.05, HS.z0]));
    lines(L2, pn, mD(null, 'x', { ref: '#8d765e', lm: 1.8 }));
    poly(L2, [[HS.x0 - 0.03, HS.top, HS.z0 - 0.03], [HS.x1 + 0.03, HS.top, HS.z0 - 0.03], [HS.x1 + 0.03, HS.top, HS.z1], [HS.x0 - 0.03, HS.top, HS.z1]], mD('#b5976f', 'k'));
    poly(L2, [[HS.x0 - 0.03, HS.top, HS.z0 - 0.03], [HS.x1 + 0.03, HS.top, HS.z0 - 0.03], [HS.x1 + 0.03, HS.top - 0.04, HS.z0 - 0.03], [HS.x0 - 0.03, HS.top - 0.04, HS.z0 - 0.03]], mD('#8d765e', 'q'));
  })();
  var TS = { x0: 0.83, x1: 1.17, zb: -1.75, zt: -1.69, yb: HS.top + 0.12, yt: HS.top + 0.36 };
  (function () {
    var L2 = GT.items;
    poly(L2, ringY((TS.x0 + TS.x1) / 2, HS.top + 0.004, -1.67, 0.07, 18), mD('#55595c', 'q'));
    poly(L2, [[0.99, HS.top, -1.67], [1.01, HS.top, -1.67], [1.01, TS.yb + 0.04, -1.67], [0.99, TS.yb + 0.04, -1.67]], mD('#55595c', 'q'));
    poly(L2, [[TS.x0, TS.yt, TS.zt], [TS.x1, TS.yt, TS.zt], [TS.x1, TS.yb, TS.zb], [TS.x0, TS.yb, TS.zb]], mD('#3d4245', 'k'));
  })();
  var tm = 0.016;
  var SCREEN = [[TS.x0 + tm, TS.yt - tm, TS.zt - 0.002], [TS.x1 - tm, TS.yt - tm, TS.zt - 0.002], [TS.x1 - tm, TS.yb + tm, TS.zb - 0.002], [TS.x0 + tm, TS.yb + tm, TS.zb - 0.002]];
  var PR = { x0: 1.23, x1: 1.45, z0: -1.83, z1: -1.57, y: HS.top + 0.13 };
  (function () {
    var L2 = GT.items;
    poly(L2, [[PR.x0, PR.y, PR.z0], [PR.x0, PR.y, PR.z1], [PR.x0, HS.top, PR.z1], [PR.x0, HS.top, PR.z0]], mD('#4a4f52', 'q'));
    poly(L2, [[PR.x0, PR.y, PR.z0], [PR.x1, PR.y, PR.z0], [PR.x1, HS.top, PR.z0], [PR.x0, HS.top, PR.z0]], mD('#5b6164', 'k'));
    poly(L2, [[PR.x0, PR.y, PR.z0], [PR.x1, PR.y, PR.z0], [PR.x1, PR.y, PR.z1], [PR.x0, PR.y, PR.z1]], mD('#6c7276', 'k'));
    poly(L2, [[PR.x0 + 0.03, PR.y + 0.001, PR.z0 + 0.06], [PR.x1 - 0.03, PR.y + 0.001, PR.z0 + 0.06], [PR.x1 - 0.03, PR.y + 0.001, PR.z0 + 0.085], [PR.x0 + 0.03, PR.y + 0.001, PR.z0 + 0.085]], mD('#24282a', null));
  })();
  var SLOT = [(PR.x0 + PR.x1) / 2, PR.y + 0.002, PR.z0 + 0.072];
  DGROUPS.push(GT);

  /* ======================================================================
     THE KITCHEN'S OBJECTS: the fridge and its food, the range, the chef
     ====================================================================== */
  var KGROUPS = [];
  var GF = Group('fridge', 'k');
  GF.c = [(FX0 + FX1) / 2, -0.3, FZ + 0.3];
  KGROUPS.push(GF);
  var IX0 = FX0 + 0.045, IX1 = FX1 - 0.045, IT = FT - 0.06, IZ = FZ + 0.012, IB = FZ + FD - 0.06, IBOT = FL + 0.32;
  var SHV = [0.2, -0.27, -0.74];
  (function () {
    var L2 = GF.items;
    poly(L2, ringY((FX0 + FX1) / 2, FL + 0.003, FZ + 0.34, 0.66, 20), mK('#2c2f31', null, { a: 0.25 }));
    // body: the left side faces us, the front frame
    poly(L2, [[FX0, FT, FZ], [FX0, FT, FZ + FD], [FX0, FL, FZ + FD], [FX0, FL, FZ]], mK('#c9cdce', 'k', { sh: [1.04, 1, 0.9] }));
    poly(L2, [[FX0, FT, FZ], [FX1, FT, FZ], [FX1, FT, FZ + FD], [FX0, FT, FZ + FD]], mK('#d7dada', 'q'));
    poly(L2, [[FX0, FT, FZ], [FX1, FT, FZ], [FX1, FL, FZ], [FX0, FL, FZ]], mK('#dadddd', 'k'));
  })();
  // inside: lit by its own lamp when the door is open
  var FIN = [];
  poly(FIN, [[IX0, IT, IB], [IX1, IT, IB], [IX1, IBOT, IB], [IX0, IBOT, IB]], mK('#eef3f4', 'q', { sh: [0.92, 1, 0.9] }));
  poly(FIN, [[IX0, IT, IZ], [IX0, IT, IB], [IX0, IBOT, IB], [IX0, IBOT, IZ]], mK('#dfe7e8', 'q'));
  poly(FIN, [[IX1, IT, IZ], [IX1, IT, IB], [IX1, IBOT, IB], [IX1, IBOT, IZ]], mK('#d6dfe0', 'q'));
  poly(FIN, [[IX0, IT, IZ], [IX1, IT, IZ], [IX1, IT, IB], [IX0, IT, IB]], mK('#cbd5d6', 'q'));
  poly(FIN, [[IX0, IBOT, IZ], [IX1, IBOT, IZ], [IX1, IBOT, IB], [IX0, IBOT, IB]], mK('#d9e1e2', 'q'));
  var SHELF = SHV.map(function (sy) {
    var L2 = [];
    poly(L2, [[IX0, sy, IZ], [IX1, sy, IZ], [IX1, sy, IB], [IX0, sy, IB]], mK('#e3eaeb', null, { a: 0.85 }));
    var wires = [];
    for (var wx = IX0 + 0.04; wx < IX1; wx += 0.045) wires.push(seg([wx, sy, IZ], [wx, sy, IB]));
    lines(L2, wires, mK(null, 'd', { ref: '#e3eaeb' }));
    poly(L2, [[IX0, sy, IZ], [IX1, sy, IZ], [IX1, sy - 0.022, IZ], [IX0, sy - 0.022, IZ]], mK('#b9c3c5', 'k'));
    return L2;
  });
  FIN.forEach(prepLater);
  SHELF.forEach(function (L2) { L2.forEach(prepLater); });
  function prepLater(it) { it.prepLater = true; }

  /* ---- food in the fridge: drawn in 3D, no labels ---- */
  // a slab of food: an outline (local x, z in metres), a thickness, a pose
  function Slab(outline, th, top, side) { return { o: outline, th: th, top: col(top), side: col(side), detail: null }; }
  var RIBEYE = [[-1.0, 0.05], [-0.93, 0.4], [-0.66, 0.66], [-0.2, 0.75], [0.28, 0.68], [0.68, 0.52], [0.95, 0.24], [1.0, -0.1], [0.84, -0.42], [0.5, -0.6],
    [0.18, -0.5], [-0.12, -0.6], [-0.5, -0.68], [-0.84, -0.46]];
  function steakOutline(w, d, seed) {
    var r2 = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(seed + 3);
    return RIBEYE.map(function (q) { var k = 1 + (r2() - 0.5) * 0.08; return [q[0] * w * k, q[1] * d * k]; });
  }
  // place a local outline point in the world
  function poseFn(c, yaw, tilt, roll) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt || 0), st = Math.sin(tilt || 0), cr = Math.cos(roll || 0), sr = Math.sin(roll || 0);
    return function (x, h, z) {
      // roll about local z, tilt about local x, then yaw
      var x1 = x * cr - h * sr, h1 = x * sr + h * cr;
      var h2 = h1 * ct - z * st, z2 = h1 * st + z * ct;
      return [c[0] + x1 * cy + z2 * sy, c[1] + h2, c[2] - x1 * sy + z2 * cy];
    };
  }
  function drawSlab(S, W, room, Lmul, extra) {
    var top = [], bot = [], i;
    for (i = 0; i < S.o.length; i++) {
      var q = S.o[i];
      var a = P2(W(q[0], S.th, q[1])), b = P2(W(q[0], 0, q[1]));
      if (!a || !b) return;
      top.push(a); bot.push(b);
    }
    var cW = W(0, S.th / 2, 0), z = toCam(cW)[2];
    var L = Lmul || lightAt(cW, room);
    var sideC = mulL(S.side, L), topC = mulL(S.top, L);
    var H = hull(top.concat(bot));
    polyPath(H);
    fillStroke(sideC, 1, 'q', room, z);
    // is the top facing us?
    var n = sub3(W(0, 1, 0), W(0, 0, 0)), tv = dot3(n, sub3(camPos(), cW));
    if (tv > 0) {
      smoothPath(top);
      var hm = top[Math.floor(top.length / 2)], g = ctx.createLinearGradient(top[0][0], top[0][1], hm[0], hm[1]);
      g.addColorStop(0, css(scl(topC, 1.08))); g.addColorStop(1, css(scl(topC, 0.9)));
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = LW.d * wf(z); ctx.strokeStyle = ink(topC, 'd', room); ctx.stroke();
      if (extra) { ctx.save(); smoothPath(top); ctx.clip(); extra(W, z, L, top); ctx.restore(); }
    } else if (extra && S.under) { S.under(W, z, L); }
  }
  // a curve on the top of a slab, through local points
  function slabCurve(W, h, pts, w, c, a) {
    var ps = pts.map(function (q) { return P2(W(q[0], h, q[1])); });
    if (ps.some(function (p) { return !p; })) return;
    smoothPath(ps, false);
    ctx.lineWidth = w; ctx.strokeStyle = css(c, a); ctx.stroke();
  }
  // a cylinder (a deli tub or a glass): its outline is the hull of its rims
  function cylPath(c, y0, y1, r0, r1, n) {
    n = n || 20;
    var a = projAll(ringPts([c[0], y0, c[2]], r0, n)), b = projAll(ringPts([c[0], y1, c[2]], r1, n));
    if (!a || !b) return null;
    return { side: hull(a.concat(b)), top: b, bot: a };
  }

  // the steaks on their tray (middle shelf)
  var TRAY1 = { x0: IX0 + 0.04, x1: IX0 + 0.62, z0: IZ + 0.06, z1: IZ + 0.44, y: SHV[1] + 0.002 };
  var STEAKS = [];
  (function () {
    var k = 0;
    for (var j = 0; j < 2; j++) for (var i = 0; i < 3; i++) {
      var c = [lerp(TRAY1.x0, TRAY1.x1, (i + 0.5) / 3) + (j ? 0.02 : -0.01), TRAY1.y + 0.012, lerp(TRAY1.z1, TRAY1.z0, (j + 0.5) / 2)];
      var S = Slab(steakOutline(0.088, 0.066, 7 + k * 3), 0.03, '#a8343a', '#7c2329');
      S.c = c; S.yaw = (rnd() - 0.5) * 0.5 + (k % 2 ? 0.2 : -0.1); S.seed = k;
      STEAKS.push(S); k++;
    }
  })();
  var HERO = STEAKS[4];       // the front middle one goes to the pan
  // raw meat: a fat cap round the outer curve, a seam of fat, flecks of marbling
  function rawDetail(S) {
    var r2 = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(S.seed * 7 + 11);
    var flecks = [];
    for (var i = 0; i < 16; i++) {
      var u = (r2() - 0.5) * 1.5, v = (r2() - 0.5) * 1.0, a = r2() * Math.PI, l = 0.006 + r2() * 0.012;
      flecks.push([[u * 0.088 - Math.cos(a) * l, v * 0.066 - Math.sin(a) * l], [u * 0.088, v * 0.066 + 0.002], [u * 0.088 + Math.cos(a) * l, v * 0.066 + Math.sin(a) * l], 0.0012 + r2() * 0.0018]);
    }
    return function (W, z, L) {
      var pxm = F / z, h = S.th + 0.0005;
      var fat = mulL('#efdfcb', L), mar = mulL('#f0d9cc', L);
      // darker toward the edges: the meat's depth
      var c0 = P2(W(0, h, 0)), c1 = P2(W(0.09, h, 0));
      if (c0 && c1) {
        var rr = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]);
        var g = ctx.createRadialGradient(c0[0], c0[1], 0, c0[0], c0[1], rr * 1.1);
        g.addColorStop(0, css(mulL('#b8434a', L), 0.55)); g.addColorStop(1, css(mulL('#6e1d24', L), 0.5));
        ctx.fillStyle = g; ctx.fillRect(c0[0] - rr * 1.2, c0[1] - rr * 1.2, rr * 2.4, rr * 2.4);
      }
      // the fat cap, round the outer (+z) curve
      var cap = S.o.slice(1, 7), inner = cap.slice().reverse().map(function (q) { return [q[0] * 0.9, q[1] * 0.8]; });
      var ps = cap.concat(inner).map(function (q) { return P2(W(q[0], h, q[1])); });
      if (ps.every(Boolean)) { smoothPath(ps); ctx.fillStyle = css(fat, 0.92); ctx.fill(); }
      // the seam between the eye and the cap
      slabCurve(W, h, [[-0.07, 0.035], [-0.03, 0.012], [0.02, 0.018], [0.06, 0.03]], 0.0028 * pxm, mar, 0.85);
      flecks.forEach(function (f) { slabCurve(W, h, [f[0], f[1], f[2]], f[3] * pxm, mar, 0.7); });
      // a wet sheen
      var sh = P2(W(-0.025, h, -0.01));
      if (sh) { ctx.fillStyle = css([255, 236, 232], 0.16); ctx.beginPath(); ctx.ellipse(sh[0], sh[1], 0.03 * pxm, 0.007 * pxm, -0.2, 0, Math.PI * 2); ctx.fill(); }
    };
  }
  STEAKS.forEach(function (S) { S.detail = rawDetail(S); });

  // the salmon portions (bottom shelf, right)
  var TRAY2 = { x0: IX0 + 0.5, x1: IX1 - 0.05, z0: IZ + 0.07, z1: IZ + 0.45, y: SHV[2] + 0.002 };
  var SALMON = [];
  (function () {
    for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
      var o = [[-0.06, -0.035], [0.055, -0.04], [0.065, 0.0], [0.058, 0.04], [-0.05, 0.042], [-0.066, 0.0]];
      var S = Slab(o, 0.03, '#e58a62', '#cf6d4c');
      S.c = [lerp(TRAY2.x0, TRAY2.x1, (i + 0.5) / 2), TRAY2.y + 0.012, lerp(TRAY2.z1, TRAY2.z0, (j + 0.5) / 2)];
      S.yaw = (i - 0.5) * 0.25 + (j ? 0.1 : -0.15);
      S.detail = function (W, z, L) {
        var pxm = F / z, w = mulL('#fbe6d8', L);
        for (var k = -2; k <= 2; k++) slabCurve(W, 0.03, [[k * 0.022 - 0.01, -0.04], [k * 0.022 + 0.008, 0.0], [k * 0.022 - 0.004, 0.04]], 0.0035 * pxm, w, 0.75);
      };
      SALMON.push(S);
    }
  })();
  // the greens (bottom shelf, left): a deep tub heaped with leaves
  var GREENS = { c: [IX0 + 0.22, SHV[2], IZ + 0.27], w: 0.2, d: 0.16, h: 0.12, leaves: [] };
  (function () {
    var G = GREENS, cols = ['#5f8a3e', '#76a04a', '#4f7a35', '#8bb35a', '#6a9440', '#9cbf68', '#557f38'];
    for (var i = 0; i < 70; i++) {
      var u = (rnd() - 0.5) * 2, v = (rnd() - 0.5) * 2;
      if (u * u * 0.8 + v * v > 1.1) { i--; continue; }
      var hgt = G.h + 0.04 * (1 - (u * u + v * v) / 1.4) + rnd() * 0.014;
      G.leaves.push({ p: [G.c[0] + u * G.w * 0.95, G.c[1] + hgt, G.c[2] + v * G.d * 0.95], c: col(cols[i % cols.length]), r: 0.03 + rnd() * 0.02, a: rnd() * Math.PI * 2, e: 0.42 + rnd() * 0.2, curl: rnd() - 0.5 });
    }
    G.leaves.sort(function (a, b) { return b.p[2] - a.p[2]; });
  })();
  // sauces in deli containers (top shelf)
  var DELI = [
    { x: IX0 + 0.1, z: IZ + 0.3, r: 0.058, h: 0.11, lvl: 0.82, c: '#a2301f', fl: '#d8613f' },   // tomato
    { x: IX0 + 0.25, z: IZ + 0.33, r: 0.058, h: 0.11, lvl: 0.7, c: '#4b6424', fl: '#86a548' },   // salsa verde
    { x: IX0 + 0.4, z: IZ + 0.27, r: 0.05, h: 0.085, lvl: 0.75, c: '#e9dcc0', fl: '#f8f1e2' },   // aioli
    { x: IX0 + 0.56, z: IZ + 0.33, r: 0.058, h: 0.11, lvl: 0.66, c: '#b4542a', fl: '#d98a52' },  // romesco
    { x: IX0 + 0.72, z: IZ + 0.28, r: 0.05, h: 0.085, lvl: 0.8, c: '#5a2a18', fl: '#8a4a2a' },   // jus
    { x: IX0 + 0.9, z: IZ + 0.31, r: 0.058, h: 0.11, lvl: 0.72, c: '#dcb75a', fl: '#f0d78e' }    // butter
  ];
  // a lexan of stock on the bottom shelf, back right
  function drawDeli(d, room, yb) {
    var c = [d.x, yb, d.z], Lc = lightAt([d.x, yb + 0.05, d.z], room);
    var z = toCam(c)[2], lw = wf(z);
    // the sauce
    var s = cylPath(c, yb + 0.004, yb + d.h * d.lvl, d.r * 0.96, d.r * 0.98, 18);
    if (!s) return;
    var sc = mulL(d.c, Lc);
    polyPath(s.side);
    var g = ctx.createLinearGradient(s.side[0][0], 0, s.side[Math.floor(s.side.length / 2)][0], 0);
    g.addColorStop(0, css(scl(sc, 0.9))); g.addColorStop(0.35, css(scl(sc, 1.1))); g.addColorStop(1, css(scl(sc, 0.78)));
    ctx.fillStyle = g; ctx.fill();
    polyPath(s.top); ctx.fillStyle = css(scl(sc, 1.12)); ctx.fill();
    // flecks in the sauce, seen through the tub and on its surface
    var fc = mulL(d.fl, Lc), z0 = toCam(c)[2], pxd = F / z0;
    for (var k = 0; k < 9; k++) {
      var an = k * 2.4 + d.x * 40, rr = d.r * (0.2 + 0.7 * ((k * 37) % 10) / 10);
      var hh = yb + d.h * d.lvl * (k < 5 ? 1.0 : 0.25 + 0.6 * ((k * 53) % 10) / 10);
      var fp = P2([d.x + Math.cos(an) * rr, hh, d.z + Math.sin(an) * rr * (k < 5 ? 1 : -1)]);
      if (fp) { ctx.beginPath(); ctx.ellipse(fp[0], fp[1], 0.004 * pxd, 0.0025 * pxd, an, 0, Math.PI * 2); ctx.fillStyle = css(fc, 0.8); ctx.fill(); }
    }
    // the meniscus
    polyPath(s.top); ctx.lineWidth = 0.8 * wf(z0); ctx.strokeStyle = css(scl(sc, 0.7), 0.7); ctx.stroke();
    // the clear tub over it, and its lid
    var t = cylPath(c, yb, yb + d.h, d.r, d.r * 1.05, 18);
    if (!t) return;
    polyPath(t.side); ctx.fillStyle = css([240, 246, 247], 0.14); ctx.fill();
    ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(mulL('#e7eeef', Lc), 'q', room); ctx.stroke();
    polyPath(t.top); ctx.fillStyle = css(mulL('#f3f6f6', Lc), 0.6); ctx.fill();
    ctx.lineWidth = LW.q * lw; ctx.stroke();
    // a sheen down the left of the tub
    var a = P2([d.x - d.r * 0.62, yb + d.h * 0.85, d.z - d.r * 0.7]), b = P2([d.x - d.r * 0.58, yb + d.h * 0.15, d.z - d.r * 0.75]);
    if (a && b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineWidth = 2 * lw; ctx.strokeStyle = css([255, 255, 255], 0.45); ctx.stroke(); }
  }
  function drawTray(T, room) {
    var y = T.y, h = 0.022;
    var Lc = lightAt([(T.x0 + T.x1) / 2, y, (T.z0 + T.z1) / 2], room);
    var tc = mulL('#c7cccd', Lc), z = toCam([(T.x0 + T.x1) / 2, y, (T.z0 + T.z1) / 2])[2];
    var top = projAll([[T.x0, y + h, T.z0], [T.x1, y + h, T.z0], [T.x1, y + h, T.z1], [T.x0, y + h, T.z1]]);
    var bot = projAll([[T.x0 + 0.01, y, T.z0 + 0.01], [T.x1 - 0.01, y, T.z0 + 0.01], [T.x1 - 0.01, y, T.z1 - 0.01], [T.x0 + 0.01, y, T.z1 - 0.01]]);
    if (!top || !bot) return;
    polyPath(hull(top.concat(bot))); fillStroke(scl(tc, 0.85), 1, 'q', room, z);
    polyPath(top); fillStroke(tc, 1, 'q', room, z);
    // parchment
    var pa = projAll([[T.x0 + 0.015, y + 0.004, T.z0 + 0.015], [T.x1 - 0.015, y + 0.004, T.z0 + 0.015], [T.x1 - 0.015, y + 0.004, T.z1 - 0.015], [T.x0 + 0.015, y + 0.004, T.z1 - 0.015]]);
    if (pa) { polyPath(pa); ctx.fillStyle = css(mulL('#f1ead9', Lc)); ctx.fill(); }
  }
  function drawGreens(room) {
    var G = GREENS, y = G.c[1], Lc = lightAt([G.c[0], y + 0.1, G.c[2]], room);
    var box = [[G.c[0] - G.w, y, G.c[2] - G.d], [G.c[0] + G.w, y, G.c[2] - G.d], [G.c[0] + G.w, y, G.c[2] + G.d], [G.c[0] - G.w, y, G.c[2] + G.d]];
    var boxT = box.map(function (p) { return [p[0], p[1] + G.h, p[2]]; });
    var a = projAll(box), b = projAll(boxT);
    if (!a || !b) return;
    var z = toCam(G.c)[2], lw = wf(z), pxm = F / z;
    // the leaves, back to front
    G.leaves.forEach(function (lf) {
      var p = P2(lf.p);
      if (!p) return;
      var r = lf.r * pxm, c = mulL(lf.c, Lc), ca = Math.cos(lf.a), sa = Math.sin(lf.a) * 0.6;
      // a pointed leaf: two curves from stem to tip, squashed by the view from above
      var x0 = p[0] - ca * r, y0 = p[1] - sa * r, x1 = p[0] + ca * r, y1 = p[1] + sa * r;
      var nx = -sa * r * lf.e * 1.2, ny = ca * r * lf.e * 0.7;
      ctx.beginPath(); ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(p[0] + nx * (1 + lf.curl), p[1] + ny * (1 + lf.curl), x1, y1);
      ctx.quadraticCurveTo(p[0] - nx * (1 - lf.curl), p[1] - ny * (1 - lf.curl), x0, y0);
      var g = ctx.createLinearGradient(p[0] + nx, p[1] + ny, p[0] - nx, p[1] - ny);
      g.addColorStop(0, css(scl(c, 1.15))); g.addColorStop(1, css(scl(c, 0.78)));
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 0.5 * lw; ctx.strokeStyle = css(scl(c, 0.55), 0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(p[0] + nx * 0.15, p[1] + ny * 0.15, x1, y1);
      ctx.lineWidth = 0.5 * lw; ctx.strokeStyle = css(scl(c, 1.45), 0.55); ctx.stroke();
    });
    // the clear tub's front and sides, over the leaves
    polyPath([a[0], a[1], b[1], b[0]]); ctx.fillStyle = css([236, 244, 245], 0.22); ctx.fill();
    ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(mulL('#e6eeef', Lc), 'q', 'k'); ctx.stroke();
    polyPath([a[0], a[3], b[3], b[0]]); ctx.fillStyle = css([236, 244, 245], 0.16); ctx.fill(); ctx.stroke();

  }

  // the door: hinged on the right, it swings toward us; its inside has shelves
  var DOOR = { open: 0 };
  function drawDoor(room) {
    var th = DOOR.open, hx = FX1 - 0.005, hz = FZ - 0.005, dw = FX1 - FX0 - 0.01, dt = 0.07;
    var ux = [-Math.cos(th), 0, -Math.sin(th)], nIn = [-Math.sin(th), 0, Math.cos(th)];
    function D(u, y, w) { return [hx + ux[0] * u + nIn[0] * w, y, hz + ux[2] * u + nIn[2] * w]; }
    var yb = FL + 0.04, yt = FT - 0.01;
    var Lc = lightAt(D(dw / 2, -0.3, 0), room);
    var faces = [];
    var front = [D(0, yt, -dt), D(dw, yt, -dt), D(dw, yb, -dt), D(0, yb, -dt)];
    var inner = [D(0, yt, 0), D(dw, yt, 0), D(dw, yb, 0), D(0, yb, 0)];
    var edge = [D(dw, yt, -dt), D(dw, yt, 0), D(dw, yb, 0), D(dw, yb, -dt)];
    var cp = camPos();
    function facing(pts, n) { return dot3(n, sub3(cp, pts[0])) > 0; }
    var nFront = scl3(nIn, -1), nEdge = ux;
    var z = toCam(D(dw / 2, -0.3, 0))[2], lw = wf(z);
    [[edge, nEdge, '#b8bdbe'], [front, nFront, '#dfe2e2'], [inner, nIn, '#e9eeee']].forEach(function (f) {
      if (!facing(f[0], f[1])) return;
      var ps = projAll(f[0]); if (!ps) return;
      polyPath(ps);
      var cc = mulL(f[2], f === undefined ? Lc : Lc);
      if (f[0] === inner) cc = mulL(f[2], lightAt(D(dw / 2, -0.3, 0.2), room));
      var g = ctx.createLinearGradient(ps[0][0], ps[0][1], ps[1][0], ps[1][1]);
      g.addColorStop(0, css(scl(cc, 1.03))); g.addColorStop(1, css(scl(cc, 0.9)));
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = LW.k * lw; ctx.strokeStyle = ink(cc, 'k', room); ctx.stroke();
      if (f[0] === front) {
        var h1 = P2(D(dw - 0.06, 0.32, -dt - 0.035)), h2 = P2(D(dw - 0.06, -0.48, -dt - 0.035));
        if (h1 && h2) { ctx.beginPath(); ctx.moveTo(h1[0], h1[1]); ctx.lineTo(h2[0], h2[1]); ctx.lineWidth = 3.2 * lw; ctx.strokeStyle = css(mulL('#7d8588', Lc)); ctx.stroke(); }
      }
      if (f[0] === inner) {
        // a gasket, door shelves and bottles
        var g2 = projAll([D(0.03, yt - 0.03, 0.002), D(dw - 0.03, yt - 0.03, 0.002), D(dw - 0.03, yb + 0.03, 0.002), D(0.03, yb + 0.03, 0.002)]);
        if (g2) { polyPath(g2); ctx.lineWidth = 2 * lw; ctx.strokeStyle = css(mulL('#9aa3a5', Lc), 0.7); ctx.stroke(); }
        var Li = lightAt(D(dw / 2, -0.2, 0.25), room);
        [0.28, -0.22, -0.72].forEach(function (sy, k) {
          var BOT = [['#d8402f', 0.05, 0.2], ['#e6c240', 0.04, 0.17], ['#f2efe6', 0.05, 0.19], ['#7f9a3a', 0.04, 0.15]];
          for (var bi = 0; bi < 4; bi++) {
            var bt = BOT[(bi + k) % 4], u = 0.14 + bi * 0.19;
            var cyl = cylPath(D(u, 0, 0.07), sy, sy + bt[2], bt[1] * 0.5, bt[1] * 0.42, 12);
            if (!cyl) continue;
            polyPath(cyl.side); fillStroke(mulL(bt[0], Li), 1, 'q', room, z);
            var tip = P2(D(u, sy + bt[2] + 0.04, 0.07)), tb2 = P2(D(u, sy + bt[2], 0.07));
            if (tip && tb2) { ctx.beginPath(); ctx.moveTo(tb2[0], tb2[1]); ctx.lineTo(tip[0], tip[1]); ctx.lineWidth = 2 * lw; ctx.strokeStyle = css(mulL('#f6f3ea', Li)); ctx.stroke(); }
          }
          var lip = projAll([D(0.02, sy + 0.06, 0.13), D(dw - 0.02, sy + 0.06, 0.13), D(dw - 0.02, sy, 0.13), D(0.02, sy, 0.13)]);
          if (lip) { polyPath(lip); fillStroke(mulL('#e2e9ea', Li), 0.85, 'q', room, z); }
        });
      }
    });
  }

  /* ---- the prep sheet's resting place: the fridge's side, facing us ---- */
  // the prep sheet's place: clipped to the front edge of the top shelf, hanging
  // over the steaks' shelf, facing out (u: across, v: down, k: metres a unit)
  var SHEET_ON = { c: [1.14, -0.065, FZ + 0.02], u: [1, 0, 0], v: [0, -1, 0], k: 0.015 };

  /* ---- the chef: at the range, back to us ---- */
  var CHEF = makeFigure({ b: [-1.08, FL, 6.0], th: 0.22, stand: true, build: 'chef', top: col('#f1f0ec'), skin: col('#c58e6c'), hair: col('#1f1b19'),
    hairStyle: 'short', legs: col('#2a2d31'), apron: col('#3b4652'), shoe: '#1c1c1c', sleeve: col('#eeede8'), rolled: true,
    lean: 0.12, twist: 0.12, ph: 0.4, collar: col('#f6f5f1'), seam: true,
    hYaw: function (t) { return 0.28 + 0.05 * Math.sin(t * 0.4); } });
  CHEF.hPitch = 0.4; CHEF.rimK = 0.6;
  var CHEF_STATE = { pan: PB, hand: null, toss: 0 };
  CHEF.arm = {
    // right hand on the pan's handle; left hand rests on the range's rail, or lifts
    R: function () { return { world: true, w: CHEF_STATE.hand || [-0.85, -0.48, 6.4] }; },
    L: function (t) { return { w: [-0.2, 1.03, 0.36 + 0.02 * Math.sin(t * 0.8)] }; }
  };
  var GCHEF = Group('chef', 'k'); GCHEF.c = [-1.08, -0.5, 6.0];
  KGROUPS.push(GCHEF);
  var GPAN = Group('pan', 'k'); GPAN.c = PB;
  KGROUPS.push(GPAN);

  /* ---- the servers: one takes the plate from the pass out to its table;
     another takes an order at the back left. They wear charcoal shirts and
     waist aprons. Seen from behind or in profile; no faces. ---- */
  var SV = { on: 0, hand: null, plateC: null, plate: 'pass', look: 0, swing: 0, dish: null, lean: 0.04 };
  var SERVER = makeFigure({ b: [-3.3, FL, 2.1], th: 1.5, stand: true, build: 'f', top: col('#30363b'), skin: col('#d5a688'), hair: col('#3b2719'),
    hairStyle: 'bun', legs: col('#1c1f22'), shoe: '#121212', sleeve: col('#30363b'), ph: 2.1, collar: col('#2a2f34'), seam: true,
    apron: col('#5d4e3e'), waistOnly: true, hYaw: function () { return SV.look; } });
  SERVER.rimK = 0.95;
  SERVER.arm = {
    R: function () { return SV.hand ? { world: true, w: SV.hand } : { w: [0.2, 0.94, 0.03 + SV.swing] }; },
    L: function () { return { w: [-0.2, 0.94, 0.03 - SV.swing] }; }
  };
  var SERVER2 = makeFigure({ b: [-2.72, FL, -0.02], th: -0.42, stand: true, build: 'm', top: col('#30363b'), skin: col('#a8775a'), hair: col('#171513'),
    hairStyle: 'short', legs: col('#1c1f22'), shoe: '#121212', sleeve: col('#30363b'), ph: 4.4, collar: col('#2a2f34'), seam: true,
    apron: col('#5d4e3e'), waistOnly: true, lean: 0.1, twist: 0.08, hYaw: function (t) { return 0.12 + 0.18 * Math.sin(t * 0.33); } });
  SERVER2.hPitch = 0.3; SERVER2.rimK = 0.9;
  SERVER2.arm = {
    // a pad in the left hand, a pen in the right, writing
    L: function () { return { w: [-0.07, 1.12, 0.22] }; },
    R: function (t) { return { w: [0.05 + 0.01 * Math.sin(t * 5.1), 1.14 + 0.005 * Math.sin(t * 7.3), 0.24] }; }
  };
  var GSV = Group('server', 'd'); GSV.c = SERVER.b.slice();
  GSV.draw = function () { drawServer(); };
  var GSV2 = Group('server2', 'd'); GSV2.c = [-2.72, -0.6, -0.02];
  GSV2.draw = function () {
    if (ST.full < 0.5) return;
    drawFigure(SERVER2, TT, 'd');
    // the pad: a little white card in the left hand
    var J = joints(SERVER2, TT), h = J.hdL;
    var q = projAll([add3(h, SERVER2.r, -0.045), add3(h, SERVER2.r, 0.045), add3(add3(h, SERVER2.r, 0.045), [0, 0.11, 0]), add3(add3(h, SERVER2.r, -0.045), [0, 0.11, 0])]);
    if (q) { polyPath(q); fillStroke(mulL('#f3f1ea', faceLight(h, scl3(SERVER2.f, -1), 'd')), 1, 'd', 'd', toCam(h)[2]); }
  };
  var TT = 0;   // the idle clock, for things drawn from group callbacks

  // the server's walks: in from the left to the pass, then out to the table by the pass
  var SVP1 = [[-3.3, 2.1], [-2.2, 2.6], [-1.2, 3.0], [-0.42, 3.0]];
  var SVP2 = [[-0.42, 3.0], [0.3, 3.0], [0.72, 2.42], [1.12, 2.3]];
  function bz2(P, u) { var v = 1 - u; return [v * v * v * P[0][0] + 3 * v * v * u * P[1][0] + 3 * v * u * u * P[2][0] + u * u * u * P[3][0], v * v * v * P[0][1] + 3 * v * v * u * P[1][1] + 3 * v * u * u * P[2][1] + u * u * u * P[3][1]]; }
  function bzLen(P) { var L = 0, a = bz2(P, 0); for (var i = 1; i <= 24; i++) { var b = bz2(P, i / 24); L += Math.hypot(b[0] - a[0], b[1] - a[1]); a = b; } return L; }
  var SVL1 = bzLen(SVP1), SVL2 = bzLen(SVP2);
  function heading(P, u) { var a = bz2(P, Math.max(0, u - 0.01)), b = bz2(P, Math.min(1, u + 0.01)); return Math.atan2(b[0] - a[0], b[1] - a[1]); }
  function angLerp(a, b, k) { var d = Math.atan2(Math.sin(b - a), Math.cos(b - a)); return a + d * k; }
  function setHeading(o, th) { o.th = th; o.r = [Math.cos(th), 0, -Math.sin(th)]; o.f = [Math.sin(th), 0, Math.cos(th)]; }
  // one walk: eased in and out; returns the floor point, the heading, the gait phase and stride
  function walkAt(P, len, u) {
    var e = 0.5 - 0.5 * Math.cos(Math.PI * u);
    return { p: bz2(P, e), th: heading(P, e), ph: 2 * Math.PI * e * len / 1.25, k: clamp(Math.sin(Math.PI * u) * 1.7, 0, 1) };
  }
  function serverState(s, t) {
    var o = SERVER, w, th, stride = 0, ph = 0, pos;
    SV.on = s > 6.62 ? 1 : 0;
    var thDest = Math.atan2(DEST[0] - SVP2[3][0], DEST[2] - SVP2[3][1]);
    if (s < 7.4) {
      w = walkAt(SVP1, SVL1, lin(s, 6.7, 7.4)); pos = w.p; stride = w.k; ph = w.ph;
      th = angLerp(w.th, 0, ramp(s, 7.24, 7.46));
    } else if (s < 7.74) {
      pos = SVP1[3]; ph = 2 * Math.PI * SVL1 / 1.25;
      th = angLerp(0, heading(SVP2, 0.02), ramp(s, 7.62, 7.8));
    } else {
      w = walkAt(SVP2, SVL2, lin(s, 7.74, 8.72)); pos = w.p; stride = w.k; ph = 2 * Math.PI * SVL1 / 1.25 + w.ph;
      th = angLerp(w.th, thDest, ramp(s, 8.5, 8.82));
    }
    setHeading(o, th);
    o.b = [pos[0], FL, pos[1]];
    o.walk = ph; o.stride = stride;
    o.bob = 0.012 * stride * Math.cos(2 * ph);
    SV.swing = 0.09 * stride * Math.sin(ph);
    // she leans in to set the plate down, then straightens
    o.lean = 0.04 + 0.5 * env(s, 8.7, 8.95, 9.05, 9.4) + 0.12 * env(s, 7.36, 7.48, 7.56, 7.72);
    SV.look = 0.0;
    // the plate: under the lamps, then lifted onto her hand, carried, set down at its place
    var carry = figW(o, [0.18, 1.1, 0.3]);
    var hang = figW(o, [0.2, 0.94, 0.03]);
    var lift = ramp(s, 7.54, 7.72), down = ramp(s, 8.78, 9.02);
    var pc = v3(PASSP, carry, lift);
    if (lift > 0) pc[1] += 0.06 * Math.sin(Math.PI * lift);
    pc = v3(pc, DEST, down);
    if (down > 0 && down < 1) pc[1] += 0.035 * Math.sin(Math.PI * down);
    SV.plateC = s < 7.54 ? null : pc;
    SV.plate = s < 7.54 ? 'pass' : s < 9.02 ? 'hand' : 'table';
    // the hand: from her side to the plate, under it while she holds it, back to her side
    var under = add3(pc, [0, -0.028, 0]);
    var reach = ramp(s, 7.4, 7.54), back = ramp(s, 9.02, 9.26);
    if (s < 7.4 || s >= 9.26) SV.hand = null;
    else if (s < 7.54) SV.hand = v3(hang, add3(PASSP, [0, -0.02, -0.12]), reach);
    else if (s < 9.02) SV.hand = under;
    else SV.hand = v3(add3(DEST, [-0.06, 0.02, 0]), hang, back);
    GSV.c = [pos[0], -0.6, pos[1]];
    GUEST_TURN.k = env(s, 8.45, 8.8, 9.3, 9.8);
  }
  function drawServer() {
    if (!SV.on) return;
    var o = SERVER, room = 'd';
    var chest = toCam(add3(o.b, [0, 1.1, 0]))[2];
    var dishFirst = SV.dish && SV.plateC && toCam(SV.plateC)[2] > chest;
    if (dishFirst) SV.dish();
    drawFigure(o, TT, room);
    if (SV.dish && !dishFirst) SV.dish();
  }
  DGROUPS.push(GSV, GSV2);

  /* ======================================================================
     WHAT TRAVELS, AND MORPHS
     ====================================================================== */
  // 1. the receipt -> the prep sheet. Drawn in centimetres about its foot,
  //    through an affine (billboard while it travels, the fridge's side when it lands)
  var SHEET_COUNTS = ['24', '18', '31', '12', '16', '9'];
  var fontsOK = false;
  function drawPaper(m, printed, ticks, clip, rgbL) {
    // m: 0 receipt .. 1 prep sheet; printed: 0..1 of the receipt out of the slot
    var w = lerp(15, 21, m), h = lerp(32, 27, m), zig = 1.3 * (1 - m);
    var vis = lerp(h * printed, h, m);
    var top = -vis;
    ctx.save();
    ctx.beginPath(); ctx.rect(-w / 2 - 2, -vis - 2, w + 4, vis + 2.2); ctx.clip();
    var paper = mulL(mixc('#fbfbf7', '#f6eedc', m), rgbL);
    // the outline, with the tear along the top fading to a straight edge
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2, top + zig);
    var nz = 10;
    for (var i = 0; i < nz; i++) ctx.lineTo(w / 2 - (i + 0.5) * w / nz, top + (i % 2 ? zig : 0));
    ctx.lineTo(-w / 2, top + zig); ctx.closePath();
    var g = ctx.createLinearGradient(0, top, 0, 0);
    g.addColorStop(0, css(scl(paper, 1.0))); g.addColorStop(1, css(scl(paper, 0.94)));
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 0.18; ctx.strokeStyle = css(SLATE, 0.45); ctx.stroke();
    // contents, laid out from the top
    var inkC = css(mixc('#4a4f52', '#232a2f', m), 1);
    function Y(yr) { return top + yr; }
    ctx.lineCap = 'round';
    // header: the receipt's logo bar becomes the sheet's title, "Example"
    ctx.strokeStyle = inkC;
    ctx.lineWidth = lerp(1.3, 0.35, m); ctx.globalAlpha = 1 - m;
    ctx.beginPath(); ctx.moveTo(-3, Y(3.2)); ctx.lineTo(3, Y(3.2)); ctx.stroke();
    ctx.globalAlpha = 1;
    if (m > 0.02 && fontsOK) {
      ctx.globalAlpha = sm((m - 0.3) / 0.5);
      ctx.fillStyle = css(SLATE, 0.85);
      ctx.font = '600 2.3px "Schibsted Grotesk", system-ui, sans-serif';
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.fillText('Example', -w / 2 + 2, Y(4.3));
      ctx.globalAlpha = 1;
    }
    // the address line becomes the title rule
    ctx.lineWidth = lerp(0.35, 0.3, m); ctx.strokeStyle = css(SLATE, lerp(0.5, 0.6, m));
    ctx.beginPath(); ctx.moveTo(lerp(-4.5, -w / 2 + 2, m), Y(lerp(5.4, 6.0, m))); ctx.lineTo(lerp(4.5, w / 2 - 2, m), Y(lerp(5.4, 6.0, m))); ctx.stroke();
    // the dashed rule closes into a solid one
    ctx.setLineDash([1.2, 1.2 * (1 - m) + 0.001]);
    ctx.lineWidth = 0.22; ctx.strokeStyle = css(SLATE, 0.4);
    ctx.beginPath(); ctx.moveTo(-w / 2 + 1.5, Y(lerp(7.6, 7.2, m))); ctx.lineTo(w / 2 - 1.5, Y(lerp(7.6, 7.2, m))); ctx.stroke();
    ctx.setLineDash([]);
    // the line items become rows: a box, a line, a count
    var LEN = [7, 5.5, 6.5, 4.5, 6, 5];
    for (var r = 0; r < 6; r++) {
      var y = Y(lerp(10 + r * 2.6, 10.2 + r * 2.75, m));
      var x0 = lerp(-5.5, -w / 2 + 5, m);
      // the box grows out of the line's start
      var bs = 1.7 * sm((m - 0.15) / 0.5);
      if (bs > 0.05) {
        ctx.lineWidth = 0.22; ctx.strokeStyle = css(SLATE, 0.7);
        ctx.strokeRect(-w / 2 + 2, y - bs + 0.3, bs, bs);
        var tk = ticks[r];
        if (tk > 0) {
          ctx.lineWidth = 0.4; ctx.strokeStyle = css([56, 92, 60], 0.9);
          ctx.beginPath(); var bx = -w / 2 + 2, by = y - bs + 0.3;
          var p1 = [bx + 0.3, by + 0.9], p2 = [bx + 0.75, by + 1.45], p3 = [bx + 1.9, by - 0.3];
          ctx.moveTo(p1[0], p1[1]);
          if (tk < 0.4) ctx.lineTo(lerp(p1[0], p2[0], tk / 0.4), lerp(p1[1], p2[1], tk / 0.4));
          else { ctx.lineTo(p2[0], p2[1]); ctx.lineTo(lerp(p2[0], p3[0], (tk - 0.4) / 0.6), lerp(p2[1], p3[1], (tk - 0.4) / 0.6)); }
          ctx.stroke();
        }
      }
      ctx.lineWidth = lerp(0.42, 0.3, m); ctx.strokeStyle = css(SLATE, lerp(0.55, 0.45, m));
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + lerp(LEN[r], 8.5 - (r % 3) * 1.2, m), y); ctx.stroke();
      // the price shrinks away; the count writes itself in its place
      ctx.lineWidth = 0.42; ctx.strokeStyle = css(SLATE, 0.55 * (1 - m));
      ctx.beginPath(); ctx.moveTo(lerp(3, w / 2 - 4, m), y); ctx.lineTo(lerp(5.5, w / 2 - 4 + 0.1, m), y); ctx.stroke();
      if (m > 0.3 && fontsOK) {
        ctx.globalAlpha = sm((m - 0.4) / 0.45);
        ctx.fillStyle = css(SLATE, 0.92);
        ctx.font = 'italic 600 2.5px "Source Serif 4", Georgia, serif';
        ctx.textAlign = 'right';
        ctx.fillText(SHEET_COUNTS[r], w / 2 - 2, y + 0.4);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      }
      // row rules on the sheet
      if (m > 0.05) {
        ctx.lineWidth = 0.15; ctx.strokeStyle = css(SLATE, 0.22 * m);
        ctx.beginPath(); ctx.moveTo(-w / 2 + 1.5, y + 1.3); ctx.lineTo(w / 2 - 1.5, y + 1.3); ctx.stroke();
      }
    }
    // the total becomes nothing; the sheet keeps a clean foot
    ctx.lineWidth = 0.6; ctx.strokeStyle = css(SLATE, 0.7 * (1 - m));
    ctx.beginPath(); ctx.moveTo(-5.5, Y(28.4)); ctx.lineTo(-0.5, Y(28.4)); ctx.moveTo(2.2, Y(28.4)); ctx.lineTo(5.5, Y(28.4)); ctx.stroke();
    ctx.restore();
    // the magnet that holds it to the fridge
    if (clip > 0.01) {
      ctx.fillStyle = css(mulL('#2f3b45', rgbL), clip);
      ctx.beginPath(); ctx.ellipse(0, top - 0.2, 1.8 * clip, 1.1 * clip, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = css([255, 255, 255], 0.25 * clip);
      ctx.beginPath(); ctx.ellipse(-0.4, top - 0.6, 0.7 * clip, 0.35 * clip, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 2. the vessel: a pan that becomes a plate
  function drawVessel(V, room, contents) {
    // V: c (rim centre), R, wall, inner, col (outside), colIn, handle (0..1), steel (0..1)
    var c = V.c, z = toCam(c)[2];
    if (z < 0.2) return;
    var lw = wf(z), pxm = F / z, Lc = lightAt(add3(c, [0, 0.1, 0]), room);
    var rim = projAll(ringPts([c[0], c[1] + V.wall, c[2]], V.R, 32));
    var foot = projAll(ringPts([c[0], c[1], c[2]], V.R * V.footK, 32));
    if (!rim || !foot) return;
    var outC = mulL(V.out, Lc), inC = mulL(V.inn, Lc);
    // the handle, behind or in front: drawn first, it reads as attached under the rim
    if (V.handle > 0.01) {
      var hd = V.hdir, h0 = add3(c, hd, V.R * 0.92), h1 = add3(h0, hd, 0.22 * V.handle);
      h0[1] += V.wall * 0.7; h1[1] += V.wall * 0.7 + 0.03 * V.handle;
      var a = P2(h0), b = P2(h1);
      if (a && b) {
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        ctx.lineWidth = 0.022 * pxm; ctx.lineCap = 'round'; ctx.strokeStyle = css(mulL('#2b3034', Lc), V.handle > 0.2 ? 1 : V.handle / 0.2); ctx.stroke();
        ctx.lineWidth = 0.008 * pxm; ctx.strokeStyle = css(mulL('#6d767b', Lc), 0.7 * V.handle); ctx.stroke();
      }
    }
    polyPath(hull(rim.concat(foot)));
    fillStroke(outC, 1, 'k', room, z);
    polyPath(rim);
    var g = ctx.createLinearGradient(rim[16][0], rim[16][1], rim[0][0], rim[0][1]);
    g.addColorStop(0, css(scl(inC, 0.92))); g.addColorStop(1, css(scl(inC, 1.06)));
    ctx.fillStyle = g; ctx.fill();
    // the well of a plate, or the floor of a pan
    var well = projAll(ringPts([c[0], c[1] + V.wall * 0.25, c[2]], V.R * V.wellK, 32));
    if (well) {
      polyPath(well);
      ctx.fillStyle = css(scl(V.steel > 0.5 ? mulL(V.floor, Lc) : inC, lerp(1.0, 0.97, 1 - V.steel)));
      ctx.fill();
      ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(inC, 'd', room, 1.2); ctx.stroke();
    }
    if (contents) contents(Lc, z, pxm);
    polyPath(rim);
    ctx.lineWidth = LW.q * lw; ctx.strokeStyle = ink(inC, 'q', room); ctx.stroke();
    // the shine along the near rim
    var sh = [];
    for (var i = 4; i <= 12; i++) sh.push(rim[i]);
    smoothPath(sh, false); ctx.lineWidth = 1.4 * lw; ctx.strokeStyle = css([255, 255, 255], 0.35 + 0.25 * (1 - V.steel)); ctx.stroke();
  }

  // 3. the steak: raw on the tray -> in the air -> seared in the pan -> sliced on the plate
  function steakColours(q) {
    // q: 0 raw .. 1 seared
    return { top: mixc('#a8343a', '#6a381f', q), side: mixc('#7c2329', '#3e2112', q) };
  }
  function drawHeroSteak(W, sear, slice, room, Lc) {
    var S = HERO, cc = steakColours(sear);
    var th = lerp(S.th, S.th * 0.82, sear);
    var n = Math.round(slice > 0.01 ? 3 : 1);
    if (n === 1) {
      var S1 = { o: S.o, th: th, top: col(cc.top), side: col(cc.side) };
      drawSlab(S1, W, room, Lc, sear < 0.5 ? rawDetailFade(S, 1 - sear * 2) : searDetail(S, sear));
      return;
    }
    // sliced: three pieces part along the steak's length and fan a little
    var cuts = [-1e9, -0.026, 0.026, 1e9];
    for (var k = 0; k < 3; k++) {
      var part = clipX(S.o, cuts[k], cuts[k + 1]);
      if (part.length < 3) continue;
      var off = (k - 1) * 0.016 * slice, rot = (k - 1) * 0.16 * slice;
      var Wk = (function (off, rot) {
        return function (x, h, z) { var c = Math.cos(rot), s = Math.sin(rot); return W(x * c - z * s + off, h, x * s + z * c + Math.abs(off) * 0.4); };
      })(off, rot);
      var Sk = { o: part, th: th, top: col(cc.top), side: col(cc.side) };
      drawSlab(Sk, Wk, room, Lc, searDetail(S, sear));
      // the cut faces show the pink inside
      if (slice > 0.05) {
        [cuts[k], cuts[k + 1]].forEach(function (cx) {
          if (Math.abs(cx) > 1) return;
          var zs = part.filter(function (q) { return Math.abs(q[0] - cx) < 0.002; }).map(function (q) { return q[1]; });
          if (zs.length < 2) return;
          var z0 = Math.min.apply(null, zs), z1 = Math.max.apply(null, zs);
          var f = projAll([Wk(cx, th * 0.95, z0), Wk(cx, th * 0.95, z1), Wk(cx, 0.003, z1), Wk(cx, 0.003, z0)]);
          if (!f) return;
          var nrm = sub3(Wk(cx + (cx < 0 ? 0.01 : -0.01), 0, 0), Wk(cx, 0, 0));
          if (dot3(nrm, sub3(camPos(), Wk(cx, 0, 0))) > 0) return;
          polyPath(f);
          var gz = ctx.createLinearGradient(f[0][0], f[0][1], f[3][0], f[3][1]);
          gz.addColorStop(0, css(mulL('#4a2615', Lc), slice)); gz.addColorStop(0.18, css(mulL('#a8545a', Lc), slice)); gz.addColorStop(0.32, css(mulL('#c25a64', Lc), slice));
          gz.addColorStop(0.68, css(mulL('#c25a64', Lc), slice)); gz.addColorStop(0.82, css(mulL('#a8545a', Lc), slice)); gz.addColorStop(1, css(mulL('#4a2615', Lc), slice));
          ctx.fillStyle = gz; ctx.fill();
        });
      }
    }
  }
  function clipX(o, a, b) {
    // clip a closed polygon to a <= x <= b
    function cl(pts, k, sgn) {
      var out = [];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], q = pts[(i + 1) % pts.length], ip = sgn * (p[0] - k) >= 0, iq = sgn * (q[0] - k) >= 0;
        if (ip) out.push(p);
        if (ip !== iq) { var u = (k - p[0]) / (q[0] - p[0]); out.push([k, p[1] + (q[1] - p[1]) * u]); }
      }
      return out;
    }
    var r = o;
    if (a > -1) r = cl(r, a, 1);
    if (b < 1) r = cl(r, b, -1);
    return r;
  }
  function rawDetailFade(S, k) { var f = rawDetail(S); return function (W, z, L) { ctx.globalAlpha = k; f(W, z, L); ctx.globalAlpha = 1; }; }
  var CRUST = (function () {
    var out = [], r2 = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(77);
    for (var i = 0; i < 22; i++) out.push([(r2() - 0.5) * 0.15, (r2() - 0.5) * 0.1, 0.006 + r2() * 0.012, r2()]);
    return out;
  })();
  function searDetail(S, q) {
    return function (W, z, L) {
      var pxm = F / z, h = S.th * 0.82;
      // a crust: mottled browns, darker at the edge, glossy highlights
      CRUST.forEach(function (c) {
        var p = P2(W(c[0], h, c[1]));
        if (!p) return;
        ctx.beginPath(); ctx.ellipse(p[0], p[1], c[2] * pxm, c[2] * 0.55 * pxm, c[3] * 3, 0, Math.PI * 2);
        ctx.fillStyle = css(mulL(c[3] > 0.5 ? '#8a5230' : '#4a2615', L), 0.55 * q); ctx.fill();
      });
      var cr = mulL('#2f190e', L);
      ctx.globalAlpha = 0.55 * q;
      var ps = S.o.map(function (p) { return P2(W(p[0], h, p[1])); });
      if (!ps.some(function (p) { return !p; })) { smoothPath(ps); ctx.lineWidth = 0.016 * pxm; ctx.strokeStyle = css(cr); ctx.stroke(); }
      ctx.globalAlpha = 1;
      [[-0.03, 0.01, 0.022], [0.02, -0.015, 0.016], [0.035, 0.02, 0.01]].forEach(function (h) {
        var p = P2(W(h[0], S.th * 0.82, h[1]));
        if (p) { ctx.beginPath(); ctx.ellipse(p[0], p[1], h[2] * pxm, h[2] * 0.3 * pxm, -0.3, 0, Math.PI * 2); ctx.fillStyle = css([255, 228, 190], 0.32 * q); ctx.fill(); }
      });
    };
  }

  /* ======================================================================
     THE DAY, by progress. s runs 0..10 over the pinned scroll.
     ====================================================================== */
  // the camera's path: knots (s, pose), a smooth spline through them
  var CAMK = [
    [0.0, { x: 0.1, y: 0.2, z: -3.75, yaw: 0.14, pitch: -0.07 }],
    [0.95, { x: 0.6, y: 0.0, z: -2.5, yaw: 0.38, pitch: -0.17 }],
    [1.6, { x: 0.66, y: 0.0, z: -2.4, yaw: 0.38, pitch: -0.16 }],
    [2.1, { x: 0.45, y: 0.14, z: -2.0, yaw: 0.16, pitch: -0.09 }],
    [2.75, { x: 0.25, y: 0.22, z: 0.0, yaw: 0.07, pitch: -0.07 }],
    [3.3, { x: 0.2, y: 0.24, z: 2.7, yaw: 0.12, pitch: -0.1 }],
    [3.8, { x: -0.22, y: 0.28, z: 3.86, yaw: 0.58, pitch: -0.15 }],
    [4.6, { x: -0.3, y: 0.3, z: 3.86, yaw: 0.62, pitch: -0.17 }],
    [5.45, { x: -0.06, y: 0.32, z: 4.55, yaw: -0.24, pitch: -0.25 }],
    [6.15, { x: -0.08, y: 0.3, z: 4.66, yaw: -0.22, pitch: -0.27 }],
    [6.75, { x: 0.0, y: 0.28, z: 2.6, yaw: -0.06, pitch: -0.15 }],
    [7.5, { x: 0.05, y: 0.26, z: -0.2, yaw: 0.0, pitch: -0.12 }],
    [8.6, { x: -0.3, y: 0.3, z: -1.9, yaw: 0.08, pitch: -0.1 }],
    [10, { x: -0.6, y: 0.32, z: -3.3, yaw: 0.1, pitch: -0.1 }]
  ];
  /* The day's beats (the receipt, the fridge, the sear, the plate) keep 42's
     clock. 43 stretches it: the camera stays on the till while the night's
     sales become tomorrow's forecast, then the server's walk takes the end.
     WARP maps 43's progress onto 42's clock (monotone, so nothing runs back). */
  var WK = [[0, -1.5], [1.2, -0.28], [1.7, 0.47], [1.85, 0.58], [3.45, 2.85], [4.0, 3.3], [4.9, 4.2], [6.4, 6.2], [6.85, 6.75], [7.6, 7.3], [8.9, 8.75], [10, 10]];
  // a smooth curve through knots that never turns back (Fritsch and Carlson):
  // flat between two equal knots, and easing into and out of them
  function mono(K) {
    var n = K.length, d = [], m = [], i;
    for (i = 0; i < n - 1; i++) d.push((K[i + 1][1] - K[i][1]) / (K[i + 1][0] - K[i][0]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      var a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { var q = 3 / Math.sqrt(h); m[i] = q * a * d[i]; m[i + 1] = q * b * d[i]; }
    }
    return function (x) {
      var i2 = 0;
      x = clamp(x, K[0][0], K[n - 1][0]);
      while (i2 < n - 2 && x > K[i2 + 1][0]) i2++;
      var hh = K[i2 + 1][0] - K[i2][0], u = (x - K[i2][0]) / hh;
      var h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
      return h00 * K[i2][1] + h10 * hh * m[i2] + h01 * K[i2 + 1][1] + h11 * hh * m[i2 + 1];
    };
  }
  var WARP = mono(WK);
  /* The scroll to the day. The day holds still at each note (a stretch of
     scroll where nothing moves, so it is hard to scroll past by accident),
     slows as it comes into a note and leaves it gently, and moves quickly in
     between. Progress p (0..1 of the scroll) to s (0..10). */
  var STOPS = [{ at: 0.195, from: 0.12, to: 0.27 }, { at: 0.495, from: 0.42, to: 0.57 }];
  var PK = [[0, 0], [0.12, 1.3], [0.27, 1.3], [0.42, 3.95], [0.57, 3.95], [0.8, 9.35], [1, 10]];
  var DAY = mono(PK);

  function spline(K, s, keys) {
    var n = K.length, i = 0;
    s = clamp(s, K[0][0], K[n - 1][0]);
    while (i < n - 2 && s > K[i + 1][0]) i++;
    var t0 = K[i][0], t1 = K[i + 1][0], h = t1 - t0, u = (s - t0) / h;
    var h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
    var out = keys ? {} : [];
    (keys || [0, 1, 2]).forEach(function (k) {
      function m(j) {
        if (j <= 0 || j >= n - 1) return 0;
        return (K[j + 1][1][k] - K[j - 1][1][k]) / (K[j + 1][0] - K[j - 1][0]);
      }
      out[k] = h00 * K[i][1][k] + h10 * h * m(i) + h01 * K[i + 1][1][k] + h11 * h * m(i + 1);
    });
    return out;
  }
  var CK = ['x', 'y', 'z', 'yaw', 'pitch'];
  function camAt(s, t) {
    var n = CAMK.length, i = 0;
    s = clamp(s, 0, 10);
    while (i < n - 2 && s > CAMK[i + 1][0]) i++;
    var t0 = CAMK[i][0], t1 = CAMK[i + 1][0], h = t1 - t0, u = (s - t0) / h;
    var h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
    var out = {};
    CK.forEach(function (k) {
      function m(j) {
        if (j <= 0 || j >= n - 1) return 0;
        return (CAMK[j + 1][1][k] - CAMK[j - 1][1][k]) / (CAMK[j + 1][0] - CAMK[j - 1][0]);
      }
      out[k] = h00 * CAMK[i][1][k] + h10 * h * m(i) + h01 * CAMK[i + 1][1][k] + h11 * h * m(i + 1);
    });
    // a slight breath, on time
    out.x += 0.006 * Math.sin(t * 0.55);
    out.y += 0.004 * Math.sin(t * 0.8 + 1.2);
    out.yaw += 0.0025 * Math.sin(t * 0.43 + 0.5);
    return out;
  }

  // the receipt's flight: off the printer, up, back through the pass, to the fridge's side
  var SHEETK = [[0.5, add3(SLOT, [0, 0.03, 0])], [0.9, [1.0, 0.12, -0.4]], [1.4, [0.75, 0.14, 1.0]], [1.85, [0.55, 0.14, 2.6]], [2.25, [0.45, 0.14, 3.9]], [2.6, [0.95, 0.1, FZ - 0.4]], [2.85, [1.12, 0.06, FZ - 0.06]]];
  // the steak: from the tray, up and across the kitchen, into the pan
  var MP = [[HERO.c[0], HERO.c[1], HERO.c[2]], [HERO.c[0] - 0.25, 0.02, HERO.c[2] - 0.3], [-0.15, -0.12, 6.3], [PB[0], PB[1] + 0.035, PB[2]]];
  // the plate: from the range to the pass, then out to its table
  var DT = TABLES.filter(function (t) { return t.dest; })[0];
  var DSEAT = DT.G.seats.filter(function (s) { return s.who; })[0];
  var DEST = [DT.x + Math.sin(DSEAT.a) * 0.24, TY + 0.005, DT.z + Math.cos(DSEAT.a) * 0.24];
  var PASSP = [-0.4, OB + 0.004, 3.5];
  var VP1 = [[PB[0], PB[1], PB[2]], [PB[0] + 0.05, 0.05, 6.0], [-0.42, 0.1, 4.4], PASSP];

  /* ---------- the moment ---------- */
  var ST = {};
  function dayState(s, t) {
    var N = 1 - ramp(s, 0.9, 2.7), S = ramp(s, 4.3, 6.0), D = 1 - N - S;
    ST.N = N; ST.D = D; ST.S = S;
    // ambient: basalt night, crisp morning, dim warm service
    var aN = [0.095, 0.105, 0.135], aD = [0.88, 0.88, 0.87], aS = [0.2, 0.17, 0.155];
    var kN = [0.075, 0.085, 0.115], kD = [0.86, 0.87, 0.89], kS = [0.6, 0.57, 0.53];
    for (var i = 0; i < 3; i++) { AMB.d[i] = N * aN[i] + D * aD[i] + S * aS[i]; AMB.k[i] = N * kN[i] + D * kD[i] + S * kS[i]; }
    // the sky through the skylight and the window
    var sN = col('#141c26'), sD = col('#f8f6ee'), sS = col('#2c3a4f');
    for (i = 0; i < 3; i++) SKYC[i] = N * sN[i] + D * sD[i] + S * sS[i];
    // the lamps
    var flick = function (k) { return 1 + 0.04 * Math.sin(t * 7.3 + k) + 0.03 * Math.sin(t * 11.1 + k * 2); };
    TABLES.forEach(function (tb, k) {
      LI[tb.L] = (tb.night ? Math.max(N * 1.15, S * 1.0) : S * 1.0);
      LI[tb.C] = S * 0.5 * flick(k);
    });
    var tillOn = N + 0.35 * S;
    LI[L_TILL] = 1.0 * tillOn * (1 + 0.25 * env(s, -1, 0, 0.6, 1.0));
    var heat = Math.max(0.1 * D, S * 0.6) + 0.45 * env(s, 6.5, 6.75, 7.25, 7.6);
    L_HEAT.forEach(function (li) { LI[li] = heat; });
    LI[L_STRIP] = 0.35 * D + 0.85 * S;
    LI[L_SKY] = 0.3 * D;
    ST.heat = heat;
    // the fridge
    ST.door = eio(lin(s, 1.95, 2.6)) * (1 - eio(lin(s, 4.25, 4.95)));
    LI[L_FRIDGE] = 1.5 * sm(ST.door * 1.5);
    // the sear
    ST.flare = clamp(env(s, 4.95, 5.08, 5.2, 5.55) + 0.6 * env(s, 5.35, 5.45, 5.55, 5.85), 0, 1);
    LI[L_FLARE] = 0.75 * ST.flare * flick(3) + 0.12 * env(s, 4.9, 5.1, 6.0, 6.3);
    // chairs come down, guests arrive: while the dining room is behind the camera
    ST.full = ramp(s, 3.7, 4.4);
    return ST;
  }

  /* ---------- draw one frame ---------- */
  var stillMode = false;
  function frame(sn, t) {
    var s = WARP(sn);
    TT = t;
    dayState(s, t);
    serverState(sn, t);
    lens(sn);
    setCam(stillMode ? STILL : camAt(sn, t));
    base();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#1b1d20';
    ctx.fillRect(0, 0, VW, VH);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    /* the kitchen: from the dining room it is seen only through the opening */
    drawList(KSH);
    drawStockPot(t);
    // kitchen objects, far to near
    var kg = KGROUPS.map(function (g) { g.z = toCam(g.c)[2]; return g; }).sort(function (a, b) { return b.z - a.z; });
    // what travels in the kitchen joins them
    var trav = travelling(s, t);
    var kList = kg.slice();
    trav.forEach(function (o) { if (o.room === 'k') kList.push(o); });
    kList.sort(function (a, b) { return b.z - a.z; });
    kList.forEach(function (g) {
      if (g === GF) drawFridge(s, t);
      else if (g === GCHEF) drawChef(s, t);
      else if (g === GPAN) drawPan(s, t);
      else if (g.draw) g.draw();
    });
    // the pass, kitchen side, and its tickets
    drawList(KPASS);
    TICKETS.forEach(function (tk) { ticket(tk[0], tk[1]); });
    trav.forEach(function (o) { if (o.room === 'p') o.draw(); });
    kitchenLight(s, t);

    /* the dining room */
    drawList(DSH);
    diningFloorLight(s, t);
    var dg = DGROUPS.map(function (g) { g.z = toCam(g.c)[2]; return g; });
    var dList = dg.slice();
    dList.sort(function (a, b) { return b.z - a.z; });
    dList.forEach(function (g) {
      if (g === GT) drawTill(s, t, sn);
      else if (g.seats) drawTable(g, s, t);
      else if (g.draw) g.draw();
    });
    diningLight(s, t);
    trav.forEach(function (o) { if (o.room === 'd') o.draw(); });
    trav.forEach(function (o) { if (o.room === 'o' && o.draw) o.draw(); });
    grade(s, t);
    notes(sn);
  }

  function ticket(x, rot) {
    var p = P2([x, OT - 0.05, 3.41]);
    if (!p) return;
    var c = toCam([x, OT - 0.05, 3.41]), k = F / c[2] / 100;
    ctx.setTransform(DPR * k * Math.cos(rot), DPR * k * Math.sin(rot), -DPR * k * Math.sin(rot), DPR * k * Math.cos(rot), DPR * p[0], DPR * p[1]);
    var L = lightAt([x, 0.6, 3.5], 'k');
    ctx.fillStyle = css(mulL('#f8f7f2', L)); ctx.fillRect(-3.7, 0, 7.4, 12);
    ctx.lineWidth = 0.15; ctx.strokeStyle = css(SLATE, 0.4); ctx.strokeRect(-3.7, 0, 7.4, 12);
    ctx.beginPath(); ctx.moveTo(-2.6, 2.6); ctx.lineTo(2.6, 2.6); ctx.moveTo(-2.6, 4.6); ctx.lineTo(1, 4.6); ctx.moveTo(-2.6, 6.6); ctx.lineTo(1.8, 6.6);
    ctx.strokeStyle = css(SLATE, 0.35); ctx.stroke();
    base();
  }

  function drawStockPot(t) {
    var c = [POT[0], RY + 0.002, POT[1]];
    var cy = cylPath(c, RY + 0.002, RY + 0.3, POT[2], POT[2], 24);
    if (!cy) return;
    var L = lightAt([POT[0], RY + 0.15, POT[1]], 'k'), z = toCam(c)[2];
    polyPath(cy.side);
    var g = ctx.createLinearGradient(cy.side[0][0], 0, cy.side[Math.floor(cy.side.length / 2)][0], 0);
    var pc = mulL('#c9cdce', L);
    g.addColorStop(0, css(scl(pc, 0.85))); g.addColorStop(0.3, css(scl(pc, 1.08))); g.addColorStop(1, css(scl(pc, 0.75)));
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = LW.q * wf(z); ctx.strokeStyle = ink(pc, 'q', 'k'); ctx.stroke();
    polyPath(cy.top); fillStroke(mulL('#8e7a5c', L), 1, 'q', 'k', z);
    steam([POT[0], RY + 0.32, POT[1]], t, 0.35 * (0.3 + 0.7 * (ST.D + ST.S)), 2, 0.3, 0);
  }

  // steam: soft rising wisps, on time
  function steam(p, t, a, k, h, seed) {
    if (a < 0.01) return;
    var c = toCam(p); if (c[2] < 0.2) return;
    var o = scr(c), px = F / c[2];
    ctx.lineCap = 'round';
    for (var i = 0; i < k; i++) {
      var ph = ((t * 0.42 + i / k + seed * 0.37) % 1);
      var x0 = o[0] + (i - (k - 1) / 2) * 0.035 * px;
      ctx.beginPath();
      for (var j = 0; j <= 14; j++) {
        var u = j / 14, yy = o[1] - (ph * 0.5 + u * 0.5) * h * px;
        var xx = x0 + Math.sin(u * 5 + t * 1.3 + i * 2 + seed) * 0.02 * px * (0.4 + u);
        if (j) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
      }
      var g = ctx.createLinearGradient(0, o[1], 0, o[1] - h * px);
      var al = a * Math.sin(Math.PI * ph);
      g.addColorStop(0, css([250, 248, 244], 0)); g.addColorStop(0.3, css([250, 248, 244], al)); g.addColorStop(1, css([250, 248, 244], 0));
      ctx.strokeStyle = g; ctx.lineWidth = 0.012 * px; ctx.stroke();
    }
  }

  function drawFridge(s, t) {
    var room = 'k';
    drawList(GF.items);
    DOOR.open = ST.door * 1.78;
    if (ST.door > 0.001) {
      // the inside, the shelves, and the food on them
      FIN.forEach(function (it) { if (!it.lf) prepLight(it); });
      drawList(FIN);
      // top shelf: sauces
      drawList(SHELF[0]);
      DELI.slice().sort(function (a, b) { return b.z - a.z; }).forEach(function (d) { drawDeli(d, room, SHV[0] + 0.002); });
      // middle shelf: the steaks
      drawList(SHELF[1]);
      drawTray(TRAY1, room);
      STEAKS.forEach(function (S) {
        if (S === HERO && s > 3.35) return;
        var W = poseFn(S.c, S.yaw, 0, 0);
        drawSlab(S, W, room, null, S.detail);
      });
      // bottom shelf: greens and salmon
      drawList(SHELF[2]);
      drawGreens(room);
      drawTray(TRAY2, room);
      SALMON.forEach(function (S) { drawSlab(S, poseFn(S.c, S.yaw, 0, 0), room, null, S.detail); });
    }
    // the prep sheet on the fridge's side
    if (ST.sheetOn) ST.sheetOn();
    drawDoor(room);
    // the frame's front edge over the door gap
    var fr = projAll([[FX0, FT, FZ - 0.001], [FX1, FT, FZ - 0.001], [FX1, FT - 0.05, FZ - 0.001], [FX0, FT - 0.05, FZ - 0.001]]);
    if (fr) { polyPath(fr); fillStroke(mulL('#cfd3d3', lightAt([1, 0.7, 4.3], 'k')), 1, 'q', room, toCam([1, 0.7, 4.3])[2]); }
  }

  function drawChef(s, t) {
    var a = ramp(s, 1.45, 2.25);
    if (a > 0.01) drawFigure(CHEF, t, 'k', a);
  }

  /* the pan on the range: the steak sears in it, and it becomes a plate */
  var VES = { c: PB.slice(), R: 0.13, wall: 0.045, footK: 0.86, wellK: 0.8, out: col('#3d4448'), inn: col('#565e63'), floor: col('#2e3438'), handle: 1, steel: 1, hdir: nrm3([-1, 0, -0.55]) };
  function vesselAt(q) {
    // q: 0 pan .. 1 plate
    VES.R = lerp(0.13, 0.15, q);
    VES.wall = lerp(0.045, 0.016, q);
    VES.footK = lerp(0.86, 0.6, q);
    VES.wellK = lerp(0.84, 0.62, q);
    VES.out = mixc('#3d4448', '#ece9e1', q);
    VES.inn = mixc('#565e63', '#fbfaf6', q);
    VES.floor = mixc('#2e3438', '#f6f4ee', q);
    VES.handle = 1 - sm(q / 0.7);
    VES.steel = 1 - q;
  }
  function panState(s, t) {
    var q = smr(lin(s, 5.55, 6.2));         // pan -> plate
    vesselAt(q);
    // where the vessel is: on the burner, then lifted to the pass, then out to its table
    var c;
    if (s < 6.05) c = PB.slice();
    else if (s < 6.75) c = bez(VP1, smr(lin(s, 6.05, 6.75)));
    else c = SV.plateC ? SV.plateC.slice() : PASSP.slice();   // then the server has it
    // two tosses of the pan as it sears
    var toss = 0, ck = s - 5.0;
    if (ck > 0 && ck < 0.55) toss = Math.sin(ck / 0.55 * Math.PI) * (s < 5.6 ? 1 : 0);
    toss += 0.012 * Math.sin(t * 2.1) * (s > 4.8 && s < 5.6 ? 1 : 0);
    c = add3(c, [0, 0.05 * toss, -0.015 * toss]);
    VES.c = c;
    VES.toss = toss;
    return { q: q, c: c };
  }
  function drawPan(s, t) {
    var ps = panState(s, t);
    // in the kitchen only while it is still near the range
    if (s >= 6.2) return;
    drawVesselWithFood(s, t, 'k');
  }
  function drawVesselWithFood(s, t, room) {
    var sear = smr(lin(s, 4.9, 5.7)), slice = smr(lin(s, 5.75, 6.25));
    var has = s > 4.86;
    // the burner's flame ring under the pan, while it's on the range
    if (s < 6.1) burner(t, room, 1 - lin(s, 5.8, 6.1));
    drawVessel(VES, room, function (Lc, z, pxm) {
      if (!has) return;
      // juices under the meat on the plate, a green leaf or two
      var q = 1 - VES.steel;
      if (q > 0.05) {
        var jc = VES.c;
        var jus = projAll(ringPts([jc[0] + 0.02, jc[1] + VES.wall * 0.3, jc[2] + 0.015], 0.075 * sm(q), 24, 0.05 * sm(q)));
        if (jus) { smoothPath(jus); ctx.fillStyle = css(mulL('#5a2a16', Lc), 0.85 * q); ctx.fill(); }
      }
      var W = poseFn(add3(VES.c, [0.0, VES.wall * 0.3, 0.0]), 0.5, 0, 0);
      drawHeroSteak(W, sear, slice, room, Lc);
      if (q > 0.05) {
        // greens grow on the plate, in turn
        var GR = [[-0.07, 0.04, '#5f8a3e'], [-0.085, 0.0, '#76a04a'], [-0.06, -0.035, '#4f7a35'], [-0.1, 0.03, '#8bb35a'], [-0.08, -0.06, '#6a9440']];
        GR.forEach(function (g, k) {
          var e = sm((q - k * 0.08) / 0.5);
          if (e <= 0) return;
          var p = P2(W(g[0], 0.02, g[1]));
          if (!p) return;
          var r = 0.022 * pxm * e;
          ctx.beginPath(); ctx.ellipse(p[0], p[1], r, r * 0.55, k * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = css(mulL(g[2], Lc)); ctx.fill();
          ctx.lineWidth = 0.6 * wf(z); ctx.strokeStyle = css(scl(mulL(g[2], Lc), 0.6), 0.8); ctx.stroke();
        });
        // a spoon of sauce
        var sp = [[0.06, -0.05], [0.09, -0.01], [0.085, 0.035]].map(function (q2) { return P2(W(q2[0], 0.004, q2[1])); });
        if (!sp.some(function (p) { return !p; })) {
          smoothPath(sp, false); ctx.lineWidth = 0.012 * pxm * sm(q); ctx.strokeStyle = css(mulL('#7a2f1e', Lc), 0.9); ctx.stroke();
        }
      }
    });
    // the sizzle: steam and flare
    var sz = env(s, 4.88, 5.05, 5.9, 6.5);
    steam(add3(VES.c, [0, 0.06, 0]), t, 0.5 * sz, 3, 0.4, 1);
  }
  function burner(t, room, a) {
    if (a < 0.01) return;
    var c = [PB[0], RY + 0.006, PB[2]], z = toCam(c)[2], pxm = F / z;
    for (var i = 0; i < 14; i++) {
      var an = i / 14 * Math.PI * 2, p = P2([c[0] + Math.cos(an) * 0.1, c[1], c[2] + Math.sin(an) * 0.1]);
      if (!p) continue;
      var hh = (0.018 + 0.006 * Math.sin(t * 13 + i * 1.7)) * pxm;
      ctx.beginPath(); ctx.moveTo(p[0] - 0.006 * pxm, p[1]); ctx.quadraticCurveTo(p[0], p[1] - hh * 1.6, p[0] + 0.006 * pxm, p[1]);
      ctx.fillStyle = css([90, 140, 255], 0.75 * a); ctx.fill();
    }
  }
  // the flare over the pan
  function flareDraw(t) {
    var f = ST.flare;
    if (f < 0.01) return;
    var c = add3(VES.c, [0, 0.03, 0]), cc = toCam(c);
    if (cc[2] < 0.2) return;
    var o = scr(cc), px = F / cc[2];
    ctx.save(); ctx.globalCompositeOperation = ADD;
    halo(add3(c, [0, 0.12, 0]), 0.5 * (0.6 + 0.4 * f), [255, 150, 60], 0.55 * f);
    for (var i = 0; i < 9; i++) {
      var u = (i - 4) / 4, hgt = (0.12 + 0.14 * (1 - u * u) + 0.03 * Math.sin(t * 15 + i * 2.3)) * f * px;
      var x = o[0] + u * 0.1 * px + Math.sin(t * 9 + i) * 0.006 * px, w = (0.03 + 0.012 * (1 - Math.abs(u))) * px;
      var g = ctx.createLinearGradient(0, o[1], 0, o[1] - hgt);
      g.addColorStop(0, css([255, 200, 110], 0.9 * f)); g.addColorStop(0.4, css([255, 140, 50], 0.7 * f)); g.addColorStop(1, css([255, 90, 30], 0));
      ctx.beginPath(); ctx.moveTo(x - w, o[1]);
      ctx.quadraticCurveTo(x - w * 0.6, o[1] - hgt * 0.6, x + Math.sin(t * 6 + i) * w * 0.4, o[1] - hgt);
      ctx.quadraticCurveTo(x + w * 0.6, o[1] - hgt * 0.5, x + w, o[1]);
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- what travels, by progress ---------- */
  function travelling(s, t) {
    var out = [];
    /* the paper */
    ST.sheetOn = null;
    var m = smr(lin(s, 0.8, 2.0));
    var printed = clamp(0.38 + s / 0.45 * 0.62, 0, 1);
    var ticks = [0, 1, 2, 3, 4, 5].map(function (r) { return lin(s, 3.3 + r * 0.14, 3.55 + r * 0.14); });
    var land = smr(lin(s, 2.45, 2.85));
    var clip = sm(lin(s, 2.6, 2.85));
    var pos, rot = 0, k = 1.25, flutter = 0;
    if (s < 0.5) {
      flutter = 0.6 * Math.sin(t * 2.2);
      var hop = env(s, 0.36, 0.44, 0.47, 0.55);
      pos = add3(SLOT, [0, 0.03 * hop, 0]); rot = -2 * hop + flutter;
    } else {
      var u = lin(s, 0.5, 2.85);
      pos = spline(SHEETK, s);
      rot = -10 * Math.sin(Math.PI * u) + 2.5 * Math.sin(t * 2.2) * Math.sin(Math.PI * u);
      k = 1.25 + 0.1 * Math.sin(Math.PI * u);
      pos = add3(pos, [0, 0.012 * Math.sin(t * 2.7) * Math.sin(Math.PI * u), 0]);
    }
    var paperRoom = pos[2] > PZ + 0.05 || land > 0 ? 'k' : 'd';
    var drawP = function () {
      var room = paperRoom, Lp = lightAt(pos, room);
      // a little glow of its own at night, so the paper reads in the dark
      var glowL = [Lp[0] + 0.55 * ST.N, Lp[1] + 0.5 * ST.N, Lp[2] + 0.45 * ST.N];
      var cc = toCam(pos);
      if (cc[2] < 0.2) return;
      var o = scr(cc), sc = F / cc[2] / 100 * k;
      var cr = Math.cos(rot * Math.PI / 180), sr = Math.sin(rot * Math.PI / 180);
      var bill = [sc * cr, sc * sr, -sc * sr, sc * cr, o[0], o[1]];
      var xf = bill;
      if (land > 0) {
        // on the fridge's side: centimetres along u (across) and v (down) of that face
        var SK = SHEET_ON.k, O = P2(add3(SHEET_ON.c, SHEET_ON.v, 0.15)), A = P2(add3(add3(SHEET_ON.c, SHEET_ON.v, 0.15), SHEET_ON.u, SK)), B = P2(add3(SHEET_ON.c, SHEET_ON.v, 0.15 + SK));
        if (O && A && B) {
          var pl = [A[0] - O[0], A[1] - O[1], B[0] - O[0], B[1] - O[1], O[0], O[1]];
          xf = bill.map(function (v, i) { return lerp(v, pl[i], land); });
        }
      }
      if (ST.N > 0.05 && land < 1) {
        ctx.save(); ctx.globalCompositeOperation = ADD;
        halo(add3(pos, [0, 0.12 * k, 0]), 0.35 * k, [255, 225, 170], 0.35 * ST.N * (1 - land));
        ctx.restore();
      }
      setXf(xf);
      drawPaper(m, printed, ticks, clip, glowL);
      base();
    };
    if (land > 0) {
      ST.sheetOn = drawP;     // drawn by the fridge, on its side
    } else {
      out.push({ room: paperRoom, z: toCam(pos)[2] - 0.05, c: pos, draw: drawP });
    }
    /* the steak in the air */
    if (s > 3.35 && s < 4.9) {
      var mu = smr(lin(s, 3.4, 4.88));
      var mp = bez(MP, mu);
      var W = poseFn(mp, HERO.yaw + mu * 0.8, 0.35 * Math.sin(Math.PI * mu), 0.25 * Math.sin(Math.PI * mu * 2));
      out.push({ room: 'k', z: toCam(mp)[2], c: mp, draw: function () {
        // a soft shadow travels on the floor under it
        drawHeroSteak(W, smr(lin(s, 4.3, 4.9)) * 0.3, 0, 'k', null);
      } });
    }
    /* the plate, once it has left the range */
    DT.G.dish = null; SV.dish = null;
    if (s >= 6.2) {
      panState(s, t);
      var inK = VES.c[2] > PZ + 0.02, onPass = VES.c[2] < 4.15 && VES.c[2] > PZ - 0.25;
      var dd = function () { drawVesselWithFood(s, t, inK ? 'k' : 'd'); };
      if (SV.plate === 'table') DT.G.dish = dd;
      else if (SV.plate === 'hand') SV.dish = dd;
      else out.push({ room: onPass ? 'p' : inK ? 'k' : 'd', z: toCam(VES.c)[2] - (inK ? 0 : 0.05), c: VES.c, draw: dd });
    }
    return out;
  }

  /* ---------- the till ---------- */
  function drawTill(s, t, sn) {
    drawList(GT.items);
    var room = 'd';
    // the screen: bright at night with the day's sales
    var on = clamp(LI[L_TILL] / 1.2, 0, 1);
    var sc = projAll(SCREEN);
    if (sc) {
      polyPath(sc);
      var g = ctx.createLinearGradient(sc[0][0], sc[0][1], sc[3][0], sc[3][1]);
      var lit = mixc(mulL('#cfd5d6', AMB.d), '#ffe6bd', on);
      g.addColorStop(0, css(scl(lit, 1.04))); g.addColorStop(1, css(scl(lit, 0.9)));
      ctx.fillStyle = g; ctx.fill();
      chart(sn, on, sc);
    }
    // its light on the stand and the receipt
    ctx.save(); ctx.globalCompositeOperation = ADD;
    halo([(TS.x0 + TS.x1) / 2, (TS.yt + TS.yb) / 2, -1.8], 0.5, [255, 214, 150], 0.4 * on);
    pool([1.1, HS.top + 0.002, -1.7], [0.45, 0, 0], [0, 0, 0.35], [255, 205, 140], 0.35 * on);
    ctx.restore();
    var led = P2([PR.x1 - 0.03, PR.y - 0.03, PR.z0 - 0.002]);
    if (led) {
      var lo = 0.3 + 0.7 * (s < 0.5 ? (0.5 + 0.5 * Math.sin(t * 6)) : 0.2);
      ctx.beginPath(); ctx.arc(led[0], led[1], 1.6, 0, Math.PI * 2); ctx.fillStyle = css([239, 159, 69], lo); ctx.fill();
    }
  }

  /* The forecast on the till's screen: tonight's sales by the hour, then,
     beside them, tomorrow's, worked out from them, drawn in amber as the
     camera comes close. Shapes only; no figures. Units are millimetres on
     the screen's face. */
  var TONIGHT = [0.3, 0.46, 0.62, 0.88, 0.94, 0.72, 0.4];
  var TOMORROW = [0.36, 0.52, 0.74, 0.98, 1.0, 0.8, 0.46];
  function chart(sn, on, sc) {
    var O = SCREEN[0], e1 = sub3(SCREEN[1], O), e2 = sub3(SCREEN[3], O);
    var W = len3(e1) * 1000, H = len3(e2) * 1000, ux = nrm3(e1), vy = nrm3(e2);
    // a point on the screen's face, in millimetres from its top left corner
    function M(x, y) { return add3(add3(O, ux, x / 1000), vy, y / 1000); }
    function Q(x, y) { return P2(M(x, y)); }
    function rect(x, y, w, h) {
      var q = [Q(x, y), Q(x + w, y), Q(x + w, y + h), Q(x, y + h)];
      if (q[0] && q[1] && q[2] && q[3]) { polyPath(q); ctx.fill(); }
    }
    function line(x0, y0, x1, y1) {
      var a = Q(x0, y0), b = Q(x1, y1);
      if (a && b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    }
    function text(str, x, y) {
      var xf = planeXf(M(x, y), scl3(ux, 0.001), scl3(vy, 0.001));
      if (xf) { setXf(xf); ctx.fillText(str, 0, 0); base(); }
    }
    var amber = [160, 92, 26];
    ctx.save();
    polyPath(sc); ctx.clip();
    var pad = W * 0.07, mid = W / 2, gap = W * 0.035, base0 = H * 0.86, top0 = H * 0.3, bh = base0 - top0;
    ctx.lineWidth = 1; ctx.strokeStyle = css(SLATE, 0.18 + 0.2 * on);
    line(pad, base0, mid - gap, base0); line(mid + gap, base0, W - pad, base0);
    ctx.strokeStyle = css(SLATE, 0.1 + 0.12 * on); line(mid, H * 0.1, mid, base0);
    var fk = ramp(sn, 0.5, 0.75);
    if (fontsOK) {
      ctx.font = '600 ' + (H * 0.075).toFixed(2) + 'px "Schibsted Grotesk", sans-serif'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.fillStyle = css(SLATE, 0.3 + 0.5 * on); text('Tonight', pad, H * 0.18);
      ctx.fillStyle = css(amber, (0.45 + 0.55 * on) * fk); text('Tomorrow', mid + gap, H * 0.18);
    }
    function bars(vals, x0, x1, grow, c, a) {
      var n = vals.length, step = (x1 - x0) / n, bw = step * 0.56;
      ctx.fillStyle = css(c, a);
      for (var i = 0; i < n; i++) {
        var k = grow(i);
        if (k <= 0.002) continue;
        var hh = vals[i] * bh * k;
        rect(x0 + i * step + (step - bw) / 2, base0 - hh, bw, hh);
      }
    }
    bars(TONIGHT, pad, mid - gap, function () { return 1; }, SLATE, 0.22 + 0.4 * on);
    // tonight's shape, faint, under tomorrow's, so the eye reads the one from the other
    bars(TONIGHT, mid + gap, W - pad, function () { return fk; }, SLATE, 0.08 * fk);
    bars(TOMORROW, mid + gap, W - pad, function (i) { return eio(lin(sn, 0.62 + i * 0.07, 0.86 + i * 0.07)); }, amber, 0.55 + 0.4 * on);
    ctx.restore();
  }

  /* ---------- a table, its chairs, its guests ---------- */
  function drawTable(G, s, t) {
    var full = ST.full;
    var cp = camPos();
    // seats beyond the table first, then the table, then the seats this side of it
    var tz = toCam(G.c)[2];
    var far = [], near = [];
    G.seats.forEach(function (S) { (toCam(S.c)[2] > tz ? far : near).push(S); });
    far.sort(function (a, b) { return toCam(b.c)[2] - toCam(a.c)[2]; });
    near.sort(function (a, b) { return toCam(b.c)[2] - toCam(a.c)[2]; });
    function seat(S) {
      if (full < 0.5) return;
      prepAll(S.seat); prepAll(S.back);
      drawList(S.seat);
      if (S.who) drawFigure(S.who, t, 'd');
      drawList(S.back);
      if (S.coat) { prepAll(S.coat); drawList(S.coat); }
    }
    far.forEach(seat);
    prepAll(G.base); drawList(G.base);
    prepAll(G.top); drawList(G.top);
    // the rim of the top
    var rt = projAll(G.rimTop), rb = projAll(G.rimBot);
    if (rt && rb) {
      var Lr = lightAt(G.c, 'd');
      polyPath(hull(rt.concat(rb))); ctx.fillStyle = css(mulL('#6e5440', Lr)); ctx.fill();
      polyPath(rt); ctx.fillStyle = css(mulL('#a5835f', lightAt(G.c, 'd', G.topIt.lf))); ctx.fill();
      ctx.lineWidth = LW.k * wf(tz); ctx.strokeStyle = ink(mulL('#a5835f', Lr), 'k', 'd'); ctx.stroke();
    }
    // lamplight on the top
    var tb = TABLES[DGROUPS.indexOf(G)];
    if (tb) {
      ctx.save(); ctx.globalCompositeOperation = ADD;
      pool([tb.x, TY + 0.001, tb.z], [0.42, 0, 0], [0, 0, 0.42], [255, 170, 100], 0.26 * LI[tb.L], [[0, 1], [0.5, 0.6], [0.85, 0.22], [1, 0]]);
      ctx.restore();
    }
    if (full < 0.5) { prepAll(G.up); drawList(G.up); }
    else {
      drawSetting(G, tb, s, t);
    }
    if (G.dish) G.dish();
    near.forEach(seat);
  }
  function prepAll(L2) { for (var i = 0; i < L2.length; i++) if (!L2[i].lf) prepLight(L2[i]); }
  function drawSetting(G, tb, s, t) {
    var room = 'd', Lc = lightAt([tb.x, TY + 0.1, tb.z], room), z = toCam(G.c)[2], pxm = F / z, lw = wf(z);
    // a candle in a glass, at the centre
    var cy = cylPath([tb.x, TY, tb.z], TY, TY + 0.07, 0.035, 0.038, 16);
    if (cy) {
      polyPath(cy.side); ctx.fillStyle = css(mulL('#e9d8b8', Lc), 0.5); ctx.fill();
      ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(mulL('#e9d8b8', Lc), 'd', room); ctx.stroke();
      var fl = P2([tb.x, TY + 0.075, tb.z]);
      if (fl && LI[tb.C] > 0.05) {
        var fh = (0.022 + 0.004 * Math.sin(t * 9 + tb.x)) * pxm;
        ctx.beginPath(); ctx.ellipse(fl[0], fl[1] - fh * 0.5, fh * 0.28, fh * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = css([255, 214, 140], clamp(LI[tb.C], 0, 1)); ctx.fill();
      }
    }
    G.seats.forEach(function (S, k) {
      var occupied = !!S.who;
      // a plate in front of each guest, a glass of wine
      var pc = S.plate;
      var isDest = S === DSEAT;
      {
        var pr = projAll(ringPts(pc, 0.12, 24)), pw = projAll(ringPts(add3(pc, [0, 0.001, 0]), 0.08, 24));
        if (pr && pw && !isDest) {
          polyPath(pr); fillStroke(mulL('#f4f1ea', Lc), 1, 'q', room, z);
          polyPath(pw); ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(mulL('#f4f1ea', Lc), 'd', room); ctx.stroke();
          // something eaten on it
          if (occupied && k % 2 === 0) {
            var bits = projAll([add3(pc, [-0.03, 0.006, 0.01]), add3(pc, [0.02, 0.006, -0.02]), add3(pc, [0.035, 0.006, 0.02])]);
            if (bits) bits.forEach(function (b, j) { ctx.beginPath(); ctx.ellipse(b[0], b[1], 0.016 * pxm, 0.008 * pxm, j, 0, Math.PI * 2); ctx.fillStyle = css(mulL(['#7a4a2c', '#5f8a3e', '#c9a35a'][j], Lc)); ctx.fill(); });
          }
        }
      }
      wineGlass(S.glass, Lc, room, k);
    });
  }
  function wineGlass(p, Lc, room, k) {
    var z = toCam(p)[2], pxm = F / z, lw = wf(z);
    var b = P2(p), st = P2(add3(p, [0, 0.1, 0])), bw = P2(add3(p, [0, 0.165, 0]));
    if (!b || !st || !bw) return;
    ctx.beginPath(); ctx.ellipse(b[0], b[1], 0.032 * pxm, 0.008 * pxm, 0, 0, Math.PI * 2);
    ctx.lineWidth = LW.d * lw; ctx.strokeStyle = ink(mulL('#e8eef0', Lc), 'q', room); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(st[0], st[1]); ctx.stroke();
    // the bowl
    var r = 0.04 * pxm, h = (bw[1] - st[1]);
    ctx.beginPath(); ctx.moveTo(st[0], st[1]);
    ctx.bezierCurveTo(st[0] - r * 1.2, st[1] + h * 0.1, bw[0] - r * 1.05, bw[1] - h * 0.2, bw[0] - r * 0.82, bw[1] + h * 0.55);
    ctx.lineTo(bw[0] + r * 0.82, bw[1] + h * 0.55);
    ctx.bezierCurveTo(bw[0] + r * 1.05, bw[1] - h * 0.2, st[0] + r * 1.2, st[1] + h * 0.1, st[0], st[1]);
    ctx.fillStyle = css([240, 246, 247], 0.1); ctx.fill(); ctx.stroke();
    // wine in it
    if (k % 3 !== 2) {
      var wl = lerp(st[1], bw[1], 0.45);
      ctx.beginPath(); ctx.moveTo(st[0], st[1] + h * 0.02);
      ctx.bezierCurveTo(st[0] - r * 1.1, st[1] + h * 0.1, st[0] - r * 1.05, wl + h * 0.05, st[0] - r * 0.98, wl);
      ctx.lineTo(st[0] + r * 0.98, wl);
      ctx.bezierCurveTo(st[0] + r * 1.05, wl + h * 0.05, st[0] + r * 1.1, st[1] + h * 0.1, st[0], st[1] + h * 0.02);
      ctx.fillStyle = css(mulL('#6e1f2a', Lc), 0.92); ctx.fill();
      ctx.beginPath(); ctx.ellipse(st[0], wl, r * 0.98, r * 0.22, 0, 0, Math.PI * 2); ctx.fillStyle = css(mulL('#8c2c36', Lc), 0.95); ctx.fill();
    }
    // a glint
    ctx.beginPath(); ctx.moveTo(bw[0] - r * 0.55, bw[1] + h * 0.35); ctx.lineTo(bw[0] - r * 0.7, bw[1] - h * 0.2);
    ctx.lineWidth = 1.2 * lw; ctx.strokeStyle = css([255, 244, 225], 0.5); ctx.stroke();
  }

  /* ---------- light over the drawing ---------- */
  function kitchenLight(s, t) {
    ctx.save(); ctx.globalCompositeOperation = ADD;
    // morning sun through the window: a soft shaft to the floor
    if (ST.D > 0.02) {
      var top = [[WX0, WY0, KZ - 0.01], [WX1, WY0, KZ - 0.01], [WX1, WY1, KZ - 0.01], [WX0, WY1, KZ - 0.01]], dir = [-0.25, -1, -1.25];
      var bot = top.map(function (p) { var k = (p[1] - FL) / -dir[1]; return [p[0] + dir[0] * k, FL + 0.002, p[2] + dir[2] * k]; });
      var b2 = projAll(bot), t2 = projAll(top);
      if (b2 && t2) {
        polyPath(hull(b2.concat(t2)));
        var g = ctx.createLinearGradient(t2[0][0], t2[0][1], b2[0][0], b2[0][1]);
        g.addColorStop(0, css([255, 246, 225], 0.2 * ST.D)); g.addColorStop(1, css([255, 246, 225], 0.04 * ST.D));
        ctx.fillStyle = g; ctx.fill();
        polyPath(b2); ctx.fillStyle = css([255, 244, 220], 0.16 * ST.D); ctx.fill();
      }
    }
    // the fridge's cold light spills on the floor
    if (LI[L_FRIDGE] > 0.02) pool([(FX0 + FX1) / 2 - 0.3, FL + 0.003, FZ - 0.35], [0.8, 0, 0], [0, 0, 0.6], [220, 240, 248], 0.3 * LI[L_FRIDGE] / 1.5);
    // the flare lights the hood, the wall and the chef
    if (ST.flare > 0.01) {
      halo([PB[0], PB[1] + 0.4, PB[2] + 0.1], 1.1, [255, 150, 60], 0.32 * ST.flare);
    }
    // heat lamps: warm cones onto the pass shelf, a pool on it
    if (ST.heat > 0.02) {
      LX.forEach(function (lx, i) {
        var a = projAll([[lx - 0.085, LY, LZ], [lx + 0.085, LY, LZ], [lx + 0.36, OB, 3.36], [lx - 0.36, OB, 3.36]]);
        var near = clamp((len3(sub3([lx, 0.2, LZ], camPos())) - 0.7) / 1.4, 0, 1);
        if (a && near > 0.01) {
          polyPath(a);
          var g2 = ctx.createLinearGradient(0, a[0][1], 0, a[2][1]);
          g2.addColorStop(0, css([255, 168, 80], 0.1 * ST.heat * near)); g2.addColorStop(1, css([255, 178, 95], 0.0));
          ctx.fillStyle = g2; ctx.fill();
        }
        pool([lx, OB + 0.002, 3.62], [0.32, 0, 0], [0, 0, 0.3], [255, 170, 90], 0.3 * ST.heat);
        halo([lx, LY - 0.005, LZ], 0.12, [255, 226, 170], 0.7 * clamp(ST.heat, 0, 1));
      });
    }
    // the strip light's glow
    halo([0, KC - 0.02, 5.5], 0.9, [235, 245, 245], 0.1 * LI[L_STRIP]);
    ctx.restore();
    flareDraw(t);
  }
  function diningFloorLight(s, t) {
    ctx.save(); ctx.globalCompositeOperation = ADD;
    TABLES.forEach(function (tb) {
      var I = LI[tb.L];
      if (I > 0.02) pool([tb.x, FL + 0.002, tb.z], [0.95, 0, 0], [0, 0, 0.95], [255, 172, 96], 0.34 * I, [[0, 1], [0.3, 0.7], [0.65, 0.22], [1, 0]]);
    });
    // morning through the skylight: a bright patch on the floor
    if (ST.D > 0.02) {
      pool([(SKX0 + SKX1) / 2 - 0.5, FL + 0.002, (SKZ0 + SKZ1) / 2 - 0.6], [1.6, 0, 0], [0, 0, 1.2], [255, 250, 236], 0.16 * ST.D);
      var top = [[SKX0, DC + SKH, SKZ0], [SKX1, DC + SKH, SKZ0], [SKX1, DC + SKH, SKZ1], [SKX0, DC + SKH, SKZ1]], dir = [-0.32, -1, -0.38];
      var bot = top.map(function (p) { var k = (p[1] - FL) / -dir[1]; return [p[0] + dir[0] * k, FL + 0.002, p[2] + dir[2] * k]; });
      var b2 = projAll(bot), t2 = projAll(top);
      if (b2 && t2) {
        polyPath(hull(b2.concat(t2)));
        var g = ctx.createLinearGradient(0, Math.min(t2[0][1], t2[2][1]), 0, Math.max(b2[0][1], b2[2][1]));
        g.addColorStop(0, css([255, 250, 238], 0.16 * ST.D)); g.addColorStop(1, css([255, 250, 238], 0.02 * ST.D));
        ctx.fillStyle = g; ctx.fill();
      }
    }
    ctx.restore();
  }
  function diningLight(s, t) {
    // pendants: drawn last in the room, with their halos
    TABLES.forEach(function (tb, k) {
      var I = LI[tb.L], sw = 0.03 * Math.sin(t * 0.6 + k * 1.3);
      var top = [tb.x, 0.66, tb.z], p = [tb.x + sw * 0.25, 0.62, tb.z + sw * 0.12];
      var c = toCam(p);
      if (c[2] < 0.3) return;
      var o = scr(c), sc = F / c[2] / 100, tp = P2(top);
      var Lc = lightAt(p, 'd');
      ctx.setTransform(DPR * sc, 0, 0, DPR * sc, DPR * o[0], DPR * o[1]);
      ctx.rotate(-sw);
      ctx.beginPath(); ctx.moveTo(-17, 1); ctx.bezierCurveTo(-17, -10, -9, -17, 0, -17); ctx.bezierCurveTo(9, -17, 17, -10, 17, 1); ctx.closePath();
      var g = ctx.createLinearGradient(-17, 0, 17, 0);
      var shc = mulL('#30363a', Lc);
      g.addColorStop(0, css(scl(shc, 1.25))); g.addColorStop(0.45, css(scl(shc, 1.0))); g.addColorStop(1, css(scl(shc, 0.7)));
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 1.1 / sc; ctx.strokeStyle = ink(shc, 'k', 'd'); ctx.stroke();
      // the opening under the shade, lit
      ctx.beginPath(); ctx.ellipse(0, 1, 16.5, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = css(mixc(mulL('#e8e2d4', Lc), '#fff3dc', clamp(I, 0, 1))); ctx.fill();
      base();
      if (I > 0.02) {
        ctx.save(); ctx.globalCompositeOperation = ADD;
        halo([p[0], p[1] - 0.03, p[2]], 0.5, [255, 190, 115], 0.42 * I, [[0, 1], [0.15, 0.6], [0.45, 0.16], [1, 0]]);
        // its cone of light down to the table
        var a = projAll([[p[0] - 0.16, p[1] - 0.01, p[2]], [p[0] + 0.16, p[1] - 0.01, p[2]], [p[0] + 0.36, TY + 0.02, p[2]], [p[0] - 0.36, TY + 0.02, p[2]]]);
        if (a && c[2] > 1.2) {
          polyPath(a);
          var g2 = ctx.createLinearGradient(0, a[0][1], 0, a[2][1]);
          g2.addColorStop(0, css([255, 196, 120], 0.07 * I)); g2.addColorStop(1, css([255, 196, 120], 0));
          ctx.fillStyle = g2; ctx.fill();
        }
        ctx.restore();
      }
      // candle glow
      if (LI[tb.C] > 0.02) {
        ctx.save(); ctx.globalCompositeOperation = ADD;
        halo([tb.x, TY + 0.09, tb.z], 0.22, [255, 180, 100], 0.5 * LI[tb.C]);
        ctx.restore();
      }
    });
    // the heat lamps seen from the dining side
  }
  // a final grade: a vignette that deepens the edges, never a haze; and a tight
  // soft shadow right behind the words, so porcelain type reads on any frame
  var COPY = null, shadeEl = document.createElement('div'), vigEl = document.createElement('div'), lastShade = -1, lastVig = -1;
  var topEl = document.createElement('div'), lastTop = -1;
  shadeEl.className = 'pass-shade'; vigEl.className = 'pass-vig'; topEl.className = 'pass-top';
  art.appendChild(vigEl); art.appendChild(shadeEl); art.appendChild(topEl);
  function grade(s, t) {
    var ka = (phone ? 0 : 0.32 * ST.N + 0.56 * ST.D + 0.42 * ST.S) * (1 - COPYK);
    if (Math.abs(ka - lastShade) > 0.004) { lastShade = ka; shadeEl.style.opacity = ka.toFixed(3); }
    var a = 0.55 * ST.N + 0.38 * ST.S + 0.08 * ST.D;
    if (Math.abs(a - lastVig) > 0.004) { lastVig = a; vigEl.style.opacity = a.toFixed(3); }
    var tp = 0.6 * ST.N + 1 * ST.D + 0.8 * ST.S;
    if (Math.abs(tp - lastTop) > 0.004) { lastTop = tp; topEl.style.opacity = tp.toFixed(3); }
  }

  /* prepare lights for all static shapes */
  [KSH, KPASS, DSH, GF.items, GT.items].forEach(function (L2) { L2.forEach(prepLight); });
  FIN.forEach(prepLight);
  SHELF.forEach(function (L2) { L2.forEach(prepLight); });

  /* ---------- size: the canvas is the figure's pixels ---------- */
  var phone = false, HT = 0, lastVigX = -1;
  // the camera's centre sits right of middle while a note is on the left, and
  // swings left of middle for the prep note on the right
  function lens(sn) {
    if (phone) { PPX = VW * 0.5; return; }
    PPX = VW * lerp(0.62, 0.4, env(sn, 3.25, 3.8, 4.95, 5.45));
    if (Math.abs(PPX - lastVigX) > 3) { lastVigX = PPX; vig(); }
  }
  function vig() {
    vigEl.style.background = 'radial-gradient(circle at ' + Math.round(PPX) + 'px ' + Math.round(PPY) + 'px, rgba(16,18,22,0) ' + Math.round(Math.min(VW, VH) * 0.25) + 'px, rgba(16,18,22,1) ' + Math.round(Math.max(VW, VH) * 0.85) + 'px)';
  }
  function size() {
    var r = fig.getBoundingClientRect();
    VW = Math.max(200, Math.round(r.width)); VH = Math.max(200, Math.round(r.height));
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
    cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
    phone = window.matchMedia('(max-width: 760px)').matches;
    var hd = document.querySelector('.top');
    HT = hd ? hd.offsetHeight : 0;
    // the scene runs up under the header: frame the part below it
    var vh = Math.max(200, VH - HT);
    F = phone ? Math.max(vh * 0.95, VW * 1.2) : Math.max(vh * 1.0, VW * 0.56);
    PPX = phone ? VW * 0.5 : VW * 0.62;
    PPY = HT + vh * (phone ? 0.47 : 0.46);
    // where the words sit over the scene
    var cp = document.querySelector('.hero-copy');
    if (cp) {
      var h1r = cp.querySelector('h1'), btn = cp.querySelector('.btn');
      var a = h1r ? h1r.getBoundingClientRect() : cp.getBoundingClientRect();
      var lr = cp.querySelector('.lead'), b2 = (btn && btn.offsetParent ? btn : lr || h1r).getBoundingClientRect();
      var x0 = a.left - r.left, x1 = Math.max(a.right, lr ? lr.getBoundingClientRect().right : 0) - r.left, y0 = a.top - r.top, y1 = b2.bottom - r.top;
      COPY = { cx: x0 + (x1 - x0) * 0.36, cy: (y0 + y1) / 2 + 10, rx: (x1 - x0) * 0.86 + 60, ry: (y1 - y0) * 0.78 + 60 };
      shadeEl.style.left = (COPY.cx - COPY.rx) + 'px'; shadeEl.style.top = (COPY.cy - COPY.ry) + 'px';
      shadeEl.style.width = (2 * COPY.rx) + 'px'; shadeEl.style.height = (2 * COPY.ry) + 'px';
    }
    lastVigX = PPX; vig();
    measure();
  }

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
    var text = el.textContent.trim(), html = el.innerHTML.trim();
    var fx = '<span class="vhs-fx" aria-hidden="true"><span class="vhs-c vhs-warm">' + text + '</span><span class="vhs-c vhs-cool">' + text + '</span>';
    for (var i = 0; i < bands; i++) {
      var a = (i / bands * 100).toFixed(2), b = (100 - (i + 1) / bands * 100).toFixed(2);
      fx += '<span class="vhs-b" style="clip-path:inset(' + a + '% -30% ' + b + '% -30%)">' + text + '</span>';
    }
    // the real words keep their markup (the lead's three key words)
    el.innerHTML = '<span class="vhs-real">' + html + '</span>' + fx + '</span>';
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
      var mid2 = 1 - (t - 0.6) / 0.5;
      split = (2 + r(1) * 3 * mid2) * k;
      for (i = 0; i < bands; i++) shift.push(r(10 + i) > 0.72 ? (r(30 + i) - 0.5) * 26 * mid2 * k : 0);
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
      var r = hash(step, i), row2 = Math.floor(i / 240);
      var streak = hash(step, 100000 + row2) > 0.86 ? 1 : 0;
      var v = r > (streak ? 0.62 : 0.86) ? 1 : 0;
      var c = v ? (phone ? 35 : 222) : 242;
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
  function sizeScreen() {
    var box = copy && copy.querySelector('.vhs-screen');
    if (box && lead) box.style.height = (lead.offsetTop + lead.offsetHeight + 28) + 'px';
  }

  /* ---------- what Tooey does, told by the day ----------
     As the day starts, the three key words in the lead light up and the rest
     of the words fade away; the three fly up to a rail under the header that
     names them. Then each gets its note in a third of the screen, with its
     moment: Forecast at the till, Prep at the fridge, Shifts with the server.
     Windows are in s (0..10): in from, in to, out from, out to. */
  var NW = [[0.55, 0.85, 1.95, 2.25], [3.35, 3.65, 5.0, 5.3], [7.9, 8.25, 1e9, 1e9]];
  var notesEl = document.querySelector('.day-notes');
  var NOTE = notesEl ? [].slice.call(notesEl.querySelectorAll('.note')) : [];
  var RAIL = notesEl && notesEl.querySelector('.day-rail');
  var RITEM = notesEl ? [].slice.call(notesEl.querySelectorAll('.rail-item')) : [];
  var RWORD = RITEM.map(function (r) { return r.querySelector('.rail-word'); });
  var KWS = [], FLY = [], COPYK = 0, lastSn = -1;
  function measure() {
    if (!motion || !RWORD.length || !lead) return;
    KWS = [].slice.call(lead.querySelectorAll('.vhs-real .kw'));
    if (!KWS.length) KWS = [].slice.call(lead.querySelectorAll('.kw'));
    var ct = copy.style.transform;
    copy.style.transform = 'none';
    FLY = RWORD.map(function (w, i) {
      var kw = KWS[i], tx = w.firstElementChild;
      if (!kw || !tx) return null;
      w.style.transform = 'none';
      var a = w.getBoundingClientRect(), at = tx.getBoundingClientRect(), b = kw.getBoundingClientRect();
      var k = b.height / (at.height || 1);
      return { dx: b.left - a.left - (at.left - a.left) * k, dy: b.top - a.top - (at.top - a.top) * k, k: k };
    });
    copy.style.transform = ct;
    lastSn = -1;
  }
  function px(v) { return v.toFixed(2) + 'px'; }
  function notes(sn) {
    if (!motion || stillMode || Math.abs(sn - lastSn) < 1e-5) return;
    lastSn = sn;
    // the words fade and lift; the three key words underline first
    COPYK = ramp(sn, 0.08, 0.34);
    if (lead) lead.style.setProperty('--u', ramp(sn, 0, 0.11).toFixed(3));
    if (copy) {
      copy.style.opacity = COPYK > 0 ? (1 - COPYK).toFixed(3) : '';
      copy.style.transform = COPYK > 0 ? 'translateY(' + px(-28 * COPYK) + ')' : '';
      copy.style.visibility = COPYK > 0.995 ? 'hidden' : '';
    }
    var away = sn > 0.12, f = eio(lin(sn, 0.12, 0.66));
    KWS.forEach(function (kw) { kw.style.visibility = away ? 'hidden' : ''; });
    if (RAIL) RAIL.style.setProperty('--rk', ramp(sn, 0.42, 0.68).toFixed(3));
    var vis = NW.map(function (w) { return ramp(sn, w[0], w[1]) * (1 - ramp(sn, w[2], w[3])); });
    RWORD.forEach(function (w, i) {
      w.style.visibility = away ? 'visible' : '';
      var F2 = FLY[i];
      if (F2 && f < 1) {
        var lift = -28 * COPYK;
        w.style.transform = 'translate(' + px(F2.dx * (1 - f)) + ',' + px((F2.dy + lift) * (1 - f)) + ') scale(' + lerp(F2.k, 1, f).toFixed(4) + ')';
      } else w.style.transform = '';
      var on = i === 0 ? 1 - ramp(sn, NW[0][2], NW[0][3]) : Math.max(1 - f, vis[i]);
      w.style.setProperty('--on', on.toFixed(3));
    });
    if (RITEM[1]) RITEM[1].style.setProperty('--fill', (100 * lin(sn, 2.0, 3.5)).toFixed(1) + '%');
    if (RITEM[2]) RITEM[2].style.setProperty('--fill', (100 * lin(sn, 5.0, 8.0)).toFixed(1) + '%');
    var shade = (0.55 * ST.N + 1 * ST.D + 0.8 * ST.S).toFixed(3), light = ST.D > 0.5;
    NOTE.forEach(function (el, i) {
      var w = NW[i], a = ramp(sn, w[0], w[1]), b = ramp(sn, w[2], w[3]), v = a * (1 - b);
      el.style.opacity = v.toFixed(3);
      el.style.visibility = v > 0.005 ? 'visible' : 'hidden';
      el.style.transform = 'translateY(' + px(18 * (1 - a) - 14 * b) + ')';
      el.style.setProperty('--k', ramp(sn, w[0] + 0.12, w[1] + 0.3).toFixed(3));
      el.style.setProperty('--shade', shade);
      // in the bright morning the words go dark on a pale shade
      el.classList.toggle('on-light', light);
    });
  }

  /* ---------- the header over the scene ---------- */
  var topBar = document.querySelector('.top');
  function onScene() {
    if (!topBar || !heroEl) return;
    var b = heroEl.getBoundingClientRect().bottom;
    topBar.classList.toggle('on-scene', b > topBar.offsetHeight + 1);
  }
  onScene();
  window.addEventListener('scroll', onScene, { passive: true });
  window.addEventListener('resize', onScene);
  // the nav's link to what Tooey does goes to the forecast, inside the day
  [].forEach.call(document.querySelectorAll('a[href="#what"]'), function (a) {
    a.addEventListener('click', function (e) {
      if (!motion || stillMode || !heroEl) return;
      e.preventDefault();
      var top = heroEl.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: Math.round(top + travel() * STOPS[0].at), behavior: 'smooth' });
    });
  });

  /* ---------- scroll drives the day ---------- */
  // the still, for reduced motion: just inside the room, in lamplight, looking
  // through the pass at the chef with the plate under the heat lamps
  var STILL = { x: 0.02, y: 0.3, z: -2.4, yaw: 0.05, pitch: -0.1 };
  var STILL_S = 7.55;
  var target = 0, shown = 0, lastT = 0, t0 = performance.now();
  function travel() {
    if (!heroEl) return 1;
    return Math.max(1, heroEl.offsetHeight - (pinEl ? pinEl.offsetHeight : window.innerHeight));
  }
  function scrollTarget() {
    if (fixedP != null) return fixedP;
    var top = heroEl ? heroEl.getBoundingClientRect().top : 0;
    return clamp(-top / travel(), 0, 1);
  }
  window.TooeyHero = {
    // the scroll range the day takes, in page pixels (site.js snaps around it)
    range: function () {
      if (!heroEl || !motion || stillMode || !heroEl.classList.contains('is-scrubbed')) return null;
      var top = heroEl.getBoundingClientRect().top + window.pageYOffset;
      return [top, top + travel()];
    },
    // where the day holds: for each note, the scroll position it rests at and
    // the stretch round it that comes to rest there (site.js snaps to these)
    stops: function () {
      var r = this.range();
      if (!r) return [];
      var L = r[1] - r[0];
      // coming in, a stop catches the scroll a little early; once past its end, it lets go
      return STOPS.map(function (st) { return { at: r[0] + L * st.at, from: r[0] + L * (st.from - 0.05), to: r[0] + L * st.to }; });
    },
    // where the day is: the scroll's target and what is shown (for review)
    progress: function () { return { target: target, shown: shown, s: DAY(shown) }; }
  };

  function paintStill() { stillMode = true; frame(STILL_S, 0); }

  function fontsReady() { return document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(); }
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('600 12px "Schibsted Grotesk"'), document.fonts.load('italic 600 12px "Source Serif 4"')]).then(function () { fontsOK = true; }, function () { fontsOK = true; });
  } else fontsOK = true;

  size();
  window.addEventListener('resize', function () { size(); if (!motion) paintStill(); else draw(); });
  if (!motion) {
    paintStill();
    fontsReady().then(function () { fontsOK = true; paintStill(); });
    return;
  }
  heroEl && heroEl.classList.add('is-scrubbed');
  size();
  setupText();
  measure();
  target = shown = scrollTarget();

  var raf = 0, visible = true, textStart = 0, textOver = false;
  function draw() {
    var now = performance.now(), t = (fixedP != null && !liveIdle) ? 0 : (now - t0) / 1000;
    frame(DAY(shown), t);
  }
  function tick(now) {
    raf = 0;
    var dt = Math.min(0.1, (now - (lastT || now)) / 1000); lastT = now;
    target = scrollTarget();
    // ease toward the scroll: fluid on a wheel's steps and on a trackpad
    var k = 1 - Math.exp(-dt / 0.14);
    shown += (target - shown) * k;
    if (Math.abs(target - shown) < 0.0004) shown = target;
    draw();
    if (textStart && !textOver) {
      var e = (now - textStart) / 1000;
      if (e < 1.55) textAt(e);
      else { textOver = true; textDone(); nextBlip = now + 7000 + Math.random() * 3000; }
    } else if (textOver && freeze == null) {
      // the tape blips only while the words are up
      if (shown < 0.005) blipAt(now);
      else if (blip) { apply(V, null); apply(Vl, null); blip = null; }
    }
    if (visible && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && visible && !document.hidden) { lastT = 0; raf = requestAnimationFrame(tick); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) start();
    }).observe(fig);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
  window.addEventListener('scroll', start, { passive: true });

  draw();
  textAt(0);
  if (freeze != null && !isNaN(freeze)) {
    fontsReady().then(function () {
      fontsOK = true;
      sizeScreen(); measure();
      if (freeze < 1.5) textAt(freeze); else textDone();
      root.classList.remove('vhs-pending');
      textOver = true; textStart = 0;
      start();
    });
  } else {
    Promise.race([fontsReady(), new Promise(function (r) { setTimeout(r, 700); })]).then(function () {
      requestAnimationFrame(function () {
        root.classList.remove('vhs-pending');
        sizeScreen(); measure();
        textStart = performance.now();
        start();
      });
    });
  }
  start();
})();
