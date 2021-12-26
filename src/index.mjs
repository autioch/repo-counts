import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { repoList } from './config.mjs';
import Fs from './Fs.mjs';
import Scanner from './Scanner.mjs';
import { historicalDiffCountsToCsv } from './utils.mjs';

const curDir = dirname(fileURLToPath(import.meta.url));

const scanner = new Scanner(repoList, join(curDir, 'db'));
const fs = new Fs(join(curDir, 'data'));

await scanner.db.restore();

// const currentDiffCounts = await scanner.getCurrentDiffCounts();
const historicalDiffCountsYear = await scanner.getHistoricalDiffCounts('year');

// const historicalDiffCountsMonth = await scanner.getHistoricalDiffCounts('month');
// const currentBlameCounts = await scanner.getCurrentBlameCounts();
// const historicalBlameCountsYear = await scanner.getHistoricalBlameCounts('year');
// const historicalBlameCountsMonth = await scanner.getHistoricalBlameCounts('month');

// fs.writeJson('currentDiffCounts', currentDiffCounts);
fs.writeJson('historicalDiffCountsYear', historicalDiffCountsYear);

// fs.writeJson('historicalDiffCountsMonth', historicalDiffCountsMonth);
// fs.writeJson('currentBlameCounts', currentBlameCounts);
// fs.writeJson('historicalBlameCountsYear', historicalBlameCountsYear);
// fs.writeJson('historicalBlameCountsMonth', historicalBlameCountsMonth);
fs.writeCsv('historicalDiffCountsYear', historicalDiffCountsToCsv(historicalDiffCountsYear));

await scanner.db.persist();

console.log('done');
