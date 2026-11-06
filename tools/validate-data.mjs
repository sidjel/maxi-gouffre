#!/usr/bin/env node
/**
 * Validation des données (app/data/) et du registre des assets.
 * - chaque fichier JSON passe la validation du jeu (même code que dans le navigateur) ;
 * - chaque asset de app/assets/ est enregistré dans credits.json, et chaque entrée existe ;
 * - docs/CREDITS.md est à jour ;
 * - chaque clé de texte citée dans app/src/ existe dans strings.json.
 */
import { readFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../app/src/content/loader.js';
import { validateAll, DataError } from '../app/src/content/validate.js';
import { nodeFetcher } from '../tests/helpers/data.js';
import { listFiles, ROOT } from './files.mjs';
import { renderCredits, CREDITS_MD } from './credits.mjs';

/** Extensions considérées comme des assets (les licences .txt accompagnent les polices). */
const ASSET_EXT = /\.(woff2?|ttf|otf|webp|png|jpe?g|gif|svg|ogg|mp3|wav)$/i;
const STRING_LITERAL = /'([a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9.]*)'/g;

/** @returns {Promise<string[]>} problèmes trouvés */
export async function validateData() {
  const problems = [];
  let defs;
  try {
    defs = validateAll(await loadAll(nodeFetcher()));
  } catch (err) {
    if (err instanceof DataError) return err.problems;
    throw err;
  }

  // Registre des assets, dans les deux sens.
  const registered = new Set(defs.credits.map((e) => e.file));
  for (const file of registered) {
    try {
      await access(join(ROOT, 'app', file));
    } catch {
      problems.push(`data/credits.json › ${file} : fichier introuvable dans app/`);
    }
  }
  for (const file of await listFiles('app/assets')) {
    const rel = file.replace(/^app\//, '');
    if (ASSET_EXT.test(rel) && !registered.has(rel)) {
      problems.push(`${file} : asset absent du registre app/data/credits.json`);
    }
  }

  let md = '';
  try {
    md = await readFile(CREDITS_MD, 'utf8');
  } catch {
    // absent : signalé ci-dessous
  }
  if (md !== renderCredits(defs.credits)) problems.push('docs/CREDITS.md n\'est pas à jour : lancer npm run credits');

  // Clés de texte citées dans le code.
  const zones = new Set(Object.keys(defs.strings).map((k) => k.split('.')[0]));
  for (const file of await listFiles('app/src')) {
    const text = await readFile(join(ROOT, file), 'utf8');
    for (const [, key] of text.matchAll(STRING_LITERAL)) {
      if (zones.has(key.split('.')[0]) && !(key in defs.strings)) {
        problems.push(`${file} : texte "${key}" absent de data/strings.json`);
      }
    }
  }
  return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const problems = await validateData();
  for (const p of problems) console.error(`✗ ${p}`);
  console.log(problems.length === 0 ? '✓ Données valides' : `${problems.length} problème(s) dans les données`);
  process.exitCode = problems.length === 0 ? 0 : 1;
}
