const { readFile, writeFile } = require('../utils');
const calculateBusinessDays = require('./calculateBusinessDays');
const xlsx = require('node-xlsx');

module.exports = function summarizeSprints() {
  readFile('sprints.json')
    .then((data) => {
      const sprints = JSON.parse(data);

      sprints.forEach((sprint) => {
        const [startDay, startMonth, startYear] = sprint.start.split('-');
        const [endDay, endMonth, endYear] = (sprint.end ? sprint.end : '11-04-18').split('-');

        sprint.start = `20${startYear}-${startMonth}-${startDay}`;
        sprint.end = `20${endYear}-${endMonth}-${endDay}`;

        sprint.issueCount = parseInt(sprint.issueCount, 10);

        const businessDays = calculateBusinessDays(sprint.start, sprint.end);
        const tasksPerDay = parseFloat((sprint.issueCount / businessDays).toFixed(3));

        sprint.businessDays = businessDays;
        sprint.tasksPerDay = tasksPerDay;
      });
      writeFile('sprints__summary.json', JSON.stringify(sprints, null, '  '));

      const excelRows = sprints
        .map(({ name, start, end, issueCount, businessDays, tasksPerDay }) => [
          name, start, end, issueCount, businessDays, tasksPerDay
        ]);

      const headerRow = ['Name', 'Start', 'End', 'IssueCount', 'Business days', 'Tasks per day'];

      const outputExcel = xlsx.build([{
        name: 'Sprints summary',
        data: [headerRow].concat(excelRows)
      }]);

      writeFile('sprints__summary.xlsx', outputExcel);
    })
    .catch((err) => console.log(err));
};
