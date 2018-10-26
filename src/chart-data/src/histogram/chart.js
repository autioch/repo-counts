import React from 'react';
import HistogramSerie from './serie';
import Legend from './legend';
import './groups.css';
import './index.css';
import './legend.css';

export default function HistogramChart({ series: { types, series, maxCount, legend } }) {
  return (
    <div className="histogram-chart">
      <Legend types={types} legend={legend} />
      <div className="histogram-char__groups">
        {series.map((serie) => <HistogramSerie serie={serie} maxCount={maxCount} />)}
      </div>
    </div>
  );
}
