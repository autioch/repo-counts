import child_process from 'child_process';
import ProgressBar from 'progress';
import { promisify } from 'util';

export function getFirstCommitPerMonth(commits) {
  const yearMonthDict = commits.reduce((obj, commit) => {
    const { year, month, day } = commit;

    if (!obj[year]) {
      obj[year] = {};
    }

    if (!obj[year][month] || (obj[year][month].day > day)) {
      obj[year][month] = commit;
    }

    return obj;
  }, {});

  return Object.values(yearMonthDict).flatMap((dict) => Object.values(dict));
}

export function getLastCommitPerYear(commits) {
  const yearDict = commits.reduce((obj, commit) => {
    const { year, month, day } = commit;

    if (!obj[year] || (obj[year].month < month) || (obj[year].month === month && (obj[year].day < day))) {
      obj[year] = commit;
    }

    return obj;
  }, {});

  return Object.values(yearDict);
}

export function getBar(title, total) {
  const bar = new ProgressBar(`  ${title} [:bar] :current/:total :rate/s :etas`, {
    width: 40,
    total
  });

  return () => bar.tick();
}

export function historicalLineCountsToCsv(counts) {
  const dates = [...new Set(Object.values(counts).flatMap((datas) => Object.keys(datas)))].sort();
  const repoNames = Object.keys(counts);
  const getCountForDate = (repoName, dateIndex) => counts[repoName][dates[dateIndex]];

  const rows = dates.map((date, index) => [date, ...repoNames.map((repoName) => {
    let count = 0;

    let dateIndex = index + 1;

    while (!count && dateIndex > -1) {
      count = getCountForDate(repoName, dateIndex--);
    }

    return count;
  })]);

  return [ ['Year-month', ...repoNames], ...rows];
}

const execOptions = {
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024
};

const exec = promisify(child_process.exec);

export async function command(commandString, cwd) {
  try {
    const { stdout, stderr } = await exec(commandString, { // eslint-disable-line no-unused-vars
      ...execOptions,
      cwd
    });

    return stdout.trim();
  } catch (err) { // eslint-disable-line no-unused-vars
    // console.log(`Failed to execute command ${commandString}`);

    // console.log(commandString);
    // console.log(err.message);

    return '';
  }
}
