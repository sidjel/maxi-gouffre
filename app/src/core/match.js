/**
 * Actions pures du match (ARCHITECTURE.md §4, §6) : chacune reçoit (state, args, ctx),
 * copie l'état avec structuredClone et renvoie { state, events }. L'état d'origine n'est jamais modifié.
 * L'état complet d'un combat est { game, match }.
 */
import { int } from './rng.js';
import { SIDES, other, legalCells } from './board.js';
import { cardView } from './cards.js';
import { settleTurn, openRound, clearBoard, countAction } from './round.js';

export { legalMoves } from './board.js';
export { matchWinner, matchOutcome, totalPoints } from './round.js';

/** Les trois coups du chifoumi, et ce que chacun bat. */
export const THROWS = Object.freeze(['rock', 'paper', 'scissors']);
const BEATS = Object.freeze({ rock: 'scissors', paper: 'rock', scissors: 'paper' });

const RULE_FLAGS = ['singleRound', 'guided', 'noLoot', 'overtime'];

const uidOf = (prefix, n) => `${prefix}${String(n).padStart(3, '0')}`;

function fail(message) {
  throw new Error(`[MG] match : ${message}`);
}

/**
 * Crée un match contre le combat `combatId` avec la main choisie par le joueur.
 * @param {object} game partie (game.collection contient les cartes du joueur)
 * @param {string} combatId
 * @param {string[]} handUids
 * @param {{ defs: object, rules: object }} ctx
 * @param {{ level?: string }} [opts] niveau de l'IA
 * @returns {{ state: { game: object, match: object }, events: object[] }}
 */
export function createMatch(game, combatId, handUids, ctx, opts = {}) {
  const combat = ctx.defs.combats[combatId];
  if (!combat) fail(`combat inconnu ${combatId}`);
  if (handUids.length > ctx.rules.HAND_SIZE) fail(`main de ${handUids.length} cartes (maximum ${ctx.rules.HAND_SIZE})`);
  if (new Set(handUids).size !== handUids.length) fail('une carte apparaît deux fois dans la main');
  for (const uid of handUids) {
    if (!game.collection.some((c) => c.uid === uid)) fail(`la carte ${uid} n'est pas dans la Collection`);
  }
  const opponentCards = {};
  combat.hand.forEach((h, i) => {
    const uid = uidOf('o', i + 1);
    opponentCards[uid] = { uid, cardId: h.card, stage: h.stage };
  });
  const emptyBoard = () => Array(ctx.rules.GRID_COLS * ctx.rules.GRID_ROWS).fill(null);
  const flags = Object.fromEntries(RULE_FLAGS.map((f) => [f, combat.rules.includes(f)]));
  const match = {
    combatId,
    level: opts.level ?? 'noob',
    flags,
    phase: 'chifoumi',
    round: 1,
    starter: null,
    nextStarter: null,
    turn: null,
    chifoumi: null,
    chifoumiWinner: null,
    wins: { player: 0, opponent: 0 },
    roundScores: [],
    passed: { player: false, opponent: false },
    panic: { player: 0, opponent: 0 },
    hands: { player: handUids.slice(), opponent: Object.keys(opponentCards) },
    discard: { player: [], opponent: [] },
    board: { player: emptyBoard(), opponent: emptyBoard() },
    opponentCards,
    actionsThisRound: 0,
    result: null,
  };
  const state = { game: structuredClone(game), match };
  return { state, events: [{ type: 'MATCH_STARTED', combatId, opponent: combat.opponent }] };
}

/**
 * Chifoumi (GD §9.2) : le joueur montre son coup, l'IA tire le sien avec la graine de la partie.
 * Égalité : on rejoue. Sinon le vainqueur devra choisir qui commence.
 */
export function setChifoumi(state, playerThrow, ctx) {
  const s = structuredClone(state);
  const m = s.match;
  if (m.phase !== 'chifoumi') fail(`chifoumi impossible en phase ${m.phase}`);
  if (!THROWS.includes(playerThrow)) fail(`coup de chifoumi inconnu ${playerThrow}`);
  const r = int(s.game.rng, THROWS.length);
  s.game.rng = r.rngState;
  const opponentThrow = THROWS[r.value];
  let winner = null;
  if (BEATS[playerThrow] === opponentThrow) winner = 'player';
  else if (BEATS[opponentThrow] === playerThrow) winner = 'opponent';
  m.chifoumi = { player: playerThrow, opponent: opponentThrow, winner };
  if (winner) {
    m.chifoumiWinner = winner;
    m.phase = 'starter';
  }
  return { state: s, events: [{ type: 'CHIFOUMI_PLAYED', ...m.chifoumi }] };
}

/**
 * Le vainqueur du chifoumi choisit qui commence la manche 1.
 * @param {'player'|'opponent'} chooser doit être le vainqueur du chifoumi
 * @param {'player'|'opponent'} starter
 */
export function setStarter(state, chooser, starter, ctx) {
  const s = structuredClone(state);
  const m = s.match;
  if (m.phase !== 'starter') fail(`choix du premier joueur impossible en phase ${m.phase}`);
  if (chooser !== m.chifoumiWinner) fail(`${chooser} n'a pas gagné le chifoumi`);
  if (!SIDES.includes(starter)) fail(`camp inconnu ${starter}`);
  m.starter = starter;
  const events = [{ type: 'STARTER_CHOSEN', chooser, starter }];
  openRound(s, ctx, events);
  return { state: s, events };
}

function assertTurn(m, side) {
  if (m.phase !== 'play') fail(`aucune manche en cours (phase ${m.phase})`);
  if (m.turn !== side) fail(`ce n'est pas le tour de ${side}`);
}

/**
 * Pose une carte de la main sur une case vide légale (GD §8.3, §9.3).
 * J1 : la carte est placée et son stade verrouillé ; effets et crans arrivent au jalon J2.
 * @param {'player'|'opponent'} side
 * @param {string} uid
 * @param {number} cell index de case dans le camp cible (le sien, ou celui de l'adversaire pour un Malus)
 * @param {unknown} choice réservé (choix de TRANSFER, J2)
 */
export function playCard(state, side, uid, cell, choice, ctx) {
  const s = structuredClone(state);
  const m = s.match;
  assertTurn(m, side);
  if (!m.hands[side].includes(uid)) fail(`la carte ${uid} n'est pas dans la main de ${side}`);
  const { camp, cells } = legalCells(s, side, uid, ctx);
  if (!cells.includes(cell)) fail(`case ${cell} du camp ${camp} illégale pour ${uid}`);
  const view = cardView(s, uid, ctx);
  m.board[camp][cell] = { uid, owner: side, lockedStage: view.stage, transferBonus: 0 };
  m.hands[side] = m.hands[side].filter((u) => u !== uid);
  countAction(m, ctx.rules);
  const events = [{ type: 'CARD_PLAYED', side, uid, camp, cell, stage: view.stage, malus: camp !== side }];
  m.turn = other(side);
  settleTurn(s, ctx, events);
  return { state: s, events };
}

/** Passe : définitif pour la manche (GD §9.5). La confirmation se fait côté interface. */
export function pass(state, side, ctx) {
  const s = structuredClone(state);
  const m = s.match;
  assertTurn(m, side);
  m.passed[side] = true;
  countAction(m, ctx.rules);
  const events = [{ type: 'PLAYER_PASSED', side, auto: false }];
  m.turn = other(side);
  settleTurn(s, ctx, events);
  return { state: s, events };
}

/**
 * Termine l'affichage de fin de manche et ouvre la suivante : le plateau part à la défausse,
 * le perdant de la manche commence (manche nulle : celui qui n'avait pas commencé).
 */
export function endRound(state, ctx) {
  const s = structuredClone(state);
  const m = s.match;
  if (m.phase !== 'roundOver') fail(`fin de manche impossible en phase ${m.phase}`);
  clearBoard(m);
  m.passed = { player: false, opponent: false };
  m.panic = { player: 0, opponent: 0 };
  m.round += 1;
  m.starter = m.nextStarter;
  m.nextStarter = null;
  const events = [];
  openRound(s, ctx, events);
  return { state: s, events };
}
