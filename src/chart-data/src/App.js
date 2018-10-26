import React, { Component } from 'react';
import parseLineInfo from './parseLineInfo';
import rawData from './data.json';
import HorizontalStackedChart from './horizontalStacked/chart';
import HistogramChart from './histogram/chart';
import { nextColor } from './utils';

function getBarSerie(label, repoMonths, allMonths) {
  const months = allMonths.filter((month) => !!repoMonths[month]);

  return {
    id: label,
    header: label,
    items: months.map((month, index) => ({
      id: index,
      label: month,
      count: repoMonths[month].count,
      percentage: repoMonths[month].percentage,
      color: nextColor(index)
    }))
  };
}

const data = parseLineInfo(rawData);

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="chart">
          {data.repos.map((repo, index) => {
            const { allMonths, allQuarters, allYears } = data;
            const { months, quarters, years, repoName, totalLines } = repo;

            const series = [
              getBarSerie('Months', months, allMonths),
              getBarSerie('Quarters', quarters, allQuarters),
              getBarSerie('Years', years, allYears)
            ];

            return (
              <div className="repo" key={index}>
                <h3 className="repo__name">{repoName}</h3>
                <h4 className="repo__count">{totalLines} lines</h4>
                <HorizontalStackedChart series={series} />
              </div>
            );
          })}
        </div>
        <HistogramChart repos={rawData} />
      </div>
    );
  }
}
