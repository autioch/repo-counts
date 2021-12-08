import React from 'react';
import './styles.css';

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
        }}>
          <div className="histogram-bar__sum-label">{countSum}</div>
        </div>
        <div className="histogram-bar-items">
          {bars.map((bar) => <HistogramBarItem key={bar.id} item={bar} maxCount={maxCount} />)}
        </div>
      </div>
      <div className="histogram-serie__header" title={header}>{header}</div>
    </div>
  );
}

function HistogramScaleItem({ scale, maxCount }) {
  const style = {
    bottom: `${(scale / maxCount) * 100}%`
  };

  return (
    <div className="histogram-chart-scale-item" style={style}>
      <div className="histogram-chart-scale-item__label">{scale}</div>
      <div className="histogram-chart-scale-item__line"></div>
    </div>
  );
}

function HistogramScale({ scales, maxCount }) {
  return (
    <div className="histogram-chart-scale">
      {scales.map((scale, index) => <HistogramScaleItem key={index} scale={scale} maxCount={maxCount}/>)}
    </div>
  );
}

export default function HistogramChart({ series: { series, maxCount, scales } }) {
  return (
    <div className="histogram-chart">
      <HistogramScale scales={scales} maxCount={maxCount} />
      {series.map((serie) => <HistogramSerie key={serie.id} serie={serie} maxCount={maxCount} />)}
    </div>
  );
}
