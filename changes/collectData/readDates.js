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
        lineDetails = '' // eslint-disable-line no-unused-vars
      ] = text.split('\t');

      const bracketIndex = lineDetails.indexOf(')');

      if (bracketIndex > 0) {
        const content = lineDetails.slice(bracketIndex + 1).trim();

        return content.length ? date : false;
      }

      return date;
    })
    .filter((date) => !!date);
};
