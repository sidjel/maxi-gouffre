/**
 * Entrées traduites en actions abstraites.
 * Clavier : ZQSD (position physique, donc WASD en QWERTY) et flèches ; Entrée/Espace = agir ;
 *           P = Panier ; Échap = retour ; F2 = réglages ; F3 = zone de marche.
 * Souris / doigt : « point » (aller là, ou viser un produit).
 * Manette : stick gauche ou croix = marcher ; A = agir ; B = retour ; Y = Panier ; Start = réglages ; Select = debug.
 * Actions émises : action, basket, cancel, settings, debug, point {x,y,target,pointerType}, nav {dx,dy}.
 */
const MOVE_KEYS = {
  KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0],
};
const ACTION_KEYS = {
  Enter: 'action', NumpadEnter: 'action', Space: 'action',
  KeyP: 'basket', Escape: 'cancel', F2: 'settings', F3: 'debug',
};
const PAD = { 0: 'action', 1: 'cancel', 3: 'basket', 2: 'basket', 9: 'settings', 8: 'debug' };
const DEAD = 0.22;

export function createInput(stage) {
  const handlers = new Map();
  const keys = new Set();
  const padPrev = {};
  let joy = { x: 0, y: 0 };
  let pad = { x: 0, y: 0 };
  let navHeld = null; let navNext = 0;
  let lastActivity = performance.now();
  let lastDevice = 'keyboard';
  let pointerDown = null;

  const emit = (name, payload) => { handlers.get(name)?.forEach((fn) => fn(payload)); };
  const touch = (device) => { lastActivity = performance.now(); lastDevice = device; };

  window.addEventListener('keydown', (e) => {
    if (e.target?.closest?.('input, select, textarea') && !['Escape', 'F2'].includes(e.code)) return;
    if (e.target?.closest?.('button') && (e.code === 'Enter' || e.code === 'Space')) return; // clic natif
    touch('keyboard');
    if (MOVE_KEYS[e.code]) {
      keys.add(e.code);
      e.preventDefault();
      emit('nav', { dx: MOVE_KEYS[e.code][0], dy: MOVE_KEYS[e.code][1] });
    }
    const a = ACTION_KEYS[e.code];
    if (a) {
      e.preventDefault();
      if (!e.repeat) emit(a);
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => { keys.clear(); pointerDown = null; });

  // Souris et toucher sur la scène (pas sur les boutons d'interface, marqués data-ui).
  stage.node.addEventListener('pointerdown', (e) => {
    touch(e.pointerType === 'touch' ? 'touch' : 'mouse');
    if (e.target.closest('[data-ui]')) return;
    pointerDown = e.pointerId;
    emit('point', { ...stage.toStage(e.clientX, e.clientY), target: e.target, pointerType: e.pointerType, first: true });
  });
  stage.node.addEventListener('pointermove', (e) => {
    if (pointerDown !== e.pointerId || e.buttons === 0) return;
    touch(e.pointerType === 'touch' ? 'touch' : 'mouse');
    emit('point', { ...stage.toStage(e.clientX, e.clientY), target: null, pointerType: e.pointerType, first: false });
  });
  const up = (e) => { if (pointerDown === e.pointerId) pointerDown = null; };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);

  function pollPad(now) {
    const gp = navigator.getGamepads?.().find((g) => g && g.connected);
    if (!gp) { pad = { x: 0, y: 0 }; return; }
    let x = gp.axes[0] ?? 0; let y = gp.axes[1] ?? 0;
    if (Math.hypot(x, y) < DEAD) { x = 0; y = 0; }
    const b = (i) => !!gp.buttons[i]?.pressed;
    if (b(14)) x = -1; if (b(15)) x = 1; if (b(12)) y = -1; if (b(13)) y = 1;
    pad = { x, y };
    if (x || y) touch('gamepad');
    for (const [i, name] of Object.entries(PAD)) {
      const on = b(Number(i));
      if (on && !padPrev[i]) { touch('gamepad'); emit(name); }
      padPrev[i] = on;
    }
    // Navigation dans les menus : une fois, puis répétition si on maintient.
    const dir = Math.abs(x) > 0.6 ? [Math.sign(x), 0] : Math.abs(y) > 0.6 ? [0, Math.sign(y)] : null;
    const key = dir ? dir.join(',') : null;
    if (key !== navHeld) { navHeld = key; navNext = now + 380; if (dir) emit('nav', { dx: dir[0], dy: dir[1] }); }
    else if (dir && now >= navNext) { navNext = now + 120; emit('nav', { dx: dir[0], dy: dir[1] }); }
  }

  return {
    on(name, fn) {
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name).add(fn);
    },
    emit,
    poll(now) { pollPad(now); },
    /** Direction de marche combinée (longueur ≤ 1). */
    moveVector() {
      let x = 0; let y = 0;
      for (const k of keys) { x += MOVE_KEYS[k][0]; y += MOVE_KEYS[k][1]; }
      x += pad.x + joy.x; y += pad.y + joy.y;
      const n = Math.hypot(x, y);
      return n > 1 ? { x: x / n, y: y / n } : { x, y };
    },
    setJoystick(v) { joy = v; if (v.x || v.y) touch('touch'); },
    get lastActivity() { return lastActivity; },
    get device() { return lastDevice; },
  };
}
