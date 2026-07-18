import { useEffect } from "react";
import { Platform } from "react-native";

/** Screen Wake Lock is a web API; the settings row hides when unsupported. */
export function isWakeLockSupported(): boolean {
  return (
    Platform.OS === "web" &&
    typeof navigator !== "undefined" &&
    "wakeLock" in navigator
  );
}

/**
 * Hold a screen wake lock while the calling screen is mounted and `enabled`.
 * The browser releases the lock whenever the tab is hidden, so it is
 * re-requested each time the tab becomes visible again. Failures (e.g. battery
 * saver) are silently ignored — the screen then simply sleeps as usual.
 */
export function useKeepAwake(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !isWakeLockSupported()) return;
    let sentinel: WakeLockSentinel | null = null;
    let active = true;

    const acquire = async () => {
      if (!active || document.visibilityState !== "visible") return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        // The effect may have been cleaned up while the request was pending.
        if (active) sentinel = lock;
        else void lock.release().catch(() => undefined);
      } catch {
        sentinel = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release().catch(() => undefined);
      sentinel = null;
    };
  }, [enabled]);
}
