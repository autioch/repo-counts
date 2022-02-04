module.exports = {
  'extends': 'qb',
  env: {
    node: true
  },
  plugins: ['simple-import-sort'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    // requireConfigFile: false,
    ecmaVersion: 2021,
    sourceType: 'module',
    impliedStrict: true,
    babelOptions: {
      configFile: require('path').join(__dirname, '.babelrc.json')
    }
  },
  rules: {
    'id-length': ['off'],
    'max-len': ['off'],
    'id-blacklist': ['off'],
    'no-plusplus': ['off'],
    'line-comment-position': ['off'],
    'no-inline-comments': ['off'],
    'no-magic-numbers': ['off'],
    'no-return-assign': ['off'],
    camelcase: ['off'],
    'no-console': ['off'],
    'no-sync': ['off'],
    'no-confusing-arrow': ['off'],
    'no-await-in-loop': ['off'],
    'no-unused-expressions': ['off'],
    'newline-per-chained-call': ['off'],

    'simple-import-sort/imports': ['warn', {
      groups: [
        ['^[^.]'], // node modules, global imports
        ['^\\.'], // local imports
        ['^'] // any other imports (e.g. './styles')
      ]
    }],
    'simple-import-sort/exports': ['off']
  }
};
