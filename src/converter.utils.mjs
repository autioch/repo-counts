import { basename, extname } from 'path';

export function h(tagAndClassName, children, attributes = []) {
  const [tagName, className = ''] = tagAndClassName.split('.');
  const attrs = attributes.filter(Boolean).map(([key, value]) => value ? `${key}=${typeof value === 'string' ? `"${value}"` : value}` : key).join(' ');
  const tag = tagName || 'div';

  return `<${tag}${className ? ` class="${className}"` : ''}${attrs ? ` ${attrs}` : ''}>${Array.isArray(children) ? `\n${children.join('')}` : children}</${tag}>`;
}

export function getDates(data) {
  const dates = [...new Set(data.flatMap(([, counts]) => Object.keys(counts)))].sort();
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

export function template(styles, controls, chart, fileTypes, repos) { // eslint-disable-line max-params
  return h('html', [
    h('head', [
      h('title', 'Repo counts'),
      h('style', styles, [ ['type', 'text/css'] ]),
      h('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
    ]),
    h('body', [
      ...controls,
      h('.app', [
        h('.chart', chart),
        fileTypes ? h('.file-types', fileTypes) : '',
        h('.repos', repos)
      ])
    ])
  ]);
}

function getExt(fileName) {
  const ext = extname(fileName);

  return basename(fileName, ext).length && ext.length ? ext : 'other';
}

export function getData(counts, dates, dateIndex) {
  let data;

  let index = dateIndex + 1;

  while (!data && index > -1) {
    data = counts[dates[index--]];
  }

  return data;
}

export function chronicleDetailForHtml(data) {
  const dates = getDates(data);
  const fileTypes = [...new Set(data.flatMap(([, counts]) => Object.values(counts).flatMap((files) => files.map((file) => getExt(file[0])))))].sort();
  const items = dates.map((date, i) => ({
    dateLabel: date,
    repos: data.map(([repoName, counts]) => {
      let count = 0;
      const files = getData(counts, dates, i) || [];
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

  return {
    items,
    fileTypes,
    maxValue: items.map(({ repos }) => repos.reduce((sum, { count }) => sum + count, 0)).reduce((max, value) => max > value ? max : value)
  };
}

export function chronicleSimpleForHtml(data) {
  const dates = getDates(data);
  const items = dates.map((date, i) => ({
    dateLabel: date,
    repos: data.map(([repoName, counts]) => ({
      repoLabel: repoName,
      count: getData(counts, dates, i) || 0
    }))
  }));

  return {
    items,
    maxValue: items.map(({ repos }) => repos.reduce((sum, { count }) => sum + count, 0)).reduce((max, value) => max > value ? max : value)
  };
}

export function currentSimpleForHtml(data) {
  const items = data.map(([repoName, count]) => ({
    repoName,
    count
  }));

  return {
    items,
    maxValue: items.reduce((max, { count }) => max > count ? max : count)
  };
}

export function currentDetailForHtml(data) {
  const items = data.map(([repoName, count]) => ({
    repoName,
    count
  }));

  return {
    items,
    maxValue: items.reduce((max, { count }) => max > count ? max : count)
  };
}
