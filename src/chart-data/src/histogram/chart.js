import React from 'react';
import './styles.scss';

function HistogramBarItem({ item, maxCount }) {
  const { count, color } = item;

  return (
    <div className="histogram-bar-item" title={`${item.id}: ${count}`} style={{
      height: `${(count / maxCount) * 100}%`,
      backgroundColor: color
    }}></div>
  );
}

function HistogramSerie({ serie: { countSum, header, bars }, maxCount }) {
  return (
    <div className="histogram-serie">
      <div className="histogram-bar" title={`Total: ${countSum}`}>
        <div className="histogram-bar__sum" style={{
          height: `${(countSum / maxCount) * 100}%`
        }}></div>
        <div className="histogram-bar-items">
          {bars.map((bar) => <HistogramBarItem key={bar.id} item={bar} maxCount={maxCount} />)}
        </div>
      </div>
      <div className="histogram-serie__header" title={header}>{header}</div>
    </div>
  );
}

export default function HistogramChart({ series: { series, maxCount } }) {
  return (
    <div className="histogram-chart">
      {series.map((serie) => <HistogramSerie key={serie.id} serie={serie} maxCount={maxCount} />)}
    </div>
  );
}
