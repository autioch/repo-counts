import React from 'react';
import './styles.css';

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

function DistributionSerie({ serie, maxCount, distributionIsRelative }) {
  const colorStyle = {
    backgroundColor: serie.color
  };
  const amountStyle = {
    width: distributionIsRelative ? `${(serie.totalCount / maxCount) * 100}%` : '100%'
  };

  return (
    <div className="distribution-serie">
      <div className="distribution-serie__header">
        <div className="distribution-serie__color" style={colorStyle}></div>
        <div>{serie.header}</div>
        <div className="distribution-serie__count">{serie.totalCount} total</div>
      </div>
      <div className="distribution-bar-items" style={amountStyle}>
        {serie.items.map((item) => <DistributionBarItem key={item.id} item={item} />)}
      </div>
    </div>
  );
}

export default function DistributionChart({ series: { series, maxCount }, distributionIsRelative }) {
  return (
    <div className="distribution-chart">
      {
        series.map((serie) => <DistributionSerie
          key={serie.id}
          serie={serie}
          maxCount={maxCount}
          distributionIsRelative={distributionIsRelative}
        />)
      }
    </div>
  );
}
