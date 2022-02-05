import { existsSync } from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import { dirname, isAbsolute, join } from 'path';
import { fileURLToPath } from 'url';

// import { fileURLToPath } from 'url';
import { FORMAT, METHOD } from './consts.mjs';
import Converter from './Converter.mjs';
import Fs from './Fs.mjs';
import Scanner from './Scanner.mjs';
import { notSupported } from './utils.mjs';

export default async function run(config) {
  console.log(Object.entries(config).filter(([key]) => key !== 'repo').map(([key, value]) => `${key}=${value.toString()}`).join('   '));

  const { period, method, format, histogram, repo, output, dry } = config;
  const outputDir = isAbsolute(output) ? output : join(process.cwd(), output);
  const curDir = dirname(fileURLToPath(import.meta.url));

  if (!existsSync(outputDir)) {
    console.warn(`Path ${outputDir} didnt't exist - will be created.`);
    !dry && await mkdir(outputDir, {
      recursive: true
    });
  }

  const scanner = new Scanner(repo, outputDir);
  const fs = new Fs(outputDir);
  const fileName = `${method}_${period}${histogram ? '_history' : ''}`;

  const HISTORICAL = {
    [METHOD.DIFF]: {
      [FORMAT.JSON]: () => scanner.getHistoricalDiffCounts(period),
      [FORMAT.CSV]: async () => Converter.historicalDiffCountsToCsv(await scanner.getHistoricalDiffCounts(period)),
      [FORMAT.HTML]: async () => Converter.historicalDiffCountsToHtml(await scanner.getHistoricalDiffCounts(period))
    },
    [METHOD.BLAME]: {
      [FORMAT.JSON]: () => scanner.getHistoricalBlameCounts(period),
      [FORMAT.CSV]: async () => Converter.historicalBlameCountsToCsv(await scanner.getHistoricalBlameCounts(period)),
      [FORMAT.HTML]: async () => Converter.historicalBlameCountsToHtml(await scanner.getHistoricalBlameCounts(period))
    }
  };

  const CURRENT = {
    [METHOD.DIFF]: {
      [FORMAT.JSON]: () => scanner.getHistoricalDiffCounts(period),
      [FORMAT.CSV]: notSupported,
      [FORMAT.HTML]: notSupported
    },
    [METHOD.BLAME]: {
      [FORMAT.JSON]: () => scanner.getHistoricalBlameCounts(period),
      [FORMAT.CSV]: notSupported,
      [FORMAT.HTML]: notSupported
    }
  };

  !dry && await scanner.db.restore();
  const data = await (histogram ? HISTORICAL : CURRENT)[method][format]();

  !dry && await fs.writeFile(format, fileName, data);
  !dry && await copyFile(join(curDir, 'styles.css'), join(outputDir, 'styles.css'));
  !dry && await scanner.db.persist();
}
