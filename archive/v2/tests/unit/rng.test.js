import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedFrom, next, int, pick, shuffle } from '../../app/src/core/rng.js';

function draws(seed, n) {
  const out = [];
  let state = seedFrom(seed);
  for (let i = 0; i < n; i += 1) {
    const r = next(state);
    out.push(r.value);
    state = r.rngState;
  }
  return out;
}

test('même graine, même suite de tirages', () => {
  assert.deepEqual(draws(42, 20), draws(42, 20));
});

test('graines différentes, suites différentes', () => {
  assert.notDeepEqual(draws(1, 5), draws(2, 5));
});

test('seedFrom renvoie un entier 32 bits non signé, y compris pour un nombre négatif ou décimal', () => {
  for (const n of [0, 1, -1, 3.7, Date.now(), 2 ** 40]) {
    const s = seedFrom(n);
    assert.ok(Number.isInteger(s) && s >= 0 && s < 2 ** 32, `seedFrom(${n}) = ${s}`);
  }
  assert.throws(() => seedFrom(Number.NaN), TypeError);
});

test('next renvoie une valeur dans [0, 1) et un nouvel état, sans modifier l\'ancien', () => {
  const state = seedFrom(7);
  const r = next(state);
  assert.ok(r.value >= 0 && r.value < 1);
  assert.notEqual(r.rngState, state);
  assert.deepEqual(next(state), r, 'la fonction est pure : même entrée, même sortie');
});

test('next refuse un état invalide', () => {
  for (const bad of [-1, 1.5, 2 ** 32, '3', null]) assert.throws(() => next(bad), TypeError);
});

test('int reste dans [0, max) et couvre toutes les valeurs', () => {
  let state = seedFrom(123);
  const seen = new Set();
  for (let i = 0; i < 600; i += 1) {
    const r = int(state, 6);
    assert.ok(Number.isInteger(r.value) && r.value >= 0 && r.value < 6);
    seen.add(r.value);
    state = r.rngState;
  }
  assert.equal(seen.size, 6);
  assert.throws(() => int(state, 0), RangeError);
});

test('répartition grossièrement uniforme sur 10 000 tirages', () => {
  let state = seedFrom(99);
  const buckets = new Array(10).fill(0);
  for (let i = 0; i < 10000; i += 1) {
    const r = int(state, 10);
    buckets[r.value] += 1;
    state = r.rngState;
  }
  for (const b of buckets) assert.ok(b > 850 && b < 1150, `case à ${b}`);
});

test('pick choisit un élément de la liste ; liste vide refusée', () => {
  const list = ['a', 'b', 'c'];
  const r = pick(seedFrom(5), list);
  assert.ok(list.includes(r.value));
  assert.throws(() => pick(seedFrom(5), []), RangeError);
});

test('shuffle renvoie une permutation, reproductible, sans toucher à la liste d\'origine', () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8];
  const frozen = Object.freeze(list.slice());
  const a = shuffle(seedFrom(11), frozen);
  const b = shuffle(seedFrom(11), frozen);
  assert.deepEqual(a, b);
  assert.deepEqual([...a.value].sort((x, y) => x - y), list);
  assert.deepEqual(frozen, list);
  assert.deepEqual(shuffle(seedFrom(1), []).value, []);
});
