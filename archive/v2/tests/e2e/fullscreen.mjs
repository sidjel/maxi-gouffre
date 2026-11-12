/**
 * Plein écran : tentative au premier geste du joueur ; si le navigateur refuse, une fenêtre propose
 * de réessayer ; un bouton reste disponible hors plein écran ; rien ne s'affiche sans plein écran possible.
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

/** Remplace l'API du navigateur : `mode` = 'accept' | 'refuse' | 'absent'. Compte les demandes. */
function fakeFullscreen(page, mode) {
  return page.addInitScript((m) => {
    window.__fsCalls = 0;
    let element = null;
    Object.defineProperty(Document.prototype, 'fullscreenElement', { configurable: true, get: () => element });
    if (m === 'absent') {
      Element.prototype.requestFullscreen = undefined;
      return;
    }
    Element.prototype.requestFullscreen = function request() {
      window.__fsCalls += 1;
      if (m === 'refuse') return Promise.reject(new TypeError('Permissions check failed'));
      element = this;
      document.dispatchEvent(new Event('fullscreenchange'));
      return Promise.resolve();
    };
    window.__exitFullscreen = () => {
      element = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    };
  }, mode);
}

const visible = (page, name) => page.locator(`[data-fullscreen="${name}"]`).isVisible();

test('navigateur qui accepte : plein écran dès le premier clic, bouton masqué ; après Échap, le bouton revient', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await fakeFullscreen(page, 'accept');
  await page.goto(server.url);
  await waitReady(page);
  assert.ok(await visible(page, 'toggle'), 'bouton visible avant le premier geste');
  await enterStore(page, 'mouse');
  assert.equal(await page.evaluate(() => window.__fsCalls), 1);
  assert.ok(!(await visible(page, 'toggle')));
  assert.ok(!(await visible(page, 'dialog')));
  await page.evaluate(() => window.__exitFullscreen());
  assert.ok(await visible(page, 'toggle'));
  await page.locator('[data-menu="title.credits"]').click();
  assert.equal(await page.evaluate(() => window.__fsCalls), 1, 'pas de nouvelle tentative automatique : le joueur est sorti exprès');
  await page.locator('[data-fullscreen="toggle"]').click();
  assert.equal(await page.evaluate(() => window.__fsCalls), 2);
  assert.ok(!(await visible(page, 'toggle')));
  assert.deepEqual(problems, []);
  await context.close();
});

test('navigateur qui refuse (téléphone) : fenêtre « Jouer en plein écran ? », « Plus tard », bouton qui reste', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 844, height: 390 }, ...PHONE });
  await fakeFullscreen(page, 'refuse');
  await page.goto(server.url);
  await waitReady(page);
  await enterStore(page, 'touch');
  await page.locator('[data-fullscreen="dialog"]').waitFor({ state: 'visible' });
  assert.match(await page.locator('[data-fullscreen="dialog"]').textContent(), /Jouer en plein écran/);
  await page.locator('[data-fullscreen="accept"]').tap();
  assert.equal(await page.evaluate(() => window.__fsCalls), 2, 'le bouton de la fenêtre redemande le plein écran');
  assert.ok(!(await visible(page, 'dialog')));
  await page.locator('[data-menu="title.credits"]').tap();
  assert.ok(!(await visible(page, 'dialog')), 'la fenêtre ne revient pas à chaque toucher');
  assert.ok(await visible(page, 'toggle'));
  assert.deepEqual(problems, []);
  await context.close();
});

test('« Plus tard » ferme la fenêtre sans rien demander', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 844, height: 390 }, ...PHONE });
  await fakeFullscreen(page, 'refuse');
  await page.goto(server.url);
  await waitReady(page);
  await enterStore(page, 'touch');
  await page.locator('[data-fullscreen="later"]').tap();
  assert.ok(!(await visible(page, 'dialog')));
  assert.equal(await page.evaluate(() => window.__fsCalls), 1);
  assert.deepEqual(problems, []);
  await context.close();
});

test('sans plein écran possible (comme sur iPhone) : ni bouton ni fenêtre', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 844, height: 390 }, ...PHONE });
  await fakeFullscreen(page, 'absent');
  await page.goto(server.url);
  await waitReady(page);
  await enterStore(page, 'touch');
  assert.equal(await page.locator('[data-fullscreen]').count(), 0);
  assert.deepEqual(problems, []);
  await context.close();
});

test('vrai navigateur : le premier clic passe en plein écran ou affiche la fenêtre, sans erreur console', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.goto(server.url);
  await waitReady(page);
  await enterStore(page, 'mouse');
  await page.waitForFunction(() => document.fullscreenElement || !document.querySelector('[data-fullscreen="dialog"]').hidden);
  assert.deepEqual(problems, []);
  await context.close();
});
