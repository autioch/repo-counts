const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  clocIgnored: ['JSON', 'XML', 'CSON', 'XSD', 'XAML', 'YAML', 'Puppet'],
  invertSelection: false,
  repos: [
    join('e:', 'projects', 'serve-local')

    // {
    //   folder: join('e:', 'projects', 'charades'),
    //   repoName: 'Charades'
    // },
    // {
    //   folder: join('e:', 'projects', 'serve-local'),
    //   repoName: 'Serve local'
    // },
    // {
    //   folder: join('e:', 'projects', 'generator-qb'),
    //   repoName: 'Generator QB'
    // },
    // {
    //   folder: join('e:', 'projects', 'globes'),
    //   repoName: 'Globes'
    // },
    // {
    //   folder: join('e:', 'projects', 'math'),
    //   repoName: 'Math'
    // },
    // {
    //   folder: join('e:', 'projects', 'movie-collector'),
    //   repoName: 'Movie collector'
    // },
    // {
    //   folder: join('e:', 'projects', 'Analyzer.Web'),
    //   repoName: 'Analyzer Web',
    //   color: '#0f0'
    // }
  ]
};
