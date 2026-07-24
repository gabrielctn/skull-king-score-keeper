import React from "react";
import { StyleSheet, Text } from "react-native";
import { colors } from "../theme";

/**
 * Expand/collapse marker for a disclosure row (install guide, sync panel,
 * game history…).
 *
 * The arrowhead pair "⌄" / "⌃" is not symmetric: system fonts draw the up one
 * about half a line higher than the down one, and often at another size, so a
 * toggle visibly jumped when it opened. The small triangles are a designed
 * pair — same advance, same ink box, mirrored — so both states line up.
 */
export default function DisclosureChevron({ expanded }: { expanded: boolean }) {
  return <Text style={styles.chevron}>{expanded ? "▴" : "▾"}</Text>;
}

const styles = StyleSheet.create({
  chevron: {
    width: 18,
    color: colors.gold,
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center",
  },
});
