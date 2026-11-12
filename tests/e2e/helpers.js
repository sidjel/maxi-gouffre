import { expect } from '@playwright/test';

/** Ouvre le jeu (scan accéléré pour les tests) et relève toute erreur ou tout avertissement de la console. */
export async function openGame(page, params = '') {
  const problems = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requête échouée : ${r.url()}`));
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost:4173/') && !r.url().startsWith('data:')) problems.push(`requête externe : ${r.url()}`); });
  await page.goto(`/?scanMs=500&cardHoldMs=300&flipMs=80${params}`);
  await page.waitForFunction(() => window.__MG__);
  return problems;
}

export const mg = (page, fn) => page.evaluate(fn);
export const playerPos = (page) => mg(page, () => ({ x: __MG__.player.x, y: __MG__.player.y }));
export const cardCount = (page) => mg(page, () => __MG__.basketCards.length);

export async function expectClean(problems) {
  expect(problems, problems.join('\n')).toEqual([]);
}
