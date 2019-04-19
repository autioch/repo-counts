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
    .reduce((arr, [key, val]) => {
      const value = val === undefined ? '' : `=${val}`; // eslint-disable-line no-undefined

      return arr.concat(`--${key}${value}`);
    }, [])
    .join(' ');
}

const DATA_FOLDER = join(__dirname, '..', 'chart-data', 'src');

function writeFile(fileName, data) {
  const serializedData = typeof data === 'string' ? data : JSON.stringify(data, null, '  ');

  return fs.writeFileAsync(join(DATA_FOLDER, fileName), serializedData, 'utf8');
}

function readFile(fileName) {
  return fs.readFileAsync(join(DATA_FOLDER, fileName), 'utf8');
}

function isCachedFile(fileName) {
  return fs.existsSync(join(DATA_FOLDER, fileName)); // eslint-disable-line no-sync
}

module.exports = {
  clone,
  logRepoError,
  objToCli,
  writeFile,
  readFile,
  isCachedFile
};
