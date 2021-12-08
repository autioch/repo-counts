import React from 'react';
import './styles.css';

function LegendSerieItem({ item, toggleItem }) {
  return (
    <div className={`legend-serie${item.isDisabled ? ' is-disabled' : ''}`} onClick={() => toggleItem(item.id)}>
      <div className="legend-serie__box" style={{
        backgroundColor: item.color
      }}></div>
      <div className="legend-serie__label">{item.label}</div>
    </div>
  );
}

export default function Legend({ legend, toggleSerie, toggleFileType }) {
  const { series, fileTypes } = legend;

  return (
    <div className="legend">
      <div className="legend-group">
        <h3 className="legend-group__header">Repositories</h3>
        <div className="legend-series">
          {series.map((item) => <LegendSerieItem key={item.id} item={item} toggleItem={toggleSerie} />)}
        </div>
      </div>
      <div className="legend-group">
        <h3 className="legend-group__header">File types</h3>
        <div className="legend-series">
          {fileTypes.map((item) => <LegendSerieItem key={item.id} item={item} toggleItem={toggleFileType} />)}
        </div>
      </div>
    </div>
  );
}
