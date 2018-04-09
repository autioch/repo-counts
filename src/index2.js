const { join } = require('path');
const { getCommits, siteHtml, writeFile, groupIntoDays, getNthCommitHash } = require('./utils');

const gitFolder = join(__dirname, '..', '..', '.git');
const secondCommitHash = getNthCommitHash(2);

const skippedCommits = [
  'Added medium size mocks.',
  'Spreadsheet pages.',
  'Added user stats.'
];

const commits = getCommits(gitFolder, secondCommitHash).filter((commit) => skippedCommits.every((skipped) => skipped !== commit.text));
const commitsByDay = groupIntoDays(commits).reverse();

writeFile(join(__dirname, 'commits.json'), JSON.stringify(commitsByDay, null, '  '));
writeFile(join(__dirname, 'commits.html'), siteHtml(commitsByDay));
