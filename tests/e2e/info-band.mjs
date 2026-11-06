/**
 * Bandeau d'information (retour de l'auteur sur le J1) : pour chacune des 26 cartes à ses 3 stades,
 * ce qui sert à jouer (nom, fraîcheur, effet, Malus) se lit sans faire défiler, sur grand écran comme
 * sur téléphone ; sur grand écran, le texte d'ambiance aussi. Seule l'évolution sur 3 stades, en retrait
 * en bas, peut demander de faire défiler le bandeau.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { SIZES, PHONE, loadPlaywright, serve, openPage, waitReady } from '../helpers/browser.js';
import { startQuickMatch } from '../helpers/combat.js';

let browser;
let server;

before(async () => {
  const { chromium } = await loadPlaywright();
  browser = await chromium.launch();
  server = await serve();
});

after(async () => {
  await browser?.close();
  await server?.close();
});

/** Monte un bandeau de test à la place du vrai et y affiche chaque carte à chaque stade. */
function measureAllCards(page) {
  return page.evaluate(async () => {
    const { loadAll, browserFetcher } = await import('./src/content/loader.js');
    const { validateAll } = await import('./src/content/validate.js');
    const { createStrings } = await import('./src/ui/strings.js');
    const { createInfoBand } = await import('./src/ui/components/InfoBand.js');
    const { GAME } = await import('./src/config.js');
    const defs = validateAll(await loadAll(browserFetcher(new URL('data/', location.href))));
    const band = createInfoBand({ t: createStrings(defs.strings), rules: GAME });
    const real = document.querySelector('.panel-right .info-band');
    real.after(band.el);
    real.hidden = true;
    const out = [];
    for (const def of Object.values(defs.cards)) {
      def.stages.forEach((s, i) => {
        band.update({
          uid: 'x', cardId: def.id, owner: 'player', age: 0, stage: i + 1, stageLocked: false, def,
          name: s.name, power: s.power, placeable: s.placeable !== false, effects: s.effects,
          tags: [...def.tags, ...s.tags], flavor: s.flavor ?? null, image: null,
        });
        const box = band.el.getBoundingClientRect();
        const bottom = (sel) => {
          const node = band.el.querySelector(sel);
          return node.hidden ? -Infinity : node.getBoundingClientRect().bottom;
        };
        out.push({
          card: `${def.id} stade ${i + 1}`,
          over: Math.round(Math.max(bottom('.info-effect'), bottom('.info-malus')) - box.bottom),
          overFlavor: Math.round(bottom('.info-flavor') - box.bottom),
          scrollable: getComputedStyle(band.el).overflowY === 'auto',
        });
      });
    }
    return out;
  });
}

for (const size of SIZES) {
  test(`${size.name} : les 26 cartes à leurs 3 stades se lisent dans le panneau de droite`, async () => {
    const phone = size.profile === 'compact' ? PHONE : {};
    const { context, page, problems } = await openPage(browser, { viewport: { width: size.width, height: size.height }, ...phone });
    await page.goto(`${server.url}?debug=1&aiDelay=0`);
    await waitReady(page);
    await startQuickMatch(page, phone.hasTouch ? 'touch' : 'mouse');
    const results = await measureAllCards(page);
    assert.equal(results.length, 78);
    const cut = (key) => results.filter((r) => r[key] > 0.5).map((r) => `${r.card} (+${r[key]} px)`);
    assert.deepEqual(cut('over'), [], 'effet ou Malus coupé sans défilement');
    if (size.profile === 'wide') assert.deepEqual(cut('overFlavor'), [], 'texte d\'ambiance coupé sur grand écran');
    assert.ok(results.every((r) => r.scrollable), 'le bandeau défile');
    assert.deepEqual(problems, []);
    await context.close();
  });
}

test('sans carte visée, le panneau rappelle les règles', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 844, height: 390 }, ...PHONE });
  await page.goto(`${server.url}?debug=1&aiDelay=0`);
  await waitReady(page);
  await startQuickMatch(page, 'touch');
  const help = page.locator('.info-help');
  assert.ok(await help.isVisible());
  assert.match(await help.textContent(), /Comment jouer/);
  assert.match(await help.textContent(), /2 manches gagnées/);
  assert.deepEqual(problems, []);
  await context.close();
});

test('téléphone : le défilement du panneau reste en place quand l\'écran se rafraîchit ou qu\'on lève le doigt', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 844, height: 390 }, ...PHONE });
  await page.goto(`${server.url}?debug=1&aiDelay=0`);
  await waitReady(page);
  await startQuickMatch(page, 'touch');
  await page.locator('.hand .card.is-malus').first().tap();
  const band = page.locator('.panel-right .info-band');
  await band.evaluate((el) => { el.scrollTop = 40; });
  const before = await band.evaluate((el) => el.scrollTop);
  assert.ok(before > 0, 'la fiche défile');
  // Doigt levé (pointerleave au toucher), puis rafraîchissement de l'écran (bouton « À plat »).
  await page.locator('.screen-combat').dispatchEvent('pointerleave', { pointerType: 'touch' });
  await page.locator('[data-action="flat"]').tap();
  assert.equal(await band.evaluate((el) => el.scrollTop), before);
  // Une autre carte : la fiche repart du haut.
  await page.locator('.hand .card:not(.is-malus)').first().tap();
  assert.equal(await band.evaluate((el) => el.scrollTop), 0);
  assert.deepEqual(problems, []);
  await context.close();
});
