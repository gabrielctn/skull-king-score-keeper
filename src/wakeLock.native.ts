import { useEffect, useId } from "react";
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "expo-keep-awake";

/** Expo KeepAwake is available on native platforms when this module resolves. */
export function isWakeLockSupported(): boolean {
  return true;
}

/**
 * Hold the native idle timer while the calling screen is mounted and enabled.
 * A unique tag keeps cleanup scoped to this hook instance.
 */
export function useKeepAwake(enabled: boolean): void {
  const reactId = useId();
  const tag = `skull-king-game-${reactId}`;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const activate = async () => {
      try {
        await activateKeepAwakeAsync(tag);
        // Cleanup can run while activation is crossing the native bridge.
        if (cancelled) await deactivateKeepAwake(tag);
      } catch {
        // Battery/OS restrictions should never make the scoring screen fail.
      }
    };

    void activate();
    return () => {
      cancelled = true;
      void deactivateKeepAwake(tag).catch(() => undefined);
    };
  }, [enabled, tag]);
}
