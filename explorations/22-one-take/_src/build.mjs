// Bundles the take into ../take.js. Run: node build.mjs  (from _src, after npm install)
import { build } from 'esbuild';

const entry = process.argv[2] || 'take.js';
const outfile = process.argv[3] || '../take.js';

await build({
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  minify: true,
  target: ['es2020'],
  outfile,
  legalComments: 'none',
  logLevel: 'info',
});
