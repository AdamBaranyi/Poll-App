import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const MAX_LINES = 400;
const CHECKED_FOLDERS = 'src e2e scripts supabase';
const CHECKED_EXTENSIONS = ['.ts', '.html', '.scss', '.sql'];

/** Lists the tracked source files that fall under the line limit. */
function listSourceFiles(): string[] {
  const output = execSync(`git ls-files ${CHECKED_FOLDERS}`, { encoding: 'utf8' });
  return output
    .split('\n')
    .filter((file) => CHECKED_EXTENSIONS.some((extension) => file.endsWith(extension)));
}

/** Counts the lines of a file. */
function countLines(file: string): number {
  return readFileSync(file, 'utf8').trimEnd().split('\n').length;
}

const tooLongFiles = listSourceFiles().filter((file) => countLines(file) > MAX_LINES);

if (tooLongFiles.length > 0) {
  console.error(`Files with more than ${MAX_LINES} lines:\n${tooLongFiles.join('\n')}`);
  process.exit(1);
}
