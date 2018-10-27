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
  const colorStyle = {
    backgroundColor: serie.color
  };

  return (
    <div className="horizontal-stacked-serie">
      <div className="horizontal-stacked-serie__header">
        <div className="horizontal-stacked-serie__color" style={colorStyle}></div>
        <div>{serie.header}</div>
        <div className="horizontal-stacked-serie__count">{serie.totalCount} lines</div>
      </div>
      <div className="horizontal-stacked-bar-items">
        {serie.items.map((item) => <HorizontalStackedBarItem key={item.id} item={item} />)}
      </div>
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
