module.exports = function setRepoChanges(repos) {
  repos.forEach((repo) => {
    repo.insertions = repo.commits.reduce((sum, commit) => sum + commit.insertions, 0);
    repo.deletions = repo.commits.reduce((sum, commit) => sum + commit.deletions, 0);
    repo.diff = repo.insertions - repo.deletions;
  });
};
