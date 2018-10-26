import React from 'react';
import Serie from './serie';

import './styles.scss';

export default function HorizontalStackedChart({ series }) {
  return (
    <div className="horizontal-stacked-chart">
      {series.map((serie) => <Serie key={serie.id} serie={serie} />)}
    </div>
  );
}
