import { promisify } from 'util';
import child_process from 'child_process';

const exec = promisify(child_process.exec);

const execSyncOptions = {
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024
};

export default async function executeCommand(commandStr, cwd) {
  const { stdout, stderr } = await exec(commandStr, {
    ...execSyncOptions,
    cwd
  });

  return stdout.trim();
};
