import { Platform } from "react-native";

/**
 * Durable-storage helpers built on the StorageManager API.
 *
 * By default a browser may evict a site's local data (localStorage / IndexedDB)
 * under storage pressure or after long inactivity — which on this app would wipe
 * the saved games, history and every derived stat. Requesting *persistent*
 * storage marks this origin as durable, so the browser keeps the data until the
 * user explicitly clears it (e.g. from the browser's site-data settings). This
 * is the standard mitigation for "my scores disappeared after clearing the
 * cache". No-op on native and on browsers without the API.
 */

type MaybeStorageManager = StorageManager | undefined;

function storageManager(): MaybeStorageManager {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { storage?: StorageManager }).storage;
}

/**
 * Ask the browser to make this origin's storage durable. Returns whether the
 * data is persistent afterwards. Some browsers grant this automatically for
 * installed apps or engaged users, and others only from a user gesture — hence
 * the best-effort call once the app holds games worth keeping.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  const manager = storageManager();
  if (!manager || typeof manager.persist !== "function") return false;
  try {
    if (typeof manager.persisted === "function" && (await manager.persisted())) {
      return true;
    }
    return await manager.persist();
  } catch {
    return false;
  }
}
