/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const bluebird = require('bluebird');
const { join } = require('path');
const fs = bluebird.promisifyAll(require('fs'));

function writeFile(fileName, data) {
  return fs.writeFileAsync(join(__dirname, '..', 'data', fileName), data, 'utf8');
}

function readFile(fileName) {
  return fs.readFileAsync(join(__dirname, '..', 'data', fileName), 'utf8');
}

function optionsToCli(options) {
  return Object
    .entries(options)
    .reduce((arr, [key, val]) => {
      const value = val === undefined ? '' : `=${val}`; // eslint-disable-line no-undefined

      return arr.concat(`--${key}${value}`);
    }, [])
    .join(' ');
}

module.exports = {
  writeFile,
  readFile,
  optionsToCli
};
