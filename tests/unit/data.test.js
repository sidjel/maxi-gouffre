import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadAll, DATA_FILES } from '../../app/src/content/loader.js';
import { validateAll, DataError } from '../../app/src/content/validate.js';
import { nodeFetcher, memoryFetcher } from '../helpers/data.js';

const goodCredit = {
  file: 'assets/fonts/x.woff2', author: 'A', source: 'S', license: 'OFL-1.1',
  commercial: true, date: '2026-11-06', usage: 'police',
};

function files(overrides) {
  return memoryFetcher({
    'strings.json': JSON.stringify({ 'game.title': 'MAXI-GOUFFRE' }),
    'credits.json': JSON.stringify([goodCredit]),
    ...overrides,
  });
}

test('les vrais fichiers de app/data/ se chargent et passent la validation', async () => {
  const defs = validateAll(await loadAll(nodeFetcher()));
  assert.deepEqual(Object.keys(defs).sort(), Object.keys(DATA_FILES).sort());
  assert.equal(defs.strings['game.title'], 'MAXI-GOUFFRE');
  assert.ok(defs.credits.length > 0);
  assert.ok(Object.isFrozen(defs.credits[0]), 'les données validées sont gelées');
});

test('un JSON illisible nomme le fichier', async () => {
  await assert.rejects(loadAll(files({ 'strings.json': '{ pas du json' })), (err) => {
    assert.ok(err instanceof DataError);
    assert.match(err.message, /data\/strings\.json : JSON invalide/);
    return true;
  });
});

test('un fichier absent nomme le fichier', async () => {
  const fetcher = memoryFetcher({ 'strings.json': '{}' });
  await assert.rejects(loadAll(fetcher), /data\/credits\.json : lecture impossible/);
});

test('strings.json : texte vide et clé mal formée sont signalés', async () => {
  const raw = await loadAll(files({ 'strings.json': JSON.stringify({ 'title.ok': 'oui', 'title.vide': '  ', 'Mauvaise Clé': 'x' }) }));
  assert.throws(() => validateAll(raw), (err) => {
    assert.equal(err.problems.length, 2);
    assert.match(err.problems.join('\n'), /clé "title\.vide" : texte non vide attendu/);
    assert.match(err.problems.join('\n'), /clé "Mauvaise Clé" : format attendu/);
    return true;
  });
});

test('credits.json : chaque problème nomme le fichier, l\'élément et le champ', async () => {
  const bad = [
    goodCredit,
    { ...goodCredit, file: 'assets/fonts/y.woff2', license: '', commercial: 'oui', date: '06/11/2026' },
    { ...goodCredit },
    { ...goodCredit, file: '../secret.txt' },
  ];
  const raw = await loadAll(files({ 'credits.json': JSON.stringify(bad) }));
  assert.throws(() => validateAll(raw), (err) => {
    const text = err.problems.join('\n');
    assert.match(text, /data\/credits\.json › élément 1 \(assets\/fonts\/y\.woff2\) › champ "license"/);
    assert.match(text, /élément 1 .* › champ "commercial" : true ou false attendu/);
    assert.match(text, /élément 1 .* › champ "date" : format AAAA-MM-JJ attendu/);
    assert.match(text, /élément 2 .* › champ "file" : fichier déjà enregistré/);
    assert.match(text, /élément 3 .* › champ "file" : chemin attendu sous assets\//);
    return true;
  });
});

test('une donnée sans validateur est refusée', () => {
  assert.throws(() => validateAll({ inconnu: [] }), /données "inconnu" : aucun validateur/);
});

test('les erreurs de données sont préfixées [MG]', async () => {
  const raw = await loadAll(files({ 'credits.json': '{}' }));
  assert.throws(() => validateAll(raw), (err) => err.message.startsWith('[MG] Données invalides'));
});
