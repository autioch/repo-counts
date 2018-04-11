module.exports = {
  extends: 'qb',
  "parser": "babel-eslint",
  ecmaFeatures: {
    experimentalObjectRestSpread: true
  },
  rules: {
    'no-console': ['off'],
    'no-inline-comments': ['off'],
    'line-comment-position': ['off'],
    'id-blacklist': ['off'],
    'no-undefined': ['off']
  }
};
