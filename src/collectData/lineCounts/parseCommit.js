const MILISECOND = 1000;

module.exports = function parseCommit(commitText) {
  const [description, modifications] = commitText.trim().split('\n');
  const [hash, datetime, text, authorName, emailName] = description.split(';');
  const [, deletions = 0] = /([0-9]+) deletions/.exec(modifications) || [];
  const [, insertions = 0] = /([0-9]+) insertions/.exec(modifications) || [];
  const [date] = new Date(datetime * MILISECOND).toISOString().split('T');
  const [year, month, day] = date.split('-');

  return {
    hash,
    text,
    authorName,
    emailName,
    date,
    year,
    month: parseInt(month, 10).toString(),
    day: parseInt(day, 10).toString(),
    insertions: parseInt(insertions, 10),
    deletions: parseInt(deletions, 10),
    filesChanged: parseInt(modifications, 10)
  };
};
