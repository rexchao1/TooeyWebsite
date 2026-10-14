// Bundles the scene (with Three.js) into ../assets/scene.js.
import { build } from 'esbuild';
await build({
  entryPoints: ['scene/main.js'],
  bundle: true,
  format: 'esm',
  minify: true,
  target: ['es2020'],
  outfile: '../assets/scene.js',
  legalComments: 'eof',
  banner: { js: '/* Tooey kitchen scene. Includes three.js (MIT, Copyright 2010-2025 three.js authors). */' },
});
console.log('built ../assets/scene.js');
