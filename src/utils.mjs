import child_process from 'child_process';
import { basename, extname } from 'path';
import ProgressBar from 'progress';
import { promisify } from 'util';

export function getBar(title, total) {
  const bar = new ProgressBar(`  ${title} [:bar] :current/:total :rate/s :etas`, {
    width: 40,
    total
  });

  return () => bar.tick();
}

const execOptions = {
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024
};

const exec = promisify(child_process.exec);

export async function command(commandString, cwd) {
  try {
    const { stdout, stderr } = await exec(commandString, { // eslint-disable-line no-unused-vars
      ...execOptions,
      cwd
    });

    return stdout.trim();
  } catch (err) { // eslint-disable-line no-unused-vars
    // console.log(`Failed to execute command ${commandString}`);

    // console.log(commandString);
    // console.log(err.message);

    return '';
  }
}

export function h(tagAndClassName, children, attributes = []) {
  const [tagName, className = ''] = tagAndClassName.split('.');
  const attrs = attributes.filter(Boolean).map(([key, value]) => value ? `${key}=${typeof value === 'string' ? `"${value}"` : value}` : key).join(' ');
  const tag = tagName || 'div';

  return `<${tag}${className ? ` class="${className}"` : ''}${attrs ? ` ${attrs}` : ''}>${Array.isArray(children) ? `\n${children.join('')}` : children}</${tag}>`;
}

export function getExt(fileName) {
  const ext = extname(fileName);

  // console.log(fileName, ext, basename(fileName, ext));

  return basename(fileName, ext).length && ext.length ? ext : 'other';
}

export function notSupported() {
  throw Error(`Not supported.`);
}

export function noop() {} // eslint-disable-line no-empty-function

export const colors = [
  '#999',
  '#9ff',
  '#99f',
  '#f9f',
  '#f99',
  '#ff9',
  '#9f9',
  '#fff'
];

// const AVAILABLE_COLORS = [
//   '#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff',
//   '#f99', '#9f9', '#99f', '#ff9', '#f9f', '#9ff'
// ];

export async function isDirGitRepository(dir) {
  try {
    await exec('git rev-parse --git-dir', { // eslint-disable-line no-unused-vars
      ...execOptions,
      cwd: dir
    });

    return true;
  } catch (err) { // eslint-disable-line no-unused-vars
    return false;
  }
}

export async function getValidRepos(repo) {
  const validRepos = [];

  for (let i = 0; i < repo.length; i++) {
    const isGitRepo = await isDirGitRepository(repo[i]);

    if (isGitRepo) {
      validRepos.push(repo[i]);
    } else {
      console.log(`Invalid git dir provided, skipping - ${repo[i]}`);
    }
  }

  return validRepos;
}
