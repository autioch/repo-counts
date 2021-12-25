import { getColor } from '../utils';

export default function parseHorizontalStacked(repos, horizontalKey /* , fileTypes */) {
  // const dict = fileTypes.reduce((obj, fileType) => {
  //   obj[fileType] = true;
  //
  //   return obj;
  // }, {});

  const series = repos
    .filter((repo) => !repo.isDisabled)
    .map((repo) => {
      let totalCount = 0;
      const records = {};

      Object.entries(repo.lineInfo[horizontalKey]).forEach(([id, count]) => {
        totalCount += count;

        if (records[id]) {
          records[id] += count;
        } else {
          records[id] = count;
        }
      });

      return {
        id: repo.config.repoName,
        header: repo.config.repoName,
        color: repo.config.color,
        totalCount,
        items: Object.entries(records)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([label, count], index) => ({
            id: index,
            label,
            count: count > 1000 ? `${Math.round(count / 100) / 10}K` : count,
            percentage: Math.round((count / totalCount) * 1000) / 10,
            color: getColor(label)
          }))
      };
    });

  const maxCount = Math.max(...series.map((serie) => serie.totalCount));

  return {
    series,
    maxCount
  };
}
