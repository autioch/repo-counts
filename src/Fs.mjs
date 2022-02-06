import { existsSync, promises as fs } from 'fs';
import { dirname, isAbsolute, join } from 'path';
import { fileURLToPath } from 'url';

import { FORMAT } from './consts.mjs';

const joinRow = (row) => row.join(';');

export default class Fs {
  constructor(dir, dry = false) {
    this.dir = isAbsolute(dir) ? dir : join(process.cwd(), dir);
    this.dry = dry;
  }

  async ensureDir() {
    if (existsSync(this.dir)) {
      return;
    }
    console.warn(`Path ${this.dir} didnt't exist - will be created.`);
    await fs.mkdir(this.dir, {
      recursive: true
    });
  }

  async writeFile(fileName, data) {
    !this.dry && await fs.writeFile(join(this.dir, fileName), data, 'utf8');
  }

  async readJson(fileName) {
    try { // try catch is for Db class
      const data = await fs.readFile(join(this.dir, `${fileName}.json`), 'utf8');

      return JSON.parse(data);
    } catch (err) { // eslint-disable-line no-unused-vars
      return [];
    }
  }

  async writeJson(fileName, data) {
    await this.writeFile(`${fileName}.json`, JSON.stringify(data));
  }

  async writeCsv(fileName, rows) {
    await this.writeFile(`${fileName}.csv`, rows.map(joinRow).join('\n'));
  }

  async writeHtml(fileName, html) {
    await this.writeFile(`${fileName}.html`, html);
  }

  async writeOutput(format, fileName, data) {
    switch (format) {
      case FORMAT.JSON:
        await this.writeJson(fileName, data);
        break;
      case FORMAT.CSV:
        await this.writeCsv(fileName, data);
        break;
      case FORMAT.HTML:
        await this.writeHtml(fileName, data);
        break;
      default: throw Error(`Unsupported file format - ${format}`);
    }
  }

  async copyStyles() {
    const curDir = dirname(fileURLToPath(import.meta.url));

    await fs.copyFile(join(curDir, 'styles.css'), join(this.dir, 'styles.css'));
  }
}
