/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const repos = require('./repos');
const { readFile, writeFile } = require('./utils');
const bluebird = require('bluebird');
const { keyBy: indexBy, uniq, flatten } = require('lodash');
const ignored = require('./ignored');

function build(groups, types) {
  let maxBar = 0;
  const groupWidth = 90 / groups.length;

  groups.forEach((group) => {
    const totalBar = group.bars.reduce((sum, bar) => sum + bar.count, 0);

    if (totalBar > maxBar) {
      maxBar = totalBar;
    }
  });

  const legend = repos.map((repo) => `<div class="legend__item">
    <div class="legend__box" style="background-color:${repo.color}"></div>
    <div>${repo.repoName}</div>
  </div>`);

  const els = groups.map((group) => {
    const header = `<div class="header">${group.date.replace('-', '.')}</div>`;

    const bars = group.bars.map((bar) => `<div class="bar" title="${bar.count}" style="height:${(bar.count / maxBar) * 100}%;background-color:${bar.color}"></div>`);
    const sumHeight = group.bars.reduce((sum, bar) => sum + (bar.count || 0), 0);

    return `<div class="group" style="width:${groupWidth}%" title="${sumHeight}">
      <div class="bars">
        <div class="bar--sum" title="${sumHeight}" style="height:${(sumHeight / maxBar) * 100}%"></div>
        ${bars.join('')}
      </div>
      ${header}
    </div>`;
  });

  return `<!doctype html>
  <html>
  <head>
    <style type="text/css">
      html,body{padding:0;margin:0;border:0;width:100%;height:100%;font-size:10px;font-family:Verdana}
      .chart{width:100%;height:100%;display:flex;justify-content:space-around}
      .group{display:flex;flex-direction:column}
      .header{flex:none;transform-origin:center top;transform:rotate(-90deg) translate(-75%,-50%);white-space:nowrap;overflow:visible}
      .bars{display:flex;align-items:flex-end;height:calc(100% - 7em);position:relative}
      .bar{flex-grow:1}
      .bar--sum{flex-grow:1;background:#bbb;position:absolute;bottom:0;left:0;right:0;z-index:-1}
      .types{position:absolute;top:1em;left:1em}
      .ignored{position:absolute;top:3em;left:1em}
      .legend{position:absolute;top:5em;left:1em}
      .legend__box{height:1vw;width:1vw;margin-right:1vw}
      .legend__item{display:flex;align-items:center;margin-bottom:1em}
    </style>
  </head>
  <body>
    <div class="legend">${legend.join('')}</div>
    <div class="types">${types.join(', ')}</div>
    <div class="ignored">${ignored.join(', ')}</div>
    <div class="chart">${els.join('')}</div>
  </body>
  </html>`;
}

function formatDate(date) {
  const [year, month] = date.split('-');

  return `${year}-${month.length < 2 ? `0${month}` : month}`;
}

function getReportedTypes(data) {
  const types = [];

  data.forEach((datum) => {
    datum.counts.forEach((info) => {
      types.push(Object.keys(info.count));
    });
  });

  return uniq(flatten(types)).filter((type) => type !== 'SUM').sort();
}

function parse(data) {
  data.forEach((datum) => {
    datum.counts.forEach((info) => {
      info.date = formatDate(info.date);
    });
    datum.dict = indexBy(datum.counts, 'date');
  });

  const allDates = uniq(data.reduce((dates, repo) => dates.concat(repo.counts.map((count) => count.date)), []));
  const changed = allDates
    .map((date) => formatDate(date))
    .sort((a, b) => a.localeCompare(b));

  const groups = changed.map((date) => ({
    date,
    bars: data.map((datum) => ({
      repoName: datum.repo.repoName,
      color: datum.repo.color,
      count: datum.dict[date] ? datum.dict[date].count.SUM.code : undefined
    }))
  }));

  groups.forEach((group, index) => group.bars.forEach((bar, barIndex) => {
    if (bar.count) {
      return;
    }

    bar.count = groups[index] ? groups[index].bars[barIndex].count : 0;
  }));

  const types = getReportedTypes(data);

  const html = build(groups, types);

  writeFile('chart.html', html);
}

bluebird
  .map(repos, (repo) => readFile(`${repo.repoName}__counts.json`).then((raw) => ({
    repo,
    counts: JSON.parse(raw)
  })), {
    concurrency: 2
  })
  .then(parse);
