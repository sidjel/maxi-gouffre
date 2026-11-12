/**
 * Validation de cards.json, combats.json et quickmatch.json (ARCHITECTURE.md §7).
 * Chaque problème nomme le fichier, l'élément et le champ.
 */

const ID = /^[a-z][a-z0-9_]*$/;
const ASSET = /^assets\/[a-z0-9_\-/]+\.[a-z0-9]+$/;

/** Étiquettes connues (GD §7.2), en identifiants ASCII. */
export const TAGS = Object.freeze([
  'aliment', 'boisson', 'humain', 'animal', 'vegetal', 'objet', 'plat',
  'outil', 'surgele', 'malus', 'monstre', 'horreur', 'fermentation',
]);

/** Effets de la liste fermée (GD §8.2). TRANSFORM est réservé et refusé en V1. */
export const EFFECTS = Object.freeze([
  'DESTROY_FACING', 'DESTROY_ADJACENT', 'ZONE_MALUS', 'CANCEL', 'CANCEL_FACING',
  'BOOST', 'SCORE_BONUS', 'PANIC', 'TRANSFER', 'EAT',
]);

/** Finitions des cartes (DIRECTION_ARTISTIQUE.md §2.3). */
export const FINISHES = Object.freeze(['matte', 'promo', 'limited', 'greasy']);

/** Règles spéciales de combat (GD §9.11). */
export const COMBAT_RULES = Object.freeze(['singleRound', 'guided', 'noLoot', 'overtime']);

const BOOST_SCOPES = ['neighbors', 'backRow'];
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isStage = (v) => v === 1 || v === 2 || v === 3;
const text = (v) => typeof v === 'string' && v.trim() !== '';

function checkTags(tags, where, problems) {
  if (!Array.isArray(tags)) {
    problems.push(`${where} › champ "tags" : liste attendue`);
    return;
  }
  for (const t of tags) if (!TAGS.includes(t)) problems.push(`${where} › champ "tags" : étiquette inconnue "${t}"`);
}

function checkEffects(effects, where, problems) {
  if (!Array.isArray(effects)) {
    problems.push(`${where} › champ "effects" : liste attendue`);
    return;
  }
  effects.forEach((e, i) => {
    const at = `${where} › effet ${i}`;
    if (!isObj(e) || !EFFECTS.includes(e.type)) {
      problems.push(`${at} › champ "type" : effet inconnu "${e?.type}" (liste fermée du GD §8.2)`);
      return;
    }
    if (e.type === 'BOOST' && !BOOST_SCOPES.includes(e.scope)) problems.push(`${at} › champ "scope" : "neighbors" ou "backRow" attendu`);
    if (e.type === 'SCORE_BONUS' && !(Number.isInteger(e.value) && e.value > 0)) problems.push(`${at} › champ "value" : entier positif attendu`);
    if (e.condition !== undefined && !(isObj(e.condition) && isStage(e.condition.stage))) problems.push(`${at} › champ "condition" : { "stage": 1, 2 ou 3 } attendu`);
    if (e.type === 'EAT' && !(isObj(e.target) && text(e.target.family) && isStage(e.target.stage))) problems.push(`${at} › champ "target" : { "family", "stage" } attendu`);
  });
}

function checkLook(obj, where, problems) {
  if (!FINISHES.includes(obj.finish)) problems.push(`${where} › champ "finish" : ${FINISHES.join(', ')} attendu`);
  if (obj.image !== null && !(typeof obj.image === 'string' && ASSET.test(obj.image))) problems.push(`${where} › champ "image" : null ou chemin sous assets/ attendu`);
  if (obj.flavor !== undefined && !text(obj.flavor)) problems.push(`${where} › champ "flavor" : texte non vide attendu`);
}

function checkStage(s, where, problems) {
  if (!isObj(s)) {
    problems.push(`${where} : objet attendu`);
    return;
  }
  if (!text(s.name)) problems.push(`${where} › champ "name" : texte non vide attendu`);
  if (s.placeable !== undefined && typeof s.placeable !== 'boolean') problems.push(`${where} › champ "placeable" : true ou false attendu`);
  if (s.placeable === false) {
    if (s.power !== null) problems.push(`${where} › champ "power" : null attendu pour un stade non posable`);
  } else if (!Number.isInteger(s.power)) {
    problems.push(`${where} › champ "power" : entier attendu`);
  }
  checkEffects(s.effects, where, problems);
  checkTags(s.tags, where, problems);
  checkLook(s, where, problems);
}

/** cards.json : 20 cartes à 3 stades et des plats sur une ligne. */
export function validateCards(data, problems) {
  const file = 'data/cards.json';
  if (!Array.isArray(data)) {
    problems.push(`${file} : une liste de cartes est attendue`);
    return;
  }
  const seen = new Set();
  data.forEach((c, i) => {
    const where = `${file} › élément ${i}${c?.id ? ` (${c.id})` : ''}`;
    if (!isObj(c)) {
      problems.push(`${where} : objet attendu`);
      return;
    }
    if (typeof c.id !== 'string' || !ID.test(c.id)) problems.push(`${where} › champ "id" : identifiant ASCII en minuscules attendu`);
    else if (seen.has(c.id)) problems.push(`${where} › champ "id" : identifiant déjà utilisé`);
    seen.add(c.id);
    if (typeof c.family !== 'string' || !ID.test(c.family)) problems.push(`${where} › champ "family" : identifiant ASCII en minuscules attendu`);
    checkTags(c.tags, where, problems);
    if (c.dish === true) {
      if (!c.tags?.includes('plat')) problems.push(`${where} › champ "tags" : un plat porte l'étiquette "plat"`);
      if (!text(c.name)) problems.push(`${where} › champ "name" : texte non vide attendu`);
      if (!Number.isInteger(c.power)) problems.push(`${where} › champ "power" : entier attendu`);
      checkEffects(c.effects, where, problems);
      checkLook(c, where, problems);
      return;
    }
    if (!Array.isArray(c.stages) || c.stages.length !== 3) {
      problems.push(`${where} › champ "stages" : 3 stades attendus`);
      return;
    }
    c.stages.forEach((s, k) => checkStage(s, `${where} › stade ${k + 1}`, problems));
    // Outil : non posable aux stades 1 et 2, et seulement eux (GD §7.2).
    const tool = c.tags?.includes('outil');
    c.stages.forEach((s, k) => {
      const shouldPlace = !(tool && k < 2);
      if ((s?.placeable !== false) !== shouldPlace) {
        problems.push(`${where} › stade ${k + 1} › champ "placeable" : ${shouldPlace ? 'posable attendu' : 'false attendu (Outil)'}`);
      }
    });
  });
}

/** combats.json : adversaire, budget, règles spéciales, main au stade fixé. */
export function validateCombats(data, problems, game) {
  const file = 'data/combats.json';
  if (!Array.isArray(data)) {
    problems.push(`${file} : une liste de combats est attendue`);
    return;
  }
  const seen = new Set();
  data.forEach((c, i) => {
    const where = `${file} › élément ${i}${c?.id ? ` (${c.id})` : ''}`;
    if (!isObj(c)) {
      problems.push(`${where} : objet attendu`);
      return;
    }
    if (typeof c.id !== 'string' || !ID.test(c.id)) problems.push(`${where} › champ "id" : identifiant ASCII en minuscules attendu`);
    else if (seen.has(c.id)) problems.push(`${where} › champ "id" : identifiant déjà utilisé`);
    seen.add(c.id);
    if (!text(c.opponent)) problems.push(`${where} › champ "opponent" : texte non vide attendu`);
    if (!Number.isInteger(c.handBudget)) problems.push(`${where} › champ "handBudget" : entier attendu`);
    if (!Array.isArray(c.rules) || c.rules.some((r) => !COMBAT_RULES.includes(r))) problems.push(`${where} › champ "rules" : liste parmi ${COMBAT_RULES.join(', ')} attendue`);
    if (!Array.isArray(c.hand) || c.hand.length === 0 || c.hand.length > game.HAND_SIZE) {
      problems.push(`${where} › champ "hand" : 1 à ${game.HAND_SIZE} cartes attendues`);
    } else {
      c.hand.forEach((h, k) => {
        if (!isObj(h) || !text(h.card) || !isStage(h.stage)) problems.push(`${where} › main ${k} : { "card", "stage": 1, 2 ou 3 } attendu`);
      });
    }
    if (!Array.isArray(c.startingBoard)) problems.push(`${where} › champ "startingBoard" : liste attendue`);
  });
}

/** quickmatch.json : main du joueur et combat du « Combat rapide ». */
export function validateQuickmatch(data, problems, game) {
  const file = 'data/quickmatch.json';
  if (!isObj(data)) {
    problems.push(`${file} : un objet est attendu`);
    return;
  }
  if (!text(data.combat)) problems.push(`${file} › champ "combat" : identifiant de combat attendu`);
  if (data.level !== 'noob') problems.push(`${file} › champ "level" : "noob" attendu (seul niveau du jalon J1)`);
  if (!Array.isArray(data.hand) || data.hand.length === 0 || data.hand.length > game.HAND_SIZE) {
    problems.push(`${file} › champ "hand" : 1 à ${game.HAND_SIZE} cartes attendues`);
    return;
  }
  data.hand.forEach((h, k) => {
    if (!isObj(h) || !text(h.card) || !Number.isInteger(h.age) || h.age < 0 || h.age > game.AGE_MAX) {
      problems.push(`${file} › main ${k} : { "card", "age": 0 à ${game.AGE_MAX} } attendu`);
    }
  });
}
