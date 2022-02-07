/* eslint-disable no-use-before-define  */
import { basename, extname } from 'path';

import { FORMAT } from './consts.mjs';

export default class Converter {
  static chronicleSimpleCsv(data) {
    const dates = [...new Set(data.flatMap(([, counts]) => Object.keys(counts)))].sort();
    const validDates = getDates(dates);

    console.log(validDates);

    const rows = validDates.flatMap((date, index) => data.map(([repo, counts]) => {
      let count = 0;

      let dateIndex = index + 1;

      while (!count && dateIndex > -1) {
        count = counts[validDates[dateIndex--]];
      }

      return [repo, date, count || 0];
    }));

    return [
      ['Repository', 'Date', 'Line Count'],
      ...rows
    ];
  }

  static chronicleSimpleHtml(data) {
    return JSON.stringify(data, null, '  '); // TODO
    // const rows = this.chronicleSimpleCsv(counts);
    // const maxValue = rows.slice(1).map((row) => row.slice(1).reduce((sum, val) => sum + val, 0)).reduce((max, value) => value > max ? value : max, 0);
    // const repos = rows[0].slice(1);
    // const dates = rows.slice(1).map((row) => row[0]);
    // const styles = repos.map((_, index) => `#r${index}:checked ~ .chart .r${index} {width:100%} #r${index}:checked ~ .legend .r${index} {opacity:1}`).join(' '); // eslint-disable-line no-unused-vars
    // const body = [
    //   ...repos.map((_, index) => h('input.r', '', [ ['type', 'checkbox'], ['id', `r${index}`], ['checked'] ])), // eslint-disable-line no-unused-vars
    //   h('.legend', repos.map((repo, index) => h(`label.item r${index}`, repo, [ ['for', `r${index}`] ]))),
    //   h('.chart', dates.map((date, dateIndex) => h('.date', repos.map((_, index) => h( // eslint-disable-line no-unused-vars
    //     `.value r${index}`,
    //     '',
    //     [
    //       ['style', `height:${((rows[dateIndex + 1][index + 1] / maxValue) * 100).toFixed(5)}%`],
    //       rows[dateIndex + 1][index + 1] > 0 ? ['data-label', `${Math.ceil(rows[dateIndex + 1][index + 1] / 1000)}K`] : false
    //     ]
    //   )), [ ['data-label', date] ])))
    // ];
    //
    // return template(styles, body);
  }

  static chronicleDetailCsv(data) {
    const dates = [...new Set(data.flatMap(([, counts]) => Object.keys(counts)))].sort();
    const validDates = getDates(dates);

    console.log(validDates);

    const rows = validDates.flatMap((date, i) => data.flatMap(([repo, counts]) => {
      let count = 0;

      let dateIndex = i + 1;

      while (!count && dateIndex > -1) {
        count = counts[validDates[dateIndex--]];
      }

      if (!count) {
        return [];
      }

      return count.flatMap(([fileName, lines]) => lines.map((line, index) => [repo, date, fileName, index + 1, ...line])); // eslint-disable-line max-nested-callbacks
    }));

    return [
      ['Repository', 'Date', 'FileName', 'Line Index', 'Line Date', 'Line Author', 'Line Length'],
      ...rows
    ];
  }

  static chronicleDetailHtml(data) {
    return JSON.stringify(data, null, '  '); // TODO
    // const { items, maxValue, repoNames, fileTypes } = parseCountsForHtml(counts);
    //
    // const ci = (className, index) => `${className} ${className}${index}`;
    // const ii = (className, index) => `${className}${index}`;
    // const T = 'type';
    // const R = 'repo';
    //
    // const repoStyles = repoNames.map((_, rIndex) => ii(R, rIndex)).map((cl) => `#${cl}:checked ~ .app .repos .${cl} {opacity:1}\n#${cl}:checked ~ .app .chart .${cl} {width:100%}`); // eslint-disable-line no-unused-vars
    // const typeStyles = fileTypes.map((_, ftIndex) => ii(T, ftIndex)).map((cl) => `#${cl}:checked ~ .app .file-types .${cl} {opacity:1}\n#${cl}:checked ~ .app .chart .${cl} {max-height:100%}`); // eslint-disable-line no-unused-vars
    // const repoInputs = repoNames.map((_, rIndex) => h(`input.${R}`, '', [ ['type', 'checkbox'], ['id', ii(R, rIndex)], ['checked'] ])); // eslint-disable-line no-unused-vars
    // const typeInputs = fileTypes.map((_, ftIndex) => h(`input.${T}`, '', [ ['type', 'checkbox'], ['id', ii(T, ftIndex)], ['checked'] ])); // eslint-disable-line no-unused-vars
    //
    // const percentItem = (className, children, label, value, max) => h(`.${className}`, children, [ // eslint-disable-line max-params
    //   ['style', `height:${(value / max * 100).toFixed(5)}%`],
    //   ['data-label', label],
    //   ['data-value', value]
    // ]);
    //
    // const body = [
    //   ...repoInputs,
    //   ...typeInputs,
    //   h('.app', [
    //     h('.chart', items.map(({ dateLabel, repos }) => h('.date', repos.map(({ repoLabel, count, types }, rIndex) => percentItem(
    //       ci(R, rIndex),
    //       types.map(({ fileType, count: fileTypeCount }, ftIndex) => percentItem(ci(T, ftIndex), '', fileType, fileTypeCount, count)),
    //       repoLabel,
    //       count,
    //       maxValue
    //     )), [ ['data-label', dateLabel] ]))),
    //     h('.file-types', fileTypes.map((fileType, ftIndex) => h(`label.item ${ci(T, ftIndex)}`, fileType.replace('.', ''), [ ['for', ii(T, ftIndex)] ]))),
    //     h('.repos', repoNames.map((repoName, rIndex) => h(`label.item ${ci(R, rIndex)}`, repoName, [ ['for', ii(R, rIndex)] ])))
    //   ])
    // ];

    // return template([...repoStyles, ...typeStyles].join('\n'), body);
  }

  static currentSimpleCsv(data) {
    return [
      ['Repository', 'Line Count'],
      ...data
    ];
  }

  static currentSimpleHtml(data) {
    return JSON.stringify(data, null, '  '); // TODO
  }

  static currentDetailCsv(data) {
    return [
      ['Repository', 'FileName', 'Line Index', 'Line Date', 'Line Author', 'Line Length'],
      ...data.flatMap(([repo, files]) => files.flatMap(([fileName, lines]) => lines.map((line, index) => [repo, fileName, index + 1, ...line])))
    ];
  }

  static currentDetailHtml(data) {
    return JSON.stringify(data, null, '  '); // TODO
  }

  static convert(config, format, data) {
    if (format === FORMAT.JSON) {
      return data;
    }
    const { chronicle, detail } = config;

    if (chronicle && detail) {
      return format === FORMAT.CSV ? this.chronicleDetailCsv(data) : this.chronicleDetailHtml(data);
    }
    if (chronicle && !detail) {
      return format === FORMAT.CSV ? this.chronicleSimpleCsv(data) : this.chronicleSimpleHtml(data);
    }
    if (!chronicle && detail) {
      return format === FORMAT.CSV ? this.currentDetailCsv(data) : this.currentDetailHtml(data);
    }
    if (!chronicle && !detail) {
      return format === FORMAT.CSV ? this.currentSimpleCsv(data) : this.currentSimpleHtml(data);
    }

    return data;
  }
}

function getExt(fileName) {
  const ext = extname(fileName);

  return basename(fileName, ext).length && ext.length ? ext : 'other';
}

function h(tagAndClassName, children, attributes = []) {
  const [tagName, className = ''] = tagAndClassName.split('.');
  const attrs = attributes.filter(Boolean).map(([key, value]) => value ? `${key}=${typeof value === 'string' ? `"${value}"` : value}` : key).join(' ');
  const tag = tagName || 'div';

  return `<${tag}${className ? ` class="${className}"` : ''}${attrs ? ` ${attrs}` : ''}>${Array.isArray(children) ? `\n${children.join('')}` : children}</${tag}>`;
}

function template(styles, body) {
  return h('html', [
    h('head', [
      h('title', 'Repo history'),
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

function getDates(dates) {
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
