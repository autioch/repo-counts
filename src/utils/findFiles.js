const glob = require('glob');
const { join, resolve } = require('path');
const { writeFile } = require('./misc');

function buildSearchPattern(folderName, ignoredExtensions) {
  const absoluteRoot = resolve(folderName);
  const filePattern = `*.!(${ignoredExtensions.join('|')})`;
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

module.exports = function findFiles(folderName, ignoredFolderNames, ignoredExtensions) {
  const searchPattern = buildSearchPattern(folderName, ignoredExtensions);
  const ignoreList = buildIgnoreList(ignoredFolderNames);

  // console.log(searchPattern, ignoreList);

  const result = executeSearch(searchPattern, ignoreList);

  return result.then((files) => {
    writeFile('findFiles.tmp', files);

    return files;
  });
};
