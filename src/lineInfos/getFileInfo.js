const { executeCommand } = require('../utils');
const { relative, basename, extname, dirname } = require('path');
const parseLine = require('./parseLine');
const { languages } = require('../config');

module.exports = function getFileInfo(filePath, folderPath) {
  const fileName = basename(filePath);
  const extension = extname(fileName).replace('.', '').toLowerCase();
  const relativePath = relative(folderPath, filePath);
  const fileContents = executeCommand(`git blame --date=short -c "${relativePath}"`);
  const lines = fileContents.trim().split('\n')
    .map((line) => parseLine(filePath, line))
    .filter((info) => !!info.length);

  return {
    folderName: dirname(relativePath),
    fileName,
    fileType: languages[extension] || extension,
    lines
  };
};
