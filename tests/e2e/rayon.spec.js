import { test, expect } from '@playwright/test';
import { openGame, mg, playerPos, cardCount, expectClean } from './helpers.js';

test('le rayon se charge, le narrateur accueille, aucune erreur', async ({ page }) => {
  const problems = await openGame(page);
  await expect(page.locator('.narrator.is-on')).toBeVisible({ timeout: 4000 });
  await expect(page.locator('.narrator-text')).toContainText('rayon 7', { timeout: 6000 });
  await expect(page.locator('.product')).toHaveCount(10);
  await page.waitForTimeout(500);
  await expectClean(problems);
});

test('PC : marcher au clavier, le personnage se retourne', async ({ page, isMobile }) => {
  test.skip(isMobile, 'clavier : PC seulement');
  const problems = await openGame(page);
  const start = await playerPos(page);
  await page.keyboard.down('KeyD'); await page.waitForTimeout(500); await page.keyboard.up('KeyD');
  const right = await playerPos(page);
  expect(right.x).toBeGreaterThan(start.x + 80);
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(400); await page.keyboard.up('ArrowLeft');
  expect(await mg(page, () => __MG__.char.side)).toBe(-1);
  await page.keyboard.down('KeyW'); await page.waitForTimeout(500); await page.keyboard.up('KeyW');
  const up = await playerPos(page);
  expect(up.y).toBeLessThan(right.y);
  expect(await mg(page, () => __MG__.char.view)).toBe('back');
  await expectClean(problems);
});

test('PC : clic sur le sol pour y aller, sans traverser les obstacles', async ({ page, isMobile }) => {
  test.skip(isMobile, 'souris : PC seulement');
  const problems = await openGame(page);
  const stage = await page.locator('#stage').boundingBox();
  const s = stage.width / 1920;
  // Clic derrière la palette d'eau : il faut la contourner.
  const cam = await mg(page, () => __MG__.camera.x);
  await page.mouse.click(stage.x + (1525 - cam) * s, stage.y + 760 * s);
  await expect.poll(async () => (await playerPos(page)).x, { timeout: 8000 }).toBeGreaterThan(1300);
  await expectClean(problems);
});

test('PC : scanner un produit donne une carte dans le Panier', async ({ page, isMobile }) => {
  test.skip(isMobile, 'clavier : PC seulement');
  const problems = await openGame(page, '&typeCps=150&narratorHoldMs=800');
  await expect.poll(() => mg(page, () => __MG__.products.near?.product.id)).toBe('banane');
  await page.keyboard.press('Enter');
  await expect(page.locator('.reveal-card .card')).toBeVisible();
  await expect.poll(() => cardCount(page), { timeout: 5000 }).toBe(1);
  await expect(page.locator('.hud-count')).toHaveText('1');
  await expect(page.locator('[data-product="banane"]')).toHaveClass(/is-gone/);
  await page.keyboard.press('Enter');
  await expect(page.locator('.narrator[data-event="already"]')).toBeVisible({ timeout: 10000 });
  await page.keyboard.press('KeyP');
  await expect(page.locator('.basket')).toBeVisible();
  await expect(page.locator('.basket .card')).toHaveCount(1);
  await expect(page.locator('.basket .card-name')).toHaveText('Banane');
  await expect(page.locator('.basket .card-stage')).toHaveText(/Frais|Mûr|Pourri/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.basket')).toBeHidden();
  await expectClean(problems);
});

test('réglages (F2) : une valeur changée s’applique et reste après rechargement', async ({ page, isMobile }) => {
  test.skip(isMobile, 'clavier : PC seulement');
  const problems = await openGame(page);
  await page.keyboard.press('F2');
  await expect(page.locator('.settings')).toBeVisible();
  await page.locator('input[data-key="walkSpeed"]').fill('800');
  expect(await mg(page, () => __MG__.config.walkSpeed)).toBe(800);
  await page.keyboard.press('Escape');
  await expect(page.locator('.settings')).toBeHidden();
  await page.reload();
  await page.waitForFunction(() => window.__MG__);
  expect(await mg(page, () => __MG__.config.walkSpeed)).toBe(800);
  await page.keyboard.press('F3');
  await expect(page.locator('.debug-mask')).toBeVisible();
  await expectClean(problems);
});

test('téléphone : toucher un produit pour y aller, puis pour le scanner', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'tactile : téléphone seulement');
  const problems = await openGame(page);
  const lait = page.locator('[data-product="lait"]');
  await lait.tap();
  await expect.poll(() => mg(page, () => __MG__.products.near?.product.id), { timeout: 5000 }).toBe('lait');
  await expect.poll(() => mg(page, () => __MG__.player.hasPath())).toBe(false);
  await lait.tap();
  await expect.poll(() => cardCount(page), { timeout: 6000 }).toBe(1);
  await page.locator('.hud-basket').tap();
  await expect(page.locator('.basket .card')).toHaveCount(1);
  await page.locator('.basket-close').tap();
  await expect(page.locator('.basket')).toBeHidden();
  await expectClean(problems);
});

test('téléphone : joystick virtuel et bouton d’action', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'tactile : téléphone seulement');
  const problems = await openGame(page, '&joystick=1');
  const joy = await page.locator('.joystick').boundingBox();
  const cx = joy.x + joy.width / 2; const cy = joy.y + joy.height / 2;
  const start = await playerPos(page);
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', cx, cy);
  await touch('touchMove', cx + joy.width * 0.4, cy);
  await page.waitForTimeout(600);
  await touch('touchEnd');
  expect((await playerPos(page)).x).toBeGreaterThan(start.x + 60);
  await page.locator('.hud-action').tap();
  await expectClean(problems);
});
