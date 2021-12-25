const { executeCommand, writeFile } = require('./utils');
const { clocPath } = require('../config');
const qbLog = require('qb-log')('simple');
const { join } = require('path');

function parseLanguage(line) {
  const info = /(.+) +\((.+)\)/ig.exec(line);
  const [, language = '', extensions = ''] = info;

  return {
    language: language.trim(),
    extensions: extensions.split(',').map((ext) => ext.trim().toLowerCase())
  };
}

const results = executeCommand(`perl ${clocPath} --json --show-lang`);
const infos = results.split('\n').filter((line) => !!line).map((line) => parseLanguage(line));
const dict = {};

infos.forEach((info) => info.extensions.forEach((ext) => {
  dict[ext] = info.language;
}));

writeFile(join('..', '..', 'languages.json'), dict).then(() => qbLog.empty('DONE'));
