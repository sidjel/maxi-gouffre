import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadAll } from '../../app/src/content/loader.js';
import { validateAll } from '../../app/src/content/validate.js';
import { expandDish } from '../../app/src/content/expand.js';
import { TAGS, EFFECTS } from '../../app/src/content/validateCards.js';
import { nodeFetcher, memoryFetcher } from '../helpers/data.js';
import { loadDefs } from '../helpers/match.js';
import { readFile } from 'node:fs/promises';
import { DATA_DIR } from '../helpers/data.js';

const real = async (file) => readFile(`${DATA_DIR}${file}`, 'utf8');

async function withFile(file, data) {
  const files = {};
  for (const f of ['strings.json', 'credits.json', 'cards.json', 'combats.json', 'quickmatch.json']) files[f] = await real(f);
  files[file] = JSON.stringify(data);
  return loadAll(memoryFetcher(files));
}

test('les 20 cartes et les 6 plats du GD §7.3-7.4 sont en données', async () => {
  const defs = await loadDefs();
  const all = Object.values(defs.cards);
  assert.equal(all.filter((c) => !c.dish).length, 20);
  assert.equal(all.filter((c) => c.dish).length, 6);
  for (const c of all) assert.equal(c.stages.length, 3, c.id);
  const banane = defs.cards.banane;
  assert.deepEqual(banane.stages.map((s) => s.name), ['Banane Verte', 'Banane Parfaite', 'Bouillie Brune']);
  assert.deepEqual(banane.stages.map((s) => s.power), [2, 6, -1]);
  assert.deepEqual(banane.stages[2].tags, ['malus']);
  assert.equal(banane.stages[2].effects[0].type, 'ZONE_MALUS');
});

test('Outils : Mixeur et Scotch non posables aux stades 1 et 2', async () => {
  const { cards } = await loadDefs();
  for (const id of ['mixeur', 'scotch']) {
    assert.ok(cards[id].tags.includes('outil'));
    assert.equal(cards[id].stages[0].placeable, false);
    assert.equal(cards[id].stages[1].placeable, false);
    assert.equal(cards[id].stages[0].power, null);
    assert.notEqual(cards[id].stages[2].placeable, false);
  }
  assert.ok(cards.mixeur.stages[2].tags.includes('malus'), 'Explosion Électrique est un Malus');
});

test('plats : P de base aux stades 1 et 2, moitié arrondie au stade 3 sans effet', async () => {
  const { cards } = await loadDefs();
  assert.deepEqual(cards.burger.stages.map((s) => s.power), [12, 12, 6]);
  assert.deepEqual(cards.petit_dej.stages.map((s) => s.power), [9, 9, 4]);
  assert.equal(cards.ado_muet.stages[1].effects[0].type, 'CANCEL_FACING');
  assert.deepEqual(cards.ado_muet.stages[2].effects, []);
  assert.ok(cards.lance.tags.includes('plat'));
  const d = expandDish({ id: 'x', family: 'x', dish: true, tags: ['plat'], name: 'X', power: 7, effects: [], image: null }, 0.5);
  assert.deepEqual(d.stages.map((s) => s.power), [7, 7, 3]);
});

test('chaque étiquette et chaque effet ont un texte dans strings.json', async () => {
  const { strings } = await loadDefs();
  const camel = (id) => id.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  for (const tag of TAGS) assert.ok(strings[`tag.${tag}`], `tag.${tag}`);
  for (const e of EFFECTS) {
    assert.ok(strings[`effect.${camel(e)}`], `effect.${camel(e)}`);
    assert.ok(strings[`effectIcon.${camel(e)}`], `effectIcon.${camel(e)}`);
  }
});

test('cards.json : effet hors liste, TRANSFORM, P manquante et Outil mal décrit sont refusés', async () => {
  const cards = JSON.parse(await real('cards.json'));
  cards[0].stages[0].effects = [{ type: 'TRANSFORM' }];
  cards[1].stages[1].power = '5';
  cards.find((c) => c.id === 'mixeur').stages[0].placeable = true;
  cards[2].stages[0].tags = ['bio'];
  await assert.rejects(async () => validateAll(await withFile('cards.json', cards)), (err) => {
    const text = err.problems.join('\n');
    assert.match(text, /cards\.json › élément 0 \(banane\) › stade 1 › effet 0 › champ "type" : effet inconnu "TRANSFORM"/);
    assert.match(text, /élément 1 \(steak\) › stade 2 › champ "power" : entier attendu/);
    assert.match(text, /\(mixeur\) › stade 1 › champ "placeable"/);
    assert.match(text, /\(lait\) › stade 1 › champ "tags" : étiquette inconnue "bio"/);
    return true;
  });
});

test('combats.json : carte inconnue et budget faux sont signalés', async () => {
  const combats = JSON.parse(await real('combats.json'));
  combats[0].hand[0].card = 'licorne';
  await assert.rejects(async () => validateAll(await withFile('combats.json', combats)), /c2_chad › main 0 : carte "licorne" absente/);
  const budget = JSON.parse(await real('combats.json'));
  budget[0].handBudget = 99;
  await assert.rejects(async () => validateAll(await withFile('combats.json', budget)), /champ "handBudget" : 99 annoncé, la main fait 38/);
});

test('quickmatch.json : un Outil non posable ne peut pas entrer dans la main', async () => {
  const quick = JSON.parse(await real('quickmatch.json'));
  quick.hand[0] = { card: 'scotch', age: 0 };
  await assert.rejects(async () => validateAll(await withFile('quickmatch.json', quick)), /main 0 : Scotch Gris \(âge 0\) ne peut pas entrer dans une main/);
});

test('la main de Chad Prot\' respecte le budget ~38 du GD §10.3', async () => {
  const defs = validateAll(await loadAll(nodeFetcher()));
  const chad = defs.combats.c2_chad;
  const sum = chad.hand.reduce((acc, h) => acc + defs.cards[h.card].stages[h.stage - 1].power, 0);
  assert.equal(sum, chad.handBudget);
  assert.equal(chad.handBudget, 38);
});
