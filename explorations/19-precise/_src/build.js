// Renders each figure's resting state into the page, so it reads without
// JavaScript and under reduced motion. Run: node _src/build.js
'use strict';
const fs = require('fs');
const path = require('path');
const F = require('../figures.js');

const root = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const check = F._check();
if (check.fittedMinusNeedMin < 0) {
  throw new Error('Fitted shifts fall short of the need curve by ' + check.fittedMinusNeedMin.toFixed(3));
}

const out = tpl.replace(/<!--fig:(\w+):(\w+)-->/g, (_, name, variant) => {
  const fig = F.figures[name];
  if (!fig) throw new Error('Unknown figure ' + name);
  const [w, h] = fig.size(variant);
  return '<svg class="fig fig--' + variant + '" data-variant="' + variant + '" viewBox="0 0 ' + w + ' ' + h +
    '" aria-hidden="true" focusable="false">' + fig.render(variant, fig.end) + '</svg>';
});

fs.writeFileSync(path.join(root, 'index.html'), out);
console.log('index.html written; fitted minus need, minimum:', check.fittedMinusNeedMin.toFixed(3));
