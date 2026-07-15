import { Lang } from "./types";

/** Resolve browser language preferences in order, with English as fallback. */
export function resolvePreferredLang(locales: readonly string[]): Lang {
  for (const locale of locales) {
    const code = locale.toLowerCase().split("-")[0];
    if (
      code === "en" ||
      code === "fr" ||
      code === "de" ||
      code === "ar" ||
      code === "zh"
    ) {
      return code;
    }
  }
  return "en";
}
