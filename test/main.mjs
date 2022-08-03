import 'cross-fetch/dist/node-polyfill.js';
import { JSDOM } from 'jsdom';
import { promises as fs } from 'fs';
import { describe, it } from 'mocha';
import { deepStrictEqual } from 'assert';
import { TrsxFile } from '../cjs/trsx-file.js';
import { simpleTrsx, simpleTrsxWithKeywords } from './expected/simple-trsx.mjs';
import { attachKeywords } from '../cjs/trsx.js';

const jsdom = new JSDOM();
global.DOMParser = jsdom.window.DOMParser;

const loadSimpleTrsx = async () => {
  const content = await fs.readFile('./test/expected/simple.trsx');
  const trsxFile = new TrsxFile({ content });
  return trsxFile.parse();
};

describe('TRSX parsing:', () => {
  it('simple trsx', async () => {
    const result = await loadSimpleTrsx();
    deepStrictEqual(result, simpleTrsx);
  });
});

describe('Keywords:', () => {
  it('simple keywords', async () => {
    const result = await loadSimpleTrsx();
    const kwContent = await fs.readFile('./test/expected/simple-keywords.json');
    const keywords = JSON.parse(kwContent);
    attachKeywords(keywords, result);
    deepStrictEqual(result, simpleTrsxWithKeywords);
  });
});
