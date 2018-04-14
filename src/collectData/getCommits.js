const { execSync } = require('child_process');
const { optionsToCli } = require('./utils');
const parseCommit = require('./parseCommit');

const options = optionsToCli({
  'no-merges': undefined,
  branches: undefined,
  pretty: parseCommit.PRETTY,
  shortstat: undefined
});

module.exports = function getCommits(start, end = 'HEAD') {
  const commits = execSync(`git log ${start}..${end} ${options}`).toString().split('\n\n');

  return commits.filter((commit) => !!commit.length).map(parseCommit);
};
