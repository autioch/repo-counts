/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const parse = require('./parse');
const render = require('./render');

module.exports = function chart(counts, commits) {
  const { groups, types } = parse(counts, commits);
  const html = render(groups.slice(1), types);

  return html;
};
