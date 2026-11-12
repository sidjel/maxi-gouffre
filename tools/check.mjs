/**
 * Vérifications rapides (npm run check, avant les tests et la construction) :
 * - fichiers de code de moins de 300 lignes ;
 * - aucune ressource externe ni appel réseau dans le jeu (pas d'http(s):// hors espace de noms SVG, pas de fetch).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const MAX_LINES = 300;
const errors = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const code = ['src', 'tools', 'tests'].flatMap((d) => walk(join(root, d))).filter((f) => /\.(m?js|css)$/.test(f));
for (const f of code) {
  const n = readFileSync(f, 'utf8').split('\n').length;
  if (n > MAX_LINES) errors.push(`${relative(root, f)} : ${n} lignes (max ${MAX_LINES})`);
}

const game = [join(root, 'index.html'), ...walk(join(root, 'src')), ...walk(join(root, 'public')).filter((f) => /\.(svg|html|css|js|json)$/.test(f))];
const ALLOWED = ['http://www.w3.org/2000/svg'];
for (const f of game) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/https?:\/\/[^\s"'`)<>]+/g)) {
    if (!ALLOWED.some((a) => m[0].startsWith(a))) errors.push(`${relative(root, f)} : adresse externe ${m[0]}`);
  }
  if (/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(text) && f.includes('/src/')) errors.push(`${relative(root, f)} : appel réseau interdit`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} problème(s) :\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${code.length} fichiers de code sous ${MAX_LINES} lignes, aucune ressource externe.`);
