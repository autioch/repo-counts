import { colors, e, getMax, getMaxCount, getRoundingFn, getSum, getTitle, itemAttr, uniqDataItems } from './utils.mjs';

function ePoint(data, maxValue) {
  return e('.point', '', [
    ['style', `height:${(data.value / maxValue * 100).toFixed(5)}%`],
    ...itemAttr(data)
  ]);
}

function eSeries(data, maxVal) {
  return e('.series', data.items.map((item) => ePoint(item, maxVal)), itemAttr(data));
}

function ePeriod(data, maxVal) {
  return e('.period', data.items.map((item) => eSeries(item, maxVal)), itemAttr(data));
}

function ePlot(data, maxVal) {
  return e('.plot', data.items.map((item) => ePeriod(item, maxVal)), itemAttr(data));
}

function eLegendItem(data) {
  return e('.legend-item', data.label, itemAttr(data));
}

function eLegend(items) {
  return e('.legend', items.map(([id, label]) => eLegendItem({
    id,
    label
  })));
}

function eAxis(maxVal) {
  const roundingFn = getRoundingFn(maxVal);

  return e('.axis', [maxVal, maxVal / 4 * 3, maxVal / 2, maxVal / 4].map((value) => e('.axis-item', roundingFn(value), itemAttr({
    value
  }))));
}

function buildColorStyles(points) {
  const total = colors.length;
  const className = points.length > 1 ? 'point' : 'series';

  return colors.map((color, i) => `.${className}:nth-child(${total}n+${i + 1}),.legend-item:nth-child(${total}n+${i + 1}) {--item-color: ${color};}`).join('\n');
}

export default function chart(data) {
  const periods = uniqDataItems(data.items);
  const series = uniqDataItems(data.items.flatMap(({ items }) => items));
  const points = uniqDataItems(data.items.flatMap(({ items }) => items.flatMap(({ items: ites }) => ites)));
  const maxValue = getMax(data.items, ({ items }) => getMax(items, (item) => getSum(item.items, (item2) => item2.value)));
  const maxVal = getMaxCount(maxValue);

  const axis = eAxis(maxVal);
  const plot = ePlot(data, maxVal);
  const title = getTitle(periods, series, points);

  return e('html', [
    e('head', [
      e('title', title),
      e('style', buildColorStyles(points), [ ['type', 'text/css'] ]),
      e('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
    ]),
    e('body', [
      e('h1.title', title),
      e('.chart', [axis, plot]),
      e('.footer', [series, points].filter((items) => items.length > 1).map(eLegend))
    ])
  ]);
}
