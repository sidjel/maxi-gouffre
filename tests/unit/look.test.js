import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadAll } from '../../app/src/content/loader.js';
import { validateAll } from '../../app/src/content/validate.js';
import { validateCards } from '../../app/src/content/validateCards.js';
import { nodeFetcher } from '../helpers/data.js';

const APP = fileURLToPath(new URL('../../app/', import.meta.url));
const defs = validateAll(await loadAll(nodeFetcher()));
const cards = Object.values(defs.cards);

// DIRECTION_ARTISTIQUE.md §2.3 : cartes « ÉDITION LIMITÉE ».
const LIMITED = ['Héritage', 'Entité Libérée', 'Dernier Rouleau', 'Fromage Vivant'];

test('finitions : limited pour les 4 cartes rares et les 6 plats', () => {
  for (const c of cards) {
    c.stages.forEach((s) => {
      if (c.dish || LIMITED.includes(s.name)) assert.equal(s.finish, 'limited', s.name);
    });
  }
  assert.equal(cards.filter((c) => c.dish).length, 6);
});

test('finitions : greasy au stade 3, promo pour un stade à effet, matte sinon', () => {
  for (const c of cards) {
    if (c.dish) continue;
    c.stages.forEach((s, i) => {
      if (LIMITED.includes(s.name)) return;
      let want = 'matte';
      if (i === 2) want = 'greasy';
      else if (s.effects.length > 0) want = 'promo';
      assert.equal(s.finish, want, s.name);
    });
  }
});

test('chaque stade a une illustration qui existe dans app/', async () => {
  for (const c of cards) {
    for (const s of c.stages) {
      assert.ok(s.image, `${s.name} sans image`);
      await access(`${APP}${s.image}`);
    }
  }
});

test('une finition inconnue est refusée', () => {
  const problems = [];
  const stage = { name: 'X', power: 1, effects: [], tags: [], finish: 'chrome', image: null };
  validateCards([{ id: 'x', family: 'x', tags: [], stages: [stage, stage, stage] }], problems);
  assert.ok(problems.some((p) => p.includes('"finish"')), problems.join('\n'));
});
