/**
 * Plats (GAME_DESIGN.md §7.4) : décrits par une seule ligne dans cards.json, dépliés ici en 3 stades.
 * Stades 1 et 2 : P de base et effet. Stade 3 : P × FUSED_STAGE3_RATIO arrondie à l'inférieur, sans effet.
 */

/**
 * @param {object} dish ligne de plat de cards.json
 * @param {number} ratio FUSED_STAGE3_RATIO
 * @returns {object} définition complète avec 3 stades
 */
export function expandDish(dish, ratio) {
  const stage = (power, effects) => ({
    name: dish.name,
    power,
    effects,
    tags: [],
    image: dish.image ?? null,
    flavor: dish.flavor ?? null,
  });
  return {
    id: dish.id,
    family: dish.family,
    dish: true,
    tags: dish.tags.slice(),
    stages: [
      stage(dish.power, dish.effects.slice()),
      stage(dish.power, dish.effects.slice()),
      stage(Math.floor(dish.power * ratio), []),
    ],
  };
}

/**
 * Indexe les cartes par identifiant, plats dépliés.
 * @param {object[]} list contenu de cards.json
 * @param {number} ratio
 * @returns {Record<string, object>}
 */
export function expandCards(list, ratio) {
  return Object.fromEntries(list.map((c) => [c.id, c.dish ? expandDish(c, ratio) : c]));
}
