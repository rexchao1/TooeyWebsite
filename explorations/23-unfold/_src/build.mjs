// Bundles the scene into ../scene.js.
//   npm install --prefix <dir> three@0.180.0 esbuild
//   UNFOLD_NODE_MODULES=<dir>/node_modules node _src/build.mjs
// (node_modules is never committed; it can also live in _src/node_modules.)
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const nm = process.env.UNFOLD_NODE_MODULES || path.join(here, 'node_modules');
const esbuild = await import(pathToFileURL(path.join(nm, 'esbuild/lib/main.js')).href);

const res = await esbuild.build({
  entryPoints: [path.join(here, 'scene/main.js')],
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  outfile: path.join(here, '..', 'scene.js'),
  nodePaths: [nm],
  legalComments: 'eof',
  metafile: true,
  logLevel: 'warning'
});
const out = Object.entries(res.metafile.outputs).map(([f, o]) => `${path.basename(f)} ${(o.bytes / 1024).toFixed(0)} KB`);
console.log(out.join('\n'));
