import { el, clear } from '../ui/dom.js';
import { next, seedFrom } from '../core/rng.js';

/**
 * Panneau debug (ARCHITECTURE.md §14.4), actif seulement avec ?debug=1.
 * Ouvert par F3 (action DEBUG) ou par le bouton « DBG ».
 * J0 : état courant en JSON, FPS, graine (lecture et saisie), journal des transitions.
 * Les outils de partie (âge, cartes, salles, combats, scénarios) arrivent avec les jalons concernés.
 */
export class DebugPanel {
  #ctx;
  #panel;
  #toggle;
  #fps;
  #state;
  #seedValue;
  #seedInput;
  #seedError;
  #draws;
  #log;
  #raf = null;
  #frames = 0;
  #windowStart = 0;

  /**
   * @param {HTMLElement} parent
   * @param {{ t: Function, tech: object, sm: object, stage: object, scheduler: object,
   *           getState: () => object, getSeed: () => number, setSeed: (n: number) => void }} ctx
   */
  constructor(parent, ctx) {
    this.#ctx = ctx;
    const { t } = ctx;
    this.#fps = el('span', { className: 'debug-fps', attrs: { 'data-debug': 'fps' } });
    this.#state = el('pre', { className: 'debug-state', attrs: { 'data-debug': 'state' } });
    this.#seedValue = el('code', { attrs: { 'data-debug': 'seed' } });
    this.#seedInput = el('input', {
      className: 'debug-input',
      attrs: { type: 'text', inputmode: 'numeric', autocomplete: 'off', 'aria-label': t('debug.seedInput'), 'data-debug': 'seed-input' },
    });
    this.#seedError = el('p', { className: 'debug-error', attrs: { role: 'alert' } });
    this.#draws = el('p', { className: 'debug-draws', attrs: { 'data-debug': 'draws' } });
    this.#log = el('ol', { className: 'debug-log', attrs: { 'data-debug': 'log' } });

    const form = el('form', { className: 'debug-seed-form', on: { submit: (e) => this.#applySeed(e) } }, [
      this.#seedInput,
      el('button', { className: 'debug-btn', text: t('debug.seedApply'), attrs: { type: 'submit' } }),
    ]);

    this.#panel = el('aside', { className: 'debug-panel', attrs: { hidden: true, 'aria-label': t('debug.title'), 'data-debug': 'panel' } }, [
      el('header', { className: 'debug-header' }, [
        el('h2', { className: 'debug-title', text: t('debug.title') }),
        this.#fps,
        el('button', { className: 'debug-btn', text: t('debug.close'), attrs: { type: 'button' }, on: { click: () => this.close() } }),
      ]),
      el('section', {}, [el('h3', { text: t('debug.seed') }), el('p', {}, [t('debug.seedCurrent'), ' ', this.#seedValue]), form, this.#seedError, this.#draws]),
      el('section', {}, [el('h3', { text: t('debug.state') }), this.#state]),
      el('section', {}, [el('h3', { text: t('debug.transitions') }), this.#log]),
    ]);

    this.#toggle = el('button', {
      className: 'debug-toggle',
      text: t('debug.button'),
      attrs: { type: 'button', 'aria-label': t('debug.title'), 'data-debug': 'toggle' },
      on: { click: () => this.toggle() },
    });
    parent.append(this.#panel, this.#toggle);
  }

  /** Vrai si le panneau est ouvert. */
  get isOpen() {
    return !this.#panel.hidden;
  }

  /** Ouvre ou ferme. */
  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  /** Ouvre le panneau et lance la mesure des FPS. */
  open() {
    this.#panel.hidden = false;
    this.#refresh();
    this.#frames = 0;
    this.#windowStart = performance.now();
    this.#raf = requestAnimationFrame((now) => this.#tick(now));
  }

  /** Ferme le panneau et arrête la boucle d'affichage. */
  close() {
    this.#panel.hidden = true;
    if (this.#raf !== null) cancelAnimationFrame(this.#raf);
    this.#raf = null;
  }

  #tick(now) {
    this.#frames += 1;
    const elapsed = now - this.#windowStart;
    if (elapsed >= this.#ctx.tech.DEBUG_REFRESH_MS) {
      this.#fps.textContent = this.#ctx.t('debug.fps', { fps: Math.round((this.#frames * 1000) / elapsed) });
      this.#frames = 0;
      this.#windowStart = now;
      this.#refresh();
    }
    this.#raf = requestAnimationFrame((n) => this.#tick(n));
  }

  #refresh() {
    this.#state.textContent = JSON.stringify(this.#ctx.getState(), null, 2);
    const seed = this.#ctx.getSeed();
    this.#seedValue.textContent = String(seed);
    const count = this.#ctx.tech.DEBUG_RNG_PREVIEW;
    this.#draws.textContent = this.#ctx.t('debug.draws', { count, values: previewDraws(seed, count) });
    this.#renderLog();
  }

  #renderLog() {
    clear(this.#log);
    for (const entry of this.#ctx.sm.log.slice().reverse()) {
      const from = entry.from.overlays.at(-1) ?? entry.from.path.at(-1) ?? entry.from.main;
      const time = new Date(entry.at).toISOString().slice(11, 23);
      const reason = entry.reason ? ` (${entry.reason})` : '';
      this.#log.append(el('li', { text: `${time}  ${entry.kind}  ${from} → ${entry.to}${reason}` }));
    }
  }

  #applySeed(e) {
    e.preventDefault();
    const raw = this.#seedInput.value.trim();
    const n = Number(raw);
    if (raw === '' || !Number.isSafeInteger(n) || n < 0) {
      this.#seedError.textContent = this.#ctx.t('debug.seedInvalid');
      return;
    }
    this.#seedError.textContent = '';
    this.#ctx.setSeed(n);
    this.#refresh();
  }
}

/** Les premiers tirages d'une graine, pour vérifier à l'œil que la même graine donne la même suite. */
function previewDraws(seed, count) {
  const values = [];
  let state = seedFrom(seed);
  for (let i = 0; i < count; i += 1) {
    const r = next(state);
    values.push(r.value.toFixed(4));
    state = r.rngState;
  }
  return values.join(' · ');
}
