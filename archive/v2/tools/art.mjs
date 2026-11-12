#!/usr/bin/env node
/**
 * `npm run art` : écrit les illustrations provisoires des cartes en SVG (DIRECTION_ARTISTIQUE.md §1)
 * dans app/assets/img/cards/, renseigne le champ "image" de cards.json et le registre credits.json,
 * puis régénère docs/CREDITS.md.
 * Une image fournie par l'auteur (champ "image" qui pointe ailleurs) n'est jamais écrasée.
 * `--check` : ne rien écrire, échouer si un fichier généré diffère (utilisé par npm run check).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './files.mjs';
import { renderCredits, CREDITS_JSON, CREDITS_MD } from './credits.mjs';
import { food } from './art/food.mjs';
import { objects } from './art/objects.mjs';
import { living } from './art/living.mjs';
import { dishes } from './art/dishes.mjs';

const DIR = 'assets/img/cards';
const CARDS_JSON = join(ROOT, 'app/data/cards.json');
const FAMILIES = { ...food, ...objects, ...living };
const TODAY = '2026-11-06';

/** Entrée du registre pour une illustration générée. */
const credit = (file, name) => ({
  file,
  author: "Claude (Anthropic), pour l'auteur de MAXI-GOUFFRE",
  source: 'Dessiné en SVG par le générateur tools/art (npm run art)',
  license: "Tous droits réservés (propriété de l'auteur du jeu)",
  commercial: true,
  date: TODAY,
  usage: `Illustration provisoire de carte : ${name}`,
});

/**
 * Calcule tous les fichiers à écrire.
 * @returns {{ files: Map<string, string>, cards: object[], credits: object[] }}
 */
export async function build() {
  const cards = JSON.parse(await readFile(CARDS_JSON, 'utf8'));
  const credits = JSON.parse(await readFile(CREDITS_JSON, 'utf8'));
  const files = new Map();
  const wanted = [];
  const place = (holder, file, body, name) => {
    // Une image de l'auteur (autre chemin) garde la priorité.
    if (holder.image !== null && holder.image !== file) return;
    holder.image = file;
    files.set(file, body);
    wanted.push(credit(file, name));
  };
  for (const card of cards) {
    if (card.dish) {
      const draw = dishes[card.id];
      if (!draw) throw new Error(`[art] pas d'illustration pour le plat ${card.id}`);
      place(card, `${DIR}/${card.id}.svg`, draw(), card.name);
      continue;
    }
    const draws = FAMILIES[card.family];
    if (!draws || draws.length !== 3) throw new Error(`[art] 3 illustrations attendues pour ${card.family}`);
    card.stages.forEach((s, i) => place(s, `${DIR}/${card.family}_${i + 1}.svg`, draws[i](), s.name));
  }
  const generated = new Set(wanted.map((e) => e.file));
  const kept = credits.filter((e) => !(e.file.startsWith(`${DIR}/`) && e.file.endsWith('.svg') && !generated.has(e.file)));
  const byFile = new Map(kept.map((e) => [e.file, e]));
  for (const e of wanted) {
    const old = byFile.get(e.file);
    byFile.set(e.file, old ? { ...e, date: old.date } : e);
  }
  return { files, cards, credits: [...byFile.values()] };
}

const json = (data) => `${JSON.stringify(data, null, 2)}\n`;

/** @returns {Promise<string[]>} fichiers qui ne sont pas à jour */
export async function checkArt() {
  const { files, cards, credits } = await build();
  const expected = new Map([...files].map(([f, body]) => [join(ROOT, 'app', f), body]));
  expected.set(CARDS_JSON, json(cards));
  expected.set(CREDITS_JSON, json(credits));
  const stale = [];
  for (const [path, body] of expected) {
    let current = null;
    try {
      current = await readFile(path, 'utf8');
    } catch {
      // absent
    }
    if (current !== body) stale.push(`${path.slice(ROOT.length)} n'est pas à jour : lancer npm run art`);
  }
  return stale;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    const stale = await checkArt();
    for (const s of stale) console.error(`✗ ${s}`);
    process.exitCode = stale.length === 0 ? 0 : 1;
  } else {
    const { files, cards, credits } = await build();
    await mkdir(join(ROOT, 'app', DIR), { recursive: true });
    for (const [file, body] of files) await writeFile(join(ROOT, 'app', file), body);
    await writeFile(CARDS_JSON, json(cards));
    await writeFile(CREDITS_JSON, json(credits));
    await writeFile(CREDITS_MD, renderCredits(credits));
    console.log(`${files.size} illustrations écrites dans app/${DIR}/.`);
  }
}
