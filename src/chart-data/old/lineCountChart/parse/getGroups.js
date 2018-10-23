/* eslint-disable max-len */
const { keyBy: indexBy, uniq } = require('lodash');
const dateToYearMonth = require('./dateToYearMonth');

function setCountsDict(repos) {
  repos.forEach((repo) => {
    repo.counts.forEach((info) => {
      info.date = dateToYearMonth(info.date);
    });
    repo.dict = indexBy(repo.counts, 'date');
  });
}

function fixMissingCounts(groups) {
  groups.forEach((group, index) => group.bars.forEach((bar, barIndex) => {
    if (bar.count) {
      return;
    }
    const previousGroup = groups[index - 1];

    bar.count = previousGroup ? previousGroup.bars[barIndex].count : 0;
  }));
}

function getRepoSteps(repos) {
  const allDates = uniq(repos.reduce((dates, repo) => dates.concat(repo.counts.map((count) => dateToYearMonth(count.date))), []));

  return allDates.map((date) => dateToYearMonth(date)).sort((dateA, dateB) => dateA.localeCompare(dateB));
}

function setSums(groups) {
  groups.forEach((group) => {
    group.countSum = group.bars.reduce((sum, bar) => sum + (bar.count || 0), 0);
  });
}

module.exports = function getGroups(repos, deletionsInMonth, insertionsInMonth) {
  setCountsDict(repos);
  const steps = getRepoSteps(repos);
  const groups = steps.map((date) => ({
    date,
    deletions: deletionsInMonth[date],
    insertions: insertionsInMonth[date],
    bars: repos.map((repo) => ({
      repoName: repo.repoName,
      color: repo.color,
      count: repo.dict[date] ? repo.dict[date].count.SUM.code : undefined
    }))
  }));

  fixMissingCounts(groups);
  setSums(groups);

  return groups;
};
