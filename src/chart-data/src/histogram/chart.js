import React from 'react';
import GroupTemplate from './groupTemplate';
import Legend from './legend';
import './groups.css';
import './index.css';
import './legend.css';

export default function HorizontalStackedChart({ groups, types, repos, ignored }) {
  const maxCount = Math.max(...groups.map((group) => group.countSum));

  return (
    <div className="histogram-chart">
      <Legend types={types} repo={repos} ignored={ignored} />
      {groups.map((group) => <GroupTemplate group={group} maxCount={maxCount} />)}
    </div>
  );
}
