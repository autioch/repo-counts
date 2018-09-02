const { optionsToCli, executeCommand } = require('./utils');
const parseCommit = require('./parseCommit');

const nthCommitOptions = optionsToCli({
  'max-count': 1,
  pretty: parseCommit.PRETTY
});

module.exports = function getNthCommitInfo(commitNr) {
  const totalCommits = executeCommand('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const commitText = executeCommand(`git log --skip=${skip} ${nthCommitOptions}`).toString();

  return parseCommit(commitText);
};
