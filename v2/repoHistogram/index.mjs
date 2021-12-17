import executeCommand from '../executeCommand.mjs';

const trim = i => i.trim()

export async function repoHistogram(repoPath) {
  const emptyRepoHash = await executeCommand('git hash-object -t tree /dev/null', repoPath);
  // const countedLines = await executeCommand('git diff --numstat ' + emptyRepoHash, repoPath);

  // const files = countedLines.trim().split('\n')
    // .map(line => line.trim().split('\t').map(trim).filter(Boolean))
    // .map(([a,d,n]) => [n,parseInt(a, 10)]);


  // return files;

  const countedLines = await executeCommand('git diff --shortstat ' + emptyRepoHash, repoPath);
  const [files, insertions]= countedLines.split(',');
  const [fileCount] = files.trim().split(' ');
  const [lineCount] = insertions.trim().split(' ');

  return [fileCount, lineCount];
}
