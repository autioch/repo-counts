const getReportedTypes = require('./getReportedTypes');
const getChangesPerMonth = require('./getChangesPerMonth');
const getGroups = require('./getGroups');

module.exports = function parse(repos) {
  const { deletions, insertions } = getChangesPerMonth(repos);

  return {
    types: getReportedTypes(repos),
    groups: getGroups(repos, deletions, insertions)
  };
};
