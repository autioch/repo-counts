const { objToCli, executeCommand } = require('../../utils');
const { startingCommitNr } = require('../../config');
const parseCommit = require('./parseCommit');
const qbLog = require('qb-log');

qbLog._add('commitList', {
  prefix: 'COMMIT LIST',
  formatter: qbLog._chalk.green
});

const PRETTY = 'format:"%H;%at;%s;%an;%ae"';

const nthCommitOptions = objToCli({
  'max-count': 1,
  pretty: PRETTY
});

function getNthCommitInfo(commitNr) {
  const totalCommits = executeCommand('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const commitText = executeCommand(`git log --skip=${skip} ${nthCommitOptions}`);

  return parseCommit(commitText);
}

const getCommitListOptions = objToCli({
  'no-merges': undefined,
  branches: undefined,
  pretty: PRETTY,
  shortstat: undefined
});

function getCommitList(start, end = 'HEAD') {
  const logInfo = executeCommand(`git log ${start}..${end} ${getCommitListOptions}`);
  const foundCommits = logInfo.toString().split('\n\n');
  const commits = foundCommits.filter((commit) => !!commit.length);
  const parsedCommits = commits.map(parseCommit);

  return parsedCommits;
}

module.exports = function getCommits(repoConfig) {
  qbLog.commitList(repoConfig.folder);
  const startCommit = getNthCommitInfo(startingCommitNr);
  const commits = getCommitList(startCommit.hash).reverse();

  return commits;
};
