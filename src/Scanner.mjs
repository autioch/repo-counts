import Db from './Db.mjs';
import Repo from './Repo.mjs';
import { getBar } from './utils.mjs';

const el = (className, content = '', props = '') => `\n<div class="${className}" ${props}>${content}</div>\n`;

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

  csvToHtml(rows) { // eslint-disable-line class-methods-use-this
    const maxValue = rows.slice(1).map((row) => row.slice(1).reduce((sum, val) => sum + val, 0)).reduce((max, value) => value > max ? value : max, 0);
    const repos = rows[0].slice(1);
    const dates = rows.slice(1).map((row) => row[0]);

    const legend = el('legend', repos.map((repo) => el('legend-item', repo)).join('\n'));
    const chart = dates.map((date, dateIndex) => el(
      'date',
      `${el(
        'header',
        date
      )}${el(
        'values',
        repos.map((repo, repoIndex) => el(
          'value',
          el(
            'label',
            rows[dateIndex + 1][repoIndex + 1] > 0 ? `${Math.ceil(rows[dateIndex + 1][repoIndex + 1] / 1000)}K` : ''
          ),
          `style="height:${((rows[dateIndex + 1][repoIndex + 1] / maxValue) * 100).toFixed(5)}%"`
        )).join('')
      )}`)).join('');

    return `<html>\n<head>\n<title>Repo history</title>\n<link href="styles.css" rel="stylesheet"></head><body>${legend}${el('chart', chart)}</body></html>`;
  }
}
