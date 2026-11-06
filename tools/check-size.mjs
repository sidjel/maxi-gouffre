#!/usr/bin/env node
/**
 * Taille des fichiers de code : moins de 300 lignes chacun (ARCHITECTURE.md §0.4), JSON exclus.
 */
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listFiles, ROOT } from './files.mjs';

export const MAX_LINES = 300;
const CODE_EXT = /\.(m?js|css|html)$/;
const DIRS = ['app', 'tools', 'tests'];

/** @returns {Promise<string[]>} problèmes trouvés */
export async function checkSizes() {
  const problems = [];
  for (const dir of DIRS) {
    for (const file of await listFiles(dir)) {
      if (!CODE_EXT.test(file)) continue;
      const text = await readFile(join(ROOT, file), 'utf8');
      const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
      if (lines >= MAX_LINES) problems.push(`${file} : ${lines} lignes (maximum ${MAX_LINES - 1}), à découper`);
    }
  }
  return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const problems = await checkSizes();
  for (const p of problems) console.error(`✗ ${p}`);
  console.log(problems.length === 0 ? `✓ Tous les fichiers de code font moins de ${MAX_LINES} lignes` : `${problems.length} fichier(s) trop long(s)`);
  process.exitCode = problems.length === 0 ? 0 : 1;
}
