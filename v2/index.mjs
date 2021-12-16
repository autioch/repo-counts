import getFileList from './getFileList.mjs';
import getFileInfo from './getFileInfo.mjs';
import getRepoRoot from './getRepoRoot.mjs';
import pLimit from 'p-limit';
import { promises as fs } from 'fs';

const limit = pLimit(10);

const fileList = await getFileList();
const repoRoot = await getRepoRoot();
const input = fileList.map(fileName => limit(getFileInfo, fileName));
const result = await Promise.all(input);

await fs.writeFile('./output.json', JSON.stringify(result), 'utf8');

console.log('done');
