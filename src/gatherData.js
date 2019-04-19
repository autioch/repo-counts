const { executeCommand, logRepoError, writeFile, isCachedFile, readFile } = require('./utils');
const lineCounts = require('./lineCounts');
const lineInfos = require('./lineInfos');
const commits = require('./commits');
const qbLog = require('qb-log');

qbLog({
  repo: {
    prefix: 'REPO',
    formatter: qbLog._chalk.magenta
  }
});

module.exports = async function gatherData(repoConfig) { // eslint-disable-line max-statements
  qbLog.empty();
  qbLog.repo(repoConfig.repoName);

  const fileName = `${repoConfig.repoName}.json`;

  if (isCachedFile(fileName)) {
    qbLog.info('Founc cached data', repoConfig.repoName);
    const cachedResult = JSON.parse(readFile(fileName));

    return cachedResult;
  }

  const result = {
    config: repoConfig
  };

  try {
    process.chdir(repoConfig.folder);
  } catch (err) {
    logRepoError(`Failed to change dir`, err, repoConfig);

    return result;
  }

  try {
    executeCommand('git reset --hard');
    executeCommand(`git checkout`);
  } catch (err) {
    logRepoError(`Failed to prepare repository`, err, repoConfig);
  }

  try {
    result.lineInfo = await lineInfos(repoConfig);
  } catch (err) {
    logRepoError(`Failed to measure line info`, err, repoConfig);
  }

  try {
    const commitList = commits(repoConfig);
    const counts = await lineCounts(repoConfig, commitList);

    result.commitList = commitList;
    result.counts = counts;
  } catch (err) {
    logRepoError(`Failed to count lines`, err, repoConfig);
  }

  try {
    executeCommand('git reset --hard');
    executeCommand(`git checkout`);
  } catch (err) {
    logRepoError(`Failed to restore repository`, err, repoConfig);
  }

  writeFile(fileName, result);

  return result;
};
