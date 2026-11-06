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
