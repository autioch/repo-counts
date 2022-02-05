/* eslint-disable max-nested-callbacks */
import { FORMAT, METHOD, PERIOD } from './consts.mjs';
import run from './run.mjs';

const repo = ['E:/projects/trial-css-filter'];
const output = './repo-history';

const configs = [false, true].flatMap((histogram) =>
  [FORMAT.JSON, FORMAT.CSV, FORMAT.HTML].flatMap((format) =>
    [METHOD.DIFF, METHOD.BLAME].flatMap((method) =>
      [PERIOD.YEAR, PERIOD.MONTH].flatMap((period) =>
        ({
          histogram,
          format,
          method,
          period,
          output,
          repo,
          dry: true
        })
      )
    )
  )
);

for (let index = 0; index < configs.length; index++) {
  console.log(`\n################### ${index + 1} / ${configs.length} ###################`);
  try {
    await run(configs[index]);
  } catch (err) {
    if (err.message === 'Not supported.') {
      console.log(err.message);
    } else {
      throw err;
    }
  }
}
