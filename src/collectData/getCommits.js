const { execSync } = require('child_process');
const { optionsToCli } = require('./utils');

const MILISECOND = 1000;

const options = optionsToCli({
  'no-merges': undefined,
  branches: undefined,
  pretty: 'format:"%H;%at;%s;%an;%ae"',
  shortstat: undefined
});

function parseCommit(commit) {
  const [description, modifications] = commit.trim().split('\n');
  const [hash, datetime, text, authorName, emailName] = description.split(';');
  const [, deletions = 0] = /([0-9]+) deletions/.exec(modifications) || [];
  const [, insertions = 0] = /([0-9]+) insertions/.exec(modifications) || [];

  return {
    hash,
    text,
    authorName,
    emailName,
    date: new Date(datetime * MILISECOND).toISOString().split('T')[0],
    insertions: parseInt(insertions, 10),
    deletions: parseInt(deletions, 10),
    filesChanged: parseInt(modifications, 10)
  };
}

module.exports = function getCommits(start, end = 'HEAD') {
  const commits = execSync(`git log ${start}..${end} ${options}`).toString().split('\n\n');

  return commits.filter((commit) => !!commit.length).map(parseCommit);
};
