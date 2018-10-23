/* eslint-disable no-magic-numbers */
module.exports = function dateToYearMonth(date) {
  const [year, month] = date.split('-');

  return `${year}-${month.length < 2 ? `0${month}` : month}`;
};
