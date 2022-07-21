/* eslint-disable import/no-extraneous-dependencies */
import { build } from 'esbuild';

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  target: 'es2020',
  globalName: 'BeeyPublish',
  format: 'esm',
  outfile: 'dist/beey-publish.min.js',
  minify: true,
});
