const { writeFile, executeCommand, logRepoError } = require('../utils');
const lineCounts = require('./lineCounts');
const lineInfos = require('./lineInfos');
const qbLog = require('qb-log');

qbLog({
  repo: {
    prefix: 'REPO',
    formatter: qbLog._chalk.magenta
  }
});

const preparationStep = (repoConfig) => process.chdir(repoConfig.folder);

const collectInfoStep = async (repoConfig) => {
  const linesInfo = await lineInfos(repoConfig);

  await writeFile(`${repoConfig.repoName}__linesInfo.json`, linesInfo);
};

const collectCountStep = async (repoConfig) => {
  const { counts, commits } = lineCounts(repoConfig);

  await writeFile(`${repoConfig.repoName}__counts.json`, counts);
  await writeFile(`${repoConfig.repoName}__commits.json`, commits);
};

const finishStep = () => executeCommand(`git checkout`);

async function runStep(step, repoConfig) {
  try {
    await step(repoConfig);
  } catch (err) {
    logRepoError(`${step.header} - FAIL`, err, repoConfig);

    return false;
  }

  return true;
}

module.exports = async function collectData(repoConfig) {
  qbLog.empty();
  qbLog.repo(repoConfig.folder);
  const isPrepared = await runStep(preparationStep, repoConfig);

  if (!isPrepared) {
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
