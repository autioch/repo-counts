const { writeFile } = require('../utils');
const qbLog = require('qb-log');
const glob = require('glob');
const { join, resolve, dirname } = require('path');
const readDates = require('./readDates');
const { uniq } = require('lodash');

function findFiles(dir) {
  return new Promise((res, rej) => {
    const absoluteRoot = resolve(dir);
    const searchExpression = join(absoluteRoot, '**', '*.{js,scss,sass,css,tpl,html,md}');
    const posixSearchExpression = searchExpression.replace(/\\/g, '/');

    qbLog.info(posixSearchExpression);

    glob(posixSearchExpression, {
      nodir: true,
      ignore: ['**/node_modules/**/*']
    }, (err, files) => {
      if (err) {
        rej(err);
      } else {
        qbLog.info(files.length, 'files');

        res(files);
      }
    });
  });
}

async function scanRepo(folder) {
  qbLog.empty();
  qbLog.info(folder);
  process.chdir(folder);

  const files = await findFiles(folder);
  const changeDates = files.reduce((arr, file, index) => arr.concat(readDates(file, folder, index)), []);
  const folders = files.map((file) => dirname(file));

  const changes = changeDates.reduce((obj, date) => {
    if (!obj[date]) {
      obj[date] = 0;
    }

    obj[date]++; // eslint-disable-line no-plusplus

    return obj;
  }, {});

  return {
    changes,
    folders: uniq(folders)
  };
}

async function gatherData(repo) {
  const { folder, repoName } = repo;
  const changes = await scanRepo(folder);

  return writeFile(`${repoName}__changes.json`, JSON.stringify(changes, null, '  '));
}

module.exports = function collectData({ repos }) {
  return repos.reduce((promise, repo) => promise.then(() => gatherData(repo)), Promise.resolve());
};
