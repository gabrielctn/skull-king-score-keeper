/*
 * Unofficial score keeper — service worker.
 *
 * The CACHE_VERSION, PRECACHE_URLS and OFFLINE_FALLBACK placeholders below are
 * filled in at build time by scripts/build-pwa.mjs. The version is a hash of the
 * built file list, so every deploy gets a fresh cache and the `activate` handler
 * purges stale ones.
 */
const CACHE_VERSION = "__CACHE_VERSION__";
const PRECACHE_URLS = __PRECACHE_URLS__;
const OFFLINE_FALLBACK = "__OFFLINE_FALLBACK__";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navigations: serve the cached app shell so the app opens offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_FALLBACK).then((cached) => cached || Response.error())
      )
    );
    return;
  }

  // Same-origin assets: cache-first, fall back to the network.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
