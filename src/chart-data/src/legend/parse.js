import { uniq, flattenDeep } from 'lodash';

function getFileTypes(repos) {
  const selectedRepos = repos.filter((repo) => !repo.isDisabled);
  const typesWithinRepos = selectedRepos.map((repo) => repo.counts.map((item) => Object.keys(item.count)));
  const types = flattenDeep(typesWithinRepos);

  return uniq(types).filter((type) => type !== 'SUM').sort();
}

export default function parseLegend(repos) {
  const fileTypes = getFileTypes(repos);

  const items = Object.entries(repos).map(([id, repo]) => ({
    id,
    label: repo.config.repoName,
    color: repo.config.color,
    isDisabled: repo.isDisabled
  }));

  return {
    items,
    fileTypes
  };
}
