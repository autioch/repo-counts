/* eslint-disable no-magic-numbers */
const countLines = require('./countLines');
const getCommits = require('./getCommits');
const { execSync } = require('child_process');
const { optionsToCli } = require('../utils');

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

const nthCommitOptions = optionsToCli({
  'max-count': 1,
  pretty: 'format:"%H;%at"'
});

function getNthCommitInfo(commitNr) {
  const totalCommits = execSync('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const info = execSync(`git log --skip=${skip} ${nthCommitOptions}`).toString();
  const [hash, date] = info.split(';');

  return {
    hash,
    date: new Date(date * 1000).toISOString().split('T')[0]
  };
}

function countCommit(folder, hash) {
  execSync(`git reset --hard`);
  execSync(`git checkout ${hash}`);

  return countLines(folder);
}

module.exports = {
  countCommit,
  getNthCommitInfo,
  clone,
  getCommits,
  getNextMonthFirstDay,
  findFirstCommitInMonth
};
