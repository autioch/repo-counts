import executeCommand from './executeCommand.mjs';
import binaryExtensions from 'binary-extensions';
import { basename, extname } from 'path';
import { db } from './db/index.mjs';

const binarySet = new Set(binaryExtensions.map(ext => '.' + ext));
const trim = (item) => item.trim();
// const objToCli = (options) => Object.entries(options).map(([key, val]) => `--${key}${val === undefined ? '' : `=${val}`}`).join(' ');

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

  constructor(dir){
    this.dir = dir;
    this.dirBase = basename(dir);

    // TODO Add check if directory is actually a repo

  }

  command(commandString){
    return executeCommand(commandString, this.dir);
  }

  async getFileLineCount(fromCommitHash, toCommitHash) {
    const countedLines = await this.command('git diff --shortstat ' + fromCommitHash + '..' + toCommitHash);
    const [files, insertions]= countedLines.split(',');
    const [fileCount] = files.trim().split(' ');
    const [lineCount] = insertions.trim().split(' ');

    return [fileCount, lineCount];
  }

  getHeadHash() {
    return this.command('git rev-parse HEAD');
  }

  getEmptyRepoHash() {
    return this.command('git hash-object -t tree /dev/null');
  }

  getFirstCommitHash() {
    // assume only one head
    return this.command('git rev-list --max-parents=0 HEAD');
  }

  async getFileList(commitHashOrHead, includeBinary = false){
    const fileList = await this.command('git ls-tree -r ' + commitHashOrHead + ' --name-only --full-tree');
    const allFiles = fileList.split('\n');

    if (includeBinary){
      return allFiles;
    }

    return allFiles.filter(file => !binarySet.has(extname(file)));
  }

  async blameFile(filePath, callbackFn) {
    // todo pretty?
    const fileContents = await this.command(`git blame --date=short -c "${filePath}"`);

    callbackFn?.();

    return fileContents.split('\n').map(parseBlameLine).filter(Boolean);
  }

  getCommitCount(commitHash) {
    return this.command('git rev-list ' + commitHash + ' --count');
  }

  async getCommitList(fromCommit, toCommit) {
    const sep = ';';
    const result = await this.command(`git log ${fromCommit}..${toCommit} --pretty=format:"%at${sep}%H" --no-merges`);

    return result.trim().split('\n').map((line) => {
      const [unixDate, hash] = line.split(sep);
      const date = new Date(unixDate * 1000); // JS milisecons, unix seconds

      return [date.getFullYear(), date.getMonth() + 1,date.getDate(), hash];
    });
  }

}
