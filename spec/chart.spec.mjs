/* eslint-env mocha  */
/* eslint-disable max-nested-callbacks */
import assert from 'assert';

import Chart, { getAxisValues, roundUp } from '../src/chart.mjs';

describe('Chart', () => {
  describe('roundUp', () => {
    it('zero', () => {
      const input = 0;
      const output = roundUp(input);
      const expected = 0;

      assert.deepEqual(output, expected);
    });
  });

  describe('getAxisValues', () => {
    it('zero', () => {
      const input = 0;
      const output = getAxisValues(input);
      const expected = [0, 0, 0, 0];

      assert.deepEqual(output, expected);
    });
  });

  describe('getTitle', () => {
    it('no data', () => {
      const input = {
        items: [{
          id: 'g1',
          label: '2022',
          items: [{
            id: 's1',
            label: 'ghost-repo',
            items: [{
              id: 'p1',
              label: 'json',
              value: 10
            }]
          }]
        }]
      };
      const output = new Chart(input).getTitle();
      const expected = '2022 summary counts of ghost-repo';

      assert.deepEqual(output, expected);
    });
  });
});
