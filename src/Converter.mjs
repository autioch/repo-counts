import { FORMAT } from './consts.mjs';
import { chronicleDetailForHtml, chronicleSimpleForHtml, currentDetailForHtml, currentSimpleForHtml, getData, getDates, h, template } from './converter.utils.mjs';

export default class Converter {
  static currentSimpleCsv(data) {
    return [
      ['Repository', 'Line Count'],
      ...data
    ];
  }

  static currentSimpleHtml(data) {
    const { items, maxValue } = currentSimpleForHtml(data); // TODO

    const ci = (className, index) => `${className} ${className}${index}`;
    const ii = (className, index) => `${className}${index}`;
    const R = 'repo';
    const repos = data.map(({ repoName }, rIndex) => h(`label.item ${ci(R, rIndex)}`, repoName, [ ['for', ii(R, rIndex)] ]));

    return template('', '', 'chart', '', repos);
  }

  static currentDetailCsv(data) {
    return [
      ['Repository', 'FileName', 'Line Index', 'Line Date', 'Line Author', 'Line Length'],
      ...data.flatMap(([repo, files]) => files.flatMap(([fileName, lines]) => lines.map((line, index) => [repo, fileName, index + 1, ...line])))
    ];
  }

  static currentDetailHtml(data) {
    return template('', [], h('pre', JSON.stringify(data, null, '  '))); // TODO
  }

  static chronicleSimpleCsv(data) {
    const dates = getDates(data);

    return [
      ['Repository', 'Date', 'Line Count'],
      ...dates.flatMap((date, i) => data.map(([repo, counts]) => [repo, date, getData(counts, dates, i) || 0]))
    ];
  }

  static chronicleSimpleHtml(data) {
    const { items, maxValue } = chronicleSimpleForHtml(data);

    const ci = (className, index) => `${className} ${className}${index}`;
    const ii = (className, index) => `${className}${index}`;
    const R = 'repo';

    const repoStyles = data.map((_, rIndex) => ii(R, rIndex)).map((cl) => `#${cl}:checked ~ .app .repos .${cl} {opacity:1}\n#${cl}:checked ~ .app .chart .${cl} {width:100%}`); // eslint-disable-line no-unused-vars
    const repoInputs = data.map((_, rIndex) => h(`input.${R}`, '', [ ['type', 'checkbox'], ['id', ii(R, rIndex)], ['checked'] ])); // eslint-disable-line no-unused-vars

    const percentItem = (className, children, label, value, max) => h(`.${className}`, children, [ // eslint-disable-line max-params
      ['style', `height:${(value / max * 100).toFixed(5)}%`],
      ['data-label', label],
      ['data-value', value]
    ]);

    const styles = [...repoStyles];
    const controls = [...repoInputs];
    const chart = items.map(({ dateLabel, repos }) => h('.date', repos.map(({ repoLabel, count }, rIndex) => percentItem(
      ci(R, rIndex),
      repoLabel,
      count,
      maxValue
    )), [ ['data-label', dateLabel] ]));
    const reposH = data.map(([repoName], rIndex) => h(`label.item ${ci(R, rIndex)}`, repoName, [ ['for', ii(R, rIndex)] ]));

    return template(styles, controls, chart, '', reposH);
  }

  static chronicleDetailCsv(data) {
    const dates = getDates(data);

    const rows = dates.flatMap((date, i) => data.flatMap(([repo, counts]) => {
      const files = getData(counts, dates, i) || [];

      return files.flatMap(([fileName, lines]) => lines.map((line, index) => [repo, date, fileName, index + 1, ...line])); // eslint-disable-line max-nested-callbacks
    }));

    return [
      ['Repository', 'Date', 'FileName', 'Line Index', 'Line Date', 'Line Author', 'Line Length'],
      ...rows
    ];
  }

  static chronicleDetailHtml(data) {
    const { items, maxValue, fileTypes } = chronicleDetailForHtml(data);

    const ci = (className, index) => `${className} ${className}${index}`;
    const ii = (className, index) => `${className}${index}`;
    const T = 'type';
    const R = 'repo';

    const repoStyles = data.map((_, rIndex) => ii(R, rIndex)).map((cl) => `#${cl}:checked ~ .app .repos .${cl} {opacity:1}\n#${cl}:checked ~ .app .chart .${cl} {width:100%}`); // eslint-disable-line no-unused-vars
    const typeStyles = fileTypes.map((_, ftIndex) => ii(T, ftIndex)).map((cl) => `#${cl}:checked ~ .app .file-types .${cl} {opacity:1}\n#${cl}:checked ~ .app .chart .${cl} {max-height:100%}`); // eslint-disable-line no-unused-vars
    const repoInputs = data.map((_, rIndex) => h(`input.${R}`, '', [ ['type', 'checkbox'], ['id', ii(R, rIndex)], ['checked'] ])); // eslint-disable-line no-unused-vars
    const typeInputs = fileTypes.map((_, ftIndex) => h(`input.${T}`, '', [ ['type', 'checkbox'], ['id', ii(T, ftIndex)], ['checked'] ])); // eslint-disable-line no-unused-vars

    const percentItem = (className, children, label, value, max) => h(`.${className}`, children, [ // eslint-disable-line max-params
      ['style', `height:${(value / max * 100).toFixed(5)}%`],
      ['data-label', label],
      ['data-value', value]
    ]);

    const styles = [...repoStyles, ...typeStyles];
    const controls = [...repoInputs, ...typeInputs];
    const chart = items.map(({ dateLabel, repos }) => h('.date', repos.map(({ repoLabel, count, types }, rIndex) => percentItem(
      ci(R, rIndex),
      types.map(({ fileType, count: fileTypeCount }, ftIndex) => percentItem(ci(T, ftIndex), '', fileType, fileTypeCount, count)),
      repoLabel,
      count,
      maxValue
    )), [ ['data-label', dateLabel] ]));
    const fileTypesH = fileTypes.map((fileType, ftIndex) => h(`label.item ${ci(T, ftIndex)}`, fileType.replace('.', ''), [ ['for', ii(T, ftIndex)] ]));
    const reposH = data.map(([repoName], rIndex) => h(`label.item ${ci(R, rIndex)}`, repoName, [ ['for', ii(R, rIndex)] ]));

    return template(styles, controls, chart, fileTypesH, reposH);
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
