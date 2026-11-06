/**
 * États du jeu (GAME_DESIGN.md §3) et transitions autorisées.
 * - main : état principal → états principaux accessibles ;
 * - overlays : états superposables (pile au-dessus de l'état principal) ;
 * - sub : sous-états d'un état (ou d'un sous-état) parent.
 */
export const STATES = Object.freeze({
  initial: 'BOOT',
  main: Object.freeze({
    // BOOT → TITLE : raccourci provisoire tant que WARNING et PRESS_KEY n'existent pas (J6).
    BOOT: Object.freeze(['WARNING', 'TITLE']),
    WARNING: Object.freeze(['PRESS_KEY']),
    PRESS_KEY: Object.freeze(['TITLE']),
    TITLE: Object.freeze(['INTRO', 'PLAYING', 'CREDITS']),
    INTRO: Object.freeze(['FORM']),
    FORM: Object.freeze(['PLAYING']),
    PLAYING: Object.freeze(['REVELATION', 'ENDING', 'TITLE']),
    REVELATION: Object.freeze(['PLAYING']),
    ENDING: Object.freeze(['CREDITS']),
    CREDITS: Object.freeze(['TITLE']),
  }),
  overlays: Object.freeze(['OPTIONS', 'PAUSED', 'ROTATE_DEVICE']),
  sub: Object.freeze({
    PLAYING: Object.freeze([
      'EXPLORATION', 'DIALOGUE', 'PREP_HAND', 'COMBAT', 'KITCHEN',
      'FRIDGE_ROOM', 'MERCHANT', 'EVENT', 'COLLECTION',
    ]),
    COMBAT: Object.freeze(['CHIFOUMI', 'ROUND_PLAY', 'ROUND_END', 'MATCH_END', 'LOOT']),
    ROUND_PLAY: Object.freeze(['PLAYER_TURN', 'OPPONENT_TURN']),
  }),
});
