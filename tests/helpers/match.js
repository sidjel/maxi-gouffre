/**
 * Fabriques d'états de match pour les tests unitaires (ARCHITECTURE.md §2, tests/helpers/).
 */
import { loadAll } from '../../app/src/content/loader.js';
import { validateAll } from '../../app/src/content/validate.js';
import { GAME } from '../../app/src/config.js';
import { buildRules } from '../../app/src/core/rules.js';
import { createMatch, setStarter } from '../../app/src/core/match.js';
import { seedFrom } from '../../app/src/core/rng.js';
import { nodeFetcher } from './data.js';

let cached = null;

/** Données réelles de app/data/, chargées une fois. */
export async function loadDefs() {
  cached ??= validateAll(await loadAll(nodeFetcher()));
  return cached;
}

/** Contexte { defs, rules } avec les vraies données. */
export async function makeCtx(options) {
  return { defs: await loadDefs(), rules: buildRules(GAME, options) };
}

/**
 * Match sur mesure, en phase chifoumi.
 * @param {object} ctx
 * @param {{ player?: { card: string, age?: number }[], opponent?: { card: string, stage?: number }[], rules?: string[], seed?: number }} spec
 * @returns {{ state: object, ctx: object }} ctx enrichi du combat de test
 */
export function makeMatch(ctx, spec) {
  const combat = {
    id: 'test',
    opponent: 'Testeur',
    handBudget: 0,
    rules: spec.rules ?? [],
    hand: (spec.opponent ?? []).map((h) => ({ card: h.card, stage: h.stage ?? 1 })),
    startingBoard: [],
  };
  const testCtx = { ...ctx, defs: { ...ctx.defs, combats: { ...ctx.defs.combats, test: combat } } };
  const collection = (spec.player ?? []).map((h, i) => ({ uid: `c${String(i + 1).padStart(3, '0')}`, cardId: h.card, age: h.age ?? 0 }));
  const seed = spec.seed ?? 1;
  const game = { version: 1, seed, rng: seedFrom(seed), clock: 0, collection, nextUid: collection.length + 1, fridgeUnlocked: false, fridge: [] };
  const { state } = createMatch(game, 'test', collection.map((c) => c.uid), testCtx);
  return { state, ctx: testCtx };
}

/** Saute le chifoumi : le joueur l'a gagné et choisit `starter`. */
export function startPlay(state, ctx, starter = 'player') {
  const s = structuredClone(state);
  s.match.chifoumiWinner = 'player';
  s.match.phase = 'starter';
  return setStarter(s, 'player', starter, ctx);
}
