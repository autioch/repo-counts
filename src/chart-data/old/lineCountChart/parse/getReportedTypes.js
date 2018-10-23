const { uniq } = require('lodash');

function reduceArray(array, cb) {
  return array.reduce((arr, item) => arr.concat(cb(item)), []);
}

function getStepTypes(step) {
  return Object.keys(step.count);
}

function getRepoTypes(repo) {
  return reduceArray(repo.counts, getStepTypes);
}

module.exports = function getReportedTypes(repos) {
  const types = reduceArray(repos, getRepoTypes);

  return uniq(types).filter((type) => type !== 'SUM').sort();
};
