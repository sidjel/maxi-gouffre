#!/usr/bin/env node
/**
 * Serveur statique local sur app/ (ARCHITECTURE.md §3).
 * `npm run serve` → http://localhost:8080, et http://IP-du-PC:8080 depuis un téléphone sur le même Wi-Fi.
 * Sans dépendance. Exporté aussi pour les tests navigateur (port 0 = port libre au hasard).
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_DIR = resolve(fileURLToPath(new URL('../app/', import.meta.url)));
const DEFAULT_PORT = 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.txt': 'text/plain; charset=utf-8',
};

async function handle(req, res, root, base) {
  const url = new URL(req.url, 'http://localhost');
  let path = decodeURIComponent(url.pathname);
  // `base` imite un sous-dossier, comme /maxi-gouffre/ sur GitHub Pages.
  if (!path.startsWith(base)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable');
    return;
  }
  path = `/${path.slice(base.length)}`;
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(root, path));
  // Interdit de sortir du dossier app/.
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end('Interdit');
    return;
  }
  try {
    const info = await stat(file);
    if (info.isDirectory()) {
      res.writeHead(301, { Location: `${url.pathname}/` }).end();
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable');
  }
}

/**
 * Démarre le serveur.
 * @param {{ port?: number, host?: string, root?: string, base?: string }} [opts]
 * @returns {Promise<{ server: import('node:http').Server, port: number, close: () => Promise<void> }>}
 */
export function startServer({ port = DEFAULT_PORT, host = '0.0.0.0', root = APP_DIR, base = '/' } = {}) {
  const server = createServer((req, res) => {
    handle(req, res, root, base).catch((err) => {
      console.error('[MG] serve :', err);
      res.writeHead(500).end();
    });
  });
  return new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      resolvePromise({
        server,
        port: server.address().port,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

function lanAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => a.address);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const { port: actual } = await startServer({ port });
  console.log(`MAXI-GOUFFRE servi depuis ${APP_DIR}`);
  console.log(`  PC        : http://localhost:${actual}`);
  for (const ip of lanAddresses()) console.log(`  Téléphone : http://${ip}:${actual}  (même Wi-Fi)`);
  console.log('  Debug     : ajoute ?debug=1 à l\'adresse');
  console.log('Ctrl+C pour arrêter.');
}
