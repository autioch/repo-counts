import child_process from 'child_process';
import ProgressBar from 'progress';
import { promisify } from 'util';

export function getBar(title, total) {
  const bar = new ProgressBar(`  ${title} [:bar] :current/:total :rate/s :etas`, {
    width: 40,
    total
  });

  return () => bar.tick();
}

const exec = promisify(child_process.exec);
const execOptions = {
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024
};

export async function command(commandString, cwd) {
  try {
    const { stdout, stderr } = await exec(commandString, { // eslint-disable-line no-unused-vars
      ...execOptions,
      cwd
    });

    return stdout.trim();
  } catch (err) {
    false && console.log(`Failed to execute command`, commandString, '\n', err.message);

    return '';
  }
}

export async function isDirGitRepository(dir) {
  try {
    await exec('git rev-parse --git-dir', { // eslint-disable-line no-unused-vars
      cwd: dir
    });

    return true;
  } catch (err) { // eslint-disable-line no-unused-vars
    return false;
  }
}
