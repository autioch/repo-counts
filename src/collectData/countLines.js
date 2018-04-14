/* eslint-disable no-undefined */
const { join } = require('path');
const { execSync } = require('child_process');
const { omit } = require('lodash');
const { optionsToCli, execSyncOptions } = require('./utils');

module.exports = function countLines(folder, commitHash, ignored, clocPath) {
  const options = optionsToCli({
    'exclude-dir': ['node_modules', 'polyfills'].join(','),
    'exclude-ext': ignored.join(','),
    'exclude-lang': ignored.join(','),
    json: undefined
  });

  execSync(`git reset --hard`, execSyncOptions);
  execSync(`git checkout ${commitHash}`, execSyncOptions);

  const resultsJson = execSync(`perl ${clocPath} ${options} ${folder}`, execSyncOptions);
  const results = JSON.parse(resultsJson);

  return omit(results, ['header']);
};
