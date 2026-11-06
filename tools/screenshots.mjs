#!/usr/bin/env node
/**
 * Captures d'écran aux 3 tailles de référence : titre, combat (chifoumi, sélection, Malus, plateau à plat,
 * fin de manche, fin de match), téléphone (paysage, portrait) et panneau debug.
 * `npm run shots` (dossier par défaut : docs/captures/j1) ou `npm run shots -- --out docs/captures/jN`.
 * Échoue si la console affiche une erreur ou un avertissement.
 */
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIZES, PHONE, loadPlaywright, serve, openPage, waitReady } from '../tests/helpers/browser.js';
import { ROOT } from './files.mjs';
import { stateOf, press, startQuickMatch, playFirstCard, playMatch, waitLeave } from '../tests/helpers/combat.js';

const DEFAULT_OUT = 'docs/captures/j1';
const WIDE = { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 };
const PHONE_LANDSCAPE = { viewport: { width: 844, height: 390 }, ...PHONE };

/** Attend que ce soit au joueur de jouer. */
async function myTurn(page) {
  if ((await stateOf(page)) === 'OPPONENT_TURN') await waitLeave(page, 'OPPONENT_TURN');
}

/** Début de match : deux poses, puis une carte sélectionnée (cases légales en surbrillance). */
async function midMatch(page, how, pick = '.hand .card') {
  await startQuickMatch(page, how);
  for (let i = 0; i < 2; i += 1) {
    await myTurn(page);
    await playFirstCard(page, how);
  }
  await myTurn(page);
  await press(page, pick, how);
  await page.waitForSelector('.cell.is-legal');
  await page.waitForTimeout(300);
}

function combatShots() {
  const how = (ctx) => (ctx.hasTouch ? 'touch' : 'mouse');
  const list = [
    { file: 'chifoumi-1920x1080.png', context: WIDE, before: (p) => press(p, '[data-menu="title.quickMatch"]', 'mouse') },
    { file: 'chifoumi-telephone-844x390.png', context: PHONE_LANDSCAPE, before: (p) => press(p, '[data-menu="title.quickMatch"]', 'touch') },
    { file: 'malus-telephone-844x390.png', context: PHONE_LANDSCAPE, before: (p) => midMatch(p, 'touch', '.hand .card.is-malus') },
    {
      file: 'plateau-a-plat-1920x1080.png',
      context: WIDE,
      before: async (p) => {
        await midMatch(p, 'mouse');
        await press(p, '[data-action="flat"]', 'mouse');
        await p.waitForTimeout(400);
      },
    },
    {
      file: 'plateau-a-plat-telephone-844x390.png',
      context: PHONE_LANDSCAPE,
      before: async (p) => {
        await startQuickMatch(p, 'touch');
        await press(p, '[data-action="flat"]', 'touch');
        await p.waitForTimeout(400);
      },
    },
    {
      file: 'fin-de-manche-1920x1080.png',
      context: WIDE,
      before: async (p) => {
        await startQuickMatch(p, 'mouse');
        while ((await stateOf(p)) !== 'ROUND_END') {
          await myTurn(p);
          if ((await stateOf(p)) !== 'PLAYER_TURN') continue;
          if ((await p.locator('.camp-player .card').count()) < 3) await playFirstCard(p, 'mouse');
          else {
            await press(p, '[data-action="pass"]', 'mouse');
            await press(p, '[data-action="passYes"]', 'mouse');
            await waitLeave(p, 'PLAYER_TURN');
          }
        }
      },
    },
    { file: 'fin-de-match-1920x1080.png', context: WIDE, before: async (p) => { await startQuickMatch(p, 'mouse'); await playMatch(p, 'mouse'); } },
    { file: 'fin-de-match-telephone-844x390.png', context: PHONE_LANDSCAPE, before: async (p) => { await startQuickMatch(p, 'touch'); await playMatch(p, 'touch', 4); } },
  ];
  for (const sz of SIZES) {
    const context = sz.profile === 'compact' ? PHONE_LANDSCAPE : { viewport: { width: sz.width, height: sz.height }, deviceScaleFactor: 1 };
    list.push({ file: `combat-selection-${sz.name}.png`, context, before: (p) => midMatch(p, how(context)) });
  }
  return list;
}

/** Liste des captures : nom de fichier, options de contexte, adresse, action avant la capture. */
function shots() {
  const list = SIZES.map((s) => ({
    file: `titre-${s.name}.png`,
    context: { viewport: { width: s.width, height: s.height }, deviceScaleFactor: 1 },
  }));
  list.push(
    { file: 'telephone-paysage-844x390.png', context: { viewport: { width: 844, height: 390 }, ...PHONE } },
    { file: 'telephone-portrait-390x844.png', context: { viewport: { width: 390, height: 844 }, ...PHONE } },
    {
      file: 'debug-1920x1080.png',
      context: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 },
      query: '?debug=1',
      before: async (page) => {
        await page.keyboard.press('F3');
        await page.waitForFunction(() => /\d+ FPS/.test(document.querySelector('[data-debug="fps"]')?.textContent ?? ''));
      },
    },
    {
      file: 'debug-telephone-844x390.png',
      context: { viewport: { width: 844, height: 390 }, ...PHONE },
      query: '?debug=1',
      before: async (page) => {
        await page.locator('[data-debug="toggle"]').tap();
        await page.waitForFunction(() => /\d+ FPS/.test(document.querySelector('[data-debug="fps"]')?.textContent ?? ''));
      },
    },
  );
  return [...list, ...combatShots()];
}

async function main() {
  const outArg = process.argv.indexOf('--out');
  const out = resolve(ROOT, outArg > 0 ? process.argv[outArg + 1] : DEFAULT_OUT);
  await mkdir(out, { recursive: true });
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const server = await serve();
  let failures = 0;
  try {
    for (const shot of shots()) {
      const { context, page, problems } = await openPage(browser, shot.context);
      await page.goto(`${server.url}${shot.query ?? ''}`);
      await waitReady(page);
      if (shot.before) await shot.before(page);
      const path = join(out, shot.file);
      await page.screenshot({ path });
      console.log(`${problems.length === 0 ? '✓' : '✗'} ${path}`);
      for (const p of problems) console.error(`    ${p}`);
      failures += problems.length;
      await context.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
  process.exitCode = failures === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
