import { colors } from './consts.mjs';

const notFalse = (val) => val !== false;
const isMulti = (arr) => arr.length > 1;
const hashItemAttr = ({ id, label }) => JSON.stringify({
  id,
  label
});
const parseItemAttr = JSON.parse.bind(JSON);
const identity = (item) => item;

const uniqDataItems = (items) => [...new Set(items.map(hashItemAttr))].map(parseItemAttr);
const getMax = (arr, callbackFn = identity) => arr.reduce((max, item) => Math.max(max, callbackFn(item)), 0);
const getSum = (arr, callbackFn = identity) => arr.reduce((sum, item) => sum + callbackFn(item), 0);

const roundM = (num) => `${Math.round(num / 100000) / 10}M`;
const roundK = (num) => `${Math.round(num / 100) / 10}K`;
const round0 = (num) => `${Math.round(num)}`;

export function roundUp(maxValue) {
  const rounding = '1';
  const roundingAmount = parseInt(rounding.padEnd((maxValue.toString().length / 2) + 1, '0'), 10);

  return Math.ceil(maxValue / roundingAmount) * roundingAmount;
}

export function getAxisValues(maxVal) {
  const roundingFn = maxVal > 1000000 ? roundM : (maxVal > 1000 ? roundK : round0); // eslint-disable-line no-nested-ternary, no-extra-parens

  return [maxVal, maxVal / 4 * 3, maxVal / 2, maxVal / 4].map(roundingFn);
}

function e(tagAndClassName, children, attributes = []) {
  const [tag, className = ''] = tagAndClassName.split('.');
  const tagName = tag || 'div';
  const attrs = attributes.filter(notFalse).map(([key, value]) => value ? `${key}=${typeof value === 'string' ? `"${value}"` : value}` : key).join(' ');
  const classAttr = className ? `class="${className}"` : '';
  const content = Array.isArray(children) ? children.filter(notFalse).join('') : children;
  const tested = content ?? '';

  return `<${[tagName, classAttr, attrs].filter(Boolean).join(' ')}>${tested}</${tagName}>`;
}

export default class Chart {
  constructor(data) {
    this.setData(data);
    this.getControl = this.getControl.bind(this);
    this.getPeriod = this.getPeriod.bind(this);
    this.getSeries = this.getSeries.bind(this);
    this.getPoint = this.getPoint.bind(this);
    this.getLegend = this.getLegend.bind(this);
  }

  static makePoint(id, label, value = 0) {
    return {
      id: `p${id}`,
      label,
      value
    };
  }

  static makeSeries(id, label, items) {
    return {
      id: `s${id}`,
      label,
      items
    };
  }

  static makePeriod(id, label, items) {
    return {
      id: `g${id}`,
      label,
      items
    };
  }

  setData(data) {
    this.data = data;
    this.maxVal = roundUp(getMax(data.items, (period) => getMax(period.items, (series) => getSum(series.items, (point) => point.value))));
    this.periods = uniqDataItems(data.items);
    this.series = uniqDataItems(data.items.flatMap(({ items }) => items));
    this.points = uniqDataItems(data.items.flatMap(({ items }) => items.flatMap(({ items: ites }) => ites)));
    this.isManyPeriods = this.periods.length > 1;
    this.isManySeries = this.series.length > 1;
    this.isManyPoints = this.points.length > 1;
    this.descriptionMode = this.isManyPeriods ? 'period' : (this.isManySeries ? 'series' : '');// eslint-disable-line no-nested-ternary, no-extra-parens

    return this;
  }

  getAxis() {
    const axisValues = getAxisValues(this.maxVal);

    return e('.axis', axisValues.map((value) => e('.axis-item', value)));
  }

  getPlot() {
    return e('.plot', this.data.items.map(this.getPeriod));
  }

  getPeriod(data) {
    return e(`.period${this.isManyPeriods ? ' desc-bottom' : ''}`, data.items.map(this.getSeries), [this.isManyPeriods ? ['data-label', data.label] : false]);
  }

  getSeries(data) {
    const withTooltip = this.isManyPeriods && data.items.some((item) => item.value > 0);
    const withDescription = !this.isManyPeriods && this.isManySeries;

    return e(`.series${withTooltip ? ' tooltip--bottom' : (withDescription ? ' desc--bottom' : '')}`, data.items.map(this.getPoint), [// eslint-disable-line no-nested-ternary, no-extra-parens
      ['data-id', data.id],
      withTooltip || withDescription ? ['data-label', data.label] : false
    ]);
  }

  getPoint(data) {
    return e(`.point${this.isManyPoints ? ' tooltip--left' : ''}`, '', [
      ['style', `height:${(data.value / this.maxVal * 100).toFixed(5)}%`],
      ['data-id', data.id],
      this.isManyPoints ? ['data-label', `${data.label} ${data.value}`] : false
    ]);
  }

  getControl(data) { // eslint-disable-line class-methods-use-this
    return data.map(({ id }) => e('input.control', '', [ ['type', 'checkbox'], ['id', id], ['checked'] ]));
  }

  getSeriesStyles() {
    return this.series.map(({ id }) => `#${id}:checked ~ .footer .legend .legend-item[data-id="${id}"]{opacity:1}\n#${id}:checked ~ .chart .period .series[data-id="${id}"]{width:100%}`);
  }

  getPointStyles() {
    return this.points.map(({ id }) => `#${id}:checked ~ .footer .legend .legend-item[data-id="${id}"]{opacity:1}\n#${id}:checked ~ .chart .period .series .point[data-id="${id}"]{max-height:100%}`);
  }

  getLegend(data) { // eslint-disable-line class-methods-use-this
    return e('.legend', data.map((item) => e('label.legend-item', item.label, [ ['for', item.id], ['data-id', item.id] ])));
  }

  getColorStyles() {
    const total = colors.length;
    const className = this.isManyPoints ? 'point' : 'series';

    return colors.map((color, i) => `.${className}:nth-child(${total}n+${i + 1}),.legend-item:nth-child(${total}n+${i + 1}) {--item-color: ${color};}`).join('\n');
  }

  getTitle() {
    const periodDesc = this.isManyPeriods ? `${this.periods[0].label}-${this.periods[this.periods.length - 1].label}` : this.periods[0].label;
    const seriesDesc = this.isManySeries ? `${this.series.length} repositories` : this.series[0].label;
    const pointsDesc = this.isManyPoints ? `detailed` : `summary`;

    return `${periodDesc} ${pointsDesc} counts of ${seriesDesc}`;
  }

  toHtmlString() {
    const axis = this.getAxis();
    const plot = this.getPlot();
    const title = this.getTitle();

    return e('html', [
      e('head', [
        e('title', title),
        e('style', this.getColorStyles(), [ ['type', 'text/css'] ]),
        e('style', this.getSeriesStyles(), [ ['type', 'text/css'] ]),
        e('style', this.getPointStyles(), [ ['type', 'text/css'] ]),
        e('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
      ]),
      e('body', [
        e('h1.title', title),
        ...this.getControl(this.series),
        ...this.getControl(this.points),
        e(`.chart${this.isManyPeriods || this.isManySeries ? ' description' : ''}`, [axis, plot]),
        e('.footer', [this.series, this.points].filter(isMulti).map(this.getLegend))
      ])
    ]);
  }
}
