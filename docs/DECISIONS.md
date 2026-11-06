# MAXI-GOUFFRE — Journal des décisions

Décisions prises seul par Claude (GAME_DESIGN.md §0.2), à valider ou corriger par l'auteur.
Format : date · jalon · décision · raison.

## J0 — Socle et mise en ligne

| Date | Décision | Raison |
|---|---|---|
| 2026-11-06 | **Profil `compact` dès que la largeur OU la hauteur** de la fenêtre passe sous `COMPACT_MAX_WIDTH` × `COMPACT_MAX_HEIGHT` (1100 × 620 px CSS). Une fenêtre 1280×720 reste donc en `wide`. | L'ARCHITECTURE dit « moins de 1100 × 620 » sans préciser. Une seule dimension trop petite suffit à rendre le texte de la scène `wide` illisible. |
| 2026-11-06 | **Polices provisoires** : Lilita One (affichage, style affiche), Atkinson Hyperlegible 400 et 700 (texte, très lisible), IBM Plex Mono (terminal et debug). Sous-ensemble « latin » (accents français, œ, €). | GD §17.3 : 2 polices OFL plus une à chasse fixe, proposées par Claude au premier jalon, validées par l'auteur. |
| 2026-11-06 | L'écran **« Tourne ton téléphone »** s'affiche quand le pointeur principal est un doigt (`pointer: coarse`) **et** que la fenêtre est en portrait. Une fenêtre de PC étroite n'est pas concernée : elle garde la scène avec des bandes. | GD §14.5 parle du téléphone. Sur PC, bloquer le jeu pour une fenêtre haute serait gênant. |
| 2026-11-06 | L'écran « Tourne ton téléphone », le panneau debug et l'écran de plantage vivent **hors de la scène**, en px réels. | Dans la scène, ils seraient réduits à l'échelle et illisibles en portrait. |
| 2026-11-06 | Les textes de l'écran **« Le magasin a planté »** sont écrits dans `index.html`, pas dans `strings.json`. | Cet écran doit s'afficher même quand les données ne se chargent pas. |
| 2026-11-06 | Le bouton « Revenir au titre » de l'écran de plantage **recharge la page**. | Après une erreur fatale, l'état en mémoire n'est plus fiable ; recharger repart proprement sur le titre. |
| 2026-11-06 | **BOOT mène directement au titre** au J0 (transition `BOOT → TITLE` ajoutée à la table). | WARNING et PRESS_KEY arrivent au J6. La transition reste autorisée pour la suite (rechargement rapide en debug). |
| 2026-11-06 | **Recherche interdite plus stricte** : `innerHTML`, `outerHTML`, `insertAdjacentHTML` et `document.write` sont refusés partout dans `app/src/`, pas seulement avec un texte du joueur. Refusés aussi : clavier lu hors de `input/`, stockage hors de `save/`, Canvas, style inline. | Plus simple à vérifier automatiquement, et aucun besoin réel de HTML brut dans le jeu. |
| 2026-11-06 | Clavier lu par **position physique** (`KeyboardEvent.code`) : les touches KeyW/KeyA/KeyS/KeyD donnent Z Q S D sur AZERTY et W A S D sur QWERTY. La répétition automatique d'une touche maintenue est ignorée. | GD §14.1 (« un appui = un déplacement ») et §14.2 (Z Q S D), sans casser les claviers QWERTY. |
| 2026-11-06 | `npm test` passe par `tools/test.mjs`, qui liste lui-même `tests/unit/*.test.js` avant d'appeler `node --test`. | `node --test tests/unit` ne se comporte pas pareil selon la version de Node (20, 22) et le système (Windows). |
| 2026-11-06 | Le **générateur** est mulberry32 (état sur 32 bits) ; `seedFrom` mélange le nombre reçu (heure ou saisie). Les fonctions renvoient `{ value, rngState }` (nom de l'ARCHITECTURE §4). | Rapide, pur, état réduit à un entier comme demandé. |
| 2026-11-06 | Panneau debug au J0 : état, FPS, graine, journal. Les autres outils (âge d'une carte, ajouter une carte, horloge, salles, combat, scénarios) arrivent avec les jalons qui créent ces notions (J1, J2, J4). | Ces actions n'ont rien sur quoi agir tant que le cœur du jeu n'existe pas. |
| 2026-11-06 | Les **captures** de chaque jalon sont versionnées dans `docs/captures/jN/`. | Le rapport et la pull request peuvent les afficher ; l'auteur teste sans copie locale. |
| 2026-11-06 | Les fichiers de licence des polices (`OFL-*.txt`) sont publiés à côté des polices et ne sont pas des assets du registre. | L'OFL impose de distribuer la licence avec la police ; le registre recense les fichiers utilisés par le jeu. |
| 2026-11-06 | Le workflow lance aussi `npm run check` sur chaque **pull request** (sans publier). | L'auteur voit si la branche est saine avant de fusionner. |

## J1 — Premier match jouable

| Date | Décision | Raison |
|---|---|---|
| 2026-11-06 | **Combat rapide** : la Collection de la partie est la main de `quickmatch.json` (10 cartes à des âges variés : 3 Mûres, 1 Pourrie qui fermente, 2 Malus Pourris, 50 P au total), contre Chad Prot' et l'IA Noob. | Le GD ne décrit pas ce mode de test. Cette main montre les 3 stades et les Malus dès le premier match. Avec une main proche de la Collection de départ du GD §7.5 (32 P), presque tous mes matchs simulés étaient perdus contre la main de Chad (43 P de cartes positives). Avec celle-ci, un joueur simple gagne 55 à 75 % des matchs. |
| 2026-11-06 | **Main provisoire de Chad Prot'** (`c2_chad`) : 4 Influenceurs (stades 1, 1, 2, 3), Banane Parfaite, Plante Florissante, Steak Douteux, Enfant Épuisé, Pizza Ananas, Console Portable. Budget 38 (GD §10.3). | Le GD dit « à base d'Influenceurs », budget ~38. |
| 2026-11-06 | **Budget d'une main adverse** = somme des P au stade fixé, Malus compris avec leur P négative. `npm run check` exige que `handBudget` soit égal à cette somme. | Le GD §10.3 parle de « somme des P ». L'égalité exacte évite qu'un budget annoncé ne corresponde plus à la main après une retouche. |
| 2026-11-06 | **Pas de vieillissement au J1** : les âges ne bougent pas, aucune pose ne fait avancer le temps. | ARCHITECTURE §18 place les crans et le stade verrouillé au J2. Le stade est déjà verrouillé à la pose. |
| 2026-11-06 | **Effets affichés mais pas résolus** : chaque carte compte sa P de base ; l'icône d'effet est grisée et le bandeau indique « pas encore en jeu (jalon 2) ». | ARCHITECTURE §18 : « effets présents mais pas encore résolus » au J1. |
| 2026-11-06 | Le match porte un champ **`phase`** (`chifoumi`, `starter`, `play`, `roundOver`, `matchOver`), ainsi que `level`, `chifoumi`, `nextStarter` et `result`, en plus du modèle de l'ARCHITECTURE §5.2. | Les sous-états du combat et le niveau de l'IA doivent être lisibles dans l'état. Le reste du modèle est inchangé. |
| 2026-11-06 | **Fin de manche** : le score est noté dès que les deux camps ont passé, mais le plateau reste affiché jusqu'au bouton « Manche suivante ». C'est `endRound` qui envoie les cartes à la défausse. | Le joueur voit le plateau final pendant qu'il lit le résultat. |
| 2026-11-06 | Quand **l'IA gagne le chifoumi**, elle choisit qui commence après son délai de réflexion. Le joueur lit son choix et lance la manche avec « C'est parti ». | Sans cette pause, l'IA pourrait poser une carte avant que le joueur ait lu le résultat. |
| 2026-11-06 | Le **départage aux points cumulés** s'applique dès que personne n'a 2 manches après la 3ᵉ, même si un joueur a gagné 1 manche et que les 2 autres sont nulles. | C'est ce que dit la formule du GD §20.5, que je suis à la lettre. À confirmer par l'auteur. |
| 2026-11-06 | **Plateau à plat** : bouton dans le panneau du combat, non mémorisé. | L'option du GD §15.4 arrive au J7, avec la sauvegarde des options. |
| 2026-11-06 | Bouton **Quitter** (avec confirmation) dans le combat. Pas encore de boutons Inspecter ni Pause. | La Pause et son « Retour au titre » arrivent au J4, l'inspection au J2. Il fallait pouvoir sortir d'un match. |
| 2026-11-06 | **Clavier au J1** : P ouvre la confirmation du passe et la valide au second appui ; Retour arrière annule la sélection ou la confirmation. Le reste passe par Tab et Entrée du navigateur. | Le clavier complet (focus, cases légales) arrive au J3. |
| 2026-11-06 | **Toucher une case occupée** affiche sa carte dans le bandeau d'information. Toucher une case vide non légale, ou un endroit vide, annule la sélection. | Sur téléphone, il n'y a pas de survol pour lire les cartes posées. |
| 2026-11-06 | **Faces de carte** : face compacte sur le plateau (tous écrans) et en main sur téléphone ; face complète en main sur grand écran. Le détail (3 stades, effet, âge) est dans le bandeau d'information. | GD §17.4 et §17.5. |
| 2026-11-06 | **Illustration provisoire** : aplat d'une teinte propre à la famille, trame de points, initiale du nom ; teinte passée au stade 2, taches au stade 3. **Icônes de stade** : rond vert, triangle jaune, croix brune. Icônes d'effet : un caractère par effet, dans `strings.json`. | GD §17.4 et §17.7 : forme différente par stade, pas seulement la couleur. |
| 2026-11-06 | Le plateau incliné **pivote sur son bord bas** (`transform-origin` en bas). | Le plateau ne déborde pas sur la main. La ligne Arrière adverse reste à 47 px réels minimum sur téléphone. |
| 2026-11-06 | Tailles du combat (scène logique) : grand écran, cases 150×168, cartes en main 186 px de large, panneaux de 320 et 430 px ; téléphone, cases 144×116, cartes en main 94 px, panneaux de 190 et 300 px. | ARCHITECTURE §8.1 : tailles fixées au J1 d'après les captures. Mesures sur téléphone 844×390 : texte d'au moins 13,6 px réels, cases et boutons d'au moins 47 px. |
| 2026-11-06 | **Graine** : chaque combat rapide reçoit une nouvelle graine tirée de l'heure. Une graine saisie dans le panneau debug est gardée pour tous les matchs suivants, jusqu'au rechargement. | Une même graine rejoue exactement le même match, ce qui permet de reproduire un bug. |
| 2026-11-06 | En mode debug, **`?aiDelay=N`** fixe le délai de réflexion de l'IA à N ms (ex. `?debug=1&aiDelay=0`). | Accélère les essais à la main. Hors debug, le délai suit toujours `AI_DELAY_MIN` / `AI_DELAY_MAX`. |
| 2026-11-06 | Nouveau fichier de données **`quickmatch.json`**, absent de la liste de l'ARCHITECTURE §2. | Le combat rapide doit rester décrit en données, sans contenu en dur. |
| 2026-11-06 | Version du jeu : **1.0.0**, qui suit le tag `v1.0-premier-match`. | Convention des tags de l'ARCHITECTURE §16. |

## Corrections du J1 — lisibilité

| Date | Décision | Raison |
|---|---|---|
| 2026-11-06 | **Panneau de droite** : ordre puissance et nom, fraîcheur et âge, effet (encadré), Malus, texte d'ambiance, puis l'évolution sur 3 stades en retrait. Le panneau défile si besoin, avec un dégradé en bas quand il reste du texte. | Demande de l'auteur : mettre en avant l'effet, la fraîcheur et la description, et placer les stades plus bas. |
| 2026-11-06 | Critère vérifié par les tests : l'effet et le Malus de chaque carte, à chaque stade, se lisent sans défiler sur les 3 tailles ; sur grand écran, le texte d'ambiance aussi. Seule l'évolution peut demander de défiler. | Sur téléphone, le panneau ne peut pas tout montrer à la fois sans passer sous 12 px réels. |
| 2026-11-06 | Sur téléphone, les étiquettes (Aliment, Objet…) ne sont pas affichées dans le panneau. | Elles servent peu au J1 ; la place va à l'effet et au Malus. |
| 2026-11-06 | **Sans carte visée**, le panneau affiche « Comment jouer » (6 règles courtes). | Demande de l'auteur : un nouveau joueur doit comprendre vite les règles. |
| 2026-11-06 | **Cases** : l'emplacement dessiné a le format d'une carte (5:7) ; la zone à toucher (le bouton) garde la largeur de la colonne. Noms des lignes Avant et Arrière écrits sur le plateau. | Demande de l'auteur (cases plus rectangulaires), sans réduire la zone à toucher sous 44 px réels. Les noms des lignes préparent les effets du J2. |
| 2026-11-06 | Sur téléphone, la consigne est posée par-dessus le haut du plateau incliné, qui recule et laisse un vide. À plat, le plateau est réduit à 80 % pour rester sous la consigne. | Cela rend 16 px logiques de hauteur aux cases : la ligne du fond passe de 41,8 à 47,7 px réels. |
| 2026-11-06 | Tailles revues : grand écran, cases 136×156, panneaux de 280 et 490 px, boutons secondaires de 82 px logiques (47 px réels au minimum) ; téléphone, cases 120×116, panneaux de 170 et 330 px. | Pour que le panneau de droite tienne. Mesures : texte ≥ 13 px réels, cases et boutons ≥ 47,7 px réels sur téléphone. |
| 2026-11-06 | Je garde les noms de ligne **Avant / Arrière** sur le plateau. | Les effets du J2 dépendent de la ligne (GD §8.1), et chaque description d'effet commence par « En ligne Avant » ou « En ligne Arrière ». Le nom de la ligne relie les deux. La teinte plus claire de la ligne Avant reste en plus. |
| 2026-11-06 | Face compacte : **jauge de fraîcheur en 3 segments** le long du bord bas, en plus de l'icône de stade. Le nom de la carte n'y figure pas. | Retour de l'auteur. Le nom ne tient pas lisiblement sur une carte de 50 px réels de large (texte < 12 px) ; il est dans le panneau de droite. La face complète (nom et jauge) reste en main sur grand écran, profil `wide`. |
| 2026-11-06 | Boutons « À plat » et « Quitter » : hauteur `--touch-small` (78 px logiques en `wide`, 82 en `compact`), soit au moins 44 px réels. | Retour de l'auteur : boutons peu utilisés. On ne descend pas sous TOUCH_MIN_PX. |
