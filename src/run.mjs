/**/
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { FORMAT, METHOD } from './consts.mjs';
import Converter from './Converter.mjs';
import Fs from './Fs.mjs';
import Scanner from './Scanner.mjs';
import { noop, notSupported } from './utils.mjs';

const dryFs = {
  writeCsv: noop,
  writeHtml: noop,
  writeJson: noop
};

export default async function run(config) {
  const { period, method, format, histogram, repo, database, dry } = config;

  console.log(Object.entries(config).filter(([key]) => key !== 'repo').map(([key, value]) => `${key}=${value.toString()}`).join('   '));

  const curDir = dirname(fileURLToPath(import.meta.url));

  // console.log(curDir, database);
  const scanner = new Scanner(repo, join(curDir, database));
  const fs = dry ? dryFs : new Fs(join(curDir, database));

  const fileName = `${method}_${period}${histogram ? '_history' : ''}`;

  const HISTORICAL = {
    [METHOD.DIFF]: {
      [FORMAT.JSON]: async () => fs.writeJson(fileName, await scanner.getHistoricalDiffCounts(period)),
      [FORMAT.CSV]: async () => fs.writeCsv(fileName, Converter.historicalDiffCountsToCsv(await scanner.getHistoricalDiffCounts(period))),
      [FORMAT.HTML]: async () => fs.writeHtml(fileName, Converter.historicalDiffCountsToHtml(await scanner.getHistoricalDiffCounts(period)))
    },
    [METHOD.BLAME]: {
      [FORMAT.JSON]: async () => fs.writeJson(fileName, await scanner.getHistoricalBlameCounts(period)),
      [FORMAT.CSV]: async () => fs.writeCsv(fileName, Converter.historicalBlameCountsToCsv(await scanner.getHistoricalBlameCounts(period))),
      [FORMAT.HTML]: async () => fs.writeHtml(fileName, Converter.historicalBlameCountsToHtml(await scanner.getHistoricalBlameCounts(period)))
    }
  };

  const CURRENT = {
    [METHOD.DIFF]: {
      [FORMAT.JSON]: async () => fs.writeJson(fileName, await scanner.getHistoricalDiffCounts(period)),
      [FORMAT.CSV]: notSupported,
      [FORMAT.HTML]: notSupported
    },
    [METHOD.BLAME]: {
      [FORMAT.JSON]: async () => fs.writeJson(fileName, await scanner.getHistoricalBlameCounts(period)),
      [FORMAT.CSV]: notSupported,
      [FORMAT.HTML]: notSupported
    }
  };

  !dry && await scanner.db.restore();
  await (histogram ? HISTORICAL : CURRENT)[method][format]();
  !dry && await scanner.db.persist();
}
