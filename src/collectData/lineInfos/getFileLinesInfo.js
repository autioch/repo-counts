const { executeCommand } = require('../../utils');
const { relative, dirname } = require('path');

function parseLines(fileContents, fileName, folderName) {
  return fileContents
    .split('\n')
    .map((line) => line.trim().split('\t'))
    .filter((lineInfo) => lineInfo.length > 0)
    .map((lineInfo) => {
      const [/* hash */, author, date, lineDetails = ''] = lineInfo;

      const bracketIndex = lineDetails.indexOf(')');

      if (bracketIndex > 0 && !lineDetails.slice(bracketIndex + 1).trim().length) {
        return false;
      }

      return {
        author,
        date,
        fileName,
        folderName
      };
    })
    .filter((lineInfo) => !!lineInfo);
}

module.exports = function getFileLinesInfo(fileName, repoFolder) {
  const relativePath = relative(repoFolder, fileName);
  const fileContents = executeCommand(`git blame --date=short -c ${relativePath}`);
  const folderName = dirname(fileName);
  const lineInfos = parseLines(fileContents, fileName, folderName);

  return lineInfos;
};
