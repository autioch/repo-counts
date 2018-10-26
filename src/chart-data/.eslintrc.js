module.exports = {
  "extends": [
    "react-app",
    "qb"
  ],
  root: true,
  // plugins: ['react'],
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


// module.exports = {
//   "extends": [
//     "react-app",
//     "qb"
//   ],
//   rules: {
//     'no-magic-numbers': ['error', {
//       ignore: [0, 1, 10, 500]
//     }],
//     'id-length': ['off'],
//     'no-unused-vars': ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
//     'id-blacklist': ['off'],
//     'no-process-env': ['off'],
//     'no-inline-comments': ['off'],
//     'line-comment-position': ['off'],
//     'jsx-a11y/href-no-hash': ['off']
//   }
// };
