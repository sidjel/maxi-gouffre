/**
 * Écran de combat (GD §9, §17.5) : plateau, main, panneaux, chifoumi, fins de manche et de match.
 * L'écran ne connaît pas les règles : il lit l'état, demande les cases légales au cœur
 * et passe chaque décision à Session. Pose au pointeur : toucher une carte, puis une case légale.
 */
import { el } from '../dom.js';
import { evaluate } from '../../core/effects.js';
import { legalCells, isMalus } from '../../core/board.js';
import { cardView } from '../../core/cards.js';
import { THROWS } from '../../core/match.js';
import { createBoard } from '../components/Board.js';
import { createHand } from '../components/Hand.js';
import { createScorePanel } from '../components/ScorePanel.js';
import { createInfoBand } from '../components/InfoBand.js';
import { createActionBar } from '../components/ActionBar.js';
import { createChifoumi } from '../components/Chifoumi.js';
import { createRoundEnd } from '../components/RoundEnd.js';
import { createFlights } from '../components/Flight.js';

export function createCombatScreen() {
  let ctx = null;
  let root = null;
  let parts = null;
  let offs = [];
  let aiTimer = null;
  let ui = null;

  const state = () => ctx.session.state;
  const coreCtx = () => ctx.session.ctx;
  const myTurn = (m) => m.phase === 'play' && m.turn === 'player';
  const chifoumiOpen = (m) => m.phase === 'chifoumi' || m.phase === 'starter' || ui.awaitingGo;

  function legalFor(m) {
    if (!ui.selected || !myTurn(m)) return null;
    return legalCells(state(), 'player', ui.selected, coreCtx());
  }

  function statusText(m, legal) {
    const { t } = ctx;
    const opponent = parts.opponentName;
    if (chifoumiOpen(m)) return t('combat.statusChifoumi');
    if (m.phase !== 'play') return '';
    if (m.turn === 'opponent') return m.passed.player ? t('combat.statusYouPassed', { opponent }) : t('combat.statusOpponent', { opponent });
    if (ui.selected) {
      const view = cardView(state(), ui.selected, coreCtx());
      if (legal.cells.length === 0) return t('combat.statusNoCell', { name: view.name });
      return t(isMalus(view) ? 'combat.statusMalus' : 'combat.statusSelected', { name: view.name, opponent });
    }
    return m.passed.opponent ? t('combat.statusOpponentPassed', { opponent }) : t('combat.statusYourTurn');
  }

  /** Bandeau d'information : la carte survolée à la souris, sinon la dernière touchée. */
  function renderInfo() {
    const uid = ui.hover ?? ui.pinned;
    let view = null;
    if (uid) {
      try {
        view = cardView(state(), uid, coreCtx());
      } catch {
        ui.pinned = null;
      }
    }
    parts.info.update(view);
  }

  /** Rafraîchit tout ce qui dépend de la sélection (cases légales, main, consigne, boutons). */
  function renderUi() {
    const s = state();
    const m = s.match;
    const legal = legalFor(m);
    const evaluation = evaluate(s, coreCtx());
    parts.board.update({ state: s, coreCtx: coreCtx(), evaluation, legal, fresh: ui.fresh });
    parts.flights.landAll(ui.fresh, (uid) => parts.board.cardNode(uid), ui.launch, root.querySelector('.score-opponent'));
    ui.launch = null;
    parts.hand.update({ state: s, coreCtx: coreCtx(), selected: ui.selected, active: myTurn(m) });
    parts.score.update({ match: m, score: evaluation.score });
    parts.actions.update({ mode: ui.mode, canPass: myTurn(m) && !m.passed.player, flat: ui.flat });
    parts.status.textContent = statusText(m, legal);
    root.classList.toggle('is-selecting', Boolean(legal));
    ui.fresh.clear();
    renderInfo();
  }

  /** Nouvel état du cœur : interface, machine à états, tour de l'IA. */
  function onState() {
    const m = state().match;
    if (!myTurn(m)) {
      ui.selected = null;
      ui.mode = ui.mode === 'confirmQuit' ? ui.mode : 'idle';
    }
    if (ui.selected && !m.hands.player.includes(ui.selected)) ui.selected = null;
    parts.chifoumi.update({ visible: chifoumiOpen(m), match: m });
    parts.roundEnd.update({ match: m });
    renderUi();
    syncStateMachine(m);
    scheduleOpponent(m);
  }

  function syncStateMachine(m) {
    const { sm } = ctx;
    let want = 'MATCH_END';
    if (chifoumiOpen(m)) want = 'CHIFOUMI';
    else if (m.phase === 'play') want = m.turn === 'player' ? 'PLAYER_TURN' : 'OPPONENT_TURN';
    else if (m.phase === 'roundOver') want = 'ROUND_END';
    if (sm.sub === want) return;
    if (want.endsWith('_TURN') && !sm.snapshot().path.includes('ROUND_PLAY')) sm.enter('ROUND_PLAY');
    sm.enter(want);
  }

  /** L'IA réfléchit entre AI_DELAY_MIN et AI_DELAY_MAX ms (GD §9.13), délai mis en pause avec le jeu. */
  function scheduleOpponent(m) {
    if (aiTimer !== null) return;
    let act = null;
    if (m.phase === 'starter' && m.chifoumiWinner === 'opponent') act = () => ctx.session.opponentChoosesStarter();
    else if (m.phase === 'play' && m.turn === 'opponent' && !ui.awaitingGo) act = () => ctx.session.opponentTurn();
    if (!act) return;
    aiTimer = ctx.scheduler.schedule(ctx.aiDelay(), () => {
      aiTimer = null;
      act();
    });
  }

  function onAction(action, node) {
    const m = state().match;
    switch (action) {
      case 'pass':
        if (myTurn(m) && !m.passed.player) ui.mode = 'confirmPass';
        break;
      case 'passYes':
        ui.mode = 'idle';
        ui.selected = null;
        ctx.session.pass();
        return;
      case 'passNo':
      case 'quitNo':
        ui.mode = 'idle';
        break;
      case 'quit':
        ui.mode = 'confirmQuit';
        break;
      case 'quitYes':
      case 'toTitle':
        ctx.navigate('TITLE');
        return;
      case 'again':
        ctx.navigate('COMBAT');
        return;
      case 'flat':
        ui.flat = !ui.flat;
        parts.board.setFlat(ui.flat);
        break;
      case 'throw':
        ctx.session.chifoumi(node.dataset.throw);
        return;
      case 'starter':
        ctx.session.chooseStarter(node.dataset.starter);
        return;
      case 'go':
        ui.awaitingGo = false;
        onState();
        return;
      case 'nextRound':
        ctx.session.nextRound();
        return;
      default:
        return;
    }
    renderUi();
  }

  function onHandCard(uid) {
    ui.mode = ui.mode === 'confirmQuit' ? 'confirmQuit' : 'idle';
    ui.selected = ui.selected === uid ? null : uid;
    ui.pinned = ui.selected;
    renderUi();
  }

  function onCell(cell) {
    const index = Number(cell.dataset.cell);
    const legal = legalFor(state().match);
    if (legal && legal.camp === cell.dataset.camp && legal.cells.includes(index)) {
      const uid = ui.selected;
      ui.selected = null;
      ui.pinned = uid;
      ui.launch = { uid, rect: parts.hand.rectOf(uid) };
      ctx.session.play(uid, index);
      return;
    }
    // Case occupée : on lit la carte. Case vide non légale : on annule la sélection.
    const occupant = cell.querySelector('.card')?.dataset.uid ?? null;
    ui.pinned = occupant;
    if (!occupant) ui.selected = null;
    renderUi();
  }

  function onClick(e) {
    const action = e.target.closest('[data-action]');
    if (action) return onAction(action.dataset.action, action);
    const card = e.target.closest('.hand .card');
    if (card) return onHandCard(card.dataset.uid);
    const cell = e.target.closest('.cell');
    if (cell) return onCell(cell);
    // Toucher un endroit vide annule la sélection (GD §14.3).
    if (!e.target.closest('.actions, .info-band, .overlay')) {
      ui.selected = null;
      ui.pinned = null;
      renderUi();
    }
    return undefined;
  }

  function onPointerOver(e) {
    if (e.pointerType !== 'mouse') return;
    const uid = e.target.closest('.card')?.dataset.uid ?? null;
    if (uid === ui.hover) return;
    ui.hover = uid;
    renderInfo();
  }

  function onInput({ action }) {
    const m = state()?.match;
    if (!m || chifoumiOpen(m) || m.phase !== 'play') return;
    if (action === 'PASS') onAction(ui.mode === 'confirmPass' ? 'passYes' : 'pass');
    else if (action === 'CANCEL') {
      if (ui.mode !== 'idle') ui.mode = 'idle';
      else ui.selected = null;
      renderUi();
    }
  }

  return {
    /**
     * @param {HTMLElement} parent
     * @param {{ t: Function, bus: object, scheduler: object, tech: object, session: object, sm: object,
     *           navigate: (name: string) => void, aiDelay: () => number }} context
     */
    mount(parent, context) {
      ctx = context;
      const { t } = ctx;
      const m = state().match;
      const rules = coreCtx().rules;
      const opponentName = coreCtx().defs.combats[m.combatId].opponent;
      ui = { selected: null, pinned: null, hover: null, mode: 'idle', flat: false, awaitingGo: false, fresh: new Set(), launch: null };
      parts = {
        opponentName,
        board: createBoard({ t, tech: ctx.tech, rules, opponentName }),
        hand: createHand({ t }),
        score: createScorePanel({ t, rules, opponentName, flags: m.flags }),
        info: createInfoBand({ t, rules }),
        actions: createActionBar({ t }),
        chifoumi: createChifoumi({ t, opponentName, throws: THROWS }),
        roundEnd: createRoundEnd({ t, opponentName }),
        status: el('p', { className: 'combat-status', attrs: { role: 'status', 'aria-live': 'polite' } }),
      };
      root = el('section', { className: 'screen screen-combat', attrs: { 'aria-label': t('combat.label', { opponent: opponentName }) } }, [
        parts.score.el,
        el('div', { className: 'combat-center' }, [parts.status, parts.board.el]),
        el('aside', { className: 'panel panel-right' }, [parts.info.el, parts.actions.el]),
        parts.hand.el,
        parts.chifoumi.el,
        parts.roundEnd.el,
      ]);
      parts.flights = createFlights({ win: window, layer: root, durationMs: ctx.tech.CARD_FLIGHT_MS });
      root.addEventListener('click', onClick);
      root.addEventListener('pointerover', onPointerOver);
      root.addEventListener('pointerleave', (e) => {
        // Au doigt, lever le doigt « quitte » l'écran : seul le survol de la souris compte ici.
        if (e.pointerType !== 'mouse' || ui.hover === null) return;
        ui.hover = null;
        renderInfo();
      });
      offs = [
        ctx.bus.on('STORE_CHANGED', onState),
        ctx.bus.on('CARD_PLAYED', (e) => ui.fresh.add(e.uid)),
        ctx.bus.on('STARTER_CHOSEN', (e) => {
          if (e.chooser === 'opponent') ui.awaitingGo = true;
        }),
        ctx.bus.on('INPUT_ACTION', onInput),
      ];
      parent.append(root);
      onState();
    },

    update() {
      if (root) onState();
    },

    unmount() {
      if (aiTimer !== null) ctx.scheduler.cancel(aiTimer);
      aiTimer = null;
      for (const off of offs) off();
      offs = [];
      parts?.flights.stop();
      root?.remove();
      root = null;
      parts = null;
    },
  };
}
