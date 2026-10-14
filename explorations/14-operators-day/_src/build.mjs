// node _src/build.mjs  (from the exploration folder or anywhere)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shopSVG, baseSVG } from './scene.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tpl = readFileSync(join(here, 'index.template.html'), 'utf8');
const out = tpl.replace('<!--SHOP-->', shopSVG()).replace('<!--BASE-->', baseSVG());
writeFileSync(join(here, '..', 'index.html'), out);
console.log('index.html written', out.length, 'bytes');
