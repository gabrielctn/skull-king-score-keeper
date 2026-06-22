# Refonte raster des illustrations Skull King

## Objectif

Remplacer toutes les illustrations vectorielles actuelles par une collection raster cohérente, qualitative et adaptée à l’univers graphique officiel de Skull King. La refonte concerne les illustrations intégrées à l’application ainsi que les assets de marque Expo.

L’interface fonctionnelle reste inchangée. Cette étape ne constitue pas une refonte générale des écrans.

## Direction artistique

La collection reprend le langage visuel de la boîte de jeu fournie comme référence, sans recopier ses compositions ou ses illustrations :

- peinture traditionnelle texturée et légèrement irrégulière ;
- contours organiques, hachures et modelé visible ;
- ambiance adulte, théâtrale et maritime ;
- palette dominée par le cuir brun brûlé, le noir, l’or et le cuivre ;
- ombres turquoise caractéristiques autour des volumes dorés ;
- lumière chaude, métal patiné et détails inspirés des cartes marines ;
- personnages expressifs, jamais chibi, enfantins ou excessivement mignons.

Les illustrations ne doivent contenir ni texte, ni logo officiel copié, ni élément d’interface.

## Collection à produire

### Illustrations transparentes

1. **Skull King**
   - Crâne royal couronné, frontal et immédiatement identifiable.
   - Élément principal de l’écran d’accueil.
   - Présence de métal doré patiné et d’ombres turquoise/cuivre.
   - Silhouette claire à taille réduite.

2. **Boussole**
   - Rose des vents gravée, en laiton vieilli.
   - Utilisée comme motif secondaire derrière le Skull King.
   - Suffisamment sobre pour rester lisible à faible opacité.

3. **Perroquet**
   - Perroquet pirate adulte et expressif.
   - Pose compacte adaptée à l’écran de configuration.
   - Plumage rouge, bleu pétrole et or assourdi.
   - Éviter l’apparence mascotte ou dessin animé enfantin.

4. **Sirène**
   - Sirène maritime mystérieuse et élégante.
   - Palette turquoise, cuivre et or.
   - Silhouette lisible en petit format dans l’en-tête des règles.
   - Éviter la représentation enfantine.

5. **Coffre au trésor**
   - Coffre ouvert, bois sombre et ferrures dorées patinées.
   - Or lumineux mais non fluorescent.
   - Composition célébratoire pour l’écran de résultats.

### Assets de marque

6. **Icône principale**
   - Format carré 1024 × 1024.
   - Crâne couronné centré sur fond cuir/noir texturé.
   - Lisible après réduction à 48 px.
   - Aucun détail fin indispensable à la reconnaissance.

7. **Icône adaptative Android**
   - Premier plan transparent 1024 × 1024.
   - Crâne couronné placé dans la zone de sécurité Android.
   - Compatible avec le fond sombre déclaré dans `app.json`.

8. **Splash**
   - Illustration transparente 1024 × 1024.
   - Emblème centré avec marges généreuses.
   - Compatible avec le mode `contain`.

9. **Favicon**
   - Dérivé simplifié de l’icône principale.
   - Format 48 × 48.
   - Vérifié manuellement à sa taille réelle.

## Formats et résolution

- Les personnages, objets et emblèmes utilisent des **PNG avec transparence**.
- Les éventuelles textures opaques utilisent **WebP** si ce format réduit significativement le poids sans dégradation visible.
- Les assets affichés dans l’application sont produits avec assez de définition pour les densités 2× et 3×.
- Les fichiers finaux sont optimisés afin d’éviter une augmentation excessive de la taille de l’application.
- Aucun SVG n’est utilisé pour cette nouvelle collection.

## Intégration React Native

- Remplacer les imports provenant de `src/illustrations` par des sources raster locales.
- Afficher les assets avec le composant React Native `Image`.
- Utiliser `resizeMode="contain"` et des conteneurs aux dimensions explicites.
- Conserver les emplacements actuels :
  - Skull King et boussole sur l’accueil ;
  - perroquet sur la configuration ;
  - sirène dans la fenêtre des règles ;
  - coffre sur les résultats.
- Ne pas changer la navigation, la logique métier ou le contenu des écrans.
- Supprimer les composants d’illustration SVG devenus inutiles.
- Supprimer `react-native-svg` uniquement après confirmation qu’aucun autre fichier du projet ne l’utilise.

## Cohérence et contrôles qualité

Chaque asset doit être vérifié selon les critères suivants :

- cohérence de palette et de matière avec le reste de la collection ;
- contours propres sur fond transparent ;
- absence de frange colorée autour de la transparence ;
- sujet entièrement visible, sans recadrage accidentel ;
- lisibilité à la taille d’affichage réelle ;
- absence de texte déformé, filigrane ou logo tiers ;
- contraste suffisant sur le fond bleu-noir actuel de l’application ;
- poids raisonnable après optimisation.

Les icônes et le splash nécessitent en plus une vérification de leurs zones de sécurité et de leur rendu à petite taille.

## Validation technique

L’implémentation est considérée terminée lorsque :

- les cinq illustrations raster sont affichées à leurs emplacements prévus ;
- les quatre assets Expo sont remplacés et référencés correctement ;
- aucun composant d’illustration SVG n’est encore consommé ;
- `react-native-svg` est retiré si son usage tombe à zéro ;
- le typecheck passe ;
- les tests de scoring existants passent ;
- l’application démarre sans erreur de résolution d’asset ;
- les écrans concernés sont vérifiés visuellement sur un viewport mobile étroit et un viewport mobile large.

## Hors périmètre

- refonte complète de la palette et des composants d’interface ;
- modification du scoring ou des règles ;
- reproduction exacte des illustrations ou du logo officiels ;
- animation des illustrations ;
- ajout de nouveaux écrans ou de nouvelles fonctionnalités.
