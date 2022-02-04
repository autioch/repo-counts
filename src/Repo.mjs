import binaryExtensions from 'binary-extensions';
import pLimit from 'p-limit';
import { basename, extname } from 'path';

import Commit from './Commit.mjs';
import { PERIOD } from './consts.mjs';
import { command, getBar } from './utils.mjs';

const limit = pLimit(50);
const binarySet = new Set(binaryExtensions.map((ext) => `.${ext}`));
const trim = (item) => item.trim();
const isBinary = (fileName) => !binarySet.has(extname(fileName));

export default class Repo {
  constructor(dir, db) {
    this.db = db;
    this.dir = dir;
    this.dirBase = basename(dir);

    // TODO Add check if directory is actually a repo
  }

  command(commandString) {
    return command(commandString, this.dir);
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

    return result.split('\n').map((line) => new Commit(...line.split(';')));
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
    const getFileInfo = async (filePath) => [filePath, await this.blameFile(filePath, commitHash, tickBar())];

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
      // console.log(`FAIL blame ${filePath}`);

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

  async getFirstCommitsPerMonth() {
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
    return period === PERIOD.YEAR ? this.getLastCommitsPerYear() : this.getFirstCommitsPerMonth();
  }
}
