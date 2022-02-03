import Db from './Db.mjs';
import Repo from './Repo.mjs';
import { getBar } from './utils.mjs';

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
}
