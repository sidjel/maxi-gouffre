/**
 * Chargement des données du jeu sous Node, avec le même loader que le navigateur.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DATA_DIR = fileURLToPath(new URL('../../app/data/', import.meta.url));

/** Fetcher Node : lit un fichier de app/data/. */
export function nodeFetcher(dir = DATA_DIR) {
  return (file) => readFile(join(dir, file), 'utf8');
}

/** Fetcher en mémoire : { 'strings.json': '...texte...' }. */
export function memoryFetcher(files) {
  return async (file) => {
    if (!(file in files)) throw new Error('fichier absent');
    return files[file];
  };
}
