/**
 * Seul module qui lit le clavier et le pointeur. Il émet des actions abstraites sur le bus :
 * INPUT_ACTION { action, source, target? } et INPUT_SOURCE_CHANGED { source }.
 * Version socle (J0) : clavier et pointeur simples. Appui long, manette et focus arrivent aux J2-J3.
 */
export class InputHandler {
  #win;
  #bus;
  #bindings;
  #debug;
  #slop;
  #source = null;
  #down = null;
  #handlers;

  /**
   * @param {Window} win
   * @param {{ emit: Function }} bus
   * @param {{ bindings: { keyboard: Record<string, string> }, debug: boolean, tech: { TAP_SLOP_PX: number } }} opts
   */
  constructor(win, bus, opts) {
    this.#win = win;
    this.#bus = bus;
    this.#bindings = opts.bindings;
    this.#debug = opts.debug;
    this.#slop = opts.tech.TAP_SLOP_PX;
    this.#handlers = {
      keydown: (e) => this.#onKeyDown(e),
      pointerdown: (e) => this.#onPointerDown(e),
      pointerup: (e) => this.#onPointerUp(e),
      pointercancel: () => { this.#down = null; },
      contextmenu: (e) => this.#onContextMenu(e),
    };
  }

  /** Dernière entrée utilisée : keyboard | mouse | touch (gamepad au J3). */
  get source() {
    return this.#source;
  }

  /** Branche les écouteurs. */
  start() {
    for (const [type, fn] of Object.entries(this.#handlers)) this.#win.addEventListener(type, fn);
  }

  /** Débranche les écouteurs. */
  stop() {
    for (const [type, fn] of Object.entries(this.#handlers)) this.#win.removeEventListener(type, fn);
  }

  #setSource(source) {
    if (source === this.#source) return;
    this.#source = source;
    this.#bus.emit('INPUT_SOURCE_CHANGED', { source });
  }

  #emit(action, source, target) {
    this.#bus.emit('INPUT_ACTION', target ? { action, source, target } : { action, source });
  }

  #onKeyDown(e) {
    let action = this.#bindings.keyboard[e.code];
    if (!action) return;
    if (action === 'DEBUG' && !this.#debug) return;
    // Un appui = une action : la répétition automatique est ignorée (GD §14.1).
    if (e.repeat) return;
    // Pendant une saisie (graine du debug, prénom), seules les touches système passent.
    if (isEditable(e.target) && action !== 'DEBUG') return;
    if (action === 'TAB_NEXT' && e.shiftKey) action = 'TAB_PREV';
    // F3 ouvrirait la recherche du navigateur.
    if (action === 'DEBUG') e.preventDefault();
    this.#setSource('keyboard');
    this.#emit(action, 'keyboard');
  }

  #onPointerDown(e) {
    this.#setSource(e.pointerType === 'touch' ? 'touch' : 'mouse');
    this.#down = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }

  #onPointerUp(e) {
    const down = this.#down;
    this.#down = null;
    if (!down || down.id !== e.pointerId || e.button > 0) return;
    // Un déplacement de plus de TAP_SLOP_PX annule l'appui (ARCHITECTURE.md §9).
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > this.#slop) return;
    this.#emit('POINTER_SELECT', this.#source, e.target);
  }

  #onContextMenu(e) {
    // Le menu contextuel du navigateur est désactivé ; le clic droit sert à inspecter.
    if (isEditable(e.target)) return;
    e.preventDefault();
    this.#emit('INSPECT', this.#source ?? 'mouse', e.target);
  }
}

function isEditable(target) {
  return Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'));
}
