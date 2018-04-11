const ignored = require('../../ignored');
const repos = require('../../repos');

module.exports = function legendTemplate(types) {
  const serieEls = repos.map((repo) => `<div class="serie">
    <div class="serie__box" style="background-color:${repo.color}"></div>
    <div>${repo.repoName}</div>
  </div>`);

  return `<div>Included types: ${types.join(', ')}</div>
    <div>Ignored types: ${ignored.join(', ')}</div>
    ${serieEls.join('')}`;
};
