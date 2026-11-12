import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../app/src/app/EventBus.js';

test('on / emit transmet le contenu et le type', () => {
  const bus = new EventBus();
  const got = [];
  bus.on('CARD_PLAYED', (payload, type) => got.push([type, payload]));
  bus.emit('CARD_PLAYED', { uid: 'c001' });
  assert.deepEqual(got, [['CARD_PLAYED', { uid: 'c001' }]]);
});

test('le désabonnement arrête la réception', () => {
  const bus = new EventBus();
  let n = 0;
  const off = bus.on('X', () => { n += 1; });
  bus.emit('X');
  off();
  bus.emit('X');
  assert.equal(n, 1);
  assert.equal(bus.count('X'), 0);
});

test('once ne reçoit qu\'une fois', () => {
  const bus = new EventBus();
  let n = 0;
  bus.once('X', () => { n += 1; });
  bus.emit('X');
  bus.emit('X');
  assert.equal(n, 1);
});

test('onAny reçoit tous les types', () => {
  const bus = new EventBus();
  const types = [];
  bus.onAny((_, type) => types.push(type));
  bus.emit('A');
  bus.emit('B');
  assert.deepEqual(types, ['A', 'B']);
});

test('un abonné en erreur n\'empêche pas les autres et l\'erreur est journalisée [MG]', (t) => {
  const bus = new EventBus();
  const logged = [];
  t.mock.method(console, 'error', (...args) => logged.push(args));
  let reached = false;
  bus.on('X', () => { throw new Error('boum'); });
  bus.on('X', () => { reached = true; });
  bus.emit('X');
  assert.ok(reached);
  assert.equal(logged.length, 1);
  assert.equal(logged[0][0], '[MG]');
});

test('se désabonner pendant une diffusion ne saute pas les autres abonnés', () => {
  const bus = new EventBus();
  const got = [];
  const offA = bus.on('X', () => { got.push('a'); offA(); });
  bus.on('X', () => got.push('b'));
  bus.emit('X');
  bus.emit('X');
  assert.deepEqual(got, ['a', 'b', 'b']);
});

test('on refuse un abonné qui n\'est pas une fonction', () => {
  assert.throws(() => new EventBus().on('X', null), TypeError);
});
