import { FORMAT, METHOD } from './consts.mjs';
import Converter from './Converter.mjs';
import Db from './Db.mjs';
import Fs from './Fs.mjs';
import Scanner from './Scanner.mjs';
import { getValidRepos, notSupported } from './utils.mjs';

const HISTORICAL = {
  [METHOD.DIFF]: {
    [FORMAT.JSON]: (scanner, period) => scanner.getHistoricalDiffCounts(period),
    [FORMAT.CSV]: async (scanner, period) => Converter.historicalDiffCountsToCsv(await scanner.getHistoricalDiffCounts(period)),
    [FORMAT.HTML]: async (scanner, period) => Converter.historicalDiffCountsToHtml(await scanner.getHistoricalDiffCounts(period))
  },
  [METHOD.BLAME]: {
    [FORMAT.JSON]: (scanner, period) => scanner.getHistoricalBlameCounts(period),
    [FORMAT.CSV]: async (scanner, period) => Converter.historicalBlameCountsToCsv(await scanner.getHistoricalBlameCounts(period)),
    [FORMAT.HTML]: async (scanner, period) => Converter.historicalBlameCountsToHtml(await scanner.getHistoricalBlameCounts(period))
  }
};

const CURRENT = {
  [METHOD.DIFF]: {
    [FORMAT.JSON]: (scanner, period) => scanner.getHistoricalDiffCounts(period),
    [FORMAT.CSV]: notSupported,
    [FORMAT.HTML]: notSupported
  },
  [METHOD.BLAME]: {
    [FORMAT.JSON]: (scanner, period) => scanner.getHistoricalBlameCounts(period),
    [FORMAT.CSV]: notSupported,
    [FORMAT.HTML]: notSupported
  }
};

export default async function run(config) { // eslint-disable-line max-statements
  console.log(Object.entries(config).filter(([key]) => key !== 'repo').map(([key, value]) => `${key}=${value.toString()}`).join('   '));

  const { period, method, format, histogram, repo, output, dry } = config;
  const validRepos = await getValidRepos(repo);

  console.log(`Run for ${validRepos.length} repos`);
  const fs = new Fs(output, dry);
  const db = new Db(fs);
  const scanner = new Scanner(validRepos, db);
  const getData = (histogram ? HISTORICAL : CURRENT)[method][format];

  await fs.ensureDir();
  await db.restore();
  const data = await getData(scanner, period);

  await fs.writeOutput(format, `${method}_${period}${histogram ? '_history' : ''}`, data);
  await fs.copyStyles();
  await db.persist();
}
