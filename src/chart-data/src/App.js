import React, { Component } from 'react';
import parseLineInfo from './parseLineInfo';
import rawData from './data.json';
import LineInfoChart from './lineInfoChart';

const data = parseLineInfo(rawData);

console.log(data);

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="chart">
          {data.repos.map((repo, index) => <LineInfoChart key={index} repo={repo} parsed={data}/>)}
        </div>
      </div>
    );
  }
}
