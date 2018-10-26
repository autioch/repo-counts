import getChangesPerMonth from './getChangesPerMonth';
import getGroups from './getGroups';
import { uniq, flattenDeep } from 'lodash';

function getReportedTypes(data) {
  const repos = Object.values(data);
  const typesWithinRepos = repos.map((repo) => repo.counts.map((item) => Object.keys(item.count)));
  const types = flattenDeep(typesWithinRepos);
  const uniqueTypes = uniq(types);

  return uniqueTypes.filter((type) => type !== 'SUM').sort();
}

function setRepoChanges(repos) {
  Object.values(repos).forEach((repo) => {
    repo.insertions = repo.commitList.reduce((sum, commit) => sum + commit.insertions, 0);
    repo.deletions = repo.commitList.reduce((sum, commit) => sum + commit.deletions, 0);
    repo.diff = repo.insertions - repo.deletions;
  });
}

export default function parse(repos) {
  setRepoChanges(repos);

  const { deletions, insertions } = getChangesPerMonth(repos);

  return {
    types: getReportedTypes(repos),
    groups: getGroups(repos, deletions, insertions)
  };
}
