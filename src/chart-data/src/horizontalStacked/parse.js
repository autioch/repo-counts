import { getColor } from '../utils';

export default function parseHorizontalStacked(rawRepos, infoKey) {
  return rawRepos.map((repo) => {
    let totalCount = 0;
    const records = {};

    Object.entries(repo.lineInfo[infoKey]).forEach(([id, count]) => {
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
      totalCount,
      items: Object.entries(records)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, count], index) => ({
          id: index,
          label,
          count,

          // count: (count / 1000).toFixed(1),
          percentage: ((count / totalCount) * 100).toFixed(1),
          color: getColor(label)
        }))
    };
  });
}
