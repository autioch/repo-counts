const chart = require('./chart');
const collectData = require('./collectData');
const qbLog = require('qb-log')('simple');

module.exports = function repoHistory(config) {
  return collectData(config)
    .then(() => chart(config))
    .catch((err) => qbLog.error(err.message));
};
