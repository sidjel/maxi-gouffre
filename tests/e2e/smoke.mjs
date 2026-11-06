/**
 * Smoke test navigateur (ARCHITECTURE.md §14.2) : `npm run e2e`.
 * La page se charge aux 3 tailles de référence sans erreur ni avertissement console,
 * s'adapte à la fenêtre, affiche « Tourne ton téléphone » en portrait, et le panneau debug répond.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { SIZES, PHONE, loadPlaywright, serve, openPage, waitReady } from '../helpers/browser.js';

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

/** Mesures dans la page : plus petit texte et plus petite zone à toucher, en px réels. */
function measure(page) {
  return page.evaluate(() => {
    const stage = document.getElementById('stage');
    const scale = Number(stage.style.getPropertyValue('--stage-scale'));
    const rect = stage.getBoundingClientRect();
    let minFont = Infinity;
    let minFontText = '';
    const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const el = node.parentElement;
      if (!node.textContent.trim() || el.getClientRects().length === 0) continue;
      const real = parseFloat(getComputedStyle(el).fontSize) * scale;
      if (real < minFont) {
        minFont = real;
        minFontText = node.textContent.trim().slice(0, 40);
      }
    }
    const minTouch = Math.min(...[...stage.querySelectorAll('button')].map((b) => b.getBoundingClientRect().height));
    return {
      scale, minFont, minFontText, minTouch,
      stage: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      viewport: { width: innerWidth, height: innerHeight },
      profile: document.documentElement.dataset.profile,
      state: document.documentElement.dataset.state,
    };
  });
}

for (const size of SIZES) {
  test(`${size.name} : titre affiché, profil ${size.profile}, console propre`, async () => {
    const { context, page, problems } = await openPage(browser, { viewport: { width: size.width, height: size.height } });
    await page.goto(server.url);
    await waitReady(page);
    const m = await measure(page);
    assert.equal(m.state, 'TITLE');
    assert.equal(m.profile, size.profile);
    assert.equal(await page.locator('.title-logo').textContent(), 'MAXI-GOUFFRE');
    assert.equal(await page.locator('.btn-menu').count(), 5);
    assert.ok(await page.locator('[data-menu="title.continue"]').isDisabled(), 'Continuer grisé sans sauvegarde');
    assert.ok(await page.locator('#rotate').isHidden());
    // La scène tient dans la fenêtre, centrée.
    assert.ok(m.stage.left >= -0.5 && m.stage.top >= -0.5, JSON.stringify(m.stage));
    assert.ok(m.stage.right <= m.viewport.width + 0.5 && m.stage.bottom <= m.viewport.height + 0.5, JSON.stringify(m.stage));
    assert.ok(Math.abs(m.stage.left - (m.viewport.width - m.stage.right)) < 1, 'centrée horizontalement');
    // Lisibilité et zones à toucher (ARCHITECTURE.md §8.1).
    assert.ok(m.minFont >= 12, `texte trop petit : ${m.minFont.toFixed(1)} px réels (« ${m.minFontText} »)`);
    assert.ok(m.minTouch >= 44, `bouton trop petit : ${m.minTouch.toFixed(1)} px réels`);
    assert.deepEqual(problems, []);
    await context.close();
  });
}

test('souris : un clic sur une entrée du menu affiche le message provisoire', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.goto(server.url);
  await waitReady(page);
  await page.locator('[data-menu="title.newGame"]').click();
  const toast = page.locator('.title-toast');
  await toast.waitFor({ state: 'visible' });
  assert.match(await toast.textContent(), /Nouvelle partie/);
  assert.ok(await toast.evaluate((el) => el.classList.contains('is-visible')));
  assert.deepEqual(problems, []);
  await context.close();
});

test('redimensionnement : le profil change en direct', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1920, height: 1080 } });
  await page.goto(server.url);
  await waitReady(page);
  await page.setViewportSize({ width: 900, height: 500 });
  await page.waitForFunction(() => document.documentElement.dataset.profile === 'compact');
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.waitForFunction(() => document.documentElement.dataset.profile === 'wide');
  const m = await measure(page);
  assert.ok(Math.abs(m.scale - 1600 / 1920) < 1e-6);
  assert.deepEqual(problems, []);
  await context.close();
});

test('téléphone en paysage : profil compact, toucher un bouton répond', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 844, height: 390 }, ...PHONE });
  await page.goto(server.url);
  await waitReady(page);
  assert.equal((await measure(page)).profile, 'compact');
  assert.ok(await page.locator('#rotate').isHidden());
  await page.locator('[data-menu="title.options"]').tap();
  await page.locator('.title-toast.is-visible').waitFor();
  assert.match(await page.locator('.title-toast').textContent(), /Options/);
  assert.deepEqual(problems, []);
  await context.close();
});

test('téléphone en portrait : « Tourne ton téléphone » puis retour au jeu', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 390, height: 844 }, ...PHONE });
  await page.goto(server.url);
  await waitReady(page);
  const rotate = page.locator('#rotate');
  assert.ok(await rotate.isVisible());
  assert.match(await rotate.textContent(), /Tourne ton téléphone/);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.overlay), 'ROTATE_DEVICE');
  await page.setViewportSize({ width: 844, height: 390 });
  await rotate.waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.documentElement.dataset.overlay), '');
  assert.deepEqual(problems, []);
  await context.close();
});

test('sans ?debug=1 : ni bouton DBG ni panneau, même avec F3', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.goto(server.url);
  await waitReady(page);
  await page.keyboard.press('F3');
  assert.equal(await page.locator('[data-debug]').count(), 0);
  assert.deepEqual(problems, []);
  await context.close();
});

test('?debug=1 : F3 et DBG ouvrent le panneau, état, FPS, graine, journal', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1920, height: 1080 } });
  await page.goto(`${server.url}?debug=1`);
  await waitReady(page);
  const panel = page.locator('[data-debug="panel"]');
  const toggle = page.locator('[data-debug="toggle"]');
  assert.ok(await toggle.isVisible());
  assert.ok(await panel.isHidden());

  await page.keyboard.press('F3');
  await panel.waitFor({ state: 'visible' });
  const state = JSON.parse(await page.locator('[data-debug="state"]').textContent());
  assert.equal(state.state.main, 'TITLE');
  assert.equal(state.profile, 'wide');
  await page.waitForFunction(() => /\d+ FPS/.test(document.querySelector('[data-debug="fps"]').textContent));
  assert.match(await page.locator('[data-debug="log"]').textContent(), /BOOT → TITLE/);

  // Graine : saisie, puis même graine = mêmes tirages.
  const input = page.locator('[data-debug="seed-input"]');
  await input.fill('42');
  await input.press('Enter');
  assert.equal(await page.locator('[data-debug="seed"]').textContent(), '42');
  const draws = await page.locator('[data-debug="draws"]').textContent();
  await input.fill('7');
  await input.press('Enter');
  assert.notEqual(await page.locator('[data-debug="draws"]').textContent(), draws);
  await input.fill('42');
  await input.press('Enter');
  assert.equal(await page.locator('[data-debug="draws"]').textContent(), draws);
  await input.fill('abc');
  await input.press('Enter');
  assert.match(await page.locator('.debug-error').textContent(), /Graine invalide/);

  await toggle.click();
  await panel.waitFor({ state: 'hidden' });
  await toggle.click();
  await panel.waitFor({ state: 'visible' });
  assert.deepEqual(problems, []);
  await context.close();
});

test('sous-dossier comme sur GitHub Pages (/maxi-gouffre/) : chemins relatifs corrects', async () => {
  const sub = await serve('/maxi-gouffre/');
  try {
    const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
    await page.goto(sub.url);
    await waitReady(page);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.state), 'TITLE');
    assert.deepEqual(problems, []);
    await context.close();
  } finally {
    await sub.close();
  }
});

test('données illisibles : écran « Le magasin a planté » avec le nom du fichier', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.route('**/data/strings.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{ cassé' }));
  await page.goto(server.url);
  const crash = page.locator('#crash');
  await crash.waitFor({ state: 'visible' });
  assert.match(await page.locator('#crash-message').textContent(), /data\/strings\.json : JSON invalide/);
  assert.ok(problems.some((p) => p.includes('[MG]')), 'l\'erreur est journalisée avec le préfixe [MG]');
  await context.close();
});
