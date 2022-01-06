import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { repoList } from './config.mjs';
import Fs from './Fs.mjs';
import Scanner from './Scanner.mjs';

const curDir = dirname(fileURLToPath(import.meta.url));

const scanner = new Scanner(repoList, join(curDir, 'db'));
const fs = new Fs(join(curDir, 'data'));

await scanner.db.restore();

// const testJson = async (fileName, promise) => fs.writeJson(fileName, await promise);
// await testJson('currentDiffCounts', scanner.getCurrentDiffCounts());
// await testJson('historicalDiffCountsMonth', scanner.getHistoricalDiffCounts('month'));
// await testJson('historicalDiffCountsYear', scanner.getHistoricalDiffCounts('year'));

// await testJson('currentBlameCounts', scanner.getCurrentBlameCounts());
// await testJson('historicalBlameCountsMonth', scanner.getHistoricalBlameCounts('month'));
// await testJson('historicalBlameCountsYear', scanner.getHistoricalBlameCounts('year'));

await fs.writeCsv('historicalDiffCountsYear', scanner.historicalDiffCountsToCsv(await scanner.getHistoricalDiffCounts('month')));
await fs.writeCsv('historicalBlameCountsYear', scanner.historicalBlameCountsToCsv(await scanner.getHistoricalBlameCounts('month')));

await scanner.db.persist();

console.log('done');
