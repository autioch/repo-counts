import { promises as fs } from 'fs';
import { repoList } from './config.mjs';
import { persist, writeFile } from './db/index.mjs';
import Repo from './Repo.mjs';
import pLimit from 'p-limit';
import ProgressBar from 'progress';

const repos = [];
const diffs = [];
const limit = pLimit(50);
const setMap = (map, key, val) => {
  if (!map[key]){
    map[key]
  }
}

function getBar(title, total) {
  const bar = new ProgressBar('  ' + title + ' [:bar] :current/:total :rate/s :etas', {
    total
  });

  return () => bar.tick();
}

for (let i = 0; i < repoList.length; i++){
  const repo = new Repo(repoList[i]);
  const commits = await repo.getCommitList(await repo.getFirstCommitHash(), await repo.getHeadHash());

  const uniqueDates = [...new Set(commits.map(([y,m,d]) => `${y}-${m}-${d}`))];

  const commitPerYearPerMonth = commits.reduce((obj, commit) => {
    const [year, month, day, hash] = commit;

    if (!obj[year]) {
      obj[year] = {};
    }

    if ((!obj[year][month]) || (obj[year][month][2] > day)){
      obj[year][month] = commit;
    }

    return obj;
  },{});

  const commitsToVisit = Object.values(commitPerYearPerMonth).flatMap((dict) => Object.values(dict));
console.log(commits);
console.log(commitsToVisit);
  // const files = await repo.getFileList('HEAD');

  // const tickBar = getBar(repo.dirBase, files.length);
  // const getFileInfo = async (filePath) => [filePath, await repo.blameFile(filePath, tickBar)];
  // const result = await Promise.all(files.map((filePath) => limit(getFileInfo, filePath)));
  // const diff = await repo.getFileLineCount(await repo.getEmptyRepoHash(), await repo.getHeadHash());

  // repos.push([repo.dir,  Object.fromEntries(result)]);
  // diffs.push([repo.dir,  Object.fromEntries([diff])]);
}

// await persist();
// await writeFile('repos', repos);
// await writeFile('gitdiff', gitdiff);

console.log('done');
