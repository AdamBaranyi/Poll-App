import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const ROOT = 'dist/poll-app/browser';
const PORT = 4310;
const TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** Reads the headers that .htaccess sets on the live version. */
function readLiveHeaders(): [string, string][] {
  const rules = readFileSync(join(ROOT, '.htaccess'), 'utf8');
  const found = rules.matchAll(/Header always set (\S+) "([^"]*)"/g);
  return [...found].map(([, name, value]) => [name, value]);
}

/** Finds the file for an address, or index.html like the rewrite rule does. */
function findFile(url: string): string {
  const path = normalize(new URL(url, 'http://localhost').pathname).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, path);
  return existsSync(file) && statSync(file).isFile() ? file : join(ROOT, 'index.html');
}

const headers = readLiveHeaders();

createServer((request, response) => {
  const file = findFile(request.url ?? '/');
  for (const [name, value] of headers) response.setHeader(name, value);
  response.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
  response.end(readFileSync(file));
}).listen(PORT);
