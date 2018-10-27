import React from 'react';
import './styles.scss';

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

/* TODO */
const toggleType = () => alert('Not implemented yet'); // eslint-disable-line no-alert

export default function Legend({ legend, toggleSerie }) {
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
          {fileTypes.map((item) => <LegendSerieItem key={item.id} item={item} toggleItem={toggleType} />)}
        </div>
      </div>
    </div>
  );
}
