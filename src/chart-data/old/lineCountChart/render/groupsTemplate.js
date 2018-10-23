/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */

function barsTemplate(bars, maxCount) {
  return bars
    .map(({ count, color }) => `<div class="bar" title="${count}" style="height:${(count / maxCount) * 100}%;background-color:${color}"></div>`)
    .join('');
}

function groupTemplate({ deletions, insertions, countSum, date, bars }, maxCount) {
  return `<div class="group" title="${countSum}">
      <div class="bars">
        <div class="deletions" title="${deletions}" style="bottom:${(deletions / maxCount) * 100}%">-</div>
        <div class="insertions" title="${insertions}" style="bottom:${(insertions / maxCount) * 100}%">+</div>
        <div class="bar--sum" title="${countSum}" style="height:${(countSum / maxCount) * 100}%"></div>
        ${barsTemplate(bars, maxCount)}
      </div>
      <div class="header">${date}</div>
    </div>`;
}

module.exports = function groupsTemplate(groups) {
  const maxCount = Math.max(...groups.map((group) => group.countSum));

  return groups.map((group) => groupTemplate(group, maxCount));
};
