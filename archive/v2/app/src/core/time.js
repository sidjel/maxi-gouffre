/**
 * Âge et stade des cartes (GAME_DESIGN.md §6, §20.1-20.2).
 * J1 : calcul du stade seulement. Le temps qui avance (crans) arrive au jalon J2.
 */

const SURGELE = 'surgele';

/**
 * Stade (1, 2 ou 3) d'une carte d'après son âge.
 * @param {{ tags: string[] }} def définition de la carte
 * @param {number} age
 * @param {{ STAGE_LENGTH: number, SURGELE_FRESH_MULT: number, SURGELE_RIPE_LENGTH: number }} rules
 * @returns {1|2|3}
 */
export function stageOf(def, age, rules) {
  const L = rules.STAGE_LENGTH;
  if (def.tags.includes(SURGELE)) {
    const fresh = rules.SURGELE_FRESH_MULT * L;
    if (age < fresh) return 1;
    if (age < fresh + rules.SURGELE_RIPE_LENGTH) return 2;
    return 3;
  }
  return 1 + Math.min(2, Math.floor(age / L));
}

/**
 * Stade utilisé : celui verrouillé dans la case si la carte est posée, sinon celui de l'âge.
 * @param {{ lockedStage: number }|null|undefined} cell
 * @param {{ tags: string[] }} def
 * @param {number} age
 * @param {object} rules
 */
export function activeStage(cell, def, age, rules) {
  return cell?.lockedStage ?? stageOf(def, age, rules);
}
