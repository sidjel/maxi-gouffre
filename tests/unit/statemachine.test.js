import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StateMachine } from '../../app/src/app/StateMachine.js';
import { STATES } from '../../app/src/app/states.js';
import { EventBus } from '../../app/src/app/EventBus.js';

const make = (opts) => new StateMachine(STATES, { now: () => 0, ...opts });

test('démarre en BOOT', () => {
  const sm = make();
  assert.equal(sm.main, 'BOOT');
  assert.equal(sm.sub, null);
  assert.equal(sm.overlay, null);
});

test('le flux du GD §3 est autorisé de bout en bout', () => {
  const sm = make();
  for (const s of ['WARNING', 'PRESS_KEY', 'TITLE', 'INTRO', 'FORM', 'PLAYING', 'REVELATION', 'PLAYING', 'ENDING', 'CREDITS', 'TITLE']) {
    sm.go(s);
  }
  assert.equal(sm.main, 'TITLE');
  sm.go('PLAYING'); // « Continuer »
  assert.equal(sm.main, 'PLAYING');
});

test('une transition interdite lève une erreur explicite et ne change rien', () => {
  const sm = make();
  assert.throws(() => sm.go('PLAYING'), /transition interdite BOOT → PLAYING/);
  assert.throws(() => sm.go('INCONNU'), /état inconnu/);
  assert.equal(sm.main, 'BOOT');
  assert.equal(sm.log.length, 0);
});

test('chaque état principal a des transitions vers des états existants', () => {
  for (const [from, targets] of Object.entries(STATES.main)) {
    for (const to of targets) assert.ok(to in STATES.main, `${from} → ${to}`);
  }
});

test('sous-états : PLAYING > COMBAT > ROUND_PLAY > PLAYER_TURN', () => {
  const sm = make();
  sm.go('TITLE');
  sm.go('PLAYING');
  sm.enter('EXPLORATION');
  sm.enter('COMBAT');
  assert.deepEqual(sm.snapshot().path, ['COMBAT']);
  sm.enter('ROUND_PLAY');
  sm.enter('PLAYER_TURN');
  sm.enter('OPPONENT_TURN');
  assert.deepEqual(sm.snapshot().path, ['COMBAT', 'ROUND_PLAY', 'OPPONENT_TURN']);
  sm.enter('ROUND_END');
  assert.deepEqual(sm.snapshot().path, ['COMBAT', 'ROUND_END'], 'quitter ROUND_PLAY quitte aussi le tour');
  sm.enter('EXPLORATION');
  assert.deepEqual(sm.snapshot().path, ['EXPLORATION']);
  assert.equal(sm.sub, 'EXPLORATION');
});

test('un sous-état hors de son parent est refusé', () => {
  const sm = make();
  sm.go('TITLE');
  assert.throws(() => sm.enter('COMBAT'), /sous-état COMBAT impossible/);
});

test('changer d\'état principal vide les sous-états et les superpositions', () => {
  const sm = make();
  sm.go('TITLE');
  sm.go('PLAYING');
  sm.enter('COMBAT');
  sm.push('PAUSED');
  sm.go('TITLE');
  assert.deepEqual(sm.snapshot(), { main: 'TITLE', path: [], overlays: [] });
});

test('superpositions : pile, doublon ignoré, retrait ciblé', () => {
  const sm = make();
  sm.go('TITLE');
  sm.push('PAUSED');
  sm.push('ROTATE_DEVICE');
  sm.push('PAUSED');
  assert.deepEqual(sm.snapshot().overlays, ['PAUSED', 'ROTATE_DEVICE']);
  assert.equal(sm.overlay, 'ROTATE_DEVICE');
  sm.pop('PAUSED');
  assert.deepEqual(sm.snapshot().overlays, ['ROTATE_DEVICE']);
  assert.ok(sm.has('ROTATE_DEVICE'));
  sm.pop('PAUSED'); // absent : sans effet
  assert.throws(() => sm.push('TITLE'), /superposition inconnue/);
});

test('force ignore la table des transitions et note la raison', () => {
  const sm = make();
  sm.force('TITLE', 'plantage');
  assert.equal(sm.main, 'TITLE');
  assert.equal(sm.log.at(-1).reason, 'plantage');
});

test('journal et événement STATE_CHANGED à chaque transition', () => {
  const bus = new EventBus();
  const events = [];
  bus.on('STATE_CHANGED', (e) => events.push(e));
  const sm = make({ bus });
  sm.go('TITLE');
  sm.push('ROTATE_DEVICE');
  sm.pop('ROTATE_DEVICE');
  assert.deepEqual(events.map((e) => [e.kind, e.to]), [['go', 'TITLE'], ['push', 'ROTATE_DEVICE'], ['pop', 'ROTATE_DEVICE']]);
  assert.equal(events[0].from.main, 'BOOT');
  assert.equal(events[0].state.main, 'TITLE');
  assert.equal(sm.log.length, 3);
});

test('le journal est borné par logMax', () => {
  const sm = make({ logMax: 2 });
  sm.go('TITLE');
  sm.push('PAUSED');
  sm.pop('PAUSED');
  assert.equal(sm.log.length, 2);
  assert.equal(sm.log[0].kind, 'push');
});
