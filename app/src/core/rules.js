/**
 * Règles d'une partie (ARCHITECTURE.md §4) : constantes de config.js + options qui les modifient.
 * Le cœur lit uniquement ctx.rules, jamais config.js.
 */

/**
 * Construit ctx.rules.
 * @param {Readonly<Record<string, any>>} game constantes GAME de config.js
 * @param {{ rotSpeed?: 'slow'|'normal'|'fast' }} [options]
 * @returns {Readonly<Record<string, any>>}
 */
export function buildRules(game, options = {}) {
  const speed = options.rotSpeed ?? 'normal';
  const stageLength = game.STAGE_LENGTH_OPTIONS[speed];
  if (!Number.isInteger(stageLength)) throw new RangeError(`[MG] rules : vitesse de pourrissement inconnue (${speed})`);
  return Object.freeze({
    ...game,
    STAGE_LENGTH: stageLength,
    AGE_MAX: 3 * stageLength - 1,
  });
}
