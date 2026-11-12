/**
 * Plateau 2.5D (GD §9.3, §17.5) : adversaire en haut, joueur en bas, ligne Avant côté centre.
 * La case est le bouton (zone à toucher, plus large que la carte) ; elle contient un emplacement
 * au format des cartes (5:7), où se place la carte posée. Chaque ligne porte son nom (Avant, Arrière).
 * Vue inclinée par `perspective` et `rotateX` ; « à plat » = la classe is-flat.
 */
import { el } from '../dom.js';
import { createCard, renderCard } from './Card.js';
import { cardView } from '../../core/cards.js';

const CAMPS = ['opponent', 'player'];

/**
 * @param {{ t: Function, tech: object, rules: object, opponentName: string }} opts
 */
export function createBoard(opts) {
  const { t, tech, rules } = opts;
  const cols = rules.GRID_COLS;
  const cells = { player: [], opponent: [] };
  const cards = new Map();

  const rowName = (row) => t(row === 0 ? 'combat.rowFront' : 'combat.rowBack');
  const campEl = (camp) => {
    const label = camp === 'player' ? t('combat.campPlayer') : t('combat.campOpponent', { opponent: opts.opponentName });
    const node = el('div', { className: `camp camp-${camp}`, attrs: { role: 'group', 'aria-label': label } });
    // Ligne Avant côté centre : en haut pour le joueur, en bas pour l'adversaire.
    const rows = camp === 'player' ? [0, 1] : [1, 0];
    for (const row of rows) {
      node.append(el('span', { className: 'row-label', text: t(row === 0 ? 'board.front' : 'board.back'), attrs: { 'aria-hidden': 'true' } }));
      for (let col = 0; col < cols; col += 1) {
        const index = row * cols + col;
        const cell = el('button', {
          className: `cell ${row === 0 ? 'row-front' : 'row-back'}`,
          attrs: { type: 'button', 'data-camp': camp, 'data-cell': String(index), 'aria-disabled': 'true' },
        });
        cell.cellLabel = t('combat.cellLabel', { row: rowName(row), col: col + 1 });
        cell.cellSlot = el('span', { className: 'cell-slot' });
        cell.append(cell.cellSlot);
        cells[camp][index] = cell;
        node.append(cell);
      }
    }
    return node;
  };

  const plane = el('div', { className: 'board-plane' }, [
    campEl('opponent'),
    el('div', { className: 'board-divider', attrs: { 'aria-hidden': 'true' } }),
    campEl('player'),
  ]);
  const root = el('div', { className: 'board' }, [plane]);
  root.style.setProperty('--board-perspective', `${tech.BOARD_PERSPECTIVE}px`);
  root.style.setProperty('--board-tilt', `${tech.BOARD_TILT}deg`);

  return {
    el: root,

    /** Carte posée (élément), ou null. */
    cardNode(uid) {
      return cards.get(uid) ?? null;
    },

    /** Bascule entre vue inclinée et vue à plat. */
    setFlat(flat) {
      root.classList.toggle('is-flat', flat);
    },

    /**
     * @param {{ state: object, coreCtx: object, evaluation: object, legal: { camp: string, cells: number[] }|null, fresh: Set<string> }} vm
     */
    update(vm) {
      const seen = new Set();
      for (const camp of CAMPS) {
        vm.state.match.board[camp].forEach((slot, index) => {
          const cell = cells[camp][index];
          const legal = vm.legal?.camp === camp && vm.legal.cells.includes(index);
          cell.classList.toggle('is-legal', legal);
          cell.setAttribute('aria-disabled', legal ? 'false' : 'true');
          if (!slot) {
            cell.classList.remove('is-occupied');
            cell.cellSlot.replaceChildren();
            cell.setAttribute('aria-label', `${cell.cellLabel}, ${t('combat.cellEmpty')}`);
            return;
          }
          seen.add(slot.uid);
          let card = cards.get(slot.uid);
          if (!card) {
            card = createCard('div');
            cards.set(slot.uid, card);
            if (vm.fresh.has(slot.uid)) {
              card.classList.add('is-new');
              card.addEventListener('animationend', () => card.classList.remove('is-new'), { once: true });
            }
          }
          if (card.parentNode !== cell.cellSlot) cell.cellSlot.replaceChildren(card);
          const view = cardView(vm.state, slot.uid, vm.coreCtx);
          const value = vm.evaluation.cards[slot.uid];
          renderCard(card, view, { t, power: value.power, effectActive: value.effectActive });
          card.classList.toggle('is-foe', slot.owner !== 'player');
          cell.classList.add('is-occupied');
          cell.setAttribute('aria-label', `${cell.cellLabel}, ${card.getAttribute('aria-label')}`);
        });
      }
      for (const uid of [...cards.keys()]) if (!seen.has(uid)) cards.delete(uid);
    },
  };
}
