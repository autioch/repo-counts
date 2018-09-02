const { uniq } = require('lodash');

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

function parseRepo(repo) {
  const { changes: { changes, folders }, repoName } = repo;

  let totalLines = 0;
  const months = {};
  const quarters = {};
  const years = {};

  Object.entries(changes).forEach(([day, count]) => {
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
    years,
    folders
  };
}

module.exports = function parse(repos) {
  const parsedRepos = repos.map((repo) => parseRepo(repo));
  const maxCount = Math.max(...parsedRepos.map((repo) => repo.totalLines));
  const months = parsedRepos.reduce((arr, repo) => arr.concat(Object.keys(repo.months)), []);
  const quarters = parsedRepos.reduce((arr, repo) => arr.concat(Object.keys(repo.quarters)), []);
  const years = parsedRepos.reduce((arr, repo) => arr.concat(Object.keys(repo.years)), []);

  return {
    repos: parsedRepos,
    maxCount,
    allMonths: uniq(months).sort(),
    allQuarters: uniq(quarters).sort(),
    allYears: uniq(years).sort()
  };
};
