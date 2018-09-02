/* eslint-disable max-len */

const colors = ['#faa', '#afa', '#aaf'];

function nextColor(index) {
  const next = index % colors.length;

  return colors[next];
}

function barsTemplate(repoMonths, months) {
  return months
    .map((month, index) => {
      const repoMonth = repoMonths[month];

      if (!repoMonth) {
        return false;
      }

      return `<div class="bar" style="width:${repoMonth.percentage}%;background-color:${nextColor(index)}" title="${month} - ${repoMonth.count}K - ${repoMonth.percentage}%">
      <div>${month}</div>
      <div>${repoMonth.count}K</div>
      <div>${repoMonth.percentage}%</div>
    </div>`;
    })
    .filter((bar) => !!bar)
    .join('\n');
}

function listTemplate(repoMonths, months) {
  return months
    .map((month) => {
      const repoMonth = repoMonths[month];

      return repoMonth ? `<li>${month} - ${repoMonth.count}K - ${repoMonth.percentage}%</li>` : false;
    })
    .filter((bar) => !!bar)
    .join('\n');
}

function groupTemplate(repo, parsedRepos) {
  const { allMonths, allQuarters, allYears, maxCount } = parsedRepos;
  const { months, quarters, years, repoName, totalLines } = repo;

  return `<div class="repo">
    <h3 class="repo__name">${repoName}</h3>
    <h4 class="repo__count">${totalLines} lines</h4>
    <ul class="list">${repo.folders.map((folder) => `<li>${folder}</li>`).join('')}</ul>
    <ul class="list">
      ${listTemplate(months, allMonths)}
    </ul>
    <div class="bars" style="width:${(totalLines / maxCount) * 100}%">
      ${barsTemplate(months, allMonths)}
    </div>
    <ul class="list">
      ${listTemplate(quarters, allQuarters)}
    </ul>
    <div class="bars" style="width:${(totalLines / maxCount) * 100}%">
      ${barsTemplate(quarters, allQuarters)}
    </div>
    <ul class="list">
      ${listTemplate(years, allYears)}
    </ul>
    <div class="bars" style="width:${(totalLines / maxCount) * 100}%">
      ${barsTemplate(years, allYears)}
    </div>
  </div>`;
}

module.exports = function groupsTemplate(parsedRepos) {
  return parsedRepos.repos.map((repo) => groupTemplate(repo, parsedRepos));
};