const qbLog = require('qb-log');

module.exports = function parseLine(lineInfo, extension) {
  const [hash, authorWithBracket, date, lineDetails = ''] = lineInfo.split('\t').map((item) => item.trim());
  const author = authorWithBracket.slice(1).trim().toLowerCase();
  const bracketIndex = lineDetails.indexOf(')');
  const contents = bracketIndex > 0 ? lineDetails.slice(bracketIndex + 1).trim() : '';

  if (!date) {
    qbLog.error('Line parse');
    qbLog.empty(lineInfo, [hash, authorWithBracket, date, lineDetails]);
  }

  if (!contents.length) {
    return false;
  }

  return {
    author,
    date,
    contents,
    extension
  };
};
