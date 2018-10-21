const analyzeLineInfos = require('./analyzeLineInfos');
const getFileLinesInfo = require('./getFileLinesInfo');
const { findFiles } = require('../../utils');

module.exports = async function getLinesInfo(repoConfig) {
  const { folder, extensions, ignoredFolderNames } = repoConfig;
  const fileNames = await findFiles(folder, extensions, ignoredFolderNames);
  const fileLineInfos = fileNames.reduce((arr, fileName) => arr.concat(getFileLinesInfo(fileName, folder)), []);
  const analyzedLineInfos = analyzeLineInfos(fileLineInfos);

  return analyzedLineInfos;
};
