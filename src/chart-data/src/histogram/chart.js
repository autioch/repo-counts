import React from 'react';
import Group from './group';
import Legend from './legend';
import parse from './parse';
import './groups.css';
import './index.css';
import './legend.css';

export default function HistogramChart({ repos }) {
  const { groups, types } = parse(repos);
  const maxCount = Math.max(...groups.map((group) => group.countSum));

  return (
    <div className="histogram-chart">
      <Legend types={types} repos={repos} />
      <div className="histogram-char__groups">
        {groups.map((group) => <Group group={group} maxCount={maxCount} />)}
      </div>
    </div>
  );
}
