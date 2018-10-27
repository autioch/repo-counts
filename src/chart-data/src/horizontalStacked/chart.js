import React from 'react';

import './styles.scss';

function HorizontalStackedBarItem({ item }) {
  const style = {
    width: `${item.percentage}%`,
    backgroundColor: item.color
  };

  return (
    <div
      className="horizontal-stacked-bar__item"
      title={`${item.label} - ${item.count} - ${item.percentage}%`}
      style={style}
    >
      <div>{item.label}</div>
      <div>{item.count}</div>
      <div>{item.percentage}%</div>
    </div>
  );
}

function HorizontalStackedSerie({ serie }) {
  return (
    <div className="horizontal-stacked-serie">
      <div className="horizontal-stacked-bar">
        <div className="horizontal-stacked-bar__header">{serie.header}<br/>{serie.totalCount}</div>
        <div className="horizontal-stacked-bar-items">
          {serie.items.map((item) => <HorizontalStackedBarItem key={item.id} item={item} />)}
        </div>
      </div>
      <ul className="horizontal-stacked-serie-legend">
        {serie.items.map((item) => <li key={item.id}>{item.label} - {item.count} - {item.percentage}%</li>)}
      </ul>
    </div>
  );
}

export default function HorizontalStackedChart({ series }) {
  return (
    <div className="horizontal-stacked-chart">
      {series.map((serie) => <HorizontalStackedSerie key={serie.id} serie={serie} />)}
    </div>
  );
}
