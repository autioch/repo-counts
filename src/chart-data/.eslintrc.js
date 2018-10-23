module.exports = {
  extends: 'qb',
  plugins: ['react'],
  parserOptions: {
    ecmaVersion: 2017,
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-console': ['off'],
    'no-inline-comments': ['off'],
    'no-magic-numbers': ['off'],
    'line-comment-position': ['off'],
    'id-blacklist': ['off'],
    'id-length': ['off'],
    'no-undefined': ['off'],
    'no-underscore-dangle': ['off'],
    'class-methods-use-this': ['off'],
  }
};
