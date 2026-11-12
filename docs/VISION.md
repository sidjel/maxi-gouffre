# MAXI-GOUFFRE — Vision v3

> Validée par l'auteur. Ce document ne change qu'à sa demande.

## Le jeu

Un RPG à la **Baten Kaitos** dans un supermarché sans fin.

- Chaque lieu est un **grand décor dessiné à la main** (par l'auteur, puis amélioré par IA ; en attendant, formes provisoires), vu à la troisième personne.
- On y fait marcher un **personnage en papier façon Paper Mario**.
- Le personnage tient une **douchette de scanner**. Il vise un produit dans le rayon et en extrait l'**essence**, qui devient une **carte**.
- On combat avec ces cartes en **tour par tour sans chrono**. Le personnage et l'ennemi sont face à face dans le décor, les cartes en bas de l'écran.
- Les cartes **pourrissent** avec le temps et **changent de rôle** :
  - fraîches, elles soignent ou protègent ;
  - mûres, elles ont leur meilleur effet ;
  - pourries, elles deviennent des armes ou des poisons à lancer.
- On **découvre** des combos et des évolutions **inconnus à l'avance**, par hasard ou par logique d'après la nature des cartes.
- Il y a des moments **épiques à la Final Fantasy VII, VIII et X** : une jauge, puis une attaque ultime mise en scène comme une invocation, mais avec des objets du supermarché.
- Un **narrateur odieux** brise le 4ᵉ mur et commente tout.

## Ton

- Étrange (Backrooms, magasin infini) et rigolo (humour noir, absurde).
- Aucune marque réelle.
- Pas d'esthétique « jeu généré par IA » : pas de néons sur fond noir génériques, pas de coffres, pas de capacités « bateau ».

## Piliers

1. **La pourriture change le rôle d'une carte** : la jouer maintenant ou attendre ?
2. **La découverte** : combos par propriétés (liquide, poudre, froid, électrique, gras…) et quelques recettes secrètes nommées ; évolutions cachées (« ? ») tant qu'elles n'ont pas été vues ; un carnet qui se remplit.
3. **Combats lisibles** : l'ennemi annonce son prochain coup ; pas de hasard injuste.
4. **Épique absurde** : jauge puis attaque ultime mise en scène.
5. **Le narrateur** commente, se moque et récompense les découvertes.

## Méthode

On ne sait pas encore si le thème sera fun : **on le vérifie par de petits prototypes jouables** avant de produire du contenu.

| Prototype | Question |
|---|---|
| **A — Le rayon** | Est-ce agréable de marcher dans un rayon et de transformer un produit en carte ? |
| **B — Le combat** | Est-ce fun de faire pourrir ses cartes et de les lancer ? (règles exactes et 12 cartes à valider par l'auteur avant de coder) |
| **C — La découverte** | Combos par propriétés et recettes secrètes, carnet, évolutions cachées, jauge épique et première attaque ultime mise en scène. |
| **D — Le dessin** | Intégration des premiers dessins de l'auteur pour valider la chaîne dessin → scan → IA → jeu. |

## Cibles techniques

- Navigateurs : Chrome, Edge, Firefox sur PC ; Chrome Android, en paysage.
- 60 images par seconde sur un téléphone milieu de gamme.
- 2D en calques (DOM + CSS, Canvas 2D pour les particules), sans WebGL ni moteur 3D.
- Aucun appel réseau pendant le jeu.
