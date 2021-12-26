import Db from './Db.mjs';
import Repo from './Repo.mjs';
import { getBar } from './utils.mjs';

export default class Scanner {
  constructor(repos, dbPath) {
    this.db = new Db(dbPath);
    this.repos = repos.map((repo) => new Repo(repo, this.db));
  }

  async getCurrentDiffCounts() {
    const counts = {};

    for (let i = 0; i < this.repos.length; i++) {
      const repo = this.repos[i];
      const emptyRepoHash = await repo.getHashForEmptyRepo();

      counts[repo.dirBase] = await repo.getCountFromDiff(emptyRepoHash, 'HEAD');
    }

    return counts;
  }

  async getHistoricalDiffCounts(period) {
    const labelProp = period === 'year' ? 'year' : 'yearMonth';
    const counts = {};

    for (let i = 0; i < this.repos.length; i++) {
      const repo = this.repos[i];
      const commitsToVisit = await (period === 'year' ? repo.getLastCommitsPerYear() : repo.getFirstCommitsPerMonth());
      const emptyRepoHash = await repo.getHashForEmptyRepo();
      const tickBar = getBar(repo.dirBase, commitsToVisit.length);

      counts[repo.dirBase] = {};

      for (let j = 0; j < commitsToVisit.length; j++) {
        const commit = commitsToVisit[j];

        counts[repo.dirBase][commit[labelProp]] = await repo.getCountFromDiff(emptyRepoHash, commit.hash);
        tickBar();
      }
    }

    return counts;
  }

  async getCurrentBlameCounts() {
    const counts = {};

    for (let i = 0; i < this.repos.length; i++) {
      const repo = this.repos[i];

      counts[repo.dirBase] = await repo.getCountFromBlame('HEAD', repo.dirBase);
    }

    return counts;
  }

  async getHistoricalBlameCounts(period) {
    const labelProp = period === 'year' ? 'year' : 'yearMonth';
    const counts = {};

    for (let i = 0; i < this.repos.length; i++) {
      const repo = this.repos[i];
      const commitsToVisit = await (period === 'year' ? repo.getLastCommitsPerYear() : repo.getFirstCommitsPerMonth());

      counts[repo.dirBase] = {};

      for (let j = 0; j < commitsToVisit.length; j++) {
        const commit = commitsToVisit[j];

        counts[repo.dirBase][commit[labelProp]] = await repo.getCountFromBlame(commit.hash, `${repo.dirBase} ${commit[labelProp]}`);
      }
    }

    return counts;
  }
}
