function assignDict(dict, key) {
  if (!dict.hasOwnProperty(key)) {
    dict[key] = 0;
  }

  dict[key] = dict[key] + 1;

  return dict;
}

function yearId(date) {
  return date.split('-')[0];
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
    author: {},
    date: {},
    year: {},
    quarter: {},
    month: {},
    fileType: {}

    // fileName: {},
    // lineLength: {},
    // linesInFile: {}
    // contents: {},
    // totalFiles: fileInfos.length,
    // totalLines: 0,
  };

  fileInfos.forEach((fileInfo) => {
    const { /* fileName, */ /* lineCount,*/ lines } = fileInfo;

    // stats.totalLines += lineCount;
    // assignDict(stats.linesInFile, lineCount);
    // assignDict(stats.fileName, fileName);

    lines.forEach((line) => {
      assignDict(stats.author, line.author);

      // assignDict(stats.contents, line.contents);
      // assignDict(stats.lineLength, line.contents.length);
      assignDict(stats.date, line.date);
      assignDict(stats.year, yearId(line.date));
      assignDict(stats.quarter, quarterId(line.date));
      assignDict(stats.month, monthId(line.date));
      assignDict(stats.fileType, line.fileType);
    });
  });

  return stats;
};
