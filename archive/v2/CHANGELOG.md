# Journal des versions

Une entrée par jalon (ARCHITECTURE.md §18). Tag `vN.0-nom` posé après la fusion dans `main`.

## J1.5a — Habillage des cartes et de l'accueil (2026-11-12)

Première moitié du jalon J1.5 (DIRECTION_ARTISTIQUE.md §12). Tag proposé après fusion : `v1.5a-habillage`.

### Ajouté
- **66 illustrations SVG** : les 20 cartes à leurs 3 stades et les 6 plats, style prospectus (fond rayonnant, contours épais). Chaque image montre la carte et suggère son effet (la Bactérie mord vers l'avant, l'Influenceur pousse ses voisins, le Mixeur explose vers les côtés…). Générées par `npm run art` (`tools/art/`), qui renseigne aussi `cards.json` et le registre des assets ; une image de l'auteur n'est jamais écrasée.
- **`docs/PROMPTS_IMAGES.md`** : une consigne de génération par carte et par stade, par plat, par décor (accueil, 6 supports) et par avatar (joueur, adversaires, PNJ, 7 expressions).
- **Faces de cartes** : étoile « PRIX CHOC » pour la puissance, bandeau de nom façon promo, effet en étiquette de prix, étiquettes en pastille. Stade 2 : papier plus chaud, coin corné. Stade 3 : papier jauni, taches, tampon « DLC DÉPASSÉE ». Plats teintés selon le stade.
- **Finitions** (champ `finish` dans `cards.json`) : `matte` (grain de papier), `promo` (reflet qui glisse), `limited` (holographique arc-en-ciel, motif en relief, tampon « ÉDITION LIMITÉE »), `greasy` (irisé gras). Le reflet suit la souris sur PC et l'inclinaison du téléphone ; sans l'un ni l'autre, il oscille lentement en main.
- **États d'interaction** : contour néon et carte soulevée à la visée ; scintillement le long du bord de la carte sélectionnée ; cases légales rayées façon scotch avec un halo qui pulse ; à la pose, la carte vole de la main vers sa case, puis le laser rouge d'un scanner la balaie (les cartes de l'adversaire partent de son panneau).
- **Accueil** : façade de nuit, enseigne néon « MAXI-GOUFFRE » dont une lettre grésille, portes coulissantes vitrées (buée, autocollant d'horaires, affiche promo), paillasson. Au premier appui, les portes s'ouvrent sur l'intérieur du magasin. Menu en panneaux de rayon suspendus qui se balancent et s'allument au survol ; « Continuer » barré « RUPTURE DE STOCK ». Un caddie traverse le fond de temps en temps. Après 45 s sans action, les portes se referment à moitié et le haut-parleur fait une remarque. Très rarement, l'enseigne affiche un autre mot.
- **Crédits** : un long ticket de caisse qui défile tout seul, généré depuis le registre des assets (fichiers regroupés par auteur et licence). « Retour » ou Retour arrière ramène au titre.
- Tests : `tests/e2e/entrance.mjs` (7 cas), `tests/e2e/card-look.mjs` (5 cas, dont lisibilité des cartes aux 3 tailles), `tests/unit/look.test.js` (finitions, images). `npm run check` vérifie que les illustrations générées sont à jour.

### Modifié
- L'état `PRESS_KEY` (portes fermées) précède le titre ; `BOOT → PRESS_KEY` en attendant l'avertissement du J6.
- Le premier geste du joueur (plein écran) est maintenant l'appui qui ouvre les portes.
- `npm run shots` écrit dans `docs/captures/j1-5/` et ajoute l'entrée, le titre et les crédits.
- Version 1.5.0-a.

## Défilement du panneau et cartes rognées (2026-11-06)

Retours de l'auteur après le test du plein écran.

### Corrigé
- **Téléphone : le panneau de droite revenait en haut** au deuxième glissé. Lever le doigt (`pointerleave` au toucher) et chaque coup de l'IA rafraîchissaient la fiche, qui remettait son défilement à zéro. La fiche ne remonte plus qu'en changeant de carte, et `pointerleave` ne compte que pour la souris.
- **Cartes de la main rognées en bas** (surtout visible en plein écran) : en éventail, les cartes des bords descendaient sous le bas de l'écran. Ce sont maintenant les cartes du centre qui montent.

### Modifié
- `GAME_DESIGN.md` v2.0.1 (demande de l'auteur) : option « Plein écran » à « Oui » par défaut (§15.4).
- Tests : le défilement du panneau reste en place (téléphone), aucune carte de la main ne dépasse du bas de l'écran (3 tailles).

## Plein écran (2026-11-06)

Demande de l'auteur : le jeu passe en plein écran tout seul, sur PC et téléphone.

### Ajouté
- Plein écran au **premier geste du joueur** (toucher, clic ou touche) : un navigateur n'accepte jamais le plein écran sans geste. Sur téléphone Android, l'écran est aussi bloqué en paysage quand c'est possible.
- Si le navigateur refuse : fenêtre « Jouer en plein écran ? » avec « Plein écran » et « Plus tard ».
- Petit bouton (icône à 4 coins) en bas à droite, visible tant que le jeu n'est pas en plein écran (par exemple après Échap). Aucune nouvelle tentative automatique si le joueur sort du plein écran exprès.
- Sans plein écran possible (iPhone, par exemple), ni bouton ni fenêtre.
- `platform.js` : `fullscreenSupported`, `isFullscreen`, `requestFullscreen`, `onFullscreenChange`. Écran `ui/screens/fullscreen.js`, style `css/fullscreen.css`. Tests `tests/e2e/fullscreen.mjs` (5 cas).

### Corrigé
- Écran titre sur téléphone : avec « Combat rapide », le logo était coupé en haut et la version chevauchait « Crédits ». Le menu passe sur 2 colonnes, avec « Combat rapide » sur toute la largeur.

## Corrections du J1 — lisibilité du combat (2026-11-06)

Retours de l'auteur après le test en ligne du J1.

### Modifié
- **Panneau de droite** réorganisé pour un nouveau joueur : en premier la puissance, la fraîcheur actuelle (icône de stade, âge), l'effet dans un encadré, le Malus en rouge, puis le texte d'ambiance ; en retrait en bas, l'évolution sur 3 stades. Le panneau défile au doigt et à la molette, et son bas s'estompe quand il reste du texte.
- **Sans carte visée**, le panneau affiche « Comment jouer » : poser, gagner une manche, passer, Malus, effets au jalon 2.
- **Cases du plateau** au format des cartes (5:7). La zone à toucher reste plus large que l'emplacement dessiné. Chaque ligne porte son nom (Avant, Arrière).
- **Consigne** déplacée au-dessus du plateau. Sur téléphone, elle occupe le vide laissé par le haut du plateau incliné.
- Textes plus courts pour Malus, Outil, Détruire les voisins, Annuler (voisins) et l'effet pas encore actif.
- **Jauge de fraîcheur en 3 segments** aussi sur les faces compactes (plateau, main sur téléphone), le long du bord bas, et dans le panneau de droite.
- Boutons « À plat » (ex-« Plateau à plat ») et « Quitter » plus petits : zone à toucher au minimum de 44 px réels, sans ombre.

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
