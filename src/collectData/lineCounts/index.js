const getCommitList = require('./getCommitList');
const countLines = require('./countLines');
const getNthCommitInfo = require('./getNthCommitInfo');
const nextMonthCommit = require('./nextMonthCommit');
const { clone, executeCommand } = require('../../utils');

function goToCommit(commitHash) {
  executeCommand('git reset --hard');
  executeCommand(`git checkout ${commitHash}`);
}

module.exports = function getLineCounts(repoConfig) {
  const { folder } = repoConfig;
  const startCommit = getNthCommitInfo(3); // eslint-disable-line no-magic-numbers
  const commits = getCommitList(startCommit.hash).reverse();

  goToCommit(startCommit.hash);

  const counts = [{
    date: startCommit.date,
    count: countLines(folder)
  }];

  for (const { commit, date } of nextMonthCommit(commits, startCommit.date)) {
    if (commit) {
      goToCommit(commit.hash);
    }

    counts.push({
      date,
      count: commit ? countLines(folder) : clone(counts[counts.length - 1].count)
    });
  }

  return {
    counts,
    commits
  };
};
