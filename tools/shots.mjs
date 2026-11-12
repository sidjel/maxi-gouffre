/**
 * Captures d'écran PC et téléphone (npm run shots) dans docs/captures/s1/ (option : -- --out dossier).
 * Lance la version construite avec vite preview, joue quelques secondes et photographie les moments clés.
 */
import { spawn, execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium, devices } from '@playwright/test';

const outArg = process.argv.indexOf('--out');
const out = outArg > 0 ? process.argv[outArg + 1] : 'docs/captures/s1';
mkdirSync(out, { recursive: true });
execSync('npx vite build', { stdio: 'ignore' });
const server = spawn('npx', ['vite', 'preview', '--port', '4174', '--strictPort'], { stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 1500));
const URL = 'http://localhost:4174/';
const wait = (page, ms) => page.waitForTimeout(ms);

async function pc(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(URL);
  await wait(page, 3500);
  await page.screenshot({ path: `${out}/pc-1-arrivee.png` });
  await page.keyboard.down('KeyD'); await wait(page, 450); await page.keyboard.up('KeyD');
  await wait(page, 400);
  await page.keyboard.press('Enter');
  await wait(page, 650);
  await page.screenshot({ path: `${out}/pc-2-scan.png` });
  await wait(page, 1300);
  await page.screenshot({ path: `${out}/pc-3-carte.png` });
  await wait(page, 2500);
  await page.keyboard.down('KeyD'); await page.keyboard.down('KeyS'); await wait(page, 1100);
  await page.keyboard.up('KeyS'); await wait(page, 500); await page.keyboard.up('KeyD');
  await page.keyboard.press('F3');
  await wait(page, 600);
  await page.screenshot({ path: `${out}/pc-4-zone-de-marche.png` });
  await page.keyboard.press('F3');
  await page.keyboard.press('KeyP');
  await wait(page, 400);
  await page.screenshot({ path: `${out}/pc-5-panier.png` });
  await page.keyboard.press('Escape');
  await page.keyboard.press('F2');
  await wait(page, 300);
  await page.screenshot({ path: `${out}/pc-6-reglages.png` });
  await page.close();
}

async function phone(browser) {
  const ctx = await browser.newContext({ ...devices['Pixel 7 landscape'] });
  const page = await ctx.newPage();
  await page.goto(`${URL}?joystick=1`);
  await wait(page, 3000);
  await page.screenshot({ path: `${out}/tel-1-arrivee.png` });
  await page.locator('[data-product="lait"]').tap();
  await wait(page, 1600);
  await page.locator('[data-product="lait"]').tap();
  await wait(page, 1900);
  await page.screenshot({ path: `${out}/tel-2-carte.png` });
  await wait(page, 2500);
  await page.locator('.hud-basket').tap();
  await wait(page, 300);
  await page.screenshot({ path: `${out}/tel-3-panier.png` });
  await ctx.close();
}

try {
  const browser = await chromium.launch();
  await pc(browser);
  await phone(browser);
  await browser.close();
  console.log(`Captures écrites dans ${out}/`);
} finally {
  process.kill(-server.pid);
}
