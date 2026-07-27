/**
 * Destinations exposed by the native App Intents bridge.
 *
 * This base implementation is selected on web, where App Intents do not exist.
 * Metro selects `appIntents.native.ts` for native builds.
 */
export type AppIntentDestination =
  | "newGame"
  | "continueGame"
  | "statistics";

export type AppIntentDestinationListener = (
  destination: AppIntentDestination
) => void;

/** Web no-op: there is no native launch destination to consume. */
export async function consumePendingAppIntentDestination(): Promise<AppIntentDestination | null> {
  return null;
}

/** Web no-op: there are no native App Intent events to observe. */
export function subscribeToAppIntentDestinations(
  _listener: AppIntentDestinationListener
): () => void {
  return () => undefined;
}
