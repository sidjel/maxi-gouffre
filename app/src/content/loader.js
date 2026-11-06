import { DataError } from './validate.js';

/**
 * Fichiers de données chargés au démarrage (dossier app/data/).
 * La clé est le nom sous lequel la donnée est rangée dans `defs`.
 * La liste s'allonge au fil des jalons.
 */
export const DATA_FILES = Object.freeze({
  strings: 'strings.json',
  credits: 'credits.json',
  cards: 'cards.json',
  combats: 'combats.json',
  quickmatch: 'quickmatch.json',
});

/**
 * Charge tous les fichiers de données. Même code dans le navigateur et sous Node :
 * seul le `fetcher` change (fetch d'un côté, fs de l'autre).
 * @param {(file: string) => Promise<string>} fetcher renvoie le texte brut du fichier
 * @param {Record<string, string>} [files]
 * @returns {Promise<Record<string, unknown>>} données brutes, à valider ensuite
 */
export async function loadAll(fetcher, files = DATA_FILES) {
  const entries = await Promise.all(
    Object.entries(files).map(async ([key, file]) => {
      let text;
      try {
        text = await fetcher(file);
      } catch (err) {
        throw new DataError([`data/${file} : lecture impossible (${err.message})`]);
      }
      try {
        return [key, JSON.parse(text)];
      } catch (err) {
        throw new DataError([`data/${file} : JSON invalide (${err.message})`]);
      }
    }),
  );
  return Object.fromEntries(entries);
}

/**
 * Fabrique un fetcher pour le navigateur. Les chemins sont relatifs à ce module,
 * pour fonctionner à la racine d'un serveur comme dans /maxi-gouffre/ sur GitHub Pages.
 * @param {string} baseUrl URL du dossier data/ (se termine par /)
 */
export function browserFetcher(baseUrl) {
  return async (file) => {
    const res = await fetch(new URL(file, baseUrl), { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  };
}
