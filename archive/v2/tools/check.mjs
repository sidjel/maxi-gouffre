#!/usr/bin/env node
/**
 * `npm run check` (ARCHITECTURE.md §3, §14) : validation des données, taille des fichiers,
 * recherches interdites, tests unitaires. Lancé aussi par GitHub Actions avant chaque publication.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { listFiles, ROOT } from './files.mjs';
import { validateData } from './validate-data.mjs';
import { checkSizes } from './check-size.mjs';
import { runUnitTests } from './test.mjs';
import { checkArt } from './art.mjs';

/**
 * Recherches interdites (ARCHITECTURE.md §19). Chaque règle : où chercher, quoi, pourquoi.
 * `except` : chemins (préfixes) où le motif est autorisé.
 */
const RULES = [
  {
    label: 'Math.random() dans le cœur pur (utiliser core/rng.js)',
    dirs: ['app/src/core', 'app/src/narrator'],
    pattern: /Math\.random\s*\(/,
  },
  {
    label: 'insertion HTML brute (utiliser textContent via ui/dom.js)',
    dirs: ['app/src'],
    pattern: /\b(innerHTML|outerHTML|insertAdjacentHTML)\b|document\.write\s*\(/,
  },
  {
    label: 'URL externe (le jeu ne fait aucun appel réseau externe)',
    dirs: ['app/src', 'app/css', 'app/index.html'],
    pattern: /\b(https?:)?\/\/[a-z0-9-]+\.[a-z]{2,}/i,
  },
  {
    label: 'lecture du clavier hors de app/src/input/',
    dirs: ['app/src'],
    except: ['app/src/input/'],
    pattern: /addEventListener\(\s*['"]key(down|up|press)['"]/,
  },
  {
    label: 'accès au stockage hors de SaveManager (app/src/save/, app/src/platform/storage/)',
    dirs: ['app/src'],
    except: ['app/src/save/', 'app/src/platform/storage/'],
    pattern: /\b(localStorage|sessionStorage|indexedDB)\b/,
  },
  {
    label: 'Canvas ou WebGL (affichage en DOM + CSS uniquement)',
    dirs: ['app/src', 'app/index.html'],
    pattern: /getContext\s*\(|<canvas\b|\bWebGL/i,
  },
  {
    label: 'style inline (seules les variables CSS sont permises)',
    dirs: ['app/src', 'app/index.html'],
    pattern: /\.style\.(?!setProperty\(\s*['"]--)[a-zA-Z]+\s*(=|\()|\sstyle\s*=\s*["']/,
  },
];

const SCANNED = /\.(m?js|css|html)$/;

async function filesOf(target) {
  if (SCANNED.test(target)) return [target];
  return (await listFiles(target)).filter((f) => SCANNED.test(f));
}

/** @returns {Promise<string[]>} problèmes trouvés */
export async function checkForbidden() {
  const problems = [];
  for (const rule of RULES) {
    for (const dir of rule.dirs) {
      for (const file of await filesOf(dir)) {
        if (rule.except?.some((prefix) => file.startsWith(prefix))) continue;
        const lines = (await readFile(join(ROOT, file), 'utf8')).split('\n');
        lines.forEach((line, i) => {
          if (rule.pattern.test(line)) problems.push(`${file}:${i + 1} : ${rule.label}`);
        });
      }
    }
  }
  return problems;
}

async function step(title, fn) {
  const problems = await fn();
  if (problems.length === 0) {
    console.log(`✓ ${title}`);
    return true;
  }
  console.error(`✗ ${title} : ${problems.length} problème(s)`);
  for (const p of problems) console.error(`    ${p}`);
  return false;
}

const results = [
  await step('Données et registre des assets', validateData),
  await step('Illustrations générées à jour (npm run art)', checkArt),
  await step('Taille des fichiers de code', checkSizes),
  await step('Recherches interdites', checkForbidden),
];

console.log('\nTests unitaires :');
const testCode = await runUnitTests();
results.push(testCode === 0);
console.log(testCode === 0 ? '✓ Tests unitaires' : '✗ Tests unitaires en échec');

const ok = results.every(Boolean);
console.log(ok ? '\nnpm run check : tout est vert.' : '\nnpm run check : ÉCHEC.');
process.exitCode = ok ? 0 : 1;
