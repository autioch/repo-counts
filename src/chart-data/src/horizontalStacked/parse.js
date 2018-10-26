import { uniq } from 'lodash';
import { nextColor } from '../utils';

function getQuarter(month) {
  return Math.ceil(month / 3);
}

function setDict(obj, id, count) {
  if (!obj[id]) {
    obj[id] = {
      count: 0
    };
  }

  obj[id].count += count;

  return obj;
}

function setPandC(item, totalLines) {
  item.percentage = ((item.count / totalLines) * 100).toFixed(1);
  item.count = (item.count / 1000).toFixed(1);
}

function parseRepo([repoName, { lineInfo: { date } }]) {
  let totalLines = 0;
  const months = {};
  const quarters = {};
  const years = {};

  Object.entries(date).forEach(([day, count]) => {
    const [year, month] = day.split('-');

    totalLines += count;
    setDict(months, `${year}-${month}`, count);
    setDict(quarters, `${year}/${getQuarter(month)}`, count);
    setDict(years, year.slice(2), count);
  });

  Object.values(months).forEach((item) => setPandC(item, totalLines));
  Object.values(quarters).forEach((item) => setPandC(item, totalLines));
  Object.values(years).forEach((item) => setPandC(item, totalLines));

  return {
    repoName,
    totalLines,
    months,
    quarters,
    years
  };
}

function getBarSerie(repo, allTypes) {
  const { repoName, months: records, totalLines } = repo;

  return {
    id: repoName,
    header: repoName,
    totalLines,
    items: allTypes
      .filter((month) => !!records[month])
      .map((month, index) => ({
        id: index,
        label: month,
        count: records[month].count,
        percentage: records[month].percentage,
        color: nextColor(index)
      }))
  };
}

export default function parseLineInfo(data) {
  const parsedRepos = Object.entries(data).map(parseRepo);
  const months = parsedRepos.reduce((arr, repo) => arr.concat(Object.keys(repo.months)), []);
  const allMonths = uniq(months).sort();

  // const maxCount = Math.max(...parsedRepos.map((repo) => repo.totalLines));
  // const quarters = parsedRepos.reduce((arr, repo) => arr.concat(Object.keys(repo.quarters)), []);
  // const years = parsedRepos.reduce((arr, repo) => arr.concat(Object.keys(repo.years)), []);
  // const allQuarters = uniq(quarters).sort();
  // const allYears = uniq(years).sort();

  const series = parsedRepos.map((repo) => getBarSerie(repo, allMonths));

  return series;
}
