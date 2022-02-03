import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { repoList } from './config.mjs';
import Converter from './Converter.mjs';
import Fs from './Fs.mjs';
import getConfig from './getConfig';
import Scanner from './Scanner.mjs';

const { period, method, format, histogram, repo } = await getConfig();

const curDir = dirname(fileURLToPath(import.meta.url));

const scanner = new Scanner(repoList, join(curDir, 'db'));
const fs = new Fs(join(curDir, 'data'));

await scanner.db.restore();

const testJson = async (fileName, promise) => fs.writeJson(fileName, await promise);

if (method === 'diff') {
  if (histogram) {
    await fs.writeCsv('historicalDiffCounts', Converter.historicalDiffCountsToCsv(await scanner.getHistoricalDiffCounts(period)));
    await fs.writeHtml('historicalDiffCounts', Converter.historicalDiffCountsToHtml(await scanner.getHistoricalDiffCounts(period)));
  } else {
    await testJson('currentDiffCounts', scanner.getCurrentDiffCounts());
    await testJson('historicalDiffCounts', scanner.getHistoricalDiffCounts(period));
  }
}
if (method === 'blame') {
  if (histogram) {
    await fs.writeCsv('historicalBlameCounts', Converter.historicalBlameCountsToCsv(await scanner.getHistoricalBlameCounts(period)));
    await fs.writeHtml('historicalBlameCounts', Converter.historicalBlameCountsToHtml(await scanner.getHistoricalBlameCounts(period)));
  } else {
    await testJson('currentBlameCounts', scanner.getCurrentBlameCounts());
    await testJson('historicalBlameCounts', scanner.getHistoricalBlameCounts(period));
  }
}

await scanner.db.persist();

console.log('done');
