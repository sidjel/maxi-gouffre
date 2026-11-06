/**
 * Puissances effectives et scores (GAME_DESIGN.md §20.3-20.4).
 * J1 : les effets sont présents dans les données mais pas encore résolus. Chaque carte compte sa P
 * de base ; les boosts, malus de zone, transferts et bonus de score arrivent au jalon J2.
 * Valeurs dérivées : recalculées à la demande, jamais stockées (ARCHITECTURE.md §4).
 */
import { cardView } from './cards.js';
import { SIDES } from './board.js';

/**
 * @param {{ game: object, match: object }} state
 * @param {{ defs: object, rules: object }} ctx
 * @returns {{ cards: Record<string, { power: number, effectActive: boolean, inactiveReason: string|null }>,
 *             score: { player: number, opponent: number } }}
 */
export function evaluate(state, ctx) {
  const cards = {};
  const score = {};
  for (const camp of SIDES) {
    let total = 0;
    for (const cell of state.match.board[camp]) {
      if (cell === null) continue;
      const view = cardView(state, cell.uid, ctx);
      const power = view.power + (cell.transferBonus ?? 0);
      cards[cell.uid] = { power, effectActive: false, inactiveReason: null };
      total += power;
    }
    score[camp] = Math.max(ctx.rules.SCORE_FLOOR, total);
  }
  return { cards, score };
}
