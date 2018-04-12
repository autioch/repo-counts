/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const bluebird = require('bluebird');
const { join } = require('path');
const fs = bluebird.promisifyAll(require('fs'));

function writeFile(fileName, data) {
  return fs.writeFileAsync(join(__dirname, 'data', fileName), data, 'utf8');
}

function readFile(fileName) {
  return fs.readFileAsync(join(__dirname, 'data', fileName), 'utf8');
}

module.exports = {
  writeFile,
  readFile
};
