/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
const groupsTemplate = require('./groupsTemplate');
const legendsTemplate = require('./legendTemplate');
const fs = require('fs');
const { join } = require('path');

function loadStyle(styleName) {
  return fs.readFileSync(`${join(__dirname, styleName)}.css`, 'utf8'); // eslint-disable-line no-sync
}

module.exports = function render(groups, types, repos, ignored) {
  const groupEls = groupsTemplate(groups);
  const legendEls = legendsTemplate(types, repos, ignored);

  return `<!doctype html>
  <html>
    <head>
      <style type="text/css">
      ${loadStyle('index')}
      ${loadStyle('groups')}
      ${loadStyle('legend')}
      </style>
    </head>
    <body>
      <div class="legend">${legendEls}</div>
      <div class="chart">${groupEls.join('')}</div>
    </body>
  </html>`;
};
