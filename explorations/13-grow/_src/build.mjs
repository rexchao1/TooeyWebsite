// node _src/build.mjs  -> writes ../index.html with the drawing inlined
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWorld } from './plan.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tpl = readFileSync(join(here, 'index.html'), 'utf8');
const world = `<g id="everything">\n${buildWorld()}\n</g>`;
writeFileSync(join(here, '..', 'index.html'), tpl.replace('<!--WORLD-->', world));
console.log('built index.html');
