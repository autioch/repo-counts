function assignDict(dict, key) {
  if (!dict.hasOwnProperty(key)) {
    dict[key] = 0;
  }

  dict[key] = dict[key] + 1;

  return dict;
}

module.exports = function analyzeLineInfos(lineInfos, repoConfig) {
  const stats = {
    repoConfig,
    totalLines: lineInfos.length,
    author: {},
    date: {}
  };

  lineInfos.forEach(({ author, date }) => {
    assignDict(stats.author, author);
    assignDict(stats.date, date);
  });

  return stats;
};