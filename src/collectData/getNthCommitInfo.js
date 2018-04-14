const { execSync } = require('child_process');
const { optionsToCli, execSyncOptions } = require('./utils');
const parseCommit = require('./parseCommit');

const nthCommitOptions = optionsToCli({
  'max-count': 1,
  pretty: parseCommit.PRETTY
});

module.exports = function getNthCommitInfo(commitNr) {
  const totalCommits = execSync('git rev-list HEAD --count', execSyncOptions);
  const skip = parseInt(totalCommits, 10) - commitNr;
  const commitText = execSync(`git log --skip=${skip} ${nthCommitOptions}`).toString();

  return parseCommit(commitText);
};
