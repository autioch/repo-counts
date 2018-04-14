const getCommits = require('./getCommits');
const countLines = require('./countLines');
const getNthCommitInfo = require('./getNthCommitInfo');
const { clone } = require('./utils');
const { writeFile } = require('../utils');
const nextMonthCommit = require('./nextMonthCommit');

function scanRepo(folder) {
  process.chdir(folder);

  const startCommit = getNthCommitInfo(3); // eslint-disable-line no-magic-numbers
  const commits = getCommits(startCommit.hash).reverse();
  const counts = [{
    date: startCommit.date,
    count: countLines(folder, startCommit.hash)
  }];

  for (const { commit, date } of nextMonthCommit(commits, startCommit.date)) {
    counts.push({
      date,
      count: commit ? countLines(folder, commit.hash) : clone(counts[counts.length - 1].count)
    });
  }

  return {
    counts,
    commits
  };
}

function gatherData(repo) {
  const { folder, repoName } = repo;
  const { counts, commits } = scanRepo(folder);

  return writeFile(`${repoName}__counts.json`, JSON.stringify(counts, null, '  '))
    .then(() => writeFile(`${repoName}__commits.json`, JSON.stringify(commits, null, '  ')));
}

module.exports = function collectData(repos) {
  return repos.reduce((promise, repo) => promise.then(() => gatherData(repo)), Promise.resolve());
};
