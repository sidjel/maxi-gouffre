# Journal des séances

Le rapport le plus récent est en haut.

---

## Séance 1 — Socle v3 et prototype A « Le rayon » (2026-11-12)

**Question vérifiée** : est-ce agréable de marcher dans un rayon et de transformer un produit en carte ?

### Ce qui est jouable maintenant
- Un rayon de supermarché en calques, plus large que l'écran. Au fond, un magasin qui se perd dans la brume. Au premier plan, deux piliers et une tête de gondole passent devant le personnage. La caméra suit en douceur.
- Le personnage en papier, en 2 vues (trois quarts face et trois quarts dos) retournées en miroir.
  - La feuille pivote quand il change de sens.
  - Il rebondit en marchant, respire à l'arrêt et sursaute au scan.
  - Il rapetisse au fond du rayon.
  - Il passe devant ou derrière la palette d'eau, le bac promo et le panneau « sol glissant ».
- Une zone de marche invisible, avec des obstacles qu'on contourne. Le clic ou le toucher calcule un chemin.
- 10 produits : banane, lait, steak, baguette, glace, pile, céréales, bière, plante, fromage. Le plus proche est mis en évidence par une étiquette et un léger soulèvement.
- Le scan, en 4 temps :
  1. le personnage se tourne vers le rayon et lève sa douchette ;
  2. laser et *bip* ;
  3. le produit se dissout en confettis aspirés par la douchette ;
  4. la carte jaillit en se retournant, brille, puis file dans le Panier.

  Le produit scanné laisse une étiquette « RUPTURE ».
- La carte affiche son nom, sa puissance, son stade (Frais, Mûr, Pourri), une jauge de fraîcheur et ses propriétés.
- Le Panier : la liste des cartes.
- Le narrateur : une annonce au haut-parleur (carillon et machine à écrire), avec 24 répliques `[TEMP]`. Il réagit à l'arrivée, au premier produit vu, aux scans (certains produits ont leur réplique), au produit déjà scanné, à l'inactivité, au Panier, aux obstacles, au bout du rayon, au rayon vidé et aux réglages.
- L'ancien jeu v2 reste jouable sur https://sidjel.github.io/maxi-gouffre/v2/.

### Comment tester
**Sur PC** (après fusion : https://sidjel.github.io/maxi-gouffre/ ; ou `npm run dev`) :
1. Marcher avec **ZQSD** ou les **flèches**, ou **cliquer** sur le sol (même derrière la palette).
2. S'approcher d'un produit, puis **Entrée** ou **Espace** pour le scanner. Le bouton jaune marche aussi.
3. **P** ouvre le Panier, **Échap** le ferme.
4. **F2** ouvre les réglages. **F3** montre la zone de marche et les images par seconde.
5. Manette : stick ou croix pour marcher, **A** pour scanner, **Y** pour le Panier, **Start** pour les réglages, **B** pour revenir.

**Sur téléphone, en paysage** (même adresse, ou l'adresse `Network` de `npm run dev` sur le même Wi-Fi) :
1. Toucher le sol pour y aller ; on peut garder le doigt posé et le faire glisser.
2. Toucher un produit pour y aller, puis le **toucher à nouveau** (ou le bouton jaune) pour le scanner.
3. Le bouton **⛶** passe en plein écran.
4. Le **joystick virtuel** s'active dans ⚙ → « Son et affichage ».

### Quoi essayer et à quoi faire attention
1. **La marche** : le rebond, le balancement et le pivot de la feuille donnent-ils du charme, ou est-ce trop ? Joue avec le groupe « Animation ».
2. **Le scan** : as-tu envie d'en scanner un autre ? Le rythme est-il trop lent ou trop rapide ? Règle « Durée du scan » et « Temps d'affichage de la carte ».
3. **La profondeur** : la taille du personnage, son rétrécissement au fond et le pilier qui passe devant te gênent-ils ou t'aident-ils ? Règle « Taille du personnage », « Taille au fond du rayon » et « Taille au premier plan ».

### Réglages disponibles (F2 ou bouton ⚙)
- **Personnage** : taille, vitesse de marche, démarrage et freinage, vitesse vers le fond, taille au fond, taille au premier plan.
- **Animation** : rebond, longueur d'un pas, balancement, respiration, durée du pivot, écrasement au sursaut.
- **Caméra** : rapidité à suivre, avance dans le sens de marche.
- **Scan** : distance pour scanner, durée, nombre de particules, temps d'affichage de la carte, réassort des produits.
- **Cartes** : seuils Mûr et Pourri, variation de fraîcheur au scan, pourrissement dans le Panier.
- **Narrateur** : vitesse de frappe, temps d'affichage, délai avant la remarque d'inactivité.
- **Son et affichage** : volume, réduire les animations, joystick virtuel, zone de marche, images par seconde.

Les valeurs changées restent dans le navigateur. « Copier mes réglages » copie seulement celles que tu as changées : colle-les dans ton message pour que je les mette par défaut.

### Décisions prises seul (détails mineurs)
- **Archive** : tout l'existant est dans `archive/v2/`, rien n'est supprimé. L'ancien `CLAUDE.md` y est renommé `CLAUDE_v2.md`, pour que je n'applique plus ses consignes par erreur (il demandait de pousser sur `main`).
- **v2 en ligne dans `/v2/`** : ça ne coûte qu'une ligne dans la publication et garde l'ancien jeu jouable.
- **Polices** : je reprends les trois polices validées en v2.
- **Écrans plus larges que 16:9** : le décor continue sur les côtés au lieu de bandes noires. L'interface reste dans le cadre 1920×1080.
- **Panneau de réglages** : il est hors de la scène mise à l'échelle, en vrais pixels, pour rester lisible sur téléphone.
- **Toucher un produit** : le premier toucher y va, le second scanne. On évite ainsi de scanner par erreur.
- **`[TEMP]`** : il reste dans les données mais ne s'affiche pas à l'écran.
- **Narrateur** : une réplique plus importante passe devant. Les autres attendent dans une file de 3 au plus, pour qu'une réaction à une action ne soit pas perdue.
- **Dos du personnage** : un code-barres plutôt qu'un texte, car un texte apparaîtrait à l'envers quand il marche vers la gauche.

### Choix provisoires à valider (ils touchent au jeu, je ne les ai pas tranchés)
- **Produit scanné** : il laisse « RUPTURE » et ne revient pas.
  - A : ça reste comme ça.
  - B : réassort après un délai (déjà réglable : « Réassort des produits »).
  - C : un même produit se scanne plusieurs fois, avec une carte plus abîmée à chaque fois.
- **Puissance et fraîcheur de départ** des 10 cartes : valeurs `[TEMP]`, à définir avec le combat (prototype B).
- **Pourrissement dans le Panier** : coupé par défaut (0). La règle de vieillissement sera décidée en B. Tu peux déjà le voir à l'œuvre en montant le réglage : une carte qui change de stade se retourne.

### Limites connues
- Je n'ai pas pu mesurer les 60 images par seconde sur un vrai téléphone : le navigateur des tests n'a pas de carte graphique. Le code n'anime que `transform` et `opacity`, et le compteur F3 te donnera le vrai chiffre.
- La manette est programmée selon la norme des navigateurs, mais je n'ai pas pu l'essayer : aucune manette dans mon environnement.
- Les sons sont synthétiques et provisoires.

### Ce que tu dois préparer
Rien pour l'instant. Je te donnerai la liste exacte des dessins pour le prototype D une séance à l'avance.

### Proposition pour la séance suivante
**Prototype B — Le combat.** Je commence par t'écrire, en une page, les règles exactes du combat et 12 cartes de départ. J'attends ta validation avant de coder.

### Vérifications faites
- `npm run check` : 39 fichiers sous 300 lignes, aucune ressource externe, 24 tests unitaires verts, construction OK.
- `npm run e2e` : 13 tests navigateur verts sur PC 1920×1080, PC 1366×768 et téléphone Pixel 7 en paysage. Ils vérifient la marche au clavier, le clic, le scan, le Panier, les réglages, le toucher et le joystick, avec une console sans erreur, sans avertissement et sans requête externe.
- Captures dans `docs/captures/s1/` (PC : `pc-1` à `pc-6` ; téléphone : `tel-1` à `tel-3`).
