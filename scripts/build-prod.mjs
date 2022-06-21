import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import { readFileSync } from 'fs';

const globals = readFileSync('src/globals.scss', 'utf-8');

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  target: 'es2020',
  globalName: 'BeeyPublish',
  format: 'esm',
  plugins: [sassPlugin({
    precompile: (source) => `${globals}\n${source}`,
  })],
  outfile: 'dist/beey-publish.min.js',
  minify: true,
});
