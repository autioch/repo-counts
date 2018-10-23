const { omit } = require('lodash');
const { objToCli, executeCommand } = require('../utils');
const { clocPath, clocIgnored } = require('../config');

const options = objToCli({
  'exclude-dir': ['node_modules', 'polyfills'].join(','),
  'exclude-ext': clocIgnored.join(','),
  'exclude-lang': clocIgnored.join(','),
  json: undefined
});

module.exports = function countLines(repoConfig) {
  const { folder } = repoConfig;
  const resultsJson = executeCommand(`perl ${clocPath} ${options} ${folder}`);
  const results = JSON.parse(resultsJson);

  return omit(results, ['header']);
};
