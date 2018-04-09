const { execSync } = require('child_process');

module.exports = function checkoutCommit(gitFolder, commitHash) {
  process.chdir(gitFolder);

  execSync(`git checkout ${commitHash}`);
};
