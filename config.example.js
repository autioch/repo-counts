const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  clocIgnored: ['JSON', 'XML', 'CSON', 'XSD', 'XAML', 'YAML', 'Puppet'],
  startingCommitNr: 3,
  repos: [
    join('e:', 'projects', 'my-repo')
  ]
};
