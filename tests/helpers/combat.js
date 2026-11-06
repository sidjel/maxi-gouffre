/**
 * Pilotage d'un combat dans le navigateur (tests et captures), à la souris ou au doigt.
 */

/** État affiché (html[data-state]). */
export const stateOf = (page) => page.evaluate(() => document.documentElement.dataset.state);

/** Clique (souris) ou touche (doigt) le premier élément qui correspond. */
export function press(page, selector, how) {
  const target = page.locator(selector).first();
  return how === 'touch' ? target.tap() : target.click();
}

/** Attend que l'état affiché quitte `from`. */
export function waitLeave(page, from, timeout = 8000) {
  return page.waitForFunction((s) => document.documentElement.dataset.state !== s, from, { timeout });
}

/** Depuis le titre : lance un combat rapide et passe le chifoumi jusqu'à la première manche. */
export async function startQuickMatch(page, how) {
  await press(page, '[data-menu="title.quickMatch"]', how);
  await page.waitForSelector('[data-dialog="chifoumi"]:not([hidden])');
  await finishChifoumi(page, how);
}

/** Joue le chifoumi (Pierre, rejoué si égalité), choisit de commencer ou lance la manche. */
export async function finishChifoumi(page, how) {
  for (let i = 0; i < 40 && (await stateOf(page)) === 'CHIFOUMI'; i += 1) {
    if (await page.locator('[data-action="throw"]').count()) await press(page, '[data-throw="rock"]', how);
    else if (await page.locator('[data-action="starter"]').count()) await press(page, '[data-starter="player"]', how);
    else if (await page.locator('[data-action="go"]').count()) await press(page, '[data-action="go"]', how);
    else await page.waitForTimeout(100);
  }
}

/** Pose la première carte de la main (ou celle qui correspond à `card`) sur la première case légale. */
export async function playFirstCard(page, how, card = '.hand .card') {
  const before = await page.locator('.hand .card').count();
  await press(page, card, how);
  await page.waitForSelector('.cell.is-legal');
  await press(page, '.cell.is-legal', how);
  await page.waitForFunction((n) => document.querySelectorAll('.hand .card').length === n - 1, before);
}

/** Passe, avec la confirmation « Oui, je passe ». */
export async function passTurn(page, how) {
  await press(page, '[data-action="pass"]', how);
  await press(page, '[data-action="passYes"]', how);
  // Après un passe, le tour quitte toujours le joueur (l'IA continue, ou la manche se termine).
  await waitLeave(page, 'PLAYER_TURN');
}

/**
 * Joue un match complet : jusqu'à `perRound` cartes par manche, puis passe.
 * @returns {Promise<{ rounds: number, played: number }>}
 */
export async function playMatch(page, how, perRound = 3) {
  let played = 0;
  let playedThisRound = 0;
  let rounds = 0;
  for (let step = 0; step < 200; step += 1) {
    const state = await stateOf(page);
    if (state === 'MATCH_END') return { rounds: rounds + 1, played };
    if (state === 'CHIFOUMI') await finishChifoumi(page, how);
    else if (state === 'OPPONENT_TURN') await waitLeave(page, 'OPPONENT_TURN');
    else if (state === 'ROUND_END') {
      rounds += 1;
      playedThisRound = 0;
      await press(page, '[data-action="nextRound"]', how);
      await waitLeave(page, 'ROUND_END');
    } else if (state === 'PLAYER_TURN') {
      const cards = await page.locator('.hand .card').count();
      if (cards > 0 && playedThisRound < perRound) {
        await playFirstCard(page, how);
        played += 1;
        playedThisRound += 1;
      } else {
        await passTurn(page, how);
      }
    } else {
      await page.waitForTimeout(100);
    }
  }
  throw new Error('match trop long');
}
