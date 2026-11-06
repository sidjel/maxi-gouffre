/**
 * Vérifications entre fichiers, une fois chaque fichier valide : cartes citées qui existent,
 * budget des mains adverses, cartes posables (ARCHITECTURE.md §7).
 */
import { stageOf } from '../core/time.js';

/**
 * @param {{ cards?: Record<string, object>, combats?: Record<string, object>, quickmatch?: object }} defs cartes dépliées et indexées
 * @param {object} game constantes GAME (config.js)
 * @returns {string[]} problèmes
 */
export function crossCheck(defs, game) {
  const problems = [];
  const { cards, combats, quickmatch } = defs;
  if (!cards) return problems;
  for (const c of Object.values(cards)) {
    for (const s of c.stages) {
      for (const e of s.effects) {
        if (e.type === 'EAT' && !Object.values(cards).some((d) => d.family === e.target.family)) {
          problems.push(`data/cards.json › ${c.id} › effet EAT : famille "${e.target.family}" inconnue`);
        }
      }
    }
  }
  for (const combat of Object.values(combats ?? {})) {
    const where = `data/combats.json › ${combat.id}`;
    let budget = 0;
    combat.hand.forEach((h, k) => {
      const def = cards[h.card];
      if (!def) {
        problems.push(`${where} › main ${k} : carte "${h.card}" absente de cards.json`);
        return;
      }
      const s = def.stages[h.stage - 1];
      if (s.placeable === false) problems.push(`${where} › main ${k} : ${s.name} n'est pas posable`);
      else budget += s.power;
    });
    if (budget !== combat.handBudget) problems.push(`${where} › champ "handBudget" : ${combat.handBudget} annoncé, la main fait ${budget}`);
  }
  if (quickmatch) {
    const where = 'data/quickmatch.json';
    if (combats && !combats[quickmatch.combat]) problems.push(`${where} › champ "combat" : combat "${quickmatch.combat}" absent de combats.json`);
    quickmatch.hand.forEach((h, k) => {
      const def = cards[h.card];
      if (!def) {
        problems.push(`${where} › main ${k} : carte "${h.card}" absente de cards.json`);
        return;
      }
      // Une main ne contient pas d'Outil aux stades 1 et 2 (GD §9.1).
      const s = def.stages[stageOf(def, h.age, game) - 1];
      if (s.placeable === false) problems.push(`${where} › main ${k} : ${s.name} (âge ${h.age}) ne peut pas entrer dans une main`);
    });
  }
  return problems;
}
