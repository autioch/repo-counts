const { omit } = require('lodash');
const { executeCommand, objToCli } = require('../utils');
const { clocPath } = require('../config');

const options = objToCli({
  // 'by-file': undefined,
  json: undefined,
  'skip-uniqueness': undefined
});

module.exports = function countLines(repoConfig) {
  const { folder, ignoredFolderNames, ignoredExtensions } = repoConfig;
  const exceludeDir = ignoredFolderNames.length ? `--exclude-dir=${ignoredFolderNames.join(',')}` : '';
  const exceludeExt = ignoredExtensions.length ? `--exclude-ext=${ignoredExtensions.join(',')}` : '';
  const resultsJson = executeCommand(`perl ${clocPath} ${options} ${exceludeDir} ${exceludeExt} ${folder}`);

  const results = JSON.parse(resultsJson.replace(/\\/gi, '/'));

  return omit(results, ['header']);
};
