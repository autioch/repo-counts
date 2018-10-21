const { objToCli, executeCommand } = require('../../utils');
const parseCommit = require('./parseCommit');

const nthCommitOptions = objToCli({
  'max-count': 1,
  pretty: parseCommit.PRETTY
});

module.exports = function getNthCommitInfo(commitNr) {
  const totalCommits = executeCommand('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const commitText = executeCommand(`git log --skip=${skip} ${nthCommitOptions}`);

  return parseCommit(commitText);
};
