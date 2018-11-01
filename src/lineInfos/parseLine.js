const qbLog = require('qb-log');

module.exports = function parseLine(lineInfo) {
  const [hash, authorWithBracket = '', date, lineDetails = ''] = lineInfo.split('\t').map((item) => item.trim());
  const author = authorWithBracket.slice(1).trim().toLowerCase();
  const bracketIndex = lineDetails.indexOf(')');
  const contents = bracketIndex > 0 ? lineDetails.slice(bracketIndex + 1).trim() : '';

  if (!date) {
    qbLog.error('Line parse');
    qbLog.empty('#', lineInfo, '#');
    qbLog.empty([hash, authorWithBracket, date, lineDetails]);
  }

  /* Array instead of object significantly reduces file size. */
  return [date, author, contents.length];
};
