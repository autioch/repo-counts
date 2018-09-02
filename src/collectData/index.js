const getCommits = require('./getCommits');
const createCountLines = require('./countLines');
const getNthCommitInfo = require('./getNthCommitInfo');
const { clone } = require('./utils');
const { writeFile } = require('../utils');
const nextMonthCommit = require('./nextMonthCommit');
const goToCommit = require('./goToCommit');
const qbLog = require('qb-log');

function scanRepo(folder, ignored, clocPath) {
  qbLog.empty();
  qbLog.info(folder);
  process.chdir(folder);

  const countLines = createCountLines(clocPath, ignored);

  const startCommit = getNthCommitInfo(3); // eslint-disable-line no-magic-numbers
  const commits = getCommits(startCommit.hash).reverse();

  goToCommit(startCommit.hash);

  const counts = [{
    date: startCommit.date,
    count: countLines(folder)
  }];

  for (const { commit, date } of nextMonthCommit(commits, startCommit.date)) {
    qbLog.info(date, commit ? commit.text : '---');
    goToCommit(commit.hash);

    counts.push({
      date,
      count: commit ? countLines(folder) : clone(counts[counts.length - 1].count)
    });
  }

  return {
    counts,
    commits
  };
}

function gatherData(repo, ignored, clocPath) {
  const { folder, repoName } = repo;
  const { counts, commits } = scanRepo(folder, ignored, clocPath);

  return writeFile(`${repoName}__counts.json`, JSON.stringify(counts, null, '  '))
    .then(() => writeFile(`${repoName}__commits.json`, JSON.stringify(commits, null, '  ')));
}

module.exports = function collectData({ repos, ignored, clocPath }) {
  return repos.reduce((promise, repo) => promise.then(() => gatherData(repo, ignored, clocPath)), Promise.resolve());
};
