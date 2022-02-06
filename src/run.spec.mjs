/* eslint-disable max-nested-callbacks */
import { FORMAT, PERIOD } from './consts.mjs';
import run from './run.mjs';

const repos = ['E:/projects/trial-css-filter'];
const output = './repo-history';

const configs = [false, true].flatMap((detail) =>
  [false, true].flatMap((chronicle) =>
    [PERIOD.YEAR, PERIOD.MONTH].flatMap((period) =>
      [FORMAT.JSON, FORMAT.CSV, FORMAT.HTML].flatMap((format) =>
        ({
          repos,
          detail,
          chronicle,
          period,
          formats: [format],
          output,
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
    console.error(err.message);

    // if (err.message === 'Not supported.') {
    // } else {
    // throw err;
    // }
  }
}
