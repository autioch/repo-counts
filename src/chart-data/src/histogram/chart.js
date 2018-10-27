import React from 'react';
import HistogramSerie from './serie';
import './groups.css';
import './index.css';

export default function HistogramChart({ series: { series, maxCount } }) {
  return (
    <div className="histogram-chart">
      <div className="histogram-char__groups">
        {series.map((serie) => <HistogramSerie serie={serie} maxCount={maxCount} />)}
      </div>
    </div>
  );
}
