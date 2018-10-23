const { repos } = require('./config');
const { writeFile } = require('./utils');
const gatherData = require('./gatherData');
const qbLog = require('qb-log')('simple');

const gatheredData = {};

(async () => {
  for (const repoConfig of repos) {
    const data = await gatherData(repoConfig); // eslint-disable-line no-await-in-loop

    gatheredData[repoConfig.repoName] = data;
  }
})()
  .then(() => writeFile('data.json', gatheredData).then(() => qbLog.empty('DONE')));
