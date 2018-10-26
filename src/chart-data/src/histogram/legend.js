import React from 'react';

export default function HistogramLegend({ types, repos, ignored }) {
  return (
    <div className="legend">
      <div>Included types: {types.join(', ')}</div>
      <div>Ignored types: {ignored.join(', ')}</div>
      {repos.map((repo) =>
        <div className="serie">
          <div className="serie__box" style={{
            backgroundColor: repo.color
          }}></div>
          <div>{repo.repoName}: +{repo.insertions} -{repo.deletions} ({repo.diff})</div>
        </div>
      )}
    </div>
  );
}
