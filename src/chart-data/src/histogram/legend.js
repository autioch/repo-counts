import React from 'react';

export default function HistogramLegend({ types, repos }) {
  return (
    <div className="legend">
      <div>Included types: {types.join(', ')}</div>
      {Object.entries(repos).map(([id, repo]) =>
        <div className="serie" key={id}>
          <div className="serie__box" style={{
            backgroundColor: repo.color
          }}></div>
          <div>{repo.repoName}: +{repo.insertions} -{repo.deletions} ({repo.diff})</div>
        </div>
      )}
    </div>
  );
}
