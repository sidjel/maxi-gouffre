/**
 * Mode debug (F3 ou réglage « Montrer la zone de marche ») : dessine la zone de marche,
 * les obstacles, le chemin suivi, les produits et les pieds du personnage.
 */
const NS = 'http://www.w3.org/2000/svg';

export function createDebugOverlay(plane, aisle, mask) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'debug-mask');
  svg.setAttribute('width', String(aisle.world.width));
  svg.setAttribute('height', String(aisle.world.height));
  const pts = (poly) => poly.map(([x, y]) => `${x},${y}`).join(' ');
  svg.innerHTML = `
<polygon points="${pts(mask.polygon)}" fill="rgba(90,170,90,.28)" stroke="#2f7a3a" stroke-width="4" stroke-dasharray="14 8"/>
${mask.holes.map((h) => `<polygon points="${pts(h)}" fill="rgba(200,60,50,.35)" stroke="#a02a20" stroke-width="3"/>`).join('')}
${aisle.products.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="8" fill="#e3c547" stroke="#3b332a" stroke-width="3"/>`).join('')}
<polyline class="debug-path" fill="none" stroke="#2a64a0" stroke-width="5" stroke-dasharray="4 8"/>
<circle class="debug-feet" r="9" fill="#2a64a0"/>`;
  svg.style.display = 'none';
  plane.append(svg);
  const path = svg.querySelector('.debug-path');
  const feet = svg.querySelector('.debug-feet');

  return {
    update(visible, player) {
      svg.style.display = visible ? '' : 'none';
      if (!visible) return;
      feet.setAttribute('cx', String(player.x));
      feet.setAttribute('cy', String(player.y));
      path.setAttribute('points', [[player.x, player.y], ...player.state.path].map(([x, y]) => `${x},${y}`).join(' '));
    },
  };
}
