import React, { Component } from 'react';
import rawData from './data.json';
import HistogramChart from './histogram/chart';
import parseHistogram from './histogram/parse';
import HorizontalStackedChart from './horizontalStacked/chart';
import parseHorizontalStacked from './horizontalStacked/parse';

const horizontalSeries = parseHorizontalStacked(rawData);
const histogramSeries = parseHistogram(rawData);

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <h2>History of line count</h2>
        <HistogramChart series={histogramSeries} />
        <h2>Distributon of line count in time</h2>
        <HorizontalStackedChart series={horizontalSeries} />
      </div>
    );
  }
}
