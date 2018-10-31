const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  ignoredFolderNames: ['node_modules', 'polyfills', 'dist', 'build'],
  ignoredExtensions: ['gitignore', 'json', 'png', 'map'],
  startingCommitNr: 3,
  repos: [
    join('e:', 'projects', 'my-repo')
  ]
};
