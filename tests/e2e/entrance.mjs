/**
 * Accueil (DIRECTION_ARTISTIQUE.md §7) : portes fermées puis ouvertes, menu en panneaux de rayon,
 * RUPTURE DE STOCK, portes qui se referment après une inactivité, crédits en ticket de caisse,
 * « Réduire les animations » et « Réduire les clignotements ».
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PHONE, loadPlaywright, serve, openPage, waitReady, enterStore } from '../helpers/browser.js';

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

const stateOf = (page) => page.evaluate(() => document.documentElement.dataset.state);
const animationOf = (page, selector) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).animationName);

test('portes fermées au chargement : menu inactif ; une touche du clavier les ouvre', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1920, height: 1080 } });
  await page.goto(server.url);
  await waitReady(page);
  assert.equal(await stateOf(page), 'PRESS_KEY');
  assert.ok(await page.locator('.title-prompt').isVisible());
  assert.ok(await page.locator('.title-menu').evaluate((el) => el.inert), 'menu inerte derrière les portes');
  await enterStore(page, 'keyboard');
  assert.ok(!(await page.locator('.title-menu').evaluate((el) => el.inert)));
  assert.ok(await page.locator('.title-prompt').isHidden());
  // Les portes ont glissé hors de l'entrée.
  const doors = await page.locator('.door').evaluateAll((list) => list.map((d) => new DOMMatrix(getComputedStyle(d).transform).m41));
  assert.ok(doors[0] < 0 && doors[1] > 0, JSON.stringify(doors));
  const cont = page.locator('[data-menu="title.continue"]');
  assert.ok(await cont.isDisabled());
  assert.match(await cont.textContent(), /RUPTURE DE STOCK/);
  assert.match(await cont.getAttribute('aria-label'), /rupture de stock/);
  assert.equal(await page.locator('.neon-letter').count(), 'MAXI-GOUFFRE'.length);
  assert.deepEqual(problems, []);
  await context.close();
});

test('le toucher qui ouvre les portes ne déclenche pas le panneau qui est derrière', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 844, height: 390 }, ...PHONE });
  await page.goto(server.url);
  await waitReady(page);
  // Toucher là où se trouve « Combat rapide », derrière la vitre.
  const box = await page.locator('[data-menu="title.quickMatch"]').boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForFunction(() => document.documentElement.dataset.state === 'TITLE');
  await page.waitForTimeout(300);
  assert.equal(await stateOf(page), 'TITLE');
  assert.deepEqual(problems, []);
  await context.close();
});

test('inactivité : les portes se referment à moitié avec une remarque, une action les rouvre', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.clock.install();
  await page.goto(server.url);
  await waitReady(page);
  await enterStore(page, 'mouse');
  await page.clock.runFor(46000);
  await page.locator('.storefront.is-closing').waitFor();
  assert.match(await page.locator('.title-announce').textContent(), /\S/);
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(() => !document.querySelector('.storefront').classList.contains('is-closing'));
  assert.equal(await page.locator('.title-announce').textContent(), '');
  assert.deepEqual(problems, []);
  await context.close();
});

test('un caddie traverse le fond de temps en temps', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.clock.install();
  await page.goto(server.url);
  await waitReady(page);
  await enterStore(page, 'mouse');
  await page.clock.runFor(23000);
  await page.locator('.store-cart.is-rolling').waitFor({ state: 'attached' });
  assert.deepEqual(problems, []);
  await context.close();
});

test('crédits : un ticket de caisse généré depuis le registre, Retour ramène au titre (portes ouvertes)', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.goto(server.url);
  await waitReady(page);
  await enterStore(page, 'mouse');
  await page.locator('[data-menu="title.credits"]').click();
  assert.equal(await stateOf(page), 'CREDITS');
  const receipt = await page.locator('.receipt').textContent();
  assert.match(receipt, /Illustrations provisoires des cartes/);
  assert.match(receipt, /× 66/);
  assert.match(receipt, /Lilita One|Juan Montoreano/);
  // Le ticket défile tout seul.
  await page.waitForFunction(() => document.querySelector('.receipt-scroll').scrollTop > 20);
  await page.locator('[data-action="back"]').click();
  assert.equal(await stateOf(page), 'TITLE');
  assert.ok(await page.locator('.storefront.is-open.is-entered').count());
  assert.deepEqual(problems, []);
  await context.close();
});

test('« Réduire les animations » : portes ouvertes sans attendre, ni balancement, ni grésillement', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  await page.goto(server.url);
  await waitReady(page);
  assert.equal(await animationOf(page, '.neon-letter.is-flicker'), 'none');
  assert.equal(await animationOf(page, '.aisle-sign-face'), 'none');
  await page.locator('.store-entrance').click();
  await page.waitForFunction(() => document.documentElement.dataset.state === 'TITLE', null, { timeout: 500 });
  assert.deepEqual(problems, []);
  await context.close();
});

test('« Réduire les clignotements » (?reduceFlashes=1) : l\'enseigne ne grésille plus', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.goto(`${server.url}?reduceFlashes=1`);
  await waitReady(page);
  assert.equal(await animationOf(page, '.neon-letter.is-flicker'), 'none');
  await page.goto(server.url);
  await waitReady(page);
  assert.equal(await animationOf(page, '.neon-letter.is-flicker'), 'neon-flicker');
  assert.deepEqual(problems, []);
  await context.close();
});
