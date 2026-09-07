import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((request, response) => {
  const requestedPath = decodeURIComponent(request.url.split('?')[0]);

  // 1. Redirecionamento de links antigos /react para a raiz /
  if (requestedPath === '/react' || requestedPath === '/react/') {
    response.writeHead(302, { Location: '/' });
    response.end();
    return;
  }
  if (requestedPath.startsWith('/react/')) {
    const nextPath = requestedPath.slice('/react'.length);
    response.writeHead(302, { Location: nextPath || '/' });
    response.end();
    return;
  }

  // 2. Ambiente de Contingência Legado em /legado/
  if (requestedPath === '/legado' || requestedPath === '/legado/') {
    const filePath = path.resolve(root, 'index.html');
    serveFile(filePath, response);
    return;
  }
  if (requestedPath.startsWith('/legado/')) {
    const legacyAsset = requestedPath.slice('/legado/'.length);
    const filePath = path.resolve(root, legacyAsset);
    serveFile(filePath, response);
    return;
  }

  // 3. Rota Oficial React na Raiz (/)
  let relativePath = '';
  if (requestedPath === '/' || requestedPath === '/index.html') {
    relativePath = 'react-dist/react-index.html';
  } else if (requestedPath.startsWith('/assets/')) {
    relativePath = `react-dist${requestedPath}`;
  } else {
    // Check if file exists in react-dist or root
    const checkDist = path.resolve(root, 'react-dist', requestedPath.replace(/^\/+/, ''));
    if (fs.existsSync(checkDist) && !fs.statSync(checkDist).isDirectory()) {
      relativePath = `react-dist/${requestedPath.replace(/^\/+/, '')}`;
    } else {
      const checkRoot = path.resolve(root, requestedPath.replace(/^\/+/, ''));
      if (fs.existsSync(checkRoot) && !fs.statSync(checkRoot).isDirectory()) {
        relativePath = requestedPath.replace(/^\/+/, '');
      } else {
        // SPA Fallback to React index
        relativePath = 'react-dist/react-index.html';
      }
    }
  }

  const filePath = path.resolve(root, relativePath);
  serveFile(filePath, response);
});

function serveFile(filePath, response) {
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(content);
  });
}

server.listen(port, '127.0.0.1', () => {
  console.log(`PainelPro React (Oficial) disponível em http://127.0.0.1:${port}/`);
  console.log(`PainelPro Legado (Contingência) disponível em http://127.0.0.1:${port}/legado/`);
});
