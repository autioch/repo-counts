const countLines = require('./countLines');
const commitList = require('./commitList');
const { clone, executeCommand } = require('../../utils');
const qbLog = require('qb-log');

function getNextMonthFirstDay(dateString) {
  const date = new Date(dateString);

  date.setMonth(date.getMonth() + 1);
  date.setDate(1);

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function findFirstCommitInMonth(commits, dateString) {
  const [chosenYear, chosenMonth] = dateString.split('-');

  return commits.find(({ year, month }) => year === chosenYear && month === chosenMonth);
}

module.exports = function getLineCounts(repoConfig) {
  const commits = commitList();
  const [startCommit] = commits;

  const endTime = new Date().getTime();
  const counts = [];

  let nextDate = startCommit.date;
  let commit;

  while (new Date(nextDate).getTime() < endTime) {
    console.log(nextDate);
    commit = findFirstCommitInMonth(commits, nextDate);

    if (commit) {
      qbLog.info('Line count', commit.date);
      executeCommand('git reset --hard');
      executeCommand(`git checkout ${commit.hash}`);
    }

    const previous = counts[counts.length - 1];

    counts.push({
      date: nextDate,
      count: commit ? countLines(repoConfig) : clone(previous ? previous.count : {})
    });

    nextDate = getNextMonthFirstDay(nextDate);
  }

  return {
    counts,
    commits
  };
};
