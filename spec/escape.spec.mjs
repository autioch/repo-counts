/* eslint-env mocha  */
/* eslint-disable max-nested-callbacks */
import assert from 'assert';

import { escapeHtml, quoteCsv } from '../src/escape.mjs';

const escapeHtmlTestCases = [
  ['plain', 'plain'],
  ['<b>', '&lt;b&gt;'],
  ['a & b', 'a &amp; b'],
  ['"quoted"', '&quot;quoted&quot;'],
  ['it\'s', 'it&#39;s'],
  ['&amp;', '&amp;amp;'],
  [42, '42']
];

const quoteCsvTestCases = [
  ['plain', '"plain"'],
  ['a;b', '"a;b"'],
  ['say "hi"', '"say ""hi"""'],
  ['x\ny', '"x\ny"'],
  ['=1+1', '"=1+1"'],
  [7, '"7"'],
  [null, '""']
];

describe('escape', () => {
  describe('escapeHtml', () => {
    escapeHtmlTestCases.forEach(([input, expected]) => it(`${JSON.stringify(input)} to ${expected}`, () => assert.deepEqual(escapeHtml(input), expected)));
  });

  describe('quoteCsv', () => {
    quoteCsvTestCases.forEach(([input, expected]) => it(`${JSON.stringify(input)} to ${expected}`, () => assert.deepEqual(quoteCsv(input), expected)));
  });
});
