/**
 * Fin de manche et fin de match (GD §9.6-9.7). Le plateau reste visible derrière.
 */
import { el } from '../dom.js';
import { totalPoints } from '../../core/match.js';

const btn = (text, action) => el('button', { className: 'btn btn-dialog', text, attrs: { type: 'button', 'data-action': action } });

function roundLines(t, m, opponent) {
  return el('ol', { className: 'dialog-rounds' }, m.roundScores.map((r, i) => el('li', {
    className: r.winner ? `is-${r.winner}` : 'is-draw',
    text: t('round.line', { round: i + 1, player: r.player, opponent: r.opponent, opponentName: opponent }),
  })));
}

/** @param {{ t: Function, opponentName: string }} opts */
export function createRoundEnd(opts) {
  const { t } = opts;
  const opponent = opts.opponentName;
  const title = el('h2', { className: 'dialog-title', attrs: { id: 'round-title' } });
  const body = el('div', { className: 'dialog-body' });
  const actions = el('div', { className: 'dialog-actions' });
  const dialog = el('section', { className: 'dialog dialog-round', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'round-title' } }, [title, body, actions]);
  const root = el('div', { className: 'overlay overlay-light', attrs: { hidden: true, 'data-dialog': 'round' } }, [dialog]);

  function showRound(m) {
    const r = m.roundScores.at(-1);
    title.textContent = t('round.title', { round: m.round });
    const outcome = { player: 'round.win', opponent: 'round.lose' }[r.winner] ?? 'round.draw';
    body.replaceChildren(
      el('p', { className: 'dialog-score', text: t('round.score', { player: r.player, opponent: r.opponent, opponentName: opponent }) }),
      el('p', { className: 'dialog-text', text: t(outcome) }),
      el('p', { className: 'dialog-small', text: m.nextStarter === 'player' ? t('round.starterYou') : t('round.starterThem', { opponent }) }),
    );
    actions.replaceChildren(btn(t('round.next'), 'nextRound'));
  }

  function showMatch(m) {
    const won = m.result.winner === 'player';
    title.textContent = t(won ? 'match.victory' : 'match.defeat');
    const total = totalPoints(m);
    const how = {
      rounds: t('match.byRounds', { player: m.wins.player, opponent: m.wins.opponent }),
      points: t('match.byPoints', { player: total.player, opponent: total.opponent }),
      cards: t('match.byCards', { player: m.hands.player.length, opponent: m.hands.opponent.length }),
      chifoumi: t('match.byChifoumi'),
    }[m.result.by];
    body.replaceChildren(
      el('p', { className: 'dialog-score', text: how }),
      roundLines(t, m, opponent),
      el('p', { className: 'dialog-text', text: t(won ? 'match.lineWin' : 'match.lineLose', { opponent }) }),
    );
    actions.replaceChildren(btn(t('match.again'), 'again'), btn(t('match.toTitle'), 'toTitle'));
  }

  return {
    el: root,

    /** @param {{ match: object }} vm */
    update(vm) {
      const m = vm.match;
      const visible = m.phase === 'roundOver' || m.phase === 'matchOver';
      root.hidden = !visible;
      dialog.classList.toggle('is-match', m.phase === 'matchOver');
      dialog.classList.toggle('is-victory', m.phase === 'matchOver' && m.result.winner === 'player');
      root.dataset.dialog = m.phase === 'matchOver' ? 'match' : 'round';
      if (m.phase === 'roundOver') showRound(m);
      else if (m.phase === 'matchOver') showMatch(m);
    },
  };
}
