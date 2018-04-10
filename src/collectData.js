/* eslint-disable no-undefined */
const { writeFile } = require('./utils');
const getRepoHistory = require('./utils/getRepoHistory');

const repos = require('./repos');

function scanRepo(repo) {
  const { folder, repoName } = repo;

  console.log('SCAN REPO', folder, repoName);

  const { counts, commits } = getRepoHistory(folder);

  console.log('REPO RESULT', counts.length, commits.length);

  return writeFile(`${repoName}__counts.json`, JSON.stringify(counts, null, '  '))
    .then(() => writeFile(`${repoName}__commits.json`, JSON.stringify(commits, null, '  ')));
}

repos.reduce((promise, repo) => promise.then(() => scanRepo(repo)), Promise.resolve());
