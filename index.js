const config = require('./config');

require('qb-log')('simple');

(async () => {
  // await require('./src')(config);

  // await require('./changes/collectData')(config);

  await require('./changes/chart')(config);
})();
