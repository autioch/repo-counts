/* eslint-disable no-magic-numbers */
const getCommits = require('./getCommits');

function optionsToCli(options) {
  return Object
    .entries(options)
    .reduce((arr, [key, val]) => {
      const value = val === undefined ? '' : `=${val}`; // eslint-disable-line no-undefined

      return arr.concat(`--${key}${value}`);
    }, [])
    .join(' ');
}

function getNextMonthFirstDay(dateString) {
  const date = new Date(dateString);

  date.setMonth(date.getMonth() + 1);
  date.setDate(1);

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function findFirstCommitInMonth(commits, dateString) {
  const [chosenYear, chosenMonth] = dateString.split('-');

  return commits.find((commit) => {
    const [year, month] = commit.date.split('-');

    return year === chosenYear && parseInt(month, 10).toString() === chosenMonth;
  });
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  optionsToCli,
  clone,
  getCommits,
  getNextMonthFirstDay,
  findFirstCommitInMonth
};
