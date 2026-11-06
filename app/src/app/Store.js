/**
 * Garde l'état courant du jeu. Seul Session.js le remplace (ARCHITECTURE.md §6).
 */
export class Store {
  #state = null;

  /** État courant (ne pas le modifier : les actions du cœur renvoient toujours un nouvel état). */
  get state() {
    return this.#state;
  }

  /** Remplace l'état. */
  set(state) {
    this.#state = state;
  }

  /** Oublie l'état (retour au titre). */
  clear() {
    this.#state = null;
  }
}
