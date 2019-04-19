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
function getRecords(repos, idBuilder, fileTypes) {
  return repos.reduce((obj, repo) => {
    const dict = {};

    obj[repo.config.repoName] = dict;
    (repo.counts || []).forEach((count) => {
      const { date, count: codes } = count;
      const countId = idBuilder(date);

      if (!dict[countId]) {
        dict[countId] = [];
      }
      dict[countId].push({
        date,
        count: fileTypes
          .filter((type) => !!codes[type.id])
          .map((type) => codes[type.id].code + codes[type.id].comment + codes[type.id].blank)
          .reduce((sum, type) => sum + type, 0)
      });
    }, {});

    Object.keys(dict).forEach((key) => {
      dict[key] = dict[key].sort((a, b) => a.date.localeCompare(b.date)).pop().count;
    });

    return obj;
  }, {});
}

function getSeries(repos, idBuilder, fileTypes) {
  const records = getRecords(repos, idBuilder, fileTypes);
  const allRecords = repos.reduce((arr, repo) => arr.concat((repo.counts || []).map((count) => idBuilder(count.date))), []);
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

const singles = 1;
const tens = 10;
const hundreds = 100;
const thousands = 1000;
const scalesCount = 4;

const rounding = {
  '1': singles,
  '2': tens,
  '3': hundreds,
  '4': hundreds,
  '5': thousands,
  '6': thousands
};

function getMaxCount(series) {
  const maxCount = Math.max(...series.map((group) => group.countSum));

  const orderOfMagnitue = maxCount.toString().length;
  const roundingAmount = rounding[orderOfMagnitue];

  if (roundingAmount) {
    return Math.ceil(maxCount / roundingAmount) * roundingAmount;
  }

  return roundingAmount;
}

function getScales(maxCount) {
  const valueCount = maxCount > scalesCount ? scalesCount : maxCount;
  const values = [maxCount];

  for (let index = 1; index < valueCount; index++) {
    values.push(Math.ceil(maxCount / valueCount * (valueCount - index)));
  }

  return values.concat(0);
}

export default function parseHistogram(repos, histogramKey, fileTypes) {
  const activeFileTypes = fileTypes.filter((fileType) => !fileType.isDisabled);
  const idBuilder = idBuilders[histogramKey];
  const series = getSeries(repos.filter((repo) => !repo.isDisabled), idBuilder, activeFileTypes);
  const maxCount = getMaxCount(series);
  const scales = getScales(maxCount);

  return {
    scales,
    series,
    maxCount
  };
}
