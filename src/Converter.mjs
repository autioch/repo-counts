import { FORMAT } from './consts.mjs';
import { getDates, h, template } from './converter.utils.mjs';

export default class Converter {
  static currentSimpleCsv(data) {
    return [
      ['Repository', 'Line Count'],
      ...data
    ];
  }

  static currentSimpleHtml(data) {
    return template('', h('p', JSON.stringify(data, null, '  '))); // TODO
  }

  static currentDetailCsv(data) {
    return [
      ['Repository', 'FileName', 'Line Index', 'Line Date', 'Line Author', 'Line Length'],
      ...data.flatMap(([repo, files]) => files.flatMap(([fileName, lines]) => lines.map((line, index) => [repo, fileName, index + 1, ...line])))
    ];
  }

  static currentDetailHtml(data) {
    return template('', h('p', JSON.stringify(data, null, '  '))); // TODO
  }

  static chronicleSimpleCsv(data) {
    const dates = [...new Set(data.flatMap(([, counts]) => Object.keys(counts)))].sort();
    const validDates = getDates(dates);

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
    return template('', h('p', JSON.stringify(data, null, '  '))); // TODO
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
    return template('', h('p', JSON.stringify(data, null, '  '))); // TODO
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
