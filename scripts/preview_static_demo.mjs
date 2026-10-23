import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(projectRoot, 'dist');
const basePath = '/ERP_DAIRY/';
const port = Number(process.env.PORT || 4173);
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (request, response) => {
  const path = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname;
  if (!path.startsWith(basePath)) {
    response.writeHead(404).end('Not found');
    return;
  }

  let relativePath;
  try {
    relativePath = decodeURIComponent(path.slice(basePath.length));
  } catch {
    response.writeHead(400).end('Invalid path');
    return;
  }
  const candidate = resolve(distRoot, relativePath || 'index.html');
  if (candidate !== distRoot && !candidate.startsWith(`${distRoot}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  let filePath = candidate;
  try {
    if ((await stat(filePath)).isDirectory()) filePath = resolve(filePath, 'index.html');
    const content = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mime[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    }).end(content);
  } catch {
    // Client-side app navigation has no URL routes; refreshes under the project
    // base should still receive the same application shell.
    if (!path.startsWith(basePath)) {
      response.writeHead(404).end('Not found');
      return;
    }
    try {
      const shell = await readFile(resolve(distRoot, 'index.html'));
      response.writeHead(200, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-store' }).end(shell);
    } catch {
      response.writeHead(500).end('Static demo build is missing; run npm run build:demo first.');
    }
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Static DairyOS preview: http://127.0.0.1:${port}${basePath}`);
});
