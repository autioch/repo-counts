/* eslint-disable max-len */
import { keyBy, uniq, groupBy } from 'lodash';

function dateToYearMonth(date) {
  const [year, month] = date.split('-');

  return `${year}-${month.padStart(2, '0')}`;
}

function prepareRepoCommits(repo) {
  return repo.commitList.map((commit) => Object.assign({}, commit, {
    date: dateToYearMonth(commit.date)
  }));
}

function prepareCommits(repos) {
  const allCommits = Object.values(repos).reduce((arr, repo) => arr.concat(prepareRepoCommits(repo)), []);
  const commitListInMonth = Object.entries(groupBy(allCommits, 'date'));

  return commitListInMonth;
}

function summarizeCommitProp(changesInMonth, prop) {
  return changesInMonth.reduce((dict, [date, commitList]) => {
    dict[date] = commitList.reduce((sum, commit) => sum + commit[prop], 0);

    return dict;
  }, {});
}

function getChangesPerMonth(repos) {
  const changesInMonth = prepareCommits(repos);
  const deletions = summarizeCommitProp(changesInMonth, 'deletions');
  const insertions = summarizeCommitProp(changesInMonth, 'insertions');

  return {
    insertions,
    deletions
  };
}

function getGroups(repos, deletionsInMonth, insertionsInMonth) {
  Object.values(repos).forEach((repo) => {
    repo.counts.forEach((info) => {
      info.date = dateToYearMonth(info.date);
    });
    repo.dict = keyBy(repo.counts, 'date');
  });
  const allDates = uniq(Object.values(repos).reduce((dates, repo) => dates.concat(repo.counts.map((count) => dateToYearMonth(count.date))), []));
  const steps = allDates.map((date) => dateToYearMonth(date)).sort((dateA, dateB) => dateA.localeCompare(dateB));
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

  groups.forEach((group, index) => group.bars.forEach((bar, barIndex) => {
    if (bar.count) {
      return;
    }
    const previousGroup = groups[index - 1];

    bar.count = previousGroup ? previousGroup.bars[barIndex].count : 0;
  }));

  groups.forEach((group) => {
    group.countSum = group.bars.reduce((sum, bar) => sum + (bar.count || 0), 0);
  });

  return groups;
}

export default function parseHistogram(repos) {
  const { deletions, insertions } = getChangesPerMonth(repos);
  const series = getGroups(repos, deletions, insertions);
  const maxCount = Math.max(...series.map((group) => group.countSum));

  return {
    series,
    maxCount
  };
}
