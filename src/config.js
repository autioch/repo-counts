const {
  clocPath = '',
  clocIgnored = [],
  chartData = true,
  collectData = true,
  invertSelection = false,
  startingCommitNr = 3,
  repos
} = require('../config');

if (!clocPath) {
  throw Error('Invalid `clocPath` in config. Please specify path to perl cloc.');
}
const { clone } = require('./utils');

const AVAILABLE_COLORS = [
  '#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff',
  '#f99', '#9f9', '#99f', '#ff9', '#f9f', '#9ff'
];

function prepareRepos(rawRepos) {
  const REPO_DEFAULTS = {
    folder: '', // required
    repoName: '',
    extensions: ['js', 'scss', 'sass', 'css', 'tpl', 'html', 'md'],
    ignoredFolderNames: ['node_modules'],
    collectCount: true,
    collectInfo: true,
    color: false
  };

  const configs = rawRepos.map((rawRepo) => {
    const repoConfig = typeof rawRepo === 'object' ? rawRepo : {
      folder: rawRepo
    };

    const config = Object.assign(clone(REPO_DEFAULTS), repoConfig);

    if (!config.folder) {
      throw Error('Missing `folder` in repo configuration. ');
    }

    if (!config.repoName) {
      const separator = config.folder.includes('/') ? '/' : '\\';

      config.repoName = config.folder.split(separator).pop().replace(/\./gi, ' ');
    }

    return config;
  });

  const usedColors = configs.reduce((obj, config) => {
    if (config.color) {
      if (obj[config.color]) {
        throw Error(`${config.folder} uses already used color ${config.color}`);
      }
      obj[config.color] = true;
    }

    return obj;
  }, {});

  const availableColors = AVAILABLE_COLORS.filter((color) => !usedColors[color]);
  const uncoloredConfigs = configs.filter((config) => !config.color);
  const availableCount = availableColors.length;

  uncoloredConfigs.forEach((config, index) => {
    config.color = availableColors[index % availableCount];
  });

  if (invertSelection) {
    configs.forEach((config) => {
      config.collectCount = !config.collectCount;
      config.collectInfo = !config.collectInfo;
    });
  }

  return configs;
}

module.exports = {
  clocPath,
  clocIgnored,
  chartData,
  collectData,
  startingCommitNr,
  repos: prepareRepos(repos)
};
