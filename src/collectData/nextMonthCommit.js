function getNextMonthFirstDay(dateString) {
  const date = new Date(dateString);

  date.setMonth(date.getMonth() + 1);
  date.setDate(1);

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function findFirstCommitInMonth(commits, dateString) {
  const [chosenYear, chosenMonth] = dateString.split('-');

  return commits.find((commit) => {
    const [year, month] = commit.date.split('-');

    return year === chosenYear && parseInt(month, 10).toString() === chosenMonth;
  });
}

module.exports = function * getNextMonthCommit(commits, startDateString, endTime = new Date().getTime()) {
  let currentDateString = startDateString;

  while (new Date(currentDateString).getTime() < endTime) {
    currentDateString = getNextMonthFirstDay(currentDateString);

    yield {
      date: currentDateString,
      commit: findFirstCommitInMonth(commits, currentDateString)
    };
  }
};
