#!/usr/bin/env node
/**
 * Lance les tests unitaires (`npm test`) : node --test sur chaque tests/unit/*.test.js.
 * La liste est construite ici pour fonctionner de la même façon sous Windows, macOS et Linux,
 * quelle que soit la version de Node ≥ 20.
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listFiles, ROOT } from './files.mjs';

/** @returns {Promise<number>} code de sortie */
export async function runUnitTests() {
  const files = (await listFiles('tests/unit')).filter((f) => f.endsWith('.test.js'));
  if (files.length === 0) {
    console.error('✗ Aucun test unitaire trouvé dans tests/unit/');
    return 1;
  }
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, ['--test', '--test-reporter=spec', ...files], { cwd: ROOT, stdio: 'inherit' });
    child.on('close', (code) => resolvePromise(code ?? 1));
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runUnitTests();
}
