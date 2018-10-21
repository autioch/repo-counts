const { groupBy } = require('lodash');
const dateToYearMonth = require('./dateToYearMonth');

function prepareRepoCommits(repo) {
  return repo.commits.map((commit) => Object.assign({}, commit, {
    date: dateToYearMonth(commit.date)
  }));
}

function prepareCommits(repos) {
  const allCommits = repos.reduce((arr, repo) => arr.concat(prepareRepoCommits(repo)), []);
  const commitsInMonth = Object.entries(groupBy(allCommits, 'date'));

  return commitsInMonth;
}

function summarizeCommitProp(changesInMonth, prop) {
  return changesInMonth.reduce((dict, [date, commits]) => {
    dict[date] = commits.reduce((sum, commit) => sum + commit[prop], 0);

    return dict;
  }, {});
}

module.exports = function getChangesPerMonth(repos) {
  const changesInMonth = prepareCommits(repos);
  const deletions = summarizeCommitProp(changesInMonth, 'deletions');
  const insertions = summarizeCommitProp(changesInMonth, 'insertions');

  return {
    insertions,
    deletions
  };
};
