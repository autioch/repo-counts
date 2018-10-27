export default function parseHistogram(repos) {
  const legend = Object.entries(repos).map(([id, repo]) => ({
    id,
    label: repo.config.repoName,
    color: repo.config.color
  }));

  return legend;
}
