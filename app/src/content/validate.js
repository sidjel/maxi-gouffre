/**
 * Validation des données au chargement. Chaque problème nomme le fichier, l'élément et le champ.
 * Toutes les erreurs sont rassemblées avant de lever une seule DataError.
 * Après validation : plats dépliés en 3 stades, cartes et combats indexés par identifiant, tout est gelé.
 */
import { GAME } from '../config.js';
import { validateCards, validateCombats, validateQuickmatch } from './validateCards.js';
import { expandCards } from './expand.js';
import { crossCheck } from './crossCheck.js';

/** Erreur de données : liste de messages lisibles. */
export class DataError extends Error {
  /** @param {string[]} problems */
  constructor(problems) {
    super(`[MG] Données invalides :\n- ${problems.join('\n- ')}`);
    this.name = 'DataError';
    this.problems = problems;
  }
}

const STRING_KEY = /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ASSET_PATH = /^assets\/[a-z0-9_\-/]+\.[a-z0-9]+$/;
const CREDIT_FIELDS = ['file', 'author', 'source', 'license', 'date', 'usage'];

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** strings.json : objet plat { "zone.cle": "texte" }. */
function validateStrings(data, problems) {
  const where = 'data/strings.json';
  if (!isPlainObject(data)) {
    problems.push(`${where} : un objet { "cle": "texte" } est attendu`);
    return;
  }
  for (const [key, value] of Object.entries(data)) {
    if (!STRING_KEY.test(key)) problems.push(`${where} › clé "${key}" : format attendu "zone.cleEnCamelCase"`);
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`${where} › clé "${key}" : texte non vide attendu`);
    }
  }
}

/** credits.json : registre des assets (ARCHITECTURE.md §17). */
function validateCredits(data, problems) {
  const where = 'data/credits.json';
  if (!Array.isArray(data)) {
    problems.push(`${where} : une liste d'entrées est attendue`);
    return;
  }
  const seen = new Set();
  data.forEach((entry, i) => {
    const label = `${where} › élément ${i}${entry?.file ? ` (${entry.file})` : ''}`;
    if (!isPlainObject(entry)) {
      problems.push(`${label} : objet attendu`);
      return;
    }
    for (const field of CREDIT_FIELDS) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
        problems.push(`${label} › champ "${field}" : texte non vide attendu`);
      }
    }
    if (typeof entry.commercial !== 'boolean') problems.push(`${label} › champ "commercial" : true ou false attendu`);
    if (typeof entry.file === 'string') {
      if (!ASSET_PATH.test(entry.file)) problems.push(`${label} › champ "file" : chemin attendu sous assets/, en minuscules sans espace`);
      if (seen.has(entry.file)) problems.push(`${label} › champ "file" : fichier déjà enregistré`);
      seen.add(entry.file);
    }
    if (typeof entry.date === 'string' && !DATE.test(entry.date)) problems.push(`${label} › champ "date" : format AAAA-MM-JJ attendu`);
  });
}

const VALIDATORS = Object.freeze({
  strings: validateStrings,
  credits: validateCredits,
  cards: validateCards,
  combats: validateCombats,
  quickmatch: validateQuickmatch,
});

/** Forme utilisée par le jeu : cartes (plats dépliés) et combats indexés par identifiant. */
function prepare(raw) {
  const defs = { ...raw };
  if (raw.cards) defs.cards = expandCards(raw.cards, GAME.FUSED_STAGE3_RATIO);
  if (raw.combats) defs.combats = Object.fromEntries(raw.combats.map((c) => [c.id, c]));
  return defs;
}

/**
 * Valide toutes les données chargées.
 * @param {Record<string, unknown>} raw sortie de loadAll()
 * @returns {Record<string, any>} données prêtes pour le jeu, gelées
 * @throws {DataError}
 */
export function validateAll(raw) {
  const problems = [];
  for (const [key, data] of Object.entries(raw)) {
    const validator = VALIDATORS[key];
    if (!validator) {
      problems.push(`données "${key}" : aucun validateur`);
      continue;
    }
    validator(data, problems, GAME);
  }
  if (problems.length > 0) throw new DataError(problems);
  const defs = prepare(raw);
  const crossProblems = crossCheck(defs, GAME);
  if (crossProblems.length > 0) throw new DataError(crossProblems);
  return deepFreeze(defs);
}

function deepFreeze(obj) {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const v of Object.values(obj)) deepFreeze(v);
  }
  return obj;
}
