import Chart from './Chart.mjs';
import { FORMAT } from './consts.mjs';

export function normalizeDates(data) {
  const dates = [...new Set(data.flatMap(([, counts]) => Object.keys(counts)))].sort();

  if (!dates.length) {
    return [];
  }
  const [lowDate] = dates;
  const highDate = dates.pop();
  const [lowYear] = lowDate.split('-');
  const [highYear] = highDate.split('-');

  const forAllYear = new Array(1 + parseInt(highYear, 10) - parseInt(lowYear, 10)).fill(parseInt(lowYear, 10));

  if (highDate.includes('-')) {
    const allDates = forAllYear.flatMap((low, i) => new Array(12).fill(`${low + i}-`).map((prefix, j) => prefix + (j + 1).toString().padStart(2, '0')));

    return allDates.slice(allDates.indexOf(lowDate), allDates.indexOf(highDate) + 1);
  }

  return forAllYear.map((low, i) => (low + i).toString());
}

function getMatchingCounts(counts, dates, index) {
  while (index > 0 && !counts[dates[index]]) {
    index--; // eslint-disable-line no-param-reassign
  }

  return counts[dates[index]];
}

function countByExtension(files) {
  return files.reduce((obj, [, ext, lines]) => {
    obj[ext] = (obj[ext] || 0) + lines.length;

    return obj;
  }, {});
}

const chart = new Chart({
  items: []
});

export default class Converter {
  static currentSimpleCsv(data) {
    return [
      ['Repository', 'Line Count'],
      ...data
    ];
  }

  static currentSimpleHtml(data) {
    const chartData = {
      items: [Chart.makePeriod('Current', 'Current', data.map(([repoName, count], si) => Chart.makeSeries(si, repoName, [Chart.makePoint('all', 'all', count)])))]
    };

    return chart.setData(chartData).toHtmlString();
  }

  static currentDetailCsv(data) {
    return [
      ['Repository', 'FileName', 'Line Index', 'Line Date', 'Line Author', 'Line Length'],
      ...data.flatMap(([repo, files]) => files.flatMap(([fileName, ext, lines]) => lines.map((line, index) => [repo, fileName, ext, index + 1, ...line])))
    ];
  }

  static currentDetailHtml(data) {
    const fileTypes = [...new Set(data.flatMap(([, files]) => files.flatMap(([, ext]) => ext)))].sort();

    const chartData = {
      items: [Chart.makePeriod('Current', 'Current', data.map(([repoName, files], si) => {
        const byExtension = countByExtension(files);

        return Chart.makeSeries(si, repoName, fileTypes.map((fileType, pi) => Chart.makePoint(pi, fileType, byExtension[fileType])));
      }))]
    };

    return chart.setData(chartData).toHtmlString();
  }

  static chronicleSimpleCsv(data) {
    const dates = normalizeDates(data);

    return [
      ['Repository', 'Date', 'Line Count'],
      ...dates.flatMap((date, i) => data.map(([repo, counts]) => [repo, date, getMatchingCounts(counts, dates, i) || 0]))
    ];
  }

  static chronicleSimpleHtml(data) {
    const dates = normalizeDates(data);
    const chartData = {
      items: dates.map((date, di) => Chart.makePeriod(di, date, data.map(([repoName, counts], si) => Chart.makeSeries(si, repoName, [Chart.makePoint('all', 'all', getMatchingCounts(counts, dates, di))]))))
    };

    return chart.setData(chartData).toHtmlString();
  }

  static chronicleDetailCsv(data) {
    const dates = normalizeDates(data);

    const rows = dates.flatMap((date, i) => data.flatMap(([repo, counts]) => {
      const files = getMatchingCounts(counts, dates, i) || [];

      return files.flatMap(([fileName, ext, lines]) => lines.map((line, index) => [repo, date, fileName, ext, index + 1, ...line])); // eslint-disable-line max-nested-callbacks
    }));

    return [
      ['Repository', 'Date', 'FileName', 'Line Index', 'Line Date', 'Line Author', 'Line Length'],
      ...rows
    ];
  }

  static chronicleDetailHtml(data) {
    const dates = normalizeDates(data);
    const fileTypes = [...new Set(data.flatMap(([, counts]) => Object.values(counts).flatMap((files) => files.map(([, ext]) => ext))))].sort();
    const chartData = {
      items: dates.map((date, i) => Chart.makePeriod(i, date, data.map(([repoName, counts], si) => {
        const byExtension = countByExtension(getMatchingCounts(counts, dates, i) || []);

        return Chart.makeSeries(si, repoName, fileTypes.map((fileType, pi) => Chart.makePoint(pi, fileType, byExtension[fileType])));
      })))
    };

    return chart.setData(chartData).toHtmlString();
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
