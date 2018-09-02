const { optionsToCli, executeCommand } = require('./utils');
const parseCommit = require('./parseCommit');

const options = optionsToCli({
  'no-merges': undefined,
  branches: undefined,
  pretty: parseCommit.PRETTY,
  shortstat: undefined
});

module.exports = function getCommitList(start, end = 'HEAD') {
  const logInfo = executeCommand(`git log ${start}..${end} ${options}`);
  const foundCommits = logInfo.toString().split('\n\n');
  const commits = foundCommits.filter((commit) => !!commit.length);
  const parsedCommits = commits.map(parseCommit);

  return parsedCommits;
};
