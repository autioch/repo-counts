import { Option, program } from 'commander'; // eslint-disable-line no-shadow

import { FORMAT, METHOD, PERIOD } from './consts.mjs';

export default async function getConfig() {
  program
    .requiredOption('-r, --repo <paths...>', 'path(s) to the repository')
    .addOption(new Option('-p, --period <year|month>', 'either year or month, used when histogram option is used').choices(Object.values(PERIOD)))
    .addOption(new Option('-m, --method <diff|blame', 'method for probing the repo').choices(Object.values(METHOD)))
    .addOption(new Option('-f, --format <json|html|csv>', 'expected format of the file').choices(Object.values(FORMAT)))
    .option('-hi, --histogram', 'instead of showing only current state, complete history will be shown')
    .option('-ie, --ignore-extensions <json>', 'list of extensions to be ignored')
    .option('-c, --config <path.mjs>', 'path to a mjs file with basic configuration')
    .option('-d, --database <dir>', 'path to a directory holding cache and data')
    .option('--dry', 'run without saving');

  program.parse();

  const defaults = {
    period: PERIOD.YEAR,
    method: METHOD.DIFF,
    format: FORMAT.JSON,
    histogram: false,
    database: './database',
    ignoreExtensions: [],
    repo: [],
    dry: false
  };

  const cliOptions = program.opts();
  const fileOptions = cliOptions.config ? await import(cliOptions.config) : {};

  return {
    ...defaults,
    ...fileOptions,
    ...cliOptions
  };
}
