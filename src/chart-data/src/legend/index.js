import React from 'react';
import './styles.scss';

export default function Legend({ fileTypes, legend }) {
  return (
    <div className="legend">
      <div className="legend__types">File types: {fileTypes.join(', ')}</div>
      <div className="legend-items">
        {legend.map((item) =>
          <div className="legend-item" key={item.id}>
            <div className="legend-item__box" style={{
              backgroundColor: item.color
            }}></div>
            <div className="legend-item__label">{item.label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
