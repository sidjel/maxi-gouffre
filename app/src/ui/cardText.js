/**
 * Textes affichés d'une carte : étiquettes, stades, effets. Tout vient de data/strings.json.
 */

const STAGE_KEYS = Object.freeze(['stage.fresh', 'stage.ripe', 'stage.rotten']);

/** DESTROY_FACING → destroyFacing (clé de texte). */
export function effectKey(type) {
  return type.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** Nom du stade (Frais, Mûr, Pourri). */
export function stageLabel(t, stage) {
  return t(STAGE_KEYS[stage - 1]);
}

/** Étiquette lisible (« Surgelé »). */
export function tagLabel(t, tag) {
  return t(`tag.${tag}`);
}

/** Étiquettes affichées sur la carte : sans « Malus » ni « Fermentation », qui ont leur propre pastille. */
export function visibleTags(t, tags) {
  return [...new Set(tags)].filter((tag) => tag !== 'malus' && tag !== 'fermentation').map((tag) => tagLabel(t, tag));
}

/** Nom court de l'effet (« Boost »). */
export function effectName(t, effect) {
  return t(`effectName.${effectKey(effect.type)}`, { value: effect.value ?? '' });
}

/** Icône de l'effet (un caractère). */
export function effectIcon(t, effect) {
  return t(`effectIcon.${effectKey(effect.type)}`);
}

/**
 * Description complète de l'effet (bandeau d'information).
 * @param {(key: string, vars?: object) => string} t
 * @param {{ type: string, scope?: string, value?: number, condition?: { stage: number } }} effect
 * @param {{ BOOST_VALUE: number, ZONE_MALUS_VALUE: number }} rules
 */
export function effectText(t, effect, rules) {
  let key = `effect.${effectKey(effect.type)}`;
  if (effect.type === 'BOOST' && effect.scope === 'backRow') key = 'effect.boostBackRow';
  const value = effect.value ?? (effect.type === 'BOOST' ? rules.BOOST_VALUE : rules.ZONE_MALUS_VALUE);
  const base = t(key, { value });
  return effect.condition ? `${base} ${t('effect.conditionStage', { stage: stageLabel(t, effect.condition.stage) })}` : base;
}

/** Puissance affichée : « — » pour un stade non posable (Outil). */
export function powerText(power) {
  return power === null ? '—' : String(power);
}
