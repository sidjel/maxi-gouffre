/**
 * Lecture des exemplaires de cartes pendant un match (GAME_DESIGN.md §7.1).
 * Cartes du joueur : dans game.collection (uid, cardId, âge). Cartes de l'IA : dans match.opponentCards,
 * avec un stade fixé par le combat (elles ne vieillissent jamais, GD §6.2).
 */
import { activeStage } from './time.js';

/**
 * Retrouve la case occupée par une carte, ou null.
 * @returns {{ camp: string, index: number, cell: object }|null}
 */
export function findCell(match, uid) {
  for (const camp of ['player', 'opponent']) {
    const index = match.board[camp].findIndex((c) => c?.uid === uid);
    if (index >= 0) return { camp, index, cell: match.board[camp][index] };
  }
  return null;
}

/**
 * Vue d'une carte à son stade actif : définition, stade, nom, P, effets, étiquettes (carte + stade).
 * @param {{ game: object, match: object }} state
 * @param {string} uid
 * @param {{ defs: { cards: Record<string, object> }, rules: object }} ctx
 */
export function cardView(state, uid, ctx) {
  const owned = state.game.collection.find((c) => c.uid === uid);
  const foe = owned ? null : state.match?.opponentCards[uid];
  if (!owned && !foe) throw new Error(`[MG] carte inconnue : ${uid}`);
  const cardId = owned ? owned.cardId : foe.cardId;
  const def = ctx.defs.cards[cardId];
  if (!def) throw new Error(`[MG] définition de carte inconnue : ${cardId}`);
  const placed = state.match ? findCell(state.match, uid) : null;
  const stage = owned ? activeStage(placed?.cell, def, owned.age, ctx.rules) : (placed?.cell.lockedStage ?? foe.stage);
  const s = def.stages[stage - 1];
  return {
    uid,
    cardId,
    owner: owned ? 'player' : 'opponent',
    age: owned ? owned.age : null,
    stage,
    stageLocked: Boolean(placed),
    def,
    name: s.name,
    power: s.power,
    placeable: s.placeable !== false,
    effects: s.effects,
    tags: [...def.tags, ...s.tags],
    flavor: s.flavor ?? null,
    image: s.image ?? null,
    finish: s.finish,
  };
}
