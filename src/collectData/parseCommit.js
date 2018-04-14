const MILISECOND = 1000;

module.exports = function parseCommit(commitText) {
  const [description, modifications] = commitText.trim().split('\n');
  const [hash, datetime, text, authorName, emailName] = description.split(';');
  const [, deletions = 0] = /([0-9]+) deletions/.exec(modifications) || [];
  const [, insertions = 0] = /([0-9]+) insertions/.exec(modifications) || [];

  return {
    hash,
    text,
    authorName,
    emailName,
    date: new Date(datetime * MILISECOND).toISOString().split('T')[0],
    insertions: parseInt(insertions, 10),
    deletions: parseInt(deletions, 10),
    filesChanged: parseInt(modifications, 10)
  };
};

module.exports.PRETTY = 'format:"%H;%at;%s;%an;%ae"';
