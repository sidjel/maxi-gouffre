import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GAME } from '../../app/src/config.js';
import { buildRules } from '../../app/src/core/rules.js';
import { stageOf, activeStage } from '../../app/src/core/time.js';
import { cellIndex, cellPos, neighbors, facing, legalCells, legalMoves } from '../../app/src/core/board.js';
import { cardView } from '../../app/src/core/cards.js';
import { makeCtx, makeMatch, startPlay } from '../helpers/match.js';

const rules = buildRules(GAME);

test('buildRules : la vitesse de pourrissement change STAGE_LENGTH et AGE_MAX', () => {
  assert.equal(rules.STAGE_LENGTH, 15);
  assert.equal(rules.AGE_MAX, 44);
  const fast = buildRules(GAME, { rotSpeed: 'fast' });
  assert.equal(fast.STAGE_LENGTH, 10);
  assert.equal(fast.AGE_MAX, 29);
  assert.ok(Object.isFrozen(fast));
  assert.throws(() => buildRules(GAME, { rotSpeed: 'turbo' }), /vitesse de pourrissement inconnue/);
});

test('stageOf : 3 stades de STAGE_LENGTH crans, règle Surgelé par l\'étiquette seule', () => {
  const normal = { tags: ['aliment'] };
  assert.deepEqual([0, 14, 15, 29, 30, 44].map((a) => stageOf(normal, a, rules)), [1, 1, 2, 2, 3, 3]);
  const frozen = { tags: ['aliment', 'surgele'] };
  assert.deepEqual([0, 29, 30, 31, 44].map((a) => stageOf(frozen, a, rules)), [1, 1, 2, 3, 3]);
  assert.equal(activeStage({ lockedStage: 1 }, normal, 40, rules), 1, 'stade verrouillé sur le plateau');
  assert.equal(activeStage(null, normal, 40, rules), 3);
});

test('géométrie : index, voisins sans diagonale, en face en miroir strict', () => {
  assert.equal(cellIndex(1, 2, rules), 7);
  assert.deepEqual(cellPos(7, rules), { row: 1, col: 2 });
  assert.deepEqual(neighbors(0, rules).sort(), [1, 5]);
  assert.deepEqual(neighbors(7, rules).sort(), [2, 6, 8]);
  assert.deepEqual(neighbors(4, rules).sort(), [3, 9]);
  assert.equal(facing(3), 3);
  assert.equal(facing(8), 8);
});

test('pose : une carte normale va dans son camp, un Malus dans le camp adverse', async () => {
  const base = await makeCtx();
  const { state, ctx } = makeMatch(base, {
    player: [{ card: 'banane', age: 0 }, { card: 'biere', age: 30 }],
    opponent: [{ card: 'influenceur', stage: 3 }, { card: 'pizza', stage: 1 }],
  });
  const s = startPlay(state, ctx).state;
  assert.equal(cardView(s, 'c002', ctx).name, 'Vomi de Soirée');
  assert.equal(legalCells(s, 'player', 'c001', ctx).camp, 'player');
  assert.equal(legalCells(s, 'player', 'c002', ctx).camp, 'opponent');
  assert.equal(legalCells(s, 'opponent', 'o001', ctx).camp, 'player', 'Influenceur Annulé (Malus) va chez le joueur');
  assert.equal(legalCells(s, 'player', 'c001', ctx).cells.length, 10);
});

test('pose : Outil non posable aux stades 1 et 2, posable au stade 3', async () => {
  const base = await makeCtx();
  const { state, ctx } = makeMatch(base, {
    player: [{ card: 'mixeur', age: 0 }, { card: 'mixeur', age: 30 }, { card: 'banane' }],
    opponent: [{ card: 'pizza' }],
  });
  const s = startPlay(state, ctx).state;
  assert.deepEqual(legalCells(s, 'player', 'c001', ctx).cells, []);
  const bomb = legalCells(s, 'player', 'c002', ctx);
  assert.equal(bomb.camp, 'opponent');
  assert.equal(bomb.cells.length, 10);
  assert.ok(legalMoves(s, 'player', ctx).every((m) => m.uid !== 'c001'));
});

test('pose : camp plein, plus aucune case légale', async () => {
  const base = await makeCtx();
  const { state, ctx } = makeMatch(base, { player: [{ card: 'banane' }, { card: 'biere', age: 30 }], opponent: [{ card: 'pizza' }] });
  const s = startPlay(state, ctx).state;
  s.match.board.opponent = s.match.board.opponent.map((_, i) => ({ uid: `x${i}`, owner: 'opponent', lockedStage: 1, transferBonus: 0 }));
  assert.deepEqual(legalCells(s, 'player', 'c002', ctx).cells, []);
  assert.equal(legalCells(s, 'player', 'c001', ctx).cells.length, 10);
});
