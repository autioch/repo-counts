import React from 'react';

/* eslint-disable max-len */

const colors = ['#5CBAE6', '#B6D957', '#E9707B', '#FAC364', '#98AAFB', '#80B877', '#D998CB', '#F2D249', '#93B9C6', '#CCC5A8'];

function nextColor(index) {
  const next = index % colors.length;

  return colors[next];
}

function BarsTemplate({ repoMonths, allMonths, width }) {
  const months = allMonths.filter((month) => !!repoMonths[month]);
  const style = {
    width
  };

  return (
    <div className="bars" style={style}>
      {months.map((month, index) => {
        const repoMonth = repoMonths[month];

        return <div
          key={index}
          className="bar"
          style={{
            width: `${repoMonth.percentage}%`,
            backgroundColor: nextColor(index)
          }}
          title={`${month} - ${repoMonth.count}K - ${repoMonth.percentage}%`}
        >
          <div>{month}</div>
          <div>{repoMonth.count}K</div>
          <div>{repoMonth.percentage}%</div>
        </div>;
      })}
    </div>
  );
}

function ListTemplate({ repoMonths, allMonths }) {
  const months = allMonths.filter((month) => !!repoMonths[month]);

  return (
    <ul className="list">
      {months.map((month, index) => <li key={index}>{month} - {repoMonths[month].count}K - {repoMonths[month].percentage}%</li>)}
    </ul>
  );
}

export default function groupTemplate({ repo, parsed }) {
  const { allMonths, allQuarters, allYears, maxCount } = parsed;
  const { months, quarters, years, repoName, totalLines } = repo;
  const width = `${(totalLines / maxCount) * 100}%`;

  return (<div className="repo">
    <h3 className="repo__name">{repoName}</h3>
    <h4 className="repo__count">{totalLines} lines</h4>
    <ListTemplate repoMonths={months} allMonths={allMonths} />
    <BarsTemplate repoMonths={months} allMonths={allMonths} width={width}/>
    <ListTemplate repoMonths={quarters} allMonths={allQuarters} />
    <BarsTemplate repoMonths={quarters} allMonths={allQuarters} width={width}/>
    <ListTemplate repoMonths={years} allMonths={allYears} />
    <BarsTemplate repoMonths={years} allMonths={allYears} width={width}/>
  </div>);
}
