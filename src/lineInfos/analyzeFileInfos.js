function assignDict(dict, key) {
  if (!dict.hasOwnProperty(key)) {
    dict[key] = 0;
  }

  dict[key] = dict[key] + 1;

  return dict;
}

function yearId(date) {
  return date.split('-')[0];// .slice(0, 2);
}

function quarterId(date) {
  const [yearPart, monthPart] = date.split('-');

  return `${yearPart}/${Math.ceil(monthPart / 3)}`;
}

function monthId(date) {
  return date.split('-').slice(0, 2).join('-');
}

module.exports = function analyzeFileInfos(fileInfos) {
  const stats = {
    totalFiles: fileInfos.length,
    totalLines: 0,
    author: {},
    date: {},
    year: {},
    quarter: {},
    month: {},
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
      assignDict(stats.lineLength, line.contents.length);
      assignDict(stats.date, line.date);
      assignDict(stats.year, yearId(line.date));
      assignDict(stats.quarter, quarterId(line.date));
      assignDict(stats.month, monthId(line.date));
    });
  });

  return stats;
};
