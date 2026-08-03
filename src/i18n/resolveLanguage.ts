import { Lang, isLang } from "./types";

/** Resolve language preferences in order, with English as fallback. */
export function resolvePreferredLang(locales: readonly string[]): Lang {
  for (const locale of locales) {
    const code = locale.toLowerCase().split("-")[0];
    if (isLang(code)) return code;
  }
  return "en";
}
