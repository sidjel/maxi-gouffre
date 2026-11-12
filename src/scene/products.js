/**
 * Les produits scannables posés sur les étagères (points d'intérêt).
 * Le plus proche du personnage est mis en évidence ; un produit scanné laisse une étiquette « RUPTURE ».
 */
import { el, img } from './assets.js';

export function createProducts(container, aisle, catalog) {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const items = aisle.products.map((spot, index) => {
    const product = byId.get(spot.product);
    if (!product) throw new Error(`[MG] Produit inconnu dans aisle.json : ${spot.product}`);
    const node = el('div', 'product', { 'data-product': product.id, 'data-index': String(index) });
    node.style.width = `${product.w}px`;
    node.style.height = `${product.h}px`;
    node.style.transform = `translate3d(${spot.x - product.w / 2}px, ${spot.y - product.h}px, 0)`;
    node.style.setProperty('--h', `${product.h}px`);
    const tag = el('div', 'product-tag');
    tag.innerHTML = `<span class="product-tag-name"></span><small></small>`;
    tag.firstChild.textContent = product.name;
    node.append(el('div', 'product-glow'), img(product.image), el('div', 'product-scanline'), tag);
    const rupture = el('div', 'product-rupture');
    rupture.textContent = 'RUPTURE';
    node.append(rupture);
    container.append(node);
    return { index, product, x: spot.x, y: spot.y, node, hint: tag.lastChild, scanned: false, restockAt: 0 };
  });

  let near = null;

  return {
    items,
    get near() { return near; },
    /** Produit le plus proche des pieds du personnage, s'il est assez près. */
    findNearest(px, py, radius, floorBack) {
      let best = null; let bestD = Infinity;
      for (const it of items) {
        const d = Math.hypot(it.x - px, Math.max(0, py - floorBack - 50) * 0.7);
        if (d < bestD) { bestD = d; best = it; }
      }
      return bestD <= radius ? best : null;
    },
    setNear(item, hintText) {
      if (near !== item) {
        near?.node.classList.remove('is-near');
        item?.node.classList.add('is-near');
        near = item;
      }
      if (item) item.hint.textContent = item.scanned ? 'Déjà scanné' : hintText;
    },
    fromNode(target) {
      const node = target?.closest?.('.product');
      return node ? items[Number(node.dataset.index)] : null;
    },
    setScanning(item, on) { item.node.classList.toggle('is-scanning', on); },
    markScanned(item, now, restockSec) {
      item.scanned = true;
      item.restockAt = restockSec > 0 ? now + restockSec * 1000 : 0;
      item.node.classList.add('is-gone');
    },
    /** Réassort : remet les produits dont le délai est passé. */
    update(now) {
      for (const it of items) {
        if (it.scanned && it.restockAt && now >= it.restockAt) {
          it.scanned = false;
          it.node.classList.remove('is-gone');
        }
      }
    },
    allScanned() { return items.every((it) => it.scanned); },
  };
}
