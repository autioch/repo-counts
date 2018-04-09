const { execSync } = require('child_process');

module.exports = function getNthCommitInfo(gitFolder, commitNr) {
  process.chdir(gitFolder);

  const totalCommits = execSync('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const [hash, date] = execSync(`git log --skip=${skip} --max-count=1 --pretty=format:"%H;%at"`).toString().split(';');

  return {
    hash,
    date
  };
};
