const { uniq } = require('lodash');

const idBuilders = {
  month(date) {
    const [year, month] = date.split('-');

    return `${year}-${month.padStart(2, '0')}`;
  },
  quarter(date) {
    const [year, month] = date.split('-');

    return `${year}/${Math.ceil(month / 3)}`;
  },
  year: (date) => date.split('-')[0]
};

/* TODO clean up this. */
function getRecords(repos, idBuilder) {
  return repos.reduce((obj, repo) => {
    const dict = {};

    obj[repo.config.repoName] = dict;
    repo.counts.forEach((count) => {
      const { date, count: { SUM: { code } } } = count;
      const countId = idBuilder(date);

      if (!dict[countId]) {
        dict[countId] = [];
      }
      dict[countId].push({
        date,
        count: code
      });
    }, {});

    Object.keys(dict).forEach((key) => {
      dict[key] = dict[key].sort((a, b) => a.date.localeCompare(b.date)).pop().count;
    });

    return obj;
  }, {});
}

function getSeries(repos, idBuilder) {
  const records = getRecords(repos, idBuilder);
  const allRecords = repos.reduce((arr, repo) => arr.concat(repo.counts.map((count) => idBuilder(count.date))), []);
  const uniqueRecords = uniq(allRecords.sort((dateA, dateB) => dateA.localeCompare(dateB)));
  const series = uniqueRecords.map((id) => ({
    id,
    header: id,
    countSum: 0,
    bars: repos.map((repo) => ({
      id: repo.config.repoName,
      color: repo.config.color,
      count: records[repo.config.repoName][id]
    }))
  }));

  series.forEach((group, index) => {
    group.countSum = group.bars.reduce((sum, bar, barIndex) => {
      if (!bar.count) {
        const previousGroup = series[index - 1];

        bar.count = previousGroup ? previousGroup.bars[barIndex].count : 0;
      }

      return sum + bar.count;
    }, 0);
  });

  return series;
}

export default function parseHistogram(repos, histogramKey) {
  const idBuilder = idBuilders[histogramKey];
  const series = getSeries(repos, idBuilder);
  const maxCount = Math.max(...series.map((group) => group.countSum));

  return {
    series,
    maxCount
  };
}
