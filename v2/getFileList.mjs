import executeCommand from './executeCommand.mjs';

export default async function getFileList() {
  const list = await executeCommand('git ls-tree -r master --name-only --full-tree');

  const fileList = list.trim().split('\n');

  return fileList;
}
