import { I18nManager, NativeModules } from "react-native";
import { resolvePreferredLang } from "./resolveLanguage";
import { Lang } from "./types";

export { resolvePreferredLang } from "./resolveLanguage";

/**
 * React Native does not expose the browser's `navigator.languages`. On iOS,
 * SettingsManager mirrors the user's ordered AppleLanguages preference; the
 * I18n manager locale is a safe fallback for other native runtimes.
 */
function nativeLocales(): readonly string[] {
  const settings = NativeModules.SettingsManager?.settings as
    | {
        AppleLanguages?: unknown;
        AppleLocale?: unknown;
      }
    | undefined;
  const appleLanguages = Array.isArray(settings?.AppleLanguages)
    ? settings.AppleLanguages.filter(
        (locale): locale is string => typeof locale === "string"
      )
    : [];
  const fallbacks = [
    settings?.AppleLocale,
    I18nManager.getConstants().localeIdentifier,
  ].filter((locale): locale is string => typeof locale === "string");

  // iOS locale identifiers can use underscores (`fr_FR`); the resolver
  // expects the browser-style BCP-47 separator.
  return [...appleLanguages, ...fallbacks].map((locale) =>
    locale.replaceAll("_", "-")
  );
}

/** Best-effort first-launch native device-language guess. */
export function detectPreferredLang(): Lang {
  return resolvePreferredLang(nativeLocales());
}
