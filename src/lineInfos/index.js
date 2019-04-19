const analyzeFileInfos = require('./analyzeFileInfos');
const getFileInfo = require('./getFileInfo');
const { findFiles } = require('../utils');
const { rawInfoDetails } = require('../config');
const qbLog = require('qb-log');

qbLog._add('linesInfo', {
  prefix: 'LINE INFO',
  formatter: qbLog._chalk.green
});

module.exports = async function getLinesInfo(repoConfig) {
  qbLog.linesInfo(repoConfig.repoName);

  const { folder, ignoredFolderNames, ignoredExtensions } = repoConfig;
  const filePaths = await findFiles(folder, ignoredFolderNames, ignoredExtensions);
  const fileLineInfos = filePaths.reduce((arr, filePath) => arr.concat(getFileInfo(filePath, folder)), []);

  if (rawInfoDetails) {
    return fileLineInfos;
  }

  const analyzedLineInfos = analyzeFileInfos(fileLineInfos);

  return analyzedLineInfos;
};
