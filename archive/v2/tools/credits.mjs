#!/usr/bin/env node
/**
 * Génère docs/CREDITS.md depuis app/data/credits.json (registre unique des assets).
 * `npm run credits`. npm run check vérifie que le fichier généré est à jour.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const CREDITS_JSON = resolve(ROOT, 'app/data/credits.json');
export const CREDITS_MD = resolve(ROOT, 'docs/CREDITS.md');

const cell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');

/**
 * Texte Markdown du registre.
 * @param {Array<Record<string, unknown>>} entries
 */
export function renderCredits(entries) {
  const lines = [
    '# MAXI-GOUFFRE — Crédits et registre des assets',
    '',
    '> Fichier généré par `npm run credits` depuis `app/data/credits.json`. Ne pas modifier à la main.',
    '',
    '| Fichier | Auteur | Source | Licence | Usage commercial | Date | Usage |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const e of entries) {
    lines.push(`| \`${cell(e.file)}\` | ${cell(e.author)} | ${cell(e.source)} | ${cell(e.license)} | ${e.commercial ? 'oui' : 'non'} | ${cell(e.date)} | ${cell(e.usage)} |`);
  }
  lines.push('');
  return lines.join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entries = JSON.parse(await readFile(CREDITS_JSON, 'utf8'));
  await writeFile(CREDITS_MD, renderCredits(entries));
  console.log(`docs/CREDITS.md régénéré (${entries.length} assets).`);
}
