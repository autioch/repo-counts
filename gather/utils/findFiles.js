const glob = require('glob');
const { join, resolve } = require('path');

function buildSearchPattern(folderName, ignoredExtensions) {
  const absoluteRoot = resolve(folderName);

  const ignored = ignoredExtensions.concat('gitignore', 'gitattributes');
  const filePattern = `*.!(${ignored.join('|')})`;
  const searchExpression = join(absoluteRoot, '**', filePattern);

  return searchExpression.replace(/\\/g, '/');
}

function buildIgnoreList(ignoredFolderNames) {
  return ignoredFolderNames.concat('.git')
    .map((folderName) => folderName.replace(/\\/g, '/'))
    .map((folderName) => `**/${folderName}/**/*`);
}

function executeSearch(searchPattern, ignoreList) {
  return new Promise((res, rej) => {
    glob(searchPattern, {
      nofolderName: true,
      nodir: true,
      dot: true,
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
  const result = executeSearch(searchPattern, ignoreList);

  return result;
};
