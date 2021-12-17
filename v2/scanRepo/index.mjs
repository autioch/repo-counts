import executeCommand from '../executeCommand.mjs';
import pLimit from 'p-limit';
import { db } from '../db/index.mjs';
import ProgressBar from 'progress';
import { basename, extname } from 'path';
import binaryExtensions from 'binary-extensions';

const limit = pLimit(10);

function parseLine(line) {
  if (!line) {
    return false;
  }

  const [, authorWithBracket = '', date, lineDetails = ''] = line.split('\t').map((item) => item.trim());
  const author = authorWithBracket.slice(1).trim().toLowerCase();
  const bracketIndex = lineDetails.indexOf(')');
  const contents = bracketIndex > 0 ? lineDetails.slice(bracketIndex + 1).trim() : '';

  return [db.dates.getId(date), db.authors.getId(author), contents.length];
};

const binarySet = new Set(binaryExtensions.map(ext => '.' + ext));

async function getFileInfo(filePath, repoPath, bar) {
  const fileContents = await executeCommand(`git blame --date=short -c "${filePath}"`, repoPath);
  const lines = fileContents.trim().split('\n').map(parseLine).filter(Boolean);

  bar.tick();

  return [filePath, lines];
}

export async function scanRepo(repoPath) {
  const fileList = await executeCommand('git ls-tree -r HEAD --name-only --full-tree', repoPath);
  const allFiles =  fileList.trim().split('\n');
  const files = allFiles.filter(file => !binarySet.has(extname(file)))

  const bar = new ProgressBar('  ' + basename(repoPath) + ' [:bar] :current/:total :rate/s :etas', {
    total: files.length
  });

  const result = await Promise.all(files.map((fileName, index) => limit(getFileInfo, fileName, repoPath, bar)));

  const totalLines = result.reduce((count, file) => count + file[1].length, 0);

  console.log('Found ' + totalLines + ' lines in ' + basename(repoPath));

  return [repoPath,  Object.fromEntries(result)];
}
