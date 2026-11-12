/**
 * Déroulement d'une manche (GAME_DESIGN.md §9.4-9.7) : à qui le tour, passe automatique,
 * fin de manche, manche suivante, fin de match et départage en cascade.
 * Fonctions internes au cœur : elles modifient la copie d'état que leur passe match.js.
 */
import { other, legalMoves } from './board.js';
import { evaluate } from './effects.js';

/**
 * Résultat du match, ou null s'il continue (GD §9.7, §20.5).
 * @returns {{ winner: 'player'|'opponent', by: 'rounds'|'points'|'cards'|'chifoumi' }|null}
 */
export function matchOutcome(m, rules) {
  const toWin = m.flags.singleRound ? 1 : rules.ROUNDS_TO_WIN;
  const maxRounds = m.flags.singleRound ? 1 : rules.MAX_ROUNDS;
  if (m.wins.player >= toWin) return { winner: 'player', by: 'rounds' };
  if (m.wins.opponent >= toWin) return { winner: 'opponent', by: 'rounds' };
  if (m.roundScores.length < maxRounds) return null;
  const total = totalPoints(m);
  if (total.player !== total.opponent) return { winner: total.player > total.opponent ? 'player' : 'opponent', by: 'points' };
  const left = { player: m.hands.player.length, opponent: m.hands.opponent.length };
  if (left.player !== left.opponent) return { winner: left.player > left.opponent ? 'player' : 'opponent', by: 'cards' };
  return { winner: m.chifoumiWinner, by: 'chifoumi' };
}

/** Gagnant du match, ou null s'il continue. */
export function matchWinner(m, rules) {
  return matchOutcome(m, rules)?.winner ?? null;
}

/** Somme des scores finaux de chaque manche jouée. */
export function totalPoints(m) {
  return m.roundScores.reduce(
    (acc, r) => ({ player: acc.player + r.player, opponent: acc.opponent + r.opponent }),
    { player: 0, opponent: 0 },
  );
}

/** Compte une action et applique le garde-fou contre les boucles sans fin (GD §9.12). */
export function countAction(m, rules) {
  m.actionsThisRound += 1;
  if (m.actionsThisRound > rules.MAX_ACTIONS_PER_ROUND) {
    throw new Error(`[MG] garde-fou : plus de ${rules.MAX_ACTIONS_PER_ROUND} actions dans la manche ${m.round}`);
  }
}

/**
 * Donne la main au bon camp : saute un camp qui a passé, fait passer automatiquement
 * un camp sans coup possible (GD §9.4), et clôt la manche quand les deux ont passé.
 */
export function settleTurn(state, ctx, events) {
  const m = state.match;
  for (;;) {
    if (m.passed.player && m.passed.opponent) {
      closeRound(state, ctx, events);
      return;
    }
    if (m.passed[m.turn]) {
      m.turn = other(m.turn);
      continue;
    }
    if (legalMoves(state, m.turn, ctx).length === 0) {
      m.passed[m.turn] = true;
      countAction(m, ctx.rules);
      events.push({ type: 'PLAYER_PASSED', side: m.turn, auto: true });
      continue;
    }
    return;
  }
}

/** Les deux camps ont passé : on note le score, le gagnant de la manche, puis la fin éventuelle du match. */
function closeRound(state, ctx, events) {
  const m = state.match;
  const { score } = evaluate(state, ctx);
  let winner = null;
  if (score.player !== score.opponent) winner = score.player > score.opponent ? 'player' : 'opponent';
  m.roundScores.push({ player: score.player, opponent: score.opponent, winner });
  if (winner) m.wins[winner] += 1;
  // Le perdant commence la manche suivante ; manche nulle : celui qui n'avait pas commencé (GD §9.6).
  m.nextStarter = winner ? other(winner) : other(m.starter);
  m.turn = null;
  events.push({ type: 'ROUND_ENDED', round: m.round, score, winner });
  const outcome = matchOutcome(m, ctx.rules);
  if (outcome) {
    m.phase = 'matchOver';
    m.result = outcome;
    events.push({ type: 'MATCH_ENDED', ...outcome, wins: { ...m.wins }, total: totalPoints(m) });
  } else {
    m.phase = 'roundOver';
  }
}

/** Ouvre une manche : le camp qui commence a la main. */
export function openRound(state, ctx, events) {
  const m = state.match;
  m.phase = 'play';
  m.turn = m.starter;
  m.actionsThisRound = 0;
  events.push({ type: 'ROUND_STARTED', round: m.round, starter: m.starter });
  settleTurn(state, ctx, events);
}

/** Vide le plateau : chaque carte va dans la défausse de son propriétaire. Aucune repioche (GD §9.6). */
export function clearBoard(m) {
  for (const camp of ['player', 'opponent']) {
    for (const cell of m.board[camp]) if (cell) m.discard[cell.owner].push(cell.uid);
    m.board[camp] = m.board[camp].map(() => null);
  }
}
