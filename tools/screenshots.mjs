#!/usr/bin/env node
/**
 * Captures d'écran aux 3 tailles de référence, plus le téléphone (paysage, portrait) et le panneau debug.
 * `npm run shots` (dossier par défaut : docs/captures/j0) ou `npm run shots -- --out docs/captures/j1`.
 * Échoue si la console affiche une erreur ou un avertissement.
 */
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIZES, PHONE, loadPlaywright, serve, openPage, waitReady } from '../tests/helpers/browser.js';
import { ROOT } from './files.mjs';

const DEFAULT_OUT = 'docs/captures/j0';

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
  return list;
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
