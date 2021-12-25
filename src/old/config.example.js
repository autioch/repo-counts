const { join } = require('path');

module.exports = {
  clocPath: join(__dirname, 'node_modules', 'cloc', 'lib', 'cloc'),
  ignoredFolderNames: ['node_modules', 'polyfills', 'dist', 'build'],
  ignoredExtensions: [
    'json', 'map',
    'png', 'jpg', 'ico',
    'gitignore', 'gitattributes', 'editorconfig', 'browserslistrc'
  ],
  rawInfoDetails: false,
  startingCommitNr: 1,
  repos: [
    join('e:', 'projects', 'my-repo'),
    {
      folder: join('e:', 'projects', 'my-repo'),
      repoName: 'My repo',
      ignoredFolderNames: [],
      ignoredExtensions: [],
      color: '#0f0'
    }
  ]
};
