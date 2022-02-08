/* eslint-env mocha  */
/* eslint-disable max-nested-callbacks */
import assert from 'assert';
import { promises as fs } from 'fs';

import Converter from '../src/Converter.mjs';

const joinRow = (row) => row.join(';');

describe('Converter', () => {
  describe('Chronicle', () => {
    describe('Detail', () => {
      it('month', async () => {
        const input = await fs.readFile('./spec/mock/ChronicleDetailmonth.json', 'utf8');
        const output = await fs.readFile('./spec/mock/ChronicleDetailmonth.csv', 'utf8');
        const result = Converter.chronicleDetailCsv(JSON.parse(input));

        assert.deepEqual(result.map(joinRow), output.split('\n'));
      });
      it('year', async () => {
        const input = await fs.readFile('./spec/mock/ChronicleDetailyear.json', 'utf8');
        const output = await fs.readFile('./spec/mock/ChronicleDetailyear.csv', 'utf8');
        const result = Converter.chronicleDetailCsv(JSON.parse(input));

        assert.deepEqual(result.map(joinRow), output.split('\n'));
      });
    });
    describe('Simple', () => {
      it('month', async () => {
        const input = await fs.readFile('./spec/mock/ChronicleSimplemonth.json', 'utf8');
        const output = await fs.readFile('./spec/mock/ChronicleSimplemonth.csv', 'utf8');
        const result = Converter.chronicleSimpleCsv(JSON.parse(input));

        assert.deepEqual(result.map(joinRow), output.split('\n'));
      });
      it('year', async () => {
        const input = await fs.readFile('./spec/mock/ChronicleSimpleyear.json', 'utf8');
        const output = await fs.readFile('./spec/mock/ChronicleSimpleyear.csv', 'utf8');
        const result = Converter.chronicleSimpleCsv(JSON.parse(input));

        assert.deepEqual(result.map(joinRow), output.split('\n'));
      });
    });
  });
  describe('Current', () => {
    it('Detail', async () => {
      const input = await fs.readFile('./spec/mock/CurrentDetail.json', 'utf8');
      const output = await fs.readFile('./spec/mock/CurrentDetail.csv', 'utf8');
      const result = Converter.currentDetailCsv(JSON.parse(input));

      assert.deepEqual(result.map(joinRow), output.split('\n'));
    });
    it('Simple', async () => {
      const input = await fs.readFile('./spec/mock/CurrentSimple.json', 'utf8');
      const output = await fs.readFile('./spec/mock/CurrentSimple.csv', 'utf8');
      const result = Converter.currentSimpleCsv(JSON.parse(input));

      assert.deepEqual(result.map(joinRow), output.split('\n'));
    });
  });
});
