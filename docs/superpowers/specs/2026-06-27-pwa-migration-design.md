# Migration iOS → PWA — Design

**Date:** 2026-06-27
**Statut:** Validé (décisions utilisateur + défauts recommandés)

## Contexte

Le projet est **déjà** un projet Expo cross-platform (React Native 0.81, Expo SDK 54,
React 19), pas une app iOS native. La cible web est déjà configurée
(`web.bundler: "metro"`), `AsyncStorage` retombe sur `localStorage`, et les images
passent par `require()` géré par Metro.

Smoke test validé : `npx expo export -p web` produit un `dist/` fonctionnel
(221 modules, bundle ~409 kB) où les 4 écrans rendent via React Native Web.

**Donc : ce n'est PAS une réécriture.** C'est une configuration + ajout d'une coquille
PWA + déploiement statique.

### Ce qui manque (constaté dans `dist/index.html`)

Le HTML généré n'a aucun élément PWA : pas de `manifest`, pas de service worker,
pas de `theme-color`, pas d'`apple-touch-icon`. Pas d'Expo Router (donc pas de
`+html.tsx`) → le shell PWA s'injecte via un script post-export.

## Décisions

1. **PWA uniquement** — on retire `ios/` (non versionné), la config native d'`app.json`,
   `eas.json` et les scripts natifs de `package.json`.
2. **Hébergement GitHub Pages** sur `gabrielctn/skull-king-score-keeper`
   → URL `https://gabrielctn.github.io/skull-king-score-keeper/`
   → sous-chemin `/skull-king-score-keeper/` (impacte baseUrl, manifest, scope SW).
3. **Offline obligatoire** — service worker précachant le shell + images.
   Régression iOS Safari (~7 j d'éviction du stockage) acceptée explicitement.
4. **Service worker maison minimal** (pas de Workbox) — surface minuscule, transparent,
   zéro dépendance.
5. **Recompression des PNG** (~8,8 Mo) reportée en amélioration optionnelle ;
   le précache offline reste complet.

## Architecture

### Pipeline de build

```
npm run build:web
  ├─ expo export -p web          → dist/ (HTML + bundle hashé + assets)
  └─ node scripts/build-pwa.mjs  → injecte la coquille PWA dans dist/
       ├─ copie manifest + icônes + service-worker.js
       ├─ calcule le précache (glob dist/) + version (hash)
       ├─ injecte la liste + version dans dist/service-worker.js
       ├─ injecte <link manifest>, theme-color, apple-touch-icon,
       │   meta apple-mobile-web-app-* dans dist/index.html
       └─ écrit dist/.nojekyll
```

### Nettoyage iOS → PWA-only

| Fichier | Action |
|---|---|
| `ios/` (local) | Supprimer (non tracké) |
| `app.json` | Retirer blocs `ios`, `android`, `scheme` ; enrichir `web` ; ajouter `experiments.baseUrl` |
| `eas.json` | Supprimer |
| `package.json` | Retirer scripts `ios`/`android` ; ajouter `build:web` |
| `README.md` | Réécrire sections natif/EAS → PWA/Pages |

### Nouveaux fichiers versionnés (`web/`)

- `web/manifest.webmanifest`
  - `name`, `short_name`, `description`
  - `start_url` = `scope` = `/skull-king-score-keeper/`
  - `display: standalone`, `orientation: portrait`
  - `theme_color` = `background_color` = `#0b1722`
  - `icons` : 192, 512, 512-maskable (`purpose: maskable`)
- `web/icons/` : `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`,
  `apple-touch-icon.png` (180) — générés depuis `assets/icon.png` (1024²), commités.
- `web/service-worker.js` — voir ci-dessous.
- `scripts/build-pwa.mjs` — script post-export.

### Service worker (`web/service-worker.js`)

- **Install** : `caches.open(CACHE_VERSION)` puis `addAll(PRECACHE_URLS)`.
  `CACHE_VERSION` et `PRECACHE_URLS` sont des placeholders remplacés au build.
- **Précache** : `index.html`, le bundle JS hashé, manifest, icônes, les 5 PNG
  d'illustrations → app 100% offline.
- **Activate** : `skipWaiting` + purge des caches dont la clé ≠ `CACHE_VERSION`.
- **Fetch** :
  - Requêtes de navigation (`request.mode === 'navigate'`) → réseau, fallback
    sur `index.html` caché (offline).
  - GET same-origin → cache-first, sinon réseau.
- Enregistré depuis le code app (`src/registerServiceWorker.ts`), importé dans
  `index.ts`/`App.tsx`, gardé par `Platform.OS === 'web'` et `'serviceWorker' in navigator`.
  Le chemin respecte le baseUrl : `${baseUrl}/service-worker.js`, scope `${baseUrl}/`.

### Spécificités GitHub Pages

- `dist/.nojekyll` — **critique** : sans lui, Jekyll ignore `_expo/` (préfixe `_`)
  et le bundle JS renvoie 404.
- `experiments.baseUrl: "/skull-king-score-keeper"` dans `app.json` → tous les
  chemins (assets, manifest, SW, scope) corrects sous le sous-dossier.

### Déploiement CI (`.github/workflows/deploy.yml`)

- Déclencheur : push sur `main`.
- Étapes : checkout → setup-node (cache npm) → `npm ci` → `npm run build:web`
  → `actions/upload-pages-artifact` (dist/) → `actions/deploy-pages`.
- Permissions : `pages: write`, `id-token: write`.
- **Prérequis GitHub** : Settings → Pages → Source = "GitHub Actions".

## Vérification (succès = quoi)

1. `npm run build:web` produit `dist/` avec `manifest.webmanifest`, `service-worker.js`,
   icônes, `.nojekyll`, et un `index.html` contenant les balises PWA.
2. `npx serve dist` (servi sous le bon chemin) : l'app charge, les 4 écrans
   fonctionnent, une partie se sauvegarde et se restaure.
3. Lighthouse PWA / DevTools : manifest valide, SW enregistré, "installable".
4. Mode hors-ligne (DevTools → Offline) : rechargement OK, app utilisable.
5. `npm run typecheck` et `npm run test:scoring` toujours verts.
6. Après merge : le workflow Pages publie ; l'URL répond et est installable.

## Hors-périmètre (YAGNI)

- Notifications push, sync cloud, routing par URL.
- Recompression des images (optionnelle, suivi séparé).
- Conserver une capacité de build natif iOS/Android.
