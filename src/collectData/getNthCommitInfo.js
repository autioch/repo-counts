const { execSync } = require('child_process');
const { optionsToCli } = require('./utils');

const nthCommitOptions = optionsToCli({
  'max-count': 1,
  pretty: 'format:"%H;%at"'
});

const MILISECONDS = 1000;

module.exports = function getNthCommitInfo(commitNr) {
  const totalCommits = execSync('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const info = execSync(`git log --skip=${skip} ${nthCommitOptions}`).toString();
  const [hash, date] = info.split(';');

  return {
    hash,
    date: new Date(date * MILISECONDS).toISOString().split('T')[0]
  };
};
