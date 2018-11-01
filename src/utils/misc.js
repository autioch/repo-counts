const { join } = require('path');
const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const qbLog = require('qb-log');

const clone = (obj) => JSON.parse(JSON.stringify(obj));

function logRepoError(message, err, repo) {
  qbLog.error(message);
  qbLog.empty(repo.repoName);
  qbLog.empty(err.message);
}

function objToCli(options) {
  return Object
    .entries(options)
    .map(([key, val]) => `--${key}${val === undefined ? '' : `=${val}`}`)
    .join(' ');
}

const DATA_FOLDER = join(__dirname, '..', '..', 'data');
const CHART_FOLDER = join(__dirname, '..', 'chart-data', 'src', 'data');

function writeFile(fileName, data) {
  const serializedData = typeof data === 'string' ? data : JSON.stringify(data, null, '  ');

  return Bluebird.all([
    fs.writeFileAsync(join(CHART_FOLDER, fileName), serializedData, 'utf8'),
    fs.writeFileAsync(join(DATA_FOLDER, fileName), serializedData, 'utf8')
  ]);
}

function readFile(fileName) {
  return fs.readFileAsync(join(DATA_FOLDER, fileName), 'utf8');
}

module.exports = {
  clone,
  logRepoError,
  objToCli,
  writeFile,
  readFile
};
