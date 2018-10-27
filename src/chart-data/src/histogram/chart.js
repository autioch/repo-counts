import React from 'react';
import './groups.css';
import './index.css';

function Bar({ item, maxCount }) {
  const { count, color } = item;

  const style = {
    height: `${(count / maxCount) * 100}%`,
    backgroundColor: color
  };

  return (
    <div className="bar" title={count} style={style}></div>
  );
}

function HistogramSerie({ serie: { countSum, header, bars }, maxCount }) {
  return (
    <div className="group" title={countSum}>
      <div className="bars">
        <div className="bar--sum" title={countSum} style={{
          height: `${(countSum / maxCount) * 100}%`
        }}></div>
        {bars.map((bar) => <Bar key={bar.id} item={bar} maxCount={maxCount} />)}
      </div>
      <div className="header">{header}</div>
    </div>
  );
}

export default function HistogramChart({ series: { series, maxCount } }) {
  return (
    <div className="histogram-chart">
      <div className="histogram-char__groups">
        {series.map((serie) => <HistogramSerie key={serie.id} serie={serie} maxCount={maxCount} />)}
      </div>
    </div>
  );
}
