/* eslint-env mocha  */
/* eslint-disable max-nested-callbacks */
import assert from 'assert';
import { promises as fs } from 'fs';

import Converter, { normalizeDates } from '../src/Converter.mjs';

const joinRow = (row) => row.join(';');

describe.skip('Convert to csv', () => {
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

describe.skip('Convert to html', () => {
  describe('Chronicle', () => {
    describe('Detail', () => {
      it('month', async () => {
        const input = await fs.readFile('./spec/mock/ChronicleDetailmonth.json', 'utf8');
        const output = await fs.readFile('./spec/mock/ChronicleDetailmonth.html', 'utf8');
        const result = Converter.chronicleDetailHtml(JSON.parse(input));

        assert.deepEqual(result, output);
      });
      it('year', async () => {
        const input = await fs.readFile('./spec/mock/ChronicleDetailyear.json', 'utf8');
        const output = await fs.readFile('./spec/mock/ChronicleDetailyear.html', 'utf8');
        const result = Converter.chronicleDetailHtml(JSON.parse(input));

        assert.deepEqual(result, output);
      });
    });
    describe('Simple', () => {
      it('month', async () => {
        const input = await fs.readFile('./spec/mock/ChronicleSimplemonth.json', 'utf8');
        const output = await fs.readFile('./spec/mock/ChronicleSimplemonth.html', 'utf8');
        const result = Converter.chronicleSimpleHtml(JSON.parse(input));

        assert.deepEqual(result, output);
      });
      it('year', async () => {
        const input = await fs.readFile('./spec/mock/ChronicleSimpleyear.json', 'utf8');
        const output = await fs.readFile('./spec/mock/ChronicleSimpleyear.html', 'utf8');
        const result = Converter.chronicleSimpleHtml(JSON.parse(input));

        assert.deepEqual(result, output);
      });
    });
  });
  describe('Current', () => {
    it('Detail', async () => {
      const input = await fs.readFile('./spec/mock/CurrentDetail.json', 'utf8');
      const output = await fs.readFile('./spec/mock/CurrentDetail.html', 'utf8');
      const result = Converter.currentDetailHtml(JSON.parse(input));

      assert.deepEqual(result, output);
    });
    it('Simple', async () => {
      const input = await fs.readFile('./spec/mock/CurrentSimple.json', 'utf8');
      const output = await fs.readFile('./spec/mock/CurrentSimple.html', 'utf8');
      const result = Converter.currentSimpleHtml(JSON.parse(input));

      assert.deepEqual(result, output);
    });
  });
});

const prepareData = (dates) => [ [null, Object.fromEntries(dates.map((date) => [date, true]))] ];

describe('Converter', () => {
  describe('utils', () => {
    describe('normalizeDates', () => {
      it('handles no dates', () => {
        const input = prepareData([]);
        const output = normalizeDates(input);
        const expected = [];

        assert.deepEqual(output, expected);
      });

      it('single year', () => {
        const input = prepareData(['2022']);
        const output = normalizeDates(input);
        const expected = ['2022'];

        assert.deepEqual(output, expected);
      });

      it('single month', () => {
        const input = prepareData(['2022-02']);
        const output = normalizeDates(input);
        const expected = ['2022-02'];

        assert.deepEqual(output, expected);
      });

      it('two years', () => {
        const input = prepareData(['2022', '2023']);
        const output = normalizeDates(input);
        const expected = ['2022', '2023'];

        assert.deepEqual(output, expected);
      });

      it('two years with gap', () => {
        const input = prepareData(['2021', '2023']);
        const output = normalizeDates(input);
        const expected = ['2021', '2022', '2023'];

        assert.deepEqual(output, expected);
      });

      it('border months in a year', () => {
        const input = prepareData(['2021-01', '2021-12']);
        const output = normalizeDates(input);
        const expected = ['2021-01', '2021-02', '2021-03', '2021-04', '2021-05', '2021-06', '2021-07', '2021-08', '2021-09', '2021-10', '2021-11', '2021-12'];

        assert.deepEqual(output, expected);
      });

      it('2 months at new year', () => {
        const input = prepareData(['2021-12', '2022-01']);
        const output = normalizeDates(input);
        const expected = ['2021-12', '2022-01'];

        assert.deepEqual(output, expected);
      });

      it('multiple months', () => {
        const input = prepareData(['2021-10', '2022-03']);
        const output = normalizeDates(input);
        const expected = ['2021-10', '2021-11', '2021-12', '2022-01', '2022-02', '2022-03'];

        assert.deepEqual(output, expected);
      });
    });
  });
});
