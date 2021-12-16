import executeCommand from './executeCommand.mjs';
import { relative, basename, extname, dirname } from 'path';

function parseLine(lineInfo) {
  if (!lineInfo) {
    return [];
  }

  const [, authorWithBracket = '', date, lineDetails = ''] = lineInfo.split('\t').map((item) => item.trim());
  const author = authorWithBracket.slice(1).trim().toLowerCase();
  const bracketIndex = lineDetails.indexOf(')');
  const contents = bracketIndex > 0 ? lineDetails.slice(bracketIndex + 1).trim() : '';

  return date ? [date, author, contents.length] : false;
};


export default async function getFileInfo(filePath) {
  const fileContents = await executeCommand(`git blame --date=short -c "${filePath}"`);
  const lines = fileContents.trim().split('\n').map(parseLine).filter(Boolean);

  return [filePath, lines];
};
