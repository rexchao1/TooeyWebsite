/* Tooey, exploration 08: "The department".
   A chain's demand-planning org chart grows, holds, and collapses into one
   person: the owner. Tooey lights up beside them and grows its own small
   chart, whose reports are tomorrow's prep counts.
   Every frame is a pure function of time, so the sequence can be replayed
   or seeked (window.__tooey.seek(ms)) without drift. */
(() => {
  'use strict';

  const stage = document.querySelector('[data-stage]');
  if (stage) initStage(stage);
  const form = document.querySelector('.form');
  if (form) initForm(form);

  function initStage(stage) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = stage.querySelector('.wires');
    const youMark = stage.querySelector('.you-mark');
    const ownerLine = stage.querySelector('.owner-line');
    const tooeyMark = stage.querySelector('.tooey-mark');
    const tooeyName = stage.querySelector('.tooey-name');
    const cap = stage.querySelector('.dishes-cap');
    const items = [...stage.querySelectorAll('.dishes li')];
    const replay = stage.querySelector('.replay');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');

    // Split the owner line into words, each a fixed-width slot so the
    // width-axis animation never reflows the line.
    const text = ownerLine.textContent.trim();
    ownerLine.setAttribute('aria-label', text);
    ownerLine.innerHTML = text.split(/\s+/).map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    const words = [...ownerLine.querySelectorAll('.w')];

    // ——— timeline (ms) ———
    const T = {
      label: [0, 260],
      grow: 120, level: 300,          // level k lines start at grow + k*level
      collapse: 2100,
      you: 2930,
      words: 3020, wordStep: 62, wordDur: 520,
      link: 3520,
      tooey: 3780,
      bus: 4130,
      dishes: 4330, dishStep: 90,
      end: 5150,
    };

    let L = null;          // geometry
    let t = 0, start = 0, raf = 0, mode = 'idle';

    // ——— helpers ———
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const prog = (time, s, d) => clamp((time - s) / d);
    const easeOut = p => 1 - Math.pow(1 - p, 3);
    const easeInOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const easeIn = p => p * p * p;
    function spring(ms, zeta = .55, w = 15) {
      if (ms <= 0) return 0;
      const s = ms / 1000, wd = w * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w * s) * (Math.cos(wd * s) + (zeta * w / wd) * Math.sin(wd * s));
    }
    const lerp = (a, b, p) => a + (b - a) * p;
    const mix = (c1, c2, p) => '#' + [0, 2, 4].map(i => Math.round(lerp(parseInt(c1.substr(i, 2), 16), parseInt(c2.substr(i, 2), 16), p)).toString(16).padStart(2, '0')).join('');
    const el = (name, attrs, parent) => {
      const n = document.createElementNS(NS, name);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    };

    // ——— geometry ———
    function rel(node) {
      const s = stage.getBoundingClientRect(), r = node.getBoundingClientRect();
      return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height, cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2 };
    }

    function build() {
      // fix word slots at their final width
      words.forEach(w => { w.style.width = ''; w.style.fontStretch = ''; w.style.fontWeight = ''; });
      words.forEach(w => { w.style.width = Math.ceil(w.getBoundingClientRect().width) + 'px'; });

      svg.textContent = '';
      const W = stage.clientWidth, H = stage.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const defs = el('defs', {}, svg);
      const sym = el('symbol', { id: 'person', viewBox: '0 0 44 44' }, defs);
      el('circle', { cx: 22, cy: 13, r: 8.5 }, sym);
      el('path', { d: 'M5 43c0-11 7.6-18 17-18s17 7 17 18z' }, sym);

      const still = stage.classList.contains('still');
      const you = rel(youMark), tooey = rel(tooeyMark);
      const top = 0;
      const pad = parseFloat(getComputedStyle(stage).paddingBottom) || 0;
      const deptH = still ? parseFloat(getComputedStyle(stage).paddingTop) - 56 : Math.max(300, H - pad - 10);
      const dept = layoutDept({ x: 0, y: top, w: W, h: deptH }, still);

      const gDept = el('g', {}, svg);
      dept.lines.forEach(l => { l.node = el('path', { d: l.d, class: 'dept-line', pathLength: 1, 'stroke-dasharray': '1 2' }, gDept); });
      dept.label.node = el('text', { x: dept.label.x, y: dept.label.y, 'text-anchor': 'middle', class: 'root-label' }, gDept);
      dept.label.node.textContent = 'Demand planning';
      dept.people.forEach(p => {
        p.g = el('g', { class: 'person' }, gDept);
        el('use', { href: '#person', x: -p.s / 2, y: -p.s / 2, width: p.s, height: p.s }, p.g);
      });

      // collapse geometry: everyone is drawn into the owner
      const tx = you.cx, ty = you.cy;
      let maxD = 1;
      dept.people.forEach(p => { p.d = Math.hypot(p.x - tx, p.y - ty); maxD = Math.max(maxD, p.d); });
      dept.people.forEach(p => {
        const n = p.d / maxD;
        const h = Math.abs(Math.sin((p.x * 12.9898 + p.y * 78.233)) * 43758.5453) % 1;
        p.cs = T.collapse + 40 + 250 * n + (h - .5) * 120;
        p.cd = 540 + 180 * n + h * 80;
        // control point: swing perpendicular to the path, mostly one way (a vortex), never the same twice
        const mx = (p.x + tx) / 2, my = (p.y + ty) / 2, dx = tx - p.x, dy = ty - p.y;
        const sw = .06 + .42 * h;
        p.qx = mx - dy * sw; p.qy = my + dx * sw;
      });


      // Tooey's wires: owner → Tooey → each dish
      const wires = [];
      const yb = you.y + you.h + 6, tt = tooey.cy - 19;
      wires.push({ d: `M${you.cx} ${yb} V${tt}`, s: T.link, dur: 280 });
      const tb = tooey.cy + 19;
      const rects = items.map(li => rel(li));
      const counts = items.map(li => rel(li.querySelector('.count')));
      const row = rects.every(r => Math.abs(r.y - rects[0].y) < 4);
      rects.forEach((r, i) => {
        let d;
        if (row) {
          const busY = r.y + 4;
          d = `M${tooey.cx} ${tb} V${busY} H${r.x + 2} V${r.y + 15}`;
        } else {
          const y = counts[i].cy;
          d = `M${tooey.cx} ${tb} V${y} H${r.x - 12}`;
        }
        wires.push({ d, s: T.bus + i * 70, dur: 360 + i * 40 });
      });
      wires.forEach(w => { w.node = el('path', { d: w.d, class: 'wire', pathLength: 1, 'stroke-dasharray': '1 2' }, svg); });

      L = { dept, wires, still };
    }

    function layoutDept(r, small) {
      const W = r.w;
      const wide = W >= 900, mid = W >= 560;
      const n1 = wide ? 4 : 3, n2 = wide ? 3 : mid ? 3 : 2, n3 = small ? 4 : (wide ? 6 : mid ? 5 : 6);
      const k = small ? (wide ? .8 : .7) : (wide ? 1.12 : mid ? .95 : .82);
      const S = [26 * k, 20 * k, 15 * k];
      const lines = [], people = [];
      const rootX = r.x + W / 2, labelY = r.y + 16, rootY = r.y + 26;
      const y1 = r.y + r.h * (small ? .24 : .19), y2 = r.y + r.h * (small ? .45 : .37);
      const leafTop = y2 + S[1] / 2 + (small ? 16 : 26);
      const step = Math.min(44, (r.y + r.h - 6 - leafTop) / Math.max(1, n3 - 1));
      const slots = n1 * n2, slotW = W / slots;
      const elbow = (x0, y0, x1, y1) => { const m = Math.round((y0 + y1) / 2) + .5; return `M${x0} ${y0} V${m} H${x1} V${y1}`; };

      for (let a = 0; a < n1; a++) {
        const mgrs = [];
        for (let b = 0; b < n2; b++) mgrs.push(r.x + slotW * (a * n2 + b + .5));
        const dx = mgrs.reduce((s, v) => s + v, 0) / mgrs.length;
        lines.push({ d: elbow(rootX, rootY, dx, y1 - S[0] / 2 - 4), level: 0, i: a });
        people.push({ x: dx, y: y1, s: S[0], level: 0, i: a });
        mgrs.forEach((mx, b) => {
          const idx = a * n2 + b;
          lines.push({ d: elbow(dx, y1 + S[0] / 2 + 3, mx, y2 - S[1] / 2 - 4), level: 1, i: idx });
          people.push({ x: mx, y: y2, s: S[1], level: 1, i: idx });
          const spine = mx - S[2] * .9;
          for (let c = 0; c < n3; c++) {
            const ly = leafTop + c * step, lx = mx + S[2] * .55;
            const li = idx * n3 + c;
            lines.push({ d: `M${mx} ${y2 + S[1] / 2 + 3} V${y2 + S[1] / 2 + 9} H${spine} V${ly} H${lx - S[2] / 2 - 3}`, level: 2, i: li, c });
            people.push({ x: lx, y: ly, s: S[2], level: 2, i: li, c });
          }
        });
      }
      return { lines, people, label: { x: rootX, y: labelY } };
    }

    // ——— render one moment ———
    function lineStart(l) { return T.grow + l.level * T.level + (l.level === 2 ? l.c * 45 : l.level === 1 ? (l.i % 3) * 25 : l.i * 30); }
    function lineDur(l) { return l.level === 2 ? 300 : 280; }

    function render(time) {
      if (!L) return;
      const still = L.still;
      const { dept } = L;

      // department: grow, hold, collapse
      const undraw = easeInOut(prog(time, T.collapse, 380));
      dept.label.node.setAttribute('opacity', still ? 1 : (prog(time, T.label[0], T.label[1]) * (1 - prog(time, T.collapse, 200))).toFixed(3));
      dept.lines.forEach(l => {
        const p = still ? 1 : easeInOut(prog(time, lineStart(l), lineDur(l)));
        const off = 1 - p + undraw * p; // grow 1→0, then retract toward the parent
        l.node.setAttribute('stroke-dashoffset', still ? 0 : off.toFixed(4));
        l.node.setAttribute('opacity', still ? .85 : 1);
      });
      dept.people.forEach(p => {
        if (still) { p.g.setAttribute('transform', `translate(${p.x} ${p.y})`); return; }
        const appear = lineStart({ level: p.level, i: p.i, c: p.c }) + (p.level === 2 ? 300 : 280) * .8;
        const sc = spring(time - appear);
        const u = easeIn(prog(time, p.cs, p.cd));
        let x = p.x, y = p.y, k = sc, op = sc > 0 ? 1 : 0;
        if (u > 0) {
          const v = 1 - u;
          x = v * v * p.x + 2 * v * u * p.qx + u * u * L.tx();
          y = v * v * p.y + 2 * v * u * p.qy + u * u * L.ty();
          k = 1 - .7 * u;
          op = u < .82 ? 1 : 1 - (u - .82) / .18;
          p.g.setAttribute('fill', mix('534F8C', '2C1A13', u));
        } else p.g.removeAttribute('fill');
        p.g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${Math.max(0, k).toFixed(3)})`);
        p.g.setAttribute('opacity', op.toFixed(3));
      });

      // the owner arrives
      const ys = still ? 1 : spring(time - T.you, .5, 16);
      youMark.style.opacity = still ? 1 : clamp((time - T.you) / 90);
      youMark.style.transform = `scale(${lerp(.35, 1, ys).toFixed(3)})`;

      words.forEach((w, j) => {
        const p = still ? 1 : easeOut(prog(time, T.words + j * T.wordStep, T.wordDur));
        w.style.opacity = clamp(p * 2.2).toFixed(3);
        w.style.fontStretch = lerp(75, 125, p).toFixed(1) + '%';
        w.style.fontWeight = Math.round(lerp(380, 820, p));
      });

      // Tooey lights up beside them
      const tp = still ? 1 : spring(time - T.tooey, .45, 17);
      tooeyMark.style.opacity = still ? 1 : clamp((time - T.tooey) / 120);
      tooeyMark.style.transform = `scale(${Math.max(0, tp).toFixed(3)})`;
      const np = still ? 1 : easeOut(prog(time, T.tooey + 140, 480));
      tooeyName.style.opacity = np.toFixed(3);
      tooeyName.style.fontStretch = lerp(75, 125, np).toFixed(1) + '%';

      L.wires.forEach(w => {
        const p = still ? 1 : easeInOut(prog(time, w.s, w.dur));
        w.node.setAttribute('stroke-dashoffset', (1 - p).toFixed(4));
      });

      cap.style.opacity = still ? 1 : easeOut(prog(time, T.bus + 60, 400)).toFixed(3);
      items.forEach((li, j) => {
        const s = T.dishes + j * T.dishStep;
        const p = still ? 1 : easeOut(prog(time, s, 260));
        li.style.opacity = p.toFixed(3);
        const c = li.querySelector('.count'), n = +c.dataset.n;
        if (n) c.textContent = still ? n : Math.round(n * easeOut(prog(time, s, 640)));
      });
    }

    function frame(now) {
      t = now - start;
      render(t);
      if (t < T.end) raf = requestAnimationFrame(frame);
      else finish();
    }
    function finish() {
      mode = 'done'; t = T.end; render(T.end);
      replay.hidden = false;
      requestAnimationFrame(() => replay.classList.add('on'));
    }
    function play() {
      cancelAnimationFrame(raf);
      stage.classList.remove('pending');
      replay.classList.remove('on');
      mode = 'playing';
      start = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function setup() {
      build();
      const yc = rel(youMark); // layout does not move during play
      L.tx = () => yc.cx; L.ty = () => yc.cy;
    }

    // reduced motion: a designed still, the department above the owner
    function applyMode() {
      cancelAnimationFrame(raf);
      if (reduce.matches) {
        stage.classList.add('still');
        stage.classList.remove('pending');
        replay.hidden = true;
        setup(); render(T.end); mode = 'done';
      } else {
        stage.classList.remove('still');
        setup();
        if (mode === 'done') { render(T.end); replay.hidden = false; replay.classList.add('on'); }
        else if (mode === 'idle') { stage.classList.add('pending'); render(0); }
      }
    }

    stage.classList.add('pending');
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
    Promise.all([fontsReady, loaded]).then(() => {
      applyMode();
      // keep geometry true to the layout (font swap, width change, reflow)
      let rt = 0, lastBox = '';
      new ResizeObserver(() => {
        const box = stage.offsetWidth + 'x' + stage.offsetHeight + 'x' + youMark.offsetTop + 'x' + tooeyMark.offsetTop;
        if (box === lastBox) return;
        lastBox = box;
        clearTimeout(rt);
        rt = setTimeout(() => { setup(); render(mode === 'playing' || mode === 'seek' ? t : mode === 'done' ? T.end : 0); }, 80);
      }).observe(stage);
      if (reduce.matches) return;
      const io = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting) && mode === 'idle') { io.disconnect(); setTimeout(play, 250); }
      }, { threshold: .3 });
      io.observe(stage);
    });

    replay.addEventListener('click', () => { if (!reduce.matches) play(); });
    reduce.addEventListener('change', applyMode);

    // for frame capture and review
    window.__tooey = {
      seek(ms) { cancelAnimationFrame(raf); stage.classList.remove('pending'); mode = 'seek'; t = ms; render(ms); },
      play, end: T.end,
    };
  }

  function initForm(form) {
    const status = form.querySelector('.status');
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.textContent;
    const req = ['name', 'restaurant', 'email'].map(n => form.elements[n]);
    const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    req.forEach(i => i.addEventListener('input', () => i.removeAttribute('aria-invalid')));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.classList.remove('bad');
      const bad = req.filter(i => !i.value.trim() || (i.name === 'email' && !emailOk(i.value.trim())));
      req.forEach(i => bad.includes(i) ? i.setAttribute('aria-invalid', 'true') : i.removeAttribute('aria-invalid'));
      if (bad.length) {
        status.classList.add('bad');
        status.textContent = 'Add your name, your restaurant, and an email we can reply to.';
        bad[0].focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) { status.textContent = 'Thanks. We will reply by email.'; form.reset(); return; }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      status.textContent = '';
      try {
        const res = await fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) !== 'true') throw new Error('not sent');
        form.reset();
        status.textContent = 'Sent. We will reply from tooeyteam@gmail.com.';
      } catch (err) {
        const body = encodeURIComponent(`Name: ${data.name}\nRestaurant: ${data.restaurant}\nEmail: ${data.email}\nPhone: ${data.phone || ''}\nPOS: ${data.pos || ''}\n\n${data.message || ''}`);
        status.classList.add('bad');
        status.innerHTML = `That did not send. Email us at <a href="mailto:tooeyteam@gmail.com?subject=${encodeURIComponent('New Tooey inquiry')}&body=${body}">tooeyteam@gmail.com</a> instead.`;
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }
})();
