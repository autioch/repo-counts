const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  ignored: ['JSON', 'XML', 'CSON', 'XSD', 'XAML', 'YAML', 'Puppet'],
  repos: [
    {
      folder: join('e:', 'projects', 'charades'),
      repoName: 'Charades'
    },
    {
      folder: join('e:', 'projects', 'generator-qb'),
      repoName: 'Generator QB'
    },
    {
      folder: join('e:', 'projects', 'globes'),
      repoName: 'Globes'
    },
    {
      folder: join('e:', 'projects', 'math'),
      repoName: 'Math'
    },
    {
      folder: join('e:', 'projects', 'movie-collector'),
      repoName: 'Movie collector'
    }
  ]
};
