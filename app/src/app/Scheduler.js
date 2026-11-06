/**
 * Délais du jeu : annulables, mis en pause avec le jeu (rotation, arrière-plan, menu pause).
 * Aucune boucle continue : un minuteur par délai. L'horloge est injectable pour les tests.
 */
export class Scheduler {
  #tasks = new Map();
  #nextId = 1;
  #paused = false;
  #clock;

  /**
   * @param {{ now?: () => number, setTimer?: Function, clearTimer?: Function }} [clock]
   */
  constructor(clock = {}) {
    this.#clock = {
      now: clock.now ?? (() => performance.now()),
      setTimer: clock.setTimer ?? ((fn, ms) => setTimeout(fn, ms)),
      clearTimer: clock.clearTimer ?? ((h) => clearTimeout(h)),
    };
  }

  /** Vrai si le planificateur est en pause. */
  get paused() {
    return this.#paused;
  }

  /** Nombre de délais en attente. */
  get size() {
    return this.#tasks.size;
  }

  /**
   * Programme une fonction après `ms` millisecondes de jeu (le temps de pause ne compte pas).
   * @param {number} ms
   * @param {() => void} fn
   * @returns {number} identifiant, pour cancel()
   */
  schedule(ms, fn) {
    if (!(ms >= 0)) throw new RangeError(`[MG] Scheduler.schedule : délai invalide (${ms})`);
    if (typeof fn !== 'function') throw new TypeError('[MG] Scheduler.schedule : fonction attendue');
    const id = this.#nextId++;
    const task = { fn, remaining: ms, startedAt: 0, handle: null };
    this.#tasks.set(id, task);
    if (!this.#paused) this.#arm(id, task);
    return id;
  }

  /** Annule un délai. Sans effet s'il est déjà passé. */
  cancel(id) {
    const task = this.#tasks.get(id);
    if (!task) return false;
    if (task.handle !== null) this.#clock.clearTimer(task.handle);
    this.#tasks.delete(id);
    return true;
  }

  /** Annule tous les délais (changement d'écran). */
  clear() {
    for (const id of [...this.#tasks.keys()]) this.cancel(id);
  }

  /** Met en pause : chaque délai garde le temps qui lui restait. */
  pause() {
    if (this.#paused) return;
    this.#paused = true;
    const now = this.#clock.now();
    for (const task of this.#tasks.values()) {
      if (task.handle === null) continue;
      this.#clock.clearTimer(task.handle);
      task.handle = null;
      task.remaining = Math.max(0, task.remaining - (now - task.startedAt));
    }
  }

  /** Reprend les délais là où ils en étaient. */
  resume() {
    if (!this.#paused) return;
    this.#paused = false;
    for (const [id, task] of this.#tasks) this.#arm(id, task);
  }

  #arm(id, task) {
    task.startedAt = this.#clock.now();
    task.handle = this.#clock.setTimer(() => {
      this.#tasks.delete(id);
      task.fn();
    }, task.remaining);
  }
}
