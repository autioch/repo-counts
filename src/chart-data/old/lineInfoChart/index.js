/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const { readFile, writeFile } = require('../utils');
const parse = require('./parse');
const render = require('./render');

async function readJson(repo, prop) {
  const contents = await readFile(`${repo.repoName}__${prop}.json`);

  return Object.assign({}, repo, {
    [prop]: JSON.parse(contents)
  });
}

async function readJsons(repos, prop) {
  const result = await Promise.all(repos.map((repo) => readJson(repo, prop)));

  return result;
}

module.exports = async function chart({ repos }) {
  const readRepos = await readJsons(repos, 'changes');

  const parsed = parse(readRepos);
  const html = render(parsed);

  return writeFile('chart.html', html);
};
