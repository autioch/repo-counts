import executeCommand from './executeCommand.mjs';
import pLimit from 'p-limit';
import { db } from '../db/index.mjs';
import ProgressBar from 'progress';
import { basename } from 'path';

const limit = pLimit(10);

function parseLine(line) {
  if (!line) {
    return [];
  }

  const [, authorWithBracket = '', date, lineDetails = ''] = line.split('\t').map((item) => item.trim());
  const author = authorWithBracket.slice(1).trim().toLowerCase();
  const bracketIndex = lineDetails.indexOf(')');
  const contents = bracketIndex > 0 ? lineDetails.slice(bracketIndex + 1).trim() : '';

  return [db.dates.getId(date), db.authors.getId(author), contents.length];
};


async function getFileInfo(filePath, repoPath, bar) {
  const fileContents = await executeCommand(`git blame --date=short -c "${filePath}"`, repoPath);
  const lines = fileContents.trim().split('\n').map(parseLine).filter(Boolean);

  bar.tick();

  return [filePath, lines];
}

export async function scanRepo(repoPath) {
  const fileList = await executeCommand('git ls-tree -r HEAD --name-only --full-tree', repoPath);
  const files =  fileList.trim().split('\n');

  const bar = new ProgressBar('  ' + basename(repoPath) + ' [:bar] :current/:total :rate/s :etas', {
    total: files.length
  });

  const result = await Promise.all(files.map((fileName, index) => limit(getFileInfo, fileName, repoPath, bar)));

  return [repoPath,  Object.fromEntries(result)];
}
