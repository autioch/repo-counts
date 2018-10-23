/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */

function barsTemplate(bars, maxCount) {
  return bars
    .map(({ count, color }) => `<div className="bar" title="${count}" style="height:${(count / maxCount) * 100}%;background-color:${color}"></div>`)
    .join('');
}

function groupTemplate({ deletions, insertions, countSum, date, bars }, maxCount) {
  return `<div className="group" title="${countSum}">
      <div className="bars">
        <div className="deletions" title="${deletions}" style="bottom:${(deletions / maxCount) * 100}%">-</div>
        <div className="insertions" title="${insertions}" style="bottom:${(insertions / maxCount) * 100}%">+</div>
        <div className="bar--sum" title="${countSum}" style="height:${(countSum / maxCount) * 100}%"></div>
        ${barsTemplate(bars, maxCount)}
      </div>
      <div className="header">${date}</div>
    </div>`;
}

module.exports = function groupsTemplate(groups) {
  const maxCount = Math.max(...groups.map((group) => group.countSum));

  return groups.map((group) => groupTemplate(group, maxCount));
};
