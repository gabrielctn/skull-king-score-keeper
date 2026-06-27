#!/usr/bin/env node
/*
 * Post-export PWA step. Run after `expo export -p web`.
 *
 * Turns the static `dist/` export into an installable, offline-capable PWA:
 *   - copies the web manifest + icons into dist/
 *   - generates a versioned service worker with a precache list of every built file
 *   - injects the manifest link, theme-color and apple meta tags into index.html
 *   - writes .nojekyll so GitHub Pages serves the `_expo/` folder
 *
 * The base path (GitHub Pages subpath) is read from app.json so it stays in one place.
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const webSrc = join(root, "web");

const appJson = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
const baseUrl = (appJson.expo?.experiments?.baseUrl ?? "").replace(/\/$/, ""); // e.g. "/skull-king-score-keeper"

function fail(msg) {
  console.error(`\n[build-pwa] ${msg}\n`);
  process.exit(1);
}

if (!existsSync(dist)) fail("dist/ not found — run `expo export -p web` first.");

// 1. Copy the manifest and icons into the export.
copyFileSync(join(webSrc, "manifest.webmanifest"), join(dist, "manifest.webmanifest"));
cpSync(join(webSrc, "icons"), join(dist, "icons"), { recursive: true });

// 2. Inject the PWA head tags into index.html (idempotent). Done before hashing so
// the precache version reflects the final, deployed index.html.
const indexPath = join(dist, "index.html");
let html = readFileSync(indexPath, "utf8");
// Note: Expo already emits <meta name="theme-color"> and <meta name="description">
// from app.json's `web` config, so we don't repeat them here.
const headTags = [
  `<link rel="manifest" href="${baseUrl}/manifest.webmanifest" />`,
  `<link rel="apple-touch-icon" href="${baseUrl}/icons/apple-touch-icon.png" />`,
  `<meta name="mobile-web-app-capable" content="yes" />`,
  `<meta name="apple-mobile-web-app-capable" content="yes" />`,
  // "black" (not "black-translucent") keeps content below the iOS status bar,
  // since the app doesn't opt into safe-area insets on web.
  `<meta name="apple-mobile-web-app-status-bar-style" content="black" />`,
  `<meta name="apple-mobile-web-app-title" content="Skull King" />`,
].join("\n    ");

if (!html.includes('rel="manifest"')) {
  html = html.replace("</head>", `  ${headTags}\n  </head>`);
  writeFileSync(indexPath, html);
}

// 3. Walk dist/ and build the precache list (URLs as the browser will request them).
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) out.push(...walk(abs));
    else out.push(abs);
  }
  return out;
}

const EXCLUDE = new Set(["service-worker.js", ".nojekyll", "metadata.json"]);
const files = walk(dist).filter(
  (abs) => !EXCLUDE.has(relative(dist, abs)) && basename(abs) !== ".DS_Store"
);

const precacheUrls = files
  .map((abs) => `${baseUrl}/${relative(dist, abs).split("\\").join("/")}`)
  .sort();
// Ensure the root path resolves offline too (served as index.html).
const offlineFallback = `${baseUrl}/index.html`;
if (!precacheUrls.includes(`${baseUrl}/`)) precacheUrls.unshift(`${baseUrl}/`);

// 4. Version = hash of every precached file's contents → fresh cache per deploy.
const hash = createHash("sha256");
for (const abs of files.sort()) hash.update(readFileSync(abs));
const cacheVersion = `skullking-${hash.digest("hex").slice(0, 12)}`;

// 5. Materialise the service worker from the template.
const swTemplate = readFileSync(join(webSrc, "service-worker.js"), "utf8");
const sw = swTemplate
  .replaceAll("__CACHE_VERSION__", cacheVersion)
  .replaceAll("__PRECACHE_URLS__", JSON.stringify(precacheUrls))
  .replaceAll("__OFFLINE_FALLBACK__", offlineFallback);
writeFileSync(join(dist, "service-worker.js"), sw);

// 6. Disable Jekyll so GitHub Pages serves the `_expo/` directory (safety net for
// the legacy branch-deploy path; the Actions artifact deploy doesn't run Jekyll).
writeFileSync(join(dist, ".nojekyll"), "");

console.log(`[build-pwa] base path : ${baseUrl || "(root)"}`);
console.log(`[build-pwa] cache     : ${cacheVersion}`);
console.log(`[build-pwa] precache  : ${precacheUrls.length} entries`);
console.log("[build-pwa] done.");
