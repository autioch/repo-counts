const { getCommits, findFirstCommitInMonth, getNextMonthFirstDay, getNthCommitInfo, clone } = require('./index');
const countLines = require('./countLines');
const { execSync } = require('child_process');

const SECOND = 3;

function countCommit(folder, hash) {
  execSync(`git reset --hard`);
  execSync(`git checkout ${hash}`);

  return countLines(folder);
}

module.exports = function getRepoHistory(folder) {
  process.chdir(folder);

  const now = new Date().getTime();
  const { hash, date } = getNthCommitInfo(SECOND);

  let currentDateString = date;
  const commits = getCommits(hash).reverse();
  const counts = [{
    date,
    count: countCommit(folder, hash)
  }];

  while (new Date(currentDateString).getTime() < now) {
    currentDateString = getNextMonthFirstDay(currentDateString);

    const commit = findFirstCommitInMonth(commits, currentDateString);

    console.log('WHILE', currentDateString, commit ? commit.date : 'no commits');

    const count = commit ? countCommit(folder, commit.hash) : clone(counts[counts.length - 1].count);

    counts.push({
      date: currentDateString,
      count
    });
  }

  return {
    counts,
    commits
  };
};
