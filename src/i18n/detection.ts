import { resolvePreferredLang } from "./resolveLanguage";
import { Lang } from "./types";

export { resolvePreferredLang } from "./resolveLanguage";

/** Best-effort first-launch browser language guess. */
export function detectPreferredLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const requested = navigator.languages?.length
    ? navigator.languages
    : navigator.language
      ? [navigator.language]
      : [];
  return resolvePreferredLang(requested);
}
