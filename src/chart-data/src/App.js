import React, { Component } from 'react';
import rawData from './data.json';
import HistogramChart from './histogram/chart';
import parseHistogram from './histogram/parse';
import HorizontalStackedChart from './horizontalStacked/chart';
import parseHorizontalStacked from './horizontalStacked/parse';
import { Select } from 'antd';

const { Option } = Select; // eslint-disable-line no-shadow

const defKey = 'author';
const repos = Object.values(rawData);
const possibleOptions = repos[0].lineInfo;
const options = Object.keys(possibleOptions).filter((key) => typeof possibleOptions[key] === 'object');

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      infoKey: options[0],
      horizontalSeries: parseHorizontalStacked(repos, options[0]),
      histogramSeries: parseHistogram(repos)
    };
    this.chooseOption = this.chooseOption.bind(this);
  }

  chooseOption(infoKey) {
    this.setState({
      infoKey,
      horizontalSeries: parseHorizontalStacked(repos, infoKey),
      histogramSeries: parseHistogram(repos)
    });
  }

  render() {
    const { histogramSeries, horizontalSeries, infoKey } = this.state;

    return (
      <div className="App">
        <h2>History of line count</h2>
        <HistogramChart series={histogramSeries} />
        <h2>
          Distributon of line count in
          <Select value={infoKey} onChange={this.chooseOption} >
            {options.map((option) => <Option key={option}>{option}</Option>)}
          </Select>
        </h2>
        <HorizontalStackedChart series={horizontalSeries} />
      </div>
    );
  }
}
