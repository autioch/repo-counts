import Repo from './Repo.mjs';
import { getBar } from './utils.mjs';

export default class Scanner {
  constructor(repoPaths, db) {
    this.db = db;
    this.repos = repoPaths.map((repoPath) => new Repo(repoPath, this.db));
  }

  async iterateRepos(callbackFn) {
    const result = [];

    for (let i = 0; i < this.repos.length; i++) {
      const repo = this.repos[i];

      result.push([repo.dirBase, await callbackFn(repo)]);
    }

    return Object.fromEntries(result);
  }

  async iterateCommits(commitsToVisit, labelProp, callbackFn) { // eslint-disable-line class-methods-use-this
    const result = {};

    for (let j = 0; j < commitsToVisit.length; j++) {
      const commit = commitsToVisit[j];

      result[commit[labelProp]] = await callbackFn(commit);
    }

    return result;
  }

  getCurrentDiffCounts() {
    return this.iterateRepos(async (repo) => repo.getCountFromDiff('HEAD', await repo.getHashForEmptyRepo()));
  }

  getCurrentBlameCounts() {
    return this.iterateRepos((repo) => repo.getCountFromBlame('HEAD', repo.dirBase));
  }

  getHistoricalDiffCounts(period) {
    const labelProp = `${period}Label`;

    return this.iterateRepos(async (repo) => {
      const commitsToVisit = await repo.getCommitsForPeriod(period);
      const emptyRepoHash = await repo.getHashForEmptyRepo();
      const tickBar = getBar(repo.dirBase, commitsToVisit.length);

      return this.iterateCommits(commitsToVisit, labelProp, async (commit) => {
        const data = await repo.getCountFromDiff(commit.hash, emptyRepoHash);

        tickBar();

        return data;
      });
    });
  }

  getHistoricalBlameCounts(period) {
    const labelProp = `${period}Label`;

    return this.iterateRepos(async (repo) => {
      const commitsToVisit = await repo.getCommitsForPeriod(period);

      return this.iterateCommits(commitsToVisit, labelProp, (commit) => repo.getCountFromBlame(commit.hash, `${repo.dirBase} ${commit[labelProp]}`));
    });
  }
}
