/**
 * Constantes du jeu (GAME_DESIGN.md §19) et constantes techniques (ARCHITECTURE.md §13).
 * Tout est gelé. Le cœur ne lit jamais ce module directement : il reçoit ctx.rules.
 * Aucune valeur numérique en dur ailleurs dans le code (hors tokens CSS).
 */

/** Gèle un objet et tous ses sous-objets. */
function deepFreeze(obj) {
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) deepFreeze(value);
  }
  return Object.freeze(obj);
}

const HAND_SIZE = 10;
const STAGE_LENGTH = 15;

/** Valeurs de jeu (GD §19). Les valeurs marquées 🔶 dans le GD seront calibrées par la simulation. */
export const GAME = deepFreeze({
  HAND_SIZE,
  GRID_COLS: 5,
  GRID_ROWS: 2,
  ROUNDS_TO_WIN: 2,
  MAX_ROUNDS: 3,
  STAGE_LENGTH,
  STAGE_LENGTH_OPTIONS: { slow: 20, normal: STAGE_LENGTH, fast: 10 },
  AGE_MAX: 3 * STAGE_LENGTH - 1,
  SURGELE_FRESH_MULT: 2,
  SURGELE_RIPE_LENGTH: 1,
  CRAN_CARD_PLAYED: 1,
  CRAN_NEW_ROOM: 3,
  CRAN_NEW_DIALOGUE: 1,
  CRAN_DEFEAT: 5,
  LOOT_AMONG: 3,
  LOOT_PICK: 1,
  SOLDEUR_TRADES: 2,
  SOLDEUR_OFFERS: 3,
  DOOR_FLEE_COUNT: 3,
  DOOR_FLEE_DISTANCE: 80,
  DEFEAT_DISCOVERY_PROPOSAL: 3,
  BAD_MOVE_PASS_GAP: 8,
  BAD_MOVE_MIN_HAND: 3,
  FRIDGE_SLOTS: 3,
  FUSIONS_PER_KITCHEN: 1,
  FUSION_SCOTCH_PENALTY: 3,
  FUSED_STAGE3_RATIO: 0.5,
  TRANSFER_RATIO: 0.5,
  BOOST_VALUE: 1,
  ZONE_MALUS_VALUE: 1,
  SCORE_FLOOR: 0,
  AI_NOOB_PASS_LEAD: 8,
  AI_DELAY_MIN: 800,
  AI_DELAY_MAX: 1500,
  NARRATOR_GLOBAL_COOLDOWN: 20,
  NARRATOR_LINE_COOLDOWN: 600,
  INACTIVITY_1: 30,
  INACTIVITY_2: 90,
  CLOCK_MILESTONES: [20, 40, 60, 80],
  MAX_ACTIONS_PER_ROUND: 4 * HAND_SIZE,
  PANIC_TURNS: 1,
});

/** Valeurs techniques (ARCHITECTURE.md §13), plus quelques réglages propres au socle J0. */
export const TECH = deepFreeze({
  APP_VERSION: '0.0.0',
  WIDE_STAGE: { width: 1920, height: 1080 },
  COMPACT_STAGE: { width: 1280, height: 720 },
  COMPACT_MAX_WIDTH: 1100,
  COMPACT_MAX_HEIGHT: 620,
  TOUCH_MIN_PX: 44,
  LONG_PRESS_MS: 500,
  TAP_SLOP_PX: 10,
  DEADZONE: 0.2,
  STICK_TRIGGER: 0.5,
  BOARD_PERSPECTIVE: 1200,
  BOARD_TILT: 25,
  AUDIO_CROSSFADE_MS: 1000,
  AUDIO_DUCK_RATIO: 0.7,
  SAVE_VERSION: 1,
  STORAGE_PREFIX: 'maxi-gouffre.',
  // Socle J0 (décisions notées dans docs/DECISIONS.md)
  TOAST_MS: 2500,
  DEBUG_QUERY_PARAM: 'debug',
  DEBUG_REFRESH_MS: 500,
  DEBUG_LOG_MAX: 50,
  DEBUG_RNG_PREVIEW: 5,
  FONTS_TIMEOUT_MS: 3000,
});
