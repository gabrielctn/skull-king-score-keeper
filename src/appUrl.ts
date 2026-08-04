/** Public web destination opened by links created in the native app. */
export const DEPLOYED_PWA_BASE_URL =
  "https://gabrielctn.github.io/skull-king-crew-ledger/";

/** Current web page without query or hash, or the deployed PWA on native. */
export function webShareBaseUrl(): string {
  if (typeof window === "undefined" || !window.location) {
    return DEPLOYED_PWA_BASE_URL;
  }
  return `${window.location.origin}${window.location.pathname}`;
}

/** Remove a consumed capability hash before analytics or history can retain it. */
export function stripLocationHash(): void {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}`
  );
}
