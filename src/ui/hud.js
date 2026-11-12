/**
 * Interface en jeu : bouton Panier (avec compteur), bouton ⚙ (réglages), bouton d'action,
 * joystick virtuel (option), plein écran (tactile), compteur d'images par seconde.
 */
import { el } from '../scene/assets.js';

export function createHud(parent, input, { onBasket, onSettings, onAction }) {
  const root = el('div', 'hud');
  root.innerHTML = `
<button class="hud-btn hud-basket" type="button" data-ui aria-label="Panier"><span class="hud-basket-icon" aria-hidden="true"></span><span>Panier</span><b class="hud-count">0</b></button>
<button class="hud-btn hud-settings" type="button" data-ui aria-label="Réglages (F2)">⚙</button>
<button class="hud-btn hud-full" type="button" data-ui aria-label="Plein écran" hidden>⛶</button>
<button class="hud-action" type="button" data-ui aria-label="Agir"><span class="hud-action-label">Scanner</span><kbd class="hud-action-key">Entrée</kbd></button>
<div class="joystick" data-ui hidden><div class="joystick-knob"></div></div>
<div class="fps" hidden></div>`;
  parent.append(root);
  const $ = (s) => root.querySelector(s);
  $('.hud-basket').addEventListener('click', onBasket);
  $('.hud-settings').addEventListener('click', onSettings);
  $('.hud-action').addEventListener('click', onAction);

  // Plein écran : utile sur téléphone (la barre d'adresse mange la place).
  const full = $('.hud-full');
  if (document.fullscreenEnabled && window.matchMedia('(pointer: coarse)').matches) full.hidden = false;
  full.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else { await document.documentElement.requestFullscreen(); await screen.orientation?.lock?.('landscape'); }
    } catch { /* refusé par le navigateur : tant pis */ }
  });

  // Joystick virtuel.
  const joy = $('.joystick'); const knob = $('.joystick-knob');
  const R = 110;
  let joyId = null; let center = null;
  function joyMove(e) {
    const r = joy.getBoundingClientRect();
    center ??= { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const scale = r.width / 280;
    let dx = (e.clientX - center.x) / scale; let dy = (e.clientY - center.y) / scale;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    input.setJoystick({ x: dx / R, y: dy / R });
  }
  joy.addEventListener('pointerdown', (e) => { joyId = e.pointerId; center = null; joy.setPointerCapture(e.pointerId); joyMove(e); });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === joyId) joyMove(e); });
  const joyEnd = (e) => { if (e.pointerId !== joyId) return; joyId = null; knob.style.transform = ''; input.setJoystick({ x: 0, y: 0 }); };
  joy.addEventListener('pointerup', joyEnd);
  joy.addEventListener('pointercancel', joyEnd);

  let frames = 0; let acc = 0;
  const KEYS = { keyboard: 'Entrée', mouse: 'Entrée', gamepad: 'A', touch: '' };

  return {
    basketCenter() { return { x: 1680, y: 80 }; },
    setCount(n) {
      $('.hud-count').textContent = String(n);
      const b = $('.hud-basket');
      b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump');
    },
    setAction(label, enabled) {
      $('.hud-action-label').textContent = label;
      $('.hud-action').classList.toggle('is-off', !enabled);
    },
    setDevice(device) {
      const k = KEYS[device] ?? '';
      const kbd = $('.hud-action-key');
      kbd.textContent = k;
      kbd.hidden = !k;
    },
    setJoystickVisible(on) { joy.hidden = !on; if (!on) input.setJoystick({ x: 0, y: 0 }); },
    tickFps(dt, show) {
      const f = $('.fps');
      f.hidden = !show;
      if (!show) return;
      frames += 1; acc += dt;
      if (acc >= 0.5) { f.textContent = `${Math.round(frames / acc)} i/s`; frames = 0; acc = 0; }
    },
  };
}
