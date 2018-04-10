/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const bluebird = require('bluebird');
const { join } = require('path');
const { groupBy, uniq } = require('lodash');
const { execSync } = require('child_process');
const fs = bluebird.promisifyAll(require('fs'));

function getCommits(start, end = 'HEAD') {
  const result = execSync(`git log ${start}..${end} --no-merges --branches --pretty=format:"%H;%at;%s;%an;%ae" --shortstat`)
    .toString()
    .split('\n\n');

  return result
    .filter((commit) => !!commit.length)
    .map((commitData) => commitData.trim())
    .map((commit) => {
      const [description, modifications] = commit.split('\n');
      const [hash, datetime, text, authorName, emailName] = description.split(';');

      const [, deletions = 0] = /([0-9]+) deletions/.exec(modifications) || [];
      const [, insertions = 0] = /([0-9]+) insertions/.exec(modifications) || [];
      const filesChanged = parseInt(modifications, 10);
      let date;

      try {
        [date] = new Date(datetime * 1000).toISOString().split('T');
      } catch (err) {
        console.log(err.message);
        date = datetime;
      }

      return {
        hash,
        date,
        text,
        insertions: parseInt(insertions, 10),
        deletions: parseInt(deletions, 10),
        filesChanged,
        authorName,
        emailName
      };
    });
}

function getFirstCommitHash() {
  const text = execSync('git rev-list --max-parents=0 HEAD').toString();

  return text;
}

function getNthCommitHash(commitNr) {
  const totalCommits = execSync('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const nthCommit = execSync(`git log --skip=${skip} --max-count=1 --pretty=format:"%H"`).toString();

  return nthCommit;
}

function groupIntoDays(commits) {
  const grouped = groupBy(commits, 'date');

  return Object.entries(grouped).map(([date, commitArray]) => ({
    date,
    text: uniq(commitArray.map((commit) => commit.text)).join(', '), // `${commitArray.length } commits`,
    insertions: commitArray.reduce((sum, commit) => sum + commit.insertions, 0),
    deletions: commitArray.reduce((sum, commit) => sum + commit.deletions, 0),
    filesChanged: commitArray.reduce((sum, commit) => sum + commit.filesChanged, 0),
    authorNames: uniq(commitArray.map((commit) => commit.authorName)).join(', '),
    emailNames: uniq(commitArray.map((commit) => commit.emailName)).join(', ')
  }));
}

function writeFile(fileName, data) {
  return fs.writeFileAsync(join(__dirname, '..', 'data', fileName), data, 'utf8');
}

function readFile(fileName) {
  return fs.readFileAsync(join(__dirname, '..', 'data', fileName), 'utf8');
}

function getNextMonthFirstDay(dateString) {
  const date = new Date(dateString);

  date.setMonth(date.getMonth() + 1);
  date.setDate(1);

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function findFirstCommitInMonth(commits, dateString) {
  const [currentYear, currentMonth] = dateString.split('-');

  return commits.find((commit) => {
    const [year, month] = commit.date.split('-');

    return year === currentYear && parseInt(month, 10).toString() === currentMonth;
  });
}

function getNthCommitInfo(commitNr) {
  const totalCommits = execSync('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const info = execSync(`git log --skip=${skip} --max-count=1 --pretty=format:"%H;%at"`).toString();
  const [hash, date] = info.split(';');

  return {
    hash,
    date: new Date(date * 1000).toISOString().split('T')[0]
  };
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  getFirstCommitHash,
  getNthCommitHash,
  getNthCommitInfo,
  getNextMonthFirstDay,
  getCommits,
  groupIntoDays,
  writeFile,
  findFirstCommitInMonth,
  clone,
  readFile
};
