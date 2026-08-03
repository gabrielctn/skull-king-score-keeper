import React from "react";
import { View } from "react-native";
import { Lang } from "./types";

/**
 * Native counterpart of the web direction provider.
 *
 * React Native resolves logical edges itself, from the `direction` style, and
 * Yoga passes that down the tree — so a single wrapper is all it takes.
 */
export default function DirectionProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, direction: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </View>
  );
}

/** Always true on native: no library internals are involved. */
export const hasLocaleProvider = true;
