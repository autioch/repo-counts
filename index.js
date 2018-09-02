// const config = require('./config');
// const repoHistory = require('./src');
//
// repoHistory(config);

const config = require('./config');

// const chart = require('./changes/chart');

const collectData = require('./changes/collectData');

require('qb-log')('simple');

(async () => {
  await collectData(config);

  // await chart(config);
})();
