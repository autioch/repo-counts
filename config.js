const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  ignored: ['JSON', 'XML', 'CSON', 'XSD', 'XAML', 'YAML', 'Puppet'],
  repos: [{
    folder: join('e:', 'projects', 'generator-qb'),
    repoName: 'generator-qb',
    color: '#00e'
  }]
};
