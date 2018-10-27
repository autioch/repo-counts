import { getColor } from '../utils';

export default function parseHorizontalStacked(repos, horizontalKey) {
  const series = repos.map((repo) => {
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
          count,
          percentage: ((count / totalCount) * 100).toFixed(1),
          color: getColor(label)
        }))
    };
  });

  const useK = series.some((serie) => serie.items.some((item) => item.count > 10000));

  if (useK) {
    series.forEach((serie) => serie.items.forEach((item) => {
      item.count = `${(item.count / 1000).toFixed(1)}k`;
    }));
  }

  return series;
}
