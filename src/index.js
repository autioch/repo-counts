const chart = require('./chart');
const collectData = require('./collectData');
const issues = require('./issues');
const repos = require('./repos');

collectData(repos).then(() => chart(repos));

// collectData(repos);
// chart(repos, 0);

// issues();
