import { promises as fs } from 'fs';
import { join } from 'path';

export default class Fs {
  constructor(dir, debug = false) {
    this.dir = dir;
    this.debug = debug;
  }

  async readJson(fileName) {
    try {
      const data = await fs.readFile(join(this.dir, `${fileName}.json`), 'utf8');

      return JSON.parse(data);
    } catch (err) { // eslint-disable-line no-unused-vars
      return [];
    }
  }

  async writeJson(fileName, data) {
    const json = this.debug ? JSON.stringify(data, null, '  ') : JSON.stringify(data);

    await fs.writeFile(join(this.dir, `${fileName}.json`), json, 'utf8');
  }

  async writeCsv(fileName, rows) {
    await fs.writeFile(join(this.dir, `${fileName}.csv`), rows.map((row) => row.join(';')).join('\n'), 'utf8');
  }

  async writeHtml(fileName, html) {
    await fs.writeFile(join(this.dir, `${fileName}.html`), html, 'utf8');
  }
}
