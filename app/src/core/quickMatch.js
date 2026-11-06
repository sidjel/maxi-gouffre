/**
 * Combat rapide depuis le titre (ARCHITECTURE.md §18, J1) : une partie minimale
 * dont la Collection est la main décrite dans data/quickmatch.json, contre le combat qui y est nommé.
 */
import { seedFrom } from './rng.js';
import { createMatch } from './match.js';

/**
 * @param {number} seed graine de la partie
 * @param {{ defs: { quickmatch: object, combats: object, cards: object }, rules: object }} ctx
 * @returns {{ state: { game: object, match: object }, events: object[] }}
 */
export function createQuickMatch(seed, ctx) {
  const quick = ctx.defs.quickmatch;
  const collection = quick.hand.map((h, i) => ({ uid: `c${String(i + 1).padStart(3, '0')}`, cardId: h.card, age: h.age }));
  const game = {
    version: 1,
    seed,
    rng: seedFrom(seed),
    clock: 0,
    collection,
    nextUid: collection.length + 1,
    fridgeUnlocked: false,
    fridge: [],
  };
  return createMatch(game, quick.combat, collection.map((c) => c.uid), ctx, { level: quick.level });
}
