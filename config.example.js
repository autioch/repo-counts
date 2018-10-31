const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  ignoredFolderNames: ['node_modules', 'polyfills', 'dist'],
  ignoredExtensions: ['gitignore', 'json'],
  startingCommitNr: 3,
  repos: [
    join('e:', 'projects', 'my-repo')
  ]
};
