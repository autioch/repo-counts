/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const { keyBy: indexBy, uniq, flatten, groupBy } = require('lodash');

function formatDate(date) {
  const [year, month] = date.split('-');

  return `${year}-${month.length < 2 ? `0${month}` : month}`;
}

function getReportedTypes(data) {
  const types = [];

  data.forEach((datum) => {
    datum.counts.forEach((info) => {
      types.push(Object.keys(info.count));
    });
  });

  return uniq(flatten(types)).filter((type) => type !== 'SUM').sort();
}

module.exports = function parse(data, commitsData) {
  const dateChanges = commitsData.reduce((arr, repo) => arr.concat(
    repo.commits.map((commit) => ({
      date: formatDate(commit.date),
      deletions: commit.deletions,
      insertions: commit.insertions
    }))
  ), []);

  const changesInMonth = Object.entries(groupBy(dateChanges, 'date'));

  const deletionsInMonth = changesInMonth.reduce((dict, [date, commits]) => {
    dict[date] = commits.reduce((sum, commit) => sum + commit.deletions, 0);

    return dict;
  }, {});

  const insertionsInMonth = changesInMonth.reduce((dict, [date, commits]) => {
    dict[date] = commits.reduce((sum, commit) => sum + commit.insertions, 0);

    return dict;
  }, {});

  data.forEach((datum) => {
    datum.counts.forEach((info) => {
      info.date = formatDate(info.date);
    });
    datum.dict = indexBy(datum.counts, 'date');
  });

  const allDates = uniq(data.reduce((dates, repo) => dates.concat(repo.counts.map((count) => count.date)), []));
  const changed = allDates
    .map((date) => formatDate(date))
    .sort((a, b) => a.localeCompare(b));

  const groups = changed.map((date) => ({
    date,
    deletions: deletionsInMonth[date],
    insertions: insertionsInMonth[date],
    bars: data.map((datum) => ({
      repoName: datum.repo.repoName,
      color: datum.repo.color,
      count: datum.dict[date] ? datum.dict[date].count.SUM.code : undefined
    }))
  }));

  groups.forEach((group, index) => group.bars.forEach((bar, barIndex) => {
    if (bar.count) {
      return;
    }

    bar.count = groups[index] ? groups[index].bars[barIndex].count : 0;
  }));

  const types = getReportedTypes(data);

  return {
    types,
    groups
  };
};
