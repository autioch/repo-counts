import React from 'react';
import Item from './item';

export default function HorizontalStackedSerie({ serie }) {
  const { header, items } = serie;

  return (
    <div className="horizontal-stacked-serie">
      <ul className="horizontal-stacked-serie-legend">
        {items.map((item) => <li key={item.id}>{item.label} - {item.count} - {item.percentage}%</li>)}
      </ul>
      <div className="horizontal-stacked-bar">
        <div className="horizontal-stacked-bar__header">{header}</div>
        <div className="horizontal-stacked-bar-items">
          {items.map((item) => <Item key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}
