import binaryExtensions from 'binary-extensions';
import child_process, { execSync } from 'child_process';
import pLimit from 'p-limit';
import { basename, extname, resolve } from 'path';
import ProgressBar from 'progress';
import { promisify } from 'util';

import { LABEL_MONTH, LABEL_YEAR, PERIOD, PERIOD_LABELS } from './consts.mjs';

function getBar(title, total) {
  const bar = new ProgressBar(`  ${title} [:bar] :current/:total :rate/s :etas`, {
    width: 40,
    total
  });

  return () => bar.tick();
}

const limit = pLimit(50);
const binarySet = new Set(binaryExtensions.map((ext) => `.${ext}`));
const trim = (item) => item.trim();
const isBinary = (fileName) => !binarySet.has(extname(fileName));
const dig2 = (num) => num.toString().padStart(2, '0');

const exec = promisify(child_process.exec);
const execOptions = {
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024
};

function getExt(fileName) {
  const ext = extname(fileName);

  return ext.length && basename(fileName, ext).length ? ext : 'other';
}

export default class Repo {
  constructor(dir, db) {
    this.db = db;
    this.dir = dir;

    // TODO Maybe use https://github.com/luftywiranda13/git-root-dir/blob/master/index.js
    this.dirBase = basename(resolve(dir));
  }

  static isDirGitRepository(dir) {
    try {
      execSync('git rev-parse --git-dir', {
        cwd: dir
      });

      return true;
    } catch (err) { // eslint-disable-line no-unused-vars
      console.log(`Non-git dir provided, skipping - ${dir}`);

      return false;
    }
  }

  async command(commandString) {
    try {
      const { stdout } = await exec(commandString, {
        ...execOptions,
        cwd: this.dir
      });

      return stdout.trim();
    } catch (err) {
      // TODO - make this log to a file
      false && console.error(/* `Command error: `, commandString, '\n', */err.message);

      return '';
    }
  }

  getHashForHead() {
    return this.command('git rev-parse HEAD');
  }

  getHashForEmptyRepo() {
    return this.command('git hash-object -t tree /dev/null');
  }

  getHashForFirstCommit() {
    return this.command('git rev-list --max-parents=0 HEAD');
  }

  getCommitCount(commitHash) {
    return this.command(`git rev-list ${commitHash} --count`);
  }

  async cleanRepo() {
    await this.command('git reset --hard');
    await this.command('git clean -fd');
  }

  async getCommitList(fromCommit, toCommit) {
    const result = await this.command(`git log ${fromCommit}..${toCommit} --pretty=format:"%at;%H" --no-merges`);

    return result.split('\n').map((line) => {
      const [unixDate, hash] = line.split(';');
      const date = new Date(unixDate * 1000); // JS milisecons, unix seconds
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return {
        year,
        month,
        day,
        hash,
        [LABEL_YEAR]: year.toString(),
        [LABEL_MONTH]: [year, month].map(dig2).join('-')
      };
    });
  }

  async getCountFromDiff(commitHash, compareCommitHash) {
    const countedLines = await this.command(`git diff --shortstat --ignore-all-space ${compareCommitHash}..${commitHash}`);
    const [, insertions] = countedLines.split(',');
    const [lineCount] = insertions.trim().split(' ');

    return parseInt(lineCount, 10);
  }

  async getCountFromBlame(commitHash, label) {
    const files = await this.getFileList(commitHash);
    const tickBar = getBar(label, files.length);
    const getFileInfo = async (filePath) => [filePath, getExt(filePath), await this.blameFile(filePath, commitHash, tickBar())];

    return Promise.all(files.map((filePath) => limit(getFileInfo, filePath)));
  }

  async getFileList(commitHash, includeBinary = false) {
    const fileList = await this.command(`git ls-tree -r ${commitHash} --name-only --full-tree`);
    const allFiles = fileList.split('\n');

    return includeBinary ? allFiles : allFiles.filter(isBinary);
  }

  async blameFile(filePath, commitHash) {
    const fileContents = await this.command(`git blame --date=short -c "${filePath}" ${commitHash}`);
    const { dates, authors } = this.db;

    // TODO add bar interrupt if something goes wrong
    if (!fileContents) {
      return [];
    }

    return fileContents.split('\n').filter(Boolean).map((line) => {
      const [, authorWithBracket = '', date, lineDetails = ''] = line.split('\t').map(trim);
      const author = authorWithBracket.slice(1).trim().toLowerCase();
      const bracketIndex = lineDetails.indexOf(')');
      const contents = bracketIndex > 0 ? lineDetails.slice(bracketIndex + 1).trim() : '';

      return [dates.getId(date), authors.getId(author), contents.length];
    });
  }

  async getLastCommitsPerMonth() {
    const commits = await this.getCommitList(await this.getHashForFirstCommit(), await this.getHashForHead());

    const yearMonthDict = commits.reduce((obj, commit) => {
      const { year, month, day } = commit;

      if (!obj[year]) {
        obj[year] = {};
      }

      if (!obj[year][month] || (obj[year][month].day > day)) {
        obj[year][month] = commit;
      }

      return obj;
    }, {});

    return Object.values(yearMonthDict).flatMap((dict) => Object.values(dict));
  }

  async getLastCommitsPerYear() {
    const commits = await this.getCommitList(await this.getHashForFirstCommit(), await this.getHashForHead());

    const yearDict = commits.reduce((obj, commit) => {
      const { year, month, day } = commit;

      if (!obj[year] || (obj[year].month < month) || (obj[year].month === month && (obj[year].day < day))) {
        obj[year] = commit;
      }

      return obj;
    }, {});

    return Object.values(yearDict);
  }

  getCommitsForPeriod(period) {
    return period === PERIOD.YEAR ? this.getLastCommitsPerYear() : this.getLastCommitsPerMonth();
  }

  /* API for the app */

  async getCurrentSimple() {
    return this.getCountFromDiff('HEAD', await this.getHashForEmptyRepo());
  }

  getCurrentDetail() {
    return this.getCountFromBlame('HEAD', this.dirBase);
  }

  async getChronicleSimple(period) {
    const commitsToVisit = await this.getCommitsForPeriod(period);
    const emptyRepoHash = await this.getHashForEmptyRepo();
    const tickBar = getBar(this.dirBase, commitsToVisit.length);
    const labelProp = PERIOD_LABELS[period];
    const result = {};

    for (let j = 0; j < commitsToVisit.length; j++) {
      const commit = commitsToVisit[j];

      result[commit[labelProp]] = await this.getCountFromDiff(commit.hash, emptyRepoHash);
      tickBar();
    }

    return result;
  }

  async getChronicleDetail(period) {
    const commitsToVisit = await this.getCommitsForPeriod(period);
    const labelProp = PERIOD_LABELS[period];
    const result = {};

    for (let j = 0; j < commitsToVisit.length; j++) {
      const commit = commitsToVisit[j];

      result[commit[labelProp]] = await this.getCountFromBlame(commit.hash, `${this.dirBase} ${commit[labelProp]}`);
    }

    return result;
  }
}
