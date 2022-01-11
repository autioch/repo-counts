import Db from './Db.mjs';
import Repo from './Repo.mjs';
import { getBar, h } from './utils.mjs';

export default class Scanner {
  constructor(repos, dbPath) {
    this.db = new Db(dbPath);
    this.repos = repos.map((repo) => new Repo(repo, this.db));
  }

  async iterateRepos(callbackFn) {
    const result = [];

    for (let i = 0; i < this.repos.length; i++) {
      const repo = this.repos[i];

      result.push([repo.dirBase, await callbackFn(repo)]);
    }

    return Object.fromEntries(result);
  }

  getCurrentDiffCounts() {
    console.log(`Current diff counts`);

    return this.iterateRepos(async (repo) => repo.getCountFromDiff(await repo.getHashForEmptyRepo(), 'HEAD'));
  }

  getHistoricalDiffCounts(period) {
    const labelProp = period === 'year' ? 'year' : 'yearMonth';

    console.log(`Historical diff counts per ${labelProp}`);

    return this.iterateRepos(async (repo) => {
      const commitsToVisit = await (period === 'year' ? repo.getLastCommitsPerYear() : repo.getFirstCommitsPerMonth());
      const emptyRepoHash = await repo.getHashForEmptyRepo();
      const tickBar = getBar(repo.dirBase, commitsToVisit.length);
      const result = {};

      for (let j = 0; j < commitsToVisit.length; j++) {
        const commit = commitsToVisit[j];

        result[commit[labelProp]] = await repo.getCountFromDiff(emptyRepoHash, commit.hash);
        tickBar();
      }

      return result;
    });
  }

  historicalDiffCountsToCsv(counts) { // eslint-disable-line class-methods-use-this
    const dates = [...new Set(Object.values(counts).flatMap((datas) => Object.keys(datas)))].sort();
    const repoNames = Object.keys(counts);
    const getCountForDate = (repoName, dateIndex) => counts[repoName][dates[dateIndex]];

    const rows = dates.map((date, index) => [date, ...repoNames.map((repoName) => {
      let count = 0;

      let dateIndex = index + 1;

      while (!count && dateIndex > -1) {
        count = getCountForDate(repoName, dateIndex--);
      }

      return count || -1;
    })]);

    return [ ['Year-month', ...repoNames], ...rows];
  }

  historicalDiffCountsToHtml(counts) { // eslint-disable-line class-methods-use-this
    const rows = this.historicalDiffCountsToCsv(counts);
    const maxValue = rows.slice(1).map((row) => row.slice(1).reduce((sum, val) => sum + val, 0)).reduce((max, value) => value > max ? value : max, 0);
    const repos = rows[0].slice(1);
    const dates = rows.slice(1).map((row) => row[0]);
    const styles = repos.map((_, index) => `#r${index}:checked ~ .chart .r${index} {width:100%} #r${index}:checked ~ .legend .r${index} {opacity:1}`).join(' ');

    return h('html', [
      h('head', [
        h('title', 'Repo history'),
        h('style', styles, [ ['type', 'text/css'] ]),
        h('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
      ]),
      h('body', [
        ...repos.map((_, index) => h('input.r', '', [ ['type', 'checkbox'], ['id', `r${index}`], ['checked'] ])),
        h('.legend', repos.map((repo, index) => h(`label.item r${index}`, repo, [ ['for', `r${index}`] ]))),
        h('.chart', dates.map((date, dateIndex) => h('.date', [
          h('.header', date),
          h('.values', repos.map((_, index) => h(
            `.value r${index}`,
            h('.label', rows[dateIndex + 1][index + 1] > 0 ? `${Math.ceil(rows[dateIndex + 1][index + 1] / 1000)}K` : ''),
            [ ['style', `height:${((rows[dateIndex + 1][index + 1] / maxValue) * 100).toFixed(5)}%`] ]
          )))
        ])))
      ])
    ]);
  }

  getCurrentBlameCounts() {
    console.log(`Current blame counts`);

    return this.iterateRepos((repo) => repo.getCountFromBlame('HEAD', repo.dirBase));
  }

  getHistoricalBlameCounts(period) {
    const labelProp = period === 'year' ? 'year' : 'yearMonth';

    console.log(`Historical blame counts per ${labelProp}`);

    return this.iterateRepos(async (repo) => {
      const commitsToVisit = await (period === 'year' ? repo.getLastCommitsPerYear() : repo.getFirstCommitsPerMonth());

      const result = {};

      for (let j = 0; j < commitsToVisit.length; j++) {
        const commit = commitsToVisit[j];

        result[commit[labelProp]] = await repo.getCountFromBlame(commit.hash, `${repo.dirBase} ${commit[labelProp]}`);
      }

      return result;
    });
  }

  historicalBlameCountsToCsv(counts) { // eslint-disable-line class-methods-use-this
    const dates = [...new Set(Object.values(counts).flatMap((datas) => Object.keys(datas)))].sort();
    const repoNames = Object.keys(counts);
    const getCountForDate = (repoName, dateIndex) => counts[repoName][dates[dateIndex]];

    const rows = dates.map((date, index) => [date, ...repoNames.map((repoName) => {
      let count = 0;

      let dateIndex = index + 1;

      while (!count && dateIndex > -1) {
        count = getCountForDate(repoName, dateIndex--);
      }

      return count ? count.reduce((sum, [, lines]) => sum + lines.length, 0) : -1;
    })]);

    return [ ['Year-month', ...repoNames], ...rows];
  }

  historicalBlameCountsToHtml(counts) { // eslint-disable-line class-methods-use-this
    // TODO This should group by file type first, then count
    // so that bars are sum of all file type heights and can be disabled
    const rows = this.historicalBlameCountsToCsv(counts);
    const maxValue = rows.slice(1).map((row) => row.slice(1).reduce((sum, val) => sum + val, 0)).reduce((max, value) => value > max ? value : max, 0);
    const repos = rows[0].slice(1);
    const dates = rows.slice(1).map((row) => row[0]);
    const styles = repos.map((_, index) => `#r${index}:checked ~ .chart .r${index} {width:100%} #r${index}:checked ~ .legend .r${index} {opacity:1}`).join(' ');

    return h('html', [
      h('head', [
        h('title', 'Repo history'),
        h('style', styles, [ ['type', 'text/css'] ]),
        h('link', '', [ ['href', 'styles.css'], ['rel', 'stylesheet'] ])
      ]),
      h('body', [
        ...repos.map((_, index) => h('input.r', '', [ ['type', 'checkbox'], ['id', `r${index}`], ['checked'] ])),
        h('.legend', repos.map((repo, index) => h(`label.item r${index}`, repo, [ ['for', `r${index}`] ]))),
        h('.chart', dates.map((date, dateIndex) => h('.date', [
          h('.header', date),
          h('.values', repos.map((_, index) => h(
            `.value r${index}`,
            h('.label', rows[dateIndex + 1][index + 1] > 0 ? `${Math.ceil(rows[dateIndex + 1][index + 1] / 1000)}K` : ''),
            [ ['style', `height:${((rows[dateIndex + 1][index + 1] / maxValue) * 100).toFixed(5)}%`] ]
          )))
        ])))
      ])
    ]);
  }
}
