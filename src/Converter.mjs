import { basename, extname } from 'path';

import { DETAIL, FORMAT } from './consts.mjs';

function getExt(fileName) {
  const ext = extname(fileName);

  // console.log(fileName, ext, basename(fileName, ext));

  return basename(fileName, ext).length && ext.length ? ext : 'other';
}

function h(tagAndClassName, children, attributes = []) {
  const [tagName, className = ''] = tagAndClassName.split('.');
  const attrs = attributes.filter(Boolean).map(([key, value]) => value ? `${key}=${typeof value === 'string' ? `"${value}"` : value}` : key).join(' ');
  const tag = tagName || 'div';

  return `<${tag}${className ? ` class="${className}"` : ''}${attrs ? ` ${attrs}` : ''}>${Array.isArray(children) ? `\n${children.join('')}` : children}</${tag}>`;
}

export default class Converter {
  static historicalDiffCountsToCsv(counts) {
    const dates = [...new Set(Object.values(counts).flatMap((datas) => Object.keys(datas)))].sort();
    const repoNames = Object.keys(counts);
    const getCountForDate = (repoName, dateIndex) => counts[repoName][dates[dateIndex]];

    const rows = dates.map((date, index) => [date, ...repoNames.map((repoName) => {
      let count = 0;

      let dateIndex = index + 1;

      while (!count && dateIndex > -1) {
        count = getCountForDate(repoName, dateIndex--);
      }

      return count || -1;
    })]);

    return [ ['Year-month', ...repoNames], ...rows];
  }

  static historicalDiffCountsToHtml(counts) {
    const rows = this.historicalDiffCountsToCsv(counts);
    const maxValue = rows.slice(1).map((row) => row.slice(1).reduce((sum, val) => sum + val, 0)).reduce((max, value) => value > max ? value : max, 0);
    const repos = rows[0].slice(1);
    const dates = rows.slice(1).map((row) => row[0]);
    const styles = repos.map((_, index) => `#r${index}:checked ~ .chart .r${index} {width:100%} #r${index}:checked ~ .legend .r${index} {opacity:1}`).join(' '); // eslint-disable-line no-unused-vars

    return h('html', [
      h('head', [
        h('title', 'Repo history'),
        h('style', styles, [ ['type', 'text/css'] ]),
        h('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
      ]),
      h('body', [
        ...repos.map((_, index) => h('input.r', '', [ ['type', 'checkbox'], ['id', `r${index}`], ['checked'] ])), // eslint-disable-line no-unused-vars
        h('.legend', repos.map((repo, index) => h(`label.item r${index}`, repo, [ ['for', `r${index}`] ]))),
        h('.chart', dates.map((date, dateIndex) => h('.date', repos.map((_, index) => h( // eslint-disable-line no-unused-vars
          `.value r${index}`,
          '',
          [
            ['style', `height:${((rows[dateIndex + 1][index + 1] / maxValue) * 100).toFixed(5)}%`],
            rows[dateIndex + 1][index + 1] > 0 ? ['data-label', `${Math.ceil(rows[dateIndex + 1][index + 1] / 1000)}K`] : false
          ]
        )), [ ['data-label', date] ])))
      ])
    ]);
  }

  static historicalBlameCountsToCsv(counts) {
    const dates = [...new Set(Object.values(counts).flatMap((datas) => Object.keys(datas)))].sort();
    const repoNames = Object.keys(counts);
    const getCountForDate = (repoName, dateIndex) => counts[repoName][dates[dateIndex]];

    const rows = dates.map((date, index) => [date, ...repoNames.map((repoName) => {
      let count = 0;

      let dateIndex = index + 1;

      while (!count && dateIndex > -1) {
        count = getCountForDate(repoName, dateIndex--);
      }

      return count ? count.reduce((sum, [, lines]) => sum + lines.length, 0) : -1;
    })]);

    return [ ['Year-month', ...repoNames], ...rows];
  }

  static getNearestCommitFn(dates) {
    return function getNearestCommit(commits, dateIndex) {
      let files;

      while (!files && dateIndex > -1) {
        files = commits[dates[dateIndex--]]; // eslint-disable-line no-param-reassign
      }

      return files || [];
    };
  }

  static parseCountsForHtml(counts) {
    const dates = [...new Set(Object.values(counts).flatMap((result) => Object.keys(result)))].sort();
    const repoNames = Object.keys(counts);
    const fileTypes = [...new Set(Object.values(counts).flatMap((result) => Object.values(result).flatMap((files) => files.map((file) => getExt(file[0])))))].sort();
    const getNearestCommit = this.getNearestCommitFn(dates);
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

  static historicalBlameCountsToHtml(counts) {
    const { items, maxValue, repoNames, fileTypes } = this.parseCountsForHtml(counts);

    const ci = (className, index) => `${className} ${className}${index}`;
    const ii = (className, index) => `${className}${index}`;
    const T = 'type';
    const R = 'repo';

    const repoStyles = repoNames.map((_, rIndex) => ii(R, rIndex)).map((cl) => `#${cl}:checked ~ .app .repos .${cl} {opacity:1}\n#${cl}:checked ~ .app .chart .${cl} {width:100%}`); // eslint-disable-line no-unused-vars
    const typeStyles = fileTypes.map((_, ftIndex) => ii(T, ftIndex)).map((cl) => `#${cl}:checked ~ .app .file-types .${cl} {opacity:1}\n#${cl}:checked ~ .app .chart .${cl} {max-height:100%}`); // eslint-disable-line no-unused-vars
    const repoInputs = repoNames.map((_, rIndex) => h(`input.${R}`, '', [ ['type', 'checkbox'], ['id', ii(R, rIndex)], ['checked'] ])); // eslint-disable-line no-unused-vars
    const typeInputs = fileTypes.map((_, ftIndex) => h(`input.${T}`, '', [ ['type', 'checkbox'], ['id', ii(T, ftIndex)], ['checked'] ])); // eslint-disable-line no-unused-vars

    const percentItem = (className, children, label, value, max) => h(`.${className}`, children, [ // eslint-disable-line max-params
      ['style', `height:${(value / max * 100).toFixed(5)}%`],
      ['data-label', label],
      ['data-value', value]
    ]);

    return h('html', [
      h('head', [
        h('title', 'Repo history'),
        h('style', [...repoStyles, ...typeStyles].join('\n'), [ ['type', 'text/css'] ]),
        h('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
      ]),
      h('body', [
        ...repoInputs,
        ...typeInputs,
        h('.app', [
          h('.chart', items.map(({ dateLabel, repos }) => h('.date', repos.map(({ repoLabel, count, types }, rIndex) => percentItem(
            ci(R, rIndex),
            types.map(({ fileType, count: fileTypeCount }, ftIndex) => percentItem(ci(T, ftIndex), '', fileType, fileTypeCount, count)),
            repoLabel,
            count,
            maxValue
          )), [ ['data-label', dateLabel] ]))),
          h('.file-types', fileTypes.map((fileType, ftIndex) => h(`label.item ${ci(T, ftIndex)}`, fileType.replace('.', ''), [ ['for', ii(T, ftIndex)] ]))),
          h('.repos', repoNames.map((repoName, rIndex) => h(`label.item ${ci(R, rIndex)}`, repoName, [ ['for', ii(R, rIndex)] ])))
        ])
      ])
    ]);
  }

  static convert(config, format, data) {
    const { chronicle, detail } = config;

    const MODE = {
      CURRENT: 'current',
      HISTORY: 'history'
    };

    const CONVERTER = {
      [MODE.HISTORY]: {
        [DETAIL.DIFF]: {
          [FORMAT.JSON]: () => data,
          [FORMAT.CSV]: () => Converter.historicalDiffCountsToCsv(data), // eslint-disable-line no-use-before-define
          [FORMAT.HTML]: () => Converter.historicalDiffCountsToHtml(data) // eslint-disable-line no-use-before-define
        },
        [DETAIL.BLAME]: {
          [FORMAT.JSON]: () => data,
          [FORMAT.CSV]: () => Converter.historicalBlameCountsToCsv(data), // eslint-disable-line no-use-before-define
          [FORMAT.HTML]: () => Converter.historicalBlameCountsToHtml(data) // eslint-disable-line no-use-before-define
        }
      },
      [MODE.CURRENT]: {
        [DETAIL.DIFF]: {
          [FORMAT.JSON]: () => data,
          [FORMAT.CSV]: () => data,
          [FORMAT.HTML]: () => data
        },
        [DETAIL.BLAME]: {
          [FORMAT.JSON]: () => data,
          [FORMAT.CSV]: () => data,
          [FORMAT.HTML]: () => data
        }
      }
    };

    const fn = CONVERTER[chronicle ? MODE.HISTORY : MODE.CURRENT][detail ? DETAIL.BLAME : DETAIL.DIFF][format];

    return fn(data);
  }
}
