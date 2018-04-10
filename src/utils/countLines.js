/* eslint-disable no-undefined */
const { join } = require('path');
const { execSync } = require('child_process');
const { omit } = require('lodash');
const ignored = require('../ignored');

const clocPath = join(__dirname, '..', '..', 'node_modules', 'cloc', 'lib', 'cloc');

const options = {
  'exclude-dir': ['node_modules', 'polyfills'].join(','),
  'exclude-ext': ignored.join(','),
  'exclude-lang': ignored.join(','),
  json: undefined
};

const cliOptions = Object.entries(options).reduce((arr, [key, val]) => {
  const option = `--${key}`;
  const value = val === undefined ? '' : `=${val}`;

  return arr.concat(option + value);
}, []).join(' ');

module.exports = function countLines(folder) {
  const resultsJson = execSync(`perl ${clocPath} ${cliOptions} ${folder}`);

  const results = JSON.parse(resultsJson);

  return omit(results, ['header']);
};
