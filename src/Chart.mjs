import { colors } from './consts.mjs';

const notFalse = (val) => val !== false;
const isMulti = (arr) => arr.length > 1;
const hashItemAttr = ({ id, label }) => JSON.stringify([id, label]);
const parseItemAttr = JSON.parse.bind(JSON);
const identity = (item) => item;

const uniqDataItems = (items) => [...new Set(items.map(hashItemAttr))].map(parseItemAttr);
const getMax = (arr, callbackFn = identity) => arr.reduce((max, item) => Math.max(max, callbackFn(item)), 0);
const getSum = (arr, callbackFn = identity) => arr.reduce((sum, item) => sum + callbackFn(item), 0);

const roundM = (num) => `${Math.round(num / 100000) / 10}M`;
const roundK = (num) => `${Math.round(num / 100) / 10}K`;
const round0 = (num) => `${Math.round(num)}`;

function roundUp(maxValue) {
  const rounding = '1';
  const roundingAmount = parseInt(rounding.padEnd((maxValue.toString().length / 2) + 1, '0'), 10);

  return Math.ceil(maxValue / roundingAmount) * roundingAmount;
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

function itemAttr({ id, label, value }) {
  return [
    id ? ['data-id', id] : false,
    value ? ['data-value', value] : false,
    ['data-label', label]
  ].filter(notFalse);
}

export default class Chart {
  constructor(data) {
    this.setData(data);
    this.getPeriod = this.getPeriod.bind(this);
    this.getSeries = this.getSeries.bind(this);
    this.getPoint = this.getPoint.bind(this);
    this.getLegend = this.getLegend.bind(this);
  }

  setData(data) {
    this.data = data;
    this.maxVal = roundUp(getMax(data.items, ({ items }) => getMax(items, (item) => getSum(item.items, (item2) => item2.value))));
    this.periods = uniqDataItems(data.items);
    this.series = uniqDataItems(data.items.flatMap(({ items }) => items));
    this.points = uniqDataItems(data.items.flatMap(({ items }) => items.flatMap(({ items: ites }) => ites)));

    return this;
  }

  getAxis() {
    const { maxVal } = this;
    const roundingFn = maxVal > 1000000 ? roundM : (maxVal > 1000 ? roundK : round0); // eslint-disable-line no-nested-ternary, no-extra-parens

    return e('.axis', [maxVal, maxVal / 4 * 3, maxVal / 2, maxVal / 4].map((value) => e('.axis-item', roundingFn(value), itemAttr({
      value
    }))));
  }

  getPlot() {
    return e('.plot', this.data.items.map(this.getPeriod));
  }

  getPeriod(data) {
    return e('.period', data.items.map(this.getSeries), itemAttr(data));
  }

  getSeries(data) {
    return e('.series', data.items.map(this.getPoint), itemAttr(data));
  }

  getPoint(data) {
    return e('.point', '', [
      ['style', `height:${(data.value / this.maxVal * 100).toFixed(5)}%`],
      ...itemAttr(data)
    ]);
  }

  getLegend(data) { // eslint-disable-line class-methods-use-this
    return e('.legend', data.map(([id, label]) => e('.legend-item', label, itemAttr({
      id,
      label
    }))));
  }

  getColorStyles() {
    const total = colors.length;
    const className = this.points.length > 1 ? 'point' : 'series';

    return colors.map((color, i) => `.${className}:nth-child(${total}n+${i + 1}),.legend-item:nth-child(${total}n+${i + 1}) {--item-color: ${color};}`).join('\n');
  }

  getTitle() {
    const { periods, series, points } = this;
    const periodDesc = periods.length === 1 ? periods[0][1] : `${periods[0][1]}-${periods[periods.length - 1][1]}`;
    const seriesDesc = series.length === 1 ? series[0][1] : `${series.length} repositories`;
    const pointsDesc = points.length === 1 ? `summary` : `detailed`;

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
        e('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
      ]),
      e('body', [
        e('h1.title', title),
        e('.chart', [axis, plot]),
        e('.footer', [this.series, this.points].filter(isMulti).map(this.getLegend))
      ])
    ]);
  }
}
