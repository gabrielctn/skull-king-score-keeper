import React from "react";
import { Lang } from "./types";

/**
 * Tells React Native Web which way the interface runs.
 *
 * Setting `document.dir` is not enough on web. RN Web resolves `marginStart`,
 * `paddingEnd`, `borderStartWidth`, `start`/`end` and friends into *physical*
 * CSS at build time, choosing between the two variants from its own locale
 * context — which defaults to left-to-right and never consults the DOM. Without
 * this provider every logical edge in the app silently behaves like its
 * left-hand physical twin, so gaps, dividers and accent bars stay on the
 * left in Arabic while the text and flex rows around them mirror.
 *
 * `LocaleProvider` is not re-exported from the package index, so it is reached
 * through its module path. If a future version moves it, `hasLocaleProvider`
 * goes false, this degrades to today's behaviour rather than crashing, and the
 * UX test that asserts it is present fails in CI.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const localeModule: { LocaleProvider?: React.ComponentType<{
  direction?: "ltr" | "rtl";
  locale?: string;
  children?: React.ReactNode;
}> } = require("react-native-web/dist/modules/useLocale");

const LocaleProvider = localeModule.LocaleProvider;

/** False when the RN Web internals moved; the app still runs, unmirrored. */
export const hasLocaleProvider = typeof LocaleProvider === "function";

export default function DirectionProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  const direction = lang === "ar" ? "rtl" : "ltr";
  if (!LocaleProvider) return <>{children}</>;
  return <LocaleProvider direction={direction}>{children}</LocaleProvider>;
}
