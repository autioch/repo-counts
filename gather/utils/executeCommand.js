const { execSync } = require('child_process');
const { objToCli, logRepoError } = require('./misc');

const execSyncOptions = {
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024
};

function buildCommand(parts) {
  const preparedParts = parts.map((part) => {
    if (typeof part === 'string') {
      return part;
    }
    if (typeof part === 'object') {
      return objToCli(part);
    }
    throw Error('Unkown part type for executeCommand');
  });

  return preparedParts.join(' ');
}

module.exports = function executeCommand(...parts) {
  const command = buildCommand(parts);
  let result = '';

  try {
    result = execSync(command, execSyncOptions).toString();
  } catch (err) {
    logRepoError('Failed to execute command', err, {
      folder: command
    });
  }

  return result;
};
