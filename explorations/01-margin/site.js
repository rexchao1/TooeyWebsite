/* Tooey "Margin" exploration: phone menu, the worksheet, the sheet notes, the contact form. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Phone menu ---------- */
  var top = document.querySelector('.top');
  var toggle = document.querySelector('.nav-toggle');
  if (top && toggle) {
    var close = function (focusToggle) {
      top.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (focusToggle) toggle.focus();
    };
    toggle.addEventListener('click', function () {
      var open = top.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    top.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { close(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && top.classList.contains('open')) close(true);
    });
    document.addEventListener('click', function (e) {
      if (top.classList.contains('open') && !top.contains(e.target)) close(false);
    });
  }

  /* ---------- Sheet notes: point at a note, its column lights up ---------- */
  var sheet = document.getElementById('sheet');
  if (sheet) {
    document.querySelectorAll('.sheet-notes li[data-col]').forEach(function (li) {
      var cells = [];
      li.getAttribute('data-col').split(' ').forEach(function (c) {
        sheet.querySelectorAll('.' + c).forEach(function (el) { cells.push(el); });
      });
      var on = function () { cells.forEach(function (el) { el.classList.add('hl'); }); };
      var off = function () { cells.forEach(function (el) { el.classList.remove('hl'); }); };
      li.addEventListener('mouseenter', on);
      li.addEventListener('mouseleave', off);
    });
  }

  /* ---------- Worksheet ---------- */
  var ws = document.getElementById('ws');
  var lastWorksheet = null;
  if (ws) {
    var $ = function (id) { return document.getElementById(id); };
    var inDish = $('w-dish'), inCost = $('w-cost'), inPrice = $('w-price'), inBin = $('w-bin'), inMiss = $('w-miss');
    var send = $('ws-send'), hint = $('ws-hint');

    var parse = function (el) {
      var v = String(el.value || '').replace(/[$,\s]/g, '');
      if (v === '') return null;
      var n = Number(v);
      return isFinite(n) && n >= 0 ? n : NaN;
    };
    var money = function (n) {
      return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    var count = function (n) {
      return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
    };
    var loss = function (n) { return n > 0 ? '(' + money(n) + ')' : money(0); };
    var setText = function (id, text) {
      var el = $(id);
      if (el.textContent === text) return;
      el.textContent = text;
      if (!reduceMotion && el.tagName === 'DD') {
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
      }
    };

    var update = function () {
      var dish = (inDish.value || '').trim() || 'this dish';
      var cost = parse(inCost), price = parse(inPrice), bin = parse(inBin), miss = parse(inMiss);
      [inCost, inPrice, inBin, inMiss].forEach(function (el) {
        el.setAttribute('aria-invalid', isNaN(parse(el)) ? 'true' : 'false');
      });

      var c = cost > 0 ? cost : 0;
      var p = price > 0 ? price : 0;
      var b = bin > 0 ? bin : 0;
      var m = miss > 0 ? miss : 0;
      var margin = Math.max(p - c, 0);

      setText('o-each-bin', loss(c));
      setText('o-each-miss', loss(margin));
      setText('o-bin-calc', count(b) + ' × ' + money(c));
      setText('o-miss-calc', count(m) + ' × ' + money(margin));
      setText('o-bin', loss(b * c));
      setText('o-miss', loss(m * margin));
      setText('o-total', loss(b * c + m * margin));

      var say;
      // "Braised short rib" reads as "braised short rib" mid-sentence; "BLT" stays "BLT".
      var name = /^[A-Z][a-z]/.test(dish) ? dish.charAt(0).toLowerCase() + dish.slice(1) : dish;
      if (!(cost > 0) || !(price > 0)) {
        say = 'Fill in what a plate costs and what it sells for, and the comparison shows up here.';
      } else if (price <= cost) {
        say = 'At these numbers, ' + name + ' doesn’t cover its own plate cost. That’s worth a conversation on its own.';
      } else {
        var ratio = margin / cost;
        if (ratio >= 1.05) {
          say = 'For ' + name + ', a missed order can cost up to ' + (Math.round(ratio * 10) / 10).toLocaleString('en-US') + ' times what a portion in the bin does.';
        } else if (ratio > 0.95) {
          say = 'For ' + name + ', a missed order and a portion in the bin cost you about the same.';
        } else {
          say = 'For ' + name + ', a portion in the bin costs more than a missed order. Not every dish leans the same way.';
        }
      }
      setText('o-say', say);

      lastWorksheet = {
        dish: (inDish.value || '').trim(),
        cost: cost, price: price, bin: bin, miss: miss,
        total: b * c + m * margin
      };
    };

    [inDish, inCost, inPrice, inBin, inMiss].forEach(function (el) {
      el.addEventListener('input', update);
    });
    ws.addEventListener('submit', function (e) { e.preventDefault(); });
    update();

    if (send) {
      send.hidden = false;
      if (hint) hint.hidden = false;
      send.addEventListener('click', function () {
        var w = lastWorksheet || {};
        var fmt = function (v, isMoney) {
          if (v === null || v === undefined || isNaN(v)) return '?';
          return isMoney ? '$' + money(v) : count(v);
        };
        var lines = [
          'From the worksheet on your site:',
          'Dish: ' + (w.dish || '(not named)'),
          'Plate cost: ' + fmt(w.cost, true) + '. Menu price: ' + fmt(w.price, true) + '.',
          'Thrown out last week: ' + fmt(w.bin) + '. Orders missed after it ran out (a guess): ' + fmt(w.miss) + '.',
          'Up to $' + money(w.total || 0) + ' for this dish last week.'
        ];
        var msg = document.getElementById('f-message');
        var note = document.getElementById('prefilled');
        if (msg) {
          var block = lines.join('\n');
          var existing = msg.value.replace(/From the worksheet on your site:[\s\S]*?for this dish last week\.\n*/m, '').trim();
          msg.value = block + (existing ? '\n\n' + existing : '\n\n');
          if (note) note.hidden = false;
          var target = document.getElementById('talk');
          if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
          var name = document.getElementById('f-name');
          window.setTimeout(function () { (name && !name.value ? name : msg).focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
        }
      });
    }
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact');
  if (form) {
    var status = document.getElementById('f-status');
    var button = document.getElementById('f-send');
    var fields = {
      name: { el: document.getElementById('f-name'), err: document.getElementById('e-name'), msg: 'Tell us your name.' },
      restaurant: { el: document.getElementById('f-restaurant'), err: document.getElementById('e-restaurant'), msg: 'Which restaurant is this for?' },
      email: { el: document.getElementById('f-email'), err: document.getElementById('e-email'), msg: 'We need an email address to write back.' }
    };
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

    var check = function (key) {
      var f = fields[key];
      var v = f.el.value.trim();
      var bad = !v || (key === 'email' && !emailOk(v));
      var text = !v ? f.msg : (key === 'email' && !emailOk(v) ? 'That email address doesn’t look complete.' : '');
      f.err.textContent = bad ? text : '';
      f.el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      return !bad;
    };
    Object.keys(fields).forEach(function (key) {
      fields[key].el.addEventListener('blur', function () {
        if (fields[key].el.value.trim() || fields[key].err.textContent) check(key);
      });
      fields[key].el.addEventListener('input', function () {
        if (fields[key].err.textContent) check(key);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(fields).forEach(function (key) {
        if (!check(key) && !firstBad) firstBad = fields[key].el;
      });
      if (firstBad) { firstBad.focus(); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });
      if (data._honey) return; // a bot filled the hidden field

      button.disabled = true;
      button.innerHTML = 'Sending…';
      status.className = 'status';
      status.textContent = '';

      fetch('https://formsubmit.co/ajax/tooeyteam@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            if (!r.ok || String(j.success) !== 'true') throw new Error('not sent');
          });
        })
        .then(function () {
          var wrap = document.getElementById('form-wrap');
          var sent = document.createElement('div');
          sent.className = 'sent';
          sent.setAttribute('tabindex', '-1');
          var h = document.createElement('h3');
          h.textContent = 'Thanks. Your message is with us.';
          var p = document.createElement('p');
          p.textContent = 'We’ll write back to ' + data.email + '. If you think of something else, email tooeyteam@gmail.com.';
          sent.appendChild(h);
          sent.appendChild(p);
          wrap.innerHTML = '';
          wrap.appendChild(sent);
          sent.focus();
        })
        .catch(function () {
          button.disabled = false;
          button.innerHTML = 'Send <span class="arr" aria-hidden="true">→</span>';
          status.className = 'status bad';
          var body = 'Name: ' + (data.name || '') + '\nRestaurant: ' + (data.restaurant || '') + '\nPhone: ' + (data.phone || '') + '\nPOS: ' + (data.pos || '') + '\n\n' + (data.message || '');
          var href = 'mailto:tooeyteam@gmail.com?subject=' + encodeURIComponent('New Tooey inquiry') + '&body=' + encodeURIComponent(body);
          status.innerHTML = '';
          status.appendChild(document.createTextNode('That didn’t go through. Nothing you typed is lost: try again, or '));
          var a = document.createElement('a');
          a.href = href;
          a.textContent = 'send it by email instead';
          status.appendChild(a);
          status.appendChild(document.createTextNode('.'));
        });
    });
  }
})();
