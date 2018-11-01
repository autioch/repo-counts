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

// function countId(count) {
//   return count;
//
//   if (count <= 10) {
//     return '1-10';
//   }
//   if (count <= 100) {
//     return '11-100';
//   }
//   if (count <= 500) {
//     return '101-500';
//   }
//
//   return '500+';
// }

module.exports = function analyzeFileInfos(fileInfos) {
  const stats = {
    /* File */
    folderName: {},
    fileName: {},
    fileType: {},
    linesInFile: {},

    /* Line */
    author: {},
    date: {},
    year: {},
    quarter: {},
    month: {},
    lineLength: {},

    /* Summary */
    codeLines: 0,
    emptyLines: 0,
    totalLines: 0
  };

  fileInfos.forEach((fileInfo) => {
    const { folderName, fileName, fileType, lines } = fileInfo;

    stats.totalLines += lines.length;
    assignDict(stats.folderName, folderName);
    assignDict(stats.fileName, fileName);
    assignDict(stats.fileType, fileType);
    assignDict(stats.linesInFile, lines.length);

    lines.forEach((line) => {
      const [date, author, contentsLength] = line;

      stats[contentsLength ? 'codeLines' : 'emptyLines'] += 1;
      assignDict(stats.author, author);
      assignDict(stats.date, date);
      assignDict(stats.year, yearId(date));
      assignDict(stats.quarter, quarterId(date));
      assignDict(stats.month, monthId(date));
      assignDict(stats.lineLength, contentsLength);
    });
  });

  return stats;
};
