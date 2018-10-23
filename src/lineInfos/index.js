const analyzeFileInfos = require('./analyzeFileInfos');
const getFileInfo = require('./getFileInfo');
const { findFiles } = require('../utils');
const qbLog = require('qb-log');

qbLog._add('linesInfo', {
  prefix: 'LINE INFO',
  formatter: qbLog._chalk.green
});

module.exports = async function getLinesInfo(repoConfig) {
  qbLog.linesInfo(repoConfig.repoName);

  const { folder, extensions, ignoredFolderNames } = repoConfig;
  const filePaths = await findFiles(folder, extensions, ignoredFolderNames);
  const fileLineInfos = filePaths.reduce((arr, filePath) => arr.concat(getFileInfo(filePath, folder)), []);
  const analyzedLineInfos = analyzeFileInfos(fileLineInfos);

  return analyzedLineInfos;
};
