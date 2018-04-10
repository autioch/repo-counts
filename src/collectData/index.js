const getCommits = require('./getCommits');
const { countCommit, getNthCommitInfo, clone, getNextMonthFirstDay, findFirstCommitInMonth } = require('./utils');
const { writeFile } = require('../utils');

function scanRepo(folder) {
  process.chdir(folder);

  const now = new Date().getTime();
  const { hash, date } = getNthCommitInfo(3); // eslint-disable-line no-magic-numbers

  let currentDateString = date;
  const commits = getCommits(hash).reverse();
  const counts = [{
    date,
    count: countCommit(folder, hash)
  }];

  while (new Date(currentDateString).getTime() < now) {
    currentDateString = getNextMonthFirstDay(currentDateString);

    const commit = findFirstCommitInMonth(commits, currentDateString);

    counts.push({
      date: currentDateString,
      count: commit ? countCommit(folder, commit.hash) : clone(counts[counts.length - 1].count)
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
