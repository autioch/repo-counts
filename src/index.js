const chart = require('./chart');
const collectData = require('./collectData');

const repos = require('./repos');

/* TODO Add cli options for choosing option */
// collectData(repos).then(() => chart(repos));
// collectData(repos);
chart(repos, 0);
