const { omit } = require('lodash');
const { executeCommand } = require('../utils');
const { clocPath } = require('../config');

module.exports = function countLines(repoConfig) {
  const { folder, ignoredFolderNames, ignoredExtensions } = repoConfig;
  const exceludeDir = ignoredFolderNames.length ? `--exclude-dir=${ignoredFolderNames.join(',')}` : '';
  const exceludeExt = ignoredExtensions.length ? `--exclude-ext=${ignoredExtensions.join(',')}` : '';
  const resultsJson = executeCommand(`perl ${clocPath} --json ${exceludeDir} ${exceludeExt} ${folder}`);
  const results = JSON.parse(resultsJson);

  return omit(results, ['header']);
};
