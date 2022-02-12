const notFalse = (val) => val !== false;
const hashItemAttr = ({ id, label }) => JSON.stringify([id, label]);
const parseItemAttr = JSON.parse.bind(JSON);
const identity = (item) => item;

export const uniqDataItems = (items) => [...new Set(items.map(hashItemAttr))].map(parseItemAttr);
export const getMax = (arr, callbackFn = identity) => arr.reduce((max, item) => Math.max(max, callbackFn(item)), 0);
export const getSum = (arr, callbackFn = identity) => arr.reduce((sum, item) => sum + callbackFn(item), 0);

export function e(tagAndClassName, children, attributes = []) {
  const [tag, className = ''] = tagAndClassName.split('.');
  const tagName = tag || 'div';
  const attrs = attributes.filter(notFalse).map(([key, value]) => value ? `${key}=${typeof value === 'string' ? `"${value}"` : value}` : key).join(' ');
  const classAttr = className ? `class="${className}"` : '';
  const content = Array.isArray(children) ? children.filter(notFalse).join('') : children;
  const tested = content ?? '';

  return `<${[tagName, classAttr, attrs].filter(Boolean).join(' ')}>${tested}</${tagName}>`;
}

export function itemAttr({ id, label, value }) {
  return [
    id ? ['data-id', id] : false,
    value ? ['data-value', value] : false,
    ['data-label', label]
  ].filter(notFalse);
}

export function getTitle(periods, series, points) {
  const periodDesc = periods.length === 1 ? periods[0][1] : `${periods[0][1]}-${periods[periods.length - 1][1]}`;
  const seriesDesc = series.length === 1 ? series[0][1] : `${series.length} repositories`;
  const pointsDesc = points.length === 1 ? `summary` : `detailed`;

  return `${periodDesc} ${pointsDesc} counts of ${seriesDesc}`;
}

const roundM = (num) => `${Math.round(num / 100000) / 10}M`;
const roundK = (num) => `${Math.round(num / 100) / 10}K`;
const round0 = (num) => `${Math.round(num)}`;

export const getRoundingFn = (maxValue) => maxValue > 1000000 ? roundM : (maxValue > 1000 ? roundK : round0); // eslint-disable-line no-nested-ternary, no-extra-parens

export function getMaxCount(maxValue) {
  const rounding = '1';
  const roundingAmount = parseInt(rounding.padEnd((maxValue.toString().length / 2) + 1, '0'), 10);

  return Math.ceil(maxValue / roundingAmount) * roundingAmount;
}

export const colors = [
  '#5CBAE6',
  '#B6D957',
  '#E9707B',
  '#FAC364',
  '#98AAFB',
  '#80B877',
  '#D998CB',
  '#F2D249',
  '#93B9C6',
  '#CCC5A8'
];
