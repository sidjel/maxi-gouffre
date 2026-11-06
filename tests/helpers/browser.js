/**
 * Outils communs aux tests navigateur et aux captures : chargement de Playwright,
 * serveur local, page instrumentée qui collecte les erreurs et avertissements console.
 */
import { createRequire } from 'node:module';
import { startServer } from '../../tools/serve.mjs';

/** Tailles de référence (ARCHITECTURE.md §14.2), avec le profil attendu. */
export const SIZES = Object.freeze([
  { name: '1920x1080', width: 1920, height: 1080, profile: 'wide' },
  { name: '1280x720', width: 1280, height: 720, profile: 'wide' },
  { name: '844x390', width: 844, height: 390, profile: 'compact' },
]);

/** Téléphone émulé (doigt, écran haute densité). */
export const PHONE = Object.freeze({ isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

/**
 * Charge Playwright : installé dans le projet (npm install) ou déjà présent sur la machine.
 * @returns {Promise<typeof import('playwright')>}
 */
export async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    // Repli : module installé globalement (NODE_PATH), introuvable par import() en ESM.
    return createRequire(import.meta.url)('playwright');
  }
}

/**
 * Démarre le serveur sur un port libre.
 * @param {string} [base] sous-dossier imité (ex. « /maxi-gouffre/ » comme sur GitHub Pages)
 */
export async function serve(base = '/') {
  const server = await startServer({ port: 0, host: '127.0.0.1', base });
  return { ...server, url: `http://127.0.0.1:${server.port}${base}` };
}

/**
 * Ouvre une page et collecte tout ce qui ne doit pas arriver : erreurs et avertissements console,
 * exceptions, requêtes en échec ou en erreur HTTP.
 * @param {import('playwright').Browser} browser
 * @param {object} contextOptions options de contexte Playwright (viewport, isMobile…)
 */
export async function openPage(browser, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') problems.push(`console.${msg.type()} : ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`exception : ${err.message}`));
  page.on('requestfailed', (req) => problems.push(`requête en échec : ${req.url()} (${req.failure()?.errorText})`));
  page.on('response', (res) => {
    if (res.status() >= 400) problems.push(`HTTP ${res.status()} : ${res.url()}`);
  });
  return { context, page, problems };
}

/** Attend que le jeu ait fini de démarrer (données, écran titre, polices). */
export async function waitReady(page) {
  await page.waitForSelector('html[data-ready="1"]', { timeout: 10000 });
}
