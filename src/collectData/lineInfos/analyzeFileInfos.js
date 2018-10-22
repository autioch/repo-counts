function assignDict(dict, key) {
  if (!dict.hasOwnProperty(key)) {
    dict[key] = 0;
  }

  dict[key] = dict[key] + 1;

  return dict;
}

module.exports = function analyzeFileInfos(fileInfos) {
  const stats = {
    totalFiles: fileInfos.length,
    totalLines: 0,
    author: {},
    date: {},
    fileName: {},
    lineLength: {},
    linesInFile: {}
  };

  fileInfos.forEach(({ fileName, lineCount, lines }) => {
    stats.totalLines += lineCount;

    assignDict(stats.linesInFile, lineCount);
    assignDict(stats.fileName, fileName);

    lines.forEach((line) => {
      assignDict(stats.author, line.author);
      assignDict(stats.date, line.date);
      assignDict(stats.lineLength, line.contents.length);
    });
  });

  return stats;
};
