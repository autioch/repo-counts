module.exports = function legendTemplate(types, repos, ignored) {
  const serieEls = repos.map((repo) => `<div class="serie">
    <div class="serie__box" style="background-color:${repo.color}"></div>
    <div>${repo.repoName}: +${repo.insertions} -${repo.deletions} (${repo.diff})</div>
  </div>`);

  return `<div>Included types: ${types.join(', ')}</div>
    <div>Ignored types: ${ignored.join(', ')}</div>
    ${serieEls.join('')}`;
};