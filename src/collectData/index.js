const { writeFile, executeCommand, logRepoError } = require('../utils');
const lineCounts = require('./lineCounts');
const lineInfos = require('./lineInfos');
const qbLog = require('qb-log');

const preparationStep = {
  header: 'Scan repo',
  fn: (repoConfig) => process.chdir(repoConfig.folder)
};

const collectInfoStep = {
  header: 'Lines info',
  async fn(repoConfig) {
    const linesInfo = await lineInfos(repoConfig);

    await writeFile(`${repoConfig.repoName}__linesInfo.json`, linesInfo);
  }
};

const collectCountStep = {
  header: 'Lines count',
  async fn(repoConfig) {
    const { counts, commits } = lineCounts(repoConfig);

    await writeFile(`${repoConfig.repoName}__counts.json`, counts);
    await writeFile(`${repoConfig.repoName}__commits.json`, commits);
  }
};

const finishStep = {
  header: 'Finish',
  fn: () => executeCommand(`git checkout`)
};

async function runStep(step, repoConfig) {
  qbLog.info(step.header, repoConfig.folder);

  try {
    await step.fn(repoConfig);
  } catch (err) {
    logRepoError(`${step.header} - FAIL`, err, repoConfig);

    return false;
  }

  return true;
}

module.exports = async function collectData(repoConfig) {
  const preparationSuccess = await runStep(preparationStep, repoConfig);

  if (!preparationSuccess) {
    return;
  }

  if (repoConfig.collectInfo) {
    await runStep(collectInfoStep, repoConfig);
  }

  if (repoConfig.collectCount) {
    await runStep(collectCountStep, repoConfig);
  }

  await runStep(finishStep, repoConfig);
};
