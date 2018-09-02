/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const groupsTemplate = require('./groupsTemplate');
const fs = require('fs');
const { join } = require('path');

function loadStyle(styleName) {
  return fs.readFileSync(`${join(__dirname, styleName)}.css`, 'utf8'); // eslint-disable-line no-sync
}

module.exports = function render(parsed) {
  const groupEls = groupsTemplate(parsed);

  return `<!doctype html>
  <html>
    <head>
      <style type="text/css">
      ${loadStyle('index')}
      </style>
    </head>
    <body>
      <div class="chart">${groupEls.join('\n')}</div>
    </body>
  </html>`;
};
