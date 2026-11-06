/**
 * Parcours navigateur du J1 (ARCHITECTURE.md §14.2) : jouer un match complet au pointeur,
 * à la souris puis au doigt, console sans erreur ni avertissement. Délai réel de l'IA.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { SIZES, PHONE, loadPlaywright, serve, openPage, waitReady } from '../helpers/browser.js';
import { stateOf, press, startQuickMatch, playFirstCard, playMatch, waitLeave } from '../helpers/combat.js';

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

/** Plus petit texte, plus petites cases et cartes de la main, en px réels. */
function measureCombat(page) {
  return page.evaluate(() => {
    const stage = document.getElementById('stage');
    const scale = Number(stage.style.getPropertyValue('--stage-scale'));
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
    const rects = (sel) => [...stage.querySelectorAll(sel)].filter((e) => e.getClientRects().length).map((e) => e.getBoundingClientRect());
    const cells = rects('.cell');
    const buttons = rects('.panel-right button');
    const cards = [...stage.querySelectorAll('.hand .card')];
    // Partie visible d'une carte de la main : jusqu'au bord de la suivante.
    const visible = cards.map((c, i) => {
      const r = c.getBoundingClientRect();
      const next = cards[i + 1]?.getBoundingClientRect();
      return next ? Math.min(r.width, next.left - r.left) : r.width;
    });
    return {
      minFont, minFontText,
      minCell: Math.min(...cells.map((r) => Math.min(r.width, r.height))),
      minButton: Math.min(...buttons.map((r) => r.height)),
      minHandCard: Math.min(...visible),
      cells: cells.length,
    };
  });
}

test('souris (1920×1080) : un match complet contre l\'IA Noob, puis Rejouer et Retour au titre', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1920, height: 1080 } });
  await page.goto(server.url);
  await waitReady(page);
  await startQuickMatch(page, 'mouse');
  assert.match(await stateOf(page), /^(PLAYER|OPPONENT)_TURN$/);
  const result = await playMatch(page, 'mouse');
  assert.ok(result.played >= 1);
  const dialog = page.locator('[data-dialog="match"]');
  assert.ok(await dialog.isVisible());
  assert.match(await dialog.textContent(), /Victoire|Défaite/);
  assert.match(await dialog.textContent(), /Manche 1 : toi \d+ – \d+ Chad Prot'/);
  await press(page, '[data-action="again"]', 'mouse');
  await page.waitForSelector('[data-dialog="chifoumi"]:not([hidden])');
  assert.equal(await stateOf(page), 'CHIFOUMI');
  assert.equal(await page.locator('.hand .card').count(), 10, 'nouvelle main complète');
  assert.deepEqual(problems, []);
  await context.close();
});

test('doigt (téléphone 844×390) : un match complet au toucher', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 844, height: 390 }, ...PHONE });
  await page.goto(server.url);
  await waitReady(page);
  await startQuickMatch(page, 'touch');
  await playMatch(page, 'touch', 4);
  assert.ok(await page.locator('[data-dialog="match"]').isVisible());
  await press(page, '[data-action="toTitle"]', 'touch');
  await page.waitForSelector('.screen-title');
  assert.equal(await stateOf(page), 'TITLE');
  assert.deepEqual(problems, []);
  await context.close();
});

test('passer demande une confirmation ; « Non » annule ; touche P deux fois confirme', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.goto(server.url);
  await waitReady(page);
  await startQuickMatch(page, 'mouse');
  if ((await stateOf(page)) === 'OPPONENT_TURN') await waitLeave(page, 'OPPONENT_TURN');
  await press(page, '[data-action="pass"]', 'mouse');
  assert.match(await page.locator('.actions-question').first().textContent(), /Passer pour toute la manche/);
  await press(page, '[data-action="passNo"]', 'mouse');
  assert.equal(await stateOf(page), 'PLAYER_TURN', 'toujours mon tour');
  assert.ok(await page.locator('.score-player .score-passed').isHidden());
  await page.keyboard.press('KeyP');
  assert.ok(await page.locator('[data-action="passYes"]').isVisible());
  await page.keyboard.press('KeyP');
  await page.waitForSelector('.score-player .score-passed:not([hidden])');
  assert.notEqual(await stateOf(page), 'PLAYER_TURN', 'passer est définitif pour la manche');
  assert.deepEqual(problems, []);
  await context.close();
});

test('Malus : ses cases légales sont dans le camp adverse ; toucher la carte annule la sélection', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.goto(server.url);
  await waitReady(page);
  await startQuickMatch(page, 'mouse');
  if ((await stateOf(page)) === 'OPPONENT_TURN') await waitLeave(page, 'OPPONENT_TURN');
  const malus = page.locator('.hand .card.is-malus').first();
  await malus.click();
  await page.waitForSelector('.cell.is-legal');
  assert.equal(await page.locator('.camp-player .cell.is-legal').count(), 0);
  assert.ok(await page.locator('.camp-opponent .cell.is-legal').count() > 0);
  assert.match(await page.locator('.combat-status').textContent(), /Malus/);
  await malus.click();
  assert.equal(await page.locator('.cell.is-legal').count(), 0, 'deuxième clic : sélection annulée');
  await malus.click();
  await press(page, '.camp-opponent .cell.is-legal', 'mouse');
  await page.waitForSelector('.camp-opponent .card.is-malus');
  const score = Number(await page.locator('[data-score="opponent"]').textContent());
  assert.ok(score >= 0, 'score plancher à 0');
  assert.deepEqual(problems, []);
  await context.close();
});

test('plateau à plat, puis Quitter avec confirmation ramène au titre', async () => {
  const { context, page, problems } = await openPage(browser, { viewport: { width: 1280, height: 720 } });
  await page.goto(server.url);
  await waitReady(page);
  await startQuickMatch(page, 'mouse');
  await press(page, '[data-action="flat"]', 'mouse');
  assert.ok(await page.locator('.board.is-flat').count() === 1);
  await press(page, '[data-action="flat"]', 'mouse');
  assert.ok(await page.locator('.board.is-flat').count() === 0);
  await press(page, '[data-action="quit"]', 'mouse');
  await press(page, '[data-action="quitYes"]', 'mouse');
  await page.waitForSelector('.screen-title');
  assert.equal(await stateOf(page), 'TITLE');
  assert.deepEqual(problems, []);
  await context.close();
});

for (const size of SIZES) {
  test(`${size.name} : combat lisible, cases et cartes assez grandes pour le doigt`, async () => {
    const phone = size.profile === 'compact' ? PHONE : {};
    const { context, page, problems } = await openPage(browser, { viewport: { width: size.width, height: size.height }, ...phone });
    await page.goto(server.url);
    await waitReady(page);
    await startQuickMatch(page, phone.hasTouch ? 'touch' : 'mouse');
    if ((await stateOf(page)) === 'OPPONENT_TURN') await waitLeave(page, 'OPPONENT_TURN');
    // Une carte à effet sur le plateau : son icône est le plus petit texte d'une carte posée.
    await playFirstCard(page, phone.hasTouch ? 'touch' : 'mouse', '.hand .card.has-effect');
    const m = await measureCombat(page);
    console.log(`    ${size.name} : texte ${m.minFont.toFixed(1)} px, case ${m.minCell.toFixed(1)} px, bouton ${m.minButton.toFixed(1)} px, carte ${m.minHandCard.toFixed(1)} px`);
    assert.equal(m.cells, 20);
    assert.ok(m.minFont >= 12, `texte trop petit : ${m.minFont.toFixed(1)} px réels (« ${m.minFontText} »)`);
    assert.ok(m.minCell >= 44, `case trop petite : ${m.minCell.toFixed(1)} px réels`);
    assert.ok(m.minButton >= 44, `bouton trop petit : ${m.minButton.toFixed(1)} px réels`);
    assert.ok(m.minHandCard >= 44, `carte de la main trop étroite : ${m.minHandCard.toFixed(1)} px réels`);
    assert.deepEqual(problems, []);
    await context.close();
  });
}
