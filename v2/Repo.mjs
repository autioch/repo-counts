import binaryExtensions from 'binary-extensions';
import pLimit from 'p-limit';
import { basename, extname } from 'path';

import Commit from './Commit.mjs';
import { db } from './db/index.mjs';
import { command, getBar, getFirstCommitPerMonth, getLastCommitPerYear } from './utils.mjs';

const limit = pLimit(50);
const binarySet = new Set(binaryExtensions.map((ext) => `.${ext}`));
const trim = (item) => item.trim();
const isBinary = (fileName) => !binarySet.has(extname(fileName));

function parseBlameLine(line) {
  if (!line) {
    return false;
  }

  const [, authorWithBracket = '', date, lineDetails = ''] = line.split('\t').map(trim);
  const author = authorWithBracket.slice(1).trim().toLowerCase();
  const bracketIndex = lineDetails.indexOf(')');
  const contents = bracketIndex > 0 ? lineDetails.slice(bracketIndex + 1).trim() : '';

  return [db.dates.getId(date), db.authors.getId(author), contents.length];
}

export default class Repo {
  constructor(dir) {
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

  async getCommitList(fromCommit, toCommit) {
    const result = await this.command(`git log ${fromCommit}..${toCommit} --pretty=format:"%at;%H" --no-merges`);

    return result.split('\n').map((line) => new Commit(...line.split(';')));
  }

  async getCountFromDiff(fromCommitHash, toCommitHash) {
    const countedLines = await this.command(`git diff --shortstat --ignore-all-space ${fromCommitHash}..${toCommitHash}`);
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

    // TODO add bar interrupt if something goes wrong
    if (!fileContents) {
      console.log(`FAIL blame ${filePath}`);

      return [];
    }

    return fileContents.split('\n').map(parseBlameLine).filter(Boolean);
  }

  async getFirstCommitsPerMonth() {
    const commits = await this.getCommitList(await this.getHashForFirstCommit(), await this.getHashForHead());

    return getFirstCommitPerMonth(commits);
  }

  async getLastCommitsPerYear() {
    const commits = await this.getCommitList(await this.getHashForFirstCommit(), await this.getHashForHead());

    return getLastCommitPerYear(commits);
  }
}
