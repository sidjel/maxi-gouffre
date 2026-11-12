/**
 * Panneau de réglages (F2, bouton ⚙ ou Start) : toutes les valeurs de src/config.js, modifiables en jouant.
 * Il est hors de la scène mise à l'échelle, pour rester lisible sur téléphone.
 * Clavier/manette : haut/bas pour choisir, gauche/droite pour changer, Échap/B pour fermer.
 */
import { el } from '../scene/assets.js';
import { SETTINGS, config, setConfig, resetConfig, changedSettings, onConfigChange } from '../config.js';

const decimals = (step) => (String(step).split('.')[1] ?? '').length;

export function createSettings(parent, { onClose }) {
  const root = el('aside', 'settings', { 'aria-label': 'Réglages', hidden: '' });
  root.innerHTML = `
<header class="settings-head"><h2>Réglages</h2><button type="button" class="btn settings-close">Fermer <kbd>Échap</kbd></button></header>
<div class="settings-body"></div>
<footer class="settings-foot">
  <button type="button" class="btn settings-copy">Copier mes réglages</button>
  <button type="button" class="btn settings-reset">Tout remettre à zéro</button>
  <p class="settings-note" aria-live="polite"></p>
</footer>`;
  parent.append(root);
  const body = root.querySelector('.settings-body');
  const note = root.querySelector('.settings-note');
  const inputs = new Map();

  let group = null;
  for (const s of SETTINGS) {
    if (s.group !== group) {
      group = s.group;
      const h = el('h3'); h.textContent = group; body.append(h);
    }
    const row = el('label', 'settings-row');
    const name = el('span', 'settings-label'); name.textContent = s.label;
    const input = el('input', '', s.type === 'bool'
      ? { type: 'checkbox', 'data-key': s.key }
      : { type: 'range', min: s.min, max: s.max, step: s.step, 'data-key': s.key });
    const out = el('output', 'settings-value');
    row.append(name, input, out);
    body.append(row);
    inputs.set(s.key, { s, input, out });
    input.addEventListener('input', () => {
      setConfig(s.key, s.type === 'bool' ? input.checked : Number(input.value));
    });
  }

  function show(key) {
    const { s, input, out } = inputs.get(key);
    if (s.type === 'bool') { input.checked = !!config[key]; out.textContent = config[key] ? 'oui' : 'non'; }
    else { input.value = String(config[key]); out.textContent = Number(config[key]).toFixed(decimals(s.step)); }
  }
  for (const key of inputs.keys()) show(key);
  onConfigChange((key) => { if (inputs.has(key)) show(key); });

  root.querySelector('.settings-close').addEventListener('click', () => onClose());
  root.querySelector('.settings-reset').addEventListener('click', () => { resetConfig(); note.textContent = 'Valeurs d’origine remises.'; });
  root.querySelector('.settings-copy').addEventListener('click', async () => {
    const text = JSON.stringify(changedSettings(), null, 2);
    try { await navigator.clipboard.writeText(text); note.textContent = 'Copié ! Colle-le dans ton message à Claude.'; }
    catch { note.textContent = text; }
  });

  const focusables = () => [...root.querySelectorAll('input, button')];

  return {
    get open() { return !root.hidden; },
    show() { root.hidden = false; note.textContent = ''; (focusables()[1] ?? root).focus(); },
    hide() { root.hidden = true; },
    /** Navigation au clavier (hors curseur actif) et à la manette. */
    nav({ dx, dy }, fromGamepad) {
      const list = focusables();
      const i = list.indexOf(document.activeElement);
      if (dy) { list[(i + dy + list.length) % list.length]?.focus(); return; }
      const cur = list[i];
      if (dx && cur?.type === 'range' && fromGamepad) {
        if (dx > 0) cur.stepUp(); else cur.stepDown();
        cur.dispatchEvent(new Event('input'));
      }
    },
    /** Bouton A de la manette sur l'élément choisi. */
    press() {
      const cur = document.activeElement;
      if (!root.contains(cur)) return;
      if (cur.type === 'checkbox' || cur.tagName === 'BUTTON') cur.click();
    },
  };
}
