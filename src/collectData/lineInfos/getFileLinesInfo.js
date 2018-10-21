const { executeCommand } = require('../../utils');
const { relative, dirname } = require('path');
const qbLog = require('qb-log');

function parseLineInfo(lineInfo, fileName, folderName) {
  const [hash, authorWithBracket, date, lineDetails = ''] = lineInfo.split('\t').map((item) => item.trim());
  const author = authorWithBracket.slice(1).trim().toLowerCase();
  const bracketIndex = lineDetails.indexOf(')');
  const line = bracketIndex > 0 ? lineDetails.slice(bracketIndex + 1).trim() : '';

  if (!date) {
    qbLog.info('Failed to parse line');
    qbLog.empty(lineInfo, [hash, authorWithBracket, date, lineDetails]);
  }

  if (!line.length) {
    return false;
  }

  return {
    author,
    date,
    fileName,
    folderName,
    line
  };
}

function parseLines(fileContents, fileName, folderName) {
  return fileContents
    .split('\n')
    .map((line) => line.trim())
    .filter((lineInfo) => lineInfo.length > 0)
    .map((lineInfo) => parseLineInfo(lineInfo, fileName, folderName))
    .filter((lineInfo) => !!lineInfo);
}

module.exports = function getFileLinesInfo(fileName, repoFolder) {
  const relativePath = relative(repoFolder, fileName);
  const folderName = dirname(fileName);
  const fileContents = executeCommand(`git blame --date=short -c ${relativePath}`);
  const lineInfos = parseLines(fileContents, fileName, folderName);

  return lineInfos;
};
