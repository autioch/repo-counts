const { executeCommand } = require('../utils');
const { relative, dirname, basename, extname } = require('path');
const parseLine = require('./parseLine');

// const { languages } = require('../config');

module.exports = function getFileInfo(filePath, folderPath) {
  const folderName = dirname(filePath);
  const fileName = basename(filePath);
  const extension = extname(fileName).replace('.', '');
  const fileType = /* languages[extension] || */ extension;
  const relativePath = relative(folderPath, filePath);
  const fileContents = executeCommand(`git blame --date=short -c ${relativePath}`);

  const lines = fileContents.split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => parseLine(line, fileType))
    .filter((lineInfo) => !!lineInfo);

  const lineCount = lines.length;

  return {
    folderName,
    fileName,
    lineCount,
    lines
  };
};
