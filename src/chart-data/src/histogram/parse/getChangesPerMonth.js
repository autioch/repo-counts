import { groupBy } from 'lodash';

function dateToYearMonth(date) {
  const [year, month] = date.split('-');

  return `${year}-${month.padStart(2, '0')}`;
}

function prepareRepoCommits(repo) {
  return repo.commitList.map((commit) => Object.assign({}, commit, {
    date: dateToYearMonth(commit.date)
  }));
}

function prepareCommits(repos) {
  const allCommits = Object.values(repos).reduce((arr, repo) => arr.concat(prepareRepoCommits(repo)), []);
  const commitListInMonth = Object.entries(groupBy(allCommits, 'date'));

  return commitListInMonth;
}

function summarizeCommitProp(changesInMonth, prop) {
  return changesInMonth.reduce((dict, [date, commitList]) => {
    dict[date] = commitList.reduce((sum, commit) => sum + commit[prop], 0);

    return dict;
  }, {});
}

export default function getChangesPerMonth(repos) {
  const changesInMonth = prepareCommits(repos);
  const deletions = summarizeCommitProp(changesInMonth, 'deletions');
  const insertions = summarizeCommitProp(changesInMonth, 'insertions');

  return {
    insertions,
    deletions
  };
}
