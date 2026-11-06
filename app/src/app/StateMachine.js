/**
 * Machine à états du jeu : un état principal, un chemin de sous-états, une pile d'états superposés.
 * Chaque transition est vérifiée, journalisée (panneau debug) et publiée (STATE_CHANGED).
 */
export class StateMachine {
  #def;
  #bus;
  #now;
  #logMax;
  #main;
  #path = [];
  #overlays = [];
  #log = [];

  /**
   * @param {typeof import('./states.js').STATES} def
   * @param {{ bus?: { emit: Function }, now?: () => number, logMax?: number }} [opts]
   */
  constructor(def, opts = {}) {
    this.#def = def;
    this.#bus = opts.bus ?? null;
    this.#now = opts.now ?? (() => Date.now());
    this.#logMax = opts.logMax ?? Infinity;
    this.#main = def.initial;
    if (!(this.#main in def.main)) throw new Error(`[MG] StateMachine : état initial inconnu ${this.#main}`);
  }

  /** État principal courant. */
  get main() {
    return this.#main;
  }

  /** Sous-état le plus profond, ou null. */
  get sub() {
    return this.#path.at(-1) ?? null;
  }

  /** État superposé au sommet de la pile, ou null. */
  get overlay() {
    return this.#overlays.at(-1) ?? null;
  }

  /** Journal des transitions (copie), du plus ancien au plus récent. */
  get log() {
    return this.#log.slice();
  }

  /** Instantané sérialisable (debug, tests). */
  snapshot() {
    return { main: this.#main, path: this.#path.slice(), overlays: this.#overlays.slice() };
  }

  /** Vrai si la transition principale est autorisée. */
  canGo(to) {
    return this.#def.main[this.#main]?.includes(to) ?? false;
  }

  /**
   * Change d'état principal. Les sous-états et les superpositions sont vidés.
   * @param {string} to
   */
  go(to) {
    if (!(to in this.#def.main)) throw new Error(`[MG] StateMachine : état inconnu ${to}`);
    if (!this.canGo(to)) throw new Error(`[MG] StateMachine : transition interdite ${this.#main} → ${to}`);
    this.#change('go', to, () => {
      this.#main = to;
      this.#path = [];
      this.#overlays = [];
    });
  }

  /**
   * Force un état principal sans vérifier la transition (écran de plantage, retour au titre).
   * @param {string} to
   * @param {string} reason
   */
  force(to, reason) {
    if (!(to in this.#def.main)) throw new Error(`[MG] StateMachine : état inconnu ${to}`);
    this.#change('force', to, () => {
      this.#main = to;
      this.#path = [];
      this.#overlays = [];
    }, reason);
  }

  /**
   * Entre dans un sous-état. Le parent doit être l'état principal ou un sous-état du chemin courant ;
   * les sous-états plus profonds que le parent sont quittés.
   * @param {string} sub
   */
  enter(sub) {
    const chain = [this.#main, ...this.#path];
    const parentIndex = chain.findIndex((s) => this.#def.sub[s]?.includes(sub));
    if (parentIndex < 0) throw new Error(`[MG] StateMachine : sous-état ${sub} impossible depuis ${chain.join(' > ')}`);
    this.#change('enter', sub, () => {
      this.#path = [...this.#path.slice(0, parentIndex), sub];
    });
  }

  /**
   * Superpose un état (OPTIONS, PAUSED, ROTATE_DEVICE). Sans effet s'il est déjà dans la pile.
   * @param {string} overlay
   */
  push(overlay) {
    if (!this.#def.overlays.includes(overlay)) throw new Error(`[MG] StateMachine : superposition inconnue ${overlay}`);
    if (this.#overlays.includes(overlay)) return;
    this.#change('push', overlay, () => this.#overlays.push(overlay));
  }

  /**
   * Retire un état superposé, où qu'il soit dans la pile. Sans effet s'il est absent.
   * @param {string} overlay
   */
  pop(overlay) {
    if (!this.#overlays.includes(overlay)) return;
    this.#change('pop', overlay, () => {
      this.#overlays = this.#overlays.filter((o) => o !== overlay);
    });
  }

  /** Vrai si l'état superposé est présent. */
  has(overlay) {
    return this.#overlays.includes(overlay);
  }

  #change(kind, to, apply, reason) {
    const from = this.snapshot();
    apply();
    const entry = { at: this.#now(), kind, to, from, state: this.snapshot() };
    if (reason) entry.reason = reason;
    this.#log.push(entry);
    if (this.#log.length > this.#logMax) this.#log.shift();
    this.#bus?.emit('STATE_CHANGED', entry);
  }
}
