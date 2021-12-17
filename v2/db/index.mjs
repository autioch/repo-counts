import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import DbMap from './DbMap.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function writeFile(fileName, data){
  await fs.writeFile(join(__dirname, fileName + '.json'), JSON.stringify(data, null, '  '), 'utf8');
}

export async function readFile(fileName){
  try {
    const data = await fs.readFile(join(__dirname, fileName + '.json'), 'utf8');

    return JSON.parse(data);
  } catch (err){
    return [];
  }
}

export const db = {
  authors: new DbMap(await readFile('authors')),
  dates: new DbMap(await readFile('dates')),
}

export async function persist() {
  await writeFile('authors', db.authors);
  await writeFile('dates', db.dates);
}
