import getConfig from './getConfig.mjs';
import run from './run.mjs';

await run(await getConfig());

console.log('done');
