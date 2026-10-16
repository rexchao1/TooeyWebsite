/* Tooey, exploration 35. The first four drawings are 34's (the lit room);
   the fifth is new. The five drawings: the street front, the prep table,
   the line, the dining room, and a street of independents (which replaces
   34's "same Friday at close"). Coordinates are in each drawing's own
   units; 1 unit is about one screen pixel at 1440 wide. */
(function () {
  'use strict';
  var T = window.TooeyDraw, P = T.P, Drawing = T.Drawing, tx = T.text;

  /* ---------- shared pieces ---------- */

  // a filled outline around a polyline of width w (arms, legs, stems)
  function thick(pts, w0, w1) {
    var L = [], k = pts.length / 2, i, x, y, ax, ay, bx, by, dx, dy, l, w;
    if (w1 == null) w1 = w0;
    for (i = 0; i < k; i++) {
      x = pts[i * 2]; y = pts[i * 2 + 1];
      ax = i > 0 ? pts[i * 2 - 2] : x; ay = i > 0 ? pts[i * 2 - 1] : y;
      bx = i < k - 1 ? pts[i * 2 + 2] : x; by = i < k - 1 ? pts[i * 2 + 3] : y;
      dx = bx - ax; dy = by - ay; l = Math.hypot(dx, dy) || 1;
      w = (w0 + (w1 - w0) * i / Math.max(1, k - 1)) / 2;
      L.push(x - dy / l * w, y + dx / l * w);
    }
    var RR = [];
    for (i = k - 1; i >= 0; i--) {
      x = pts[i * 2]; y = pts[i * 2 + 1];
      ax = i > 0 ? pts[i * 2 - 2] : x; ay = i > 0 ? pts[i * 2 - 1] : y;
      bx = i < k - 1 ? pts[i * 2 + 2] : x; by = i < k - 1 ? pts[i * 2 + 3] : y;
      dx = bx - ax; dy = by - ay; l = Math.hypot(dx, dy) || 1;
      w = (w0 + (w1 - w0) * i / Math.max(1, k - 1)) / 2;
      RR.push(x + dy / l * w, y - dx / l * w);
    }
    return P.pg(L.concat(RR));
  }

  // a wine glass standing on y
  function wineGlass(o, x, y, s) {
    s = s || 1;
    var bowl = P.c(x - 7 * s, y - 34 * s, x - 8 * s, y - 20 * s, x - 3 * s, y - 16 * s, x, y - 16 * s) +
      P.c(x, y - 16 * s, x + 3 * s, y - 16 * s, x + 8 * s, y - 20 * s, x + 7 * s, y - 34 * s);
    o.q += bowl + P.ln(x - 7 * s, y - 34 * s, x + 7 * s, y - 34 * s) + P.vl(x, y - 16 * s, y) + P.ln(x - 6 * s, y, x + 6 * s, y);
    o.d += P.q(x - 6 * s, y - 26 * s, x, y - 24 * s, x + 6 * s, y - 26 * s);
  }
  function tumbler(o, x, y, h, w) {
    o.f += P.pg([x - w / 2, y - h, x + w / 2, y - h, x + w / 2 - 1.5, y, x - w / 2 + 1.5, y]);
    o.q += P.pg([x - w / 2, y - h, x + w / 2, y - h, x + w / 2 - 1.5, y, x - w / 2 + 1.5, y]);
    o.d += P.hl(x - w / 2 + 1, x + w / 2 - 1, y - h * 0.45);
  }
  function candle(o, x, y) {
    o.f += P.rc(x - 6, y - 14, 12, 14);
    o.q += P.rc(x - 6, y - 14, 12, 14);
    o.d += P.el(x, y - 14, 6, 1.6) + P.vl(x, y - 14, y - 17);
  }
  function plateSide(o, x, y, w) {
    o.f += P.pg([x - w / 2, y - 4, x + w / 2, y - 4, x + w / 2 - 6, y, x - w / 2 + 6, y]);
    o.q += P.pl([x - w / 2, y - 4, x + w / 2, y - 4]) + P.pl([x - w / 2 + 2, y - 3, x - w / 2 + 6, y, x + w / 2 - 6, y, x + w / 2 - 2, y - 3]);
  }
  function bottle(o, x, y, kind, s) {
    s = s || 1;
    var w = (kind === 2 ? 15 : kind === 1 ? 13 : 11) * s, h = (kind === 2 ? 36 : kind === 1 ? 44 : 52) * s;
    var neck = (kind === 2 ? 10 : 18) * s, nw = 3.2 * s, top = y - h - neck;
    var pts = [x - w / 2, y, x - w / 2, y - h + 4 * s, x - nw, y - h - 2 * s, x - nw, top, x + nw, top, x + nw, y - h - 2 * s, x + w / 2, y - h + 4 * s, x + w / 2, y];
    o.f += P.pg(pts);
    o.q += P.pg(pts);
    o.d += P.rc(x - w / 2 + 2 * s, y - h * 0.62, w - 4 * s, h * 0.32) + P.hl(x - nw, x + nw, top + 4 * s);
  }

  // a seated person seen side on, facing dir (1 right, -1 left); y is the seat
  function sitter(o, x, y, dir, s) {
    s = s || 1;
    var d = dir;
    var X = function (v) { return x + d * v * s; }, Y = function (v) { return y - v * s; };
    // torso
    var torso = [X(-14), Y(0), X(-16), Y(30), X(-15), Y(58), X(-8), Y(66), X(6), Y(66), X(14), Y(56), X(16), Y(34), X(14), Y(4)];
    o.f += P.pg(torso);
    o.k += P.c(X(-14), Y(0), X(-18), Y(26), X(-17), Y(50), X(-8), Y(66)) + P.q(X(-8), Y(66), X(0), Y(69), X(8), Y(65)) +
      P.c(X(8), Y(65), X(16), Y(56), X(17), Y(30), X(14), Y(4));
    // head, no face
    o.f += P.el(X(1), Y(86), 11 * s, 13 * s);
    o.k += P.el(X(1), Y(86), 11 * s, 13 * s) + P.ln(X(-3), Y(73), X(-3), Y(67)) + P.ln(X(5), Y(74), X(5), Y(67));
    o.d += P.c(X(-10), Y(88), X(-6), Y(100), X(6), Y(100), X(11), Y(91)) + P.q(X(-10), Y(84), X(-11), Y(76), X(-6), Y(73));
    // thigh and arm toward the table
    o.f += thick([X(-6), Y(4), X(30), Y(4)], 15 * s);
    o.q += P.ln(X(-6), Y(-3), X(32), Y(-3)) + P.ln(X(4), Y(11), X(30), Y(11)) + P.q(X(30), Y(11), X(37), Y(5), X(32), Y(-3));
    var arm = [X(0), Y(56), X(6), Y(30), X(30), Y(24), X(40), Y(25)];
    o.f += thick(arm, 9 * s, 7 * s);
    o.q += thick(arm, 9 * s, 7 * s);
    o.d += P.ln(X(-6), Y(46), X(-2), Y(14)) + P.ln(X(10), Y(48), X(12), Y(40));
  }

  // a bistro chair side on; seat at y, back on the side away from dir
  function bistroChair(o, x, y, dir, s) {
    s = s || 1;
    var X = function (v) { return x + dir * v * s; };
    var back = X(-18), front = X(17), floor = y + 46 * s;
    o.q += P.c(back, floor, back, y + 20 * s, X(-15), y, X(-17), y - 22 * s) + P.c(X(-17), y - 22 * s, X(-19), y - 40 * s, X(-21), y - 46 * s, X(-18), y - 52 * s);
    o.q += P.ln(X(-20), y, front + dir * 2, y) + P.ln(X(-19), y + 3 * s, front + dir * 2, y + 3 * s);
    o.q += P.q(front, y + 3 * s, X(18), y + 26 * s, X(20), floor) + P.q(X(-12), y + 3 * s, X(-12), y + 26 * s, X(-13), floor);
    o.d += P.arc(x, y + 30 * s, 15 * s, 3 * s, 0, 360) + P.c(X(-17), y - 18 * s, X(-12), y - 30 * s, X(-12), y - 44 * s, X(-18), y - 50 * s);
  }

  // a cook, front on, waist up; yt is the top of the head
  function cook(o, x, yt, pose) {
    // body
    var body = [x - 14, yt + 50, x - 44, yt + 64, x - 42, yt + 210, x + 42, yt + 210, x + 44, yt + 64, x + 14, yt + 50];
    o.f += P.pg(body);
    o.k += P.c(x - 14, yt + 51, x - 30, yt + 55, x - 42, yt + 58, x - 45, yt + 70) + P.c(x + 14, yt + 51, x + 30, yt + 55, x + 42, yt + 58, x + 45, yt + 70) +
      P.ln(x - 41, yt + 110, x - 40, yt + 212) + P.ln(x + 41, yt + 110, x + 40, yt + 212);
    // collar and the double-breasted front
    o.q += P.pl([x - 14, yt + 48, x - 13, yt + 58, x + 13, yt + 58, x + 14, yt + 48]) + P.pl([x - 13, yt + 58, x + 22, yt + 92, x + 22, yt + 212]);
    o.d += P.el(x + 4, yt + 92, 2.2) + P.el(x + 4, yt + 118, 2.2) + P.el(x + 4, yt + 144, 2.2) +
      P.el(x + 32, yt + 100, 2.2) + P.el(x + 32, yt + 126, 2.2) + P.el(x + 32, yt + 152, 2.2);
    // apron bib and its strap
    o.q += P.pl([x - 26, yt + 212, x - 26, yt + 150, x + 26, yt + 150, x + 26, yt + 212]);
    o.d += P.ln(x - 26, yt + 150, x - 13, yt + 59) + P.ln(x + 26, yt + 150, x + 13, yt + 59) + P.hl(x - 20, x + 20, yt + 168);
    // head and cap, no face
    o.f += P.el(x, yt + 26, 15, 19);
    o.k += P.arc(x, yt + 26, 15, 19, 160, 380);
    o.q += P.vl(x - 7, yt + 42, yt + 50) + P.vl(x + 7, yt + 42, yt + 50);
    o.f += P.pg([x - 16, yt + 20].concat(P.arcPts(x, yt + 20, 16, 17, 180, 360)).concat([x + 16, yt + 20]));
    o.k += P.arc(x, yt + 20, 16, 17, 180, 360) + P.q(x - 16, yt + 20, x, yt + 25, x + 16, yt + 20);
    o.d += P.q(x - 15, yt + 14, x, yt + 18, x + 15, yt + 14) + P.arc(x - 15, yt + 30, 3, 5, 90, 270) + P.arc(x + 15, yt + 30, 3, 5, -90, 90);
    // arms
    var A, B;
    if (pose === 'pan') {
      A = [x - 42, yt + 70, x - 54, yt + 130, x - 36, yt + 182];
      B = [x + 42, yt + 70, x + 70, yt + 126, x + 104, yt + 140];
    } else if (pose === 'plate') {
      A = [x - 42, yt + 70, x - 50, yt + 140, x - 22, yt + 186];
      B = [x + 42, yt + 70, x + 52, yt + 140, x + 26, yt + 182];
    } else {
      A = [x - 40, yt + 72, x - 50, yt + 136, x - 40, yt + 198];
      B = [x + 40, yt + 72, x + 50, yt + 136, x + 40, yt + 198];
    }
    [A, B].forEach(function (pts) {
      o.f += thick(pts, 17, 12);
      o.k += thick(pts, 17, 12);
      var cx = pts[2], cy = pts[3];
      o.d += P.ln(cx - 8, cy + 8, cx + 8, cy + 2);
    });
  }

  // a person seen from behind, seated on a chair whose seat is at y
  function backSitter(o, x, y, s) {
    s = s || 1;
    var body = [x - 30 * s, y, x - 33 * s, y - 50 * s, x - 26 * s, y - 72 * s, x - 10 * s, y - 80 * s, x + 10 * s, y - 80 * s, x + 26 * s, y - 72 * s, x + 33 * s, y - 50 * s, x + 30 * s, y];
    o.f += P.pg(body);
    o.k += P.c(x - 30 * s, y, x - 34 * s, y - 40 * s, x - 32 * s, y - 66 * s, x - 10 * s, y - 80 * s) + P.c(x + 30 * s, y, x + 34 * s, y - 40 * s, x + 32 * s, y - 66 * s, x + 10 * s, y - 80 * s);
    o.d += P.c(x - 2 * s, y - 76 * s, x - 3 * s, y - 50 * s, x + 2 * s, y - 30 * s, x, y - 4 * s) + P.ln(x - 24 * s, y - 60 * s, x - 22 * s, y - 20 * s);
    o.f += P.el(x, y - 96 * s, 13 * s, 16 * s);
    o.k += P.el(x, y - 96 * s, 13 * s, 16 * s);
    o.d += P.q(x - 12 * s, y - 92 * s, x, y - 86 * s, x + 12 * s, y - 92 * s) + P.q(x - 8 * s, y - 108 * s, x - 2 * s, y - 98 * s, x - 6 * s, y - 86 * s);
  }
  function chairBack(o, x, y, s) {
    s = s || 1;
    var floor = y + 104 * s, X = function (v) { return x + v * s; }, Y = function (v) { return y + v * s; };
    o.q += P.el(x, y, 25 * s, 4.5 * s) + P.arc(x, Y(3), 25 * s, 4.5 * s, 0, 180);
    o.q += P.c(X(-17), y, X(-22), Y(-24), X(-20), Y(-52), x, Y(-56)) + P.c(X(17), y, X(22), Y(-24), X(20), Y(-52), x, Y(-56));
    o.d += P.c(X(-11), y, X(-15), Y(-22), X(-13), Y(-44), x, Y(-47)) + P.c(X(11), y, X(15), Y(-22), X(13), Y(-44), x, Y(-47));
    o.q += P.q(X(-21), Y(6), X(-24), Y(50), X(-28), floor) + P.q(X(21), Y(6), X(24), Y(50), X(28), floor);
    o.d += P.q(X(-9), Y(7), X(-10), Y(50), X(-12), floor - 6 * s) + P.q(X(9), Y(7), X(10), Y(50), X(12), floor - 6 * s) + P.arc(x, Y(62), 24 * s, 4.5 * s, 0, 360);
  }

  // a wall clock; h and m in hours and minutes
  function clock(o, cx, cy, r, h, m, handsSeparate) {
    o.f += P.el(cx, cy, r);
    o.k += P.el(cx, cy, r);
    o.q += P.el(cx, cy, r - 4);
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6;
      o.d += P.ln(cx + Math.cos(a) * (r - 7), cy + Math.sin(a) * (r - 7), cx + Math.cos(a) * (r - (i % 3 ? 10 : 13)), cy + Math.sin(a) * (r - (i % 3 ? 10 : 13)));
    }
    if (!handsSeparate) o.k += clockHands(cx, cy, r, h, m);
  }
  function clockHands(cx, cy, r, h, m) {
    var ha = ((h % 12) + m / 60) / 12 * 360 - 90, ma = m / 60 * 360 - 90;
    var hr = ha * Math.PI / 180, mr = ma * Math.PI / 180;
    return P.ln(cx, cy, cx + Math.cos(hr) * r * 0.5, cy + Math.sin(hr) * r * 0.5) + P.ln(cx, cy, cx + Math.cos(mr) * r * 0.75, cy + Math.sin(mr) * r * 0.75);
  }

  // rising steam; lives in the actor layer
  function steam(x, y, h, k, cls) {
    var s = '';
    for (var i = 0; i < k; i++) {
      var xx = x + (i - (k - 1) / 2) * 13;
      s += '<path class="steam ' + (cls || '') + '" style="--i:' + i + '" d="' + P.wave(xx, y, h, 4 + (i % 2) * 2, 1.4 + (i % 3) * 0.3, true) + '"/>';
    }
    return '<g class="steam-g">' + s + '</g>';
  }
  function flame(x, y, s) {
    s = s || 1;
    return '<path class="flame" d="' + P.c(x - 3 * s, y, x - 4 * s, y - 5 * s, x - 1 * s, y - 7 * s, x, y - 12 * s) + P.c(x, y - 12 * s, x + 2 * s, y - 7 * s, x + 4 * s, y - 5 * s, x + 3 * s, y) + '"/>';
  }

  /* ================================================================== */
  /* 1. The street front. The lights come on as the page loads.           */
  function street() {
    var D = new Drawing(1000, 800), o, i, x, y;

    // brick, everywhere; openings hide it
    o = D.o();
    o.x = P.bricks(0, 0, 1000, 712, 30, 10);

    // upper storey windows
    [[96, 0], [330, 1], [598, 2], [832, 3]].forEach(function (a) {
      var wx = a[0], k = a[1], wy = 66, w = 96, h = 132;
      var s = D.o();
      s.f = P.rc(wx - 10, wy - 16, w + 20, h + 30);
      s.q = P.rco(wx - 10, wy - 16, w + 20, 12, 2) + P.rc(wx - 10, wy + h, w + 20, 8) + P.hl(wx - 12, wx + w + 12, wy + h + 10);
      s.d = P.pg([wx + w / 2 - 8, wy - 16, wx + w / 2 + 8, wy - 16, wx + w / 2 + 6, wy - 4, wx + w / 2 - 6, wy - 4]);
      s.k = P.rc(wx, wy, w, h);
      s.q += P.rc(wx + 5, wy + 5, w - 10, h / 2 - 5) + P.rc(wx + 5, wy + h / 2, w - 10, h / 2 - 5) + P.hl(wx + 5, wx + w - 5, wy + h / 2 + 3);
      for (i = 1; i < 3; i++) {
        s.d += P.vl(wx + 5 + (w - 10) * i / 3, wy + 5, wy + h / 2) + P.vl(wx + 5 + (w - 10) * i / 3, wy + h / 2 + 3, wy + h - 5);
      }
      s.d += P.hl(wx + 5, wx + w - 5, wy + 5 + (h / 2 - 5) / 2) + P.hl(wx + 5, wx + w - 5, wy + h / 2 + 3 + (h / 2 - 8) / 2);
      if (k === 1 || k === 3) {
        s.d += P.c(wx + 8, wy + 8, wx + 30, wy + 40, wx + 14, wy + 90, wx + 22, wy + h - 8) + P.c(wx + w - 8, wy + 8, wx + w - 30, wy + 40, wx + w - 14, wy + 90, wx + w - 22, wy + h - 8);
      }
      if (k === 2) {
        var b = D.o();
        b.f = P.rc(wx - 6, wy + h + 10, w + 12, 20);
        b.q = P.rc(wx - 6, wy + h + 10, w + 12, 20);
        b.d = P.hl(wx - 6, wx + w + 6, wy + h + 20);
        for (i = 0; i < 9; i++) {
          x = wx + 2 + i * 11;
          b.d += P.c(x, wy + h + 10, x - 4, wy + h + 2, x + 3, wy + h - 6, x + 6, wy + h - 2) + P.c(x + 4, wy + h + 30, x + 2, wy + h + 40, x - 2, wy + h + 44 + (i % 3) * 6, x + 1, wy + h + 50 + (i % 3) * 6);
        }
      }
    });

    // the cornice between the storeys
    o = D.o();
    o.f = P.rc(0, 220, 1000, 28);
    o.k = P.hl(0, 1000, 220) + P.hl(0, 1000, 247);
    o.q = P.hl(0, 1000, 226) + P.hl(0, 1000, 238);
    for (x = 3; x < 1000; x += 14) o.d += P.rc(x, 226, 7, 7);
    o.d += P.hl(0, 1000, 242);

    // the blade sign, on a bracket with a gooseneck lamp
    o = D.o();
    o.q = P.rc(238, 282, 8, 34) + P.hl(132, 238, 290) + P.hl(132, 238, 294);
    o.d = P.c(238, 312, 214, 312, 200, 300, 196, 294) + P.arc(204, 300, 6, 6, 0, 300) + P.arc(150, 288, 4, 4, 0, 360);
    for (i = 0; i < 3; i++) { o.d += P.el(146, 298 + i * 5, 2, 3) + P.el(222, 298 + i * 5, 2, 3); }
    o.q += P.q(244, 270, 240, 250, 200, 254) + P.pg([188, 252, 204, 252, 210, 262, 182, 262]);
    o = D.o();
    o.f = P.rr(136, 312, 96, 66, 9);
    o.k = P.rr(136, 312, 96, 66, 9);
    o.q = P.rr(142, 318, 84, 54, 6);
    o.k += P.arc(184, 344, 22, 13, 0, 180) + P.hl(160, 208, 344);
    o.q += P.hl(176, 192, 358);
    o.d = P.wave(176, 338, 14, 2, 1.2, true) + P.wave(184, 336, 17, 2, 1.4, true) + P.wave(192, 338, 14, 2, 1.2, true);

    // the menu case on the left pier, with a picture light
    o = D.o();
    o.f = P.rc(148, 426, 72, 92);
    o.k = P.rc(148, 426, 72, 92);
    o.q = P.rc(154, 432, 60, 80) + P.rc(170, 412, 28, 5) + P.ln(184, 412, 184, 420);
    o.d = P.hl(162, 206, 444);
    for (i = 0; i < 9; i++) { o.d += P.hl(162, 162 + 20 + ((i * 7) % 22), 456 + i * 6) + P.hl(196, 206, 456 + i * 6); }

    // the planter with a clipped box ball
    o = D.o();
    var R = T.rng(4);
    o.f = P.el(176, 612, 46, 44);
    o.q = P.el(176, 612, 46, 44);
    for (i = 0; i < 70; i++) {
      var a = R() * Math.PI * 2, rr = Math.sqrt(R()) * 40;
      x = 176 + Math.cos(a) * rr; y = 612 + Math.sin(a) * rr * 0.95;
      o.d += P.arc(x, y, 3, 2, 200 + R() * 60, 330 + R() * 60);
    }
    o = D.o();
    o.f = P.pg([128, 648, 224, 648, 218, 712, 134, 712]);
    o.k = P.pg([128, 648, 224, 648, 218, 712, 134, 712]) + P.hl(124, 228, 648) + P.hl(124, 228, 655);
    for (x = 140; x < 216; x += 12) o.d += P.vl(x, 656, 711);

    // the door: casing, fanlight transom, two leaves
    o = D.o();
    o.f = P.rc(250, 262, 176, 450);
    o.k = P.rco(250, 262, 176, 450, 3) + P.rc(262, 274, 152, 438);
    o.q = P.pg([330, 262, 346, 262, 344, 276, 332, 276]) + P.hl(262, 414, 326) + P.hl(262, 414, 330);
    o.q += P.arc(338, 326, 64, 46, 180, 360);
    o.d = P.arc(338, 326, 54, 38, 180, 360) + P.arc(338, 326, 14, 10, 180, 360);
    for (i = 1; i < 8; i++) {
      var aa = Math.PI + Math.PI * i / 8;
      o.d += P.ln(338 + Math.cos(aa) * 14, 326 + Math.sin(aa) * 10, 338 + Math.cos(aa) * 64, 326 + Math.sin(aa) * 46);
    }
    [262, 338].forEach(function (lx, k) {
      var gx = lx + 11, gw = 54;
      o.q += P.rc(gx, 342, gw, 214) + P.rc(gx, 590, gw, 96) + P.hl(lx, lx + 76, 566) + P.hl(lx, lx + 76, 580);
      o.d += P.rc(gx + 7, 597, gw - 14, 82) + P.ln(gx, 590, gx + 7, 597) + P.ln(gx + gw, 590, gx + gw - 7, 597) + P.ln(gx, 686, gx + 7, 679) + P.ln(gx + gw, 686, gx + gw - 7, 679);
      o.d += P.ln(gx + 10, 420, gx + 34, 372) + P.ln(gx + 18, 432, gx + 44, 380);
      var px = k ? lx + 12 : lx + 64;
      o.k += P.vl(px, 440, 522) + P.vl(px + (k ? 3 : -3), 440, 522);
      o.d += P.hl(px - 2, px + 5, 446) + P.hl(px - 5, px + 2, 516);
    });
    o.k += P.vl(338, 274, 712);
    // inside, through the glass: the host stand and a warm far wall
    o.d += P.rc(296, 470, 30, 86) + P.hl(292, 330, 470) + P.hl(350, 406, 520) + P.vl(380, 342, 520);
    // the step
    o = D.o();
    o.f = P.rc(236, 712, 204, 12);
    o.k = P.rco(236, 712, 204, 12, 2);

    // two lanterns either side of the door
    [226, 450].forEach(function (lx, k) {
      var s = D.o(), d = k ? 1 : -1;
      s.q = P.rc(lx - 4 - d * 8, 396, 8, 26) + P.q(lx - d * 8, 406, lx - d * 2, 404, lx, 398);
      s.f = P.pg([lx - 10, 400, lx + 10, 400, lx + 8, 432, lx - 8, 432]);
      s.k = P.pg([lx - 10, 400, lx + 10, 400, lx + 8, 432, lx - 8, 432]) + P.pg([lx - 13, 400, lx, 388, lx + 13, 400]);
      s.q += P.vl(lx, 400, 432) + P.hl(lx - 9, lx + 9, 412) + P.pg([lx - 6, 432, lx + 6, 432, lx, 440]) + P.vl(lx, 382, 388);
      s.d = P.el(lx, 418, 2.5, 5);
    });

    // the shop window: what's inside first, then the frame
    o = D.o();
    o.f = P.rc(486, 350, 480, 290);
    // back wall, shelf and bottles at the far right
    o.d = P.hl(494, 958, 540) + P.hl(860, 958, 470) + P.hl(860, 958, 474);
    var br = T.rng(9);
    for (x = 866; x < 952; x += 10 + (br() * 4 | 0)) {
      var bh = 22 + br() * 14;
      o.d += P.pl([x, 470, x, 470 - bh * 0.6, x + 2, 470 - bh * 0.75, x + 2, 470 - bh, x + 5, 470 - bh, x + 5, 470 - bh * 0.75, x + 7, 470 - bh * 0.6, x + 7, 470]);
    }
    // a plant in the far left corner
    for (i = 0; i < 9; i++) {
      x = 512 + (i % 3) * 6; y = 520 - i * 13;
      o.d += P.q(510, 540, x - 4, y + 10, x + (i % 2 ? 16 : -10), y);
    }
    // pendant lamps
    [604, 858].forEach(function (px) {
      var s = D.o();
      s.q = P.vl(px, 358, 432);
      s.f = P.pg([px - 4, 432].concat(P.arcPts(px, 452, 24, 20, 180, 360)).concat([px + 24, 452, px - 24, 452]));
      s.k = P.arc(px, 452, 24, 20, 180, 360) + P.hl(px - 25, px + 25, 452) + P.rc(px - 4, 428, 8, 6);
      s.d = P.arc(px, 452, 10, 4, 0, 180);
    });
    // the window tables: cloth, a candle, glasses, plates
    [[602, 1], [856, 0]].forEach(function (a) {
      var cx = a[0], s;
      if (a[0] === 856) {
        s = D.o();
        bistroChair(s, cx - 66, 588, 1);
        s = D.o();
        bistroChair(s, cx + 66, 588, -1);
        s = D.o();
        sitter(s, cx + 60, 586, -1, 0.95);
      } else {
        s = D.o();
        bistroChair(s, cx + 66, 588, -1);
        s = D.o();
        sitter(s, cx + 60, 586, -1, 0.95);
      }
      s = D.o();
      s.f = P.pg([cx - 58, 560, cx + 58, 560, cx + 62, 604, cx - 62, 604]);
      s.k = P.hl(cx - 60, cx + 60, 560);
      s.q = P.pl([cx - 58, 561, cx - 62, 604]) + P.pl([cx + 58, 561, cx + 62, 604]) + P.q(cx - 62, 604, cx, 608, cx + 62, 604);
      s.d = P.q(cx - 30, 566, cx - 33, 586, cx - 36, 605) + P.q(cx + 18, 566, cx + 20, 586, cx + 22, 606) + P.vl(cx, 608, 632);
      candle(s, cx - 2, 559);
      wineGlass(s, cx + 30, 559, 0.8);
      wineGlass(s, cx - 34, 559, 0.8);
      plateSide(s, cx - 18, 559, 26);
      plateSide(s, cx + 14, 559, 22);
    });
    // the frame, transom and mullion
    o = D.o();
    o.k = P.rco(486, 350, 480, 290, 3) + P.rc(494, 358, 464, 274);
    o.q = P.hl(494, 958, 404) + P.hl(494, 958, 410) + P.vl(722, 410, 632) + P.vl(730, 410, 632);
    for (i = 1; i < 8; i++) o.q += P.vl(494 + 58 * i, 358, 404);
    o.d = '';
    [[500, 420], [740, 420]].forEach(function (g) {
      o.d += P.ln(g[0] + 10, g[1] + 120, g[0] + 70, g[1] + 10) + P.ln(g[0] + 26, g[1] + 126, g[0] + 84, g[1] + 20) + P.ln(g[0] + 170, g[1] + 200, g[0] + 210, g[1] + 130);
    });
    // sill and the panelled stall riser
    o = D.o();
    o.f = P.rc(478, 640, 496, 72);
    o.k = P.rco(478, 640, 496, 10, 3) + P.hl(486, 966, 712) + P.vl(486, 650, 712) + P.vl(966, 650, 712);
    o.q = P.rc(498, 660, 218, 40) + P.rc(736, 660, 218, 40);
    o.d = P.rc(506, 667, 202, 26) + P.rc(744, 667, 202, 26);

    // the awning over the window
    o = D.o();
    var aw = [470, 266, 982, 266, 994, 322, 458, 322];
    o.f = P.pg(aw.concat([])) + P.rc(458, 322, 536, 18);
    o.k = P.pg(aw) + P.hl(458, 994, 340);
    o.q = '';
    var sc = '';
    for (x = 458; x < 994; x += 24) sc += P.arc(x + 12, 334, 12, 8, 0, 180);
    o.q += sc + P.hl(458, 994, 326);
    for (i = 0; i <= 16; i++) {
      var t = i / 16, xt = 470 + 512 * t, xb = 458 + 536 * t;
      o.q += P.ln(xt, 266, xb, 322);
      if (i < 16 && i % 2 === 0) {
        var t2 = (i + 1) / 16, xt2 = 470 + 512 * t2, xb2 = 458 + 536 * t2;
        for (var h = 1; h < 5; h++) {
          var f = h / 5;
          o.d += P.ln(xt + (xt2 - xt) * f, 267, xb + (xb2 - xb) * f, 321);
        }
      }
    }
    o.q += P.ln(472, 300, 462, 322) + P.ln(980, 300, 990, 322);

    // the chalkboard on the pavement
    o = D.o();
    o.f = P.pg([768, 606, 828, 606, 838, 722, 758, 722]);
    o.k = P.pg([768, 606, 828, 606, 838, 722, 758, 722]);
    o.q = P.pg([774, 614, 822, 614, 829, 708, 767, 708]) + P.rc(790, 600, 16, 6);
    o.d = P.wave(780, 632, 34, 1.6, 2.5) + P.wave(778, 646, 40, 1.4, 3) + P.wave(782, 660, 30, 1.6, 2) + P.wave(776, 682, 44, 1.2, 3.5) + P.wave(780, 694, 36, 1.4, 2.5);
    o.d += P.el(798, 668, 5, 3);

    // a bicycle at the kerb
    o = D.o();
    [[874, 690], [958, 690]].forEach(function (w) {
      o.k += P.el(w[0], w[1], 27);
      o.q += P.el(w[0], w[1], 24);
      for (i = 0; i < 12; i++) {
        var sa = i * Math.PI / 6;
        o.d += P.ln(w[0] + Math.cos(sa) * 2, w[1] + Math.sin(sa) * 2, w[0] + Math.cos(sa + 0.5) * 23, w[1] + Math.sin(sa + 0.5) * 23);
      }
      o.q += P.el(w[0], w[1], 3);
    });
    o.k += P.pl([874, 690, 904, 650, 944, 650, 916, 690, 874, 690]) + P.ln(916, 690, 900, 640) + P.ln(958, 690, 942, 636);
    o.q += P.pl([892, 638, 908, 638]) + P.q(942, 636, 940, 626, 930, 624) + P.ln(942, 636, 950, 630) + P.el(916, 690, 6);
    o.d += P.ln(916, 690, 926, 700) + P.ln(874, 690, 900, 640);

    // the pavement and the curb
    o = D.o();
    o.k = P.hl(0, 1000, 712);
    o.q = P.hl(0, 1000, 768) + P.hl(0, 1000, 778);
    for (x = 40; x < 1000; x += 92) o.d += P.ln(x, 712, x - 10, 768);
    for (x = 20; x < 1000; x += 46) o.d += P.ln(x, 768, x - 1, 778);
    o.d += P.hl(0, 1000, 740);

    // light
    D.wash(206, 268, 70, 60, 0.75, { cls: 'on', d: 0.35 });
    D.wash(184, 345, 90, 70, 0.6, { cls: 'on', d: 0.35 });
    D.wash(184, 470, 80, 90, 0.7, { cls: 'on', d: 0.55 });
    D.wash(226, 416, 70, 80, 1, { cls: 'on', d: 0.8 });
    D.wash(450, 416, 70, 80, 1, { cls: 'on', d: 1.05 });
    D.wash(338, 470, 90, 170, 0.55, { cls: 'on', d: 1.25 });
    D.wash(726, 490, 270, 170, 0.55, { cls: 'on', d: 1.5 });
    D.wash(604, 458, 70, 50, 1, { cls: 'on', d: 1.4 });
    D.wash(604, 560, 120, 70, 0.85, { cls: 'on', d: 1.5 });
    D.wash(858, 458, 70, 50, 1, { cls: 'on', d: 1.75 });
    D.wash(858, 560, 120, 70, 0.85, { cls: 'on', d: 1.85 });
    D.wash(600, 548, 26, 26, 0.9, { cls: 'on candle', d: 2.7 });
    D.wash(854, 548, 26, 26, 0.9, { cls: 'on candle', d: 2.4 });
    D.wash(726, 740, 300, 44, 0.5, { cls: 'on', d: 1.9 });

    // the guest who comes in and sits down at the near table
    var g = '';
    var gs = { f: '', k: '', q: '', d: '' };
    sitter(gs, 542, 586, 1, 0.95);
    var gc = { f: '', k: '', q: '', d: '' };
    bistroChair(gc, 536, 588, 1);
    g += '<g class="guest-chair">' + piece(gc) + '</g><g class="guest">' + piece(gs) + '</g>';
    D.actors = '<g clip-path="url(#st-clip-a)">' + g + '</g>';
    D.actorDefs = '<clipPath id="st-clip-a"><path d="M494 358H722V560H544V632H494Z"/></clipPath>';
    return D;
  }

  // the parts of an object as markup, for the actor layer
  function piece(o) {
    var s = '';
    if (o.f) s += '<path class="f" d="' + o.f + '"/>';
    if (o.d) s += '<path class="d" d="' + o.d + '"/>';
    if (o.q) s += '<path class="q" d="' + o.q + '"/>';
    if (o.k) s += '<path class="k" d="' + o.k + '"/>';
    if (o.t) s += o.t;
    return s;
  }
  function blank() { return { f: '', k: '', q: '', d: '', t: '' }; }

  /* ================================================================== */
  /* 2. The prep table, before prep. The counts are pencilled onto the    */
  /*    sheet on the wall.                                                */
  var PY = 214, PSTEP = 30;
  var PREP = [['Short rib', 27], ['Risotto', 33], ['Burrata', 19], ['Roast chicken', 24], ['Focaccia', 12], ['Panna cotta', 16]];

  function prep() {
    var D = new Drawing(1000, 720), o, i, x, y;

    // tiled wall
    o = D.o();
    o.x = P.tiles(0, 96, 1000, 374, 44, 22, true);
    o.q = P.hl(0, 1000, 90) + P.hl(0, 1000, 96);

    // the clock: ten to seven
    o = D.o();
    clock(o, 860, 44, 30, 6, 50);

    // wall shelf on brackets
    o = D.o();
    o.f = P.rc(36, 194, 408, 9);
    o.k = P.rco(36, 194, 408, 9, 2);
    o.q = P.pl([70, 203, 70, 236, 104, 203]) + P.pl([410, 203, 410, 236, 376, 203]);
    // deli containers, stacked
    [56, 98, 140].forEach(function (cx, k) {
      var n = k === 1 ? 4 : 3;
      for (var j = 0; j < n; j++) {
        var s = D.o(), yb = 194 - j * 24;
        s.f = P.pg([cx, yb, cx + 34, yb, cx + 36, yb - 24, cx - 2, yb - 24]);
        s.q = P.pg([cx, yb, cx + 34, yb, cx + 36, yb - 24, cx - 2, yb - 24]);
        s.d = P.hl(cx - 2, cx + 36, yb - 20);
        if (j === n - 1) { s.q += P.rc(cx - 3, yb - 28, 40, 4); }
      }
    });
    // a round container with a lid and a tape label
    o = D.o();
    o.f = P.pg([190, 194, 246, 194, 250, 126, 186, 126]) + P.rc(184, 118, 68, 9);
    o.q = P.pg([190, 194, 246, 194, 250, 126, 186, 126]) + P.rc(184, 118, 68, 9);
    o.d = P.rc(200, 146, 36, 12);
    for (i = 0; i < 6; i++) o.d += P.hl(190, 196, 136 + i * 9);
    // spice jars
    for (i = 0; i < 5; i++) {
      x = 268 + i * 22;
      o = D.o();
      o.f = P.rr(x, 160, 18, 34, 3) + P.rc(x + 1, 154, 16, 7);
      o.q = P.rr(x, 160, 18, 34, 3) + P.rc(x + 1, 154, 16, 7);
      o.d = P.rc(x + 3, 172, 12, 12);
    }
    // a stack of bowls
    o = D.o();
    for (i = 0; i < 4; i++) {
      o.f += P.pg([388, 194 - i * 7, 432, 194 - i * 7, 440, 184 - i * 7, 380, 184 - i * 7]);
      o.q += P.pl([380, 184 - i * 7, 388, 194 - i * 7, 432, 194 - i * 7, 440, 184 - i * 7]) + P.hl(378, 442, 184 - i * 7);
    }

    // the magnetic strip and its knives
    o = D.o();
    o.f = P.rc(84, 280, 252, 10);
    o.k = P.rc(84, 280, 252, 10);
    [[104, 'chef'], [148, 'pare'], [188, 'bread'], [236, 'slice'], [290, 'cleaver']].forEach(function (a) {
      var kx = a[0], kind = a[1], s = D.o();
      var len = kind === 'pare' ? 30 : kind === 'cleaver' ? 34 : 54, bw = kind === 'cleaver' ? 30 : kind === 'pare' ? 8 : kind === 'chef' ? 14 : 10;
      var top = 284 - len + 10;
      s.f = P.pg([kx, 294, kx + bw, 294, kx + bw, top + 8, kx + (kind === 'cleaver' ? bw : 2), top]) + P.rr(kx + bw / 2 - 5, 294, 10, 40, 4);
      s.q = P.pg([kx, 294, kx + bw, 294, kx + bw, top + 8, kx + (kind === 'cleaver' ? bw : 2), top]);
      s.k = P.rr(kx + bw / 2 - 5, 294, 10, 40, 4);
      s.d = P.el(kx + bw / 2, 304, 1.4) + P.el(kx + bw / 2, 324, 1.4);
      if (kind === 'bread') for (i = 0; i < 8; i++) s.d += P.ln(kx, top + 10 + i * 5, kx + 2, top + 12 + i * 5);
      if (kind === 'cleaver') s.d += P.el(kx + bw - 7, top + 7, 2.6);
    });

    // the prep sheet on its clipboard
    o = D.o();
    o.f = P.rr(450, 118, 232, 290, 6);
    o.k = P.rr(450, 118, 232, 290, 6);
    o.d = P.rr(453, 121, 226, 284, 5);
    o = D.o();
    o.f = P.rc(462, 136, 208, 262);
    o.q = P.rc(462, 136, 208, 262) + P.pl([462, 398, 466, 401, 674, 400, 670, 398]);
    o.t = tx(478, 174, 'Prep', 'tx-h') + tx(654, 173, 'Friday', 'tx-u', ' text-anchor="end"');
    o.k = P.hl(478, 654, 184);
    for (i = 0; i < PREP.length; i++) {
      y = PY + i * PSTEP;
      o.t += tx(478, y, PREP[i][0], 'tx-s');
      o.d += P.hl(478, 654, y + 10);
    }
    o.d += P.vl(612, 194, PY + 5 * PSTEP + 10);
    o = D.o();
    o.f = P.rr(528, 108, 76, 22, 4);
    o.k = P.rr(528, 108, 76, 22, 4);
    o.q = P.el(566, 110, 10, 6) + P.hl(536, 596, 122);
    // the pencil on a string
    o = D.o();
    o.d = P.c(600, 120, 704, 140, 704, 260, 694, 300);
    o.f = thick([688, 300, 700, 376], 7);
    o.q = thick([688, 300, 700, 376], 7) + P.pl([697, 374, 701, 388, 703, 375]);

    // the hanging rail: ladle, whisk, spider, tongs
    o = D.o();
    o.k = P.hl(718, 990, 128) + P.hl(718, 990, 132);
    o.q = P.rc(720, 122, 6, 16) + P.rc(982, 122, 6, 16);
    [[748, 'ladle'], [800, 'whisk'], [858, 'spider'], [916, 'tongs'], [960, 'ladle']].forEach(function (a) {
      var hx = a[0], kind = a[1], s = D.o();
      s.q = P.arc(hx, 138, 4, 5, 180, 450);
      if (kind === 'ladle') {
        s.q += P.ln(hx, 143, hx, 214);
        s.f = P.pg([hx - 16, 214].concat(P.arcPts(hx, 214, 16, 14, 0, 180)));
        s.k = P.arc(hx, 214, 16, 14, 0, 180) + P.hl(hx - 17, hx + 17, 214);
      } else if (kind === 'whisk') {
        s.f = P.rr(hx - 4, 143, 8, 34, 3);
        s.k = P.rr(hx - 4, 143, 8, 34, 3);
        for (i = -3; i <= 3; i++) s.d += P.c(hx - 2 + i * 0.5, 177, hx + i * 5, 200, hx + i * 6, 220, hx, 232);
        s.q += P.c(hx - 3, 177, hx - 18, 205, hx - 14, 228, hx, 232) + P.c(hx + 3, 177, hx + 18, 205, hx + 14, 228, hx, 232);
      } else if (kind === 'spider') {
        s.q += P.ln(hx, 143, hx, 190);
        s.f = P.el(hx, 212, 22);
        s.k = P.el(hx, 212, 22);
        for (i = -3; i <= 3; i++) s.d += P.ln(hx + i * 6, 212 - Math.sqrt(484 - i * i * 36), hx + i * 6, 212 + Math.sqrt(484 - i * i * 36)) + P.ln(hx - Math.sqrt(484 - i * i * 36), 212 + i * 6, hx + Math.sqrt(484 - i * i * 36), 212 + i * 6);
      } else {
        s.q += P.pl([hx - 2, 143, hx - 8, 230, hx - 10, 236]) + P.pl([hx + 2, 143, hx + 8, 230, hx + 10, 236]);
        s.d = P.ln(hx - 8, 228, hx - 4, 232) + P.ln(hx + 8, 228, hx + 4, 232);
      }
    });

    // the work lamp, low over the sheet
    o = D.o();
    o.q = P.vl(566, 0, 50);
    o.f = P.pg([552, 50, 580, 50, 610, 92, 522, 92]);
    o.k = P.pg([552, 50, 580, 50, 610, 92, 522, 92]) + P.rc(558, 42, 16, 8);
    o.d = P.arc(566, 92, 14, 4, 0, 180) + P.ln(560, 54, 540, 88) + P.ln(572, 54, 592, 88);

    // the worktable: backsplash, top, legs, undershelf
    o = D.o();
    o.f = P.rc(30, 452, 744, 18);
    o.q = P.rc(30, 452, 744, 18);
    // things on the table
    // cutting board
    o = D.o();
    o.f = P.rc(58, 456, 276, 14);
    o.k = P.rco(58, 456, 276, 14, 2);
    o.d = P.hl(64, 328, 460);
    // a heap of diced onion
    var r2 = T.rng(21);
    o = D.o();
    o.f = P.pg([74, 456, 82, 444, 98, 436, 118, 434, 138, 440, 150, 456]);
    o.q = P.c(74, 456, 82, 440, 98, 434, 118, 433) + P.c(118, 433, 136, 434, 148, 446, 152, 456);
    for (i = 0; i < 34; i++) {
      x = 84 + r2() * 58; y = 440 + r2() * 14;
      o.d += P.rc(x, y, 3.4, 3.4);
    }
    // half an onion
    o = D.o();
    o.f = P.pg([160, 456].concat(P.arcPts(182, 456, 22, 20, 180, 360)));
    o.k = P.arc(182, 456, 22, 20, 180, 360) + P.hl(160, 204, 456);
    o.d = P.arc(182, 456, 16, 14, 180, 360) + P.arc(182, 456, 10, 8, 180, 360) + P.arc(182, 456, 4, 3, 180, 360);
    // chef's knife lying on the board
    o = D.o();
    o.f = P.pg([212, 456, 292, 456, 292, 444, 238, 446]) + P.rr(292, 448, 38, 8, 3);
    o.k = P.pg([212, 456, 292, 456, 292, 444, 238, 446]) + P.rr(292, 448, 38, 8, 3);
    o.d = P.el(304, 452, 1.4) + P.el(318, 452, 1.4) + P.ln(220, 454, 288, 452);
    // the scale with a bowl of herbs
    o = D.o();
    o.f = P.rc(350, 452, 90, 18) + P.rc(356, 444, 78, 8);
    o.k = P.rco(350, 452, 90, 18, 2) + P.rc(356, 444, 78, 8);
    o.d = P.rc(362, 456, 30, 9) + P.el(420, 461, 3) + P.hl(366, 386, 461);
    var hb = T.rng(5);
    o = D.o();
    for (i = 0; i < 14; i++) {
      x = 372 + hb() * 46; var ly = 406 - hb() * 18;
      o.d += P.q(x, 418, x + (hb() - 0.5) * 10, ly + 10, x + (hb() - 0.5) * 16, ly) + P.el(x + (hb() - 0.5) * 16, ly - 3, 3, 4.5);
    }
    o.f = P.pg([360, 412].concat(P.arcPts(395, 412, 35, 32, 0, 180).reverse().slice(0))) ;
    o.f = P.pg([360, 412, 430, 412].concat(P.arcPts(395, 412, 35, 32, 0, 180)));
    o.k = P.arc(395, 412, 35, 32, 0, 180) + P.hl(358, 432, 412);
    o.q = P.arc(395, 412, 35, 4, 0, 180);
    // deli containers with tape labels
    for (i = 0; i < 3; i++) {
      o = D.o();
      y = 470 - i * 28;
      o.f = P.pg([458, y, 498, y, 500, y - 28, 456, y - 28]);
      o.q = P.pg([458, y, 498, y, 500, y - 28, 456, y - 28]);
      o.d = P.rc(464, y - 20, 28, 9) + P.wave(467, y - 15.5, 20, 1, 2);
    }
    o.q += P.rc(453, 382, 50, 4);
    // a mixing bowl with a whisk leaning in
    o = D.o();
    o.q = P.ln(652, 396, 628, 424) + P.ln(646, 394, 622, 422);
    o.d = P.c(626, 422, 606, 440, 632, 454, 646, 440);
    o.f = P.pg([530, 412, 650, 412].concat(P.arcPts(590, 412, 60, 58, 0, 180)));
    o.k = P.arc(590, 412, 60, 58, 0, 180) + P.hl(526, 654, 412);
    o.q += P.arc(590, 412, 62, 5, 180, 360) + P.arc(590, 412, 62, 5, 0, 180);
    o.d += P.arc(590, 412, 44, 42, 40, 80);
    // stacked hotel pans
    o = D.o();
    for (i = 0; i < 4; i++) {
      y = 470 - i * 12;
      o.f += P.rc(672, y - 12, 92, 12);
      o.q += P.pl([674, y - 8, 678, y, 758, y, 762, y - 8]) + P.hl(668, 766, y - 9) + P.hl(668, 766, y - 12);
    }

    // the table top, front edge and legs
    o = D.o();
    o.f = P.rc(26, 470, 752, 16);
    o.k = P.rco(26, 470, 752, 16, 3);
    o.q = P.hl(26, 778, 476);
    o.d = P.hl(30, 774, 482);
    [44, 396, 748].forEach(function (lx) {
      var s = D.o();
      s.f = P.rc(lx, 486, 12, 214);
      s.k = P.rc(lx, 486, 12, 214);
      s.q = P.rc(lx - 3, 698, 18, 8);
    });
    // undershelf and what's on it
    o = D.o();
    o.f = P.rc(36, 622, 732, 10);
    o.k = P.rc(36, 622, 732, 10);
    // flour sack
    o = D.o();
    o.f = P.pg([64, 622, 60, 560, 70, 532, 140, 532, 150, 560, 148, 622]);
    o.k = P.c(64, 622, 56, 590, 60, 552, 72, 532) + P.hl(72, 138, 532) + P.c(138, 532, 152, 552, 154, 590, 148, 622);
    o.q = P.pl([72, 532, 80, 522, 132, 522, 138, 532]) + P.rc(82, 556, 50, 34);
    o.d = P.wave(84, 528, 46, 0.8, 6) + P.hl(90, 124, 566) + P.hl(90, 118, 574) + P.hl(90, 126, 582);
    // a bin of potatoes
    o = D.o();
    o.f = P.rc(172, 548, 150, 74);
    o.k = P.rc(172, 548, 150, 74) + P.hl(168, 326, 548);
    var pr = T.rng(11);
    for (i = 0; i < 9; i++) o.q += P.el(184 + i * 15.5 + pr() * 3, 548 - 6 - pr() * 4, 9 + pr() * 3, 7);
    o.d = P.hl(176, 318, 600);
    // pans
    o = D.o();
    for (i = 0; i < 5; i++) { o.q += P.pl([352, 622 - i * 10, 356, 614 - i * 10, 504, 614 - i * 10, 508, 622 - i * 10]) + P.hl(348, 512, 614 - i * 10); }
    o.f = P.rc(348, 572, 164, 50);
    // a tall container
    o = D.o();
    o.f = P.rc(552, 534, 76, 88) + P.rc(548, 526, 84, 9);
    o.k = P.rc(552, 534, 76, 88) + P.rc(548, 526, 84, 9);
    for (i = 0; i < 7; i++) o.d += P.hl(552, 560, 544 + i * 11);
    o.d += P.rc(570, 560, 40, 12);
    // a sack of onions in mesh
    o = D.o();
    o.f = P.pg([654, 622, 650, 576, 672, 552, 712, 552, 736, 576, 732, 622]);
    o.k = P.c(654, 622, 642, 590, 660, 556, 690, 552) + P.c(690, 552, 724, 556, 742, 590, 732, 622);
    o.q = P.pl([684, 552, 690, 538, 696, 552]);
    o.d = P.hatch(650, 556, 86, 66, 45, 7) + P.hatch(650, 556, 86, 66, -45, 7);

    // the stockpot on its range
    o = D.o();
    o.f = P.rc(796, 556, 186, 144);
    o.k = P.rco(796, 556, 186, 144, 3);
    o.q = P.hl(796, 982, 572) + P.rc(808, 600, 162, 82);
    o.d = P.el(822, 588, 5) + P.el(846, 588, 5) + P.el(936, 588, 5) + P.el(958, 588, 5) + P.hl(816, 962, 620) + P.rc(860, 690, 60, 6);
    o = D.o();
    o.f = P.rc(816, 362, 148, 194);
    o.k = P.rc(816, 362, 148, 194) + P.rc(812, 356, 156, 8);
    o.q = P.arc(812, 392, 10, 14, 90, 270) + P.arc(968, 392, 10, 14, -90, 90) + P.hl(816, 964, 380);
    o.d = P.hl(816, 964, 540) + P.hl(816, 964, 520) + P.vl(830, 384, 520);
    o.q += P.hl(806, 974, 556) + P.hl(806, 974, 560);

    // the floor
    o = D.o();
    o.k = P.hl(0, 1000, 706);
    for (x = -30; x < 1040; x += 60) o.d += P.ln(x, 706, x + (x - 500) * 0.06, 720);

    // light
    D.wash(566, 96, 80, 50, 1, { cls: 'on', d: 0.15 });
    D.wash(566, 268, 190, 180, 0.9, { cls: 'on', d: 0.25 });
    D.wash(420, 470, 330, 120, 0.65, { s: 0.1 });
    D.wash(890, 400, 140, 170, 0.5, { s: 0.3 });
    D.wash(220, 170, 210, 100, 0.4, { s: 0.45 });

    // the counts, pencilled in one after another
    var a = '';
    for (i = 0; i < PREP.length; i++) {
      y = PY + i * PSTEP;
      a += '<g class="count" style="--i:' + i + '"><text class="tx-w" x="652" y="' + (y + 1) + '" text-anchor="end">' + PREP[i][1] + '</text></g>';
    }
    a += steam(890, 350, 120, 4);
    D.actors = a;
    return D;
  }

  /* ================================================================== */
  /* 3. The line, in service. A ticket prints; a cook steps on.           */
  function line() {
    var D = new Drawing(1000, 720), o, i, x, y;

    // tiled wall
    o = D.o();
    o.x = P.tiles(0, 152, 1000, 260, 40, 20, true);

    // the hood with its baffle filters
    o = D.o();
    o.f = P.rc(20, 30, 960, 124);
    o.k = P.hl(20, 980, 30) + P.rco(20, 136, 960, 18, 3) + P.vl(20, 30, 136) + P.vl(980, 30, 136);
    o.q = P.hl(20, 980, 94);
    for (i = 0; i < 8; i++) {
      x = 46 + i * 115;
      o.q += P.rc(x, 100, 108, 32);
      for (var j = 1; j < 12; j++) o.d += P.vl(x + j * 9, 102, 130);
      o.d += P.rc(x + 46, 104, 16, 4);
    }
    o.q += P.rc(240, 140, 30, 8) + P.rc(730, 140, 30, 8);
    o.d += P.hl(20, 980, 40);

    // the shelf above the range
    o = D.o();
    o.f = P.rc(36, 196, 928, 8);
    o.k = P.rco(36, 196, 928, 8, 2);
    o.q = P.pl([70, 204, 70, 228, 92, 204]) + P.pl([500, 204, 500, 228, 522, 204]) + P.pl([930, 204, 930, 228, 908, 204]);
    // plates stacked
    [[60, 9], [140, 7], [820, 11]].forEach(function (a) {
      var s = D.o();
      for (i = 0; i < a[1]; i++) {
        s.f += P.rc(a[0] - 2, 192 - i * 5, 64, 5);
        s.q += P.pl([a[0] - 2, 192 - i * 5, a[0] + 4, 196 - i * 5, a[0] + 56, 196 - i * 5, a[0] + 62, 192 - i * 5]);
      }
    });
    // squeeze bottles
    for (i = 0; i < 6; i++) {
      x = 250 + i * 26;
      o = D.o();
      o.f = P.rr(x, 152, 18, 44, 4) + P.pg([x + 5, 152, x + 13, 152, x + 10, 138, x + 8, 138]);
      o.q = P.rr(x, 152, 18, 44, 4) + P.pg([x + 5, 152, x + 13, 152, x + 10, 138, x + 8, 138]);
      o.d = P.rc(x + 3, 166, 12, 14);
    }
    // sixth pans and a bowl
    o = D.o();
    o.f = P.rc(440, 176, 40, 20) + P.rc(486, 176, 40, 20);
    o.q = P.rc(440, 176, 40, 20) + P.rc(486, 176, 40, 20) + P.hl(436, 530, 176);
    o.d = P.hl(442, 478, 182) + P.hl(488, 524, 182);
    o = D.o();
    o.f = P.pg([560, 196].concat(P.arcPts(590, 166, 34, 30, 0, 180).reverse()).concat([624, 166]));
    o.f = P.pg([556, 166, 624, 166].concat(P.arcPts(590, 166, 34, 30, 0, 180)));
    o.q = P.arc(590, 166, 34, 30, 0, 180) + P.hl(552, 628, 166);

    // the shift board on the wall
    o = D.o();
    o.f = P.rc(880, 236, 92, 112);
    o.k = P.rc(880, 236, 92, 112);
    o.q = P.hl(886, 966, 254);
    for (i = 0; i < 6; i++) o.d += P.hl(886, 966, 268 + i * 13);
    for (i = 0; i < 5; i++) o.d += P.vl(904 + i * 14, 256, 340);
    [[912, 271], [926, 284], [940, 297], [912, 310], [954, 323], [926, 323]].forEach(function (m) { o.q += P.el(m[0], m[1], 3); });

    // the range along the back: fryer, burners, flat top, grill
    o = D.o();
    o.f = P.rc(30, 396, 940, 144);
    o.k = P.hl(30, 970, 396) + P.hl(30, 970, 404);
    o.q = P.vl(180, 396, 540) + P.vl(480, 396, 540) + P.vl(700, 396, 540);
    for (i = 0; i < 12; i++) o.d += P.el(50 + i * 80, 424, 6);
    o.q += P.rc(196, 450, 136, 80) + P.rc(342, 450, 128, 80) + P.rc(500, 450, 186, 80) + P.rc(716, 450, 236, 80) + P.rc(44, 450, 122, 80);
    o.k += P.hl(214, 314, 462) + P.hl(360, 452, 462) + P.hl(530, 656, 462) + P.hl(750, 918, 462);
    // the fryer's baskets
    o = D.o();
    o.q = P.rc(52, 372, 50, 24) + P.rc(110, 372, 50, 24) + P.ln(102, 380, 116, 352) + P.ln(160, 380, 172, 352);
    o.d = P.hatch(52, 372, 50, 24, 90, 5) + P.hatch(110, 372, 50, 24, 90, 5) + P.hatch(52, 372, 50, 24, 0, 5) + P.hatch(110, 372, 50, 24, 0, 5);
    // burners: a sauté pan, a stockpot, a saucepan
    o = D.o();
    o.f = P.pg([200, 382, 290, 382, 284, 394, 206, 394]);
    o.k = P.pg([200, 382, 290, 382, 284, 394, 206, 394]) + P.ln(200, 384, 150, 372);
    o = D.o();
    o.f = P.rc(334, 316, 76, 78);
    o.k = P.rc(334, 316, 76, 78) + P.rc(330, 312, 84, 6);
    o.q = P.arc(330, 336, 6, 9, 90, 270) + P.arc(414, 336, 6, 9, -90, 90);
    o.d = P.hl(334, 410, 376);
    o = D.o();
    o.f = P.rc(424, 360, 46, 34);
    o.k = P.rc(424, 360, 46, 34) + P.ln(470, 366, 506, 356);
    // flat top and its spatula; salamander above
    o = D.o();
    o.q = P.hl(490, 700, 392) + P.rc(530, 384, 36, 8) + P.rc(590, 384, 30, 8) + P.ln(650, 390, 676, 372) + P.rc(672, 364, 16, 10);
    o = D.o();
    o.f = P.rc(520, 236, 168, 58);
    o.k = P.rco(520, 236, 168, 58, 2);
    o.q = P.rc(530, 262, 148, 24) + P.vl(604, 204, 236);
    o.d = P.hatch(530, 262, 148, 24, 90, 8) + P.el(540, 248, 3) + P.el(552, 248, 3);
    // the char grill
    o = D.o();
    o.q = P.hl(710, 960, 390);
    for (x = 716; x < 958; x += 10) o.d += P.ln(x, 384, x + 4, 390);
    o.q += P.el(760, 386, 16, 4) + P.el(810, 386, 18, 4) + P.el(908, 386, 14, 4);

    // two cooks already on the line
    o = D.o(); cook(o, 268, 248, 'pan');
    o = D.o(); cook(o, 600, 244, 'plate');

    // heat lamps over the pass, on rods from the hood
    o = D.o();
    o.q = P.vl(170, 154, 330) + P.vl(470, 154, 330) + P.vl(510, 154, 330) + P.vl(700, 154, 330);
    o.f = P.rr(150, 330, 340, 16, 3) + P.rr(494, 330, 230, 16, 3);
    o.k = P.rr(150, 330, 340, 16, 3) + P.rr(494, 330, 230, 16, 3);
    for (x = 160; x < 484; x += 10) o.d += P.vl(x, 341, 345);
    for (x = 504; x < 718; x += 10) o.d += P.vl(x, 341, 345);

    // the ticket rail and its tickets
    o = D.o();
    o.f = P.rc(110, 372, 640, 9);
    o.k = P.rc(110, 372, 640, 9);
    o.q = P.hl(110, 750, 376);
    var tr = T.rng(17);
    [118, 166, 330, 384, 438].forEach(function (tx0, k) {
      var s = D.o(), th = 66 + (k % 3) * 10, rot = (tr() - 0.5) * 4;
      var pts = [tx0, 380, tx0 + 46, 380, tx0 + 46 + rot, 380 + th, tx0 + rot, 380 + th];
      s.f = P.pg(pts);
      s.q = P.pg(pts);
      s.d = P.hl(tx0 + 6, tx0 + 34, 390) + P.hl(tx0 + 6, tx0 + 22, 396);
      for (i = 0; i < 4 + k % 3; i++) s.d += P.hl(tx0 + 6 + rot * 0.4, tx0 + 18 + (tr() * 20 | 0) + rot * 0.4, 406 + i * 8);
      s.d += P.hl(tx0 + 6, tx0 + 40, 380 + th - 8);
    });

    // the pass: plates waiting under the lamps
    o = D.o();
    o.f = P.rc(0, 540, 1000, 180);
    o.k = P.hl(0, 1000, 540) + P.hl(0, 1000, 554);
    o.q = '';
    for (x = 40; x < 1000; x += 190) o.q += P.rc(x, 572, 170, 128);
    for (x = 40; x < 1000; x += 190) o.k += P.vl(x + 150, 610, 660);
    o.d = P.hl(0, 1000, 547);
    for (i = 0; i < 40; i++) o.d += P.vl(48 + i * 24, 580, 692);
    [[220, 'a'], [312, 'b'], [404, 'a'], [560, 'b'], [652, 'a']].forEach(function (p) {
      var s = D.o(), px = p[0];
      s.f = P.pg([px - 38, 540, px + 38, 540, px + 32, 534, px - 32, 534]);
      s.q = P.pl([px - 38, 539, px - 32, 534, px + 32, 534, px + 38, 539]) + P.hl(px - 40, px + 40, 540);
      if (p[1] === 'a') {
        s.f += P.pg([px - 18, 534, px - 12, 520, px + 6, 516, px + 18, 524, px + 20, 534]);
        s.k = P.c(px - 18, 534, px - 16, 522, px - 4, 515, px + 8, 517) + P.c(px + 8, 517, px + 18, 520, px + 22, 528, px + 20, 534);
        s.d = P.ln(px - 2, 516, px - 6, 506) + P.ln(px + 2, 516, px + 4, 504) + P.el(px - 8, 506, 2.4, 1.4) + P.el(px + 5, 503, 2.4, 1.4);
      } else {
        s.f += P.pg([px - 22, 534, px - 16, 526, px + 16, 526, px + 22, 534]);
        s.k = P.pl([px - 22, 534, px - 16, 526, px + 16, 526, px + 22, 534]);
        s.d = P.el(px - 6, 522, 5, 3) + P.el(px + 6, 521, 6, 3.4) + P.el(px, 517, 4, 2.6);
      }
    });
    // a stack of plates and the ticket printer
    o = D.o();
    for (i = 0; i < 6; i++) {
      o.f += P.rc(818, 534 - i * 5, 64, 6);
      o.q += P.pl([818, 535 - i * 5, 824, 540 - i * 5, 876, 540 - i * 5, 882, 535 - i * 5]);
    }
    o = D.o();
    o.f = P.rr(912, 494, 74, 46, 5);
    o.k = P.rr(912, 494, 74, 46, 5);
    o.q = P.hl(924, 974, 502) + P.rc(920, 516, 20, 6);
    o.d = P.el(970, 526, 3) + P.hl(926, 972, 506);

    // light
    D.wash(255, 160, 120, 60, 0.6, { s: 0.0 });
    D.wash(745, 160, 120, 60, 0.6, { s: 0.1 });
    D.wash(320, 470, 230, 120, 0.9, { cls: 'on', d: 0.1 });
    D.wash(610, 470, 170, 120, 0.9, { cls: 'on', d: 0.3 });
    D.wash(245, 392, 60, 26, 0.9, { cls: 'flick' });
    D.wash(372, 392, 50, 22, 0.8, { cls: 'flick', style: 'animation-delay:-.7s' });
    D.wash(835, 392, 140, 40, 0.6, { s: 0.25 });
    D.wash(949, 500, 60, 50, 0.6, { cls: 'on', d: 0.7 });

    // actors: flames, steam, the ticket, the third cook
    var a = '';
    a += flame(236, 396, 1.1) + flame(250, 396, 1.3) + flame(262, 396, 1.0) + flame(436, 396, 0.9) + flame(452, 396, 1.0);
    a += steam(372, 308, 110, 3);
    var tk = blank();
    var tp = [700, 380, 746, 380, 746, 456, 700, 456];
    tk.f = P.pg(tp);
    tk.q = P.pg(tp);
    tk.d = P.hl(706, 736, 390) + P.hl(706, 724, 396) + P.hl(706, 730, 408) + P.hl(706, 720, 416) + P.hl(706, 734, 424) + P.hl(706, 726, 432) + P.hl(706, 740, 448);
    a += '<g class="ticket"><g class="paper">' + piece(tk) + '</g></g>';
    var c3 = blank();
    cook(c3, 816, 252, 'down');
    a += '<g clip-path="url(#ln-clip)"><g class="cook3">' + piece(c3) + '</g></g>';
    D.actorDefs = '<clipPath id="ln-clip"><path d="M0 0H1000V540H0Z"/></clipPath>';
    D.actors = a;
    return D;
  }

  /* ================================================================== */
  /* 4. The dining room. The pendants come on; someone sits down.         */
  function dining() {
    var D = new Drawing(1000, 720), o, i, x, y;

    // crown moulding, picture rail
    o = D.o();
    o.q = P.hl(0, 1000, 26) + P.hl(0, 1000, 70);
    o.d = P.hl(0, 1000, 32) + P.hl(0, 1000, 38) + P.hl(0, 1000, 74);
    // three framed prints
    function frame(fx, fy, fw, fh, kind) {
      var s = D.o();
      s.f = P.rc(fx, fy, fw, fh);
      s.k = P.rc(fx, fy, fw, fh);
      s.q = P.rc(fx + 6, fy + 6, fw - 12, fh - 12) + P.rc(fx + 20, fy + 20, fw - 40, fh - 40);
      s.d = P.ln(fx + fw / 2 - 20, fy, fx + fw / 2, fy - 30) + P.ln(fx + fw / 2 + 20, fy, fx + fw / 2, fy - 30);
      var cx = fx + fw / 2, cy = fy + fh / 2;
      if (kind === 'pear') {
        s.d += P.c(cx, cy - 34, cx - 10, cy - 28, cx - 8, cy - 10, cx - 18, cy + 6) + P.c(cx - 18, cy + 6, cx - 26, cy + 30, cx + 26, cy + 30, cx + 18, cy + 6) +
          P.c(cx + 18, cy + 6, cx + 8, cy - 10, cx + 10, cy - 28, cx, cy - 34) + P.q(cx, cy - 34, cx + 2, cy - 42, cx + 6, cy - 44) + P.q(cx + 2, cy - 38, cx + 14, cy - 46, cx + 18, cy - 38);
      } else if (kind === 'hills') {
        s.d += P.q(fx + 20, cy + 10, fx + fw * 0.35, cy - 18, fx + fw * 0.6, cy + 4) + P.q(fx + fw * 0.45, cy + 6, fx + fw * 0.7, cy - 12, fx + fw - 20, cy + 6) + P.hl(fx + 20, fx + fw - 20, cy + 16) + P.el(fx + fw * 0.72, cy - 22, 7);
      } else {
        s.d += P.c(cx - 30, cy, cx - 14, cy - 16, cx + 14, cy - 14, cx + 24, cy) + P.c(cx - 30, cy, cx - 14, cy + 16, cx + 14, cy + 14, cx + 24, cy) +
          P.pl([cx + 24, cy, cx + 34, cy - 10, cx + 34, cy + 10, cx + 24, cy]) + P.el(cx - 18, cy - 3, 1.6);
      }
    }
    frame(78, 104, 124, 158, 'pear');
    frame(316, 118, 170, 112, 'hills');
    frame(580, 100, 108, 152, 'fish');
    // sconces between the prints
    [259, 533].forEach(function (sx) {
      var s = D.o();
      s.q = P.rc(sx - 5, 194, 10, 22) + P.q(sx, 202, sx + 2, 188, sx, 180);
      s.f = P.pg([sx - 12, 180, sx + 12, 180, sx + 8, 158, sx - 8, 158]);
      s.k = P.pg([sx - 12, 180, sx + 12, 180, sx + 8, 158, sx - 8, 158]);
      s.d = P.hl(sx - 10, sx + 10, 172);
    });

    // the chair rail and the banquette along the wall
    o = D.o();
    o.k = P.hl(0, 760, 404);
    o.q = P.hl(0, 760, 412);
    o = D.o();
    o.f = P.rc(20, 422, 740, 218);
    o.k = P.rco(20, 422, 740, 8, 3) + P.hl(20, 760, 572) + P.hl(20, 760, 586);
    o.q = P.vl(20, 430, 640) + P.vl(760, 430, 640) + P.hl(20, 760, 640);
    for (x = 20; x < 760; x += 46.25) o.q += P.vl(x, 430, 566);
    for (x = 43; x < 760; x += 46.25) for (y = 452; y < 566; y += 38) o.x += P.el(x, y, 1.8) + P.ln(x - 6, y - 6, x - 2, y - 2) + P.ln(x + 6, y + 6, x + 2, y + 2) + P.ln(x - 6, y + 6, x - 2, y + 2) + P.ln(x + 6, y - 6, x + 2, y - 2);
    for (x = 30; x < 760; x += 22) o.d += P.vl(x, 592, 636);

    // guests on the banquette
    function banqGuest(gx, lean) {
      var s = D.o();
      var body = [gx - 30, 576, gx - 34, 498, gx - 24, 472, gx - 9, 466, gx + 9, 466, gx + 24, 472, gx + 34, 498, gx + 30, 576];
      s.f = P.pg(body);
      s.k = P.c(gx - 30, 576, gx - 34, 520, gx - 34, 480, gx - 9, 466) + P.c(gx + 30, 576, gx + 34, 520, gx + 34, 480, gx + 9, 466) + P.q(gx - 9, 466, gx, 470, gx + 9, 466);
      s.f += P.el(gx + lean, 438, 13, 16);
      s.k += P.el(gx + lean, 438, 13, 16) + P.vl(gx - 5, 452, 467) + P.vl(gx + 5, 452, 467);
      s.d = P.c(gx + lean - 13, 436, gx + lean - 12, 418, gx + lean + 12, 418, gx + lean + 13, 436) + P.q(gx - 8, 470, gx, 484, gx + 8, 470);
      var arms = [[gx - 30, 486, gx - 30, 520, gx - 6, 504], [gx + 30, 486, gx + 30, 520, gx + 6, 504]];
      arms.forEach(function (a) { s.f += thick(a, 11, 9); s.q += thick(a, 11, 9); });
    }
    banqGuest(150, -2);
    banqGuest(638, 3);

    // the tables, with what's on them
    function table(cx) {
      var s = D.o();
      s.f = P.rc(cx - 72, 490, 144, 7) + P.rc(cx - 5, 497, 10, 196) + P.rc(cx - 40, 692, 80, 6);
      s.k = P.rco(cx - 72, 490, 144, 7, 2) + P.rc(cx - 40, 692, 80, 6);
      s.q = P.vl(cx - 5, 497, 692) + P.vl(cx + 5, 497, 692);
      s.d = P.hl(cx - 70, cx + 70, 494) + P.ln(cx - 5, 680, cx - 22, 692) + P.ln(cx + 5, 680, cx + 22, 692);
      wineGlass(s, cx - 40, 490, 0.85);
      wineGlass(s, cx + 44, 490, 0.85);
      tumbler(s, cx + 24, 490, 16, 11);
      candle(s, cx, 490);
      plateSide(s, cx - 16, 490, 34);
    }
    table(170); table(400); table(630);

    // diners on chairs, backs to us
    o = D.o(); backSitter(o, 214, 590, 1);
    o = D.o(); chairBack(o, 216, 596, 1);
    o = D.o(); chairBack(o, 650, 596, 1);
    // the empty chair at the middle table belongs to the guest who arrives

    // pendants
    [170, 400, 630].forEach(function (px) {
      var s = D.o();
      s.q = P.vl(px, 0, 306);
      s.f = P.pg([px - 30, 344].concat(P.arcPts(px, 344, 30, 36, 180, 360)));
      s.k = P.arc(px, 344, 30, 36, 180, 360) + P.hl(px - 32, px + 32, 344) + P.rc(px - 5, 302, 10, 8);
      s.d = P.arc(px, 344, 20, 5, 0, 180) + P.arc(px, 344, 16, 25, 200, 250);
    });

    // the bar: back bar shelves, bottles, counter, taps, stools
    o = D.o();
    o.f = P.rc(780, 120, 220, 290);
    o.q = P.rc(780, 120, 220, 290);
    o.d = P.ln(800, 140, 860, 200) + P.ln(840, 140, 940, 240) + P.ln(900, 140, 980, 220);
    [210, 290, 370].forEach(function (sy, k) {
      var s = D.o();
      s.f = P.rc(780, sy, 220, 6);
      s.k = P.rc(780, sy, 220, 6);
      var r = T.rng(30 + k);
      for (x = 790; x < 990;) {
        var kind = (r() * 3) | 0, sc = 0.82 + r() * 0.2;
        bottle(s, x + 8, sy, kind, sc);
        x += 18 + r() * 6;
      }
    });
    o = D.o();
    o.f = P.rc(770, 470, 230, 230);
    o.k = P.rco(762, 462, 238, 12, 3) + P.vl(770, 474, 700);
    o.q = P.rc(786, 492, 92, 170) + P.rc(894, 492, 92, 170) + P.hl(770, 1000, 672);
    o.d = P.rc(796, 502, 72, 150) + P.rc(904, 502, 72, 150);
    o.k += P.hl(770, 1000, 684) + P.vl(800, 674, 690) + P.vl(960, 674, 690);
    // taps
    o = D.o();
    o.f = P.rc(926, 420, 46, 42);
    o.k = P.rc(926, 420, 46, 42) + P.hl(922, 976, 420);
    [936, 952, 968].forEach(function (t) { o.q += P.rr(t - 3, 390, 6, 30, 2) + P.pl([t, 432, t, 442, t - 4, 446]); });
    // stools
    [820, 910].forEach(function (sx) {
      var s = D.o();
      s.f = P.rr(sx - 26, 538, 52, 10, 4);
      s.k = P.rr(sx - 26, 538, 52, 10, 4);
      s.q = P.ln(sx - 18, 548, sx - 24, 700) + P.ln(sx + 18, 548, sx + 24, 700) + P.ln(sx - 6, 548, sx - 8, 700) + P.ln(sx + 6, 548, sx + 8, 700);
      s.d = P.hl(sx - 22, sx + 22, 640) + P.hl(sx - 20, sx + 20, 606);
    });

    // a fiddle-leaf fig between the banquette and the bar
    o = D.o();
    var lr = T.rng(8);
    o.q = P.c(742, 640, 740, 560, 748, 480, 744, 380);
    var leaves = [];
    for (i = 0; i < 13; i++) {
      var ly = 400 + i * 18, side = i % 2 ? 1 : -1, lx = 744 + side * (6 + lr() * 4);
      var ang = side * (25 + lr() * 30) * Math.PI / 180, lw = 16 + lr() * 6, lh = 26 + lr() * 8;
      leaves.push([lx, ly, ang, lw, lh]);
    }
    leaves.forEach(function (L2) {
      var s = D.o(), lx = L2[0], ly = L2[1], an = L2[2], lw = L2[3], lh = L2[4];
      var ex = lx + Math.sin(an) * lh, ey = ly - Math.cos(an) * lh;
      var nx = Math.cos(an) * lw * 0.5, ny = Math.sin(an) * lw * 0.5;
      var mx = (lx + ex) / 2, my = (ly + ey) / 2;
      var path = P.c(lx, ly, mx - nx * 1.2, my - ny * 1.2, ex - nx * 0.6, ey - ny * 0.6, ex, ey) + 'C' + T.n(ex + nx * 0.6) + ' ' + T.n(ey + ny * 0.6) + ' ' + T.n(mx + nx * 1.2) + ' ' + T.n(my + ny * 1.2) + ' ' + T.n(lx) + ' ' + T.n(ly) + 'Z';
      s.f = path; s.q = path;
      s.d = P.ln(lx, ly, ex, ey) + P.ln(mx, my, mx - nx * 0.8 + (ex - lx) * 0.15, my - ny * 0.8 + (ey - ly) * 0.15) + P.ln(mx, my, mx + nx * 0.8 + (ex - lx) * 0.15, my + ny * 0.8 + (ey - ly) * 0.15);
    });
    o = D.o();
    o.f = P.pg([718, 624, 772, 624, 766, 700, 724, 700]);
    o.k = P.pg([718, 624, 772, 624, 766, 700, 724, 700]) + P.hl(714, 776, 624);
    o.d = P.hl(720, 770, 634);

    // the floor
    o = D.o();
    o.k = P.hl(0, 1000, 700);
    for (x = 0; x < 1000; x += 28) o.d += P.ln(x, 700, x + 12, 712) + P.ln(x + 14, 712, x + 26, 700) + P.ln(x + 12, 712, x + 14, 720);

    // light
    D.wash(259, 172, 70, 70, 0.7, { s: 0.0 });
    D.wash(533, 172, 70, 70, 0.7, { s: 0.15 });
    D.wash(170, 352, 70, 40, 1, { cls: 'on', d: 0.15 });
    D.wash(170, 480, 140, 90, 0.85, { cls: 'on', d: 0.25 });
    D.wash(400, 352, 70, 40, 1, { cls: 'on', d: 0.55 });
    D.wash(400, 480, 140, 90, 0.85, { cls: 'on', d: 0.65 });
    D.wash(630, 352, 70, 40, 1, { cls: 'on', d: 0.95 });
    D.wash(630, 480, 140, 90, 0.85, { cls: 'on', d: 1.05 });
    D.wash(890, 290, 150, 150, 0.6, { s: 0.3 });
    D.wash(170, 474, 22, 22, 0.9, { cls: 'candle' });
    D.wash(400, 474, 22, 22, 0.9, { cls: 'candle', style: 'animation-delay:-1.3s' });
    D.wash(630, 474, 22, 22, 0.9, { cls: 'candle', style: 'animation-delay:-2.1s' });

    // the guest who arrives at the middle table
    var g = blank(), ch = blank();
    backSitter(g, 444, 590, 1);
    chairBack(ch, 446, 596, 1);
    D.actors = '<g class="arrive">' + piece(g) + '</g><g class="arrive-chair">' + piece(ch) + '</g>';
    return D;
  }

  /* ================================================================== */
  /* 5. A street of independents: a trattoria, a café, a bistro and a     */
  /*    taqueria, side by side. Their lamps come on in turn as the        */
  /*    section scrolls in (each wash carries its own threshold, --s).    */
  function indies() {
    var D = new Drawing(1400, 480), o, i, x, y, R;
    var G = 420; // the pavement line

    // a wall lantern on a short arm, hung at (lx, ly)
    function lantern(o, lx, ly, d) {
      o.q += P.rc(lx - 4 - d * 8, ly - 4, 8, 22) + P.q(lx - d * 8, ly + 6, lx - d * 2, ly + 4, lx, ly - 2);
      o.f += P.pg([lx - 9, ly, lx + 9, ly, lx + 7, ly + 28, lx - 7, ly + 28]);
      o.k += P.pg([lx - 9, ly, lx + 9, ly, lx + 7, ly + 28, lx - 7, ly + 28]) + P.pg([lx - 12, ly, lx, ly - 11, lx + 12, ly]);
      o.q += P.vl(lx, ly, ly + 28) + P.pg([lx - 5, ly + 28, lx + 5, ly + 28, lx, ly + 35]);
      o.d += P.el(lx, ly + 15, 2.2, 4.5);
    }
    // a dome pendant inside a window
    function pendant(o, px, top, py, r) {
      o.q += P.vl(px, top, py - r * 0.8);
      o.f += P.pg([px - r, py].concat(P.arcPts(px, py, r, r * 0.8, 180, 360)));
      o.k += P.arc(px, py, r, r * 0.8, 180, 360) + P.hl(px - r - 1, px + r + 1, py);
    }
    // a small round table side on, top at y
    function smallTable(o, cx, y, w) {
      o.f += P.rc(cx - w / 2, y - 3, w, 4);
      o.k += P.hl(cx - w / 2, cx + w / 2, y - 3);
      o.q += P.hl(cx - w / 2 + 2, cx + w / 2 - 2, y + 1) + P.vl(cx, y + 1, G - 4) + P.ln(cx - 12, G, cx, G - 6) + P.ln(cx + 12, G, cx, G - 6);
    }

    /* ---------- A. the trattoria: brick, arched windows, striped awning */
    var A = 20, AW = 330;
    o = D.o();
    o.f = P.rc(A, 30, AW, G - 30);
    o.x = P.bricks(A, 30, AW, G - 30, 28, 9);
    o.k = P.vl(A, 30, G) + P.vl(A + AW, 30, G);
    o.q = P.hl(A - 6, A + AW + 6, 36) + P.hl(A - 6, A + AW + 6, 44) + P.hl(A, A + AW, 52);
    [A + 50, A + 140, A + 230].forEach(function (wx) {
      var s = D.o(), w = 50, t = 86, b = 176;
      s.f = P.pg([wx, b, wx, t].concat(P.arcPts(wx + w / 2, t, w / 2, w / 2, 180, 360)).concat([wx + w, b]));
      s.k = P.pl([wx, b, wx, t].concat(P.arcPts(wx + w / 2, t, w / 2, w / 2, 180, 360)).concat([wx + w, b])) + P.hl(wx - 6, wx + w + 6, b) + P.hl(wx - 4, wx + w + 4, b + 5);
      s.q = P.vl(wx + w / 2, t - w / 2 + 4, b) + P.hl(wx + 3, wx + w - 3, 126);
      s.d = P.arc(wx + w / 2, t, w / 2 + 7, w / 2 + 7, 180, 360);
      for (i = 1; i < 6; i++) { var a = Math.PI + Math.PI * i / 6; s.d += P.ln(wx + w / 2 + Math.cos(a) * (w / 2), t + Math.sin(a) * (w / 2), wx + w / 2 + Math.cos(a) * (w / 2 + 7), t + Math.sin(a) * (w / 2 + 7)); }
    });
    // shopfront: a window either side of an arched door
    o = D.o();
    o.f = P.rc(A + 14, 262, AW - 28, G - 262);
    [[A + 24, 108], [A + 206, 108]].forEach(function (wv) {
      var wx = wv[0], w = wv[1];
      o.k += P.rc(wx, 276, w, 104);
      o.q += P.rc(wx + 5, 281, w - 10, 94) + P.rc(wx, 384, w, 30);
      o.d += P.rc(wx + 6, 389, w - 12, 20) + P.ln(wx + 14, 360, wx + 46, 300) + P.ln(wx + 28, 364, wx + 58, 308);
    });
    // inside the windows: a pendant over a small table with a candle and a bottle
    pendant(o, A + 78, 281, 312, 16);
    pendant(o, A + 260, 281, 312, 16);
    o.q += P.hl(A + 44, A + 112, 356) + P.hl(A + 226, A + 294, 356);
    bottle(o, A + 62, 356, 0, 0.55);
    candle(o, A + 92, 356);
    wineGlass(o, A + 244, 356, 0.6);
    candle(o, A + 274, 356);
    // the door
    o.k += P.pl([A + 140, G, A + 140, 300].concat(P.arcPts(A + 165, 300, 25, 25, 180, 360)).concat([A + 190, G]));
    o.q += P.vl(A + 165, 276, G) + P.rc(A + 146, 312, 13, 60) + P.rc(A + 171, 312, 13, 60);
    o.d += P.rc(A + 146, 382, 13, 30) + P.rc(A + 171, 382, 13, 30);
    // the striped awning
    o = D.o();
    var aw = [A + 10, 224, A + AW - 10, 224, A + AW - 2, 256, A + 2, 256];
    o.f = P.pg(aw) + P.rc(A + 2, 256, AW - 4, 12);
    o.k = P.pg(aw) + P.hl(A + 2, A + AW - 2, 268);
    for (x = A + 2; x < A + AW - 4; x += 20) o.q += P.arc(x + 10, 264, 10, 6, 0, 180);
    for (i = 0; i <= 16; i++) {
      var tt = i / 16, xt = A + 10 + (AW - 20) * tt, xb = A + 2 + (AW - 4) * tt;
      o.q += P.ln(xt, 224, xb, 256);
      if (i < 16 && i % 2 === 0) {
        var t2 = (i + 1) / 16, xt2 = A + 10 + (AW - 20) * t2, xb2 = A + 2 + (AW - 4) * t2;
        for (var h = 1; h < 4; h++) o.d += P.ln(xt + (xt2 - xt) * h / 4, 225, xb + (xb2 - xb) * h / 4, 255);
      }
    }
    // lanterns either side of the door, and a blade sign with a glass on it
    o = D.o();
    lantern(o, A + 128, 282, -1);
    lantern(o, A + 202, 282, 1);
    o = D.o();
    o.q = P.hl(A + AW - 4, A + AW + 40, 196) + P.hl(A + AW - 4, A + AW + 40, 199) + P.vl(A + AW + 32, 199, 204) + P.vl(A + AW + 8, 199, 204);
    o.f = P.el(A + AW + 20, 222, 18);
    o.k = P.el(A + AW + 20, 222, 18);
    o.q += P.el(A + AW + 20, 222, 14);
    wineGlass(o, A + AW + 20, 234, 0.62);

    /* ---------- B. the café: painted boards, a big window, a table out front */
    var B = 372, BW = 316;
    o = D.o();
    o.f = P.rc(B, 96, BW, G - 96);
    o.x = '';
    for (x = B + 8; x < B + BW; x += 9) o.x += P.vl(x, 104, 214);
    o.k = P.vl(B, 96, G) + P.vl(B + BW, 96, G) + P.hl(B - 4, B + BW + 4, 96);
    o.q = P.hl(B - 4, B + BW + 4, 104) + P.hl(B, B + BW, 214);
    // the upstairs window and its flower box
    o = D.o();
    o.f = P.rc(B + 98, 120, 120, 70);
    o.k = P.rc(B + 98, 120, 120, 70);
    o.q = P.rc(B + 103, 125, 53, 60) + P.rc(B + 160, 125, 53, 60);
    o.f += P.rc(B + 92, 190, 132, 16);
    o.q += P.rc(B + 92, 190, 132, 16);
    for (i = 0; i < 11; i++) { x = B + 98 + i * 12; o.d += P.c(x, 190, x - 3, 182, x + 3, 176, x + 6, 180) + P.el(x + 5, 179, 2.2); }
    // the fascia with a cup on it
    o = D.o();
    o.f = P.rc(B + 8, 220, BW - 16, 34);
    o.k = P.rco(B + 8, 220, BW - 16, 34, 3);
    o.q = P.rc(B + 14, 226, BW - 28, 22);
    var cx = B + BW / 2;
    o.k += P.pl([cx - 11, 230, cx - 9, 243, cx + 9, 243, cx + 11, 230, cx - 11, 230]) + P.arc(cx + 13, 235, 5, 4, -90, 90) + P.hl(cx - 15, cx + 15, 246);
    o.d = P.wave(cx - 4, 228, 6, 1.4, 1, true) + P.wave(cx + 3, 228, 6, 1.4, 1, true) + P.hl(cx - 120, cx - 30, 237) + P.hl(cx + 30, cx + 120, 237);
    // the window: globes inside, a counter and a cake stand
    o = D.o();
    o.f = P.rc(B + 14, 262, BW - 28, G - 262);
    o.k = P.rc(B + 20, 266, 206, 112) + P.rco(B + 14, 258, BW - 28, G - 258, 3);
    o.q = P.rc(B + 25, 271, 196, 102) + P.rc(B + 20, 384, 206, 30);
    o.d = P.rc(B + 26, 389, 96, 20) + P.rc(B + 126, 389, 94, 20) + P.ln(B + 36, 366, B + 70, 300) + P.ln(B + 150, 368, B + 186, 296);
    [B + 64, B + 123, B + 182].forEach(function (gx) {
      o.q += P.vl(gx, 271, 292);
      o.f += P.el(gx, 301, 9);
      o.k += P.el(gx, 301, 9);
    });
    o.q += P.hl(B + 25, B + 221, 350) + P.hl(B + 25, B + 221, 354);
    o.q += P.vl(B + 90, 336, 350) + P.hl(B + 76, B + 104, 336) + P.arc(B + 90, 336, 13, 10, 180, 360);
    tumbler(o, B + 140, 350, 12, 9);
    tumbler(o, B + 154, 350, 12, 9);
    // the door, half glass
    o.k += P.rc(B + 238, 266, 62, G - 266);
    o.q += P.rc(B + 245, 273, 48, 82) + P.rc(B + 245, 364, 48, 48);
    o.d += P.hl(B + 249, B + 289, 314) + P.vl(B + 286, 360, 368);
    // a table on the pavement, two chairs, one guest
    o = D.o(); bistroChair(o, B + 112, 384, 1, 0.78);
    o = D.o(); sitter(o, B + 112, 384, 1, 0.78);
    o = D.o(); bistroChair(o, B + 200, 384, -1, 0.78);
    o = D.o(); smallTable(o, B + 156, 372, 46);
    tumbler(o, B + 148, 369, 9, 7);
    // a lamp over the door
    o = D.o();
    lantern(o, B + 269, 226, 1);

    /* ---------- C. the bistro: ashlar, shutters, tall paned windows */
    var C = 710, CW = 330;
    o = D.o();
    o.f = P.rc(C, 20, CW, G - 20);
    o.x = P.tiles(C, 30, CW, 184, 55, 23, true);
    o.k = P.vl(C, 20, G) + P.vl(C + CW, 20, G) + P.hl(C - 8, C + CW + 8, 20);
    o.q = P.hl(C - 8, C + CW + 8, 28) + P.hl(C - 4, C + CW + 4, 214) + P.hl(C - 4, C + CW + 4, 220);
    // three tall windows with open shutters
    [C + 52, C + 140, C + 228].forEach(function (wx) {
      var s = D.o(), w = 50, t = 66, b = 186;
      s.f = P.rc(wx - 24, t, w + 48, b - t + 6);
      s.k = P.rc(wx, t, w, b - t) + P.hl(wx - 6, wx + w + 6, b + 4);
      s.q = P.vl(wx + w / 2, t + 4, b) + P.hl(wx + 3, wx + w - 3, t + 40) + P.hl(wx + 3, wx + w - 3, t + 80) + P.rc(wx + 3, t + 3, w - 6, b - t - 6);
      s.q += P.rc(wx - 22, t, 20, b - t) + P.rc(wx + w + 2, t, 20, b - t);
      for (y = t + 6; y < b - 4; y += 6) s.d += P.hl(wx - 19, wx - 5, y) + P.hl(wx + w + 5, wx + w + 19, y);
      s.q += P.hl(wx - 8, wx + w + 8, t - 6) + P.hl(wx - 8, wx + w + 8, t - 2);
    });
    // the fascia, with a cloche on it, and two lamps that light it
    o = D.o();
    o.f = P.rc(C + 10, 224, CW - 20, 32);
    o.k = P.rco(C + 10, 224, CW - 20, 32, 3);
    o.q = P.rc(C + 16, 230, CW - 32, 20);
    var kx = C + CW / 2;
    o.k += P.arc(kx, 246, 15, 12, 180, 360) + P.hl(kx - 19, kx + 19, 246) + P.el(kx, 232, 2);
    o.d = P.ln(kx - 70, 240, kx - 34, 240) + P.ln(kx + 34, 240, kx + 70, 240) + P.pg([kx - 76, 240, kx - 72, 237, kx - 68, 240, kx - 72, 243]) + P.pg([kx + 68, 240, kx + 72, 237, kx + 76, 240, kx + 72, 243]);
    [C + 70, C + CW - 70].forEach(function (lx) {
      o.q += P.c(lx, 214, lx, 204, lx + 4, 198, lx + 16, 198) + P.pg([lx + 8, 196, lx + 24, 196, lx + 28, 204, lx + 4, 204]);
    });
    // three tall glazed doors with café curtains
    o = D.o();
    o.f = P.rc(C + 16, 262, CW - 32, G - 262);
    o.k = P.rco(C + 16, 262, CW - 32, G - 262, 3);
    [C + 28, C + 128, C + 228].forEach(function (dx, k) {
      var w = 78;
      o.k += P.rc(dx, 272, w, G - 272);
      o.q += P.rc(dx + 5, 277, w - 10, 118) + P.rc(dx + 5, 400, w - 10, 16);
      for (i = 1; i < 3; i++) o.d += P.vl(dx + 5 + (w - 10) * i / 3, 277, 334);
      o.d += P.hl(dx + 5, dx + w - 5, 306) + P.hl(dx + 5, dx + w - 5, 334);
      // curtain on a rail across the lower panes
      o.q += P.hl(dx + 3, dx + w - 3, 340);
      o.f += P.rc(dx + 6, 342, w - 12, 50);
      for (x = dx + 9; x < dx + w - 8; x += 7) o.d += P.q(x, 342, x + 2, 368, x, 392);
      o.q += P.wave(dx + 6, 342, w - 12, 1.4, 5);
      if (k === 1) o.q += P.vl(dx + w - 10, 350, 380);
    });
    // a candle glow above each curtain
    o.d += P.vl(C + 67, 314, 330) + P.vl(C + 267, 314, 330);

    /* ---------- D. the taqueria: plaster, a curved parapet, a walk-up window */
    var Dx = 1060, DW = 318;
    o = D.o();
    var top = [Dx, 150, Dx + 90, 150].concat(P.arcPts(Dx + DW / 2, 150, 70, 46, 180, 360)).concat([Dx + DW - 90, 150, Dx + DW, 150]);
    o.f = P.pg(top.concat([Dx + DW, G, Dx, G]));
    o.k = P.pl(top) + P.vl(Dx, 150, G) + P.vl(Dx + DW, 150, G);
    o.q = P.pl(top.map(function (v, k) { return k % 2 ? v + 8 : v; }).slice(2, -2));
    R = T.rng(21);
    o.x = '';
    for (i = 0; i < 260; i++) {
      x = Dx + 6 + R() * (DW - 12); y = 160 + R() * 240;
      if (y > 250 && y < 420 && x > Dx + 20 && x < Dx + 300) continue;
      o.x += P.arc(x, y, 1.6, 1, 0, 160);
    }
    // a sun painted under the parapet
    var sx = Dx + DW / 2, sy = 140;
    o.k += P.el(sx, sy, 15);
    for (i = 0; i < 12; i++) { var ra = i * Math.PI / 6; o.q += P.ln(sx + Math.cos(ra) * 20, sy + Math.sin(ra) * 20, sx + Math.cos(ra) * (i % 2 ? 26 : 30), sy + Math.sin(ra) * (i % 2 ? 26 : 30)); }
    o.d += P.el(sx, sy, 10);
    // papel picado across the front
    o = D.o();
    o.q = P.q(Dx + 4, 178, Dx + DW / 2, 194, Dx + DW - 4, 178);
    for (i = 0; i < 13; i++) {
      x = Dx + 14 + i * 22.5; var yy = 178 + 16 * (1 - Math.pow((x - Dx - DW / 2) / (DW / 2), 2)) * 1;
      o.f += P.pg([x, yy, x + 16, yy, x + 16, yy + 22, x + 12, yy + 19, x + 8, yy + 22, x + 4, yy + 19, x, yy + 22]);
      o.q += P.pg([x, yy, x + 16, yy, x + 16, yy + 22, x + 12, yy + 19, x + 8, yy + 22, x + 4, yy + 19, x, yy + 22]);
      o.d += P.el(x + 8, yy + 8, 2.4) + P.el(x + 4, yy + 14, 1.2) + P.el(x + 12, yy + 14, 1.2);
    }
    // the walk-up window, shutter rolled up, a menu board inside
    o = D.o();
    o.f = P.rc(Dx + 26, 256, 176, 104);
    o.k = P.rco(Dx + 26, 256, 176, 104, 3) + P.rc(Dx + 22, 360, 184, 7);
    o.q = P.rc(Dx + 30, 260, 168, 14) + P.hl(Dx + 30, Dx + 198, 266);
    o.q += P.rc(Dx + 62, 284, 104, 46);
    for (i = 0; i < 4; i++) o.d += P.hl(Dx + 70, Dx + 120 + (i * 13) % 30, 294 + i * 9) + P.hl(Dx + 146, Dx + 158, 294 + i * 9);
    o.d += P.ln(Dx + 40, 350, Dx + 58, 316);
    // tiles under the counter
    o.q += P.rc(Dx + 26, 367, 176, G - 367);
    var tw = 22, th = (G - 367) / 3;
    for (x = Dx + 26; x < Dx + 200; x += tw) for (y = 367; y < G - 2; y += th) {
      o.d += P.rc(x, y, tw, th) + P.pg([x + tw / 2, y + 3, x + tw - 4, y + th / 2, x + tw / 2, y + th - 3, x + 4, y + th / 2]);
    }
    // the door
    o.k += P.rc(Dx + 226, 262, 66, G - 262);
    o.q += P.rc(Dx + 233, 269, 52, 88) + P.hl(Dx + 233, Dx + 285, 380);
    o.d += P.vl(Dx + 280, 368, 392);
    // string lights from wall to wall
    o = D.o();
    var bulbs = [];
    o.q = '';
    for (i = 0; i <= 20; i++) {
      var bt = i / 20, bx = Dx + 8 + (DW - 16) * bt, by = 228 + Math.sin(bt * Math.PI) * 18;
      o.q += (i ? L2(bx, by) : 'M' + bx.toFixed(1) + ' ' + by.toFixed(1));
      if (i % 2 === 1) bulbs.push([bx, by]);
    }
    bulbs.forEach(function (b) { o.f += P.el(b[0], b[1] + 6, 2.8, 4); o.d += P.el(b[0], b[1] + 6, 2.8, 4) + P.vl(b[0], b[1], b[1] + 2); });
    // a cactus in a pot by the door
    o = D.o();
    o.f = P.pg([Dx + 298, 392, Dx + 330, 392, Dx + 326, G, Dx + 302, G]);
    o.k = P.pg([Dx + 298, 392, Dx + 330, 392, Dx + 326, G, Dx + 302, G]);
    o.f += P.el(Dx + 314, 366, 9, 26) + P.el(Dx + 300, 352, 6, 14) + P.el(Dx + 328, 346, 6, 16);
    o.q += P.el(Dx + 314, 366, 9, 26) + P.el(Dx + 300, 352, 6, 14) + P.el(Dx + 328, 346, 6, 16);
    o.d += P.vl(Dx + 314, 346, 386) + P.vl(Dx + 300, 344, 360) + P.vl(Dx + 328, 336, 356);

    /* ---------- between the buildings: downpipes; then the pavement */
    o = D.o();
    [A + AW + 11, B + BW + 11, C + CW + 10].forEach(function (px) {
      o.q += P.vl(px - 2, 60, G) + P.vl(px + 2, 60, G) + P.rc(px - 5, 56, 10, 6);
      for (y = 100; y < G; y += 70) o.d += P.hl(px - 4, px + 4, y);
    });
    o = D.o();
    o.k = P.hl(0, 1400, G);
    o.q = P.hl(0, 1400, 456) + P.hl(0, 1400, 464);
    for (x = 30; x < 1400; x += 88) o.d += P.ln(x, G, x - 9, 456);
    o.d += P.hl(0, 1400, 438);

    // light: each shop's lamps carry their own threshold (--s), so they come on in turn
    var sA = 0.05, sB = 0.17, sC = 0.29, sD = 0.41;
    D.wash(A + 128, 300, 46, 52, 1, { cls: 'shop', s: sA });
    D.wash(A + 202, 300, 46, 52, 1, { cls: 'shop', s: sA + 0.02 });
    D.wash(A + 78, 330, 70, 60, 0.9, { cls: 'shop', s: sA + 0.04 });
    D.wash(A + 260, 330, 70, 60, 0.9, { cls: 'shop', s: sA + 0.05 });
    D.wash(A + 165, 440, 170, 34, 0.55, { cls: 'shop', s: sA + 0.06 });
    D.wash(A + AW + 20, 222, 34, 34, 0.5, { cls: 'shop', s: sA + 0.08 });
    D.wash(B + 123, 310, 120, 66, 1, { cls: 'shop', s: sB });
    D.wash(B + 269, 246, 44, 48, 1, { cls: 'shop', s: sB + 0.03 });
    D.wash(B + 156, 404, 110, 40, 0.7, { cls: 'shop', s: sB + 0.06 });
    D.wash(C + CW / 2, 232, 140, 30, 0.8, { cls: 'shop', s: sC });
    D.wash(C + 67, 318, 46, 56, 0.95, { cls: 'shop', s: sC + 0.03 });
    D.wash(C + 167, 318, 46, 56, 0.95, { cls: 'shop', s: sC + 0.04 });
    D.wash(C + 267, 318, 46, 56, 0.95, { cls: 'shop', s: sC + 0.05 });
    D.wash(C + CW / 2, 440, 170, 34, 0.5, { cls: 'shop', s: sC + 0.07 });
    D.wash(Dx + DW / 2, 240, 170, 40, 0.9, { cls: 'shop', s: sD });
    D.wash(Dx + 114, 310, 100, 60, 0.85, { cls: 'shop', s: sD + 0.04 });
    D.wash(Dx + 259, 310, 40, 56, 0.6, { cls: 'shop', s: sD + 0.06 });
    D.wash(Dx + 114, 440, 130, 32, 0.5, { cls: 'shop', s: sD + 0.08 });
    return D;

    function L2(x, y) { return 'L' + x.toFixed(1) + ' ' + y.toFixed(1); }
  }

  window.TooeyScenes = { street: street, prep: prep, line: line, dining: dining, indies: indies, PREP: PREP };
})();
