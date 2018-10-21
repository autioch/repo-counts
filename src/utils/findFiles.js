const glob = require('glob');
const { join, resolve } = require('path');

function buildSearchPattern(folderName, extensions) {
  const absoluteRoot = resolve(folderName);
  const filePattern = `*.{${extensions.join(',')}}`;
  const searchExpression = join(absoluteRoot, '**', filePattern);

  return searchExpression.replace(/\\/g, '/');
}

function buildIgnoreList(ignoredFolderNames) {
  return ignoredFolderNames
    .map((folderName) => folderName.replace(/\\/g, '/'))
    .map((folderName) => `**/${folderName}/**/*`);
}

function executeSearch(searchPattern, ignoreList) {
  return new Promise((res, rej) => {
    glob(searchPattern, {
      nofolderName: true,
      ignore: ignoreList
    }, (err, files) => {
      if (err) {
        rej(err);
      } else {
        res(files);
      }
    });
  });
}

module.exports = function findFiles(folderName, extensions, ignoredFolderNames) {
  const searchPattern = buildSearchPattern(folderName, extensions);
  const ignoreList = buildIgnoreList(ignoredFolderNames);

  return executeSearch(searchPattern, ignoreList);
};
