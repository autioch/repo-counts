/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const bluebird = require('bluebird');
const { readFile, writeFile } = require('../utils');
const parse = require('./parse');
const render = require('./render');

function readJson(repos, prop) {
  return bluebird.map(repos, (repo) => readFile(`${repo.repoName}__${prop}.json`).then((raw) => ({
    repo,
    [prop]: JSON.parse(raw)
  })), {
    concurrency: 2
  });
}

module.exports = function chart(repos, skipMonths = 0) {
  return bluebird
    .join(readJson(repos, 'counts'), readJson(repos, 'commits'))
    .then(([counts, commits]) => {
      const { groups, types } = parse(counts, commits);
      const html = render(groups.slice(skipMonths), types);

      return writeFile('chart.html', html);
    });
};
