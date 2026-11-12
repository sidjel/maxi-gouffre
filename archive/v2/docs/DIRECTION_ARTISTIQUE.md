# MAXI-GOUFFRE — DIRECTION_ARTISTIQUE.md

> Bible visuelle et sonore — **Version 1.0** (novembre 2026)
> Complète `GAME_DESIGN.md` §16 et §17. Pour l'apparence et l'ambiance, ce document fait foi ; pour les règles, c'est `GAME_DESIGN.md` ; pour la technique, `ARCHITECTURE.md`.
> Rien ici ne change une règle de jeu : tout est habillage.

---

## 0. Principes

1. **Deux couches qui se distinguent au premier regard**
   - **Le magasin** : un décor *réel*, matériel, en 2.5D. Matières, usure, lumière, poussière. On doit sentir le carrelage, l'inox, le plastique du tapis de caisse.
   - **Les cartes** : des *objets de collection* au style « prospectus de supermarché » (aplats, contours épais, pastilles PROMO), avec des finitions brillantes comme de vraies cartes à collectionner.
   Le contraste entre un décor crédible et des cartes trop colorées est l'ironie visuelle du jeu.
2. **Tout est intégré au décor.** Aucun panneau d'interface « flottant » : les scores, les informations, les boutons et le narrateur sont des objets du magasin (§4).
3. **La lisibilité passe avant le décor.** Scores, P et cases légales restent lisibles à tout moment, sur PC comme sur téléphone (contraste ≥ 4,5:1).
4. **Zone 2 = la même chose, abîmée.** Mêmes objets, mêmes supports, mais désaturés, sales, mal éclairés (§9).
5. **Accessibilité** : « Réduire les animations » coupe les reflets animés, le scintillement et les mouvements de décor ; « Réduire les clignotements » limite les néons (3 flashs par seconde au plus) ou les fige.

---

## 1. Production des images ✅ (option C)

1. **D'abord en SVG** : Claude Code dessine toutes les illustrations (cartes, plats, décors, avatars) en SVG, dans le style de ce document. Le jeu est complet visuellement sans aucune image extérieure.
2. **Ensuite, les images de l'auteur** : l'auteur génère des images avec une IA à partir des consignes de `docs/PROMPTS_IMAGES.md` (fichier créé au jalon J1.5, une consigne par carte, par stade, par décor et par avatar). Chaque image remplace son SVG au fil de l'eau, sans changer le code.
3. **Règles communes** :
   - une illustration de carte **montre son nom et suggère son effet** (ex. Bactérie Mortelle : une bactérie qui mord vers l'avant ; Influenceur Fitness : un influenceur qui fait la promotion de ses voisins ; Explosion Électrique : un mixeur qui éclate en étincelles) ;
   - cadrage carré, sujet centré, fond simple (les finitions et le cadre de la carte sont ajoutés par le jeu, jamais dans l'image) ;
   - aucune marque, aucun logo réel, aucun personnage existant, aucun texte dans l'image ;
   - formats : SVG optimisé (provisoire), puis WebP 768×768 pour les cartes, WebP 1920×1080 pour les décors ;
   - chaque fichier est enregistré dans `app/data/credits.json`.

---

## 2. Les cartes

### 2.1 Face
Anatomie de `GAME_DESIGN.md` §17.4, dans le style prospectus : bandeau de nom façon titre de promo, pastille de puissance en étoile « PRIX CHOC », illustration, zone d'effet en étiquette, jauge de fraîcheur en 3 segments.

### 2.2 Le vieillissement se voit
| Stade | Rendu |
|---|---|
| 1 Frais | Couleurs franches, papier neuf |
| 2 Mûr | Couleurs un peu chaudes, coins légèrement cornés |
| 3 Pourri | Papier jauni, taches vertes, tampon **« DLC DÉPASSÉE »** de travers ; sur le plateau, **une mouche** tourne autour de la carte |

- **Stade verrouillé** : quand l'âge réel d'une carte posée a dépassé son stade verrouillé, un sticker **« PRIX BLOQUÉ »** apparaît sur la carte.
- **Changement de stade en main** : la carte se retourne (rotation 3D) et revient sous sa nouvelle face.

### 2.3 Finitions et reflets
Chaque carte a une finition, définie dans les données (champ `finish` par carte, ou par stade si besoin).

| Finition | Cartes | Rendu |
|---|---|---|
| `matte` | Cartes courantes | Aucun reflet, léger grain de papier |
| `promo` | Cartes à effet (tous les stades portant un effet) | Reflet léger qui glisse sur la carte |
| `limited` (« ÉDITION LIMITÉE ») | Héritage, Entité Libérée, Dernier Rouleau, Fromage Vivant, les 6 plats | **Holographique arc-en-ciel** façon carte à collectionner rare, motif en relief, petit tampon « ÉDITION LIMITÉE » |
| `greasy` | Toute carte au stade 3 qui n'est pas `limited` | Irisé « gras », comme une flaque d'huile sur du carrelage (clin d'œil au Vieux Monsieur) |

- Le reflet suit **la souris** sur PC et **l'inclinaison du téléphone** sur mobile (gyroscope). Sans gyroscope, ou avec « Réduire les animations », il oscille lentement ou reste fixe.
- Réalisation en CSS uniquement (dégradés, `mix-blend-mode`, variables CSS mises à jour par le pointeur). Pas de Canvas.

### 2.4 États d'interaction
| État | Rendu |
|---|---|
| Visée (survol, focus) | Contour lumineux léger, couleur néon de rayon, carte qui se soulève de quelques pixels |
| Sélectionnée | Elle se soulève davantage, contour plus intense, **scintillement** discret le long du bord |
| Cases légales | Marquées dans la matière du support (scotch jaune au sol, séparateur de tapis, zone dégivrée…), avec une pulsation lente |
| Posée | Glisse vers la case, puis **le laser rouge d'un scanner** balaie la carte avec un « bip » de caisse |
| Détruite | Se froisse et se dissout ; une miette tombe dans le bac de démarque |
| Effet inactif / neutralisé | Zone d'effet grisée / barrée d'un trait de feutre, comme une promo annulée |

---

## 3. Le plateau en situation

### 3.1 Principe
Le plateau n'est pas un tapis de jeu abstrait : les 2 × 10 cases sont posées **sur un support réel du magasin**, vu en 2.5D (vue du dessus inclinée, comme aujourd'hui). Autour, le décor occupe l'écran en plusieurs plans superposés (arrière-plan, support, premier plan), avec un léger effet de profondeur quand la souris bouge ou que le téléphone s'incline.

### 3.2 Supports par combat
Chaque combat référence un support (champ `arena` dans `combats.json`, définitions dans `app/data/arenas.json`).

| Combat | Support | Animation propre |
|---|---|---|
| Combat rapide, tutoriel (Cliente pressée) | **Tapis roulant d'une caisse** | Entre deux manches, le tapis avance et emporte les cartes défaussées vers le bac |
| C2 Chad Prot' | **Table de démonstration** de produits protéinés, avec un ring light | Le ring light pulse quand Chad pose une carte |
| C3 Le Livreur Perdu | **Palette de cartons**, dans la réserve | Un carton tombe parfois du haut de la pile |
| C4 La Cheffe Surgelés | **Couvercle vitré d'un vieux congélateur coffre** | Le givre grossit sur les bords à chaque cran |
| C5 Le Vigile Syndiqué | **Carrelage devant les portiques antivol** | Le portique sonne et clignote quand un Malus est posé |
| Boss Le Gérant | **Bureau poussiéreux et mal rangé** | La lampe de bureau grésille ; la poussière se soulève à chaque pose |

D'autres supports pourront être ajoutés (le format est prévu pour), par exemple pour des combats futurs : rayon fruits et légumes, sol d'un parking souterrain, comptoir d'accueil.

### 3.3 Lisibilité
Le support donne l'ambiance, mais les cases restent nettes : chaque case a un contour clair adapté à la matière, et le décor est assombri ou flouté légèrement sous les cartes. Le mode « plateau à plat » garde le support, vu de face.

---

## 4. Interface intégrée au décor

| Élément | Objet du magasin |
|---|---|
| Scores des deux camps (panneau gauche) | **Afficheur vert à segments d'une caisse enregistreuse**, un par camp, qui défile quand le score change |
| Manches gagnées | **Tampons « PAYÉ »** sur un petit ticket agrafé à côté de l'afficheur |
| Numéro de manche | Ticket « Manche 1/3 » à l'encre de caisse |
| Information sur la carte (panneau droit) | **Étiquette électronique de rayon** : nom, P, 3 stades, âge, état de l'effet. Elle se met à jour avec un léger effet d'encre électronique. |
| Horloge du magasin | **Pendule murale** ronde dans le décor |
| Narrateur | **Haut-parleur au plafond**, avec sa grille ; le texte apparaît dans une bande lumineuse façon panneau d'annonce |
| Bouton Passer | **Gros bouton de caisse** rouge |
| Bouton Inspecter | **Douchette de scanner** |
| Bouton Pause | Bouton **« Appel caissier »** |
| Pioche du joueur | **Tas de cartes en vrac**, à moitié sous une pile de prospectus froissés ; un post-it indique le nombre de cartes |
| Main de l'adversaire | Tas de cartes face cachée de son côté, avec son nombre |
| Défausse | **Bac « DÉMARQUE –70 % »** en plastique, sur le côté |

En profil compact (téléphone), ces objets sont plus petits et regroupés, mais gardent la même apparence.

---

## 5. Les caméras de surveillance

- **Le joueur** apparaît sur un **petit écran de vidéosurveillance** dans un coin (en bas à gauche par défaut) : noir et blanc, grain, lignes de balayage, horodatage, « CAM 03 » et un point « REC » rouge. Le narrateur te regarde par là.
- **L'adversaire** a son propre écran en face (en haut à droite), avec son portrait.
- **Avatar du joueur** : illustration SVG simple et expressive, déclinée selon le sexe choisi dans le formulaire (Mâle, Femelle, Licorne). Avant le formulaire (combat rapide), avatar neutre.
- **Expressions** et déclencheurs :

| Expression | Déclencheur |
|---|---|
| Neutre | Par défaut |
| Content | Bonne pose (le score passe devant, destruction d'une carte adverse) |
| Euphorique | Manche ou match gagné |
| Dégoûté | Une de ses cartes pourrit (`CARD_ROTTEN`) |
| Paniqué | Retard de 8 points ou plus, ou PANIC subi |
| Honteux | Mauvais coup (`BAD_MOVE`), manche ou match perdu |
| Endormi | Inactivité |

- L'adversaire réagit de la même façon, avec ses propres expressions.
- Changement d'expression : court parasite vidéo sur l'écran (désactivé par « Réduire les animations »).

---

## 6. Les temps forts du combat

- **Chifoumi** : joué avec des **gants de caissière en carton** ; le résultat s'affiche sur l'afficheur de caisse.
- **Fin de manche** : un **ticket de caisse s'imprime** et se déroule : détail des points carte par carte, total, et une phrase du narrateur en bas (« Merci de votre visite, pauvre nul » `[TEMP]`).
- **Changement de manche** : un **rideau de fer** descend, le plateau est vidé, le rideau remonte.
- **Fin de match** : ticket long avec le résultat et le départage s'il a eu lieu.
- **Butin** : les 3 cartes proposées sont présentées comme des **bons de réduction** à découper ; la carte choisie est découpée aux ciseaux (pointillés).

---

## 7. L'écran d'accueil

### 7.1 L'entrée du magasin
- L'écran « Appuie sur une touche » montre **les portes coulissantes vitrées fermées** du Maxi-Gouffre, vues de l'extérieur, de nuit : buée sur le verre, autocollant d'horaires absurdes (« Ouvert 24h/24, 7j/7, pour toujours » `[TEMP]`), paillasson « BIENVENUE » usé.
- Au premier appui (qui débloque le son) : un **« ding »** de détecteur, puis **les portes coulissent** et laissent apparaître l'intérieur éclairé et le menu.
- **Enseigne néon « MAXI-GOUFFRE »** au-dessus des portes : elle grésille, une lettre clignote de façon irrégulière.

### 7.2 Le menu
- Les choix sont des **panneaux de rayon suspendus** qui se balancent légèrement : « Nouvelle partie », « Continuer », « Options », « Crédits ».
- « Continuer » sans sauvegarde : panneau barré **« RUPTURE DE STOCK »**.
- Au survol ou au focus, le panneau s'allume comme un néon.

### 7.3 Détails vivants
- De temps en temps, **un caddie traverse le fond tout seul**.
- Après un long moment sans action, **les portes commencent à se refermer** et le narrateur fait une remarque ; une action les rouvre.
- **Easter egg** : très rarement, l'enseigne clignote et laisse lire un autre mot pendant une fraction de seconde (« AU SECOURS » `[TEMP]`). Désactivé par « Réduire les clignotements ».
- **Progression visible** : une fois l'Acte I terminé dans la partie sauvegardée, l'entrée du titre est plus sale et une lettre de l'enseigne est éteinte ; après la fin du jeu, l'enseigne est presque entièrement éteinte.
- **Crédits** : présentés comme un **très long ticket de caisse** qui défile.

---

## 8. Décors d'exploration

Les salles (jalon J4) suivent les mêmes principes : décor réel en plans superposés, portes en étiquettes-boutons intégrées (panneaux de rayon, portes battantes « Réservé au personnel »), horloge murale, haut-parleur. Détail par salle à écrire avant J4.

---

## 9. Zone 2 « La Réalité »

Tout ce qui précède, abîmé :
- couleurs désaturées, verdâtre, noirs poisseux, grain d'image plus fort ;
- **néons qui clignotent** au-dessus du plateau, lumière qui vacille ;
- supports sales : tapis de caisse déchiré, carrelage fissuré, cartons moisis, givre noirci ;
- afficheur de caisse avec des segments morts, tickets tachés, étiquettes électroniques qui bavent ;
- les caméras ont plus de parasites, l'horodatage se dérègle.

---

## 10. Son et musique (à compléter avant J9b)

Le cadre est dans `GAME_DESIGN.md` §16. Bruitages déjà liés à l'habillage :
- « bip » de scanner à la pose, « ding » des portes, bruit des portes coulissantes ;
- imprimante de ticket, rideau de fer, tapis roulant, portique antivol, grésillement de néon et de lampe ;
- coupe de ciseaux (butin), froissement (destruction), bourdonnement de mouche (stade 3, très discret).

Direction musicale détaillée (instruments, tempo, ambiance par zone et par support) : **à rédiger avec l'auteur avant J9b**.

---

## 11. Contraintes techniques

- DOM + CSS + SVG uniquement (pas de Canvas, pas de WebGL), comme le reste du jeu.
- Plans de décor = éléments empilés avec `transform: translateZ` ou décalages légers ; l'effet de profondeur suit le pointeur ou le gyroscope, avec une amplitude faible.
- Reflets et holographique en CSS (dégradés, `mix-blend-mode`, `background-position` piloté par variables CSS).
- Gyroscope : `DeviceOrientationEvent`, seulement si disponible, coupé si « Réduire les animations ».
- Toutes les durées, couleurs et intensités dans `tokens.css` ; supports, finitions et avatars dans les données JSON.
- **60 images par seconde** sur téléphone milieu de gamme : animer seulement `transform` et `opacity`, limiter les flous, couper les effets décoratifs en profil compact si nécessaire.

---

## 12. Répartition par jalon

| Jalon | Habillage |
|---|---|
| **J1.5 — Habillage du combat et de l'accueil** | §1 (SVG + `PROMPTS_IMAGES.md`), §2 (faces, rendu par stade, finitions, états d'interaction ; la mouche, « PRIX BLOQUÉ », la destruction et les effets barrés arrivent avec J2), §3 avec le **tapis de caisse** (combat rapide) et la table de démonstration (Chad), §4 complet, §5 complet, §6 complet, §7 complet, §11 |
| J2 | Affichage des nouveaux états (jauge, mouches, DLC DÉPASSÉE, PRIX BLOQUÉ, effet barré) dans ce style |
| J4 | §8, supports C3 à C5 |
| J8 | Support du boss, variantes de Zone 2 (§9) |
| J9a | Intégration des images de l'auteur, finitions visuelles |
| J9b | Musique et ambiance sonore (§10) |

---

## 13. Révisions

- **v1.0** (novembre 2026) : document initial, validé par l'auteur (option C pour les images, toutes les idées retenues, écran d'accueil animé).
