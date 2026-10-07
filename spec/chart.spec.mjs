/* eslint-env mocha  */
/* eslint-disable max-nested-callbacks */
import assert from 'assert';

import Chart, { getAxisValues, roundUp } from '../src/Chart.mjs';

const roundUpTestCases = [
  [0, 0],
  [19, 20],
  [300, 300],
  [3768, 3800],
  [765421, 766000]
];

const getAxisValuesTestCases = [
  [0, '0', '0', '0', '0'],
  [19, '19', '14', '10', '5'],
  [300, '300', '225', '150', '75'],
  [3800, '3.8K', '2.9K', '1.9K', '1K'],
  [766000, '766K', '574.5K', '383K', '191.5K']
];

const makeTitle = (items) => new Chart({
  items
}).getTitle();

describe('Chart', () => {
  describe('escaping', () => {
    const html = new Chart({
      items: [
        Chart.makePeriod(1, '2022', [
          Chart.makeSeries(1, 'repo"<a>', [
            Chart.makePoint(1, '.<b>x', 3),
            Chart.makePoint(2, '.js&', 1)
          ])
        ])
      ]
    }).toHtmlString();

    it('leaves no raw markup from labels', () => {
      assert.deepEqual(html.includes('<b>'), false);
      assert.deepEqual(html.includes('<a>'), false);
    });

    it('escapes labels in text and attributes', () => {
      assert.deepEqual(html.includes('>.&lt;b&gt;x<'), true);
      assert.deepEqual(html.includes('data-label=".&lt;b&gt;x 3"'), true);
      assert.deepEqual(html.includes('.js&amp; 1'), true);
      assert.deepEqual(html.includes('repo&quot;&lt;a&gt;'), true);
    });
  });

  describe('roundUp', () => {
    roundUpTestCases.forEach(([input, expected]) => it(`${input} to ${expected}`, () => assert.deepEqual(roundUp(input), expected)));
  });

  describe('getAxisValues', () => {
    getAxisValuesTestCases.forEach(([input, ...expected]) => it(`${input} to ${expected}`, () => assert.deepEqual(getAxisValues(input), expected)));
  });

  describe('getTitle', () => {
    it('single everything', () => {
      const output = makeTitle([
        Chart.makePeriod(1, '2022', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json')
          ])
        ])
      ]);

      assert.deepEqual(output, '2022 summary counts of ghost');
    });

    it('multiple everything', () => {
      const output = makeTitle([
        Chart.makePeriod(1, '2022-01', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ]),
          Chart.makeSeries(2, 'wraith', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ])
        ]),
        Chart.makePeriod(2, '2022-02', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ]),
          Chart.makeSeries(2, 'wraith', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ])
        ])
      ]);

      assert.deepEqual(output, '2022-01-2022-02 detailed counts of 2 repositories');
    });

    it('multiple points', () => {
      const output = makeTitle([
        Chart.makePeriod(1, '2034', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ])
        ])
      ]);

      assert.deepEqual(output, '2034 detailed counts of ghost');
    });

    it('multiple series', () => {
      const output = makeTitle([
        Chart.makePeriod(1, '2033', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json')
          ]),
          Chart.makeSeries(2, 'wraith', [
            Chart.makePoint(1, 'json')
          ])
        ])
      ]);

      assert.deepEqual(output, '2033 summary counts of 2 repositories');
    });

    it('multiple periods', () => {
      const output = makeTitle([
        Chart.makePeriod(1, '2022', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json')
          ])
        ]),
        Chart.makePeriod(1, '2023', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json')
          ])
        ])
      ]);

      assert.deepEqual(output, '2022-2023 summary counts of ghost');
    });

    it('multiple periods and points', () => {
      const output = makeTitle([
        Chart.makePeriod(1, '2019-01', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ])
        ]),
        Chart.makePeriod(2, '2019-02', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ])
        ])
      ]);

      assert.deepEqual(output, '2019-01-2019-02 detailed counts of ghost');
    });

    it('multiple periods and series', () => {
      const output = makeTitle([
        Chart.makePeriod(1, '2022-01', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json')
          ]),
          Chart.makeSeries(2, 'wraith', [
            Chart.makePoint(1, 'json')
          ])
        ]),
        Chart.makePeriod(2, '2022-02', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json')
          ]),
          Chart.makeSeries(2, 'wraith', [
            Chart.makePoint(1, 'json')
          ])
        ])
      ]);

      assert.deepEqual(output, '2022-01-2022-02 summary counts of 2 repositories');
    });

    it('multiple series and points', () => {
      const output = makeTitle([
        Chart.makePeriod(1, '2023-01', [
          Chart.makeSeries(1, 'ghost', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ]),
          Chart.makeSeries(2, 'wraith', [
            Chart.makePoint(1, 'json'),
            Chart.makePoint(2, 'js')
          ])
        ])
      ]);

      assert.deepEqual(output, '2023-01 detailed counts of 2 repositories');
    });
  });
});
