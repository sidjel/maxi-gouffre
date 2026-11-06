/**
 * Correspondances par défaut (GD §14.2). Clavier par `KeyboardEvent.code` (position physique) :
 * KeyW/KeyA/KeyS/KeyD = Z Q S D sur un clavier AZERTY, W A S D sur un clavier QWERTY.
 * Le remappage (options) arrive au jalon J7, la manette au J3.
 */
export const DEFAULT_BINDINGS = Object.freeze({
  keyboard: Object.freeze({
    ArrowUp: 'UP',
    KeyW: 'UP',
    ArrowDown: 'DOWN',
    KeyS: 'DOWN',
    ArrowLeft: 'LEFT',
    KeyA: 'LEFT',
    ArrowRight: 'RIGHT',
    KeyD: 'RIGHT',
    Enter: 'CONFIRM',
    NumpadEnter: 'CONFIRM',
    Space: 'CONFIRM',
    Backspace: 'CANCEL',
    KeyP: 'PASS',
    KeyI: 'INSPECT',
    Escape: 'PAUSE',
    Tab: 'TAB_NEXT',
    F3: 'DEBUG',
  }),
});

/** Actions abstraites émises par InputHandler (ARCHITECTURE.md §6). */
export const ACTIONS = Object.freeze([
  'UP', 'DOWN', 'LEFT', 'RIGHT', 'CONFIRM', 'CANCEL', 'PASS', 'INSPECT',
  'PAUSE', 'TAB_PREV', 'TAB_NEXT', 'DEBUG', 'POINTER_SELECT',
]);
