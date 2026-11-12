/**
 * Reflets des cartes (DIRECTION_ARTISTIQUE.md §2.3, §11) : écrit --sx / --sy (de -1 à 1), lus par finishes.css.
 * - PC : position de la souris sur la carte visée (la carte reçoit is-lit) ;
 * - téléphone : inclinaison (DeviceOrientationEvent), écrite sur la racine, pour toutes les cartes ;
 * - « Réduire les animations » : rien n'est piloté, le reflet reste fixe.
 * Effet purement visuel : ce module ne produit aucune action de jeu (les actions passent par InputHandler).
 */

const clamp = (v) => Math.max(-1, Math.min(1, v));

/**
 * @param {Window} win
 * @param {HTMLElement} root élément qui reçoit les variables du gyroscope (la racine du document)
 * @param {{ tech: { SHINE_TILT_RANGE: number, SHINE_RECENTER: number }, handheld: boolean }} opts
 * @returns {() => void} débranche les écouteurs
 */
export function installShine(win, root, opts) {
  const reduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  const { SHINE_TILT_RANGE: range, SHINE_RECENTER: recenter } = opts.tech;
  let frame = 0;
  let move = null;
  let tilt = null;
  let lit = null;
  let base = null;

  const unlight = () => {
    if (!lit) return;
    lit.classList.remove('is-lit');
    lit.style.setProperty('--sx', '');
    lit.style.setProperty('--sy', '');
    lit = null;
  };

  function draw() {
    frame = 0;
    if (move) {
      const e = move;
      move = null;
      const card = e.target instanceof Element ? e.target.closest('.card') : null;
      if (card !== lit) unlight();
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--sx', clamp(((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        card.style.setProperty('--sy', clamp(((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        card.classList.add('is-lit');
        lit = card;
      }
    }
    if (tilt) {
      root.style.setProperty('--sx', tilt.x.toFixed(3));
      root.style.setProperty('--sy', tilt.y.toFixed(3));
      root.dataset.shine = 'gyro';
      tilt = null;
    }
  }

  const request = () => {
    if (!frame) frame = win.requestAnimationFrame(draw);
  };

  const onMove = (e) => {
    // Au doigt, le reflet suit l'inclinaison du téléphone, pas le glissé.
    if (e.pointerType === 'touch' || reduce.matches) return;
    move = e;
    request();
  };
  const onLeave = () => unlight();

  const onOrientation = (e) => {
    if (reduce.matches || e.beta === null || e.gamma === null) return;
    // En paysage, les axes de l'appareil tournent avec l'écran.
    const angle = win.screen?.orientation?.angle ?? 0;
    let x = e.gamma;
    let y = e.beta;
    if (angle === 90) [x, y] = [e.beta, -e.gamma];
    else if (angle === 270 || angle === -90) [x, y] = [-e.beta, e.gamma];
    // Position neutre : celle où le joueur tient son téléphone, recentrée doucement.
    if (!base) base = { x, y };
    base.x += (x - base.x) * recenter;
    base.y += (y - base.y) * recenter;
    tilt = { x: clamp((x - base.x) / range), y: clamp((y - base.y) / range) };
    request();
  };

  win.addEventListener('pointermove', onMove, { passive: true });
  win.document.addEventListener('pointerleave', onLeave);
  const gyro = opts.handheld && 'DeviceOrientationEvent' in win;
  if (gyro) win.addEventListener('deviceorientation', onOrientation);

  return () => {
    win.removeEventListener('pointermove', onMove);
    win.document.removeEventListener('pointerleave', onLeave);
    if (gyro) win.removeEventListener('deviceorientation', onOrientation);
    if (frame) win.cancelAnimationFrame(frame);
    unlight();
  };
}
