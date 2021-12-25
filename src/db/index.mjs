import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import DbMap from './DbMap.mjs';

const curDir = dirname(fileURLToPath(import.meta.url));

export async function writeJson(fileName, data) {
  await fs.writeFile(join(curDir, `${fileName}.json`), JSON.stringify(
    data

  //  , null, '  '
  ), 'utf8');
}

export async function writeCsv(fileName, rows) {
  await fs.writeFile(join(curDir, `${fileName}.csv`), rows.map((row) => row.join(';')).join('\n'), 'utf8');
}

export async function readFile(fileName) {
  try {
    const data = await fs.readFile(join(curDir, `${fileName}.json`), 'utf8');

    return JSON.parse(data);
  } catch (err) { // eslint-disable-line no-unused-vars
    return [];
  }
}

export const db = {
  authors: new DbMap(await readFile('authors')),
  dates: new DbMap(await readFile('dates'))
};

export async function persist() {
  await writeJson('authors', db.authors);
  await writeJson('dates', db.dates);
}
