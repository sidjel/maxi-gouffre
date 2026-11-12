/**
 * Habillage des cartes (DIRECTION_ARTISTIQUE.md §2) : illustrations chargées, finitions, reflet qui
 * suit la souris, scintillement de la carte sélectionnée, vol puis laser à la pose ; lisibilité
 * (texte ≥ 12 px réels) aux 3 tailles.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { SIZES, PHONE, loadPlaywright, serve, openPage, waitReady } from '../helpers/browser.js';
import { startQuickMatch, stateOf, waitLeave, press } from '../helpers/combat.js';

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

const contextFor = (size) => (size.profile === 'compact'
  ? { viewport: { width: size.width, height: size.height }, ...PHONE }
  : { viewport: { width: size.width, height: size.height } });

/** Plus petit texte visible dans la main et sur le plateau, en px réels. */
function minCardFont(page) {
  return page.evaluate(() => {
    const scale = Number(document.getElementById('stage').style.getPropertyValue('--stage-scale'));
    let min = Infinity;
    let text = '';
    for (const card of document.querySelectorAll('.hand .card, .cell .card')) {
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const el = walker.currentNode.parentElement;
        if (!walker.currentNode.textContent.trim() || el.getClientRects().length === 0) continue;
        const real = parseFloat(getComputedStyle(el).fontSize) * scale;
        if (real < min) [min, text] = [real, walker.currentNode.textContent.trim()];
      }
    }
    return { min, text };
  });
}

for (const size of SIZES) {
  test(`${size.name} : illustrations chargées, finitions, texte lisible sur les cartes`, async () => {
    const how = size.profile === 'compact' ? 'touch' : 'mouse';
    const { context, page, problems } = await openPage(browser, contextFor(size));
    await page.goto(`${server.url}?debug=1&aiDelay=0`);
    await waitReady(page);
    await startQuickMatch(page, how);
    const imgs = page.locator('.hand .card-art-img');
    await page.waitForFunction(() => [...document.querySelectorAll('.hand .card-art-img')].every((i) => i.complete && i.naturalWidth > 0));
    assert.equal(await imgs.count(), await page.locator('.hand .card').count());
    const finishes = await page.locator('.hand .card').evaluateAll((list) => list.map((c) => [...c.classList].find((k) => k.startsWith('finish-'))));
    assert.ok(finishes.every(Boolean), JSON.stringify(finishes));
    if ((await stateOf(page)) === 'OPPONENT_TURN') await waitLeave(page, 'OPPONENT_TURN');
    const font = await minCardFont(page);
    assert.ok(font.min >= 12, `texte trop petit sur une carte : ${font.min.toFixed(1)} px réels (« ${font.text} »)`);
    assert.deepEqual(problems, []);
    await context.close();
  });
}

test('souris : le reflet suit le pointeur, la carte sélectionnée scintille, la pose déclenche vol et laser', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1920, height: 1080 } });
  await page.goto(`${server.url}?debug=1&aiDelay=0`);
  await waitReady(page);
  await startQuickMatch(page, 'mouse');
  if ((await stateOf(page)) === 'OPPONENT_TURN') await waitLeave(page, 'OPPONENT_TURN');
  // La dernière carte de l'éventail n'est recouverte par aucune autre.
  const card = page.locator('.hand .card').last();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2);
  await page.waitForFunction(() => document.querySelector('.hand .card.is-lit'));
  const sx = await page.locator('.hand .card.is-lit').evaluate((el) => Number(el.style.getPropertyValue('--sx')));
  assert.ok(sx > 0.5, `--sx = ${sx}`);
  await press(page, '.hand .card', 'mouse');
  assert.equal(await animationOf(page, '.hand .card.is-selected .card-sparkle'), 'twinkle');
  await page.locator('.cell.is-legal').first().click();
  // La carte vole (copie au-dessus de la scène), puis le laser la balaie.
  await page.locator('.card-flight').first().waitFor({ state: 'attached' });
  await page.locator('.cell .card.is-scanning').first().waitFor({ state: 'attached' });
  await page.waitForFunction(() => !document.querySelector('.card-flight'));
  assert.deepEqual(problems, []);
  await context.close();
});

test('« Réduire les animations » : pas de vol ni de laser à la pose', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  await page.goto(`${server.url}?debug=1&aiDelay=0`);
  await waitReady(page);
  await startQuickMatch(page, 'mouse');
  if ((await stateOf(page)) === 'OPPONENT_TURN') await waitLeave(page, 'OPPONENT_TURN');
  await press(page, '.hand .card', 'mouse');
  await page.locator('.cell.is-legal').first().click();
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.card-flight').count(), 0);
  assert.equal(await page.locator('.cell .card.is-scanning').count(), 0);
  assert.deepEqual(problems, []);
  await context.close();
});

function animationOf(page, selector) {
  return page.locator(selector).first().evaluate((el) => getComputedStyle(el).animationName);
}
