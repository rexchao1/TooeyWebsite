/* Tooey, exploration 34: the lit room.
   A small pen for fine architectural line drawings in SVG. Each drawing is a
   list of objects, back to front. An object has a porcelain fill (so it hides
   what is behind it) and three kinds of line: key outlines, quiet structure,
   and fine detail. The page renders every drawing twice: once as quiet line
   (fine detail barely there) and once in full, which the lamp reveals. */
(function () {
  'use strict';

  function n(v) { return Math.round(v * 10) / 10; }
  function M(x, y) { return 'M' + n(x) + ' ' + n(y); }
  function L(x, y) { return 'L' + n(x) + ' ' + n(y); }

  var P = {
    ln: function (x1, y1, x2, y2) { return M(x1, y1) + L(x2, y2); },
    // a line that runs a little past its ends, as an architect's corner does
    ex: function (x1, y1, x2, y2, o) {
      var dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
      dx *= o / l; dy *= o / l;
      return M(x1 - dx, y1 - dy) + L(x2 + dx, y2 + dy);
    },
    hl: function (x1, x2, y) { return M(x1, y) + 'H' + n(x2); },
    vl: function (x, y1, y2) { return M(x, y1) + 'V' + n(y2); },
    rc: function (x, y, w, h) { return M(x, y) + 'h' + n(w) + 'v' + n(h) + 'h' + n(-w) + 'z'; },
    rco: function (x, y, w, h, o) {
      o = o == null ? 3 : o;
      return P.ex(x, y, x + w, y, o) + P.ex(x + w, y, x + w, y + h, o) + P.ex(x + w, y + h, x, y + h, o) + P.ex(x, y + h, x, y, o);
    },
    pl: function (pts) {
      var s = M(pts[0], pts[1]);
      for (var i = 2; i < pts.length; i += 2) s += L(pts[i], pts[i + 1]);
      return s;
    },
    pg: function (pts) { return P.pl(pts) + 'z'; },
    el: function (cx, cy, rx, ry) {
      ry = ry == null ? rx : ry;
      return M(cx - rx, cy) + 'a' + n(rx) + ' ' + n(ry) + ' 0 1 0 ' + n(2 * rx) + ' 0a' + n(rx) + ' ' + n(ry) + ' 0 1 0 ' + n(-2 * rx) + ' 0z';
    },
    // part of an ellipse, angles in degrees, 0 = right, 90 = down
    arc: function (cx, cy, rx, ry, a0, a1, close) {
      var k = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 8)), s = '';
      for (var i = 0; i <= k; i++) {
        var a = (a0 + (a1 - a0) * i / k) * Math.PI / 180;
        s += (i ? L : M)(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
      }
      return close ? s + 'z' : s;
    },
    arcPts: function (cx, cy, rx, ry, a0, a1, k) {
      var out = [];
      k = k || Math.max(4, Math.ceil(Math.abs(a1 - a0) / 8));
      for (var i = 0; i <= k; i++) {
        var a = (a0 + (a1 - a0) * i / k) * Math.PI / 180;
        out.push(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
      }
      return out;
    },
    rr: function (x, y, w, h, r) {
      return M(x + r, y) + 'H' + n(x + w - r) + 'Q' + n(x + w) + ' ' + n(y) + ' ' + n(x + w) + ' ' + n(y + r) +
        'V' + n(y + h - r) + 'Q' + n(x + w) + ' ' + n(y + h) + ' ' + n(x + w - r) + ' ' + n(y + h) +
        'H' + n(x + r) + 'Q' + n(x) + ' ' + n(y + h) + ' ' + n(x) + ' ' + n(y + h - r) +
        'V' + n(y + r) + 'Q' + n(x) + ' ' + n(y) + ' ' + n(x + r) + ' ' + n(y) + 'z';
    },
    q: function (x1, y1, cx, cy, x2, y2) { return M(x1, y1) + 'Q' + n(cx) + ' ' + n(cy) + ' ' + n(x2) + ' ' + n(y2); },
    c: function (x1, y1, c1x, c1y, c2x, c2y, x2, y2) {
      return M(x1, y1) + 'C' + n(c1x) + ' ' + n(c1y) + ' ' + n(c2x) + ' ' + n(c2y) + ' ' + n(x2) + ' ' + n(y2);
    },
    // parallel lines at an angle (degrees), clipped to a rectangle
    hatch: function (x, y, w, h, ang, gap) {
      var a = ang * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
      var cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2, s = '';
      for (var t = -R; t <= R; t += gap) {
        var px = cx + nx * t, py = cy + ny * t;
        var seg = clip(px - dx * R * 2, py - dy * R * 2, px + dx * R * 2, py + dy * R * 2, x, y, x + w, y + h);
        if (seg) s += M(seg[0], seg[1]) + L(seg[2], seg[3]);
      }
      return s;
    },
    // running bond: courses of h, bricks of w
    bricks: function (x, y, w, h, bw, bh, skip) {
      var s = '', row = 0;
      for (var yy = y; yy < y + h - 0.5; yy += bh, row++) {
        var y2 = Math.min(y + h, yy + bh);
        s += P.hl(x, x + w, yy);
        var off = row % 2 ? bw / 2 : 0;
        for (var xx = x + off; xx < x + w; xx += bw) {
          if (xx <= x) continue;
          if (skip && skip(xx, yy)) continue;
          s += P.vl(xx, yy, y2);
        }
      }
      return s;
    },
    tiles: function (x, y, w, h, tw, th, bond) {
      var s = '', row = 0;
      for (var yy = y; yy <= y + h + 0.1; yy += th, row++) s += P.hl(x, x + w, yy);
      row = 0;
      for (yy = y; yy < y + h - 0.5; yy += th, row++) {
        var off = bond && row % 2 ? tw / 2 : 0;
        for (var xx = x + off; xx < x + w; xx += tw) if (xx > x + 0.5) s += P.vl(xx, yy, Math.min(y + h, yy + th));
      }
      return s;
    },
    // a short open curl, used for steam and leaves
    wave: function (x, y, len, amp, waves, vertical) {
      var k = Math.max(8, waves * 10), s = '';
      for (var i = 0; i <= k; i++) {
        var t = i / k, o = Math.sin(t * waves * Math.PI * 2) * amp;
        s += (i ? L : M)(vertical ? x + o : x + t * len, vertical ? y - t * len : y + o);
      }
      return s;
    }
  };

  // Liang-Barsky
  function clip(x1, y1, x2, y2, xmin, ymin, xmax, ymax) {
    var t0 = 0, t1 = 1, dx = x2 - x1, dy = y2 - y1, p = [-dx, dx, -dy, dy], q = [x1 - xmin, xmax - x1, y1 - ymin, ymax - y1];
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return null; }
      else {
        var r = q[i] / p[i];
        if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
        else { if (r < t0) return null; if (r < t1) t1 = r; }
      }
    }
    return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
  }

  // a seeded random, so a drawing is the same on every load
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function Drawing(w, h) { this.w = w; this.h = h; this.items = []; this.washes = []; this.actors = ''; this.defs = ''; }
  // a new object: o.f fill, o.k key line, o.q quiet line, o.d detail, o.t text
  Drawing.prototype.o = function () {
    var o = { f: '', x: '', k: '', q: '', d: '', t: '' };
    this.items.push(o);
    return o;
  };
  Drawing.prototype.wash = function (x, y, rx, ry, a, opts) {
    this.washes.push({ x: x, y: y, rx: rx, ry: ry == null ? rx : ry, a: a == null ? 1 : a, o: opts || {} });
  };
  Drawing.prototype.svg = function (mode) {
    var out = '<svg class="layer ' + mode + '" viewBox="0 0 ' + this.w + ' ' + this.h + '" aria-hidden="true" focusable="false">';
    if (this.defs) out += '<defs>' + this.defs + '</defs>';
    out += '<rect class="ground" width="' + this.w + '" height="' + this.h + '"/>';
    for (var i = 0; i < this.items.length; i++) {
      var o = this.items[i];
      if (o.f) out += '<path class="f" d="' + o.f + '"/>';
      if (o.x) out += '<path class="x" d="' + o.x + '"/>';
      if (o.d) out += '<path class="d" d="' + o.d + '"/>';
      if (o.q) out += '<path class="q" d="' + o.q + '"/>';
      if (o.k) out += '<path class="k" d="' + o.k + '"/>';
      if (o.t) out += o.t;
    }
    return out + '</svg>';
  };
  Drawing.prototype.actorSvg = function () {
    return '<svg class="layer actors" viewBox="0 0 ' + this.w + ' ' + this.h + '" aria-hidden="true" focusable="false">' + (this.actorDefs ? '<defs>' + this.actorDefs + '</defs>' : '') + this.actors + '</svg>';
  };
  Drawing.prototype.washHtml = function () {
    var w = this.w, h = this.h;
    return this.washes.map(function (s) {
      var st = 'left:' + n(s.x / w * 100) + '%;top:' + n(s.y / h * 100) + '%;width:' + n(s.rx * 2 / w * 100) + '%;height:' + n(s.ry * 2 / h * 100) + '%;--a:' + s.a;
      if (s.o.s != null) st += ';--s:' + s.o.s;
      if (s.o.d != null) st += ';--d:' + s.o.d + 's';
      if (s.o.style) st += ';' + s.o.style;
      return '<i class="w' + (s.o.cls ? ' ' + s.o.cls : '') + '" style="' + st + '"></i>';
    }).join('');
  };

  function text(x, y, str, cls, extra) {
    return '<text class="' + cls + '" x="' + n(x) + '" y="' + n(y) + '"' + (extra || '') + '>' + str + '</text>';
  }

  window.TooeyDraw = { P: P, Drawing: Drawing, rng: rng, text: text, n: n };
})();
