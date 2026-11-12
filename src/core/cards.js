/**
 * Cartes : création à partir d'un produit scanné, stade de fraîcheur, vieillissement.
 * L'âge va de 0 (tout frais) à 1 (complètement pourri). Fonctions pures, sans DOM.
 */
import { clamp } from './geometry.js';

export const STAGES = ['frais', 'mur', 'pourri'];
export const STAGE_LABELS = { frais: 'Frais', mur: 'Mûr', pourri: 'Pourri' };

/**
 * Stade d'une carte selon son âge.
 * @param {number} age 0…1
 * @param {{ ripeAt:number, rottenAt:number }} t seuils
 */
export function stageOf(age, t) {
  if (age >= t.rottenAt) return 'pourri';
  if (age >= t.ripeAt) return 'mur';
  return 'frais';
}

/**
 * Crée la carte « essence » d'un produit.
 * @param {object} product entrée de products.json
 * @param {{ uid:string, rng:{ range:Function }, jitter:number, thresholds:object }} opts
 */
export function createCard(product, { uid, rng, jitter, thresholds }) {
  const age = clamp(product.age + rng.range(-jitter, jitter), 0, 1);
  return {
    uid,
    productId: product.id,
    name: product.card?.name ?? product.name,
    image: product.image,
    power: product.power,
    props: [...product.props],
    ageRate: product.ageRate ?? 1,
    age,
    stage: stageOf(age, thresholds),
  };
}

/**
 * Fait vieillir une carte (renvoie une nouvelle carte). La vitesse propre au produit s'applique.
 * @param {object} card
 * @param {number} amount vieillissement de base (0…1)
 * @param {object} thresholds
 */
export function ageCard(card, amount, thresholds) {
  const age = clamp(card.age + amount * card.ageRate, 0, 1);
  return { ...card, age, stage: stageOf(age, thresholds) };
}
