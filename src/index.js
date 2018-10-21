require('qb-log')('simple');
const collectData = require('./collectData');
const chartData = require('./chartData');
const { repos } = require('./config');
const { waterfall } = require('./utils');

const repoFns = repos.map((repo) => () => collectData(repo));

waterfall(repoFns).then(() => chartData(repos));
