/**
 * Seul point qui appelle les actions du cœur (ARCHITECTURE.md §6) : il applique l'action,
 * remplace l'état dans le Store, publie les événements du cœur puis STORE_CHANGED.
 * Les sauvegardes arrivent au jalon J4.
 */
import * as match from '../core/match.js';
import * as ai from '../core/ai.js';
import { createQuickMatch } from '../core/quickMatch.js';

export class Session {
  #store;
  #bus;
  #ctx;

  /**
   * @param {{ store: import('./Store.js').Store, bus: import('./EventBus.js').EventBus, ctx: { defs: object, rules: object } }} deps
   */
  constructor({ store, bus, ctx }) {
    this.#store = store;
    this.#bus = bus;
    this.#ctx = ctx;
  }

  /** Contexte du cœur { defs, rules }, en lecture pour l'interface. */
  get ctx() {
    return this.#ctx;
  }

  /** État courant ({ game, match }) ou null. */
  get state() {
    return this.#store.state;
  }

  #apply(result) {
    this.#store.set(result.state);
    for (const event of result.events) this.#bus.emit(event.type, event);
    this.#bus.emit('STORE_CHANGED', result.state);
  }

  /** Lance un combat rapide avec la graine donnée. */
  startQuickMatch(seed) {
    this.#apply(createQuickMatch(seed, this.#ctx));
  }

  /** Le joueur montre son coup de chifoumi. */
  chifoumi(playerThrow) {
    this.#apply(match.setChifoumi(this.state, playerThrow, this.#ctx));
  }

  /** Le joueur, vainqueur du chifoumi, choisit qui commence. */
  chooseStarter(starter) {
    this.#apply(match.setStarter(this.state, 'player', starter, this.#ctx));
  }

  /** Le joueur pose une carte. */
  play(uid, cell) {
    this.#apply(match.playCard(this.state, 'player', uid, cell, null, this.#ctx));
  }

  /** Le joueur passe (la confirmation a déjà eu lieu). */
  pass() {
    this.#apply(match.pass(this.state, 'player', this.#ctx));
  }

  /** L'IA joue son tour. */
  opponentTurn() {
    this.#apply(ai.playTurn(this.state, this.#ctx));
  }

  /** L'IA, gagnante du chifoumi, choisit qui commence. */
  opponentChoosesStarter() {
    this.#apply(ai.decideStarter(this.state, this.#ctx));
  }

  /** Passe à la manche suivante. */
  nextRound() {
    this.#apply(match.endRound(this.state, this.#ctx));
  }

  /** Quitte le combat. */
  end() {
    this.#store.clear();
  }
}
