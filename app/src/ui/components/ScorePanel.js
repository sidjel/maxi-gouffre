/**
 * Panneau gauche (GD §17.5) : scores en direct, manches gagnées (2 pastilles par joueur),
 * numéro de manche, main adverse (nombre de cartes seulement), camps qui ont passé.
 */
import { el } from '../dom.js';

/** @param {{ t: Function, rules: object, opponentName: string, flags: object }} opts */
export function createScorePanel(opts) {
  const { t, rules } = opts;
  const toWin = opts.flags.singleRound ? 1 : rules.ROUNDS_TO_WIN;
  const maxRounds = opts.flags.singleRound ? 1 : rules.MAX_ROUNDS;

  const side = (camp, name) => {
    const pips = Array.from({ length: toWin }, () => el('span', { className: 'pip' }));
    const refs = {
      score: el('output', { className: 'score-value', attrs: { 'data-score': camp, 'aria-live': 'polite' } }),
      pips,
      passed: el('span', { className: 'score-passed', text: t('combat.passed'), attrs: { hidden: true } }),
      hand: el('span', { className: 'score-hand' }),
      wins: el('span', { className: 'score-pips' }, pips),
    };
    refs.el = el('section', { className: `score-side score-${camp}`, attrs: { 'aria-label': name } }, [
      el('h2', { className: 'score-name', text: name }),
      el('p', { className: 'score-meta' }, [refs.wins, refs.passed]),
      refs.score,
      refs.hand,
    ]);
    return refs;
  };

  const foe = side('opponent', opts.opponentName);
  const me = side('player', t('combat.you'));
  const round = el('p', { className: 'score-round', attrs: { 'data-round': '' } });
  const root = el('aside', { className: 'panel panel-left', attrs: { 'aria-label': t('combat.scoresLabel') } }, [foe.el, round, me.el]);

  return {
    el: root,

    /** @param {{ match: object, score: { player: number, opponent: number } }} vm */
    update(vm) {
      const m = vm.match;
      for (const [camp, refs] of [['player', me], ['opponent', foe]]) {
        refs.score.textContent = String(vm.score[camp]);
        refs.pips.forEach((p, i) => p.classList.toggle('is-won', i < m.wins[camp]));
        refs.wins.setAttribute('aria-label', t('combat.winsLabel', { wins: m.wins[camp] }));
        refs.passed.hidden = !(m.phase === 'play' && m.passed[camp]);
        refs.hand.textContent = t('combat.handCount', { count: m.hands[camp].length });
        refs.el.classList.toggle('is-turn', m.phase === 'play' && m.turn === camp);
      }
      round.textContent = t('combat.roundLabel', { round: Math.min(m.round, maxRounds), max: maxRounds });
    },
  };
}
