# MAXI-GOUFFRE — consignes pour Claude

Jeu de cartes tactique web (DOM + CSS, JavaScript ES2022 en modules natifs, sans framework ni bundler), jouable sur PC, mobile et Android.

## À lire avant chaque jalon
1. `docs/ARCHITECTURE.md` — technique, organisation du travail (§0), feuille de route (§18). Fait foi pour la technique.
2. `docs/GAME_DESIGN.md` — règles et contenu du jeu. Fait foi pour les règles.
3. `docs/DIRECTION_ARTISTIQUE.md` — apparence, décors, finitions, ambiance. Fait foi pour l'habillage.

Ces documents sont la référence. Ne pas recopier leurs règles ici : les lire.

## Façon de travailler
- **Un jalon complet par échange**, selon `ARCHITECTURE.md` §0.3 : branche `jN-nom` depuis `main`, code, tests, vérifications (§14), commits sur la branche, push, pull request, rapport de jalon.
- Ne jamais pousser sur `main` directement, ni force-push, sans accord explicite de l'auteur. L'auteur fusionne la pull request après avoir testé sur GitHub Pages.
- Règle manquante ou ambiguë : appliquer `GAME_DESIGN.md` §0.2 (décider seul si c'est mineur et le noter dans `docs/DECISIONS.md`, sinon demander).
- L'auteur teste **sans copie locale** : il fusionne la pull request puis joue sur https://sidjel.github.io/maxi-gouffre/ (PC et téléphone). Le rapport doit donc dire précisément quoi tester en ligne.
- `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` et `docs/DIRECTION_ARTISTIQUE.md` ne changent qu'à la demande de l'auteur.

## Rapports et échanges
- En français, phrases simples, à la première personne. Pas de formules creuses (« En outre », « Par ailleurs », « De surcroît », « En conclusion », « crucial », « plonger dans »).
- Rapport de jalon : nouveautés jouables, étapes de test (PC avec chaque entrée concernée, téléphone), captures, décisions prises seul, limites connues.
- **Chaque message à l'auteur se termine par le lien pour jouer** : https://sidjel.github.io/maxi-gouffre/ (en précisant si la dernière pull request est déjà fusionnée ou non, car le site ne montre que `main`).

## État du projet
- Documents v2.0 en place dans `docs/`.
- **J0 — Socle et mise en ligne** : fusionné dans `main` (pull request sidjel/maxi-gouffre#1), tag `v0.0-socle` posé. Testé en ligne par l'auteur sur PC et téléphone : aucun bug. **Polices validées** : Lilita One, Atkinson Hyperlegible, IBM Plex Mono.
- **J1 — Premier match jouable** : fusionné dans `main` (pull request sidjel/maxi-gouffre#2), tag `v1.0-premier-match` posé par l'auteur. Testé en ligne : tout fonctionne. Contenu : « Combat rapide » depuis le titre, contre l'IA Noob (Chad Prot') ; 20 cartes et 6 plats en données (effets présents mais pas résolus) ; plateau 2.5D ou à plat ; main ; pose au pointeur ; Malus ; passer avec confirmation ; scores en direct ; 3 manches, manche nulle, départage, qui commence ; chifoumi ; fins de manche et de match ; `Store`, `Session`.
- **Corrections du J1** : fusionnées (pull request sidjel/maxi-gouffre#4), d'après les retours de l'auteur : panneau de droite réorganisé (effet, fraîcheur, description en avant ; stades en retrait ; défilement ; « Comment jouer » sans carte visée), cases au format des cartes avec les noms des lignes, consigne au-dessus du plateau, jauge de fraîcheur sur les faces compactes, boutons « À plat » et « Quitter » réduits. Nouveau test `tests/e2e/info-band.mjs` (78 fiches × 3 tailles).
- **Plein écran** : fusionné (pull request sidjel/maxi-gouffre#5) : au premier geste du joueur, fenêtre si le navigateur refuse, petit bouton en bas à droite ; titre sur 2 colonnes sur téléphone. GD v2.0.1 : option « Plein écran » à « Oui » par défaut (validé par l'auteur).
- **Défilement et rognage** : fusionné (pull request sidjel/maxi-gouffre#6) : le panneau de droite ne revient plus en haut au deuxième glissé ; cartes de la main plus rognées en bas.
- **J1.5a — Habillage des cartes et de l'accueil** (branche `j1-5-habillage`, pull request vers `main`, tag proposé `v1.5a-habillage`) : 66 illustrations SVG générées par `npm run art` (`tools/art/`) ; `docs/PROMPTS_IMAGES.md` ; faces prospectus, rendu par stade, finitions `matte` / `promo` / `limited` / `greasy` (champ `finish` de `cards.json`) avec reflets (souris, gyroscope) ; visée, sélection qui scintille, cases légales en scotch, vol et laser à la pose ; accueil : état `PRESS_KEY` (portes fermées), enseigne néon, menu en panneaux de rayon, RUPTURE DE STOCK, caddie, portes qui se referment après 45 s, easter egg, crédits en ticket de caisse. `?reduceFlashes=1` en attendant l'option du J7.
- Vérifications : `npm run check` (données, registre, illustrations à jour, tailles, recherches interdites, tests unitaires) ; `npm run e2e` (smoke, `play-match.mjs`, `info-band.mjs`, `fullscreen.mjs`, `entrance.mjs`, `card-look.mjs`) et `npm run shots` utilisent Playwright (déjà présent dans les sessions cloud, sinon `npm install`). Les matchs e2e tournent avec le vrai délai de l'IA (~1 min 30 au total). Les tests passent d'abord les portes (`enterStore` dans `tests/helpers/browser.js`).
- Dans les sessions cloud, GitHub refuse l'envoi de tags (HTTP 403, les branches passent) et sidjel.github.io n'est pas joignable : l'auteur pose les tags (page Releases de GitHub) et teste en ligne.
- Prochain jalon : **J1.5b** (DIRECTION_ARTISTIQUE.md §3 tapis de caisse et table de démonstration avec `arenas.json`, §4 interface intégrée, §5 caméras et avatars, §6 temps forts), puis **J2 — Effets, vieillissement, IA Gamer**. Points ouverts : départage aux points même avec 1 manche gagnée contre 2 nulles (DECISIONS J1) ; l'IA Noob vide souvent sa main dès la manche 1, à mesurer par la simulation.

Mettre à jour la section « État du projet » à la fin de chaque jalon.
