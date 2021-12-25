import { repoList } from './config.mjs';
import { persist, writeCsv, writeJson } from './db/index.mjs';
import Scanner from './Scanner.mjs';
import { historicalDiffCountsToCsv } from './utils.mjs';

const scanner = new Scanner(repoList);

const currentDiffCounts = await scanner.getCurrentDiffCounts();
const historicalDiffCountsYear = await scanner.getHistoricalDiffCounts('year');
const historicalDiffCountsMonth = await scanner.getHistoricalDiffCounts('month');
const currentBlameCounts = await scanner.getCurrentBlameCounts();
const historicalBlameCountsYear = await scanner.getHistoricalBlameCounts('year');
const historicalBlameCountsMonth = await scanner.getHistoricalBlameCounts('month');

writeJson('currentDiffCounts', currentDiffCounts);
writeJson('historicalDiffCountsYear', historicalDiffCountsYear);
writeJson('historicalDiffCountsMonth', historicalDiffCountsMonth);
writeJson('currentBlameCounts', currentBlameCounts);
writeJson('historicalBlameCountsYear', historicalBlameCountsYear);
writeJson('historicalBlameCountsMonth', historicalBlameCountsMonth);
writeCsv('historicalDiffCountsYear', historicalDiffCountsToCsv(historicalDiffCountsYear));

await persist();

console.log('done');
