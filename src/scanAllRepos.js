/* eslint-disable no-undefined */
const { writeFile } = require('./utils');
const collectData = require('./collectData');

const repos = require('./repos');

function scanRepo(repo) {
  const { folder, repoName } = repo;
  const { counts, commits } = collectData(folder);

  return writeFile(`${repoName}__counts.json`, JSON.stringify(counts, null, '  '))
    .then(() => writeFile(`${repoName}__commits.json`, JSON.stringify(commits, null, '  ')));
}

repos.reduce((promise, repo) => promise.then(() => scanRepo(repo)), Promise.resolve());
