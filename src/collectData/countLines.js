/* eslint-disable no-undefined */
const { join } = require('path');
const { execSync } = require('child_process');
const { omit } = require('lodash');
const ignored = require('../ignored');
const { optionsToCli } = require('../utils');

const clocPath = join(__dirname, '..', '..', 'node_modules', 'cloc', 'lib', 'cloc');

const options = optionsToCli({
  'exclude-dir': ['node_modules', 'polyfills'].join(','),
  'exclude-ext': ignored.join(','),
  'exclude-lang': ignored.join(','),
  json: undefined
});

module.exports = function countLines(folder) {
  const resultsJson = execSync(`perl ${clocPath} ${options} ${folder}`);
  const results = JSON.parse(resultsJson);

  return omit(results, ['header']);
};
