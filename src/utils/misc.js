const { join } = require('path');
const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const qbLog = require('qb-log');

const DATA_FOLDER = join(__dirname, '..', '..', 'data');

function writeFile(fileName, data) {
  const serializedData = typeof data === 'string' ? data : JSON.stringify(data, null, '  ');

  return fs.writeFileAsync(join(DATA_FOLDER, fileName), serializedData, 'utf8');
}

function readFile(fileName) {
  return fs.readFileAsync(join(DATA_FOLDER, fileName), 'utf8');
}

function waterfall(fnList) {
  return fnList.reduce((promise, fn) => promise.then(fn), Promise.resolve());
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
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

function logRepoError(message, err, repo) {
  qbLog.error(message);
  qbLog.emty(repo.folder);
  qbLog.emty(err.message);
}

module.exports = {
  writeFile,
  readFile,
  waterfall,
  clone,
  objToCli,
  logRepoError
};
