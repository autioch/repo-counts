import { basename, extname } from 'path';

function getExt(fileName) {
  const ext = extname(fileName);

  return basename(fileName, ext).length && ext.length ? ext : 'other';
}

export function h(tagAndClassName, children, attributes = []) {
  const [tagName, className = ''] = tagAndClassName.split('.');
  const attrs = attributes.filter(Boolean).map(([key, value]) => value ? `${key}=${typeof value === 'string' ? `"${value}"` : value}` : key).join(' ');
  const tag = tagName || 'div';

  return `<${tag}${className ? ` class="${className}"` : ''}${attrs ? ` ${attrs}` : ''}>${Array.isArray(children) ? `\n${children.join('')}` : children}</${tag}>`;
}

export function template(styles, body) {
  return h('html', [
    h('head', [
      h('title', 'Repo counts'),
      h('style', styles, [ ['type', 'text/css'] ]),
      h('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
    ]),
    h('body', body)
  ]);
}

function getNearestCommitFn(dates) {
  return function getNearestCommit(commits, dateIndex) {
    let files;

    while (!files && dateIndex > -1) {
      files = commits[dates[dateIndex--]]; // eslint-disable-line no-param-reassign
    }

    return files || [];
  };
}

function parseCountsForHtml(counts) {
  const dates = [...new Set(Object.values(counts).flatMap((result) => Object.keys(result)))].sort();
  const repoNames = Object.keys(counts);
  const fileTypes = [...new Set(Object.values(counts).flatMap((result) => Object.values(result).flatMap((files) => files.map((file) => getExt(file[0])))))].sort();
  const getNearestCommit = getNearestCommitFn(dates);
  const items = dates.map((date, dateIndex) => ({
    dateLabel: date,
    repos: repoNames.map((repoName) => {
      const files = getNearestCommit(counts[repoName], dateIndex);

      let count = 0;
      const byExtension = files.reduce((obj, [fileName, lines]) => {
        const ext = getExt(fileName);

        count += lines.length;
        obj[ext] = (obj[ext] || 0) + lines.length;

        return obj;
      }, {});

      return {
        repoLabel: repoName,
        count,
        types: fileTypes.map((fileType) => ({
          fileType,
          count: byExtension[fileType] || 0
        }))
      };
    })
  }));
  const values = items.flatMap(({ repos }) => repos.reduce((sum, { count }) => sum + count, 0));
  const maxValue = values.reduce((max, value) => max > value ? max : value);

  return {
    items,
    maxValue,
    repoNames,
    fileTypes
  };
}

export function getDates(dates) {
  if (!dates) {
    return [];
  }
  const [lowDate] = dates;
  const highDate = dates.pop();
  const [lowYear] = lowDate.split('-');
  const [highYear] = highDate.split('-');

  const forAllYear = new Array(1 + parseInt(highYear, 10) - parseInt(lowYear, 10)).fill(parseInt(lowYear, 10));

  if (highDate.includes('-')) {
    const allDates = forAllYear.flatMap((low, i) => new Array(12).fill(`${low + i}-`).map((prefix, j) => prefix + j.toString().padStart(2, '0')));

    return allDates.slice(allDates.indexOf(lowDate), allDates.indexOf(highDate) + 1);
  }

  return forAllYear.map((low, i) => (low + i).toString());
}
