import { NativeEventEmitter, NativeModules } from "react-native";
import type {
  AppIntentDestination,
  AppIntentDestinationListener,
} from "./appIntents";

const DESTINATION_EVENT = "SkullKingScoreKeeperAppIntentDestination";

interface SkullKingScoreKeeperAppIntentsModule {
  getPendingDestination(): Promise<unknown>;
  addListener(eventType: string): void;
  removeListeners(count: number): void;
}

const nativeModule = NativeModules.SkullKingScoreKeeperAppIntents as
  | SkullKingScoreKeeperAppIntentsModule
  | undefined;

function parseDestination(value: unknown): AppIntentDestination | null {
  return value === "newGame" ||
    value === "continueGame" ||
    value === "statistics"
    ? value
    : null;
}

/**
 * Consume the destination persisted by an App Intent that launched the app.
 * Missing bridges and malformed values safely behave as if no intent ran.
 */
export async function consumePendingAppIntentDestination(): Promise<AppIntentDestination | null> {
  if (!nativeModule) return null;
  try {
    return parseDestination(await nativeModule.getPendingDestination());
  } catch {
    return null;
  }
}

/** Observe App Intents invoked while the React Native bridge is already live. */
export function subscribeToAppIntentDestinations(
  listener: AppIntentDestinationListener
): () => void {
  if (!nativeModule) return () => undefined;
  const emitter = new NativeEventEmitter(nativeModule);
  const subscription = emitter.addListener(
    DESTINATION_EVENT,
    (value: unknown) => {
      const destination = parseDestination(value);
      if (destination) listener(destination);
    }
  );
  return () => subscription.remove();
}
