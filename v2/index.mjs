import { promises as fs } from 'fs';
import { repoList } from './config.mjs';
import { persist, writeFile } from './db/index.mjs';
import { scanRepo } from './scanRepo/index.mjs';

const repos = [];

for (let i = 0; i < repoList.length; i++){
  repos.push(await scanRepo(repoList[i]));
}

await persist();
await writeFile('repos', repos);

console.log('done');
