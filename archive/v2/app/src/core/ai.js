/**
 * IA adverse (GAME_DESIGN.md §10). J1 : niveau « Découverte » (Noob) seulement ; « Gamer » arrive au J2.
 * L'IA ne voit jamais la main du joueur. Son hasard vient de la graine de la partie (game.rng).
 */
import { int, pick } from './rng.js';
import { SIDES, legalCells } from './board.js';
import { evaluate } from './effects.js';
import { playCard, pass, setStarter } from './match.js';

const AI = 'opponent';

function assertLevel(level) {
  if (level !== 'noob') throw new Error(`[MG] ai : niveau inconnu ou pas encore disponible (${level})`);
}

/**
 * Choisit un coup. Noob : passe si sa main est vide ou s'il mène de AI_NOOB_PASS_LEAD points ou plus ;
 * sinon une carte posable au hasard, sur une case légale au hasard (GD §10.1).
 * @returns {{ value: { type: 'play', uid: string, cell: number, choice: null } | { type: 'pass' }, rngState: number }}
 */
export function chooseMove(state, level, ctx, rngState) {
  assertLevel(level);
  const m = state.match;
  const passMove = { value: { type: 'pass' }, rngState };
  if (m.hands[AI].length === 0) return passMove;
  const { score } = evaluate(state, ctx);
  if (score[AI] - score.player >= ctx.rules.AI_NOOB_PASS_LEAD) return passMove;
  const playable = m.hands[AI]
    .map((uid) => ({ uid, cells: legalCells(state, AI, uid, ctx).cells }))
    .filter((c) => c.cells.length > 0);
  if (playable.length === 0) return passMove;
  const card = pick(rngState, playable);
  const cell = pick(card.rngState, card.value.cells);
  return { value: { type: 'play', uid: card.value.uid, cell: cell.value, choice: null }, rngState: cell.rngState };
}

/**
 * Choisit qui commence quand l'IA a gagné le chifoumi. Noob : au hasard (GD §9.2).
 * @returns {{ value: 'player'|'opponent', rngState: number }}
 */
export function chooseStarter(state, level, ctx, rngState) {
  assertLevel(level);
  const r = int(rngState, SIDES.length);
  return { value: SIDES[r.value], rngState: r.rngState };
}

/** Action pure : l'IA joue son tour (pose ou passe), en consommant la graine de la partie. */
export function playTurn(state, ctx) {
  const level = state.match.level;
  const { value: move, rngState } = chooseMove(state, level, ctx, state.game.rng);
  const next = { ...state, game: { ...state.game, rng: rngState } };
  return move.type === 'pass' ? pass(next, AI, ctx) : playCard(next, AI, move.uid, move.cell, move.choice, ctx);
}

/** Action pure : l'IA, gagnante du chifoumi, choisit qui commence. */
export function decideStarter(state, ctx) {
  const { value: starter, rngState } = chooseStarter(state, state.match.level, ctx, state.game.rng);
  const next = { ...state, game: { ...state.game, rng: rngState } };
  return setStarter(next, AI, starter, ctx);
}
