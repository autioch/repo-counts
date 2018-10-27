import React from 'react';
import './styles.scss';

export default function Legend({ legend }) {
  const { items, fileTypes } = legend;

  return (
    <div className="legend">
      <h2>Legend</h2>
      <div className="legend-items">
        {items.map((item) =>
          <div className="legend-item" key={item.id}>
            <div className="legend-item__box" style={{
              backgroundColor: item.color
            }}></div>
            <div className="legend-item__label">{item.label}</div>
          </div>
        )}
      </div>
      <div className="legend__types">File types: {fileTypes.join(', ')}</div>
    </div>
  );
}
