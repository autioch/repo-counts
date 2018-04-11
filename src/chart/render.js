/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const ignored = require('../ignored');

module.exports = function render(groups, types, repos) {
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
    <div>${repo.repoName}: +${repo.insertions} -${repo.deletions} (${repo.diff})</div>
  </div>`);

  const els = groups.map((group) => {
    const header = `<div class="header">${group.date.replace('-', '.')}</div>`;

    const bars = group.bars.map((bar) => `<div class="bar" title="${bar.count}" style="height:${(bar.count / maxBar) * 100}%;background-color:${bar.color}"></div>`);
    const sumHeight = group.bars.reduce((sum, bar) => sum + (bar.count || 0), 0);
    const { deletions, insertions } = group;

    return `<div class="group" style="width:${groupWidth}%" title="${sumHeight}">
      <div class="bars">
        <div class="deletions" title="${deletions}" style="bottom:${(deletions / maxBar) * 100}%">-</div>
        <div class="insertions" title="${insertions}" style="bottom:${(insertions / maxBar) * 100}%">+</div>
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
      .group:hover{background:#def}
      .header{flex:none;transform-origin:center top;transform:rotate(-90deg) translate(-75%,-50%);white-space:nowrap;overflow:visible}
      .bars{display:flex;align-items:flex-end;height:calc(100% - 7em);position:relative;z-index:1}
      .bar{flex-grow:1}
      .bar--sum{flex-grow:1;background:#bbb;position:absolute;bottom:0;left:0;right:0;z-index:-1}
      .types{position:absolute;top:1em;left:1em}
      .deletions{position:absolute;left:.25em;border-radius:50%;width:1em;height:1em;background-color:#000;color:#fff;display:flex;align-items:center;justify-content:center}
      .insertions{position:absolute;right:.25em;border-radius:50%;width:1em;height:1em;background-color:#000;color:#fff;display:flex;align-items:center;justify-content:center}
      .ignored{position:absolute;top:3em;left:1em}
      .legend{position:absolute;top:5em;left:1em}
      .legend__box{height:1vw;width:1vw;margin-right:1vw}
      .legend__item{display:flex;align-items:center;margin-bottom:1em}
    </style>
  </head>
  <body>
    <div class="legend">${legend.join('')}</div>
    <div class="types">Included types: ${types.join(', ')}</div>
    <div class="ignored">Ignored types: ${ignored.join(', ')}</div>
    <div class="chart">${els.join('')}</div>
  </body>
  </html>`;
};
