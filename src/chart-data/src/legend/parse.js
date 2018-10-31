import { uniq, flattenDeep } from 'lodash';
import { getColor } from '../utils';

function getFileTypes(repos) {
  const selectedRepos = repos.filter((repo) => !repo.isDisabled);
  const typesWithinRepos = selectedRepos.map((repo) => (repo.counts || []).map((item) => Object.keys(item.count)));
  const types = flattenDeep(typesWithinRepos);

  return uniq(types).filter((type) => type !== 'SUM').sort();
}

export default function parseLegend(repos) {
  const fileTypes = getFileTypes(repos).map((fileType) => ({
    id: fileType,
    label: fileType,
    color: getColor(fileType)

    // isDisabled: repo.isDisabled // TODO
  }));

  const series = repos.map((repo) => ({
    id: repo.config.repoName,
    label: repo.config.repoName,
    color: repo.config.color,
    isDisabled: repo.isDisabled
  }));

  return {
    series,
    fileTypes
  };
}
