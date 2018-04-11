/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const bluebird = require('bluebird');
const { readFile, writeFile } = require('../utils');
const parse = require('./parse');
const render = require('./render');

function readJson(repo, prop) {
  return readFile(`${repo.repoName}__${prop}.json`)
    .then((raw) => {
      repo[prop] = JSON.parse(raw);
    });
}

function readJsons(repos, prop) {
  return bluebird.map(repos, (repo) => readJson(repo, prop), {
    concurrency: 2
  });
}

module.exports = function chart(repos, skipMonths = 0) {
  return bluebird
    .join(readJsons(repos, 'counts'), readJsons(repos, 'commits'))
    .then(() => {
      const { groups, types } = parse(repos);
      const html = render(groups.slice(skipMonths), types);

      return writeFile('chart.html', html);
    });
};
