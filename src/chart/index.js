/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const repos = require('../repos');
const { readFile, writeFile } = require('../utils');
const bluebird = require('bluebird');
const parse = require('./parse');
const render = require('./render');

const countsPromises = bluebird
  .map(repos, (repo) => readFile(`${repo.repoName}__counts.json`).then((raw) => ({
    repo,
    counts: JSON.parse(raw)
  })), {
    concurrency: 2
  });

const commitsPromises = bluebird
  .map(repos, (repo) => readFile(`${repo.repoName}__commits.json`).then((raw) => ({
    repo,
    commits: JSON.parse(raw)
  })), {
    concurrency: 2
  });

bluebird
  .join(countsPromises, commitsPromises)
  .then(([counts, commits]) => {
    const { groups, types } = parse(counts, commits);
    const html = render(groups.slice(1), types);

    writeFile('chart.html', html);
  });
