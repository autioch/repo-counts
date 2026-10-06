/* eslint-env mocha  */
import assert from 'assert';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { FORMAT } from '../src/consts.mjs';
import Fs from '../src/Fs.mjs';

describe('Fs', () => {
  let root;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'repo-counts-'));
  });

  afterEach(() => {
    rmSync(root, {
      recursive: true,
      force: true
    });
  });

  describe('dry', () => {
    it('does not create the output dir', async () => {
      const dir = join(root, 'out');
      const fs = new Fs(dir, true);

      await fs.ensureDir();
      await fs.writeOutput(FORMAT.JSON, 'data', [1]);
      await fs.copyStyles();

      assert.deepEqual(existsSync(dir), false);
    });

    it('does not write into an existing output dir', async () => {
      const fs = new Fs(root, true);

      await fs.ensureDir();
      await fs.writeOutput(FORMAT.JSON, 'data', [1]);
      await fs.writeOutput(FORMAT.CSV, 'data', [ [1, 2] ]);
      await fs.writeOutput(FORMAT.HTML, 'data', '<html></html>');
      await fs.writeJson('authors', []);
      await fs.copyStyles();

      assert.deepEqual(readdirSync(root), []);
    });
  });

  describe('not dry', () => {
    it('creates the output dir and writes files', async () => {
      const dir = join(root, 'out');
      const fs = new Fs(dir);

      await fs.ensureDir();
      await fs.writeOutput(FORMAT.JSON, 'data', [1]);
      await fs.copyStyles();

      assert.deepEqual(readdirSync(dir).sort(), ['data.json', 'styles.css']);
    });
  });
});
