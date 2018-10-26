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

export default function parseHistogram(repos) {
  setRepoChanges(repos);

  const { deletions, insertions } = getChangesPerMonth(repos);
  const series = getGroups(repos, deletions, insertions);
  const types = getReportedTypes(repos);
  const maxCount = Math.max(...series.map((group) => group.countSum));
  const legend = Object.entries(repos).map(([id, repo]) => ({
    id,
    label: repo.config.repoName,
    color: repo.config.color
  }));

  return {
    types,
    series,
    maxCount,
    legend
  };
}
