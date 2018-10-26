import React from 'react';

export default function HorizontalStackedBarItem({ item }) {
  const style = {
    width: `${item.percentage}%`,
    backgroundColor: item.color
  };

  return (
    <div
      className="horizontal-stacked-bar__item"
      title={`${item.label} - ${item.count}K - ${item.percentage}%`}
      style={style}
    >
      <div>{item.label}</div>
      <div>{item.count}K</div>
      <div>{item.percentage}%</div>
    </div>
  );
}
