const analyzeFileInfos = require('./analyzeFileInfos');
const getFileInfo = require('./getFileInfo');
const { findFiles } = require('../../utils');

module.exports = async function getLinesInfo(repoConfig) {
  const { folder, extensions, ignoredFolderNames } = repoConfig;
  const filePaths = await findFiles(folder, extensions, ignoredFolderNames);
  const fileLineInfos = filePaths.reduce((arr, filePath) => arr.concat(getFileInfo(filePath, folder)), []);
  const analyzedLineInfos = analyzeFileInfos(fileLineInfos);

  return analyzedLineInfos;
};
