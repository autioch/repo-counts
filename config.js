const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  ignored: ['JSON', 'XML', 'CSON', 'XSD', 'XAML', 'YAML', 'Puppet'],
  repos: [
    // {
    //   folder: join('e:', 'projects', 'movie-collector'),
    //   repoName: 'Movie collector',
    //   color: '#00e'
    // },
    {
      folder: join('e:', 'projects', 'Analyzer.Web'),
      repoName: 'analyzer-web',
      color: '#e00'
    }

    // {
    //   folder: join('e:', 'projects', 'serve-local'),
    //   repoName: 'serve-local',
    //   color: '#0e0'
    // }
  ]
};
