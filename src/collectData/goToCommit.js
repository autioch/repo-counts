const { executeCommand } = require('./utils');

module.exports = function goToCommit(commitHash) {
  executeCommand('git reset --hard');
  executeCommand(`git checkout ${commitHash}`);
};
