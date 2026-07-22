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

/** True when the browser exposes the persist/persisted durability controls. */
export function isPersistentStorageSupported(): boolean {
  const manager = storageManager();
  return (
    !!manager &&
    typeof manager.persist === "function" &&
    typeof manager.persisted === "function"
  );
}

/** Whether this origin's storage is already marked durable. */
export async function isStoragePersisted(): Promise<boolean> {
  const manager = storageManager();
  if (!manager || typeof manager.persisted !== "function") return false;
  try {
    return await manager.persisted();
  } catch {
    return false;
  }
}

/**
 * Ask the browser to make this origin's storage durable. Returns whether the
 * data is persistent afterwards. Some browsers grant this automatically for
 * installed apps or engaged users; others only from a user gesture, which is
 * why Settings also exposes an explicit button.
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
