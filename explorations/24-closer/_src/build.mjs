// Bundles the page script and the scene. Run: node build.mjs (from _src).
// Stills (img/*.webp) are rendered separately by stills.mjs.
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'js');

await esbuild.build({
  entryPoints: { main: path.join(here, 'main.js'), hero: path.join(here, 'hero.js') },
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  outdir: out,
  chunkNames: 'chunk-[hash]',
  legalComments: 'none',
  logLevel: 'info',
});

// Build-time only: the stills renderer, never loaded by the site.
await esbuild.build({
  entryPoints: { stills: path.join(here, 'stills.js') },
  bundle: true,
  format: 'esm',
  minify: false,
  outdir: path.join(here, 'out'),
  logLevel: 'info',
});
