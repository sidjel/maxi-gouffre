import { logError } from './log.js';

/**
 * Bus d'événements synchrone. L'interface, le narrateur, l'audio et le debug s'y abonnent.
 * Une erreur dans un abonné est journalisée mais n'empêche pas les autres de recevoir l'événement.
 */
export class EventBus {
  #listeners = new Map();
  #anyListeners = new Set();

  /**
   * S'abonne à un type d'événement.
   * @param {string} type
   * @param {(payload: any, type: string) => void} fn
   * @returns {() => void} fonction de désabonnement
   */
  on(type, fn) {
    if (typeof fn !== 'function') throw new TypeError(`[MG] EventBus.on(${type}) : fonction attendue`);
    if (!this.#listeners.has(type)) this.#listeners.set(type, new Set());
    this.#listeners.get(type).add(fn);
    return () => this.off(type, fn);
  }

  /** S'abonne pour un seul déclenchement. */
  once(type, fn) {
    const off = this.on(type, (payload, t) => {
      off();
      fn(payload, t);
    });
    return off;
  }

  /** Se désabonne. */
  off(type, fn) {
    const set = this.#listeners.get(type);
    if (!set) return;
    set.delete(fn);
    if (set.size === 0) this.#listeners.delete(type);
  }

  /**
   * Reçoit tous les événements (panneau debug).
   * @param {(payload: any, type: string) => void} fn
   * @returns {() => void}
   */
  onAny(fn) {
    this.#anyListeners.add(fn);
    return () => this.#anyListeners.delete(fn);
  }

  /**
   * Publie un événement.
   * @param {string} type
   * @param {any} [payload]
   */
  emit(type, payload) {
    const targets = [...(this.#listeners.get(type) ?? []), ...this.#anyListeners];
    for (const fn of targets) {
      try {
        fn(payload, type);
      } catch (err) {
        logError(`abonné de ${type} en erreur :`, err);
      }
    }
  }

  /** Nombre d'abonnés à un type (tests). */
  count(type) {
    return this.#listeners.get(type)?.size ?? 0;
  }
}
