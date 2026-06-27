import { Platform } from "react-native";

/**
 * Register the PWA service worker. No-op on native and during the web dev server
 * (the worker only exists in the production export). The URL and scope are derived
 * from `document.baseURI`, so this works both at the GitHub Pages subpath and at
 * the root without hard-coding the repo name.
 */
export function registerServiceWorker(): void {
  if (Platform.OS !== "web") return;
  // `__DEV__` is true under `expo start`, false in `expo export` output.
  if (typeof __DEV__ !== "undefined" && __DEV__) return;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const swUrl = new URL("service-worker.js", document.baseURI).toString();
    const scope = new URL(".", document.baseURI).pathname;
    navigator.serviceWorker.register(swUrl, { scope }).catch((err) => {
      console.warn("Service worker registration failed", err);
    });
  });
}
