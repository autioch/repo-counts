const { omit } = require('lodash');
const { optionsToCli, executeCommand } = require('./utils');

module.exports = function createCounter(clocPath, ignored) {
  const options = optionsToCli({
    'exclude-dir': ['node_modules', 'polyfills'].join(','),
    'exclude-ext': ignored.join(','),
    'exclude-lang': ignored.join(','),
    json: undefined
  });

  return function count(folder) {
    const resultsJson = executeCommand(`perl ${clocPath} ${options} ${folder}`);
    const results = JSON.parse(resultsJson);

    return omit(results, ['header']);
  };
};
