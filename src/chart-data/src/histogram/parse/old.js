/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
import HistogramChart from '../histogram/chart';
import React from 'react';

const bluebird = require('bluebird');
const { readFile } = require('../utils');
const parse = require('./parse');

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

module.exports = function chart({ repos, ignored }) {
  return bluebird
    .join(readJsons(repos, 'counts'), readJsons(repos, 'commits'))
    .then(() => {
      const { groups, types } = parse(repos);

      return (<HistogramChart groups={groups} types={types} repos={repos} ignored={ignored} />);
    });
};
