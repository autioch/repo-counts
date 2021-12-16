import executeCommand from './executeCommand.mjs';

export default async function getRepoRoot() {
  return executeCommand('git rev-parse --show-toplevel');
}
