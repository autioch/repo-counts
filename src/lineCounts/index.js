const countLines = require('./countLines');
const { clone, executeCommand, logRepoError } = require('../utils');
const qbLog = require('qb-log');

qbLog({
  count: {
    prefix: 'LINE COUNT',
    formatter: qbLog._chalk.green
  },
  countDate: {
    prefix: 'COUNT DATE',
    formatter: qbLog._chalk.cyan
  }
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getNextMonthFirstDay(dateString) {
  const date = new Date(dateString);

  date.setMonth(date.getMonth() + 1);
  date.setDate(1);

  return formatDate(date);
}

function findFirstCommitInMonth(commits, yearAndMonth) {
  return commits.find(({ date }) => yearAndMonth === date.slice(0, 7));
}

const today = formatDate(new Date());

module.exports = function getLineCounts(repoConfig, commits) { // eslint-disable-line max-statements
  qbLog.count(repoConfig.repoName);
  qbLog.countDate(today, 'TODAY');
  const currentCount = countLines(repoConfig);

  if (!commits.length) {
    logRepoError('No commits', {}, repoConfig);

    return [];
  }

  const [startCommit] = commits;
  const endTime = new Date().getTime();
  const counts = [];

  let nextDate = startCommit.date;
  let commit;

  while (new Date(nextDate).getTime() < endTime) {
    commit = findFirstCommitInMonth(commits, nextDate.slice(0, 7));

    if (commit) {
      qbLog.countDate(commit.date);
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

  return counts.concat({
    date: today,
    count: currentCount
  });
};
