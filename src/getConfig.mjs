import { Option, program } from 'commander'; // eslint-disable-line no-shadow

export default async function getConfig() {
  program
    .requiredOption('-r, --repo <paths...>', 'path(s) to the repository')
    .addOption(new Option('-p, --period <year|month>', 'either year or month, used when histogram option is used').choices(['year', 'month']))
    .addOption(new Option('-m, --method <diff|blame', 'method for probing the repo').choices(['diff', 'blame']))
    .addOption(new Option('-f, --format <json|html|csv>', 'expected format of the file').choices(['json', 'csv', 'html']))
    .option('-hi, --histogram', 'instead of showing only current state, complete history will be shown')
    .option('-ie, --ignore-extensions <json>', 'list of extensions to be ignored')
    .option('-c, --config <path.mjs>', 'path to a mjs file with basic configuration');

  program.parse();

  const defaults = {
    period: 'year',
    method: 'diff',
    format: 'json',
    histogram: false,
    ignoreExtensions: [],
    repo: []
  };

  const cliOptions = program.opts();
  const fileOptions = cliOptions.config ? await import(cliOptions.config) : {};

  const config = {
    ...defaults,
    ...fileOptions,
    ...cliOptions
  };

  console.log(Object.entries(config).map(([key, value]) => `${key}=${value.toString()}`).join('   '));

  return config;
}
