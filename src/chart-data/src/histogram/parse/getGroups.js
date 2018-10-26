/* eslint-disable max-len */
import { keyBy, uniq } from 'lodash';

function dateToYearMonth(date) {
  const [year, month] = date.split('-');

  return `${year}-${month.padStart(2, '0')}`;
}

function setCountsDict(repos) {
  Object.values(repos).forEach((repo) => {
    repo.counts.forEach((info) => {
      info.date = dateToYearMonth(info.date);
    });
    repo.dict = keyBy(repo.counts, 'date');
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
  const allDates = uniq(Object.values(repos).reduce((dates, repo) => dates.concat(repo.counts.map((count) => dateToYearMonth(count.date))), []));

  return allDates.map((date) => dateToYearMonth(date)).sort((dateA, dateB) => dateA.localeCompare(dateB));
}

function setSums(groups) {
  groups.forEach((group) => {
    group.countSum = group.bars.reduce((sum, bar) => sum + (bar.count || 0), 0);
  });
}

export default function getGroups(repos, deletionsInMonth, insertionsInMonth) {
  setCountsDict(repos);
  const steps = getRepoSteps(repos);
  const groups = steps.map((date) => ({
    date,
    deletions: deletionsInMonth[date],
    insertions: insertionsInMonth[date],
    bars: Object.values(repos).map((repo) => ({
      repoName: repo.config.repoName,
      color: repo.config.color,
      count: repo.dict[date] ? repo.dict[date].count.SUM.code : undefined
    }))
  }));

  fixMissingCounts(groups);
  setSums(groups);

  return groups;
}
