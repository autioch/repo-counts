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

const lineInfos = Object.values(rawData)[0].lineInfo;
const distributionOptions = Object.entries(lineInfos).filter((entry) => typeof entry[1] === 'object').map((entry) => entry[0]); // eslint-disable-line max-len
const histogramOptions = ['month', 'quarter', 'year'];

const defaultDistribution = 'author';
const defaultHistogram = 'month';

export default class App extends Component {
  constructor(props) {
    super(props);

    const repos = Object.values(rawData);
    const legend = parseLegend(repos);

    this.state = {
      repos,
      distributionKey: defaultDistribution,
      distributionSeries: parseDistribution(repos, defaultDistribution, legend.fileTypes),
      distributionIsRelative: true,
      histogramKey: defaultHistogram,
      histogramSeries: parseHistogram(repos, defaultHistogram, legend.fileTypes),
      legend
    };
    this.toggleDistributionIsRelative = this.toggleDistributionIsRelative.bind(this);
    this.chooseDistributionKey = this.chooseDistributionKey.bind(this);
    this.chooseHistogramKey = this.chooseHistogramKey.bind(this);
    this.toggleSerie = this.toggleSerie.bind(this);
    this.toggleFileType = this.toggleFileType.bind(this);
  }

  chooseDistributionKey(distributionKey) {
    this.setState({
      distributionKey,
      distributionSeries: parseDistribution(this.state.repos, distributionKey, this.state.legend.fileTypes)
    });
  }

  chooseHistogramKey(histogramKey) {
    this.setState({
      histogramKey,
      histogramSeries: parseHistogram(this.state.repos, histogramKey, this.state.legend.fileTypes)
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

    const { fileTypes } = this.state.legend;

    this.setState({
      repos,
      histogramSeries: parseHistogram(repos, this.state.histogramKey, fileTypes),
      distributionSeries: parseDistribution(repos, this.state.distributionKey, fileTypes),
      legend: parseLegend(repos)
    });
  }

  toggleFileType(id) {
    const { series, fileTypes } = this.state.legend;
    const newTypes = fileTypes.map((fileType) => {
      if (fileType.id !== id) {
        return fileType;
      }

      return {
        ...fileType,
        isDisabled: !fileType.isDisabled
      };
    });

    this.setState({
      histogramSeries: parseHistogram(this.state.repos, this.state.histogramKey, newTypes),
      distributionSeries: parseDistribution(this.state.repos, this.state.distributionKey, newTypes),
      legend: {
        series,
        fileTypes: newTypes
      }
    });
  }

  render() {
    const {
      histogramKey, histogramSeries, legend,
      distributionKey, distributionSeries, distributionIsRelative
    } = this.state;

    return (
      <div className="App">
        <Legend legend={legend} toggleSerie={this.toggleSerie} toggleFileType={this.toggleFileType}/>
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
