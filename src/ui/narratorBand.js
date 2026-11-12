/**
 * Le narrateur : une bande en haut de l'écran, façon annonce au haut-parleur du magasin.
 * Carillon, puis texte à la machine à écrire. Une annonce plus importante passe devant ; sinon elle attend dans une petite file (3 au plus, la plus importante d'abord).
 */
import { el } from '../scene/assets.js';
import { displayText } from '../core/narrator.js';
import { sfx } from '../audio/sfx.js';

export function createNarratorBand(parent) {
  const band = el('div', 'narrator', { 'data-ui': '', role: 'status', 'aria-live': 'polite' });
  band.innerHTML = '<div class="narrator-speaker" aria-hidden="true"><i></i><i></i><i></i></div><p class="narrator-text"></p>';
  parent.append(band);
  const textEl = band.querySelector('.narrator-text');

  let current = null; // { text, priority, shown, holdLeft }
  const queue = [];
  const MAX_QUEUE = 3;

  function start(entry) {
    current = { ...entry, full: displayText(entry.text), shown: 0, holdLeft: null };
    textEl.textContent = '';
    textEl.setAttribute('aria-label', current.full);
    band.classList.add('is-on');
    band.dataset.event = entry.event;
    sfx.chime();
  }

  band.addEventListener('pointerdown', () => {
    if (!current) return;
    if (current.shown < current.full.length) current.shown = current.full.length;
    else current.holdLeft = 0;
  });

  return {
    get busy() { return !!current; },
    get text() { return current?.full ?? ''; },
    say(entry) {
      if (!entry) return;
      if (!current) { start(entry); return; }
      if (entry.priority > current.priority) { queue.unshift(current); start(entry); }
      else if (!queue.some((q) => q.event === entry.event)) queue.push(entry);
      queue.sort((a, b) => b.priority - a.priority);
      queue.length = Math.min(queue.length, MAX_QUEUE);
    },
    update(dt, cfg) {
      if (!current) return;
      if (current.shown < current.full.length) {
        current.shown = cfg.reduceMotion ? current.full.length : Math.min(current.full.length, current.shown + cfg.typeCps * dt);
        textEl.textContent = current.full.slice(0, Math.floor(current.shown));
        if (current.shown >= current.full.length) current.holdLeft = cfg.narratorHoldMs / 1000 + current.full.length / 60;
        return;
      }
      current.holdLeft -= dt;
      if (current.holdLeft <= 0) {
        current = null;
        band.classList.remove('is-on');
        if (queue.length) { const q = queue.shift(); setTimeout(() => { if (!current) start(q); else queue.unshift(q); }, 350); }
      }
    },
  };
}
