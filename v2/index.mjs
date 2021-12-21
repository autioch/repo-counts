import { repoList } from './config.mjs';
import { persist } from './db/index.mjs';
import Scanner from './Scanner.mjs';

const scanner = new Scanner(repoList);
const test = (obj, label) => console.log(label, JSON.stringify(obj).length);

const currentDiffCounts = await scanner.getCurrentDiffCounts();

test(currentDiffCounts, 'currentDiffCounts');

const historicalDiffCountsYear = await scanner.getHistoricalDiffCounts('year');

test(historicalDiffCountsYear, 'historicalDiffCountsYear');

const historicalDiffCountsMonth = await scanner.getHistoricalDiffCounts('month');

test(historicalDiffCountsMonth, 'historicalDiffCountsMonth');

const currentBlameCounts = await scanner.getCurrentBlameCounts();

test(currentBlameCounts, 'currentBlameCounts');

const historicalBlameCountsYear = await scanner.getHistoricalBlameCounts('year');

test(historicalBlameCountsYear, 'historicalBlameCountsYear');

const historicalBlameCountsMonth = await scanner.getHistoricalBlameCounts('month');

test(historicalBlameCountsMonth, 'historicalBlameCountsMonth');

await persist();

console.log('done');
