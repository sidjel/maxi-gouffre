/**
 * Géométrie du plateau et légalité des poses (GAME_DESIGN.md §2, §9.3).
 * Index de case = row * GRID_COLS + col ; row 0 = ligne Avant ; col 0 = colonne de gauche vue par le joueur.
 */
import { cardView } from './cards.js';

/** Les deux camps. */
export const SIDES = Object.freeze(['player', 'opponent']);

/** L'autre camp. */
export const other = (side) => (side === 'player' ? 'opponent' : 'player');

/** Index d'une case. */
export function cellIndex(row, col, rules) {
  return row * rules.GRID_COLS + col;
}

/** Ligne et colonne d'une case. */
export function cellPos(index, rules) {
  return { row: Math.floor(index / rules.GRID_COLS), col: index % rules.GRID_COLS };
}

/** Voisins dans le même camp : haut, bas, gauche, droite (pas de diagonale). */
export function neighbors(index, rules) {
  const { row, col } = cellPos(index, rules);
  const out = [];
  if (row > 0) out.push(cellIndex(row - 1, col, rules));
  if (row < rules.GRID_ROWS - 1) out.push(cellIndex(row + 1, col, rules));
  if (col > 0) out.push(cellIndex(row, col - 1, rules));
  if (col < rules.GRID_COLS - 1) out.push(cellIndex(row, col + 1, rules));
  return out;
}

/** Case en face, dans le camp adverse : miroir strict (même colonne, même ligne). */
export function facing(index) {
  return index;
}

/** Vrai si la carte porte l'étiquette Malus à son stade actif : elle se pose chez l'adversaire. */
export function isMalus(view) {
  return view.tags.includes('malus');
}

/**
 * Camp où une carte se pose : le sien, ou celui de l'adversaire pour une carte Malus.
 * @returns {'player'|'opponent'}
 */
export function targetCamp(view, side) {
  return isMalus(view) ? other(side) : side;
}

/**
 * Cases où la carte `uid` peut être posée par `side`. Vide si la carte n'est pas posable
 * (Outil aux stades 1 et 2) ou si le camp cible est plein.
 * @param {{ game: object, match: object }} state
 * @returns {{ camp: 'player'|'opponent', cells: number[] }}
 */
export function legalCells(state, side, uid, ctx) {
  const view = cardView(state, uid, ctx);
  const camp = targetCamp(view, side);
  if (!view.placeable) return { camp, cells: [] };
  const cells = [];
  state.match.board[camp].forEach((cell, i) => {
    if (cell === null) cells.push(i);
  });
  return { camp, cells };
}

/** Vrai si la carte peut être posée quelque part. */
export function isPlaceable(state, side, uid, ctx) {
  return legalCells(state, side, uid, ctx).cells.length > 0;
}

/**
 * Tous les coups possibles d'un camp : chaque carte posable de sa main × chaque case légale.
 * @returns {{ uid: string, camp: string, cell: number }[]}
 */
export function legalMoves(state, side, ctx) {
  const moves = [];
  for (const uid of state.match.hands[side]) {
    const { camp, cells } = legalCells(state, side, uid, ctx);
    for (const cell of cells) moves.push({ uid, camp, cell });
  }
  return moves;
}
