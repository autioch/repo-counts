const { executeCommand, logRepoError } = require('./utils');
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

module.exports = async function gatherData(repoConfig) {
  qbLog.empty();
  qbLog.repo(repoConfig.repoName);

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
    executeCommand(`git checkout`);
  } catch (err) {
    logRepoError(`Failed to restore repository`, err, repoConfig);
  }

  return result;
};
