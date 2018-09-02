module.exports = {
  extends: 'qb',
  ecmaFeatures: {
    experimentalObjectRestSpread: true
  },
  "parserOptions": {
      "ecmaVersion": 2017
  },
  rules: {
    'no-console': ['off'],
    'no-inline-comments': ['off'],
    'no-magic-numbers': ['off'],
    'line-comment-position': ['off'],
    'id-blacklist': ['off'],
    'no-undefined': ['off']
  }
};
