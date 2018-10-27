import React, { Component } from 'react';
import rawData from './data.json';
import HistogramChart from './histogram/chart';
import parseHistogram from './histogram/parse';
import DistributionChart from './distribution/chart';
import parseDistribution from './distribution/parse';
import parseLegend from './legend/parse';
import Legend from './legend';
import Selector from './selector';

const repos = Object.values(rawData);
const possibleOptions = repos[0].lineInfo;
const distributionOptions = Object.keys(possibleOptions).filter((key) => typeof possibleOptions[key] === 'object');
const histogramOptions = ['month', 'quarter', 'year'];

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      distributionKey: distributionOptions[0],
      distributionSeries: parseDistribution(repos, distributionOptions[0]),
      histogramKey: histogramOptions[0],
      histogramSeries: parseHistogram(repos, histogramOptions[0]),
      legend: parseLegend(repos)
    };
    this.chooseDistributionKey = this.chooseDistributionKey.bind(this);
    this.chooseHistogramKey = this.chooseHistogramKey.bind(this);
  }

  chooseDistributionKey(distributionKey) {
    this.setState({
      distributionKey,
      distributionSeries: parseDistribution(repos, distributionKey)
    });
  }

  chooseHistogramKey(histogramKey) {
    this.setState({
      histogramKey,
      histogramSeries: parseHistogram(repos, histogramKey)
    });
  }

  render() {
    const { histogramKey, histogramSeries, distributionKey, distributionSeries, legend } = this.state;

    return (
      <div className="App">
        <Legend legend={legend} />
        <h2>
          History of line count by
          <Selector value={histogramKey} onChange={this.chooseHistogramKey} options={histogramOptions} />
        </h2>
        <HistogramChart series={histogramSeries} />
        <h2>
          Origin distributon of line count by
          <Selector value={distributionKey} onChange={this.chooseDistributionKey} options={distributionOptions} />
        </h2>
        <DistributionChart series={distributionSeries} />
      </div>
    );
  }
}
