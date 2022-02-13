/* eslint-disable max-nested-callbacks */
import { FORMAT, PERIOD } from '../src/consts.mjs';
import run from '../src/run.mjs';

const repos = [
  'E:/projects/trial-css-filter',
  '.'
];
const output = './spec/mock';

const configs = [false, true].flatMap((detail) =>
  [false, PERIOD.YEAR, PERIOD.MONTH].flatMap((periodAndChronicle) =>
    [
      // FORMAT.JSON,
      // FORMAT.CSV,
      FORMAT.HTML
    ].flatMap((format) =>
      ({
        repos,
        chronicle: !!periodAndChronicle,
        detail,
        period: periodAndChronicle,
        formats: [format],
        output,
        dry: false,
        cache: true
      })
    )
  )
);

/* Not a test on its own, but helps checking if everything works properly. */
for (let index = 0; index < configs.length; index++) {
  console.log(`\n################### ${index + 1} / ${configs.length} ###################`);

  await run(configs[index]);
}
