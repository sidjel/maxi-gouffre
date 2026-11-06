/**
 * Journal console unique : toutes les erreurs du jeu sont préfixées [MG] (ARCHITECTURE.md §4).
 */

const PREFIX = '[MG]';

/** Erreur : jamais silencieuse. */
export function logError(...args) {
  console.error(PREFIX, ...args);
}

/** Avertissement. */
export function logWarn(...args) {
  console.warn(PREFIX, ...args);
}
