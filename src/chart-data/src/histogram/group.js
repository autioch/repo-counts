import React from 'react';

function Bar({ item, maxCount }) {
  const { count, color } = item;

  const style = {
    height: `${(count / maxCount) * 100}%`,
    backgroundColor: color
  };

  return (
    <div className="bar" title={count} style={style}></div>
  );
}

export default function GroupTemplate({ group: { deletions, insertions, countSum, date, bars }, maxCount }) {
  return (
    <div className="group" title={countSum}>
      <div className="bars">
        <div className="deletions" title={deletions} style={{
          bottom: `${(deletions / maxCount) * 100}%`
        }}>-</div>
        <div className="insertions" title={insertions} style={{
          bottom: `${(insertions / maxCount) * 100}%`
        }}>+</div>
        <div className="bar--sum" title={countSum} style={{
          height: `${(countSum / maxCount) * 100}%`
        }}></div>
        {bars.map((bar) => <Bar key={bar.id} item={bar} maxCount={maxCount} />)}
      </div>
      <div className="header">{date}</div>
    </div>
  );
}
