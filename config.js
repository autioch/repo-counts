const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  clocIgnored: ['JSON', 'XML', 'CSON', 'XSD', 'XAML', 'YAML', 'Puppet'],
  startingCommitNr: 3,
  invertSelection: false,
  repos: [
    join('e:', 'projects', 'serve-local')

    // join('e:', 'projects', 'charades'),
    // join('e:', 'projects', 'generator-qb'),
    // join('e:', 'projects', 'globes'),
    // join('e:', 'projects', 'math'),
    // join('e:', 'projects', 'movie-collector'),
    // join('e:', 'projects', 'Analyzer.Web')
  ]
};
