# Journal des versions

Une entrée par jalon (ARCHITECTURE.md §18). Tag `vN.0-nom` posé après la fusion dans `main`.

## Corrections du J1 — lisibilité du combat (2026-11-06)

Retours de l'auteur après le test en ligne du J1.

### Modifié
- **Panneau de droite** réorganisé pour un nouveau joueur : en premier la puissance, la fraîcheur actuelle (icône de stade, âge), l'effet dans un encadré, le Malus en rouge, puis le texte d'ambiance ; en retrait en bas, l'évolution sur 3 stades. Le panneau défile au doigt et à la molette, et son bas s'estompe quand il reste du texte.
- **Sans carte visée**, le panneau affiche « Comment jouer » : poser, gagner une manche, passer, Malus, effets au jalon 2.
- **Cases du plateau** au format des cartes (5:7). La zone à toucher reste plus large que l'emplacement dessiné. Chaque ligne porte son nom (Avant, Arrière).
- **Consigne** déplacée au-dessus du plateau. Sur téléphone, elle occupe le vide laissé par le haut du plateau incliné.
- Textes plus courts pour Malus, Outil, Détruire les voisins, Annuler (voisins) et l'effet pas encore actif.

### Ajouté
- `tests/e2e/info-band.mjs` : pour les 26 cartes à leurs 3 stades et aux 3 tailles, l'effet et le Malus se lisent sans défiler (et le texte d'ambiance aussi sur grand écran). Le rappel des règles s'affiche sans carte visée.
- Capture `plateau-a-plat-telephone-844x390.png`.

## v1.0-premier-match — J1 : premier match jouable (2026-11-06)

### Ajouté
- **Combat rapide** depuis le titre : un match complet contre l'IA « Noob » (Chad Prot'), rejouable, avec retour au titre.
- Données : `cards.json` (les 20 cartes du GD §7.3 et les 6 plats du §7.4 : P, stades, étiquettes, effets et textes d'ambiance `[TEMP]`), `combats.json` (Chad Prot', main provisoire de 38 P), `quickmatch.json` (main du combat rapide). Plats dépliés en 3 stades par `content/expand.js`. Validation qui nomme fichier, élément, stade et champ, plus des vérifications entre fichiers (cartes citées, budget, Outils non posables).
- Cœur pur (`core/`) : `rules.js` (`ctx.rules`), `time.js` (stade d'après l'âge, Surgelé), `cards.js`, `board.js` (voisins, en face, cases légales, Malus chez l'adversaire, camp plein, Outils), `effects.js` (P de base et plancher à 0), `match.js` et `round.js` (chifoumi rejoué si égalité, choix du premier joueur, pose, passe définitif, passe automatique, fin de manche, manche nulle, le perdant commence, départage en 3 niveaux, `singleRound`, garde-fou `MAX_ACTIONS_PER_ROUND`), `ai.js` (IA Noob), `quickMatch.js`.
- `app/Store.js` et `app/Session.js` : seul point qui appelle le cœur et publie ses événements.
- Écran de combat : plateau 2.5D incliné ou à plat, main en éventail (face complète sur grand écran, compacte sur téléphone), cartes avec pastille de P, illustration provisoire, icônes de stade (rond, triangle, croix), d'effet et de Fermentation, bandeau Malus ; scores en direct, manches gagnées, numéro de manche, main adverse (nombre de cartes), consigne, bandeau d'information (3 stades, âge, effet) ; Passer avec confirmation ; Quitter avec confirmation ; fenêtres de chifoumi, de fin de manche et de fin de match.
- Sous-états `COMBAT` du GD §3 dans la machine à états (CHIFOUMI, ROUND_PLAY > PLAYER_TURN / OPPONENT_TURN, ROUND_END, MATCH_END), visibles dans le panneau debug avec l'état du match.
- Tests : 80 tests unitaires (dont 300 matchs complets simulés) ; 19 tests navigateur, dont un match complet à la souris, un au doigt, la confirmation du passe, les Malus, le plateau à plat, Quitter et les tailles minimales aux 3 tailles.
- `npm run shots` : captures du combat (chifoumi, sélection, Malus, plateau à plat, fin de manche, fin de match) dans `docs/captures/j1/`.

### Modifié
- Écran titre : entrée « Combat rapide » en tête du menu ; version 1.0.0.
- `npm run e2e` lance aussi `tests/e2e/play-match.mjs`.

## v0.0-socle — J0 : socle et mise en ligne (2026-11-06)

### Ajouté
- Arborescence du dépôt, `package.json` (scripts seulement, aucune dépendance d'exécution), `README.md`, `LICENSE` (tous droits réservés), `.editorconfig`, `.gitignore`.
- Publication GitHub Pages : `.github/workflows/pages.yml` lance `npm run check` sur chaque pull request et, après fusion sur `main`, publie `app/`.
- `app/index.html` et scène logique mise à l'échelle par CSS, profils `wide` (1920×1080) et `compact` (1280×720), recalculés au redimensionnement, bandes de décor sur les côtés.
- Écran « Tourne ton téléphone » sur téléphone tenu en portrait, avec pause des délais du jeu.
- Écran titre provisoire (style prospectus) : Nouvelle partie, Continuer (grisé), Options, Crédits ; chaque entrée affiche un message provisoire.
- Écran « Le magasin a planté » pour toute erreur fatale, avec le message et un bouton de retour au titre.
- Tokens CSS (palettes zone 1, zone 2, terminal ; tailles par profil ; durées ; `prefers-reduced-motion`).
- Polices OFL provisoires dans le jeu : Lilita One (affichage), Atkinson Hyperlegible (texte), IBM Plex Mono (terminal), avec leurs licences, enregistrées dans `app/data/credits.json`.
- Chargement des données (`content/loader.js`, même code navigateur et Node) et validation avec messages qui nomment fichier, élément et champ (`content/validate.js`).
- `config.js` (valeurs du GD §19 et de l'ARCHITECTURE §13, gelées), `core/rng.js` (générateur à graine pur), `EventBus`, `Scheduler` (délais annulables et mis en pause), `StateMachine` (états du GD §3, sous-états, superpositions, journal).
- `InputHandler` minimal : actions abstraites au clavier (dont F3) et au pointeur, menu contextuel désactivé.
- Panneau debug (`?debug=1`, F3, bouton « DBG ») : état courant en JSON, FPS, graine (lecture et saisie, 5 premiers tirages), journal des transitions.
- Outils : `serve`, `check` (données, registre des assets, tailles, recherches interdites, tests), `credits`, `screenshots`.
- Tests : 47 tests unitaires ; 11 tests navigateur (3 tailles, téléphone paysage et portrait, redimensionnement, debug, sous-dossier GitHub Pages, données illisibles).
