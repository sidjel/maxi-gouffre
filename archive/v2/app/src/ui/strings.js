import { logError } from '../app/log.js';

const VARIABLE = /\{([a-zA-Z0-9_]+)\}/g;

/**
 * Crée la fonction de traduction à partir de data/strings.json.
 * Une clé absente est une erreur journalisée : la clé s'affiche à la place du texte.
 * @param {Record<string, string>} table
 * @returns {(key: string, vars?: Record<string, string|number>) => string}
 */
export function createStrings(table) {
  return function t(key, vars) {
    const text = table[key];
    if (typeof text !== 'string') {
      logError(`texte manquant dans data/strings.json : "${key}"`);
      return key;
    }
    if (!vars) return text;
    return text.replace(VARIABLE, (match, name) => (name in vars ? String(vars[name]) : match));
  };
}
