import { Option, program } from 'commander'; // eslint-disable-line no-shadow

import { FORMAT, PERIOD } from './consts.mjs';
import run from './run.mjs';

program
  .addOption(new Option('-r, --repos <dirs...>', 'path(s) to the repositories').default(['.']))
  .addOption(new Option('-d, --detail', 'provide detailed information for file types, takes a lot more time').default(false))
  .addOption(new Option('-c, --chronicle', 'instead of showing only current state, complete history will be shown').default(false))
  .addOption(new Option('-p, --period <year|month>', 'specifies time periods for chronicle option').default(PERIOD.YEAR).choices(Object.values(PERIOD)))
  .addOption(new Option('-f, --formats <ext...>', 'expected format of the file').default([FORMAT.JSON]).choices(Object.values(FORMAT)))
  .addOption(new Option('-o, --output <dir>', 'path to a directory holding cache and data, absolute or relative to execution dir').default('.repo-counts'))
  .addOption(new Option('--dry', 'run without saving').default(false))
  .version('1.0.0'); // todo add it from package.json

program.parse();

const config = program.opts();

await run(config);

console.log('done');
