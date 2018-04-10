/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const repos = require('./repos');
const { readFile, writeFile } = require('./utils');
const bluebird = require('bluebird');
const chart = require('./chart');

function readJson(prop) {
  return bluebird.map(repos, (repo) => readFile(`${repo.repoName}__${prop}.json`).then((raw) => ({
    repo,
    [prop]: JSON.parse(raw)
  })), {
    concurrency: 2
  });
}

bluebird
  .join(readJson('counts'), readJson('commits'))
  .then(([counts, commits]) => writeFile('chart.html', chart(counts, commits)));
