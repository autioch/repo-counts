const {
  ignoredFolderNames = [], ignoredExtensions = [],
  clocPath = '', startingCommitNr = 3, repos: rawRepos, rawInfoDetails
} = require('../config');
const { clone } = require('./utils');
const languages = require('./languages');

if (!clocPath) {
  throw Error('Invalid `clocPath` in config. Please specify path to perl cloc.');
}

const AVAILABLE_COLORS = [
  '#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff',
  '#f99', '#9f9', '#99f', '#ff9', '#f9f', '#9ff'
];

const REPO_DEFAULTS = {
  folder: '',
  repoName: '',
  ignoredFolderNames: [],
  ignoredExtensions: [],
  color: false
};

/* Fill in missing properties for the repo configurations. */
const repos = rawRepos.map((rawRepo) => {
  const config = Object.assign(clone(REPO_DEFAULTS), typeof rawRepo === 'object' ? rawRepo : {
    folder: rawRepo
  });

  config.ignoredExtensions = config.ignoredExtensions.concat(ignoredExtensions);
  config.ignoredFolderNames = config.ignoredFolderNames.concat(ignoredFolderNames);

  if (!config.folder) {
    throw Error('Missing `folder` in repo configuration. ');
  }

  if (!config.repoName) {
    config.repoName = config.folder.split(config.folder.includes('/') ? '/' : '\\').pop();
  }

  return config;
});

/* Collect already assigned colors. Check for duplicated colors. */
const usedColors = {};

repos.forEach((config) => {
  if (config.color) {
    if (usedColors[config.color]) {
      throw Error(`${config.folder} uses already used color ${config.color}`);
    }
    usedColors[config.color] = true;
  }
});

const availableColors = AVAILABLE_COLORS.filter((color) => !usedColors[color]);

/* Assign missing colors. */
repos
  .filter((config) => !config.color)
  .forEach((config, index) => {
    config.color = availableColors[index % availableColors.length];
  });

module.exports = {
  clocPath,
  startingCommitNr,
  rawInfoDetails,
  repos,
  languages
};
