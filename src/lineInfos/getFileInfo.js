const { executeCommand } = require('../utils');
const { relative, dirname, basename } = require('path');
const parseLine = require('./parseLine');

module.exports = function getFileInfo(filePath, folderPath) {
  const folderName = dirname(filePath);
  const fileName = basename(filePath);

  const relativePath = relative(folderPath, filePath);
  const fileContents = executeCommand(`git blame --date=short -c ${relativePath}`);

  const lines = fileContents.split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => parseLine(line))
    .filter((lineInfo) => !!lineInfo);

  const lineCount = lines.length;

  return {
    folderName,
    fileName,
    lineCount,
    lines
  };
};