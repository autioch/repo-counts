import React, { Component } from 'react';
import rawData from './data.json';
import HistogramChart from './histogram/chart';
import parseHistogram from './histogram/parse';
import HorizontalStackedChart from './horizontalStacked/chart';
import parseHorizontalStacked from './horizontalStacked/parse';
import { Select } from 'antd';
import parseLegend from './legend/parse';
import Legend from './legend';

const { Option } = Select; // eslint-disable-line no-shadow

const repos = Object.values(rawData);
const possibleOptions = repos[0].lineInfo;
const options = Object.keys(possibleOptions).filter((key) => typeof possibleOptions[key] === 'object');

export default class App extends Component {
  constructor(props) {
    super(props);

    const legend = parseLegend(repos);

    this.state = {
      infoKey: options[0],
      horizontalSeries: parseHorizontalStacked(repos, options[0]),
      histogramSeries: parseHistogram(repos),
      legend
    };
    this.chooseOption = this.chooseOption.bind(this);
  }

  chooseOption(infoKey) {
    this.setState({
      infoKey,
      horizontalSeries: parseHorizontalStacked(repos, infoKey),
      histogramSeries: parseHistogram(repos),
      legend: parseLegend(repos)
    });
  }

  render() {
    const { histogramSeries, horizontalSeries, infoKey, legend } = this.state;

    return (
      <div className="App">
        <Legend legend={legend} />
        <h2>History of line count</h2>
        <HistogramChart series={histogramSeries} />
        <h2>
          Distributon of line count in
          <Select value={infoKey} onChange={this.chooseOption} className="distribution-selector" >
            {options.map((option) => <Option key={option}>{option}</Option>)}
          </Select>
        </h2>
        <HorizontalStackedChart series={horizontalSeries} />
      </div>
    );
  }
}
