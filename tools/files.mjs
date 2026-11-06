/**
 * Parcours de fichiers partagé par les outils de vérification.
 */
import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));

/**
 * Liste récursivement les fichiers d'un dossier.
 * @param {string} dir chemin relatif à la racine du dépôt
 * @returns {Promise<string[]>} chemins relatifs à la racine, avec des « / »
 */
export async function listFiles(dir) {
  const out = [];
  async function walk(abs) {
    let entries;
    try {
      entries = await readdir(abs, { withFileTypes: true });
    } catch (err) {
      if (err.code === 'ENOENT') return;
      throw err;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const child = join(abs, entry.name);
      if (entry.isDirectory()) await walk(child);
      else out.push(relative(ROOT, child).split(sep).join('/'));
    }
  }
  await walk(join(ROOT, dir));
  return out.sort();
}
