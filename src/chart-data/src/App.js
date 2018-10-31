import React, { Component } from 'react';
import rawData from './data.json';
import HistogramChart from './histogram/chart';
import parseHistogram from './histogram/parse';
import DistributionChart from './distribution/chart';
import parseDistribution from './distribution/parse';
import parseLegend from './legend/parse';
import Legend from './legend';
import Selector from './selector';
import { Switch } from 'antd';

const distributionOptions = ['month', 'quarter', 'year', 'author', 'fileType'];
const histogramOptions = ['month', 'quarter', 'year'];

export default class App extends Component {
  constructor(props) {
    super(props);

    const repos = Object.values(rawData);

    this.state = {
      repos,
      distributionKey: distributionOptions[0],
      distributionSeries: parseDistribution(repos, distributionOptions[0]),
      distributionIsRelative: true,
      histogramKey: histogramOptions[0],
      histogramSeries: parseHistogram(repos, histogramOptions[0]),
      legend: parseLegend(repos)
    };
    this.toggleDistributionIsRelative = this.toggleDistributionIsRelative.bind(this);
    this.chooseDistributionKey = this.chooseDistributionKey.bind(this);
    this.chooseHistogramKey = this.chooseHistogramKey.bind(this);
    this.toggleSerie = this.toggleSerie.bind(this);
  }

  chooseDistributionKey(distributionKey) {
    this.setState({
      distributionKey,
      distributionSeries: parseDistribution(this.state.repos, distributionKey)
    });
  }

  chooseHistogramKey(histogramKey) {
    this.setState({
      histogramKey,
      histogramSeries: parseHistogram(this.state.repos, histogramKey)
    });
  }

  toggleDistributionIsRelative(distributionIsRelative) {
    this.setState({
      distributionIsRelative
    });
  }

  toggleSerie(id) {
    const repos = this.state.repos.map((repo) => {
      if (repo.config.repoName !== id) {
        return repo;
      }

      return {
        ...repo,
        isDisabled: !repo.isDisabled
      };
    });

    this.setState({
      repos,
      histogramSeries: parseHistogram(repos, this.state.histogramKey),
      distributionSeries: parseDistribution(repos, this.state.distributionKey),
      legend: parseLegend(repos)
    });
  }

  render() {
    const {
      histogramKey, histogramSeries, legend,
      distributionKey, distributionSeries, distributionIsRelative
    } = this.state;

    return (
      <div className="App">
        <Legend legend={legend} toggleSerie={this.toggleSerie}/>
        <h3 className="chart-header">
          History of line count by
          <Selector value={histogramKey} onChange={this.chooseHistogramKey} options={histogramOptions} />
        </h3>
        <HistogramChart series={histogramSeries} />
        <h3 className="chart-header">
          Origin distributon of line count by
          <Selector value={distributionKey} onChange={this.chooseDistributionKey} options={distributionOptions} />
          <Switch
            checked={distributionIsRelative}
            onChange={this.toggleDistributionIsRelative}
            checkedChildren="Relative"
            unCheckedChildren="Absolute"/>
        </h3>
        <DistributionChart series={distributionSeries} distributionIsRelative={distributionIsRelative} />
      </div>
    );
  }
}
