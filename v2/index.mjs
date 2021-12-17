import { promises as fs } from 'fs';
import { repoList } from './config.mjs';
import { persist, writeFile } from './db/index.mjs';
import { scanRepo } from './scanRepo/index.mjs';
import { repoHistogram } from './repoHistogram/index.mjs';

const repos = [];
const gitdiff = [];

for (let i = 0; i < repoList.length; i++){
  const scan = await scanRepo(repoList[i]);
  const diff = await repoHistogram(repoList[i]);

console.log('diff', ...diff);
  // const base = Object.fromEntries(diff);
  //
  // Object.entries(scan[1]).forEach(([fileName, lines]) => {
  //
  //   const inbase = base[fileName];
  //
  //   if (!inbase){
  //     console.log('not in diff', fileName, inbase, lines.length);
  //   }
  //   if (inbase !== lines.length){
  //     console.log('different line count', fileName, inbase, lines.length);
  //   }
  // })
  // gitdiff.push(base);
}

// await persist();
// await writeFile('repos', repos);
// await writeFile('gitdiff', gitdiff);

console.log('done');
