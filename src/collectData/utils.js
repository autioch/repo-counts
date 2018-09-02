const { execSync } = require('child_process');

function optionsToCli(options) {
  return Object
    .entries(options)
    .reduce((arr, [key, val]) => {
      const value = val === undefined ? '' : `=${val}`; // eslint-disable-line no-undefined

      return arr.concat(`--${key}${value}`);
    }, [])
    .join(' ');
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const execSyncOptions = {
  stdio: ['ignore', 'pipe', 'pipe']
};

function executeCommand(...parts) {
  const preparedParts = parts.map((part) => {
    if (typeof part === 'string') {
      return part;
    }
    if (typeof part === 'object') {
      return optionsToCli(part);
    }
    throw Error('Unkown part type for executeCommand');
  });

  const command = preparedParts.join(' ');

  const result = execSync(command, execSyncOptions);

  // TODO Secure this

  return result;
}

module.exports = {
  optionsToCli,
  clone,
  executeCommand
};
