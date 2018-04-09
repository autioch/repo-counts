/* eslint-disable no-undefined */
const { join } = require('path');
const { writeFile } = require('./utils');
const countLines = require('./countLines');
const checkoutCommit = require('./checkoutCommit');
const getNthCommitInfo = require('./getNthCommitInfo');

const folder = join('e:', 'projects', 'movie-collector', 'src');

const { hash, date } = getNthCommitInfo(folder, 2);
const linesInfo = [];

const commitDate = new Date(date);
const todayDate = new Date();

/* TODO Get commits, check them every week until end. */

function countCommit(folder, hash, date) {
  checkoutCommit(folder, hash);

  const count = countLines(folder);

  linesInfo.push({
    date,
    count
  });
}

writeFile(join(__dirname, 'results.json'), JSON.stringify(linesInfo, null, '  '));
