import React from 'react';

import './styles.scss';

function DistributionBarItem({ item }) {
  const style = {
    width: `${item.percentage}%`,
    backgroundColor: item.color
  };

  return (
    <div
      className="distribution-bar__item"
      title={`${item.label} - ${item.count} - ${item.percentage}%`}
      style={style}
    >
      <div>{item.label}</div>
      <div>{item.count}</div>
      <div>{item.percentage}%</div>
    </div>
  );
}

function DistributionSerie({ serie }) {
  const colorStyle = {
    backgroundColor: serie.color
  };

  return (
    <div className="distribution-serie">
      <div className="distribution-serie__header">
        <div className="distribution-serie__color" style={colorStyle}></div>
        <div>{serie.header}</div>
        <div className="distribution-serie__count">{serie.totalCount} lines</div>
      </div>
      <div className="distribution-bar-items">
        {serie.items.map((item) => <DistributionBarItem key={item.id} item={item} />)}
      </div>
    </div>
  );
}

export default function DistributionChart({ series }) {
  return (
    <div className="distribution-chart">
      {series.map((serie) => <DistributionSerie key={serie.id} serie={serie} />)}
    </div>
  );
}
