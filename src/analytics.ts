import { Platform } from "react-native";

export const GOOGLE_ANALYTICS_ID = "G-5NTJY6QF95";

export type AnalyticsConsent = "accepted" | "declined";

const ANALYTICS_CONSENT_KEY = "skullking:analyticsConsent";
const ANALYTICS_SCRIPT_ID = "skullking-google-analytics";

type AnalyticsWindow = Window & {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
};

/** Read the visitor's saved choice without touching storage on native builds. */
export function loadAnalyticsConsent(): AnalyticsConsent | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    const consent = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return consent === "accepted" || consent === "declined" ? consent : null;
  } catch {
    return null;
  }
}

/** Remember the choice when browser storage is available. */
export function saveAnalyticsConsent(consent: AnalyticsConsent): void {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // Consent still applies to this page view when storage is unavailable.
  }
}

/**
 * Load Google Analytics only after explicit consent. The calls mirror Google's
 * standard gtag snippet, while the id makes repeated React effects idempotent.
 */
export function enableGoogleAnalytics(): void {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  if (typeof __DEV__ !== "undefined" && __DEV__) return;
  if (document.getElementById(ANALYTICS_SCRIPT_ID)) return;

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.gtag = function gtag(..._args: unknown[]) {
    analyticsWindow.dataLayer?.push(arguments);
  };

  const script = document.createElement("script");
  script.id = ANALYTICS_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  script.onerror = () => script.remove();
  document.head.appendChild(script);

  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", GOOGLE_ANALYTICS_ID);
}
