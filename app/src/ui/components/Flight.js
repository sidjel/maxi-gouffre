/**
 * Pose d'une carte (DIRECTION_ARTISTIQUE.md §2.4) : la carte glisse vers sa case, puis le laser
 * rouge d'un scanner la balaie. Le vol se fait dans le plan de la scène (au-dessus du plateau incliné),
 * avec une copie de la carte posée, animée par `transform` seulement.
 * « Réduire les animations » : ni vol ni laser, la carte apparaît directement.
 */

/**
 * @param {{ win: Window, layer: HTMLElement, durationMs: number }} opts layer = conteneur du vol (l'écran de combat)
 */
export function createFlights({ win, layer, durationMs }) {
  const reduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();

  /** Rectangle d'un élément dans les px logiques du calque (la scène est mise à l'échelle). */
  function local(rect) {
    const box = layer.getBoundingClientRect();
    const scale = box.width / layer.offsetWidth || 1;
    return {
      x: (rect.left - box.left) / scale,
      y: (rect.top - box.top) / scale,
      w: rect.width / scale,
      h: rect.height / scale,
    };
  }

  function scan(card) {
    card.classList.remove('is-scanning');
    // Relance l'animation si la classe était déjà là.
    void card.offsetWidth;
    card.classList.add('is-scanning');
    card.addEventListener('animationend', (e) => {
      if (e.animationName === 'scan-sweep') card.classList.remove('is-scanning');
    });
  }

  return {
    /**
     * Fait atterrir une carte qui vient d'être posée.
     * @param {HTMLElement} card carte sur le plateau (déjà à sa place)
     * @param {DOMRect|null} from rectangle de départ à l'écran (carte de la main, main adverse)
     */
    land(card, from) {
      if (reduce.matches) return;
      if (!from) {
        scan(card);
        return;
      }
      const end = local(card.getBoundingClientRect());
      const start = local(from);
      if (end.w === 0 || start.w === 0) {
        scan(card);
        return;
      }
      const ghost = card.cloneNode(true);
      ghost.classList.remove('is-new', 'is-scanning', 'is-landing');
      ghost.classList.add('card-flight');
      ghost.removeAttribute('aria-label');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.style.setProperty('--flight-w', `${end.w}px`);
      layer.append(ghost);
      card.classList.add('is-landing');
      const s = start.w / end.w;
      const anim = ghost.animate([
        { transform: `translate(${start.x}px, ${start.y}px) scale(${s})` },
        { transform: `translate(${end.x}px, ${end.y - end.h * 0.15}px) scale(1.08)`, offset: 0.75 },
        { transform: `translate(${end.x}px, ${end.y}px) scale(1)` },
      ], { duration: durationMs, easing: 'ease-out' });
      running.add(anim);
      const done = () => {
        running.delete(anim);
        ghost.remove();
        card.classList.remove('is-landing');
        scan(card);
      };
      anim.onfinish = done;
      anim.oncancel = done;
    },

    /**
     * Fait atterrir les cartes posées depuis le dernier rendu.
     * @param {Iterable<string>} uids
     * @param {(uid: string) => HTMLElement|null} nodeOf carte sur le plateau
     * @param {{ uid: string, rect: DOMRect }|null} launch carte lancée par le joueur depuis sa main
     * @param {Element|null} foeSource d'où partent les cartes de l'adversaire
     */
    landAll(uids, nodeOf, launch, foeSource) {
      for (const uid of uids) {
        const card = nodeOf(uid);
        if (!card) continue;
        this.land(card, launch?.uid === uid ? launch.rect : foeSource?.getBoundingClientRect() ?? null);
      }
    },

    /** Arrête les vols en cours (démontage de l'écran). */
    stop() {
      for (const anim of [...running]) anim.cancel();
    },
  };
}
