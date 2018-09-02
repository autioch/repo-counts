const { executeCommand } = require('./utils');
const { relative } = require('path');

module.exports = function readDates(fileName, folder, index) {
  console.log(folder, index);
  const relativePath = relative(folder, fileName);
  let blameList = '';

  try {
    blameList = executeCommand(`git blame --date=short -c ${relativePath}`).toString();
  } catch (err) {
    console.log('Failed to blame file');
    console.log(folder, fileName);
    console.log(err.message);
  }

  return blameList
    .split('\n')
    .map((text) => text.trim())
    .map((text) => {
      const [
        hash, // eslint-disable-line no-unused-vars
        author, // eslint-disable-line no-unused-vars
        date,
        lineDetails // eslint-disable-line no-unused-vars
      ] = text.split('\t');

      return date;
    })
    .filter((date) => !!date);
};
