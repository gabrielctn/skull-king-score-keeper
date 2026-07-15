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

  const register = async () => {
    const swUrl = new URL("service-worker.js", document.baseURI).toString();
    const scope = new URL(".", document.baseURI).pathname;
    let hasController = navigator.serviceWorker.controller !== null;
    let reloading = false;

    // skipWaiting() in the worker activates a deployment immediately. Once the
    // new worker owns an already-installed app, reload exactly once so the open
    // window also runs the new bundle instead of waiting for the next launch.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      if (!hasController) {
        // First installation: the current page already has the latest bundle,
        // so claiming it does not need a reload. Any later takeover does.
        hasController = true;
        return;
      }
      reloading = true;
      window.location.reload();
    });

    try {
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope,
        updateViaCache: "none",
      });

      const checkForUpdate = () => {
        if (navigator.onLine) void registration.update().catch(() => undefined);
      };
      checkForUpdate();
      window.setInterval(checkForUpdate, 60 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
      window.addEventListener("online", checkForUpdate);
    } catch (err) {
      console.warn("Service worker registration failed", err);
    }
  };

  // React may mount after the window load event on a fast cached PWA launch.
  // Register immediately in that case instead of waiting for an event that has
  // already happened.
  if (document.readyState === "complete") {
    void register();
  } else {
    window.addEventListener("load", () => void register(), { once: true });
  }
}
