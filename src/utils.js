/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const fs = require('fs');
const { groupBy, uniq } = require('lodash');
const { execSync } = require('child_process');

function getCommits(gitFolder, start, end = 'HEAD') {
  const result = execSync(`git --git-dir "${gitFolder}" log ${start}..${end} --no-merges --branches --pretty=format:"%at;%s;%an;%ae" --shortstat`)
    .toString()
    .split('\n\n');

  return result
    .filter((commit) => !!commit.length)
    .map((commitData) => commitData.trim())
    .map((commit) => {
      const [description, modifications] = commit.split('\n');
      const [datetime, text, authorName, emailName] = description.split(';');

      const [, deletions = 0] = /([0-9]+) deletions/.exec(modifications) || [];
      const [, insertions = 0] = /([0-9]+) insertions/.exec(modifications) || [];
      const filesChanged = parseInt(modifications, 10);
      let date;

      try {
        [date] = new Date(datetime * 1000).toISOString().split('T');
      } catch (err) {
        console.log(err.message);
        date = datetime;
      }

      return {
        date,
        text,
        insertions: parseInt(insertions, 10),
        deletions: parseInt(deletions, 10),
        filesChanged,
        authorName,
        emailName
      };
    });
}

function getFirstCommitHash() {
  const text = execSync('git rev-list --max-parents=0 HEAD').toString();

  return text;
}

function getNthCommitHash(commitNr) {
  const totalCommits = execSync('git rev-list HEAD --count');
  const skip = parseInt(totalCommits, 10) - commitNr;
  const nthCommit = execSync(`git log --skip=${skip} --max-count=1 --pretty=format:"%H"`).toString();

  return nthCommit;
}

function groupIntoDays(commits) {
  const grouped = groupBy(commits, 'date');

  return Object.entries(grouped).map(([date, commitArray]) => ({
    date,
    text: uniq(commitArray.map((commit) => commit.text)).join(', '), // `${commitArray.length } commits`,
    insertions: commitArray.reduce((sum, commit) => sum + commit.insertions, 0),
    deletions: commitArray.reduce((sum, commit) => sum + commit.deletions, 0),
    filesChanged: commitArray.reduce((sum, commit) => sum + commit.filesChanged, 0),
    authorNames: uniq(commitArray.map((commit) => commit.authorName)).join(', '),
    emailNames: uniq(commitArray.map((commit) => commit.emailName)).join(', ')
  }));
}

function siteHtml(commits) {
  const maxInsertion = Math.max(...commits.map((commit) => commit.insertions));
  const maxDeletion = Math.max(...commits.map((commit) => commit.deletions));
  const width = 100 / commits.length;

  const col = (height, title, className = 'col') => `<div class="${className}" style="width:${width}%;height:${height}%" title="${title}"></div>`;
  const insertions = commits.map((commit) => col((commit.insertions / maxInsertion) * 100, `${commit.text} (${commit.date}), +${commit.insertions} -${commit.deletions}`));
  const deletions = commits.map((commit) => col((commit.deletions / maxDeletion) * 100, `${commit.text} (${commit.date}), +${commit.insertions} -${commit.deletions}`));
  const sums = commits.reduce((arr, commit) => arr.concat({
    text: arr[arr.length - 1].text + commit.insertions - commit.deletions,
    date: commit.date,
    insertions: commit.insertions,
    deletions: commit.deletions
  }), [{
    text: 0,
    date: '',
    insertions: 0,
    deletions: 0
  }]);

  const minCount = Math.min(...sums.map((commit) => commit.text));

  sums.forEach((sum) => {
    sum.text -= minCount;
  });
  const maxCount = Math.max(...sums.map((commit) => commit.text));

  sums.shift();
  const counts = sums.map((commit) => col((commit.text / maxCount) * 100, `${commit.text} (${commit.date}), +${commit.insertions} -${commit.deletions}`, 'count'));

  console.log(insertions.length, deletions.length, counts.length);

  return `<!doctype html>
  <html>
  <head>
    <style type="text/css">
      html,body{padding:0;margin:0;border:0;width:100%;height:100%}
      .counts{position:absolute;display:flex;width:100%;height:100%;align-items:flex-end;z-index:-1}
      .insertions{display:flex;width:100%;height:50%;align-items:flex-end}
      .deletions{display:flex;width:100%;height:50%;align-items:flex-start}
      .count{background:#aaf}
      .col{background:#afa;}
    </style>
  </head>
  <body>
    <div class="counts">${counts.join('')}</div>
    <div class="insertions">${insertions.join('')}</div><div class="deletions">${deletions.join('')}</div>
  </body>
  </html>`;
}

function writeFile(fileName, data) {
  fs.writeFile(fileName, data, 'utf8', () => console.log(`${fileName} written`));
}

module.exports = {
  getFirstCommitHash,
  getNthCommitHash,
  getCommits,
  groupIntoDays,
  siteHtml,
  writeFile
};
